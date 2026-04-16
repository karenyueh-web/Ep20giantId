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

/** YYYYMMDD → YYYY/MM/DD；YYYY-MM-DD → YYYY/MM/DD；其餘直接回傳原字串 */
function normalizeDateStr(s: string): string {
  const t = s.trim();
  if (/^\d{8}$/.test(t)) return `${t.slice(0, 4)}/${t.slice(4, 6)}/${t.slice(6, 8)}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t.replace(/-/g, '/');
  return t;
}

function parseAndValidateShipmentCsv(text: string, referenceOrders: OrderRow[]): CsvParseResult {
  const rawLines = text.replace(/\r/g, '').split('\n');
  const globalErrors: string[] = [];

  // 跳過開頭的 # 說明列
  const hasComment = rawLines[0]?.trim().startsWith('#');
  const offset = hasComment ? 1 : 0;

  let blankIdx = -1;
  for (let i = offset + 1; i < rawLines.length; i++) {
    if (rawLines[i].trim() === '') { blankIdx = i; break; }
  }
  if (blankIdx === -1) return { header: null, lines: [], globalErrors: ['CSV 格式錯誤：找不到標頭與明細之間的空白分隔列'] };

  // 取 blank 前一列作為 header 資料列（相容「欄位名稱列 + 資料列」的兩列格式）
  const hVals = parseCsvLine(rawLines[blankIdx - 1] ?? '');
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
  if (!header.currency) globalErrors.push('幣別 為必填');
  if (!header.deliveryDate || header.deliveryDate === '(請填入)') {
    globalErrors.push('交貨日期 為必填');
  } else if (!/^\d{4}\/\d{2}\/\d{2}$/.test(header.deliveryDate)) {
    globalErrors.push('交貨日期 格式須為 YYYY/MM/DD（亦可填 YYYYMMDD）');
  }
  if (!header.transportType || header.transportType === '(請填入)') globalErrors.push('運輸型態 為必填');
  else if (!['S', 'A', 'T'].includes(header.transportType)) globalErrors.push('運輸型態 須填 S（海運）/ A（空運）/ T（陸運）');

  const parseD = (s: string) => { const [y, m, d] = s.replace(/\//g, '-').split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtD = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const lines: CsvLine[] = [];

  for (let i = blankIdx + 2; i < rawLines.length; i++) {
    if (!rawLines[i].trim()) continue;
    const cols = parseCsvLine(rawLines[i]);
    const rowErrors: string[] = [];
    const orderNo = cols[1] ?? '';
    const orderSeq = cols[2] ?? '';
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
    if (customBoxes) {
      // 自訂箱數使用 / 分隔
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

  const handleConfirmUpload = () => {
    if (!csvPreview || csvPreview.globalErrors.length > 0 || csvPreview.lines.some(l => l.errors.length > 0)) return;
    showToast(`出貨單 ${csvPreview.header?.vendorShipmentNo} 已建立（${csvPreview.lines.length} 筆明細）`);
    setShowCsvModal(false);
    setCsvPreview(null);
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
        }}
        userRole={userRole}
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
        <div
          className="fixed inset-0 z-[250] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
          onClick={() => setShowCsvModal(false)}
        >
          <div
            className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
            style={{ maxWidth: '900px', maxHeight: '88vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
              <div className="flex items-center gap-[10px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">上傳 CSV 出貨單 — 預覽確認</p>
              </div>
              <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={() => setShowCsvModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0 overflow-y-auto custom-scrollbar">

              {/* 標頭層錯誤 */}
              {csvPreview.globalErrors.length > 0 && (
                <div className="px-[14px] py-[10px] bg-[rgba(255,86,48,0.08)] border border-[rgba(255,86,48,0.3)] rounded-[8px] flex flex-col gap-[4px] shrink-0">
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

              {/* Header 摘要卡 */}
              {csvPreview.header && (
                <div className="bg-[#f4f6f8] rounded-[10px] px-[16px] py-[12px] grid grid-cols-3 gap-y-[12px] gap-x-[16px] shrink-0">
                  {([
                    ['廠商出貨單號', csvPreview.header.vendorShipmentNo],
                    ['幣別', csvPreview.header.currency || '—'],
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
              )}

              {/* Summary badges */}
              {csvPreview.lines.length > 0 && (
                <div className="flex gap-[8px] flex-wrap shrink-0">
                  <div className="bg-[rgba(145,158,171,0.12)] flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">共計</p>
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] text-[#637381]">{csvPreview.lines.length}</p>
                  </div>
                  <div className="bg-[rgba(34,197,94,0.12)] flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#118d57" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#118d57]">有效</p>
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] text-[#118d57]">{csvPreview.lines.filter(l => l.errors.length === 0).length}</p>
                  </div>
                  {csvPreview.lines.filter(l => l.errors.length > 0).length > 0 && (
                    <div className="bg-[rgba(255,86,48,0.12)] flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b71d18" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#b71d18]">錯誤</p>
                      <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] text-[#b71d18]">{csvPreview.lines.filter(l => l.errors.length > 0).length}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 明細 table */}
              {csvPreview.lines.length > 0 && (
                <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]">
                  <table className="w-full" style={{ minWidth: 740 }}>
                    <thead className="sticky top-0 z-[1]">
                      <tr className="bg-[#f4f6f8]">
                        {['項次', '訂單號碼', '序號', '料號', '待交量', '出貨量', '每箱量', '原產國', '自訂箱數', '驗證'].map(h => (
                          <th key={h} className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.lines.map((line, idx) => (
                        <tr key={idx} className={`border-t border-[rgba(145,158,171,0.08)] ${line.errors.length > 0 ? 'bg-[rgba(255,86,48,0.03)]' : ''}`}>
                          <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{line.itemNo}</td>
                          <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]">{line.orderNo}</td>
                          <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]">{line.orderSeq}</td>
                          <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e] max-w-[140px] truncate font-mono text-[11px]">{line.materialNo}</td>
                          <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">{line.orderPendingQtyRef}</td>
                          <td className={`px-[10px] py-[8px] font-semibold text-[12px] ${line.errors.some(e => e.includes('出貨量')) ? 'text-[#b71d18]' : 'text-[#1c252e]'}`}>{line.shipQty}</td>
                          <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]">{line.qtyPerBox || '—'}</td>
                          <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]">{line.countryOfOrigin || '—'}</td>
                          <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]">{line.customBoxes || '—'}</td>
                          <td className="px-[10px] py-[8px]">
                            {line.errors.length > 0 ? (
                              <div className="flex flex-col gap-[2px]">
                                {line.errors.map((e, i) => (
                                  <p key={i} className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#b71d18] max-w-[200px]">⚠ {e}</p>
                                ))}
                              </div>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                              </svg>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
              >
                重新選擇檔案
              </button>
              <div className="flex gap-[12px]">
                <button
                  onClick={() => setShowCsvModal(false)}
                  className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={csvPreview.globalErrors.length > 0 || csvPreview.lines.some(l => l.errors.length > 0)}
                  className="h-[36px] px-[20px] rounded-[8px] bg-[#005eb8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#004a94] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  確認建立出貨單（{csvPreview.lines.filter(l => l.errors.length === 0).length} 筆）
                </button>
              </div>
            </div>
          </div>
        </div>
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
