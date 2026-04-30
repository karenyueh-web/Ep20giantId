import { useState } from 'react';
import { DropdownSelect } from './DropdownSelect';
import { AdvancedMailSettingsTable, getMailSettingsColumns } from './AdvancedMailSettingsTable';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { TableToolbar } from './TableToolbar';

// 郵件接收設定資料型別（與 AdvancedMailSettingsTable 一致）
interface MailSettingData {
  id: string;
  vendorCode: string;
  purchaseOrg: string;
  all: boolean;
  smallPlatform: boolean;
  newOrder: boolean;
  correction: boolean;
  paperInvoice: boolean;
  shipping: boolean;
  priceAbnormal: boolean;
  partsMaintenance: boolean;
  sample: boolean;
}

interface MailSettingsTabContentProps {
  showAddVendorOverlay: boolean;
  setShowAddVendorOverlay: (show: boolean) => void;
}

// 檢查除了 ALL 以外是否全部為 true
const areAllFieldsChecked = (item: MailSettingData): boolean => {
  return item.smallPlatform && item.newOrder && item.correction &&
         item.paperInvoice && item.shipping && item.priceAbnormal &&
         item.partsMaintenance && item.sample;
};

export function MailSettingsTabContent({
  showAddVendorOverlay,
  setShowAddVendorOverlay
}: MailSettingsTabContentProps) {
  // 篩選狀態
  const [filterOrg, setFilterOrg] = useState<string | null>(null);
  const [filterVendor, setFilterVendor] = useState<string | null>(null);

  // 進階表格功能狀態
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<any[]>([]);
  const [tempColumns, setTempColumns] = useState<any[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // 獲取當前登入用戶的email
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 'default';

  // Mail 接收設定資料 - 完全自包含
  const [mailSettingsData, setMailSettingsData] = useState<MailSettingData[]>([
    {
      id: '1',
      vendorCode: '速聯(000100463)',
      purchaseOrg: '1013',
      all: true,
      smallPlatform: true,
      newOrder: true,
      correction: true,
      paperInvoice: true,
      shipping: true,
      priceAbnormal: true,
      partsMaintenance: true,
      sample: true,
    },
    {
      id: '2',
      vendorCode: '速聯(000100463)',
      purchaseOrg: '1017',
      all: false,
      smallPlatform: false,
      newOrder: true,
      correction: true,
      paperInvoice: false,
      shipping: true,
      priceAbnormal: true,
      partsMaintenance: true,
      sample: false,
    },
  ]);

  // 處理 checkbox 變更 - 包含 ALL 連動邏輯
  const handleMailCheckboxChange = (id: string, field: string, value: boolean) => {
    setMailSettingsData(prev => prev.map(item => {
      if (item.id !== id) return item;

      if (field === 'all') {
        // ALL 勾選/取消：連動所有其他欄位
        return {
          ...item,
          all: value,
          smallPlatform: value,
          newOrder: value,
          correction: value,
          paperInvoice: value,
          shipping: value,
          priceAbnormal: value,
          partsMaintenance: value,
          sample: value,
        };
      } else {
        // 單一欄位變更：自動判斷 ALL 狀態
        const updatedItem = { ...item, [field]: value };
        updatedItem.all = areAllFieldsChecked(updatedItem);
        return updatedItem;
      }
    }));
  };

  // 處理欄位可見性切換
  const handleToggleColumn = (key: string) => {
    const updatedColumns = tempColumns.map(col => 
      col.key === key ? { ...col, visible: !(col.visible !== false) } : col
    );
    setTempColumns(updatedColumns);
  };

  const handleToggleAll = (selectAll: boolean) => {
    setTempColumns(tempColumns.map(col => ({ ...col, visible: selectAll })));
  };
  
  // 應用欄位變更
  const handleApplyColumns = () => {
    const storageKey = `mailSettings_${currentUserEmail}_columns`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(tempColumns));
      setAvailableColumns(tempColumns);
      setColumnsVersion(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save columns:', error);
    }
    setShowColumnSelector(false);
  };

  // 應用篩選條件
  const handleApplyFilters = (validFilters: typeof filters) => {
    setAppliedFilters(validFilters);
    setShowFilterDialog(false);
  };

  // 打開 Columns 選擇器
  const handleColumnsClick = () => {
    let columnsToUse = availableColumns;
    
    if (columnsToUse.length === 0) {
      const storageKey = `mailSettings_${currentUserEmail}_columns`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          columnsToUse = JSON.parse(saved);
        } else {
          columnsToUse = getMailSettingsColumns();
        }
      } catch (error) {
        console.error('Failed to load columns:', error);
        columnsToUse = getMailSettingsColumns();
      }
    }
    
    setTempColumns(JSON.parse(JSON.stringify(columnsToUse)));
    setShowColumnSelector(!showColumnSelector);
  };

  // 根據 dropdown 篩選資料
  const filteredByDropdown = mailSettingsData.filter(item => {
    if (filterOrg && item.purchaseOrg !== filterOrg) return false;
    if (filterVendor && !item.vendorCode.includes(filterVendor)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* 篩選區域 */}
      <div className="px-[23px] py-[20px] bg-white shrink-0">
        <div className="flex gap-[12px] items-center">
          {/* 採購組織 DropdownSelect */}
          <div className="flex-1">
            <DropdownSelect
              label="採購組織"
              value={filterOrg || ''}
              onChange={(value) => setFilterOrg(value || null)}
              options={[
                { value: '', label: 'All' },
                { value: '1101', label: '1101 (台灣廠生產採購)' },
                { value: '1010', label: '1010 (總部GEM委購)' },
                { value: '1011', label: '1011 (GBD商品採購)' },
                { value: '1013', label: '1013 (GCX委購)' },
                { value: '1014', label: '1014 (GI委購)' },
              ]}
              placeholder=""
              searchable={true}
            />
          </div>
          
          {/* 廠商編號 DropdownSelect */}
          <div className="flex-1">
            <DropdownSelect
              label="廠商編號"
              value={filterVendor || ''}
              onChange={(value) => setFilterVendor(value || null)}
              options={[
                { value: '', label: 'All' },
                { value: '000100463', label: '000100463' },
                { value: '000100464', label: '000100464' },
                { value: '000100465', label: '000100465' },
              ]}
              placeholder=""
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* TableToolbar - 結果數量和工具列 */}
      <div className="shrink-0">
        <TableToolbar
          resultsCount={filteredByDropdown.length}
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
              availableColumns={availableColumns.length > 0 ? availableColumns : getMailSettingsColumns()}
              onFiltersChange={setFilters}
              onClose={() => setShowFilterDialog(false)}
              onApply={handleApplyFilters}
            />
          }
          actionButton={
            <button 
              onClick={() => setShowAddVendorOverlay(true)}
              className="bg-[#1c252e] flex items-center justify-center h-[36px] px-[12px] rounded-[8px] min-w-[64px] hover:bg-[#2c3540] transition-colors"
            >
              <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">
                新增
              </p>
            </button>
          }
        />
      </div>

      {/* 進階表格區域 */}
      <div className="flex-1 overflow-hidden bg-white">
        <AdvancedMailSettingsTable
          data={filteredByDropdown}
          onCheckboxChange={handleMailCheckboxChange}
          userEmail={currentUserEmail}
          appliedFilters={appliedFilters}
          columnsVersion={columnsVersion}
        />
      </div>
    </div>
  );
}