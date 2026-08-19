import { mdoList } from '../client';

export interface MdoCurrency {
  id: string;
  code: string;
  name: string;
  minor_unit: number;
  status: string;
  enterprise_id?: string;
  created_at: string;
  updated_at: string;
}

/** 取得所有幣別（無分頁） */
export async function fetchCurrencies(): Promise<MdoCurrency[]> {
  const res = await mdoList<MdoCurrency>('/platform-core/currencies');
  return res.data;
}
