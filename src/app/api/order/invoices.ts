import { mdoList, mdoGet, mdoCommand } from '../client';

export type MdoInvoiceStatus = 'DR' | 'P' | 'B' | 'S' | 'F' | 'H';

export interface MdoInvoice {
  id: number;
  gsc?: string;
  order_bp_id?: number;
  payment_term?: string;
  invoice_date?: string;
  due_date?: string;
  invoice_amount?: number;
  tax_amount?: number;
  misc_charge?: number;
  discount?: number;
  remaining_balance?: number;
  currency?: string;
  erp_invoice_id?: string;
  erp_invoice_type?: string;
  invoice_address_id?: number;
  order_address_id?: number;
  invoice_country?: string;
  invoice_status?: MdoInvoiceStatus;
  is_canceled: boolean;
  canceled_at?: string;
  created_by?: string;
  updated_by?: string;
  erp_created_at?: string;
  erp_updated_at?: string;
  erp_canceled_at?: string;
  enterprise_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MdoInvoiceLineItem {
  invoice_line_id: number;
  invoice_id: number;
  order_id?: number;
  order_line_id?: number;
  dn_id?: number;
  dn_line_id?: number;
  item_id?: string;
  product_name?: string;
  warehouse?: number;
  qty?: number;
  uom?: string;
  sales_unit?: string;
  unit_price?: number;
  discount?: number;
  tax_amount?: number;
  net_amount?: number;
  labor_refund?: number;
  shipping_refund?: number;
  erp_invoice_line_id?: string;
  created_by?: string;
  enterprise_id?: string;
  created_at: string;
}

export interface FetchInvoicesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 取得發票列表 */
export async function fetchInvoices(
  params?: FetchInvoicesParams
): Promise<{ data: MdoInvoice[]; total: number }> {
  const res = await mdoList<MdoInvoice>('/order-transaction/invoices', params);
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}

/** 取得單筆發票 */
export async function fetchInvoice(id: number): Promise<MdoInvoice> {
  return mdoGet<MdoInvoice>(`/order-transaction/invoices/${id}`);
}

/** 取得發票明細行 */
export async function fetchInvoiceLineItems(
  id: number
): Promise<MdoInvoiceLineItem[]> {
  const res = await mdoList<MdoInvoiceLineItem>(
    `/order-transaction/invoices/${id}/line-items`
  );
  return res.data;
}
