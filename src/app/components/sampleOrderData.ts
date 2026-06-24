// ── 索樣單 — 資料模型、常數與 Mock 資料 ────────────────────────────────────

// ── 狀態定義 ────────────────────────────────────────────────────────────────

export type SampleOrderStatus = 'DR' | 'V' | 'B' | 'SC' | 'CL' | 'CC';

export interface SampleOrderStatusDef {
  code: SampleOrderStatus;
  label: string;
  tabLabel: string;
  oldCode: string;
  definition: string;
  note: string;
  /** Badge 背景色 */
  bgColor: string;
  /** Badge 文字色 */
  textColor: string;
}

export const SAMPLE_ORDER_STATUSES: SampleOrderStatusDef[] = [
  {
    code: 'DR',
    label: '草稿',
    tabLabel: '草稿(DR)',
    oldCode: 'RR',
    definition: '未正式成立索樣單前',
    note: '整採可執行刪除',
    bgColor: 'rgba(145,158,171,0.16)',
    textColor: '#637381',
  },
  {
    code: 'V',
    label: '廠商確認中',
    tabLabel: '廠商確認中(V)',
    oldCode: 'WR',
    definition: '整採送出後，廠商確認中',
    note: '',
    bgColor: 'rgba(24,144,255,0.12)',
    textColor: '#1677ff',
  },
  {
    code: 'B',
    label: '採購確認中',
    tabLabel: '採購確認中(B)',
    oldCode: 'RP',
    definition: '廠商回覆後',
    note: '整採可執行取消、完結',
    bgColor: 'rgba(255,171,0,0.16)',
    textColor: '#b76e00',
  },
  {
    code: 'SC',
    label: '索樣已確認',
    tabLabel: '索樣已確認(SC)',
    oldCode: '',
    definition: '',
    note: '確認後單據內容不可再調整，僅整採可執行取消',
    bgColor: 'rgba(34,197,94,0.16)',
    textColor: '#118d57',
  },
  {
    code: 'CL',
    label: '已關閉',
    tabLabel: '關閉結案(CL)',
    oldCode: 'CL',
    definition: '單據結案',
    note: '由整採執行',
    bgColor: 'rgba(99,115,129,0.12)',
    textColor: '#637381',
  },
  {
    code: 'CC',
    label: '取消',
    tabLabel: '取消(CC)',
    oldCode: 'DE',
    definition: '單據取消',
    note: '由整採執行',
    bgColor: 'rgba(255,86,48,0.12)',
    textColor: '#ff5630',
  },
];

export function getStatusDef(code: SampleOrderStatus): SampleOrderStatusDef {
  return SAMPLE_ORDER_STATUSES.find((s) => s.code === code)!;
}

// ── 索樣類型 ────────────────────────────────────────────────────────────────

export type SampleType = 'D' | 'G' | 'E' | 'S';

export const SAMPLE_TYPE_OPTIONS: { value: SampleType; label: string }[] = [
  { value: 'D', label: 'D(開發樣)' },
  { value: 'G', label: 'G(量產品)' },
  { value: 'E', label: 'E(工程樣)' },
  { value: 'S', label: 'S(特殊樣)' },
];

// ── 介面定義 ────────────────────────────────────────────────────────────────

export interface SampleOrderRecord {
  id: number;
  /** 索樣單號（格式：G25XXXXX） */
  orderNo: string;
  /** 狀態 */
  status: SampleOrderStatus;
  /** 廠商代碼 */
  vendorCode: string;
  /** 廠商名稱 */
  vendorName: string;
  /** 採購組織 */
  purchaseOrg: string;
  /** 工廠 */
  plant: string;
  /** 料號 */
  material: string;
  /** 長規格敘述 */
  longDescription: string;
  /** 廠商商料號 */
  vendorMaterialNo?: string;
  /** 索樣日期（YYYY/MM/DD） */
  sampleDate: string;
  /** 需求日期（YYYY/MM/DD） */
  demandDate: string;
  /** 需求數量 */
  demandQty?: number;
  /** 重新索樣 */
  resample: boolean;
  /** 索樣類型 */
  sampleType: SampleType;
  /** 備註 */
  remark: string;
  /** 建立者 */
  createdBy: string;
  /** 建立時間 */
  createdAt: string;
  /** 最後更新時間 */
  updatedAt: string;
  // ── 廠商回覆欄位（狀態 V 以後才有值） ─────────────────────────────────
  /** 樣品送達日 */
  vendorShipDate?: string;
  /** 實際送樣日 */
  actualShipDate?: string;
  /** 首批可供貨日 */
  availableDate?: string;
  /** 廠商日產能 */
  vendorDailyCapacity?: number;
}

// ── 序號產生器 ──────────────────────────────────────────────────────────────

let _orderSeq = 94;

function genOrderNo(): string {
  _orderSeq += 1;
  return `G2500${_orderSeq}`;
}

// ── Mock 資料 Store（模組記憶體，頁面切換不遺失）───────────────────────────

let _sampleOrders: SampleOrderRecord[] = [
  // ── V 廠商確認中 ─────────────────────────────────────────────────────────
  {
    id: 1,
    orderNo: 'G2500091',
    status: 'V',
    vendorCode: '000100463',
    vendorName: '速聯',
    purchaseOrg: '1101',
    plant: 'GTM1',
    material: '1330-BASAD1-003',
    longDescription: 'G9 Pique ADV PRO 29 0 (15)(拉伸無膜樣+數位無膜樣) CARBON SMOKE/G-CHO1',
    vendorMaterialNo: '411U12C14S4002',
    sampleDate: '2025/01/01',
    demandDate: '2025/02/01',
    demandQty: 4,
    resample: true,
    sampleType: 'D',
    remark: '開發樣品需於年前確認',
    createdBy: '王大明',
    createdAt: '2025/01/01 12:00',
    updatedAt: '2025/01/01 12:00',
    vendorShipDate: '2025/02/10',
    actualShipDate: '2025/02/10',
    availableDate: '2025/02/10',
    vendorDailyCapacity: 4,
  },
  {
    id: 2,
    orderNo: 'G2500092',
    status: 'V',
    vendorCode: '000100463',
    vendorName: '速聯',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-CSL0075-L02',
    longDescription: 'SRAM EAGLE AXS REAR DERAILLEUR 12-SPD',
    sampleDate: '2024/12/25',
    demandDate: '2025/02/01',
    resample: false,
    sampleType: 'G',
    remark: '',
    createdBy: '王大明',
    createdAt: '2024/12/20 09:35',
    updatedAt: '2024/12/20 09:35',
  },
  {
    id: 3,
    orderNo: 'G2500093',
    status: 'V',
    vendorCode: '000100463',
    vendorName: '速聯',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-CSL0075-L03',
    longDescription: 'SRAM EAGLE AXS FRONT DERAILLEUR 12-SPD',
    sampleDate: '2024/12/25',
    demandDate: '2025/02/01',
    resample: false,
    sampleType: 'G',
    remark: '',
    createdBy: '王大明',
    createdAt: '2024/12/20 09:40',
    updatedAt: '2024/12/20 09:40',
  },
  {
    id: 4,
    orderNo: 'G2500082',
    status: 'V',
    vendorCode: '000100321',
    vendorName: '禧瑪諾',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-SHM0012-A01',
    longDescription: 'SHIMANO DURA-ACE R9200 CRANKSET 172.5MM',
    sampleDate: '2024/12/10',
    demandDate: '2025/01/15',
    resample: false,
    sampleType: 'D',
    remark: '請確認包裝方式',
    createdBy: '陳小華',
    createdAt: '2024/12/05 14:20',
    updatedAt: '2024/12/05 14:20',
  },
  {
    id: 5,
    orderNo: 'G2500083',
    status: 'V',
    vendorCode: '000100321',
    vendorName: '禧瑪諾',
    purchaseOrg: 'GEM採購組織',
    plant: 'DTC1',
    material: '1129-SHM0013-B02',
    longDescription: 'SHIMANO DURA-ACE R9200 BRAKE CALIPER FRONT',
    vendorMaterialNo: 'SHM-BR-R9200-F',
    sampleDate: '2024/12/10',
    demandDate: '2025/01/20',
    demandQty: 2,
    resample: true,
    sampleType: 'G',
    remark: '',
    createdBy: '陳小華',
    createdAt: '2024/12/05 14:25',
    updatedAt: '2024/12/05 14:25',
  },
  // ── B 採購確認中 ─────────────────────────────────────────────────────────
  {
    id: 6,
    orderNo: 'G2500071',
    status: 'B',
    vendorCode: '000100215',
    vendorName: '麥克納馬拉',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-MCN0044-C03',
    longDescription: 'MAXXIS MINION DHF 29X2.5 3C EXO TIRE',
    vendorMaterialNo: 'MX-MINION-DHF-29',
    sampleDate: '2024/11/20',
    demandDate: '2024/12/30',
    demandQty: 6,
    resample: false,
    sampleType: 'G',
    remark: '廠商已回覆，待採購確認',
    createdBy: '林怡君',
    createdAt: '2024/11/15 10:00',
    updatedAt: '2024/11/25 16:30',
    vendorShipDate: '2024/12/15',
    actualShipDate: '2024/12/16',
    availableDate: '2024/12/20',
    vendorDailyCapacity: 10,
  },
  {
    id: 7,
    orderNo: 'G2500072',
    status: 'B',
    vendorCode: '000100215',
    vendorName: '麥克納馬拉',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-MCN0045-D01',
    longDescription: 'MAXXIS MINION DHR II 29X2.4 3C EXO TIRE',
    sampleDate: '2024/11/20',
    demandDate: '2024/12/30',
    demandQty: 4,
    resample: false,
    sampleType: 'G',
    remark: '',
    createdBy: '林怡君',
    createdAt: '2024/11/15 10:05',
    updatedAt: '2024/11/25 16:35',
    vendorShipDate: '2024/12/15',
    actualShipDate: '2024/12/17',
    availableDate: '2024/12/22',
    vendorDailyCapacity: 8,
  },
  {
    id: 8,
    orderNo: 'G2500073',
    status: 'B',
    vendorCode: '000100463',
    vendorName: '速聯',
    purchaseOrg: 'GEM採購組織',
    plant: 'DTE1',
    material: '1129-CSL0066-E01',
    longDescription: 'SRAM GX EAGLE CHAIN 126 LINK 12-SPD',
    sampleDate: '2024/11/25',
    demandDate: '2025/01/05',
    resample: true,
    sampleType: 'D',
    remark: '第二次索樣，規格已調整',
    createdBy: '王大明',
    createdAt: '2024/11/20 11:00',
    updatedAt: '2024/11/28 09:15',
  },
  // ── SC 索樣已確認 ─────────────────────────────────────────────────────────
  {
    id: 9,
    orderNo: 'G2500055',
    status: 'SC',
    vendorCode: '000100321',
    vendorName: '禧瑪諾',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-SHM0005-F01',
    longDescription: 'SHIMANO ULTEGRA R8100 GROUPSET 12-SPD',
    sampleDate: '2024/10/15',
    demandDate: '2024/11/30',
    resample: false,
    sampleType: 'D',
    remark: '確認完成，進入量產評估',
    createdBy: '陳小華',
    createdAt: '2024/10/10 13:00',
    updatedAt: '2024/10/30 17:00',
  },
  {
    id: 10,
    orderNo: 'G2500056',
    status: 'SC',
    vendorCode: '000100215',
    vendorName: '麥克納馬拉',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-MCN0030-G02',
    longDescription: 'MAXXIS ARDENT RACE 29X2.2 3C EXO TIRE',
    sampleDate: '2024/10/20',
    demandDate: '2024/11/30',
    resample: false,
    sampleType: 'G',
    remark: '',
    createdBy: '林怡君',
    createdAt: '2024/10/15 09:00',
    updatedAt: '2024/11/05 14:20',
  },
  // ── DR 草稿 ──────────────────────────────────────────────────────────────
  {
    id: 11,
    orderNo: 'G2500095',
    status: 'DR',
    vendorCode: '000100463',
    vendorName: '速聯',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-CSL0080-H01',
    longDescription: 'SRAM XX SL EAGLE AXS GROUPSET 12-SPD COMPLETE',
    sampleDate: '2025/01/10',
    demandDate: '2025/03/01',
    resample: false,
    sampleType: 'D',
    remark: '草稿中，尚未送出',
    createdBy: '王大明',
    createdAt: '2024/12/24 16:00',
    updatedAt: '2024/12/24 16:00',
  },
  // ── CL 已關閉 ────────────────────────────────────────────────────────────
  {
    id: 12,
    orderNo: 'G2500040',
    status: 'CL',
    vendorCode: '000100321',
    vendorName: '禧瑪諾',
    purchaseOrg: 'GEM採購組織',
    plant: 'GTM1',
    material: '1129-SHM0001-J01',
    longDescription: 'SHIMANO XTR M9100 CRANKSET 170MM',
    sampleDate: '2024/09/01',
    demandDate: '2024/10/15',
    resample: false,
    sampleType: 'G',
    remark: '結案，已轉量產',
    createdBy: '陳小華',
    createdAt: '2024/08/25 10:00',
    updatedAt: '2024/10/20 15:00',
  },
  // ── CC 取消 ──────────────────────────────────────────────────────────────
  {
    id: 13,
    orderNo: 'G2500035',
    status: 'CC',
    vendorCode: '000100215',
    vendorName: '麥克納馬拉',
    purchaseOrg: 'GEM採購組織',
    plant: 'DTC1',
    material: '1129-MCN0020-K01',
    longDescription: 'MAXXIS HIGH ROLLER II 29X2.3 3C GRIP TIRE',
    sampleDate: '2024/08/10',
    demandDate: '2024/09/30',
    resample: false,
    sampleType: 'E',
    remark: '因供應商問題取消',
    createdBy: '林怡君',
    createdAt: '2024/08/05 14:00',
    updatedAt: '2024/09/01 11:30',
  },
];

// ── Store 操作函式 ────────────────────────────────────────────────────────────

export function getSampleOrders(): SampleOrderRecord[] {
  return _sampleOrders;
}

export function addSampleOrder(record: Omit<SampleOrderRecord, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>): SampleOrderRecord {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const newRecord: SampleOrderRecord = {
    ...record,
    id: Date.now(),
    orderNo: genOrderNo(),
    createdAt: ts,
    updatedAt: ts,
  };
  _sampleOrders = [newRecord, ..._sampleOrders];
  return newRecord;
}

export function deleteSampleOrders(ids: number[]): void {
  _sampleOrders = _sampleOrders.filter((r) => !ids.includes(r.id));
}

export function updateSampleOrderStatus(ids: number[], status: SampleOrderStatus): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  _sampleOrders = _sampleOrders.map((r) =>
    ids.includes(r.id) ? { ...r, status, updatedAt: ts } : r,
  );
}

/** 廠商回覆：更新回覆欄位並將狀態推進到 B（採購確認中） */
export function updateSampleOrderVendorReply(
  id: number,
  reply: {
    vendorShipDate?: string;
    actualShipDate?: string;
    availableDate?: string;
    vendorDailyCapacity?: number;
  },
): SampleOrderRecord | null {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  let found: SampleOrderRecord | null = null;
  _sampleOrders = _sampleOrders.map((r) => {
    if (r.id !== id) return r;
    const updated: SampleOrderRecord = { ...r, ...reply, status: 'B', updatedAt: ts };
    found = updated;
    return updated;
  });
  return found;
}
