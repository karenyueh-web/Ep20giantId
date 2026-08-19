/**
 * MDO 廠商主檔 API
 * Endpoint: GET/POST /api/v1/product-master/suppliers
 * Schema 來源: https://mdo.uat.giantgroup.local/api/docs-json (2026-08-14)
 */
import { mdoList, mdoGet, mdoCommand } from '../client';

// ── Response DTO ──────────────────────────────────────────────────────────────
export interface MdoSupplier {
  id: string;
  supplier_no: string;
  name: string;
  status: string; // 'ACTIVE' | 'INACTIVE'
  payment_terms?: string;
  shipment_terms?: string;
  phone?: string;
  address?: string;
  fullname_chinese?: string;
  fullname_english?: string;
  main_product?: string;
  fax?: string;
  // 特殊參與設定
  requires_inspection_report?: boolean;
  requires_performance_test_report?: boolean;
  requires_hazardous_substance?: boolean;
  insurance_data_requirement?: 'NONE' | 'REQUIRED_WITH_MAIL' | 'REQUIRED_WITHOUT_MAIL';
  requires_material_composition?: boolean;
  enterprise_id?: string;
  created_at: string;
  updated_at: string;
}

// ── Source Key DTO ────────────────────────────────────────────────────────────
export interface MdoSupplierSourceKey {
  id: string;
  supplier_id: string;
  source_system: string; // 'AX' | 'SAP' | 'PLM' 等
  source_key: string;
  enterprise_id?: string;
  created_at: string;
}

// ── Update DTO ────────────────────────────────────────────────────────────────
export interface UpdateSupplierBody {
  id: string;
  name?: string;
  status?: string;
  paymentTerms?: string;
  shipmentTerms?: string;
  phone?: string;
  address?: string;
  fullnameChinese?: string;
  fullnameEnglish?: string;
  mainProduct?: string;
  fax?: string;
  requiresInspectionReport?: boolean;
  requiresPerformanceTestReport?: boolean;
  requiresHazardousSubstance?: boolean;
  insuranceDataRequirement?: 'NONE' | 'REQUIRED_WITH_MAIL' | 'REQUIRED_WITHOUT_MAIL';
  requiresMaterialComposition?: boolean;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/** 取得廠商列表 */
export async function fetchSuppliers(params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  supplierNo?: string;
}): Promise<{ data: MdoSupplier[]; total: number }> {
  const res = await mdoList<MdoSupplier>('/product-master/suppliers', params);
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}

/** 取得單筆廠商 */
export async function fetchSupplier(id: string): Promise<MdoSupplier> {
  return mdoGet<MdoSupplier>(`/product-master/suppliers/${id}`);
}

/** 取得廠商的所有系統代碼（AX / SAP / PLM）*/
export async function fetchSupplierSourceKeys(
  supplierId: string
): Promise<MdoSupplierSourceKey[]> {
  const res = await mdoList<MdoSupplierSourceKey>(
    `/product-master/suppliers/${supplierId}/source-keys`
  );
  return res.data;
}

/** 取得廠商的特定系統代碼（例如 AX 代碼）*/
export async function fetchSupplierSourceKey(
  supplierId: string,
  sourceSystem: string
): Promise<string | null> {
  const keys = await fetchSupplierSourceKeys(supplierId);
  return keys.find(k => k.source_system === sourceSystem)?.source_key ?? null;
}

/** 更新廠商資料 */
export async function updateSupplier(body: UpdateSupplierBody): Promise<MdoSupplier> {
  return mdoCommand<UpdateSupplierBody, MdoSupplier>(
    '/product-master/suppliers/commands/update',
    body
  );
}
