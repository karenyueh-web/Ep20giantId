// ── 開立發票明細頁：型別 + 常數 + 稅率選項 ─────────────────────────────────

import type { InvoiceAcceptRow } from './invoiceCreateData';

// ── 發票明細列（包含計算欄位）──
export interface InvoiceDetailRow {
  id: number;
  acceptNo: string;       // 驗收單號
  acceptSeq: string;      // 驗收項次
  orderNo: string;        // 訂單號碼
  materialNo: string;     // 料號
  acceptQty: number;      // 驗收量
  acceptPrice: number;    // 驗收價
  unitPrice: string;      // 單價（可手動輸入）
  itemTax: number;        // 單項稅額（自動計算）
  subtotalExTax: number;  // 未稅小計（自動計算）
  subtotalInTax: number;  // 含稅小計（自動計算）
  productName: string;    // 品名（= specification）
}

// ── Props ──
export interface InvoiceDetailPageProps {
  selectedRows: InvoiceAcceptRow[];
  onClose: () => void;
  bondedType: string;   // '保稅' | '非保稅'
  currency: string;     // 'TWD' | 'USD' 等
}

// ── 稅率選項 ──
export const TAX_RATE_OPTIONS = [
  { value: '',     label: '請選稅額' },
  { value: '0.05', label: '5%' },
  { value: '0',    label: '0% (零稅率)' },
  { value: 'free', label: '免稅' },
];

// ── 發票聯式選項 ──
export const INVOICE_TYPE_OPTIONS = [
  { value: '21', label: '21 三聯式、電子計算機統一發票' },
  { value: '22', label: '22 二聯式、收銀機統一發票' },
  { value: '25', label: '25 三聯式、收銀機統一發票' },
];

// ── 從驗收資料轉換為發票明細列 ──
export function toInvoiceDetailRows(rows: InvoiceAcceptRow[]): InvoiceDetailRow[] {
  return rows.map((r, idx) => ({
    id: r.id,
    acceptNo: r.acceptNo,
    acceptSeq: r.acceptSeq,
    orderNo: `${r.orderNo}-${r.orderSeq}`,
    materialNo: r.materialNo,
    acceptQty: r.acceptQty,
    acceptPrice: 0,       // 驗收價，目前 mock 資料未帶，預設 0
    unitPrice: '',         // 使用者手動輸入
    itemTax: 0,
    subtotalExTax: 0,
    subtotalInTax: 0,
    productName: r.specification || '',
  }));
}

// ── 重新計算單列金額 ──
export function recalcRow(row: InvoiceDetailRow, taxRate: number): InvoiceDetailRow {
  const price = parseFloat(row.unitPrice) || 0;
  const subtotalExTax = row.acceptQty * price;
  const itemTax = Math.round(subtotalExTax * taxRate);
  const subtotalInTax = subtotalExTax + itemTax;
  return { ...row, subtotalExTax, itemTax, subtotalInTax };
}
