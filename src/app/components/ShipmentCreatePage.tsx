/**
 * ShipmentCreatePage — 出貨單管理 • 建立出貨單
 *
 * 出貨資格條件（兩種訂單來源均適用）：
 *   1. 訂單狀態 = CK（一般訂單 or 換貨(J)單）
 *   2. 無進行中修正單（correctionStatus 為 DR / V / B）
 *   3. 未交量 > 0（訂單量 - 在途量 - 驗收量 > 0）
 *
 * 搜尋條件：公司(下拉)、採購組織(下拉)、單號序號(關鍵字)、料號(關鍵字)
 * 表格：沿用 AdvancedOrderTable（與一般訂單查詢相同欄位）+ forceShowCheckbox
 */

import { useState, useMemo, useRef } from 'react';
import { AdvancedOrderTable, defaultOrderColumns, getOrderColumns, calcUndeliveredQty } from './AdvancedOrderTable';
import type { OrderRow, OrderColumn } from './AdvancedOrderTable';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { useOrderStore } from './OrderStoreContext';
import { exportOrdersExcel, exportOrdersCsv } from './OrderCsvManager';
import { ShipmentDetailPage } from './ShipmentDetailPage';
import { OrderDetail } from './OrderDetail';
import { STORAGE_LOCATION_DATA } from './ShippingBasicSettingsPage';
import { SAP_COUNTRIES } from '@/app/data/countryData';
import { SAP_CURRENCIES } from '@/app/data/currencyData';

// ─────────────────────────────────────────────────────────────────────────────

interface ShipmentCreatePageProps {
  userRole?: string;
}

// ── CSV 上傳相關型別 ────────────────────────────────────────────────────────────
interface CsvHeader {
  vendorShipmentNo: string;
  currency: string;
  transportType: string;
  deliveryDate: string;
  arrivalDate: string;
  deliveryAddress: string;
}
interface CsvLine {
  itemNo: number;
  orderNo: string;
  orderSeq: string;
  materialNo: string;
  orderPendingQtyRef: number;
  shipQty: number;
  qtyPerBox: string;
  netWeight: string;
  grossWeight: string;
  weightUnit: string;
  countryOfOrigin: string;
  customBoxes: string;
  errors: string[];
}
interface CsvParseResult {
  header: CsvHeader | null;
  lines: CsvLine[];
  globalErrors: string[];
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur.trim());
  return result;
}

/**
 * 日期格式自動正規化 → 統一輸出 YYYY/MM/DD
 * 支援使用者可能填入的各種格式：
 *   YYYYMMDD          → 20260415      → 2026/04/15
 *   YYYY-MM-DD        → 2026-04-15    → 2026/04/15
 *   YYYY/MM/DD        → 2026/04/15    → 2026/04/15（已正確）
 *   YYYY/M/D          → 2026/4/15     → 2026/04/15（Excel 常見）
 *   YYYY-M-D          → 2026-4-15     → 2026/04/15
 *   YYYY.MM.DD        → 2026.04.15    → 2026/04/15
 *   YYYY年MM月DD日    → 2026年04月15日 → 2026/04/15
 *   Excel 數值日期    → Excel 1900 系統序列數 → YYYY/MM/DD
 */
function normalizeDateStr(s: string): string {
  const t = s.trim();
  if (!t) return t;

  // 1. YYYYMMDD（純8位數字）
  if (/^\d{8}$/.test(t)) {
    const y = t.slice(0, 4), m = t.slice(4, 6), d = t.slice(6, 8);
    return `${y}/${m}/${d}`;
  }

  // 2. YYYY-MM-DD 或 YYYY/MM/DD 或 YYYY.MM.DD（含月/日不補零的變體）
  const sepMatch = t.match(/^(\d{4})[-\/. ](\d{1,2})[-\/. ](\d{1,2})$/);
  if (sepMatch) {
    const [, y, m, d] = sepMatch;
    return `${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
  }

  // 3. 中文格式：YYYY年M月D日
  const zhMatch = t.match(/^(\d{4})\u5e74(\d{1,2})\u6708(\d{1,2})\u65e5?$/);
  if (zhMatch) {
    const [, y, m, d] = zhMatch;
    return `${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
  }

  // 4. Excel 序列數（如 46127 代表 2026/04/15）
  //    Excel 1900 日期系統：1 = 1900/01/01，但有 1900/02/29 的 bug
  const serial = parseInt(t, 10);
  if (!isNaN(serial) && t === String(serial) && serial > 40000 && serial < 60000) {
    const excelEpoch = new Date(1899, 11, 30); // 1899-12-30
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }

  return t;
}

/** 將 Excel 可能產生的科學記號字串（如 4.01E+08）還原為整數字串 */
function normalizeOrderId(s: string): string {
  const t = s.trim();
  // 科學記號格式：數字 + E/e + 正負號 + 數字
  if (/^[\d.]+[eE][+\-]?\d+$/.test(t)) {
    const num = parseFloat(t);
    if (!isNaN(num)) return Math.round(num).toString();
  }
  return t;
}

function parseAndValidateShipmentCsv(text: string, referenceOrders: OrderRow[]): CsvParseResult {
  // ⚠ 必須先移除 UTF-8 BOM（\uFEFF）
  // 範本下載時加了 BOM 以便 Excel 正確開啟，但 reader.readAsText 不會自動移除
  const cleanText = text.startsWith('\uFEFF') ? text.slice(1) : text;
  const rawLines = cleanText.replace(/\r/g, '').split('\n');
  const globalErrors: string[] = [];

  // ───────────────────────────────────────────────────────────────────────────
  // 以關鍵字偵測結構（不依賴空白行），解決 Excel 儲存時可能移除分隔空白的問題
  //
  //  扮演 A：找「廠商出貨單號」所在列 → header 標題列
  //  扮演 B：找「出貨次次」或「訂單號碼」所在列 → 明細標題列
  //  header 資料列 = header 標題列 的下一非空行
  //  明細資料 = 明細標題列之後的所有非空行
  // ───────────────────────────────────────────────────────────────────────────

  let headerLabelIdx = -1; // 廠商出貨單號所在列（header 標題列）
  let headerDataIdx  = -1; // header 資料列
  let detailLabelIdx = -1; // 出貨次次／訂單號碼所在列（明細標題列）

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue; // 跳過空行和說明列

    // 偵測 header 標題列：含「廠商出貨單號」
    if (headerLabelIdx === -1 && trimmed.includes('廠商出貨單號')) {
      headerLabelIdx = i;
      // header 資料列 = 直接下一非空行
      for (let j = i + 1; j < rawLines.length; j++) {
        if (rawLines[j].trim()) { headerDataIdx = j; break; }
      }
      continue;
    }

    // 偵測明細標題列：含「訂單號碼」 or 「出貨次次」（且必須在 header 資料列之後）
    if (
      headerDataIdx >= 0 &&
      detailLabelIdx === -1 &&
      i > headerDataIdx &&
      (trimmed.includes('訂單號碼') || trimmed.includes('出貨次次') || trimmed.includes('訂單號號'))
    ) {
      detailLabelIdx = i;
      break;
    }
  }

  // 找不到關鍵結構時嘗試舊方法（空白行分隔）作為 fallback
  if (headerLabelIdx === -1 || headerDataIdx === -1) {
    const hasComment = rawLines[0]?.trimStart().startsWith('#');
    const offset = hasComment ? 1 : 0;
    let blankIdx = -1;
    for (let i = offset + 1; i < rawLines.length; i++) {
      if (rawLines[i].trim() === '') { blankIdx = i; break; }
    }
    if (blankIdx === -1) return { header: null, lines: [], globalErrors: ['CSV 格式錯誤：找不到標頭資料（需包含「廠商出貨單號」欄位標題）'] };
    headerDataIdx  = blankIdx - 1;
    detailLabelIdx = blankIdx + 1;
  }

  if (detailLabelIdx === -1) {
    return { header: null, lines: [], globalErrors: ['CSV 格式錯誤：找不到明細標題列（需包含「訂單號碼」樄位）'] };
  }

  // ── 解析 Header ──
  const hVals = parseCsvLine(rawLines[headerDataIdx] ?? '');
  const header: CsvHeader = {
    vendorShipmentNo: hVals[0] ?? '',
    currency: hVals[1] ?? '',
    transportType: hVals[2] ?? '',
    deliveryDate: normalizeDateStr(hVals[3] ?? ''),
    arrivalDate: normalizeDateStr(hVals[4] ?? ''),
    deliveryAddress: hVals[5] ?? '',
  };

  // Header 必填驗證
  if (!header.vendorShipmentNo || header.vendorShipmentNo === '(請填入)') globalErrors.push('廠商出貨單號 為必填');
  // 幣別：對抄 SAP_CURRENCIES 代碼白名單
  if (!header.currency) {
    globalErrors.push('幣別 為必填');
  } else if (!SAP_CURRENCIES.some(c => c.code === header.currency)) {
    globalErrors.push(`幣別代碼「${header.currency}」非系統有效幣別，請從幣別選單中確認正確代碼`);
  }
  if (!header.deliveryDate || header.deliveryDate === '(請填入)') {
    globalErrors.push('交貨日期 為必填');
  } else if (!/^\d{4}\/\d{2}\/\d{2}$/.test(header.deliveryDate)) {
    globalErrors.push(`交貨日期格式無法辨識（輸入內容：${header.deliveryDate}），支援格式：YYYYMMDD / YYYY-MM-DD / YYYY/M/D 等`);
  }
  if (!header.transportType || header.transportType === '(請填入)') globalErrors.push('運輸型態 為必填');
  else if (!['S', 'A', 'T'].includes(header.transportType)) globalErrors.push('運輸型態 須填 S（海運）/ A（空運）/ T（陸運）');

  const parseD = (s: string) => { const [y, m, d] = s.replace(/\//g, '-').split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtD = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const lines: CsvLine[] = [];

  // ── 解析明細列（從 detailLabelIdx + 1 開始）──
  for (let i = detailLabelIdx + 1; i < rawLines.length; i++) {
    if (!rawLines[i].trim()) continue;
    const cols = parseCsvLine(rawLines[i]);
    const rowErrors: string[] = [];
    // normalizeOrderId 處理 Excel 將訂單號碼轉成科學記號（如 4.01E+08）的情況
    const orderNo = normalizeOrderId(cols[1] ?? '');
    const orderSeq = normalizeOrderId(cols[2] ?? '');
    const materialNo = cols[3] ?? '';
    const shipQty = parseInt(cols[5] ?? '0', 10);
    const qtyPerBox = cols[6] ?? '';
    const customBoxes = cols[7] ?? '';   // 移至欄 7
    const netWeight = cols[8] ?? '0';   // 欄 8
    const grossWeight = cols[9] ?? '0';  // 欄 9
    const weightUnit = cols[10] ?? 'KG'; // 欄 10
    const countryOfOrigin = cols[11] ?? ''; // 欄 11

    const matched = referenceOrders.find(o => o.orderNo === orderNo && o.orderSeq === orderSeq);
    const pendingQty = matched ? calcUndeliveredQty(matched.orderQty ?? 0, matched.acceptQty ?? 0, matched.inTransitQty ?? 0) : 0;

    if (!orderNo) rowErrors.push('訂單號碼 不可空白');
    if (!orderSeq) rowErrors.push('訂單序號 不可空白');
    if (orderNo && orderSeq && !matched) rowErrors.push(`訂單 ${orderNo}-${orderSeq} 不存在或不符出貨資格`);
    if (matched && materialNo && matched.materialNo !== materialNo) rowErrors.push(`料號 ${materialNo} 與訂單不符（應為 ${matched.materialNo}）`);
    if (isNaN(shipQty) || shipQty <= 0) rowErrors.push('出貨量 須大於 0');
    else if (shipQty > pendingQty) rowErrors.push(`出貨量（${shipQty}）超過待交量（${pendingQty}）`);
    if (qtyPerBox) { const p = parseFloat(qtyPerBox); if (isNaN(p) || p <= 0) rowErrors.push('每箱數量 須大於 0'); else if (p > shipQty) rowErrors.push('每箱數量不可大於出貨量'); }
    if (!['G', 'KG', 'EA', 'GL'].includes(weightUnit)) rowErrors.push('重量單位 須為 G / KG / EA / GL');
    // 原產國：對抄 SAP_COUNTRIES 代碼白名單（不強制必填，但填了就必須在清單中）
    if (countryOfOrigin && !SAP_COUNTRIES.some(c => c.code === countryOfOrigin)) {
      rowErrors.push(`原產國代碼「${countryOfOrigin}」不在系統國家清單中，請使用正確的 ISO-3166 中文（如 TW 、US 、JP）`);
    }
    if (customBoxes) {
      const bqs = customBoxes.split('/').map(s => parseInt(s.trim(), 10));
      if (bqs.some(n => isNaN(n) || n <= 0)) rowErrors.push('自訂箱數格式錯誤（以 / 分隔各箱數量，如 50/50/30）');
      else if (bqs.reduce((a, b) => a + b, 0) !== shipQty) rowErrors.push(`自訂箱數總和（${bqs.reduce((a, b) => a + b, 0)}）須等於出貨量（${shipQty}）`);
    }
    if (matched?.vendorDeliveryDate && header.deliveryDate && !globalErrors.some(e => e.includes('交貨日期'))) {
      try {
        const sel = parseD(header.deliveryDate);
        const ear = parseD(matched.vendorDeliveryDate);
        ear.setDate(ear.getDate() - 7);
        if (sel < ear) rowErrors.push(`廠商答交日 ${matched.vendorDeliveryDate}，最早可出貨日為 ${fmtD(ear)}`);
      } catch { /* skip */ }
    }
    lines.push({ itemNo: (lines.length + 1) * 10, orderNo, orderSeq, materialNo: materialNo || (matched?.materialNo ?? ''), orderPendingQtyRef: pendingQty, shipQty, qtyPerBox, netWeight, grossWeight, weightUnit, countryOfOrigin, customBoxes, errors: rowErrors });
  }
  if (lines.length === 0) globalErrors.push('出貨明細不可為空');
  return { header, lines, globalErrors };
}

// ── CsvPreviewModal ─────────────────────────────────────────────────────────
// 對齊截圖「出貨單 — 匯入預覽」風格：
//  • 頂部 Tab 切換（全部 / 有效 / 不處理）
//  • 每列在「驗證」欄以 ✓ 或 —（不處理）＋原因清楚呈現
//  • Header 摘要卡 + 全域錯誤橫幅

type CsvPreviewTab = 'all' | 'valid' | 'error';

function CsvPreviewModal({
  csvPreview,
  onClose,
  onReselect,
  onConfirm,
}: {
  csvPreview: CsvParseResult;
  onClose: () => void;
  onReselect: () => void;
  onConfirm: () => void;
}) {
  const [activeTab, setActiveTab] = useState<CsvPreviewTab>('all');

  const validLines   = csvPreview.lines.filter(l => l.errors.length === 0);
  const invalidLines = csvPreview.lines.filter(l => l.errors.length > 0);

  const displayLines =
    activeTab === 'valid'  ? validLines :
    activeTab === 'error'  ? invalidLines :
    csvPreview.lines;

  // 按鈕禁用條件：Header 有全域錯誤 OR 沒有任何可匯入列
  // 列級別的驗證失敗（不處理列）不影響按鈕，那些列會被排除不帶入
  const hasAnyError =
    csvPreview.globalErrors.length > 0 ||
    validLines.length === 0;

  // Tab 配置
  const tabs: { key: CsvPreviewTab; label: string; count: number }[] = [
    { key: 'all',   label: '全部',   count: csvPreview.lines.length },
    { key: 'valid', label: '可匯入', count: validLines.length },
    { key: 'error', label: '不處理', count: invalidLines.length },
  ];

  return (
    <div
      className="fixed inset-0 z-[250] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: '960px', maxHeight: '88vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">出貨單 — 匯入預覽</p>
          </div>
          <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* ── 全域錯誤橫幅（Header 必填不通過時顯示） ── */}
        {csvPreview.globalErrors.length > 0 && (
          <div className="mx-[24px] mt-[16px] px-[14px] py-[10px] bg-[rgba(255,86,48,0.08)] border border-[rgba(255,86,48,0.3)] rounded-[8px] flex flex-col gap-[4px] shrink-0">
            <div className="flex items-center gap-[6px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b71d18" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#b71d18]">出貨單標頭錯誤，請修正後重新上傳：</p>
            </div>
            {csvPreview.globalErrors.map((e, i) => (
              <p key={i} className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#b71d18] pl-[20px]">• {e}</p>
            ))}
          </div>
        )}

        {/* ── 檔案名稱 + Header 摘要卡 ── */}
        {csvPreview.header && (
          <div className="px-[24px] pt-[16px] shrink-0">
            {/* 基本資訊摘要格（6 欄位） */}
            <div className="bg-[#f4f6f8] rounded-[10px] px-[16px] py-[12px] grid grid-cols-3 gap-y-[10px] gap-x-[20px]">
              {([
                ['廠商出貨單號', csvPreview.header.vendorShipmentNo || '—'],
                ['幣別',         csvPreview.header.currency || '—'],
                ['運輸型態',
                  csvPreview.header.transportType === 'S' ? 'S 海運' :
                  csvPreview.header.transportType === 'A' ? 'A 空運' :
                  csvPreview.header.transportType === 'T' ? 'T 陸運' :
                  (csvPreview.header.transportType || '—')
                ],
                ['交貨日期', csvPreview.header.deliveryDate || '—'],
                ['到貨日期', csvPreview.header.arrivalDate || '—'],
                ['交貨地址', csvPreview.header.deliveryAddress || '—'],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <p className="text-[11px] text-[#919eab] mb-[2px]">{label}</p>
                  <p className="text-[13px] text-[#1c252e] font-semibold truncate" title={val}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tabs（全部 / 可匯入 / 不處理）── */}
        <div className="flex items-center gap-[0px] px-[24px] pt-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            const isError  = tab.key === 'error' && tab.count > 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative h-[40px] px-[14px] flex items-center gap-[6px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors whitespace-nowrap select-none ${
                  isActive
                    ? 'text-[#1c252e]'
                    : 'text-[#919eab] hover:text-[#637381]'
                }`}
              >
                {tab.label}
                {/* Badge */}
                <span className={`inline-flex items-center justify-center min-w-[20px] h-[18px] px-[5px] rounded-full text-[11px] font-bold leading-none ${
                  isActive
                    ? isError
                      ? 'bg-[rgba(255,86,48,0.12)] text-[#b71d18]'
                      : tab.key === 'valid'
                        ? 'bg-[rgba(34,197,94,0.12)] text-[#118d57]'
                        : 'bg-[rgba(145,158,171,0.16)] text-[#637381]'
                    : 'bg-[rgba(145,158,171,0.1)] text-[#919eab]'
                }`}>
                  {tab.count}
                </span>
                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1c252e] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── 明細 Table ── */}
        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar px-[24px] py-[16px]">
          {displayLines.length === 0 ? (
            <div className="flex items-center justify-center h-[120px]">
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">
                {activeTab === 'error' ? '沒有錯誤筆數 🎉' : '沒有資料'}
              </p>
            </div>
          ) : (
            <div className="border border-[rgba(145,158,171,0.16)] rounded-[10px] overflow-hidden">
              <table className="w-full" style={{ minWidth: 980 }}>
                <thead className="sticky top-0 z-[1]">
                  <tr className="bg-[#f4f6f8]">
                    {[
                      { label: '項次',     w: 48  },
                      { label: '訂單號碼', w: 110 },
                      { label: '序號',     w: 55  },
                      { label: '料號',     w: 155 },
                      { label: '待交量',   w: 65  },
                      { label: '出貨量',   w: 65  },
                      { label: '每箱數量', w: 72  },
                      { label: '自訂箱數', w: 90  },
                      { label: '重量單位', w: 72  },
                      { label: '原產國',   w: 65  },
                      { label: '驗證',     w: 160 },
                    ].map(col => (
                      <th
                        key={col.label}
                        style={{ width: col.w, minWidth: col.w }}
                        className="px-[8px] py-[9px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayLines.map((line, idx) => {
                    const isValid = line.errors.length === 0;
                    const rowNum = csvPreview.lines.indexOf(line) + 2; // 保留供除錯
                    const Dash = () => <span className="text-[#c4cdd6]">—</span>;
                    return (
                      <tr
                        key={idx}
                        className={`border-t border-[rgba(145,158,171,0.08)] transition-colors ${
                          isValid
                            ? 'hover:bg-[rgba(145,158,171,0.03)]'
                            : 'bg-[rgba(255,86,48,0.025)] hover:bg-[rgba(255,86,48,0.04)]'
                        }`}
                      >
                        {/* 出貨項次 */}
                        <td className="px-[8px] py-[10px]">
                          <span className="text-[12px] text-[#637381] font-semibold">{line.itemNo || <Dash />}</span>
                        </td>
                        {/* 訂單號碼 */}
                        <td className="px-[8px] py-[10px]">
                          <span className="text-[12px] text-[#1c252e]">{line.orderNo || <Dash />}</span>
                        </td>
                        {/* 序號 */}
                        <td className="px-[8px] py-[10px]">
                          <span className="text-[12px] text-[#637381]">{line.orderSeq || <Dash />}</span>
                        </td>
                        {/* 料號 */}
                        <td className="px-[8px] py-[10px] max-w-[155px]">
                          <span className="font-mono text-[11px] text-[#637381] block truncate" title={line.materialNo}>
                            {line.materialNo || <span className="text-[#c4cdd6] font-sans">—</span>}
                          </span>
                        </td>
                        {/* 待交量 */}
                        <td className="px-[8px] py-[10px] text-right">
                          <span className="text-[12px] text-[#637381]">
                            {line.orderPendingQtyRef > 0 ? line.orderPendingQtyRef : <Dash />}
                          </span>
                        </td>
                        {/* 出貨量 */}
                        <td className="px-[8px] py-[10px] text-right">
                          <span className={`font-semibold text-[12px] ${
                            line.errors.some(e => e.includes('出貨量')) ? 'text-[#b71d18]' : 'text-[#1c252e]'
                          }`}>
                            {line.shipQty > 0 ? line.shipQty : <Dash />}
                          </span>
                        </td>
                        {/* 每箱數量 */}
                        <td className="px-[8px] py-[10px] text-right">
                          <span className={`text-[12px] ${
                            line.errors.some(e => e.includes('每箱')) ? 'text-[#b71d18]' : 'text-[#637381]'
                          }`}>
                            {line.qtyPerBox || <Dash />}
                          </span>
                        </td>
                        {/* 自訂箱數：可能有多組（如 50/30/50/50/30），加 truncate + title */}
                        <td className="px-[8px] py-[10px] max-w-[90px]">
                          <span
                            className={`font-mono text-[11px] block truncate ${
                              line.errors.some(e => e.includes('自訂箱數')) ? 'text-[#b71d18]' : 'text-[#637381]'
                            }`}
                            title={line.customBoxes || undefined}
                          >
                            {line.customBoxes || <Dash />}
                          </span>
                        </td>
                        {/* 重量單位 */}
                        <td className="px-[8px] py-[10px]">
                          <span className={`text-[12px] ${
                            line.errors.some(e => e.includes('重量單位')) ? 'text-[#b71d18]' : 'text-[#919eab]'
                          }`}>
                            {line.weightUnit || <Dash />}
                          </span>
                        </td>
                        {/* 原產國 */}
                        <td className="px-[8px] py-[10px]">
                          <span className="text-[12px] text-[#919eab]">
                            {line.countryOfOrigin || <Dash />}
                          </span>
                        </td>
                        {/* 驗證狀態 */}
                        <td className="px-[8px] py-[10px]">
                          {isValid ? (
                            <div className="flex items-center gap-[5px]">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#118d57" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                              </svg>
                              <span className="font-semibold text-[11px] text-[#118d57]">驗證通過</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-[3px]">
                              {line.errors.map((err, ei) => (
                                <div key={ei} className="flex items-start gap-[4px]">
                                  <span className="text-[11px] text-[#919eab] shrink-0 leading-[16px]">—</span>
                                  <span className="text-[11px] text-[#b71d18] leading-[16px]">（{err}）</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
          <button
            onClick={onReselect}
            className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            重新選擇檔案
          </button>
          <div className="flex gap-[12px]">
            <button
              onClick={onClose}
              className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              disabled={hasAnyError}
              className="h-[36px] px-[20px] rounded-[8px] bg-[#005eb8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#004a94] disabled:bg-[#919eab] disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              建立出貨單（{validLines.length} 筆）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ShipmentCreatePage({ userRole }: ShipmentCreatePageProps) {
  // ── Store ─────────────────────────────────────────────────────────────────
  const { orders, exchangeOrders, correctionOrders, getOrderHistory, getExchangeOrderHistory } = useOrderStore();

  // ── Search States ─────────────────────────────────────────────────────────
  const [searchCompany, setSearchCompany]       = useState('');
  const [searchPurchaseOrg, setSearchPurchaseOrg] = useState('');
  const [searchDocSeqNo, setSearchDocSeqNo]     = useState('');
  const [searchMaterialNo, setSearchMaterialNo] = useState('');

  // ── Table States ──────────────────────────────────────────────────────────
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<OrderColumn[]>([]);
  const [tempColumns, setTempColumns]           = useState<OrderColumn[]>([]);
  const [columnsVersion, setColumnsVersion]     = useState(0);
  const [filters, setFilters]                   = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters]     = useState<FilterCondition[]>([]);
  const [toastMessage, setToastMessage]         = useState<string | null>(null);

  // ── 出貨單明細頁面狀態 ────────────────────────────────────────────────────
  const [showDetail, setShowDetail]   = useState(false);
  const [detailOrders, setDetailOrders] = useState<OrderRow[]>([]);


  // ── 訂單明細彈窗狀態 ──────────────────────────────────────────────────
  const [previewOrder, setPreviewOrder] = useState<OrderRow | null>(null);

  const currentUserEmail = useState<string>(
    () => localStorage.getItem('currentUserEmail') || 'default'
  )[0];

  // ── 計算有進行中修正單的訂單 ID（DR / V / B）──────────────────────────────
  const blockedByCorrection = useMemo(() => {
    const ids = new Set<number>();
    correctionOrders.forEach(c => {
      if (c.correctionStatus === 'DR' || c.correctionStatus === 'V' || c.correctionStatus === 'B') {
        ids.add(c.id);
      }
    });
    return ids;
  }, [correctionOrders]);

  // ── 合併符合出貨資格的訂單（一般 + 換貨J）────────────────────────────────
  // Exchange order IDs 從 2001 起，與一般訂單 1-26 無衝突，可直接合併
  const eligibleOrders = useMemo<OrderRow[]>(() => {
    // 七天原則已移至 ShipmentDetailPage 的交貨日期選定時驗證，列表不再預先過濾
    const isEligible = (o: OrderRow) =>
      o.status === 'CK' &&
      !blockedByCorrection.has(o.id) &&
      calcUndeliveredQty(o.orderQty ?? 0, o.acceptQty ?? 0, o.inTransitQty ?? 0) > 0;

    return [
      ...orders.filter(isEligible),
      ...exchangeOrders.filter(isEligible),
    ];
  }, [orders, exchangeOrders, blockedByCorrection]);

  // ── 動態取得公司/採購組織選項 ─────────────────────────────────────────────
  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    eligibleOrders.forEach(o => { if (o.company) set.add(o.company); });
    const opts = [...set].map(c => ({ value: c, label: c }));
    return [{ value: '', label: '全部' }, ...opts];
  }, [eligibleOrders]);

  const purchaseOrgOptions = useMemo(() => {
    const set = new Set<string>();
    eligibleOrders.forEach(o => { if (o.purchaseOrg) set.add(o.purchaseOrg); });
    const opts = [...set].map(o => ({ value: o, label: o }));
    return [{ value: '', label: '全部' }, ...opts];
  }, [eligibleOrders]);

  // ── 搜尋篩選 ──────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = eligibleOrders;
    if (searchCompany)
      result = result.filter(o => o.company === searchCompany);
    if (searchPurchaseOrg)
      result = result.filter(o => o.purchaseOrg === searchPurchaseOrg);
    if (searchDocSeqNo.trim()) {
      const kw = searchDocSeqNo.trim().toLowerCase();
      result = result.filter(o =>
        (o.docSeqNo || '').toLowerCase().includes(kw) ||
        (o.orderNo  || '').toLowerCase().includes(kw) ||
        (o.orderSeq || '').toLowerCase().includes(kw)
      );
    }
    if (searchMaterialNo.trim()) {
      const kw = searchMaterialNo.trim().toLowerCase();
      result = result.filter(o => (o.materialNo || '').toLowerCase().includes(kw));
    }
    return result;
  }, [eligibleOrders, searchCompany, searchPurchaseOrg, searchDocSeqNo, searchMaterialNo]);

  // ── 進階篩選後的計數 ───────────────────────────────────────────────────────
  const getFilteredCount = () => {
    if (appliedFilters.length === 0) return filteredOrders.length;
    return filteredOrders.filter(item =>
      appliedFilters.every(f => {
        const v = item[f.column as keyof OrderRow];
        const raw = v != null ? String(v) : '';
        switch (f.operator) {
          case 'contains':   return raw.toLowerCase().includes(f.value.toLowerCase());
          case 'equals':     return raw.toLowerCase() === f.value.toLowerCase();
          case 'notEquals':  return raw.toLowerCase() !== f.value.toLowerCase();
          case 'startsWith': return raw.toLowerCase().startsWith(f.value.toLowerCase());
          case 'endsWith':   return raw.toLowerCase().endsWith(f.value.toLowerCase());
          case 'isEmpty':    return !raw || raw.trim() === '';
          case 'isNotEmpty': return raw.trim() !== '';
          default:           return true;
        }
      })
    ).length;
  };

  // ── Checkbox ───────────────────────────────────────────────────────────────
  const isAllSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every(o => selectedOrderIds.has(o.id));

  const handleSelectAll = () => {
    const newSet = new Set(selectedOrderIds);
    if (isAllSelected) {
      filteredOrders.forEach(o => newSet.delete(o.id));
    } else {
      filteredOrders.forEach(o => newSet.add(o.id));
    }
    setSelectedOrderIds(newSet);
  };

  const handleToggleOrder = (id: number) => {
    const newSet = new Set(selectedOrderIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedOrderIds(newSet);
  };

  // ── Column Selector ────────────────────────────────────────────────────────
  const handleColumnsChange = (cols: OrderColumn[]) => setAvailableColumns(cols);

  // 與 AdvancedOrderTable 內部使用相同的 key 格式
  // storageKeyPrefix="shipmentCreate_v1"，activeTab="CK" → key = shipmentCreate_v1_${email}_CK_columns
  const tableStorageKey = `shipmentCreate_v1_${currentUserEmail}_CK_columns`;

  const handleColumnsClick = () => {
    let cols = availableColumns;
    if (cols.length === 0) {
      try {
        const saved = localStorage.getItem(tableStorageKey);
        cols = saved ? JSON.parse(saved) : getOrderColumns();
      } catch { cols = getOrderColumns(); }
    }
    setTempColumns(JSON.parse(JSON.stringify(cols)));
    setShowColumnSelector(v => !v);
  };

  const handleApplyColumns = () => {
    try { localStorage.setItem(tableStorageKey, JSON.stringify(tempColumns)); } catch { /**/ }
    setAvailableColumns(tempColumns);
    setColumnsVersion(v => v + 1);
    setShowColumnSelector(false);
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const dateSuffix = () => new Date().toISOString().slice(0, 10);

  const handleExportExcel = () => {
    const currentCols = availableColumns.length > 0 ? availableColumns : getOrderColumns();
    const count = exportOrdersExcel(filteredOrders, `建立出貨單_${dateSuffix()}.xlsx`, currentCols);
    showToast(`已匯出 ${count} 筆訂單 (Excel)`);
  };

  const handleExportCsv = () => {
    const currentCols = availableColumns.length > 0 ? availableColumns : getOrderColumns();
    exportOrdersCsv(filteredOrders, `建立出貨單_${dateSuffix()}.csv`, currentCols);
    showToast(`已匯出 ${filteredOrders.length} 筆訂單 (CSV)`);
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 開立出貨單（跳轉到明細頁面）────────────────────────────────────────────
  const handleCreateShipment = () => {
    const selected = filteredOrders.filter(o => selectedOrderIds.has(o.id));
    if (selected.length === 0) {
      showToast('請先勾選要出貨的訂單');
      return;
    }
    setDetailOrders(selected);
    setShowDetail(true);
  };

  // ── CSV 上傳出貨單 ──────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<CsvParseResult | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const handleDownloadTemplate = () => {
    const instructionRow = '# [說明] 廠商出貨單號、幣別、運輸型態、交貨日期 為必填欄位。交貨日期格式：YYYY/MM/DD。運輸型態：S=海運 A=空運 T=陸運。自訂箱數：以 / 分隔各箱數量（如 50/50/30），總和須等於出貨量；不填則依每箱數量自動分箱。';
    // 以第一筆訂單儲存地點代號查詢交貨地址
    const firstOrder = filteredOrders[0];
    const sloc = firstOrder?.storageLocationCode ?? '';
    const addrEntry = sloc ? STORAGE_LOCATION_DATA.find(r => r.locationCode === sloc && r.addressZh) : undefined;
    const deliveryAddress = addrEntry?.addressZh ?? '';

    const headerRow1 = '廠商出貨單號,幣別,運輸型態,交貨日期,到貨日期,交貨地址';
    const headerRow2 = `(請填入),,(請填入),(請填入),,${deliveryAddress}`;
    // 自訂箱數移至每箱數量之後（欄位順序需與 parser 一致）
    const detailHeader = '出貨項次,訂單號碼,訂單序號,料號,訂單待交量(參考),出貨量,每箱數量,自訂箱數(以/分隔),淨重(個),毛重(個),重量單位,原產國家';
    const detailRows = filteredOrders.map((o, idx) => {
      const pq = calcUndeliveredQty(o.orderQty ?? 0, o.acceptQty ?? 0, o.inTransitQty ?? 0);
      // 欄位順序：項次,訂單,序號,料號,待交量,出貨量,每箱,自訂箱,淨重,毛重,重量單位,原產
      return [(idx + 1) * 10, o.orderNo, o.orderSeq, o.materialNo, pq, pq, '', '', '0', '0', 'KG', ''].join(',');
    });
    const content = [instructionRow, '', headerRow1, headerRow2, '', detailHeader, ...detailRows].join('\n');
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `出貨單範本_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseAndValidateShipmentCsv(text, eligibleOrders);
      setCsvPreview(result);
      setShowCsvModal(true);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const [csvPrefillData, setCsvPrefillData] = useState<import('./ShipmentDetailPage').CsvPrefillData | null>(null);

  const handleConfirmUpload = () => {
    if (!csvPreview || !csvPreview.header) return;
    // 只取驗證通過的行
    const validLines = csvPreview.lines.filter(l => l.errors.length === 0);
    if (validLines.length === 0) return;

    // 將有效的 CSV 行轉換成 CsvPrefillData
    const prefill: import('./ShipmentDetailPage').CsvPrefillData = {
      vendorShipmentNo: csvPreview.header.vendorShipmentNo,
      currency:         csvPreview.header.currency,
      transportType:    csvPreview.header.transportType,
      deliveryDate:     csvPreview.header.deliveryDate,
      arrivalDate:      csvPreview.header.arrivalDate,
      deliveryAddress:  csvPreview.header.deliveryAddress,
      rows: validLines.map(l => ({
        orderNo:         l.orderNo,
        orderSeq:        l.orderSeq,
        itemNo:          l.itemNo,
        shipQty:         l.shipQty,
        qtyPerBox:       l.qtyPerBox,
        customBoxes:     l.customBoxes,
        netWeight:       l.netWeight,
        grossWeight:     l.grossWeight,
        weightUnit:      l.weightUnit,
        countryOfOrigin: l.countryOfOrigin,
      })),
    };

    // 找出對應的 OrderRow（以訂單號碼 + 序號比對）
    const matchedOrders = validLines
      .map(l => eligibleOrders.find(o => o.orderNo === l.orderNo && o.orderSeq === l.orderSeq))
      .filter((o): o is NonNullable<typeof o> => !!o);

    if (matchedOrders.length === 0) {
      showToast('找不到對應訂單，請確認訂單號碼是否正確');
      return;
    }

    setCsvPrefillData(prefill);
    setDetailOrders(matchedOrders);
    setShowCsvModal(false);
    setCsvPreview(null);
    setShowDetail(true);
  };

  // ── 初始欄位設定（docSeqNo sticky 欄已由 AdvancedOrderTable 內建處理）────
  const tableInitialColumns = useMemo(() =>
    defaultOrderColumns.map(col =>
      col.key === 'docSeqNo' ? { ...col, visible: false } : { ...col }
    ),
  []);


  // ── 顯示出貨單明細頁面 ────────────────────────────────────────────────────
  if (showDetail) {
    return (
      <ShipmentDetailPage
        selectedOrders={detailOrders}
        onClose={() => {
          setShowDetail(false);
          setSelectedOrderIds(new Set());
          setCsvPrefillData(null);
        }}
        userRole={userRole}
        csvData={csvPrefillData ?? undefined}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列 ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(145,158,171,0.12)]">
        <div className="flex flex-wrap gap-[16px] items-end px-[20px] py-[16px]">

          {/* 公司（下拉） */}
          <div style={{ minWidth: '200px', flex: '0 0 200px' }}>
            <DropdownSelect
              label="公司"
              value={searchCompany}
              onChange={setSearchCompany}
              options={companyOptions}
            />
          </div>

          {/* 採購組織（下拉） */}
          <div style={{ minWidth: '220px', flex: '0 0 220px' }}>
            <DropdownSelect
              label="採購組織"
              value={searchPurchaseOrg}
              onChange={setSearchPurchaseOrg}
              options={purchaseOrgOptions}
            />
          </div>

          {/* 單號序號（關鍵字） */}
          <SearchField
            label="單號序號"
            value={searchDocSeqNo}
            onChange={setSearchDocSeqNo}
          />

          {/* 料號（關鍵字） */}
          <SearchField
            label="料號"
            value={searchMaterialNo}
            onChange={setSearchMaterialNo}
          />
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <TableToolbar
        resultsCount={getFilteredCount()}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onDownloadShipmentTemplate={handleDownloadTemplate}
        columnsButton={
          <ColumnSelector
            columns={tempColumns}
            onToggleColumn={key =>
              setTempColumns(prev =>
                prev.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c)
              )
            }
            onToggleAll={all =>
              setTempColumns(prev => prev.map(c => ({ ...c, visible: all })))
            }
            onClose={() => setShowColumnSelector(false)}
            onApply={handleApplyColumns}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={availableColumns.length > 0 ? availableColumns : getOrderColumns()}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); }}
          />
        }
        actionButton={
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-[36px] bg-[#1c252e] hover:bg-[#374151] text-white rounded-[8px] px-[20px] text-[14px] font-semibold transition-colors whitespace-nowrap flex items-center gap-[8px]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            上傳 CSV 出貨單
          </button>
        }
      />

      {/* ── 表格 ────────────────────────────────────────────────────────── */}
      <AdvancedOrderTable
        activeTab="CK"
        data={filteredOrders}
        userEmail={currentUserEmail}
        userRole={userRole}
        onColumnsChange={handleColumnsChange}
        columnsVersion={columnsVersion}
        appliedFilters={appliedFilters}
        selectedOrderIds={selectedOrderIds}
        onToggleOrder={handleToggleOrder}
        onSelectAll={handleSelectAll}
        forceShowCheckbox
        storageKeyPrefix="shipmentCreate_v1"
        initialColumns={tableInitialColumns}
        onDocNoClick={(row) => setPreviewOrder(row)}
        batchActions={
          <span
            data-is-checkbox="true"
            onClick={handleCreateShipment}
            className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
          >
            建立出貨單
          </span>
        }
      />

      {/* ── 訂單明細彈窗 ─────────────────────────────────────────────────────── */}
      {previewOrder && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(28,37,46,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setPreviewOrder(null); }}
        >
          <div
            className="relative bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.24)] overflow-hidden"
            style={{ width: 'min(92vw, 1000px)', height: 'min(88vh, 760px)', display: 'flex', flexDirection: 'column' }}
          >
            <OrderDetail
              onClose={() => setPreviewOrder(null)}
              orderData={{
                orderNo: previewOrder.orderNo,
                orderSeq: previewOrder.orderSeq,
                vendor: previewOrder.vendorName,
                status: previewOrder.status,
                vendorDeliveryDate: previewOrder.vendorDeliveryDate,
                scheduleLines: previewOrder.scheduleLines,
                orderQty: previewOrder.orderQty,
                comparePrice: previewOrder.comparePrice,
                unit: previewOrder.unit,
                acceptQty: previewOrder.acceptQty,
                adjustmentType: previewOrder.adjustmentType,
                expectedDelivery: previewOrder.expectedDelivery,
              }}
              onStatusChange={() => {}}
              isReadOnly
              userRole={userRole}
              orderHistory={
                previewOrder.id >= 2000
                  ? getExchangeOrderHistory(previewOrder.id)
                  : getOrderHistory(previewOrder.id)
              }
            />
          </div>
        </div>
      )}

            {/* ── Toast ───────────────────────────────────────────────────────── */}
      {/* ── CSV 上傳 hidden input ─────────────────────────────────────────────── */}
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />

      {/* ── CSV 上傳預覽 Modal（對齊 ScheduleChange 批次匯入風格） ──────────── */}
      {showCsvModal && csvPreview && (
        <CsvPreviewModal
          csvPreview={csvPreview}
          onClose={() => setShowCsvModal(false)}
          onReselect={() => fileInputRef.current?.click()}
          onConfirm={handleConfirmUpload}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
