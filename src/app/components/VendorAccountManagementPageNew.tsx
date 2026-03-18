import { useState, useEffect } from 'react';
import svgPaths from "@/imports/svg-c0egreeez0";
import type { PageType } from './MainLayout';
import { VendorDetailPage } from './VendorDetailPage';
import type { UserRole } from '../App';
import { VendorManagementTable } from './VendorManagementTable';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { TableToolbar } from './TableToolbar';
import { ResponsivePageLayout } from './ResponsivePageLayout';

interface VendorAccountManagementPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: UserRole;
  pendingVendorApproval?: {
    name: string;
    email: string;
    company: string;
    epCode: string;
  } | null;
  onClearPendingApproval?: () => void;
}

// 搜索字段组件
function SearchField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
}) {
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
              className="flex-1 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[15px] bg-transparent border-none outline-none"
              style={{ border: 'none', outline: 'none' }}
            />
            <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px]">
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

export default function VendorAccountManagementPageNew({ 
  currentPage, 
  onPageChange, 
  onLogout,
  userRole = 'giant',
  pendingVendorApproval,
  onClearPendingApproval
}: VendorAccountManagementPageProps) {
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [detailPageTab, setDetailPageTab] = useState<'vendor' | 'sales' | 'contacts'>('vendor');
  const [vendorNameFilter, setVendorNameFilter] = useState('');
  const [salesPersonFilter, setSalesPersonFilter] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<any[]>([]);
  const [tempColumns, setTempColumns] = useState<any[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // 獲取當前登入用戶的email
  const [currentUserEmail] = useState<string>(() => {
    return localStorage.getItem('currentUserEmail') || 'default';
  });

  // 當收到待審核通過的廠商時，自動跳轉到業務帳號頁面
  useEffect(() => {
    if (pendingVendorApproval) {
      setDetailPageTab('sales');
      setShowDetailPage(true);
    }
  }, [pendingVendorApproval]);

  const handleVendorClick = () => {
    setDetailPageTab('vendor');
    setShowDetailPage(true);
  };

  const handleSalesClick = () => {
    setDetailPageTab('sales');
    setShowDetailPage(true);
  };

  // 處理欄位變更
  const handleColumnsChange = (columns: any[]) => {
    setAvailableColumns(columns);
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
    const storageKey = `vendorManagement_${currentUserEmail}_columns`;
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
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterDialog(false);
  };

  // 打開 Columns 選擇器
  const handleColumnsClick = () => {
    let columnsToUse = availableColumns;
    
    if (columnsToUse.length === 0) {
      const storageKey = `vendorManagement_${currentUserEmail}_columns`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          columnsToUse = JSON.parse(saved);
        } else {
          const defaultColumns = [
            { key: 'name', label: '廠商名稱', width: 150, minWidth: 100 },
            { key: 'fullName', label: '廠商完整名稱', width: 250, minWidth: 100 },
            { key: 'phone', label: '電話', width: 180, minWidth: 100 },
            { key: 'address', label: '地址', width: 300, minWidth: 150 },
            { key: 'salesCount', label: '業務數', width: 120, minWidth: 80 },
            { key: 'mainProducts', label: '主要營業產品', width: 400, minWidth: 200 },
          ];
          columnsToUse = defaultColumns;
        }
      } catch (error) {
        console.error('Failed to load columns:', error);
      }
    }
    
    setTempColumns(JSON.parse(JSON.stringify(columnsToUse)));
    setShowColumnSelector(!showColumnSelector);
  };

  // 計算篩選後的資料數量
  const getFilteredCount = () => {
    // 這裡簡化處理，實際應該從 VendorManagementTable 獲取
    return 11;
  };

  if (showDetailPage) {
    return (
      <VendorDetailPage
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page === 'VendorAccountManagement') {
            setShowDetailPage(false);
          } else {
            onPageChange(page);
          }
        }}
        onLogout={onLogout}
        onBack={() => setShowDetailPage(false)}
        userRole={userRole}
        defaultTab={detailPageTab}
        pendingVendorApproval={pendingVendorApproval}
        onClearPendingApproval={onClearPendingApproval}
      />
    );
  }

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="廠商帳號管理"
      breadcrumb="帳號管理 • 廠商帳號管理"
    >
        <div className="bg-white w-full h-full rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] flex flex-col overflow-hidden">
          
          {/* 搜索區域 */}
          <div className="relative shrink-0 w-full" style={{ borderBottom: 'none' }}>
            <div className="flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px]" style={{ borderBottom: 'none' }}>
              <SearchField label="廠商名稱(編號)" value={vendorNameFilter} onChange={setVendorNameFilter} />
              <SearchField label="業務人員" value={salesPersonFilter} onChange={setSalesPersonFilter} />
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
                availableColumns={availableColumns.length > 0 ? availableColumns : [
                  { key: 'name', label: '廠商名稱' },
                  { key: 'fullName', label: '廠商完整名稱' },
                  { key: 'phone', label: '電話' },
                  { key: 'address', label: '地址' },
                  { key: 'salesCount', label: '業務數' },
                  { key: 'mainProducts', label: '主要營業產品' },
                ]}
                onFiltersChange={setFilters}
                onClose={() => setShowFilterDialog(false)}
                onApply={handleApplyFilters}
              />
            }
          />

          {/* 表格區域 */}
          <VendorManagementTable
            onVendorClick={handleVendorClick}
            onSalesClick={handleSalesClick}
            vendorNameFilter={vendorNameFilter}
            salesPersonFilter={salesPersonFilter}
            userEmail={currentUserEmail}
            onColumnsChange={handleColumnsChange}
            columnsVersion={columnsVersion}
            appliedFilters={appliedFilters}
          />
        </div>
    </ResponsivePageLayout>
  );
}