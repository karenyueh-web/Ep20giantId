import { mdoList, mdoGet, mdoCommand } from '../client';

export type MdoCorrectionStatus = 'DR' | 'V' | 'B' | 'CP' | 'SS' | 'CL';

export interface MdoCorrection {
  id: string;                   // UUID
  correctionDocNo?: string;
  correctionStatus?: MdoCorrectionStatus;
  correctionType?: string;
  orderNo?: string;
  vendorCode?: string;
  vendorName?: string;
  materialNo?: string;
  productName?: string;
  enterprise_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FetchCorrectionsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 取得折讓單列表 */
export async function fetchCorrections(
  params?: FetchCorrectionsParams
): Promise<{ data: MdoCorrection[]; total: number }> {
  const res = await mdoList<MdoCorrection>('/order-transaction/corrections', params);
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}

/** 取得單筆折讓單 */
export async function fetchCorrection(id: string): Promise<MdoCorrection> {
  return mdoGet<MdoCorrection>(`/order-transaction/corrections/${id}`);
}
