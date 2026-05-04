/**
 * ShipmentDetailPage — 開立出貨單明細
 *
 * 接收 ShipmentCreatePage 傳入的已選訂單，顯示：
 *   1. 基本資訊（廠商出貨單、幣別、運輸型態、發票日期、交貨日期、到貨日期、交貨地址）
 *   2. 出貨明細表格（可編輯出貨量、每箱數量、總箱數自動計算、淨重/毛重、原產國家）
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { DeleteButton } from './ActionButtons';
import { SAP_CURRENCIES } from '@/app/data/currencyData';
import { CountrySelect } from './CountrySelect';
import { DropdownSelect } from './DropdownSelect';
import { SimpleDatePicker } from './SimpleDatePicker';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import type { OrderRow } from './AdvancedOrderTable';
import { calcUndeliveredQty } from './AdvancedOrderTable';
import { STORAGE_LOCATION_DATA } from './ShippingBasicSettingsPage';
import { MOCK_SHIPMENTS } from './ShipmentListPage';
import { useOrderStore } from './OrderStoreContext';

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
  vendorMaterialNo: string; // 廠商料號
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

/** CSV 匯入時的預填資料（由 ShipmentCreatePage 的 handleConfirmUpload 傳入） */
export interface CsvPrefillRow {
  orderNo: string;
  orderSeq: string;
  itemNo: number;
  shipQty: number;
  qtyPerBox: string;
  customBoxes: string;   // 「50/30/50」格式，空字串表示依 qtyPerBox 均分
  netWeight: string;
  grossWeight: string;
  weightUnit: string;
  countryOfOrigin: string;
}

export interface CsvPrefillData {
  vendorShipmentNo: string;
  currency: string;
  transportType: string;
  deliveryDate: string;    // YYYY/MM/DD
  arrivalDate: string;
  deliveryAddress: string;
  rows: CsvPrefillRow[];
}

export interface ShipmentDetailPageProps {
  selectedOrders: OrderRow[];
  onClose: () => void;
  userRole?: string;
  csvData?: CsvPrefillData;  // 若為 CSV 匯入則傳入，預填所有欄位
  onConfirmSuccess?: (vendorShipmentNo: string) => void; // 確認出貨成功 callback
  // ─ 查詢模式（readOnly）──────────────────────
  readOnly?: boolean;         // 出貨單查詢明細（唯讀）
  sapDeliveryNo?: string;     // 出貨單號（查詢模式顯示）
  createdAt?: string;         // 出貨單開立時間（YYYYMMDD HH:mm）
  onDelete?: () => void;      // 整單刪除 callback
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
  label, value, onChange, placeholder, required, noResize, hasError, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  noResize?: boolean;
  hasError?: boolean;
  disabled?: boolean;
}) {
  const defaultBorder = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const handleFocus = (el: HTMLElement) => {
    if (disabled) return;
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
  const disabledStyle = disabled ? { backgroundColor: 'rgba(145,158,171,0.06)', cursor: 'not-allowed', color: '#919eab' } : {};
  if (noResize) {
    return (
      <div className="relative w-full h-[54px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor: defaultBorder }} />
        {labelNode}
        <input
          type="text"
          className="w-full h-full rounded-[8px] px-[14px] pt-[14px] pb-[8px] text-[14px] outline-none bg-transparent border-0"
          style={{ color: disabled ? '#919eab' : '#1c252e' }}
          value={value}
          onChange={e => { if (!disabled) onChange(e.target.value); }}
          placeholder={placeholder ?? ''}
          readOnly={disabled}
          onFocus={e => handleFocus(e.currentTarget)}
          onBlur={e => handleBlur(e.currentTarget)}
        />
        {disabled && <div className="absolute inset-0 rounded-[8px] bg-[rgba(145,158,171,0.06)] pointer-events-none" />}
      </div>
    );
  }
  return (
    <div className="relative w-full" style={{ minHeight: '54px', ...disabledStyle }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor: defaultBorder }} />
      {labelNode}
      <textarea
        className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] outline-none bg-transparent border-0 leading-[22px]"
        style={{ resize: disabled ? 'none' : 'vertical', minHeight: '54px', color: disabled ? '#919eab' : '#1c252e' }}
        value={value}
        onChange={e => { if (!disabled) onChange(e.target.value); }}
        placeholder={placeholder ?? ''}
        rows={1}
        readOnly={disabled}
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
  initialValue,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  /** 如果訂單帶入的初始值 > 0，則不允許使用者改為 0 或空值 */
  initialValue?: string;
}) {
  // 用 ref 鎖定 mount 時的初始值，後續編輯不影響此值
  const initRef = useRef(initialValue);
  const initNum = parseFloat(initRef.current ?? '0') || 0;
  const mustBePositive = initNum > 0;

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={e => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        // 避免多個小數點
        const parts = raw.split('.');
        const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;
        onChange(sanitized);
      }}
      onBlur={() => {
        // 如果訂單帶入值 > 0，且使用者清空或設為 0，自動還原為初始值
        if (mustBePositive) {
          const cur = parseFloat(value) || 0;
          if (cur <= 0) {
            onChange(initRef.current!);
          }
        }
      }}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
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
export function ShipmentDetailPage({ selectedOrders, onClose, userRole, csvData, onConfirmSuccess, readOnly, sapDeliveryNo, createdAt, onDelete }: ShipmentDetailPageProps) {
  const { orders, updateOrderFields } = useOrderStore();
  // ── 基本資訊（若為 CSV 匯入則優先使用 csvData 預填值）───────────────────
  const [vendorShipmentNo, setVendorShipmentNo] = useState(csvData?.vendorShipmentNo ?? '');
  const [currency, setCurrency]         = useState(csvData?.currency ?? selectedOrders[0]?.currency ?? 'TWD');
  const [transportType, setTransportType] = useState(csvData?.transportType ?? 'S');
  const [deliveryDate, setDeliveryDate] = useState(csvData?.deliveryDate ?? '');
  const [arrivalDate, setArrivalDate]   = useState(csvData?.arrivalDate ?? '');

  const [deliveryAddress, setDeliveryAddress] = useState<string>(() => {
    if (csvData?.deliveryAddress) return csvData.deliveryAddress;
    // 依第一張訂單的儲存地點代號，從主檔查詢中文地址自動帶出
    const sloc = selectedOrders[0]?.storageLocationCode;
    if (!sloc) return '';
    const found = STORAGE_LOCATION_DATA.find(r => r.locationCode === sloc && r.addressZh);
    return found?.addressZh ?? '';
  });

  // ── 出貨明細 rows（readOnly 模式直接從 csvData.rows 建立；edit 模式走 selectedOrders）────
  const [rows, setRows] = useState<ShipmentDetailRow[]>(() => {
    // readOnly 查詢模式：直接從 csvData.rows 建立（selectedOrders 為空陣列）
    if (readOnly && csvData?.rows && csvData.rows.length > 0) {
      return csvData.rows.map((csvRow, idx) => {
        const shipQty = csvRow.shipQty;
        let boxes: BoxItem[] = [];
        let totalBoxes = 0;
        if (csvRow.customBoxes) {
          const parts = csvRow.customBoxes.split('/').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
          boxes = parts.map((qty, i) => ({ boxNo: i + 1, qty }));
          totalBoxes = boxes.length;
        } else if (csvRow.qtyPerBox) {
          const perBox = parseFloat(csvRow.qtyPerBox);
          if (!isNaN(perBox) && perBox > 0) {
            boxes = initBoxes(shipQty, perBox);
            totalBoxes = boxes.length;
          }
        }
        const qtyPerBoxLabel = boxes.length > 0
          ? (csvRow.customBoxes ? calcQtyPerBoxLabel(boxes) : (csvRow.qtyPerBox ?? ''))
          : (csvRow.qtyPerBox ?? '');
        return {
          id: idx + 1,
          itemNo: csvRow.itemNo,
          orderNo: csvRow.orderNo,
          orderSeq: csvRow.orderSeq,
          materialNo: '',
          vendorMaterialNo: 'TEMPPRICE',
          orderPendingQty: 0,
          shipQty,
          qtyPerBox: qtyPerBoxLabel,
          totalBoxes,
          boxes,
          netWeight: csvRow.netWeight ?? '0',
          grossWeight: csvRow.grossWeight ?? '0',
          weightUnit: csvRow.weightUnit ?? 'KG',
          countryOfOrigin: csvRow.countryOfOrigin ?? '',
        };
      });
    }
    // edit 模式（建立出貨單）：從 selectedOrders + csvData 合併
    return selectedOrders.map((o, idx) => {
      // 找對應的 CSV 明細列（以訂單號碼 + 序號比對）
      const csvRow = csvData?.rows.find(
        r => r.orderNo === (o.orderNo || '') && r.orderSeq === (o.orderSeq || '')
      );

      // 計算 boxes：自訂箱數優先，次選每箱數量均分，最後留空
      let boxes: BoxItem[] = [];
      let totalBoxes = 0;
      const shipQty = csvRow ? csvRow.shipQty : calcUndeliveredQty(o.orderQty ?? 0, o.acceptQty ?? 0, o.inTransitQty ?? 0);
      if (csvRow?.customBoxes) {
        const parts = csvRow.customBoxes.split('/').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
        boxes = parts.map((qty, i) => ({ boxNo: i + 1, qty }));
        totalBoxes = boxes.length;
      } else if (csvRow?.qtyPerBox) {
        const perBox = parseFloat(csvRow.qtyPerBox);
        if (!isNaN(perBox) && perBox > 0) {
          boxes = initBoxes(shipQty, perBox);
          totalBoxes = boxes.length;
        }
      }

      // 決定 qtyPerBox 顯示標籤：
      //   - customBoxes 路徑 → calcQtyPerBoxLabel(boxes)（如 "30+"）
      //   - qtyPerBox 路徑  → CSV 原始值（如 "60"）
      //   - 無 CSV 資料     → 空字串
      const qtyPerBoxLabel = boxes.length > 0
        ? (csvRow?.customBoxes ? calcQtyPerBoxLabel(boxes) : (csvRow?.qtyPerBox ?? ''))
        : (csvRow?.qtyPerBox ?? '');

      return {
        id: o.id,
        itemNo: csvRow?.itemNo ?? (idx + 1) * 10,
        orderNo: o.orderNo || '',
        orderSeq: o.orderSeq || '',
        materialNo: o.materialNo || '',
        vendorMaterialNo: 'TEMPPRICE',
        orderPendingQty: calcUndeliveredQty(o.orderQty ?? 0, o.acceptQty ?? 0, o.inTransitQty ?? 0),
        shipQty,
        qtyPerBox: qtyPerBoxLabel,
        totalBoxes,
        boxes,
        netWeight:       csvRow?.netWeight       ?? '0',
        grossWeight:     csvRow?.grossWeight     ?? '0',
        weightUnit:      csvRow?.weightUnit      ?? 'KG',
        countryOfOrigin: csvRow?.countryOfOrigin ?? '',
      };
    });
  });

  // ── 貼標項次明細彈窗 ──────────────────────────────────────────────────────────
  const [boxModalRowId, setBoxModalRowId] = useState<number | null>(null);
  const boxModalRow = rows.find(r => r.id === boxModalRowId) ?? null;



  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 查詢模式下的編輯狀態 ───────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  // 進入編輯前的快照（用於「取消」還原）
  const [editSnapshot, setEditSnapshot] = useState<{
    deliveryDate: string; arrivalDate: string; deliveryAddress: string;
    rows: typeof rows;
  } | null>(null);

  const handleStartEdit = () => {
    setEditSnapshot({ deliveryDate, arrivalDate, deliveryAddress, rows: rows.map(r => ({ ...r })) });
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    if (editSnapshot) {
      setDeliveryDate(editSnapshot.deliveryDate);
      setArrivalDate(editSnapshot.arrivalDate);
      setDeliveryAddress(editSnapshot.deliveryAddress);
      setRows(editSnapshot.rows);
    }
    setIsEditing(false);
    setEditSnapshot(null);
  };
  const handleSaveEdit = () => {
    setIsEditing(false);
    setEditSnapshot(null);
    showToast('已儲存變更');
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

  // ── 貼標項次明細儲存（貼標項次明細有更新 → 列表的 qtyPerBox 跟著覆蓋）───────────
  const handleSaveBoxes = (rowId: number, newBoxes: BoxItem[]) => {
    const label = calcQtyPerBoxLabel(newBoxes);
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      return { ...r, boxes: newBoxes, totalBoxes: newBoxes.length, qtyPerBox: label };
    }));
    setBoxModalRowId(null);
    showToast('貼標項次明細已儲存');
  };

  // ── 刪除明細列 ─────────────────────────────────────────────────────────
  const deleteRow = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // ── 確認出貨（一次收集所有錯誤）────────────────────────────────────────
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirm = () => {
    const errors: string[] = [];

    // 基本資訊
    if (!vendorShipmentNo.trim()) errors.push('廠商出貨單 為必填');
    if (!deliveryDate)            errors.push('交貨日期 為必填');
    if (rows.length === 0)        errors.push('出貨明細不可為空');

    // 廠商出貨單重複驗證（同一廠商下不可重複，不同廠商可使用相同單號）
    if (vendorShipmentNo.trim()) {
      const currentVendorCode = selectedOrders[0]?.vendorCode ?? '';
      const existingNos = new Set<string>();
      MOCK_SHIPMENTS
        .filter(s => s.vendorCode === currentVendorCode)
        .forEach(s => existingNos.add(s.vendorShipmentNo));
      try {
        const saved = JSON.parse(localStorage.getItem('createdShipments') || '[]') as { vendorShipmentNo: string; vendorCode: string }[];
        saved
          .filter(s => s.vendorCode === currentVendorCode)
          .forEach(s => existingNos.add(s.vendorShipmentNo));
      } catch { /* ignore */ }
      if (existingNos.has(vendorShipmentNo.trim())) {
        errors.push(`廠商出貨單「${vendorShipmentNo}」在該廠商下已存在，同一廠商不可重複開立`);
      }
    }

    // 明細逐筆檢查
    rows.forEach(r => {
      if (!r.shipQty || r.shipQty <= 0) {
        errors.push(`出貨序號 ${r.itemNo}（${r.materialNo}）：出貨量 必須大於 0`);
      }
      const v = parseFloat(r.qtyPerBox);
      if (!r.qtyPerBox || isNaN(v) || v <= 0) {
        errors.push(`出貨序號 ${r.itemNo}（${r.materialNo}）：每箱數量 必須大於 0`);
      }
    });

    // 總箱數卡控：全部出貨序號的總箱數相加不能大於 10,000 箱
    const grandTotalBoxes = rows.reduce((sum, r) => sum + r.totalBoxes, 0);
    if (grandTotalBoxes > 10000) {
      errors.push(`出貨序號總箱數合計為 ${grandTotalBoxes.toLocaleString()} 箱，不可超過 10,000 箱`);
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // 驗證通過 → 顯示確認 Modal 供客戶核對基本資訊
    setShowConfirmModal(true);
  };

  // ── 最終確認出貨（Modal 確認後執行儲存）──────────────────────────────────
  const handleFinalConfirm = () => {
    setShowConfirmModal(false);

    // 組裝出貨單資料並存入 localStorage（供出貨單查詢頁讀取）
    const now = new Date();
    const createdAt = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newShipment = {
      id: Date.now(),
      vendorShipmentNo,
      vendorCode: selectedOrders[0]?.vendorCode ?? '',
      vendorName: selectedOrders[0]?.vendorName ?? '',
      currency,
      transportType,
      deliveryDate,
      arrivalDate,
      invoiceDate: '',
      deliveryAddress,
      sapDeliveryNo: `17${String(Date.now()).slice(-8)}`,
      createdAt,
      details: rows.map(r => ({
        itemNo: r.itemNo,
        orderNo: r.orderNo,
        orderSeq: r.orderSeq,
        materialNo: r.materialNo,
        orderPendingQty: r.orderPendingQty,
        shipQty: r.shipQty,
        qtyPerBox: r.qtyPerBox || 0,
        totalBoxes: r.totalBoxes,
        boxes: r.boxes,
        netWeight: r.netWeight,
        grossWeight: r.grossWeight,
        weightUnit: r.weightUnit,
        countryOfOrigin: r.countryOfOrigin,
        receivedQty: 0,
      })),
      status: 'open' as const,
    };
    try {
      const existing = JSON.parse(localStorage.getItem('createdShipments') || '[]');
      existing.push(newShipment);
      localStorage.setItem('createdShipments', JSON.stringify(existing));
    } catch { /* ignore */ }

    // 更新每筆來源訂單的在途量（inTransitQty += shipQty）
    rows.forEach(r => {
      const sourceOrder = orders.find(o => o.id === r.id);
      if (sourceOrder) {
        const currentInTransit = sourceOrder.inTransitQty ?? 0;
        updateOrderFields(r.id, { inTransitQty: currentInTransit + r.shipQty });
      }
    });

    if (onConfirmSuccess) {
      onConfirmSuccess(vendorShipmentNo);
    } else {
      onClose();
    }
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
          {/* 左側：← + 基本資訊 Tab + 出貨單號 + 開立時間（readOnly時顯示） */}
          <div className="flex items-center gap-[10px] flex-wrap">
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
            {/* 出貨單號 + 開立時間 */}
            {readOnly && sapDeliveryNo && (
              <div className="flex items-center gap-[16px]">
                <div className="flex items-center gap-[4px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">出貨單號:</span>
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{sapDeliveryNo}</span>
                </div>
                {createdAt && (
                  <>
                    <div className="w-[1px] h-[14px] bg-[rgba(145,158,171,0.4)] shrink-0" />
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{createdAt}</span>
                  </>
                )}
              </div>
            )}
          </div>
          {/* 右側按鈕 */}
          <div className="flex items-center gap-[12px]">
            <button
              onClick={handleConfirm}
              disabled={vendorDateWarnings.length > 0}
              title={vendorDateWarnings.length > 0 ? '有出貨明細尚未符合七天原則，無法確認出貨' : undefined}
              className="h-[36px] bg-[#005eb8] hover:bg-[#004a94] disabled:bg-[#919eab] disabled:cursor-not-allowed text-white rounded-[8px] px-[20px] text-[14px] font-semibold font-['Public_Sans:SemiBold',sans-serif] transition-colors whitespace-nowrap"
            >確認出貨</button>
            {readOnly && (
              <p
                onClick={() => setShowHistory(v => !v)}
                className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >歷程</p>
            )}
          </div>
        </div>

        {/* Row 1：廠商出貨單 | 幣別 | 運輸型態 | 交貨日期 | 到貨日期 */}
        <div className="flex gap-[16px] mb-[16px]">
          <div className="flex-1 min-w-0">
            <FloatingInput
              label="廠商出貨單"
              value={vendorShipmentNo}
              onChange={setVendorShipmentNo}
              required
              noResize
              hasError={submitted && !vendorShipmentNo.trim()}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-[54px] relative rounded-[8px] w-full">
              <div className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="flex flex-row items-center size-full">
                <div className="flex items-center px-[14px] relative size-full">
                  <p className="flex-1 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[15px] truncate">{(() => {
                    const code = currency || 'TWD';
                    const found = SAP_CURRENCIES.find(c => c.code === code);
                    return found ? `${found.code} ${found.shortName}` : code;
                  })()}</p>
                  <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] pointer-events-none z-[4]">
                    <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
                    <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[14px] relative shrink-0 text-[#637381] text-[13px]">幣別</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <DropdownSelect label="運輸型態" value={transportType} onChange={setTransportType} options={TRANSPORT_OPTIONS} />
          </div>
          <div className="flex-1 min-w-0">
            <FloatingDateField label="交貨日期" value={deliveryDate} onChange={setDeliveryDate}
              required hasError={submitted && !deliveryDate} />
          </div>
          <div className="flex-1 min-w-0">
            <FloatingDateField label="到貨日期" value={arrivalDate} onChange={setArrivalDate} />
          </div>
        </div>

        {/* Row 2：交貨地址（全寬） */}
        <FloatingInput label="交貨地址" value={deliveryAddress} onChange={setDeliveryAddress}
          placeholder="帶出地址後尚可更改" />


        {/* 七天原則警告橫幅（查詢模式不顯示） */}
        {!readOnly && vendorDateWarnings.length > 0 && (
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
                  出貨序號 {w.itemNo}（{w.materialNo}）— 廠商答交日 {w.vendorDeliveryDate}，最早可出貨日為 {w.earliestDate}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── 下半：灰色區 — 出貨明細（table 用白底卡片） ────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[24px] py-[20px]">

        {/* 標題列 */}
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
          {!readOnly && (
            <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#FF5630] leading-[20px]">
              * 系統會自動計算出貨總箱數，您依然可點擊總箱數進行調整
            </p>
          )}
        </div>

        {/* 白底 table 卡片 */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_4px_8px_-2px_rgba(145,158,171,0.12)]">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div style={{ minWidth: '1168px' }}>

              {/* Table header */}
              <div className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.16)] bg-[rgba(145,158,171,0.04)]">
                {[
                  { label: '出貨序號', w: 80,  align: 'left' },
                  { label: '單號序號', w: 130, align: 'left' },
                  { label: '料號',     w: 140, align: 'left' },
                  { label: '廠商料號', w: 120, align: 'left' },
                  { label: '訂單待交', w: 80,  align: 'right' },
                  { label: '*出貨量',  w: 80,  align: 'right', blue: true },
                  { label: '*每箱數量', w: 90,  align: 'right', blue: true },
                  { label: '總箱數',   w: 80,  align: 'center', blue: true },
                  { label: '淨重', w: 90,  align: 'right', blue: true },
                  { label: '毛重', w: 90,  align: 'right', blue: true },
                  { label: '重量單位', w: 100, align: 'center', blue: true },
                  { label: '原產國家', w: 110, align: 'center', blue: true },
                  { label: '',         w: 44,  align: 'center' },
                ].map((col, i) => (
                  <div
                    key={i}
                    style={{ width: col.w, minWidth: col.w, flex: `0 0 ${col.w}px` }}
                    className={`${i === 0 ? 'pl-[16px] pr-[8px]' : 'px-[8px]'} font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] leading-[20px] ${
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
                  {/* 出貨序號 */}
                  <div style={{ width: 80, minWidth: 80 }} className="pl-[16px] pr-[8px] shrink-0">
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

                  {/* 廠商料號 */}
                  <div style={{ width: 120, minWidth: 120 }} className="px-[8px] shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] truncate block">
                      {row.vendorMaterialNo || '—'}
                    </span>
                  </div>

                  {/* 訂單待交（唯讀） */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
                      {row.orderPendingQty}
                    </span>
                  </div>

                  {/* 出貨量 */}
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

                  {/* 每箱數量 */}
                  {(() => {
                    const perBox = parseFloat(row.qtyPerBox) || 0;
                    const hasPlus = row.qtyPerBox.includes('+');
                    const notDivisible = perBox > 0 && row.shipQty > 0 && row.shipQty % perBox !== 0;
                    const isRed    = !!row.qtyPerBox && (perBox <= 0);
                    const isYellow = !isRed && (hasPlus || notDivisible) && perBox > 0;
                    return (
                      <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.qtyPerBox}
                          onChange={e => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            if (raw === '') { updateRow(row.id, { qtyPerBox: '' }); return; }
                            const num = parseFloat(raw);
                            if (isNaN(num)) return;
                            if (num <= 0) return;
                            if (row.shipQty > 0 && num > row.shipQty) return;
                            updateRow(row.id, { qtyPerBox: raw });
                          }}
                          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
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

                  {/* 總箱數 */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] flex justify-center shrink-0">
                    {row.totalBoxes > 0 ? (
                      <button
                        onClick={() => setBoxModalRowId(row.id)}
                        className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#005eb8] underline cursor-pointer hover:opacity-70 transition-opacity min-w-[40px] inline-block py-[4px]"
                        title="點擊查看貼標項次明細"
                      >{row.totalBoxes}</button>
                    ) : (
                      <span className="font-['Public_Sans:Regular',sans-serif] text-[17px] text-[#c4cdd6]">—</span>
                    )}
                  </div>

                  {/* 淨重 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                    <InlineNumberInput value={row.netWeight} onChange={v => updateRow(row.id, { netWeight: v })} initialValue={row.netWeight} />
                  </div>

                  {/* 毛重 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] shrink-0">
                    <InlineNumberInput value={row.grossWeight} onChange={v => updateRow(row.id, { grossWeight: v })} initialValue={row.grossWeight} />
                  </div>

                  {/* 重量單位 */}
                  <div style={{ width: 100, minWidth: 100 }} className="px-[4px] shrink-0">
                    <TableSelect value={row.weightUnit} onChange={v => updateRow(row.id, { weightUnit: v })} options={WEIGHT_UNIT_OPTIONS} />
                  </div>

                  {/* 原產國家 */}
                  <div style={{ width: 110, minWidth: 110 }} className="px-[4px] shrink-0">
                    <div className="flex flex-row items-center gap-[4px]">
                      <CountrySelect value={row.countryOfOrigin} onChange={(code) => updateRow(row.id, { countryOfOrigin: code })} />
                      {idx === 0 && rows.length > 1 && row.countryOfOrigin && (
                        <button
                          type="button"
                          onClick={() => {
                            const first = rows[0].countryOfOrigin;
                            setRows(prev => prev.map((r, i) => i === 0 ? r : { ...r, countryOfOrigin: first }));
                          }}
                          className="text-[#1D7BF5] hover:text-[#0055cc] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] leading-[16px] text-left transition-colors whitespace-nowrap"
                        >下方同步</button>
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

      {/* ── 貼標項次明細彈窗 ───────────────────────────────────────────────────────── */}
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
          <div className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.20)] w-[580px] max-w-[90vw] overflow-hidden">
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

      {/* ── 確認出貨 Modal（列出基本資訊供核對）────────────────────────────── */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(28,37,46,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowConfirmModal(false); }}
        >
          <div className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.20)] w-[520px] max-w-[90vw] overflow-hidden">
            {/* header */}
            <div className="flex items-center gap-[10px] px-[24px] pt-[20px] pb-[16px] border-b border-[rgba(145,158,171,0.12)]">
              <div className="w-[40px] h-[40px] rounded-full bg-[rgba(0,94,184,0.08)] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3 className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">確認出貨單資訊</h3>
            </div>

            {/* 基本資訊列表 */}
            <div className="px-[24px] pt-[16px] pb-[8px] flex flex-col gap-[10px]">
              {[
                { label: '廠商出貨單', value: vendorShipmentNo },
                { label: '廠商', value: selectedOrders[0]?.vendorName ?? '' },
                { label: '幣別', value: currency },
                { label: '運輸型態', value: TRANSPORT_OPTIONS.find(o => o.value === transportType)?.label ?? transportType },
                { label: '交貨日期', value: deliveryDate },
                { label: '到貨日期', value: arrivalDate || '—' },
                { label: '交貨地址', value: deliveryAddress || '—' },
                { label: '出貨序號數', value: `${rows.length} 筆` },
              ].map(item => (
                <div key={item.label} className="flex items-baseline gap-[8px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] whitespace-nowrap min-w-[100px]">{item.label}</span>
                  <span className="font-['Public_Sans:SemiBold',sans-serif] text-[14px] text-[#1c252e] break-all">{item.value}</span>
                </div>
              ))}
            </div>

            {/* 紅字警示 */}
            <div className="mx-[24px] my-[12px] px-[14px] py-[12px] bg-[rgba(255,86,48,0.06)] border border-[rgba(255,86,48,0.24)] rounded-[10px] flex items-start gap-[8px]">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-[2px]">
                <circle cx="10" cy="10" r="9" stroke="#ff5630" strokeWidth="2"/>
                <path d="M10 6v4M10 14h.01" stroke="#ff5630" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="font-['Public_Sans:SemiBold',sans-serif] text-[13px] text-[#ff5630] leading-[20px]">
                建立出貨單之後一旦有收料量就不能刪單重建，請確認基本資訊是否正確
              </p>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="h-[40px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors"
              >
                返回修改
              </button>
              <button
                onClick={handleFinalConfirm}
                className="h-[40px] px-[20px] rounded-[8px] bg-[#005eb8] hover:bg-[#004a94] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors"
              >
                確認建立
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
      setBoxError(`貼標項次數量總和（${total}）必須等於出貨量（${row.shipQty}）`);
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
          <h3 className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e] mb-[16px]">貼標項次明細</h3>
          <div className="grid grid-cols-2 gap-x-[24px] gap-y-[8px]">
            {[
              { label: '出貨序號', value: row.itemNo },
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

        {/* ── 貼標項次列表 ── */}
        <div className="border-t border-[rgba(145,158,171,0.16)] flex-1 overflow-hidden flex flex-col">
          {/* header */}
          <div className="flex items-center px-[24px] py-[10px] bg-[rgba(145,158,171,0.04)]">
            <span style={{ width: 80 }} className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#637381] whitespace-nowrap">貼標項次</span>
            <span style={{ flex: 1 }} className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#637381]">數量</span>
            <span style={{ width: 48 }} className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#637381] text-center">刪除</span>
          </div>
          {/* list */}
          <div className="overflow-y-auto flex-1 custom-scrollbar px-[24px]">
            {localBoxes.map((box, idx) => (
              <div key={box.boxNo} className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.08)] last:border-0">
                {/* 箱號 */}
                <span style={{ width: 80 }} className="font-['Public_Sans:Regular',sans-serif] text-[19px] text-[#1c252e]">{box.boxNo}</span>
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
