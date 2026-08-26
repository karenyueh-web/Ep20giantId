import { mdoList } from '../client';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * 預測訂單項目（ForecastOrderItemDto）
 * 對應 GET /api/v1/order-transaction/forecast-orders
 *
 * 注意：MDO docs-json 的 GET response schema 尚未正式定義，
 * 此型別依據上傳 DTO（ForecastOrderItemDto）推斷，結構相同。
 *
 * 欄位對應說明（前端 ForecastOrderRow → MDO）：
 *   purchaseGroup   ← purchaseGroup  ✅
 *   purchaseOrg     ← purchaseOrg    ✅
 *   companyCode     ← companyCode    ✅
 *   vendor          ← supplierCode   🟡（需拼接廠商名）
 *   uploadWeek      ← uploadWeek     ✅
 *   deliveryWeek    ← deliveryWeek   ✅
 *   materialNo      ← materialNo     ✅
 *   vendorMaterialNo← supplierMaterialNo ✅
 *   productName     ← productName    ✅
 *   leadTime        ← leadTime       ✅
 *   deliveryDate    ← deliveryDate   ✅
 *   purchaseQty     ← purchaseQty    ✅
 *   diffQty         ← diffQty        ✅
 *   unit            ← unit           ✅
 *
 * ⚠️ 缺漏欄位（待 MDO 補充）：
 *   updatedBy, updatedDate
 */
export interface MdoForecastOrder {
  purchaseGroup?: string;       // 採購群組
  purchaseOrg?: string;         // 採購組織
  companyCode?: string;         // 公司代碼
  supplierCode: string;         // 供應商代碼 → 對應前端 vendor（需拼廠商名）
  uploadWeek?: string;          // 上傳週別（e.g. 2026-W03）
  deliveryWeek?: string;        // 交期週別（e.g. 2026-W05）
  materialNo: string;           // 料號
  supplierMaterialNo?: string;  // 廠商料號 → 對應前端 vendorMaterialNo
  productName?: string;         // 品名
  leadTime?: number;            // Lead time（天）
  deliveryDate?: string;        // 交貨日期（ISO 8601）
  purchaseQty?: number;         // 採購量
  diffQty?: number;             // 與上期差異量
  unit?: string;                // 單位
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface FetchForecastOrdersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  supplierCode: string;   // ⚠️ 必填：供應商代碼
  deliveryWeek?: string;  // 交期週別篩選（e.g. 2026-W03）
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * 取得預測訂單列表
 * 對應前端：預測訂單查詢
 * ⚠️ supplierCode 為必填參數
 */
export async function fetchForecastOrders(
  params: FetchForecastOrdersParams
): Promise<{ data: MdoForecastOrder[]; total: number }> {
  const res = await mdoList<MdoForecastOrder>(
    '/order-transaction/forecast-orders',
    params
  );
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}
