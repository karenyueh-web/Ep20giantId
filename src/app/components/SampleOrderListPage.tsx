'use client';

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { SampleOrderDetailOverlay } from './SampleOrderDetailOverlay';
import {
  getSampleOrders,
  deleteSampleOrders,
  updateSampleOrderStatus,
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
  { id: 'B',   label: '採購確認中(B)',   status: 'B' },
  { id: 'SC',  label: '索樣已確認(SC)', status: 'SC' },
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
  const handleCancelSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    updateSampleOrderStatus(ids, 'CC');
    setOrders([...getSampleOrders()]);
    setSelectedIds(new Set());
    toast(`已取消 ${ids.length} 筆索樣單`);
  }, [selectedIds]);

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

  const handlePrintSelected = useCallback(() => {
    toast('列印功能開發中');
  }, []);

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
      { key: 'orderNo',       label: '索樣單號',   width: 110, minWidth: 90 },
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
      {
        key: 'material',
        label: '料號',
        width: 170,
        minWidth: 140,
        renderCell: (_val, row) => (
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer truncate w-full text-left"
            onClick={() => {
              const found = orders.find((o) => o.id === row.id);
              if (found) setDetailOrder(found);
            }}
          >
            {row.material}
          </button>
        ),
      },
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
    >取消索樣單</span>
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

  // ── 渲染 ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── A. Tabs ── */}
      <div className="content-stretch flex gap-[32px] h-[48px] items-center px-[20px] relative shrink-0 w-full overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.status ? tabCounts[tab.status] : orders.length;
          // 只有 All / DR / V / B / SC 顯示統計數，CC 和 CL 不顯示
          const BADGE_TABS: TabId[] = ['DR', 'V', 'B', 'SC'];
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
            toast.success(`索樣單 ${updated.orderNo} 已回覆採購`);
          }}
        />
      )}
    </div>
  );
}
