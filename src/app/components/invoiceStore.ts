// ── 發票查詢共用資料層 ─────────────────────────────────────────────────────────
// 讓「開立發票（InvoiceDetailPage）」與「發票查詢（InvoiceListPage）」共用同一筆記錄

import type { InvoiceDetailRow } from './invoiceDetailData';

// ── 發票狀態 ──
export type InvoiceStatus = 'DR' | 'P' | 'B' | 'S' | 'F' | 'H';

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; text: string; border: string }> = {
  DR: { label: '草稿',       bg: 'rgba(145,158,171,0.12)', text: '#637381', border: 'rgba(145,158,171,0.3)' },
  P:  { label: '資料處理中', bg: 'rgba(0,94,184,0.10)',    text: '#005eb8', border: 'rgba(0,94,184,0.3)'   },
  B:  { label: '採購確認中', bg: 'rgba(255,171,0,0.12)',   text: '#b76e00', border: 'rgba(255,171,0,0.3)'  },
  S:  { label: '轉發票成功', bg: 'rgba(34,197,94,0.12)',   text: '#118d57', border: 'rgba(34,197,94,0.3)'  },
  F:  { label: '轉發票失敗', bg: 'rgba(255,86,48,0.12)',   text: '#ff5630', border: 'rgba(255,86,48,0.3)'  },
  H:  { label: '線下處理',   bg: 'rgba(99,115,129,0.12)', text: '#1c252e', border: 'rgba(99,115,129,0.3)' },
};

// ── 歷程記錄 ──
export interface HistoryEntry {
  timestamp: string;       // YYYY/MM/DD HH:mm:ss
  action: string;          // 操作類型：'建立' | '暫存' | '確認開立' | …
  operator: string;        // 操作者（目前用預設值）
  changes: string;         // 變更摘要（例如「發票號碼: 12345→123456」）
}

// ── 發票記錄型別 ──
export interface InvoiceRecord {
  id: string;              // 系統流水編號（INV-YYYYMMDD-XXXX）
  invoiceNo: string;       // 發票號碼（必填）
  invoiceDate: string;     // 發票日期（YYYY/MM/DD）
  status: InvoiceStatus;
  buyerName: string;       // 買方
  invoiceType: string;     // 發票聯式（21/22/25；海外買方留空）
  taxRate: string;         // 稅率（"5" | "0" | "10"）
  taxCode: string;         // 稅碼（由字軌主檔推算，V0/V1；推算失敗留空）
  taxAmount: number;       // 發票稅額
  totalAmount: number;     // 發票總額（含稅）
  currency: string;        // 幣別（TWD / USD / EUR…）
  bondedType: string;      // 保稅廠別
  vendorName: string;      // 廠商名稱(編號)
  execNote: string;        // 執行備註（DR 狀態固定空白）
  detailCount: number;     // 明細數量
  createdAt: string;       // 建立時間（YYYY/MM/DD HH:mm）
  rows: InvoiceDetailRow[];// 發票明細列
  history: HistoryEntry[]; // 操作歷程
}

// ── localStorage key ──
const STORAGE_KEY = 'invoiceRecords';

// ── 讀取 ──
export function loadInvoiceRecords(): InvoiceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as InvoiceRecord[];
  } catch { /* ignore */ }
  return [];
}

// ── 寫入 ──
export function saveInvoiceRecords(records: InvoiceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch { /* ignore */ }
}

// ── 新增單筆（暫存 / 確認開立）──
export function appendInvoiceRecord(record: InvoiceRecord): void {
  const existing = loadInvoiceRecords();
  // 若已有相同 id 則更新，否則新增
  const idx = existing.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    existing[idx] = record;
  } else {
    existing.push(record);
  }
  saveInvoiceRecords(existing);
}

// ── 刪除單筆 ──
export function deleteInvoiceRecord(id: string): void {
  const existing = loadInvoiceRecords();
  saveInvoiceRecords(existing.filter(r => r.id !== id));
}

// ── 產生流水編號 ──
export function generateInvoiceId(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const ms = String(now.getTime()).slice(-4);
  return `INV-${dateStr}-${ms}`;
}

// ── 稅碼推算：從字軌主檔比對 ──
// 取發票號碼前 2 碼（字軌）+ 發票日期年月，查 TRACK_DATA
import { TRACK_DATA } from './invoiceSettingsStore';

export function resolveTaxCode(invoiceNo: string, invoiceDate: string): string | null {
  if (!invoiceNo || !invoiceDate) return null;
  const track = invoiceNo.slice(0, 2).toUpperCase();
  // invoiceDate 格式：YYYY/MM/DD 或 YYYY-MM-DD
  const parts = invoiceDate.replace(/-/g, '/').split('/');
  if (parts.length < 2) return null;
  const year  = parts[0];
  const month = parts[1].padStart(2, '0');
  const found = TRACK_DATA.find(r => r.year === year && r.month === month && r.track === track);
  return found ? found.taxCode : null;
}


// ── Mock 資料（含 6 種狀態，供 Tab 計數展示）──
export const MOCK_INVOICE_RECORDS: InvoiceRecord[] = [
  // DR 草稿 × 3
  {
    id: 'INV-20250501-0001', invoiceNo: 'HT0000001', invoiceDate: '2025/01/15',
    status: 'DR', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 247500,
    currency: 'TWD', bondedType: '非保稅', vendorName: '華銘(0001000641)',
    execNote: '', detailCount: 2, createdAt: '2025/01/15 10:30', rows: [], history: [],
  },
  {
    id: 'INV-20250502-0002', invoiceNo: 'HU0000005', invoiceDate: '2025/01/20',
    status: 'DR', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '22', taxRate: '5', taxCode: 'V0', taxAmount: 6300, totalAmount: 132300,
    currency: 'TWD', bondedType: '非保稅', vendorName: '佳承精密(0001000045)',
    execNote: '', detailCount: 1, createdAt: '2025/01/20 14:05', rows: [], history: [],
  },
  {
    id: 'INV-20250503-0003', invoiceNo: 'HT0000010', invoiceDate: '2025/02/08',
    status: 'DR', buyerName: '巨大機械工業股份有限公司幼獅分公司(29183302)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 89600,
    currency: 'TWD', bondedType: '保稅', vendorName: '久廣精密(0001000053)',
    execNote: '', detailCount: 3, createdAt: '2025/02/08 09:15', rows: [], history: [],
  },
  // P 資料處理中 × 3
  {
    id: 'INV-20250504-0004', invoiceNo: 'JA0000001', invoiceDate: '2025/03/05',
    status: 'P', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '5', taxCode: 'V1', taxAmount: 31500, totalAmount: 661500,
    currency: 'TWD', bondedType: '非保稅', vendorName: '華銘(0001000641)',
    execNote: '回傳SAP中', detailCount: 4, createdAt: '2025/03/05 11:00', rows: [], history: [],
  },
  {
    id: 'INV-20250505-0005', invoiceNo: 'JB0000003', invoiceDate: '2025/03/12',
    status: 'P', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '25', taxRate: '5', taxCode: 'V1', taxAmount: 8500, totalAmount: 178500,
    currency: 'TWD', bondedType: '非保稅', vendorName: '金盛元工業(0001000059)',
    execNote: '回傳SAP中', detailCount: 2, createdAt: '2025/03/12 13:30', rows: [], history: [],
  },
  {
    id: 'INV-20250506-0006', invoiceNo: 'JA0000008', invoiceDate: '2025/03/20',
    status: 'P', buyerName: '巨大機械工業股份有限公司幼獅分公司(29183302)',
    invoiceType: '21', taxRate: '5', taxCode: 'V1', taxAmount: 14000, totalAmount: 294000,
    currency: 'TWD', bondedType: '非保稅', vendorName: '佳承精密(0001000045)',
    execNote: '回傳SAP中', detailCount: 1, createdAt: '2025/03/20 16:45', rows: [], history: [],
  },
  // B 採購確認中 × 2
  {
    id: 'INV-20250507-0007', invoiceNo: 'HW0000002', invoiceDate: '2025/04/10',
    status: 'B', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 356000,
    currency: 'TWD', bondedType: '保稅', vendorName: '久廣精密(0001000053)',
    execNote: '價差確認中', detailCount: 5, createdAt: '2025/04/10 10:20', rows: [], history: [],
  },
  {
    id: 'INV-20250508-0008', invoiceNo: 'HX0000001', invoiceDate: '2025/04/18',
    status: 'B', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '22', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 124800,
    currency: 'TWD', bondedType: '保稅', vendorName: '華銘(0001000641)',
    execNote: '採購確認中', detailCount: 2, createdAt: '2025/04/18 14:00', rows: [], history: [],
  },
  // S 轉發票成功 × 3
  {
    id: 'INV-20250509-0009', invoiceNo: 'HY0000001', invoiceDate: '2025/05/08',
    status: 'S', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 508000,
    currency: 'TWD', bondedType: '保稅', vendorName: '華銘(0001000641)',
    execNote: '回傳SAP成功', detailCount: 6, createdAt: '2025/05/08 09:00', rows: [], history: [],
  },
  {
    id: 'INV-20250510-0010', invoiceNo: 'JC0000002', invoiceDate: '2025/05/15',
    status: 'S', buyerName: '巨大機械工業股份有限公司幼獅分公司(29183302)',
    invoiceType: '25', taxRate: '5', taxCode: 'V1', taxAmount: 22000, totalAmount: 462000,
    currency: 'TWD', bondedType: '非保稅', vendorName: '佳承精密(0001000045)',
    execNote: '回傳SAP成功', detailCount: 3, createdAt: '2025/05/15 11:30', rows: [], history: [],
  },
  {
    id: 'INV-20250511-0011', invoiceNo: 'HZ0000001', invoiceDate: '2025/06/03',
    status: 'S', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 195000,
    currency: 'USD', bondedType: '保稅', vendorName: '金盛元工業(0001000059)',
    execNote: '回傳SAP成功', detailCount: 2, createdAt: '2025/06/03 15:00', rows: [], history: [],
  },
  // F 轉發票失敗 × 2
  {
    id: 'INV-20250512-0012', invoiceNo: 'HV0000003', invoiceDate: '2025/02/20',
    status: 'F', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 276000,
    currency: 'TWD', bondedType: '保稅', vendorName: '華銘(0001000641)',
    execNote: '回傳SAP失敗', detailCount: 20, createdAt: '2025/02/20 10:00', history: [],
    rows: [
      { id: 1,  acceptNo: 'ACC-2025-0101', acceptSeq: '01', orderNo: 'B0000034559-10', materialNo: '3301-STM0641-J01', acceptQty: 50,  acceptPrice: 1200, unitPrice: '1200', priceModified: false, itemTax: 0, subtotalExTax: 60000,  subtotalInTax: 60000,  productName: 'CONTACT SL OD2 STEM 110MM -6DEG' },
      { id: 2,  acceptNo: 'ACC-2025-0101', acceptSeq: '02', orderNo: 'B0000034559-20', materialNo: '4401-WHL0641-K01', acceptQty: 20,  acceptPrice: 4500, unitPrice: '4500', priceModified: false, itemTax: 0, subtotalExTax: 90000,  subtotalInTax: 90000,  productName: 'SLR 1 42 DISC WHEELSYSTEM FRONT 12X100' },
      { id: 3,  acceptNo: 'ACC-2025-0102', acceptSeq: '01', orderNo: 'B0000034559-30', materialNo: '5501-BRK0641-B01', acceptQty: 30,  acceptPrice: 1350, unitPrice: '1350', priceModified: false, itemTax: 0, subtotalExTax: 40500,  subtotalInTax: 40500,  productName: 'SHIMANO BR-R8170 ULTEGRA CALIPER FRONT' },
      { id: 4,  acceptNo: 'ACC-2025-0102', acceptSeq: '02', orderNo: 'B0000034559-40', materialNo: '6601-CHN0641-B02', acceptQty: 100, acceptPrice: 290,  unitPrice: '290',  priceModified: false, itemTax: 0, subtotalExTax: 29000,  subtotalInTax: 29000,  productName: 'SHIMANO CN-HG701 11-SPEED CHAIN' },
      { id: 5,  acceptNo: 'ACC-2025-0103', acceptSeq: '01', orderNo: 'B0000034559-50', materialNo: '7701-CST0641-B03', acceptQty: 60,  acceptPrice: 920,  unitPrice: '920',  priceModified: false, itemTax: 0, subtotalExTax: 55200,  subtotalInTax: 55200,  productName: 'SHIMANO CS-R8100 12-SPEED 11-30T' },
      { id: 6,  acceptNo: 'ACC-2025-0103', acceptSeq: '02', orderNo: 'B0000034559-60', materialNo: '2201-FRM0641-B04', acceptQty: 10,  acceptPrice: 8500, unitPrice: '8500', priceModified: false, itemTax: 0, subtotalExTax: 85000,  subtotalInTax: 85000,  productName: 'DEFY ADVANCED PRO FRAME XL CARBON/BLACK' },
      { id: 7,  acceptNo: 'ACC-2025-0104', acceptSeq: '01', orderNo: 'B0000034560-10', materialNo: '1101-HDB0641-C01', acceptQty: 40,  acceptPrice: 650,  unitPrice: '650',  priceModified: false, itemTax: 0, subtotalExTax: 26000,  subtotalInTax: 26000,  productName: 'GIANT CONTACT SL HANDLEBAR 420MM' },
      { id: 8,  acceptNo: 'ACC-2025-0104', acceptSeq: '02', orderNo: 'B0000034560-20', materialNo: '8801-SAD0641-C02', acceptQty: 25,  acceptPrice: 1800, unitPrice: '1800', priceModified: false, itemTax: 0, subtotalExTax: 45000,  subtotalInTax: 45000,  productName: 'FIZIK ARIONE R3 SADDLE ROAD 142MM BLACK' },
      { id: 9,  acceptNo: 'ACC-2025-0105', acceptSeq: '01', orderNo: 'B0000034560-30', materialNo: '9901-PED0641-D01', acceptQty: 80,  acceptPrice: 420,  unitPrice: '420',  priceModified: false, itemTax: 0, subtotalExTax: 33600,  subtotalInTax: 33600,  productName: 'SHIMANO PD-R9100 DURA-ACE PEDALS' },
      { id: 10, acceptNo: 'ACC-2025-0105', acceptSeq: '02', orderNo: 'B0000034560-40', materialNo: '3302-SCR0641-D02', acceptQty: 200, acceptPrice: 180,  unitPrice: '180',  priceModified: false, itemTax: 0, subtotalExTax: 36000,  subtotalInTax: 36000,  productName: 'TACX SCREW M5X12 BOTTLE CAGE BOLT SS' },
      { id: 11, acceptNo: 'ACC-2025-0106', acceptSeq: '01', orderNo: 'B0000034561-10', materialNo: '4402-TYR0641-E01', acceptQty: 120, acceptPrice: 350,  unitPrice: '350',  priceModified: false, itemTax: 0, subtotalExTax: 42000,  subtotalInTax: 42000,  productName: 'MAXXIS REFUSE 700X28C FOLDING TIRE BLACK' },
      { id: 12, acceptNo: 'ACC-2025-0106', acceptSeq: '02', orderNo: 'B0000034561-20', materialNo: '5502-TUB0641-E02', acceptQty: 120, acceptPrice: 260,  unitPrice: '260',  priceModified: false, itemTax: 0, subtotalExTax: 31200,  subtotalInTax: 31200,  productName: 'SCHWALBE INNER TUBE 700X28-32 PRESTA' },
      { id: 13, acceptNo: 'ACC-2025-0107', acceptSeq: '01', orderNo: 'B0000034561-30', materialNo: '6602-REM0641-F01', acceptQty: 15,  acceptPrice: 2200, unitPrice: '2200', priceModified: false, itemTax: 0, subtotalExTax: 33000,  subtotalInTax: 33000,  productName: 'GIANT CONDUCT SL REAR MECH 12 SPEED' },
      { id: 14, acceptNo: 'ACC-2025-0107', acceptSeq: '02', orderNo: 'B0000034561-40', materialNo: '7702-FEM0641-F02', acceptQty: 15,  acceptPrice: 2100, unitPrice: '2100', priceModified: false, itemTax: 0, subtotalExTax: 31500,  subtotalInTax: 31500,  productName: 'GIANT CONDUCT SL FRONT MECH 12 SPEED' },
      { id: 15, acceptNo: 'ACC-2025-0108', acceptSeq: '01', orderNo: 'B0000034562-10', materialNo: '2202-BRK0641-G01', acceptQty: 30,  acceptPrice: 3200, unitPrice: '3200', priceModified: false, itemTax: 0, subtotalExTax: 96000,  subtotalInTax: 96000,  productName: 'GIANT CONDUCT SL HYDRAULIC BRAKE SET' },
      { id: 16, acceptNo: 'ACC-2025-0108', acceptSeq: '02', orderNo: 'B0000034562-20', materialNo: '1102-LVR0641-G02', acceptQty: 30,  acceptPrice: 1100, unitPrice: '1100', priceModified: false, itemTax: 0, subtotalExTax: 33000,  subtotalInTax: 33000,  productName: 'SHIMANO ST-R8170 ULTEGRA LEVER RIGHT' },
      { id: 17, acceptNo: 'ACC-2025-0109', acceptSeq: '01', orderNo: 'B0000034562-30', materialNo: '8802-SPR0641-H01', acceptQty: 50,  acceptPrice: 480,  unitPrice: '480',  priceModified: false, itemTax: 0, subtotalExTax: 24000,  subtotalInTax: 24000,  productName: 'SHIMANO SM-RT86 DEORE XT ROTOR 160MM' },
      { id: 18, acceptNo: 'ACC-2025-0109', acceptSeq: '02', orderNo: 'B0000034562-40', materialNo: '9902-BBT0641-H02', acceptQty: 40,  acceptPrice: 720,  unitPrice: '720',  priceModified: false, itemTax: 0, subtotalExTax: 28800,  subtotalInTax: 28800,  productName: 'SHIMANO BB-RS500 THREADED BOTTOM BRACKET' },
      { id: 19, acceptNo: 'ACC-2025-0110', acceptSeq: '01', orderNo: 'B0000034563-10', materialNo: '3303-CAB0641-I01', acceptQty: 100, acceptPrice: 95,   unitPrice: '95',   priceModified: false, itemTax: 0, subtotalExTax: 9500,   subtotalInTax: 9500,   productName: 'JAGWIRE PRO BRAKE CABLE KIT ROAD PRO S' },
      { id: 20, acceptNo: 'ACC-2025-0110', acceptSeq: '02', orderNo: 'B0000034563-20', materialNo: '4403-GRP0641-I02', acceptQty: 80,  acceptPrice: 550,  unitPrice: '550',  priceModified: false, itemTax: 0, subtotalExTax: 44000,  subtotalInTax: 44000,  productName: 'LIZARD SKINS DSP 3.2MM HANDLEBAR TAPE BLACK' },
    ],
  },
  {
    id: 'INV-20250513-0013', invoiceNo: 'JB0000007', invoiceDate: '2025/03/25',
    status: 'F', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '22', taxRate: '5', taxCode: 'V1', taxAmount: 4750, totalAmount: 99750,
    currency: 'TWD', bondedType: '非保稅', vendorName: '久廣精密(0001000053)',
    execNote: '回傳SAP失敗', detailCount: 1, createdAt: '2025/03/25 16:00', rows: [], history: [],
  },
  // H 線下處理 × 2
  {
    id: 'INV-20250514-0014', invoiceNo: 'GT0000001', invoiceDate: '2024/01/10',
    status: 'H', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 430000,
    currency: 'TWD', bondedType: '保稅', vendorName: '華銘(0001000641)',
    execNote: '改線下處理', detailCount: 4, createdAt: '2024/01/10 09:30', rows: [], history: [],
  },
  {
    id: 'INV-20250515-0015', invoiceNo: 'IA0000002', invoiceDate: '2024/03/15',
    status: 'H', buyerName: '巨大機械工業股份有限公司幼獅分公司(29183302)',
    invoiceType: '25', taxRate: '5', taxCode: 'V1', taxAmount: 9800, totalAmount: 205800,
    currency: 'TWD', bondedType: '非保稅', vendorName: '佳承精密(0001000045)',
    execNote: '線下開立完成', detailCount: 2, createdAt: '2024/03/15 14:20', rows: [], history: [],
  },
];

// ── 初始化：若 localStorage 無資料則寫入 mock 資料 ──
export function initInvoiceStore(): void {
  const existing = loadInvoiceRecords();
  if (existing.length === 0) {
    saveInvoiceRecords(MOCK_INVOICE_RECORDS);
  }
}
