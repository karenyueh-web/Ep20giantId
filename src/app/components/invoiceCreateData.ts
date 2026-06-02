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
  acceptPrice: number;      // 驗收價（暫用假資料，待串 SAP）
  returnQty: number;        // 驗退量
  claimDate: string;        // 可請款日
  specification: string;    // 規格
  outsourceNo: string;      // 委外加工編號
  bondedType: string;       // 保稅廠別
  companyCode: string;      // 公司代碼
  purchaseOrg: string;      // 採購組織
  purchaseGroup: string;    // 採購群組
  customerPO: string;       // 客戶PO號碼（將來串其他資料庫帶入，目前留白）
  plantCode: string;        // 工廠代碼
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
  { key: 'plantCode',     label: '工廠代碼',       width: 100, minWidth: 80  },
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
    deliveryNo: '1720580800', orderQty: 250, shipQty: 200, acceptQty: 198, acceptPrice: 1250, returnQty: 2,
    claimDate: '2025/08/22', specification: 'SHIMANO BR-R9270 DURA-ACE CALIPER FRONT',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP1',
  },
  {
    id: 2, vendorName: '華銘(0001000641)', orderNo: '4500100003', orderSeq: '20', orderType: 'Z2QB',
    receiveDate: '2025/07/22', acceptNo: 'ACC-2025-0302', acceptSeq: '01',
    vendorShipNo: '91775297', shipSeq: '20', materialNo: '6601-CHN0641-C02',
    deliveryNo: '1720580800', orderQty: 200, shipQty: 150, acceptQty: 150, acceptPrice: 320, returnQty: 0,
    claimDate: '2025/08/22', specification: 'SHIMANO CN-M9100 12-SPEED CHAIN',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP2',
  },
  {
    id: 3, vendorName: '華銘(0001000641)', orderNo: '4500100004', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/22', acceptNo: 'ACC-2025-0303', acceptSeq: '01',
    vendorShipNo: '91775297', shipSeq: '30', materialNo: '7701-CST0641-C03',
    deliveryNo: '1720580800', orderQty: 100, shipQty: 80, acceptQty: 78, acceptPrice: 870, returnQty: 2,
    claimDate: '2025/08/22', specification: 'SHIMANO CS-R9200 12-SPEED 11-34T',
    outsourceNo: 'OS-2025-001', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTC1',
  },
  // ── Shipment #4 (SHP-2025-0045, 佳承精密, closed, receivedQty=400) ──
  {
    id: 4, vendorName: '佳承精密(0001000045)', orderNo: '4500200010', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/18', acceptNo: 'ACC-2025-0401', acceptSeq: '01',
    vendorShipNo: 'SHP-2025-0045', shipSeq: '10', materialNo: '8801-TIR0045-D01',
    deliveryNo: '1720580760', orderQty: 500, shipQty: 400, acceptQty: 400, acceptPrice: 450, returnQty: 0,
    claimDate: '2025/07/18', specification: 'GAVIA FONDO 1 700X28C TUBELESS READY',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠非生產採購組織',
    purchaseGroup: 'P20', customerPO: '', plantCode: 'DTE1',
  },
  // ── Shipment #6 (INV-20250610-001, 久廣精密, sap_sent) ──
  {
    id: 5, vendorName: '久廣精密(0001000053)', orderNo: '4500300020', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/14', acceptNo: 'ACC-2025-0601', acceptSeq: '01',
    vendorShipNo: 'INV-20250610-001', shipSeq: '10', materialNo: '2201-FRK0053-F01',
    deliveryNo: '1720580750', orderQty: 30, shipQty: 20, acceptQty: 20, acceptPrice: 2800, returnQty: 0,
    claimDate: '2025/07/14', specification: 'PROPEL ADVANCED PRO FORK CARBON STEERER',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTG1',
  },
  {
    id: 6, vendorName: '久廣精密(0001000053)', orderNo: '4500300021', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/14', acceptNo: 'ACC-2025-0602', acceptSeq: '01',
    vendorShipNo: 'INV-20250610-001', shipSeq: '20', materialNo: '3301-DRL0053-F02',
    deliveryNo: '1720580750', orderQty: 50, shipQty: 35, acceptQty: 33, acceptPrice: 1680, returnQty: 2,
    claimDate: '2025/07/14', specification: 'SHIMANO RD-R9250 Di2 12-SPEED',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTI1',
  },
  {
    id: 7, vendorName: '久廣精密(0001000053)', orderNo: '4500300022', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/14', acceptNo: 'ACC-2025-0603', acceptSeq: '01',
    vendorShipNo: 'INV-20250610-001', shipSeq: '30', materialNo: '4401-GRP0053-F03',
    deliveryNo: '1720580750', orderQty: 200, shipQty: 150, acceptQty: 148, acceptPrice: 95, returnQty: 2,
    claimDate: '2025/07/14', specification: 'STRATUS LITE GRIP 130MM BLACK',
    outsourceNo: 'OS-2025-002', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'GTM1',
  },
  {
    id: 8, vendorName: '久廣精密(0001000053)', orderNo: '4500300023', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/14', acceptNo: 'ACC-2025-0604', acceptSeq: '01',
    vendorShipNo: 'INV-20250610-001', shipSeq: '40', materialNo: '5501-PED0053-F04',
    deliveryNo: '1720580750', orderQty: 100, shipQty: 80, acceptQty: 80, acceptPrice: 3200, returnQty: 0,
    claimDate: '2025/07/14', specification: 'LOOK KEO 2 MAX CARBON PEDAL',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'GVM1',
  },
  // ── Shipment #10 (91775300, 華銘, closed, receivedQty=120) ──
  {
    id: 9, vendorName: '華銘(0001000641)', orderNo: '4500700060', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/05/30', acceptNo: 'ACC-2025-1001', acceptSeq: '01',
    vendorShipNo: '91775300', shipSeq: '10', materialNo: '3301-STM0641-J01',
    deliveryNo: '1720580710', orderQty: 150, shipQty: 120, acceptQty: 120, acceptPrice: 560, returnQty: 0,
    claimDate: '2025/06/30', specification: 'CONTACT SL OD2 STEM 110MM -6DEG',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '', plantCode: 'AIP1',
  },
  // ── Shipment #11 (91775301, 華銘, sap_sent, partial received) ──
  {
    id: 10, vendorName: '華銘(0001000641)', orderNo: '4500800070', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/06/28', acceptNo: 'ACC-2025-1101', acceptSeq: '01',
    vendorShipNo: '91775301', shipSeq: '10', materialNo: '4401-WHL0641-K01',
    deliveryNo: '1720580820', orderQty: 250, shipQty: 200, acceptQty: 200, acceptPrice: 4500, returnQty: 0,
    claimDate: '2025/07/28', specification: 'SLR 1 42 DISC WHEELSYSTEM FRONT 12X100',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '', plantCode: 'AIP2',
  },
  // ── Z3XD 訂單類型（對應 Shipment #1, #2, #7） ──
  {
    id: 11, vendorName: '華銘(0001000641)', orderNo: '4500100001', orderSeq: '10', orderType: 'Z3XD',
    receiveDate: '2025/06/26', acceptNo: 'ACC-2025-1201', acceptSeq: '01',
    vendorShipNo: '91775295', shipSeq: '10', materialNo: '2201-FRM0641-A01',
    deliveryNo: '1720580792', orderQty: 60, shipQty: 50, acceptQty: 48, acceptPrice: 15800, returnQty: 2,
    claimDate: '2025/07/26', specification: 'TCR ADVANCED SL DISC FRAME M CARBON/RED',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTC1',
  },
  {
    id: 12, vendorName: '華銘(0001000641)', orderNo: '4500100001', orderSeq: '20', orderType: 'Z3XD',
    receiveDate: '2025/06/26', acceptNo: 'ACC-2025-1202', acceptSeq: '01',
    vendorShipNo: '91775295', shipSeq: '20', materialNo: '3301-WHL0641-A02',
    deliveryNo: '1720580792', orderQty: 40, shipQty: 30, acceptQty: 28, acceptPrice: 6800, returnQty: 2,
    claimDate: '2025/07/26', specification: 'SLR 0 CARBON 65 DISC WHEELSYSTEM REAR',
    outsourceNo: 'OS-2025-003', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTE1',
  },
  {
    id: 13, vendorName: '金盛元工業(0001000059)', orderNo: '4500400030', orderSeq: '10', orderType: 'Z3XD',
    receiveDate: '2025/06/24', acceptNo: 'ACC-2025-1301', acceptSeq: '01',
    vendorShipNo: 'INV-20250620-002', shipSeq: '10', materialNo: '6601-CHN0059-G01',
    deliveryNo: '', orderQty: 600, shipQty: 500, acceptQty: 495, acceptPrice: 320, returnQty: 5,
    claimDate: '2025/07/24', specification: 'SHIMANO CN-M9100 12-SPEED CHAIN',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '', plantCode: 'GTM1',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── 保稅（bondedType='保稅'）── 各廠商均有資料，供測試「新增發票明細」篩選
  // ══════════════════════════════════════════════════════════════════════════

  // ── 華銘 保稅 ×5 ──
  {
    id: 101, vendorName: '華銘(0001000641)', orderNo: '4500100050', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/05', acceptNo: 'ACC-2025-B101', acceptSeq: '01',
    vendorShipNo: '91775310', shipSeq: '10', materialNo: '5501-BRK0641-B01',
    deliveryNo: '1720580850', orderQty: 300, shipQty: 280, acceptQty: 275, acceptPrice: 1350, returnQty: 5,
    claimDate: '2025/09/05', specification: 'SHIMANO BR-R8170 ULTEGRA CALIPER FRONT',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP1',
  },
  {
    id: 102, vendorName: '華銘(0001000641)', orderNo: '4500100050', orderSeq: '20', orderType: 'Z2QB',
    receiveDate: '2025/08/05', acceptNo: 'ACC-2025-B102', acceptSeq: '01',
    vendorShipNo: '91775310', shipSeq: '20', materialNo: '6601-CHN0641-B02',
    deliveryNo: '1720580850', orderQty: 400, shipQty: 350, acceptQty: 348, acceptPrice: 290, returnQty: 2,
    claimDate: '2025/09/05', specification: 'SHIMANO CN-HG701 11-SPEED CHAIN',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP1',
  },
  {
    id: 103, vendorName: '華銘(0001000641)', orderNo: '4500100051', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/10', acceptNo: 'ACC-2025-B103', acceptSeq: '01',
    vendorShipNo: '91775311', shipSeq: '10', materialNo: '7701-CST0641-B03',
    deliveryNo: '1720580855', orderQty: 180, shipQty: 160, acceptQty: 158, acceptPrice: 920, returnQty: 2,
    claimDate: '2025/09/10', specification: 'SHIMANO CS-R8100 12-SPEED 11-30T',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP2',
  },
  {
    id: 104, vendorName: '華銘(0001000641)', orderNo: '4500100052', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/15', acceptNo: 'ACC-2025-B104', acceptSeq: '01',
    vendorShipNo: '91775312', shipSeq: '10', materialNo: '2201-FRM0641-B04',
    deliveryNo: '1720580860', orderQty: 50, shipQty: 45, acceptQty: 44, acceptPrice: 18500, returnQty: 1,
    claimDate: '2025/09/15', specification: 'DEFY ADVANCED PRO FRAME XL CARBON/BLACK',
    outsourceNo: 'OS-2025-010', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTC1',
  },
  {
    id: 105, vendorName: '華銘(0001000641)', orderNo: '4500100053', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/20', acceptNo: 'ACC-2025-B105', acceptSeq: '01',
    vendorShipNo: '91775313', shipSeq: '10', materialNo: '4401-WHL0641-B05',
    deliveryNo: '1720580865', orderQty: 120, shipQty: 100, acceptQty: 100, acceptPrice: 5200, returnQty: 0,
    claimDate: '2025/09/20', specification: 'SLR 1 42 DISC WHEELSYSTEM REAR 12X142',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTE1',
  },

  // ── 佳承精密 保稅 ×3 ──
  {
    id: 111, vendorName: '佳承精密(0001000045)', orderNo: '4500200050', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/28', acceptNo: 'ACC-2025-B111', acceptSeq: '01',
    vendorShipNo: 'SHP-2025-0050', shipSeq: '10', materialNo: '8801-TIR0045-B01',
    deliveryNo: '1720580870', orderQty: 600, shipQty: 500, acceptQty: 498, acceptPrice: 480, returnQty: 2,
    claimDate: '2025/08/28', specification: 'GAVIA FONDO 0 700X25C TUBELESS READY',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP1',
  },
  {
    id: 112, vendorName: '佳承精密(0001000045)', orderNo: '4500200051', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/28', acceptNo: 'ACC-2025-B112', acceptSeq: '01',
    vendorShipNo: 'SHP-2025-0050', shipSeq: '20', materialNo: '8802-TIR0045-B02',
    deliveryNo: '1720580870', orderQty: 300, shipQty: 250, acceptQty: 250, acceptPrice: 520, returnQty: 0,
    claimDate: '2025/08/28', specification: 'GAVIA AC 1 700X25C TUBELESS RACE',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP2',
  },
  {
    id: 113, vendorName: '佳承精密(0001000045)', orderNo: '4500200052', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/02', acceptNo: 'ACC-2025-B113', acceptSeq: '01',
    vendorShipNo: 'SHP-2025-0051', shipSeq: '10', materialNo: '8803-TIR0045-B03',
    deliveryNo: '1720580875', orderQty: 200, shipQty: 180, acceptQty: 178, acceptPrice: 680, returnQty: 2,
    claimDate: '2025/09/02', specification: 'CROSSCUT AT 2 700X38C GRAVEL TUBELESS',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠非生產採購組織',
    purchaseGroup: 'P20', customerPO: '', plantCode: 'DTC1',
  },

  // ── 佳承精密 非保稅 追加 ×2 ──
  {
    id: 114, vendorName: '佳承精密(0001000045)', orderNo: '4500200060', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/10', acceptNo: 'ACC-2025-N114', acceptSeq: '01',
    vendorShipNo: 'SHP-2025-0055', shipSeq: '10', materialNo: '8804-TIR0045-N01',
    deliveryNo: '1720580880', orderQty: 400, shipQty: 350, acceptQty: 345, acceptPrice: 420, returnQty: 5,
    claimDate: '2025/08/10', specification: 'GAVIA RACE 0 700X25C TUBELESS COMPETITION',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠非生產採購組織',
    purchaseGroup: 'P20', customerPO: '', plantCode: 'DTE1',
  },
  {
    id: 115, vendorName: '佳承精密(0001000045)', orderNo: '4500200061', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/15', acceptNo: 'ACC-2025-N115', acceptSeq: '01',
    vendorShipNo: 'SHP-2025-0056', shipSeq: '10', materialNo: '8805-TIR0045-N02',
    deliveryNo: '1720580885', orderQty: 250, shipQty: 220, acceptQty: 218, acceptPrice: 560, returnQty: 2,
    claimDate: '2025/08/15', specification: 'CROSSCUT GRAVEL 1 700X40C TUBELESS',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠非生產採購組織',
    purchaseGroup: 'P20', customerPO: '', plantCode: 'DTE1',
  },

  // ── 久廣精密 保稅 ×4 ──
  {
    id: 121, vendorName: '久廣精密(0001000053)', orderNo: '4500300050', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/01', acceptNo: 'ACC-2025-B121', acceptSeq: '01',
    vendorShipNo: 'INV-20250801-001', shipSeq: '10', materialNo: '2201-FRK0053-B01',
    deliveryNo: '1720580890', orderQty: 40, shipQty: 35, acceptQty: 34, acceptPrice: 3100, returnQty: 1,
    claimDate: '2025/09/01', specification: 'TCR ADVANCED PRO FORK CARBON STEERER',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTG1',
  },
  {
    id: 122, vendorName: '久廣精密(0001000053)', orderNo: '4500300051', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/01', acceptNo: 'ACC-2025-B122', acceptSeq: '01',
    vendorShipNo: 'INV-20250801-001', shipSeq: '20', materialNo: '3301-DRL0053-B02',
    deliveryNo: '1720580890', orderQty: 80, shipQty: 70, acceptQty: 68, acceptPrice: 1850, returnQty: 2,
    claimDate: '2025/09/01', specification: 'SHIMANO RD-R8150 Di2 12-SPEED REAR',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTI1',
  },
  {
    id: 123, vendorName: '久廣精密(0001000053)', orderNo: '4500300052', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/08', acceptNo: 'ACC-2025-B123', acceptSeq: '01',
    vendorShipNo: 'INV-20250808-001', shipSeq: '10', materialNo: '5501-PED0053-B03',
    deliveryNo: '1720580895', orderQty: 150, shipQty: 130, acceptQty: 128, acceptPrice: 2900, returnQty: 2,
    claimDate: '2025/09/08', specification: 'SHIMANO PD-R9100 SPD-SL PEDAL CARBON',
    outsourceNo: 'OS-2025-011', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'GVM1',
  },
  {
    id: 124, vendorName: '久廣精密(0001000053)', orderNo: '4500300053', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/12', acceptNo: 'ACC-2025-B124', acceptSeq: '01',
    vendorShipNo: 'INV-20250808-001', shipSeq: '20', materialNo: '4401-GRP0053-B04',
    deliveryNo: '1720580895', orderQty: 350, shipQty: 300, acceptQty: 295, acceptPrice: 110, returnQty: 5,
    claimDate: '2025/09/12', specification: 'CONNECT COMFORT GRIP 135MM ERGONOMIC',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'GTM1',
  },

  // ── 金盛元工業 保稅 ×3 ──
  {
    id: 131, vendorName: '金盛元工業(0001000059)', orderNo: '4500400050', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/03', acceptNo: 'ACC-2025-B131', acceptSeq: '01',
    vendorShipNo: 'INV-20250803-001', shipSeq: '10', materialNo: '6601-CHN0059-B01',
    deliveryNo: '1720580900', orderQty: 800, shipQty: 700, acceptQty: 695, acceptPrice: 340, returnQty: 5,
    claimDate: '2025/09/03', specification: 'SHIMANO CN-M8100 12-SPEED CHAIN DEORE XT',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP1',
  },
  {
    id: 132, vendorName: '金盛元工業(0001000059)', orderNo: '4500400051', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/03', acceptNo: 'ACC-2025-B132', acceptSeq: '01',
    vendorShipNo: 'INV-20250803-001', shipSeq: '20', materialNo: '6602-CHN0059-B02',
    deliveryNo: '1720580900', orderQty: 500, shipQty: 450, acceptQty: 448, acceptPrice: 380, returnQty: 2,
    claimDate: '2025/09/03', specification: 'KMC X12 12-SPEED CHAIN GOLD',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP2',
  },
  {
    id: 133, vendorName: '金盛元工業(0001000059)', orderNo: '4500400052', orderSeq: '10', orderType: 'Z3XD',
    receiveDate: '2025/08/10', acceptNo: 'ACC-2025-B133', acceptSeq: '01',
    vendorShipNo: 'INV-20250810-001', shipSeq: '10', materialNo: '6603-CHN0059-B03',
    deliveryNo: '1720580905', orderQty: 300, shipQty: 280, acceptQty: 278, acceptPrice: 420, returnQty: 2,
    claimDate: '2025/09/10', specification: 'KMC X11 EPT 11-SPEED CHAIN ANTI-RUST',
    outsourceNo: '', bondedType: '保稅', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '', plantCode: 'GTM1',
  },

  // ── 金盛元工業 非保稅 追加 ×2 ──
  {
    id: 134, vendorName: '金盛元工業(0001000059)', orderNo: '4500400060', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/20', acceptNo: 'ACC-2025-N134', acceptSeq: '01',
    vendorShipNo: 'INV-20250720-001', shipSeq: '10', materialNo: '6604-CHN0059-N01',
    deliveryNo: '1720580910', orderQty: 450, shipQty: 400, acceptQty: 398, acceptPrice: 350, returnQty: 2,
    claimDate: '2025/08/20', specification: 'SHIMANO CN-HG601 11-SPEED CHAIN SIL-TEC',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '', plantCode: 'GTM1',
  },
  {
    id: 135, vendorName: '金盛元工業(0001000059)', orderNo: '4500400061', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/07/25', acceptNo: 'ACC-2025-N135', acceptSeq: '01',
    vendorShipNo: 'INV-20250725-001', shipSeq: '10', materialNo: '6605-CHN0059-N02',
    deliveryNo: '1720580915', orderQty: 350, shipQty: 320, acceptQty: 318, acceptPrice: 310, returnQty: 2,
    claimDate: '2025/08/25', specification: 'KMC X10 10-SPEED CHAIN SILVER',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '昆山廠生產採購組織',
    purchaseGroup: 'P30', customerPO: '', plantCode: 'GVM1',
  },

  // ── 華銘 非保稅 追加 ×3（更多非保稅候選資料）──
  {
    id: 141, vendorName: '華銘(0001000641)', orderNo: '4500100060', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/25', acceptNo: 'ACC-2025-N141', acceptSeq: '01',
    vendorShipNo: '91775320', shipSeq: '10', materialNo: '5502-BRK0641-N01',
    deliveryNo: '1720580920', orderQty: 200, shipQty: 180, acceptQty: 178, acceptPrice: 1180, returnQty: 2,
    claimDate: '2025/09/25', specification: 'SHIMANO BR-R8170 ULTEGRA CALIPER REAR',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'AIP1',
  },
  {
    id: 142, vendorName: '華銘(0001000641)', orderNo: '4500100061', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/28', acceptNo: 'ACC-2025-N142', acceptSeq: '01',
    vendorShipNo: '91775321', shipSeq: '10', materialNo: '3302-STM0641-N02',
    deliveryNo: '1720580925', orderQty: 100, shipQty: 90, acceptQty: 88, acceptPrice: 620, returnQty: 2,
    claimDate: '2025/09/28', specification: 'CONTACT SLR OD2 STEM 90MM -8DEG',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTC1',
  },
  {
    id: 143, vendorName: '華銘(0001000641)', orderNo: '4500100062', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/09/01', acceptNo: 'ACC-2025-N143', acceptSeq: '01',
    vendorShipNo: '91775322', shipSeq: '10', materialNo: '4402-SDT0641-N03',
    deliveryNo: '1720580930', orderQty: 160, shipQty: 140, acceptQty: 138, acceptPrice: 780, returnQty: 2,
    claimDate: '2025/10/01', specification: 'FLEET SLR SADDLE CARBON RAIL',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTE1',
  },

  // ── 久廣精密 非保稅 追加 ×2 ──
  {
    id: 151, vendorName: '久廣精密(0001000053)', orderNo: '4500300060', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/18', acceptNo: 'ACC-2025-N151', acceptSeq: '01',
    vendorShipNo: 'INV-20250818-001', shipSeq: '10', materialNo: '3302-DRL0053-N01',
    deliveryNo: '1720580935', orderQty: 60, shipQty: 50, acceptQty: 49, acceptPrice: 1520, returnQty: 1,
    claimDate: '2025/09/18', specification: 'SHIMANO FD-R9250 Di2 12-SPEED FRONT',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'DTI1',
  },
  {
    id: 152, vendorName: '久廣精密(0001000053)', orderNo: '4500300061', orderSeq: '10', orderType: 'Z2QB',
    receiveDate: '2025/08/22', acceptNo: 'ACC-2025-N152', acceptSeq: '01',
    vendorShipNo: 'INV-20250822-001', shipSeq: '10', materialNo: '5502-PED0053-N02',
    deliveryNo: '1720580940', orderQty: 120, shipQty: 100, acceptQty: 98, acceptPrice: 2650, returnQty: 2,
    claimDate: '2025/09/22', specification: 'SHIMANO PD-R8100 SPD-SL PEDAL ULTEGRA',
    outsourceNo: '', bondedType: '', companyCode: 'C001', purchaseOrg: '台灣廠生產採購組織',
    purchaseGroup: 'P10', customerPO: '', plantCode: 'GVM1',
  },
];

