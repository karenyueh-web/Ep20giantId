'use client';

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { SampleOrderDetailOverlay } from './SampleOrderDetailOverlay';
import SampleOrderPrintPage from './SampleOrderPrintPage';
import {
  getSampleOrders,
  deleteSampleOrders,
  updateSampleOrderStatus,
  batchCancelSampleOrders,
  addSampleOrderHistory,
  getStatusDef,
  SAMPLE_ORDER_STATUSES,
  type SampleOrderRecord,
  type SampleOrderStatus,
} from './sampleOrderData';

// ── Tab 定義（依示意圖） ────────────────────────────────────────────────────
type TabId = 'all' | SampleOrderStatus;

interface TabDef {
  id: TabId;
  label: string;
  status?: SampleOrderStatus;
}

const TABS: TabDef[] = [
  { id: 'all', label: 'All' },
  { id: 'DR',  label: '草稿(DR)',        status: 'DR' },
  { id: 'V',   label: '廠商確認中(V)',   status: 'V' },
  { id: 'SC',  label: '廠商已回覆(SC)', status: 'SC' },
  { id: 'CC',  label: '取消(CC)',        status: 'CC' },
  { id: 'CL',  label: '關閉結案(CL)',   status: 'CL' },
];

// ── 狀態 Badge ────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SampleOrderStatus }) {
  const def = getStatusDef(status);
  return (
    <div
      className="h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px]"
      style={{ backgroundColor: def.bgColor }}
      title={def.label}
    >
      <p
        className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-center whitespace-nowrap"
        style={{ color: def.textColor }}
      >
        {status}
      </p>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface SampleOrderListPageProps {
  userRole?: string;
}

// ── 主元件 ─────────────────────────────────────────────────────────────────────
export default function SampleOrderListPage({ userRole: _userRole }: SampleOrderListPageProps) {
  // ── 資料 state ──────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<SampleOrderRecord[]>(() => getSampleOrders());

  // ── 明細彈窗 state ──────────────────────────────────────────────────────
  const [detailOrder, setDetailOrder] = useState<SampleOrderRecord | null>(null);

  // ── 列印模式 state ──────────────────────────────────────────────────────────
  const [printMode, setPrintMode] = useState(false);
  const [printOrders, setPrintOrders] = useState<SampleOrderRecord[]>([]);

  // ── 批次取消 Dialog state ───────────────────────────────────────────────────
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // ── Tab ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('all');

  // ── 篩選 state ──────────────────────────────────────────────────────────────
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterVendor, setFilterVendor]     = useState('');

  // ── Checkbox 選取（受控） ───────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleToggleRow = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((ids: number[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...ids]);
    });
  }, []);

  // ── Tab 計數 ────────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SAMPLE_ORDER_STATUSES.forEach((s) => {
      counts[s.code] = orders.filter((o) => o.status === s.code).length;
    });
    return counts;
  }, [orders]);

  // ── Tab 篩選 ────────────────────────────────────────────────────────────────
  const tabFilteredData = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  // ── 細項篩選 ────────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = tabFilteredData;

    if (filterDateFrom) {
      data = data.filter((o) => o.sampleDate >= filterDateFrom);
    }
    if (filterDateTo) {
      data = data.filter((o) => o.sampleDate <= filterDateTo);
    }
    if (filterMaterial.trim()) {
      const kw = filterMaterial.trim().toLowerCase();
      data = data.filter((o) => o.material.toLowerCase().includes(kw));
    }
    if (filterVendor.trim()) {
      const kw = filterVendor.trim().toLowerCase();
      data = data.filter(
        (o) =>
          o.vendorName.toLowerCase().includes(kw) ||
          o.vendorCode.toLowerCase().includes(kw),
      );
    }

    return data;
  }, [tabFilteredData, filterDateFrom, filterDateTo, filterMaterial, filterVendor]);

  // ── 批次操作 ────────────────────────────────────────────────────────────────

  const handleDeleteSelected = useCallback(() => {
    // 只允許刪除草稿（DR）
    const ids = Array.from(selectedIds);
    const drIds = orders.filter((o) => ids.includes(o.id) && o.status === 'DR').map((o) => o.id);
    const nonDrCount = ids.length - drIds.length;

    if (drIds.length === 0) {
      toast.error('只有草稿(DR)狀態的索樣單可以刪除');
      return;
    }
    deleteSampleOrders(drIds);
    setOrders([...getSampleOrders()]);
    setSelectedIds(new Set());

    if (nonDrCount > 0) {
      toast(`已刪除 ${drIds.length} 筆草稿索樣單（${nonDrCount} 筆非草稿狀態無法刪除）`);
    } else {
      toast.success(`已刪除 ${drIds.length} 筆索樣單`);
    }
  }, [selectedIds, orders]);

  // 開啟批次取消 Dialog
  const handleCancelSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setCancelReason('');
    setCancelDialogOpen(true);
  }, [selectedIds]);

  // 確認批次取消
  const handleConfirmBatchCancel = useCallback(() => {
    const reason = cancelReason.trim();
    if (!reason) return;
    const ids = Array.from(selectedIds);

    // 執行批次取消（狀態 → CC，寫入 cancelReason）
    batchCancelSampleOrders(ids, reason);

    // 寫入歷程：每張索樣單各記錄一筆
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const operator = localStorage.getItem('currentUserName') || localStorage.getItem('currentUserEmail') || '';
    ids.forEach((id) => {
      addSampleOrderHistory(id, {
        date: ts,
        event: '批次取消索樣單',
        operator,
        remark: reason,
      });
    });

    setOrders([...getSampleOrders()]);
    setSelectedIds(new Set());
    setCancelDialogOpen(false);
    setCancelReason('');
    toast.success(`已取消 ${ids.length} 筆索樣單`);
  }, [selectedIds, cancelReason]);

  const handlePrintSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    const selected = orders.filter((o) => ids.includes(o.id));
    if (selected.length === 0) return;
    setPrintOrders(selected);
    setPrintMode(true);
  }, [selectedIds, orders]);

  // ── 欄位定義（依示意圖）───────────────────────────────────────────────────
  type PartWithVendorDisplay = SampleOrderRecord & {
    vendorDisplay: string;
    resampleLabel: string;
    sampleTypeLabel: string;
    updatedInfo: string;
  };

  const displayData: PartWithVendorDisplay[] = useMemo(
    () =>
      filteredData.map((o) => ({
        ...o,
        vendorDisplay: `${o.vendorName}(${o.vendorCode})`,
        resampleLabel: o.resample ? '是' : '否',
        sampleTypeLabel: o.sampleType === 'D' ? 'D(開發樣)' : 'G(量產品)',
        updatedInfo: `${o.createdBy}-${o.updatedAt}`,
      })),
    [filteredData],
  );

  const columns: StandardColumn<PartWithVendorDisplay>[] = useMemo(
    () => [
      {
        key: 'orderNo',
        label: '索樣單號',
        width: 110,
        minWidth: 90,
        renderCell: (_val, row) => (
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer truncate w-full text-left"
            onClick={() => setDetailOrder(row)}
          >
            {row.orderNo}
          </button>
        ),
      },
      {
        key: 'status',
        label: '狀態',
        width: 100,
        minWidth: 80,
        renderCell: (_val, row) => <StatusBadge status={row.status} />,
      },
      { key: 'vendorDisplay', label: '供應商(編號)', width: 170, minWidth: 130 },
      { key: 'purchaseOrg',   label: '採購組織',   width: 110, minWidth: 90 },
      { key: 'plant',         label: '工廠',       width: 70,  minWidth: 60 },
      { key: 'material',      label: '料號',       width: 170, minWidth: 140 },
      { key: 'longDescription',    label: '長規格敘述',   width: 260, minWidth: 180 },
      { key: 'vendorMaterialNo',   label: '供應商料號',   width: 140, minWidth: 100, renderCell: (val) => <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px]">{val || '—'}</span> },
      { key: 'resampleLabel',      label: '重新索樣',     width: 80,  minWidth: 70 },
      { key: 'sampleTypeLabel',    label: '索樣類型',     width: 100, minWidth: 80 },
      { key: 'demandDate',         label: '樣品需求日',   width: 110, minWidth: 90 },
      { key: 'demandQty',          label: '需求數量',     width: 90,  minWidth: 70, renderCell: (val) => <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px]">{val ?? '—'}</span> },
      { key: 'vendorShipDate',     label: '樣品達交日',   width: 110, minWidth: 90, renderCell: (_val, row) => {
        if (!row.vendorShipDate) return <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px] text-[#919eab]">—</span>;
        const isLate = row.vendorShipDate > row.demandDate;
        const bothSafe = (!row.vendorShipDate || row.vendorShipDate <= row.demandDate) && (!row.actualShipDate || row.actualShipDate <= row.demandDate);
        const color = isLate ? '#ff5630' : bothSafe ? '#118d57' : '#1c252e';
        return <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px]" style={{ color }}>{row.vendorShipDate}</span>;
      }},
      { key: 'actualShipDate',     label: '實際送樣日',   width: 110, minWidth: 90, renderCell: (_val, row) => {
        if (!row.actualShipDate) return <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px] text-[#919eab]">—</span>;
        const isLate = row.actualShipDate > row.demandDate;
        const bothSafe = (!row.vendorShipDate || row.vendorShipDate <= row.demandDate) && (!row.actualShipDate || row.actualShipDate <= row.demandDate);
        const color = isLate ? '#ff5630' : bothSafe ? '#118d57' : '#1c252e';
        return <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px]" style={{ color }}>{row.actualShipDate}</span>;
      }},
      { key: 'availableDate',      label: '首批可供貨日', width: 120, minWidth: 100, renderCell: (val) => <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px]">{val || '—'}</span> },
      { key: 'vendorDailyCapacity', label: '廠商日產能',  width: 100, minWidth: 80, renderCell: (val) => <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px]">{val ?? '—'}</span> },
      { key: 'createdAt',          label: '建立時間',     width: 140, minWidth: 110 },
      { key: 'updatedInfo',        label: '更新時間',     width: 190, minWidth: 150 },
    ],
    [],
  );

  // ── Selection Toolbar batchActions（依 Tab 顯示不同操作）─────────────────────
  const CTA_CANCEL = (
    <span
      onClick={handleCancelSelected}
      className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
    >批次取消索樣單</span>
  );
  const CTA_DELETE = (
    <span
      onClick={handleDeleteSelected}
      className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#ff5630] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
    >刪除索樣單</span>
  );
  const CTA_PRINT = (
    <span
      onClick={handlePrintSelected}
      className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
    >列印索樣單</span>
  );
  const SEP = <span className="text-[rgba(145,158,171,0.4)] select-none">|</span>;

  const batchActions = selectedIds.size > 0 ? (() => {
    if (activeTab === 'all') {
      // ALL：只有列印
      return <>{CTA_PRINT}</>;
    }
    if (activeTab === 'DR') {
      // DR：刪除 | 列印（不提供取消）
      return <>{CTA_DELETE}{SEP}{CTA_PRINT}</>;
    }
    // 其餘 Tab（V/B/SC）：取消 | 列印；CC/CL 只有列印
    if (activeTab === 'CC' || activeTab === 'CL') {
      return <>{CTA_PRINT}</>;
    }
    return <>{CTA_CANCEL}{SEP}{CTA_PRINT}</>;
  })() : null;

  // ── 列印模式：替換整個頁面內容 ─────────────────────────────────────────────
  if (printMode) {
    return (
      <SampleOrderPrintPage
        orders={printOrders}
        onBack={() => setPrintMode(false)}
      />
    );
  }

  // ── 渲染 ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── A. Tabs ── */}
      <div className="content-stretch flex gap-[32px] h-[48px] items-center px-[20px] relative shrink-0 w-full overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.status ? tabCounts[tab.status] : orders.length;
          // 只有 All / DR / V / SC 顯示統計數，CC 和 CL 不顯示
          const BADGE_TABS: TabId[] = ['DR', 'V', 'SC'];
          const showBadge = BADGE_TABS.includes(tab.id) && count !== undefined && count > 0;

          // Badge 顏色：依各狀態的色票，All 用灰
          const badgeBg = isActive && tab.status
            ? getStatusDef(tab.status).bgColor
            : 'rgba(145,158,171,0.16)';
          const badgeText = isActive && tab.status
            ? getStatusDef(tab.status).textColor
            : '#637381';

          return (
            <div
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedIds(new Set()); }}
              className="flex gap-[8px] h-[48px] items-center justify-center relative shrink-0 cursor-pointer"
            >
              {isActive && (
                <div
                  aria-hidden="true"
                  className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none"
                />
              )}
              <p
                className={`font-medium leading-[22px] relative shrink-0 text-[14px] whitespace-nowrap ${
                  isActive ? 'text-[#1c252e]' : 'text-[#637381]'
                }`}
              >
                {tab.label}
              </p>
              {showBadge && (
                <div
                  className="inline-flex items-center justify-center h-[22px] min-w-[22px] px-[6px] rounded-[6px] text-[12px] font-bold shrink-0"
                  style={{ backgroundColor: badgeBg, color: badgeText }}
                >
                  {count}
                </div>
              )}
            </div>
          );
        })}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ── B. 篩選列（no border-b）── */}
      <div className="shrink-0 grid grid-cols-4 gap-[16px] px-[20px] py-[16px]">
        <SearchField
          label="索樣日期(起)"
          value={filterDateFrom}
          onChange={setFilterDateFrom}
          type="date"
          placeholder="Start date"
        />
        <SearchField
          label="索樣日期(迄)"
          value={filterDateTo}
          onChange={setFilterDateTo}
          type="date"
          placeholder="End date"
        />
        <SearchField
          label="料號"
          value={filterMaterial}
          onChange={setFilterMaterial}
          type="search"
        />
        <SearchField
          label="廠商(編號)"
          value={filterVendor}
          onChange={setFilterVendor}
          type="search"
        />
      </div>

      {/* ── D. StandardDataTable ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<PartWithVendorDisplay>
          columns={columns}
          data={displayData}
          storageKey="sample-order-list-v1"
          showCheckbox
          selectedIds={selectedIds}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
          batchActions={batchActions}
          externalFilteredData={displayData}
          onExportCsv={() => toast('匯出 CSV 功能開發中')}
        />
      </div>

      <Toaster />

      {/* ── 索樣單明細彈窗 ── */}
      {detailOrder && (
        <SampleOrderDetailOverlay
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onUpdated={(updated) => {
            setOrders([...getSampleOrders()]);
            setDetailOrder(null);
            if (updated.status === 'V') {
              setActiveTab('V');
              if (updated.needsFullVendorReply) {
                // SC → V 退回廠商補填
                toast(`索樣單 ${updated.orderNo} 已退回廠商補填，通知信已發送給廠商業務`);
              } else {
                // DR → V 轉交廠商
                toast.success(`索樣單 ${updated.orderNo} 已轉交廠商，通知信已發送給廠商業務`);
              }
            } else if (updated.status === 'DR') {
              setActiveTab('DR');
              toast(`索樣單 ${updated.orderNo} 已暫存草稿`);
            } else if (updated.status === 'SC') {
              toast.success(`索樣單 ${updated.orderNo} 已回覆採購，通知信已發送給整合採購`);
            } else if (updated.status === 'CC') {
              setActiveTab('CC');
              toast(`索樣單 ${updated.orderNo} 已取消`);
            } else if (updated.status === 'CL') {
              setActiveTab('CL');
              toast.success(`索樣單 ${updated.orderNo} 已關閉結案`);
            } else {
              toast.success(`索樣單 ${updated.orderNo} 已更新`);
            }
          }}
        />
      )}

      {/* ── 批次取消索樣單 Dialog ───────────────────────────────────────────── */}
      {cancelDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(28,37,62,0.35)' }}>
          <div className="bg-white rounded-[16px] shadow-[0_8px_32px_0_rgba(28,37,62,0.18)] w-[400px] mx-[16px] overflow-hidden">
            {/* dialog header */}
            <div className="flex items-center gap-[10px] px-[20px] py-[14px] border-b" style={{ borderColor: 'rgba(145,158,171,0.12)' }}>
              <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px]" style={{ backgroundColor: 'rgba(255,86,48,0.10)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[15px] leading-[22px]" style={{ color: '#1c252e' }}>批次取消索樣</p>
                <p className="text-[12px] leading-[18px]" style={{ color: '#637381' }}>已選取 <strong>{selectedIds.size}</strong> 筆索樣單</p>
              </div>
            </div>
            {/* dialog body */}
            <div className="px-[20px] pt-[16px] pb-[12px] flex flex-col gap-[10px]">
              <p className="text-[13px] leading-[20px]" style={{ color: '#637381' }}>請輸入取消原因（必填）</p>
              <textarea
                className="w-full rounded-[8px] border px-[12px] py-[10px] text-[14px] leading-[22px] outline-none resize-none"
                style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#1c252e', minHeight: '80px' }}
                placeholder="請說明取消索樣原因…"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                autoFocus
              />
            </div>
            {/* dialog footer */}
            <div className="flex gap-[10px] px-[20px] py-[14px] border-t" style={{ borderColor: 'rgba(145,158,171,0.12)' }}>
              <button
                onClick={() => setCancelDialogOpen(false)}
                className="flex-1 h-[36px] rounded-[8px] border text-[14px] font-medium hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#637381' }}
              >
                返回
              </button>
              <button
                onClick={handleConfirmBatchCancel}
                disabled={!cancelReason.trim()}
                className="flex-1 h-[36px] rounded-[8px] text-[14px] font-bold text-white transition-colors"
                style={{ backgroundColor: cancelReason.trim() ? '#ff5630' : 'rgba(255,86,48,0.35)', cursor: cancelReason.trim() ? 'pointer' : 'not-allowed' }}
              >
                確認取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
