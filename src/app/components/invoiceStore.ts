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

export function resolveTaxCode(invoiceNo: string, invoiceDate: string): string {
  if (!invoiceNo || !invoiceDate) return '';
  const track = invoiceNo.slice(0, 2).toUpperCase();
  // invoiceDate 格式：YYYY/MM/DD 或 YYYY-MM-DD
  const parts = invoiceDate.replace(/-/g, '/').split('/');
  if (parts.length < 2) return '';
  const year  = parts[0];
  const month = parts[1].padStart(2, '0');
  const found = TRACK_DATA.find(r => r.year === year && r.month === month && r.track === track);
  return found ? found.taxCode : '';
}

// ── Mock 資料（含 6 種狀態，供 Tab 計數展示）──
export const MOCK_INVOICE_RECORDS: InvoiceRecord[] = [
  // DR 草稿 × 3
  {
    id: 'INV-20250501-0001', invoiceNo: 'HT0000001', invoiceDate: '2025/01/15',
    status: 'DR', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 247500,
    currency: 'TWD', bondedType: '非保稅', vendorName: '華銘(0001000641)',
    execNote: '', detailCount: 2, createdAt: '2025/01/15 10:30', rows: [],
  },
  {
    id: 'INV-20250502-0002', invoiceNo: 'HU0000005', invoiceDate: '2025/01/20',
    status: 'DR', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '22', taxRate: '5', taxCode: 'V0', taxAmount: 6300, totalAmount: 132300,
    currency: 'TWD', bondedType: '非保稅', vendorName: '佳承精密(0001000045)',
    execNote: '', detailCount: 1, createdAt: '2025/01/20 14:05', rows: [],
  },
  {
    id: 'INV-20250503-0003', invoiceNo: 'HT0000010', invoiceDate: '2025/02/08',
    status: 'DR', buyerName: '巨大機械工業股份有限公司幼獅分公司(29183302)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 89600,
    currency: 'TWD', bondedType: '保稅', vendorName: '久廣精密(0001000053)',
    execNote: '', detailCount: 3, createdAt: '2025/02/08 09:15', rows: [],
  },
  // P 資料處理中 × 3
  {
    id: 'INV-20250504-0004', invoiceNo: 'JA0000001', invoiceDate: '2025/03/05',
    status: 'P', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '5', taxCode: 'V1', taxAmount: 31500, totalAmount: 661500,
    currency: 'TWD', bondedType: '非保稅', vendorName: '華銘(0001000641)',
    execNote: '', detailCount: 4, createdAt: '2025/03/05 11:00', rows: [],
  },
  {
    id: 'INV-20250505-0005', invoiceNo: 'JB0000003', invoiceDate: '2025/03/12',
    status: 'P', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '25', taxRate: '5', taxCode: 'V1', taxAmount: 8500, totalAmount: 178500,
    currency: 'TWD', bondedType: '非保稅', vendorName: '金盛元工業(0001000059)',
    execNote: '', detailCount: 2, createdAt: '2025/03/12 13:30', rows: [],
  },
  {
    id: 'INV-20250506-0006', invoiceNo: 'JA0000008', invoiceDate: '2025/03/20',
    status: 'P', buyerName: '巨大機械工業股份有限公司幼獅分公司(29183302)',
    invoiceType: '21', taxRate: '5', taxCode: 'V1', taxAmount: 14000, totalAmount: 294000,
    currency: 'TWD', bondedType: '非保稅', vendorName: '佳承精密(0001000045)',
    execNote: '', detailCount: 1, createdAt: '2025/03/20 16:45', rows: [],
  },
  // B 採購確認中 × 2
  {
    id: 'INV-20250507-0007', invoiceNo: 'HW0000002', invoiceDate: '2025/04/10',
    status: 'B', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 356000,
    currency: 'TWD', bondedType: '保稅', vendorName: '久廣精密(0001000053)',
    execNote: '價差確認中', detailCount: 5, createdAt: '2025/04/10 10:20', rows: [],
  },
  {
    id: 'INV-20250508-0008', invoiceNo: 'HX0000001', invoiceDate: '2025/04/18',
    status: 'B', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '22', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 124800,
    currency: 'TWD', bondedType: '保稅', vendorName: '華銘(0001000641)',
    execNote: '採購確認中', detailCount: 2, createdAt: '2025/04/18 14:00', rows: [],
  },
  // S 轉發票成功 × 3
  {
    id: 'INV-20250509-0009', invoiceNo: 'HY0000001', invoiceDate: '2025/05/08',
    status: 'S', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 508000,
    currency: 'TWD', bondedType: '保稅', vendorName: '華銘(0001000641)',
    execNote: '轉發票成功', detailCount: 6, createdAt: '2025/05/08 09:00', rows: [],
  },
  {
    id: 'INV-20250510-0010', invoiceNo: 'JC0000002', invoiceDate: '2025/05/15',
    status: 'S', buyerName: '巨大機械工業股份有限公司幼獅分公司(29183302)',
    invoiceType: '25', taxRate: '5', taxCode: 'V1', taxAmount: 22000, totalAmount: 462000,
    currency: 'TWD', bondedType: '非保稅', vendorName: '佳承精密(0001000045)',
    execNote: '轉發票成功', detailCount: 3, createdAt: '2025/05/15 11:30', rows: [],
  },
  {
    id: 'INV-20250511-0011', invoiceNo: 'HZ0000001', invoiceDate: '2025/06/03',
    status: 'S', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 195000,
    currency: 'USD', bondedType: '保稅', vendorName: '金盛元工業(0001000059)',
    execNote: '轉發票成功', detailCount: 2, createdAt: '2025/06/03 15:00', rows: [],
  },
  // F 轉發票失敗 × 2
  {
    id: 'INV-20250512-0012', invoiceNo: 'HV0000003', invoiceDate: '2025/02/20',
    status: 'F', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 276000,
    currency: 'TWD', bondedType: '保稅', vendorName: '華銘(0001000641)',
    execNote: 'SAP連線失敗', detailCount: 3, createdAt: '2025/02/20 10:00', rows: [],
  },
  {
    id: 'INV-20250513-0013', invoiceNo: 'JB0000007', invoiceDate: '2025/03/25',
    status: 'F', buyerName: '愛普智科技股份有限公司(83153430)',
    invoiceType: '22', taxRate: '5', taxCode: 'V1', taxAmount: 4750, totalAmount: 99750,
    currency: 'TWD', bondedType: '非保稅', vendorName: '久廣精密(0001000053)',
    execNote: '稅碼錯誤，重新處理中', detailCount: 1, createdAt: '2025/03/25 16:00', rows: [],
  },
  // H 線下處理 × 2
  {
    id: 'INV-20250514-0014', invoiceNo: 'GT0000001', invoiceDate: '2024/01/10',
    status: 'H', buyerName: '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21', taxRate: '0', taxCode: 'V0', taxAmount: 0, totalAmount: 430000,
    currency: 'TWD', bondedType: '保稅', vendorName: '華銘(0001000641)',
    execNote: '改線下處理', detailCount: 4, createdAt: '2024/01/10 09:30', rows: [],
  },
  {
    id: 'INV-20250515-0015', invoiceNo: 'IA0000002', invoiceDate: '2024/03/15',
    status: 'H', buyerName: '巨大機械工業股份有限公司幼獅分公司(29183302)',
    invoiceType: '25', taxRate: '5', taxCode: 'V1', taxAmount: 9800, totalAmount: 205800,
    currency: 'TWD', bondedType: '非保稅', vendorName: '佳承精密(0001000045)',
    execNote: '線下開立完成', detailCount: 2, createdAt: '2024/03/15 14:20', rows: [],
  },
];

// ── 初始化：若 localStorage 無資料則寫入 mock 資料 ──
export function initInvoiceStore(): void {
  const existing = loadInvoiceRecords();
  if (existing.length === 0) {
    saveInvoiceRecords(MOCK_INVOICE_RECORDS);
  }
}
