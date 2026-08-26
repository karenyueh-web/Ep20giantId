/**
 * usePurchaseOrders
 *
 * 封裝 MDO purchase-orders / exchange-orders / return-orders API 呼叫。
 * 回傳原始 MdoPurchaseOrder[] 供頁面自行處理，或呼叫 mapPurchaseOrderToRow
 * 轉換為 OrderRow 使用。
 *
 * 使用方式：
 *   const { data, total, loading, error, refetch } = usePurchaseOrders({ status: 'NP' });
 *
 * 換貨/退貨單：
 *   const { data } = useExchangeOrders({ supplierCode: 'XXX' });
 *   const { data } = useReturnOrders({ supplierCode: 'XXX' });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchPurchaseOrders,
  fetchExchangeOrders,
  fetchReturnOrders,
  mapPurchaseOrderToRow,
  type MdoPurchaseOrder,
  type FetchPurchaseOrdersParams,
} from '../api/order/purchase-orders';
import type { OrderRow } from './AdvancedOrderTable';

// ─── 一般訂單 Hook ──────────────────────────────────────────────────────────

interface UsePurchaseOrdersOptions extends FetchPurchaseOrdersParams {
  /** 自動載入（預設 true）*/
  autoFetch?: boolean;
}

interface UsePurchaseOrdersResult {
  /** 原始 MDO 資料 */
  raw: MdoPurchaseOrder[];
  /** 轉換後的前端 OrderRow（可直接傳入表格）*/
  rows: OrderRow[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePurchaseOrders(
  options: UsePurchaseOrdersOptions = {}
): UsePurchaseOrdersResult {
  const { autoFetch = true, ...params } = options;
  const [raw, setRaw] = useState<MdoPurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  const load = useCallback(async () => {
    const fetchId = ++fetchCountRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPurchaseOrders(params);
      if (fetchId !== fetchCountRef.current) return; // 防 race condition
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
    rows: raw.map(mapPurchaseOrderToRow),
    total,
    loading,
    error,
    refetch: load,
  };
}

// ─── 換貨(J)訂單 Hook ──────────────────────────────────────────────────────

interface UseExchangeOrdersOptions {
  supplierCode?: string;
  status?: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useExchangeOrders(
  options: UseExchangeOrdersOptions = {}
): UsePurchaseOrdersResult {
  const { autoFetch = true, ...params } = options;
  const [raw, setRaw] = useState<MdoPurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  const load = useCallback(async () => {
    const fetchId = ++fetchCountRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExchangeOrders(params);
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
    rows: raw.map(mapPurchaseOrderToRow),
    total,
    loading,
    error,
    refetch: load,
  };
}

// ─── 退貨訂單 Hook ──────────────────────────────────────────────────────────

export function useReturnOrders(
  options: UseExchangeOrdersOptions = {}
): UsePurchaseOrdersResult {
  const { autoFetch = true, ...params } = options;
  const [raw, setRaw] = useState<MdoPurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  const load = useCallback(async () => {
    const fetchId = ++fetchCountRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchReturnOrders(params);
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
    rows: raw.map(mapPurchaseOrderToRow),
    total,
    loading,
    error,
    refetch: load,
  };
}
