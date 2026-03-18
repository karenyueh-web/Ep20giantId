import svgPaths from "@/imports/svg-imw9bns98t";
import { useState } from 'react';
import { QualityAbnormalDetail } from './QualityAbnormalDetail';
import { AdvancedQualityTable, qualityMockData, defaultQualityColumns, type QualityColumn } from './AdvancedQualityTable';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';

// Tab 類型
type TabKey = 'All' | '廠商確認中(V)' | '巨大確認中(G)' | '取消(CE)' | '關閉結案(CL)';

// Tab組件
function Tab({ label, isActive, badge, onClick, type }: { label: string; isActive?: boolean; badge?: string; onClick?: () => void; type?: string }) {
  const getBadgeColor = () => {
    if (!isActive) {
      return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
    }
    switch (type) {
      case 'V':
        return { bg: 'bg-[rgba(0,184,217,0.16)]', text: 'text-[#006c9c]' };
      case 'G':
        return { bg: 'bg-[rgba(255,171,0,0.16)]', text: 'text-[#B76E00]' };
      case 'CE':
        return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
      case 'CL':
        return { bg: 'bg-[rgba(34,197,94,0.16)]', text: 'text-[#118D57]' };
      default:
        return { bg: 'bg-[rgba(0,184,217,0.16)]', text: 'text-[#006c9c]' };
    }
  };

  const badgeColor = getBadgeColor();

  return (
    <div
      className={`content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer`}
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
        {label}
      </p>
      {badge && (
        <div className={`${badgeColor.bg} content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${badgeColor.text} text-[12px] text-center`}>
            {badge}
          </p>
        </div>
      )}
    </div>
  );
}

// Tabs
function Tabs({ activeTab, setActiveTab }: { activeTab: TabKey; setActiveTab: (tab: TabKey) => void }) {
  // 統計各狀態數量
  const vCount = qualityMockData.filter(d => d.status === 'V').length;
  const gCount = qualityMockData.filter(d => d.status === 'G').length;
  const ceCount = qualityMockData.filter(d => d.status === 'CE').length;
  const clCount = qualityMockData.filter(d => d.status === 'CL').length;

  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full">
          <Tab label="All" isActive={activeTab === 'All'} onClick={() => setActiveTab('All')} />
          <Tab label="廠商確認中(V)" badge={String(vCount)} isActive={activeTab === '廠商確認中(V)'} onClick={() => setActiveTab('廠商確認中(V)')} type="V" />
          <Tab label="巨大確認中(G)" badge={String(gCount)} isActive={activeTab === '巨大確認中(G)'} onClick={() => setActiveTab('巨大確認中(G)')} type="G" />
          <Tab label="取消(CE)" badge={String(ceCount)} isActive={activeTab === '取消(CE)'} onClick={() => setActiveTab('取消(CE)')} type="CE" />
          <Tab label="關閉結案(CL)" badge={String(clCount)} isActive={activeTab === '關閉結案(CL)'} onClick={() => setActiveTab('關閉結案(CL)')} type="CL" />
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
        </div>
      </div>
    </div>
  );
}

// 搜尋欄位
function SearchField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex-1 flex flex-col relative">
      <div className="h-[54px] relative rounded-[8px] w-full">
        <div className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="flex flex-row items-center size-full">
          <div className="flex items-center px-[14px] relative size-full">
            <div className="flex items-center pr-[8px] shrink-0">
              <div className="relative shrink-0 size-[24px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p14834500} fill="var(--fill-0, #919EAB)" />
                </svg>
              </div>
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder=" "
              className="flex-1 font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[15px] bg-transparent border-none outline-none"
              style={{ border: 'none', outline: 'none' }}
            />
            <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] pointer-events-none">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">
                {label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 主要組件 =====
export function QualityAbnormalPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // 搜尋
  const [abnormalNumberFilter, setAbnormalNumberFilter] = useState('');
  const [partNumberFilter, setPartNumberFilter] = useState('');

  // Columns / Filters 控制
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<QualityColumn[]>([]);
  const [tempColumns, setTempColumns] = useState<QualityColumn[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // 用戶 email
  const [currentUserEmail] = useState<string>(() => {
    return localStorage.getItem('currentUserEmail') || 'default';
  });

  // ===== 處理欄位 =====
  const handleColumnsChange = (columns: QualityColumn[]) => {
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
    const safeTab = activeTab.replace(/[^a-zA-Z0-9]/g, '_');
    const storageKey = `qualityAbnormal_${currentUserEmail}_${safeTab}_columns`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(tempColumns));
      setAvailableColumns(tempColumns);
      setColumnsVersion(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save columns:', error);
    }
    setShowColumnSelector(false);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterDialog(false);
  };

  // 打開 Columns 選擇器
  const handleColumnsClick = () => {
    let columnsToUse = availableColumns;

    if (columnsToUse.length === 0) {
      const safeTab = activeTab.replace(/[^a-zA-Z0-9]/g, '_');
      const storageKey = `qualityAbnormal_${currentUserEmail}_${safeTab}_columns`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          columnsToUse = JSON.parse(saved);
        } else {
          columnsToUse = defaultQualityColumns.map(col => ({ ...col }));
        }
      } catch (error) {
        console.error('Failed to load columns:', error);
        columnsToUse = defaultQualityColumns.map(col => ({ ...col }));
      }
    }

    setTempColumns(JSON.parse(JSON.stringify(columnsToUse)));
    setShowColumnSelector(!showColumnSelector);
  };

  // ===== 計算過濾結果數 =====
  const getFilteredCount = () => {
    let data = qualityMockData;

    // Tab 過濾
    if (activeTab !== 'All') {
      const statusMatch = activeTab.match(/\(([A-Z]+)\)/);
      if (statusMatch) {
        data = data.filter(item => item.status === statusMatch[1]);
      }
    }

    // 搜尋過濾
    data = data.filter(item => {
      const matchesAbnormal = !abnormalNumberFilter ||
        item.abnormalNumber.toLowerCase().includes(abnormalNumberFilter.toLowerCase());
      const matchesPart = !partNumberFilter ||
        item.partNumber.toLowerCase().includes(partNumberFilter.toLowerCase());
      return matchesAbnormal && matchesPart;
    });

    // 進階篩選
    if (appliedFilters.length > 0) {
      data = data.filter(item => {
        return appliedFilters.every(filter => {
          const itemValue = item[filter.column as keyof typeof item];
          const filterValue = filter.value;
          switch (filter.operator) {
            case 'contains':
              return itemValue !== undefined && String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
            case 'equals':
              return itemValue !== undefined && String(itemValue).toLowerCase() === filterValue.toLowerCase();
            case 'notEquals':
              return itemValue === undefined || String(itemValue).toLowerCase() !== filterValue.toLowerCase();
            case 'startsWith':
              return itemValue !== undefined && String(itemValue).toLowerCase().startsWith(filterValue.toLowerCase());
            case 'endsWith':
              return itemValue !== undefined && String(itemValue).toLowerCase().endsWith(filterValue.toLowerCase());
            case 'isEmpty':
              return !itemValue || String(itemValue).trim() === '';
            case 'isNotEmpty':
              return itemValue !== undefined && String(itemValue).trim() !== '';
            default:
              return true;
          }
        });
      });
    }

    return data.length;
  };

  // ===== 狀態碼轉文字 =====
  const getStatusText = (status: string) => {
    switch (status) {
      case 'V': return '廠商確認中';
      case 'G': return '巨大確認中';
      case 'CE': return '取消';
      case 'CL': return '已結案';
      default: return '廠商確認中';
    }
  };

  // ===== 顯示明細頁面 =====
  if (selectedRow) {
    return (
      <div className="content-stretch flex flex-col h-full items-start relative rounded-[16px] w-full">
        <QualityAbnormalDetail
          abnormalNumber={selectedRow.abnormalNumber}
          status={getStatusText(selectedRow.status)}
          onClose={() => setSelectedRow(null)}
        />
      </div>
    );
  }

  // ===== 列表頁面 =====
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setAbnormalNumberFilter('');
        setPartNumberFilter('');
      }} />

      {/* 搜尋欄 */}
      <div className="relative shrink-0 w-full" style={{ borderBottom: 'none' }}>
        <div className="flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px]" style={{ borderBottom: 'none' }}>
          <SearchField
            label="品質異常單號"
            value={abnormalNumberFilter}
            onChange={setAbnormalNumberFilter}
          />
          <SearchField
            label="料號"
            value={partNumberFilter}
            onChange={setPartNumberFilter}
          />
        </div>
      </div>

      {/* 工具欄 */}
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
            availableColumns={
              availableColumns.length > 0
                ? availableColumns.map(c => ({ key: c.key, label: c.label }))
                : defaultQualityColumns.map(c => ({ key: c.key, label: c.label }))
            }
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />
        }
      />

      {/* 進階表格 */}
      <AdvancedQualityTable
        activeTab={activeTab}
        data={qualityMockData}
        onRowClick={(row) => setSelectedRow(row)}
        abnormalNumberFilter={abnormalNumberFilter}
        partNumberFilter={partNumberFilter}
        userEmail={currentUserEmail}
        onColumnsChange={handleColumnsChange}
        columnsVersion={columnsVersion}
        appliedFilters={appliedFilters}
      />
    </div>
  );
}