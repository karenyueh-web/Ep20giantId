/**
 * MDO 索樣單 API
 * Endpoint: /api/v1/order-transaction/sample-orders
 * Schema 來源: https://mdo.uat.giantgroup.local/api/docs-json (2026-08-21)
 * 實際 GET 回傳樣本: 2026-08-21 實測確認
 *
 * 已部署 endpoints：
 *   GET    /api/v1/order-transaction/sample-orders
 *   GET    /api/v1/order-transaction/sample-orders/{id}
 *   POST   .../commands/create      ❗ whitelist bug 待修復
 *   POST   .../commands/confirm     ✅
 *   POST   .../commands/supplier-reply  ✅（日期欄位待 MDO 修復 Prisma bug）
 *   POST   .../commands/cancel      ✅
 *   POST   .../commands/close       ✅
 */
import { mdoList, mdoGet, mdoCommand } from '../client';
import type { SampleOrderRecord, SampleOrderStatus } from '../../components/sampleOrderData';

// ── Request DTOs ──────────────────────────────────────────────────────────────

/**
 * 開立索樣單 DTO
 * MDO Schema: CreateSampleOrderDto
 * 實測確認：
 *   - 所有欄位已正常（whitelist + Prisma date cast bugs 均已修復 2026-08-24）
 *   - create 回傳的 revision_no = 1，後續 confirm 需要傳入此值
 */
export interface CreateSampleOrderDto {
  // 系統資料（來自 PartRecord）
  orderNo:             string;   // 索樣單號（本地產生）
  supplierCode:        string;   // 廠商編號
  supplierName:        string;   // 廠商名稱
  purchaseOrg:         string;   // 採購組織
  plantCode:           string;   // 工廠代碼
  materialNo:          string;   // 料號
  longDescription:     string;   // 長規格敍述
  supplierMaterialNo?: string;   // 供應商料號（選填）
  // 使用者填寫
  sampleType:          string;   // 索樣類型 'D' | 'G'
  sampleDate:          string;   // 索樣日期（開立當日）
  demandDate:          string;   // 樣品需求日
  demandQty:           number;   // 需求數量
  resample:            boolean;  // 是否重新索樣
  remark?:             string;   // 備註（選填）
  // 系統自動
  createdBy:           string;   // 開立人員（登入使用者）
}

/**
 * 廠商回覆 DTO
 * MDO Schema: SupplierReplySampleDto
 * 實測確認：
 *   - endpoint: POST /commands/supplier-reply
 *   - revisionNo 為 required（從 GET 詳情 revision_no 欄位取得）
 *   - 日期欄位格式待進一步測試（Prisma date cast 待確認）
 */
export interface SupplierReplySampleDto {
  id:                     string;
  revisionNo:             number;  // 必填，從 GET 詳情 revision_no 欄位取得
  supplierShipDate?:      string;  // 樣品達交日
  actualShipDate?:        string;  // 實際送樣日
  availableDate?:         string;  // 首批可供貨日
  supplierDailyCapacity?: number;  // 廠商日產能
  updatedBy?:             string;  // 更新者
}

/**
 * 取消索樣 DTO
 * MDO Schema: CancelSampleOrderDto
 */
export interface CancelSampleOrderDto {
  id:           string;
  revisionNo:   number;  // 必填
  cancelReason: string;
  updatedBy?:   string;
}

/**
 * 確認 / 關閉 DTO（id + revisionNo 必填）
 * MDO Schemas: ConfirmSampleOrderDto / CloseSampleOrderDto
 * 實測：revisionNo 從 GET 詳情 / create / confirm 回傳的 revision_no 取得
 */
export interface SampleOrderIdDto {
  id:          string;
  revisionNo:  number;  // 必填
  updatedBy?:  string;  // 操作者
}

// ── Response（暫時型別，待 MDO 補充 GET response schema 後更新）─────────────────

/**
 * 開立索樣單成功回傳（推測格式，待 MDO docs-json 補充確認）
 * ⚠ 若 create 不回傳 orderNo，前端需另行查詢或使用本地產生的 orderNo
 */
export interface CreateSampleOrderResponse {
  id:          string;   // MDO UUID
  orderNo:     string;   // 索樣單號
  revision_no: number;   // 通常為 1
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * 開立索樣單
 * POST /api/v1/order-transaction/sample-orders/commands/create
 */
export async function createSampleOrderMdo(
  dto: CreateSampleOrderDto
): Promise<CreateSampleOrderResponse> {
  return mdoCommand<CreateSampleOrderDto, CreateSampleOrderResponse>(
    '/order-transaction/sample-orders/commands/create',
    dto
  );
}

/**
 * 廠商回覆索樣單
 * POST /api/v1/order-transaction/sample-orders/commands/supplier-reply
 * 實測確認：revisionNo 為 required（從 GET 詳情的 revision_no 取得）
 */
export async function supplierReplySampleOrderMdo(
  dto: SupplierReplySampleDto
): Promise<void> {
  return mdoCommand<SupplierReplySampleDto, void>(
    '/order-transaction/sample-orders/commands/supplier-reply',
    dto
  );
}

/** @deprecated 請改用 supplierReplySampleOrderMdo */
export const vendorReplySampleOrderMdo = supplierReplySampleOrderMdo;

/**
 * 取消索樣單
 * POST /api/v1/order-transaction/sample-orders/commands/cancel
 */
export async function cancelSampleOrderMdo(
  dto: CancelSampleOrderDto
): Promise<void> {
  return mdoCommand<CancelSampleOrderDto, void>(
    '/order-transaction/sample-orders/commands/cancel',
    dto
  );
}

/**
 * 關閉結案索樣單
 * POST /api/v1/order-transaction/sample-orders/commands/close
 */
export async function closeSampleOrderMdo(
  dto: SampleOrderIdDto
): Promise<void> {
  return mdoCommand<SampleOrderIdDto, void>(
    '/order-transaction/sample-orders/commands/close',
    dto
  );
}

/**
 * 確認索樣單（DR → V）
 * POST /api/v1/order-transaction/sample-orders/commands/confirm
 */
export async function confirmSampleOrderMdo(
  dto: SampleOrderIdDto
): Promise<void> {
  return mdoCommand<SampleOrderIdDto, void>(
    '/order-transaction/sample-orders/commands/confirm',
    dto
  );
}

// ── MDO GET Response（snake_case，實測 2026-08-21）────────────────────────────

export interface MdoSampleOrderItem {
  id:                      string;
  enterprise_id:           string;
  order_no:                string;
  status:                  string;
  sample_type:             string;
  supplier_code:           string;
  supplier_name:           string;
  purchase_org:            string | null;
  plant_code:              string | null;
  material_no:             string;
  long_description:        string | null;
  supplier_material_no:    string | null;
  sample_date:             string | null;
  demand_date:             string | null;
  demand_qty:              string | number | null;
  resample:                boolean;
  remark:                  string | null;
  supplier_ship_date:      string | null;
  actual_ship_date:        string | null;
  available_date:          string | null;
  supplier_daily_capacity: string | number | null;
  cancel_reason:           string | null;
  created_by:              string;
  created_at:              string;
  updated_at:              string;
  revision_no:             number;
  updated_by:              string | null;
  is_deleted:              boolean;
}

/** ISO 8601 → YYYY/MM/DD */
function isoToDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.substring(0, 10).replace(/-/g, '/');
}

/** MDO snake_case → SampleOrderRecord（camelCase） */
export function mapMdoToSampleOrderRecord(item: MdoSampleOrderItem): SampleOrderRecord {
  return {
    id:                    item.id,
    orderNo:               item.order_no,
    status:                item.status as SampleOrderStatus,
    sampleType:            item.sample_type as SampleOrderRecord['sampleType'],
    supplierCode:          item.supplier_code,
    supplierName:          item.supplier_name,
    purchaseOrg:           item.purchase_org ?? '',
    plantCode:             item.plant_code ?? '',
    materialNo:            item.material_no,
    longDescription:       item.long_description ?? '',
    supplierMaterialNo:    item.supplier_material_no ?? '',
    sampleDate:            isoToDate(item.sample_date),
    demandDate:            isoToDate(item.demand_date),
    demandQty:             item.demand_qty != null ? Number(item.demand_qty) : undefined,
    resample:              item.resample,
    remark:                item.remark ?? '',
    supplierShipDate:      isoToDate(item.supplier_ship_date),
    actualShipDate:        isoToDate(item.actual_ship_date),
    availableDate:         isoToDate(item.available_date),
    supplierDailyCapacity: item.supplier_daily_capacity != null ? Number(item.supplier_daily_capacity) : undefined,
    cancelReason:          item.cancel_reason ?? '',
    createdBy:             item.created_by,
    createdAt:             isoToDate(item.created_at),
    updatedAt:             isoToDate(item.updated_at),
    needsFullSupplierReply: false,
    // revision_no 存在從 API，傳入 supplierReplySampleOrderMdo 時需要此欄位
    mdoRevisionNo:         item.revision_no,
  };
}

// ── GET Functions ─────────────────────────────────────────────────────────────

/**
 * 取得索樣單列表
 * GET /api/v1/order-transaction/sample-orders
 */
export async function fetchSampleOrders(params?: {
  page?:         number;
  limit?:        number;
  status?:       string;
  supplierCode?: string;
  materialNo?:   string;
}): Promise<{ data: SampleOrderRecord[]; total: number }> {
  const res = await mdoList<MdoSampleOrderItem>(
    '/order-transaction/sample-orders',
    params
  );
  return {
    data:  res.data.map(mapMdoToSampleOrderRecord),
    total: res.pagination?.total ?? res.data.length,
  };
}

/**
 * 取得單筆索樣單
 * GET /api/v1/order-transaction/sample-orders/{id}
 */
export async function fetchSampleOrder(id: string): Promise<SampleOrderRecord> {
  const item = await mdoGet<MdoSampleOrderItem>(
    `/order-transaction/sample-orders/${id}`
  );
  return mapMdoToSampleOrderRecord(item);
}
