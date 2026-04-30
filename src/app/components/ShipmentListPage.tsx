/**
 * ShipmentListPage — 出貨單管理 • 出貨單查詢
 *
 * 功能：
 *   - 搜尋列：廠商(DropdownSelect)、單號序號(關鍵字)、交貨日期(起/迄)
 *   - 表格欄位：廠商出貨單號(連結)、幣別、運輸型態、交貨日期、到貨日期、交貨地址、出貨項次數
 *   - 勾選後操作：刪除、重拋SAP
 *   - 標準表格系統（DnD拖拉+欄寬+Toolbar+分頁+多選）
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import svgCheckboxOn from '@/imports/svg-jk6epzc9me';
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
import { ShipmentInquiryDetailPage } from './ShipmentInquiryDetailPage';
import { ShipmentPrintPage, type PrintTab } from './ShipmentPrintPage';
import type { OrderRow } from './AdvancedOrderTable';

// ── 型別定義 ─────────────────────────────────────────────────────────────────

/** 出貨明細項次 */
export interface ShipmentDetailItem {
  itemNo: number;
  orderNo: string;
  orderSeq: string;
  materialNo: string;
  orderPendingQty: number;
  shipQty: number;
  qtyPerBox: number | string;
  totalBoxes: number;
  boxes: { boxNo: number; qty: number }[];
  netWeight: string;
  grossWeight: string;
  weightUnit: string;
  countryOfOrigin: string;
  receivedQty?: number;  // 累計收料量（倉庫進貨時回傳）
}

/** 出貨單列 */
export interface ShipmentRow {
  id: number;
  vendorShipmentNo: string;
  vendorCode: string;
  vendorName: string;
  currency: string;
  transportType: string;
  deliveryDate: string;
  arrivalDate: string;
  invoiceDate: string;
  deliveryAddress: string;
  sapDeliveryNo: string;
  createdAt?: string;        // 開立時間 YYYYMMDD HH:mm
  details: ShipmentDetailItem[];
  status: 'open' | 'sap_sent' | 'closed';
}

// ── 假資料 ────────────────────────────────────────────────────────────────────

/** 快速產生均分箱數明細 */
function mkBoxes(shipQty: number, perBox: number): { boxNo: number; qty: number }[] {
  if (shipQty <= 0 || perBox <= 0) return [];
  const n = Math.ceil(shipQty / perBox);
  return Array.from({ length: n }, (_, i) => ({
    boxNo: i + 1,
    qty: i < n - 1 ? perBox : shipQty - perBox * (n - 1),
  }));
}

export const MOCK_SHIPMENTS: ShipmentRow[] = [
  {
    id: 1,
    vendorShipmentNo: '91775295',
    vendorCode: '0001000641',
    vendorName: '華銘(0001000641)',
    currency: 'TWD',
    transportType: 'T',
    deliveryDate: '2025/06/20',
    arrivalDate: '2025/06/25',
    invoiceDate: '2025/06/18',
    deliveryAddress: '桃園市龜山區文化二路29號',
    sapDeliveryNo: '1720580792',
    createdAt: '2025/06/10 09:30',
    details: [
      { itemNo: 10, orderNo: '4500100001', orderSeq: '10', materialNo: '2201-FRM0641-A01', orderPendingQty: 50, shipQty: 50, qtyPerBox: 25, totalBoxes: 2, boxes: mkBoxes(50,25), netWeight: '2.5', grossWeight: '3.0', weightUnit: 'KG', countryOfOrigin: 'TW' },
      { itemNo: 20, orderNo: '4500100001', orderSeq: '20', materialNo: '3301-WHL0641-A02', orderPendingQty: 32, shipQty: 30, qtyPerBox: 10, totalBoxes: 3, boxes: mkBoxes(30,10), netWeight: '1.8', grossWeight: '2.2', weightUnit: 'KG', countryOfOrigin: 'TW' },
    ],
    status: 'open',
  },
  {
    id: 2,
    vendorShipmentNo: '91775296',
    vendorCode: '0001000641',
    vendorName: '華銘(0001000641)',
    currency: 'TWD',
    transportType: 'T',
    deliveryDate: '2025/06/20',
    arrivalDate: '2025/06/28',
    invoiceDate: '2025/06/18',
    deliveryAddress: '桃園市龜山區文化二路29號',
    sapDeliveryNo: '1720580793',
    details: [
      { itemNo: 10, orderNo: '4500100002', orderSeq: '10', materialNo: '4401-STM0641-B01', orderPendingQty: 100, shipQty: 100, qtyPerBox: 20, totalBoxes: 5, boxes: mkBoxes(100,20), netWeight: '1.2', grossWeight: '1.5', weightUnit: 'KG', countryOfOrigin: 'TW' },
    ],
    status: 'open',
  },
  {
    id: 3,
    vendorShipmentNo: '91775297',
    vendorCode: '0001000641',
    vendorName: '華銘(0001000641)',
    currency: 'TWD',
    transportType: 'S',
    deliveryDate: '2025/07/10',
    arrivalDate: '2025/07/20',
    invoiceDate: '2025/07/05',
    deliveryAddress: '台中市西屯區工業區一路100號',
    sapDeliveryNo: '1720580800',
    details: [
      { itemNo: 10, orderNo: '4500100003', orderSeq: '10', materialNo: '5501-BRK0641-C01', orderPendingQty: 200, shipQty: 200, qtyPerBox: 50, totalBoxes: 4, boxes: mkBoxes(200,50), netWeight: '0.8', grossWeight: '1.0', weightUnit: 'KG', countryOfOrigin: 'TW' },
      { itemNo: 20, orderNo: '4500100003', orderSeq: '20', materialNo: '6601-CHN0641-C02', orderPendingQty: 150, shipQty: 150, qtyPerBox: 30, totalBoxes: 5, boxes: mkBoxes(150,30), netWeight: '0.5', grossWeight: '0.7', weightUnit: 'KG', countryOfOrigin: 'TW' },
      { itemNo: 30, orderNo: '4500100004', orderSeq: '10', materialNo: '7701-CST0641-C03', orderPendingQty: 80,  shipQty: 80,  qtyPerBox: 20, totalBoxes: 4, boxes: mkBoxes(80,20),  netWeight: '2.0', grossWeight: '2.4', weightUnit: 'KG', countryOfOrigin: 'CN' },
    ],
    status: 'sap_sent',
  },
  {
    id: 4,
    vendorShipmentNo: 'SHP-2025-0045',
    vendorCode: '0001000045',
    vendorName: '佳承精密(0001000045)',
    currency: 'USD',
    transportType: 'A',
    deliveryDate: '2025/06/15',
    arrivalDate: '2025/06/18',
    invoiceDate: '2025/06/10',
    deliveryAddress: '新北市新店區北新路三段200號',
    sapDeliveryNo: '1720580760',
    details: [
      { itemNo: 10, orderNo: '4500200010', orderSeq: '10', materialNo: '8801-TIR0045-D01', orderPendingQty: 400, shipQty: 400, qtyPerBox: 100, totalBoxes: 4, boxes: mkBoxes(400,100), netWeight: '0.3', grossWeight: '0.4', weightUnit: 'KG', countryOfOrigin: 'JP', receivedQty: 400 },
    ],
    status: 'closed',
  },
  {
    id: 5,
    vendorShipmentNo: 'SHP-2025-0046',
    vendorCode: '0001000045',
    vendorName: '佳承精密(0001000045)',
    currency: 'USD',
    transportType: 'S',
    deliveryDate: '2025/07/05',
    arrivalDate: '2025/07/15',
    invoiceDate: '',
    deliveryAddress: '新北市新店區北新路三段200號',
    sapDeliveryNo: '',
    details: [
      { itemNo: 10, orderNo: '4500200011', orderSeq: '10', materialNo: '9901-HDL0045-E01', orderPendingQty: 60, shipQty: 60, qtyPerBox: 15, totalBoxes: 4, boxes: mkBoxes(60,15), netWeight: '0.6', grossWeight: '0.8', weightUnit: 'KG', countryOfOrigin: 'JP' },
      { itemNo: 20, orderNo: '4500200012', orderSeq: '10', materialNo: '1129-SAD0045-E02', orderPendingQty: 45, shipQty: 45, qtyPerBox: 15, totalBoxes: 3, boxes: mkBoxes(45,15), netWeight: '0.4', grossWeight: '0.5', weightUnit: 'KG', countryOfOrigin: 'JP' },
    ],
    status: 'open',
  },
  {
    id: 6,
    vendorShipmentNo: 'INV-20250610-001',
    vendorCode: '0001000053',
    vendorName: '久廣精密(0001000053)',
    currency: 'EUR',
    transportType: 'A',
    deliveryDate: '2025/06/10',
    arrivalDate: '2025/06/12',
    invoiceDate: '2025/06/05',
    deliveryAddress: '高雄市前鎮區中山三路12號',
    sapDeliveryNo: '1720580750',
    details: [
      { itemNo: 10, orderNo: '4500300020', orderSeq: '10', materialNo: '2201-FRK0053-F01', orderPendingQty: 20, shipQty: 20, qtyPerBox: 5, totalBoxes: 4, boxes: mkBoxes(20,5),   netWeight: '1.5', grossWeight: '2.0', weightUnit: 'KG', countryOfOrigin: 'DE' },
      { itemNo: 20, orderNo: '4500300021', orderSeq: '10', materialNo: '3301-DRL0053-F02', orderPendingQty: 35, shipQty: 35, qtyPerBox: 5, totalBoxes: 7, boxes: mkBoxes(35,5),   netWeight: '0.9', grossWeight: '1.1', weightUnit: 'KG', countryOfOrigin: 'DE' },
      { itemNo: 30, orderNo: '4500300022', orderSeq: '10', materialNo: '4401-GRP0053-F03', orderPendingQty: 150, shipQty: 150, qtyPerBox: 30, totalBoxes: 5, boxes: mkBoxes(150,30), netWeight: '0.2', grossWeight: '0.3', weightUnit: 'KG', countryOfOrigin: 'TW' },
      { itemNo: 40, orderNo: '4500300023', orderSeq: '10', materialNo: '5501-PED0053-F04', orderPendingQty: 80, shipQty: 80, qtyPerBox: 10, totalBoxes: 8, boxes: mkBoxes(80,10),  netWeight: '1.8', grossWeight: '2.2', weightUnit: 'KG', countryOfOrigin: 'TW' },
    ],
    status: 'sap_sent',
  },
  {
    id: 7,
    vendorShipmentNo: 'INV-20250620-002',
    vendorCode: '0001000059',
    vendorName: '金盛元工業(0001000059)',
    currency: 'TWD',
    transportType: 'T',
    deliveryDate: '2025/06/20',
    arrivalDate: '2025/06/23',
    invoiceDate: '2025/06/18',
    deliveryAddress: '彰化縣員林市員東路一段500號',
    sapDeliveryNo: '',
    details: [
      { itemNo: 10, orderNo: '4500400030', orderSeq: '10', materialNo: '6601-CHN0059-G01', orderPendingQty: 500, shipQty: 500, qtyPerBox: 50, totalBoxes: 10, boxes: mkBoxes(500,50), netWeight: '0.1', grossWeight: '0.15', weightUnit: 'KG', countryOfOrigin: 'TW' },
    ],
    status: 'open',
  },
  {
    id: 8,
    vendorShipmentNo: 'VND-2025-88001',
    vendorCode: '0001000012',
    vendorName: '台灣製造(0001000012)',
    currency: 'TWD',
    transportType: 'T',
    deliveryDate: '2025/08/01',
    arrivalDate: '2025/08/05',
    invoiceDate: '',
    deliveryAddress: '台中市西屯區工業區一路100號',
    sapDeliveryNo: '',
    details: [
      { itemNo: 10, orderNo: '4500500040', orderSeq: '10', materialNo: '7701-HDL0012-H01', orderPendingQty: 100, shipQty: 100, qtyPerBox: 25, totalBoxes: 4, boxes: mkBoxes(100,25), netWeight: '0.4', grossWeight: '0.5', weightUnit: 'KG', countryOfOrigin: 'TW' },
      { itemNo: 20, orderNo: '4500500041', orderSeq: '10', materialNo: '8801-FRM0012-H02', orderPendingQty: 80,  shipQty: 80,  qtyPerBox: 20, totalBoxes: 4, boxes: mkBoxes(80,20),  netWeight: '3.2', grossWeight: '3.8', weightUnit: 'KG', countryOfOrigin: 'TW' },
    ],
    status: 'open',
  },
  {
    id: 9,
    vendorShipmentNo: 'VND-2025-88002',
    vendorCode: '0001000046',
    vendorName: '速聯國際(0001000046)',
    currency: 'USD',
    transportType: 'S',
    deliveryDate: '2025/09/01',
    arrivalDate: '2025/09/15',
    invoiceDate: '',
    deliveryAddress: '桃園市龜山區文化二路29號',
    sapDeliveryNo: '',
    details: [
      { itemNo: 10, orderNo: '4500600050', orderSeq: '10', materialNo: '9901-BRK0046-I01', orderPendingQty: 30, shipQty: 30, qtyPerBox: 10, totalBoxes: 3, boxes: mkBoxes(30,10), netWeight: '1.1', grossWeight: '1.3', weightUnit: 'KG', countryOfOrigin: 'US' },
      { itemNo: 20, orderNo: '4500600051', orderSeq: '10', materialNo: '1129-FRK0046-I02', orderPendingQty: 25, shipQty: 25, qtyPerBox: 5,  totalBoxes: 5, boxes: mkBoxes(25,5),  netWeight: '2.0', grossWeight: '2.4', weightUnit: 'KG', countryOfOrigin: 'US' },
      { itemNo: 30, orderNo: '4500600052', orderSeq: '10', materialNo: '2201-FRM0046-I03', orderPendingQty: 10, shipQty: 10, qtyPerBox: 5,  totalBoxes: 2, boxes: mkBoxes(10,5),  netWeight: '4.5', grossWeight: '5.0', weightUnit: 'KG', countryOfOrigin: 'US' },
    ],
    status: 'open',
  },
  {
    id: 10,
    vendorShipmentNo: '91775300',
    vendorCode: '0001000641',
    vendorName: '華銘(0001000641)',
    currency: 'TWD',
    transportType: 'A',
    deliveryDate: '2025/05/28',
    arrivalDate: '2025/05/30',
    invoiceDate: '2025/05/25',
    deliveryAddress: '新北市新店區北新路三段200號',
    sapDeliveryNo: '1720580710',
    details: [
      { itemNo: 10, orderNo: '4500700060', orderSeq: '10', materialNo: '3301-STM0641-J01', orderPendingQty: 120, shipQty: 120, qtyPerBox: 40, totalBoxes: 3, boxes: mkBoxes(120,40), netWeight: '0.7', grossWeight: '0.9', weightUnit: 'KG', countryOfOrigin: 'TW', receivedQty: 120 },
    ],
    status: 'closed',
  },
  {
    id: 11,
    vendorShipmentNo: '91775301',
    vendorCode: '0001000641',
    vendorName: '華銘(0001000641)',
    currency: 'TWD',
    transportType: 'T',
    deliveryDate: '2025/06/20',
    arrivalDate: '2025/06/27',
    invoiceDate: '2025/06/17',
    deliveryAddress: '桃園市龜山區文化二路29號',
    sapDeliveryNo: '1720580820',
    details: [
      { itemNo: 10, orderNo: '4500800070', orderSeq: '10', materialNo: '4401-WHL0641-K01', orderPendingQty: 200, shipQty: 200, qtyPerBox: 40, totalBoxes: 5, boxes: mkBoxes(200,40), netWeight: '1.2', grossWeight: '1.5', weightUnit: 'KG', countryOfOrigin: 'TW', receivedQty: 200 },
      { itemNo: 20, orderNo: '4500800070', orderSeq: '20', materialNo: '5501-RIM0641-K02', orderPendingQty: 200, shipQty: 200, qtyPerBox: 40, totalBoxes: 5, boxes: mkBoxes(200,40), netWeight: '0.8', grossWeight: '1.0', weightUnit: 'KG', countryOfOrigin: 'TW', receivedQty: 50 },
      { itemNo: 30, orderNo: '4500800071', orderSeq: '10', materialNo: '6601-TIR0641-K03', orderPendingQty: 400, shipQty: 400, qtyPerBox: 50, totalBoxes: 8, boxes: mkBoxes(400,50), netWeight: '0.5', grossWeight: '0.7', weightUnit: 'KG', countryOfOrigin: 'CN' },
      { itemNo: 40, orderNo: '4500800071', orderSeq: '20', materialNo: '7701-TUB0641-K04', orderPendingQty: 400, shipQty: 400, qtyPerBox: 50, totalBoxes: 8, boxes: mkBoxes(400,50), netWeight: '0.2', grossWeight: '0.3', weightUnit: 'KG', countryOfOrigin: 'CN' },
      { itemNo: 50, orderNo: '4500800072', orderSeq: '10', materialNo: '8801-VAL0641-K05', orderPendingQty: 800, shipQty: 800, qtyPerBox: 100, totalBoxes: 8, boxes: mkBoxes(800,100), netWeight: '0.05', grossWeight: '0.08', weightUnit: 'KG', countryOfOrigin: 'TW' },
    ],
    status: 'sap_sent',
  },
];

// ── 廠商選項（從假資料動態建立） ───────────────────────────────────────────────

const VENDOR_OPTIONS = [
  { value: '', label: '全部' },
  ...Array.from(new Map(MOCK_SHIPMENTS.map(r => [r.vendorCode, r])).values()).map(r => ({
    value: r.vendorCode,
    label: r.vendorName,
  })),
];

// ── 欄位定義 ──────────────────────────────────────────────────────────────────

type ShipColKey =
  | 'vendorShipmentNo'
  | 'currency'
  | 'transportType'
  | 'deliveryDate'
  | 'arrivalDate'
  | 'deliveryAddress'
  | 'createdAt'
  | 'detailCount';

interface ShipCol {
  key: ShipColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

const DEFAULT_COLS: ShipCol[] = [
  { key: 'currency',        label: '幣別',       width: 70,  minWidth: 60  },
  { key: 'transportType',   label: '運輸型態',   width: 100, minWidth: 80  },
  { key: 'deliveryDate',    label: '交貨日期',   width: 120, minWidth: 100 },
  { key: 'arrivalDate',     label: '到貨日期',   width: 120, minWidth: 100 },
  { key: 'deliveryAddress', label: '交貨地址',   width: 300, minWidth: 150 },
  { key: 'createdAt',       label: '開立時間',   width: 150, minWidth: 120 },
  { key: 'detailCount',     label: '出貨項次數', width: 110, minWidth: 90  },
];

const STORAGE_KEY = 'shipmentList_v2_cols';
const CHECKBOX_W   = 52;
const VENDOR_NO_W  = 160; // 廠商出貨單號 (sticky)
const VENDOR_COL_W = 200; // 廠商名稱 (sticky)


// ── Cell 渲染 ─────────────────────────────────────────────────────────────────

function getCellValue(row: ShipmentRow, key: ShipColKey): React.ReactNode {
  if (key === 'transportType') {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      S: { label: 'S 海運', bg: 'rgba(0,120,212,0.10)',  text: '#0068b8' },
      A: { label: 'A 空運', bg: 'rgba(255,171,0,0.12)',  text: '#b76e00' },
      T: { label: 'T 陸運', bg: 'rgba(34,197,94,0.12)',  text: '#118d57' },
    };
    const cfg = map[row.transportType] ?? { label: row.transportType, bg: 'rgba(145,158,171,0.12)', text: '#637381' };
    return (
      <span
        className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold"
        style={{ backgroundColor: cfg.bg, color: cfg.text }}
      >
        {cfg.label}
      </span>
    );
  }
  if (key === 'detailCount') {
    const count = row.details.length;
    return (
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e]">
        {count}
      </p>
    );
  }
  if (key === 'createdAt') {
    const s = row.createdAt && row.createdAt.trim() !== '' ? row.createdAt : '—';
    return (
      <p
        className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`}
        title={s}
      >
        {s}
      </p>
    );
  }
  const v = row[key as keyof ShipmentRow];
  const s = v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : '—';
  return (
    <p
      className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`}
      title={s}
    >
      {s}
    </p>
  );
}

// ── 刪除確認 Modal ──────────────────────────────────────────────────────────

function DeleteConfirmModal({
  selectedCount,
  onConfirm,
  onCancel,
}: {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ width: 420 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-[24px] pt-[24px] pb-[20px]">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div className="w-[44px] h-[44px] rounded-full bg-[rgba(255,86,48,0.12)] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <div>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">確認刪除出貨單</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] mt-[2px]">此操作無法復原</p>
            </div>
          </div>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] leading-[22px]">
            即將刪除 <span className="font-semibold text-[#ff5630]">{selectedCount}</span> 筆出貨單，確認要繼續嗎？
          </p>
        </div>
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)]">
          <button
            onClick={onCancel}
            className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="h-[36px] px-[16px] rounded-[8px] bg-[#ff5630] hover:bg-[#b71d18] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 重拋SAP 確認 Modal ─────────────────────────────────────────────────────

function ResendSapModal({
  selectedCount,
  onConfirm,
  onCancel,
}: {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ width: 420 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-[24px] pt-[24px] pb-[20px]">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div className="w-[44px] h-[44px] rounded-full bg-[rgba(0,94,184,0.08)] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.08"/>
              </svg>
            </div>
            <div>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">重拋 SAP</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] mt-[2px]">將出貨資料重新傳送至 SAP</p>
            </div>
          </div>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] leading-[22px]">
            即將重拋 <span className="font-semibold text-[#005eb8]">{selectedCount}</span> 筆出貨單至 SAP，確認要繼續嗎？
          </p>
        </div>
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)]">
          <button
            onClick={onCancel}
            className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="h-[36px] px-[16px] rounded-[8px] bg-[#005eb8] hover:bg-[#004a94] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors"
          >
            確認重拋
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────

export function ShipmentListPage() {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── 明細頁導覽 ────────────────────────────────────────────────────────────
  const [detailShipment, setDetailShipment] = useState<ShipmentRow | null>(null);
  const [detailOrders, setDetailOrders] = useState<OrderRow[]>([]);
  // ── 列印頁導覽 ────────────────────────────────────────────────────────────
  const [printState, setPrintState] = useState<{ vendorShipmentNo: string; tab: PrintTab } | null>(null);

  // ── 欄位管理 ──────────────────────────────────────────────────────────────
  const loadCols = (): ShipCol[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ShipCol[];
        const validKeys = new Set(DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as ShipColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns] = useState<ShipCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<ShipCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: ShipColKey | null; dir: 'asc' | 'desc' | null }>({ key: 'createdAt', dir: 'desc' });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shipments, setShipments] = useState<ShipmentRow[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('createdShipments') || '[]') as ShipmentRow[];
      return [...MOCK_SHIPMENTS, ...saved];
    } catch {
      return MOCK_SHIPMENTS;
    }
  });

  // Modal 狀態
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);

  // ── 搜尋狀態 ──────────────────────────────────────────────────────────────
  const [searchVendor, setSearchVendor] = useState('');
  const [searchVendorShipNo, setSearchVendorShipNo] = useState('');
  const [searchDocNo, setSearchDocNo] = useState('');
  const [deliveryDateFrom, setDeliveryDateFrom] = useState('');
  const [deliveryDateTo, setDeliveryDateTo] = useState('');

  useEffect(() => {
    if (!showColumnSelector) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  const moveCol = useCallback((drag: ShipColKey, hover: ShipColKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, []);

  const updateWidth = useCallback((key: ShipColKey, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  // ── 雙擊自動最適欄寬 ───────────────────────────────────────────────────
  const autoFitWidth = (key: ShipColKey) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 32 + 16;
    let maxDataW = 0;
    try {
      (filteredData || []).forEach(row => {
        const raw = key === 'detailCount' ? String(row.details.length) : String((row as any)[key] ?? '');
        const w = measureTextWidth(raw, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
    } catch { /* data may not be available yet */ }
    const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  };

  const visibleColumns = columns.filter(c => c.visible !== false);

  // ── 資料篩選 ──────────────────────────────────────────────────────────────
  const splitKeywords = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchesAny = (v: string, kws: string[]) => kws.some(kw => v.toLowerCase().includes(kw));

  const filteredData = useMemo(() => {
    let data = shipments;
    if (searchVendor) {
      data = data.filter(r => r.vendorCode === searchVendor);
    }
    if (searchDocNo.trim()) {
      const kws = splitKeywords(searchDocNo);
      data = data.filter(r =>
        r.details.some(d => {
          const docSeq = `${d.orderNo ?? ''}${d.orderSeq ?? ''}`.toLowerCase();
          return kws.some(kw => docSeq.includes(kw));
        })
      );
    }
    if (searchVendorShipNo.trim()) {
      const kw = searchVendorShipNo.trim().toLowerCase();
      data = data.filter(r => r.vendorShipmentNo.toLowerCase().includes(kw));
    }
    if (deliveryDateFrom.trim()) {
      data = data.filter(r => r.deliveryDate >= deliveryDateFrom.replace(/-/g, '/'));
    }
    if (deliveryDateTo.trim()) {
      data = data.filter(r => r.deliveryDate <= deliveryDateTo.replace(/-/g, '/'));
    }
    if (appliedFilters.length > 0) {
      data = data.filter(row => appliedFilters.every(f => {
        let val: string;
        if (f.column === 'detailCount') {
          val = String(row.details.length);
        } else {
          val = String(row[f.column as keyof ShipmentRow] ?? '').toLowerCase();
        }
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
  }, [shipments, searchVendor, searchVendorShipNo, searchDocNo, deliveryDateFrom, deliveryDateTo, appliedFilters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      let av: string;
      let bv: string;
      if (sortConfig.key === 'detailCount') {
        av = String(a.details.length);
        bv = String(b.details.length);
      } else {
        av = String(a[sortConfig.key as keyof ShipmentRow] ?? '');
        bv = String(b[sortConfig.key as keyof ShipmentRow] ?? '');
      }
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

  // ── Checkbox ─────────────────────────────────────────────────────────────
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    isAllSelected ? paginatedData.forEach(r => next.delete(r.id)) : paginatedData.forEach(r => next.add(r.id));
    setSelectedIds(next);
  };

  const handleToggle = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // ── Toast ────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 刪除 ──────────────────────────────────────────────────────────────────
  // 判斷所選出貨單是否有任一筆含有累計收料量（不可刪除）
  const hasReceivedInSelected = useMemo(() => {
    return shipments
      .filter(r => selectedIds.has(r.id))
      .some(r => r.details.some(d => (d.receivedQty ?? 0) > 0));
  }, [shipments, selectedIds]);

  const handleDeleteConfirm = () => {
    const count = selectedIds.size;
    setShipments(prev => prev.filter(r => !selectedIds.has(r.id)));
    // 同步刪除 localStorage 中的使用者建立出貨單
    try {
      const saved = JSON.parse(localStorage.getItem('createdShipments') || '[]') as { id: number }[];
      const filtered = saved.filter(s => !selectedIds.has(s.id));
      localStorage.setItem('createdShipments', JSON.stringify(filtered));
    } catch { /* ignore */ }
    setSelectedIds(new Set());
    setShowDeleteModal(false);
    showToast(`已刪除 ${count} 筆出貨單`);
  };

  // ── 重拋SAP ───────────────────────────────────────────────────────────────
  const handleResendSapConfirm = () => {
    const count = selectedIds.size;
    setShipments(prev => prev.map(r =>
      selectedIds.has(r.id) ? { ...r, status: 'sap_sent' as const } : r
    ));
    setSelectedIds(new Set());
    setShowResendModal(false);
    showToast(`已重拋 ${count} 筆出貨單至 SAP`);
  };

  const totalWidth = CHECKBOX_W + VENDOR_NO_W + VENDOR_COL_W + visibleColumns.reduce((s, c) => s + c.width, 0);

  const availableColsForFilter = columns.map(c => ({
    key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible,
  }));

  // ── 明細頁 handlers ─────────────────────────────────────────────────────────
  const handleOpenDetail = (row: ShipmentRow) => {
    setDetailOrders([]);
    setDetailShipment(row);
  };

  const handleDetailDeleted = (id: number) => {
    setShipments(prev => prev.filter(r => r.id !== id));
    setDetailShipment(null);
    setDetailOrders([]);
  };

  // ── 編輯儲存（刪除出貨項次後同步資料）────────────────────────────────────
  const handleEditSave = (shipmentId: number, updatedDetails: ShipmentRow['details']) => {
    setShipments(prev => prev.map(r =>
      r.id === shipmentId ? { ...r, details: updatedDetails } : r
    ));
    // 同步更新 localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('createdShipments') || '[]') as ShipmentRow[];
      const updated = saved.map(s =>
        s.id === shipmentId ? { ...s, details: updatedDetails } : s
      );
      localStorage.setItem('createdShipments', JSON.stringify(updated));
    } catch { /* ignore */ }
    // 同步更新 detailShipment（讓畫面即時反映）
    setDetailShipment(prev => prev ? { ...prev, details: updatedDetails } : prev);
  };

  // 所有 hooks 已完整宣告，此處 early return 安全

  // ── 列印頁 early return ──────────────────────────────────────────────
  if (printState) {
    return (
      <ShipmentPrintPage
        vendorShipmentNo={printState.vendorShipmentNo}
        initialTab={printState.tab}
        onBack={() => setPrintState(null)}
      />
    );
  }

  if (detailShipment) {
    return (
      <ShipmentInquiryDetailPage
        shipment={detailShipment}
        onClose={() => { setDetailShipment(null); setDetailOrders([]); }}
        onDelete={() => handleDetailDeleted(detailShipment.id)}
        onEditSave={(updatedDetails) => handleEditSave(detailShipment.id, updatedDetails)}
        onPrint={(tab) => setPrintState({ vendorShipmentNo: detailShipment.vendorShipmentNo, tab })}
      />
    );
  }

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列 ── */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap pl-[20px] pr-[20px] pt-[20px] pb-[16px] border-b border-[rgba(145,158,171,0.08)]">
        <div className="flex-1 min-w-[180px] max-w-[240px]">
          <DropdownSelect
            label="廠商"
            value={searchVendor}
            onChange={setSearchVendor}
            options={VENDOR_OPTIONS}
            placeholder="全部"
            searchable={true}
          />
        </div>
        <SearchField label="廠商出貨單號" value={searchVendorShipNo} onChange={setSearchVendorShipNo} />
        <SearchField label="單號序號" value={searchDocNo} onChange={setSearchDocNo} />
        <SearchField label="交貨日期(起)" value={deliveryDateFrom} onChange={setDeliveryDateFrom} type="date" />
        <SearchField label="交貨日期(迄)" value={deliveryDateTo} onChange={setDeliveryDateTo} type="date" />
      </div>

      {/* ── Toolbar ── */}
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
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tempColumns)); } catch { /* */ }
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
            onApply={(vf) => { setAppliedFilters(vf); setShowFilterDialog(false); }}
          />
        }
        onExportExcel={() => {
          // 產生 CSV 內容（Excel 可直接開啟）
          const exportCols = [
            { key: 'vendorShipmentNo', label: '廠商出貨單號' },
            { key: 'vendorName',       label: '廠商名稱' },
            { key: 'currency',         label: '幣別' },
            { key: 'transportType',    label: '運輸型態' },
            { key: 'deliveryDate',     label: '交貨日期' },
            { key: 'arrivalDate',      label: '到貨日期' },
            { key: 'invoiceDate',      label: 'Invoice日期' },
            { key: 'deliveryAddress',  label: '交貨地址' },
            { key: 'sapDeliveryNo',    label: 'SAP交貨單號' },
            { key: 'status',           label: '狀態' },
            { key: 'detailCount',      label: '出貨項次數' },
          ];
          const statusLabel = (s: string) => ({ open: '開立', sap_sent: '已拋SAP', closed: '已結案' }[s] ?? s);
          const header = exportCols.map(c => `"${c.label}"`).join(',');
          const rows = filteredData.map(row =>
            exportCols.map(c => {
              let v: string;
              if (c.key === 'detailCount') v = String(row.details.length);
              else if (c.key === 'status') v = statusLabel(row.status);
              else v = String((row as any)[c.key] ?? '');
              return `"${v.replace(/"/g, '""')}"`;
            }).join(',')
          );
          const csv = '\uFEFF' + [header, ...rows].join('\r\n');
          const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `出貨單_${new Date().toISOString().slice(0,10)}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast(`已匯出 ${filteredData.length} 筆 (Excel)`);
        }}
        onExportCsv={() => {
          const exportCols = [
            { key: 'vendorShipmentNo', label: '廠商出貨單號' },
            { key: 'vendorName',       label: '廠商名稱' },
            { key: 'currency',         label: '幣別' },
            { key: 'transportType',    label: '運輸型態' },
            { key: 'deliveryDate',     label: '交貨日期' },
            { key: 'arrivalDate',      label: '到貨日期' },
            { key: 'invoiceDate',      label: 'Invoice日期' },
            { key: 'deliveryAddress',  label: '交貨地址' },
            { key: 'sapDeliveryNo',    label: 'SAP交貨單號' },
            { key: 'status',           label: '狀態' },
            { key: 'detailCount',      label: '出貨項次數' },
          ];
          const statusLabel = (s: string) => ({ open: '開立', sap_sent: '已拋SAP', closed: '已結案' }[s] ?? s);
          const header = exportCols.map(c => `"${c.label}"`).join(',');
          const rows = filteredData.map(row =>
            exportCols.map(c => {
              let v: string;
              if (c.key === 'detailCount') v = String(row.details.length);
              else if (c.key === 'status') v = statusLabel(row.status);
              else v = String((row as any)[c.key] ?? '');
              return `"${v.replace(/"/g, '""')}"`;
            }).join(',')
          );
          const csv = '\uFEFF' + [header, ...rows].join('\r\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `出貨單_${new Date().toISOString().slice(0,10)}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast(`已匯出 ${filteredData.length} 筆 (CSV)`);
        }}
        actionButton={<div />}
      />

      {/* ── 選取工具列（完全對齊 AdvancedOrderTable TableOrderHead 規範） ── */}
      {selectedIds.size > 0 && (
        <div
          className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)]"
          style={{ background: 'rgba(0,94,184,0.16)' }}
        >
          {/* Figma checkbox-on 圖示（同 AdvancedOrderTable） */}
          <div data-is-checkbox="true" className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W }}>
            <button data-is-checkbox="true" onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 16.6667 16.6667" fill="none">
                <path clipRule="evenodd" d={svgCheckboxOn.p2dde97c0} fill="#005EB8" fillRule="evenodd" />
              </svg>
            </button>
          </div>
          {/* X selected 文字 */}
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] mr-[4px] whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          {/* 刪除單：紅色文字 */}
          <button
            data-is-checkbox="true"
            onClick={() => hasReceivedInSelected ? showToast('所選出貨單中有項次已有累計收料量，不可刪除') : setShowDeleteModal(true)}
            className={`font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] leading-[24px] whitespace-nowrap select-none px-[10px] py-[16px] transition-opacity ${
              hasReceivedInSelected ? 'text-[#919eab] cursor-not-allowed' : 'text-[#ff5630] cursor-pointer hover:opacity-70'
            }`}
          >
            刪除
          </button>
          {/* 分隔線 */}
          <div className="h-[30px] w-[1px] bg-[#919eab] mx-[2px] opacity-30" />
          {/* 重拋SAP：藍色文字 */}
          <button
            data-is-checkbox="true"
            onClick={() => setShowResendModal(true)}
            className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
          >
            重拋SAP
          </button>
        </div>
      )}

      {/* ── 表格 ── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>

            {/* ── 表頭 ── */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {/* Checkbox sticky — 有選取時隱藏（規範同 AdvancedOrderTable：selectedIds > 0 時表頭只留空格）*/}
              <div
                data-is-checkbox="true"
                className="flex items-center justify-center shrink-0 bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)]"
                style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, height: 56, position: 'sticky', left: 0, zIndex: 20, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
              >
                {selectedIds.size === 0 && (
                  <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} />
                )}
              </div>
              {/* 廠商出貨單號 sticky */}
              <div
                className="flex items-center px-[16px] bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)] shrink-0 cursor-pointer select-none"
                style={{ width: VENDOR_NO_W, minWidth: VENDOR_NO_W, height: 56, position: 'sticky', left: CHECKBOX_W, zIndex: 19, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.12)' }}
                onClick={() => setSortConfig(s => ({ key: 'vendorShipmentNo' as ShipColKey, dir: s.key === 'vendorShipmentNo' && s.dir === 'asc' ? 'desc' : 'asc' }))}
              >
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap">
                  廠商出貨單號
                </p>
              </div>
              {/* 廠商 */}
              <div
                className="flex items-center px-[16px] bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)] shrink-0 cursor-pointer select-none"
                style={{ width: VENDOR_COL_W, minWidth: VENDOR_COL_W, height: 56 }}
                onClick={() => setSortConfig(s => ({ key: 'vendorShipmentNo' as ShipColKey, dir: s.key === 'vendorShipmentNo' && s.dir === 'asc' ? 'desc' : 'asc' }))}
              >
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap">
                  廠商
                </p>
              </div>
              {/* 一般欄 DnD */}
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key} column={col} index={idx}
                  moveColumn={moveCol} updateColumnWidth={updateWidth} autoFitWidth={autoFitWidth}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={(key) => setSortConfig(s => ({ key: key as any, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}
                  isLast={idx === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType="shipment-col"
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* ── 資料列 ── */}
            {paginatedData.map(row => (
              <div
                key={row.id}
                className={`flex border-b border-[rgba(145,158,171,0.08)] h-[76px] hover:bg-[rgba(145,158,171,0.04)] group transition-colors ${selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : ''}`}
              >
                {/* Checkbox cell */}
                <div
                  data-is-checkbox="true"
                  className="flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                  style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, position: 'sticky', left: 0, zIndex: 4, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
                >
                  <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => handleToggle(row.id)} />
                </div>
                {/* 廠商出貨單號（藍字連結） sticky */}
                <div
                  className="flex items-center px-[16px] border-r border-[rgba(145,158,171,0.08)] shrink-0 bg-white group-hover:bg-[#f6f7f8]"
                  style={{ width: VENDOR_NO_W, minWidth: VENDOR_NO_W, position: 'sticky', left: CHECKBOX_W, zIndex: 3, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.12)' }}
                >
                  <button
                    className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] cursor-pointer truncate text-left w-full"
                    title={row.vendorShipmentNo}
                    onClick={(e) => { e.stopPropagation(); handleOpenDetail(row); }}
                  >
                    {row.vendorShipmentNo}
                  </button>
                </div>
                {/* 廠商名稱 */}
                <div
                  className="flex items-center px-[16px] border-r border-[rgba(145,158,171,0.08)] shrink-0"
                  style={{ width: VENDOR_COL_W, minWidth: VENDOR_COL_W }}
                >
                  <p
                    className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full"
                    title={row.vendorName}
                  >
                    {row.vendorName}
                  </p>
                </div>
                {/* 一般欄 */}
                {visibleColumns.map((col, ci) => {
                  const isLast = ci === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                      className={`flex items-center px-[16px] overflow-hidden ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
                    >
                      {getCellValue(row, col.key)}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 空狀態 */}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的出貨單</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── 分頁 ── */}
      <div className="shrink-0 flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page} totalItems={sortedData.length} itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>

      {/* ── 刪除 Modal ── */}
      {showDeleteModal && (
        <DeleteConfirmModal
          selectedCount={selectedIds.size}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* ── 重拋SAP Modal ── */}
      {showResendModal && (
        <ResendSapModal
          selectedCount={selectedIds.size}
          onConfirm={handleResendSapConfirm}
          onCancel={() => setShowResendModal(false)}
        />
      )}

      {/* ── Toast ── */}
      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-10.5l-5 5L6 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
