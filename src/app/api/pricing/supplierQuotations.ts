import { mdoList, mdoCommand } from '../client';

// ── MDO Schema ────────────────────────────────────────────────────────────────
// 注意：API 實際回傳的 unit_price / quote_qty / min_order_qty 為 string 或 number
// （MDO 2026-08-18 更新後行為），使用時請透過 toNumber() 轉換

export interface MdoSupplierQuotation {
  id: string;                           // UUID
  enterprise_id: string;
  supplier_no: string;                  // 廠商代碼
  material_no: string;                  // 料號
  purchase_org: string;                 // 採購組織
  plant_code: string;                   // 交貨工廠
  brand: string;                        // 品牌（'ALL' 表示適用所有品牌）
  unit_price: number | string;          // 採購單價（API 回傳可能是 string）
  currency: string;                     // 幣別 ISO 4217
  quote_qty: number | string;           // 報價數量（API 回傳可能是 string）
  quote_uom: string;                    // 報價單位
  min_order_qty: number | string | null; // MOQ（nullable）
  lead_time_days: number | null;         // Lead Time（天，nullable）
  incoterm: string | null;              // 國貿條件（nullable）
  incoterm_location: string | null;     // 國貿條件地點（nullable）
  spec_type: string | null;             // 'STANDARD' | 'CUSTOM'（nullable）
  notification_sent: boolean;           // 是否已發送通知
  notification_sent_at: string | null;  // 最後一次發送通知時間（ISO 8601）
  notification_sent_by: string | null;  // 最後一次發送通知人員
  revision_no: number;                  // 樂觀鎖版次
  is_deleted: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** 安全數字轉換：MDO 回傳的數字欄位可能是 string */
export function toNumber(v: number | string | null | undefined, fallback = 0): number {
  if (v === null || v === undefined || v === '') return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

export interface FetchSupplierQuotationsParams {
  supplierNo?: string;
  materialNo?: string;
  purchaseOrg?: string;
  plantCode?: string;
  brand?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** 取得廠商報價列表（支援多維度過濾） */
export async function fetchSupplierQuotations(
  params?: FetchSupplierQuotationsParams
): Promise<{ data: MdoSupplierQuotation[]; total: number }> {
  const res = await mdoList<MdoSupplierQuotation>('/pricing/supplier-quotations', params);
  return { data: res.data, total: res.pagination?.total ?? res.data.length };
}

/** 取得全量廠商報價（自動翻頁，最多取 1000 筆） */
export async function fetchAllSupplierQuotations(
  params?: Omit<FetchSupplierQuotationsParams, 'page' | 'limit'>
): Promise<MdoSupplierQuotation[]> {
  const PAGE_SIZE = 100;
  const first = await mdoList<MdoSupplierQuotation>('/pricing/supplier-quotations', {
    ...params,
    page: 1,
    limit: PAGE_SIZE,
  });
  const totalPages = first.pagination?.totalPages ?? 1;

  if (totalPages <= 1) return first.data;

  // 並行取剩餘頁
  const restPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
  const restResults = await Promise.all(
    restPages.map(page =>
      mdoList<MdoSupplierQuotation>('/pricing/supplier-quotations', {
        ...params,
        page,
        limit: PAGE_SIZE,
      }).then(r => r.data)
    )
  );

  return [...first.data, ...restResults.flat()];
}

// ── Create ────────────────────────────────────────────────────────────────────

export interface CreateSupplierQuotationBody {
  supplierNo: string;
  materialNo: string;
  purchaseOrg: string;
  plantCode: string;
  brand: string;            // 未指定時請傳 'ALL'
  unitPrice: number;
  currency: string;
  quoteQty: number;
  quoteUom: string;
  minOrderQty: number;
  leadTimeDays: number;
  incoterm: string;
  incotermLocation: string;
  specType: string;         // 'STANDARD' | 'CUSTOM'
  createdBy?: string;
}

/** 新增廠商報價 */
export async function createSupplierQuotation(
  body: CreateSupplierQuotationBody
): Promise<MdoSupplierQuotation> {
  return mdoCommand<CreateSupplierQuotationBody, MdoSupplierQuotation>(
    '/pricing/supplier-quotations/commands/create',
    body
  );
}

// ── Update ────────────────────────────────────────────────────────────────────

export interface UpdateSupplierQuotationBody {
  id: string;
  revisionNo: number;       // 樂觀鎖，須等於目前 revision_no
  supplierNo: string;
  materialNo: string;
  purchaseOrg: string;
  plantCode: string;
  brand: string;
  unitPrice: number;
  currency: string;
  quoteQty: number;
  quoteUom: string;
  minOrderQty: number;
  leadTimeDays: number;
  incoterm: string;
  incotermLocation: string;
  specType: string;
  updatedBy?: string;
}

/** 更新廠商報價 */
export async function updateSupplierQuotation(
  body: UpdateSupplierQuotationBody
): Promise<MdoSupplierQuotation> {
  return mdoCommand<UpdateSupplierQuotationBody, MdoSupplierQuotation>(
    '/pricing/supplier-quotations/commands/update',
    body
  );
}

// ── Retire ────────────────────────────────────────────────────────────────────

export interface RetireSupplierQuotationBody {
  id: string;
  revisionNo: number;
  reason?: string;
  updatedBy?: string;
}

/** 停用（軟刪除）廠商報價 */
export async function retireSupplierQuotation(
  body: RetireSupplierQuotationBody
): Promise<MdoSupplierQuotation> {
  return mdoCommand<RetireSupplierQuotationBody, MdoSupplierQuotation>(
    '/pricing/supplier-quotations/commands/retire',
    body
  );
}

// ── Notification ─────────────────────────────────────────────────────────────

export interface ReportNotificationSentBody {
  quotationIds: string[];   // MDO quotation UUID 陣列
  reportedBy?: string;      // 操作人員識別
}

export interface ReportNotificationSentResponse {
  requested: number;
  transitioned: number;   // 實際從 unsent→sent 的筆數
  alreadySent: number;
  notFound: number;
}

/** 標記廠商報價通知已發送（可一次批量多筆） */
export async function reportNotificationSent(
  body: ReportNotificationSentBody
): Promise<ReportNotificationSentResponse> {
  return mdoCommand<ReportNotificationSentBody, ReportNotificationSentResponse>(
    '/pricing/supplier-quotations/commands/report-notification-sent',
    body
  );
}
