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
export function InvoiceDetailPage({ selectedRows, onClose, bondedType, currency }: InvoiceDetailPageProps) {

  // ── 基本資訊 state ──
  const [buyerName] = useState(() => resolveBuyer(selectedRows[0]?.plantCode ?? ''));
  const isOverseas   = isOverseasBuyer(selectedRows[0]?.plantCode ?? '');

  const [invoiceNo,   setInvoiceNo]   = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  // 台灣買方：發票聯式（預設 21）
  const [invoiceType, setInvoiceType] = useState('21');
  // 海外買方：VAT 稅碼（預設 0%）
  const [taxCode,     setTaxCode]     = useState('0');

  // ── 稅率 ──
  // 台灣保稅驗證：稅率鎖定 0％
  const isTaiwanBonded = !isOverseas && bondedType === '保稅';
  const [taxRateValue, setTaxRateValue] = useState(() => isTaiwanBonded ? '0' : '5');
  const taxRate = parseFloat(taxRateValue) / 100 || 0;

  // ── 品名 tooltip hover state ──
  const [hoveredProductRowId, setHoveredProductRowId] = useState<number | null>(null);
  // ── 金額欄 tooltip hover state（rowId + 欄名） ──
  const [hoveredAmountCell, setHoveredAmountCell] = useState<{ id: number; col: 'tax' | 'exTax' | 'inTax' } | null>(null);

  // ── 明細列（單價預設 = 驗收價）──
  const [rows, setRows] = useState<InvoiceDetailRow[]>(() => toInvoiceDetailRows(selectedRows, taxRate));

  // ── 更新單價 ──
  const updateUnitPrice = (id: number, val: string) => {
    setRows(prev => prev.map(r => r.id === id ? recalcRow({ ...r, unitPrice: val }, taxRate) : r));
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

  // ── 新增明細 Dialog state ──
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dialogOrderNo,  setDialogOrderNo]  = useState('');
  const [dialogOrderSeq, setDialogOrderSeq] = useState('');
  const [dialogMaterial, setDialogMaterial] = useState('');
  const [dialogSelected, setDialogSelected] = useState<Set<number>>(new Set());
  const [dialogPage,         setDialogPage]         = useState(1);
  const [dialogItemsPerPage, setDialogItemsPerPage] = useState(100);

  // 來源候選資料：同廠商 + 同保稅類別 + 排除已加入的 id
  const existingIds = useMemo(() => new Set(rows.map(r => r.id)), [rows]);
  const vendorName  = selectedRows[0]?.vendorName ?? '';

  const candidateRows = useMemo(() => {
    return invoiceMockData.filter(r =>
      r.vendorName   === vendorName &&
      r.bondedType   === (selectedRows[0]?.bondedType ?? '') &&
      !existingIds.has(r.id)
    );
  }, [existingIds, vendorName, selectedRows]);

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

  // ── 確認出貨的提交驗證（placeholder）──
  const [submitted, setSubmitted] = useState(false);
  const handleConfirm = () => {
    setSubmitted(true);
    if (!invoiceNo.trim() || !invoiceDate) {
      showToast('請填寫必填欄位');
      return;
    }
    showToast('發票已確認開立');
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
          </div>
          <div className="flex items-center gap-[12px]">
            <button
              onClick={() => showToast('草稿已暫存')}
              className="h-[40px] w-[120px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
            >
              暫存
            </button>
            <button onClick={handleConfirm}
              className="h-[40px] w-[120px] bg-[#005eb8] hover:bg-[#004a94] text-white rounded-[8px] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] transition-colors whitespace-nowrap">
              確認開立
            </button>
          </div>
        </div>

        {/* 表單：Row 1 — 買方 + 發票總額 */}
        <div className="flex gap-[16px] mb-[16px]">
          {/* 買方（唯讀，有必填星號） */}
          <div className="flex-[6] min-w-0">
            <FloatingInput label="買方" value={buyerName} onChange={() => {}} required disabled />
          </div>
          {/* 發票總額（唯讀，顯示計算值） */}
          <div className="flex-[4] min-w-0">
            <FloatingInput
              label="發票總額"
              value={totals.inTax > 0 ? totals.inTax.toLocaleString() : ''}
              onChange={() => {}}
              disabled
            />
          </div>
        </div>

        {/* 表單：Row 2 — 發票號碼 + 發票日期 + 稅率 + [發票聯式 | 稅碼] */}
        <div className="flex gap-[16px]">
          <div className="flex-1 min-w-0">
            <FloatingInput label="發票號碼" value={invoiceNo} onChange={setInvoiceNo}
              required hasError={submitted && !invoiceNo.trim()} />
          </div>
          <div className="flex-1 min-w-0">
            <FloatingDateField label="發票日期" value={invoiceDate} onChange={setInvoiceDate}
              required hasError={submitted && !invoiceDate} />
          </div>
          {/* 稅率（台灣保稅：鎖定 0%；其他：可選） */}
          <div className="flex-1 min-w-0">
            {isTaiwanBonded ? (
              <FloatingInput label="稅率" value="0%" onChange={() => {}} disabled />
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
          <div className="flex-1 min-w-0">
            {isOverseas ? (
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

        {/* Toolbar：TAG + 標題 + 操作 */}
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-[12px]">
            {/* 保稅|幣別 TAG */}
            {(() => {
              const isBonded = bondedType === '保稅';
              const bg     = isBonded ? '#d9e8f5' : '#ede7f6';
              const border = isBonded ? '#a3c4e0' : '#b39ddb';
              const text   = isBonded ? '#005eb8' : '#6c3fc5';
              return (
                <div
                  className="h-[48px] min-w-[48px] relative rounded-[8px] shrink-0"
                  style={{ backgroundColor: bg }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]"
                    style={{ borderColor: border }}
                  />
                  <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                    <div className="flex items-center justify-center min-w-[inherit] px-[14px]">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[15px] text-center whitespace-nowrap"
                        style={{ color: text }}>
                        {bondedType} | {currency}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
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

          {/* 右側：新增驗收資料按鈕 */}
          <button
            onClick={() => setAddDialogOpen(true)}
            title="新增驗收資料"
            className="w-[40px] h-[40px] rounded-full bg-[#1D7BF5] hover:bg-[#1262cc] flex items-center justify-center shrink-0 transition-colors shadow-[0px_4px_8px_rgba(29,123,245,0.32)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
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
                  {/* 訂單號碼 */}
                  <div style={{ width: 150, minWidth: 150 }} className="px-[8px] shrink-0">
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
                  {/* 單價（可輸入） */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                    <input type="text" inputMode="decimal" value={row.unitPrice}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = raw.split('.'); const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;
                        updateUnitPrice(row.id, sanitized);
                      }}
                      className="w-full h-[32px] px-[6px] border border-[rgba(0,94,184,0.4)] rounded-[6px] text-[14px] text-[#1c252e] outline-none focus:border-[#005eb8] focus:ring-2 focus:ring-[rgba(0,94,184,0.12)] bg-white text-left transition-colors"
                    />
                  </div>
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
                  {/* 刪除 */}
                  <div style={{ width: 50, minWidth: 50 }} className="px-[4px] shrink-0 flex justify-center">
                    <DeleteButton onClick={() => deleteRow(row.id)} />
                  </div>
                </div>
              ))}


            </div>
          </div>
        </div>
      </div>

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

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-10.5l-5 5L6 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
