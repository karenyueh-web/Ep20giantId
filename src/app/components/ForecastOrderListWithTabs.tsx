import { useState, useMemo } from 'react';
import { AdvancedForecastTable, defaultForecastColumns, forecastOrderMockData, type ForecastColumn, type ForecastOrderRow } from './AdvancedForecastTable';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { ForecastUploadOverlay } from './ForecastUploadOverlay';
import { ForecastDeleteDeniedOverlay } from './ForecastDeleteDeniedOverlay';
import { exportForecastExcel, exportForecastCsv } from './OrderCsvManager';
import svgRefresh from '@/imports/svg-xqdbomdz5p';

// ── Mock 當前登入者資訊（實際應從 AuthContext 取得）──────────────────────────
// purchaseOrgs: 登入者在【巨大帳號管理 > 採購組織設定】所屬的採購組織清單
const MOCK_CURRENT_USER = {
  account: 'buyer01',       // 對應 ForecastOrderRow.updatedBy
  purchaseOrgs: ['2000'],   // 對應 ForecastOrderRow.purchaseOrg
};

// ── 採購群組選項 ───────────────────────────────────────────────────────────────
const PURCHASE_GROUP_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PG01', label: 'PG01' },
  { value: 'PG02', label: 'PG02' },
  { value: 'PG03', label: 'PG03' },
];

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function ForecastOrderListWithTabs() {
  const [currentUserEmail] = useState<string>(() =>
    localStorage.getItem('currentUserEmail') || 'default'
  );
  const STORAGE_KEY = `forecastOrder_${currentUserEmail}_columns`;

  // ── 資料來源（可刪除） ──
  const [tableData, setTableData] = useState<ForecastOrderRow[]>(() =>
    forecastOrderMockData.map(r => ({ ...r }))
  );

  // ── ColumnSelector 狀態 ──
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [tempColumns, setTempColumns] = useState<ForecastColumn[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);

  // ── FilterDialog 狀態 ──
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // ── 搜尋欄位狀態 ──
  const [vendorSearch, setVendorSearch] = useState('');
  const [purchaseGroupSearch, setPurchaseGroupSearch] = useState('');
  const [materialNoSearch, setMaterialNoSearch] = useState('');

  // ── Toast ──
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 上傳 Overlay 狀態 ──
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);

  // ── 無權限 Overlay ──
  const [deniedRows, setDeniedRows] = useState<ForecastOrderRow[]>([]);
  const [showDeniedOverlay, setShowDeniedOverlay] = useState(false);

  // ── 資料更新時間 ──
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setLastUpdated(`${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`);
      setRefreshing(false);
      showToast('資料已更新');
    }, 1000);
  };

  // ── 搜尋過濾資料 ──
  const searchFilteredData = useMemo(() => {
    return tableData.filter(row => {
      if (vendorSearch && !row.vendor.toLowerCase().includes(vendorSearch.toLowerCase())) return false;
      if (purchaseGroupSearch && row.purchaseGroup !== purchaseGroupSearch) return false;
      if (materialNoSearch && !row.materialNo.toLowerCase().includes(materialNoSearch.toLowerCase())) return false;
      return true;
    });
  }, [tableData, vendorSearch, purchaseGroupSearch, materialNoSearch]);

  // ── 欄位選擇器：開啟 ──
  const handleColumnsClick = () => {
    if (!showColumnSelector) {
      // 初始化 tempColumns（優先從 localStorage 讀取最新狀態）
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ForecastColumn[];
          if (parsed.length === defaultForecastColumns.length) {
            setTempColumns(JSON.parse(JSON.stringify(parsed)));
          } else {
            setTempColumns(JSON.parse(JSON.stringify(defaultForecastColumns)));
          }
        } else {
          setTempColumns(JSON.parse(JSON.stringify(defaultForecastColumns)));
        }
      } catch {
        setTempColumns(JSON.parse(JSON.stringify(defaultForecastColumns)));
      }
    }
    setShowColumnSelector(prev => !prev);
    setShowFilterDialog(false);
  };

  // ── 欄位選擇器：表格通知欄位異動（用於同步 tempColumns）──
  const handleColumnsChange = (cols: ForecastColumn[]) => {
    // 只在 ColumnSelector 尚未開啟時同步，避免蓋掉使用者正在編輯的狀態
    if (!showColumnSelector) {
      setTempColumns(JSON.parse(JSON.stringify(cols)));
    }
  };

  const handleToggleColumn = (key: string) =>
    setTempColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c));

  const handleToggleAll = (all: boolean) =>
    setTempColumns(prev => prev.map(c => ({ ...c, visible: all })));

  const handleApplyColumns = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tempColumns)); } catch { /* */ }
    setColumnsVersion(v => v + 1); // 觸發 AdvancedForecastTable 重新載入
    setShowColumnSelector(false);
  };

  // ── 篩選器 ──
  const handleFiltersClick = () => {
    setShowFilterDialog(prev => !prev);
    setShowColumnSelector(false);
  };
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterDialog(false);
  };

  // ── 刪除資料（含權限檢查） ──
  const handleDeleteRows = (ids: Set<number>) => {
    const allSelected = tableData.filter(r => ids.has(r.id));

    // 判斷每筆是否有刪除權
    const canDelete: ForecastOrderRow[] = [];
    const cannotDelete: ForecastOrderRow[] = [];

    allSelected.forEach(row => {
      const orgMatch = MOCK_CURRENT_USER.purchaseOrgs.includes(row.purchaseOrg);
      const ownerMatch = row.updatedBy === MOCK_CURRENT_USER.account;
      if (orgMatch || ownerMatch) {
        canDelete.push(row);
      } else {
        cannotDelete.push(row);
      }
    });

    // 刪除有權限的列
    if (canDelete.length > 0) {
      const deleteIds = new Set(canDelete.map(r => r.id));
      setTableData(prev => prev.filter(r => !deleteIds.has(r.id)));
      showToast(`已刪除 ${canDelete.length} 筆預測訂單`);
    }

    // 顯示無權限的列
    if (cannotDelete.length > 0) {
      setDeniedRows(cannotDelete);
      setShowDeniedOverlay(true);
    }
  };

  // ── Export ──
  const handleExport = () =>
    showToast(`已匯出 ${searchFilteredData.length} 筆預測訂單`);

  const getExportColumns = () =>
    tempColumns.length > 0 ? tempColumns : defaultForecastColumns;

  const handleExportExcel = () => {
    const cols = getExportColumns();
    const dateSuffix = new Date().toISOString().slice(0, 10);
    const count = exportForecastExcel(searchFilteredData, cols, `預測訂單匯出_${dateSuffix}.xlsx`);
    showToast(`已匯出 ${count} 筆預測訂單 (Excel)`);
  };

  const handleExportCsv = () => {
    const cols = getExportColumns();
    const dateSuffix = new Date().toISOString().slice(0, 10);
    exportForecastCsv(searchFilteredData, cols, `預測訂單匯出_${dateSuffix}.csv`);
    showToast(`已匯出 ${searchFilteredData.length} 筆預測訂單 (CSV)`);
  };

  // ── 新增 ──
  const handleAdd = () => setShowUploadOverlay(true);

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列 ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 w-full">
        <div className="flex gap-[16px] items-end flex-wrap px-[20px] pt-[20px] pb-[16px]">
          <SearchField
            label="廠商"
            value={vendorSearch}
            onChange={setVendorSearch}
          />
          <div className="flex-1 min-w-[150px]">
            <DropdownSelect
              label="採購群組"
              value={purchaseGroupSearch}
              onChange={setPurchaseGroupSearch}
              options={PURCHASE_GROUP_OPTIONS}
              placeholder="全部"
              searchable={true}
            />
          </div>
          <SearchField
            label="料號"
            value={materialNoSearch}
            onChange={setMaterialNoSearch}
          />
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <TableToolbar
        resultsCount={searchFilteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={handleFiltersClick}
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
            availableColumns={
              (tempColumns.length > 0 ? tempColumns : defaultForecastColumns) as any[]
            }
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />
        }
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        actionButton={
          <div className="flex items-center gap-[8px] shrink-0">
            {/* ── 資料更新按鈕 ── */}
            <div className="flex h-[36px] rounded-[8px] overflow-hidden shrink-0" style={{ boxShadow: 'none' }}>
              {/* 左：時間顯示 */}
              <div className="flex items-center px-[12px] border border-r-0 border-[rgba(0,94,184,0.48)] rounded-l-[8px] bg-white min-w-0">
                <span className="font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#005eb8] text-[12px] tracking-[0.4px] whitespace-nowrap leading-[16px]">
                  資料更新時間:{lastUpdated}
                </span>
              </div>
              {/* 右：重新整理圖示 */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center w-[40px] bg-[#005eb8] hover:bg-[#004680] transition-colors rounded-r-[8px] border border-[#005eb8] shrink-0 disabled:opacity-70"
              >
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  <svg
                    className={refreshing ? 'animate-spin' : ''}
                    style={{ width: '14.58px', height: '15.25px' }}
                    fill="none"
                    viewBox="0 0 14.5833 15.2472"
                  >
                    <path d={svgRefresh.p326f900} fill="white" />
                  </svg>
                </div>
              </button>
            </div>

            {/* ── 新增 ── */}
            <button
              onClick={handleAdd}
              className="flex items-center gap-[6px] h-[36px] px-[14px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors shrink-0"
            >
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white leading-none">
                新增
              </span>
            </button>
          </div>
        }
      />

      {/* ── 進階表格 ─────────────────────────────────────────────────────── */}
      <AdvancedForecastTable
        data={searchFilteredData}
        userEmail={currentUserEmail}
        onColumnsChange={handleColumnsChange}
        columnsVersion={columnsVersion}
        appliedFilters={appliedFilters}
        onDeleteRows={handleDeleteRows}
      />

      {/* ── 無權限刪除 Overlay ───────────────────────────────────────────── */}
      {showDeniedOverlay && (
        <ForecastDeleteDeniedOverlay
          deniedRows={deniedRows}
          onClose={() => { setShowDeniedOverlay(false); setDeniedRows([]); }}
        />
      )}

      {/* ── Upload Overlay ───────────────────────────────────────────────── */}
      {showUploadOverlay && (
        <ForecastUploadOverlay
          onClose={() => setShowUploadOverlay(false)}
          onConfirm={(file) => {
            showToast(`已接收檔案「${file.name}」，預測訂單更新中（Mock）`);
          }}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────────── */}
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