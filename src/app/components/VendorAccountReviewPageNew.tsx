import AccountApplicationDetail from '@/imports/帳號申請明細';
import { useState } from 'react';
import type { PageType } from './MainLayout';
import type { UserRole } from '@/app/App';
import { VendorReviewTable } from './VendorReviewTable';
import { mockVendorsSuccess, mockVendorsFail } from '@/imports/廠商帳號審核-4007-9767';
import svgPaths from '@/imports/svg-2bvk7xkhar';
import { DropdownSelect } from './DropdownSelect';
import { ResponsivePageLayout } from './ResponsivePageLayout';

interface VendorAccountReviewPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: UserRole;
  onApproveVendor?: (vendorInfo: { name: string; email: string; company: string; epCode: string }) => void;
}

// Tab组件
function Tab({ 
  isActive, 
  onClick, 
  label, 
  count, 
  type 
}: { 
  isActive: boolean; 
  onClick: () => void;
  label: string;
  count: number;
  type: 'success' | 'fail';
}) {
  const EndIcon = () => {
    const bgColor = type === 'fail' 
      ? isActive ? 'bg-[rgba(255,86,48,0.16)]' : 'bg-[rgba(145,158,171,0.16)]'
      : isActive ? 'bg-[rgba(0,94,184,0.16)]' : 'bg-[rgba(145,158,171,0.16)]';
    const textColor = type === 'fail'
      ? isActive ? 'text-[#b71d18]' : 'text-[#637381]'
      : isActive ? 'text-[#00559c]' : 'text-[#637381]';
    
    return (
      <div className={`${bgColor} flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] rounded-[6px]`}>
        <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] ${textColor} text-[12px] text-center`}>
          {count}
        </p>
      </div>
    );
  };

  return (
    <div 
      className="flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] shrink-0 cursor-pointer relative" 
      onClick={onClick}
    >
      {isActive && <div className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] text-[14px] ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
        {label}
      </p>
      <EndIcon />
    </div>
  );
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

// 欄位選擇器組件
function ColumnSelector({ 
  columns, 
  onToggleColumn, 
  onToggleAll,
  onClose,
  onApply
}: { 
  columns: any[]; 
  onToggleColumn: (key: string) => void;
  onToggleAll?: (selectAll: boolean) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const visibleCount = columns.filter(col => col.visible !== false).length;
  const allSelected = visibleCount === columns.length;
  
  return (
    <div className="relative bg-white rounded-[8px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-[280px] max-h-[450px] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 標題 */}
      <div className="px-[16px] py-[12px] border-b border-[rgba(145,158,171,0.08)] flex items-center justify-between">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#1c252e] text-[14px]">
          顯示欄位 ({visibleCount}/{columns.length})
        </p>
        <button
          className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1D7BF5] hover:text-[#1565C0] transition-colors px-[4px]"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleAll) {
              onToggleAll(!allSelected);
            }
          }}
        >
          all
        </button>
      </div>
      
      {/* 欄位列表 */}
      <div className="overflow-y-auto custom-scrollbar flex-1">
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex items-center px-[16px] py-[12px] hover:bg-[rgba(145,158,171,0.04)] cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggleColumn(column.key);
            }}
          >
            {/* 自定義 Checkbox */}
            <div className="flex items-center justify-center w-[20px] h-[20px] rounded-[4px] border-2 border-[rgba(145,158,171,0.3)] mr-[12px] shrink-0"
              style={{ 
                backgroundColor: column.visible !== false ? '#1D7BF5' : 'white',
                borderColor: column.visible !== false ? '#1D7BF5' : 'rgba(145,158,171,0.3)'
              }}
            >
              {column.visible !== false && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#1c252e] text-[14px] flex-1">
              {column.label}
            </p>
          </div>
        ))}
      </div>
      
      {/* 底部按鈕 */}
      <div className="px-[16px] py-[12px] border-t border-[rgba(145,158,171,0.08)] bg-white flex gap-[8px] justify-end">
        <button
          className="px-[16px] py-[8px] rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          取消
        </button>
        <button
          className="px-[16px] py-[8px] rounded-[8px] bg-[#1D7BF5] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#1565C0] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
        >
          應用
        </button>
      </div>
    </div>
  );
}

// Filter 條件介面
interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

// Filter 彈窗組件
function FilterDialog({ 
  filters,
  availableColumns,
  onFiltersChange,
  onClose,
  onApply
}: { 
  filters: FilterCondition[];
  availableColumns: any[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const operators = [
    { value: 'contains', label: '包含 (contains)' },
    { value: 'equals', label: '等於 (equals)' },
    { value: 'notEquals', label: '不等於 (not equals)' },
    { value: 'startsWith', label: '開頭是 (starts with)' },
    { value: 'endsWith', label: '結尾是 (ends with)' },
    { value: 'isEmpty', label: '為空 (is empty)' },
    { value: 'isNotEmpty', label: '不為空 (is not empty)' },
  ];

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: availableColumns[0]?.key || '',
      operator: 'contains',
      value: ''
    };
    onFiltersChange([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, field: keyof FilterCondition, value: string) => {
    onFiltersChange(filters.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  return (
    <div className="relative bg-white rounded-[8px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-[600px] max-h-[500px] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 標題 */}
      <div className="px-[20px] py-[16px] border-b border-[rgba(145,158,171,0.08)] flex items-center justify-between">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#1c252e] text-[16px]">
          篩選條件
        </p>
        <button
          onClick={onClose}
          className="w-[32px] h-[32px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)] flex items-center justify-center transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="#637381" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      
      {/* 篩選條件列表 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-[20px]">
        {filters.length === 0 ? (
          <div className="text-center py-[40px] text-[#919EAB]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">尚未新增篩選條件</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {filters.map((filter, index) => (
              <div key={filter.id} className="flex items-center gap-[12px]">
                {/* 欄位選擇 */}
                <div className="flex-1">
                  <select
                    value={filter.column}
                    onChange={(e) => updateFilter(filter.id, 'column', e.target.value)}
                    className="w-full h-[40px] px-[12px] border border-[rgba(145,158,171,0.2)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] text-[14px] bg-white outline-none focus:border-[#1D7BF5]"
                  >
                    {availableColumns.map(col => (
                      <option key={col.key} value={col.key}>{col.label}</option>
                    ))}
                  </select>
                </div>

                {/* 操作符選擇 */}
                <div className="flex-1">
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                    className="w-full h-[40px] px-[12px] border border-[rgba(145,158,171,0.2)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] text-[14px] bg-white outline-none focus:border-[#1D7BF5]"
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                {/* 值輸入 */}
                {filter.operator !== 'isEmpty' && filter.operator !== 'isNotEmpty' && (
                  <div className="flex-1">
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                      placeholder="輸入篩選值"
                      className="w-full h-[40px] px-[12px] border border-[rgba(145,158,171,0.2)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] text-[14px] outline-none focus:border-[#1D7BF5]"
                    />
                  </div>
                )}

                {/* 刪除按鈕 */}
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="w-[40px] h-[40px] rounded-[8px] hover:bg-[rgba(255,86,48,0.08)] flex items-center justify-center transition-colors shrink-0"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5L15 15" stroke="#FF5630" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 新增條件按鈕 */}
        <button
          onClick={addFilter}
          className="mt-[16px] flex items-center gap-[8px] px-[16px] py-[8px] rounded-[8px] border-2 border-dashed border-[rgba(145,158,171,0.3)] hover:border-[#1D7BF5] hover:bg-[rgba(29,123,245,0.04)] transition-colors w-full justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V15M5 10H15" stroke="#1D7BF5" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1D7BF5]">
            新增篩選條件
          </p>
        </button>
      </div>
      
      {/* 底部按鈕 */}
      <div className="px-[20px] py-[16px] border-t border-[rgba(145,158,171,0.08)] bg-white flex gap-[12px] justify-end">
        <button
          className="px-[16px] py-[8px] rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          取消
        </button>
        <button
          className="px-[16px] py-[8px] rounded-[8px] bg-[#1D7BF5] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#1565C0] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
        >
          應用篩選
        </button>
      </div>
    </div>
  );
}

export function VendorAccountReviewPageNew({ 
  currentPage, 
  onPageChange, 
  onLogout,
  userRole = 'procurement',
  onApproveVendor
}: VendorAccountReviewPageProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'success' | 'fail'>('success');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [vendorNameFilter, setVendorNameFilter] = useState('');
  const [companyNameFilter, setCompanyNameFilter] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<any[]>([]);
  const [tempColumns, setTempColumns] = useState<any[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0); // 新增：用於觸發表格重新載入
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // 獲取當前登入用戶的email（從localStorage）
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem('currentUserEmail') || 'default';
  });

  const handleApprove = (vendorInfo: { name: string; email: string; company: string; epCode: string }) => {
    console.log('審核通過廠商:', vendorInfo);
    if (onApproveVendor) {
      onApproveVendor(vendorInfo);
    }
  };

  const handleVendorClick = (vendorName: string) => {
    setSelectedVendor({ name: vendorName });
    setShowOverlay(true);
  };

  const handleTabChange = (tab: 'success' | 'fail') => {
    setActiveTab(tab);
    setSelectedRole('');
    setVendorNameFilter('');
    setCompanyNameFilter('');
  };

  // 處理欄位變更
  const handleColumnsChange = (columns: any[]) => {
    setAvailableColumns(columns);
  };

  // 處理欄位可見性切換（只更新臨時狀態）
  const handleToggleColumn = (key: string) => {
    const updatedColumns = tempColumns.map(col => 
      col.key === key ? { ...col, visible: !(col.visible !== false) } : col
    );
    setTempColumns(updatedColumns);
  };
  
  // 應用欄位變更
  const handleApplyColumns = () => {
    // 保存到 localStorage
    const storageKey = `vendorReview_${currentUserEmail}_${activeTab}_columns`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(tempColumns));
      // 更新 availableColumns，這會觸發表格重新渲染
      setAvailableColumns(tempColumns);
      setColumnsVersion(prev => prev + 1); // 更新版本號以觸發表格重新載入
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

  // 根据tab选择数据计算数量
  const baseVendors = activeTab === 'success' ? mockVendorsSuccess : mockVendorsFail;
  const filteredVendors = baseVendors.filter(vendor => {
    const matchesRole = !selectedRole || vendor.role === selectedRole;
    const matchesVendorName = !vendorNameFilter || vendor.name.toLowerCase().includes(vendorNameFilter.toLowerCase());
    const matchesCompanyName = !companyNameFilter || vendor.company.toLowerCase().includes(companyNameFilter.toLowerCase());
    return matchesRole && matchesVendorName && matchesCompanyName;
  });

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="廠商帳號審核"
      breadcrumb="帳號管理 • 廠商帳號審核"
    >
        <div className="bg-white w-full h-full rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] flex flex-col overflow-hidden">
          
          {/* Tab區域 */}
          <div className="relative shrink-0 w-full">
            <div className="flex flex-row items-center size-full">
              <div className="flex gap-[40px] items-center px-[20px] relative w-full">
                <Tab 
                  isActive={activeTab === 'success'} 
                  onClick={() => handleTabChange('success')} 
                  label="初審成功(SS)"
                  count={mockVendorsSuccess.length}
                  type="success"
                />
                <Tab 
                  isActive={activeTab === 'fail'} 
                  onClick={() => handleTabChange('fail')} 
                  label="初審失敗(FF)"
                  count={mockVendorsFail.length}
                  type="fail"
                />
                <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
              </div>
            </div>
          </div>

          {/* 搜索区域 */}
          <div className="relative shrink-0 w-full" style={{ borderBottom: 'none' }}>
            <div className="flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px]" style={{ borderBottom: 'none' }}>
              <SearchField label="廠商姓名" value={vendorNameFilter} onChange={setVendorNameFilter} />
              {activeTab === 'success' && (
                <SearchField label="公司名稱" value={companyNameFilter} onChange={setCompanyNameFilter} />
              )}
              <div className="flex-1">
                <DropdownSelect 
                  label="申請角色"
                  value={selectedRole}
                  onChange={(value) => setSelectedRole(value)}
                  options={[
                    { value: '', label: 'All' },
                    { value: '業務', label: '業務' },
                    { value: '品保', label: '品保' },
                    { value: '下包商', label: '下包商' },
                    { value: '開發人員', label: '開發人員' }
                  ]}
                  placeholder=""
                  searchable={true}
                />
              </div>
            </div>
          </div>

          {/* 工具栏 */}
          <div className="relative flex items-center justify-between px-[20px] py-[16px] bg-white shrink-0" style={{ borderTop: 'none', borderBottom: 'none' }}>
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#1c252e] text-[14px]">
              <span className="leading-[22px]">{filteredVendors.length} </span>
              <span className="leading-[22px] text-[#637381]">results found</span>
            </p>
            
            <div className="flex gap-[12px] relative">
              <button className="flex items-center gap-[8px] h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)]" onClick={() => {
                // 當打開選擇器時，從 localStorage 或 availableColumns 獲取最新數據
                let columnsToUse = availableColumns;
                
                // 如果 availableColumns 是空的，從 localStorage 讀取
                if (columnsToUse.length === 0) {
                  const storageKey = `vendorReview_${currentUserEmail}_${activeTab}_columns`;
                  try {
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                      columnsToUse = JSON.parse(saved);
                    } else {
                      // 如果 localStorage 也沒有，使用默認配置
                      const defaultColumns = activeTab === 'success' 
                        ? [
                            { key: 'name', label: '廠商姓名', width: 150, minWidth: 100 },
                            { key: 'status', label: '申請狀態', width: 150, minWidth: 100 },
                            { key: 'company', label: '公司完整名稱', width: 250, minWidth: 100 },
                            { key: 'epCode', label: 'EP廠商代號', width: 150, minWidth: 100 },
                            { key: 'axCode', label: 'AX代號', width: 150, minWidth: 100 },
                            { key: 'role', label: '申請角色', width: 150, minWidth: 100 },
                            { key: 'email', label: 'email', width: 220, minWidth: 100 },
                            { key: 'time', label: '申請時間', width: 180, minWidth: 100 },
                          ]
                        : [
                            { key: 'name', label: '廠商姓名', width: 150, minWidth: 100 },
                            { key: 'status', label: '申請狀態', width: 150, minWidth: 100 },
                            { key: 'company', label: '公司完整名稱', width: 250, minWidth: 100 },
                            { key: 'role', label: '申請角色', width: 150, minWidth: 100 },
                            { key: 'email', label: 'email', width: 220, minWidth: 100 },
                            { key: 'failReason', label: '失敗原因', width: 300, minWidth: 100 },
                            { key: 'time', label: '申請時間', width: 180, minWidth: 100 },
                          ];
                      columnsToUse = defaultColumns;
                    }
                  } catch (error) {
                    console.error('Failed to load columns:', error);
                  }
                }
                
                setTempColumns(JSON.parse(JSON.stringify(columnsToUse)));
                setShowColumnSelector(!showColumnSelector);
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2.25 4.5H15.75M6 8.25H12M8.25 12H9.75" stroke="#1C252E" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[#1c252e] text-[13px]">
                  Columns
                </p>
              </button>
              
              <button className="flex items-center gap-[8px] h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)]" onClick={() => {
                setShowFilterDialog(!showFilterDialog);
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M16.5 6.75H1.5M12 9.75V12.75M6 9.75V12.75M2.25 3.75H15.75V14.25C15.75 14.6478 15.592 15.0294 15.3107 15.3107C15.0294 15.592 14.6478 15 14.25 15H3.75C3.35218 15 2.97064 14.842 2.68934 14.5607C2.40804 14.2794 2.25 13.8978 2.25 13.5V3.75Z" stroke="#1C252E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[#1c252e] text-[13px]">
                  Filters
                </p>
              </button>
              
              <button className="flex items-center gap-[8px] h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15.75 11.25V13.5C15.75 13.8978 15.592 14.2794 15.3107 14.5607C15.0294 14.842 14.6478 15 14.25 15H3.75C3.35218 15 2.97064 14.842 2.68934 14.5607C2.40804 14.2794 2.25 13.8978 2.25 13.5V11.25M12.75 7.5L9 3.75L5.25 7.5M9 4.5V11.25" stroke="#1C252E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[#1c252e] text-[13px]">
                  Export
                </p>
              </button>
              
              {/* 欄位選擇器彈窗 - 定位在按鈕下方 */}
              {showColumnSelector && (
                <div className="absolute right-0 top-[38px] z-50">
                  <ColumnSelector 
                    columns={tempColumns}
                    onToggleColumn={handleToggleColumn}
                    onToggleAll={(selectAll) => {
                      const updatedColumns = tempColumns.map(col => ({ ...col, visible: selectAll }));
                      setTempColumns(updatedColumns);
                    }}
                    onClose={() => setShowColumnSelector(false)}
                    onApply={handleApplyColumns}
                  />
                </div>
              )}
              
              {/* Filter 彈窗 - 定位在按鈕下方 */}
              {showFilterDialog && (
                <div className="absolute right-0 top-[38px] z-50">
                  <FilterDialog 
                    filters={filters}
                    availableColumns={availableColumns}
                    onFiltersChange={setFilters}
                    onClose={() => setShowFilterDialog(false)}
                    onApply={handleApplyFilters}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 表格区域 */}
          <VendorReviewTable
            activeTab={activeTab}
            onVendorClick={handleVendorClick}
            vendorNameFilter={vendorNameFilter}
            companyNameFilter={companyNameFilter}
            selectedRole={selectedRole}
            userEmail={currentUserEmail}
            onColumnsChange={handleColumnsChange}
            columnsVersion={columnsVersion}
            appliedFilters={appliedFilters}
          />

          {/* Overlay遮罩和彈窗 */}
          {showOverlay && (
            <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} onClick={() => setShowOverlay(false)}>
              <div 
                className="w-full max-w-[792px] h-[568px] mx-4" 
                onClick={(e) => e.stopPropagation()}
              >
                <AccountApplicationDetail 
                  onClose={() => setShowOverlay(false)} 
                  vendorData={selectedVendor}
                  isSuccessTab={activeTab === 'success'}
                  onApprove={handleApprove}
                />
              </div>
            </div>
          )}
        </div>
    </ResponsivePageLayout>
  );
}