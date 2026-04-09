import { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { CheckboxIcon } from './CheckboxIcon';
import { OrderDetail } from './OrderDetail';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { exportOrdersCsv, exportOrdersExcel } from './OrderCsvManager';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { PaginationControls } from './PaginationControls';
import type { OrderRow } from './AdvancedOrderTable';

// ── 欄位定義 ──────────────────────────────────────────────────────────────────
type HistColKey =
  | 'status' | 'orderDate' | 'orderType' | 'company' | 'purchaseOrg'
  | 'vendorName' | 'materialNo' | 'productName' | 'specification'
  | 'orderQty' | 'acceptQty' | 'unit' | 'comparePrice'
  | 'expectedDelivery' | 'vendorDeliveryDate'
  | 'inTransitQty' | 'undeliveredQty'
  | 'leadtime' | 'vendorCode' | 'customerBrand' | 'vendorMaterialNo'
  | 'lineItemNote' | 'gbdOrderNo' | 'statisticalDeliveryDate';

interface HistCol {
  key: HistColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

const DEFAULT_COLS: HistCol[] = [
  { key: 'status',                 label: '狀態',       width: 72,  minWidth: 64  },
  { key: 'orderDate',              label: '訂單日期',   width: 110, minWidth: 90  },
  { key: 'orderType',              label: '訂單類型',   width: 90,  minWidth: 70  },
  { key: 'company',                label: '公司',       width: 80,  minWidth: 60  },
  { key: 'purchaseOrg',            label: '採購組織',   width: 90,  minWidth: 70  },
  { key: 'vendorName',             label: '廠商',       width: 200, minWidth: 130 },
  { key: 'materialNo',             label: '料號',       width: 170, minWidth: 120 },
  { key: 'productName',            label: '品名',       width: 200, minWidth: 130 },
  { key: 'specification',          label: '規格',       width: 240, minWidth: 140 },
  { key: 'orderQty',               label: '訂單量',     width: 85,  minWidth: 65  },
  { key: 'acceptQty',              label: '驗收量',     width: 85,  minWidth: 65  },
  { key: 'unit',                   label: '單位',       width: 65,  minWidth: 50  },
  { key: 'comparePrice',           label: '比較價',     width: 100, minWidth: 80  },
  { key: 'expectedDelivery',       label: '預計交期',   width: 110, minWidth: 90  },
  { key: 'vendorDeliveryDate',     label: '廠商交期',   width: 110, minWidth: 90  },
  { key: 'inTransitQty',           label: '在途量',     width: 85,  minWidth: 65  },
  { key: 'undeliveredQty',         label: '未交量',     width: 85,  minWidth: 65  },
  { key: 'leadtime',               label: 'Lead Time',  width: 90,  minWidth: 70  },
  { key: 'vendorCode',             label: '廠商代碼',   width: 110, minWidth: 80  },
  { key: 'customerBrand',          label: '客戶品牌',   width: 100, minWidth: 80  },
  { key: 'vendorMaterialNo',       label: '廠商料號',   width: 150, minWidth: 100 },
  { key: 'gbdOrderNo',             label: 'GBD單號',    width: 150, minWidth: 100 },
  { key: 'statisticalDeliveryDate',label: '統計交期',   width: 110, minWidth: 90  },
  { key: 'lineItemNote',           label: '行項備註',   width: 200, minWidth: 120 },
];

const STORAGE_KEY_PREFIX = 'historyOrderList_v2_';

const ORDER_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'ZOR',  label: 'ZOR　一般採購訂單' },
  { value: 'ZNB',  label: 'ZNB　國內採購' },
  { value: 'Z1JB', label: 'Z1JB　退貨一般品' },
  { value: 'Z1JD', label: 'Z1JD　退貨瑕疵品' },
  { value: 'Z3TB', label: 'Z3TB　換貨一般品' },
  { value: 'Z3TD', label: 'Z3TD　換貨瑕疵品' },
];

// ── 假資料（所有欄位）────────────────────────────────────────────────────────
export const historyOrderMockData: OrderRow[] = [
  // ZOR
  {
    id: 9001, status: 'CL', orderNo: '400100201', orderSeq: '10',
    orderDate: '2022/11/05', orderType: 'ZOR', company: 'C001', purchaseOrg: '2000',
    vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '2201-FRM0046-H01', vendorMaterialNo: 'VN-FRM-046-H01',
    productName: '公路車架(一般採購)', specification: 'TCR ADVANCED SL DISC FRAME M CARBON/RED',
    orderQty: 120, acceptQty: 120, unit: 'EA', comparePrice: 'USD 1,200.00',
    expectedDelivery: '2023/01/10', vendorDeliveryDate: '2023/01/08',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2023/01/10', leadtime: 65,
    gbdOrderNo: 'GBD-HIS-2022-0201', docSeqNo: '40010020110',
    customerBrand: 'GIANT', lineItemNote: '',
  },
  {
    id: 9002, status: 'CL', orderNo: '400100202', orderSeq: '20',
    orderDate: '2022/09/20', orderType: 'ZOR', company: 'C001', purchaseOrg: '2000',
    vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '3301-WHL0045-H02', vendorMaterialNo: 'VN-WHL-045-H02',
    productName: '輪組前輪(一般採購)', specification: 'SLR 1 42 DISC WHEELSYSTEM FRONT 12X100',
    orderQty: 80, acceptQty: 80, unit: 'SET', comparePrice: 'USD 320.00',
    expectedDelivery: '2022/11/30', vendorDeliveryDate: '2022/11/28',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2022/11/30', leadtime: 70,
    gbdOrderNo: 'GBD-HIS-2022-0202', docSeqNo: '40010020220',
    customerBrand: 'GIANT', lineItemNote: '',
  },
  {
    id: 9003, status: 'CL', orderNo: '400100203', orderSeq: '30',
    orderDate: '2022/07/14', orderType: 'ZOR', company: 'C001', purchaseOrg: '2000',
    vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '4401-STM0053-H03', vendorMaterialNo: 'VN-STM-053-H03',
    productName: '鋁合金龍頭(一般採購)', specification: 'CONTACT SL OD2 STEM 110MM -6DEG',
    orderQty: 200, acceptQty: 200, unit: 'EA', comparePrice: 'USD 45.00',
    expectedDelivery: '2022/09/20', vendorDeliveryDate: '2022/09/18',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2022/09/20', leadtime: 68,
    gbdOrderNo: 'GBD-HIS-2022-0203', docSeqNo: '40010020330',
    customerBrand: 'GIANT', lineItemNote: '',
  },
  {
    id: 9004, status: 'CL', orderNo: '400100204', orderSeq: '40',
    orderDate: '2021/12/01', orderType: 'ZOR', company: 'C001', purchaseOrg: '2000',
    vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '5501-BRK0059-H04', vendorMaterialNo: 'VN-BRK-059-H04',
    productName: '碟煞卡鉗前(一般採購)', specification: 'SHIMANO BR-R9270 DURA-ACE CALIPER FRONT',
    orderQty: 300, acceptQty: 300, unit: 'EA', comparePrice: 'USD 88.00',
    expectedDelivery: '2022/02/10', vendorDeliveryDate: '2022/02/08',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2022/02/10', leadtime: 70,
    gbdOrderNo: 'GBD-HIS-2021-0204', docSeqNo: '40010020440',
    customerBrand: 'SRAM', lineItemNote: '',
  },
  // ZNB
  {
    id: 9005, status: 'CL', orderNo: '400200205', orderSeq: '10',
    orderDate: '2022/10/15', orderType: 'ZNB', company: 'C001', purchaseOrg: '2000',
    vendorCode: '00010012', vendorName: '台灣製造(00010012)',
    materialNo: '6601-CRK0012-H05', vendorMaterialNo: 'VN-CRK-012-H05',
    productName: '牙盤組(國內採購)', specification: 'SHIMANO FC-R9200 DURA-ACE 52/36T 170MM',
    orderQty: 150, acceptQty: 150, unit: 'SET', comparePrice: 'TWD 8,500',
    expectedDelivery: '2022/12/20', vendorDeliveryDate: '2022/12/18',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2022/12/20', leadtime: 65,
    gbdOrderNo: 'GBD-HIS-2022-0205', docSeqNo: '40020020510',
    customerBrand: 'SHIMANO', lineItemNote: '',
  },
  {
    id: 9006, status: 'CL', orderNo: '400200206', orderSeq: '20',
    orderDate: '2021/08/22', orderType: 'ZNB', company: 'C001', purchaseOrg: '2000',
    vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '7701-CST0046-H06', vendorMaterialNo: 'VN-CST-046-H06',
    productName: '飛輪(國內採購)', specification: 'SHIMANO CS-R9200 12-SPEED 11-34T',
    orderQty: 500, acceptQty: 500, unit: 'EA', comparePrice: 'TWD 3,200',
    expectedDelivery: '2021/10/30', vendorDeliveryDate: '2021/10/28',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2021/10/30', leadtime: 68,
    gbdOrderNo: 'GBD-HIS-2021-0206', docSeqNo: '40020020620',
    customerBrand: 'SHIMANO', lineItemNote: '',
  },
  {
    id: 9007, status: 'CL', orderNo: '400200207', orderSeq: '30',
    orderDate: '2020/06/10', orderType: 'ZNB', company: 'C001', purchaseOrg: '2000',
    vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '8801-TIR0045-H07', vendorMaterialNo: 'VN-TIR-045-H07',
    productName: '外胎(國內採購)', specification: 'GAVIA FONDO 1 700X28C TUBELESS READY',
    orderQty: 1000, acceptQty: 1000, unit: 'EA', comparePrice: 'TWD 1,800',
    expectedDelivery: '2020/08/15', vendorDeliveryDate: '2020/08/13',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2020/08/15', leadtime: 65,
    gbdOrderNo: 'GBD-HIS-2020-0207', docSeqNo: '40020020730',
    customerBrand: 'PIRELLI', lineItemNote: '',
  },
  // Z1JB
  {
    id: 9008, status: 'CL', orderNo: '500600208', orderSeq: '10',
    orderDate: '2022/05/18', orderType: 'Z1JB', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '9901-HDL0053-H08', vendorMaterialNo: 'VN-HDL-053-H08',
    productName: '鋁合金把手(退貨)', specification: 'CONTACT SLR OD2 HANDLEBAR 440MM 退貨',
    orderQty: 45, acceptQty: 45, unit: 'EA', comparePrice: 'USD 52.00',
    expectedDelivery: '2022/07/20', vendorDeliveryDate: '2022/07/18',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2022/07/20', leadtime: 62,
    gbdOrderNo: 'GBD-HIS-2022-0208', docSeqNo: '50060020810',
    customerBrand: 'GIANT', lineItemNote: '退貨 RMA#2022-088',
  },
  {
    id: 9009, status: 'CL', orderNo: '500600209', orderSeq: '20',
    orderDate: '2021/11/02', orderType: 'Z1JB', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '1129-SAD0059-H09', vendorMaterialNo: 'VN-SAD-059-H09',
    productName: '競賽坐墊(退貨)', specification: 'FLEET SLR SADDLE 155MM CARBON RAIL 退貨',
    orderQty: 60, acceptQty: 60, unit: 'EA', comparePrice: 'USD 210.00',
    expectedDelivery: '2022/01/08', vendorDeliveryDate: '2022/01/06',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2022/01/08', leadtime: 67,
    gbdOrderNo: 'GBD-HIS-2021-0209', docSeqNo: '50060020920',
    customerBrand: 'FIZIK', lineItemNote: '退貨 RMA#2021-209',
  },
  {
    id: 9010, status: 'CL', orderNo: '500600210', orderSeq: '30',
    orderDate: '2020/03/25', orderType: 'Z1JB', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010012', vendorName: '台灣製造(00010012)',
    materialNo: '2201-PED0012-H10', vendorMaterialNo: 'VN-PED-012-H10',
    productName: '競速踏板(退貨)', specification: 'LOOK KEO 2 MAX PEDAL 退貨',
    orderQty: 200, acceptQty: 200, unit: 'PR', comparePrice: 'EUR 75.00',
    expectedDelivery: '2020/05/30', vendorDeliveryDate: '2020/05/28',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2020/05/30', leadtime: 65,
    gbdOrderNo: 'GBD-HIS-2020-0210', docSeqNo: '50060021030',
    customerBrand: 'LOOK', lineItemNote: '退貨 RMA#2020-310',
  },
  // Z1JD
  {
    id: 9011, status: 'CL', orderNo: '500600211', orderSeq: '10',
    orderDate: '2022/08/11', orderType: 'Z1JD', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '3301-FRK0046-H11', vendorMaterialNo: 'VN-FRK-046-H11',
    productName: '碳纖維前叉(瑕疵退)', specification: 'PROPEL ADVANCED PRO FORK CARBON STEERER 瑕疵品退貨',
    orderQty: 30, acceptQty: 30, unit: 'EA', comparePrice: 'USD 350.00',
    expectedDelivery: '2022/10/15', vendorDeliveryDate: '2022/10/13',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2022/10/15', leadtime: 64,
    gbdOrderNo: 'GBD-HIS-2022-0211', docSeqNo: '50060021110',
    customerBrand: 'GIANT', lineItemNote: '瑕疵退 DFT#2022-411',
  },
  {
    id: 9012, status: 'CL', orderNo: '500600212', orderSeq: '20',
    orderDate: '2021/04/16', orderType: 'Z1JD', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '4401-DRL0045-H12', vendorMaterialNo: 'VN-DRL-045-H12',
    productName: '後變速器Di2(瑕疵退)', specification: 'SHIMANO RD-R9250 Di2 12-SPEED 瑕疵品退貨',
    orderQty: 80, acceptQty: 80, unit: 'EA', comparePrice: 'USD 420.00',
    expectedDelivery: '2021/06/20', vendorDeliveryDate: '2021/06/18',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2021/06/20', leadtime: 65,
    gbdOrderNo: 'GBD-HIS-2021-0212', docSeqNo: '50060021220',
    customerBrand: 'SHIMANO', lineItemNote: '瑕疵退 DFT#2021-212',
  },
  // Z3TB
  {
    id: 9013, status: 'CL', orderNo: '500700213', orderSeq: '10',
    orderDate: '2022/06/28', orderType: 'Z3TB', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '5501-WHL0053-H13', vendorMaterialNo: 'VN-WHL-053-H13',
    productName: '碳纖維輪組後輪(換貨)', specification: 'SLR 0 CARBON 65 WHEELSYSTEM REAR 12X142 換貨',
    orderQty: 20, acceptQty: 20, unit: 'EA', comparePrice: 'USD 680.00',
    expectedDelivery: '2022/09/05', vendorDeliveryDate: '2022/09/03',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2022/09/05', leadtime: 69,
    gbdOrderNo: 'GBD-HIS-2022-0213', docSeqNo: '50070021310',
    customerBrand: 'GIANT', lineItemNote: '換貨 EXC#2022-513',
  },
  {
    id: 9014, status: 'CL', orderNo: '500700214', orderSeq: '20',
    orderDate: '2021/09/03', orderType: 'Z3TB', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '6601-CHN0059-H14', vendorMaterialNo: 'VN-CHN-059-H14',
    productName: '12速鏈條(換貨)', specification: 'SHIMANO CN-M9100 12-SPEED CHAIN 換貨',
    orderQty: 500, acceptQty: 500, unit: 'EA', comparePrice: 'USD 48.00',
    expectedDelivery: '2021/11/10', vendorDeliveryDate: '2021/11/08',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2021/11/10', leadtime: 68,
    gbdOrderNo: 'GBD-HIS-2021-0214', docSeqNo: '50070021420',
    customerBrand: 'SHIMANO', lineItemNote: '換貨 EXC#2021-314',
  },
  {
    id: 9015, status: 'CL', orderNo: '500700215', orderSeq: '30',
    orderDate: '2020/01/20', orderType: 'Z3TB', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010012', vendorName: '台灣製造(00010012)',
    materialNo: '7701-HDL0012-H15', vendorMaterialNo: 'VN-HDL-012-H15',
    productName: '鋁合金把手(換貨)', specification: 'CONTACT SLR OD2 HANDLEBAR 400MM 換貨',
    orderQty: 100, acceptQty: 100, unit: 'EA', comparePrice: 'TWD 1,450',
    expectedDelivery: '2020/03/25', vendorDeliveryDate: '2020/03/23',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2020/03/25', leadtime: 65,
    gbdOrderNo: 'GBD-HIS-2020-0215', docSeqNo: '50070021530',
    customerBrand: 'GIANT', lineItemNote: '換貨 EXC#2020-215',
  },
  // Z3TD
  {
    id: 9016, status: 'CL', orderNo: '500700216', orderSeq: '10',
    orderDate: '2022/12/08', orderType: 'Z3TD', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '8801-FRM0046-H16', vendorMaterialNo: 'VN-FRM-046-H16',
    productName: '公路車架(瑕疵換)', specification: 'TCR ADVANCED SL FRAME S CARBON/BLACK 瑕疵品換貨',
    orderQty: 8, acceptQty: 8, unit: 'EA', comparePrice: 'USD 1,200.00',
    expectedDelivery: '2023/02/15', vendorDeliveryDate: '2023/02/13',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2023/02/15', leadtime: 69,
    gbdOrderNo: 'GBD-HIS-2022-0216', docSeqNo: '50070021610',
    customerBrand: 'GIANT', lineItemNote: '瑕疵換 DEX#2022-816',
  },
  {
    id: 9017, status: 'CL', orderNo: '500700217', orderSeq: '20',
    orderDate: '2021/07/19', orderType: 'Z3TD', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '9901-BRK0045-H17', vendorMaterialNo: 'VN-BRK-045-H17',
    productName: '山地煞車組(瑕疵換)', specification: 'SHIMANO BR-M9120 SAINT CALIPER SET 瑕疵品換貨',
    orderQty: 40, acceptQty: 40, unit: 'SET', comparePrice: 'USD 195.00',
    expectedDelivery: '2021/09/25', vendorDeliveryDate: '2021/09/23',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2021/09/25', leadtime: 67,
    gbdOrderNo: 'GBD-HIS-2021-0217', docSeqNo: '50070021720',
    customerBrand: 'SHIMANO', lineItemNote: '瑕疵換 DEX#2021-517',
  },
  {
    id: 9018, status: 'CL', orderNo: '500700218', orderSeq: '30',
    orderDate: '2019/11/14', orderType: 'Z3TD', company: 'C001', purchaseOrg: '2100',
    vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '1129-GRP0053-H18', vendorMaterialNo: 'VN-GRP-053-H18',
    productName: '握把套(瑕疵換)', specification: 'STRATUS LITE GRIP 130MM BLACK 瑕疵品換貨',
    orderQty: 300, acceptQty: 300, unit: 'EA', comparePrice: 'TWD 280',
    expectedDelivery: '2020/01/20', vendorDeliveryDate: '2020/01/18',
    inTransitQty: 0, undeliveredQty: 0,
    statisticalDeliveryDate: '2020/01/20', leadtime: 67,
    gbdOrderNo: 'GBD-HIS-2019-0218', docSeqNo: '50070021830',
    customerBrand: 'GIANT', lineItemNote: '瑕疵換 DEX#2019-1118',
  },
];

// ── 欄位拖拽表頭 ──────────────────────────────────────────────────────────────
const DRAG_TYPE = 'hist-col';

function DraggableColHeader({
  col, index, moveCol, updateWidth, sortConfig, onSort, isLast,
}: {
  col: HistCol; index: number;
  moveCol: (drag: HistColKey, hover: HistColKey) => void;
  updateWidth: (key: HistColKey, w: number) => void;
  sortConfig: { key: HistColKey | null; dir: 'asc' | 'desc' | null };
  onSort: (key: HistColKey) => void;
  isLast?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: () => ({ key: col.key, index }),
    collect: m => ({ isDragging: m.isDragging() }),
  });
  const [, drop] = useDrop({
    accept: DRAG_TYPE,
    hover: (item: { key: HistColKey; index: number }) => {
      if (item.index !== index) { moveCol(item.key, col.key); item.index = index; }
    },
  });
  const isSorted = sortConfig.key === col.key;
  return (
    <Resizable
      size={{ width: col.width, height: 56 }}
      minWidth={col.minWidth} maxWidth={900}
      enable={{ right: true }}
      onResizeStop={(_e, _d, _r, delta) => updateWidth(col.key, col.width + delta.width)}
      handleStyles={{ right: { width: '4px', right: 0, cursor: 'col-resize', background: 'transparent', zIndex: 1 } }}
      handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
      className={`bg-[#f4f6f8] ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
    >
      <div
        ref={node => drag(drop(node)) as any}
        className={`h-full flex items-center px-[16px] cursor-pointer select-none ${isDragging ? 'opacity-50' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSort(col.key)}
      >
        {hovered && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-[6px] shrink-0">
            <circle cx="5" cy="3" r="1.5" fill="#919EAB" /><circle cx="11" cy="3" r="1.5" fill="#919EAB" />
            <circle cx="5" cy="8" r="1.5" fill="#919EAB" /><circle cx="11" cy="8" r="1.5" fill="#919EAB" />
            <circle cx="5" cy="13" r="1.5" fill="#919EAB" /><circle cx="11" cy="13" r="1.5" fill="#919EAB" />
          </svg>
        )}
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap truncate">
          {col.label}
        </p>
        {isSorted && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[6px] shrink-0">
            {sortConfig.dir === 'asc'
              ? <path d="M8 3L12 7H4L8 3Z" fill="#637381" />
              : <path d="M8 13L4 9H12L8 13Z" fill="#637381" />}
          </svg>
        )}
      </div>
    </Resizable>
  );
}

// ── Cell 渲染 ─────────────────────────────────────────────────────────────────
function getCellValue(row: OrderRow, key: HistColKey): React.ReactNode {
  if (key === 'status') {
    return (
      <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold bg-[rgba(145,158,171,0.12)] text-[#637381]">
        CL
      </span>
    );
  }
  const v = row[key as keyof OrderRow];
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

// ── 主元件 ────────────────────────────────────────────────────────────────────
const CHECKBOX_W = 88;
const DOC_NO_W = 160;

export function HistoryOrderListWithTabs() {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [detailRows, setDetailRows] = useState<OrderRow[]>([]);
  const [detailIndex, setDetailIndex] = useState(0);

  const [currentUserEmail] = useState<string>(() => localStorage.getItem('currentUserEmail') || 'default');
  const storageKey = `${STORAGE_KEY_PREFIX}${currentUserEmail}`;

  const loadCols = (): HistCol[] => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as HistCol[];
        const validKeys = new Set(DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as HistColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns] = useState<HistCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<HistCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: HistColKey | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 搜尋
  const [docSeqNoSearch, setDocSeqNoSearch] = useState('');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [orderNoSearch, setOrderNoSearch] = useState('');
  const [orderTypeSearch, setOrderTypeSearch] = useState('');

  useEffect(() => {
    if (!showColumnSelector) return;
    try { localStorage.setItem(storageKey, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  const moveCol = useCallback((drag: HistColKey, hover: HistColKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, []);

  const updateWidth = useCallback((key: HistColKey, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  const visibleColumns = columns.filter(c => c.visible !== false);

  const splitKeywords = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchesAny = (v: string, kws: string[]) => kws.some(kw => v.toLowerCase().includes(kw));

  const filteredData = useMemo(() => {
    let data = historyOrderMockData;
    if (docSeqNoSearch.trim()) {
      const kws = splitKeywords(docSeqNoSearch);
      data = data.filter(o => matchesAny((o.orderNo || '') + (o.orderSeq || ''), kws));
    }
    if (orderNoSearch.trim()) {
      const kws = splitKeywords(orderNoSearch);
      data = data.filter(o => matchesAny(o.orderNo || '', kws));
    }
    if (orderDateFrom.trim()) data = data.filter(o => o.orderDate >= orderDateFrom.replace(/-/g, '/'));
    if (orderDateTo.trim()) data = data.filter(o => o.orderDate <= orderDateTo.replace(/-/g, '/'));
    if (orderTypeSearch.trim()) data = data.filter(o => o.orderType?.toLowerCase().includes(orderTypeSearch.toLowerCase()));
    if (appliedFilters.length > 0) {
      data = data.filter(row => appliedFilters.every(f => {
        const val = String(row[f.column as keyof OrderRow] ?? '').toLowerCase();
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
  }, [docSeqNoSearch, orderNoSearch, orderDateFrom, orderDateTo, orderTypeSearch, appliedFilters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String(a[sortConfig.key as keyof OrderRow] ?? '');
      const bv = String(b[sortConfig.key as keyof OrderRow] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

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

  const handleView = () => {
    const rows = paginatedData.filter(r => selectedIds.has(r.id));
    if (rows.length > 0) { setDetailRows(rows); setDetailIndex(0); setShowOrderDetail(true); }
  };

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const totalWidth = CHECKBOX_W + DOC_NO_W + visibleColumns.reduce((s, c) => s + c.width, 0);

  const availableColsForFilter = columns.map(c => ({ key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible }));

  // OrderDetail 頁
  if (showOrderDetail && detailRows.length > 0) {
    const order = detailRows[detailIndex];
    return (
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
        <OrderDetail
          onClose={() => { setShowOrderDetail(false); setDetailRows([]); setSelectedIds(new Set()); }}
          orderData={{
            orderNo: order.orderNo, orderSeq: order.orderSeq,
            vendor: order.vendorName, status: order.status,
            orderQty: order.orderQty, acceptQty: order.acceptQty,
            comparePrice: order.comparePrice, unit: order.unit,
          }}
          isReadOnly={true}
        />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列 ── */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap pl-[20px] pr-[20px] pt-[20px] pb-[16px]">
        <SearchField label="單號序號" value={docSeqNoSearch} onChange={setDocSeqNoSearch} />
        <SearchField label="訂單日期(起)" value={orderDateFrom} onChange={setOrderDateFrom} type="date" />
        <SearchField label="訂單日期(迄)" value={orderDateTo} onChange={setOrderDateTo} type="date" />
        <div className="flex-1 min-w-[180px]">
          <DropdownSelect
            label="訂單類型" value={orderTypeSearch} onChange={setOrderTypeSearch}
            options={ORDER_TYPE_OPTIONS} placeholder="全部" searchable={true}
          />
        </div>
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
              try { localStorage.setItem(storageKey, JSON.stringify(tempColumns)); } catch { /* */ }
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
        onExportExcel={() => { exportOrdersExcel(filteredData, `歷史訂單_${new Date().toISOString().slice(0,10)}.xlsx`, columns as any); showToast(`已匯出 ${filteredData.length} 筆 (Excel)`); }}
        onExportCsv={() => { exportOrdersCsv(filteredData, `歷史訂單_${new Date().toISOString().slice(0,10)}.csv`, columns as any); showToast(`已匯出 ${filteredData.length} 筆 (CSV)`); }}
        actionButton={<div />}
      />

      {/* ── 選取工具列 ── */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">
          <div data-is-checkbox="true" className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W }}>
            <button data-is-checkbox="true" onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
              <CheckboxIcon checked={isAllSelected} onChange={handleSelectAll} />
            </button>
          </div>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] whitespace-nowrap mr-[4px]">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleView}
            className="flex items-center justify-center px-[12px] py-[16px] hover:opacity-70 transition-opacity shrink-0"
          >
            <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#004680] text-[14px] text-center whitespace-nowrap">檢視</span>
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

            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {/* Checkbox */}
              <div
                data-is-checkbox="true"
                className="flex items-center justify-center shrink-0 bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)]"
                style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, height: 56, position: 'sticky', left: 0, zIndex: 20, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
              >
                <CheckboxIcon checked={isAllSelected} onChange={handleSelectAll} />
              </div>
              {/* 單號序號 sticky 欄 */}
              <div
                className="flex items-center px-[16px] bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)] shrink-0 cursor-pointer select-none"
                style={{ width: DOC_NO_W, minWidth: DOC_NO_W, height: 56, position: 'sticky', left: CHECKBOX_W, zIndex: 19, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.18)' }}
                onClick={() => setSortConfig(s => ({ key: 'status' as HistColKey, dir: s.key === 'status' && s.dir === 'asc' ? 'desc' : 'asc' }))}
              >
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap">
                  單號序號
                </p>
              </div>
              {/* 一般欄 */}
              {visibleColumns.map((col, idx) => (
                <DraggableColHeader
                  key={col.key} col={col} index={idx}
                  moveCol={moveCol} updateWidth={updateWidth}
                  sortConfig={sortConfig}
                  onSort={(key) => setSortConfig(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}
                  isLast={idx === visibleColumns.length - 1}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
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
                {/* 單號序號 藍字連結 sticky */}
                <div
                  className="flex items-center px-[16px] border-r border-[rgba(145,158,171,0.08)] shrink-0 bg-white group-hover:bg-[#f6f7f8]"
                  style={{ width: DOC_NO_W, minWidth: DOC_NO_W, position: 'sticky', left: CHECKBOX_W, zIndex: 3, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.18)' }}
                >
                  <button
                    onClick={() => { setDetailRows([row]); setDetailIndex(0); setShowOrderDetail(true); }}
                    className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] cursor-pointer truncate text-left"
                    title={`${row.orderNo}${row.orderSeq}`}
                  >
                    {row.orderNo}{row.orderSeq}
                  </button>
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
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的歷史訂單</p>
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

      {/* Toast */}
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