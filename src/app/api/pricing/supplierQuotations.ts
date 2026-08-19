import { mdoList, mdoCommand } from '../client';

// ── MDO Schema ────────────────────────────────────────────────────────────────

export interface MdoSupplierQuotation {
  id: string;              // UUID
  enterprise_id: string;
  supplier_no: string;     // 廠商代碼
  material_no: string;     // 料號
  purchase_org: string;    // 採購組織
  plant_code: string;      // 交貨工廠
  brand: string;           // 品牌（'ALL' 表示適用所有品牌）
  unit_price: number;      // 採購單價
  currency: string;        // 幣別 ISO 4217
  quote_qty: number;       // 報價數量
  quote_uom: string;       // 報價單位
  min_order_qty: number;   // MOQ
  lead_time_days: number;  // Lead Time（天）
  incoterm: string;        // 國貿條件 EXW|FCA|FOB|CFR|CIF|CPT|CIP|DAP|DPU|DDP
  incoterm_location: string | null; // 國貿條件地點
  spec_type: string;       // 'STANDARD' | 'CUSTOM'
  revision_no: number;     // 樂觀鎖版次
  is_deleted: boolean;
  created_by: unknown;
  updated_by: unknown;
  created_at: string;
  updated_at: string;
}

export interface FetchSupplierQuotationsParams {
  supplierNo?: string;
  materialNo?: string;
  purchaseOrg?: string;
  plantCode?: string;
  brand?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** 取得廠商報價列表（支援多維度過濾） */
export async function fetchSupplierQuotations(
  params?: FetchSupplierQuotationsParams
): Promise<{ data: MdoSupplierQuotation[]; total: number }> {
  const res = await mdoList<MdoSupplierQuotation>('/pricing/supplier-quotations', params);
  return { data: res.data, total: res.pagination?.total ?? res.data.length };
}

// ── Create ────────────────────────────────────────────────────────────────────

export interface CreateSupplierQuotationBody {
  supplierNo: string;
  materialNo: string;
  purchaseOrg: string;
  plantCode: string;
  brand: string;            // 未指定時請傳 'ALL'
  unitPrice: number;
  currency: string;
  quoteQty: number;
  quoteUom: string;
  minOrderQty: number;
  leadTimeDays: number;
  incoterm: string;
  incotermLocation: string;
  specType: string;         // 'STANDARD' | 'CUSTOM'
  createdBy?: string;
}

/** 新增廠商報價 */
export async function createSupplierQuotation(
  body: CreateSupplierQuotationBody
): Promise<MdoSupplierQuotation> {
  return mdoCommand<CreateSupplierQuotationBody, MdoSupplierQuotation>(
    '/pricing/supplier-quotations/commands/create',
    body
  );
}

// ── Update ────────────────────────────────────────────────────────────────────

export interface UpdateSupplierQuotationBody {
  id: string;
  revisionNo: number;       // 樂觀鎖，須等於目前 revision_no
  supplierNo: string;
  materialNo: string;
  purchaseOrg: string;
  plantCode: string;
  brand: string;
  unitPrice: number;
  currency: string;
  quoteQty: number;
  quoteUom: string;
  minOrderQty: number;
  leadTimeDays: number;
  incoterm: string;
  incotermLocation: string;
  specType: string;
  updatedBy?: string;
}

/** 更新廠商報價 */
export async function updateSupplierQuotation(
  body: UpdateSupplierQuotationBody
): Promise<MdoSupplierQuotation> {
  return mdoCommand<UpdateSupplierQuotationBody, MdoSupplierQuotation>(
    '/pricing/supplier-quotations/commands/update',
    body
  );
}

// ── Retire ────────────────────────────────────────────────────────────────────

export interface RetireSupplierQuotationBody {
  id: string;
  revisionNo: number;
  reason?: string;
  updatedBy?: string;
}

/** 停用（軟刪除）廠商報價 */
export async function retireSupplierQuotation(
  body: RetireSupplierQuotationBody
): Promise<MdoSupplierQuotation> {
  return mdoCommand<RetireSupplierQuotationBody, MdoSupplierQuotation>(
    '/pricing/supplier-quotations/commands/retire',
    body
  );
}
