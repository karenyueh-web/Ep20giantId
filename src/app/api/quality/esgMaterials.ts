import { mdoList, mdoGet, mdoCommand } from '../client';

export interface MdoEsgMaterial {
  id: string;              // UUID
  name_tw: string;
  name_cn?: string;
  name_en?: string;
  carbon_emission: number | string;  // MDO 回傳 string，使用時需 parseFloat
  material_type?: string;
  enterprise_id: string;
  created_at: string;
  updated_at: string;
}

export interface FetchEsgMaterialsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 取得 ESG 材料列表（單頁，最大 100 筆） */
export async function fetchEsgMaterials(
  params?: FetchEsgMaterialsParams
): Promise<{ data: MdoEsgMaterial[]; total: number }> {
  const res = await mdoList<MdoEsgMaterial>('/quality-esg/esg-materials', params);
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}

/** 取得全量 ESG 材料（自動翻頁，limit 最大 100） */
export async function fetchAllEsgMaterials(): Promise<MdoEsgMaterial[]> {
  const PAGE_SIZE = 100;
  const first = await mdoList<MdoEsgMaterial>('/quality-esg/esg-materials', { page: 1, limit: PAGE_SIZE });
  const totalPages = first.pagination?.totalPages ?? 1;
  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      mdoList<MdoEsgMaterial>('/quality-esg/esg-materials', { page: i + 2, limit: PAGE_SIZE }).then(r => r.data)
    )
  );
  return [...first.data, ...rest.flat()];
}

/** 取得單筆 ESG 材料 */
export async function fetchEsgMaterial(id: string): Promise<MdoEsgMaterial> {
  return mdoGet<MdoEsgMaterial>(`/quality-esg/esg-materials/${id}`);
}

export interface UpsertEsgMaterialBody {
  nameTw: string;
  nameCn?: string;
  nameEn?: string;
  carbonEmission: number;
  materialType?: string;
  createdBy?: string;
  updatedBy?: string;
}

/** 新增或更新 ESG 材料 */
export async function upsertEsgMaterial(
  body: UpsertEsgMaterialBody
): Promise<MdoEsgMaterial> {
  return mdoCommand<UpsertEsgMaterialBody, MdoEsgMaterial>(
    '/quality-esg/esg-materials/commands/upsert',
    body
  );
}

/** 停用 ESG 材料 */
export async function retireEsgMaterial(id: string): Promise<MdoEsgMaterial> {
  return mdoCommand<{ id: string }, MdoEsgMaterial>(
    '/quality-esg/esg-materials/commands/retire',
    { id }
  );
}

// ── Material Composition ───────────────────────────────────────────────────────

export interface MdoMaterialComposition {
  id: string;
  item_id: string;          // 對應 product-master items.material_id
  esg_material_id: string;
  plant_code?: string;      // 工廠代碼（唯一鍵第 3 維，D-MC13）
  unit_weight?: number | string; // 成分單位重量（D-MC14，API 回傳可能是 string）
  name_tw?: string;
  name_cn?: string;
  name_en?: string;
  carbon_emission?: number | string;
  is_deleted?: boolean;     // 軟刪除標記
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertMaterialCompositionBody {
  itemId: string;           // product-master items UUID
  esgMaterialId: string;   // esg_material UUID
  plantCode: string;       // 工廠代碼（MDO required）
  unitWeight: number;      // 單位重量（MDO required）
  nameTw?: string;
  nameCn?: string;
  nameEn?: string;
  carbonEmission?: number;
  createdBy?: string;
  updatedBy?: string;
}

/** 新增或更新物料成分（upsert by itemId + esgMaterialId） */
export async function upsertMaterialComposition(
  body: UpsertMaterialCompositionBody
): Promise<MdoMaterialComposition> {
  return mdoCommand<UpsertMaterialCompositionBody, MdoMaterialComposition>(
    '/quality-esg/material-compositions/commands/upsert',
    body
  );
}

/** 取得某物料的所有成分 */
export async function fetchMaterialCompositionsByItem(
  itemId: string
): Promise<MdoMaterialComposition[]> {
  const res = await mdoList<MdoMaterialComposition>(
    `/quality-esg/material-compositions/by-item/${itemId}`
  );
  return res.data;
}

export interface DeleteMaterialCompositionBody {
  itemId: string;       // product-master items UUID
  esgMaterialId: string; // esg_material UUID
  updatedBy?: string;
}

/** 刪除物料成分 */
export async function deleteMaterialComposition(
  body: DeleteMaterialCompositionBody
): Promise<void> {
  await mdoCommand<DeleteMaterialCompositionBody, unknown>(
    '/quality-esg/material-compositions/commands/delete',
    body
  );
}
