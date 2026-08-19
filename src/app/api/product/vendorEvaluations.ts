import { mdoList, mdoGet, mdoCommand } from '../client';

export interface MdoVendorEvaluation {
  id: string;               // UUID
  supplier_id: string;      // UUID
  evaluation_period: string; // e.g. "2024-Q4"
  evaluation_type?: 'ANNUAL' | 'QUARTERLY';
  quality_score?: number;   // 0-100
  delivery_score?: number;
  price_score?: number;
  service_score?: number;
  overall_score?: number;
  evaluator?: string;
  remark?: string;
  enterprise_id?: string;
  created_at: string;
  updated_at: string;
}

/** 取得廠商評鑑列表 */
export async function fetchVendorEvaluations(params: {
  supplierId: string;
  period?: string;
}): Promise<MdoVendorEvaluation[]> {
  const res = await mdoList<MdoVendorEvaluation>(
    '/product-master/vendor-evaluations',
    params
  );
  return res.data;
}

/** 取得廠商最新一筆評鑑 */
export async function fetchLatestVendorEvaluation(
  supplierId: string
): Promise<MdoVendorEvaluation | null> {
  try {
    const res = await mdoList<MdoVendorEvaluation>(
      '/product-master/vendor-evaluations/latest',
      { supplierId }
    );
    return res.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export interface SaveVendorEvaluationBody {
  supplierId: string;
  evaluationPeriod: string;
  evaluationType?: 'ANNUAL' | 'QUARTERLY';
  qualityScore?: number;
  deliveryScore?: number;
  priceScore?: number;
  serviceScore?: number;
  overallScore?: number;
  evaluator?: string;
  remark?: string;
}

/** 建立或更新廠商評鑑（idempotent: supplierId + evaluationPeriod） */
export async function saveVendorEvaluation(
  body: SaveVendorEvaluationBody
): Promise<MdoVendorEvaluation> {
  return mdoCommand<SaveVendorEvaluationBody, MdoVendorEvaluation>(
    '/product-master/vendor-evaluations/commands/save',
    body
  );
}
