import { useState } from 'react';
import svgPaths from "@/imports/svg-imw9bns98t";
import { OrderDetail } from './OrderDetail';
import { AdvancedOrderTable, getOrderColumns } from './AdvancedOrderTable';
import type { OrderRow, OrderColumn, ScheduleLine } from './AdvancedOrderTable';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import {
  BatchReplyImportOverlay, CsvToolbarButtons,
  exportOrdersCsv, exportOrdersExcel,
  exportBatchReplyScheduleLine, exportBatchReplySplitOrder,
  type BatchReplyImportResult, type ExportType,
} from './OrderCsvManager';
import { SearchField } from './SearchField';
import { StatusMultiSelect } from './StatusMultiSelect';
import type { StatusOption } from './StatusMultiSelect';
import { useOrderStore, nowDateStr, operatorByRole, type HistoryEntry } from './OrderStoreContext';
export { exchangeOrderMockData } from './exchangeOrderData';

// ── 換貨(J)單狀態選項（完整 NP / V / B / CK / CL）──────────────────────────
const EXCHANGE_STATUS_OPTIONS: StatusOption[] = [
  { value: 'NP', label: 'NP - 未處理',     color: '#b71d18', bgColor: 'rgba(255,86,48,0.16)' },
  { value: 'V',  label: 'V - 廠商確認中',   color: '#006c9c', bgColor: 'rgba(0,184,217,0.16)' },
  { value: 'B',  label: 'B - 採購確認中',   color: '#5119b7', bgColor: 'rgba(142,51,255,0.16)' },
  { value: 'CK', label: 'CK - 訂單已確認',  color: '#118d57', bgColor: 'rgba(34,197,94,0.16)' },
  { value: 'CL', label: 'CL - 關閉結案',    color: '#637381', bgColor: 'rgba(145,158,171,0.16)' },
];

type ExchangeStatus = 'ALL' | 'NP' | 'V' | 'B' | 'CK' | 'CL';

// ── Tab 組件（Badge 色彩對齊一般訂單查詢）─────────────────────────────────
interface TabItemProps {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  status?: ExchangeStatus;
}

function TabItem({ label, count, isActive, onClick, status }: TabItemProps) {
  const getBadgeStyle = (s?: ExchangeStatus) => {
    if (!isActive || !s) return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
    switch (s) {
      case 'NP': return { bgColor: 'bg-[rgba(255,86,48,0.16)]',   textColor: 'text-[#b71d18]' };
      case 'V':  return { bgColor: 'bg-[rgba(0,184,217,0.16)]',   textColor: 'text-[#006c9c]' };
      case 'B':  return { bgColor: 'bg-[rgba(142,51,255,0.16)]',  textColor: 'text-[#5119b7]' };
      case 'CK': return { bgColor: 'bg-[rgba(34,197,94,0.16)]',   textColor: 'text-[#118d57]' };
      case 'CL': return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
      default:   return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
    }
  };
  const badgeStyle = getBadgeStyle(status);

  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
        {label}
      </p>
      {count !== undefined && (
        <div className={`${badgeStyle.bgColor} content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${badgeStyle.textColor} text-[12px] text-center`}>
            {count}
          </p>
        </div>
      )}
    </div>
  );
}

// ── 主元件（功能對齊 OrderListWithTabs）──────────────────────────────────────
export function ExchangeOrderListWithTabs({ userRole }: { userRole?: string }) {
  const [activeTab, setActiveTab] = useState<ExchangeStatus>('NP');
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [orderSourceTab, setOrderSourceTab] = useState<ExchangeStatus>('NP');
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());

  // ── Exchange Order Store（共享狀態 & 歷程）─────────────────────────────────
  const { exchangeOrders, updateExchangeOrderStatus, addExchangeOrderHistory, getExchangeOrderHistory } = useOrderStore();

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<OrderColumn[]>([]);
  const [tempColumns, setTempColumns] = useState<OrderColumn[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  const [showCsvImport, setShowCsvImport] = useState(false);

  // Per-tab search states（每個 Tab 搜尋條件獨立儲存）
  interface TabSearchState {
    docSeqNo: string;
    orderDateFrom: string;
    orderDateTo: string;
    orderNo: string;
    statusFilter: string[];   // 僅 ALL Tab 使用
  }
  const emptySearch: TabSearchState = { docSeqNo: '', orderDateFrom: '', orderDateTo: '', orderNo: '', statusFilter: [] };
  const [tabSearchMap, setTabSearchMap] = useState<Record<string, TabSearchState>>({});

  const getTabSearch = (tab: string): TabSearchState => tabSearchMap[tab] ?? emptySearch;
  const updateTabSearch = (tab: string, patch: Partial<TabSearchState>) => {
    setTabSearchMap(prev => ({ ...prev, [tab]: { ...(prev[tab] ?? emptySearch), ...patch } }));
  };

  const currentSearch = getTabSearch(activeTab);
  const docSeqNoSearch = currentSearch.docSeqNo;
  const orderDateFrom  = currentSearch.orderDateFrom;
  const orderDateTo    = currentSearch.orderDateTo;
  const orderNoSearch  = currentSearch.orderNo;
  const statusFilter   = currentSearch.statusFilter;
  const setDocSeqNoSearch = (v: string) => updateTabSearch(activeTab, { docSeqNo: v });
  const setOrderDateFrom  = (v: string) => updateTabSearch(activeTab, { orderDateFrom: v });
  const setOrderDateTo    = (v: string) => updateTabSearch(activeTab, { orderDateTo: v });
  const setOrderNoSearch  = (v: string) => updateTabSearch(activeTab, { orderNo: v });
  const setStatusFilter   = (v: string[]) => updateTabSearch(activeTab, { statusFilter: v });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentUserEmail] = useState<string>(() =>
    localStorage.getItem('currentUserEmail') || 'default'
  );

  // 使用 Context 的 exchangeOrders 取代本地 state（資料與歷程共享）
  const localData = exchangeOrders;

  // ── 多關鍵字搜尋輔助：支援頓號（、）與逗號（,/，）分隔 ──────────────────
  const splitKeywords = (input: string): string[] =>
    input.split(/[、,，]/).map(s => s.trim().toLowerCase()).filter(Boolean);

  const matchesAnyKeyword = (value: string, keywords: string[]): boolean =>
    keywords.some(kw => value.toLowerCase().includes(kw));

  // ── 搜尋列篩選邏輯（即時過濾）──────────────────────────────────────────
  const applySearchToOrders = (src: OrderRow[], search: TabSearchState): OrderRow[] => {
    let result = src;
    if (search.docSeqNo.trim()) {
      const keywords = splitKeywords(search.docSeqNo);
      result = result.filter(o => matchesAnyKeyword((o.orderNo || '') + (o.orderSeq || ''), keywords));
    }
    if (search.orderNo.trim()) {
      const keywords = splitKeywords(search.orderNo);
      result = result.filter(o => matchesAnyKeyword(o.orderNo || '', keywords));
    }
    if (search.orderDateFrom.trim()) {
      const from = search.orderDateFrom.trim().replace(/-/g, '/');
      result = result.filter(o => o.orderDate >= from);
    }
    if (search.orderDateTo.trim()) {
      const to = search.orderDateTo.trim().replace(/-/g, '/');
      result = result.filter(o => o.orderDate <= to);
    }
    if (search.statusFilter.length > 0) {
      result = result.filter(o => search.statusFilter.includes(o.status));
    }
    return result;
  };

  const searchFilteredData = applySearchToOrders(localData, currentSearch);

  // Tab badge 數量（每個 Tab 各自套用其搜尋條件）
  const counts = (() => {
    const statusTabs: Array<'NP' | 'V' | 'B' | 'CK' | 'CL'> = ['NP', 'V', 'B', 'CK', 'CL'];
    const result: Record<string, number> = {};
    for (const st of statusTabs) {
      const tabOrders = localData.filter(o => o.status === st);
      const filtered = applySearchToOrders(tabOrders, getTabSearch(st));
      result[st] = filtered.length;
    }
    return result as Record<'NP' | 'V' | 'B' | 'CK' | 'CL', number>;
  })();

  // Toolbar 顯示筆數（含進階篩選條件）
  const getFilteredOrders = () => {
    let filtered = activeTab === 'ALL'
      ? searchFilteredData
      : searchFilteredData.filter(o => o.status === activeTab);
    if (appliedFilters.length > 0) {
      filtered = filtered.filter(item =>
        appliedFilters.every(filter => {
          const itemValue = item[filter.column as keyof OrderRow];
          const filterValue = filter.value;
          switch (filter.operator) {
            case 'contains':   return itemValue !== undefined && String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
            case 'equals':     return itemValue !== undefined && String(itemValue).toLowerCase() === filterValue.toLowerCase();
            case 'notEquals':  return itemValue === undefined || String(itemValue).toLowerCase() !== filterValue.toLowerCase();
            case 'startsWith': return itemValue !== undefined && String(itemValue).toLowerCase().startsWith(filterValue.toLowerCase());
            case 'endsWith':   return itemValue !== undefined && String(itemValue).toLowerCase().endsWith(filterValue.toLowerCase());
            case 'isEmpty':    return !itemValue || String(itemValue).trim() === '';
            case 'isNotEmpty': return itemValue !== undefined && String(itemValue).trim() !== '';
            default:           return true;
          }
        })
      );
    }
    return filtered;
  };

  const getFilteredCount = () => getFilteredOrders().length;

  const displayedOrders = activeTab === 'ALL' ? searchFilteredData : searchFilteredData.filter(o => o.status === activeTab);
  const isAllSelected   = displayedOrders.length > 0 && displayedOrders.every(o => selectedOrderIds.has(o.id));

  const handleSelectAll = () => {
    const newSet = new Set(selectedOrderIds);
    if (isAllSelected) { displayedOrders.forEach(o => newSet.delete(o.id)); }
    else               { displayedOrders.forEach(o => newSet.add(o.id)); }
    setSelectedOrderIds(newSet);
  };

  const handleToggleOrder = (orderId: number) => {
    const newSet = new Set(selectedOrderIds);
    newSet.has(orderId) ? newSet.delete(orderId) : newSet.add(orderId);
    setSelectedOrderIds(newSet);
  };

  const handleOrderConfirmClick = (order: OrderRow) => {
    setSelectedOrder(order); setOrderSourceTab(order.status as ExchangeStatus);
    setIsReadOnlyMode(false); setShowOrderDetail(true);
  };
  const handleMoreOptionsClick = (order: OrderRow) => {
    setSelectedOrder(order); setOrderSourceTab(order.status as ExchangeStatus);
    setIsReadOnlyMode(true); setShowOrderDetail(true);
  };
  const handleCloseDetail  = () => { setShowOrderDetail(false); setSelectedOrder(null); setIsReadOnlyMode(false); };

  // 狀態流轉：NP/V→B→CK，支援退回（→NP）與強制關單（B→CL）+ 歷程記錄
  const handleStatusChange = (
    newStatus: string,
    eventText?: string,
    remark?: string,
    vendorDeliveryDate?: string,
    splitLines?: ScheduleLine[]
  ) => {
    if (!selectedOrder) return;
    const oldStatus = selectedOrder.status;
    const resolvedEventText = eventText || `狀態變更 (${oldStatus}→${newStatus})`;
    const entry: HistoryEntry = {
      date: nowDateStr(),
      event: resolvedEventText,
      operator: operatorByRole(userRole),
      remark: remark ?? '',
    };
    const rowUpdate: Partial<Omit<OrderRow, 'id' | 'status'>> = {};
    if (vendorDeliveryDate) rowUpdate.vendorDeliveryDate = vendorDeliveryDate;
    if (resolvedEventText === '不接單') {
      rowUpdate.isRejectedOrder = true;
    } else {
      rowUpdate.isRejectedOrder = false;
    }
    if (splitLines && splitLines.length > 0) {
      rowUpdate.scheduleLines = splitLines;
      if (splitLines.length >= 2) {
        rowUpdate.vendorDeliveryDate = splitLines[splitLines.length - 1].deliveryDate;
      }
    }
    // ── 追蹤調整單據類型 ──
    if (resolvedEventText.startsWith('拆單')) {
      rowUpdate.adjustmentType = 'split-order';
    } else if (resolvedEventText.startsWith('拆 Schedule Line')) {
      rowUpdate.adjustmentType = 'split';
    } else if (resolvedEventText.startsWith('需修改交期')) {
      rowUpdate.adjustmentType = 'modify';
      // 廠商從拆期/拆單改回需修改交期時，把多筆排程合併回 1 筆
      rowUpdate.scheduleLines = [{
        index: 1,
        expectedDelivery: selectedOrder.expectedDelivery,
        deliveryDate: vendorDeliveryDate || selectedOrder.vendorDeliveryDate || '',
        quantity: selectedOrder.orderQty,
      }];
    } else if (resolvedEventText === '不接單') {
      rowUpdate.adjustmentType = 'reject';
    }
    // ── 不接單訂單確認 CL 覆寫：若廠商對此單選擇了「不接單」，採購進行訂單確認時狀態直接轉 CL
    const isVendorRejected = selectedOrder.isRejectedOrder === true;
    const effectiveStatus = (newStatus === 'CK' && isVendorRejected) ? 'CL' : newStatus;
    if (effectiveStatus !== newStatus) {
      entry.event = `訂單確認（不接單→CL）`;
    }

    updateExchangeOrderStatus(
      selectedOrder.id,
      effectiveStatus as OrderRow['status'],
      entry,
      Object.keys(rowUpdate).length > 0 ? rowUpdate : undefined
    );
    setShowOrderDetail(false);
    setSelectedOrder(null);
    setActiveTab(effectiveStatus as ExchangeStatus);
    showToast(`訂單已更新為 ${effectiveStatus} 狀態`);
  };

  const handleColumnsChange = (columns: OrderColumn[]) => setAvailableColumns(columns);

  const handleToggleColumn = (key: string) =>
    setTempColumns(tempColumns.map(col => col.key === key ? { ...col, visible: !(col.visible !== false) } : col));

  const handleToggleAll = (selectAll: boolean) =>
    setTempColumns(tempColumns.map(col => ({ ...col, visible: selectAll })));

  const handleApplyColumns = () => {
    const storageKey = `exchangeOrderList_${currentUserEmail}_${activeTab}_columns`;
    try { localStorage.setItem(storageKey, JSON.stringify(tempColumns)); } catch { /* */ }
    setAvailableColumns(tempColumns);
    setColumnsVersion(prev => prev + 1);
    setShowColumnSelector(false);
  };

  const handleColumnsClick = () => {
    let cols = availableColumns;
    if (cols.length === 0) {
      const storageKey = `exchangeOrderList_${currentUserEmail}_${activeTab}_columns`;
      try { const saved = localStorage.getItem(storageKey); cols = saved ? JSON.parse(saved) : getOrderColumns(); }
      catch { cols = getOrderColumns(); }
    }
    setTempColumns(JSON.parse(JSON.stringify(cols)));
    setShowColumnSelector(!showColumnSelector);
  };

  const handleApplyFilters = () => { setAppliedFilters(filters); setShowFilterDialog(false); };
  const handleTabChange    = (tab: ExchangeStatus) => { setActiveTab(tab); setSelectedOrderIds(new Set()); };

  const getSelectedOrders = (): OrderRow[] => localData.filter(o => selectedOrderIds.has(o.id));

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  // ── 批次確認（NP/V→B，B→CK）+ 歷程記錄 ────────────────────────────────
  const handleBatchAction = (action: 'approve') => {
    if (action === 'approve') {
      const selected = getSelectedOrders();
      if (selected.length === 0) return;

      let confirmedCount = 0;
      for (const order of selected) {
        const s = order.status;
        // NP / V → B（廠商確認交期OK）、B → CK（採購確認訂單）
        let newStatus: OrderRow['status'] | null = null;
        let eventText = '';
        if (s === 'NP' || s === 'V') {
          newStatus = 'B';
          eventText = `廠商確認交期OK (${s}→B)【批次同意】`;
        } else if (s === 'B') {
          newStatus = 'CK';
          eventText = '採購確認訂單 (B→CK)【批次同意】';
        }
        if (!newStatus) continue;

        // 廠商可交貨日期 = 預計交期（視同廠商同意如期交貨）
        const vendorDate = order.expectedDelivery || '';
        const entry: HistoryEntry = {
          date: nowDateStr(),
          event: eventText,
          operator: operatorByRole(userRole),
          remark: vendorDate ? `廠商可交貨日期：${vendorDate}` : '',
        };
        const rowUpdate: Partial<Omit<OrderRow, 'id' | 'status'>> = {};
        if (vendorDate) rowUpdate.vendorDeliveryDate = vendorDate;

        updateExchangeOrderStatus(order.id, newStatus, entry, Object.keys(rowUpdate).length > 0 ? rowUpdate : undefined);
        confirmedCount++;
      }

      setSelectedOrderIds(new Set());
      if (confirmedCount > 0) {
        showToast(`已成功確認 ${confirmedCount} 筆換貨單`);
      } else {
        showToast('所選單據狀態無法執行訂單確認');
      }
    }
  };

  // ── Export 處理（Excel / CSV / 批次回覆範本下載）───────────────────────
  const handleExportSelect = (type: ExportType) => {
    const filteredOrders = getFilteredOrders();
    const tabLabel = activeTab === 'ALL' ? '全部' : activeTab;
    const dateSuffix = new Date().toISOString().slice(0, 10);

    switch (type) {
      case 'excel': {
        const currentCols = availableColumns.length > 0 ? availableColumns : getOrderColumns();
        const count = exportOrdersExcel(filteredOrders, `換貨單匯出_${tabLabel}_${dateSuffix}.xlsx`, currentCols);
        showToast(`已匯出 ${count} 筆換貨單 (Excel)`);
        break;
      }
      case 'csv': {
        const currentCols = availableColumns.length > 0 ? availableColumns : getOrderColumns();
        exportOrdersCsv(filteredOrders, `換貨單匯出_${tabLabel}_${dateSuffix}.csv`, currentCols);
        showToast(`已匯出 ${filteredOrders.length} 筆換貨單 (CSV)`);
        break;
      }
      case 'batchReplySchedule': {
        const npvCount = filteredOrders.filter(o => o.status === 'NP' || o.status === 'V').length;
        if (npvCount === 0) { showToast('目前篩選結果中沒有 NP 或 V 狀態的訂單可下載'); return; }
        const count = exportBatchReplyScheduleLine(filteredOrders, `批次回覆_拆ScheduleLine_${tabLabel}_${dateSuffix}.xlsx`, { hideRejectOption: true });
        showToast(`已下載 ${count} 列批次回覆 — 拆 Schedule Line (NP/V 訂單)`);
        break;
      }
      case 'batchReplySplit': {
        const npvCount2 = filteredOrders.filter(o => o.status === 'NP' || o.status === 'V').length;
        if (npvCount2 === 0) { showToast('目前篩選結果中沒有 NP 或 V 狀態的訂單可下載'); return; }
        const count = exportBatchReplySplitOrder(filteredOrders, localData, `批次回覆_拆單_${tabLabel}_${dateSuffix}.xlsx`, { hideRejectOption: true });
        showToast(`已下載 ${count} 筆批次回覆 — 拆單 (NP/V 訂單)`);
        break;
      }
    }
  };

  // ── 批次回覆匯入：寫入 OrderStoreContext + 歷程紀錄 ──────────────────────
  const handleBatchReplyConfirm = (result: BatchReplyImportResult) => {
    const now = nowDateStr();
    const op = operatorByRole(userRole);
    const modeText = result.mode === 'split-order' ? '拆單' : '拆 Schedule Line';

    // Y — 訂單確認：NP/V → B（等同 OrderDetail 的【訂單確認】按鈕）
    for (const row of result.agreeRows) {
      if (!row.matchedOrder) continue;
      const order = row.matchedOrder;
      const oldStatus = order.status;

      const validDeliveries = row.deliveries.filter(d => d.date && d.qty > 0);
      const schedLines: ScheduleLine[] = validDeliveries.map((d, i) => ({
        index: i + 1,
        deliveryDate: d.date,
        quantity: d.qty,
      }));

      const vendorDate = validDeliveries.length > 0
        ? validDeliveries[validDeliveries.length - 1].date
        : order.expectedDelivery;

      const entry: HistoryEntry = {
        date: now,
        event: `廠商確認交期OK (${oldStatus}→B)`,
        operator: op,
        remark: '批次匯入',
      };

      const rowUpdate: Partial<Omit<OrderRow, 'id' | 'status'>> = {
        vendorDeliveryDate: vendorDate,
      };
      if (schedLines.length > 0) rowUpdate.scheduleLines = schedLines;

      updateExchangeOrderStatus(order.id, 'B', entry, rowUpdate);
    }

    // N — 調整單據：NP/V → B（等同 OrderDetail 的【調整單據】按鈕）
    for (const row of result.disagreeRows) {
      if (!row.matchedOrder) continue;
      const order = row.matchedOrder;
      const oldStatus = order.status;

      const validDeliveries = row.deliveries.filter(d => d.date && d.qty > 0);
      const schedLines: ScheduleLine[] = validDeliveries.map((d, i) => ({
        index: i + 1,
        deliveryDate: d.date,
        quantity: d.qty,
      }));

      const vendorDate = validDeliveries.length > 0
        ? validDeliveries[validDeliveries.length - 1].date
        : '';

      // reasonText 對齊 AdjustOrderForm 格式
      let reasonText: string;
      let remarkText: string;
      if (validDeliveries.length <= 1) {
        const newDate = validDeliveries[0]?.date || '';
        reasonText = `需修改交期為 ${newDate}`;
        remarkText = validDeliveries.length > 0
          ? `新交期: ${validDeliveries[0].date}×${validDeliveries[0].qty}`
          : '廠商提出調整';
      } else if (result.mode === 'split-order') {
        reasonText = `拆單（${validDeliveries.length} 期）`;
        remarkText = validDeliveries.map((d, idx) =>
          `項次${idx + 1}：${d.date} × ${d.qty}`
        ).join('；');
      } else {
        reasonText = `拆 Schedule Line（${validDeliveries.length} 期）`;
        remarkText = validDeliveries.map((d, idx) =>
          `項次${idx + 1}：${d.date} × ${d.qty}`
        ).join('；');
      }

      const entry: HistoryEntry = {
        date: now,
        event: reasonText,
        operator: op,
        remark: remarkText,
      };

      const rowUpdate: Partial<Omit<OrderRow, 'id' | 'status'>> = {};
      if (vendorDate) rowUpdate.vendorDeliveryDate = vendorDate;
      if (schedLines.length > 0) rowUpdate.scheduleLines = schedLines;

      updateExchangeOrderStatus(order.id, 'B', entry, rowUpdate);
    }

    // 換貨(J)單不支援「不接單」，故略過 rejectOrderRows

    const totalActions = result.agreeRows.length + result.disagreeRows.length;
    const parts: string[] = [];
    if (result.agreeRows.length > 0) parts.push(`訂單確認 ${result.agreeRows.length} 筆`);
    if (result.disagreeRows.length > 0) parts.push(`調整單據 ${result.disagreeRows.length} 筆`);
    showToast(`批次回覆匯入完成（${modeText}）: ${parts.join(' / ')}，共 ${totalActions} 筆已寫入`);
    setShowCsvImport(false);
  };

  // ── OrderDetail 全頁 ──────────────────────────────────────────────────
  if (showOrderDetail) {
    return (
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
        <OrderDetail
          onClose={handleCloseDetail}
          orderData={selectedOrder ? {
            orderNo: selectedOrder.orderNo, orderSeq: selectedOrder.orderSeq,
            vendor: selectedOrder.vendorName, status: selectedOrder.status,
            orderQty: selectedOrder.orderQty,
            comparePrice: selectedOrder.comparePrice,
            unit: selectedOrder.unit,
            acceptQty: selectedOrder.acceptQty,
            vendorDeliveryDate: selectedOrder.vendorDeliveryDate,
            scheduleLines: selectedOrder.scheduleLines,
            expectedDelivery: selectedOrder.expectedDelivery,
          } : undefined}
          onStatusChange={!isReadOnlyMode ? handleStatusChange : undefined}
          isReadOnly={isReadOnlyMode}
          userRole={userRole}
          orderHistory={selectedOrder ? getExchangeOrderHistory(selectedOrder.id) : []}
          hideRejectAndSplitOrder
        />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── Tabs（ALL / NP / V / B / CK / CL）────────────────────────────── */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full overflow-x-auto">
            <TabItem label="All" isActive={activeTab === 'ALL'} onClick={() => handleTabChange('ALL')} />
            <TabItem label="未處理(NP)"     count={counts.NP} isActive={activeTab === 'NP'} onClick={() => handleTabChange('NP')} status="NP" />
            <TabItem label="廠商確認中(V)"   count={counts.V}  isActive={activeTab === 'V'}  onClick={() => handleTabChange('V')}  status="V" />
            <TabItem label="採購確認中(B)"   count={counts.B}  isActive={activeTab === 'B'}  onClick={() => handleTabChange('B')}  status="B" />
            <TabItem label="訂單已確認(CK)" isActive={activeTab === 'CK'} onClick={() => handleTabChange('CK')} status="CK" />
            <TabItem label="關閉結案(CL)"   isActive={activeTab === 'CL'} onClick={() => handleTabChange('CL')} status="CL" />
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>
      </div>

      {/* ── Search bar（ALL Tab 兩列佈局 + StatusMultiSelect；其餘單列）───── */}
      <div className="relative shrink-0 w-full" style={{ borderBottom: 'none' }}>
        {activeTab === 'ALL' ? (
          <div className="flex flex-col gap-[12px] px-[20px] pt-[20px] pb-[16px]" style={{ borderBottom: 'none' }}>
            {/* Row 1: 單號序號 + 訂單號碼 + 訂單狀態 */}
            <div className="flex gap-[16px] items-start">
              <SearchField label="單號序號" value={docSeqNoSearch} onChange={setDocSeqNoSearch} />
              <SearchField label="訂單號碼" value={orderNoSearch}  onChange={setOrderNoSearch} />
              <StatusMultiSelect label="訂單狀態" selected={statusFilter} onChange={setStatusFilter} options={EXCHANGE_STATUS_OPTIONS} />
            </div>
            {/* Row 2: 訂單日期起迄 */}
            <div className="flex gap-[16px] items-center">
              <SearchField label="訂單日期(起)" value={orderDateFrom} onChange={setOrderDateFrom} type="date" />
              <SearchField label="訂單日期(迄)" value={orderDateTo}   onChange={setOrderDateTo}   type="date" />
              <div className="flex-1" />
            </div>
          </div>
        ) : (
          <div className="flex gap-[16px] items-center px-[20px] py-[20px]" style={{ borderBottom: 'none' }}>
            <SearchField label="單號序號"     value={docSeqNoSearch} onChange={setDocSeqNoSearch} />
            <SearchField label="訂單日期(起)" value={orderDateFrom}  onChange={setOrderDateFrom} type="date" />
            <SearchField label="訂單日期(迄)" value={orderDateTo}    onChange={setOrderDateTo}   type="date" />
            <SearchField label="訂單號碼"     value={orderNoSearch}  onChange={setOrderNoSearch} />
          </div>
        )}
      </div>

      {/* ── Toolbar（對齊一般訂單：Columns / Filters / Export / 批次回覆）──── */}
      <TableToolbar
        resultsCount={getFilteredCount()}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={() => setShowFilterDialog(!showFilterDialog)}
        columnsButton={
          <ColumnSelector
            columns={tempColumns}
            onToggleColumn={handleToggleColumn}
            onToggleAll={handleToggleAll}
            onClose={() => setShowColumnSelector(false)}
            onApply={handleApplyColumns}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={availableColumns.length > 0 ? availableColumns : getOrderColumns()}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />
        }
        actionButton={
          <div className="flex items-center gap-[12px]">
            {/* CSV 匯出 / 匯入（對齊一般訂單） */}
            <CsvToolbarButtons
              onExportSelect={handleExportSelect}
              onImport={() => setShowCsvImport(true)}
              hideBatchReply={activeTab === 'B' || activeTab === 'CK' || activeTab === 'CL'}
              hideBatchReplySplit
            />
            {/* 資料更新時間 */}
            <div className="flex gap-0 h-[36px] items-center shrink-0 rounded-[8px] border border-[#005eb8] border-solid overflow-hidden">
              <div className="bg-white flex items-center justify-center px-[12px] h-full">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#005eb8] text-[13px] whitespace-nowrap">
                  資料更新時間:2025/05/05 12:30
                </p>
              </div>
              <div className="bg-[#005eb8] flex items-center justify-center h-full w-[36px] shrink-0 cursor-pointer hover:bg-[#004a94]">
                <div className="shrink-0 size-[20px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                    <path d={svgPaths.pe11c500} fill="white" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <AdvancedOrderTable
        activeTab={activeTab}
        data={searchFilteredData}
        onOrderConfirm={handleOrderConfirmClick}
        onMoreOptions={handleMoreOptionsClick}
        userEmail={currentUserEmail}
        userRole={userRole}
        onColumnsChange={handleColumnsChange}
        columnsVersion={columnsVersion}
        appliedFilters={appliedFilters}
        selectedOrderIds={selectedOrderIds}
        onToggleOrder={handleToggleOrder}
        onSelectAll={handleSelectAll}
        onBatchAction={handleBatchAction}
      />

      {/* ── 批次回覆匯入 Overlay ─────────────────────────────────────────── */}
      {showCsvImport && (
        <BatchReplyImportOverlay
          allOrders={localData}
          onConfirm={handleBatchReplyConfirm}
          onClose={() => setShowCsvImport(false)}
          hideRejectOption
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-10.5l-5 5L6 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}