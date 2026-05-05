// ── 開立發票：資料型別 + 欄位定義 + Mock Data ──────────────────────────────────

// ── 資料列介面 ──
export interface InvoiceAcceptRow {
  id: number;
  vendorName: string;       // 廠商簡稱(編號)
  orderNo: string;          // 訂單號碼
  orderSeq: string;         // 訂單序號
  orderType: string;        // 訂單類型
  receiveDate: string;      // 收料日期
  acceptNo: string;         // 驗收單號
  acceptSeq: string;        // 驗收項次
  vendorShipNo: string;     // 廠商出貨單（= ShipmentRow.vendorShipmentNo）
  shipSeq: string;          // 出貨序號（= ShipmentDetailItem.itemNo）
  materialNo: string;       // 料號（= ShipmentDetailItem.materialNo）
  deliveryNo: string;       // 送貨單號（= ShipmentRow.sapDeliveryNo，已更名為出貨單號）
  orderQty: number;         // 訂貨量（原始訂單量）
  shipQty: number;          // 出貨量（= ShipmentDetailItem.shipQty）
  acceptQty: number;        // 驗收量
  returnQty: number;        // 驗退量
  claimDate: string;        // 可請款日
  specification: string;    // 規格
  outsourceNo: string;      // 委外加工編號
  bondedType: string;       // 保稅廠別
  companyCode: string;      // 公司代碼
  purchaseOrg: string;      // 採購組織
  purchaseGroup: string;    // 採購群組
  customerPO: string;       // 客戶PO號碼（將來串其他資料庫帶入，目前留白）
}

// ── 欄位定義 ──
export type InvColKey = keyof Omit<InvoiceAcceptRow, 'id'>;

export interface InvCol {
  key: InvColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

export const DEFAULT_COLS: InvCol[] = [
  { key: 'vendorName',    label: '廠商簡稱(編號)', width: 200, minWidth: 140 },
  { key: 'orderNo',       label: '訂單號碼',       width: 130, minWidth: 100 },
  { key: 'orderSeq',      label: '訂單序號',       width: 90,  minWidth: 70  },
  { key: 'orderType',     label: '訂單類型',       width: 100, minWidth: 80  },
  { key: 'receiveDate',   label: '收料日期',       width: 110, minWidth: 90  },
  { key: 'acceptNo',      label: '驗收單號',       width: 130, minWidth: 100 },
  { key: 'acceptSeq',     label: '驗收項次',       width: 90,  minWidth: 70  },
  { key: 'vendorShipNo',  label: '廠商出貨單',     width: 140, minWidth: 100 },
  { key: 'shipSeq',       label: '出貨序號',       width: 90,  minWidth: 70  },
  { key: 'materialNo',    label: '料號',           width: 170, minWidth: 120 },
  { key: 'deliveryNo',    label: '送貨單號',       width: 130, minWidth: 100 },
  { key: 'orderQty',      label: '訂貨量',         width: 90,  minWidth: 70  },
  { key: 'shipQty',       label: '出貨量',         width: 90,  minWidth: 70  },
  { key: 'acceptQty',     label: '驗收量',         width: 90,  minWidth: 70  },
  { key: 'returnQty',     label: '驗退量',         width: 90,  minWidth: 70  },
  { key: 'claimDate',     label: '可請款日',       width: 110, minWidth: 90  },
  { key: 'specification', label: '規格',           width: 240, minWidth: 140 },
  { key: 'outsourceNo',   label: '委外加工編號',   width: 130, minWidth: 100 },
  { key: 'bondedType',    label: '保稅廠別',       width: 100, minWidth: 80  },
  { key: 'companyCode',   label: '公司代碼',       width: 100, minWidth: 80  },
  { key: 'purchaseOrg',   label: '採購組織',       width: 100, minWidth: 80  },
  { key: 'purchaseGroup', label: '採購群組',       width: 100, minWidth: 80  },
  { key: 'customerPO',    label: '客戶PO號碼',     width: 130, minWidth: 100 },
];

// ── 搜尋用下拉選項 ──
export const BONDED_OPTIONS = [
  { value: '',       label: '全部' },
  { value: '保稅',   label: '保稅' },
  { value: '非保稅', label: '非保稅' },
];

export const PURCHASE_ORG_OPTIONS = [
  { value: '',                     label: '全部' },
  { value: '台灣廠生產採購組織',     label: '台灣廠生產採購組織' },
  { value: '台灣廠非生產採購組織',   label: '台灣廠非生產採購組織' },
  { value: '昆山廠生產採購組織',     label: '昆山廠生產採購組織' },
];

// ── Mock Data（已驗收資料，對應 ShipmentListPage MOCK_SHIPMENTS）──
// 來源對照：
//   vendorShipNo  ← ShipmentRow.vendorShipmentNo
//   shipSeq       ← ShipmentDetailItem.itemNo
//   deliveryNo    ← ShipmentRow.sapDeliveryNo（出貨單號）
//   shipQty       ← ShipmentDetailItem.shipQty
//   orderQty      ← 原始訂單量
//   customerPO    ← 留白（將來串其他資料庫）

export const invoiceMockData: InvoiceAcceptRow[] = [
  // ── Shipment #3 (91775297, 華銘, sap_sent) ──
  {
    id: 1, vendorName: '華銘(0001000641)', orderNo: '4500100003', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/22', acceptNo: 'ACC-2025-0301', acceptSeq: '01',
    vendorShipNo: '91775297', shipSeq: '10', materialNo: '5501-BRK0641-C01',
    deliveryNo: '1720580800', orderQty: 250, shipQty: 200, acceptQty: 198, returnQty: 2,
    claimDate: '2025/08/22', specification: 'SHIMANO BR-R9270 DURA-ACE CALIPER FRONT',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  {
    id: 2, vendorName: '華銘(0001000641)', orderNo: '4500100003', orderSeq: '20', orderType: 'Z2QB',
    receiveDate: '2025/07/22', acceptNo: 'ACC-2025-0302', acceptSeq: '01',
    vendorShipNo: '91775297', shipSeq: '20', materialNo: '6601-CHN0641-C02',
    deliveryNo: '1720580800', orderQty: 200, shipQty: 150, acceptQty: 150, returnQty: 0,
    claimDate: '2025/08/22', specification: 'SHIMANO CN-M9100 12-SPEED CHAIN',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  {
    id: 3, vendorName: '華銘(0001000641)', orderNo: '4500100004', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/22', acceptNo: 'ACC-2025-0303', acceptSeq: '01',
    vendorShipNo: '91775297', shipSeq: '30', materialNo: '7701-CST0641-C03',
    deliveryNo: '1720580800', orderQty: 100, shipQty: 80, acceptQty: 78, returnQty: 2,
    claimDate: '2025/08/22', specification: 'SHIMANO CS-R9200 12-SPEED 11-34T',
    outsourceNo: 'OS-2025-001', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  // ── Shipment #4 (SHP-2025-0045, 佳承精密, closed, receivedQty=400) ──
  {
    id: 4, vendorName: '佳承精密(0001000045)', orderNo: '4500200010', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/18', acceptNo: 'ACC-2025-0401', acceptSeq: '01',
    vendorShipNo: 'SHP-2025-0045', shipSeq: '10', materialNo: '8801-TIR0045-D01',
    deliveryNo: '1720580760', orderQty: 500, shipQty: 400, acceptQty: 400, returnQty: 0,
    claimDate: '2025/07/18', specification: 'GAVIA FONDO 1 700X28C TUBELESS READY',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠非生產採購組織',
    purchaseGroup: 'P20', customerPO: '',
  },
  // ── Shipment #6 (INV-20250610-001, 久廣精密, sap_sent) ──
  {
    id: 5, vendorName: '久廣精密(0001000053)', orderNo: '4500300020', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/14', acceptNo: 'ACC-2025-0601', acceptSeq: '01',
    vendorShipNo: 'INV-20250610-001', shipSeq: '10', materialNo: '2201-FRK0053-F01',
    deliveryNo: '1720580750', orderQty: 30, shipQty: 20, acceptQty: 20, returnQty: 0,
    claimDate: '2025/07/14', specification: 'PROPEL ADVANCED PRO FORK CARBON STEERER',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  {
    id: 6, vendorName: '久廣精密(0001000053)', orderNo: '4500300021', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/14', acceptNo: 'ACC-2025-0602', acceptSeq: '01',
    vendorShipNo: 'INV-20250610-001', shipSeq: '20', materialNo: '3301-DRL0053-F02',
    deliveryNo: '1720580750', orderQty: 50, shipQty: 35, acceptQty: 33, returnQty: 2,
    claimDate: '2025/07/14', specification: 'SHIMANO RD-R9250 Di2 12-SPEED',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  {
    id: 7, vendorName: '久廣精密(0001000053)', orderNo: '4500300022', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/14', acceptNo: 'ACC-2025-0603', acceptSeq: '01',
    vendorShipNo: 'INV-20250610-001', shipSeq: '30', materialNo: '4401-GRP0053-F03',
    deliveryNo: '1720580750', orderQty: 200, shipQty: 150, acceptQty: 148, returnQty: 2,
    claimDate: '2025/07/14', specification: 'STRATUS LITE GRIP 130MM BLACK',
    outsourceNo: 'OS-2025-002', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  {
    id: 8, vendorName: '久廣精密(0001000053)', orderNo: '4500300023', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/14', acceptNo: 'ACC-2025-0604', acceptSeq: '01',
    vendorShipNo: 'INV-20250610-001', shipSeq: '40', materialNo: '5501-PED0053-F04',
    deliveryNo: '1720580750', orderQty: 100, shipQty: 80, acceptQty: 80, returnQty: 0,
    claimDate: '2025/07/14', specification: 'LOOK KEO 2 MAX CARBON PEDAL',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  // ── Shipment #10 (91775300, 華銘, closed, receivedQty=120) ──
  {
    id: 9, vendorName: '華銘(0001000641)', orderNo: '4500700060', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/05/30', acceptNo: 'ACC-2025-1001', acceptSeq: '01',
    vendorShipNo: '91775300', shipSeq: '10', materialNo: '3301-STM0641-J01',
    deliveryNo: '1720580710', orderQty: 150, shipQty: 120, acceptQty: 120, returnQty: 0,
    claimDate: '2025/06/30', specification: 'CONTACT SL OD2 STEM 110MM -6DEG',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '',
  },
  // ── Shipment #11 (91775301, 華銘, sap_sent, partial received) ──
  {
    id: 10, vendorName: '華銘(0001000641)', orderNo: '4500800070', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/28', acceptNo: 'ACC-2025-1101', acceptSeq: '01',
    vendorShipNo: '91775301', shipSeq: '10', materialNo: '4401-WHL0641-K01',
    deliveryNo: '1720580820', orderQty: 250, shipQty: 200, acceptQty: 200, returnQty: 0,
    claimDate: '2025/07/28', specification: 'SLR 1 42 DISC WHEELSYSTEM FRONT 12X100',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '',
  },
  // ── Z3XD 訂單類型（對應 Shipment #1, #2, #7） ──
  {
    id: 11, vendorName: '華銘(0001000641)', orderNo: '4500100001', orderSeq: '10', orderType: 'Z3XD',
    receiveDate: '2025/06/26', acceptNo: 'ACC-2025-1201', acceptSeq: '01',
    vendorShipNo: '91775295', shipSeq: '10', materialNo: '2201-FRM0641-A01',
    deliveryNo: '1720580792', orderQty: 60, shipQty: 50, acceptQty: 48, returnQty: 2,
    claimDate: '2025/07/26', specification: 'TCR ADVANCED SL DISC FRAME M CARBON/RED',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  {
    id: 12, vendorName: '華銘(0001000641)', orderNo: '4500100001', orderSeq: '20', orderType: 'Z3XD',
    receiveDate: '2025/06/26', acceptNo: 'ACC-2025-1202', acceptSeq: '01',
    vendorShipNo: '91775295', shipSeq: '20', materialNo: '3301-WHL0641-A02',
    deliveryNo: '1720580792', orderQty: 40, shipQty: 30, acceptQty: 28, returnQty: 2,
    claimDate: '2025/07/26', specification: 'SLR 0 CARBON 65 DISC WHEELSYSTEM REAR',
    outsourceNo: 'OS-2025-003', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '',
  },
  {
    id: 13, vendorName: '金盛元工業(0001000059)', orderNo: '4500400030', orderSeq: '10', orderType: 'Z3XD',
    receiveDate: '2025/06/24', acceptNo: 'ACC-2025-1301', acceptSeq: '01',
    vendorShipNo: 'INV-20250620-002', shipSeq: '10', materialNo: '6601-CHN0059-G01',
    deliveryNo: '', orderQty: 600, shipQty: 500, acceptQty: 495, returnQty: 5,
    claimDate: '2025/07/24', specification: 'SHIMANO CN-M9100 12-SPEED CHAIN',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '',
  },
];
