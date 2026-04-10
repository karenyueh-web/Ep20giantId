/**
 * ShipmentDetailPage — 開立出貨單明細
 *
 * 接收 ShipmentCreatePage 傳入的已選訂單，顯示：
 *   1. 基本資訊（廠商出貨單號、幣別、運輸型態、發票日期、交貨日期、到貨日期、交貨地址）
 *   2. 出貨明細表格（可編輯出貨量、每箱數量、總箱數自動計算、淨重/毛重、原產國家）
 */

import { useState, useRef, useEffect } from 'react';
import { DeleteButton } from './ActionButtons';
import { DropdownSelect } from './DropdownSelect';
import { SimpleDatePicker } from './SimpleDatePicker';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import type { OrderRow } from './AdvancedOrderTable';

// ── 選項定義 ─────────────────────────────────────────────────────────────────
const CURRENCY_OPTIONS = [
  { value: 'TWD', label: 'TWD' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'JPY', label: 'JPY' },
  { value: 'RMB', label: 'RMB' },
];

const TRANSPORT_OPTIONS = [
  { value: 'S', label: 'S 海運' },
  { value: 'A', label: 'A 空運' },
  { value: 'T', label: 'T 陸運' },
  { value: 'R', label: 'R 鐵路' },
];

const COUNTRY_OPTIONS = [
  { value: 'TW', label: 'TW' },
  { value: 'CN', label: 'CN' },
  { value: 'VN', label: 'VN' },
  { value: 'TH', label: 'TH' },
  { value: 'IN', label: 'IN' },
  { value: 'DE', label: 'DE' },
  { value: 'US', label: 'US' },
];

const WEIGHT_UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
  { value: 'g',  label: 'g'  },
];

// ── 型別定義 ─────────────────────────────────────────────────────────────────
export interface ShipmentDetailRow {
  id: number;
  itemNo: number;
  orderNo: string;
  orderSeq: string;
  materialNo: string;
  orderPendingQty: number;
  shipQty: number;
  qtyPerBox: string;
  totalBoxes: number;
  totalBoxesOverridden: boolean; // 使用者是否手動調整了總箱數
  netWeight: string;
  grossWeight: string;
  weightUnit: string;
  countryOfOrigin: string;
}

export interface ShipmentDetailPageProps {
  selectedOrders: OrderRow[];
  onClose: () => void;
  userRole?: string;
}

// ── FloatingInput（與 ShippingBasicSettingsPage 一致：label 壓在 border 上） ──
function FloatingInput({
  label, value, onChange, placeholder, required, noResize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  noResize?: boolean;
}) {
  const borderColor = 'rgba(145,158,171,0.2)';
  const handleFocus = (el: HTMLElement) => {
    const b = el.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
    if (b) { b.style.borderColor = '#1890FF'; b.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.15)'; }
  };
  const handleBlur = (el: HTMLElement) => {
    const b = el.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
    if (b) { b.style.borderColor = borderColor; b.style.boxShadow = 'none'; }
  };
  const labelNode = (
    <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
      <p className="relative shrink-0 leading-[12px]" style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>
        {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
        {label}
      </p>
    </div>
  );
  if (noResize) {
    // 單行：使用 input，精確 h-[54px] 與 DropdownSelect 齊平
    return (
      <div className="relative w-full h-[54px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor }} />
        {labelNode}
        <input
          type="text"
          className="w-full h-full rounded-[8px] px-[14px] pt-[14px] pb-[8px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? ''}
          onFocus={e => handleFocus(e.currentTarget)}
          onBlur={e => handleBlur(e.currentTarget)}
        />
      </div>
    );
  }
  // 多行：使用 textarea，可垂直拖拉
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor }} />
      {labelNode}
      <textarea
        className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
        style={{ resize: 'vertical', minHeight: '54px', color: '#1c252e' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        rows={1}
        onFocus={e => handleFocus(e.currentTarget)}
        onBlur={e => handleBlur(e.currentTarget)}
      />
    </div>
  );
}


// ── FloatingDateField（浮動 label + 日期選擇器） ─────────────────────────────
function FloatingDateField({
  label, value, onChange, required, placeholder = '選擇日期',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const borderColor = 'rgba(145,158,171,0.2)';

  return (
    <div className="relative w-full" ref={ref} style={{ minHeight: '54px' }}>
      {/* border overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid transition-colors"
        style={{ borderColor }}
      />
      {/* label 壓在 border 上，required 則前置紅色 * */}
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative shrink-0 leading-[12px]" style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>
          {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
          {label}
        </p>
      </div>
      {/* trigger row */}
      <div
        className="flex items-center gap-[8px] h-full min-h-[54px] px-[14px] pt-[14px] pb-[8px] cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`font-['Public_Sans:Regular',sans-serif] text-[14px] flex-1 min-w-0 truncate ${value ? 'text-[#1c252e]' : 'text-[#c4cdd6]'}`}>
          {value || placeholder}
        </span>
      </div>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-[60]">
          <SimpleDatePicker
            selectedDate={value}
            onDateSelect={d => { onChange(d); setOpen(false); }}
          />
        </div>
      )}
    </div>
  );
}

// ── InlineNumberInput 子元件（出貨明細 table 用）─────────────────────────────
function InlineNumberInput({
  value,
  onChange,
  min = 0,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      onChange={e => onChange(e.target.value)}
      className="w-full h-[32px] px-[8px] border border-[rgba(145,158,171,0.32)] rounded-[6px] font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] outline-none focus:border-[#005eb8] transition-colors bg-white text-right"
    />
  );
}

// ── 主元件 ───────────────────────────────────────────────────────────────────
export function ShipmentDetailPage({ selectedOrders, onClose, userRole }: ShipmentDetailPageProps) {
  // ── 基本資訊 ──────────────────────────────────────────────────────────────
  const [vendorShipmentNo, setVendorShipmentNo] = useState('');
  const [currency, setCurrency]         = useState('TWD');
  const [transportType, setTransportType] = useState('S');
  const [invoiceDate, setInvoiceDate]   = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [arrivalDate, setArrivalDate]   = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // ── 出貨明細 rows（由已選訂單初始化）─────────────────────────────────────
  const [rows, setRows] = useState<ShipmentDetailRow[]>(() =>
    selectedOrders.map((o, idx) => ({
      id: o.id,
      itemNo: (idx + 1) * 10,
      orderNo: o.orderNo || '',
      orderSeq: o.orderSeq || '',
      materialNo: o.materialNo || '',
      orderPendingQty: o.undeliveredQty ?? 0,
      shipQty: o.undeliveredQty ?? 0,
      qtyPerBox: '',
      totalBoxes: 0,
      totalBoxesOverridden: false,
      netWeight: '0',
      grossWeight: '0',
      weightUnit: 'kg',
      countryOfOrigin: 'TW',
    }))
  );

  // ── 總箱數是否被用戶覆蓋的追蹤 ─────────────────────────────────────────
  // 點擊總箱數後可以直接編輯
  const [editingTotalBoxesId, setEditingTotalBoxesId] = useState<number | null>(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 更新 row 欄位 ────────────────────────────────────────────────────────
  const updateRow = (id: number, patch: Partial<ShipmentDetailRow>) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...patch };
      // 自動計算總箱數（除非用戶已手動覆蓋）
      if (('shipQty' in patch || 'qtyPerBox' in patch) && !updated.totalBoxesOverridden) {
        const perBox = parseFloat(updated.qtyPerBox) || 0;
        updated.totalBoxes = perBox > 0 ? Math.ceil(updated.shipQty / perBox) : 0;
      }
      return updated;
    }));
  };

  // ── 刪除明細列 ─────────────────────────────────────────────────────────
  const deleteRow = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // ── 確認出貨 ─────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!vendorShipmentNo.trim()) { showToast('請填寫廠商出貨單號'); return; }
    if (!deliveryDate)            { showToast('請選擇交貨日期');     return; }
    if (rows.length === 0)        { showToast('出貨明細不可為空');   return; }
    showToast(`出貨單 ${vendorShipmentNo} 已確認出貨（${rows.length} 筆明細）`);
  };

  // ── 歷程 panel（stub）────────────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 上半：白色區 — 導覽列 + 基本資訊表單 ─────────────────────────── */}
      <div className="shrink-0 px-[24px] pt-[16px] pb-[20px] border-b border-[rgba(145,158,171,0.12)]">

        {/* 標題列：← + 基本資訊 | 確認出貨 | 暫存 | 歷程 */}
        <div className="flex items-center justify-between mb-[20px]">
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
            <div onClick={onClose} className="overflow-clip relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity" aria-label="返回">
              <IconsSolidIcSolarMultipleForwardLeftBroken />
            </div>
            <div className="h-[48px] min-h-[48px] relative shrink-0">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              <div className="flex flex-row items-center justify-center min-h-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-h-[inherit] relative px-[4px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] whitespace-nowrap">基本資訊</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <button
              onClick={handleConfirm}
              className="h-[36px] bg-[#1c252e] hover:bg-[#374151] text-white rounded-[8px] px-[20px] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] transition-colors whitespace-nowrap"
            >
              確認出貨
            </button>
            <button
              className="h-[36px] border border-[rgba(145,158,171,0.32)] rounded-[8px] px-[16px] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors whitespace-nowrap"
            >
              暫存
            </button>
            <button
              onClick={() => setShowHistory(v => !v)}
              className="h-[36px] text-[#005eb8] hover:text-[#004a94] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] transition-colors"
            >
              歷程
            </button>
          </div>
        </div>

        {/* Row 1：廠商出貨單號 | 幣別 | 運輸型態 | 發票日期 | 交貨日期 | 到貨日期 */}
        <div className="flex gap-[16px] flex-wrap mb-[16px]">
          <div style={{ flex: '1 1 160px', maxWidth: '200px' }}>
            <FloatingInput
              label="廠商出貨單號"
              value={vendorShipmentNo}
              onChange={setVendorShipmentNo}
              required
              noResize
            />
          </div>
          <div style={{ flex: '1 1 120px', maxWidth: '160px' }}>
            <DropdownSelect
              label="幣別"
              value={currency}
              onChange={setCurrency}
              options={CURRENCY_OPTIONS}
            />
          </div>
          <div style={{ flex: '1 1 140px', maxWidth: '180px' }}>
            <DropdownSelect
              label="運輸型態"
              value={transportType}
              onChange={setTransportType}
              options={TRANSPORT_OPTIONS}
            />
          </div>
          <div style={{ flex: '1 1 140px', maxWidth: '180px' }}>
            <FloatingDateField
              label="發票日期"
              value={invoiceDate}
              onChange={setInvoiceDate}
            />
          </div>
          <div style={{ flex: '1 1 140px', maxWidth: '180px' }}>
            <FloatingDateField
              label="交貨日期"
              value={deliveryDate}
              onChange={setDeliveryDate}
              required
            />
          </div>
          <div style={{ flex: '1 1 140px', maxWidth: '180px' }}>
            <FloatingDateField
              label="到貨日期"
              value={arrivalDate}
              onChange={setArrivalDate}
            />
          </div>
        </div>

        {/* Row 2：交貨地址（全寬） */}
        <FloatingInput
          label="交貨地址"
          value={deliveryAddress}
          onChange={setDeliveryAddress}
          placeholder="帶出地址後尚可更改"
        />
      </div>

      {/* ── 下半：灰色區 — 出貨明細（table 用白底卡片） ────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[24px] py-[20px]">

        {/* 標題 + 說明 */}
        <div className="flex items-center gap-[16px] mb-[12px]">
          <div className="content-stretch flex gap-[17px] items-center relative shrink-0">
            <div className="h-[48px] min-h-[48px] relative shrink-0">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              <div className="flex flex-row items-center justify-center min-h-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-h-[inherit] relative px-[4px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] whitespace-nowrap">出貨明細</p>
                </div>
              </div>
            </div>
          </div>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#FF5630] leading-[18px]">
            * 系統會自動計算出貨總箱數，您依然可點擊總箱數進行調整
          </p>
        </div>

        {/* 白底 table 卡片 */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_4px_8px_-2px_rgba(145,158,171,0.12)]">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div style={{ minWidth: '1040px' }}>

              {/* Table header */}
              <div className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.16)] bg-[rgba(145,158,171,0.04)]">
                {[
                  { label: '出貨項次', w: 72, align: 'left' },
                  { label: '單號序號', w: 130, align: 'left' },
                  { label: '料號', w: 140, align: 'left' },
                  { label: '訂單待交', w: 80, align: 'right' },
                  { label: '出貨量', w: 80, align: 'right', blue: true },
                  { label: '每箱數量', w: 90, align: 'right' },
                  { label: '總箱數', w: 80, align: 'right', blue: true },
                  { label: '淨重(個)', w: 90, align: 'right' },
                  { label: '毛重(個)', w: 90, align: 'right' },
                  { label: '重量單位', w: 80, align: 'center' },
                  { label: '原產國家', w: 90, align: 'center' },
                  { label: '', w: 44, align: 'center' },
                ].map((col, i) => (
                  <div
                    key={i}
                    style={{ width: col.w, minWidth: col.w, flex: `0 0 ${col.w}px` }}
                    className={`px-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] leading-[18px] ${
                      (col as any).blue ? 'text-[#005eb8]' :
                      col.align === 'right' ? 'text-right text-[#637381]' :
                      col.align === 'center' ? 'text-center text-[#637381]' :
                      'text-[#637381]'
                    }`}
                  >
                    {col.label}
                  </div>
                ))}
              </div>

              {/* Table rows */}
              {rows.length === 0 && (
                <div className="flex items-center justify-center h-[80px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
                    目前沒有出貨明細
                  </p>
                </div>
              )}

              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className={`flex items-center py-[12px] border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${idx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''}`}
                >
                  {/* 出貨項次 */}
                  <div style={{ width: 72, minWidth: 72 }} className="px-[8px] shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
                      {row.itemNo}
                    </span>
                  </div>

                  {/* 單號序號 */}
                  <div style={{ width: 130, minWidth: 130 }} className="px-[8px] shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
                      {row.orderNo}{row.orderSeq}
                    </span>
                  </div>

                  {/* 料號 */}
                  <div style={{ width: 140, minWidth: 140 }} className="px-[8px] shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] truncate block">
                      {row.materialNo}
                    </span>
                  </div>

                  {/* 訂單待交（唯讀） */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
                      {row.orderPendingQty}
                    </span>
                  </div>

                  {/* 出貨量（藍字，可編輯） */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] shrink-0">
                    <div className="flex justify-end">
                      <input
                        type="number"
                        value={row.shipQty}
                        min={0}
                        max={row.orderPendingQty}
                        onChange={e => updateRow(row.id, { shipQty: Number(e.target.value) })}
                        className="w-[60px] h-[32px] px-[6px] border border-[rgba(0,94,184,0.32)] rounded-[6px] font-['Public_Sans:SemiBold',sans-serif] text-[13px] text-[#005eb8] outline-none focus:border-[#005eb8] transition-colors bg-white text-right"
                      />
                    </div>
                  </div>

                  {/* 每箱數量（輸入） */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                    <InlineNumberInput
                      value={row.qtyPerBox}
                      onChange={v => updateRow(row.id, { qtyPerBox: v })}
                    />
                  </div>

                  {/* 總箱數（自動計算，可點擊覆蓋） */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] text-right shrink-0">
                    {editingTotalBoxesId === row.id ? (
                      <div className="flex justify-end">
                        <input
                          type="number"
                          value={row.totalBoxes}
                          min={0}
                          autoFocus
                          onChange={e => updateRow(row.id, {
                            totalBoxes: Number(e.target.value),
                            totalBoxesOverridden: true,
                          })}
                          onBlur={() => setEditingTotalBoxesId(null)}
                          onKeyDown={e => { if (e.key === 'Enter') setEditingTotalBoxesId(null); }}
                          className="w-[60px] h-[32px] px-[6px] border border-[#005eb8] rounded-[6px] font-['Public_Sans:SemiBold',sans-serif] text-[13px] text-[#005eb8] outline-none bg-white text-right"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingTotalBoxesId(row.id)}
                        className="font-['Public_Sans:SemiBold',sans-serif] text-[13px] text-[#005eb8] hover:underline cursor-pointer"
                        title="點擊可手動調整總箱數"
                      >
                        {row.totalBoxes}
                      </button>
                    )}
                  </div>

                  {/* 淨重(個) */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                    <InlineNumberInput
                      value={row.netWeight}
                      onChange={v => updateRow(row.id, { netWeight: v })}
                    />
                  </div>

                  {/* 毛重(個) */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                    <InlineNumberInput
                      value={row.grossWeight}
                      onChange={v => updateRow(row.id, { grossWeight: v })}
                    />
                  </div>

                  {/* 重量單位 */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[4px] shrink-0">
                    <select
                      value={row.weightUnit}
                      onChange={e => updateRow(row.id, { weightUnit: e.target.value })}
                      className="w-full h-[32px] px-[4px] border border-[rgba(145,158,171,0.32)] rounded-[6px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e] outline-none focus:border-[#1c252e] bg-white cursor-pointer"
                    >
                      {WEIGHT_UNIT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* 原產國家 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[4px] shrink-0">
                    <select
                      value={row.countryOfOrigin}
                      onChange={e => updateRow(row.id, { countryOfOrigin: e.target.value })}
                      className="w-full h-[32px] px-[4px] border border-[rgba(145,158,171,0.32)] rounded-[6px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e] outline-none focus:border-[#1c252e] bg-white cursor-pointer"
                    >
                      {COUNTRY_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* 刪除 */}
                  <div style={{ width: 44, minWidth: 44 }} className="px-[4px] flex justify-center shrink-0">
                    <DeleteButton onClick={() => deleteRow(row.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
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
