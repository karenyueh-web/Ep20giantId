// vendorData.ts — 廠商資料定義（共用資料源）
// 原始資料來自 VendorManagementTable.tsx，抽出至此以供多處引用

export interface VendorData {
  id: number;
  code: string;
  name: string;
  fullName: string;
  phone: string;
  address: string;
  salesCount: number;
  mainProducts: string;
  salesNames: string[];
}

export const MOCK_VENDORS: VendorData[] = [
  { id: 1,  code: '0001000001', name: '久廣實業',   fullName: '久廣實業股份有限公司',         phone: '+886-37-756558',  address: '苗栗縣通霄鎮中正路73號',          salesCount: 3, mainProducts: '單梁/剪叉/吊车/把手/盤車附件', salesNames: ['張淑玲', '王小明', '品保'] },
  { id: 2,  code: '0001000002', name: '永豐金屬',   fullName: '永豐金屬工業股份有限公司',     phone: '+886-4-23581234', address: '台中市西屯區工業區一路88號',        salesCount: 2, mainProducts: '鋼材/五金零件/機械零組件',     salesNames: ['李四', '王小明'] },
  { id: 3,  code: '0001000003', name: '立德科技',   fullName: '立德科技股份有限公司',         phone: '+886-2-26581111', address: '新北市汐止區新台五路一段99號',      salesCount: 4, mainProducts: '電子零件/控制器/感測器',      salesNames: ['張淑玲', '李四', '陳品保', '林業務'] },
  { id: 4,  code: '0001000004', name: '鴻海精密',   fullName: '鴻海精密工業股份有限公司',     phone: '+886-2-22683466', address: '新北市土城區自由街2號',            salesCount: 5, mainProducts: '精密模具/塑膠射出/組裝代工', salesNames: ['王小明', '陳品保', '林業務', '張淑玲', '李四'] },
  { id: 5,  code: '0001000005', name: '台達電子',   fullName: '台達電子工業股份有限公司',     phone: '+886-3-3591234',  address: '桃園市龜山區工業一路8號',          salesCount: 3, mainProducts: '電源供應器/風扇/散熱模組',   salesNames: ['陳品保', '林業務', '張淑玲'] },
  { id: 6,  code: '0001000006', name: '億光電子',   fullName: '億光電子工業股份有限公司',     phone: '+886-2-26989898', address: '新北市土城區中央路四段75號',       salesCount: 2, mainProducts: 'LED/光電元件/照明模組',      salesNames: ['李四', '王小明'] },
  { id: 7,  code: '0001000007', name: '正隆紙業',   fullName: '正隆股份有限公司',             phone: '+886-2-27015388', address: '台北市大安區敦化南路二段207號',    salesCount: 1, mainProducts: '包裝紙箱/工業用紙',          salesNames: ['林業務'] },
  { id: 8,  code: '0001000008', name: '南亞塑膠',   fullName: '南亞塑膠工業股份有限公司',     phone: '+886-2-27178888', address: '台北市松山區敦化北路201號',        salesCount: 4, mainProducts: '塑膠原料/塑膠加工品',        salesNames: ['張淑玲', '王小明', '陳品保', '李四'] },
  { id: 9,  code: '0001000009', name: '台塑企業',   fullName: '台灣塑膠工業股份有限公司',     phone: '+886-2-27122211', address: '台北市松山區敦化北路201號',        salesCount: 2, mainProducts: '石化原料/塑膠製品',          salesNames: ['林業務', '陳品保'] },
  { id: 10, code: '0001000010', name: '華碩電腦',   fullName: '華碩電腦股份有限公司',         phone: '+886-2-28943447', address: '台北市北投區立功街112號',          salesCount: 3, mainProducts: '電腦零組件/主機板/顯示卡',  salesNames: ['王小明', '張淑玲', '李四'] },
  { id: 11, code: '0001000011', name: '友達光電',   fullName: '友達光電股份有限公司',         phone: '+886-3-5008800',  address: '新竹科學園區力行二路1號',          salesCount: 4, mainProducts: '液晶面板/顯示器模組',        salesNames: ['陳品保', '林業務', '張淑玲', '王小明'] },
  { id: 12, code: '0001000641', name: '華銘',       fullName: '信隆車料工業股份有限公司',     phone: '+886-4-22222222', address: '台中市大甲區順帆路19號',          salesCount: 2, mainProducts: '車料/零件',                   salesNames: ['王小明', '陳品保'] },
  { id: 13, code: '0001000045', name: '佳承精密',   fullName: '佳承精密工業股份有限公司',     phone: '+886-2-33333333', address: '新北市新店區北新路三段200號',      salesCount: 1, mainProducts: '精密零件',                    salesNames: ['李四'] },
  { id: 14, code: '0001000053', name: '久廣精密',   fullName: '久廣精密工業股份有限公司',     phone: '+886-7-44444444', address: '高雄市前鎮區中山三路12號',         salesCount: 2, mainProducts: '精密零件',                    salesNames: ['林業務', '張淑玲'] },
  { id: 15, code: '0001000059', name: '金盛元工業', fullName: '金盛元工業股份有限公司',       phone: '+886-4-55555555', address: '彰化縣員林市員東路一段500號',      salesCount: 1, mainProducts: '零件',                        salesNames: ['王小明'] },
  { id: 16, code: '0001000012', name: '台灣製造',   fullName: '台灣製造工業股份有限公司',     phone: '+886-4-66666666', address: '台中市西屯區工業區一路100號',      salesCount: 1, mainProducts: '零件',                        salesNames: ['陳品保'] },
  { id: 17, code: '0001000046', name: '速聯國際',   fullName: '速聯國際股份有限公司',         phone: '+886-3-77777777', address: '桃園市龜山區文化二路29號',         salesCount: 1, mainProducts: '零件',                        salesNames: ['李四'] },
  { id: 18, code: '000100463',  name: '速聯',       fullName: '速聯(股)公司',                 phone: '+886-3-88888888', address: '桃園市龜山區工業三路99號',         salesCount: 1, mainProducts: '變速器/零件',                 salesNames: ['王小明'] },
  { id: 19, code: '0001000099', name: 'ABC科技',    fullName: 'ABC科技股份有限公司',           phone: '+886-2-27001234', address: '台北市中山區南京東路三段168號',    salesCount: 1, mainProducts: '資訊軟體/系統整合/技術服務', salesNames: ['David Kao'] },
];
