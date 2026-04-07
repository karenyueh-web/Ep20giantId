import { createContext, useContext, useState, useRef, type ReactNode } from 'react';
import { orderMockData } from './AdvancedOrderTable';
import { returnOrderMockData } from './returnOrderData';
import { exchangeOrderMockData } from './exchangeOrderData';
import type { OrderRow } from './AdvancedOrderTable';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HistoryEntry {
  date: string;       // 'YYYY/MM/DD HH:mm'
  event: string;      // e.g. '廠商確認交期OK(NP→B)'
  operator: string;   // e.g. '廠商-OOO' / '巨大-OOO'
  remark: string;
}

export type CorrectionStatus = 'DR' | 'V' | 'B' | 'CP' | 'SS' | 'CL';

export interface CorrectionOrderRow {
  id: number;
  correctionDocNo: string;       // 修正單號
  correctionStatus: CorrectionStatus;
  correctionType: string;        // e.g. '不拆單'
  // 原訂單資訊
  orderNo: string;
  orderSeq: string;
  docSeqNo: string;
  vendorCode: string;
  vendorName: string;
  purchaseOrg: string;
  materialNo: string;
  productName: string;
  orderDate: string;
  orderQty: number;
  acceptQty: number;
  company: string;
  createdAt: string;             // 開立時間
  // 原訂單交貨相關欄位（供明細頁還原完整顯示）
  expectedDelivery?: string;     // 預計交期
  vendorDeliveryDate?: string;   // 原廠商交期
  agreedDate?: string;           // 協議日期
  inTransitQty?: number;         // 在途量
  deliveryQty?: number;          // 交貨量
  // 修正內容（開立時儲存，供查詢明細顯示）
  newMaterialNo?: string;
  correctionNote?: string;
  // 已編輯的交貨排程（DR 暫存時保存，供繼續編輯還原）
  savedDeliveryRows?: SavedDeliveryRow[];
  savedPeriodInput?: string;     // 使用者輸入的期數
}

/** 序列化用的交貨排程列 */
export interface SavedDeliveryRow {
  expectedDelivery: string;
  vendorOriginalDate: string;
  newVendorDate: string;
  originalQty: number;
  newQty: string;
  deleted?: boolean;
  // 拆單專用欄位
  splitOrderSeq?: string;
  splitNewMaterialNo?: string;
}

interface OrderStore {
  // ── 一般訂單 ──────────────────────────────────────────────────────────────
  orders: OrderRow[];
  updateOrderStatus: (
    id: number,
    newStatus: OrderRow['status'],
    entry: HistoryEntry,
    rowUpdate?: Partial<Omit<OrderRow, 'id' | 'status'>>
  ) => void;
  updateOrderFields: (
    id: number,
    fields: Partial<Omit<OrderRow, 'id' | 'status'>>
  ) => void;
  addOrder: (order: OrderRow) => void;
  addOrderHistory: (id: number, entry: HistoryEntry) => void;
  getOrderHistory: (id: number) => HistoryEntry[];

  // ── 換貨單 ────────────────────────────────────────────────────────────────
  returnOrders: OrderRow[];
  updateReturnOrderStatus: (
    id: number,
    newStatus: OrderRow['status'],
    entry: HistoryEntry,
    rowUpdate?: Partial<Omit<OrderRow, 'id' | 'status'>>
  ) => void;
  getReturnOrderHistory: (id: number) => HistoryEntry[];

  // ── 換貨(J)單 ──────────────────────────────────────────────────────────────
  exchangeOrders: OrderRow[];
  updateExchangeOrderStatus: (
    id: number,
    newStatus: OrderRow['status'],
    entry: HistoryEntry,
    rowUpdate?: Partial<Omit<OrderRow, 'id' | 'status'>>
  ) => void;
  addExchangeOrderHistory: (id: number, entry: HistoryEntry) => void;
  getExchangeOrderHistory: (id: number) => HistoryEntry[];

  // ── 修正單 ──────────────────────────────────────────────────────────────
  correctionOrders: CorrectionOrderRow[];
  addCorrectionOrder: (order: CorrectionOrderRow) => void;
  updateCorrectionOrder: (id: number, docNo: string, updates: Partial<CorrectionOrderRow>) => void;
  deleteCorrectionOrders: (ids: number[]) => void;
  addCorrectionHistory: (id: number, entry: HistoryEntry) => void;
  getCorrectionHistory: (id: number) => HistoryEntry[];
  /** 產生新修正單號（YYYYMMDD + 4位全域流水號，每次呼叫自動遞增） */
  generateCorrectionDocNo: () => string;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const OrderStoreContext = createContext<OrderStore | null>(null);

// ─── Helper: 格式化現在時間 ────────────────────────────────────────────────────
export function nowDateStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Helper: 依角色取操作人員名稱 ─────────────────────────────────────────────
export function operatorByRole(role?: string): string {
  if (role === 'giant') return '巨大-OOO';
  if (role === 'vendor') return '廠商-OOO';
  return '採購-OOO';
}

// ─── Helper: 初始化歷程 Map ────────────────────────────────────────────────────
function buildInitialHistoryMap(data: OrderRow[]): Record<number, HistoryEntry[]> {
  const map: Record<number, HistoryEntry[]> = {};
  data.forEach(o => {
    map[o.id] = [
      { date: o.orderDate + ' 00:00', event: '訂單成立', operator: 'OOO', remark: '' },
    ];
  });
  return map;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function OrderStoreProvider({ children }: { children: ReactNode }) {
  // ── 一般訂單 state ──────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<OrderRow[]>(() =>
    orderMockData.map(o => ({ ...o }))
  );
  const [historyMap, setHistoryMap] = useState<Record<number, HistoryEntry[]>>(() =>
    buildInitialHistoryMap(orderMockData)
  );

  const updateOrderStatus = (
    id: number,
    newStatus: OrderRow['status'],
    entry: HistoryEntry,
    rowUpdate?: Partial<Omit<OrderRow, 'id' | 'status'>>
  ) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status: newStatus, ...(rowUpdate ?? {}) } : o
      )
    );
    setHistoryMap(prev => ({
      ...prev,
      [id]: [entry, ...(prev[id] ?? [])],
    }));
  };

  const updateOrderFields = (
    id: number,
    fields: Partial<Omit<OrderRow, 'id' | 'status'>>
  ) => {
    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, ...fields } : o)
    );
  };

  const addOrder = (order: OrderRow) => {
    setOrders(prev => [...prev, order]);
  };

  const addOrderHistory = (id: number, entry: HistoryEntry) => {
    setHistoryMap(prev => ({
      ...prev,
      [id]: [entry, ...(prev[id] ?? [])],
    }));
  };

  const getOrderHistory = (id: number): HistoryEntry[] =>
    historyMap[id] ?? [];

  // ── 換貨單 state ────────────────────────────────────────────────────────────
  const [returnOrders, setReturnOrders] = useState<OrderRow[]>(() =>
    returnOrderMockData.map(o => ({ ...o }))
  );
  const [returnHistoryMap, setReturnHistoryMap] = useState<Record<number, HistoryEntry[]>>(() =>
    buildInitialHistoryMap(returnOrderMockData)
  );

  const updateReturnOrderStatus = (
    id: number,
    newStatus: OrderRow['status'],
    entry: HistoryEntry,
    rowUpdate?: Partial<Omit<OrderRow, 'id' | 'status'>>
  ) => {
    setReturnOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status: newStatus, ...(rowUpdate ?? {}) } : o
      )
    );
    setReturnHistoryMap(prev => ({
      ...prev,
      [id]: [entry, ...(prev[id] ?? [])],
    }));
  };

  const getReturnOrderHistory = (id: number): HistoryEntry[] =>
    returnHistoryMap[id] ?? [];

  // ── 換貨(J)單 state ──────────────────────────────────────────────────────────
  const [exchangeOrders, setExchangeOrders] = useState<OrderRow[]>(() =>
    exchangeOrderMockData.map(o => ({ ...o }))
  );
  const [exchangeHistoryMap, setExchangeHistoryMap] = useState<Record<number, HistoryEntry[]>>(() =>
    buildInitialHistoryMap(exchangeOrderMockData)
  );

  const updateExchangeOrderStatus = (
    id: number,
    newStatus: OrderRow['status'],
    entry: HistoryEntry,
    rowUpdate?: Partial<Omit<OrderRow, 'id' | 'status'>>
  ) => {
    setExchangeOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status: newStatus, ...(rowUpdate ?? {}) } : o
      )
    );
    setExchangeHistoryMap(prev => ({
      ...prev,
      [id]: [entry, ...(prev[id] ?? [])],
    }));
  };

  const addExchangeOrderHistory = (id: number, entry: HistoryEntry) => {
    setExchangeHistoryMap(prev => ({
      ...prev,
      [id]: [entry, ...(prev[id] ?? [])],
    }));
  };

  const getExchangeOrderHistory = (id: number): HistoryEntry[] =>
    exchangeHistoryMap[id] ?? [];

  // ── 修正單 state ────────────────────────────────────────────────────────────
  const [correctionOrders, setCorrectionOrders] = useState<CorrectionOrderRow[]>([]);
  const [correctionHistoryMap, setCorrectionHistoryMap] = useState<Record<number, HistoryEntry[]>>({});

  /**
   * 全域修正單流水號計數器（按日期隔離）。
   * - correctionDocNoDateRef：記錄目前計數器對應的日期（YYYYMMDD）
   * - correctionDocNoSeqRef：該日期已用掉的流水號數量
   * 每次 generateCorrectionDocNo() 呼叫時：
   *   若日期已變更 → 重置計數器（從今天已有的修正單數量起算）
   *   若日期相同   → 直接 +1
   * 確保多張批次單在同一呼叫中各自取得唯一號碼，且每天從 0001 起算。
   */
  const correctionDocNoDateRef = useRef<string>('');
  const correctionDocNoSeqRef = useRef<number>(0);

  const generateCorrectionDocNo = (): string => {
    const d = new Date();
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;

    // 日期不同 → 重置；從今天 store 中已存在的修正單數量起算，避免重號
    if (correctionDocNoDateRef.current !== dateStr) {
      correctionDocNoDateRef.current = dateStr;
      const todayCount = correctionOrders.filter(
        o => o.correctionDocNo?.startsWith(dateStr)
      ).length;
      correctionDocNoSeqRef.current = todayCount;
    }

    correctionDocNoSeqRef.current += 1;
    const seq = String(correctionDocNoSeqRef.current).padStart(4, '0');
    return `${dateStr}${seq}`;
  };

  const addCorrectionOrder = (order: CorrectionOrderRow) => {
    setCorrectionOrders(prev => {
      // 若 (id, correctionDocNo) 組合已存在，以 update 取代 add，避免重複 key
      const idx = prev.findIndex(o => o.id === order.id && o.correctionDocNo === order.correctionDocNo);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = order;
        return next;
      }
      return [...prev, order];
    });
  };

  const updateCorrectionOrder = (id: number, docNo: string, updates: Partial<CorrectionOrderRow>) => {
    setCorrectionOrders(prev =>
      prev.map(o =>
        o.id === id && o.correctionDocNo === docNo ? { ...o, ...updates } : o
      )
    );
  };

  const deleteCorrectionOrders = (ids: number[]) => {
    setCorrectionOrders(prev =>
      prev.filter(o => !ids.includes(o.id))
    );
  };

  const addCorrectionHistory = (id: number, entry: HistoryEntry) => {
    setCorrectionHistoryMap(prev => ({
      ...prev,
      [id]: [entry, ...(prev[id] ?? [])],
    }));
  };

  const getCorrectionHistory = (id: number): HistoryEntry[] =>
    correctionHistoryMap[id] ?? [];

  return (
    <OrderStoreContext.Provider value={{
      orders, updateOrderStatus, updateOrderFields, addOrder, addOrderHistory, getOrderHistory,
      returnOrders, updateReturnOrderStatus, getReturnOrderHistory,
      exchangeOrders, updateExchangeOrderStatus, addExchangeOrderHistory, getExchangeOrderHistory,
      correctionOrders, addCorrectionOrder, updateCorrectionOrder, deleteCorrectionOrders, addCorrectionHistory, getCorrectionHistory,
      generateCorrectionDocNo,
    }}>
      {children}
    </OrderStoreContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
const NOOP_STORE: OrderStore = {
  orders: [],
  updateOrderStatus: () => {},
  updateOrderFields: () => {},
  addOrder: () => {},
  addOrderHistory: () => {},
  getOrderHistory: () => [],
  returnOrders: [],
  updateReturnOrderStatus: () => {},
  getReturnOrderHistory: () => [],
  exchangeOrders: [],
  updateExchangeOrderStatus: () => {},
  addExchangeOrderHistory: () => {},
  getExchangeOrderHistory: () => [],
  correctionOrders: [],
  addCorrectionOrder: () => {},
  updateCorrectionOrder: () => {},
  deleteCorrectionOrders: () => {},
  addCorrectionHistory: () => {},
  getCorrectionHistory: () => [],
  generateCorrectionDocNo: () => '',
};

export function useOrderStore(): OrderStore {
  const ctx = useContext(OrderStoreContext);
  if (!ctx) {
    return NOOP_STORE;
  }
  return ctx;
}