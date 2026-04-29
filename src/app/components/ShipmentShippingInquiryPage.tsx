/**
 * ShipmentShippingInquiryPage — 出貨單 • 出貨/裝箱明細
 *
 * TAB1：出貨明細查詢（項次維度）
 *   - 每筆 = 一個出貨項次
 *   - 欄位涵蓋表頭資訊（廠商名稱、出貨單號、SAP送貨單號、幣別、運輸型態、交貨日期、到貨日期、出貨目的地）
 *   + 項次資訊（出貨項次、單號序號、採購組織、料號、品名、客戶料號、客戶訂單號碼、
 *               訂單待交、出貨量、每箱數量、總箱數、淨重、毛重、重量單位、原產國家、累計收料量）
 *
 * TAB2：裝箱明細查詢（箱子維度）
 *   - 每筆 = 一個外箱
 *   - 包含多選 Checkbox + 批次列印貼紙（中/英文）
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { CheckboxIcon } from './CheckboxIcon';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { PaginationControls } from './PaginationControls';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';
import { MOCK_SHIPMENTS } from './ShipmentListPage';
import type { ShipmentRow, ShipmentDetailItem } from './ShipmentListPage';
import { ShipmentPrintPage, type PrintTab } from './ShipmentPrintPage';

// ── 運輸型態 Label ───────────────────────────────────────────────────────────
export const TRANSPORT_LABEL: Record<string, string> = {
  S: 'S 海運', A: 'A 空運', T: 'T 陸運', E: 'E 快遞',
};

// ── 原產國家 → Made in XX 轉換 ────────────────────────────────────────────────
const COUNTRY_MADE_IN: Record<string, string> = {
  TW: 'Made in Taiwan',
  CN: 'Made in China',
  JP: 'Made in Japan',
  US: 'Made in USA',
  DE: 'Made in Germany',
  KR: 'Made in Korea',
  IT: 'Made in Italy',
  FR: 'Made in France',
  VN: 'Made in Vietnam',
  TH: 'Made in Thailand',
  MY: 'Made in Malaysia',
  ID: 'Made in Indonesia',
  PH: 'Made in Philippines',
  SG: 'Made in Singapore',
  IN: 'Made in India',
};

function getMadeIn(code: string): string {
  return COUNTRY_MADE_IN[code] ?? (code ? `Made in ${code}` : '—');
}

// ── 型別定義 ──────────────────────────────────────────────────────────────────

/** TAB1 出貨明細列（項次維度） */
export interface ShipmentItemRow {
  id: string; // `${shipment.id}-${detail.itemNo}`
  // 表頭資訊
  vendorName: string;         // 廠商名稱（不含編號）
  vendorShipmentNo: string;   // 廠商出貨單號
  sapDeliveryNo: string;      // SAP 送貨單號
  currency: string;           // 幣別
  transportType: string;      // 運輸型態
  deliveryDate: string;       // 交貨日期
  arrivalDate: string;        // 到貨日期
  deliveryAddress: string;    // 出貨目的地（交貨地址）
  // 項次資訊
  itemNo: number;             // 出貨項次
  orderDocSeq: string;        // 單號序號（orderNo + orderSeq 合併）
  purchaseOrg: string;        // 採購組織（mock: 'GEM採購...'）
  materialNo: string;         // 料號
  productName: string;        // 品名（mock 為空）
  customerMaterialNo: string; // 客戶料號（mock 為空）
  customerOrderNo: string;    // 客戶訂單號碼（mock 為空）
  orderPendingQty: number;    // 訂單待交
  shipQty: number;            // 出貨量
  qtyPerBox: number | string; // 每箱數量
  totalBoxes: number;         // 總箱數
  netWeight: string;          // 淨重（個）
  grossWeight: string;        // 毛重（個）
  weightUnit: string;         // 重量單位
  countryOfOrigin: string;    // 原產國家 code（TW/CN...）
  receivedQty: number;        // 累計收料量
}

/** TAB2 裝箱明細列（箱子維度） */
export interface BoxLineRow {
  id: string; // `${shipment.id}-${detail.itemNo}-${box.boxNo}`
  // 箱本身
  barcode: string;       // 外箱條碼（mock: 028xxxxxx$）
  boxQty: number;        // 本件數量
  labelSeq: string;      // 貼標項次（N/總箱數 格式，如 1/4）
  // 所屬項次
  itemNo: number;
  orderDocSeq: string;   // 單號序號
  purchaseOrg: string;
  materialNo: string;
  productName: string;
  customerMaterialNo: string;
  customerOrderNo: string;
  shipQty: number;       // 總數量（出貨量）
  netWeight: string;
  grossWeight: string;
  weightUnit: string;
  madeIn: string;        // Made in Taiwan etc.
  // 所屬表頭
  vendorName: string;
  vendorShipmentNo: string;
  sapDeliveryNo: string;
  deliveryDate: string;
  deliveryAddress: string;
  transportType: string;
  purchaseOrgHeader: string;
  storageLocation: string; // 儲存地點（mock: 空）
}

// ── Mock 資料展開 ──────────────────────────────────────────────────────────────

export function buildItemRows(shipments: ShipmentRow[]): ShipmentItemRow[] {
  const rows: ShipmentItemRow[] = [];
  for (const ship of shipments) {
    for (const d of ship.details) {
      rows.push({
        id: `${ship.id}-${d.itemNo}`,
        vendorName: ship.vendorName.replace(/\(.*\)/, '').trim(),
        vendorShipmentNo: ship.vendorShipmentNo,
        sapDeliveryNo: ship.sapDeliveryNo,
        currency: ship.currency,
        transportType: ship.transportType,
        deliveryDate: ship.deliveryDate,
        arrivalDate: ship.arrivalDate,
        deliveryAddress: ship.deliveryAddress,
        itemNo: d.itemNo,
        orderDocSeq: `${d.orderNo}${d.orderSeq}`,
        purchaseOrg: 'GEM採購',
        materialNo: d.materialNo,
        productName: '',
        customerMaterialNo: '',
        customerOrderNo: '',
        orderPendingQty: d.orderPendingQty,
        shipQty: d.shipQty,
        qtyPerBox: d.qtyPerBox,
        totalBoxes: d.totalBoxes,
        netWeight: d.netWeight,
        grossWeight: d.grossWeight,
        weightUnit: d.weightUnit,
        countryOfOrigin: d.countryOfOrigin,
        receivedQty: d.receivedQty ?? 0,
      });
    }
  }
  return rows;
}

let _barcodeCounter = 1;
function genBarcode(): string {
  const n = String(_barcodeCounter++).padStart(9, '0');
  return `0${n}$`;
}

export function buildBoxRows(shipments: ShipmentRow[]): BoxLineRow[] {
  _barcodeCounter = 1;
  const rows: BoxLineRow[] = [];
  for (const ship of shipments) {
    for (const d of ship.details) {
      const boxes = d.boxes ?? [];
      for (const box of boxes) {
        rows.push({
          id: `${ship.id}-${d.itemNo}-${box.boxNo}`,
          barcode: genBarcode(),
          boxQty: box.qty,
          labelSeq: `${box.boxNo}/${boxes.length}`,
          itemNo: d.itemNo,
          orderDocSeq: `${d.orderNo}${d.orderSeq}`,
          purchaseOrg: 'GEM採購',
          materialNo: d.materialNo,
          productName: '',
          customerMaterialNo: '',
          customerOrderNo: '',
          shipQty: d.shipQty,
          netWeight: d.netWeight,
          grossWeight: d.grossWeight,
          weightUnit: d.weightUnit,
          madeIn: getMadeIn(d.countryOfOrigin),
          vendorName: ship.vendorName.replace(/\(.*\)/, '').trim(),
          vendorShipmentNo: ship.vendorShipmentNo,
          sapDeliveryNo: ship.sapDeliveryNo,
          deliveryDate: ship.deliveryDate,
          deliveryAddress: ship.deliveryAddress,
          transportType: ship.transportType,
          purchaseOrgHeader: 'GEM採購',
          storageLocation: '',
        });
      }
    }
  }
  return rows;
}

// ── 廠商選項 ──────────────────────────────────────────────────────────────────
export const VENDOR_OPTIONS = [
  { value: '', label: '全部' },
  ...Array.from(new Map(MOCK_SHIPMENTS.map(r => [r.vendorCode, r])).values()).map(r => ({
    value: r.vendorCode,
    label: r.vendorName,
  })),
];

// ─────────────────────────────────────────────────────────────────────────────
// ── 欄位定義 TAB1 出貨明細
// ─────────────────────────────────────────────────────────────────────────────
export type ItemColKey =
  | 'vendorName' | 'vendorShipmentNo' | 'sapDeliveryNo' | 'currency'
  | 'transportType' | 'deliveryDate' | 'arrivalDate' | 'deliveryAddress'
  | 'itemNo' | 'orderDocSeq' | 'purchaseOrg' | 'materialNo'
  | 'productName' | 'customerMaterialNo' | 'customerOrderNo'
  | 'orderPendingQty' | 'shipQty' | 'qtyPerBox' | 'totalBoxes'
  | 'netWeight' | 'grossWeight' | 'weightUnit' | 'countryOfOrigin' | 'receivedQty';

export interface ItemCol {
  key: ItemColKey;
  label: string;
  width: number;
  minWidth: number;
  align?: 'left' | 'right' | 'center';
  visible?: boolean;
}

export const ITEM_DEFAULT_COLS: ItemCol[] = [
  { key: 'vendorName',         label: '廠商名稱',     width: 120, minWidth: 100, align: 'left' },
  { key: 'vendorShipmentNo',   label: '廠商出貨單號', width: 140, minWidth: 110, align: 'left' },
  { key: 'sapDeliveryNo',      label: 'SAP送貨單號', width: 130, minWidth: 100, align: 'left' },
  { key: 'currency',            label: '幣別',         width: 70,  minWidth: 60,  align: 'center' },
  { key: 'transportType',       label: '運輸型態',     width: 100, minWidth: 80,  align: 'center' },
  { key: 'deliveryDate',        label: '交貨日期',     width: 110, minWidth: 90,  align: 'center' },
  { key: 'arrivalDate',         label: '到貨日期',     width: 110, minWidth: 90,  align: 'center' },
  { key: 'deliveryAddress',     label: '出貨目的地',   width: 200, minWidth: 120, align: 'left', visible: false },
  { key: 'itemNo',              label: '出貨項次',     width: 80,  minWidth: 60,  align: 'center' },
  { key: 'orderDocSeq',         label: '單號序號',     width: 140, minWidth: 110, align: 'left' },
  { key: 'purchaseOrg',         label: '採購組織',     width: 100, minWidth: 80,  align: 'left' },
  { key: 'materialNo',          label: '料號',         width: 160, minWidth: 120, align: 'left' },
  { key: 'productName',         label: '品名',         width: 160, minWidth: 120, align: 'left', visible: false },
  { key: 'customerMaterialNo',  label: '客戶料號',     width: 120, minWidth: 90,  align: 'left', visible: false },
  { key: 'customerOrderNo',     label: '客戶訂單號碼', width: 140, minWidth: 110, align: 'left', visible: false },
  { key: 'orderPendingQty',     label: '訂單待交',     width: 90,  minWidth: 70,  align: 'right' },
  { key: 'shipQty',             label: '出貨量',       width: 80,  minWidth: 60,  align: 'right' },
  { key: 'qtyPerBox',           label: '每箱數量',     width: 88,  minWidth: 70,  align: 'right' },
  { key: 'totalBoxes',          label: '總箱數',       width: 80,  minWidth: 60,  align: 'right' },
  { key: 'netWeight',           label: '淨重(個)',     width: 90,  minWidth: 70,  align: 'right' },
  { key: 'grossWeight',         label: '毛重(個)',     width: 90,  minWidth: 70,  align: 'right' },
  { key: 'weightUnit',          label: '重量單位',     width: 90,  minWidth: 70,  align: 'center' },
  { key: 'countryOfOrigin',     label: '原產國家',     width: 100, minWidth: 80,  align: 'center' },
  { key: 'receivedQty',         label: '累計收料量',   width: 100, minWidth: 80,  align: 'right' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ── 欄位定義 TAB2 裝箱明細
// ─────────────────────────────────────────────────────────────────────────────
export type BoxColKey =
  | 'barcode' | 'boxQty' | 'labelSeq'
  | 'itemNo' | 'orderDocSeq' | 'purchaseOrg' | 'materialNo'
  | 'productName' | 'customerMaterialNo' | 'customerOrderNo'
  | 'shipQty' | 'netWeight' | 'grossWeight' | 'weightUnit' | 'madeIn'
  | 'vendorName' | 'vendorShipmentNo' | 'sapDeliveryNo'
  | 'deliveryDate' | 'deliveryAddress' | 'transportType' | 'storageLocation';

export interface BoxCol {
  key: BoxColKey;
  label: string;
  width: number;
  minWidth: number;
  align?: 'left' | 'right' | 'center';
  visible?: boolean;
}

export const BOX_DEFAULT_COLS: BoxCol[] = [
  { key: 'barcode',            label: '條碼',         width: 140, minWidth: 110, align: 'left' },
  { key: 'boxQty',             label: '本件數量',     width: 88,  minWidth: 70,  align: 'right' },
  { key: 'labelSeq',           label: '貼標項次/總箱', width: 110, minWidth: 90,  align: 'center' },
  { key: 'itemNo',             label: '出貨項次',     width: 80,  minWidth: 60,  align: 'center' },
  { key: 'orderDocSeq',        label: '單號序號',     width: 140, minWidth: 110, align: 'left' },
  { key: 'purchaseOrg',        label: '採購組織',     width: 100, minWidth: 80,  align: 'left' },
  { key: 'materialNo',         label: '料號',         width: 160, minWidth: 120, align: 'left' },
  { key: 'productName',        label: '品名',         width: 160, minWidth: 120, align: 'left', visible: false },
  { key: 'customerMaterialNo', label: '客戶料號',     width: 120, minWidth: 90,  align: 'left', visible: false },
  { key: 'customerOrderNo',    label: '客戶訂單號碼', width: 140, minWidth: 110, align: 'left', visible: false },
  { key: 'shipQty',            label: '出貨量',       width: 80,  minWidth: 60,  align: 'right' },
  { key: 'netWeight',          label: '淨重(個)',     width: 90,  minWidth: 70,  align: 'right' },
  { key: 'grossWeight',        label: '毛重(個)',     width: 90,  minWidth: 70,  align: 'right' },
  { key: 'weightUnit',         label: '重量單位',     width: 90,  minWidth: 70,  align: 'center' },
  { key: 'madeIn',             label: '製造國',       width: 150, minWidth: 120, align: 'left' },
  { key: 'vendorName',         label: '廠商名稱',     width: 120, minWidth: 100, align: 'left' },
  { key: 'vendorShipmentNo',   label: '廠商出貨單號', width: 140, minWidth: 110, align: 'left' },
  { key: 'sapDeliveryNo',      label: 'SAP送貨單號', width: 130, minWidth: 100, align: 'left' },
  { key: 'deliveryDate',       label: '出貨日期',     width: 110, minWidth: 90,  align: 'center' },
  { key: 'deliveryAddress',    label: '出貨目的地',   width: 200, minWidth: 120, align: 'left', visible: false },
  { key: 'transportType',      label: '運輸型態',     width: 100, minWidth: 80,  align: 'center', visible: false },
  { key: 'storageLocation',    label: '儲存地點',     width: 110, minWidth: 90,  align: 'left', visible: false },
];

// ── 共用儲存 key ──────────────────────────────────────────────────────────────
const ITEM_STORAGE_KEY = 'shipmentItemInquiry_v1_cols';
const BOX_STORAGE_KEY  = 'shipmentBoxInquiry_v1_cols';
const CHECKBOX_W = 52;


// ── 列 Cell 值 TAB1 ──────────────────────────────────────────────────────────
function getItemCellValue(row: ShipmentItemRow, key: ItemColKey): React.ReactNode {
  if (key === 'transportType') {
    const map: Record<string, { bg: string; text: string }> = {
      S: { bg: 'rgba(0,120,212,0.10)',  text: '#0068b8' },
      A: { bg: 'rgba(255,171,0,0.12)',  text: '#b76e00' },
      T: { bg: 'rgba(34,197,94,0.12)',  text: '#118d57' },
      E: { bg: 'rgba(145,85,255,0.10)', text: '#6b35c0' },
    };
    const cfg = map[row.transportType] ?? { bg: 'rgba(145,158,171,0.12)', text: '#637381' };
    const label = TRANSPORT_LABEL[row.transportType] ?? row.transportType;
    return (
      <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
        {label}
      </span>
    );
  }
  if (key === 'receivedQty') {
    const v = row.receivedQty;
    return (
      <span className={`font-['Public_Sans:Regular',sans-serif] text-[14px] ${v > 0 ? 'text-[#118d57] font-medium' : 'text-[#c4cdd6]'}`}>
        {v}
      </span>
    );
  }
  if (key === 'countryOfOrigin') {
    const code = row.countryOfOrigin;
    return (
      <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">{code || '—'}</span>
    );
  }
  const v = (row as any)[key];
  const s = v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : '—';
  return (
    <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`} title={s}>
      {s}
    </p>
  );
}

// ── 列 Cell 值 TAB2 ──────────────────────────────────────────────────────────
function getBoxCellValue(row: BoxLineRow, key: BoxColKey): React.ReactNode {
  if (key === 'transportType') {
    const map: Record<string, { bg: string; text: string }> = {
      S: { bg: 'rgba(0,120,212,0.10)',  text: '#0068b8' },
      A: { bg: 'rgba(255,171,0,0.12)',  text: '#b76e00' },
      T: { bg: 'rgba(34,197,94,0.12)',  text: '#118d57' },
      E: { bg: 'rgba(145,85,255,0.10)', text: '#6b35c0' },
    };
    const cfg = map[row.transportType] ?? { bg: 'rgba(145,158,171,0.12)', text: '#637381' };
    const label = TRANSPORT_LABEL[row.transportType] ?? row.transportType;
    return <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>{label}</span>;
  }
  if (key === 'barcode') {
    return (
      <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] truncate block font-mono">{row.barcode}</span>
    );
  }
  const v = (row as any)[key];
  const s = v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : '—';
  return (
    <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`} title={s}>
      {s}
    </p>
  );
}

// ── TAB1 表格元件 ─────────────────────────────────────────────────────────────
function ItemInquiryTab({ shipments }: { shipments: ShipmentRow[] }) {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // All item rows
  const allItemRows = useMemo(() => buildItemRows(shipments), [shipments]);

  // 欄位管理
  const loadCols = (): ItemCol[] => {
    try {
      const saved = localStorage.getItem(ITEM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ItemCol[];
        const validKeys = new Set(ITEM_DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as ItemColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = ITEM_DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return ITEM_DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns] = useState<ItemCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<ItemCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: ItemColKey | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 搜尋狀態
  const [searchVendorShipNo, setSearchVendorShipNo] = useState('');
  const [searchSapNo, setSearchSapNo] = useState('');
  const [searchDocSeq, setSearchDocSeq] = useState('');
  const [searchVendor, setSearchVendor] = useState('');

  useEffect(() => {
    if (!showColumnSelector) return;
    try { localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  const moveCol = useCallback((drag: ItemColKey, hover: ItemColKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, []);

  const updateWidth = useCallback((key: ItemColKey, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  // ── 雙擊自動最適欄寬 ───────────────────────────────────────────────────
  const autoFitWidth = (key: ItemColKey) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans", sans-serif') + 32 + 16;
    let maxDataW = 0;
    try {
      (allItemRows || []).forEach(row => {
        const raw = (row as any)[key];
        const val = raw !== undefined && raw !== null ? String(raw) : '';
        const w = measureTextWidth(val, '14px "Public Sans", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
    } catch { /* */ }
    const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  };

  const visibleColumns = columns.filter(c => c.visible !== false);

  const splitKw = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchesAny = (v: string, kws: string[]) => kws.some(kw => v.toLowerCase().includes(kw));

  const filteredData = useMemo(() => {
    let data = allItemRows;
    if (searchVendor) {
      const nameMap = new Map(MOCK_SHIPMENTS.map(r => [r.vendorCode, r.vendorName.replace(/\(.*\)/, '').trim()]));
      const vendorName = nameMap.get(searchVendor) ?? '';
      data = data.filter(r => r.vendorName === vendorName);
    }
    if (searchVendorShipNo.trim()) {
      const kws = splitKw(searchVendorShipNo);
      data = data.filter(r => matchesAny(r.vendorShipmentNo, kws));
    }
    if (searchSapNo.trim()) {
      const kws = splitKw(searchSapNo);
      data = data.filter(r => matchesAny(r.sapDeliveryNo, kws));
    }
    if (searchDocSeq.trim()) {
      const kws = splitKw(searchDocSeq);
      data = data.filter(r => matchesAny(r.orderDocSeq, kws));
    }
    if (appliedFilters.length > 0) {
      data = data.filter(row => appliedFilters.every(f => {
        const val = String((row as any)[f.column] ?? '').toLowerCase();
        const fv = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains': return val.includes(fv);
          case 'equals': return val === fv;
          case 'notEquals': return val !== fv;
          case 'startsWith': return val.startsWith(fv);
          case 'endsWith': return val.endsWith(fv);
          case 'isEmpty': return !val || val.trim() === '';
          case 'isNotEmpty': return val.trim() !== '';
          default: return true;
        }
      }));
    }
    return data;
  }, [allItemRows, searchVendor, searchVendorShipNo, searchSapNo, searchDocSeq, appliedFilters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String((a as any)[sortConfig.key!] ?? '');
      const bv = String((b as any)[sortConfig.key!] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

  const totalWidth = visibleColumns.reduce((s, c) => s + c.width, 0);
  const availableColsForFilter = columns.map(c => ({ key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible }));

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  return (
    <div className="flex flex-col h-full">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap px-[20px] pt-[16px] pb-[16px]">
        <SearchField label="廠商出貨單號" value={searchVendorShipNo} onChange={setSearchVendorShipNo} />
        <SearchField label="SAP送貨單號" value={searchSapNo} onChange={setSearchSapNo} />
        <SearchField label="單號序號" value={searchDocSeq} onChange={setSearchDocSeq} />
        <div className="flex-1 min-w-[180px] max-w-[260px]">
          <DropdownSelect
            label="廠商（編號）"
            value={searchVendor}
            onChange={setSearchVendor}
            options={VENDOR_OPTIONS}
            placeholder="全部"
            searchable={true}
          />
        </div>
      </div>

      {/* Toolbar */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => { setTempColumns(JSON.parse(JSON.stringify(columns))); setShowColumnSelector(!showColumnSelector); }}
        onFiltersClick={() => setShowFilterDialog(!showFilterDialog)}
        columnsButton={
          <ColumnSelector
            columns={tempColumns as any}
            onToggleColumn={(key) => setTempColumns(tempColumns.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={(all) => setTempColumns(tempColumns.map(c => ({ ...c, visible: all })))}
            onClose={() => setShowColumnSelector(false)}
            onApply={() => {
              setColumns(tempColumns);
              try { localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(tempColumns)); } catch { /* */ }
              setShowColumnSelector(false);
            }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={availableColsForFilter as any}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); }}
          />
        }
        onExportCsv={() => showToast(`已匯出 ${filteredData.length} 筆 (CSV)`)}
        onExportExcel={() => showToast(`已匯出 ${filteredData.length} 筆 (Excel)`)}
        actionButton={<div />}
      />

      {/* 表格 */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key} column={col} index={idx}
                  moveColumn={moveCol as any} updateColumnWidth={updateWidth as any}
                  autoFitWidth={autoFitWidth as any}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={(key) => setSortConfig(s => ({ key: key as ItemColKey, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}
                  isLast={idx === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType={DRAG_TYPE_ITEM}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginatedData.map((row, rowIdx) => (
              <div
                key={row.id}
                className={`flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${rowIdx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''}`}
                style={{ height: 52 }}
              >
                {visibleColumns.map((col, ci) => {
                  const isLast = ci === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width, minWidth: col.width }}
                      className={`flex items-center px-[12px] overflow-hidden ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}
                    >
                      {getItemCellValue(row, col.key)}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 空狀態 */}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的出貨明細</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* 分頁 */}
      <div className="shrink-0 flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page} totalItems={sortedData.length} itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ── TAB2 表格元件 ─────────────────────────────────────────────────────────────
function BoxInquiryTab({ shipments, onPrint }: { shipments: ShipmentRow[]; onPrint: (tab: PrintTab) => void }) {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const allBoxRows = useMemo(() => buildBoxRows(shipments), [shipments]);

  // 欄位管理
  const loadCols = (): BoxCol[] => {
    try {
      const saved = localStorage.getItem(BOX_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BoxCol[];
        const validKeys = new Set(BOX_DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as BoxColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = BOX_DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return BOX_DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns] = useState<BoxCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<BoxCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: BoxColKey | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 搜尋狀態（共用與 TAB1 相同的 4 個搜尋欄）
  const [searchVendorShipNo, setSearchVendorShipNo] = useState('');
  const [searchSapNo, setSearchSapNo] = useState('');
  const [searchDocSeq, setSearchDocSeq] = useState('');
  const [searchVendor, setSearchVendor] = useState('');

  useEffect(() => {
    if (!showColumnSelector) return;
    try { localStorage.setItem(BOX_STORAGE_KEY, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  const moveCol = useCallback((drag: BoxColKey, hover: BoxColKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, []);

  const updateWidth = useCallback((key: BoxColKey, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  // ── 雙擊自動最適欄寬 ───────────────────────────────────────────────────
  const autoFitWidth = (key: BoxColKey) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans", sans-serif') + 32 + 16;
    let maxDataW = 0;
    try {
      (allBoxRows || []).forEach(row => {
        const raw = (row as any)[key];
        const val = raw !== undefined && raw !== null ? String(raw) : '';
        const w = measureTextWidth(val, '14px "Public Sans", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
    } catch { /* */ }
    const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  };

  const visibleColumns = columns.filter(c => c.visible !== false);

  const splitKw = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchesAny = (v: string, kws: string[]) => kws.some(kw => v.toLowerCase().includes(kw));

  const filteredData = useMemo(() => {
    let data = allBoxRows;
    if (searchVendor) {
      const nameMap = new Map(MOCK_SHIPMENTS.map(r => [r.vendorCode, r.vendorName.replace(/\(.*\)/, '').trim()]));
      const vendorName = nameMap.get(searchVendor) ?? '';
      data = data.filter(r => r.vendorName === vendorName);
    }
    if (searchVendorShipNo.trim()) {
      const kws = splitKw(searchVendorShipNo);
      data = data.filter(r => matchesAny(r.vendorShipmentNo, kws));
    }
    if (searchSapNo.trim()) {
      const kws = splitKw(searchSapNo);
      data = data.filter(r => matchesAny(r.sapDeliveryNo, kws));
    }
    if (searchDocSeq.trim()) {
      const kws = splitKw(searchDocSeq);
      data = data.filter(r => matchesAny(r.orderDocSeq, kws));
    }
    if (appliedFilters.length > 0) {
      data = data.filter(row => appliedFilters.every(f => {
        const val = String((row as any)[f.column] ?? '').toLowerCase();
        const fv = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains': return val.includes(fv);
          case 'equals': return val === fv;
          case 'notEquals': return val !== fv;
          case 'startsWith': return val.startsWith(fv);
          case 'endsWith': return val.endsWith(fv);
          case 'isEmpty': return !val || val.trim() === '';
          case 'isNotEmpty': return val.trim() !== '';
          default: return true;
        }
      }));
    }
    return data;
  }, [allBoxRows, searchVendor, searchVendorShipNo, searchSapNo, searchDocSeq, appliedFilters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String((a as any)[sortConfig.key!] ?? '');
      const bv = String((b as any)[sortConfig.key!] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

  // Checkbox
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    isAllSelected ? paginatedData.forEach(r => next.delete(r.id)) : paginatedData.forEach(r => next.add(r.id));
    setSelectedIds(next);
  };
  const handleToggle = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const totalWidth = CHECKBOX_W + visibleColumns.reduce((s, c) => s + c.width, 0);
  const availableColsForFilter = columns.map(c => ({ key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible }));

  return (
    <div className="flex flex-col h-full">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap px-[20px] pt-[16px] pb-[16px]">
        <SearchField label="廠商出貨單號" value={searchVendorShipNo} onChange={setSearchVendorShipNo} />
        <SearchField label="SAP送貨單號" value={searchSapNo} onChange={setSearchSapNo} />
        <SearchField label="單號序號" value={searchDocSeq} onChange={setSearchDocSeq} />
        <div className="flex-1 min-w-[180px] max-w-[260px]">
          <DropdownSelect
            label="廠商（編號）"
            value={searchVendor}
            onChange={setSearchVendor}
            options={VENDOR_OPTIONS}
            placeholder="全部"
            searchable={true}
          />
        </div>
      </div>

      {/* Toolbar */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => { setTempColumns(JSON.parse(JSON.stringify(columns))); setShowColumnSelector(!showColumnSelector); }}
        onFiltersClick={() => setShowFilterDialog(!showFilterDialog)}
        columnsButton={
          <ColumnSelector
            columns={tempColumns as any}
            onToggleColumn={(key) => setTempColumns(tempColumns.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={(all) => setTempColumns(tempColumns.map(c => ({ ...c, visible: all })))}
            onClose={() => setShowColumnSelector(false)}
            onApply={() => {
              setColumns(tempColumns);
              try { localStorage.setItem(BOX_STORAGE_KEY, JSON.stringify(tempColumns)); } catch { /* */ }
              setShowColumnSelector(false);
            }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={availableColsForFilter as any}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); }}
          />
        }
        onExportCsv={() => showToast(`已匯出 ${filteredData.length} 筆 (CSV)`)}
        onExportExcel={() => showToast(`已匯出 ${filteredData.length} 筆 (Excel)`)}
        actionButton={<div />}
      />

      {/* 選取工具列（批次列印貼紙） */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">
          {/* Checkbox */}
          <div data-is-checkbox="true" className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W }}>
            <button data-is-checkbox="true" onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
              <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} />
            </button>
          </div>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] whitespace-nowrap mr-[4px]">
            {selectedIds.size} selected
          </span>
          {/* 列印中文貼紙 */}
          <span
            onClick={() => onPrint('zh-sticker')}
            className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
          >列印中文貼紙</span>
          <span className="text-[rgba(145,158,171,0.4)] select-none">|</span>
          {/* 列印英文貼紙 */}
          <span
            onClick={() => onPrint('en-sticker')}
            className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
          >列印英文貼紙</span>
        </div>
      )}

      {/* 表格 */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {/* Checkbox sticky */}
              <div
                data-is-checkbox="true"
                className="flex items-center justify-center shrink-0 bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)]"
                style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, height: 56, position: 'sticky', left: 0, zIndex: 20, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
              >
                {selectedIds.size === 0 && (
                  <CheckboxIcon checked={isAllSelected} onChange={handleSelectAll} />
                )}
              </div>
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key} column={col} index={idx}
                  moveColumn={moveCol as any} updateColumnWidth={updateWidth as any}
                  autoFitWidth={autoFitWidth as any}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={(key) => setSortConfig(s => ({ key: key as BoxColKey, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}
                  isLast={idx === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType={DRAG_TYPE_BOX}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginatedData.map((row, rowIdx) => (
              <div
                key={row.id}
                className={`flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] group transition-colors ${selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : rowIdx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''}`}
                style={{ height: 52 }}
              >
                {/* Checkbox cell */}
                <div
                  data-is-checkbox="true"
                  className="flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                  style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, position: 'sticky', left: 0, zIndex: 4, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
                  onClick={() => handleToggle(row.id)}
                >
                  <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => handleToggle(row.id)} />
                </div>
                {visibleColumns.map((col, ci) => {
                  const isLast = ci === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width, minWidth: col.width }}
                      className={`flex items-center px-[12px] overflow-hidden ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}
                    >
                      {getBoxCellValue(row, col.key)}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 空狀態 */}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的裝箱明細</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* 分頁 */}
      <div className="shrink-0 flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page} totalItems={sortedData.length} itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ── 主元件：兩個 TAB ──────────────────────────────────────────────────────────
export function ShipmentShippingInquiryPage() {
  const [activeTab, setActiveTab] = useState<'item' | 'box'>('item');
  // ── 列印頁導覽 ───────────────────────────────────────────────────────────
  const [printState, setPrintState] = useState<{ tab: PrintTab } | null>(null);

  // 讀取出貨單資料（同 ShipmentListPage 邏輯）
  const shipments = useMemo((): ShipmentRow[] => {
    try {
      const saved = JSON.parse(localStorage.getItem('createdShipments') || '[]') as ShipmentRow[];
      return [...MOCK_SHIPMENTS, ...saved];
    } catch {
      return MOCK_SHIPMENTS;
    }
  }, []);

  const tabs = [
    { id: 'item' as const, label: '出貨明細查詢' },
    { id: 'box'  as const, label: '裝箱明細查詢' },
  ];

  // ── 列印頁 early return ─────────────────────────────────────────────
  if (printState) {
    return (
      <ShipmentPrintPage
        vendorShipmentNo=""
        initialTab={printState.tab}
        tabs={['zh-sticker', 'en-sticker']}
        onBack={() => setPrintState(null)}
      />
    );
  }

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── TAB 列 ─────────────────────────────────────────────────────────── */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
          >
            {activeTab === tab.id && (
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            )}
            <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
              activeTab === tab.id ? 'text-[#1c252e]' : 'text-[#637381]'
            }`}>
              {tab.label}
            </p>
          </div>
        ))}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ── TAB 內容 ───────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'item'
          ? <ItemInquiryTab shipments={shipments} />
          : <BoxInquiryTab  shipments={shipments} onPrint={(tab) => setPrintState({ tab })} />
        }
      </div>
    </div>
  );
}
