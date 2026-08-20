import { mdoList, mdoGet } from '../client';

// ── MDO Schemas ───────────────────────────────────────────────────────────────

export interface MdoItem {
  material_id: string;      // UUID
  material_no: string;      // 料號（對應前台 PartRecord.material）
  description: string;      // 長規格敘述
  brand: string;
  item_type: string;
  base_uom: string;         // 基本計量單位
  material_group: string;
  batch_managed: boolean;
  gtin?: string | null;
  net_weight?: number | null;   // 淨重
  gross_weight?: number | null; // 毛重
  weight_uom?: string | null;   // 重量單位（KG / G / LB 等）
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

/** 取得單一物料（by UUID） */
export async function fetchItem(materialId: string): Promise<MdoItem | null> {
  try {
    return await mdoGet<MdoItem>(`/product-master/items/${materialId}`);
  } catch {
    return null;
  }
}

/** 以料號搜尋取得第一筆物料（list 不支援 materialNo filter，改用全列表比對） */
export async function fetchItemByMaterialNo(materialNo: string): Promise<MdoItem | null> {
  try {
    // 先取少量，若找到直接回傳；否則繼續翻頁（最多 500 筆）
    const PAGE_SIZE = 100;
    let page = 1;
    while (page <= 5) {
      const res = await mdoList<MdoItem>('/product-master/items', { page, limit: PAGE_SIZE });
      const found = res.data.find(i => i.material_no === materialNo);
      if (found) return found;
      if (res.data.length < PAGE_SIZE) break; // 已取完
      page++;
    }
    return null;
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
