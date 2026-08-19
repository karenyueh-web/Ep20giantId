import { mdoList, mdoGet, mdoCommand } from '../client';

export interface MdoEsgMaterial {
  id: string;              // UUID
  name_tw: string;
  name_cn?: string;
  name_en?: string;
  carbon_emission: number;
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

/** 取得 ESG 材料列表 */
export async function fetchEsgMaterials(
  params?: FetchEsgMaterialsParams
): Promise<{ data: MdoEsgMaterial[]; total: number }> {
  const res = await mdoList<MdoEsgMaterial>('/quality-esg/esg-materials', params);
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
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
