/**
 * ShipmentDetailPage — 開立出貨單明細
 *
 * 接收 ShipmentCreatePage 傳入的已選訂單，顯示：
 *   1. 基本資訊（廠商出貨單號、幣別、運輸型態、發票日期、交貨日期、到貨日期、交貨地址）
 *   2. 出貨明細表格（可編輯出貨量、每箱數量、總箱數自動計算、淨重/毛重、原產國家）
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { DeleteButton } from './ActionButtons';
import { CurrencySelect } from './CurrencySelect';
import { CountrySelect } from './CountrySelect';
import { DropdownSelect } from './DropdownSelect';
import { SimpleDatePicker } from './SimpleDatePicker';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import type { OrderRow } from './AdvancedOrderTable';
import { calcUndeliveredQty } from './AdvancedOrderTable';
import { STORAGE_LOCATION_DATA } from './ShippingBasicSettingsPage';

// ── 選項定義 ─────────────────────────────────────────────────────────────────
// CURRENCY_OPTIONS 已移除，改用 CurrencySelect（帶搜尋的 SAP 幣別表）

const TRANSPORT_OPTIONS = [
  { value: 'S', label: 'S 海運' },
  { value: 'A', label: 'A 空運' },
  { value: 'T', label: 'T 陸運' },
];

// COUNTRY_OPTIONS 已移除，改用 CountrySelect（帶搜尋的國家代碼表）

const WEIGHT_UNIT_OPTIONS = [
  { value: 'G',   label: 'G' },
  { value: 'KG',  label: 'KG / KGM' },
  { value: 'EA',  label: 'EA / EAC' },
  { value: 'GL',  label: 'GL / GLI' },
];

// ── 型別定義 ─────────────────────────────────────────────────────────────────
// 單箱資料
export interface BoxItem {
  boxNo: number;
  qty: number;
}

export interface ShipmentDetailRow {
  id: number;
  itemNo: number;
  orderNo: string;
  orderSeq: string;
  materialNo: string;
  orderPendingQty: number;
  shipQty: number;
  qtyPerBox: string;       // 輸入值（原始）
  totalBoxes: number;
  boxes: BoxItem[];        // 箱數明細
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

// ── 箱數工具函式 ─────────────────────────────────────────────────────────────
/** 根據出貨量和每箱數量產生初始箱數明細 */
function initBoxes(shipQty: number, qtyPerBox: number): BoxItem[] {
  if (shipQty <= 0 || qtyPerBox <= 0) return [];
  const n = Math.ceil(shipQty / qtyPerBox);
  const items: BoxItem[] = [];
  for (let i = 0; i < n; i++) {
    const qty = i < n - 1 ? qtyPerBox : shipQty - qtyPerBox * (n - 1);
    items.push({ boxNo: i + 1, qty });
  }
  return items;
}

/** 刪除某箱後，將其數量補回最後一箱；並重新排號 */
function deleteBoxItem(boxes: BoxItem[], idx: number): BoxItem[] {
  const removed = boxes[idx];
  const rest = boxes.filter((_, i) => i !== idx);
  if (rest.length > 0) rest[rest.length - 1] = { ...rest[rest.length - 1], qty: rest[rest.length - 1].qty + removed.qty };
  return rest.map((b, i) => ({ ...b, boxNo: i + 1 }));
}

/** 根據 boxes 計算「每箱數量」顯示標籤 */
function calcQtyPerBoxLabel(boxes: BoxItem[]): string {
  if (boxes.length === 0) return '';
  const qtys = boxes.map(b => b.qty);
  const min = Math.min(...qtys);
  const allSame = qtys.every(q => q === min);
  return allSame ? String(min) : `${min}+`;
}

// ── FloatingInput（與 ShippingBasicSettingsPage 一致：label 壓在 border 上） ──
function FloatingInput({
  label, value, onChange, placeholder, required, noResize, hasError,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  noResize?: boolean;
  hasError?: boolean;
}) {
  const defaultBorder = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const handleFocus = (el: HTMLElement) => {
    const b = el.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
    if (b) { b.style.borderColor = hasError ? '#ff5630' : '#1890FF'; b.style.boxShadow = hasError ? '0 0 0 2px rgba(255,86,48,0.12)' : '0 0 0 2px rgba(24,144,255,0.15)'; }
  };
  const handleBlur = (el: HTMLElement) => {
    const b = el.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
    if (b) { b.style.borderColor = defaultBorder; b.style.boxShadow = 'none'; }
  };
  const labelNode = (
    <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
      <p className="relative shrink-0 leading-[12px]" style={{ fontSize: '12px', fontWeight: 600, color: hasError ? '#ff5630' : '#637381' }}>
        {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
        {label}
      </p>
    </div>
  );
  if (noResize) {
    return (
      <div className="relative w-full h-[54px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor: defaultBorder }} />
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
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor: defaultBorder }} />
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
  label, value, onChange, required, placeholder = '選擇日期', hasError,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCalendar = () => {
    if (ref.current) {
      const CALENDAR_W = 280;
      const r = ref.current.getBoundingClientRect();
      const top = r.bottom + 4;
      const left = r.left + CALENDAR_W > window.innerWidth - 8
        ? r.right - CALENDAR_W
        : r.left;
      setPos({ top, left });
    }
    setOpen(v => !v);
  };

  const borderColor = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';

  return (
    <div className="relative w-full" ref={ref} style={{ minHeight: '54px' }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid transition-colors"
        style={{ borderColor }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative shrink-0 leading-[12px]" style={{ fontSize: '12px', fontWeight: 600, color: hasError ? '#ff5630' : '#637381' }}>
          {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
          {label}
        </p>
      </div>
      <div
        className="flex items-center gap-[8px] h-full min-h-[54px] px-[14px] pt-[14px] pb-[8px] cursor-pointer select-none"
        onClick={openCalendar}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hasError ? '#ff5630' : '#637381'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`font-['Public_Sans:Regular',sans-serif] text-[14px] flex-1 min-w-0 truncate ${value ? 'text-[#1c252e]' : hasError ? 'text-[#ff5630]' : 'text-[#c4cdd6]'}`}>
          {value || placeholder}
        </span>
      </div>
      {open && (
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}>
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

// ── TableSelect（表格列中自定義下拉，使用 fixed 定位解決 overflow 截切問題）─────────────
function TableSelect({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openDropdown = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const selected = options.find(o => o.value === value);
  return (
    <div className="relative w-full">
      <button
        ref={btnRef}
        type="button"
        onClick={() => open ? setOpen(false) : openDropdown()}
        className="w-full h-[32px] px-[6px] border border-[rgba(145,158,171,0.32)] rounded-[6px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e] outline-none hover:border-[#1c252e] focus:border-[#1c252e] bg-white cursor-pointer transition-colors flex items-center justify-between gap-[2px]"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M6 9l6 6 6-6" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div
          ref={panelRef}
          className="bg-white border border-[rgba(145,158,171,0.2)] rounded-[8px] shadow-lg py-[4px]"
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 120), zIndex: 9999 }}
        >
          {options.map(o => (
            <div
              key={o.value}
              className={`px-[10px] py-[7px] cursor-pointer text-[12px] font-['Public_Sans:Regular',sans-serif] transition-colors flex items-center justify-between ${
                o.value === value
                  ? 'bg-[rgba(28,37,46,0.06)] text-[#1c252e] font-semibold'
                  : 'text-[#1c252e] hover:bg-[rgba(145,158,171,0.06)]'
              }`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span>{o.label}</span>
              {o.value === value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6 9 17l-5-5" stroke="#1c252e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 主元件 ───────────────────────────────────────────────────────────────────
export function ShipmentDetailPage({ selectedOrders, onClose, userRole }: ShipmentDetailPageProps) {
  // ── 基本資訊 ──────────────────────────────────────────────────────────────
  const [vendorShipmentNo, setVendorShipmentNo] = useState('');
  const [currency, setCurrency]         = useState('TWD');
  const [transportType, setTransportType] = useState('S');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [arrivalDate, setArrivalDate]   = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(() => {
    // 依第一張訂單的儲存地點代號，從主檔查詢中文地址自動帶出
    const sloc = selectedOrders[0]?.storageLocationCode;
    if (!sloc) return '';
    const found = STORAGE_LOCATION_DATA.find(r => r.locationCode === sloc && r.addressZh);
    return found?.addressZh ?? '';
  });

  // ── 出貨明細 rows（由已選訂單初始化）─────────────────────────────────────
  const [rows, setRows] = useState<ShipmentDetailRow[]>(() =>
    selectedOrders.map((o, idx) => ({
      id: o.id,
      itemNo: (idx + 1) * 10,
      orderNo: o.orderNo || '',
      orderSeq: o.orderSeq || '',
      materialNo: o.materialNo || '',
      orderPendingQty: calcUndeliveredQty(
        o.orderQty ?? 0,
        o.acceptQty ?? 0,
        o.inTransitQty ?? 0,
      ),
      shipQty: o.undeliveredQty ?? 0,
      qtyPerBox: '',
      totalBoxes: 0,
      boxes: [],
      netWeight: '0',
      grossWeight: '0',
      weightUnit: 'KG',
      countryOfOrigin: '',
    }))
  );

  // ── 箱數明細彈窗 ──────────────────────────────────────────────────────────
  const [boxModalRowId, setBoxModalRowId] = useState<number | null>(null);
  const boxModalRow = rows.find(r => r.id === boxModalRowId) ?? null;



  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 更新 row 欄位 ────────────────────────────────────────────────────────
  // 列表有更新 → 箱數明細跟著覆蓋；箱數明細有更新 → 列表跟著覆蓋
  const updateRow = (id: number, patch: Partial<ShipmentDetailRow>) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...patch };
      // 當列表的 qtyPerBox 或 shipQty 變更 → 重新產生 boxes
      if ('shipQty' in patch || 'qtyPerBox' in patch) {
        const perBox = parseFloat(updated.qtyPerBox) || 0;
        if (perBox > 0 && updated.shipQty > 0) {
          updated.boxes = initBoxes(updated.shipQty, perBox);
          updated.totalBoxes = updated.boxes.length;
        } else {
          updated.boxes = [];
          updated.totalBoxes = 0;
        }
      }
      return updated;
    }));
  };

  // ── 箱數明細儲存（箱數明細有更新 → 列表的 qtyPerBox 跟著覆蓋）───────────
  const handleSaveBoxes = (rowId: number, newBoxes: BoxItem[]) => {
    const label = calcQtyPerBoxLabel(newBoxes);
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      return { ...r, boxes: newBoxes, totalBoxes: newBoxes.length, qtyPerBox: label };
    }));
    setBoxModalRowId(null);
    showToast('箱數明細已儲存');
  };

  // ── 刪除明細列 ─────────────────────────────────────────────────────────
  const deleteRow = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // ── 確認出貨（一次收集所有錯誤）────────────────────────────────────────
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => {
    const errors: string[] = [];

    // 基本資訊
    if (!vendorShipmentNo.trim()) errors.push('廠商出貨單號 為必填');
    if (!deliveryDate)            errors.push('交貨日期 為必填');
    if (rows.length === 0)        errors.push('出貨明細不可為空');

    // 明細逐筆檢查
    rows.forEach(r => {
      if (!r.shipQty || r.shipQty <= 0) {
        errors.push(`出貨項次 ${r.itemNo}（${r.materialNo}）：出貨量 必須大於 0`);
      }
      const v = parseFloat(r.qtyPerBox);
      if (!r.qtyPerBox || isNaN(v) || v <= 0) {
        errors.push(`出貨項次 ${r.itemNo}（${r.materialNo}）：每箱數量 必須大於 0`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    showToast(`出貨單 ${vendorShipmentNo} 已確認出貨（${rows.length} 筆明細）`);
  };

  // ── 歷程 panel（stub）────────────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);

  // ── 七天原則驗證（交貨日期選定時，逐筆比對廠商答交日）───────────────────
  const vendorDateWarnings = useMemo(() => {
    if (!deliveryDate) return [];
    const parseD = (s: string) => {
      const [y, m, d] = s.replace(/\//g, '-').split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    const selected = parseD(deliveryDate);
    const result: { itemNo: number; orderNo: string; orderSeq: string; materialNo: string; vendorDeliveryDate: string; earliestDate: string }[] = [];
    rows.forEach(row => {
      const order = selectedOrders.find(o => o.id === row.id);
      if (!order?.vendorDeliveryDate) return;
      const earliest = parseD(order.vendorDeliveryDate);
      earliest.setDate(earliest.getDate() - 7);
      if (selected < earliest) {
        result.push({
          itemNo: row.itemNo,
          orderNo: row.orderNo,
          orderSeq: row.orderSeq,
          materialNo: row.materialNo,
          vendorDeliveryDate: order.vendorDeliveryDate,
          earliestDate: formatDate(earliest),
        });
      }
    });
    return result;
  }, [deliveryDate, rows, selectedOrders]);

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
              disabled={vendorDateWarnings.length > 0}
              title={vendorDateWarnings.length > 0 ? '有出貨明細尚未符合七天原則，無法確認出貨' : undefined}
              className="h-[36px] bg-[#005eb8] hover:bg-[#004a94] disabled:bg-[#919eab] disabled:cursor-not-allowed text-white rounded-[8px] px-[20px] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] transition-colors whitespace-nowrap"
            >
              確認出貨
            </button>
            <p
              onClick={() => setShowHistory(v => !v)}
              className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              歷程
            </p>
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
              hasError={submitted && !vendorShipmentNo.trim()}
            />
          </div>
          <div style={{ flex: '1 1 280px', minWidth: '280px' }}>
            <CurrencySelect
              value={currency}
              onChange={setCurrency}
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
              label="交貨日期"
              value={deliveryDate}
              onChange={setDeliveryDate}
              required
              hasError={submitted && !deliveryDate}
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

        {/* 七天原則警告橫幅（交貨日期選定後若有不符規則的明細則顯示） */}
        {vendorDateWarnings.length > 0 && (
          <div className="mt-[12px] px-[14px] py-[10px] bg-[rgba(255,171,0,0.08)] border border-[rgba(255,171,0,0.4)] rounded-[8px] flex flex-col gap-[6px]">
            <div className="flex items-center gap-[6px]">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <path d="M10 2L2 17h16L10 2z" stroke="#B76E00" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M10 8v4M10 14.5h.01" stroke="#B76E00" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#B76E00]">
                以下明細的廠商答交日尚不符合七天原則，無法確認出貨：
              </span>
            </div>
            <ul className="flex flex-col gap-[4px] pl-[22px]">
              {vendorDateWarnings.map(w => (
                <li key={w.itemNo} className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#B76E00] leading-[18px]">
                  出貨項次 {w.itemNo}（{w.materialNo}）— 廠商答交日 {w.vendorDeliveryDate}，最早可出貨日為 {w.earliestDate}
                </li>
              ))}
            </ul>
          </div>
        )}
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
          <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#FF5630] leading-[20px]">
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
                  { label: '出貨項次', w: 72,  align: 'left' },
                  { label: '單號序號', w: 130, align: 'left' },
                  { label: '料號',     w: 140, align: 'left' },
                  { label: '訂單待交', w: 80,  align: 'right' },
                  { label: '*出貨量',  w: 80,  align: 'right', blue: true },
                  { label: '*每箱數量', w: 90,  align: 'right', blue: true },
                  { label: '總箱數',   w: 80,  align: 'center', blue: true },
                  { label: '淨重(個)', w: 90,  align: 'right', blue: true },
                  { label: '毛重(個)', w: 90,  align: 'right', blue: true },
                  { label: '重量單位', w: 100, align: 'center', blue: true },
                  { label: '原產國家', w: 110, align: 'center', blue: true },
                  { label: '',         w: 44,  align: 'center' },
                ].map((col, i) => (
                  <div
                    key={i}
                    style={{ width: col.w, minWidth: col.w, flex: `0 0 ${col.w}px` }}
                    className={`px-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] leading-[20px] ${
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

                  {/* 出貨量（可編輯） */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] shrink-0">
                    <div className="flex justify-end">
                      <input
                        type="number"
                        value={row.shipQty}
                        min={1}
                        max={row.orderPendingQty}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val <= 0) return;
                          if (row.orderPendingQty > 0 && val > row.orderPendingQty) return;
                          updateRow(row.id, { shipQty: val });
                        }}
                        className={`w-[60px] h-[32px] px-[6px] border rounded-[6px] font-['Public_Sans:Regular',sans-serif] text-[13px] outline-none transition-colors bg-white text-right ${
                          submitted && (!row.shipQty || row.shipQty <= 0)
                            ? 'border-[rgba(255,86,48,0.5)] text-[#ff5630] focus:border-[#ff5630]'
                            : 'border-[rgba(145,158,171,0.32)] text-[#1c252e] focus:border-[#1890FF]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 每砑數量：直接綁定 row.qtyPerBox，更新時自動同步 boxes */}
                  {(() => {
                    const perBox = parseFloat(row.qtyPerBox) || 0;
                    const hasPlus = row.qtyPerBox.includes('+');
                    const notDivisible = perBox > 0 && row.shipQty > 0 && row.shipQty % perBox !== 0;
                    // 紅框：有值但 <=0（即時顯示，不需要 submitted）
                    const isRed    = !!row.qtyPerBox && (perBox <= 0);
                    // 黃框：無法整除（正常警示）
                    const isYellow = !isRed && (hasPlus || notDivisible) && perBox > 0;
                    return (
                      <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                        <input
                          type="number"
                          value={row.qtyPerBox}
                          min={1}
                          max={row.shipQty || undefined}
                          onChange={e => {
                            const raw = e.target.value;
                            // 輸入清空時允許（讓用戶可以删除重新輸入）
                            if (raw === '') {
                              updateRow(row.id, { qtyPerBox: '' });
                              return;
                            }
                            const num = parseFloat(raw);
                            if (isNaN(num)) return;
                            // 正向放行 0 以下
                            if (num <= 0) return;
                            // 正向放行大於出貨量
                            if (row.shipQty > 0 && num > row.shipQty) return;
                            updateRow(row.id, { qtyPerBox: raw });
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                          }}
                          className={`w-full h-[32px] px-[8px] border rounded-[6px] font-['Public_Sans:Regular',sans-serif] text-[13px] outline-none transition-colors text-right ${
                            isRed
                              ? 'bg-white text-[#ff5630] border-[rgba(255,86,48,0.5)] focus:border-[#ff5630]'
                              : isYellow
                                ? 'bg-[#fffbe6] text-[#7a5c00] border-[rgba(250,200,0,0.5)] focus:border-[#f5a623]'
                                : 'bg-white text-[#1c252e] border-[rgba(145,158,171,0.32)] focus:border-[#005eb8]'
                          }`}
                        />
                      </div>
                    );
                  })()}

                  {/* 總箱數（連結樣式，點擊開啟箱數明細） */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] flex justify-center shrink-0">
                    {row.totalBoxes > 0 ? (
                      <button
                        onClick={() => setBoxModalRowId(row.id)}
                        className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#005eb8] underline cursor-pointer hover:opacity-70 transition-opacity"
                        title="點擊查看箱數明細"
                      >
                        {row.totalBoxes}
                      </button>
                    ) : (
                      <span className="font-['Public_Sans:Regular',sans-serif] text-[17px] text-[#c4cdd6]">—</span>
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
                  <div style={{ width: 100, minWidth: 100 }} className="px-[4px] shrink-0">
                    <TableSelect
                      value={row.weightUnit}
                      onChange={v => updateRow(row.id, { weightUnit: v })}
                      options={WEIGHT_UNIT_OPTIONS}
                    />
                  </div>

                  {/* 原產國家 */}
                  <div style={{ width: 110, minWidth: 110 }} className="px-[4px] shrink-0">
                    <div className="flex flex-row items-center gap-[4px]">
                      <CountrySelect
                        value={row.countryOfOrigin}
                        onChange={(code) => updateRow(row.id, { countryOfOrigin: code })}
                      />
                      {/* 下方同步：只在第一筆、多筆時、且有填値才顯示 */}
                      {idx === 0 && rows.length > 1 && row.countryOfOrigin && (
                        <button
                          type="button"
                          onClick={() => {
                            const first = rows[0].countryOfOrigin;
                            setRows(prev => prev.map((r, i) =>
                              i === 0 ? r : { ...r, countryOfOrigin: first }
                            ));
                          }}
                          className="text-[#1D7BF5] hover:text-[#0055cc] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] leading-[16px] text-left transition-colors whitespace-nowrap"
                        >
                          下方同步
                        </button>
                      )}
                    </div>
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

      {/* ── 箱數明細彈窗 ───────────────────────────────────────────────────────── */}
      {boxModalRow && (
        <BoxDetailModal
          row={boxModalRow}
          onClose={() => setBoxModalRowId(null)}
          onSave={(newBoxes) => handleSaveBoxes(boxModalRow.id, newBoxes)}
          onBack={() => setBoxModalRowId(null)}
        />
      )}

      {/* ── 必填錯誤 Modal ───────────────────────────────────────────────────── */}
      {validationErrors.length > 0 && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(28,37,46,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setSubmitted(true); setValidationErrors([]); } }}
        >
          <div className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.20)] w-[420px] max-w-[90vw] overflow-hidden">
            {/* header */}
            <div className="flex items-center gap-[10px] px-[24px] pt-[20px] pb-[16px] border-b border-[rgba(145,158,171,0.12)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <circle cx="10" cy="10" r="9" stroke="#ff5630" strokeWidth="2"/>
                <path d="M10 6v4M10 14h.01" stroke="#ff5630" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3 className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">請補齊以下必填欄位</h3>
            </div>
            {/* error list */}
            <ul className="px-[24px] py-[16px] flex flex-col gap-[8px] max-h-[50vh] overflow-y-auto custom-scrollbar">
              {validationErrors.map((err, i) => (
                <li key={i} className="flex items-start gap-[8px]">
                  <span className="mt-[3px] shrink-0 w-[6px] h-[6px] rounded-full bg-[#ff5630]" />
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] leading-[22px]">{err}</span>
                </li>
              ))}
            </ul>
            {/* footer */}
            <div className="px-[24px] pb-[20px]">
              <button
                onClick={() => { setSubmitted(true); setValidationErrors([]); }}
                className="w-full h-[40px] bg-[#1c252e] hover:bg-[#374151] text-white rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] text-[14px] transition-colors"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

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

// ── BoxDetailModal 元件 ─────────────────────────────────────────────────────
function BoxDetailModal({
  row,
  onClose,
  onSave,
  onBack,
}: {
  row: ShipmentDetailRow;
  onClose: () => void;
  onSave: (boxes: BoxItem[]) => void;
  onBack: () => void;
}) {
  const [localBoxes, setLocalBoxes] = useState<BoxItem[]>(() => [...row.boxes]);

  const [boxError, setBoxError] = useState<string | null>(null);

  // 當外部 row.boxes 變更（如用戶在列表修改每箱數量），同步更新彈窗內容
  useEffect(() => {
    setLocalBoxes([...row.boxes]);
    setBoxError(null);
  }, [row.boxes]);

  const handleDelete = (idx: number) => {
    if (localBoxes.length <= 1) return;
    setLocalBoxes(prev => deleteBoxItem(prev, idx));
    setBoxError(null);
  };

  const handleSave = () => {
    const total = localBoxes.reduce((sum, b) => sum + (b.qty || 0), 0);
    if (total !== row.shipQty) {
      setBoxError(`箱數數量總和（${total}）必須等於出貨量（${row.shipQty}）`);
      return;
    }
    setBoxError(null);
    onSave(localBoxes);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: 'rgba(28,37,46,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.20)] flex flex-col overflow-hidden"
        style={{ width: 560, maxHeight: '90vh' }}
      >
        {/* ── 頂部返回按鈕 ── */}
        <div className="px-[20px] pt-[16px] pb-[8px] flex items-center">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors"
            title="返回（重新輸入每箱數量）"
          >
            <IconsSolidIcSolarMultipleForwardLeftBroken className="w-[20px] h-[20px]" />
          </button>
        </div>

        {/* ── 標題 + 資訊欄 ── */}
        <div className="px-[24px] pb-[16px]">
          <h3 className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e] mb-[16px]">箱數明細</h3>
          <div className="grid grid-cols-2 gap-x-[24px] gap-y-[8px]">
            {[
              { label: '出貨項次', value: row.itemNo },
              { label: '訂單號碼', value: `${row.orderNo}-${row.orderSeq}` },
              { label: '料號',     value: row.materialNo },
              { label: '訂單待交', value: row.orderPendingQty },
              { label: '出貨量',   value: row.shipQty },
              { label: '每箱數量', value: row.qtyPerBox || '—' },
              { label: '總箱數',   value: localBoxes.length },
            ].map(item => (
              <div key={item.label} className="flex gap-[6px] items-baseline">
                <span className="font-['Public_Sans:Regular',sans-serif] text-[16px] text-[#637381] whitespace-nowrap">{item.label}</span>
                <span className="font-['Public_Sans:SemiBold',sans-serif] text-[16px] text-[#1c252e]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 儲存按鈕 + 驗證錯誤 ── */}
        <div className="px-[24px] pb-[16px] flex flex-col gap-[8px]">
          {boxError && (
            <div className="flex items-center gap-[6px] px-[12px] py-[8px] bg-[rgba(255,86,48,0.08)] rounded-[8px] border border-[rgba(255,86,48,0.24)]">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <circle cx="10" cy="10" r="9" stroke="#ff5630" strokeWidth="2"/>
                <path d="M10 6v4M10 14h.01" stroke="#ff5630" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#ff5630]">{boxError}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            className="w-full h-[40px] bg-[#1c252e] hover:bg-[#374151] text-white rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] text-[14px] transition-colors"
          >
            儲存
          </button>
        </div>

        {/* ── 箱數列表 ── */}
        <div className="border-t border-[rgba(145,158,171,0.16)] flex-1 overflow-hidden flex flex-col">
          {/* header */}
          <div className="flex items-center px-[24px] py-[10px] bg-[rgba(145,158,171,0.04)]">
            <span style={{ width: 60 }} className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#637381]">箱數</span>
            <span style={{ flex: 1 }} className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#637381]">數量</span>
            <span style={{ width: 48 }} className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#637381] text-center">刪除</span>
          </div>
          {/* list */}
          <div className="overflow-y-auto flex-1 custom-scrollbar px-[24px]">
            {localBoxes.map((box, idx) => (
              <div key={box.boxNo} className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.08)] last:border-0">
                {/* 箱號 */}
                <span style={{ width: 60 }} className="font-['Public_Sans:Regular',sans-serif] text-[19px] text-[#1c252e]">{box.boxNo}</span>
                {/* 數量（可編輯） */}
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    min={0}
                    value={box.qty}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setLocalBoxes(prev => prev.map((b, i) => i === idx ? { ...b, qty: val } : b));
                    }}
                    className="w-[140px] h-[32px] border border-[rgba(145,158,171,0.32)] rounded-[6px] px-[8px] text-right font-['Public_Sans:Regular',sans-serif] text-[18px] text-[#1c252e] outline-none focus:border-[#1890FF] transition-colors bg-white"
                  />
                </div>
                {/* 刪除（第 1 箱不可刪） */}
                <div style={{ width: 48 }} className="flex justify-center">
                  {idx === 0 ? (
                    <span style={{ width: 32, height: 32 }} />
                  ) : (
                    <button
                      onClick={() => handleDelete(idx)}
                      className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-[rgba(255,86,48,0.08)] transition-colors"
                      title="刪除此箱"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
