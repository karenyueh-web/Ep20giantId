import { mdoList, mdoGet } from '../client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MdoPurchaseOrderStatus = 'NP' | 'V' | 'B' | 'CK' | 'CL';

/**
 * 採購單行項目（PurchaseOrderLineItemResponseDto）
 * 對應 GET /api/v1/order-transaction/purchase-orders/{id} → lineItems
 */
export interface MdoPurchaseOrderLineItem {
  id: string;                       // UUID
  purchaseOrderId: string;          // UUID
  enterpriseId: string;
  lineNo: string;                   // 項次（SAP 前導零字串，如 00010）→ 對應前端 orderSeq
  materialNo: string;               // 料號
  orderQty: number;                 // 訂貨量
  expectedDelivery: string;         // 預計交期（date）
  deliveryDate?: string;            // 廠商可交貨日期（date）
  quotationId?: string;             // 報價快照鍵（UUID）→ 可連結 pricing/supplier-quotations
  quotationRevisionNo?: number;     // 報價快照版次
  createdAt: string;
  updatedAt: string;
}

/**
 * 採購單主表（PurchaseOrderResponseDto）
 * 對應 GET /api/v1/order-transaction/purchase-orders
 *
 * 欄位對應說明（前端 OrderRow → MDO）：
 *   orderNo        ← orderNo
 *   status         ← status (NP/V/B/CK/CL)
 *   vendorCode     ← supplierCode
 *   orderType      ← purchaseOrderType（換貨已知值：Z1JB / Z1JD）
 *   deletionCode   ← isDeleted (boolean，前端轉換為字串標記)
 *
 * ⚠️ 缺漏欄位（待 MDO 補充）：
 *   orderDate, purchaseOrg, orderSeq, docSeqNo, purchaser, currency,
 *   productName, specification, unit, leadtime, vendorMaterialNo,
 *   customerBrand, comparePrice, storageLocationCode, gbdOrderNo
 *   → 詳見 src/app/api/order/PENDING_MDO_FIELDS.md
 */
export interface MdoPurchaseOrder {
  id: string;                       // UUID
  enterpriseId: string;
  orderNo: string;                  // 採購單號（業務碼，唯一鍵）→ 對應前端 orderNo
  supplierCode: string;             // 供應商代碼 → 對應前端 vendorCode
  status: MdoPurchaseOrderStatus;   // NP / V / B / CK / CL → 對應前端 status
  purchaseOrderType?: string;       // 訂單類型（換貨已知值 Z1JB/Z1JD）→ 對應前端 orderType
  isDeleted: boolean;               // 刪單標記 → 對應前端 deletionCode（true 時視為已刪）
  createdBy?: string;               // 建立者（帳號）→ 近似 purchaser
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  lineItems?: MdoPurchaseOrderLineItem[]; // 行項目（僅明細端點回傳）
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface FetchPurchaseOrdersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  supplierCode?: string;   // 依供應商代碼篩選 → 對應前端廠商搜尋
  status?: string;         // NP / V / B / CK / CL → 對應前端 Tab 篩選
  purchaseOrderType?: string; // 訂單類型篩選（換貨/退貨類型）
  orderNo?: string;        // 依採購單號搜尋
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * 取得一般採購單列表
 * 對應前端：一般訂單查詢（非換貨/退貨）
 */
export async function fetchPurchaseOrders(
  params?: FetchPurchaseOrdersParams
): Promise<{ data: MdoPurchaseOrder[]; total: number }> {
  const res = await mdoList<MdoPurchaseOrder>(
    '/order-transaction/purchase-orders',
    params
  );
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}

/**
 * 取得單筆採購單（含行項目 lineItems）
 */
export async function fetchPurchaseOrder(id: string): Promise<MdoPurchaseOrder> {
  return mdoGet<MdoPurchaseOrder>(`/order-transaction/purchase-orders/${id}`);
}

/**
 * 取得換貨(J)訂單列表
 * 對應前端：換貨(J)單據查詢
 * 回傳 schema 與 PurchaseOrderResponseDto 相同
 */
export async function fetchExchangeOrders(params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  supplierCode?: string;
  status?: string;
}): Promise<{ data: MdoPurchaseOrder[]; total: number }> {
  const res = await mdoList<MdoPurchaseOrder>(
    '/order-transaction/exchange-orders',
    params
  );
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}

/**
 * 取得退貨訂單列表
 * 對應前端：退貨單據查詢
 * 回傳 schema 與 PurchaseOrderResponseDto 相同
 */
export async function fetchReturnOrders(params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  supplierCode?: string;
  status?: string;
}): Promise<{ data: MdoPurchaseOrder[]; total: number }> {
  const res = await mdoList<MdoPurchaseOrder>(
    '/order-transaction/return-orders',
    params
  );
  return {
    data: res.data,
    total: res.pagination?.total ?? res.data.length,
  };
}

// ─── Mapper: MDO → 前端 OrderRow（partial，僅對應已有欄位） ────────────────────

import type { OrderRow } from '../../components/AdvancedOrderTable';

/**
 * 將 MdoPurchaseOrder 轉換為前端 OrderRow
 *
 * 注意：部分欄位 MDO 尚未提供，使用空值 fallback 暫時佔位：
 *   orderDate     → createdAt 轉換（待 MDO 補 orderDate 欄位後更換）
 *   vendorName    → supplierCode（待 partner-commercial 補查後更換）
 *   orderSeq      → lineItems[0].lineNo（若有行項目，取第一筆）
 *   materialNo    → lineItems[0].materialNo
 *   orderQty      → lineItems[0].orderQty
 *   expectedDelivery → lineItems[0].expectedDelivery
 *   deliveryDate  → lineItems[0].deliveryDate
 */
export function mapPurchaseOrderToRow(po: MdoPurchaseOrder): OrderRow {
  const firstLine = po.lineItems?.[0];

  // orderDate：目前用 createdAt 替代（待 MDO 補欄位後改為 po.orderDate）
  const orderDate = po.createdAt
    ? po.createdAt.slice(0, 10).replace(/-/g, '/')
    : '';

  // orderSeq：從 lineNo 取得（SAP 格式如 '00010' → 取數字部分 '10'）
  const orderSeq = firstLine?.lineNo
    ? String(parseInt(firstLine.lineNo, 10))
    : '';

  return {
    id: stringToNumId(po.id), // UUID → number（用 hash，保持穩定）
    status: po.status,
    orderNo: po.orderNo,
    orderDate,
    orderType: po.purchaseOrderType ?? '',          // 訂單類型
    orderSeq,
    docSeqNo: orderSeq ? `${po.orderNo}${orderSeq}` : po.orderNo,
    vendorCode: po.supplierCode,
    vendorName: po.supplierCode,                    // ⚠️ 待 partner-commercial 補查
    materialNo: firstLine?.materialNo ?? '',
    productName: '',                                // ⚠️ MDO 未提供
    specification: '',                              // ⚠️ MDO 未提供
    orderQty: firstLine?.orderQty ?? 0,
    acceptQty: 0,                                   // ⚠️ MDO 未提供
    expectedDelivery: firstLine?.expectedDelivery?.replace(/-/g, '/') ?? '',
    vendorDeliveryDate: firstLine?.deliveryDate?.replace(/-/g, '/') ?? undefined,
    inTransitQty: 0,                                // ⚠️ 需查 stock-inventory
    undeliveredQty: 0,                              // 計算值：待補齊欄位後重算
    deletionCode: po.isDeleted ? 'DELETED' : undefined,
    // 以下欄位 MDO 尚無對應，留空
    purchaser: po.createdBy ?? '',
    currency: '',
    unit: '',
    leadtime: undefined,
    comparePrice: undefined,
    customerBrand: undefined,
    vendorMaterialNo: undefined,
    storageLocationCode: undefined,
    purchaseOrg: undefined,
    company: po.enterpriseId ?? '',
  };
}

/** UUID string → stable number（用於前端 id 欄位） */
function stringToNumId(uuid: string): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
