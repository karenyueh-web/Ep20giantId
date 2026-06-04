/**
 * InvoiceDetailPage — 開立發票明細頁
 *
 * 結構：
 *   上半：基本資訊（買方、發票總額、發票號碼、日期、聯式）
 *   下半：發票明細表格（驗收單號、料號、驗收量、單價可輸入、自動計算稅額小計）
 */

import { useState, useMemo } from 'react';
import { DeleteButton } from './ActionButtons';
import { PaginationControls } from './PaginationControls';
import { CheckboxIcon } from './CheckboxIcon';
import { DropdownSelect } from './DropdownSelect';
import { SimpleDatePicker } from './SimpleDatePicker';
import { invoiceMockData } from './invoiceCreateData';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import {
  type InvoiceDetailRow, type InvoiceDetailPageProps,
  TAX_RATE_OPTIONS, INVOICE_TYPE_OPTIONS, TAX_CODE_OPTIONS,
  toInvoiceDetailRows, recalcRow, resolveBuyer, isOverseasBuyer,
} from './invoiceDetailData';
import {
  appendInvoiceRecord, generateInvoiceId, resolveTaxCode, initInvoiceStore,
  deleteInvoiceRecord, loadInvoiceRecords,
  INVOICE_STATUS_CONFIG, type InvoiceStatus, type HistoryEntry, type InvoiceRecord,
} from './invoiceStore';
import { OrderHistory } from './OrderHistory';
import type { HistoryEntry as OrderHistoryEntry } from './OrderStoreContext';
import { MOCK_VENDORS } from './VendorManagementTable';

// ── FloatingInput（與 ShipmentDetailPage 一致）──────────────────────────────
function FloatingInput({
  label, value, onChange, placeholder, required, disabled, hasError,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; disabled?: boolean; hasError?: boolean;
}) {
  const borderColor = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  return (
    <div className="relative w-full h-[54px]">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor }} />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative shrink-0 leading-[12px]" style={{ fontSize: '12px', fontWeight: 600, color: hasError ? '#ff5630' : '#637381' }}>
          {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
          {label}
        </p>
      </div>
      <input
        type="text" value={value}
        onChange={e => { if (!disabled) onChange(e.target.value); }}
        placeholder={placeholder ?? ''} readOnly={disabled}
        className="w-full h-full rounded-[8px] px-[14px] pt-[14px] pb-[8px] text-[14px] outline-none bg-transparent border-0"
        style={{ color: disabled ? '#919eab' : '#1c252e' }}
      />
      {disabled && <div className="absolute inset-0 rounded-[8px] bg-[rgba(145,158,171,0.06)] pointer-events-none" />}
    </div>
  );
}

// ── FloatingDateField（日期選擇）─────────────────────────────────────────────
function FloatingDateField({
  label, value, onChange, required, hasError,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useState<HTMLDivElement | null>(null);
  const borderColor = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left });
    setOpen(v => !v);
  };

  return (
    <div className="relative w-full h-[54px]" onClick={handleClick}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor }} />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative shrink-0 leading-[12px]" style={{ fontSize: '12px', fontWeight: 600, color: hasError ? '#ff5630' : '#637381' }}>
          {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
          {label}
        </p>
      </div>
      <div className="flex items-center gap-[8px] h-full px-[14px] pt-[14px] pb-[8px] cursor-pointer select-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hasError ? '#ff5630' : '#637381'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`font-['Public_Sans:Regular',sans-serif] text-[14px] flex-1 truncate ${value ? 'text-[#1c252e]' : 'text-[#c4cdd6]'}`}>
          {value || '選擇日期'}
        </span>
      </div>
      {open && (
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          onClick={e => e.stopPropagation()}>
          <SimpleDatePicker selectedDate={value} onDateSelect={d => { onChange(d); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

// ── 主元件 ───────────────────────────────────────────────────────────────────
export function InvoiceDetailPage({ selectedRows, onClose, bondedType, currency, userRole = 'vendor', existingRecord, onSaveSuccess }: InvoiceDetailPageProps) {

  // ── 是否為檢視既有發票模式 ──
  const isViewMode = !!existingRecord;

  // ── 初始化 invoice store（若 localStorage 無資料則寫入 mock）──
  initInvoiceStore();

  // ── 基本資訊 state ──
  const [buyerName] = useState(() => existingRecord ? existingRecord.buyerName : resolveBuyer(selectedRows[0]?.plantCode ?? ''));
  const isOverseas   = existingRecord ? !existingRecord.invoiceType : isOverseasBuyer(selectedRows[0]?.plantCode ?? '');

  const [invoiceNo,   setInvoiceNo]   = useState(existingRecord?.invoiceNo ?? '');
  const [invoiceDate, setInvoiceDate] = useState(existingRecord?.invoiceDate ?? '');
  // 台灣買方：發票聯式（預設 21）
  const [invoiceType, setInvoiceType] = useState(existingRecord?.invoiceType || '21');
  // 海外買方：VAT 稅碼（預設 0%）
  const [taxCode,     setTaxCode]     = useState(existingRecord?.taxCode || '0');

  // ── 稅率 ──
  // 台灣保稅驗證：稅率鎖定 0％
  const isTaiwanBonded = !isOverseas && bondedType === '保稅';
  const [taxRateValue, setTaxRateValue] = useState(() => existingRecord ? existingRecord.taxRate : (isTaiwanBonded ? '0' : '5'));
  const taxRate = parseFloat(taxRateValue) / 100 || 0;

  // ── 品名 tooltip hover state ──
  const [hoveredProductRowId, setHoveredProductRowId] = useState<number | null>(null);
  // ── 金額欄 tooltip hover state（rowId + 欄名） ──
  const [hoveredAmountCell, setHoveredAmountCell] = useState<{ id: number; col: 'tax' | 'exTax' | 'inTax' } | null>(null);

  // ── 明細列（單價預設 = 驗收價）──
  const [rows, setRows] = useState<InvoiceDetailRow[]>(() => existingRecord ? existingRecord.rows : toInvoiceDetailRows(selectedRows, taxRate));

  // ── 更新單價（同時追蹤 priceModified）──
  const updateUnitPrice = (id: number, val: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const numVal = parseFloat(val);
      const isModified = isNaN(numVal) ? true : numVal !== r.acceptPrice;
      return recalcRow({ ...r, unitPrice: val, priceModified: isModified }, taxRate);
    }));
  };

  // ── 刪除明細 ──
  const deleteRow = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // ── 稅率變更時重算全部 ──
  const handleTaxRateChange = (val: string) => {
    if (isTaiwanBonded) return;  // 台灣保稅不得調整
    setTaxRateValue(val);
    const rate = parseFloat(val) / 100 || 0;
    setRows(prev => prev.map(r => recalcRow(r, rate)));
  };

  // ── 合計 ──
  const totals = useMemo(() => {
    let exTax = 0, tax = 0, inTax = 0;
    rows.forEach(r => { exTax += r.subtotalExTax; tax += r.itemTax; inTax += r.subtotalInTax; });
    return { exTax, tax, inTax };
  }, [rows]);

  // ── Toast ──
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  // ── Alert Dialog（阻擋訊息）──
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // ── 新增明細 Dialog state ──
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dialogOrderNo,  setDialogOrderNo]  = useState('');
  const [dialogOrderSeq, setDialogOrderSeq] = useState('');
  const [dialogMaterial, setDialogMaterial] = useState('');
  const [dialogSelected, setDialogSelected] = useState<Set<number>>(new Set());
  const [dialogPage,         setDialogPage]         = useState(1);
  const [dialogItemsPerPage, setDialogItemsPerPage] = useState(100);

  // 來源候選資料：同廠商 + 同保稅類別 + 排除已加入的 id
  // 記錄初始明細的原始 id（建立/載入時就在發票中的明細），刪除後應可回到候選清單
  const [initialRowIds] = useState<Set<number>>(() => new Set(
    (existingRecord ? existingRecord.rows : toInvoiceDetailRows(selectedRows, taxRate)).map(r => r.id)
  ));
  const existingIds = useMemo(() => new Set(rows.map(r => r.id)), [rows]);
  const vendorName  = selectedRows[0]?.vendorName ?? existingRecord?.vendorName ?? '';
  const resolvedBondedType = selectedRows[0]?.bondedType ?? bondedType ?? '';

  const candidateRows = useMemo(() => {
    return invoiceMockData.filter(r => {
      // 已加入的排除
      if (existingIds.has(r.id)) return false;
      // 必須是同廠商
      if (r.vendorName !== vendorName) return false;
      // 原本就在這張發票中被刪除的 → 直接回到候選（不檢查 bondedType）
      if (initialRowIds.has(r.id)) return true;
      // 新候選 → 必須同保稅類別
      return r.bondedType === resolvedBondedType;
    });
  }, [existingIds, vendorName, resolvedBondedType, initialRowIds]);

  const filteredCandidates = useMemo(() => {
    const q1 = dialogOrderNo.trim().toLowerCase();
    const q2 = dialogOrderSeq.trim().toLowerCase();
    const q3 = dialogMaterial.trim().toLowerCase();
    return candidateRows.filter(r =>
      (!q1 || r.orderNo.toLowerCase().includes(q1)) &&
      (!q2 || r.orderSeq.toLowerCase().includes(q2)) &&
      (!q3 || r.materialNo.toLowerCase().includes(q3))
    );
  }, [candidateRows, dialogOrderNo, dialogOrderSeq, dialogMaterial]);

  const dialogTotalPages = Math.max(1, Math.ceil(filteredCandidates.length / dialogItemsPerPage));
  const dialogPagedRows  = filteredCandidates.slice((dialogPage - 1) * dialogItemsPerPage, dialogPage * dialogItemsPerPage);

  const isDialogAllSelected  = dialogPagedRows.length > 0 && dialogPagedRows.every(r => dialogSelected.has(r.id));
  const isDialogSomeSelected = dialogSelected.size > 0 && !isDialogAllSelected;

  const toggleDialogRow = (id: number) =>
    setDialogSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleDialogAll = () => {
    if (isDialogAllSelected) {
      setDialogSelected(prev => { const s = new Set(prev); dialogPagedRows.forEach(r => s.delete(r.id)); return s; });
    } else {
      setDialogSelected(prev => { const s = new Set(prev); dialogPagedRows.forEach(r => s.add(r.id)); return s; });
    }
  };

  const handleAddSelected = () => {
    const toAdd = filteredCandidates.filter(r => dialogSelected.has(r.id));
    const newRows = toInvoiceDetailRows(toAdd, taxRate);
    setRows(prev => [...prev, ...newRows]);
    setDialogSelected(new Set());
    setAddDialogOpen(false);
    setDialogOrderNo('');
    setDialogOrderSeq('');
    setDialogMaterial('');
    setDialogPage(1);
    showToast(`已新增 ${toAdd.length} 筆驗收明細`);
  };

  // ── 提交驗證狀態 ──
  const [submitted, setSubmitted] = useState(false);

  // ── 歷程彈窗 ──
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false);

  // ── 價差 Banner ──
  const [showPriceMismatchBanner, setShowPriceMismatchBanner] = useState(false);
  const [mismatchedRowIndices, setMismatchedRowIndices] = useState<number[]>([]);

  // ── 唯讀 / 可編輯 ──
  const isEditable = !existingRecord || existingRecord.status === 'DR';
  const currentStatus = existingRecord?.status as InvoiceStatus | undefined;

  // ── 狀態配色（與 StatusBadge 同步）──
  const STATUS_TEXT_COLORS: Record<InvoiceStatus, string> = {
    DR: '#5119b7', P: '#006c9c', B: '#b76e00', S: '#118d57', F: '#b71d18', H: '#c4027d',
  };

  // ── 語意化狀態名稱 ──
  const statusLabel = (code: InvoiceStatus) => INVOICE_STATUS_CONFIG[code].label;

  // ── 共用：組裝發票記錄 + 歷程寫入 ──
  const buildInvoiceRecord = (status: InvoiceStatus, action: string, extraChanges?: string): InvoiceRecord => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const createdAt = `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const resolvedTaxCode = resolveTaxCode(invoiceNo, invoiceDate);

    // ── 歷程變更描述（語意化）──
    const prevHistory: HistoryEntry[] = existingRecord?.history ?? [];
    const changes: string[] = [];
    const prevStatus = existingRecord?.status as InvoiceStatus | undefined;
    if (prevStatus && prevStatus !== status) {
      changes.push(`狀態: ${statusLabel(prevStatus)}(${prevStatus})→${statusLabel(status)}(${status})`);
    }
    if (existingRecord) {
      if (existingRecord.invoiceNo !== invoiceNo.trim()) changes.push(`發票號碼: ${existingRecord.invoiceNo}→${invoiceNo.trim()}`);
      if (existingRecord.invoiceDate !== invoiceDate) changes.push(`發票日期: ${existingRecord.invoiceDate || '(空)'}→${invoiceDate || '(空)'}`);
      if (existingRecord.taxRate !== taxRateValue) changes.push(`稅率: ${existingRecord.taxRate}%→${taxRateValue}%`);
      if (!isOverseas && existingRecord.invoiceType !== invoiceType) changes.push(`發票聯式: ${existingRecord.invoiceType}→${invoiceType}`);
      // 單價變更：比對每筆明細的 unitPrice
      const prevRows = existingRecord.rows ?? [];
      const priceChangedRows = rows.filter(r => {
        const prev = prevRows.find(pr => pr.id === r.id);
        return prev && String(prev.unitPrice) !== String(r.unitPrice);
      });
      if (priceChangedRows.length > 0) {
        const priceDesc = priceChangedRows.map(r => {
          const prev = prevRows.find(pr => pr.id === r.id);
          return `${r.materialNo}(單價: ${prev?.unitPrice}→${r.unitPrice})`;
        }).join(', ');
        changes.push(`單價變更: ${priceDesc}`);
      }
      // 明細數量變動：列出新增的每筆資料詳情
      if (existingRecord.detailCount !== rows.length) {
        const prevIds = new Set((existingRecord.rows ?? []).map(r => r.id));
        const added = rows.filter(r => !prevIds.has(r.id));
        const removed = (existingRecord.rows ?? []).filter(r => !rows.find(cr => cr.id === r.id));
        if (added.length > 0) {
          const addedDesc = added.map(r => `${r.orderNo} ${r.materialNo}(數量:${r.acceptQty}, 金額:${r.subtotalInTax.toLocaleString()})`).join(', ');
          changes.push(`新增明細: ${addedDesc}`);
        }
        if (removed.length > 0) {
          const removedDesc = removed.map(r => `${r.orderNo} ${r.materialNo}`).join(', ');
          changes.push(`刪除明細: ${removedDesc}`);
        }
      }
    }
    if (extraChanges) changes.push(extraChanges);

    const historyEntry: HistoryEntry = {
      timestamp, action, operator: '當前使用者',
      changes: changes.length > 0 ? changes.join('；') : (existingRecord ? '無變更' : '新建草稿'),
    };

    return {
      id: existingRecord?.id ?? generateInvoiceId(),
      invoiceNo: invoiceNo.trim(),
      invoiceDate,
      status,
      buyerName,
      invoiceType: isOverseas ? '' : invoiceType,
      taxRate: taxRateValue,
      taxCode: resolvedTaxCode,
      taxAmount: totals.tax,
      totalAmount: totals.inTax,
      currency,
      bondedType,
      vendorName: existingRecord?.vendorName ?? selectedRows[0]?.vendorName ?? '',
      execNote: existingRecord?.execNote ?? '',
      detailCount: rows.length,
      createdAt: existingRecord?.createdAt ?? createdAt,
      rows,
      history: [...prevHistory, historyEntry],
    };
  };

  // ── 檢查發票號碼是否重複（同間公司）──
  const checkDuplicateInvoiceNo = (): string | null => {
    const trimmedNo = invoiceNo.trim();
    if (!trimmedNo) return null;
    const currentVendor = existingRecord?.vendorName ?? selectedRows[0]?.vendorName ?? '';
    const currentId = existingRecord?.id;
    const allRecords = loadInvoiceRecords();
    const dup = allRecords.find(r =>
      r.invoiceNo === trimmedNo &&
      r.vendorName === currentVendor &&
      r.id !== currentId
    );
    return dup ? `發票號碼「${trimmedNo}」已被使用，發票狀態:${INVOICE_STATUS_CONFIG[dup.status as InvoiceStatus]?.label ?? dup.status}(${dup.status})，同間公司不可重複使用。` : null;
  };

  // ── 暫存（儲存為草稿 DR）──
  const handleSaveDraft = () => {
    setSubmitted(true);
    if (!invoiceNo.trim()) {
      setAlertMessage('請填寫發票號碼');
      return;
    }
    const dupMsg = checkDuplicateInvoiceNo();
    if (dupMsg) {
      setAlertMessage(dupMsg);
      return;
    }
    const savedRecord = buildInvoiceRecord('DR', existingRecord ? '暫存' : '建立');
    appendInvoiceRecord(savedRecord);
    showToast('草稿已暫存');
    setTimeout(() => onSaveSuccess?.(savedRecord), 800);
  };

  // ── 確認開立 ──
  const handleConfirm = () => {
    setSubmitted(true);
    const errors: string[] = [];
    if (!invoiceNo.trim()) errors.push('請填寫發票號碼');
    if (!invoiceDate) errors.push('請填寫發票日期');
    if (rows.length === 0) errors.push('尚無發票明細，無法確認開立');
    const dupMsg = checkDuplicateInvoiceNo();
    if (dupMsg) errors.push(dupMsg);
    if (errors.length > 0) {
      setAlertMessage(errors.join('\n'));
      return;
    }
    // 單價 vs 驗收價比對（實際數值比對，非旗標）
    const mismatched = rows
      .map((r, idx) => ({ ...r, index: idx + 1 }))
      .filter(r => parseFloat(String(r.unitPrice)) !== r.acceptPrice);
    if (mismatched.length > 0) {
      setMismatchedRowIndices(mismatched.map(r => r.index));
      setShowPriceMismatchBanner(true);
    } else {
      submitAsStatusP();
    }
  };

  // ── 確認開立：直接送出（無價差）──
  const submitAsStatusP = () => {
    const record = buildInvoiceRecord('P', '確認開立');
    record.execNote = '回傳SAP中';
    appendInvoiceRecord(record);
    showToast('發票已確認開立，資料處理中');
    setTimeout(() => onSaveSuccess?.(record), 800);
  };

  // ── 轉交採購確認（有價差）──
  const handleTransferToPurchasing = () => {
    const mismatchRows = rows.filter(r => parseFloat(String(r.unitPrice)) !== r.acceptPrice);
    const mismatchDesc = mismatchRows.map(r => `${r.orderNo} ${r.materialNo}`).join(', ');
    const mismatchInfo = `單價與驗收價不符: ${mismatchDesc}`;
    const record = buildInvoiceRecord('B', '轉交採購確認', mismatchInfo);
    record.execNote = '價差確認中';
    appendInvoiceRecord(record);
    setShowPriceMismatchBanner(false);
    showToast('已轉交採購確認');
    setTimeout(() => onSaveSuccess?.(record), 800);
  };

  // ── 轉線下處理（B/F → H）──
  const handleOffline = () => {
    const record = buildInvoiceRecord('H', '轉線下處理');
    record.execNote = '改線下處理';
    appendInvoiceRecord(record);
    showToast('已轉為線下處理');
    setTimeout(() => onSaveSuccess?.(record), 800);
  };

  // ── 退回廠商（B/F → DR）──
  const handleReturnToVendor = () => {
    const record = buildInvoiceRecord('DR', '退回廠商');
    record.execNote = '採購退回，請廠商重新確認';
    appendInvoiceRecord(record);
    showToast('已退回廠商，發票回到草稿狀態');
    setTimeout(() => onSaveSuccess?.(record), 800);
  };

  // ── 重拋（F → P）──
  const handleRetry = () => {
    const record = buildInvoiceRecord('P', '重拋');
    record.execNote = '回傳SAP中';
    appendInvoiceRecord(record);
    showToast('已重新拋送 SAP，資料處理中');
    setTimeout(() => onSaveSuccess?.(record), 800);
  };

  // ── 刪除發票確認彈窗 ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handleDeleteInvoice = () => {
    if (!existingRecord) return;
    deleteInvoiceRecord(existingRecord.id);
    showToast('發票已刪除');
    setTimeout(() => onClose(), 800);
  };

  // ── 表格欄位定義 ──
  const TABLE_COLS = [
    { label: '#',      w: 50,  align: 'center' as const },
    { label: '驗收單號', w: 130, align: 'left' as const },
    { label: '驗收項次', w: 80,  align: 'left' as const },
    { label: '訂單號碼-序號', w: 160, align: 'left' as const },
    { label: '料號',     w: 150, align: 'left' as const },
    { label: '驗收量',   w: 80,  align: 'left' as const },
    { label: '驗收價',   w: 90,  align: 'left' as const },
    { label: '單價',     w: 90,  align: 'left' as const, blue: true },
    { label: '單項稅額', w: 130, align: 'left' as const },
    { label: '未稅小計', w: 130, align: 'left' as const },
    { label: '含稅小計', w: 130, align: 'left' as const },
    { label: '品名',     w: 200, align: 'left' as const },
    { label: '',         w: 50,  align: 'center' as const },
  ];

  const totalWidth = TABLE_COLS.reduce((s, c) => s + c.w, 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 上半：基本資訊 ────────────────────────────────────────── */}
      <div className="shrink-0 px-[24px] pt-[16px] pb-[20px] border-b border-[rgba(145,158,171,0.12)]">

        {/* 導覽列 */}
        <div className="flex items-center justify-between mb-[20px]">
          <div className="flex items-center gap-[10px]">
            <div onClick={onClose} className="shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity">
              <IconsSolidIcSolarMultipleForwardLeftBroken />
            </div>
            <div className="h-[48px] min-h-[48px] relative shrink-0">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              <div className="flex items-center justify-center h-full px-[4px]">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">基本資訊</p>
              </div>
            </div>
            {/* 發票狀態文字（從 TAG 移到這裡） */}
            {currentStatus && (
              <p
                className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] leading-[28px] whitespace-nowrap ml-[8px]"
                style={{ color: STATUS_TEXT_COLORS[currentStatus] }}
              >
                發票狀態:{statusLabel(currentStatus)}({currentStatus})
              </p>
            )}
          </div>
          <div className="flex items-center gap-[12px]">
            {/* ── 依狀態顯示操作按鈕（不分角色）── */}
            {/* ── DR 草稿：廠商可執行 ── */}
            {(!currentStatus || currentStatus === 'DR') && (
              <>
                {existingRecord && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-[40px] min-w-[88px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#637381] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                  >
                    刪除草稿
                  </button>
                )}
                <button
                  onClick={handleSaveDraft}
                  className="h-[40px] min-w-[88px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  暫存
                </button>
                <button
                  onClick={handleConfirm}
                  className="h-[40px] min-w-[88px] px-[16px] bg-[#005eb8] hover:bg-[#004a94] text-white rounded-[8px] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] transition-colors whitespace-nowrap"
                >
                  轉發票
                </button>
              </>
            )}

            {/* ── B 採購確認中：採購可執行 ── */}
            {currentStatus === 'B' && (
              <>
                <button
                  onClick={handleOffline}
                  className="h-[40px] min-w-[88px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  線下處理
                </button>
                <button
                  onClick={handleReturnToVendor}
                  className="h-[40px] min-w-[88px] px-[16px] rounded-[8px] border border-[rgba(255,86,48,0.4)] bg-white text-[#ff5630] hover:bg-[rgba(255,86,48,0.04)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  退回廠商
                </button>
              </>
            )}

            {/* ── S 轉發票成功：廠商可刪除 ── */}
            {currentStatus === 'S' && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="h-[40px] min-w-[88px] px-[16px] rounded-[8px] bg-[#ff5630] hover:bg-[#b71d18] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
              >
                刪除發票
              </button>
            )}

            {/* ── F 轉發票失敗：採購可執行 ── */}
            {currentStatus === 'F' && (
              <>
                <button
                  onClick={handleRetry}
                  className="h-[40px] min-w-[88px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  重拋
                </button>
                <button
                  onClick={handleOffline}
                  className="h-[40px] min-w-[88px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  線下處理
                </button>
                <button
                  onClick={handleReturnToVendor}
                  className="h-[40px] min-w-[88px] px-[16px] rounded-[8px] border border-[rgba(255,86,48,0.4)] bg-white text-[#ff5630] hover:bg-[rgba(255,86,48,0.04)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  退回廠商
                </button>
              </>
            )}
            {/* 歷程連結（所有狀態都顯示，只要有 existingRecord） */}
            {existingRecord && (
              <p
                className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70 select-none whitespace-nowrap"
                style={{ fontVariationSettings: "'wdth' 100" }}
                onClick={() => setShowInvoiceHistory(true)}
              >
                歷程
              </p>
            )}
          </div>
        </div>

        {/* 表單：4-column grid，Row 1 與 Row 2 欄位切齊 */}
        <div className="grid grid-cols-4 gap-[16px]">
          {/* Row 1 */}
          {/* 廠商（col 1，唯讀，顯示完整名稱） */}
          <div className="min-w-0">
            <FloatingInput label="廠商" value={(() => {
              const vn = existingRecord?.vendorName ?? selectedRows[0]?.vendorName ?? '';
              const codeMatch = vn.match(/\(([^)]+)\)/);
              if (codeMatch) {
                const found = MOCK_VENDORS.find(v => v.code === codeMatch[1]);
                if (found) return found.fullName;
              }
              return vn;
            })()} onChange={() => {}} disabled />
          </div>
          {/* 買方（col 2-3，唯讀，有必填星號） */}
          <div className="col-span-2 min-w-0">
            <FloatingInput label="買方" value={buyerName} onChange={() => {}} required disabled />
          </div>
          {/* 發票總額（col 4，唯讀，顯示計算值） */}
          <div className="min-w-0">
            <FloatingInput
              label="發票總額"
              value={totals.inTax > 0 ? totals.inTax.toLocaleString() : ''}
              onChange={() => {}}
              disabled
            />
          </div>

          {/* Row 2 */}
          {/* 發票號碼（col 1） */}
          <div className="min-w-0">
            <FloatingInput label="發票號碼" value={invoiceNo} onChange={setInvoiceNo}
              required hasError={submitted && !invoiceNo.trim()} disabled={!isEditable} />
          </div>
          {/* 發票日期（col 2） */}
          <div className="min-w-0">
            {isEditable ? (
              <FloatingDateField label="發票日期" value={invoiceDate} onChange={setInvoiceDate}
                required hasError={submitted && !invoiceDate} />
            ) : (
              <FloatingInput label="發票日期" value={invoiceDate || ''} onChange={() => {}} disabled />
            )}
          </div>
          {/* 稅率（col 3，台灣保稅：鎖定 0%；其他：可選） */}
          <div className="min-w-0">
            {!isEditable || isTaiwanBonded ? (
              <FloatingInput label="稅率" value={`${taxRateValue}%`} onChange={() => {}} disabled />
            ) : (
              <DropdownSelect
                label="稅率"
                value={taxRateValue}
                onChange={handleTaxRateChange}
                options={TAX_RATE_OPTIONS}
                searchable={false}
              />
            )}
          </div>
          {/* 發票聯式 / 稅碼（col 4） */}
          <div className="min-w-0">
            {!isEditable ? (
              <FloatingInput
                label={isOverseas ? '稅碼' : '發票聯式'}
                value={isOverseas
                  ? (TAX_CODE_OPTIONS.find(o => o.value === taxCode)?.label ?? taxCode)
                  : (INVOICE_TYPE_OPTIONS.find(o => o.value === invoiceType)?.label ?? invoiceType)}
                onChange={() => {}}
                disabled
              />
            ) : isOverseas ? (
              /* 海外買方 → VAT 稅碼，預設 0% */
              <DropdownSelect
                label="稅碼"
                value={taxCode}
                onChange={setTaxCode}
                options={TAX_CODE_OPTIONS}
                searchable={false}
              />
            ) : (
              /* 台灣買方 → 發票聯式，預設 21 */
              <DropdownSelect
                label="發票聯式"
                value={invoiceType}
                onChange={setInvoiceType}
                options={INVOICE_TYPE_OPTIONS}
                searchable={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── 下半：發票明細 ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[24px] py-[20px]">

        {/* ── 價差 Banner ────────────────────────────────────────── */}
        {showPriceMismatchBanner && (
          <div className="mb-[12px] rounded-[8px] px-[16px] py-[12px]" style={{ backgroundColor: 'rgba(255,171,0,0.08)', border: '1px solid rgba(255,171,0,0.3)' }}>
            <div className="flex items-start justify-between gap-[16px]">
              <div className="flex items-start gap-[10px] flex-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[2px]">
                  <path d="M12 2L1 21h22L12 2z" fill="rgba(255,171,0,0.2)" stroke="#b76e00" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 9v5M12 17h.01" stroke="#b76e00" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div>
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[22px]">
                    下列明細單價與驗收價不同，請確認是否誤植，若無問題請轉交採購處理。
                  </p>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#b76e00] mt-[4px]">
                    發票明細編號: {mismatchedRowIndices.join('、')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[12px] shrink-0">
                <button
                  onClick={() => setShowPriceMismatchBanner(false)}
                  className="h-[36px] px-[16px] rounded-[8px] bg-[#b76e00] hover:bg-[#8a5200] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors whitespace-nowrap"
                >
                  確認單價
                </button>
                <p
                  className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#005eb8] underline cursor-pointer hover:opacity-70 whitespace-nowrap select-none"
                  onClick={handleTransferToPurchasing}
                >
                  轉交採購
                </p>
                <button
                  onClick={() => setShowPriceMismatchBanner(false)}
                  className="w-[28px] h-[28px] flex items-center justify-center rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors text-[#637381]"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── F 狀態紅色提示文字 ── */}
        {currentStatus === 'F' && (
          <p className="font-['Public_Sans:Regular',sans-serif] text-[#ff5630] text-[13px] mb-[12px] leading-[20px]">
            SAP建立發票出現錯誤，若無法判斷錯誤原因，請先至SAP執行TCODE: MIR7手動建立發票以得到更清楚的錯誤訊息與錯誤的項次。
          </p>
        )}

        {/* Toolbar：TAG + 標題 + 操作 */}
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-[12px]">
            {/* 保稅(幣別) TAG — 回歸黑底白字 */}
            <div
              className="h-[48px] min-w-[48px] relative rounded-[8px] shrink-0"
              style={{ backgroundColor: '#1c252e' }}
            >
              <div
                aria-hidden="true"
                className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]"
                style={{ borderColor: '#1c252e' }}
              />
              <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                <div className="flex items-center justify-center min-w-[inherit] px-[14px]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[15px] text-center whitespace-nowrap text-white">
                    {bondedType}({currency})
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[48px] min-h-[48px] relative shrink-0">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              <div className="flex items-center justify-center h-full px-[4px]">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">發票明細</p>
              </div>
            </div>

            {/* 未稅合計 + 含稅合計（緊靠 Tab 右側，橫向） */}
            {rows.length > 0 && (
              <div className="flex items-center gap-[16px] ml-[8px]">
                <div className="w-[1px] h-[28px] bg-[rgba(145,158,171,0.24)] shrink-0" />
                <div className="flex items-center gap-[6px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] whitespace-nowrap">明細數量</span>
                  <span className="font-['Public_Sans:SemiBold',sans-serif] text-[14px] text-[#1c252e] whitespace-nowrap">{rows.length}</span>
                </div>
                <div className="w-[1px] h-[28px] bg-[rgba(145,158,171,0.24)] shrink-0" />
                <div className="flex items-center gap-[6px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] whitespace-nowrap">未稅合計</span>
                  <span className="font-['Public_Sans:SemiBold',sans-serif] text-[14px] text-[#1c252e] whitespace-nowrap">{totals.exTax.toLocaleString()}</span>
                </div>
                <div className="w-[1px] h-[28px] bg-[rgba(145,158,171,0.24)] shrink-0" />
                <div className="flex items-center gap-[6px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] whitespace-nowrap">稅額合計</span>
                  <span className="font-['Public_Sans:SemiBold',sans-serif] text-[14px] text-[#1c252e] whitespace-nowrap">{totals.tax.toLocaleString()}</span>
                </div>
                <div className="w-[1px] h-[28px] bg-[rgba(145,158,171,0.24)] shrink-0" />
                <div className="flex items-center gap-[6px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] whitespace-nowrap">含稅合計</span>
                  <span className="font-['Public_Sans:SemiBold',sans-serif] text-[14px] text-[#005eb8] whitespace-nowrap">{totals.inTax.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* 右側：新增驗收資料按鈕（僅可編輯時顯示） */}
          {isEditable && <button
            onClick={() => setAddDialogOpen(true)}
            title="新增驗收資料"
            className="w-[40px] h-[40px] rounded-full bg-[#1D7BF5] hover:bg-[#1262cc] flex items-center justify-center shrink-0 transition-colors shadow-[0px_4px_8px_rgba(29,123,245,0.32)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>}
        </div>

        {/* 表格卡片 */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_4px_8px_-2px_rgba(145,158,171,0.12)]">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div style={{ minWidth: `${totalWidth}px`, paddingTop: '1px' }}>

              {/* 表頭 */}
              <div className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.16)] bg-[rgba(145,158,171,0.04)]">
                {TABLE_COLS.map((col, i) => (
                  <div key={i} style={{ width: col.w, minWidth: col.w, flex: `0 0 ${col.w}px` }}
                    className={`${i === 0 ? 'pl-[16px] pr-[8px]' : 'px-[8px]'} font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] leading-[20px] ${
                      (col as any).blue ? 'text-[#005eb8]' :
                      col.align === 'right' ? 'text-right text-[#637381]' :
                      col.align === 'center' ? 'text-center text-[#637381]' :
                      'text-[#637381]'
                    }`}>
                    {col.label}
                  </div>
                ))}
              </div>

              {/* 空狀態 */}
              {rows.length === 0 && (
                <div className="flex items-center justify-center h-[80px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">目前沒有發票明細</p>
                </div>
              )}

              {/* 資料列 */}
              {rows.map((row, idx) => (
                <div key={row.id}
                  className={`flex items-center py-[12px] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${idx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''} ${idx === 0 ? '' : 'border-t border-[rgba(145,158,171,0.08)]'}`}>
                  {/* # */}
                  <div style={{ width: 50, minWidth: 50 }} className="pl-[16px] pr-[8px] shrink-0 text-center">
                    <span className="text-[14px] text-[#637381]">{idx + 1}</span>
                  </div>
                  {/* 驗收單號 */}
                  <div style={{ width: 130, minWidth: 130 }} className="px-[8px] shrink-0">
                    <span className="text-[14px] text-[#637381] truncate block">{row.acceptNo}</span>
                  </div>
                  {/* 驗收項次 */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] shrink-0">
                    <span className="text-[14px] text-[#637381]">{row.acceptSeq}</span>
                  </div>
                  {/* 訂單號碼-序號 */}
                  <div style={{ width: 160, minWidth: 160 }} className="px-[8px] shrink-0">
                    <span className="text-[14px] text-[#637381] truncate block">{row.orderNo}</span>
                  </div>
                  {/* 料號 */}
                  <div style={{ width: 150, minWidth: 150 }} className="px-[8px] shrink-0">
                    <span className="text-[14px] text-[#637381] truncate block">{row.materialNo}</span>
                  </div>
                  {/* 驗收量 */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] shrink-0">
                    <span className="text-[14px] text-[#1c252e]">{row.acceptQty.toLocaleString()}</span>
                  </div>
                  {/* 驗收價 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                    <span className="text-[14px] text-[#1c252e]">{row.acceptPrice.toLocaleString()}</span>
                  </div>
                  {/* 單價（可編輯時為 input，唯讀時為文字） */}
                  {(() => {
                    const hasMismatch = !!row.priceModified;
                    return (
                      <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                        {isEditable ? (
                          <input type="text" inputMode="decimal" value={row.unitPrice}
                            onChange={e => {
                              const raw = e.target.value.replace(/[^0-9.]/g, '');
                              const parts = raw.split('.'); const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;
                              updateUnitPrice(row.id, sanitized);
                            }}
                            className={`w-full h-[32px] px-[6px] border rounded-[6px] text-[14px] outline-none bg-white text-left transition-colors ${
                              hasMismatch
                                ? 'border-[#ff5630] text-[#ff5630] focus:border-[#ff5630] focus:ring-2 focus:ring-[rgba(255,86,48,0.12)]'
                                : 'border-[rgba(0,94,184,0.4)] text-[#1c252e] focus:border-[#005eb8] focus:ring-2 focus:ring-[rgba(0,94,184,0.12)]'
                            }`}
                          />
                        ) : (
                          <span className={`text-[14px] ${hasMismatch ? 'text-[#ff5630]' : 'text-[#1c252e]'}`}>{row.unitPrice}</span>
                        )}
                      </div>
                    );
                  })()}
                  {/* 單項稅額 */}
                  <div
                    style={{ width: 130, minWidth: 130 }}
                    className="px-[8px] shrink-0 relative"
                    onMouseEnter={() => setHoveredAmountCell({ id: row.id, col: 'tax' })}
                    onMouseLeave={() => setHoveredAmountCell(null)}
                  >
                    <span className="text-[14px] text-[#1c252e] truncate block">{row.itemTax.toLocaleString()}</span>
                    {hoveredAmountCell?.id === row.id && hoveredAmountCell.col === 'tax' && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[6px] z-[200] pointer-events-none"
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
                        <div className="bg-[#1c252e] text-white rounded-[8px] px-[10px] py-[6px] whitespace-nowrap font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px]">
                          {row.itemTax.toLocaleString()}
                        </div>
                        <div className="flex justify-center">
                          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1c252e' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 未稅小計 */}
                  <div
                    style={{ width: 130, minWidth: 130 }}
                    className="px-[8px] shrink-0 relative"
                    onMouseEnter={() => setHoveredAmountCell({ id: row.id, col: 'exTax' })}
                    onMouseLeave={() => setHoveredAmountCell(null)}
                  >
                    <span className="text-[14px] text-[#1c252e] truncate block">{row.subtotalExTax.toLocaleString()}</span>
                    {hoveredAmountCell?.id === row.id && hoveredAmountCell.col === 'exTax' && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[6px] z-[200] pointer-events-none"
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
                        <div className="bg-[#1c252e] text-white rounded-[8px] px-[10px] py-[6px] whitespace-nowrap font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px]">
                          {row.subtotalExTax.toLocaleString()}
                        </div>
                        <div className="flex justify-center">
                          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1c252e' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 含稅小計 */}
                  <div
                    style={{ width: 130, minWidth: 130 }}
                    className="px-[8px] shrink-0 relative"
                    onMouseEnter={() => setHoveredAmountCell({ id: row.id, col: 'inTax' })}
                    onMouseLeave={() => setHoveredAmountCell(null)}
                  >
                    <span className="text-[14px] text-[#1c252e] font-semibold truncate block">{row.subtotalInTax.toLocaleString()}</span>
                    {hoveredAmountCell?.id === row.id && hoveredAmountCell.col === 'inTax' && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[6px] z-[200] pointer-events-none"
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
                        <div className="bg-[#1c252e] text-white rounded-[8px] px-[10px] py-[6px] whitespace-nowrap font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px]">
                          {row.subtotalInTax.toLocaleString()}
                        </div>
                        <div className="flex justify-center">
                          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1c252e' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 品名 */}
                  <div
                    style={{ width: 200, minWidth: 200 }}
                    className="px-[8px] shrink-0 relative"
                    onMouseEnter={() => setHoveredProductRowId(row.id)}
                    onMouseLeave={() => setHoveredProductRowId(null)}
                  >
                    <span className="text-[14px] text-[#637381] truncate block max-w-full overflow-hidden">{row.productName}</span>
                    {hoveredProductRowId === row.id && row.productName && (
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[6px] z-[200] pointer-events-none"
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
                      >
                        <div className="bg-[#1c252e] text-white rounded-[8px] px-[10px] py-[6px] whitespace-nowrap font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px]">
                          {row.productName}
                        </div>
                        {/* 小三角 */}
                        <div className="flex justify-center">
                          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1c252e' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 刪除（僅可編輯時顯示） */}
                  <div style={{ width: 50, minWidth: 50 }} className="px-[4px] shrink-0 flex justify-center">
                    {isEditable && <DeleteButton onClick={() => deleteRow(row.id)} />}
                  </div>
                </div>
              ))}


            </div>
          </div>
        </div>
      </div>

      {/* ── 發票歷程彈窗（使用 OrderHistory 元件，與訂單歷程一致）────── */}
      {showInvoiceHistory && existingRecord && (() => {
        // 將 invoice HistoryEntry 轉換為 OrderHistory 需要的格式
        const orderHistoryEntries: OrderHistoryEntry[] = (existingRecord.history ?? []).slice().reverse().map(e => ({
          date: e.timestamp,
          event: e.action,
          operator: e.operator,
          remark: e.changes ?? '',
        }));
        return (
          <OrderHistory
            onClose={() => setShowInvoiceHistory(false)}
            entries={orderHistoryEntries}
            titleLabel="發票歷程"
            correctionDocNo={existingRecord.invoiceNo}
            correctionDocNoLabel="發票號碼"
          />
        );
      })()}

      {/* ── 新增發票明細 Dialog ─────────────────────────────────────── */}
      {addDialogOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: 'rgba(22,28,36,0.48)' }}>
          <div className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.24)] flex flex-col overflow-hidden"
            style={{ width: 'min(960px, 92vw)', height: 'min(680px, 88vh)' }}>

            {/* Dialog Header */}
            <div className="flex items-start justify-between px-[24px] pt-[20px] pb-[12px] shrink-0">
              <div className="flex flex-col gap-[4px]">
                {/* 返回箭頭 + 標題 */}
                <div className="flex items-center gap-[8px]">
                  <button onClick={() => { setAddDialogOpen(false); setDialogSelected(new Set()); }}
                    className="shrink-0 size-[28px] flex items-center justify-center rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">新增發票明細</p>
                  {/* 條件 TAG */}
                  <div className="flex items-center gap-[4px] ml-[4px]">
                    {[bondedType || '全部', selectedRows[0]?.purchaseOrg, selectedRows[0]?.plantCode]
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span key={i} className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#005eb8]">
                          {i > 0 && <span className="text-[#c4cdd6] mx-[4px]">|</span>}
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
                {/* 結果數 */}
                <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] pl-[36px]">
                  {filteredCandidates.length} results
                </p>
              </div>
              {/* 搜尋欄 */}
              <div className="flex items-center gap-[10px] pt-[8px]">
                {[
                  { label: '訂單號碼', value: dialogOrderNo, set: setDialogOrderNo },
                  { label: '訂單序號', value: dialogOrderSeq, set: setDialogOrderSeq },
                  { label: '料號',     value: dialogMaterial, set: setDialogMaterial },
                ].map(({ label, value, set }) => (
                  <div key={label} className="relative w-[150px] h-[40px]">
                    {/* border */}
                    <div className="absolute inset-0 rounded-[8px] border border-[rgba(145,158,171,0.32)] pointer-events-none" />
                    {/* floating label */}
                    <div className="absolute flex items-center left-[12px] px-[2px] top-[-6px] z-10">
                      <div className="absolute bg-white h-[2px] left-0 right-0 top-[6px]" />
                      <span className="relative text-[11px] font-semibold text-[#637381] whitespace-nowrap leading-[12px]">{label}</span>
                    </div>
                    <input value={value} onChange={e => { set(e.target.value); setDialogPage(1); }}
                      className="absolute inset-0 w-full h-full rounded-[8px] px-[12px] pt-[8px] text-[13px] text-[#1c252e] outline-none bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Toolbar */}
            {dialogSelected.size > 0 && (
              <div className="mx-[24px] mb-[8px] flex items-center gap-[12px] px-[12px] h-[44px] rounded-[8px] bg-[#e8f1fb] shrink-0">
                <CheckboxIcon checked={isDialogAllSelected} indeterminate={isDialogSomeSelected} onChange={toggleDialogAll} />
                <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{dialogSelected.size} selected</span>
                <div className="w-[1px] h-[20px] bg-[rgba(145,158,171,0.32)]" />
                <button onClick={handleAddSelected}
                  className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#005eb8] hover:text-[#004a94] transition-colors">
                  新增發票明細
                </button>
              </div>
            )}

            {/* Table — 純縱向捲動，欄位自適應 */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div>
                {/* 表頭 */}
                <div className="flex items-center py-[10px] mx-[24px] border-b border-[rgba(145,158,171,0.16)] bg-[rgba(145,158,171,0.04)] sticky top-0 z-10">
                  {dialogSelected.size > 0
                    ? <div style={{ width: 40, minWidth: 40 }} className="shrink-0" />
                    : <div style={{ width: 40, minWidth: 40 }} className="pl-[4px] shrink-0 flex justify-center">
                        <CheckboxIcon checked={isDialogAllSelected} indeterminate={isDialogSomeSelected} onChange={toggleDialogAll} />
                      </div>
                  }
                  {[['收料日期',90],['訂單號碼',110],['訂單序號',60],['預計交期',90],['可請款日',90],['訂貨量',70],['未收量',70],['驗收量',70]]
                    .reduce<React.ReactNode[]>((acc, [l, w], i) => {
                      // 在「訂單序號」後插入「料號（flex-1）」
                      if (i === 2) {
                        acc.push(
                          <div key="seq" style={{ width: w as number, minWidth: w as number }} className="px-[8px] shrink-0">
                            <span className="font-['Public_Sans:SemiBold',sans-serif] text-[12px] text-[#637381] uppercase tracking-wide whitespace-nowrap">{l}</span>
                          </div>,
                          <div key="mat" className="flex-1 min-w-0 px-[8px]">
                            <span className="font-['Public_Sans:SemiBold',sans-serif] text-[12px] text-[#637381] uppercase tracking-wide whitespace-nowrap">料號</span>
                          </div>
                        );
                      } else {
                        acc.push(
                          <div key={l as string} style={{ width: w as number, minWidth: w as number }} className="px-[8px] shrink-0">
                            <span className="font-['Public_Sans:SemiBold',sans-serif] text-[12px] text-[#637381] uppercase tracking-wide whitespace-nowrap">{l}</span>
                          </div>
                        );
                      }
                      return acc;
                    }, [])}
                </div>

                {/* 空狀態 */}
                {dialogPagedRows.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-[60px] gap-[8px]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4cdd6" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">沒有符合條件的驗收資料</p>
                  </div>
                )}

                {/* 資料列 */}
                {dialogPagedRows.map((r) => (
                  <div key={r.id}
                    onClick={() => toggleDialogRow(r.id)}
                    className={`flex items-center py-[14px] mx-[24px] cursor-pointer transition-colors border-t border-[rgba(145,158,171,0.08)] ${
                      dialogSelected.has(r.id) ? 'bg-[rgba(0,94,184,0.04)]' : 'hover:bg-[rgba(145,158,171,0.04)]'
                    }`}>
                    <div style={{ width: 40, minWidth: 40 }} className="pl-[4px] shrink-0 flex justify-center"
                      onClick={e => e.stopPropagation()}>
                      <CheckboxIcon checked={dialogSelected.has(r.id)} onChange={() => toggleDialogRow(r.id)} />
                    </div>
                    <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0"><span className="text-[14px] text-[#1c252e]">{r.receiveDate}</span></div>
                    <div style={{ width: 110, minWidth: 110 }} className="px-[8px] shrink-0"><span className="text-[14px] text-[#1c252e] truncate block">{r.orderNo}</span></div>
                    <div style={{ width: 60, minWidth: 60 }} className="px-[8px] shrink-0"><span className="text-[14px] text-[#1c252e]">{r.orderSeq}</span></div>
                    <div className="flex-1 min-w-0 px-[8px]"><span className="text-[14px] text-[#1c252e] truncate block">{r.materialNo}</span></div>
                    <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0"><span className="text-[14px] text-[#1c252e]">{r.claimDate}</span></div>
                    <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0"><span className="text-[14px] text-[#1c252e]">{r.claimDate}</span></div>
                    <div style={{ width: 70, minWidth: 70 }} className="px-[8px] shrink-0"><span className="text-[14px] text-[#1c252e]">{r.orderQty.toLocaleString()}</span></div>
                    <div style={{ width: 70, minWidth: 70 }} className="px-[8px] shrink-0"><span className="text-[14px] text-[#1c252e]">{(r.orderQty - r.acceptQty).toLocaleString()}</span></div>
                    <div style={{ width: 70, minWidth: 70 }} className="px-[8px] shrink-0"><span className="text-[14px] text-[#1c252e]">{r.acceptQty.toLocaleString()}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer: 系統標準分頁 */}
            <div className="border-t border-[rgba(145,158,171,0.12)] shrink-0">
              <PaginationControls
                currentPage={dialogPage}
                totalItems={filteredCandidates.length}
                itemsPerPage={dialogItemsPerPage}
                onPageChange={setDialogPage}
                onItemsPerPageChange={(n) => { setDialogItemsPerPage(n); setDialogPage(1); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alert Dialog（阻擋訊息彈窗） */}
      {alertMessage && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center" style={{ background: 'rgba(22,28,36,0.48)' }}>
          <div className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.24)] p-[32px] flex flex-col items-center gap-[20px]"
            style={{ width: 'min(420px, 90vw)' }}>
            {/* 警告圖示 */}
            <div className="w-[56px] h-[56px] rounded-full bg-[rgba(255,171,0,0.12)] flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b76e00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            {/* 訊息文字 */}
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] text-[#1c252e] text-center leading-[24px] whitespace-pre-line">
              {alertMessage}
            </p>
            {/* 確認按鈕 */}
            <button
              onClick={() => setAlertMessage(null)}
              className="h-[40px] w-full max-w-[200px] bg-[#1c252e] hover:bg-[#454f5b] text-white rounded-[8px] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* 刪除確認彈窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center" style={{ background: 'rgba(22,28,36,0.48)' }}>
          <div className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.24)] p-[32px] flex flex-col items-center gap-[20px]"
            style={{ width: 'min(420px, 90vw)' }}>
            {/* 警告圖示 */}
            <div className="w-[56px] h-[56px] rounded-full bg-[rgba(255,86,48,0.12)] flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] text-[#1c252e] text-center leading-[24px]">
              確定要刪除這張發票嗎？
            </p>
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] text-center leading-[22px]">
              刪除後該筆資料將被移除，您可以重新開立發票。
            </p>
            <div className="flex items-center gap-[12px] w-full justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-[40px] px-[24px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteInvoice}
                className="h-[40px] px-[24px] rounded-[8px] bg-[#ff5630] hover:bg-[#b71d18] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-10.5l-5 5L6 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
