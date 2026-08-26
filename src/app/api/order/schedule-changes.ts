import { mdoList } from '../client';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * 變更生管排程項目（ScheduleChangeItemDto）
 * 對應 GET /api/v1/order-transaction/schedule-changes
 *
 * ⚠️ 注意：purchaseOrderNo 在 Issue #24 中從 orderNo 改名，
 *   查詢時必填參數為 purchaseOrderNo（非 orderNo）。
 *
 * 欄位對應說明（前端 OrderRow → MDO）：
 *   orderNo                ← purchaseOrderNo       ✅（改名）
 *   docSeqNo               ← docSeqNo              ✅
 *   orderSeq               ← orderSeq              ✅
 *   materialNo             ← materialNo            ✅
 *   expectedDelivery       ← expectedDelivery      ✅
 *   productionScheduleDate ← productionScheduleDate ✅
 *   deliveryQty            ← deliveryQty           ✅
 *   status                 ← status                ✅
 *   vendorCode/vendorName  ← supplierCodeName      ✅
 *   vendorDeliveryDate     ← supplierCanDeliverDate ✅
 *   undeliveredQty         ← remainingQty          ✅
 *   schedLineIndex(項次)   ← itemNo                ✅
 *   orderQty               ← plannedDeliveryQty    🟡（語意近似）
 *   acceptQty              ← deliveredQty          🟡（語意近似）
 *   specification          ← longSpec              🟡（可能對應）
 *
 * ⚠️ 缺漏欄位（待 MDO 補充）：
 *   inTransitQty, purchaseOrg, productName
 */
export interface MdoScheduleChangeItem {
  purchaseOrderNo: string;         // 採購單號（必填查詢參數）→ 前端 orderNo
  docSeqNo?: string;               // 單號序號
  orderSeq?: string;               // 訂單序號
  materialNo?: string;             // 料號
  expectedDelivery?: string;       // 預計交期（ISO 8601）→ 前端 expectedDelivery
  productionScheduleDate?: string; // 生管端交貨日期（ISO 8601）→ 前端 productionScheduleDate
  deliveryQty?: number;            // 交貨量 → 前端 deliveryQty
  supplierCodeName?: string;       // 廠商代碼+名稱（合併）→ 前端 vendorCode/vendorName
  status?: string;                 // 狀態 → 前端 status
  longSpec?: string;               // 長規格 → 近似前端 specification
  scheduleReqNo?: string;          // 排程需求號（前端目前未使用）
  itemNo?: string;                 // 項次 → 前端 schedLineIndex
  plannedDeliveryQty?: number;     // 計劃交貨量 → 近似前端 orderQty
  deliveredQty?: number;           // 已交貨量 → 近似前端 acceptQty
  remainingQty?: number;           // 剩餘量 → 前端 undeliveredQty
  supplierCanDeliverDate?: string; // 廠商可交貨日期（ISO 8601）→ 前端 vendorDeliveryDate
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface FetchScheduleChangesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  purchaseOrderNo: string; // ⚠️ 必填：採購單號（Issue #24 從 orderNo 改名）
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * 取得變更生管排程列表
 * 對應前端：變更生管排程
 * ⚠️ purchaseOrderNo 為必填參數（Issue #24 從 orderNo 改名）
 */
export async function fetchScheduleChanges(
  params: FetchScheduleChangesParams
): Promise<{ data: MdoScheduleChangeItem[]; total: number }> {
  const res = await mdoList<MdoScheduleChangeItem>(
    '/order-transaction/schedule-changes',
    params
  );
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}
