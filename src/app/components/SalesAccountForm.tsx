import svgPaths from "@/imports/svg-c0egreeez0";
import { useState, useEffect } from 'react';
import { SalesAccountDetailOverlay } from './SalesAccountDetailOverlay';
import { PaginationControls } from './PaginationControls';
import { ResizableTable, ColumnConfig } from './ResizableTable';
import { DropdownSelect } from './DropdownSelect';
import { AdvancedSalesTable, getSalesAccountColumns } from './AdvancedSalesTable';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { TableToolbar } from './TableToolbar';

// 業務帳號資料型別
interface SalesAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  purchaseOrg: string;
  purchaseGroup: string;
  status: 'active' | 'inactive';
}

interface SalesAccountFormProps {
  selectedAccount?: any;
  onCloseOverlay?: () => void;
  onAccountClick?: (account: SalesAccount) => void;
  pendingVendorApproval?: {
    name: string;
    email: string;
    company: string;
    epCode: string;
  } | null;
  onClearPendingApproval?: () => void;
}

// Mock資料 - 9筆資料（6個啟用，3個停用）
const initialMockSalesAccounts: SalesAccount[] = [
  {
    id: '1',
    email: 'nine@jogon-pak.com',
    name: '張淑玲',
    role: '業務',
    purchaseOrg: '台灣廠生產採購、GEM prod.pur、GHM prod.pur',
    purchaseGroup: '011、410、420',
    status: 'active'
  },
  {
    id: '2',
    email: 'nine@jogon-pak.com',
    name: 'OOO',
    role: '業務',
    purchaseOrg: '台灣廠生產採購、GEM prod.pur、GHM prod.pur',
    purchaseGroup: '011、410、420',
    status: 'active'
  },
  {
    id: '3',
    email: 'nine@jogon-pak.com',
    name: 'OOO',
    role: '業務',
    purchaseOrg: '台灣廠生產採購、GEM prod.pur、GHM prod.pur',
    purchaseGroup: '011、410、420',
    status: 'active'
  },
  {
    id: '4',
    email: 'nine@jogon-pak.com',
    name: 'OOO',
    role: '業務',
    purchaseOrg: '台灣廠生產採購、總部GEM委購、GBD商品採購',
    purchaseGroup: '012、013',
    status: 'inactive'
  },
  {
    id: '5',
    email: 'quality@jogon-pak.com',
    name: 'OOO',
    role: '品保',
    purchaseOrg: '台灣廠生產採購',
    purchaseGroup: '011',
    status: 'active'
  },
  {
    id: '6',
    email: 'dev@jogon-pak.com',
    name: '蔡英文',
    role: '開發',
    purchaseOrg: '台灣廠生產採購',
    purchaseGroup: '012',
    status: 'active'
  },
  {
    id: '7',
    email: 'sales2@jogon-pak.com',
    name: 'OOO',
    role: '業務',
    purchaseOrg: '台灣廠生產採購、GEM prod.pur',
    purchaseGroup: '011、410',
    status: 'active'
  },
  {
    id: '8',
    email: 'sales3@jogon-pak.com',
    name: 'OOO',
    role: '業務',
    purchaseOrg: '台灣廠生產採購',
    purchaseGroup: '011',
    status: 'inactive'
  },
  {
    id: '9',
    email: 'quality2@jogon-pak.com',
    name: 'OOO',
    role: '品保',
    purchaseOrg: '台灣廠生產採購、總部GEM委購',
    purchaseGroup: '012、013',
    status: 'inactive'
  }
];

// 導出函數：計算啟用狀態的業務帳號數量
export function getActiveSalesAccountCount(): number {
  // 從 localStorage 讀取最新的帳號列表
  const saved = localStorage.getItem('sales_accounts_list');
  const accounts = saved ? JSON.parse(saved) : initialMockSalesAccounts;
  return accounts.filter((account: SalesAccount) => account.status === 'active').length;
}

export function SalesAccountForm({ selectedAccount, onCloseOverlay, onAccountClick, pendingVendorApproval, onClearPendingApproval }: SalesAccountFormProps) {
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeSearchName, setActiveSearchName] = useState('');
  
  // 進階表格功能狀態
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<any[]>([]);
  const [tempColumns, setTempColumns] = useState<any[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  
  // 使用 state 管理帳號列表，從 localStorage 初始化
  const [salesAccounts, setSalesAccounts] = useState<SalesAccount[]>(() => {
    const saved = localStorage.getItem('sales_accounts_list');
    return saved ? JSON.parse(saved) : initialMockSalesAccounts;
  });

  // 獲取當前登入用戶的email
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 'default';

  // 當帳號列表變化時，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('sales_accounts_list', JSON.stringify(salesAccounts));
  }, [salesAccounts]);

  // 監聽業務帳號更新事件
  useEffect(() => {
    const handleAccountsUpdate = () => {
      // 從 localStorage 重新讀取帳號列表
      const saved = localStorage.getItem('sales_accounts_list');
      if (saved) {
        setSalesAccounts(JSON.parse(saved));
      }
    };

    // 添加事件監聽器
    window.addEventListener('salesAccountsUpdated', handleAccountsUpdate);

    // 清理函數
    return () => {
      window.removeEventListener('salesAccountsUpdated', handleAccountsUpdate);
    };
  }, []);

  // 處理待審核通過的廠商
  useEffect(() => {
    if (pendingVendorApproval && onAccountClick) {
      console.log('收到待審核通過的廠商:', pendingVendorApproval);
      
      // 生成新的業務帳號ID
      const newAccountId = `${Date.now()}`;
      
      // 創建新的業務帳號
      const newAccount: SalesAccount = {
        id: newAccountId,
        email: pendingVendorApproval.email,
        name: pendingVendorApproval.name,
        role: '業務',
        purchaseOrg: '', // 待設定
        purchaseGroup: '', // 待設定
        status: 'active'
      };
      
      // 添加到列表
      setSalesAccounts(prev => [newAccount, ...prev]);
      
      // 顯示提示訊息
      alert('廠商審核通過！\n請繼續前往設定此業務人員的採購組織。');
      
      // 自動打開帳號設定 overlay
      setTimeout(() => {
        onAccountClick(newAccount);
        // 清除待審核狀態
        if (onClearPendingApproval) {
          onClearPendingApproval();
        }
      }, 500);
    }
  }, [pendingVendorApproval, onAccountClick, onClearPendingApproval]);

  // 根据搜索条件过滤数据
  const filteredAccounts = salesAccounts.filter(account => {
    // 按状态筛选
    if (filterStatus === '啟用' && account.status !== 'active') return false;
    if (filterStatus === '停用' && account.status !== 'inactive') return false;
    
    // 按业务姓名筛选（支持关键字查询）
    if (activeSearchName && !account.name.includes(activeSearchName)) return false;
    
    return true;
  });

  const totalItems = filteredAccounts.length;
  const displayedAccounts = filteredAccounts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // 处理 Enter 键搜索
  const handleSearch = () => {
    setActiveSearchName(searchName);
    setCurrentPage(1); // 重置到第一页
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 当状态改变时，重置到第一页
  const handleStatusChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setCurrentPage(1);
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
    const storageKey = `salesAccount_${currentUserEmail}_sales_columns`;
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
      const storageKey = `salesAccount_${currentUserEmail}_sales_columns`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          columnsToUse = JSON.parse(saved);
        } else {
          columnsToUse = getSalesAccountColumns();
        }
      } catch (error) {
        console.error('Failed to load columns:', error);
        columnsToUse = getSalesAccountColumns();
      }
    }
    
    setTempColumns(JSON.parse(JSON.stringify(columnsToUse)));
    setShowColumnSelector(!showColumnSelector);
  };

  // 定义表格列配置
  const columns: ColumnConfig[] = [
    {
      key: 'email',
      label: '業務帳號',
      defaultWidth: 180,
      minWidth: 120,
      align: 'center',
      render: (value, row) => (
        <button 
          className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => onAccountClick && onAccountClick(row as SalesAccount)}
        >
          {value}
        </button>
      )
    },
    {
      key: 'name',
      label: '業務姓名',
      defaultWidth: 150,
      minWidth: 80,
      render: (value) => (
        <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">{value}</p>
      )
    },
    {
      key: 'role',
      label: '業務角色',
      defaultWidth: 100,
      minWidth: 80
    },
    {
      key: 'purchaseOrg',
      label: '採購組織',
      defaultWidth: 300,
      minWidth: 150
    },
    {
      key: 'purchaseGroup',
      label: '採購群組',
      defaultWidth: 140,
      minWidth: 100,
      align: 'center'
    },
    {
      key: 'status',
      label: '帳號狀態',
      defaultWidth: 90,
      minWidth: 70,
      align: 'center',
      render: (value: 'active' | 'inactive') => (
        <div className={`content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0 ${
          value === 'active' ? 'bg-[rgba(34,197,94,0.16)]' : 'bg-[rgba(255,86,48,0.16)]'
        }`}>
          <p className={`font-['Public_Sans:Bold','Noto_Sans_SC:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center ${
            value === 'active' ? 'text-[#118d57]' : 'text-[#b71d18]'
          }`}>{value === 'active' ? '啟用' : '停用'}</p>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 搜索和篩選區 */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
            {/* 業務姓名搜索框 */}
            <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
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
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder=""
                      className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] bg-transparent border-none outline-none"
                      onKeyPress={handleKeyPress}
                    />
                    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
                      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
                      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">業務姓名</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 帳號狀態下拉選單 */}
            <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
              <DropdownSelect
                label="帳號狀態"
                value={filterStatus}
                onChange={handleStatusChange}
                options={[
                  { value: '啟用', label: '啟用' },
                  { value: '停用', label: '停用' },
                  { value: '全部', label: '全部' }
                ]}
                placeholder="請選擇狀態"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 結果數量和按鈕工具列 */}
      <TableToolbar
        resultsCount={totalItems}
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
            availableColumns={availableColumns.length > 0 ? availableColumns : getSalesAccountColumns()}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />
        }
        actionButton={
          <div className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-[#2c3540] transition-colors">
            <div className="flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
              <p className="leading-[24px]">更新業務帳號</p>
            </div>
          </div>
        }
      />
      
      {/* 表格區域 - 使用進階表格 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdvancedSalesTable
          data={displayedAccounts}
          onAccountClick={onAccountClick}
          onStatusChange={(accountId, newStatus) => {
            setSalesAccounts(prev => 
              prev.map(acc => acc.id === accountId ? { ...acc, status: newStatus } : acc)
            );
          }}
          userEmail={currentUserEmail}
          appliedFilters={appliedFilters}
          columnsVersion={columnsVersion}
        />

        {/* 分頁控制 */}
        <div className="shrink-0 flex items-center justify-center py-[16px] border-t border-[rgba(145,158,171,0.08)]">
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setRowsPerPage}
            itemsPerPageOptions={[5, 10, 25]}
          />
        </div>
      </div>
    </div>
  );
}