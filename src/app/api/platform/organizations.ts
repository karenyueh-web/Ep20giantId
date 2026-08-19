import { mdoList, mdoGet } from '../client';

export interface MdoOrganization {
  id: string;
  code: string;
  name: string;
  parent_id?: string;
  status: string;
  enterprise_id?: string;
  created_at: string;
  updated_at: string;
  children?: MdoOrganization[];
}

/** 取得組織樹 */
export async function fetchOrganizationTree(): Promise<MdoOrganization[]> {
  const res = await mdoList<MdoOrganization>('/platform-core/organizations/tree');
  return res.data;
}

/** 取得組織列表（含分頁） */
export async function fetchOrganizations(params?: {
  page?: number;
  limit?: number;
  status?: string;
  code?: string;
}): Promise<{ data: MdoOrganization[]; total: number }> {
  const res = await mdoList<MdoOrganization>('/platform-core/organizations', params);
  return {
    data: res.data,
    total: res.pagination?.total ?? 0,
  };
}
