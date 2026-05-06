/**
 * InvoiceDetailPage — 開立發票明細頁
 *
 * 結構：
 *   上半：基本資訊（買方、發票總額、發票號碼、日期、聯式）
 *   下半：發票明細表格（驗收單號、料號、驗收量、單價可輸入、自動計算稅額小計）
 */

import { useState, useMemo } from 'react';
import { DeleteButton } from './ActionButtons';
import { DropdownSelect } from './DropdownSelect';
import { SimpleDatePicker } from './SimpleDatePicker';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import {
  type InvoiceDetailRow, type InvoiceDetailPageProps,
  TAX_RATE_OPTIONS, INVOICE_TYPE_OPTIONS,
  toInvoiceDetailRows, recalcRow,
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
  const [buyerName] = useState('巨大機械工業股份有限公司幼獅分公司(29183302)');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceType, setInvoiceType] = useState('21');

  // ── 稅率 ──
  const [taxRateValue, setTaxRateValue] = useState('');
  const taxRate = taxRateValue === 'free' ? 0 : (parseFloat(taxRateValue) || 0);

  // ── 單價=驗收價 checkbox ──
  const [priceEqualsAccept, setPriceEqualsAccept] = useState(false);

  // ── 明細列 ──
  const [rows, setRows] = useState<InvoiceDetailRow[]>(() => toInvoiceDetailRows(selectedRows));

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
    setTaxRateValue(val);
    const rate = val === 'free' ? 0 : (parseFloat(val) || 0);
    setRows(prev => prev.map(r => recalcRow(r, rate)));
  };

  // ── 單價=驗收價 ──
  const handlePriceEqualsAccept = () => {
    const next = !priceEqualsAccept;
    setPriceEqualsAccept(next);
    if (next) {
      setRows(prev => prev.map(r => recalcRow({ ...r, unitPrice: String(r.acceptPrice) }, taxRate)));
    }
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
    { label: '驗收項次', w: 80,  align: 'center' as const },
    { label: '訂單號碼', w: 150, align: 'left' as const },
    { label: '料號',     w: 150, align: 'left' as const },
    { label: '驗收量',   w: 80,  align: 'right' as const },
    { label: '驗收價',   w: 90,  align: 'right' as const },
    { label: '單價',     w: 90,  align: 'right' as const, orange: true },
    { label: '單項稅額', w: 90,  align: 'right' as const, orange: true },
    { label: '未稅小計', w: 100, align: 'right' as const },
    { label: '含稅小計', w: 100, align: 'right' as const },
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
            <button onClick={handleConfirm}
              className="h-[36px] bg-[#005eb8] hover:bg-[#004a94] text-white rounded-[8px] px-[20px] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] transition-colors whitespace-nowrap">
              確認開立
            </button>
          </div>
        </div>

        {/* 表單：Row 1 — 買方 + 發票總額 */}
        <div className="border border-[rgba(145,158,171,0.2)] rounded-[8px] mb-[16px]">
          <div className="flex border-b border-[rgba(145,158,171,0.12)]">
            <div className="flex-[6] px-[16px] py-[14px] border-r border-[rgba(145,158,171,0.12)]">
              <p className="text-[12px] font-semibold text-[#637381] mb-[4px]">
                <span className="text-[#ff5630] mr-[2px]">*</span>買方
              </p>
              <p className="text-[15px] text-[#1c252e] font-['Public_Sans:Regular',sans-serif]">{buyerName}</p>
            </div>
            <div className="flex-[4] px-[16px] py-[14px]">
              <p className="text-[12px] font-semibold text-[#637381] mb-[4px]">發票總額</p>
              <p className="text-[20px] font-semibold text-[#005eb8] font-['Public_Sans:SemiBold',sans-serif]">
                {totals.inTax > 0 ? `NT$ ${totals.inTax.toLocaleString()}` : '—'}
              </p>
            </div>
          </div>

          {/* Row 2 — 發票號碼 + 日期 + 聯式 */}
          <div className="flex gap-[16px] px-[16px] py-[14px]">
            <div className="flex-1 min-w-0">
              <FloatingInput label="發票號碼" value={invoiceNo} onChange={setInvoiceNo}
                required hasError={submitted && !invoiceNo.trim()} />
            </div>
            <div className="flex-1 min-w-0">
              <FloatingDateField label="發票日期" value={invoiceDate} onChange={setInvoiceDate}
                required hasError={submitted && !invoiceDate} />
            </div>
            <div className="flex-1 min-w-0">
              <DropdownSelect label="發票聯式" value={invoiceType} onChange={setInvoiceType}
                options={INVOICE_TYPE_OPTIONS} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 下半：發票明細 ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[24px] py-[20px]">

        {/* Toolbar：TAG + 標題 + 操作 */}
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-[12px]">
            {/* 保稅|幣別 TAG */}
            <div
              className="h-[48px] min-w-[48px] relative rounded-[8px] shrink-0"
              style={{ backgroundColor: '#d9e8f5' }}
            >
              <div
                aria-hidden="true"
                className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]"
                style={{ borderColor: '#a3c4e0' }}
              />
              <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                <div className="flex items-center justify-center min-w-[inherit] px-[14px]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[15px] text-center whitespace-nowrap text-[#005eb8]">
                    {bondedType} | {currency}
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
            </div>

          {/* 右側操作 */}
          <div className="flex items-center gap-[12px]">
            <label className="flex items-center gap-[6px] cursor-pointer select-none">
              <input type="checkbox" checked={priceEqualsAccept} onChange={handlePriceEqualsAccept}
                className="w-[16px] h-[16px] accent-[#005eb8]" />
              <span className="text-[13px] text-[#637381] font-['Public_Sans:Regular',sans-serif] whitespace-nowrap">單價=驗收價</span>
            </label>
            <div className="min-w-[140px]">
              <DropdownSelect label="" value={taxRateValue} onChange={handleTaxRateChange}
                options={TAX_RATE_OPTIONS} placeholder="請選稅額" searchable={false} />
            </div>
          </div>
        </div>

        {/* 表格卡片 */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_4px_8px_-2px_rgba(145,158,171,0.12)]">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div style={{ minWidth: `${totalWidth}px` }}>

              {/* 表頭 */}
              <div className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.16)] bg-[rgba(145,158,171,0.04)]">
                {TABLE_COLS.map((col, i) => (
                  <div key={i} style={{ width: col.w, minWidth: col.w, flex: `0 0 ${col.w}px` }}
                    className={`${i === 0 ? 'pl-[16px] pr-[8px]' : 'px-[8px]'} font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] leading-[20px] ${
                      (col as any).orange ? 'text-[#ff6b00]' :
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
                  className={`flex items-center py-[12px] border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${idx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''}`}>
                  {/* # */}
                  <div style={{ width: 50, minWidth: 50 }} className="pl-[16px] pr-[8px] shrink-0 text-center">
                    <span className="text-[13px] text-[#637381]">{idx + 1}</span>
                  </div>
                  {/* 驗收單號 */}
                  <div style={{ width: 130, minWidth: 130 }} className="px-[8px] shrink-0">
                    <span className="text-[13px] text-[#637381] truncate block">{row.acceptNo}</span>
                  </div>
                  {/* 驗收項次 */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] shrink-0 text-center">
                    <span className="text-[13px] text-[#637381]">{row.acceptSeq}</span>
                  </div>
                  {/* 訂單號碼 */}
                  <div style={{ width: 150, minWidth: 150 }} className="px-[8px] shrink-0">
                    <span className="text-[13px] text-[#637381] truncate block">{row.orderNo}</span>
                  </div>
                  {/* 料號 */}
                  <div style={{ width: 150, minWidth: 150 }} className="px-[8px] shrink-0">
                    <span className="text-[13px] text-[#637381] truncate block">{row.materialNo}</span>
                  </div>
                  {/* 驗收量 */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] shrink-0 text-right">
                    <span className="text-[13px] text-[#1c252e]">{row.acceptQty}</span>
                  </div>
                  {/* 驗收價 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0 text-right">
                    <span className="text-[13px] text-[#1c252e]">{row.acceptPrice}</span>
                  </div>
                  {/* 單價（可輸入） */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                    <input type="text" inputMode="decimal" value={row.unitPrice}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = raw.split('.'); const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;
                        updateUnitPrice(row.id, sanitized);
                      }}
                      className="w-full h-[32px] px-[6px] border border-[rgba(255,107,0,0.4)] rounded-[6px] text-[13px] text-[#1c252e] outline-none focus:border-[#ff6b00] bg-white text-right transition-colors"
                    />
                  </div>
                  {/* 單項稅額 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0 text-right">
                    <span className="text-[13px] text-[#1c252e]">{row.itemTax.toLocaleString()}</span>
                  </div>
                  {/* 未稅小計 */}
                  <div style={{ width: 100, minWidth: 100 }} className="px-[8px] shrink-0 text-right">
                    <span className="text-[13px] text-[#1c252e]">{row.subtotalExTax.toLocaleString()}</span>
                  </div>
                  {/* 含稅小計 */}
                  <div style={{ width: 100, minWidth: 100 }} className="px-[8px] shrink-0 text-right">
                    <span className="text-[13px] text-[#1c252e] font-semibold">{row.subtotalInTax.toLocaleString()}</span>
                  </div>
                  {/* 品名 */}
                  <div style={{ width: 200, minWidth: 200 }} className="px-[8px] shrink-0">
                    <span className="text-[13px] text-[#637381] truncate block">{row.productName}</span>
                  </div>
                  {/* 刪除 */}
                  <div style={{ width: 50, minWidth: 50 }} className="px-[4px] shrink-0 flex justify-center">
                    <DeleteButton onClick={() => deleteRow(row.id)} />
                  </div>
                </div>
              ))}

              {/* 合計列 */}
              {rows.length > 0 && (
                <div className="flex items-center py-[12px] bg-[rgba(145,158,171,0.04)] border-t border-[rgba(145,158,171,0.16)]">
                  <div style={{ width: 50 + 130 + 80 + 150 + 150 + 80 + 90 + 90 }} className="shrink-0" />
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] text-right shrink-0">
                    <span className="text-[13px] text-[#637381] font-semibold">合計</span>
                  </div>
                  <div style={{ width: 100, minWidth: 100 }} className="px-[8px] text-right shrink-0">
                    <span className="text-[13px] text-[#1c252e] font-semibold">{totals.exTax.toLocaleString()}</span>
                  </div>
                  <div style={{ width: 100, minWidth: 100 }} className="px-[8px] text-right shrink-0">
                    <span className="text-[13px] text-[#005eb8] font-semibold">{totals.inTax.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
