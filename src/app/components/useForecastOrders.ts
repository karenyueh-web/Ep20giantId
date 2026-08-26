/**
 * useForecastOrders
 *
 * 封裝 MDO forecast-orders API 呼叫。
 * ⚠️ supplierCode 為必填參數，呼叫前請確保已取得登入者的廠商代碼。
 *
 * 使用方式：
 *   const { data, total, loading, error, refetch } = useForecastOrders({
 *     supplierCode: currentSupplierCode,
 *     deliveryWeek: '2026-W35',
 *   });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchForecastOrders,
  type MdoForecastOrder,
  type FetchForecastOrdersParams,
} from '../api/order/forecast-orders';
import type { ForecastOrderRow } from './AdvancedForecastTable';

interface UseForecastOrdersOptions extends FetchForecastOrdersParams {
  /** 自動載入（預設 true）*/
  autoFetch?: boolean;
}

interface UseForecastOrdersResult {
  /** 原始 MDO 資料 */
  raw: MdoForecastOrder[];
  /** 轉換後的前端 ForecastOrderRow（可直接傳入表格）*/
  rows: ForecastOrderRow[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 將 MdoForecastOrder → 前端 ForecastOrderRow
 *
 * 對應欄位：
 *   purchaseGroup     ← purchaseGroup    ✅
 *   purchaseOrg       ← purchaseOrg      ✅
 *   companyCode       ← companyCode      ✅
 *   vendor            ← supplierCode     🟡（僅代碼，待補廠商名）
 *   uploadWeek        ← uploadWeek       ✅
 *   deliveryWeek      ← deliveryWeek     ✅
 *   materialNo        ← materialNo       ✅
 *   vendorMaterialNo  ← supplierMaterialNo ✅
 *   productName       ← productName      ✅
 *   leadTime          ← leadTime         ✅
 *   deliveryDate      ← deliveryDate     ✅
 *   purchaseQty       ← purchaseQty      ✅
 *   diffQty           ← diffQty          ✅
 *   unit              ← unit             ✅
 *   updatedBy         ← （MDO 未提供，留空）
 *   updatedDate       ← （MDO 未提供，留空）
 */
function mapForecastToRow(item: MdoForecastOrder, index: number): ForecastOrderRow {
  return {
    id: index + 1,                           // MDO 無 id 欄位，用 index 暫代
    purchaseGroup: item.purchaseGroup ?? '',
    purchaseOrg: item.purchaseOrg ?? '',
    companyCode: item.companyCode ?? '',
    vendor: item.supplierCode,               // 🟡 僅顯示代碼，待補廠商名
    uploadWeek: item.uploadWeek ?? '',
    deliveryWeek: item.deliveryWeek ?? '',
    materialNo: item.materialNo,
    vendorMaterialNo: item.supplierMaterialNo ?? '',
    productName: item.productName ?? '',
    leadTime: item.leadTime ?? 0,
    deliveryDate: item.deliveryDate ?? '',
    purchaseQty: item.purchaseQty ?? 0,
    diffQty: item.diffQty ?? 0,
    unit: item.unit ?? '',
    updatedBy: '',                           // ⚠️ MDO 未提供
    updatedDate: '',                         // ⚠️ MDO 未提供
  };
}

export function useForecastOrders(
  options: UseForecastOrdersOptions
): UseForecastOrdersResult {
  const { autoFetch = true, ...params } = options;
  const [raw, setRaw] = useState<MdoForecastOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  const load = useCallback(async () => {
    if (!params.supplierCode) return; // 必填驗證
    const fetchId = ++fetchCountRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchForecastOrders(params as FetchForecastOrdersParams);
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
    rows: raw.map(mapForecastToRow),
    total,
    loading,
    error,
    refetch: load,
  };
}
