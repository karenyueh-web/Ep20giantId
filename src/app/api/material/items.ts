import { mdoList } from '../client';

// ── MDO Schemas ───────────────────────────────────────────────────────────────

export interface MdoItem {
  material_id: string;      // UUID
  material_no: string;      // 料號（對應前台 PartRecord.material）
  description: string;      // 長規格敘述
  brand: string;
  item_type: string;
  base_uom: string;         // 重量單位
  material_group: string;
  batch_managed: boolean;
  gtin?: string;
  enterprise_id: string;
  created_at: string;
  updated_at: string;
}

export interface MdoItemPlantContext {
  id: string;
  material_no: string;
  plant: string;            // 工廠代碼
  enterprise_id: string;
  created_at: string;
  updated_at: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/** 取得物料列表 */
export async function fetchItems(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: MdoItem[]; total: number }> {
  const res = await mdoList<MdoItem>('/product-master/items', params);
  return { data: res.data, total: res.pagination?.total ?? res.data.length };
}

/** 取得單一物料 */
export async function fetchItem(materialId: string): Promise<MdoItem | null> {
  try {
    const res = await mdoList<MdoItem>('/product-master/items', { limit: 1 });
    return res.data.find(i => i.material_id === materialId) ?? null;
  } catch {
    return null;
  }
}

/** 取得物料的工廠對應 */
export async function fetchItemPlantContexts(
  materialId: string
): Promise<MdoItemPlantContext[]> {
  const res = await mdoList<MdoItemPlantContext>(
    `/product-master/items/${materialId}/plant-contexts`
  );
  return res.data;
}
