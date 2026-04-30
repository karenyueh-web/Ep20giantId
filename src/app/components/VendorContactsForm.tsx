import svgPaths from "@/imports/svg-c0egreeez0";
import { useState } from 'react';
import { PaginationControls } from './PaginationControls';
import { ContactDetailOverlay } from './ContactDetailOverlay';
import { DropdownSelect } from './DropdownSelect';
import { UploadContactOverlay } from './UploadContactOverlay';
import { ToggleSwitch } from './ToggleSwitch';
import { AdvancedContactsTable, getContactsColumns } from './AdvancedContactsTable';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { TableToolbar } from './TableToolbar';

// 聯絡人資料型別 - 完全保留原有的 8 個欄位
interface Contact {
  name: string;
  role: string;
  priority: string;
  purchaseOrg: string;
  emailEnabled: boolean;
  email: string;
  phone: string;
  remark: string;
}

// Mock 資料 - 保留原有的 2 筆資料
const mockContactsData: Contact[] = [
  {
    name: '張淑玲',
    role: '業務',
    priority: '收件人',
    purchaseOrg: '1101、1013、1010',
    emailEnabled: true,
    email: 'nine@jogon-pak.com',
    phone: '0355213698',
    remark: '可轉代OOO董事長'
  },
  {
    name: '吳彥祖',
    role: '管理階層',
    priority: 'CC',
    purchaseOrg: '1101、4111、4121',
    emailEnabled: true,
    email: 'nine@jogon-pak.com',
    phone: '0355213698',
    remark: '-'
  }
];

export function VendorContactsForm() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [selectedRole, setSelectedRole] = useState('全部');
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  
  // 進階表格功能狀態
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<any[]>([]);
  const [tempColumns, setTempColumns] = useState<any[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  
  // 聯絡人資料，包含啟用寄信狀態（從 localStorage 載入或使用預設）
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('vendor_contacts_list');
      if (saved) {
        const parsed = JSON.parse(saved) as Contact[];
        if (parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore */ }
    return mockContactsData;
  });

  // 獲取當前登入用戶的email
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 'default';

  // 處理聯絡人點擊
  const handleContactClick = (name: string) => {
    setSelectedContact(name);
  };

  // 處理 toggle 變更並持久化
  const handleToggleChange = (name: string, enabled: boolean) => {
    setContacts(prev => {
      const updated = prev.map(contact => 
        contact.name === name ? { ...contact, emailEnabled: enabled } : contact
      );
      try {
        localStorage.setItem('vendor_contacts_list', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      return updated;
    });
  };

  // 篩選資料
  const filteredContacts = contacts.filter(contact => {
    if (searchName && !contact.name.includes(searchName)) return false;
    if (selectedRole !== '全部' && !contact.role.includes(selectedRole.replace(/\s*\(.*?\)\s*/g, ''))) return false;
    return true;
  });

  const totalItems = filteredContacts.length;
  const displayedContacts = filteredContacts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
    const storageKey = `contacts_${currentUserEmail}_contacts_columns`;
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
      const storageKey = `contacts_${currentUserEmail}_contacts_columns`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          columnsToUse = JSON.parse(saved);
        } else {
          columnsToUse = getContactsColumns();
        }
      } catch (error) {
        console.error('Failed to load columns:', error);
        columnsToUse = getContactsColumns();
      }
    }
    
    setTempColumns(JSON.parse(JSON.stringify(columnsToUse)));
    setShowColumnSelector(!showColumnSelector);
  };

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
                      placeholder=""
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] bg-transparent border-none outline-none"
                    />
                    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
                      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
                      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">業務姓名</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 業務角色下拉選單 */}
            <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
              <DropdownSelect
                label="業務角色"
                value={selectedRole}
                onChange={setSelectedRole}
                options={[
                  { value: '全部', label: '全部角色', color: 'text-[#005eb8]' },
                  { value: 'Q (品保)', label: 'Q (品保)' },
                  { value: 'S (業務)', label: 'S (業務)' },
                  { value: 'B (採購)', label: 'B (採購)' },
                  { value: 'IB (整合採購)', label: 'IB (整合採購)' },
                  { value: 'MP (物料計畫)', label: 'MP (物料計畫)' },
                  { value: 'M (管理階層)', label: 'M (管理階層)' }
                ]}
                placeholder="請選擇角色"
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
            availableColumns={availableColumns.length > 0 ? availableColumns : getContactsColumns()}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />
        }
        actionButton={
          <div 
            className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-[#2c3540] transition-colors"
            onClick={() => setShowUploadOverlay(true)}
          >
            <div className="flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
              <p className="leading-[24px]">新增</p>
            </div>
          </div>
        }
      />
      
      {/* 表格區域 - 使用進階表格 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdvancedContactsTable
          data={displayedContacts}
          onContactClick={handleContactClick}
          onToggleChange={handleToggleChange}
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

      {/* Overlay */}
      {selectedContact && (
        <ContactDetailOverlay
          name={selectedContact}
          emailEnabled={contacts.find(contact => contact.name === selectedContact)?.emailEnabled ?? false}
          onClose={() => setSelectedContact(null)}
        />
      )}

      {/* Upload Contact Overlay */}
      {showUploadOverlay && (
        <UploadContactOverlay
          onClose={() => setShowUploadOverlay(false)}
        />
      )}
    </div>
  );
}