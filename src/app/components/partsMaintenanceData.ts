// ── 零件資訊維護 — 資料模型、常數與 Mock 資料 ──────────────────────────────

// ── Interfaces ───────────────────────────────────────────────────────────────

/** 零件歷程紀錄（與 OrderHistory 元件同結構） */
export interface PartHistoryEntry {
  date: string;     // 'YYYY/MM/DD HH:mm'
  event: string;    // 事項描述
  operator: string; // 操作人員
  remark: string;   // 異動詳細
}

/** 單筆品牌設定 */
export interface BrandSetting {
  id: number;
  brand: string;
  unitPrice: string;
  currency: string;
  quoteQty: string;
  leadTime: string;
  moq: string;
  tradeTerms: string;
  tradeTermsPlace: string;
  quoteUnit: string;
  productType: string;
}

/** 物料成分（來自 ESG > 材料維護） */
export interface MaterialComposition {
  id: number;         // 此成分設定的唯一 ID
  esgMaterialId: number; // 對應 EsgMaterialRecord.id
  /** 材料名（繁中） */
  nameTw: string;
  /** 材料名（簡中） */
  nameCn: string;
  /** 材料名（英文） */
  nameEn: string;
  /** 碳排量（kg CO₂e） */
  carbonEmission: number;
  /** 建檔者 */
  createdBy: string;
  /** 建檔日期 YYYY/MM/DD */
  createdAt: string;
  /** 最後修改者 */
  updatedBy?: string;
  /** 最後修改日期 */
  updatedAt?: string;
}

/** 單筆零件資料 */
export interface PartRecord {
  id: number;
  // KEY 值（中台帶入，唯讀）
  vendorCode: string;
  vendorName: string;
  material: string;
  plant: string;
  purchaseOrg: string;
  longDescription: string;
  // 可編輯欄位
  qaCompletionDate: string;
  sampleDate: string;
  firstDeliveryDate: string;
  grossWeight: string;
  netWeight: string;
  weightUnit: string;
  vendorPartNo: string;
  remark: string;
  // 品牌設定（一對多）
  brandSettings: BrandSetting[];
  // 物料成分設定（一對多）
  materialCompositions?: MaterialComposition[];
  // 狀態
  quoteStatus: 'pending' | 'quoted';
  notifyStatus: 'sent' | 'unsent';
  notifySentAt?: string[];          // 寄送時間紀錄（可多次，對應催促機制）
  savedAt: string;
  updatedAt: string;
  // 歷程
  history?: PartHistoryEntry[];
  syncDtcDte: boolean;
}

// ── Dropdown Options ─────────────────────────────────────────────────────────

/** 品牌（27 個） */
export const BRAND_OPTIONS = [
  { value: 'ALL', label: 'ALL' },
  { value: 'Giant', label: 'Giant' },
  { value: 'Scott', label: 'Scott' },
  { value: 'Trek', label: 'Trek' },
  { value: 'Avanti', label: 'Avanti' },
  { value: 'Bergamont', label: 'Bergamont' },
  { value: 'Canyon', label: 'Canyon' },
  { value: 'Colnago', label: 'Colnago' },
  { value: 'HDK', label: 'HDK' },
  { value: 'Northrock', label: 'Northrock' },
  { value: 'Panasonic', label: 'Panasonic' },
  { value: 'REI', label: 'REI' },
  { value: 'WBR', label: 'WBR' },
  { value: 'Yamaha', label: 'Yamaha' },
  { value: 'Electra', label: 'Electra' },
  { value: 'B-Cycle', label: 'B-Cycle' },
  { value: 'Schwinn', label: 'Schwinn' },
  { value: 'Stages', label: 'Stages' },
  { value: 'Wattbike', label: 'Wattbike' },
  { value: 'Wahoo', label: 'Wahoo' },
  { value: 'Pulse', label: 'Pulse' },
  { value: 'Harley', label: 'Harley' },
  { value: 'Asahi', label: 'Asahi' },
  { value: 'Halfords', label: 'Halfords' },
  { value: 'Zagster', label: 'Zagster' },
  { value: 'LIV', label: 'LIV' },
  { value: 'MMT', label: 'MMT' },
  { value: 'Bold Cycles', label: 'Bold Cycles' },
];

/** 國貿條件（17 個） */
export const TRADE_TERMS_OPTIONS = [
  { value: 'CFR', label: 'CFR (成本和運費)' },
  { value: 'CIF', label: 'CIF (成本、保險和運費)' },
  { value: 'CIP', label: 'CIP (運費與保險費已付)' },
  { value: 'CPT', label: 'CPT (已付運費)' },
  { value: 'DAF', label: 'DAF (邊境交貨)' },
  { value: 'DDP', label: 'DDP (交貨稅已付)' },
  { value: 'DDU', label: 'DDU (交貨稅未付)' },
  { value: 'DEQ', label: 'DEQ (碼頭交貨（已付稅）)' },
  { value: 'DES', label: 'DES (船上交貨)' },
  { value: 'EXW', label: 'EXW (工廠交貨條件)' },
  { value: 'FAS', label: 'FAS (船邊交貨條件)' },
  { value: 'FCA', label: 'FCA (向運送人交貨條件)' },
  { value: 'FH', label: 'FH (免臨存費)' },
  { value: 'FOB', label: 'FOB (免船費)' },
  { value: 'UN', label: 'UN (非免稅)' },
  { value: 'FOR', label: 'FOR' },
  { value: 'DAP', label: 'DAP (目的地交貨)' },
];

/** 報價單位（24 個） */
export const QUOTE_UNIT_OPTIONS = [
  { value: 'CMT', label: 'CMT (公分)' },
  { value: 'LTR', label: 'LTR (公升)' },
  { value: 'MTR', label: 'MTR (公尺)' },
  { value: 'KGM', label: 'KGM (公斤)' },
  { value: 'GRM', label: 'GRM (公克)' },
  { value: 'MMT', label: 'MMT (公釐)' },
  { value: 'GLI', label: 'GLI (加侖)' },
  { value: 'DMK', label: 'DMK (平分公寸)' },
  { value: 'CMK', label: 'CMK (平方公分)' },
  { value: 'MTK', label: 'MTK (平方公尺)' },
  { value: 'DZN', label: 'DZN (打)' },
  { value: 'PCE', label: 'PCE (個，片，塊，段，枝)' },
  { value: 'BLL', label: 'BLL (桶(油))' },
  { value: 'MLT', label: 'MLT (毫升)' },
  { value: 'BOT', label: 'BOT (瓶)' },
  { value: 'BOX', label: 'BOX (盒)' },
  { value: 'SET', label: 'SET (組)' },
  { value: 'YRD', label: 'YRD (碼)' },
  { value: 'CTN', label: 'CTN (箱)' },
  { value: 'LBR', label: 'LBR (磅)' },
  { value: 'NPR', label: 'NPR (雙)' },
  { value: 'GRO', label: 'GRO (羅)' },
  { value: 'ROL', label: 'ROL (捲)' },
  { value: 'BAG', label: 'BAG' },
];

/** 標準品 / 客製品 */
export const PRODUCT_TYPE_OPTIONS = [
  { value: '標準品', label: '標準品' },
  { value: '客製品', label: '客製品' },
];

/** 重量單位 */
export const WEIGHT_UNIT_OPTIONS = [
  { value: 'KG', label: 'KG' },
  { value: 'G', label: 'G' },
  { value: 'LB', label: 'LB' },
  { value: 'OZ', label: 'OZ' },
];

/** 採購組織 */
export const PURCHASE_ORG_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1101', label: '1101 GI採購組織' },
  { value: '1201', label: '1201 GC採購組織' },
  { value: '1301', label: '1301 GE採購組織' },
  { value: '1501', label: '1501 GL採購組織' },
];

/** 工廠 */
export const PLANT_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'GTM1', label: 'GTM1' },
  { value: 'GTM2', label: 'GTM2' },
  { value: 'GCM1', label: 'GCM1' },
  { value: 'DTC1', label: 'DTC1' },
  { value: 'DTE1', label: 'DTE1' },
  { value: 'GLM1', label: 'GLM1' },
];

/** 幣別（常用子集，完整清單在 currencyData.ts） */
export const CURRENCY_OPTIONS = [
  { value: 'TWD', label: 'TWD' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'JPY', label: 'JPY' },
  { value: 'CNY', label: 'CNY' },
  { value: 'GBP', label: 'GBP' },
  { value: 'KRW', label: 'KRW' },
  { value: 'THB', label: 'THB' },
  { value: 'VND', label: 'VND' },
  { value: 'IDR', label: 'IDR' },
  { value: 'MYR', label: 'MYR' },
  { value: 'SGD', label: 'SGD' },
  { value: 'AUD', label: 'AUD' },
  { value: 'HKD', label: 'HKD' },
];

// ── Mock Data ────────────────────────────────────────────────────────────────

let nextBrandId = 100;
function bId() { return nextBrandId++; }

export const MOCK_PARTS: PartRecord[] = [
  {
    id: 1,
    vendorCode: '000100463', vendorName: '速聯',
    material: '1129-CSL0075-L01', plant: 'GTM1', purchaseOrg: '1101',
    longDescription: 'G9 Pique ADV PRO 29 0 (15)(拉絲無膜標+數位無膜標) CARBON SMOKE/G-CH01',
    qaCompletionDate: '2025/06/15', sampleDate: '2025/07/01', firstDeliveryDate: '2025/08/01',
    grossWeight: '0.08', netWeight: '0.07', weightUnit: 'KG',
    vendorPartNo: 'SR-CSL0075', remark: '',
    brandSettings: [
      { id: bId(), brand: 'Giant', unitPrice: '125', currency: 'TWD', quoteQty: '1000', leadTime: '30', moq: '500', tradeTerms: 'FOB', tradeTermsPlace: '台中港', quoteUnit: 'PCE', productType: '標準品' },
    ],
    quoteStatus: 'quoted', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30', '2025/05/12 14:20', '2025/05/19 10:05'],
    savedAt: '2025/05/04 15:30', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
    history: [
      { date: '2025/05/05 09:30', event: '初始建立(未報價)', operator: '系統', remark: '由中台同步建立，通知廠商填寫' },
      { date: '2025/05/04 15:30', event: '填寫零件資料(未報價→已報價)', operator: '廠商-速聯', remark: '廠商料號: SR-CSL0075；品牌設定: 1 筆(Giant/TWD/125)' },
    ],
  },
  {
    id: 2,
    vendorCode: '000100463', vendorName: '速聯',
    material: '1129-CSL0075-L02', plant: 'GTM1', purchaseOrg: '1101',
    longDescription: 'GI006 700X38C BLK 60TPI W/BEAD(WIRE) W/Puncture protection(Deflect 2)W/O Reflective Belt W/',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.45', netWeight: '0.42', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30', '2025/05/12 14:20'],
    savedAt: '', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
  {
    id: 3,
    vendorCode: '000100463', vendorName: '速聯',
    material: '1129-CSL0075-L03', plant: 'GTM1', purchaseOrg: '1101',
    longDescription: 'G9 Pique ADV PRO 29 0 (R)(拉絲無膜標+數位無膜標) CARBON SMOKE/G-CH01',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.08', netWeight: '0.07', weightUnit: 'KG',
    vendorPartNo: '', remark: '2020/7/8 美工通知無量產需求故禁用',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30'],
    savedAt: '', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
    history: [
      { date: '2025/05/05 09:30', event: '初始建立(未報價)', operator: '系統', remark: '由中台同步建立，通知廠商填寫' },
    ],
  },
  {
    id: 4,
    vendorCode: '0001000526', vendorName: '利奇',
    material: '1529-QR396A-505', plant: 'GTM1', purchaseOrg: '1101',
    longDescription: 'QR396(II) 148X12MM MAIN AXLE ROD 180MM LENGTH TK50890',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.08', netWeight: '0.07', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'unsent', savedAt: '', updatedAt: '2025/06/04 07:00', syncDtcDte: false,
  },
  {
    id: 5,
    vendorCode: '0001000002', vendorName: '永豐金屬',
    material: '1330-BASAD1-003', plant: 'GTM1', purchaseOrg: '1101',
    longDescription: 'G9 Pique ADV PRO 29 0 (15)(拉絲無膜標+數位無膜標) CARBON SMOKE/G-CH01',
    qaCompletionDate: '2025/05/20', sampleDate: '2025/06/10', firstDeliveryDate: '2025/07/15',
    grossWeight: '1.20', netWeight: '1.05', weightUnit: 'KG',
    vendorPartNo: 'YF-BASAD1', remark: '',
    brandSettings: [
      { id: bId(), brand: 'Giant', unitPrice: '350', currency: 'TWD', quoteQty: '500', leadTime: '45', moq: '200', tradeTerms: 'EXW', tradeTermsPlace: '台中工廠', quoteUnit: 'PCE', productType: '標準品' },
      { id: bId(), brand: 'Scott', unitPrice: '380', currency: 'TWD', quoteQty: '300', leadTime: '45', moq: '150', tradeTerms: 'EXW', tradeTermsPlace: '台中工廠', quoteUnit: 'PCE', productType: '客製品' },
    ],
    materialCompositions: [
      { id: 5001, esgMaterialId: 65, nameTw: '紙板（芯紙）', nameCn: '纸板（芯纸）', nameEn: 'Cardboard (core paper)', carbonEmission: 1.2, createdBy: 'Allen Zou 郝芳筆', createdAt: '2024/03/20' },
      { id: 5002, esgMaterialId: 87, nameTw: '合成橡膠', nameCn: '合成橡胶', nameEn: 'Synthetic rubber', carbonEmission: 1.2, createdBy: 'Allen Zou 郝芳筆', createdAt: '2024/03/20' },
    ],
    quoteStatus: 'quoted', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30', '2025/05/13 16:45'],
    savedAt: '2025/05/20 10:00', updatedAt: '2025/05/05 12:30', syncDtcDte: true,
  },
  {
    id: 6,
    vendorCode: '0001000003', vendorName: '立德科技',
    material: '2210-ECU0012-A01', plant: 'GTM2', purchaseOrg: '1101',
    longDescription: 'E-BIKE CONTROLLER UNIT 36V 250W BRUSHLESS DC MOTOR DRIVER',
    qaCompletionDate: '2025/04/10', sampleDate: '2025/04/25', firstDeliveryDate: '2025/05/30',
    grossWeight: '0.35', netWeight: '0.30', weightUnit: 'KG',
    vendorPartNo: 'LD-ECU012', remark: '',
    brandSettings: [
      { id: bId(), brand: 'Giant', unitPrice: '2800', currency: 'TWD', quoteQty: '200', leadTime: '60', moq: '100', tradeTerms: 'FOB', tradeTermsPlace: '基隆港', quoteUnit: 'PCE', productType: '客製品' },
    ],
    quoteStatus: 'quoted', notifyStatus: 'sent',
    notifySentAt: ['2025/04/28 09:15'],
    savedAt: '2025/04/28 09:15', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
  {
    id: 7,
    vendorCode: '0001000003', vendorName: '立德科技',
    material: '2210-SEN0034-B02', plant: 'GTM2', purchaseOrg: '1101',
    longDescription: 'TORQUE SENSOR MODULE FOR E-BIKE BOTTOM BRACKET INTEGRATED',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.15', netWeight: '0.12', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30', '2025/05/12 14:20', '2025/05/20 08:55'],
    savedAt: '', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
  {
    id: 8,
    vendorCode: '0001000641', vendorName: '華銘',
    material: '1420-HDL0089-C03', plant: 'GTM1', purchaseOrg: '1101',
    longDescription: 'HANDLEBAR ALLOY 6061 T6 31.8MM CLAMP 720MM WIDTH RISE 15MM',
    qaCompletionDate: '2025/05/01', sampleDate: '2025/05/15', firstDeliveryDate: '2025/06/20',
    grossWeight: '0.28', netWeight: '0.25', weightUnit: 'KG',
    vendorPartNo: 'HM-HDL089', remark: '',
    brandSettings: [
      { id: bId(), brand: 'Giant', unitPrice: '185', currency: 'TWD', quoteQty: '800', leadTime: '25', moq: '400', tradeTerms: 'FOB', tradeTermsPlace: '台中港', quoteUnit: 'PCE', productType: '標準品' },
    ],
    quoteStatus: 'quoted', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30', '2025/05/16 14:20'],
    savedAt: '2025/05/16 14:20', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
  {
    id: 9,
    vendorCode: '0001000045', vendorName: '佳承精密',
    material: '1550-BRK0056-D04', plant: 'GCM1', purchaseOrg: '1201',
    longDescription: 'BRAKE CALIPER SET HYDRAULIC DISC 160MM ROTOR POST MOUNT',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.32', netWeight: '0.28', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'unsent', savedAt: '', updatedAt: '2025/06/04 07:00', syncDtcDte: false,
  },
  {
    id: 10,
    vendorCode: '0001000053', vendorName: '久廣精密',
    material: '1610-PED0023-E05', plant: 'GCM1', purchaseOrg: '1201',
    longDescription: 'PEDAL ALLOY BODY CR-MO AXLE SEALED BEARING PLATFORM TYPE',
    qaCompletionDate: '2025/03/20', sampleDate: '2025/04/05', firstDeliveryDate: '2025/05/10',
    grossWeight: '0.38', netWeight: '0.34', weightUnit: 'KG',
    vendorPartNo: 'JG-PED023', remark: '',
    brandSettings: [
      { id: bId(), brand: 'Giant', unitPrice: '220', currency: 'TWD', quoteQty: '600', leadTime: '35', moq: '300', tradeTerms: 'EXW', tradeTermsPlace: '高雄工廠', quoteUnit: 'NPR', productType: '標準品' },
    ],
    quoteStatus: 'quoted', notifyStatus: 'sent',
    notifySentAt: ['2025/03/20 10:30'],
    savedAt: '2025/04/06 11:45', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
  {
    id: 11,
    vendorCode: '0001000059', vendorName: '金盛元工業',
    material: '1720-SPK0078-F06', plant: 'GTM1', purchaseOrg: '1101',
    longDescription: 'SPOKE STAINLESS STEEL 2.0MM 14G 262MM LENGTH SILVER',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.01', netWeight: '0.01', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30', '2025/05/12 14:20'],
    savedAt: '', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
  {
    id: 12,
    vendorCode: '0001000012', vendorName: '台灣製造',
    material: '1830-CRK0045-G07', plant: 'DTC1', purchaseOrg: '1101',
    longDescription: 'CRANKSET ALLOY 170MM 50/34T 110BCD ROAD DOUBLE CHAINRING',
    qaCompletionDate: '2025/05/25', sampleDate: '2025/06/08', firstDeliveryDate: '2025/07/20',
    grossWeight: '0.72', netWeight: '0.65', weightUnit: 'KG',
    vendorPartNo: 'TW-CRK045', remark: '',
    brandSettings: [
      { id: bId(), brand: 'Giant', unitPrice: '890', currency: 'TWD', quoteQty: '400', leadTime: '40', moq: '200', tradeTerms: 'FOB', tradeTermsPlace: '台中港', quoteUnit: 'SET', productType: '標準品' },
      { id: bId(), brand: 'LIV', unitPrice: '920', currency: 'TWD', quoteQty: '200', leadTime: '40', moq: '100', tradeTerms: 'FOB', tradeTermsPlace: '台中港', quoteUnit: 'SET', productType: '客製品' },
    ],
    quoteStatus: 'quoted', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30', '2025/05/25 11:15'],
    savedAt: '2025/06/01 16:00', updatedAt: '2025/05/05 12:30', syncDtcDte: true,
  },
  {
    id: 13,
    vendorCode: '0001000046', vendorName: '速聯國際',
    material: '1940-DRL0067-H08', plant: 'DTE1', purchaseOrg: '1301',
    longDescription: 'REAR DERAILLEUR 11-SPEED LONG CAGE SHADOW RD+ CLUTCH',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.25', netWeight: '0.22', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'unsent', savedAt: '', updatedAt: '2025/06/04 07:00', syncDtcDte: false,
  },
  {
    id: 14,
    vendorCode: '000100463', vendorName: '速聯',
    material: '1330-BASAD1-003', plant: 'GTM1', purchaseOrg: '1101',
    longDescription: 'G9 Pique ADV PRO 29 0 (15)(拉絲無膜標+數位無膜標) CARBON SMOKE/G-CH01',
    qaCompletionDate: '2025/06/01', sampleDate: '2025/06/20', firstDeliveryDate: '2025/07/25',
    grossWeight: '1.20', netWeight: '1.05', weightUnit: 'KG',
    vendorPartNo: 'SR-BASAD1', remark: '同步DTC測試用',
    brandSettings: [
      { id: bId(), brand: 'Giant', unitPrice: '340', currency: 'TWD', quoteQty: '500', leadTime: '30', moq: '250', tradeTerms: 'FOB', tradeTermsPlace: '台中港', quoteUnit: 'PCE', productType: '標準品' },
    ],
    quoteStatus: 'quoted', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30', '2025/06/02 09:30'],
    savedAt: '2025/06/02 09:30', updatedAt: '2025/05/05 12:30', syncDtcDte: true,
    history: [
      { date: '2025/05/05 09:30', event: '初始建立(未報價)', operator: '系統', remark: '由中台同步建立，通知廠商填寫' },
      { date: '2025/06/02 09:30', event: '填寫零件資料(未報價→已報價)', operator: '廠商-速聯', remark: '廠商料號: SR-BASAD1；同步DTC/DTE: 是；品牌設定: 1 筆(Giant/TWD/340)' },
    ],
  },
  {
    id: 15,
    vendorCode: '0001000002', vendorName: '永豐金屬',
    material: '1050-FRK0091-I09', plant: 'GLM1', purchaseOrg: '1501',
    longDescription: 'FORK ALLOY 700C 1-1/8" THREADLESS STEERER 300MM ROAD',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.95', netWeight: '0.88', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'sent',
    notifySentAt: ['2025/05/05 09:30'],
    savedAt: '', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
  // ── 同步功能 Demo 資料：與 id=3 (GTM1) 配對的 DTC1 ────────────────────────
  {
    id: 16,
    vendorCode: '000100463', vendorName: '速聯',
    material: '1129-CSL0075-L03', plant: 'DTC1', purchaseOrg: '1101',
    longDescription: 'G9 Pique ADV PRO 29 0 (R)(拉絲無膜標+數位無膜標) CARBON SMOKE/G-CH01',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '0.08', netWeight: '0.07', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'unsent', savedAt: '', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
  // ── 同步功能 Demo 資料：與 id=14 (GTM1) 配對的 DTE1 ───────────────────────
  {
    id: 17,
    vendorCode: '000100463', vendorName: '速聯',
    material: '1330-BASAD1-003', plant: 'DTE1', purchaseOrg: '1101',
    longDescription: 'G9 Pique ADV PRO 29 0 (15)(拉絲無膜標+數位無膜標) CARBON SMOKE/G-CH01',
    qaCompletionDate: '', sampleDate: '', firstDeliveryDate: '',
    grossWeight: '1.20', netWeight: '1.05', weightUnit: 'KG',
    vendorPartNo: '', remark: '',
    brandSettings: [],
    quoteStatus: 'pending', notifyStatus: 'unsent', savedAt: '', updatedAt: '2025/05/05 12:30', syncDtcDte: false,
  },
];

// ── 資料更新時間（模擬中台同步時間） ──────────────────────────────────────────
export const LAST_SYNC_TIME = '2025/05/05 12:30';

// ── Module-level mutable store（跨頁面保留資料）──────────────────────────────
let _parts: PartRecord[] = [...MOCK_PARTS];

/** 取得最新的零件清單 */
export function getParts(): PartRecord[] {
  return _parts;
}

/** 新增或覆寫一筆零件資料（含 materialCompositions） */
export function updatePart(updated: PartRecord): void {
  const idx = _parts.findIndex(p => p.id === updated.id);
  if (idx >= 0) {
    _parts = _parts.map(p => p.id === updated.id ? updated : p);
  } else {
    _parts = [..._parts, updated];
  }
}

/** 批次覆寫整個清單（同步 DTC/DTE 時使用） */
export function setAllParts(parts: PartRecord[]): void {
  _parts = parts;
}
