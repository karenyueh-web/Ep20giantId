'use client';

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { UpdateTimeLabel } from './UpdateTimeLabel';
import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import PartsMaintenanceDetailPage from './PartsMaintenanceDetailPage';
import {
  type PartRecord,
  MOCK_PARTS,
  PURCHASE_ORG_OPTIONS,
  PLANT_OPTIONS,
  LAST_SYNC_TIME,
} from './partsMaintenanceData';

// ── Props ─────────────────────────────────────────────────────────────────────
interface PartsMaintenancePageProps {
  userRole: string; // 'vendor' | 'procurement' | 'giant'
  onBreadcrumbChange?: (title: string, breadcrumb: string) => void;
}

// ── Tab 定義 ───────────────────────────────────────────────────────────────────
type TabId = 'all' | 'pending' | 'quoted';
const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: '待報價' },
  { id: 'quoted', label: '已報價' },
];

// ── 通知狀態 Badge ─────────────────────────────────────────────────────────────
function NotifyBadge({ status }: { status: 'sent' | 'unsent' }) {
  if (status === 'sent') {
    return (
      <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-medium leading-[20px] whitespace-nowrap bg-[rgba(34,197,94,0.16)] text-[#118d57]">
        已發送通知
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-medium leading-[20px] whitespace-nowrap bg-[rgba(255,171,0,0.16)] text-[#b76e00]">
      未發送通知
    </span>
  );
}

// ── 主元件 ─────────────────────────────────────────────────────────────────────
export default function PartsMaintenancePage({
  userRole,
  onBreadcrumbChange,
}: PartsMaintenancePageProps) {
  // ── List / Detail 切換 ────────────────────────────────────────────────────
  const [viewingPart, setViewingPart] = useState<PartRecord | null>(null);

  // ── 資料（本地 state，detail 修改可同步回來）────────────────────────────────
  const [partsData, setPartsData] = useState<PartRecord[]>([...MOCK_PARTS]);

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('all');

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [filterPurchaseOrg, setFilterPurchaseOrg] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterPlant, setFilterPlant] = useState('');

  // ── Vendor 角色固定 vendorCode（模擬用） ──────────────────────────────────
  const vendorCode = '000100463';

  // ── 角色篩選的基礎資料 ──────────────────────────────────────────────────────
  const roleBaseData = useMemo(() => {
    if (userRole === 'vendor') {
      return partsData.filter((p) => p.vendorCode === vendorCode);
    }
    return partsData;
  }, [partsData, userRole]);

  // ── Tab 篩選 ────────────────────────────────────────────────────────────────
  const tabFilteredData = useMemo(() => {
    if (activeTab === 'pending') return roleBaseData.filter((p) => p.quoteStatus === 'pending');
    if (activeTab === 'quoted') return roleBaseData.filter((p) => p.quoteStatus === 'quoted');
    return roleBaseData;
  }, [roleBaseData, activeTab]);

  // ── 搜尋/下拉篩選 ──────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = tabFilteredData;
    if (filterPurchaseOrg) {
      data = data.filter((p) => p.purchaseOrg === filterPurchaseOrg);
    }
    if (filterMaterial.trim()) {
      const kw = filterMaterial.trim().toLowerCase();
      data = data.filter((p) => p.material.toLowerCase().includes(kw));
    }
    if (filterVendor.trim()) {
      const kw = filterVendor.trim().toLowerCase();
      data = data.filter(
        (p) =>
          p.vendorName.toLowerCase().includes(kw) ||
          p.vendorCode.toLowerCase().includes(kw),
      );
    }
    if (filterPlant) {
      data = data.filter((p) => p.plant === filterPlant);
    }
    return data;
  }, [tabFilteredData, filterPurchaseOrg, filterMaterial, filterVendor, filterPlant]);

  // ── Tab 計數 ────────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const all = roleBaseData.length;
    const pending = roleBaseData.filter((p) => p.quoteStatus === 'pending').length;
    const quoted = roleBaseData.filter((p) => p.quoteStatus === 'quoted').length;
    return { all, pending, quoted };
  }, [roleBaseData]);

  // ── Active filters（for chips）────────────────────────────────────────────
  const activeFilters: { key: string; label: string; value: string; onClear: () => void }[] = [];
  if (filterPurchaseOrg) {
    const opt = PURCHASE_ORG_OPTIONS.find((o) => o.value === filterPurchaseOrg);
    activeFilters.push({
      key: 'purchaseOrg',
      label: '採購組織',
      value: opt?.label ?? filterPurchaseOrg,
      onClear: () => setFilterPurchaseOrg(''),
    });
  }
  if (filterMaterial.trim()) {
    activeFilters.push({
      key: 'material',
      label: '料號',
      value: filterMaterial,
      onClear: () => setFilterMaterial(''),
    });
  }
  if (filterVendor.trim()) {
    activeFilters.push({
      key: 'vendor',
      label: '廠商',
      value: filterVendor,
      onClear: () => setFilterVendor(''),
    });
  }
  if (filterPlant) {
    const opt = PLANT_OPTIONS.find((o) => o.value === filterPlant);
    activeFilters.push({
      key: 'plant',
      label: '工廠',
      value: opt?.label ?? filterPlant,
      onClear: () => setFilterPlant(''),
    });
  }

  const clearAllFilters = useCallback(() => {
    setFilterPurchaseOrg('');
    setFilterMaterial('');
    setFilterVendor('');
    setFilterPlant('');
  }, []);

  // ── 點擊料號 → 進入明細 ──────────────────────────────────────────────────
  const handleMaterialClick = useCallback(
    (part: PartRecord) => {
      setViewingPart(part);
      onBreadcrumbChange?.('明細', '零件/索樣維護 • 零件資訊維護 • 明細');
    },
    [onBreadcrumbChange],
  );

  // ── Detail 頁返回 ──────────────────────────────────────────────────────────
  const handleBackToList = useCallback(() => {
    setViewingPart(null);
    onBreadcrumbChange?.('零件資訊維護', '零件/索樣維護 • 零件資訊維護');
  }, [onBreadcrumbChange]);

  // ── Detail 頁儲存 ──────────────────────────────────────────────────────────
  const handleDetailSave = useCallback(
    (updated: PartRecord) => {
      setPartsData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setViewingPart(null);
      onBreadcrumbChange?.('零件資訊維護', '零件/索樣維護 • 零件資訊維護');
    },
    [onBreadcrumbChange],
  );

  // ── vendorDisplay 虛擬欄位 ────────────────────────────────────────────────
  type PartWithDisplay = PartRecord & { vendorDisplay: string };
  const displayData: PartWithDisplay[] = useMemo(
    () =>
      filteredData.map((p) => ({
        ...p,
        vendorDisplay: `${p.vendorName}(${p.vendorCode})`,
      })),
    [filteredData],
  );

  // ── 欄位定義 ────────────────────────────────────────────────────────────────
  const columns: StandardColumn<PartWithDisplay>[] = useMemo(
    () => [
      { key: 'vendorDisplay', label: '廠商(編號)', width: 180, minWidth: 140 },
      { key: 'purchaseOrg', label: '採購組織', width: 100, minWidth: 80 },
      {
        key: 'material',
        label: '料號',
        width: 180,
        minWidth: 140,
        renderCell: (_val, row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMaterialClick(row);
            }}
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer truncate w-full text-left"
          >
            {String(row.material)}
          </button>
        ),
      },
      { key: 'longDescription', label: '長規格敘述', width: 400, minWidth: 200 },
      { key: 'plant', label: '工廠', width: 80, minWidth: 60 },
      { key: 'vendorPartNo', label: '廠商料號', width: 140, minWidth: 100 },
      { key: 'grossWeight', label: '毛重', width: 80, minWidth: 60 },
      { key: 'netWeight', label: '淨重', width: 80, minWidth: 60 },
      { key: 'weightUnit', label: '重量單位', width: 90, minWidth: 70 },
      {
        key: 'notifyStatus',
        label: '通知狀態',
        width: 120,
        minWidth: 100,
        renderCell: (val) => <NotifyBadge status={val as 'sent' | 'unsent'} />,
      },
      { key: 'updatedAt', label: '資料更新時間', width: 160, minWidth: 120 },
    ],
    [handleMaterialClick],
  );

  // ── Detail 頁渲染 ──────────────────────────────────────────────────────────
  if (viewingPart) {
    return (
      <div className="flex flex-col h-full">
        {/* 返回箭頭 */}
        <div className="shrink-0 flex items-center px-[20px] pt-[12px]">
          <button
            onClick={handleBackToList}
            className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.08)] transition-colors"
            title="返回列表"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {/* 明細頁 */}
        <div className="flex-1 min-h-0">
          <PartsMaintenanceDetailPage
            part={viewingPart}
            onClose={handleBackToList}
            onSave={handleDetailSave}
          />
        </div>
      </div>
    );
  }

  // ── action button（Toolbar 右側）────────────────────────────────────────────
  const actionButton = (
    <div className="flex items-center gap-[12px]">
      {userRole !== 'vendor' && (
        <button
          onClick={() => toast('功能開發中')}
          className="flex items-center gap-[6px] h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] text-white text-[14px] font-medium hover:bg-[#2d3a46] transition-colors whitespace-nowrap shrink-0"
        >
          上傳零件資訊
        </button>
      )}
      <UpdateTimeLabel label="資料更新時間" currentTime={LAST_SYNC_TIME} />
    </div>
  );

  // ── 渲染 ────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
      {/* ── A. Tabs ── */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === 'all'
              ? tabCounts.all
              : tab.id === 'pending'
                ? tabCounts.pending
                : tabCounts.quoted;
          // Badge 色票：active 時依 tab 類型著色，inactive 統一灰色
          const getBadgeStyle = () => {
            if (!isActive) return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
            switch (tab.id) {
              case 'pending': return { bg: 'bg-[rgba(255,171,0,0.16)]', text: 'text-[#b76e00]' };
              case 'quoted':  return { bg: 'bg-[rgba(34,197,94,0.16)]', text: 'text-[#118d57]' };
              default:        return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
            }
          };
          const badge = getBadgeStyle();
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
            >
              {isActive && (
                <div
                  aria-hidden="true"
                  className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none"
                />
              )}
              <p
                className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
                  isActive ? 'text-[#1c252e]' : 'text-[#637381]'
                }`}
              >
                {tab.label}
              </p>
              <div className={`${badge.bg} content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0`}>
                <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${badge.text} text-[12px] text-center`}>
                  {count}
                </p>
              </div>
            </div>
          );
        })}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ── B. Filter area (no border-b) ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <DropdownSelect
          label="採購組織"
          value={filterPurchaseOrg}
          onChange={setFilterPurchaseOrg}
          options={PURCHASE_ORG_OPTIONS}
          searchable
        />
        <SearchField
          label="料號"
          value={filterMaterial}
          onChange={setFilterMaterial}
          type="search"
        />
        <SearchField
          label="廠商"
          value={filterVendor}
          onChange={setFilterVendor}
          type="search"
        />
        <DropdownSelect
          label="工廠"
          value={filterPlant}
          onChange={setFilterPlant}
          options={PLANT_OPTIONS}
          searchable
        />
      </div>

      {/* ── C. Filter chips ── */}
      {activeFilters.length > 0 && (
        <div className="shrink-0 flex items-center gap-[8px] flex-wrap px-[20px] pb-[12px]">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-[4px] px-[10px] py-[4px] rounded-[8px] bg-[rgba(145,158,171,0.12)] text-[13px] text-[#1c252e]"
            >
              <span className="font-semibold">{f.label}:</span> {f.value}
              <button
                onClick={f.onClear}
                className="ml-[2px] hover:opacity-70 transition-opacity"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#637381"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-[4px] px-[8px] py-[4px] text-[13px] text-[#ff5630] hover:opacity-70 transition-opacity cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                stroke="#ff5630"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Clear
          </button>
        </div>
      )}

      {/* ── D. StandardDataTable ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<PartWithDisplay>
          columns={columns}
          data={displayData}
          storageKey="parts-maintenance-list-v1"
          showCheckbox={userRole !== 'vendor'}
          actionButton={actionButton}
          externalFilteredData={displayData}
          onExportCsv={() => {
            toast('匯出 CSV 功能開發中');
          }}
        />
      </div>

      <Toaster />
    </div>
  );
}
