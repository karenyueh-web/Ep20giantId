// ── 開立發票明細頁：型別 + 常數 + 稅率選項 ─────────────────────────────────

import type { InvoiceAcceptRow } from './invoiceCreateData';

// ── Step 1：工廠代碼（WERKS）→ BUPLA（= 營業處）──
const WERKS_TO_BUPLA: Record<string, string> = {
  AIP1: '1400', AIP2: '1400',
  DTC1: '1101', DTE1: '1101', DTG1: '1101', DTI1: '1101',
  GTM1: '1100',
  // GVM1：暫無 BUPLA，以 hardcode 方式處理（見下方）
};

// ── Step 2：營業處（BUPLA）→ 買方名稱 + 統編 ──
const BUPLA_TO_BUYER: Record<string, { name: string; taxId: string }> = {
  '1100': { name: '巨大機械工業股份有限公司',           taxId: '56054251' },
  '1101': { name: '巨大機械工業股份有限公司幼獅分公司', taxId: '29183302' },
  '1400': { name: '愛普智科技股份有限公司',             taxId: '83153430' },
};

// ── 特殊 hardcode（無 BUPLA 對應的工廠）──
const WERKS_HARDCODE: Record<string, string> = {
  GVM1: 'Giant Vietnam Manufacturing Company Limited(3703056241)',
};

// ── 查詢函式：plantCode → 買方顯示字串 ──
export function resolveBuyer(plantCode: string): string {
  // 先查 hardcode
  if (WERKS_HARDCODE[plantCode]) return WERKS_HARDCODE[plantCode];
  // 再走兩段 mapping
  const bupla = WERKS_TO_BUPLA[plantCode];
  if (!bupla) return '';
  const buyer = BUPLA_TO_BUYER[bupla];
  if (!buyer) return '';
  return `${buyer.name}(${buyer.taxId})`;
}

// ── 判斷是否為海外買方（走 WERKS_HARDCODE 者）──
export function isOverseasBuyer(plantCode: string): boolean {
  return !!WERKS_HARDCODE[plantCode];
}

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

// ── 稅率選項（台灣，對應「稅碼」欄位，用於計算發票稅額）──
export const TAX_RATE_OPTIONS = [
  { value: '0.05', label: '5%' },
  { value: '0',    label: '0% (零稅率)' },
  { value: 'free', label: '免稅' },
];

// ── 發票聯式選項（台灣買方）──
export const INVOICE_TYPE_OPTIONS = [
  { value: '21', label: '21 三聯式、電子計算機統一發票' },
  { value: '22', label: '22 二聯式收銀機統一發票' },
  { value: '25', label: '25 三聯式收銀機統一發票' },
];

// ── 稅碼選項（海外買方，VAT）──
export const TAX_CODE_OPTIONS = [
  { value: '0',  label: '0% VAT tax - Goods & Service' },
  { value: '5',  label: '5% VAT tax - Goods & Service' },
  { value: '10', label: '10% VAT tax - Goods & Service' },
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
