/**
 * ReceivingInquiryPage — Overview • 收料查詢
 *
 * TAB1：已出貨未收料（廠商已有出貨單，驗收量 = 0）
 * TAB2：延遲到貨
 * TAB3：委外加工單狀況（訂單類型 = Z3YD）
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import { PaginationControls } from './PaginationControls';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';
import { OrderDetail } from './OrderDetail';
import { ShipmentDetailPage } from './ShipmentDetailPage';
import type { CsvPrefillData } from './ShipmentDetailPage';

// ── 型別 ─────────────────────────────────────────────────────────────────────

type ReceivingTab = 'shipped-not-received' | 'should-ship-not-shipped' | 'outsource';

type RecvColKey =
  | 'company'
  | 'purchaseOrg'
  | 'orderType'
  | 'vendorCode'
  | 'orderDocSeq'
  | 'materialNo'
  | 'productName'
  | 'specification'
  | 'orderQty'
  | 'shipQty'
  | 'vendorShipmentNo'
  | 'deliveryDate';

// ── 應出貨未出貨 型別 ────────────────────────────────────────────────────────
type DeliveryDateType = 'expectedDelivery' | 'vendorCanDeliverDate' | 'pmDeliveryDate';

type ShouldShipColKey =
  | 'company'
  | 'purchaseOrg'
  | 'orderStatus'
  | 'vendorCode'
  | 'orderDocSeq'
  | 'orderSeq'
  | 'itemNo'
  | 'materialNo'
  | 'productName'
  | 'specification'
  | 'orderQty'
  | 'shipQty'
  | 'expectedDelivery'
  | 'vendorCanDeliverDate'
  | 'pmDeliveryDate'
  | 'delayDays'
  | 'acceptQty'
  | 'delayQty';

interface ShouldShipCol {
  key: ShouldShipColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

export interface ShouldShipRow {
  id: string;
  company: string;
  purchaseOrg: string;
  orderStatus: 'CK' | 'CL';
  vendorCode: string;
  vendorName: string;
  orderNo: string;
  orderSeq: string;
  orderDocSeq: string;
  itemNo: string;           // 項次
  materialNo: string;
  productName: string;
  specification: string;
  orderQty: number;
  shipQty: number;          // 預計出貨量（待出）
  acceptQty: number;              // 驗收量
  expectedDelivery: string;       // 預計交期
  vendorCanDeliverDate: string;   // 廠商可交貨日期
  pmDeliveryDate: string;         // 生管用日期
}

// ── 委外加工單狀況 型別 ──────────────────────────────────────────────────────
type OutsourceColKey =
  | 'vendorCode'
  | 'purchaseOrg'
  | 'orderStatus'
  | 'orderDocSeq'
  | 'itemNo'
  | 'vendorShipmentNo'
  | 'materialNo'
  | 'productName'
  | 'specification'
  | 'orderQty'
  | 'shipQty'
  | 'acceptQty'
  | 'delayQty'
  | 'deliveryDate'
  | 'expectedDelivery'
  | 'vendorCanDeliverDate'
  | 'pmDeliveryDate'
  | 'receiptDate'
  | 'isReceived';

interface OutsourceCol {
  key: OutsourceColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface OutsourceRow {
  id: string;
  purchaseOrg: string;
  orderStatus: 'CK' | 'CL';
  vendorCode: string;
  vendorName: string;
  orderNo: string;
  orderSeq: string;
  orderDocSeq: string;
  itemNo: string;
  vendorShipmentNo: string;
  materialNo: string;
  productName: string;
  specification: string;
  orderQty: number;
  shipQty: number;
  acceptQty: number;
  deliveryDate: string;
  expectedDelivery: string;
  vendorCanDeliverDate: string;
  pmDeliveryDate: string;
  receiptDate: string;
}

interface RecvCol {
  key: RecvColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

export interface ReceivingRow {
  id: string;
  company: string;
  purchaseOrg: string;
  orderType: string;
  vendorCode: string;
  vendorName: string; // for search
  orderNo: string;
  orderSeq: string;
  orderDocSeq: string; // = orderNo + orderSeq display
  materialNo: string;
  productName: string;
  specification: string;
  orderQty: number;
  shipQty: number;
  vendorShipmentNo: string;
  deliveryDate: string;
  acceptQty: number; // should be 0 for this tab
}

// ── Mock 資料 ─────────────────────────────────────────────────────────────────

export const MOCK_RECEIVING_ROWS: ReceivingRow[] = [
  {
    id: 'r-001',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500100001',
    orderSeq: '10',
    orderDocSeq: '450010000110',
    materialNo: '2201-FRM0641-A01',
    productName: '鋁合金車架',
    specification: 'ROAD FRAME ALLOY 700C SIZE M MATTE BLACK',
    orderQty: 50,
    shipQty: 50,
    vendorShipmentNo: '91775295',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-002',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500100001',
    orderSeq: '20',
    orderDocSeq: '450010000120',
    materialNo: '3301-WHL0641-A02',
    productName: '輪組',
    specification: 'WHEELSET 700C DISC BRAKE 12X100/142 BLACK',
    orderQty: 32,
    shipQty: 30,
    vendorShipmentNo: '91775295',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-003',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500100002',
    orderSeq: '10',
    orderDocSeq: '450010000210',
    materialNo: '4401-STM0641-B01',
    productName: '車把立管',
    specification: 'STEM ALLOY 31.8mm±6° 100mm SILVER',
    orderQty: 100,
    shipQty: 100,
    vendorShipmentNo: '91775296',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-004',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500800070',
    orderSeq: '20',
    orderDocSeq: '450080007020',
    materialNo: '5501-RIM0641-K02',
    productName: '輪框',
    specification: 'RIM ALLOY 700C 32H DISC SILVER',
    orderQty: 200,
    shipQty: 200,
    vendorShipmentNo: '91775301',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-005',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500800071',
    orderSeq: '10',
    orderDocSeq: '450080007110',
    materialNo: '6601-TIR0641-K03',
    productName: '車胎',
    specification: 'TIRE 700x23C FOLDING BEAD BLACK',
    orderQty: 400,
    shipQty: 400,
    vendorShipmentNo: '91775301',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-006',
    company: '捷安特',
    purchaseOrg: 'GIANT採購',
    orderType: 'NB',
    vendorCode: '0001000045',
    vendorName: '佳承精密',
    orderNo: '4500200011',
    orderSeq: '10',
    orderDocSeq: '450020001110',
    materialNo: '9901-HDL0045-E01',
    productName: '把手組',
    specification: 'HANDLEBAR 700mm FLAT ALLOY 31.8 BLACK',
    orderQty: 60,
    shipQty: 60,
    vendorShipmentNo: 'SHP-2025-0046',
    deliveryDate: '2025/07/05',
    acceptQty: 0,
  },
  {
    id: 'r-007',
    company: '捷安特',
    purchaseOrg: 'GIANT採購',
    orderType: 'NB',
    vendorCode: '0001000045',
    vendorName: '佳承精密',
    orderNo: '4500200012',
    orderSeq: '10',
    orderDocSeq: '450020001210',
    materialNo: '1129-SAD0045-E02',
    productName: '坐墊',
    specification: 'SADDLE RACING 143mm BLACK',
    orderQty: 45,
    shipQty: 45,
    vendorShipmentNo: 'SHP-2025-0046',
    deliveryDate: '2025/07/05',
    acceptQty: 0,
  },
  {
    id: 'r-008',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'SB',
    vendorCode: '0001000053',
    vendorName: '久廣精密',
    orderNo: '4500300020',
    orderSeq: '10',
    orderDocSeq: '450030002010',
    materialNo: '2201-FRK0053-F01',
    productName: '前叉',
    specification: 'FORK CARBON TAPERED 1-1/8"-1.5" QR 100mm BLACK',
    orderQty: 20,
    shipQty: 20,
    vendorShipmentNo: 'INV-20250610-001',
    deliveryDate: '2025/06/10',
    acceptQty: 0,
  },
  {
    id: 'r-009',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'SB',
    vendorCode: '0001000053',
    vendorName: '久廣精密',
    orderNo: '4500300021',
    orderSeq: '10',
    orderDocSeq: '450030002110',
    materialNo: '3301-DRL0053-F02',
    productName: '傳動撥鏈器',
    specification: 'DERAILLEUR REAR 11-SPEED SHIMANO COMPATIBLE',
    orderQty: 35,
    shipQty: 35,
    vendorShipmentNo: 'INV-20250610-001',
    deliveryDate: '2025/06/10',
    acceptQty: 0,
  },
  {
    id: 'r-010',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'SB',
    vendorCode: '0001000053',
    vendorName: '久廣精密',
    orderNo: '4500300022',
    orderSeq: '10',
    orderDocSeq: '450030002210',
    materialNo: '4401-GRP0053-F03',
    productName: '握把',
    specification: 'GRIP LOCK-ON 130mm ERGONOMIC BLACK',
    orderQty: 150,
    shipQty: 150,
    vendorShipmentNo: 'INV-20250610-001',
    deliveryDate: '2025/06/10',
    acceptQty: 0,
  },
  {
    id: 'r-011',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000059',
    vendorName: '金盛元工業',
    orderNo: '4500400030',
    orderSeq: '10',
    orderDocSeq: '450040003010',
    materialNo: '6601-CHN0059-G01',
    productName: '鏈條',
    specification: 'CHAIN 11-SPEED 116L NICKEL PLATED',
    orderQty: 500,
    shipQty: 500,
    vendorShipmentNo: 'INV-20250620-002',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-012',
    company: '捷安特',
    purchaseOrg: 'GIANT採購',
    orderType: 'NB',
    vendorCode: '0001000012',
    vendorName: '台灣製造',
    orderNo: '4500500040',
    orderSeq: '10',
    orderDocSeq: '450050004010',
    materialNo: '7701-HDL0012-H01',
    productName: '車頭碗',
    specification: 'HEADSET INTEGRATED 1-1/8" CARTRIDGE BLACK',
    orderQty: 100,
    shipQty: 100,
    vendorShipmentNo: 'VND-2025-88001',
    deliveryDate: '2025/08/01',
    acceptQty: 0,
  },
  {
    id: 'r-013',
    company: '捷安特',
    purchaseOrg: 'GIANT採購',
    orderType: 'NB',
    vendorCode: '0001000012',
    vendorName: '台灣製造',
    orderNo: '4500500041',
    orderSeq: '10',
    orderDocSeq: '450050004110',
    materialNo: '8801-FRM0012-H02',
    productName: '車架',
    specification: 'FRAME ALLOY MTB 27.5 M MATTE GREY',
    orderQty: 80,
    shipQty: 80,
    vendorShipmentNo: 'VND-2025-88001',
    deliveryDate: '2025/08/01',
    acceptQty: 0,
  },
  {
    id: 'r-014',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000046',
    vendorName: '速聯國際',
    orderNo: '4500600050',
    orderSeq: '10',
    orderDocSeq: '450060005010',
    materialNo: '9901-BRK0046-I01',
    productName: '煞車卡鉗',
    specification: 'BRAKE CALIPER HYDRAULIC DISC FLAT MOUNT BLACK',
    orderQty: 30,
    shipQty: 30,
    vendorShipmentNo: 'VND-2025-88002',
    deliveryDate: '2025/09/01',
    acceptQty: 0,
  },
  {
    id: 'r-015',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000046',
    vendorName: '速聯國際',
    orderNo: '4500600051',
    orderSeq: '10',
    orderDocSeq: '450060005110',
    materialNo: '1129-FRK0046-I02',
    productName: '前叉避震',
    specification: 'FORK SUSPENSION 27.5 130mm TRAVEL 15x110 BOOST',
    orderQty: 25,
    shipQty: 25,
    vendorShipmentNo: 'VND-2025-88002',
    deliveryDate: '2025/09/01',
    acceptQty: 0,
  },
];

// ── 採購組織選項 ──────────────────────────────────────────────────────────────
const PURCHASE_ORG_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'GEM採購', label: 'GEM採購' },
  { value: 'GIANT採購', label: 'GIANT採購' },
];

// ── 欄位定義 ─────────────────────────────────────────────────────────────────
const DEFAULT_COLS: RecvCol[] = [
  { key: 'company',          label: '公司',         width: 110, minWidth: 90  },
  { key: 'purchaseOrg',      label: '採購組織',     width: 120, minWidth: 100 },
  { key: 'orderType',        label: '訂單類型',     width: 100, minWidth: 80  },
  { key: 'vendorCode',       label: '供應商(編號)', width: 180, minWidth: 140 },
  { key: 'orderDocSeq',      label: '單號序號',     width: 180, minWidth: 150 },
  { key: 'materialNo',       label: '料號',         width: 200, minWidth: 150 },
  { key: 'productName',      label: '品名',         width: 140, minWidth: 100 },
  { key: 'specification',    label: '規格敘述',     width: 280, minWidth: 160 },
  { key: 'orderQty',         label: '訂貨量',       width: 90,  minWidth: 70  },
  { key: 'shipQty',          label: '出貨量',       width: 90,  minWidth: 70  },
  { key: 'vendorShipmentNo', label: '廠商出貨單號', width: 160, minWidth: 120 },
  { key: 'deliveryDate',     label: '交貨日期',     width: 120, minWidth: 100 },
];

const STORAGE_KEY = 'receivingInquiry_shipped_v1_cols';
const DRAG_TYPE   = 'recv-col';

// ── 應出貨未出貨 Mock 資料 ────────────────────────────────────────────────────
export const MOCK_SHOULD_SHIP_ROWS: ShouldShipRow[] = [
  {
    id: 'ss-001', company: '巨大機械', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000641', vendorName: '華銘', orderNo: '4500100010', orderSeq: '10',
    orderDocSeq: '450010001010', itemNo: '1',
    materialNo: '2201-FRM0641-A01', productName: '鋁合金車架',
    specification: 'ROAD FRAME ALLOY 700C SIZE M MATTE BLACK',
    orderQty: 80, shipQty: 80, acceptQty: 0,
    expectedDelivery: '2025/07/08', vendorCanDeliverDate: '2025/07/08', pmDeliveryDate: '2025/07/07',
  },
  {
    id: 'ss-002', company: '巨大機械', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000641', vendorName: '華銘', orderNo: '4500100010', orderSeq: '20',
    orderDocSeq: '450010001020', itemNo: '2',
    materialNo: '3301-WHL0641-A02', productName: '輪組',
    specification: 'WHEELSET 700C DISC BRAKE 12X100/142 BLACK',
    orderQty: 50, shipQty: 50, acceptQty: 20,
    expectedDelivery: '2025/07/08', vendorCanDeliverDate: '2025/07/10', pmDeliveryDate: '2025/07/08',
  },
  {
    id: 'ss-003', company: '巨大機械', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000641', vendorName: '華銘', orderNo: '4500100011', orderSeq: '10',
    orderDocSeq: '450010001110', itemNo: '1',
    materialNo: '4401-STM0641-B01', productName: '車把立管',
    specification: 'STEM ALLOY 31.8mm±6° 100mm SILVER',
    orderQty: 120, shipQty: 120, acceptQty: 0,
    expectedDelivery: '2025/07/05', vendorCanDeliverDate: '2025/07/05', pmDeliveryDate: '2025/07/04',
  },
  {
    id: 'ss-004', company: '捷安特', purchaseOrg: 'GIANT採購', orderStatus: 'CK',
    vendorCode: '0001000045', vendorName: '佳承精密', orderNo: '4500200020', orderSeq: '10',
    orderDocSeq: '450020002010', itemNo: '1',
    materialNo: '9901-HDL0045-E01', productName: '把手組',
    specification: 'HANDLEBAR 700mm FLAT ALLOY 31.8 BLACK',
    orderQty: 70, shipQty: 70, acceptQty: 35,
    expectedDelivery: '2025/07/12', vendorCanDeliverDate: '2025/07/14', pmDeliveryDate: '2025/07/12',
  },
  {
    id: 'ss-005', company: '捷安特', purchaseOrg: 'GIANT採購', orderStatus: 'CL',
    vendorCode: '0001000045', vendorName: '佳承精密', orderNo: '4500200021', orderSeq: '10',
    orderDocSeq: '450020002110', itemNo: '1',
    materialNo: '1129-SAD0045-E02', productName: '坐墊',
    specification: 'SADDLE RACING 143mm BLACK',
    orderQty: 60, shipQty: 60, acceptQty: 60,  // 完全驗收，不顯示
    expectedDelivery: '2025/07/15', vendorCanDeliverDate: '2025/07/15', pmDeliveryDate: '2025/07/15',
  },
  {
    id: 'ss-006', company: '巨大機械', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000053', vendorName: '久廣精密', orderNo: '4500300030', orderSeq: '10',
    orderDocSeq: '450030003010', itemNo: '1',
    materialNo: '2201-FRK0053-F01', productName: '前叉',
    specification: 'FORK CARBON TAPERED 1-1/8"-1.5" QR 100mm BLACK',
    orderQty: 25, shipQty: 25, acceptQty: 10,
    expectedDelivery: '2025/07/03', vendorCanDeliverDate: '2025/07/05', pmDeliveryDate: '2025/07/03',
  },
  {
    id: 'ss-007', company: '巨大機械', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000053', vendorName: '久廣精密', orderNo: '4500300031', orderSeq: '10',
    orderDocSeq: '450030003110', itemNo: '1',
    materialNo: '3301-DRL0053-F02', productName: '傳動撥鏈器',
    specification: 'DERAILLEUR REAR 11-SPEED SHIMANO COMPATIBLE',
    orderQty: 40, shipQty: 40, acceptQty: 0,
    expectedDelivery: '2025/07/10', vendorCanDeliverDate: '2025/07/10', pmDeliveryDate: '2025/07/09',
  },
  {
    id: 'ss-008', company: '巨大機械', purchaseOrg: 'GEM採購', orderStatus: 'CL',
    vendorCode: '0001000059', vendorName: '金盛元工業', orderNo: '4500400040', orderSeq: '10',
    orderDocSeq: '450040004010', itemNo: '1',
    materialNo: '6601-CHN0059-G01', productName: '鏈條',
    specification: 'CHAIN 11-SPEED 116L NICKEL PLATED',
    orderQty: 300, shipQty: 300, acceptQty: 300, // 完全驗收，不顯示
    expectedDelivery: '2025/07/20', vendorCanDeliverDate: '2025/07/22', pmDeliveryDate: '2025/07/20',
  },
  {
    id: 'ss-009', company: '捷安特', purchaseOrg: 'GIANT採購', orderStatus: 'CK',
    vendorCode: '0001000012', vendorName: '台灣製造', orderNo: '4500500050', orderSeq: '10',
    orderDocSeq: '450050005010', itemNo: '1',
    materialNo: '7701-HDL0012-H01', productName: '車頭碗',
    specification: 'HEADSET INTEGRATED 1-1/8" CARTRIDGE BLACK',
    orderQty: 90, shipQty: 90, acceptQty: 50,
    expectedDelivery: '2025/07/06', vendorCanDeliverDate: '2025/07/07', pmDeliveryDate: '2025/07/06',
  },
  {
    id: 'ss-010', company: '捷安特', purchaseOrg: 'GIANT採購', orderStatus: 'CK',
    vendorCode: '0001000046', vendorName: '速聯國際', orderNo: '4500600060', orderSeq: '10',
    orderDocSeq: '450060006010', itemNo: '1',
    materialNo: '9901-BRK0046-I01', productName: '煞車卡鉗',
    specification: 'BRAKE CALIPER HYDRAULIC DISC FLAT MOUNT BLACK',
    orderQty: 35, shipQty: 35, acceptQty: 0,
    expectedDelivery: '2025/07/25', vendorCanDeliverDate: '2025/07/28', pmDeliveryDate: '2025/07/25',
  },
  {
    id: 'ss-011', company: '巨大機械', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000046', vendorName: '速聯國際', orderNo: '4500600061', orderSeq: '10',
    orderDocSeq: '450060006110', itemNo: '1',
    materialNo: '1129-FRK0046-I02', productName: '前叉避震',
    specification: 'FORK SUSPENSION 27.5 130mm TRAVEL 15x110 BOOST',
    orderQty: 30, shipQty: 30, acceptQty: 0,
    expectedDelivery: '2025/08/01', vendorCanDeliverDate: '2025/08/03', pmDeliveryDate: '2025/08/01',
  },
];

// ── 應出貨未出貨 欄位定義 ─────────────────────────────────────────────────────
const SHOULD_SHIP_DEFAULT_COLS: ShouldShipCol[] = [
  { key: 'company',              label: '廠商(編號)',     width: 180, minWidth: 140 },
  { key: 'orderDocSeq',         label: '訂單號碼',       width: 180, minWidth: 150 },
  { key: 'orderSeq',            label: '訂單序號',       width: 100, minWidth: 80  },
  { key: 'purchaseOrg',         label: '採購組織',       width: 120, minWidth: 100 },
  { key: 'orderStatus',         label: '訂單狀態',       width: 90,  minWidth: 80  },
  { key: 'itemNo',              label: '項次',           width: 80,  minWidth: 60  },
  { key: 'materialNo',          label: '料號',           width: 200, minWidth: 150 },
  { key: 'productName',         label: '品名',           width: 140, minWidth: 100 },
  { key: 'specification',       label: '規格敘述',       width: 280, minWidth: 160, visible: false },
  { key: 'orderQty',            label: '訂貨量',         width: 90,  minWidth: 70  },
  { key: 'expectedDelivery',    label: '預計交期',       width: 120, minWidth: 100 },
  { key: 'vendorCanDeliverDate',label: '廠商可交貨日期', width: 140, minWidth: 110 },
  { key: 'pmDeliveryDate',      label: '生管用日期',     width: 120, minWidth: 100 },
  { key: 'delayDays',           label: '延遲天數',       width: 90,  minWidth: 70, align: 'right' as const },
  { key: 'acceptQty',           label: '驗收量',         width: 90,  minWidth: 70, align: 'right' as const },
  { key: 'delayQty',            label: '延遲數量',         width: 90,  minWidth: 70, align: 'right' as const },
];

const SHOULD_SHIP_STORAGE_KEY = 'receivingInquiry_shouldShip_v4_cols';
const SHOULD_SHIP_DRAG_TYPE   = 'should-ship-col';

// ── 委外加工單狀況 Mock 資料 ──────────────────────────────────────────────────
export const MOCK_OUTSOURCE_ROWS: OutsourceRow[] = [
  {
    id: 'os-001', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000463', vendorName: '速聯',
    orderNo: '4000350001', orderSeq: '20', orderDocSeq: '400035000120', itemNo: '1',
    vendorShipmentNo: '202509170001',
    materialNo: '1530-CD4S50-0001', productName: 'CD4S50 CADEX LV0 4S',
    specification: '長牙襯管',
    orderQty: 4, shipQty: 4, acceptQty: 4,
    deliveryDate: '2025/07/08', expectedDelivery: '2025/07/08',
    vendorCanDeliverDate: '2025/07/07', pmDeliveryDate: '2025/07/07',
    receiptDate: '2025/07/07',
  },
  {
    id: 'os-002', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000463', vendorName: '速聯',
    orderNo: '4000350002', orderSeq: '10', orderDocSeq: '400035000210', itemNo: '1',
    vendorShipmentNo: '202509170002',
    materialNo: '1530-CD6S50-0002', productName: 'CD6S50 CADEX LV0 6S',
    specification: '短牙襯管',
    orderQty: 8, shipQty: 8, acceptQty: 0,
    deliveryDate: '2025/07/08', expectedDelivery: '2025/07/08',
    vendorCanDeliverDate: '2025/07/09', pmDeliveryDate: '2025/07/08',
    receiptDate: '',
  },
  {
    id: 'os-003', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000641', vendorName: '華銘',
    orderNo: '4000360001', orderSeq: '10', orderDocSeq: '400036000110', itemNo: '1',
    vendorShipmentNo: 'HS-20250707-001',
    materialNo: '2201-FRM0641-Z3YD', productName: '品章車架加工',
    specification: 'FRAME OUTSOURCE ALLOY 700C M BLACK',
    orderQty: 30, shipQty: 30, acceptQty: 15,
    deliveryDate: '2025/07/06', expectedDelivery: '2025/07/06',
    vendorCanDeliverDate: '2025/07/06', pmDeliveryDate: '2025/07/05',
    receiptDate: '2025/07/06',
  },
  {
    id: 'os-004', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000641', vendorName: '華銘',
    orderNo: '4000360002', orderSeq: '10', orderDocSeq: '400036000210', itemNo: '1',
    vendorShipmentNo: 'HS-20250707-002',
    materialNo: '3301-WHL0641-Z3YD', productName: '輪組加工裝配',
    specification: 'WHEELSET OUTSOURCE 700C DISC BLACK',
    orderQty: 20, shipQty: 20, acceptQty: 0,
    deliveryDate: '2025/07/09', expectedDelivery: '2025/07/09',
    vendorCanDeliverDate: '2025/07/10', pmDeliveryDate: '2025/07/09',
    receiptDate: '',
  },
  {
    id: 'os-005', purchaseOrg: 'GIANT採購', orderStatus: 'CK',
    vendorCode: '0001000045', vendorName: '佳承精密',
    orderNo: '4000370001', orderSeq: '10', orderDocSeq: '400037000110', itemNo: '1',
    vendorShipmentNo: 'JC-20250706-001',
    materialNo: '9901-HDL0045-Z3YD', productName: '把手加工',
    specification: 'HANDLEBAR OUTSOURCE 700mm FLAT BLACK',
    orderQty: 50, shipQty: 50, acceptQty: 50,
    deliveryDate: '2025/07/05', expectedDelivery: '2025/07/05',
    vendorCanDeliverDate: '2025/07/05', pmDeliveryDate: '2025/07/04',
    receiptDate: '2025/07/05',
  },
  {
    id: 'os-006', purchaseOrg: 'GIANT採購', orderStatus: 'CK',
    vendorCode: '0001000045', vendorName: '佳承精密',
    orderNo: '4000370002', orderSeq: '10', orderDocSeq: '400037000210', itemNo: '1',
    vendorShipmentNo: 'JC-20250707-001',
    materialNo: '1129-SAD0045-Z3YD', productName: '坐墊加工',
    specification: 'SADDLE OUTSOURCE 143mm BLACK',
    orderQty: 40, shipQty: 40, acceptQty: 20,
    deliveryDate: '2025/07/07', expectedDelivery: '2025/07/07',
    vendorCanDeliverDate: '2025/07/07', pmDeliveryDate: '2025/07/07',
    receiptDate: '2025/07/07',
  },
  {
    id: 'os-007', purchaseOrg: 'GEM採購', orderStatus: 'CL',
    vendorCode: '0001000053', vendorName: '久廣精密',
    orderNo: '4000380001', orderSeq: '10', orderDocSeq: '400038000110', itemNo: '1',
    vendorShipmentNo: 'KG-20250706-001',
    materialNo: '2201-FRK0053-Z3YD', productName: '前叉連件加工',
    specification: 'FORK OUTSOURCE CARBON TAPERED BLACK',
    orderQty: 15, shipQty: 15, acceptQty: 0,
    deliveryDate: '2025/07/06', expectedDelivery: '2025/07/06',
    vendorCanDeliverDate: '2025/07/08', pmDeliveryDate: '2025/07/06',
    receiptDate: '',
  },
  {
    id: 'os-008', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000053', vendorName: '久廣精密',
    orderNo: '4000380002', orderSeq: '10', orderDocSeq: '400038000210', itemNo: '1',
    vendorShipmentNo: 'KG-20250707-001',
    materialNo: '3301-DRL0053-Z3YD', productName: '撥鏈器加工',
    specification: 'DERAILLEUR OUTSOURCE 11-SPEED',
    orderQty: 25, shipQty: 25, acceptQty: 25,
    deliveryDate: '2025/07/07', expectedDelivery: '2025/07/07',
    vendorCanDeliverDate: '2025/07/07', pmDeliveryDate: '2025/07/06',
    receiptDate: '2025/07/07',
  },
  {
    id: 'os-009', purchaseOrg: 'GEM採購', orderStatus: 'CK',
    vendorCode: '0001000059', vendorName: '金盛元工業',
    orderNo: '4000390001', orderSeq: '10', orderDocSeq: '400039000110', itemNo: '1',
    vendorShipmentNo: 'JS-20250708-001',
    materialNo: '6601-CHN0059-Z3YD', productName: '鏈條加工',
    specification: 'CHAIN OUTSOURCE 11-SPEED 116L',
    orderQty: 100, shipQty: 100, acceptQty: 0,
    deliveryDate: '2025/07/09', expectedDelivery: '2025/07/09',
    vendorCanDeliverDate: '2025/07/10', pmDeliveryDate: '2025/07/09',
    receiptDate: '',
  },
  {
    id: 'os-010', purchaseOrg: 'GIANT採購', orderStatus: 'CK',
    vendorCode: '0001000012', vendorName: '台灣製造',
    orderNo: '4000400001', orderSeq: '10', orderDocSeq: '400040000110', itemNo: '1',
    vendorShipmentNo: 'TW-20250707-001',
    materialNo: '7701-HDL0012-Z3YD', productName: '車頭碗加工',
    specification: 'HEADSET OUTSOURCE 1-1/8" BLACK',
    orderQty: 60, shipQty: 60, acceptQty: 60,
    deliveryDate: '2025/07/06', expectedDelivery: '2025/07/06',
    vendorCanDeliverDate: '2025/07/06', pmDeliveryDate: '2025/07/05',
    receiptDate: '2025/07/06',
  },
  {
    id: 'os-011', purchaseOrg: 'GIANT採購', orderStatus: 'CK',
    vendorCode: '0001000046', vendorName: '速聯國際',
    orderNo: '4000410001', orderSeq: '10', orderDocSeq: '400041000110', itemNo: '1',
    vendorShipmentNo: 'SL-20250709-001',
    materialNo: '9901-BRK0046-Z3YD', productName: '煞車卡鉗加工',
    specification: 'BRAKE OUTSOURCE HYDRAULIC DISC BLACK',
    orderQty: 20, shipQty: 20, acceptQty: 0,
    deliveryDate: '2025/07/10', expectedDelivery: '2025/07/10',
    vendorCanDeliverDate: '2025/07/11', pmDeliveryDate: '2025/07/10',
    receiptDate: '',
  },
];

// ── 委外加工單狀況 欄位定義 ───────────────────────────────────────────────────
const OUTSOURCE_DEFAULT_COLS: OutsourceCol[] = [
  { key: 'vendorCode',          label: '廠商(編號)',      width: 180, minWidth: 140, align: 'left'   },
  { key: 'purchaseOrg',         label: '採購組織',        width: 110, minWidth: 90,  align: 'left'   },
  { key: 'orderStatus',         label: '訂單狀態',        width: 90,  minWidth: 70,  align: 'center' },
  { key: 'orderDocSeq',         label: '單號序號',        width: 180, minWidth: 140, align: 'left'   },
  { key: 'itemNo',              label: '項次',            width: 70,  minWidth: 55,  align: 'center' },
  { key: 'vendorShipmentNo',    label: '廠商出貨單號',    width: 160, minWidth: 120, align: 'left'   },
  { key: 'materialNo',          label: '料號',            width: 200, minWidth: 150, align: 'left'   },
  { key: 'productName',         label: '品名',            width: 160, minWidth: 120, align: 'left'   },
  { key: 'specification',       label: '規格敘述',        width: 280, minWidth: 160, align: 'left',   visible: false },
  { key: 'orderQty',            label: '訂貨量',          width: 90,  minWidth: 70,  align: 'right'  },
  { key: 'shipQty',             label: '出貨量',          width: 90,  minWidth: 70,  align: 'right'  },
  { key: 'acceptQty',           label: '驗收量',          width: 90,  minWidth: 70,  align: 'right'  },
  { key: 'delayQty',            label: '延遲數量',        width: 90,  minWidth: 70,  align: 'right'  },
  { key: 'deliveryDate',        label: '交貨日期',        width: 120, minWidth: 100, align: 'center' },
  { key: 'expectedDelivery',    label: '預計交期',        width: 120, minWidth: 100, align: 'center' },
  { key: 'vendorCanDeliverDate',label: '廠商可交貨日期',  width: 140, minWidth: 110, align: 'center', visible: false },
  { key: 'pmDeliveryDate',      label: '生管用日期',      width: 120, minWidth: 100, align: 'center', visible: false },
  { key: 'receiptDate',         label: '收料日期',        width: 120, minWidth: 100, align: 'center' },
  { key: 'isReceived',          label: '是否收料',        width: 90,  minWidth: 70,  align: 'center' },
];

const OUTSOURCE_STORAGE_KEY = 'receivingInquiry_outsource_v1_cols';
const OUTSOURCE_DRAG_TYPE   = 'outsource-col';

// (ReadonlyField, OrderDetailOverlay, ShipmentDetailOverlay 已移除 —— 請使用現成的 OrderDetail 與 ShipmentDetailPage)


// ── 畫面建置中（其他 TAB）────────────────────────────────────────────────────
// ── TAB3：委外加工單狀況 ──────────────────────────────────────────────────────
const RECEIVED_OPTIONS = [
  { value: '',    label: '全部' },
  { value: 'yes', label: '是' },
  { value: 'no',  label: '否' },
];

interface OutsourceTabProps {
  onOrderDetail: (row: OutsourceRow) => void;
  onShipmentDetail: (row: OutsourceRow) => void;
}
function OutsourceTab({ onOrderDetail, onShipmentDetail }: OutsourceTabProps) {
  const [timeRange, setTimeRange]                     = useState<TimeRange>('3d');
  const [isReceivedFilter, setIsReceivedFilter]       = useState('');
  const [vendorKeyword, setVendorKeyword]             = useState('');
  const [orderDocSeqKeyword, setOrderDocSeqKeyword]   = useState('');
  const [materialKeyword, setMaterialKeyword]         = useState('');

  const [columns, setColumns] = useState<OutsourceCol[]>(() => {
    try {
      const saved = localStorage.getItem(OUTSOURCE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { key: OutsourceColKey; width: number; visible?: boolean }[];
        const keyOrder = parsed.map(p => p.key);
        const sorted = [...OUTSOURCE_DEFAULT_COLS].sort(
          (a, b) => keyOrder.indexOf(a.key) - keyOrder.indexOf(b.key)
        );
        return sorted.map(c => {
          const s = parsed.find(p => p.key === c.key);
          return { ...c, width: s?.width ?? c.width, visible: s?.visible ?? true };
        });
      }
    } catch {}
    return OUTSOURCE_DEFAULT_COLS.map(c => ({ ...c, visible: c.visible !== false }));
  });

  const visibleColumns = useMemo(() => columns.filter(c => c.visible !== false), [columns]);
  const totalWidth     = useMemo(() => visibleColumns.reduce((s, c) => s + c.width, 0), [visibleColumns]);

  useEffect(() => {
    localStorage.setItem(OUTSOURCE_STORAGE_KEY, JSON.stringify(columns.map(c => ({ key: c.key, width: c.width, visible: c.visible }))));
  }, [columns]);

  const [showColSelector, setShowColSelector]   = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters]                   = useState<FilterCondition[]>([]);
  const [page, setPage]                         = useState(1);
  const [rowsPerPage, setRowsPerPage]           = useState(20);
  const [sortConfig, setSortConfig]             = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });

  const updateColumnWidth = useCallback((key: string, width: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width } : c));
  }, []);

  const autoFitWidth = useCallback((key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans","Noto Sans JP",sans-serif') + 32 + 16;
    let maxDataW = 0;
    MOCK_OUTSOURCE_ROWS.forEach(row => {
      const val = String((row as any)[key] ?? '');
      const w = measureTextWidth(val, '14px "Public Sans","Noto Sans JP",sans-serif') + 32;
      if (w > maxDataW) maxDataW = w;
    });
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW))) } : c));
  }, [columns]);

  const moveColumn = useCallback((dragKey: string, hoverKey: string) => {
    setColumns(prev => {
      const arr = [...prev];
      const from = arr.findIndex(c => c.key === dragKey);
      const to   = arr.findIndex(c => c.key === hoverKey);
      if (from < 0 || to < 0) return prev;
      const [removed] = arr.splice(from, 1);
      arr.splice(to, 0, removed);
      return arr;
    });
  }, []);

  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // 時間範圍（以 deliveryDate 為基準）
  const OS_BASE_DATE = new Date('2025-07-07');
  const osCutoffDate = useMemo(() => {
    const d = new Date(OS_BASE_DATE);
    d.setDate(d.getDate() + getDaysFromRange(timeRange));
    return d;
  }, [timeRange]);

  const filteredData = useMemo(() => {
    let data = MOCK_OUTSOURCE_ROWS;
    data = data.filter(r => {
      if (!r.deliveryDate) return false;
      const d = new Date(r.deliveryDate.replace(/\//g, '-'));
      return d >= OS_BASE_DATE && d <= osCutoffDate;
    });
    if (isReceivedFilter === 'yes') data = data.filter(r => r.acceptQty > 0);
    if (isReceivedFilter === 'no')  data = data.filter(r => r.acceptQty === 0);
    if (vendorKeyword.trim()) {
      const kw = vendorKeyword.trim().toLowerCase();
      data = data.filter(r => r.vendorName.toLowerCase().includes(kw) || r.vendorCode.toLowerCase().includes(kw));
    }
    if (orderDocSeqKeyword.trim()) {
      const kw = orderDocSeqKeyword.trim().toLowerCase();
      data = data.filter(r => r.orderDocSeq.toLowerCase().includes(kw));
    }
    if (materialKeyword.trim()) {
      const kw = materialKeyword.trim().toLowerCase();
      data = data.filter(r => r.materialNo.toLowerCase().includes(kw));
    }
    filters.forEach(f => {
      data = data.filter(row => {
        const val  = String((row as any)[f.column] ?? '').toLowerCase();
        const term = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains':    return val.includes(term);
          case 'equals':      return val === term;
          case 'startsWith':  return val.startsWith(term);
          case 'notContains': return !val.includes(term);
          default:            return true;
        }
      });
    });
    return data;
  }, [timeRange, isReceivedFilter, vendorKeyword, orderDocSeqKeyword, materialKeyword, filters, osCutoffDate]);

  useEffect(() => { setPage(1); }, [timeRange, isReceivedFilter, vendorKeyword, orderDocSeqKeyword, materialKeyword, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const colSelectorItems = useMemo(() => columns.map(c => ({ key: c.key, label: c.label, visible: c.visible !== false })), [columns]);
  const filterColumns    = useMemo(() => columns.map(c => ({ key: c.key, label: c.label })), [columns]);

  const handleExportCsv = useCallback(() => {
    const header = visibleColumns.map(c => c.label).join(',');
    const rows = filteredData.map(row =>
      visibleColumns.map(c => `"${String((row as any)[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv  = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '委外加工單狀況.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [filteredData, visibleColumns]);

  const renderCell = (col: OutsourceCol, row: OutsourceRow) => {
    switch (col.key) {
      case 'vendorCode':
        return <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">{row.vendorName}（{row.vendorCode}）</span>;
      case 'orderDocSeq':
        return (
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer text-left"
            onClick={() => onOrderDetail(row)}
          >
            {row.orderDocSeq}
          </button>
        );
      case 'vendorShipmentNo':
        return (
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer text-left"
            onClick={() => onShipmentDetail(row)}
          >
            {row.vendorShipmentNo}
          </button>
        );
      case 'orderStatus': {
        const isCK = row.orderStatus === 'CK';
        return (
          <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold"
            style={{ backgroundColor: isCK ? 'rgba(17,141,87,0.08)' : 'rgba(0,94,184,0.08)', color: isCK ? '#118d57' : '#005eb8' }}>
            {row.orderStatus}
          </span>
        );
      }
      case 'delayQty': {
        const qty = row.orderQty - row.acceptQty;
        return <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px]" style={{ color: '#ff5630' }}>{qty}</span>;
      }
      case 'isReceived': {
        const received = row.acceptQty > 0;
        return (
          <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold"
            style={{ backgroundColor: received ? 'rgba(17,141,87,0.08)' : 'rgba(145,158,171,0.08)', color: received ? '#118d57' : '#637381' }}>
            {received ? '是' : '否'}
          </span>
        );
      }
      case 'receiptDate':
        return <span className="font-['Public_Sans:Regular',sans-serif] text-[14px]" style={{ color: row.receiptDate ? '#1c252e' : '#919eab' }}>{row.receiptDate || '—'}</span>;
      case 'orderQty':
      case 'shipQty':
      case 'acceptQty':
        return <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">{(row as any)[col.key]}</span>;
      default:
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] truncate block" title={String((row as any)[col.key] ?? '')}>
            {(row as any)[col.key] || '—'}
          </span>
        );
    }
  };

  return (
    <>
      {/* 時間回溯按鈕 */}
      <div className="shrink-0 flex gap-[8px] items-center px-[20px] pt-[16px]">
        {TIME_RANGE_BUTTONS.map(btn => (
          <button key={btn.value} onClick={() => setTimeRange(btn.value)}
            className={`h-[32px] px-[16px] rounded-[8px] text-[13px] font-semibold transition-colors font-['Public_Sans:SemiBold',sans-serif] ${
              timeRange === btn.value
                ? 'bg-[#1c252e] text-white'
                : 'bg-[rgba(145,158,171,0.08)] text-[#637381] hover:bg-[rgba(145,158,171,0.16)]'
            }`}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div className="flex-1 min-w-0">
          <DropdownSelect label="是否收料" value={isReceivedFilter} onChange={setIsReceivedFilter} options={RECEIVED_OPTIONS} />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="供應商" value={vendorKeyword} onChange={setVendorKeyword} placeholder="名稱或代碼關鍵字" />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="單號序號" value={orderDocSeqKeyword} onChange={setOrderDocSeqKeyword} placeholder="單號序號關鍵字" />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="料號" value={materialKeyword} onChange={setMaterialKeyword} placeholder="料號關鍵字" />
        </div>
      </div>

      {/* Toolbar */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => setShowColSelector(v => !v)}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={handleExportCsv}
      />

      {showColSelector && (
        <ColumnSelector
          columns={colSelectorItems}
          onClose={() => setShowColSelector(false)}
          onChange={updated => {
            setColumns(prev =>
              updated.map(u => { const col = prev.find(c => c.key === u.key); return col ? { ...col, visible: u.visible } : null; })
                .filter(Boolean) as OutsourceCol[]
            );
          }}
        />
      )}

      {showFilterDialog && (
        <FilterDialog
          columns={filterColumns} filters={filters}
          onClose={() => setShowFilterDialog(false)}
          onApply={f => { setFilters(f); setShowFilterDialog(false); }}
        />
      )}

      {/* 表格 */}
      <DndProvider backend={HTML5Backend}>
        <div ref={scrollContainerRef} onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}>
          <div style={{ minWidth: `${totalWidth}px` }}>
            <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader key={col.key} column={col} index={idx}
                  dragType={OUTSOURCE_DRAG_TYPE} isLast={idx === visibleColumns.length - 1}
                  moveColumn={moveColumn} updateColumnWidth={updateColumnWidth} autoFitWidth={autoFitWidth}
                  sortConfig={sortConfig}
                  onSort={key => setSortConfig(prev =>
                    prev.key === key
                      ? { key, direction: prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc' }
                      : { key, direction: 'asc' }
                  )}
                />
              ))}
            </div>

            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center py-[60px]">
                <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">查無資料</span>
              </div>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <div key={row.id}
                  className={`flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${rowIdx % 2 === 0 ? '' : 'bg-[rgba(145,158,171,0.02)]'}`}>
                  {visibleColumns.map((col, colIdx) => (
                    <div key={col.key}
                      style={colIdx === visibleColumns.length - 1 ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                      className={`flex items-center px-[16px] py-[12px] overflow-hidden ${colIdx < visibleColumns.length - 1 ? 'border-r border-[rgba(145,158,171,0.08)]' : ''} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      {renderCell(col, row)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </DndProvider>

      <PaginationControls
        total={filteredData.length} page={page} rowsPerPage={rowsPerPage}
        onPageChange={setPage} onRowsPerPageChange={v => { setRowsPerPage(v); setPage(1); }}
      />
    </>
  );
}

function UnderDevelopment({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[24px] px-[40px]">
      {/* 圖示 */}
      <div className="w-[72px] h-[72px] rounded-[20px] bg-[rgba(0,94,184,0.08)] flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e] mb-[8px]">
          {title}
        </p>
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
          此功能正在開發中，敬請期待
        </p>
      </div>
    </div>
  );
}

// ── TAB2：應出貨未出貨 ───────────────────────────────────────────────────────
const DELIVERY_DATE_TYPE_OPTIONS = [
  { value: 'expectedDelivery',     label: '預計交期' },
  { value: 'vendorCanDeliverDate', label: '廠商可交貨日' },
  { value: 'pmDeliveryDate',       label: '生管用交期' },
];

type TimeRange = '3d' | '1w' | '2w' | '1m';

const TIME_RANGE_BUTTONS: { value: TimeRange; label: string }[] = [
  { value: '3d', label: '3天內' },
  { value: '1w', label: '一周內' },
  { value: '2w', label: '二周內' },
  { value: '1m', label: '一個月內' },
];

function getDaysFromRange(range: TimeRange): number {
  switch (range) {
    case '3d': return 3;
    case '1w': return 7;
    case '2w': return 14;
    case '1m': return 30;
  }
}

function ShouldShipNotShippedTab() {
  // ── 時間範圍 ──
  const [timeRange, setTimeRange] = useState<TimeRange>('3d');

  // ── 搜尋狀態 ──
  const [deliveryDateType, setDeliveryDateType] = useState<DeliveryDateType>('expectedDelivery');
  const [purchaseOrg, setPurchaseOrg]           = useState('');
  const [vendorKeyword, setVendorKeyword]       = useState('');
  const [materialKeyword, setMaterialKeyword]   = useState('');

  // ── 欄位設定 ──
  const [columns, setColumns] = useState<ShouldShipCol[]>(() => {
    try {
      const saved = localStorage.getItem(SHOULD_SHIP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { key: ShouldShipColKey; width: number; visible?: boolean }[];
        const keyOrder = parsed.map(p => p.key);
        const sorted = [...SHOULD_SHIP_DEFAULT_COLS].sort(
          (a, b) => keyOrder.indexOf(a.key) - keyOrder.indexOf(b.key)
        );
        return sorted.map(c => {
          const s = parsed.find(p => p.key === c.key);
          return { ...c, width: s?.width ?? c.width, visible: s?.visible ?? true };
        });
      }
    } catch {}
    return SHOULD_SHIP_DEFAULT_COLS.map(c => ({ ...c, visible: c.visible !== false }));
  });

  const visibleColumns = useMemo(() => columns.filter(c => c.visible !== false), [columns]);
  const totalWidth = useMemo(() => visibleColumns.reduce((s, c) => s + c.width, 0), [visibleColumns]);

  useEffect(() => {
    const toSave = columns.map(c => ({ key: c.key, width: c.width, visible: c.visible }));
    localStorage.setItem(SHOULD_SHIP_STORAGE_KEY, JSON.stringify(toSave));
  }, [columns]);

  // ── Toolbar 狀態 ──
  const [showColSelector, setShowColSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });

  // ── DnD resize ──
  const updateColumnWidth = useCallback((key: string, width: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width } : c));
  }, []);

  const autoFitWidth = useCallback((key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans","Noto Sans JP",sans-serif') + 32 + 16;
    let maxDataW = 0;
    MOCK_SHOULD_SHIP_ROWS.forEach(row => {
      const val = String((row as any)[key] ?? '');
      const w = measureTextWidth(val, '14px "Public Sans","Noto Sans JP",sans-serif') + 32;
      if (w > maxDataW) maxDataW = w;
    });
    const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  }, [columns]);

  const moveColumn = useCallback((dragKey: string, hoverKey: string) => {
    setColumns(prev => {
      const arr = [...prev];
      const from = arr.findIndex(c => c.key === dragKey);
      const to   = arr.findIndex(c => c.key === hoverKey);
      if (from < 0 || to < 0) return prev;
      const [removed] = arr.splice(from, 1);
      arr.splice(to, 0, removed);
      return arr;
    });
  }, []);

  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── 以今日為基準計算時間範圍截止日 ──
  // （Mock 資料中使用固定基準日 2025/07/07）
  const BASE_DATE = new Date('2025-07-07');
  const cutoffDate = useMemo(() => {
    const d = new Date(BASE_DATE);
    d.setDate(d.getDate() + getDaysFromRange(timeRange));
    return d;
  }, [timeRange]);

  const dateKey = deliveryDateType;

  // ── 篩選 ──
  const filteredData = useMemo(() => {
    let data = MOCK_SHOULD_SHIP_ROWS;

    // 時間範圍篩選：交期在 BASE_DATE ~ cutoffDate 之間
    data = data.filter(r => {
      const dateStr = (r as any)[dateKey] as string;
      if (!dateStr) return false;
      const d = new Date(dateStr.replace(/\//g, '-'));
      return d >= BASE_DATE && d <= cutoffDate;
    });

    // 驗收量不等於訂貨量（未完全到貨）
    data = data.filter(r => r.acceptQty !== r.orderQty);

    if (purchaseOrg) data = data.filter(r => r.purchaseOrg === purchaseOrg);
    if (vendorKeyword.trim()) {
      const kw = vendorKeyword.trim().toLowerCase();
      data = data.filter(r =>
        r.vendorName.toLowerCase().includes(kw) || r.vendorCode.toLowerCase().includes(kw)
      );
    }
    if (materialKeyword.trim()) {
      const kw = materialKeyword.trim().toLowerCase();
      data = data.filter(r => r.materialNo.toLowerCase().includes(kw));
    }
    filters.forEach(f => {
      data = data.filter(row => {
        const val = String((row as any)[f.column] ?? '').toLowerCase();
        const term = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains':    return val.includes(term);
          case 'equals':      return val === term;
          case 'startsWith':  return val.startsWith(term);
          case 'notContains': return !val.includes(term);
          default:            return true;
        }
      });
    });
    return data;
  }, [timeRange, dateKey, purchaseOrg, vendorKeyword, materialKeyword, filters, cutoffDate]);

  useEffect(() => { setPage(1); }, [timeRange, deliveryDateType, purchaseOrg, vendorKeyword, materialKeyword, filters]);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const colSelectorItems = useMemo(() =>
    columns.map(c => ({ key: c.key, label: c.label, visible: c.visible !== false })),
    [columns]
  );
  const filterColumns = useMemo(() =>
    columns.map(c => ({ key: c.key, label: c.label })),
    [columns]
  );

  const handleExportCsv = useCallback(() => {
    const header = visibleColumns.map(c => c.label).join(',');
    const rows = filteredData.map(row =>
      visibleColumns.map(c => `"${String((row as any)[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '延遲到貨.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [filteredData, visibleColumns]);

  // ── 儲存格渲染 ──
  const renderCell = (col: ShouldShipCol, row: ShouldShipRow) => {
    switch (col.key) {
      case 'company':
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">
            {row.vendorName}（{row.vendorCode}）
          </span>
        );
      case 'orderStatus': {
        const isCK = row.orderStatus === 'CK';
        return (
          <span
            className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold"
            style={{
              backgroundColor: isCK ? 'rgba(17,141,87,0.08)' : 'rgba(0,94,184,0.08)',
              color: isCK ? '#118d57' : '#005eb8',
            }}
          >
            {row.orderStatus}
          </span>
        );
      }
      case 'orderDocSeq':
        return (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e]">
            {row.orderDocSeq}
          </span>
        );
      case 'expectedDelivery':
      case 'vendorCanDeliverDate':
      case 'pmDeliveryDate': {
        // Highlight the active date type
        const isActive = col.key === deliveryDateType;
        const val = (row as any)[col.key] as string;
        return (
          <span
            className="font-['Public_Sans:Regular',sans-serif] text-[14px]"
            style={{ color: isActive ? '#005eb8' : '#1c252e', fontWeight: isActive ? 600 : 400 }}
          >
            {val || '—'}
          </span>
        );
      }
      case 'delayDays': {
        // 延遲天數 = BASE_DATE - 選中的交期日期（天數），一律紅字顯示
        const dateStr = (row as any)[deliveryDateType] as string;
        if (!dateStr) return <span className="text-[#919eab] text-[14px]">—</span>;
        const deliveryD = new Date(dateStr.replace(/\//g, '-'));
        const diffMs = BASE_DATE.getTime() - deliveryD.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return (
          <span
            className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
            style={{ color: '#ff5630' }}
          >
            {Math.abs(diffDays)}
          </span>
        );
      }
      case 'orderQty':
      case 'shipQty':
      case 'acceptQty':
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">
            {(row as any)[col.key]}
          </span>
        );
      case 'delayQty': {
        // 延遲數量 = 訂貨量 - 驗收量，紅字顯示
        const qty = row.orderQty - row.acceptQty;
        return (
          <span
            className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
            style={{ color: '#ff5630' }}
          >
            {qty}
          </span>
        );
      }
      default:
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] truncate block" title={String((row as any)[col.key] ?? '')}>
            {(row as any)[col.key] ?? '—'}
          </span>
        );
    }
  };

  return (
    <>
      {/* ── 時間回溯按鈕 ── */}
      <div className="shrink-0 flex gap-[8px] items-center px-[20px] pt-[16px]">
        {TIME_RANGE_BUTTONS.map(btn => (
          <button
            key={btn.value}
            onClick={() => setTimeRange(btn.value)}
            className={`h-[32px] px-[16px] rounded-[8px] text-[13px] font-semibold transition-colors font-['Public_Sans:SemiBold',sans-serif] ${
              timeRange === btn.value
                ? 'bg-[#1c252e] text-white'
                : 'bg-[rgba(145,158,171,0.08)] text-[#637381] hover:bg-[rgba(145,158,171,0.16)]'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* ── 搜尋列 ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        {/* 交期類型 */}
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="交期類型"
            value={deliveryDateType}
            onChange={v => setDeliveryDateType(v as DeliveryDateType)}
            options={DELIVERY_DATE_TYPE_OPTIONS}
          />
        </div>
        {/* 採購組織 */}
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="採購組織"
            value={purchaseOrg}
            onChange={setPurchaseOrg}
            options={PURCHASE_ORG_OPTIONS}
          />
        </div>
        {/* 供應商 */}
        <div className="flex-1 min-w-0">
          <SearchField
            label="供應商"
            value={vendorKeyword}
            onChange={setVendorKeyword}
            placeholder="名稱或代碼關鍵字"
          />
        </div>
        {/* 料號 */}
        <div className="flex-1 min-w-0">
          <SearchField
            label="料號"
            value={materialKeyword}
            onChange={setMaterialKeyword}
            placeholder="料號關鍵字"
          />
        </div>
      </div>

      {/* ── Toolbar ── */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => setShowColSelector(v => !v)}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={handleExportCsv}
      />

      {/* ColumnSelector */}
      {showColSelector && (
        <ColumnSelector
          columns={colSelectorItems}
          onClose={() => setShowColSelector(false)}
          onChange={updated => {
            setColumns(prev =>
              updated
                .map(u => {
                  const col = prev.find(c => c.key === u.key);
                  return col ? { ...col, visible: u.visible } : null;
                })
                .filter(Boolean) as ShouldShipCol[]
            );
          }}
        />
      )}

      {/* FilterDialog */}
      {showFilterDialog && (
        <FilterDialog
          columns={filterColumns}
          filters={filters}
          onClose={() => setShowFilterDialog(false)}
          onApply={f => { setFilters(f); setShowFilterDialog(false); }}
        />
      )}

      {/* ── 表格 ── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  dragType={SHOULD_SHIP_DRAG_TYPE}
                  isLast={idx === visibleColumns.length - 1}
                  moveColumn={moveColumn}
                  updateColumnWidth={updateColumnWidth}
                  autoFitWidth={autoFitWidth}
                  sortConfig={sortConfig}
                  onSort={(key) => {
                    setSortConfig(prev =>
                      prev.key === key
                        ? { key, direction: prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc' }
                        : { key, direction: 'asc' }
                    );
                  }}
                />
              ))}
            </div>

            {/* 資料列 */}
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center py-[60px]">
                <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">查無資料</span>
              </div>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <div
                  key={row.id}
                  className={`flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${rowIdx % 2 === 0 ? '' : 'bg-[rgba(145,158,171,0.02)]'}`}
                >
                  {visibleColumns.map((col, colIdx) => (
                    <div
                      key={col.key}
                      style={colIdx === visibleColumns.length - 1 ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                      className={`flex items-center px-[16px] py-[12px] overflow-hidden ${colIdx < visibleColumns.length - 1 ? 'border-r border-[rgba(145,158,171,0.08)]' : ''}`}
                    >
                      {renderCell(col, row)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── 分頁 ── */}
      <PaginationControls
        total={filteredData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={v => { setRowsPerPage(v); setPage(1); }}
      />
    </>
  );
}

// ── TAB1：已出貨未收料 ───────────────────────────────────────────────────────
interface ShippedNotReceivedTabProps {
  onOrderDetail: (row: ReceivingRow) => void;
  onShipmentDetail: (row: ReceivingRow) => void;
}
function ShippedNotReceivedTab({ onOrderDetail, onShipmentDetail }: ShippedNotReceivedTabProps) {
  // ── 搜尋狀態 ──
  const [purchaseOrg, setPurchaseOrg]     = useState('');
  const [vendorKeyword, setVendorKeyword] = useState('');
  const [materialKeyword, setMaterialKeyword] = useState('');

  // ── 欄位設定 ──
  const [columns, setColumns] = useState<RecvCol[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { key: RecvColKey; width: number; visible?: boolean }[];
        const keyOrder = parsed.map(p => p.key);
        const sorted = [...DEFAULT_COLS].sort(
          (a, b) => keyOrder.indexOf(a.key) - keyOrder.indexOf(b.key)
        );
        return sorted.map(c => {
          const s = parsed.find(p => p.key === c.key);
          return { ...c, width: s?.width ?? c.width, visible: s?.visible ?? true };
        });
      }
    } catch {}
    return DEFAULT_COLS.map(c => ({ ...c, visible: true }));
  });

  const visibleColumns = useMemo(() => columns.filter(c => c.visible !== false), [columns]);
  const totalWidth = useMemo(() => visibleColumns.reduce((s, c) => s + c.width, 0), [visibleColumns]);

  // 儲存欄位設定
  useEffect(() => {
    const toSave = columns.map(c => ({ key: c.key, width: c.width, visible: c.visible }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [columns]);

  // ── Toolbar 狀態 ──
  const [showColSelector, setShowColSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });

  // ── Overlay ──
  // (明細頁由上層 ReceivingInquiryPage 管理，透過 props 傳入 callback)

  // ── DnD resize（欄寬由 DraggableColumnHeader 內部管理，這裡只需要 updateColumnWidth 回呼） ──
  const updateColumnWidth = useCallback((key: string, width: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width } : c));
  }, []);

  const autoFitWidth = useCallback((key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans","Noto Sans JP",sans-serif') + 32 + 16;
    let maxDataW = 0;
    MOCK_RECEIVING_ROWS.forEach(row => {
      const val = String((row as any)[key] ?? '');
      const w = measureTextWidth(val, '14px "Public Sans","Noto Sans JP",sans-serif') + 32;
      if (w > maxDataW) maxDataW = w;
    });
    const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  }, [columns]);

  const moveColumn = useCallback((dragKey: string, hoverKey: string) => {
    setColumns(prev => {
      const arr = [...prev];
      const from = arr.findIndex(c => c.key === dragKey);
      const to   = arr.findIndex(c => c.key === hoverKey);
      if (from < 0 || to < 0) return prev;
      const [removed] = arr.splice(from, 1);
      arr.splice(to, 0, removed);
      return arr;
    });
  }, []);

  // ── 橫向拖拉捲動 ──
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── 篩選 ──
  const filteredData = useMemo(() => {
    let data = MOCK_RECEIVING_ROWS;

    // 搜尋列篩選
    if (purchaseOrg) data = data.filter(r => r.purchaseOrg === purchaseOrg);
    if (vendorKeyword.trim()) {
      const kw = vendorKeyword.trim().toLowerCase();
      data = data.filter(r =>
        r.vendorName.toLowerCase().includes(kw) || r.vendorCode.toLowerCase().includes(kw)
      );
    }
    if (materialKeyword.trim()) {
      const kw = materialKeyword.trim().toLowerCase();
      data = data.filter(r => r.materialNo.toLowerCase().includes(kw));
    }

    // FilterDialog 條件
    filters.forEach(f => {
      data = data.filter(row => {
        const val = String((row as any)[f.column] ?? '').toLowerCase();
        const term = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains':    return val.includes(term);
          case 'equals':      return val === term;
          case 'startsWith':  return val.startsWith(term);
          case 'notContains': return !val.includes(term);
          default:            return true;
        }
      });
    });
    return data;
  }, [purchaseOrg, vendorKeyword, materialKeyword, filters]);

  // 分頁
  useEffect(() => { setPage(1); }, [purchaseOrg, vendorKeyword, materialKeyword, filters]);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // ── 欄位顯示/隱藏 ──
  const colSelectorItems = useMemo(() =>
    columns.map(c => ({ key: c.key, label: c.label, visible: c.visible !== false })),
    [columns]
  );

  const filterColumns = useMemo(() =>
    columns.map(c => ({ key: c.key, label: c.label })),
    [columns]
  );

  // ── 匯出 CSV ──
  const handleExportCsv = useCallback(() => {
    const header = visibleColumns.map(c => c.label).join(',');
    const rows = filteredData.map(row =>
      visibleColumns.map(c => `"${String((row as any)[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '已出貨未收料.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [filteredData, visibleColumns]);

  // ── 儲存格渲染 ──────────────────────────────────────────────────────────────
  const renderCell = (col: RecvCol, row: ReceivingRow) => {
    switch (col.key) {
      case 'vendorCode':
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">
            {row.vendorName}（{row.vendorCode}）
          </span>
        );
      case 'orderDocSeq':
        return (
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer text-left"
            onClick={() => onOrderDetail(row)}
          >
            {row.orderDocSeq}
          </button>
        );
      case 'vendorShipmentNo':
        return (
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer text-left"
            onClick={() => onShipmentDetail(row)}
          >
            {row.vendorShipmentNo}
          </button>
        );
      case 'orderQty':
      case 'shipQty':
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">
            {(row as any)[col.key]}
          </span>
        );
      default:
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] truncate block" title={String((row as any)[col.key] ?? '')}>
            {(row as any)[col.key] ?? '—'}
          </span>
        );
    }
  };

  return (
    <>
      {/* ── 搜尋列（平均欄寬：每個欄位用 flex-1 min-w-0 包裹）── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        {/* 採購組織 */}
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="採購組織"
            value={purchaseOrg}
            onChange={setPurchaseOrg}
            options={PURCHASE_ORG_OPTIONS}
          />
        </div>
        {/* 供應商 */}
        <div className="flex-1 min-w-0">
          <SearchField
            label="供應商"
            value={vendorKeyword}
            onChange={setVendorKeyword}
            placeholder="名稱或代碼關鍵字"
          />
        </div>
        {/* 料號 */}
        <div className="flex-1 min-w-0">
          <SearchField
            label="料號"
            value={materialKeyword}
            onChange={setMaterialKeyword}
            placeholder="料號關鍵字"
          />
        </div>
      </div>

      {/* ── Toolbar ── */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => setShowColSelector(v => !v)}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={handleExportCsv}
      />

      {/* ColumnSelector */}
      {showColSelector && (
        <ColumnSelector
          columns={colSelectorItems}
          onClose={() => setShowColSelector(false)}
          onChange={updated => {
            setColumns(prev =>
              updated
                .map(u => {
                  const col = prev.find(c => c.key === u.key);
                  return col ? { ...col, visible: u.visible } : null;
                })
                .filter(Boolean) as RecvCol[]
            );
          }}
        />
      )}

      {/* FilterDialog */}
      {showFilterDialog && (
        <FilterDialog
          columns={filterColumns}
          filters={filters}
          onClose={() => setShowFilterDialog(false)}
          onApply={f => { setFilters(f); setShowFilterDialog(false); }}
        />
      )}

      {/* ── 表格 ── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  dragType={DRAG_TYPE}
                  isLast={idx === visibleColumns.length - 1}
                  moveColumn={moveColumn}
                  updateColumnWidth={updateColumnWidth}
                  autoFitWidth={autoFitWidth}
                  sortConfig={sortConfig}
                  onSort={(key) => {
                    setSortConfig(prev =>
                      prev.key === key
                        ? { key, direction: prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc' }
                        : { key, direction: 'asc' }
                    );
                  }}
                />
              ))}
            </div>

            {/* 資料列 */}
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center py-[60px]">
                <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">查無資料</span>
              </div>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <div
                  key={row.id}
                  className={`flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${rowIdx % 2 === 0 ? '' : 'bg-[rgba(145,158,171,0.02)]'}`}
                >
                  {visibleColumns.map((col, colIdx) => (
                    <div
                      key={col.key}
                      style={colIdx === visibleColumns.length - 1 ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                      className={`flex items-center px-[16px] py-[12px] overflow-hidden ${colIdx < visibleColumns.length - 1 ? 'border-r border-[rgba(145,158,171,0.08)]' : ''}`}
                    >
                      {renderCell(col, row)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── 分頁 ── */}
      <PaginationControls
        total={filteredData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={v => { setRowsPerPage(v); setPage(1); }}
      />

      {/* ── Overlays（已移至上層 ReceivingInquiryPage 管理）── */}
    </>
  );
}

// ── TabItem（對齊設計規範）────────────────────────────────────────────────────
function TabItem({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer select-none"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
        {label}
      </p>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
const TABS: { key: ReceivingTab; label: string }[] = [
  { key: 'shipped-not-received',    label: '已出貨未收料' },
  { key: 'should-ship-not-shipped', label: '延遲到貨' },
  { key: 'outsource',               label: '委外加工單狀況' },
];

export function ReceivingInquiryPage() {
  const [activeTab, setActiveTab] = useState<ReceivingTab>('shipped-not-received');

  // ── 訂單明細（整頁替換） ──────────────────────────────────────────────────
  const [orderDetailRow, setOrderDetailRow] = useState<ReceivingRow | null>(null);

  // ── 出貨單明細（整頁替換） ────────────────────────────────────────────────
  const [shipmentDetailRow, setShipmentDetailRow] = useState<ReceivingRow | null>(null);

  // ── 訂單明細：整頁替換 ────────────────────────────────────────────────────
  if (orderDetailRow) {
    return (
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
        <OrderDetail
          onClose={() => setOrderDetailRow(null)}
          orderData={{
            orderNo:  orderDetailRow.orderNo,
            orderSeq: orderDetailRow.orderSeq,
            vendor:   `${orderDetailRow.vendorName}（${orderDetailRow.vendorCode}）`,
            status:   'CK',
            orderQty: orderDetailRow.orderQty,
          }}
          isReadOnly={true}
        />
      </div>
    );
  }

  // ── 出貨單明細：整頁替換（readOnly mode + csvData 提供明細行）────────────
  if (shipmentDetailRow) {
    // 同一廠商出貨單下所有序號
    const relatedRows = MOCK_RECEIVING_ROWS.filter(r => r.vendorShipmentNo === shipmentDetailRow.vendorShipmentNo);
    const csvData: CsvPrefillData = {
      vendorShipmentNo: shipmentDetailRow.vendorShipmentNo,
      currency:         'TWD',
      transportType:    'S',
      deliveryDate:     shipmentDetailRow.deliveryDate,
      arrivalDate:      '',
      deliveryAddress:  '',
      rows: relatedRows.map((r, idx) => ({
        itemNo:           idx + 1,
        orderNo:          r.orderNo,
        orderSeq:         r.orderSeq,
        shipQty:          r.shipQty,
        qtyPerBox:        '',
        netWeight:        '0',
        grossWeight:      '0',
        weightUnit:       'KG',
        countryOfOrigin:  'TW',
      })),
    };
    return (
      <ShipmentDetailPage
        selectedOrders={[]}
        readOnly={true}
        sapDeliveryNo={shipmentDetailRow.vendorShipmentNo}
        csvData={csvData}
        onClose={() => setShipmentDetailRow(null)}
      />
    );
  }

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── TAB 列（對齊設計規範：gap-40, px-20, 底部灰線）── */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full overflow-x-auto">
            {TABS.map(tab => (
              <TabItem
                key={tab.key}
                label={tab.label}
                isActive={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
            {/* 底部灰色底線 */}
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>
      </div>

      {/* ── TAB 內容 ── */}
      {activeTab === 'shipped-not-received'    && (
        <ShippedNotReceivedTab
          onOrderDetail={setOrderDetailRow}
          onShipmentDetail={setShipmentDetailRow}
        />
      )}
      {activeTab === 'should-ship-not-shipped' && <ShouldShipNotShippedTab />}
      {activeTab === 'outsource' && (
        <OutsourceTab
          onOrderDetail={row => setOrderDetailRow(row as any)}
          onShipmentDetail={row => setShipmentDetailRow(row as any)}
        />
      )}
    </div>
  );
}
