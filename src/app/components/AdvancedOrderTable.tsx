import { useState, useCallback, useEffect, useMemo , useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { CheckboxIcon } from './CheckboxIcon';
import { MoreVertical, CheckCircle } from 'lucide-react';
import svgTrash from '@/imports/svg-g29eakwhmm';
import svgCheckboxOn from '@/imports/svg-jk6epzc9me';
import type { FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';

// ===== Constants =====
const CHECKBOX_WIDTH = 88;
const ACTION_WIDTH = 140;

// ===== Types =====
export type OrderColumnKey =
  // ── 狀態 & 標頭 ──
  | 'status' | 'orderNo' | 'orderDate'
  // ── 訂單基本資料（Row 1） ──
  | 'orderType' | 'company' | 'purchaseOrg' | 'orderSeq' | 'docSeqNo'
  // ── 訂單基本資料（Row 2） ──
  | 'purchaser' | 'orderQty' | 'acceptQty' | 'comparePrice' | 'unit' | 'currency'
  // ── 訂單基本資料（Row 3） ──
  | 'leadtime' | 'vendorCode' | 'vendorName' | 'materialNo' | 'customerBrand' | 'vendorMaterialNo'
  // ── 品名 & 規格 ──
  | 'productName' | 'specification'
  // ── 交貨排程 ──
  | 'expectedDelivery' | 'vendorDeliveryDate' | 'deliveryQty' | 'dayDiff' | 'schedLineIndex'
  // ── 生管排程 ──
  | 'productionScheduleDate' | 'prodSchedDayDiff'
  // ── More 區域 ──
  | 'inTransitQty' | 'undeliveredQty' | 'lineItemNote'
  | 'internalNote' | 'materialPOContent'
  | 'storageLocationCode';

export interface OrderColumn {
  key: OrderColumnKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

// 交貨排程單行（拆期 / 拆單後使用）
export interface ScheduleLine {
  index: number;
  expectedDelivery?: string; // 預計交期
  deliveryDate: string; // 廠商可交貨日期
  productionScheduleDate?: string; // 生管端交貨日期
  quantity: number;
}

export interface OrderRow {
  id: number;
  status: 'NP' | 'V' | 'B' | 'CK' | 'CL';
  // ── 標頭 ──
  orderNo: string;
  orderDate: string;
  // ── Row 1 ──
  orderType: string;
  company?: string;
  purchaseOrg?: string;
  orderSeq: string;
  docSeqNo: string;
  // ── Row 2 ──
  purchaser?: string;
  orderQty: number;
  acceptQty: number;
  comparePrice?: string;
  unit?: string;
  currency?: string;
  // ── Row 3 ──
  leadtime?: number;
  vendorCode: string;
  vendorName: string;
  materialNo: string;
  customerBrand?: string;
  vendorMaterialNo?: string;
  // ── 品名 & 規格 ──
  productName: string;
  specification: string;
  // ── 交貨排程 ──
  expectedDelivery: string;
  vendorDeliveryDate?: string;
  deliveryQty?: number;
  // dayDiff 為計算值，不存欄位
  scheduleLines?: ScheduleLine[]; // 拆期 / 拆單後的多行排程
  // ── More ──
  inTransitQty: number;
  undeliveredQty: number;
  lineItemNote?: string;
  agreedDate?: string; // 保留資料欄位但不顯示為欄位
  internalNote?: string;
  materialPOContent?: string;
  // ── 既有額外欄位（保留資料但不顯示為欄位）──
  gbdOrderNo?: string;
  statisticalDeliveryDate?: string;
  // ── 生管排程欄位 ──
  productionScheduleDate?: string; // 生管端交貨日期（變更生管排程頁使用）
  // ── 不接單標記 ──
  isRejectedOrder?: boolean;
  // ── 調整單據類型標記（廠商選擇拆單時記錄） ──
  adjustmentType?: 'modify' | 'reject' | 'split' | 'split-order';
  // ── 刪單標記（刪單修正單完成 CL 時寫入修正單號） ──
  deletionCode?: string;
  // ── 儲存地點代碼（SAP 開單時設定） ──
  storageLocationCode?: string;
  // ── 工廠代號 ──
  plantCode?: string;
}

interface AdvancedOrderTableProps {
  activeTab: string;
  data: OrderRow[];
  onOrderConfirm?: (row: OrderRow) => void;
  onMoreOptions?: (row: OrderRow) => void;
  userEmail?: string;
  userRole?: string;
  onColumnsChange?: (columns: OrderColumn[]) => void;
  columnsVersion?: number;
  appliedFilters?: FilterCondition[];
  selectedOrderIds: Set<number>;
  onToggleOrder: (orderId: number) => void;
  onSelectAll: () => void;
  onBatchAction?: (action: 'approve') => void;
  /** 覆蓋預設欄位配置（如未設定則使用 defaultOrderColumns） */
  initialColumns?: OrderColumn[];
  /** 覆蓋 localStorage key 前綴（預設 'orderList_v2'） */
  storageKeyPrefix?: string;
  /** 強制顯示 Checkbox 欄（無論 activeTab 為何） */
  forceShowCheckbox?: boolean;
  /** 自訂批次選取列右側操作按鈕（取代預設「批次訂單確認」） */
  batchActions?: React.ReactNode;
  /**
   * 當提供此 callback 時，在 checkbox 欄右側插入一個 sticky 的「單號序號」欄，
   * 以藍字底線樣式顯示，點擊後呼叫此 callback 進入明細。
   * 同時隱藏右側的 ... 操作欄。
   */
  onDocNoClick?: (row: OrderRow) => void;
}

// ===== 差異天數計算工具 =====
export function computeRowDayDiff(row: OrderRow): number | null {
  if (!row.vendorDeliveryDate) return null;
  try {
    const parse = (s: string) => {
      const [y, m, d] = s.split('/').map(Number);
      return new Date(y, m - 1, d).getTime();
    };
    return Math.round((parse(row.vendorDeliveryDate) - parse(row.expectedDelivery)) / 86_400_000);
  } catch {
    return null;
  }
}

// 差異天數(cfn2-1)：生管端交貨日期 − 廠商可交貨日期
export function computeProdSchedDayDiff(row: OrderRow): number | null {
  if (!row.productionScheduleDate || !row.vendorDeliveryDate) return null;
  try {
    const parse = (s: string) => {
      const [y, m, d] = s.split('/').map(Number);
      return new Date(y, m - 1, d).getTime();
    };
    return Math.round((parse(row.productionScheduleDate) - parse(row.vendorDeliveryDate)) / 86_400_000);
  } catch {
    return null;
  }
}

/**
 * 未交量 = 訂單量 - (在途量 + 驗收量)，最小為 0。
 * 全系統統一使用此函式，不依賴 undeliveredQty 存儲欄位。
 */
export function calcUndeliveredQty(
  orderQty: number,
  acceptQty: number,
  inTransitQty: number,
): number {
  return Math.max(0, orderQty - acceptQty - inTransitQty);
}

// ===== Default Columns =====
// ── 預設顯示的欄位（維持原有的主要欄位）──
// ── 新增欄位 visible:false 預設隱藏，可透過欄位選擇器開啟 ──
export const defaultOrderColumns: OrderColumn[] = [
  // 狀態 & 標頭
  { key: 'status',               label: '訂單狀態',           width: 110,  minWidth: 90  },
  { key: 'orderNo',              label: '訂單號碼',           width: 140,  minWidth: 100 },
  { key: 'orderDate',            label: '訂單日期',           width: 120,  minWidth: 100 },
  // Row 1 基本資料
  { key: 'orderType',            label: '訂單類型',           width: 130,  minWidth: 100 },
  { key: 'company',              label: '公司',               width: 140,  minWidth: 100, visible: false },
  { key: 'purchaseOrg',         label: '採購組織',           width: 180,  minWidth: 130, visible: false },
  { key: 'orderSeq',             label: '訂單序號',           width: 100,  minWidth: 80  },
  { key: 'docSeqNo',             label: '單號序號',           width: 160,  minWidth: 120 },
  // Row 2
  { key: 'purchaser',            label: '採購人員',           width: 110,  minWidth: 90,  visible: false },
  { key: 'orderQty',             label: '訂貨量',             width: 100,  minWidth: 80  },
  { key: 'acceptQty',            label: '驗收量',             width: 100,  minWidth: 80  },
  { key: 'comparePrice',         label: '比對單價',           width: 160,  minWidth: 120, visible: false },
  { key: 'unit',                 label: '單位',               width: 80,   minWidth: 60,  visible: false },
  { key: 'currency',             label: '幣別',               width: 80,   minWidth: 60,  visible: false },
  // Row 3
  { key: 'leadtime',             label: 'leadtime',           width: 90,   minWidth: 70,  visible: false },
  { key: 'vendorCode',           label: '廠商編號',           width: 130,  minWidth: 100 },
  { key: 'vendorName',           label: '廠商簡稱(編號)',     width: 200,  minWidth: 120 },
  { key: 'materialNo',           label: '料號',               width: 200,  minWidth: 120 },
  { key: 'customerBrand',        label: '客戶品牌',           width: 100,  minWidth: 80,  visible: false },
  { key: 'vendorMaterialNo',     label: '廠商料號',           width: 180,  minWidth: 130, visible: false },
  // 品名 & 規格
  { key: 'productName',          label: '品名',               width: 200,  minWidth: 120 },
  { key: 'specification',        label: '規格',               width: 280,  minWidth: 150 },
  // 交貨排程
  { key: 'expectedDelivery',     label: '預計交期',           width: 120,  minWidth: 100 },
  { key: 'vendorDeliveryDate',   label: '廠商可交貨日期',     width: 150,  minWidth: 110 },
  { key: 'deliveryQty',          label: '交貨量',             width: 100,  minWidth: 80,  visible: false },
  { key: 'schedLineIndex',       label: '項次',               width: 80,   minWidth: 60,  visible: false },
  { key: 'dayDiff',              label: '差異天數',           width: 100,  minWidth: 80  },
  { key: 'productionScheduleDate', label: '生管端交貨日期',   width: 150,  minWidth: 110, visible: false },
  { key: 'prodSchedDayDiff',     label: '差異天數(cfn2-1)',   width: 130,  minWidth: 100, visible: false },
  // More
  { key: 'inTransitQty',         label: '在途量',             width: 100,  minWidth: 80  },
  { key: 'undeliveredQty',       label: '未交量',             width: 100,  minWidth: 80  },
  { key: 'lineItemNote',         label: '單項小記',           width: 110,  minWidth: 90,  visible: false },
  { key: 'internalNote',         label: '項目註記(內部)',      width: 280,  minWidth: 150, visible: false },
  { key: 'materialPOContent',    label: '物料PO內文',         width: 280,  minWidth: 150, visible: false },
  { key: 'storageLocationCode',  label: '儲存地點代碼',       width: 130,  minWidth: 100, visible: false },
];

export function getOrderColumns(): OrderColumn[] {
  return defaultOrderColumns.map(col => ({ ...col }));
}

// ===== Mock Data =====
export const orderMockData: OrderRow[] = [
  {
    id: 1, status: 'NP',
    orderNo: '400649723', orderDate: '2025/04/10', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '10', docSeqNo: '400649723010',
    purchaser: '王大明', orderQty: 100, acceptQty: 0, comparePrice: '33.34(有限定廠商)', unit: 'SET', currency: 'TWD',
    leadtime: 5, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '1129-CSL0075-L01', customerBrand: 'G01', vendorMaterialNo: 'SL-M8100-R',
    productName: '前變速器組', specification: 'REMEDY 7 A 17.5~21.5 TK426-M 金油下-無膜標(一般色) TS1186D',
    expectedDelivery: '2026/03/02', deliveryQty: 100,
    inTransitQty: 0, undeliveredQty: 100, lineItemNote: '3334', agreedDate: '/',
    internalNote: '2305,24SU_COSPEED_G_ER(限GEM採購可改)', materialPOContent: 'DISCONTINUED, CHANGE TO 1560-CROSSC-0008',
    gbdOrderNo: 'GBD-2025-001234', statisticalDeliveryDate: '2025/05/20', storageLocationCode: '2020', plantCode: 'GTM1',
  },
  {
    id: 2, status: 'NP',
    orderNo: '400649724', orderDate: '2025/04/11', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '20', docSeqNo: '400649724020',
    purchaser: '李玉霞', orderQty: 50, acceptQty: 0, comparePrice: '480', unit: 'PC', currency: 'TWD',
    leadtime: 7, vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '1129-CSL0075-L02', customerBrand: 'G02', vendorMaterialNo: 'FK901-C-CF',
    productName: '碳纖維前叉', specification: 'DEFY ADVANCED PRO 1 ML/L 前叉 FK901-C',
    expectedDelivery: '2026/03/02', deliveryQty: 50,
    inTransitQty: 10, undeliveredQty: 40, lineItemNote: '24000', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001235', statisticalDeliveryDate: '2025/05/22', storageLocationCode: '2110', plantCode: 'GTM1',
  },
  {
    id: 3, status: 'NP',
    orderNo: '400649725', orderDate: '2025/04/12', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '30', docSeqNo: '400649725030',
    purchaser: '陳俊宏', orderQty: 80, acceptQty: 0, comparePrice: '2890', unit: 'SET', currency: 'TWD',
    leadtime: 14, vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '2201-FRM0088-A01', customerBrand: 'G01', vendorMaterialNo: 'TCR-ASL-DISC-ML',
    productName: '公路車車架', specification: 'TCR ADVANCED SL DISC FRAME ML CARBON/ORANGE',
    expectedDelivery: '2026/03/02', deliveryQty: 80,
    inTransitQty: 0, undeliveredQty: 80, lineItemNote: '231200', agreedDate: '/',
    internalNote: '', materialPOContent: 'LIMITED QTY - PRIORITY ORDER',
    gbdOrderNo: 'GBD-2025-001236', statisticalDeliveryDate: '2025/05/25', storageLocationCode: '2020', plantCode: 'GTM2',
  },
  {
    id: 4, status: 'V', vendorDeliveryDate: '2025/05/14',
    orderNo: '400649726', orderDate: '2025/04/08', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '40', docSeqNo: '400649726040',
    purchaser: '吳佳慧', orderQty: 120, acceptQty: 5, comparePrice: '980', unit: 'SET', currency: 'TWD',
    leadtime: 5, vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '3301-HDL0045-B02', customerBrand: 'G03', vendorMaterialNo: 'AERO-OD2-400',
    productName: '空氣力學把手', specification: 'CONTACT SLR AERO OD2 HANDLEBAR 400MM',
    expectedDelivery: '2026/03/02', deliveryQty: 120,
    inTransitQty: 25, undeliveredQty: 90, lineItemNote: '117600', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001237', statisticalDeliveryDate: '2025/05/12',
  },
  {
    id: 5, status: 'V', vendorDeliveryDate: '2025/05/12',
    orderNo: '400649727', orderDate: '2025/04/09', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '50', docSeqNo: '400649727050',
    purchaser: '張建國', orderQty: 90, acceptQty: 10, comparePrice: '1200', unit: 'EA', currency: 'USD',
    leadtime: 5, vendorCode: '00010012', vendorName: '台灣製造(00010012)',
    materialNo: '4401-SDP0022-C01', customerBrand: 'G02', vendorMaterialNo: 'FLEET-SLR-F-145',
    productName: '競賽座墊', specification: 'FLEET SLR FORWARD SADDLE 145MM',
    expectedDelivery: '2026/03/02', deliveryQty: 90,
    inTransitQty: 15, undeliveredQty: 65, lineItemNote: '108000', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001238', statisticalDeliveryDate: '2025/05/14',
  },
  {
    id: 6, status: 'V', vendorDeliveryDate: '2025/05/12',
    orderNo: '400649728', orderDate: '2025/04/05', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '60', docSeqNo: '400649728060',
    purchaser: '林美珍', orderQty: 200, acceptQty: 30, comparePrice: '450', unit: 'SET', currency: 'TWD',
    leadtime: 7, vendorCode: '00010045', vendorName: '精密工業(00010045)',
    materialNo: '5501-BRK0011-D01', customerBrand: 'G04', vendorMaterialNo: 'COND-SL-DISC-F',
    productName: '碟煞系統', specification: 'CONDUCT SL DISC BRAKE FRONT HYDRAULIC',
    expectedDelivery: '2026/03/02', deliveryQty: 200,
    inTransitQty: 50, undeliveredQty: 120, lineItemNote: '90000', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001239', statisticalDeliveryDate: '2025/05/10',
  },
  {
    id: 7, status: 'B', vendorDeliveryDate: '2025/05/08',
    orderNo: '400649729', orderDate: '2025/03/25', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '70', docSeqNo: '400649729070',
    purchaser: '周志偉', orderQty: 150, acceptQty: 45, comparePrice: '380', unit: 'PCS', currency: 'TWD',
    leadtime: 10, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '6601-DRL0033-E02', customerBrand: 'G01', vendorMaterialNo: 'RD-M8100-SGS',
    productName: '後變速器', specification: 'SHIMANO DEORE XT RD-M8100 SGS 12-SPEED',
    expectedDelivery: '2026/03/02', deliveryQty: 150,
    inTransitQty: 30, undeliveredQty: 75, lineItemNote: '57000', agreedDate: '2025/04/28',
    internalNote: '', materialPOContent: 'STANDARD ORDER',
    gbdOrderNo: 'GBD-2025-001240', statisticalDeliveryDate: '2025/05/02',
  },
  {
    id: 8, status: 'B', vendorDeliveryDate: '2025/05/10',
    orderNo: '400649730', orderDate: '2025/03/28', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '80', docSeqNo: '400649730080',
    purchaser: '黃淑芬', orderQty: 60, acceptQty: 20, comparePrice: '8800', unit: 'SET', currency: 'USD',
    leadtime: 14, vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '7701-WHL0055-F01', customerBrand: 'G03', vendorMaterialNo: 'SLR1-42-DISC-F',
    productName: '碟煞輪組前輪', specification: 'SLR 1 42 DISC WHEELSYSTEM FRONT 12X100',
    expectedDelivery: '2026/03/02', deliveryQty: 60,
    inTransitQty: 10, undeliveredQty: 30, lineItemNote: '528000', agreedDate: '2025/04/30',
    internalNote: '限整採可編輯', materialPOContent: 'HIGH VALUE - PRIORITY',
    gbdOrderNo: 'GBD-2025-001241', statisticalDeliveryDate: '2025/05/05',
  },
  {
    id: 9, status: 'CK', vendorDeliveryDate: '2025/04/20',
    orderNo: '400649731', orderDate: '2025/03/15', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '90', docSeqNo: '400649731090',
    purchaser: '王大明', orderQty: 100, acceptQty: 80, comparePrice: '85', unit: 'PCS', currency: 'TWD',
    leadtime: 5, vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '8801-TIR0077-G01', customerBrand: 'G02', vendorMaterialNo: 'GAVIA-CRS1-700X25C',
    productName: '公路車外胎', specification: 'GAVIA COURSE 1 700X25C TUBELESS READY',
    expectedDelivery: '2026/03/02', deliveryQty: 300,
    inTransitQty: 20, undeliveredQty: 0, lineItemNote: '25500', agreedDate: '2025/04/18',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001242', statisticalDeliveryDate: '2025/04/22',
  },
  {
    id: 10, status: 'CK', vendorDeliveryDate: '2025/04/25',
    orderNo: '400649732', orderDate: '2025/03/18', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '100', docSeqNo: '400649732100',
    purchaser: '李玉霞', orderQty: 180, acceptQty: 180, comparePrice: '2600', unit: 'SET', currency: 'TWD',
    leadtime: 10, vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '9901-SPT0012-H01', customerBrand: 'G01', vendorMaterialNo: 'D-FUSE-SP-TCR',
    productName: '碳纖維座管', specification: 'D-FUSE SEATPOST COMPOSITE FOR TCR',
    expectedDelivery: '2026/03/02', deliveryQty: 180,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '468000', agreedDate: '2025/04/25',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001243', statisticalDeliveryDate: '2025/04/25',
  },
  {
    id: 11, status: 'CL', vendorDeliveryDate: '2025/03/15',
    orderNo: '400649733', orderDate: '2025/02/10', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '110', docSeqNo: '400649733110',
    purchaser: '陳俊宏', orderQty: 500, acceptQty: 500, comparePrice: '48', unit: 'PCS', currency: 'TWD',
    leadtime: 3, vendorCode: '00010012', vendorName: '台灣製造(00010012)',
    materialNo: '1101-PED0088-I01', customerBrand: 'G04', vendorMaterialNo: 'PLAT-PED-NYLON',
    productName: '平面踏板', specification: 'PLATFORM PEDAL NYLON BODY CR-MO AXLE',
    expectedDelivery: '2026/03/02', deliveryQty: 500,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '24000', agreedDate: '2025/03/14',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001244', statisticalDeliveryDate: '2025/03/15',
  },
  {
    id: 12, status: 'CL', vendorDeliveryDate: '2025/03/20',
    orderNo: '400649734', orderDate: '2025/02/15', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '120', docSeqNo: '400649734120',
    purchaser: '吳佳慧', orderQty: 400, acceptQty: 400, comparePrice: '95', unit: 'PCS', currency: 'TWD',
    leadtime: 5, vendorCode: '00010045', vendorName: '精密工業(00010045)',
    materialNo: '1201-CHN0044-J01', customerBrand: 'G05', vendorMaterialNo: 'CN-HG701-11SPD',
    productName: '11速鏈條', specification: 'SHIMANO CN-HG701 11-SPEED CHAIN',
    expectedDelivery: '2026/03/02', deliveryQty: 400,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '38000', agreedDate: '2025/03/20',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001245', statisticalDeliveryDate: '2025/03/20',
  },
  {
    id: 13, status: 'NP',
    orderNo: '400649735', orderDate: '2025/04/15', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '130', docSeqNo: '400649735130',
    purchaser: '張建國', orderQty: 70, acceptQty: 0, comparePrice: '560', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '1301-STM0022-K01', customerBrand: 'G02', vendorMaterialNo: 'CONT-SL-OD2-90',
    productName: '龍頭', specification: 'CONTACT SL OD2 STEM 90MM -8DEG',
    expectedDelivery: '2026/03/02', deliveryQty: 70,
    inTransitQty: 0, undeliveredQty: 70, lineItemNote: '39200', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001246', statisticalDeliveryDate: '2025/05/28',
  },
  {
    id: 14, status: 'V', vendorDeliveryDate: '2025/05/10',
    orderNo: '400649736', orderDate: '2025/04/06', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '140', docSeqNo: '400649736140',
    purchaser: '林美珍', orderQty: 250, acceptQty: 50, comparePrice: '38', unit: 'PCS', currency: 'TWD',
    leadtime: 3, vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '1401-GRP0033-L01', customerBrand: 'G03', vendorMaterialNo: 'STRATUS-LITE-130',
    productName: '握把套', specification: 'STRATUS LITE GRIP 130MM BLACK',
    expectedDelivery: '2026/03/02', deliveryQty: 250,
    inTransitQty: 40, undeliveredQty: 160, lineItemNote: '9500', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001247', statisticalDeliveryDate: '2025/05/08',
  },
  {
    id: 15, status: 'B', vendorDeliveryDate: '2025/05/05',
    orderNo: '400649737', orderDate: '2025/03/20', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '150', docSeqNo: '400649737150',
    purchaser: '周志偉', orderQty: 110, acceptQty: 35, comparePrice: '220', unit: 'EA', currency: 'TWD',
    leadtime: 7, vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '1501-BBR0011-M01', customerBrand: 'G01', vendorMaterialNo: 'BB-MT800-PF',
    productName: '中軸', specification: 'SHIMANO BB-MT800 PRESS FIT BB',
    expectedDelivery: '2026/03/02', deliveryQty: 110,
    inTransitQty: 20, undeliveredQty: 55, lineItemNote: '24200', agreedDate: '2025/04/26',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-001248', statisticalDeliveryDate: '2025/05/01',
  },
  // ── Z2HB 假資料（合約採購訂單）──────────────────────────────────────────────
  {
    id: 16, status: 'NP',
    orderNo: '400650101', orderDate: '2025/04/18', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '10', docSeqNo: '400650101010',
    purchaser: '黃淑芬', orderQty: 200, acceptQty: 0, comparePrice: '4500', unit: 'SET', currency: 'TWD',
    leadtime: 21, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '2201-FRM0101-N01', customerBrand: 'G01', vendorMaterialNo: 'PROPEL-ASL-DISC-XL',
    productName: '氣動車架', specification: 'PROPEL ADVANCED SL DISC FRAME XL CARBON/BLACK',
    expectedDelivery: '2026/03/02', deliveryQty: 200,
    inTransitQty: 0, undeliveredQty: 200, lineItemNote: '900000', agreedDate: '/',
    internalNote: '高價品項，注意包裝', materialPOContent: 'CONTRACT ORDER - NO SUBSTITUTION',
    gbdOrderNo: 'GBD-2025-002101', statisticalDeliveryDate: '2025/06/12',
  },
  {
    id: 17, status: 'NP',
    orderNo: '400650102', orderDate: '2025/04/20', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '20', docSeqNo: '400650102020',
    purchaser: '王大明', orderQty: 120, acceptQty: 0, comparePrice: '12500', unit: 'SET', currency: 'USD',
    leadtime: 21, vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '3301-WHL0102-N02', customerBrand: 'G02', vendorMaterialNo: 'SLR0-C42-DISC-R',
    productName: '碳纖維輪組後輪', specification: 'SLR 0 CARBON 42 DISC WHEELSYSTEM REAR 12X142',
    expectedDelivery: '2026/03/02', deliveryQty: 120,
    inTransitQty: 0, undeliveredQty: 120, lineItemNote: '1500000', agreedDate: '/',
    internalNote: '', materialPOContent: 'CONTRACT ORDER',
    gbdOrderNo: 'GBD-2025-002102', statisticalDeliveryDate: '2025/06/18',
  },
  {
    id: 18, status: 'NP',
    orderNo: '400650103', orderDate: '2025/04/22', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '30', docSeqNo: '400650103030',
    purchaser: '李玉霞', orderQty: 90, acceptQty: 0, comparePrice: '1980', unit: 'SET', currency: 'TWD',
    leadtime: 14, vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '4401-FRK0103-N03', customerBrand: 'G03', vendorMaterialNo: 'TCR-ASL-FORK-CS',
    productName: '碳纖維前叉(合約)', specification: 'TCR ADVANCED SL FORK CARBON STEERER 1-1/8"',
    expectedDelivery: '2026/03/02', deliveryQty: 90,
    inTransitQty: 0, undeliveredQty: 90, lineItemNote: '178200', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-002103', statisticalDeliveryDate: '2025/06/22',
  },
  {
    id: 19, status: 'V', vendorDeliveryDate: '2025/06/08',
    orderNo: '400650104', orderDate: '2025/04/10', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '40', docSeqNo: '400650104040',
    purchaser: '陳俊宏', orderQty: 160, acceptQty: 20, comparePrice: '3200', unit: 'PCS', currency: 'TWD',
    leadtime: 14, vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '5501-HDL0104-N04', customerBrand: 'G04', vendorMaterialNo: 'CONT-SLR-OD2-420',
    productName: '碳纖維把手', specification: 'CONTACT SLR OD2 AERO HANDLEBAR 420MM CARBON',
    expectedDelivery: '2026/03/02', deliveryQty: 160,
    inTransitQty: 30, undeliveredQty: 110, lineItemNote: '512000', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-002104', statisticalDeliveryDate: '2025/06/02',
  },
  {
    id: 20, status: 'V', vendorDeliveryDate: '2025/06/04',
    orderNo: '400650105', orderDate: '2025/04/08', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '50', docSeqNo: '400650105050',
    purchaser: '吳佳慧', orderQty: 75, acceptQty: 10, comparePrice: '5800', unit: 'PCS', currency: 'USD',
    leadtime: 10, vendorCode: '00010012', vendorName: '台灣製造(00010012)',
    materialNo: '6601-SDP0105-N05', customerBrand: 'G05', vendorMaterialNo: 'FLEET-SLR-C-143',
    productName: '碳纖維坐墊', specification: 'FLEET SLR CARBON SADDLE 143MM WHITE/BLACK',
    expectedDelivery: '2026/03/02', deliveryQty: 75,
    inTransitQty: 15, undeliveredQty: 50, lineItemNote: '435000', agreedDate: '/',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-002105', statisticalDeliveryDate: '2025/05/30',
  },
  {
    id: 21, status: 'B', vendorDeliveryDate: '2025/05/16',
    orderNo: '400650106', orderDate: '2025/03/30', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '60', docSeqNo: '400650106060',
    purchaser: '張建國', orderQty: 140, acceptQty: 55, comparePrice: '1850', unit: 'SET', currency: 'TWD',
    leadtime: 10, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '7701-CRK0106-N06', customerBrand: 'G01', vendorMaterialNo: 'FC-R9200-DA-5236',
    productName: '牙盤組', specification: 'SHIMANO FC-R9200 DURA-ACE 52/36T 170MM CRANKSET',
    expectedDelivery: '2026/03/02', deliveryQty: 140,
    inTransitQty: 25, undeliveredQty: 60, lineItemNote: '259000', agreedDate: '2025/05/08',
    internalNote: '', materialPOContent: 'CONTRACT ORDER',
    gbdOrderNo: 'GBD-2025-002106', statisticalDeliveryDate: '2025/05/12',
  },
  {
    id: 22, status: 'B', vendorDeliveryDate: '2025/05/20',
    orderNo: '400650107', orderDate: '2025/04/01', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '70', docSeqNo: '400650107070',
    purchaser: '林美珍', orderQty: 85, acceptQty: 30, comparePrice: '6500', unit: 'PCS', currency: 'TWD',
    leadtime: 14, vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '8801-SFT0107-N07', customerBrand: 'G02', vendorMaterialNo: 'ST-R9270-DA-DI2-R',
    productName: '電子變速把手', specification: 'SHIMANO ST-R9270 DURA-ACE DI2 STI LEVER RIGHT',
    expectedDelivery: '2026/03/02', deliveryQty: 85,
    inTransitQty: 10, undeliveredQty: 45, lineItemNote: '552500', agreedDate: '2025/05/13',
    internalNote: '電子組件，注意靜電', materialPOContent: 'ELECTRONIC COMPONENT - HANDLE WITH CARE',
    gbdOrderNo: 'GBD-2025-002107', statisticalDeliveryDate: '2025/05/18',
  },
  {
    id: 23, status: 'CK', vendorDeliveryDate: '2025/04/15',
    orderNo: '400650108', orderDate: '2025/03/05', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '80', docSeqNo: '400650108080',
    purchaser: '周志偉', orderQty: 400, acceptQty: 390, comparePrice: '120', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '9901-TIR0108-N08', customerBrand: 'G03', vendorMaterialNo: 'SCHWALBE-PRO1-28C',
    productName: '無內胎外胎', specification: 'SCHWALBE PRO ONE 700X28C TUBELESS EASY V-GUARD',
    expectedDelivery: '2026/03/02', deliveryQty: 400,
    inTransitQty: 10, undeliveredQty: 0, lineItemNote: '48000', agreedDate: '2025/04/14',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2025-002108', statisticalDeliveryDate: '2025/04/18',
  },
  // ── CK 出貨測試資料（日期卡控驗證，基準日 = 2026/04/15）─────────────────
  // 規則：今日 >= 廠商答交日 − 7天 才可開立出貨單
  //
  // ✅ 可開立（今日 4/15 >= 最早可開立日）：
  //   id:32 → vendorDate 2026/04/20，最早 4/13 ✅
  //   id:33 → vendorDate 2026/04/22，最早 4/15 ✅（剛好今天）
  //
  // ❌ 不可開立（今日 4/15 < 最早可開立日，不顯示在列表）：
  //   id:34 → vendorDate 2026/04/25，最早 4/18 ❌
  //   id:35 → vendorDate 2026/04/30，最早 4/23 ❌
  {
    id: 32, status: 'CK', vendorDeliveryDate: '2026/04/20',
    orderNo: '400651001', orderDate: '2026/04/01', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '10', docSeqNo: '400651001010',
    purchaser: '王大明', orderQty: 200, acceptQty: 50, comparePrice: '580', unit: 'SET', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '2201-FRM0201-P01', customerBrand: 'G01', vendorMaterialNo: 'PROPEL-ASL-DISC-M',
    productName: '氣動公路車架', specification: 'PROPEL ADVANCED SL DISC FRAME M CARBON/WHITE',
    expectedDelivery: '2026/04/20', deliveryQty: 200,
    inTransitQty: 30, undeliveredQty: 120, lineItemNote: '116000', agreedDate: '2026/04/13',
    internalNote: '測試資料：今日(4/15) >= 最早可開立日(4/13) → 應出現', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-TEST001', statisticalDeliveryDate: '2026/04/20', storageLocationCode: '2020', plantCode: 'GTM1',
  },
  {
    id: 33, status: 'CK', vendorDeliveryDate: '2026/04/22',
    orderNo: '400651002', orderDate: '2026/04/03', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '20', docSeqNo: '400651002020',
    purchaser: '李玉霞', orderQty: 150, acceptQty: 0, comparePrice: '9800', unit: 'SET', currency: 'USD',
    leadtime: 7, vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '3301-WHL0202-P02', customerBrand: 'G02', vendorMaterialNo: 'SLR0-C50-DISC-F',
    productName: '碳纖輪組前輪', specification: 'SLR 0 CARBON 50 DISC WHEELSYSTEM FRONT 12X100',
    expectedDelivery: '2026/04/22', deliveryQty: 150,
    inTransitQty: 20, undeliveredQty: 130, lineItemNote: '1470000', agreedDate: '2026/04/15',
    internalNote: '測試資料：今日(4/15) = 最早可開立日(4/15) → 應出現', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-TEST002', statisticalDeliveryDate: '2026/04/22', storageLocationCode: '2110', plantCode: 'GTM1',
  },
  {
    id: 34, status: 'CK', vendorDeliveryDate: '2026/04/25',
    orderNo: '400651003', orderDate: '2026/04/05', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '30', docSeqNo: '400651003030',
    purchaser: '陳俊宏', orderQty: 300, acceptQty: 100, comparePrice: '48', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '8801-TIR0203-P03', customerBrand: 'G03', vendorMaterialNo: 'GAVIA-CRS2-700X28C',
    productName: '公路車外胎', specification: 'GAVIA COURSE 2 700X28C TUBELESS READY BLACK',
    expectedDelivery: '2026/04/25', deliveryQty: 300,
    inTransitQty: 0, undeliveredQty: 200, lineItemNote: '9600', agreedDate: '2026/04/18',
    internalNote: '測試資料：今日(4/15) < 最早可開立日(4/18) → 不應出現', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-TEST003', statisticalDeliveryDate: '2026/04/25', storageLocationCode: '2020',
  },
  {
    id: 35, status: 'CK', vendorDeliveryDate: '2026/04/30',
    orderNo: '400651004', orderDate: '2026/04/07', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '40', docSeqNo: '400651004040',
    purchaser: '吳佳慧', orderQty: 80, acceptQty: 0, comparePrice: '6500', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '8801-SFT0204-P04', customerBrand: 'G04', vendorMaterialNo: 'ST-R9270-DA-DI2-L',
    productName: '電子變速把手(左)', specification: 'SHIMANO ST-R9270 DURA-ACE DI2 STI LEVER LEFT',
    expectedDelivery: '2026/04/30', deliveryQty: 80,
    inTransitQty: 0, undeliveredQty: 80, lineItemNote: '260000', agreedDate: '2026/04/23',
    internalNote: '測試資料：今日(4/15) < 最早可開立日(4/23) → 不應出現', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-TEST004', statisticalDeliveryDate: '2026/04/30', storageLocationCode: '2130',
  },
  // ── 速聯國際 CK 多筆測試資料（測試多項出貨明細）─────────────────────────
  {
    id: 40, status: 'CK', vendorDeliveryDate: '2026/04/25',
    orderNo: '400651010', orderDate: '2026/04/01', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '10', docSeqNo: '400651010010',
    purchaser: '王大明', orderQty: 300, acceptQty: 50, comparePrice: '1200', unit: 'SET', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '1129-CSL0301-A01', customerBrand: 'G01', vendorMaterialNo: 'SL-M7100-R',
    productName: '後變速撥桿', specification: 'SHIMANO SLX SL-M7100 SHIFT LEVER RIGHT 12-SPEED',
    expectedDelivery: '2026/04/25', deliveryQty: 300,
    inTransitQty: 20, undeliveredQty: 230, lineItemNote: '360000', agreedDate: '2026/04/18',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-SL001', statisticalDeliveryDate: '2026/04/25', storageLocationCode: '2020',
  },
  {
    id: 41, status: 'CK', vendorDeliveryDate: '2026/04/25',
    orderNo: '400651010', orderDate: '2026/04/01', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '20', docSeqNo: '400651010020',
    purchaser: '王大明', orderQty: 200, acceptQty: 30, comparePrice: '850', unit: 'SET', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '2201-CHN0302-B01', customerBrand: 'G01', vendorMaterialNo: 'CN-M7100-12SPD',
    productName: '12速鏈條', specification: 'SHIMANO SLX CN-M7100 12-SPEED CHAIN 126L',
    expectedDelivery: '2026/04/25', deliveryQty: 200,
    inTransitQty: 10, undeliveredQty: 160, lineItemNote: '170000', agreedDate: '2026/04/18',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-SL002', statisticalDeliveryDate: '2026/04/25', storageLocationCode: '2020',
  },
  {
    id: 42, status: 'CK', vendorDeliveryDate: '2026/04/26',
    orderNo: '400651011', orderDate: '2026/04/02', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '10', docSeqNo: '400651011010',
    purchaser: '李玉霞', orderQty: 500, acceptQty: 100, comparePrice: '380', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '3301-BRK0303-C01', customerBrand: 'G02', vendorMaterialNo: 'BR-M7100-F',
    productName: '油壓碟煞卡鉗(前)', specification: 'SHIMANO SLX BR-M7100 HYDRAULIC DISC BRAKE CALIPER FRONT',
    expectedDelivery: '2026/04/26', deliveryQty: 500,
    inTransitQty: 50, undeliveredQty: 350, lineItemNote: '190000', agreedDate: '2026/04/19',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-SL003', statisticalDeliveryDate: '2026/04/26', storageLocationCode: '2020',
  },
  {
    id: 43, status: 'CK', vendorDeliveryDate: '2026/04/26',
    orderNo: '400651011', orderDate: '2026/04/02', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '20', docSeqNo: '400651011020',
    purchaser: '李玉霞', orderQty: 500, acceptQty: 80, comparePrice: '380', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '3301-BRK0304-C02', customerBrand: 'G02', vendorMaterialNo: 'BR-M7100-R',
    productName: '油壓碟煞卡鉗(後)', specification: 'SHIMANO SLX BR-M7100 HYDRAULIC DISC BRAKE CALIPER REAR',
    expectedDelivery: '2026/04/26', deliveryQty: 500,
    inTransitQty: 40, undeliveredQty: 380, lineItemNote: '190000', agreedDate: '2026/04/19',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-SL004', statisticalDeliveryDate: '2026/04/26', storageLocationCode: '2020',
  },
  {
    id: 44, status: 'CK', vendorDeliveryDate: '2026/04/27',
    orderNo: '400651012', orderDate: '2026/04/03', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '10', docSeqNo: '400651012010',
    purchaser: '陳俊宏', orderQty: 150, acceptQty: 0, comparePrice: '2800', unit: 'SET', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '4401-CRK0305-D01', customerBrand: 'G01', vendorMaterialNo: 'FC-M7100-1-170',
    productName: '大盤組(1x)', specification: 'SHIMANO SLX FC-M7100-1 CRANKSET 170MM 32T 1X12-SPEED',
    expectedDelivery: '2026/04/27', deliveryQty: 150,
    inTransitQty: 0, undeliveredQty: 150, lineItemNote: '420000', agreedDate: '2026/04/20',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-SL005', statisticalDeliveryDate: '2026/04/27', storageLocationCode: '2110',
  },
  {
    id: 45, status: 'CK', vendorDeliveryDate: '2026/04/27',
    orderNo: '400651012', orderDate: '2026/04/03', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '20', docSeqNo: '400651012020',
    purchaser: '陳俊宏', orderQty: 400, acceptQty: 50, comparePrice: '650', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '5501-CST0306-E01', customerBrand: 'G01', vendorMaterialNo: 'CS-M7100-12SPD',
    productName: '12速飛輪', specification: 'SHIMANO SLX CS-M7100 12-SPEED CASSETTE 10-51T',
    expectedDelivery: '2026/04/27', deliveryQty: 400,
    inTransitQty: 30, undeliveredQty: 320, lineItemNote: '260000', agreedDate: '2026/04/20',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-SL006', statisticalDeliveryDate: '2026/04/27', storageLocationCode: '2110',
  },
  {
    id: 46, status: 'CK', vendorDeliveryDate: '2026/04/28',
    orderNo: '400651013', orderDate: '2026/04/05', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '10', docSeqNo: '400651013010',
    purchaser: '張建國', orderQty: 250, acceptQty: 0, comparePrice: '1500', unit: 'SET', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '6601-RDR0307-F01', customerBrand: 'G01', vendorMaterialNo: 'RD-M7100-SGS',
    productName: '後變速器(SGS)', specification: 'SHIMANO SLX RD-M7100-SGS REAR DERAILLEUR 12-SPEED LONG CAGE',
    expectedDelivery: '2026/04/28', deliveryQty: 250,
    inTransitQty: 0, undeliveredQty: 250, lineItemNote: '375000', agreedDate: '2026/04/21',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-SL007', statisticalDeliveryDate: '2026/04/28', storageLocationCode: '2020',
  },
  {
    id: 47, status: 'CK', vendorDeliveryDate: '2026/04/28',
    orderNo: '400651013', orderDate: '2026/04/05', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '20', docSeqNo: '400651013020',
    purchaser: '張建國', orderQty: 180, acceptQty: 20, comparePrice: '950', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '7701-HUB0308-G01', customerBrand: 'G03', vendorMaterialNo: 'FH-M7110-B-12SPD',
    productName: '後花鼓(12速)', specification: 'SHIMANO SLX FH-M7110-B 12-SPEED REAR HUB BOOST 148X12MM',
    expectedDelivery: '2026/04/28', deliveryQty: 180,
    inTransitQty: 10, undeliveredQty: 150, lineItemNote: '171000', agreedDate: '2026/04/21',
    internalNote: '', materialPOContent: '',
    gbdOrderNo: 'GBD-2026-SL008', statisticalDeliveryDate: '2026/04/28', storageLocationCode: '2020',
  },
];




// ===== Main Component =====
// 單號序號 sticky 欄寬（與 HistoryOrderListWithTabs 對齊）
const DOC_NO_COL_WIDTH = 160;

export function AdvancedOrderTable({
  activeTab,
  data,
  onOrderConfirm,
  onMoreOptions,
  userEmail = 'default',
  userRole,
  onColumnsChange,
  columnsVersion,
  appliedFilters,
  selectedOrderIds,
  onToggleOrder,
  onSelectAll,
  onBatchAction,
  initialColumns,
  storageKeyPrefix = 'orderList_v2',
  forceShowCheckbox = false,
  batchActions,
  onDocNoClick,
}: AdvancedOrderTableProps) {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const showCheckbox = forceShowCheckbox || activeTab === 'NP' || activeTab === 'V' || activeTab === 'B';

  // 使用 initialColumns（若有傳入）作為基準；否則 fallback 到 defaultOrderColumns
  const baseColumns = initialColumns ?? defaultOrderColumns;

  const getStorageKey = (tab: string) => {
    const safeTab = tab.replace(/[^a-zA-Z0-9]/g, '_');
    return `${storageKeyPrefix}_${userEmail}_${safeTab}_columns`;
  };

  // ── 智慧合併：以 baseColumns 為基準，套用已儲存的寬度/可見性/順序設定 ──
  const loadColumnsFromStorage = (tab: string): OrderColumn[] => {
    const storageKey = getStorageKey(tab);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedColumns = JSON.parse(saved) as OrderColumn[];
        // 1. 按 saved 的順序排列，同時從 baseColumns 取得最新 label / minWidth
        const baseMap = new Map(baseColumns.map(c => [c.key, c]));
        const merged: OrderColumn[] = [];
        const usedKeys = new Set<OrderColumnKey>();
        for (const sc of savedColumns) {
          const base = baseMap.get(sc.key);
          if (base) {
            merged.push({ ...base, width: sc.width, visible: sc.visible });
            usedKeys.add(sc.key);
          }
        }
        // 2. 補上 baseColumns 中新增但 saved 裡還沒有的欄位（append 到尾端）
        for (const bc of baseColumns) {
          if (!usedKeys.has(bc.key)) {
            merged.push({ ...bc });
          }
        }
        return merged;
      }
    } catch (error) {
      console.error('Failed to load columns from storage:', error);
    }
    return baseColumns.map(col => ({ ...col }));
  };

  const saveColumnsToStorage = (tab: string, cols: OrderColumn[]) => {
    const storageKey = getStorageKey(tab);
    try {
      localStorage.setItem(storageKey, JSON.stringify(cols));
    } catch (error) {
      console.error('Failed to save columns to storage:', error);
    }
  };

  const [columns, setColumns] = useState<OrderColumn[]>(() => loadColumnsFromStorage(activeTab));
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: OrderColumnKey | null; direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null,
  });

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  useEffect(() => {
    setIsLoadingFromStorage(true);
    const loadedColumns = loadColumnsFromStorage(activeTab);
    setColumns(loadedColumns);
    setTimeout(() => setIsLoadingFromStorage(false), 0);
  }, [activeTab, userEmail]);

  useEffect(() => {
    if (columnsVersion !== undefined && columnsVersion > 0) {
      setIsLoadingFromStorage(true);
      const loadedColumns = loadColumnsFromStorage(activeTab);
      setColumns(loadedColumns);
      setTimeout(() => setIsLoadingFromStorage(false), 0);
    }
  }, [columnsVersion]);

  useEffect(() => {
    if (!isLoadingFromStorage) {
      saveColumnsToStorage(activeTab, columns);
    }
    if (onColumnsChange) {
      onColumnsChange(columns);
    }
  }, [columns, activeTab, userEmail]);

  const moveColumn = useCallback((dragKey: OrderColumnKey, hoverKey: OrderColumnKey) => {
    setColumns((prev) => {
      const dragIndex = prev.findIndex(col => col.key === dragKey);
      const hoverIndex = prev.findIndex(col => col.key === hoverKey);
      const newColumns = [...prev];
      const [removed] = newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, removed);
      return newColumns;
    });
  }, []);

  const updateColumnWidth = useCallback((key: OrderColumnKey, width: number) => {
    setColumns((prev) => {
      const newColumns = [...prev];
      const index = newColumns.findIndex(col => col.key === key);
      newColumns[index] = { ...newColumns[index], width };
      return newColumns;
    });
  }, []);


    const visibleColumns = columns.filter(col => col.visible !== false);

  // ── 取得篩選用的欄位值（包含計算欄位 dayDiff / prodSchedDayDiff）──
  // 注意：docSeqNo 顯示值為 orderNo+orderSeq 拼接，須與畫面一致
  const getRowFilterValue = (row: OrderRow, column: string): string => {
    if (column === 'dayDiff') {
      const diff = computeRowDayDiff(row);
      if (diff === null) return '-';
      return diff > 0 ? `+${diff}` : `${diff}`;
    }
    if (column === 'prodSchedDayDiff') {
      const diff = computeProdSchedDayDiff(row);
      if (diff === null) return '-';
      return diff > 0 ? `+${diff}` : `${diff}`;
    }
    if (column === 'docSeqNo') {
      return (row.orderNo || '') + (row.orderSeq || '');
    }
    const value = row[column as keyof OrderRow];
    return value !== undefined && value !== null ? String(value) : '';
  };

  // Tab filter
  const tabFilteredData = useMemo(() => {
    if (activeTab === 'ALL') return data;
    return data.filter(item => item.status === activeTab);
  }, [data, activeTab]);

  // Advanced filter（支援 dayDiff 計算欄位）
  const advancedFilteredData = useMemo(() => {
    if (!appliedFilters || appliedFilters.length === 0) return tabFilteredData;
    return tabFilteredData.filter(item => {
      return appliedFilters.every(filter => {
        const rawValue = getRowFilterValue(item, filter.column);
        const filterValue = filter.value;
        switch (filter.operator) {
          case 'contains':    return rawValue.toLowerCase().includes(filterValue.toLowerCase());
          case 'equals':      return rawValue.toLowerCase() === filterValue.toLowerCase();
          case 'notEquals':   return rawValue.toLowerCase() !== filterValue.toLowerCase();
          case 'startsWith':  return rawValue.toLowerCase().startsWith(filterValue.toLowerCase());
          case 'endsWith':    return rawValue.toLowerCase().endsWith(filterValue.toLowerCase());
          case 'isEmpty':     return !rawValue || rawValue.trim() === '' || rawValue === '-';
          case 'isNotEmpty':  return rawValue.trim() !== '' && rawValue !== '-';
          default:            return true;
        }
      });
    });
  }, [tabFilteredData, appliedFilters]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return advancedFilteredData;
    const sorted = [...advancedFilteredData].sort((a, b) => {
      const sortKey = sortConfig.key!;

      let aValue: string | number;
      let bValue: string | number;

      if (sortKey === 'dayDiff') {
        aValue = computeRowDayDiff(a) ?? -9999;
        bValue = computeRowDayDiff(b) ?? -9999;
        const comparison = (aValue as number) - (bValue as number);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (sortKey === 'prodSchedDayDiff') {
        aValue = computeProdSchedDayDiff(a) ?? -9999;
        bValue = computeProdSchedDayDiff(b) ?? -9999;
        const comparison = (aValue as number) - (bValue as number);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (sortKey === 'docSeqNo') {
        aValue = `${a.orderNo}${a.orderSeq}`;
        bValue = `${b.orderNo}${b.orderSeq}`;
      } else {
        aValue = a[sortKey as keyof OrderRow] as string | number ?? '';
        bValue = b[sortKey as keyof OrderRow] as string | number ?? '';
      }

      // 使用嚴格 null/undefined/'' 判斷，避免數字 0 被誤判為空值
      const aEmpty = aValue === null || aValue === undefined || aValue === '';
      const bEmpty = bValue === null || bValue === undefined || bValue === '';
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      const aStr = String(aValue);
      const bStr = String(bValue);
      const isDate = /^\d{4}\/\d{2}\/\d{2}$/.test(aStr) && /^\d{4}\/\d{2}\/\d{2}$/.test(bStr);
      const isNumber = !isDate && /^\d/.test(aStr) && /^\d/.test(bStr);
      const isChinese = /^[\u4e00-\u9fa5]/.test(aStr) && /^[\u4e00-\u9fa5]/.test(bStr);
      let comparison = 0;
      if (isDate) {
        comparison = new Date(aStr.replace(/\//g, '-')).getTime() - new Date(bStr.replace(/\//g, '-')).getTime();
      } else if (isNumber) {
        comparison = parseFloat(aStr.match(/^[\d.]+/)?.[0] || '0') - parseFloat(bStr.match(/^[\d.]+/)?.[0] || '0');
      } else if (isChinese) {
        comparison = aStr.localeCompare(bStr, 'zh-Hans-CN', { sensitivity: 'base' });
      } else {
        comparison = aStr.localeCompare(bStr, 'en', { sensitivity: 'base' });
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [advancedFilteredData, sortConfig]);

  // ── Reset page when data / filters / sort changes ─────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedData.length, sortConfig.key, sortConfig.direction]);

  // ── Paginated slice ───────────────────────────────────────────────────────
  const totalRows = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, totalRows);
  const paginatedData = sortedData.slice(pageStart, pageEnd);

  // Status badge style
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'NP': return { bg: 'bg-[rgba(255,86,48,0.12)]',   text: 'text-[#b71d18]', label: 'NP' };
      case 'V':  return { bg: 'bg-[rgba(0,184,217,0.12)]',   text: 'text-[#006c9c]', label: 'V'  };
      case 'B':  return { bg: 'bg-[rgba(142,51,255,0.12)]',  text: 'text-[#5119b7]', label: 'B'  };
      case 'CK': return { bg: 'bg-[rgba(34,197,94,0.12)]',   text: 'text-[#118d57]', label: 'CK' };
      case 'CL': return { bg: 'bg-[rgba(145,158,171,0.12)]', text: 'text-[#637381]', label: 'CL' };
      default:   return { bg: 'bg-[rgba(145,158,171,0.12)]', text: 'text-[#637381]', label: status };
    }
  };

  // Render cell value
  const getCellValue = (row: OrderRow, key: OrderColumnKey) => {
    // ── 訂單狀態 badge ──
    if (key === 'status') {
      const badge = getBadgeStyle(row.status);
      return (
        <div className={`${badge.bg} flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] rounded-[6px]`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] ${badge.text} text-[12px] text-center`}>
            {badge.label}
          </p>
        </div>
      );
    }

    // ── 項次（排程項次，計算自 scheduleLines）──
    if (key === 'schedLineIndex') {
      const lines = row.scheduleLines;
      let display: string;
      if (!lines || lines.length === 0) {
        display = '1'; // 未拆期：預設項次 1
      } else if (lines.length === 1) {
        display = String(lines[0].index);
      } else {
        display = lines.map(l => l.index).join('/'); // 已拆期：如 1/2/3
      }
      return (
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e]">
          {display}
        </p>
      );
    }

    // ── 差異天數（計算欄位）──
    if (key === 'dayDiff') {
      const diff = computeRowDayDiff(row);
      if (diff === null) {
        return <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#919eab]">-</p>;
      }
      const display = diff > 0 ? `+${diff}` : `${diff}`;
      const color = diff > 0 ? '#b71d18' : diff < 0 ? '#118d57' : '#919eab';
      return (
        <p
          className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px]"
          style={{ color }}
        >
          {display}
        </p>
      );
    }

    // ── 生管端交貨日期 ──
    if (key === 'productionScheduleDate') {
      const val = row.productionScheduleDate;
      if (!val) {
        return <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#919eab]">-</p>;
      }
      return (
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e]">
          {val}
        </p>
      );
    }

    // ── 差異天數(cfn2-1)：生管端交貨日期 − 廠商可交貨日期 ──
    if (key === 'prodSchedDayDiff') {
      const diff = computeProdSchedDayDiff(row);
      if (diff === null) {
        return <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#919eab]">-</p>;
      }
      const display = diff > 0 ? `+${diff}` : `${diff}`;
      const color = diff > 0 ? '#b71d18' : diff < 0 ? '#118d57' : '#919eab';
      return (
        <p
          className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px]"
          style={{ color }}
        >
          {display}
        </p>
      );
    }

    // ── 單號序號（自動計算 = orderNo + orderSeq）──
    if (key === 'docSeqNo') {
      const computed = (row.orderNo || '') + (row.orderSeq || '');
      const display = computed || '-';
      const isPlaceholder = display === '-';
      return (
        <p
          className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${isPlaceholder ? 'text-[#919eab]' : 'text-[#1c252e]'}`}
          title={display}
        >
          {display}
        </p>
      );
    }

    // ── 廠商可交貨日期（不接單時紅色橫線標示）──
    if (key === 'vendorDeliveryDate') {
      const val = row.vendorDeliveryDate;
      if (row.isRejectedOrder) {
        return (
          <p
            className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate"
            style={{ color: '#ff5630', textDecoration: 'line-through', textDecorationColor: '#ff5630' }}
            title="不接單"
          >
            {val || row.expectedDelivery || '-'}
          </p>
        );
      }
      if (!val || val.trim() === '') {
        return <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#919eab]">-</p>;
      }
      return (
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e]" title={val}>
          {val}
        </p>
      );
    }

    // ── 數值欄位 ──
    if (['orderQty', 'acceptQty', 'inTransitQty', 'deliveryQty', 'leadtime'].includes(key)) {
      const val = row[key as keyof OrderRow];
      const display = val !== undefined && val !== null ? String(val) : '-';
      return (
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] truncate" title={display}>
          {display}
        </p>
      );
    }
    // ── 未交量：永遠由公式計算，不用存儲欄位 ──
    if (key === 'undeliveredQty') {
      const computed = calcUndeliveredQty(
        row.orderQty ?? 0,
        row.acceptQty ?? 0,
        row.inTransitQty ?? 0,
      );
      return (
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] truncate" title={String(computed)}>
          {computed}
        </p>
      );
    }

    // ── 一般文字欄位 ──
    const value = row[key as keyof OrderRow];
    const displayValue = value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : '-';
    const isPlaceholder = displayValue === '-';
    return (
      <p
        className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${isPlaceholder ? 'text-[#919eab]' : 'text-[#1c252e]'}`}
        title={displayValue}
      >
        {displayValue}
      </p>
    );
  };

  // Width calculations
  const columnsWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
  // onDocNoClick 模式：加上左側 單號序號 欄；否則加上右側 action 欄
  const totalWidth = columnsWidth
    + (showCheckbox ? CHECKBOX_WIDTH : 0)
    + (onDocNoClick ? DOC_NO_COL_WIDTH : ACTION_WIDTH);
  const displayedOrders = paginatedData;
  const isAllSelected = displayedOrders.length > 0 && displayedOrders.every(order => selectedOrderIds.has(order.id));
  const hasSelected = selectedOrderIds.size > 0;

  // Sticky styles
  const stickyLeftStyle: React.CSSProperties = {
    position: 'sticky',
    left: 0,
    zIndex: 3,
    width: CHECKBOX_WIDTH,
    minWidth: CHECKBOX_WIDTH,
    boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)',
  };
  const stickyDocNoStyle: React.CSSProperties = {
    position: 'sticky',
    left: showCheckbox ? CHECKBOX_WIDTH : 0,
    zIndex: 2,
    width: DOC_NO_COL_WIDTH,
    minWidth: DOC_NO_COL_WIDTH,
    boxShadow: '2px 0 4px -2px rgba(145,158,171,0.18)',
  };
  const stickyRightStyle: React.CSSProperties = {
    position: 'sticky',
    right: 0,
    zIndex: 3,
    width: ACTION_WIDTH,
    minWidth: ACTION_WIDTH,
    boxShadow: '-2px 0 4px -2px rgba(145,158,171,0.16)',
  };


// ── 雙擊自動最適欄寬 ───────────────────────────────────────────────────────
  const autoFitWidth = (key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const labelText = typeof col.label === 'string' ? col.label : '';
    const headerW = measureTextWidth(labelText, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 32 + 16;
    let maxDataW = 0;
    try {
      (sortedData || []).forEach((row: any) => {
        const raw = String(row[key] ?? '');
        const w = measureTextWidth(raw, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
    } catch { /* data may not be available */ }
    const bestFit = Math.max(col.minWidth ?? 50, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full">

        {/* ── 選取狀態列（捲動區外，不會橫向位移，對齊 Figma TableOrderHead 格式） ── */}
        {hasSelected && showCheckbox && (
          <div
            className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)]"
            style={{ background: 'rgba(0,94,184,0.16)' }}
          >
            {/* checkbox-on icon + selected 計數 + 操作按鈕 緊排 */}
            <div
              data-is-checkbox="true"
              className="flex items-center justify-center shrink-0"
              style={{ width: CHECKBOX_WIDTH, minWidth: CHECKBOX_WIDTH }}
            >
              <button
                data-is-checkbox="true"
                onClick={() => onSelectAll()}
                className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 16.6667 16.6667" fill="none">
                  <path clipRule="evenodd" d={svgCheckboxOn.p2dde97c0} fill="#005EB8" fillRule="evenodd" />
                </svg>
              </button>
            </div>
            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] whitespace-nowrap mr-[4px]">
              {selectedOrderIds.size} selected
            </span>

            {/* 右側：自訂 batchActions 或預設「批次訂單確認」 */}
            {batchActions ?? (
              <span
                data-is-checkbox="true"
                onClick={() => onBatchAction?.('approve')}
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
              >批次訂單確認</span>
            )}
          </div>
        )}

        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>

            {/* ===== Table header ===== */}
              <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
                {showCheckbox && (
                  <div
                    className="h-[56px] bg-[#f4f6f8] flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)]"
                    style={stickyLeftStyle}
                  >
                    {/* 有選取時隱藏 header checkbox，避免與 selected 狀態列重複 */}
                    {!hasSelected && (
                      <CheckboxIcon checked={isAllSelected} onChange={() => onSelectAll()} />
                    )}
                  </div>
                )}
                {/* 單號序號 sticky 欄 header（onDocNoClick 模式） */}
                {onDocNoClick && (
                  <div
                    className="h-[56px] bg-[#f4f6f8] flex items-center px-[16px] shrink-0 border-r border-[rgba(145,158,171,0.08)] cursor-pointer select-none"
                    style={stickyDocNoStyle}
                    onClick={() => {
                      let direction: 'asc' | 'desc' | null = 'asc';
                      if (sortConfig.key === 'docSeqNo' && sortConfig.direction === 'asc') direction = 'desc';
                      setSortConfig({ key: 'docSeqNo', direction });
                    }}
                  >
                    <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap">
                      單號序號
                    </p>
                    {sortConfig.key === 'docSeqNo' && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[6px] shrink-0">
                        {sortConfig.direction === 'asc'
                          ? <path d="M8 3L12 7H4L8 3Z" fill="#637381" />
                          : <path d="M8 13L4 9H12L8 13Z" fill="#637381" />}
                      </svg>
                    )}
                  </div>
                )}
                {visibleColumns.map((column, index) => (
                  <DraggableColumnHeader
                    key={column.key}
                    column={column}
                    index={index}
                    moveColumn={moveColumn}
                    updateColumnWidth={updateColumnWidth}
                    autoFitWidth={autoFitWidth}
                    sortConfig={sortConfig}
                    onSort={(key) => {
                      let direction: 'asc' | 'desc' | null = 'asc';
                      if (sortConfig.key === key && sortConfig.direction === 'asc') {
                        direction = 'desc';
                      }
                      setSortConfig({ key, direction });
                    }}
                    isLast={index === visibleColumns.length - 1}
                    isFiltered={!!appliedFilters?.some(f => f.column === column.key)}
                    dragType="order-column"
                  />
                ))}
                <div className="flex-1 bg-[#f4f6f8] min-w-0" />
                {!onDocNoClick && (onOrderConfirm || onMoreOptions) && (
                  <div
                    className="h-[56px] bg-[#f4f6f8] flex items-center justify-center shrink-0"
                    style={stickyRightStyle}
                  />
                )}
              </div>

            {/* ===== Data rows ===== */}
            {paginatedData.map((row) => (
              <div
                key={row.id}
                className="flex border-b border-[rgba(145,158,171,0.08)] h-[72px] hover:bg-[rgba(145,158,171,0.04)] group"
              >
                {showCheckbox && (
                  <div
                    className="flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                    style={stickyLeftStyle}
                  >
                    <CheckboxIcon
                      checked={selectedOrderIds.has(row.id)}
                      onChange={() => onToggleOrder(row.id)}
                    />
                  </div>
                )}
                {/* 單號序號 藍字底線連結（onDocNoClick 模式）；刪單加上刪除線 */}
                {onDocNoClick && (
                  <div
                    className="flex items-center px-[16px] shrink-0 border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                    style={stickyDocNoStyle}
                  >
                    <button
                      onClick={() => onDocNoClick(row)}
                      className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] cursor-pointer truncate text-left"
                      style={row.deletionCode ? { textDecoration: 'line-through underline', textDecorationColor: '#1677ff' } : undefined}
                      title={row.deletionCode ? `${row.orderNo}${row.orderSeq}（刪單）` : `${row.orderNo}${row.orderSeq}`}
                    >
                      {row.orderNo}{row.orderSeq}
                    </button>
                  </div>
                )}
                {visibleColumns.map((column) => (
                  <div
                    key={`${row.id}-${column.key}`}
                    style={{ width: column.width }}
                    className="flex items-center justify-start px-[16px] border-r border-[rgba(145,158,171,0.08)] overflow-hidden shrink-0"
                  >
                    {getCellValue(row, column.key)}
                  </div>
                ))}
                <div className="flex-1 min-w-0" />
                {!onDocNoClick && (onOrderConfirm || onMoreOptions) && (
                  <div
                    className="flex items-center justify-center px-[10px] shrink-0 bg-white group-hover:bg-[#f6f7f8]"
                    style={stickyRightStyle}
                  >
                    {(((activeTab === 'NP' || activeTab === 'V') && (row.status === 'NP' || row.status === 'V')) ||
                      (activeTab === 'B' && row.status === 'B' && userRole === 'giant')) && onOrderConfirm ? (
                      <div
                        className="bg-[#ffc107] flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] cursor-pointer hover:bg-[#ffb300]"
                        onClick={() => onOrderConfirm?.(row)}
                      >
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[14px] text-white whitespace-nowrap">訂單確認</p>
                      </div>
                    ) : onMoreOptions ? (
                      <div
                        className="flex items-center justify-center cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-[8px] p-[8px]"
                        onClick={() => onMoreOptions?.(row)}
                      >
                        <MoreVertical size={20} className="text-[#637381]" />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}

            {/* Empty state */}
            {sortedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">
                  無符合條件的資料
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)] shrink-0">
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalRows}
            itemsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          />
        </div>
      </div>
    </DndProvider>
  );
}
