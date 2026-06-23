'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  getParts,
  setAllParts,
  bulkUpdateParts,
} from './partsMaintenanceData';
import { downloadQuotationTemplate } from './PartsUploadManager';
import { PartsUploadOverlay } from './PartsUploadOverlay';

// ── Props ─────────────────────────────────────────────────────────────────────
interface PartsMaintenancePageProps {
  userRole: string; // 'vendor' | 'procurement' | 'giant'
  onBreadcrumbChange?: (title: string, breadcrumb: string) => void;
}

// ── Tab 定義 ───────────────────────────────────────────────────────────────────
type TabId = 'all' | 'pending' | 'quoted';
const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: '未報價' },
  { id: 'quoted', label: '已報價' },
];

// ── 寄送時間 Tooltip（Portal 定位，繞過 cell overflow:hidden）────────────────────
function NotifySentTooltip({
  sentAt,
  anchorRef,
  onClose,
}: {
  sentAt: string[];
  anchorRef: React.RefObject<HTMLSpanElement | null>;
  onClose: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const TOOLTIP_W = 260;
    // 假設每列約 44px， header 40px， padding 32px
    const TOOLTIP_H = 40 + sentAt.length * 44 + 32;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= TOOLTIP_H ? rect.bottom + 8 : rect.top - TOOLTIP_H - 8;
    const left = Math.min(rect.left, window.innerWidth - TOOLTIP_W - 12);
    setPos({ top, left });
  }, [anchorRef, sentAt.length]);

  if (!pos) return null;

  return createPortal(
    <div
      onMouseEnter={(e) => e.stopPropagation()}
      style={{ top: pos.top, left: pos.left, width: 260, zIndex: 9999 }}
      className="fixed bg-white rounded-[12px] shadow-[0px_4px_24px_rgba(0,0,0,0.16)] border border-[rgba(145,158,171,0.16)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-[8px] px-[16px] py-[12px] bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.12)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">
          寄送紀錄
        </span>
        <span className="ml-auto inline-flex items-center px-[6px] py-[1px] rounded-[4px] bg-[rgba(34,197,94,0.12)] text-[#118d57] text-[11px] font-semibold">
          共 {sentAt.length} 次
        </span>
      </div>
      {/* List */}
      <div className="px-[12px] py-[8px] flex flex-col gap-[2px]">
        {sentAt.map((t, i) => (
          <div key={i} className="flex items-center gap-[10px] px-[8px] py-[8px] rounded-[8px] hover:bg-[rgba(145,158,171,0.06)] transition-colors">
            {/* 次數 badge */}
            <span className={`shrink-0 inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-[11px] font-bold ${
              i === 0
                ? 'bg-[rgba(22,119,255,0.12)] text-[#1677ff]'
                : 'bg-[rgba(255,171,0,0.16)] text-[#b76e00]'
            }`}>
              {i + 1}
            </span>
            {/* 日期 + 時間 */}
            <div className="flex flex-col">
              <span className="font-['Public_Sans:Medium',sans-serif] font-medium text-[13px] text-[#1c252e] leading-[20px]">
                {t.split(' ')[0]}
              </span>
              <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381] leading-[18px]">
                {t.split(' ')[1] || ''}
              </span>
            </div>
            {/* 標示 */}
            {i === 0 && (
              <span className="ml-auto text-[11px] text-[#637381] whitespace-nowrap">首次寄送</span>
            )}
            {i > 0 && (
              <span className="ml-auto text-[11px] text-[#b76e00] whitespace-nowrap">催促 #{i}</span>
            )}
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}

// ── 通知狀態 Badge ───────────────────────────────────────────────────────
function NotifyBadge({ status, sentAt }: { status: 'sent' | 'unsent'; sentAt?: string[] }) {
  const [hovered, setHovered] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const hasSentHistory = status === 'sent' && sentAt && sentAt.length > 0;

  if (status === 'sent') {
    return (
      <span
        ref={badgeRef}
        onMouseEnter={() => hasSentHistory && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-[6px] text-[12px] font-medium leading-[20px] whitespace-nowrap bg-[rgba(34,197,94,0.16)] text-[#118d57] ${
          hasSentHistory ? 'cursor-pointer' : ''
        }`}
      >
        已發送通知
        {hasSentHistory && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-60">
            <circle cx="12" cy="12" r="10" stroke="#118d57" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="#118d57" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        {hovered && hasSentHistory && (
          <NotifySentTooltip
            sentAt={sentAt!}
            anchorRef={badgeRef}
            onClose={() => setHovered(false)}
          />
        )}
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
  const [partsData, setPartsData] = useState<PartRecord[]>(() => [...getParts()]);

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

  // ── Tab 篩選 ─────────────────────────────────────────────────────────
  const tabFilteredData = useMemo(() => {
    if (activeTab === 'pending') return roleBaseData.filter((p) => p.quoteStatus === 'pending');
    if (activeTab === 'quoted') return roleBaseData.filter((p) => p.quoteStatus === 'quoted');
    return roleBaseData;
  }, [roleBaseData, activeTab]);

  // ── 搜尋/下拉篩選 ──────────────────────────────────────────────────────
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

  // ── 點擊料號 → 進入明細 ──────────────────────────────────────────────────
  const handleMaterialClick = useCallback(
    (part: PartRecord) => {
      setViewingPart(part);
      onBreadcrumbChange?.('零件資訊維護', '零件/索樣維護 • 零件資訊維護 • 明細');
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
      setPartsData((prev) => {
        // 先更新自己這筆
        const newData = prev.map((p) => (p.id === updated.id ? updated : p));

        // 若未勾選同步或工廠非 GTM1，直接結束
        if (!updated.syncDtcDte || updated.plant !== 'GTM1') {
          setAllParts(newData);   // 同步寫入 store
          return newData;
        }

        // 計算同步時間戳
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const savedAt = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        // 沿用已報價判斷邏輯
        const hasQuote =
          updated.qaCompletionDate.trim() !== '' ||
          updated.sampleDate.trim() !== '' ||
          updated.firstDeliveryDate.trim() !== '' ||
          updated.vendorPartNo.trim() !== '';

        // 找出同廠商、同料號、同採購組織、同長規格敘述且工廠為 DTC1 / DTE1 的資料，同步可編輯欄位
        const synced = newData.map((p) => {
          if (
            p.id !== updated.id &&
            p.vendorCode === updated.vendorCode &&
            p.material === updated.material &&
            p.purchaseOrg === updated.purchaseOrg &&
            p.longDescription === updated.longDescription &&
            (p.plant === 'DTC1' || p.plant === 'DTE1')
          ) {
            return {
              ...p,
              qaCompletionDate: updated.qaCompletionDate,
              sampleDate: updated.sampleDate,
              firstDeliveryDate: updated.firstDeliveryDate,
              vendorPartNo: updated.vendorPartNo,
              grossWeight: updated.grossWeight,
              netWeight: updated.netWeight,
              weightUnit: updated.weightUnit,
              remark: updated.remark,
              brandSettings: updated.brandSettings.map((bs) => ({
                ...bs,
                id: Date.now() + Math.floor(Math.random() * 10000),
              })),
              syncDtcDte: true,
              quoteStatus: hasQuote ? 'quoted' : p.quoteStatus,
              savedAt,
            };
          }
          return p;
        });
        setAllParts(synced);   // 同步寫入 store
        return synced;
      });

      setViewingPart(null);
      onBreadcrumbChange?.('零件資訊維護', '零件/索樣維護 • 零件資訊維護');

      // 同步成功通知
      if (updated.syncDtcDte && updated.plant === 'GTM1') {
        toast('已同步至 DTC1 / DTE1 相符資料');
      }
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
        renderCell: (_val, row) => <NotifyBadge status={row.notifyStatus} sentAt={row.notifySentAt} />,
      },
      { key: 'updatedAt', label: '資料更新時間', width: 160, minWidth: 120 },
    ],
    [handleMaterialClick],
  );

  // ── Detail 頁渲染 ──────────────────────────────────────────────────────────
  if (viewingPart) {
    return (
      <div className="bg-white flex flex-col min-h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full">
        <PartsMaintenanceDetailPage
          part={viewingPart}
          onClose={handleBackToList}
          onSave={handleDetailSave}
        />
      </div>
    );
  }

  // ── 上傳 Overlay 狀態 ─────────────────────────────────────────────
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);

  // ── action button（Toolbar 右側）────────────────────────────────────────────
  const actionButton = (
    <div className="flex items-center gap-[12px]">
      {userRole !== 'vendor' && activeTab === 'pending' && (
        <button
          onClick={() => setShowUploadOverlay(true)}
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
          // 只有「未報價」顯示數量（All 與已報價資料只增不減，顯示數量無意義）
          const showBadge = tab.id === 'pending';
          const count = tabCounts.pending;
          const getBadgeStyle = () => {
            if (!isActive) return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
            return { bg: 'bg-[rgba(255,171,0,0.16)]', text: 'text-[#b76e00]' };
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
              {showBadge && (
                <div className={`${badge.bg} content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0`}>
                  <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${badge.text} text-[12px] text-center`}>
                    {count}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ── B. Filter area (no border-b) ── */}
      <div className="shrink-0 grid grid-cols-4 gap-[16px] items-start px-[20px] py-[20px]">
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

      {/* ── D. StandardDataTable ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<PartWithDisplay>
          columns={columns}
          data={displayData}
          storageKey="parts-maintenance-list-v2"
          showCheckbox={userRole !== 'vendor'}
          actionButton={actionButton}
          externalFilteredData={displayData}
          onExportCsv={() => {
            toast('匯出 CSV 功能開發中');
          }}
          onDownloadPartsTemplate={
            activeTab === 'pending'
              ? () => {
                  const pendingParts = displayData.filter(p => p.quoteStatus === 'pending') as unknown as PartRecord[];
                  downloadQuotationTemplate(pendingParts);
                }
              : undefined
          }
        />
      </div>

      {/* ── 上傳 Overlay ── */}
      {showUploadOverlay && (
        <PartsUploadOverlay
          onClose={() => setShowUploadOverlay(false)}
          pendingParts={displayData.filter(p => p.quoteStatus === 'pending') as unknown as PartRecord[]}
          onConfirm={(sheet1Data, sheet2Data) => {
            // Phase 4：批次寫入
            const count = bulkUpdateParts(sheet1Data, sheet2Data);
            setShowUploadOverlay(false);
            // 刷新列表（從 module store 重新取得最新資料）
            setPartsData([...getParts()]);
            toast.success(`匯入完成：成功更新 ${count} 筆零件資料`);
          }}
        />
      )}

      <Toaster />
    </div>
  );
}
