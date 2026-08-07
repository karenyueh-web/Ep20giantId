import { PaginationControls } from './PaginationControls';
import { DropdownSelect } from './DropdownSelect';
import { EmployeeAccountSettingPage } from './EmployeeAccountSettingPage';
import type { PageType } from './MainLayout';
import { ResponsivePageLayout } from './ResponsivePageLayout';
import svgPaths from '@/imports/svg-c0egreeez0';
import { useState, useEffect } from 'react';
import { consumePendingNavUser } from '@/app/config/pendingNavigation';
import { AdvancedGiantTable, getGiantAccountColumns } from './AdvancedGiantTable';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { TableToolbar } from './TableToolbar';
import { getGiantRoles } from '@/app/config/roleStore';

interface GiantAccountManagementPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
}

// 巨大帳號資料型別


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

  // 讀取 pendingNavigation，自動開啟對應員工明細
  useEffect(() => {
    const pending = consumePendingNavUser();
    if (pending && pending.type === 'giant') {
      const target = mockGiantAccounts.find(
        a => a.account === pending.account
          || a.name === pending.userName
          || a.name.startsWith(pending.userName)
          || a.name.includes(pending.userName)
      );
      if (target) handleAccountClick(target);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const roleOptions = [
    { value: '', label: 'All' },
    ...getGiantRoles().map(r => ({ value: r.label, label: r.label }))
  ];
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