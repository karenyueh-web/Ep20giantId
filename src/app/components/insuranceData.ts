// ============================================================
// 產險資料維護 Mock Data
// ============================================================

export type InsuranceStatus = 'V' | 'G' | 'CL';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  actor: string;
  summary: string;
}

export interface InsuranceRecord {
  id: number;
  year: number;           // 年度，如 2025
  vendorName: string;     // 廠商簡稱
  vendorCode: string;     // 廠商編號，如 000100463
  status: InsuranceStatus;
  isPaid: boolean;        // 已繳/未繳
  effectiveDate: string;  // 生效日 yyyy/MM/dd
  expiryDate: string;     // 截止日 yyyy/MM/dd
  // 基本資訊
  insuranceCompanyZh: string;   // 保險公司名稱(中)
  insuranceCompanyEn: string;   // 保險公司名稱(En)
  retroactiveDate: string;      // 回朔日期
  factories: string[];          // 工廠涵蓋範圍，如 ['GTM', 'GCK', 'GCM']
  sameAsLastYear: boolean;      // 同去年設定
  insuranceType: string[];      // 投保險種，選項: 'CGL' | 'PLG' | 'PLI'
  claimBasis: string;           // 索賠制式: 'A' | 'B'
  creditRating: string;         // 保險公司信用評等（手動輸入）
  insuredMaterial: string;      // 投保物料
  representative: string;       // 代表人
  notes: string;                // 備註
  // 條款 checkboxes
  safetyParts: boolean;         // 安全部品
  contractSigned: boolean;      // 合約簽訂
  greenWave: boolean;           // 綠波合約
  oeAttachment: boolean;        // OE附約
  mou: boolean;                 // MOU
  humanRightsSurvey: boolean;   // 供應商人權調查問卷
  coversUSA: boolean;           // 投保區域含美加
  giantAsAdditional: boolean;   // 巨大為附加被保險人
  // 保費資訊
  premium: number | null;       // 保費
  premiumCurrency: string;      // 保費幣別
  contractPolicyAmount: number | null;   // 合約簽訂保額
  contractPolicyCurrency: string;
  singleIncidentAmount: number | null;   // 單一事故賠償金額
  singleIncidentCurrency: string;
  standardPolicyAmount: number | null;   // 標準保額
  standardPolicyCurrency: string;
  maxCompensation: number | null;        // 廠商最高賠償金額
  maxCompensationCurrency: string;
  // 保單附件
  attachments: { name: string }[];
  // 歷程
  history: HistoryEntry[];
  // 主要營業商品
  mainProducts: string;
}

// Mock 今天日期（用於快到期計算）
export const MOCK_TODAY = '2025-01-10';

// ============================================================
// Mock 資料（共 15 筆）
// ============================================================
export const insuranceMockData: InsuranceRecord[] = [
  // ──────────────────────────────────────────────────────────
  // 1. 速聯 2025 - V 狀態（未繳，欄位空白）
  // ──────────────────────────────────────────────────────────
  {
    id: 1,
    year: 2025,
    vendorName: '速聯',
    vendorCode: '000100463',
    status: 'V',
    isPaid: false,
    effectiveDate: '',
    expiryDate: '',
    insuranceCompanyZh: '',
    insuranceCompanyEn: '',
    retroactiveDate: '',
    factories: [],
    sameAsLastYear: false,
    insuranceType: [],
    claimBasis: '',
    creditRating: '',
    insuredMaterial: '',
    representative: '',
    notes: '',
    safetyParts: false,
    contractSigned: false,
    greenWave: false,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: false,
    coversUSA: false,
    giantAsAdditional: false,
    premium: null,
    premiumCurrency: '',
    contractPolicyAmount: null,
    contractPolicyCurrency: '',
    singleIncidentAmount: null,
    singleIncidentCurrency: '',
    standardPolicyAmount: null,
    standardPolicyCurrency: '',
    maxCompensation: null,
    maxCompensationCurrency: '',
    attachments: [],
    history: [
      {
        id: 'h-1-1',
        timestamp: '2025-01-05 09:00',
        actor: '王小明',
        summary: '建立 2025 年度資料，狀態設為 V（待驗證）',
      },
    ],
    mainProducts: '自行車傳動組件、飛輪、曲柄',
  },

  // ──────────────────────────────────────────────────────────
  // 2. 速聯 2024 - CL 狀態（已繳，快到期 7 天內：截止 2025/01/13）
  // ──────────────────────────────────────────────────────────
  {
    id: 2,
    year: 2024,
    vendorName: '速聯',
    vendorCode: '000100463',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2024/01/13',
    expiryDate: '2025/01/13',
    insuranceCompanyZh: '富邦產物保險股份有限公司',
    insuranceCompanyEn: 'Fubon Insurance Co., Ltd.',
    retroactiveDate: '2020/01/13',
    factories: ['GTM', 'GCK', 'GCM'],
    sameAsLastYear: false,
    insuranceType: ['CGL', 'PLI'],
    claimBasis: 'A',
    creditRating: 'A+',
    insuredMaterial: '自行車零組件（傳動系統、煞車系統）',
    representative: '陳志明',
    notes: '2024年度保單，含美加地區投保，請於到期前30天辦理續保',
    safetyParts: true,
    contractSigned: true,
    greenWave: false,
    oeAttachment: true,
    mou: false,
    humanRightsSurvey: true,
    coversUSA: true,
    giantAsAdditional: true,
    premium: 320000,
    premiumCurrency: 'USD',
    contractPolicyAmount: 5000000,
    contractPolicyCurrency: 'USD',
    singleIncidentAmount: 1000000,
    singleIncidentCurrency: 'USD',
    standardPolicyAmount: 3000000,
    standardPolicyCurrency: 'USD',
    maxCompensation: 2000000,
    maxCompensationCurrency: 'USD',
    attachments: [
      { name: '速聯_2024保單正本.pdf' },
      { name: '速聯_2024保費收據.pdf' },
    ],
    history: [
      {
        id: 'h-2-1',
        timestamp: '2024-01-10 10:30',
        actor: '林美惠',
        summary: '建立 2024 年度資料',
      },
      {
        id: 'h-2-2',
        timestamp: '2024-01-15 14:00',
        actor: '陳志明',
        summary: '上傳保單附件，更新保費資訊',
      },
      {
        id: 'h-2-3',
        timestamp: '2024-02-01 09:15',
        actor: '系統',
        summary: '狀態由 G 變更為 CL（已核准）',
      },
    ],
    mainProducts: '自行車傳動組件、飛輪、曲柄、變速器',
  },

  // ──────────────────────────────────────────────────────────
  // 3. 偉兒達 2025 - G 狀態（已繳，部分資料）
  // ──────────────────────────────────────────────────────────
  {
    id: 3,
    year: 2025,
    vendorName: '偉兒達',
    vendorCode: '0001000559',
    status: 'G',
    isPaid: true,
    effectiveDate: '2025/01/15',
    expiryDate: '2026/01/15',
    insuranceCompanyZh: '新安東京海上產物保險',
    insuranceCompanyEn: 'Tokio Marine Insurance',
    retroactiveDate: '',
    factories: ['GTM', 'GCT'],
    sameAsLastYear: true,
    insuranceType: ['CGL'],
    claimBasis: 'B',
    creditRating: 'A',
    insuredMaterial: '',
    representative: '黃建國',
    notes: '2025年度資料審核中',
    safetyParts: false,
    contractSigned: true,
    greenWave: false,
    oeAttachment: false,
    mou: true,
    humanRightsSurvey: false,
    coversUSA: false,
    giantAsAdditional: true,
    premium: null,
    premiumCurrency: 'TWD',
    contractPolicyAmount: null,
    contractPolicyCurrency: 'TWD',
    singleIncidentAmount: null,
    singleIncidentCurrency: 'TWD',
    standardPolicyAmount: null,
    standardPolicyCurrency: 'TWD',
    maxCompensation: null,
    maxCompensationCurrency: 'TWD',
    attachments: [{ name: '偉兒達_2025投保申請書.pdf' }],
    history: [
      {
        id: 'h-3-1',
        timestamp: '2025-01-06 11:00',
        actor: '黃建國',
        summary: '建立 2025 年度資料，保費已繳，等待保單核發',
      },
    ],
    mainProducts: '自行車車架、前叉',
  },

  // ──────────────────────────────────────────────────────────
  // 4. 偉兒達 2024 - CL 狀態（已繳，快到期 7 天內：截止 2025/01/15）
  // ──────────────────────────────────────────────────────────
  {
    id: 4,
    year: 2024,
    vendorName: '偉兒達',
    vendorCode: '0001000559',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2024/01/15',
    expiryDate: '2025/01/15',
    insuranceCompanyZh: '新安東京海上產物保險',
    insuranceCompanyEn: 'Tokio Marine Insurance',
    retroactiveDate: '2021/01/15',
    factories: ['GTM', 'GCT'],
    sameAsLastYear: false,
    insuranceType: ['CGL', 'PLG'],
    claimBasis: 'B',
    creditRating: 'A',
    insuredMaterial: '自行車車架、碳纖維前叉',
    representative: '黃建國',
    notes: '2024年度保單，正常投保區域',
    safetyParts: false,
    contractSigned: true,
    greenWave: true,
    oeAttachment: false,
    mou: true,
    humanRightsSurvey: true,
    coversUSA: false,
    giantAsAdditional: true,
    premium: 185000,
    premiumCurrency: 'TWD',
    contractPolicyAmount: 3000000,
    contractPolicyCurrency: 'TWD',
    singleIncidentAmount: 500000,
    singleIncidentCurrency: 'TWD',
    standardPolicyAmount: 2000000,
    standardPolicyCurrency: 'TWD',
    maxCompensation: 1500000,
    maxCompensationCurrency: 'TWD',
    attachments: [
      { name: '偉兒達_2024保單.pdf' },
      { name: '偉兒達_2024保費明細.xlsx' },
    ],
    history: [
      {
        id: 'h-4-1',
        timestamp: '2024-01-10 09:00',
        actor: '林美惠',
        summary: '建立 2024 年度資料',
      },
      {
        id: 'h-4-2',
        timestamp: '2024-01-20 15:30',
        actor: '黃建國',
        summary: '確認保費繳納，上傳收據',
      },
      {
        id: 'h-4-3',
        timestamp: '2024-02-10 10:00',
        actor: '系統',
        summary: '狀態由 G 變更為 CL',
      },
    ],
    mainProducts: '自行車車架、碳纖維前叉、把手',
  },

  // ──────────────────────────────────────────────────────────
  // 5. Sapim 2025 - V 狀態（未繳，欄位空白）
  // ──────────────────────────────────────────────────────────
  {
    id: 5,
    year: 2025,
    vendorName: 'Sapim',
    vendorCode: '0001000370',
    status: 'V',
    isPaid: false,
    effectiveDate: '',
    expiryDate: '',
    insuranceCompanyZh: '',
    insuranceCompanyEn: '',
    retroactiveDate: '',
    factories: [],
    sameAsLastYear: false,
    insuranceType: [],
    claimBasis: '',
    creditRating: '',
    insuredMaterial: '',
    representative: '',
    notes: '',
    safetyParts: false,
    contractSigned: false,
    greenWave: false,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: false,
    coversUSA: false,
    giantAsAdditional: false,
    premium: null,
    premiumCurrency: '',
    contractPolicyAmount: null,
    contractPolicyCurrency: '',
    singleIncidentAmount: null,
    singleIncidentCurrency: '',
    standardPolicyAmount: null,
    standardPolicyCurrency: '',
    maxCompensation: null,
    maxCompensationCurrency: '',
    attachments: [],
    history: [],
    mainProducts: '自行車輪輻、花鼓',
  },

  // ──────────────────────────────────────────────────────────
  // 6. Sapim 2024 - CL 狀態（已繳，快到期 7 天內：截止 2025/01/16）
  // ──────────────────────────────────────────────────────────
  {
    id: 6,
    year: 2024,
    vendorName: 'Sapim',
    vendorCode: '0001000370',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2024/01/16',
    expiryDate: '2025/01/16',
    insuranceCompanyZh: '國泰世紀產物保險',
    insuranceCompanyEn: 'Cathay Century Insurance Co., Ltd.',
    retroactiveDate: '2019/01/16',
    factories: ['GTM', 'GCK', 'GCM', 'GEV'],
    sameAsLastYear: false,
    insuranceType: ['PLI'],
    claimBasis: 'A',
    creditRating: 'AA-',
    insuredMaterial: '自行車輪輻、花鼓、輪圈',
    representative: '李大偉',
    notes: '比利時廠商，保單含歐盟產品責任，注意索賠制式為A',
    safetyParts: true,
    contractSigned: true,
    greenWave: false,
    oeAttachment: true,
    mou: false,
    humanRightsSurvey: true,
    coversUSA: false,
    giantAsAdditional: true,
    premium: 300,
    premiumCurrency: 'USD',
    contractPolicyAmount: 5000000,
    contractPolicyCurrency: 'USD',
    singleIncidentAmount: 1000000,
    singleIncidentCurrency: 'USD',
    standardPolicyAmount: 3000000,
    standardPolicyCurrency: 'USD',
    maxCompensation: 1000000,
    maxCompensationCurrency: 'USD',
    attachments: [
      { name: 'Sapim_2024_Policy.pdf' },
      { name: 'Sapim_2024_Premium_Receipt.pdf' },
      { name: 'Sapim_2024_EU_Annex.pdf' },
    ],
    history: [
      {
        id: 'h-6-1',
        timestamp: '2024-01-12 08:30',
        actor: '李大偉',
        summary: '建立 2024 年度資料',
      },
      {
        id: 'h-6-2',
        timestamp: '2024-01-18 14:00',
        actor: '李大偉',
        summary: '上傳保單及歐盟附約',
      },
      {
        id: 'h-6-3',
        timestamp: '2024-03-01 10:30',
        actor: '系統',
        summary: '狀態由 G 變更為 CL',
      },
    ],
    mainProducts: '自行車輪輻、花鼓、輪圈配件',
  },

  // ──────────────────────────────────────────────────────────
  // 7. 久廣實業 2025 - G 狀態（已繳，部分資料）
  // ──────────────────────────────────────────────────────────
  {
    id: 7,
    year: 2025,
    vendorName: '久廣實業',
    vendorCode: '0001000001',
    status: 'G',
    isPaid: true,
    effectiveDate: '2025/01/22',
    expiryDate: '2026/01/22',
    insuranceCompanyZh: '明台產物保險股份有限公司',
    insuranceCompanyEn: 'Mingtai Fire & Marine Insurance Co.',
    retroactiveDate: '',
    factories: ['GCK', 'GCM'],
    sameAsLastYear: true,
    insuranceType: ['CGL', 'PLG'],
    claimBasis: 'B',
    creditRating: 'B+',
    insuredMaterial: '',
    representative: '張秀蘭',
    notes: '2025年度審核中，保費已收，等待正式核保',
    safetyParts: false,
    contractSigned: false,
    greenWave: false,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: false,
    coversUSA: false,
    giantAsAdditional: false,
    premium: null,
    premiumCurrency: 'TWD',
    contractPolicyAmount: null,
    contractPolicyCurrency: 'TWD',
    singleIncidentAmount: null,
    singleIncidentCurrency: 'TWD',
    standardPolicyAmount: null,
    standardPolicyCurrency: 'TWD',
    maxCompensation: null,
    maxCompensationCurrency: 'TWD',
    attachments: [],
    history: [
      {
        id: 'h-7-1',
        timestamp: '2025-01-08 10:00',
        actor: '張秀蘭',
        summary: '建立 2025 年度資料，已收保費，審核中',
      },
    ],
    mainProducts: '自行車座墊、座管',
  },

  // ──────────────────────────────────────────────────────────
  // 8. 久廣實業 2024 - CL 狀態（已繳，15天內到期：截止 2025/01/22）
  // ──────────────────────────────────────────────────────────
  {
    id: 8,
    year: 2024,
    vendorName: '久廣實業',
    vendorCode: '0001000001',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2024/01/22',
    expiryDate: '2025/01/22',
    insuranceCompanyZh: '明台產物保險股份有限公司',
    insuranceCompanyEn: 'Mingtai Fire & Marine Insurance Co.',
    retroactiveDate: '2022/01/22',
    factories: ['GCK', 'GCM'],
    sameAsLastYear: false,
    insuranceType: ['CGL', 'PLG'],
    claimBasis: 'B',
    creditRating: 'B+',
    insuredMaterial: '自行車座墊、座管、緩衝組件',
    representative: '張秀蘭',
    notes: '2024年度保單，無美加投保',
    safetyParts: false,
    contractSigned: true,
    greenWave: false,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: false,
    coversUSA: false,
    giantAsAdditional: false,
    premium: 95000,
    premiumCurrency: 'TWD',
    contractPolicyAmount: 1500000,
    contractPolicyCurrency: 'TWD',
    singleIncidentAmount: 300000,
    singleIncidentCurrency: 'TWD',
    standardPolicyAmount: 1000000,
    standardPolicyCurrency: 'TWD',
    maxCompensation: 800000,
    maxCompensationCurrency: 'TWD',
    attachments: [
      { name: '久廣實業_2024保單.pdf' },
    ],
    history: [
      {
        id: 'h-8-1',
        timestamp: '2024-01-18 09:30',
        actor: '林美惠',
        summary: '建立 2024 年度資料',
      },
      {
        id: 'h-8-2',
        timestamp: '2024-01-25 11:00',
        actor: '張秀蘭',
        summary: '確認保費繳納完畢',
      },
      {
        id: 'h-8-3',
        timestamp: '2024-02-15 09:00',
        actor: '系統',
        summary: '狀態由 G 變更為 CL',
      },
    ],
    mainProducts: '自行車座墊、座管、緩衝組件',
  },

  // ──────────────────────────────────────────────────────────
  // 9. 久廣實業 2023 - CL 狀態（已繳，截止日已過）
  // ──────────────────────────────────────────────────────────
  {
    id: 9,
    year: 2023,
    vendorName: '久廣實業',
    vendorCode: '0001000001',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2023/01/22',
    expiryDate: '2024/01/22',
    insuranceCompanyZh: '明台產物保險股份有限公司',
    insuranceCompanyEn: 'Mingtai Fire & Marine Insurance Co.',
    retroactiveDate: '2021/01/22',
    factories: ['GCK', 'GCM'],
    sameAsLastYear: false,
    insuranceType: ['CGL'],
    claimBasis: 'B',
    creditRating: 'B+',
    insuredMaterial: '自行車座墊、座管',
    representative: '張秀蘭',
    notes: '2023年度保單（已到期）',
    safetyParts: false,
    contractSigned: true,
    greenWave: false,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: false,
    coversUSA: false,
    giantAsAdditional: false,
    premium: 88000,
    premiumCurrency: 'TWD',
    contractPolicyAmount: 1200000,
    contractPolicyCurrency: 'TWD',
    singleIncidentAmount: 250000,
    singleIncidentCurrency: 'TWD',
    standardPolicyAmount: 900000,
    standardPolicyCurrency: 'TWD',
    maxCompensation: 700000,
    maxCompensationCurrency: 'TWD',
    attachments: [
      { name: '久廣實業_2023保單.pdf' },
      { name: '久廣實業_2023保費收據.pdf' },
    ],
    history: [
      {
        id: 'h-9-1',
        timestamp: '2023-01-15 10:00',
        actor: '林美惠',
        summary: '建立 2023 年度資料',
      },
      {
        id: 'h-9-2',
        timestamp: '2023-01-28 14:00',
        actor: '張秀蘭',
        summary: '確認保費繳納完畢',
      },
      {
        id: 'h-9-3',
        timestamp: '2023-02-20 09:00',
        actor: '系統',
        summary: '狀態由 G 變更為 CL',
      },
    ],
    mainProducts: '自行車座墊、座管',
  },

  // ──────────────────────────────────────────────────────────
  // 10. 台灣新光 2025 - V 狀態（未繳，欄位空白）
  // ──────────────────────────────────────────────────────────
  {
    id: 10,
    year: 2025,
    vendorName: '台灣新光',
    vendorCode: '0001000002',
    status: 'V',
    isPaid: false,
    effectiveDate: '',
    expiryDate: '',
    insuranceCompanyZh: '',
    insuranceCompanyEn: '',
    retroactiveDate: '',
    factories: [],
    sameAsLastYear: false,
    insuranceType: [],
    claimBasis: '',
    creditRating: '',
    insuredMaterial: '',
    representative: '',
    notes: '',
    safetyParts: false,
    contractSigned: false,
    greenWave: false,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: false,
    coversUSA: false,
    giantAsAdditional: false,
    premium: null,
    premiumCurrency: '',
    contractPolicyAmount: null,
    contractPolicyCurrency: '',
    singleIncidentAmount: null,
    singleIncidentCurrency: '',
    standardPolicyAmount: null,
    standardPolicyCurrency: '',
    maxCompensation: null,
    maxCompensationCurrency: '',
    attachments: [],
    history: [],
    mainProducts: '自行車輪胎、內胎',
  },

  // ──────────────────────────────────────────────────────────
  // 11. 台灣新光 2024 - CL 狀態（已繳，30天內到期：截止 2025/02/01）
  // ──────────────────────────────────────────────────────────
  {
    id: 11,
    year: 2024,
    vendorName: '台灣新光',
    vendorCode: '0001000002',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2024/02/01',
    expiryDate: '2025/02/01',
    insuranceCompanyZh: '新光產物保險股份有限公司',
    insuranceCompanyEn: 'Shin Kong Insurance Co., Ltd.',
    retroactiveDate: '2020/02/01',
    factories: ['GTM', 'GEV', 'GEM'],
    sameAsLastYear: false,
    insuranceType: ['CGL', 'PLI'],
    claimBasis: 'A',
    creditRating: 'A',
    insuredMaterial: '自行車輪胎、內胎、輪圈帶',
    representative: '吳秋菊',
    notes: '2024年度保單，投保涵蓋GTM/GEV/GEM三廠',
    safetyParts: false,
    contractSigned: true,
    greenWave: true,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: true,
    coversUSA: false,
    giantAsAdditional: true,
    premium: 145000,
    premiumCurrency: 'TWD',
    contractPolicyAmount: 2000000,
    contractPolicyCurrency: 'TWD',
    singleIncidentAmount: 400000,
    singleIncidentCurrency: 'TWD',
    standardPolicyAmount: 1500000,
    standardPolicyCurrency: 'TWD',
    maxCompensation: 1000000,
    maxCompensationCurrency: 'TWD',
    attachments: [
      { name: '台灣新光_2024保單.pdf' },
      { name: '台灣新光_2024繳費證明.pdf' },
    ],
    history: [
      {
        id: 'h-11-1',
        timestamp: '2024-01-25 09:00',
        actor: '林美惠',
        summary: '建立 2024 年度資料',
      },
      {
        id: 'h-11-2',
        timestamp: '2024-02-05 13:00',
        actor: '吳秋菊',
        summary: '確認保費繳納，更新保費資訊',
      },
      {
        id: 'h-11-3',
        timestamp: '2024-03-01 09:30',
        actor: '系統',
        summary: '狀態由 G 變更為 CL',
      },
    ],
    mainProducts: '自行車輪胎、內胎、防刺帶',
  },

  // ──────────────────────────────────────────────────────────
  // 12. 三川 2025 - G 狀態（已繳，部分資料）
  // ──────────────────────────────────────────────────────────
  {
    id: 12,
    year: 2025,
    vendorName: '三川',
    vendorCode: '0001000003',
    status: 'G',
    isPaid: true,
    effectiveDate: '2025/01/20',
    expiryDate: '2026/01/20',
    insuranceCompanyZh: '第一產物保險股份有限公司',
    insuranceCompanyEn: 'First Insurance Co., Ltd.',
    retroactiveDate: '',
    factories: ['GTM', 'GCK', 'GCM', 'GCT', 'GHM'],
    sameAsLastYear: true,
    insuranceType: ['CGL', 'PLG', 'PLI'],
    claimBasis: 'A',
    creditRating: 'AA',
    insuredMaterial: '',
    representative: '鄭雅婷',
    notes: '2025年度保單，大型廠商覆蓋五廠，審核中',
    safetyParts: true,
    contractSigned: true,
    greenWave: true,
    oeAttachment: true,
    mou: true,
    humanRightsSurvey: true,
    coversUSA: true,
    giantAsAdditional: true,
    premium: null,
    premiumCurrency: 'USD',
    contractPolicyAmount: null,
    contractPolicyCurrency: 'USD',
    singleIncidentAmount: null,
    singleIncidentCurrency: 'USD',
    standardPolicyAmount: null,
    standardPolicyCurrency: 'USD',
    maxCompensation: null,
    maxCompensationCurrency: 'USD',
    attachments: [{ name: '三川_2025投保申請.pdf' }],
    history: [
      {
        id: 'h-12-1',
        timestamp: '2025-01-07 09:30',
        actor: '鄭雅婷',
        summary: '建立 2025 年度資料，已付保費，等待核保',
      },
      {
        id: 'h-12-2',
        timestamp: '2025-01-09 16:00',
        actor: '林美惠',
        summary: '補充投保險種資訊，確認五廠範圍',
      },
    ],
    mainProducts: '自行車煞車系統、煞車線、碟盤',
  },

  // ──────────────────────────────────────────────────────────
  // 以下為補充至 15 筆資料：
  // ──────────────────────────────────────────────────────────

  // ──────────────────────────────────────────────────────────
  // 13. 三川 2024 - CL 狀態（已繳，截止日正常：2026/01/01）
  // ──────────────────────────────────────────────────────────
  {
    id: 13,
    year: 2024,
    vendorName: '三川',
    vendorCode: '0001000003',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2024/01/20',
    expiryDate: '2026/01/01',
    insuranceCompanyZh: '第一產物保險股份有限公司',
    insuranceCompanyEn: 'First Insurance Co., Ltd.',
    retroactiveDate: '2020/01/20',
    factories: ['GTM', 'GCK', 'GCM', 'GCT', 'GHM'],
    sameAsLastYear: false,
    insuranceType: ['CGL', 'PLG', 'PLI'],
    claimBasis: 'A',
    creditRating: 'AA',
    insuredMaterial: '自行車煞車系統、碟盤、煞車線、煞車把',
    representative: '鄭雅婷',
    notes: '2024年度保單，全險種投保，涵蓋全部五廠',
    safetyParts: true,
    contractSigned: true,
    greenWave: true,
    oeAttachment: true,
    mou: true,
    humanRightsSurvey: true,
    coversUSA: true,
    giantAsAdditional: true,
    premium: 580000,
    premiumCurrency: 'USD',
    contractPolicyAmount: 10000000,
    contractPolicyCurrency: 'USD',
    singleIncidentAmount: 2000000,
    singleIncidentCurrency: 'USD',
    standardPolicyAmount: 5000000,
    standardPolicyCurrency: 'USD',
    maxCompensation: 3000000,
    maxCompensationCurrency: 'USD',
    attachments: [
      { name: '三川_2024保單正本.pdf' },
      { name: '三川_2024保費收據.pdf' },
      { name: '三川_2024美加附約.pdf' },
    ],
    history: [
      {
        id: 'h-13-1',
        timestamp: '2024-01-15 08:30',
        actor: '林美惠',
        summary: '建立 2024 年度資料',
      },
      {
        id: 'h-13-2',
        timestamp: '2024-01-22 10:00',
        actor: '鄭雅婷',
        summary: '上傳保單及美加附約',
      },
      {
        id: 'h-13-3',
        timestamp: '2024-02-05 14:30',
        actor: '鄭雅婷',
        summary: '確認五廠範圍，更新工廠列表',
      },
      {
        id: 'h-13-4',
        timestamp: '2024-03-10 09:00',
        actor: '系統',
        summary: '狀態由 G 變更為 CL（已核准）',
      },
    ],
    mainProducts: '自行車煞車系統、碟盤、煞車線、煞車把手',
  },

  // ──────────────────────────────────────────────────────────
  // 14. 台灣新光 2023 - CL 狀態（已繳，截止日已過）
  // ──────────────────────────────────────────────────────────
  {
    id: 14,
    year: 2023,
    vendorName: '台灣新光',
    vendorCode: '0001000002',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2023/02/01',
    expiryDate: '2024/02/01',
    insuranceCompanyZh: '新光產物保險股份有限公司',
    insuranceCompanyEn: 'Shin Kong Insurance Co., Ltd.',
    retroactiveDate: '2019/02/01',
    factories: ['GTM', 'GEV'],
    sameAsLastYear: false,
    insuranceType: ['CGL'],
    claimBasis: 'A',
    creditRating: 'A',
    insuredMaterial: '自行車輪胎、內胎',
    representative: '吳秋菊',
    notes: '2023年度保單（已到期），當年僅投保CGL',
    safetyParts: false,
    contractSigned: true,
    greenWave: false,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: false,
    coversUSA: false,
    giantAsAdditional: false,
    premium: 120000,
    premiumCurrency: 'TWD',
    contractPolicyAmount: 1800000,
    contractPolicyCurrency: 'TWD',
    singleIncidentAmount: 350000,
    singleIncidentCurrency: 'TWD',
    standardPolicyAmount: 1200000,
    standardPolicyCurrency: 'TWD',
    maxCompensation: 900000,
    maxCompensationCurrency: 'TWD',
    attachments: [
      { name: '台灣新光_2023保單.pdf' },
    ],
    history: [
      {
        id: 'h-14-1',
        timestamp: '2023-01-28 09:00',
        actor: '林美惠',
        summary: '建立 2023 年度資料',
      },
      {
        id: 'h-14-2',
        timestamp: '2023-02-10 10:30',
        actor: '吳秋菊',
        summary: '確認保費，更新保單資訊',
      },
      {
        id: 'h-14-3',
        timestamp: '2023-03-01 09:00',
        actor: '系統',
        summary: '狀態由 G 變更為 CL',
      },
    ],
    mainProducts: '自行車輪胎、內胎',
  },

  // ──────────────────────────────────────────────────────────
  // 15. 速聯 2023 - CL 狀態（已繳，截止日已過）
  // ──────────────────────────────────────────────────────────
  {
    id: 15,
    year: 2023,
    vendorName: '速聯',
    vendorCode: '000100463',
    status: 'CL',
    isPaid: true,
    effectiveDate: '2023/01/13',
    expiryDate: '2024/01/13',
    insuranceCompanyZh: '富邦產物保險股份有限公司',
    insuranceCompanyEn: 'Fubon Insurance Co., Ltd.',
    retroactiveDate: '2019/01/13',
    factories: ['GTM', 'GCK'],
    sameAsLastYear: false,
    insuranceType: ['CGL', 'PLI'],
    claimBasis: 'A',
    creditRating: 'A+',
    insuredMaterial: '自行車傳動系統（飛輪、曲柄、變速器）',
    representative: '陳志明',
    notes: '2023年度保單（已到期），含美加投保',
    safetyParts: true,
    contractSigned: true,
    greenWave: false,
    oeAttachment: false,
    mou: false,
    humanRightsSurvey: true,
    coversUSA: true,
    giantAsAdditional: true,
    premium: 285000,
    premiumCurrency: 'USD',
    contractPolicyAmount: 4500000,
    contractPolicyCurrency: 'USD',
    singleIncidentAmount: 900000,
    singleIncidentCurrency: 'USD',
    standardPolicyAmount: 2500000,
    standardPolicyCurrency: 'USD',
    maxCompensation: 1800000,
    maxCompensationCurrency: 'USD',
    attachments: [
      { name: '速聯_2023保單正本.pdf' },
      { name: '速聯_2023保費收據.pdf' },
    ],
    history: [
      {
        id: 'h-15-1',
        timestamp: '2023-01-05 09:00',
        actor: '林美惠',
        summary: '建立 2023 年度資料',
      },
      {
        id: 'h-15-2',
        timestamp: '2023-01-15 11:00',
        actor: '陳志明',
        summary: '上傳保單及保費收據',
      },
      {
        id: 'h-15-3',
        timestamp: '2023-02-01 09:00',
        actor: '系統',
        summary: '狀態由 G 變更為 CL',
      },
    ],
    mainProducts: '自行車傳動組件、飛輪、曲柄、變速器',
  },
];
