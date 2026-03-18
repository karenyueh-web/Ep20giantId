import { useState } from 'react';
import svgPaths from "@/imports/svg-imw9bns98t";
import { OrderDetail } from './OrderDetail';
import { AdvancedOrderTable, getOrderColumns, defaultOrderColumns, computeRowDayDiff } from './AdvancedOrderTable';
import type { OrderRow, OrderColumn, ScheduleLine } from './AdvancedOrderTable';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { BatchReplyImportOverlay, CsvToolbarButtons, exportOrdersCsv, exportOrdersExcel, exportBatchReplyScheduleLine, exportBatchReplySplitOrder, type BatchReplyImportResult, type ExportType } from './OrderCsvManager';
import { SearchField } from './SearchField';
import { StatusMultiSelect } from './StatusMultiSelect';
import { useOrderStore, nowDateStr, operatorByRole, type HistoryEntry, type CorrectionOrderRow } from './OrderStoreContext';

type OrderStatus = 'ALL' | 'NP' | 'V' | 'B' | 'CK' | 'CL';

interface OrderListWithTabsProps {
  defaultTab?: OrderStatus;
  userRole?: string;
}

// Tab組件
interface TabItemProps {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  status?: OrderStatus;
}

function TabItem({ label, count, isActive, onClick, status }: TabItemProps) {
  const getBadgeStyle = (status?: OrderStatus) => {
    if (!isActive || !status) {
      return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
    }
    switch (status) {
      case 'NP': return { bgColor: 'bg-[rgba(255,86,48,0.16)]', textColor: 'text-[#b71d18]' };
      case 'V': return { bgColor: 'bg-[rgba(0,184,217,0.16)]', textColor: 'text-[#006c9c]' };
      case 'B': return { bgColor: 'bg-[rgba(142,51,255,0.16)]', textColor: 'text-[#5119b7]' };
      case 'CK': return { bgColor: 'bg-[rgba(34,197,94,0.16)]', textColor: 'text-[#118d57]' };
      case 'CL': return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
      default: return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
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

export function OrderListWithTabs({ defaultTab = 'NP', userRole }: OrderListWithTabsProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus>(defaultTab);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());

  // ── Order Store（共享狀態 & 歷程）──────────────────────────────────────────
  const { orders, updateOrderStatus, updateOrderFields, addOrder, addOrderHistory, getOrderHistory, addCorrectionOrder, addCorrectionHistory, generateCorrectionDocNo } = useOrderStore();

  // Columns / Filters states
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<OrderColumn[]>([]);
  const [tempColumns, setTempColumns] = useState<OrderColumn[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // CSV import overlay state
  const [showCsvImport, setShowCsvImport] = useState(false);

  // Per-tab search states
  interface TabSearchState {
    docSeqNo: string;
    orderDateFrom: string;
    orderDateTo: string;
    orderNo: string;
    statusFilter: string[];
  }
  const emptySearch: TabSearchState = { docSeqNo: '', orderDateFrom: '', orderDateTo: '', orderNo: '', statusFilter: [] };
  const [tabSearchMap, setTabSearchMap] = useState<Record<string, TabSearchState>>({});

  const getTabSearch = (tab: string): TabSearchState => tabSearchMap[tab] ?? emptySearch;
  const updateTabSearch = (tab: string, patch: Partial<TabSearchState>) => {
    setTabSearchMap(prev => ({ ...prev, [tab]: { ...(prev[tab] ?? emptySearch), ...patch } }));
  };

  // Convenience accessors for active tab
  const currentSearch = getTabSearch(activeTab);
  const docSeqNoSearch = currentSearch.docSeqNo;
  const orderDateFrom = currentSearch.orderDateFrom;
  const orderDateTo = currentSearch.orderDateTo;
  const orderNoSearch = currentSearch.orderNo;
  const statusFilter = currentSearch.statusFilter;
  const setDocSeqNoSearch = (v: string) => updateTabSearch(activeTab, { docSeqNo: v });
  const setOrderDateFrom = (v: string) => updateTabSearch(activeTab, { orderDateFrom: v });
  const setOrderDateTo = (v: string) => updateTabSearch(activeTab, { orderDateTo: v });
  const setOrderNoSearch = (v: string) => updateTabSearch(activeTab, { orderNo: v });
  const setStatusFilter = (v: string[]) => updateTabSearch(activeTab, { statusFilter: v });

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User email
  const [currentUserEmail] = useState<string>(() => {
    return localStorage.getItem('currentUserEmail') || 'default';
  });

  // ── 多關鍵字搜尋輔助：支援頓號（、）與逗號（,）分隔 ─────────────────────
  const splitKeywords = (input: string): string[] =>
    input.split(/[、,，]/).map(s => s.trim().toLowerCase()).filter(Boolean);

  const matchesAnyKeyword = (value: string, keywords: string[]): boolean =>
    keywords.some(kw => value.toLowerCase().includes(kw));

  // ─ 搜尋列篩選邏輯（即時過濾 orders）─────────────────────────────────────
  const searchFilteredOrders = (() => {
    let result = orders;
    // 單號序號（模糊比對 orderNo+orderSeq，支援多關鍵字）
    if (docSeqNoSearch.trim()) {
      const keywords = splitKeywords(docSeqNoSearch);
      result = result.filter(o => matchesAnyKeyword((o.orderNo || '') + (o.orderSeq || ''), keywords));
    }
    // 訂單號碼（模糊比對 orderNo，支援多關鍵字）
    if (orderNoSearch.trim()) {
      const keywords = splitKeywords(orderNoSearch);
      result = result.filter(o => matchesAnyKeyword(o.orderNo, keywords));
    }
    // 訂單日期區間（比對 orderDate，格式 YYYY/MM/DD）
    if (orderDateFrom.trim()) {
      const from = orderDateFrom.trim().replace(/-/g, '/');
      result = result.filter(o => o.orderDate >= from);
    }
    if (orderDateTo.trim()) {
      const to = orderDateTo.trim().replace(/-/g, '/');
      result = result.filter(o => o.orderDate <= to);
    }
    // 訂單狀態（複選篩選，空陣列 = 全部）
    if (statusFilter.length > 0) {
      result = result.filter(o => statusFilter.includes(o.status));
    }
    return result;
  })();

  // 計算 tab 量（每個 Tab 使用自身的搜尋條件，互不影響）
  const applySearchToOrders = (src: OrderRow[], search: TabSearchState): OrderRow[] => {
    let result = src;
    if (search.docSeqNo.trim()) {
      const keywords = splitKeywords(search.docSeqNo);
      result = result.filter(o => matchesAnyKeyword((o.orderNo || '') + (o.orderSeq || ''), keywords));
    }
    if (search.orderNo.trim()) {
      const keywords = splitKeywords(search.orderNo);
      result = result.filter(o => matchesAnyKeyword(o.orderNo, keywords));
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

  const counts = (() => {
    const statusTabs: Array<'NP' | 'V' | 'B' | 'CK' | 'CL'> = ['NP', 'V', 'B', 'CK', 'CL'];
    const result: Record<string, number> = {};
    for (const st of statusTabs) {
      const tabOrders = orders.filter(o => o.status === st);
      const filtered = applySearchToOrders(tabOrders, getTabSearch(st));
      result[st] = filtered.length;
    }
    return result as Record<'NP' | 'V' | 'B' | 'CK' | 'CL', number>;
  })();

  // Filtered count for toolbar（支援 dayDiff 計算欄位）
  const getFilteredCount = () => {
    let filtered = activeTab === 'ALL' ? searchFilteredOrders : searchFilteredOrders.filter(o => o.status === activeTab);
    if (appliedFilters.length > 0) {
      filtered = filtered.filter(item => {
        return appliedFilters.every(filter => {
          let rawValue: string;
          if (filter.column === 'dayDiff') {
            const diff = computeRowDayDiff(item);
            rawValue = diff === null ? '-' : diff > 0 ? `+${diff}` : `${diff}`;
          } else {
            const v = item[filter.column as keyof OrderRow];
            rawValue = v !== undefined && v !== null ? String(v) : '';
          }
          const filterValue = filter.value;
          switch (filter.operator) {
            case 'contains':   return rawValue.toLowerCase().includes(filterValue.toLowerCase());
            case 'equals':     return rawValue.toLowerCase() === filterValue.toLowerCase();
            case 'notEquals':  return rawValue.toLowerCase() !== filterValue.toLowerCase();
            case 'startsWith': return rawValue.toLowerCase().startsWith(filterValue.toLowerCase());
            case 'endsWith':   return rawValue.toLowerCase().endsWith(filterValue.toLowerCase());
            case 'isEmpty':    return !rawValue || rawValue.trim() === '' || rawValue === '-';
            case 'isNotEmpty': return rawValue.trim() !== '' && rawValue !== '-';
            default:           return true;
          }
        });
      });
    }
    return filtered.length;
  };

  // Checkbox（使用 live orders）
  const displayedOrders = activeTab === 'ALL' ? searchFilteredOrders : searchFilteredOrders.filter(o => o.status === activeTab);
  const isAllSelected = displayedOrders.length > 0 && displayedOrders.every(order => selectedOrderIds.has(order.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedOrderIds);
      displayedOrders.forEach(order => newSet.delete(order.id));
      setSelectedOrderIds(newSet);
    } else {
      const newSet = new Set(selectedOrderIds);
      displayedOrders.forEach(order => newSet.add(order.id));
      setSelectedOrderIds(newSet);
    }
  };

  const handleToggleOrder = (orderId: number) => {
    const newSet = new Set(selectedOrderIds);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    setSelectedOrderIds(newSet);
  };

  // Order actions
  const handleOrderConfirmClick = (order: OrderRow) => {
    setSelectedOrder(order);
    setIsReadOnlyMode(false);
    setShowOrderDetail(true);
  };

  const handleMoreOptionsClick = (order: OrderRow) => {
    setSelectedOrder(order);
    setIsReadOnlyMode(true);
    setShowOrderDetail(true);
  };

  const handleCloseDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
    setIsReadOnlyMode(false);
  };

  const handleOrderConfirm = () => {
    // superseded by handleStatusChange — no-op
  };

  // Columns handlers
  const handleColumnsChange = (columns: OrderColumn[]) => {
    setAvailableColumns(columns);
  };

  const handleToggleColumn = (key: string) => {
    const updatedColumns = tempColumns.map(col =>
      col.key === key ? { ...col, visible: !(col.visible !== false) } : col
    );
    setTempColumns(updatedColumns);
  };

  const handleToggleAll = (selectAll: boolean) => {
    setTempColumns(tempColumns.map(col => ({ ...col, visible: selectAll })));
  };

  const handleApplyColumns = () => {
    // 使用與 AdvancedOrderTable 相同的 v2 key 格式
    const safeTab = activeTab.replace(/[^a-zA-Z0-9]/g, '_');
    const storageKey = `orderList_v2_${currentUserEmail}_${safeTab}_columns`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(tempColumns));
      setAvailableColumns(tempColumns);
      setColumnsVersion(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save columns:', error);
    }
    setShowColumnSelector(false);
  };

  const handleColumnsClick = () => {
    let columnsToUse = availableColumns;
    if (columnsToUse.length === 0) {
      const safeTab = activeTab.replace(/[^a-zA-Z0-9]/g, '_');
      const storageKey = `orderList_v2_${currentUserEmail}_${safeTab}_columns`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const savedCols = JSON.parse(saved) as OrderColumn[];
          // 智慧合併：以 defaultOrderColumns 為基準套用已儲存的寬度/可見性
          columnsToUse = defaultOrderColumns.map(col => {
            const savedCol = savedCols.find(s => s.key === col.key);
            return savedCol ? { ...col, width: savedCol.width, visible: savedCol.visible } : col;
          });
        } else {
          columnsToUse = getOrderColumns();
        }
      } catch (error) {
        columnsToUse = getOrderColumns();
      }
    }
    setTempColumns(JSON.parse(JSON.stringify(columnsToUse)));
    setShowColumnSelector(!showColumnSelector);
  };

  // Filters handlers
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterDialog(false);
  };

  // Tab change
  const handleTabChange = (tab: OrderStatus) => {
    setActiveTab(tab);
    setSelectedOrderIds(new Set());
  };

  // ===== Batch action handlers =====
  const getSelectedOrders = (): OrderRow[] => {
    return orders.filter(o => selectedOrderIds.has(o.id));
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

        const rowUpdate: Partial<Omit<OrderRow, 'id' | 'status'>> = {};
        let remarkText = '';

        if (s === 'NP' || s === 'V') {
          // NP/V → B：廠商確認交期OK，記錄廠商可交貨日期
          const vendorDate = order.expectedDelivery || '';
          if (vendorDate) {
            rowUpdate.vendorDeliveryDate = vendorDate;
            remarkText = `廠商可交貨日期：${vendorDate}`;
          }
        }
        // B → CK：採購確認訂單，不需額外設定廠商可交貨日期

        const entry: HistoryEntry = {
          date: nowDateStr(),
          event: eventText,
          operator: operatorByRole(userRole),
          remark: remarkText,
        };

        updateOrderStatus(order.id, newStatus, entry, Object.keys(rowUpdate).length > 0 ? rowUpdate : undefined);
        confirmedCount++;

        // ── 批次確認 B→CK 時，若為拆單訂單：執行拆單 + 自動開立修正單 ──
        if (newStatus === 'CK' && order.adjustmentType === 'split-order' && order.scheduleLines && order.scheduleLines.length > 0) {
          executeSplitOrder(order, order.scheduleLines, 'CK');
          autoCreateSplitCorrectionOrder(order, order.scheduleLines);
        }
      }

      setSelectedOrderIds(new Set());
      if (confirmedCount > 0) {
        showToast(`已成功確認 ${confirmedCount} 筆訂單`);
      } else {
        showToast('所選訂單狀態無法執行訂單確認');
      }
    }
  };

  // ── 訂單明細操作：狀態變更 + 歷程記錄 + 切換 Tab ────────────────────────────
  const handleStatusChange = (
    newStatus: string,
    eventText: string,
    remark?: string,
    vendorDeliveryDate?: string,
    splitLines?: ScheduleLine[]
  ) => {
    if (!selectedOrder) return;
    const entry: HistoryEntry = {
      date: nowDateStr(),
      event: eventText,
      operator: operatorByRole(userRole),
      remark: remark ?? '',
    };
    const rowUpdate: Partial<Omit<OrderRow, 'id' | 'status'>> = {};
    if (vendorDeliveryDate) rowUpdate.vendorDeliveryDate = vendorDeliveryDate;
    if (eventText === '不接單') {
      rowUpdate.isRejectedOrder = true;
    } else {
      // 非不接單操作時，清除不接單標記
      rowUpdate.isRejectedOrder = false;
    }
    if (splitLines && splitLines.length > 0) {
      rowUpdate.scheduleLines = splitLines;
      // 2筆以上拆期：列表欄位抓最後一筆（最晚）的廠商可交貨日期
      if (splitLines.length >= 2) {
        rowUpdate.vendorDeliveryDate = splitLines[splitLines.length - 1].deliveryDate;
      }
    }
    // ── 追蹤調整單據類型 ──
    if (eventText.startsWith('拆單')) {
      rowUpdate.adjustmentType = 'split-order';
    } else if (eventText.startsWith('拆 Schedule Line')) {
      rowUpdate.adjustmentType = 'split';
    } else if (eventText.startsWith('需修改交期')) {
      rowUpdate.adjustmentType = 'modify';
    } else if (eventText === '不接單') {
      rowUpdate.adjustmentType = 'reject';
    }

    updateOrderStatus(
      selectedOrder.id,
      newStatus as OrderRow['status'],
      entry,
      Object.keys(rowUpdate).length > 0 ? rowUpdate : undefined
    );

    // ── 拆單單轉 CK 時：執行拆單 + 自動開立拆單類型修正單（最終狀態 SS） ──
    if (newStatus === 'CK') {
      // 從 store 取最新的 order（因為上方 updateOrderStatus 已更新）
      const latestOrder = orders.find(o => o.id === selectedOrder.id);
      const adjType = rowUpdate.adjustmentType || latestOrder?.adjustmentType;
      if (adjType === 'split-order') {
        const schedLines = rowUpdate.scheduleLines || latestOrder?.scheduleLines || selectedOrder.scheduleLines;
        if (schedLines && schedLines.length > 0) {
          executeSplitOrder(selectedOrder, schedLines, 'CK');
          autoCreateSplitCorrectionOrder(selectedOrder, schedLines);
        }
      }
    }

    setShowOrderDetail(false);
    setSelectedOrder(null);
    setActiveTab(newStatus as OrderStatus);
    showToast(`訂單已更新為 ${newStatus} 狀態`);
  };

  // ── 拆單執行：將一張拆單訂單拆成多張獨立訂單 ──────────────────────────────
  // 原訂單保留第一筆排程資料（orderSeq 不變），後續排程各自新增為獨立訂單
  // 每張拆出的單都是 CK 狀態，各自擁有單一交貨排程（項次 1）
  const executeSplitOrder = (order: OrderRow, schedLines: ScheduleLine[], targetStatus: OrderRow['status'] = 'CK') => {
    const now = nowDateStr();

    if (schedLines.length <= 1) return; // 單筆不需拆

    // 第 1 筆：更新原訂單（orderSeq 不變），覆蓋交貨排程為單一筆
    // 新交貨量 → 訂貨量，其餘從原單同步
    const firstLine = schedLines[0];
    updateOrderFields(order.id, {
      orderQty: firstLine.quantity,
      vendorDeliveryDate: firstLine.deliveryDate,
      adjustmentType: undefined, // 清除拆單標記，已完成拆單
      scheduleLines: [{ index: 1, expectedDelivery: firstLine.expectedDelivery || order.expectedDelivery, deliveryDate: firstLine.deliveryDate, quantity: firstLine.quantity }],
    });
    addOrderHistory(order.id, {
      date: now,
      event: '拆單執行完成',
      operator: '系統',
      remark: `保留序號 ${firstLine.index}，訂貨量 ${firstLine.quantity}，交期 ${firstLine.deliveryDate}`,
    });

    // 第 2 筆起：各自新增為獨立訂單
    // 新交貨量 → 訂貨量，其餘全部從原單同步
    for (let i = 1; i < schedLines.length; i++) {
      const line = schedLines[i];
      const newSeq = String(line.index); // 新序號已在 scheduleLines.index 中計算好
      const newId = Date.now() + Math.floor(Math.random() * 100000) + i;

      const newOrder: OrderRow = {
        ...order,
        id: newId,
        status: targetStatus,
        orderSeq: newSeq,
        docSeqNo: order.orderNo + newSeq,
        orderQty: line.quantity,
        vendorDeliveryDate: line.deliveryDate,
        adjustmentType: undefined,
        scheduleLines: [{ index: 1, expectedDelivery: line.expectedDelivery || order.expectedDelivery, deliveryDate: line.deliveryDate, quantity: line.quantity }],
      };

      addOrder(newOrder);
      addOrderHistory(newId, {
        date: now,
        event: '訂單成立（拆單產生）',
        operator: '系統',
        remark: `由原訂單 ${order.orderNo}-${order.orderSeq} 拆單產生`,
      });
    }
  };

  // ── 自動開立拆單修正單（一般訂單拆單 → CK 時觸發） ──────────────────────────
  const autoCreateSplitCorrectionOrder = (order: OrderRow, schedLines: ScheduleLine[]) => {
    const now = nowDateStr();
    const docNo = generateCorrectionDocNo();
    const correctionId = Date.now() + Math.floor(Math.random() * 10000);

    // ── 計算拆單序號基準（與 CorrectionDetailPage 相同邏輯） ──
    // 項次1 = 原序號, 項次2+ = maxSeqInSameOrderNo + idx*10
    const orderSeqNum = parseInt(order.orderSeq, 10);
    const sameOrderNoOrders = orders.filter(o => o.orderNo === order.orderNo);
    const allSeqs = sameOrderNoOrders.map(o => parseInt(o.orderSeq, 10)).filter(n => !isNaN(n));
    const maxSeqInSameOrderNo = allSeqs.length > 0 ? Math.max(...allSeqs) : orderSeqNum;

    // 欄位對應（依圖說明）：
    // 新序號 → 訂單序號 (第一筆=原序號, 後續=maxSeq + idx*10)
    // 預計交期 → 預計交期
    // 廠商可交貨日期 → 新廠商交期
    // 交貨量 → 新交貨量
    // 新料號 → 帶入原料號
    // 原廠商交期 = 預計交期
    const savedRows = schedLines.map((line, idx) => ({
      expectedDelivery: order.expectedDelivery,
      vendorOriginalDate: order.expectedDelivery,  // 原廠商交期 = 預計交期
      newVendorDate: line.deliveryDate,             // 廠商可交貨日期 → 新廠商交期
      originalQty: order.orderQty,
      newQty: String(line.quantity),                // 交貨量 → 新交貨量
      splitOrderSeq: String(idx === 0 ? orderSeqNum : maxSeqInSameOrderNo + idx * 10), // 單序號
      splitNewMaterialNo: order.materialNo,         // 新料號 → 帶入原料號
    }));

    const correctionOrder: CorrectionOrderRow = {
      id: correctionId,
      correctionDocNo: docNo,
      correctionStatus: 'SS',                       // 最終狀態為 SS
      correctionType: '拆單',
      orderNo: order.orderNo,
      orderSeq: order.orderSeq,
      docSeqNo: order.orderNo + order.orderSeq,
      vendorCode: order.vendorCode,
      vendorName: order.vendorName,
      purchaseOrg: order.purchaseOrg || '',
      materialNo: order.materialNo,
      productName: order.productName,
      orderDate: order.orderDate,
      orderQty: order.orderQty,
      acceptQty: order.acceptQty,
      company: order.company || '',
      createdAt: now,
      expectedDelivery: order.expectedDelivery,
      vendorDeliveryDate: order.expectedDelivery,   // 原廠商交期 = 預計交期
      inTransitQty: order.inTransitQty,
      deliveryQty: order.deliveryQty,
      newMaterialNo: order.materialNo,              // 新料號帶入原料號
      savedDeliveryRows: savedRows,
      savedPeriodInput: String(schedLines.length),
    };

    addCorrectionOrder(correctionOrder);

    // ── 歷程紀錄：開單轉修正單 + 狀態轉換歷程 ──
    addCorrectionHistory(correctionId, {
      date: now,
      event: '一般訂單拆單確認，自動開立正單 (→SS)',
      operator: '系統',
      remark: `原訂單 ${order.orderNo}-${order.orderSeq} 拆單確認(CK)，自動轉為拆單修正單`,
    });
    addCorrectionHistory(correctionId, {
      date: now,
      event: '修正單開立（訂單拆單→修正單）',
      operator: '系統',
      remark: `修正單號: ${docNo}`,
    });

    // ── 在原訂單歷程中記錄自動開立修正單 ──
    addOrderHistory(order.id, {
      date: now,
      event: `系統自動開立修正單`,
      operator: '系統',
      remark: `修正單號: ${docNo}，拆單確認後自動產生`,
    });
  };

  // ===== CSV handlers =====
  // Helper: get filtered orders respecting tab + applied filters
  const getFilteredOrders = () => {
    let filteredOrders = activeTab === 'ALL'
      ? searchFilteredOrders
      : searchFilteredOrders.filter(o => o.status === activeTab);
    
    if (appliedFilters.length > 0) {
      filteredOrders = filteredOrders.filter(item => {
        return appliedFilters.every(filter => {
          let rawValue: string;
          if (filter.column === 'dayDiff') {
            const diff = computeRowDayDiff(item);
            rawValue = diff === null ? '-' : diff > 0 ? `+${diff}` : `${diff}`;
          } else {
            const v = item[filter.column as keyof OrderRow];
            rawValue = v !== undefined && v !== null ? String(v) : '';
          }
          const filterValue = filter.value;
          switch (filter.operator) {
            case 'contains':   return rawValue.toLowerCase().includes(filterValue.toLowerCase());
            case 'equals':     return rawValue.toLowerCase() === filterValue.toLowerCase();
            case 'notEquals':  return rawValue.toLowerCase() !== filterValue.toLowerCase();
            case 'startsWith': return rawValue.toLowerCase().startsWith(filterValue.toLowerCase());
            case 'endsWith':   return rawValue.toLowerCase().endsWith(filterValue.toLowerCase());
            case 'isEmpty':    return !rawValue || rawValue.trim() === '' || rawValue === '-';
            case 'isNotEmpty': return rawValue.trim() !== '' && rawValue !== '-';
            default:           return true;
          }
        });
      });
    }
    return filteredOrders;
  };

  const handleExportSelect = (type: ExportType) => {
    const filteredOrders = getFilteredOrders();
    const tabLabel = activeTab === 'ALL' ? '全部' : activeTab;
    const dateSuffix = new Date().toISOString().slice(0, 10);

    switch (type) {
      case 'excel': {
        const currentCols = availableColumns.length > 0 ? availableColumns : getOrderColumns();
        const count = exportOrdersExcel(filteredOrders, `訂單匯出_${tabLabel}_${dateSuffix}.xlsx`, currentCols);
        showToast(`已匯出 ${count} 筆訂單 (Excel)`);
        break;
      }
      case 'csv': {
        const currentCols = availableColumns.length > 0 ? availableColumns : getOrderColumns();
        exportOrdersCsv(filteredOrders, `訂單匯出_${tabLabel}_${dateSuffix}.csv`, currentCols);
        showToast(`已匯出 ${filteredOrders.length} 筆訂單 (CSV)`);
        break;
      }
      case 'batchReplySchedule': {
        const npvCount = filteredOrders.filter(o => o.status === 'NP' || o.status === 'V').length;
        if (npvCount === 0) {
          showToast('目前篩選結果中沒有 NP 或 V 狀態的訂單可下載');
          return;
        }
        const count = exportBatchReplyScheduleLine(filteredOrders, `批次回覆_拆ScheduleLine_${tabLabel}_${dateSuffix}.xlsx`);
        showToast(`已下載 ${count} 列批次回覆 — 拆 Schedule Line (NP/V 訂單)`);
        break;
      }
      case 'batchReplySplit': {
        const npvCount2 = filteredOrders.filter(o => o.status === 'NP' || o.status === 'V').length;
        if (npvCount2 === 0) {
          showToast('目前篩選結果中沒有 NP 或 V 狀態的訂單可下載');
          return;
        }
        const count = exportBatchReplySplitOrder(filteredOrders, orders, `批次回覆_拆單_${tabLabel}_${dateSuffix}.xlsx`);
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

      // Build schedule lines from vendor deliveries
      const validDeliveries = row.deliveries.filter(d => d.date && d.qty > 0);
      const orderSeqNum = parseInt(order.orderSeq, 10) || 10;
      const schedLines: ScheduleLine[] = validDeliveries.map((d, i) => ({
        index: result.mode === 'split-order'
          ? orderSeqNum + i * 10   // 拆單：新序號 = 原序號 + idx*10
          : i + 1,                 // 拆 Schedule Line：項次 1,2,3...
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

      updateOrderStatus(order.id, 'B', entry, rowUpdate);
    }

    // N — 調整單據：NP/V → B（等同 OrderDetail 的【調整單據】按鈕）
    // 依交貨筆數自動判斷 reasonText：修改交期 / 拆 Schedule Line（N 期）/ 拆單（N 期）
    for (const row of result.disagreeRows) {
      if (!row.matchedOrder) continue;
      const order = row.matchedOrder;
      const oldStatus = order.status;

      const validDeliveries = row.deliveries.filter(d => d.date && d.qty > 0);
      const orderSeqNum = parseInt(order.orderSeq, 10) || 10;
      const schedLines: ScheduleLine[] = validDeliveries.map((d, i) => ({
        index: result.mode === 'split-order'
          ? orderSeqNum + i * 10   // 拆單：新序號 = 原序號 + idx*10
          : i + 1,                 // 拆 Schedule Line：項次 1,2,3...
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
        // 單筆 → 修改交期
        const newDate = validDeliveries[0]?.date || '';
        reasonText = `需修改交期為 ${newDate}`;
        remarkText = validDeliveries.length > 0
          ? `新交期: ${validDeliveries[0].date}×${validDeliveries[0].qty}`
          : '廠商提出調整';
      } else if (result.mode === 'split-order') {
        // 拆單（N 期）
        reasonText = `拆單（${validDeliveries.length} 期）`;
        remarkText = validDeliveries.map((d, idx) =>
          `項次${orderSeqNum + idx * 10}：${d.date} × ${d.qty}`
        ).join('；');
      } else {
        // 拆 Schedule Line（N 期）
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
      // 追蹤調整類型
      if (result.mode === 'split-order') {
        rowUpdate.adjustmentType = 'split-order';
      } else if (validDeliveries.length > 1) {
        rowUpdate.adjustmentType = 'split';
      } else {
        rowUpdate.adjustmentType = 'modify';
      }

      updateOrderStatus(order.id, 'B', entry, rowUpdate);
    }

    // X — 不接單：NP/V → B（等同 OrderDetail 的【調整單據 → 不接單】）
    for (const row of result.rejectOrderRows) {
      if (!row.matchedOrder) continue;
      const order = row.matchedOrder;

      const entry: HistoryEntry = {
        date: now,
        event: '不接單',
        operator: op,
        remark: row.rejectReason || '批次匯入',
      };

      updateOrderStatus(order.id, 'B', entry, { isRejectedOrder: true });
    }

    const totalActions = result.agreeRows.length + result.disagreeRows.length + result.rejectOrderRows.length;
    const parts: string[] = [];
    if (result.agreeRows.length > 0) parts.push(`訂單確認 ${result.agreeRows.length} 筆`);
    if (result.disagreeRows.length > 0) parts.push(`調整單據 ${result.disagreeRows.length} 筆`);
    if (result.rejectOrderRows.length > 0) parts.push(`不接單 ${result.rejectOrderRows.length} 筆`);
    showToast(`批次回覆匯入完成（${modeText}）: ${parts.join(' / ')}，共 ${totalActions} 筆已寫入`);
    setShowCsvImport(false);
  };

  // OrderDetail view
  if (showOrderDetail) {
    return (
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
        <OrderDetail
          onClose={handleCloseDetail}
          orderData={selectedOrder ? {
            orderNo: selectedOrder.orderNo,
            orderSeq: selectedOrder.orderSeq,
            vendor: selectedOrder.vendorName,
            status: selectedOrder.status,
            vendorDeliveryDate: selectedOrder.vendorDeliveryDate,
            scheduleLines: selectedOrder.scheduleLines,
            orderQty: selectedOrder.orderQty,
            comparePrice: selectedOrder.comparePrice,
            unit: selectedOrder.unit,
            acceptQty: selectedOrder.acceptQty,
            adjustmentType: selectedOrder.adjustmentType,
          } : undefined}
          onStatusChange={handleStatusChange}
          isReadOnly={isReadOnlyMode}
          userRole={userRole}
          orderHistory={selectedOrder ? getOrderHistory(selectedOrder.id) : []}
        />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
      {/* Tabs */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full overflow-x-auto">
            <TabItem label="All" isActive={activeTab === 'ALL'} onClick={() => handleTabChange('ALL')} />
            <TabItem label="未處理(NP)" count={counts.NP} isActive={activeTab === 'NP'} onClick={() => handleTabChange('NP')} status="NP" />
            <TabItem label="廠商確認中(V)" count={counts.V} isActive={activeTab === 'V'} onClick={() => handleTabChange('V')} status="V" />
            <TabItem label="採購確認中(B)" count={counts.B} isActive={activeTab === 'B'} onClick={() => handleTabChange('B')} status="B" />
            <TabItem label="訂單已確認(CK)" isActive={activeTab === 'CK'} onClick={() => handleTabChange('CK')} status="CK" />
            <TabItem label="關閉結案(CL)" isActive={activeTab === 'CL'} onClick={() => handleTabChange('CL')} status="CL" />
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>
      </div>

      {/* Filter area */}
      <div className="relative shrink-0 w-full" style={{ borderBottom: 'none' }}>
        {activeTab === 'ALL' ? (
          <div className="flex flex-col gap-[12px] px-[20px] pt-[20px] pb-[16px]" style={{ borderBottom: 'none' }}>
            {/* Row 1: 單號序號 + 訂單號碼 + 訂單狀態 */}
            <div className="flex gap-[16px] items-start">
              <SearchField label="單號序號" value={docSeqNoSearch} onChange={setDocSeqNoSearch} />
              <SearchField label="訂單號碼" value={orderNoSearch} onChange={setOrderNoSearch} />
              <StatusMultiSelect label="訂單狀態" selected={statusFilter} onChange={setStatusFilter} />
            </div>
            {/* Row 2: 訂單日期起迄 */}
            <div className="flex gap-[16px] items-center">
              <SearchField label="訂單日期(起)" value={orderDateFrom} onChange={setOrderDateFrom} type="date" />
              <SearchField label="訂單日期(迄)" value={orderDateTo} onChange={setOrderDateTo} type="date" />
              <div className="flex-1" />
            </div>
          </div>
        ) : (
          <div className="flex gap-[16px] items-center px-[20px] py-[20px]" style={{ borderBottom: 'none' }}>
            <SearchField label="單號序號" value={docSeqNoSearch} onChange={setDocSeqNoSearch} />
            <SearchField label="訂單日期(起)" value={orderDateFrom} onChange={setOrderDateFrom} type="date" />
            <SearchField label="訂單日期(迄)" value={orderDateTo} onChange={setOrderDateTo} type="date" />
            <SearchField label="訂單號碼" value={orderNoSearch} onChange={setOrderNoSearch} />
          </div>
        )}
      </div>

      {/* Toolbar */}
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
            {/* CSV 匯出/匯入 */}
            <CsvToolbarButtons
              onExportSelect={handleExportSelect}
              onImport={() => setShowCsvImport(true)}
              hideBatchReply={activeTab === 'B' || activeTab === 'CK' || activeTab === 'CL'}
              hideBatchCorrection={true}
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

      {/* Advanced Table */}
      <AdvancedOrderTable
        activeTab={activeTab}
        data={searchFilteredOrders}
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

      {/* ===== 批次回覆匯入 Overlay ===== */}
      {showCsvImport && (
        <BatchReplyImportOverlay
          allOrders={orders}
          onConfirm={handleBatchReplyConfirm}
          onClose={() => setShowCsvImport(false)}
        />
      )}

      {/* ===== Toast notification ===== */}
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