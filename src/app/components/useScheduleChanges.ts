/**
 * useScheduleChanges
 *
 * 封裝 MDO schedule-changes API 呼叫。
 * ⚠️ purchaseOrderNo 為必填參數（Issue #24：已從 orderNo 改名）。
 *
 * 使用方式：
 *   const { rows, loading, error, refetch } = useScheduleChanges({
 *     purchaseOrderNo: '400649723',
 *   });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchScheduleChanges,
  type MdoScheduleChangeItem,
  type FetchScheduleChangesParams,
} from '../api/order/schedule-changes';
import type { OrderRow, ScheduleLine } from './AdvancedOrderTable';

interface UseScheduleChangesOptions extends FetchScheduleChangesParams {
  /** 自動載入（預設 true）*/
  autoFetch?: boolean;
}

interface UseScheduleChangesResult {
  /** 原始 MDO 資料 */
  raw: MdoScheduleChangeItem[];
  /** 轉換後的前端 OrderRow（可直接傳入表格）*/
  rows: OrderRow[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 將 MdoScheduleChangeItem → 前端 OrderRow
 *
 * 完整對應欄位（✅ = 完全對應，🟡 = 語意近似）：
 *   orderNo                ← purchaseOrderNo          ✅
 *   docSeqNo               ← docSeqNo                 ✅
 *   orderSeq               ← orderSeq                 ✅
 *   materialNo             ← materialNo               ✅
 *   expectedDelivery       ← expectedDelivery         ✅（YYYY-MM-DD → YYYY/MM/DD）
 *   productionScheduleDate ← productionScheduleDate   ✅
 *   deliveryQty            ← deliveryQty              ✅
 *   status                 ← status                   ✅
 *   vendorCode             ← supplierCodeName（前半部分）✅
 *   vendorName             ← supplierCodeName          ✅
 *   vendorDeliveryDate     ← supplierCanDeliverDate    ✅
 *   undeliveredQty         ← remainingQty              ✅
 *   orderQty               ← plannedDeliveryQty        🟡
 *   acceptQty              ← deliveredQty              🟡
 *   specification          ← longSpec                  🟡
 *
 * ⚠️ 缺漏欄位（MDO 未提供，填空值）：
 *   inTransitQty, purchaseOrg, productName
 */
function mapScheduleChangeToRow(
  item: MdoScheduleChangeItem,
  index: number
): OrderRow {
  // 日期格式轉換：YYYY-MM-DD → YYYY/MM/DD
  const toSlash = (d?: string) => d?.replace(/-/g, '/') ?? '';

  // supplierCodeName 格式為「廠商代碼+名稱」，嘗試分割
  // 若無法分割，整體作為 vendorName
  const codeNameParts = item.supplierCodeName?.split('(') ?? [];
  const vendorCode = codeNameParts.length > 1
    ? codeNameParts[0].trim()
    : (item.supplierCodeName ?? '');
  const vendorName = item.supplierCodeName ?? '';

  // orderSeq → schedLineIndex 用的 scheduleLine
  const schedLine: ScheduleLine = {
    index: parseInt(item.itemNo ?? '1', 10) || 1,
    expectedDelivery: toSlash(item.expectedDelivery),
    deliveryDate: toSlash(item.supplierCanDeliverDate),
    productionScheduleDate: toSlash(item.productionScheduleDate),
    quantity: item.deliveryQty ?? 0,
  };

  return {
    id: index,                                     // MDO 無 id，用 index 暫代
    status: (item.status as OrderRow['status']) ?? 'NP',
    orderNo: item.purchaseOrderNo,
    orderDate: '',                                 // ⚠️ schedule-changes 無訂單日期
    orderType: '',                                 // ⚠️ MDO 未提供
    orderSeq: item.orderSeq ?? '',
    docSeqNo: item.docSeqNo ?? '',
    vendorCode,
    vendorName,
    materialNo: item.materialNo ?? '',
    productName: '',                               // ⚠️ MDO 未提供
    specification: item.longSpec ?? '',            // 🟡 longSpec 近似規格
    orderQty: item.plannedDeliveryQty ?? 0,        // 🟡 plannedDeliveryQty ≈ orderQty
    acceptQty: item.deliveredQty ?? 0,             // 🟡 deliveredQty ≈ acceptQty
    expectedDelivery: toSlash(item.expectedDelivery),
    vendorDeliveryDate: toSlash(item.supplierCanDeliverDate) || undefined,
    deliveryQty: item.deliveryQty ?? 0,
    productionScheduleDate: toSlash(item.productionScheduleDate),
    inTransitQty: 0,                               // ⚠️ MDO 未提供
    undeliveredQty: item.remainingQty ?? 0,        // ✅
    scheduleLines: [schedLine],
    purchaseOrg: undefined,                        // ⚠️ MDO 未提供
    company: undefined,
    purchaser: undefined,
    currency: '',
    unit: '',
  };
}

export function useScheduleChanges(
  options: UseScheduleChangesOptions
): UseScheduleChangesResult {
  const { autoFetch = true, ...params } = options;
  const [raw, setRaw] = useState<MdoScheduleChangeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  const load = useCallback(async () => {
    if (!params.purchaseOrderNo) return; // 必填驗證
    const fetchId = ++fetchCountRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchScheduleChanges(params as FetchScheduleChangesParams);
      if (fetchId !== fetchCountRef.current) return;
      setRaw(result.data);
      setTotal(result.total);
    } catch (e) {
      if (fetchId !== fetchCountRef.current) return;
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      if (fetchId === fetchCountRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    if (autoFetch) load();
  }, [autoFetch, load]);

  return {
    raw,
    rows: raw.map(mapScheduleChangeToRow),
    total,
    loading,
    error,
    refetch: load,
  };
}
