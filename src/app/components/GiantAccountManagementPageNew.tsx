import { PaginationControls } from './PaginationControls';
import { DropdownSelect } from './DropdownSelect';
import { EmployeeAccountSettingPage } from './EmployeeAccountSettingPage';
import type { PageType } from './MainLayout';
import { ResponsivePageLayout } from './ResponsivePageLayout';
import svgPaths from '@/imports/svg-c0egreeez0';
import { useState } from 'react';
import { AdvancedGiantTable, getGiantAccountColumns } from './AdvancedGiantTable';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { TableToolbar } from './TableToolbar';

interface GiantAccountManagementPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
}

// 巨大帳號資料型別
interface GiantAccount {
  id: string;
  account: string;
  name: string;
  role: string;
  sapAccount: string;
  purchaseOrg: string;
  purchaseGroup: string;
  status: 'active' | 'inactive';
  email: string;
}

// Mock 資料
const mockGiantAccounts: GiantAccount[] = [
  {
    id: '1',
    account: 'G94854',
    name: '李宜璇-Evelyn Lee',
    role: '採購人員',
    sapAccount: 'G94854',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g94854@giant.com'
  },
  {
    id: '2',
    account: 'G00106917',
    name: '李宜瑾-Evelyn Lee',
    role: '品保人員',
    sapAccount: 'G00106917',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P02',
    status: 'active',
    email: 'g00106917@giant.com'
  },
  {
    id: '3',
    account: 'G00108123',
    name: '王小明-Mike Wang',
    role: '採購主管',
    sapAccount: 'G00108123',
    purchaseOrg: '昆山巨大(CN20)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g00108123@giant.com'
  },
  {
    id: '4',
    account: 'G00109456',
    name: '陳美玲-Meilin Chen',
    role: '品保主管',
    sapAccount: 'G00109456',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P03',
    status: 'inactive',
    email: 'g00109456@giant.com'
  },
  {
    id: '5',
    account: 'G00107789',
    name: '林志偉-David Lin',
    role: '系統管理員',
    sapAccount: 'G00107789',
    purchaseOrg: '越南巨大(VN30)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g00107789@giant.com'
  },
  {
    id: '6',
    account: 'G00110234',
    name: '黃雅琪-Yaki Huang',
    role: '採購人員',
    sapAccount: 'G00110234',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P02',
    status: 'active',
    email: 'g00110234@giant.com'
  },
  {
    id: '7',
    account: 'G00111567',
    name: '劉建宏-Jason Liu',
    role: '品保人員',
    sapAccount: 'G00111567',
    purchaseOrg: '昆山巨大(CN20)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g00111567@giant.com'
  },
  {
    id: '8',
    account: 'G00112890',
    name: '蔡宜芳-Fanny Tsai',
    role: '採購人員',
    sapAccount: 'G00112890',
    purchaseOrg: '匈牙利巨大(HU40)',
    purchaseGroup: 'P02',
    status: 'inactive',
    email: 'g00112890@giant.com'
  },
  {
    id: '9',
    account: 'G00113456',
    name: '張嘉玲-Karen Chang',
    role: '採購人員',
    sapAccount: 'G00113456',
    purchaseOrg: '台灣巨大(TW10)',
    purchaseGroup: 'P01',
    status: 'active',
    email: 'g00113456@giant.com'
  },
];

export function GiantAccountManagementPageNew({ 
  currentPage, 
  onPageChange, 
  onLogout,
  userRole = 'giant'
}: GiantAccountManagementPageProps) {
  const [nameSearch, setNameSearch] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Employee setting state
  const [showEmployeeSetting, setShowEmployeeSetting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<GiantAccount | null>(null);
  
  // Column selector & filter
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [tempColumns, setTempColumns] = useState<any[]>(getGiantAccountColumns());
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);

  // 篩選資料
  const filteredAccounts = mockGiantAccounts.filter(account => {
    if (nameSearch && !account.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    if (accountSearch && !account.account.toLowerCase().includes(accountSearch.toLowerCase())) return false;
    if (selectedRole && account.role !== selectedRole) return false;
    if (selectedOrg && account.purchaseOrg !== selectedOrg) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage);
  const startIdx = (currentPageNum - 1) * rowsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIdx, startIdx + rowsPerPage);

  const handleAccountClick = (account: GiantAccount) => {
    setSelectedEmployee(account);
    setShowEmployeeSetting(true);
  };

  const handleBack = () => {
    setShowEmployeeSetting(false);
    setSelectedEmployee(null);
  };

  // Column selector handlers
  const handleToggleColumn = (key: string) => {
    setTempColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: col.visible === false ? true : false } : col
    ));
  };

  const handleToggleAll = (selectAll: boolean) => {
    setTempColumns(prev => prev.map(col => ({ ...col, visible: selectAll })));
  };
  
  const handleApplyColumns = () => {
    setColumnsVersion(prev => prev + 1);
    const storageKey = 'giantAccountColumns';
    localStorage.setItem(storageKey, JSON.stringify(tempColumns));
    setShowColumnSelector(false);
  };

  const handleColumnsClick = () => {
    let columnsToUse = getGiantAccountColumns();
    const storageKey = 'giantAccountColumns';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        columnsToUse = JSON.parse(saved);
      } catch {
        columnsToUse = getGiantAccountColumns();
      }
    }
    
    setTempColumns(JSON.parse(JSON.stringify(columnsToUse)));
    setShowColumnSelector(!showColumnSelector);
  };

  // 如果顯示員工帳號設定頁面
  if (showEmployeeSetting && selectedEmployee) {
    return (
      <EmployeeAccountSettingPage 
        currentPage={currentPage}
        onPageChange={onPageChange}
        onLogout={onLogout}
        employeeName={selectedEmployee.name}
        employeeAccount={selectedEmployee.account}
        onBack={handleBack}
        userRole={userRole}
      />
    );
  }

  // Role / Org options
  const roleOptions = [...new Set(mockGiantAccounts.map(a => a.role))].map(r => ({ value: r, label: r }));
  const orgOptions = [...new Set(mockGiantAccounts.map(a => a.purchaseOrg))].map(o => ({ value: o, label: o }));

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="巨大帳號管理"
      breadcrumb="帳號管理 • 巨大帳號管理"
    >
      <div className="bg-white h-full rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] flex flex-col overflow-hidden">
          
        {/* 搜索欄位區 */}
        <div className="relative shrink-0 w-full">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex flex-wrap gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
              {/* 員工姓名 */}
              <div className="content-stretch flex flex-col items-start min-w-[180px] flex-1 relative">
                <div className="h-[54px] relative rounded-[8px] shrink-0 w-full">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex items-center px-[14px] relative size-full">
                      <div className="content-stretch flex items-center pr-[8px] relative shrink-0">
                        <div className="relative shrink-0 size-[24px]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                            <path d={svgPaths.p14834500} fill="#919EAB" />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={nameSearch}
                        onChange={(e) => setNameSearch(e.target.value)}
                        className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] bg-transparent border-none outline-none"
                        placeholder=" "
                      />
                      <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
                        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">員工姓名</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 員工帳號 */}
              <div className="content-stretch flex flex-col items-start min-w-[180px] flex-1 relative">
                <div className="h-[54px] relative rounded-[8px] shrink-0 w-full">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex items-center px-[14px] relative size-full">
                      <div className="content-stretch flex items-center pr-[8px] relative shrink-0">
                        <div className="relative shrink-0 size-[24px]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                            <path d={svgPaths.p14834500} fill="#919EAB" />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={accountSearch}
                        onChange={(e) => setAccountSearch(e.target.value)}
                        className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] bg-transparent border-none outline-none"
                        placeholder=" "
                      />
                      <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
                        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">員工帳號</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 角色 */}
              <div className="min-w-[150px] flex-1">
                <DropdownSelect
                  label="角色"
                  value={selectedRole}
                  onChange={setSelectedRole}
                  options={roleOptions}
                />
              </div>
              {/* 採購組織 */}
              <div className="min-w-[180px] flex-1">
                <DropdownSelect
                  label="採購組織"
                  value={selectedOrg}
                  onChange={setSelectedOrg}
                  options={orgOptions}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 工具列 */}
        <TableToolbar
          resultsCount={filteredAccounts.length}
          showColumnSelector={showColumnSelector}
          showFilterDialog={showFilterDialog}
          onColumnsClick={handleColumnsClick}
          onFiltersClick={() => setShowFilterDialog(!showFilterDialog)}
        />

        {/* Column Selector */}
        {showColumnSelector && (
          <ColumnSelector
            columns={tempColumns}
            onToggleColumn={handleToggleColumn}
            onToggleAll={handleToggleAll}
            onClose={() => setShowColumnSelector(false)}
            onApply={handleApplyColumns}
          />
        )}

        {/* Filter Dialog */}
        {showFilterDialog && (
          <FilterDialog
            filters={filters}
            availableColumns={getGiantAccountColumns().map(c => ({ key: c.key, label: c.label }))}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={() => {
              setAppliedFilters([...filters]);
              setShowFilterDialog(false);
            }}
          />
        )}

        {/* 表格 */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <AdvancedGiantTable
            data={paginatedAccounts}
            onAccountClick={handleAccountClick}
            appliedFilters={appliedFilters}
            columnsVersion={columnsVersion}
          />
        </div>

        {/* 分頁控制 */}
        <PaginationControls
          currentPage={currentPageNum}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalItems={filteredAccounts.length}
          onPageChange={setCurrentPageNum}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setCurrentPageNum(1); }}
        />
      </div>
    </ResponsivePageLayout>
  );
}