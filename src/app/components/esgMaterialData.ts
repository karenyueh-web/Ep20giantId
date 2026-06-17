// ── ESG 材料維護 資料模型 ──────────────────────────────────────────────────────

export interface EsgMaterialRecord {
  id: number;
  /** 材料名（繁中） */
  nameTw: string;
  /** 材料名（簡中） */
  nameCn: string;
  /** 材料名（英文） */
  nameEn: string;
  /** 碳排量（kg CO₂e） */
  carbonEmission: number;
  /** 建檔者（姓名） */
  createdBy: string;
  /** 建檔日期（YYYY/MM/DD） */
  createdAt: string;
  /** 最後修改者 */
  updatedBy?: string;
  /** 最後修改日期 */
  updatedAt?: string;
}

// ── Mock 資料 ─────────────────────────────────────────────────────────────────
export const MOCK_ESG_MATERIALS: EsgMaterialRecord[] = [
  {
    id: 1,
    nameTw: '水',
    nameCn: '水',
    nameEn: 'water',
    carbonEmission: 1.2,
    createdBy: 'Allen Zou 郝芳筆',
    createdAt: '2024/03/20',
  },
  {
    id: 2,
    nameTw: '不鏽鋼',
    nameCn: '不锈钢',
    nameEn: 'Stainless steel',
    carbonEmission: 1.2,
    createdBy: 'Allen Zou 郝芳筆',
    createdAt: '2024/03/20',
  },
  {
    id: 3,
    nameTw: '鑄鐵或生鐵',
    nameCn: '铸铁或生铁',
    nameEn: 'cast iron or pig iron',
    carbonEmission: 1.2,
    createdBy: 'Allen Zou 郝芳筆',
    createdAt: '2024/03/20',
  },
  {
    id: 4,
    nameTw: '鉛',
    nameCn: '铅',
    nameEn: 'lead',
    carbonEmission: 1.2,
    createdBy: 'Allen Zou 郝芳筆',
    createdAt: '2024/03/20',
  },
  {
    id: 5,
    nameTw: '鉑',
    nameCn: '铂',
    nameEn: 'platinum',
    carbonEmission: 1.2,
    createdBy: 'Allen Zou 郝芳筆',
    createdAt: '2024/03/20',
  },
  {
    id: 6,
    nameTw: '鋁',
    nameCn: '铝',
    nameEn: 'aluminum',
    carbonEmission: 8.24,
    createdBy: 'Karen Yueh',
    createdAt: '2024/04/01',
  },
  {
    id: 7,
    nameTw: '銅',
    nameCn: '铜',
    nameEn: 'copper',
    carbonEmission: 3.05,
    createdBy: 'Karen Yueh',
    createdAt: '2024/04/01',
  },
  {
    id: 8,
    nameTw: '鋼鐵',
    nameCn: '钢铁',
    nameEn: 'steel',
    carbonEmission: 2.89,
    createdBy: 'Allen Zou 郝芳筆',
    createdAt: '2024/04/15',
  },
  {
    id: 9,
    nameTw: '塑膠（PET）',
    nameCn: '塑料（PET）',
    nameEn: 'Plastic (PET)',
    carbonEmission: 6.00,
    createdBy: 'Karen Yueh',
    createdAt: '2024/04/20',
  },
  {
    id: 10,
    nameTw: '玻璃纖維',
    nameCn: '玻璃纤维',
    nameEn: 'fiberglass',
    carbonEmission: 2.30,
    createdBy: 'Allen Zou 郝芳筆',
    createdAt: '2024/05/01',
  },
  {
    id: 11,
    nameTw: '橡膠',
    nameCn: '橡胶',
    nameEn: 'rubber',
    carbonEmission: 3.18,
    createdBy: 'Karen Yueh',
    createdAt: '2024/05/10',
  },
  {
    id: 12,
    nameTw: '鎳',
    nameCn: '镍',
    nameEn: 'nickel',
    carbonEmission: 11.70,
    createdBy: 'Allen Zou 郝芳筆',
    createdAt: '2024/05/15',
  },
];
