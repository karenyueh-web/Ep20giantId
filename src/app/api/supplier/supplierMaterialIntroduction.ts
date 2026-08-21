import { mdoList, mdoGet, mdoCommand } from '../client';

// ── Supplier Material Introduction（導入時程：3 個日期欄位）─────────────────

export interface MdoSupplierMaterialIntroduction {
  id: string;
  supplier_material_id: string;
  supplier_no: string;
  material_no: string;
  purchase_org: string;
  qa_plan_completed_date: string | null;   // YYYY-MM-DD
  sample_available_date: string | null;    // YYYY-MM-DD
  estimated_first_supply_date: string | null; // YYYY-MM-DD
  remark: string | null;
  revision_no: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** 取得全量 supplier-material-introductions（自動翻頁） */
export async function fetchAllSupplierMaterialIntroductions(params?: {
  supplierNo?: string;
  materialNo?: string;
  purchaseOrg?: string;
}): Promise<MdoSupplierMaterialIntroduction[]> {
  const PAGE_SIZE = 100;
  const first = await mdoList<MdoSupplierMaterialIntroduction>(
    '/product-master/supplier-material-introductions',
    { page: 1, limit: PAGE_SIZE, ...params }
  );
  const totalPages = first.pagination?.totalPages ?? 1;
  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      mdoList<MdoSupplierMaterialIntroduction>(
        '/product-master/supplier-material-introductions',
        { page: i + 2, limit: PAGE_SIZE, ...params }
      ).then(r => r.data)
    )
  );
  return [...first.data, ...rest.flat()];
}

/** 以 supplierNo + materialNo + purchaseOrg 取得導入時程（404 = 尚未建立） */
export async function resolveSupplierMaterialIntroduction(
  supplierNo: string,
  materialNo: string,
  purchaseOrg: string,
): Promise<MdoSupplierMaterialIntroduction | null> {
  try {
    const params = new URLSearchParams({ supplierNo, materialNo, purchaseOrg });
    return await mdoGet<MdoSupplierMaterialIntroduction>(
      `/product-master/supplier-material-introductions/resolve?${params}`
    );
  } catch {
    return null; // 404 → 尚未建立
  }
}

export interface CreateIntroductionBody {
  supplierNo: string;
  materialNo: string;
  purchaseOrg: string;
  qaPlanCompletedDate?: string | null;
  sampleAvailableDate?: string | null;
  estimatedFirstSupplyDate?: string | null;
  remark?: string | null;
  createdBy?: string;
}

export interface UpdateIntroductionBody {
  id: string;
  revisionNo: number;
  supplierNo: string;
  materialNo: string;
  purchaseOrg: string;
  qaPlanCompletedDate?: string | null;
  sampleAvailableDate?: string | null;
  estimatedFirstSupplyDate?: string | null;
  remark?: string | null;
  updatedBy?: string;
}

/** 建立導入時程（首次） */
export async function createSupplierMaterialIntroduction(
  body: CreateIntroductionBody
): Promise<MdoSupplierMaterialIntroduction> {
  return mdoCommand<CreateIntroductionBody, MdoSupplierMaterialIntroduction>(
    '/product-master/supplier-material-introductions/commands/create',
    body
  );
}

/** 更新導入時程 */
export async function updateSupplierMaterialIntroduction(
  body: UpdateIntroductionBody
): Promise<MdoSupplierMaterialIntroduction> {
  return mdoCommand<UpdateIntroductionBody, MdoSupplierMaterialIntroduction>(
    '/product-master/supplier-material-introductions/commands/update',
    body
  );
}

// ── Supplier Material（廠商料號）──────────────────────────────────────────────

export interface MdoSupplierMaterial {
  id: string;
  supplier_id: string;
  material_id: string;          // product-master items UUID（= item_id for compositions）
  supplier_no: string;
  material_no: string;
  supplier_material_no: string | null;
  revision_no: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** 取得全量 supplier-materials（自動翻頁） */
export async function fetchAllSupplierMaterials(params?: {
  supplierNo?: string;
  materialNo?: string;
}): Promise<MdoSupplierMaterial[]> {
  const PAGE_SIZE = 100;
  const first = await mdoList<MdoSupplierMaterial>(
    '/product-master/supplier-materials',
    { page: 1, limit: PAGE_SIZE, ...params }
  );
  const totalPages = first.pagination?.totalPages ?? 1;
  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      mdoList<MdoSupplierMaterial>(
        '/product-master/supplier-materials',
        { page: i + 2, limit: PAGE_SIZE, ...params }
      ).then(r => r.data)
    )
  );
  return [...first.data, ...rest.flat()];
}

/** 以 supplierNo + materialNo 取得廠商料號（404 = 尚未建立） */
export async function resolveSupplierMaterial(
  supplierNo: string,
  materialNo: string,
): Promise<MdoSupplierMaterial | null> {
  try {
    const params = new URLSearchParams({ supplierNo, materialNo });
    return await mdoGet<MdoSupplierMaterial>(
      `/product-master/supplier-materials/resolve?${params}`
    );
  } catch {
    return null;
  }
}

export interface CreateSupplierMaterialBody {
  supplierNo: string;
  materialNo: string;
  supplierMaterialNo?: string;
  createdBy?: string;
}

export interface UpdateSupplierMaterialBody {
  id: string;
  revisionNo: number;
  supplierNo: string;
  materialNo: string;
  supplierMaterialNo?: string | null;
  updatedBy?: string;
}

/** 建立廠商料號（首次） */
export async function createSupplierMaterial(
  body: CreateSupplierMaterialBody
): Promise<MdoSupplierMaterial> {
  return mdoCommand<CreateSupplierMaterialBody, MdoSupplierMaterial>(
    '/product-master/supplier-materials/commands/create',
    body
  );
}

/** 更新廠商料號 */
export async function updateSupplierMaterial(
  body: UpdateSupplierMaterialBody
): Promise<MdoSupplierMaterial> {
  return mdoCommand<UpdateSupplierMaterialBody, MdoSupplierMaterial>(
    '/product-master/supplier-materials/commands/update',
    body
  );
}
