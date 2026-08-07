// giantAccountData.ts — 巨大員工帳號定義（共用資料源）
// 原始資料來自 GiantAccountManagementPageNew.tsx，抽出至此以供多處引用

export interface GiantAccount {
  id: string;
  account: string;
  name: string;
  role: string;
  sapAccount: string;
  purchaseOrg: string;
  purchaseGroup: string;
  status: 'active' | 'inactive';
  email: string;
}

export const mockGiantAccounts: GiantAccount[] = [
  {
    id: '1',
    account: 'G94854',
    name: '李宜璇-Evelyn Lee',
    role: '採購人員',
    sapAccount: 'G94854',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g94854@giant.com',
  },
  {
    id: '2',
    account: 'G00106917',
    name: '李宜瑾-Evelyn Lee',
    role: '品保人員',
    sapAccount: 'G00106917',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P02',
    status: 'active',
    email: 'g00106917@giant.com',
  },
  {
    id: '3',
    account: 'G00108123',
    name: '王小明-Mike Wang',
    role: '採購主管',
    sapAccount: 'G00108123',
    purchaseOrg: '昆山巨大(CN20)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g00108123@giant.com',
  },
  {
    id: '4',
    account: 'G00109456',
    name: '陳美玲-Meilin Chen',
    role: '品保主管',
    sapAccount: 'G00109456',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P03',
    status: 'inactive',
    email: 'g00109456@giant.com',
  },
  {
    id: '5',
    account: 'G00107789',
    name: '林志偉-David Lin',
    role: '系統管理員',
    sapAccount: 'G00107789',
    purchaseOrg: '越南巨大(VN30)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g00107789@giant.com',
  },
  {
    id: '6',
    account: 'G00110234',
    name: '黃雅琪-Yaki Huang',
    role: '採購人員',
    sapAccount: 'G00110234',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P02',
    status: 'active',
    email: 'g00110234@giant.com',
  },
  {
    id: '7',
    account: 'G00111567',
    name: '劉建宏-Jason Liu',
    role: '品保人員',
    sapAccount: 'G00111567',
    purchaseOrg: '昆山巨大(CN20)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g00111567@giant.com',
  },
  {
    id: '8',
    account: 'G00112890',
    name: '蔡宜芳-Fanny Tsai',
    role: '採購人員',
    sapAccount: 'G00112890',
    purchaseOrg: '匈牙利巨大(HU40)',
    purchaseGroup: 'P02',
    status: 'inactive',
    email: 'g00112890@giant.com',
  },
  {
    id: '9',
    account: 'G00113456',
    name: '張嘉玲-Karen Chang',
    role: '採購人員',
    sapAccount: 'G00113456',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g00113456@giant.com',
  },
  {
    id: '10',
    account: 'wen011',
    name: '劉雅雯',
    role: '',
    sapAccount: 'wen011',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: '',
    status: 'active',
    email: 'wen011@giant.com',
  },
  {
    id: '11',
    account: 'cheng012',
    name: '楊偉誠',
    role: '',
    sapAccount: 'cheng012',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: '',
    status: 'active',
    email: 'cheng012@giant.com',
  },
];
