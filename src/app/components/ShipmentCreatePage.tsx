/**
 * ShipmentCreatePage — 出貨單管理 • 建立出貨單
 *
 * 出貨資格條件（兩種訂單來源均適用）：
 *   1. 訂單狀態 = CK（一般訂單 or 換貨(J)單）
 *   2. 無進行中修正單（correctionStatus 為 DR / V / B）
 *   3. 未交量 > 0（訂單量 - 在途量 - 驗收量 > 0）
 *
 * 搜尋條件：公司(下拉)、採購組織(下拉)、單號序號(關鍵字)、料號(關鍵字)
 * 表格：沿用 AdvancedOrderTable（與一般訂單查詢相同欄位）+ forceShowCheckbox
 */

import { useState, useMemo } from 'react';
import { AdvancedOrderTable, defaultOrderColumns, getOrderColumns, calcUndeliveredQty } from './AdvancedOrderTable';
import type { OrderRow, OrderColumn } from './AdvancedOrderTable';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { useOrderStore } from './OrderStoreContext';
import { exportOrdersExcel, exportOrdersCsv } from './OrderCsvManager';
import { ShipmentDetailPage } from './ShipmentDetailPage';
import { OrderDetail } from './OrderDetail';

// ─────────────────────────────────────────────────────────────────────────────

interface ShipmentCreatePageProps {
  userRole?: string;
}

export function ShipmentCreatePage({ userRole }: ShipmentCreatePageProps) {
  // ── Store ─────────────────────────────────────────────────────────────────
  const { orders, exchangeOrders, correctionOrders, getOrderHistory, getExchangeOrderHistory } = useOrderStore();

  // ── Search States ─────────────────────────────────────────────────────────
  const [searchCompany, setSearchCompany]       = useState('');
  const [searchPurchaseOrg, setSearchPurchaseOrg] = useState('');
  const [searchDocSeqNo, setSearchDocSeqNo]     = useState('');
  const [searchMaterialNo, setSearchMaterialNo] = useState('');

  // ── Table States ──────────────────────────────────────────────────────────
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<OrderColumn[]>([]);
  const [tempColumns, setTempColumns]           = useState<OrderColumn[]>([]);
  const [columnsVersion, setColumnsVersion]     = useState(0);
  const [filters, setFilters]                   = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters]     = useState<FilterCondition[]>([]);
  const [toastMessage, setToastMessage]         = useState<string | null>(null);

  // ── 出貨單明細頁面狀態 ────────────────────────────────────────────────────
  const [showDetail, setShowDetail]   = useState(false);
  const [detailOrders, setDetailOrders] = useState<OrderRow[]>([]);


  // ── 訂單明細彈窗狀態 ──────────────────────────────────────────────────
  const [previewOrder, setPreviewOrder] = useState<OrderRow | null>(null);

  const currentUserEmail = useState<string>(
    () => localStorage.getItem('currentUserEmail') || 'default'
  )[0];

  // ── 計算有進行中修正單的訂單 ID（DR / V / B）──────────────────────────────
  const blockedByCorrection = useMemo(() => {
    const ids = new Set<number>();
    correctionOrders.forEach(c => {
      if (c.correctionStatus === 'DR' || c.correctionStatus === 'V' || c.correctionStatus === 'B') {
        ids.add(c.id);
      }
    });
    return ids;
  }, [correctionOrders]);

  // ── 合併符合出貨資格的訂單（一般 + 換貨J）────────────────────────────────
  // Exchange order IDs 從 2001 起，與一般訂單 1-26 無衝突，可直接合併
  const eligibleOrders = useMemo<OrderRow[]>(() => {
    // 最早可開立日 = 廠商可交貨日期 − 7 天；今日需 >= 最早可開立日才可出貨
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parseVDate = (s: string) => {
      const [y, m, d] = s.replace(/\//g, '-').split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const canShipToday = (o: OrderRow) => {
      if (!o.vendorDeliveryDate) return true; // 無廠商答交日 → 不限制
      const earliest = parseVDate(o.vendorDeliveryDate);
      earliest.setDate(earliest.getDate() - 7);
      return today >= earliest;
    };

    const isEligible = (o: OrderRow) =>
      o.status === 'CK' &&
      !blockedByCorrection.has(o.id) &&
      calcUndeliveredQty(o.orderQty ?? 0, o.acceptQty ?? 0, o.inTransitQty ?? 0) > 0 &&
      canShipToday(o);

    return [
      ...orders.filter(isEligible),
      ...exchangeOrders.filter(isEligible),
    ];
  }, [orders, exchangeOrders, blockedByCorrection]);

  // ── 動態取得公司/採購組織選項 ─────────────────────────────────────────────
  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    eligibleOrders.forEach(o => { if (o.company) set.add(o.company); });
    const opts = [...set].map(c => ({ value: c, label: c }));
    return [{ value: '', label: '全部' }, ...opts];
  }, [eligibleOrders]);

  const purchaseOrgOptions = useMemo(() => {
    const set = new Set<string>();
    eligibleOrders.forEach(o => { if (o.purchaseOrg) set.add(o.purchaseOrg); });
    const opts = [...set].map(o => ({ value: o, label: o }));
    return [{ value: '', label: '全部' }, ...opts];
  }, [eligibleOrders]);

  // ── 搜尋篩選 ──────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = eligibleOrders;
    if (searchCompany)
      result = result.filter(o => o.company === searchCompany);
    if (searchPurchaseOrg)
      result = result.filter(o => o.purchaseOrg === searchPurchaseOrg);
    if (searchDocSeqNo.trim()) {
      const kw = searchDocSeqNo.trim().toLowerCase();
      result = result.filter(o =>
        (o.docSeqNo || '').toLowerCase().includes(kw) ||
        (o.orderNo  || '').toLowerCase().includes(kw) ||
        (o.orderSeq || '').toLowerCase().includes(kw)
      );
    }
    if (searchMaterialNo.trim()) {
      const kw = searchMaterialNo.trim().toLowerCase();
      result = result.filter(o => (o.materialNo || '').toLowerCase().includes(kw));
    }
    return result;
  }, [eligibleOrders, searchCompany, searchPurchaseOrg, searchDocSeqNo, searchMaterialNo]);

  // ── 進階篩選後的計數 ───────────────────────────────────────────────────────
  const getFilteredCount = () => {
    if (appliedFilters.length === 0) return filteredOrders.length;
    return filteredOrders.filter(item =>
      appliedFilters.every(f => {
        const v = item[f.column as keyof OrderRow];
        const raw = v != null ? String(v) : '';
        switch (f.operator) {
          case 'contains':   return raw.toLowerCase().includes(f.value.toLowerCase());
          case 'equals':     return raw.toLowerCase() === f.value.toLowerCase();
          case 'notEquals':  return raw.toLowerCase() !== f.value.toLowerCase();
          case 'startsWith': return raw.toLowerCase().startsWith(f.value.toLowerCase());
          case 'endsWith':   return raw.toLowerCase().endsWith(f.value.toLowerCase());
          case 'isEmpty':    return !raw || raw.trim() === '';
          case 'isNotEmpty': return raw.trim() !== '';
          default:           return true;
        }
      })
    ).length;
  };

  // ── Checkbox ───────────────────────────────────────────────────────────────
  const isAllSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every(o => selectedOrderIds.has(o.id));

  const handleSelectAll = () => {
    const newSet = new Set(selectedOrderIds);
    if (isAllSelected) {
      filteredOrders.forEach(o => newSet.delete(o.id));
    } else {
      filteredOrders.forEach(o => newSet.add(o.id));
    }
    setSelectedOrderIds(newSet);
  };

  const handleToggleOrder = (id: number) => {
    const newSet = new Set(selectedOrderIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedOrderIds(newSet);
  };

  // ── Column Selector ────────────────────────────────────────────────────────
  const handleColumnsChange = (cols: OrderColumn[]) => setAvailableColumns(cols);

  // 與 AdvancedOrderTable 內部使用相同的 key 格式
  // storageKeyPrefix="shipmentCreate_v1"，activeTab="CK" → key = shipmentCreate_v1_${email}_CK_columns
  const tableStorageKey = `shipmentCreate_v1_${currentUserEmail}_CK_columns`;

  const handleColumnsClick = () => {
    let cols = availableColumns;
    if (cols.length === 0) {
      try {
        const saved = localStorage.getItem(tableStorageKey);
        cols = saved ? JSON.parse(saved) : getOrderColumns();
      } catch { cols = getOrderColumns(); }
    }
    setTempColumns(JSON.parse(JSON.stringify(cols)));
    setShowColumnSelector(v => !v);
  };

  const handleApplyColumns = () => {
    try { localStorage.setItem(tableStorageKey, JSON.stringify(tempColumns)); } catch { /**/ }
    setAvailableColumns(tempColumns);
    setColumnsVersion(v => v + 1);
    setShowColumnSelector(false);
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const dateSuffix = () => new Date().toISOString().slice(0, 10);

  const handleExportExcel = () => {
    const currentCols = availableColumns.length > 0 ? availableColumns : getOrderColumns();
    const count = exportOrdersExcel(filteredOrders, `建立出貨單_${dateSuffix()}.xlsx`, currentCols);
    showToast(`已匯出 ${count} 筆訂單 (Excel)`);
  };

  const handleExportCsv = () => {
    const currentCols = availableColumns.length > 0 ? availableColumns : getOrderColumns();
    exportOrdersCsv(filteredOrders, `建立出貨單_${dateSuffix()}.csv`, currentCols);
    showToast(`已匯出 ${filteredOrders.length} 筆訂單 (CSV)`);
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 開立出貨單（跳轉到明細頁面）────────────────────────────────────────────
  const handleCreateShipment = () => {
    const selected = filteredOrders.filter(o => selectedOrderIds.has(o.id));
    if (selected.length === 0) {
      showToast('請先勾選要出貨的訂單');
      return;
    }
    setDetailOrders(selected);
    setShowDetail(true);
  };

  // ── 初始欄位設定（docSeqNo sticky 欄已由 AdvancedOrderTable 內建處理）────
  const tableInitialColumns = useMemo(() =>
    defaultOrderColumns.map(col =>
      col.key === 'docSeqNo' ? { ...col, visible: false } : { ...col }
    ),
  []);

  // ── 顯示出貨單明細頁面 ────────────────────────────────────────────────────
  if (showDetail) {
    return (
      <ShipmentDetailPage
        selectedOrders={detailOrders}
        onClose={() => {
          setShowDetail(false);
          setSelectedOrderIds(new Set());
        }}
        userRole={userRole}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列 ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(145,158,171,0.12)]">
        <div className="flex flex-wrap gap-[16px] items-end px-[20px] py-[16px]">

          {/* 公司（下拉） */}
          <div style={{ minWidth: '200px', flex: '0 0 200px' }}>
            <DropdownSelect
              label="公司"
              value={searchCompany}
              onChange={setSearchCompany}
              options={companyOptions}
            />
          </div>

          {/* 採購組織（下拉） */}
          <div style={{ minWidth: '220px', flex: '0 0 220px' }}>
            <DropdownSelect
              label="採購組織"
              value={searchPurchaseOrg}
              onChange={setSearchPurchaseOrg}
              options={purchaseOrgOptions}
            />
          </div>

          {/* 單號序號（關鍵字） */}
          <SearchField
            label="單號序號"
            value={searchDocSeqNo}
            onChange={setSearchDocSeqNo}
          />

          {/* 料號（關鍵字） */}
          <SearchField
            label="料號"
            value={searchMaterialNo}
            onChange={setSearchMaterialNo}
          />
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <TableToolbar
        resultsCount={getFilteredCount()}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        columnsButton={
          <ColumnSelector
            columns={tempColumns}
            onToggleColumn={key =>
              setTempColumns(prev =>
                prev.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c)
              )
            }
            onToggleAll={all =>
              setTempColumns(prev => prev.map(c => ({ ...c, visible: all })))
            }
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
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); }}
          />
        }
        actionButton={
          <button
            onClick={handleCreateShipment}
            disabled={selectedOrderIds.size === 0}
            className="h-[36px] bg-[#1c252e] hover:bg-[#374151] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-[8px] px-[20px] text-[14px] font-semibold transition-colors whitespace-nowrap"
          >
            {selectedOrderIds.size > 0
              ? `建立出貨單（${selectedOrderIds.size}筆）`
              : '建立出貨單'}
          </button>
        }
      />

      {/* ── 表格 ────────────────────────────────────────────────────────── */}
      <AdvancedOrderTable
        activeTab="CK"
        data={filteredOrders}
        userEmail={currentUserEmail}
        userRole={userRole}
        onColumnsChange={handleColumnsChange}
        columnsVersion={columnsVersion}
        appliedFilters={appliedFilters}
        selectedOrderIds={selectedOrderIds}
        onToggleOrder={handleToggleOrder}
        onSelectAll={handleSelectAll}
        forceShowCheckbox
        storageKeyPrefix="shipmentCreate_v1"
        initialColumns={tableInitialColumns}
        onDocNoClick={(row) => setPreviewOrder(row)}
        batchActions={
          <span
            data-is-checkbox="true"
            onClick={handleCreateShipment}
            className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
          >
            建立出貨單
          </span>
        }
      />

      {/* ── 訂單明細彈窗 ─────────────────────────────────────────────────────── */}
      {previewOrder && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(28,37,46,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setPreviewOrder(null); }}
        >
          <div
            className="relative bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.24)] overflow-hidden"
            style={{ width: 'min(92vw, 1000px)', height: 'min(88vh, 760px)', display: 'flex', flexDirection: 'column' }}
          >
            <OrderDetail
              onClose={() => setPreviewOrder(null)}
              orderData={{
                orderNo: previewOrder.orderNo,
                orderSeq: previewOrder.orderSeq,
                vendor: previewOrder.vendorName,
                status: previewOrder.status,
                vendorDeliveryDate: previewOrder.vendorDeliveryDate,
                scheduleLines: previewOrder.scheduleLines,
                orderQty: previewOrder.orderQty,
                comparePrice: previewOrder.comparePrice,
                unit: previewOrder.unit,
                acceptQty: previewOrder.acceptQty,
                adjustmentType: previewOrder.adjustmentType,
                expectedDelivery: previewOrder.expectedDelivery,
              }}
              onStatusChange={() => {}}
              isReadOnly
              userRole={userRole}
              orderHistory={
                previewOrder.id >= 2000
                  ? getExchangeOrderHistory(previewOrder.id)
                  : getOrderHistory(previewOrder.id)
              }
            />
          </div>
        </div>
      )}

            {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
