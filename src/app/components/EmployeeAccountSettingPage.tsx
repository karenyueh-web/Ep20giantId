import { AddVendorMailOverlay } from './AddVendorMailOverlay';
import svgPaths from '@/imports/svg-lwqm0qs6yv';
import { useState } from 'react';
import type { PageType } from './MainLayout';
import Select from 'react-select';
import { Trash2, Plus } from 'lucide-react';
import { MailSettingsTabContent } from './MailSettingsTabContent';
import { ResponsivePageLayout } from './ResponsivePageLayout';

interface EmployeeAccountSettingPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  employeeName?: string;
  employeeAccount?: string;
  onBack: () => void;
  userRole?: string;
}

// 採購群組行的類型
interface PurchaseGroupRow {
  id: string;
  companyCode: string;
  orgCode: string;
  groupCode: string;
}

// 組織與群組對照表（與 SalesAccountDetailOverlay 同步）
const ORG_GROUP_MAPPING: Record<string, { companyCode: string; companyName: string; groups: string[] }> = {
  '1101(台灣廠生產採購)': { companyCode: '1100', companyName: '巨大機械', groups: ['002', '011', '012', '013', '021', '022', '112', 'T00', 'T10', 'T20', 'T30', 'T40', 'T50', 'T60', 'T70', 'T80'] },
  '1010(總部GEM委購)': { companyCode: '1100', companyName: '巨大機械', groups: ['002', '011', '012', '013', '021', '022', '112', 'T00', 'T10', 'T20', 'T30', 'T40', 'T50', 'T60', 'T70', 'T80'] },
  '1011(GBD商品採購)': { companyCode: '1100', companyName: '巨大機械', groups: ['002', '011', '012', '013', '021', '022', '112', 'T00', 'T10', 'T20', 'T30', 'T40', 'T50', 'T60', 'T70', 'T80'] },
  '1013(GCX委購)': { companyCode: '1100', companyName: '巨大機械', groups: ['002', '011', '012', '013', '021', '022', '112', 'T00', 'T10', 'T20', 'T30', 'T40', 'T50', 'T60', 'T70', 'T80'] },
  '1014(GI委購)': { companyCode: '1100', companyName: '巨大機械', groups: ['002', '011', '012', '013', '021', '022', '112', 'T00', 'T10', 'T20', 'T30', 'T40', 'T50', 'T60', 'T70', 'T80'] },
  '1017(GVM委購)': { companyCode: '1100', companyName: '巨大機械', groups: ['002', '011', '012', '013', '021', '022', '112', 'T00', 'T10', 'T20', 'T30', 'T40', 'T50', 'T60', 'T70', 'T80'] },
  '4111(GEM prod.pur)': { companyCode: '4110', companyName: 'GEM', groups: ['410', '411', '412', '413', '414', '415', '416', '417', '420', '421', '422', '423', '424', '425', '426', '427', '42A'] },
  '4121(GHM prod.pur)': { companyCode: '4120', companyName: 'GHM', groups: ['410', '411', '412', '413', '414', '415', '416', '417', '420', '421', '422', '423', '424', '425', '426', '427', '42A'] },
  '2010(AIP採購)': { companyCode: '1400', companyName: 'AIP愛普智', groups: ['201', '202', '203', '204'] },
  '3000(GVM prod.pur)': { companyCode: '3110', companyName: 'Giant Vietnam', groups: ['300', '301'] },
};

const ALL_ORG_LABELS = Object.keys(ORG_GROUP_MAPPING);

// 返回按鈕圖標 - 藍色雙箭頭
function BackIcon() {
  return (
    <div className="relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity"
      data-name="BackIcon"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29 29">
        <path clipRule="evenodd" d={svgPaths.p30755780} fill="#1D7BF5" fillRule="evenodd" />
      </svg>
    </div>
  );
}

// React Select 自定義樣式（與 SalesAccountDetailOverlay 同步）
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '34px',
    height: '34px',
    borderRadius: '8px',
    borderColor: state.isFocused ? '#2196F3' : 'rgba(145, 158, 171, 0.32)',
    borderWidth: state.isFocused ? '2px' : '1px',
    boxShadow: state.isFocused ? '0 2px 8px rgba(33, 150, 243, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: state.isFocused ? '#2196F3' : 'rgba(145, 158, 171, 0.6)',
    },
    padding: '0',
  }),
  valueContainer: (base: any) => ({
    ...base,
    height: '34px',
    padding: '0 12px',
  }),
  input: (base: any) => ({
    ...base,
    margin: '0',
    padding: '0',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    padding: '0 8px',
    color: '#637381',
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    zIndex: 20,
  }),
  menuList: (base: any) => ({
    ...base,
    padding: '4px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2196F3' : state.isFocused ? 'rgba(33, 150, 243, 0.1)' : 'white',
    color: state.isSelected ? 'white' : '#1c252e',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Public_Sans:Regular', sans-serif",
    '&:active': {
      backgroundColor: '#2196F3',
    },
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#919eab',
    fontSize: '14px',
    fontFamily: "'Public_Sans:Regular', sans-serif",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#1c252e',
    fontSize: '14px',
    fontFamily: "'Public_Sans:Regular', sans-serif",
  }),
};

export function EmployeeAccountSettingPage({
  currentPage,
  onPageChange,
  onLogout,
  employeeName = '李宜瑾-Evelyn Lee',
  employeeAccount = 'G00106917',
  onBack,
  userRole = 'giant'
}: EmployeeAccountSettingPageProps) {
  const [activeTab, setActiveTab] = useState<'org' | 'mail'>('org');
  const [showAddVendorOverlay, setShowAddVendorOverlay] = useState(false);

  // 採購組織選取狀態
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);

  // 採購群組行
  const [purchaseGroupRows, setPurchaseGroupRows] = useState<PurchaseGroupRow[]>([
    { id: '1', companyCode: '', orgCode: '', groupCode: '' }
  ]);

  // 切換組織選取
  const toggleOrganization = (org: string) => {
    setSelectedOrganizations(prev =>
      prev.includes(org)
        ? prev.filter(o => o !== org)
        : [...prev, org]
    );
  };

  // 獲取可選的採購組織（只有被選中的組織）
  const getAvailableOrgs = () => {
    return selectedOrganizations;
  };

  // 獲取可選的採購群組
  const getAvailableGroups = (orgCode: string) => {
    if (!orgCode || !ORG_GROUP_MAPPING[orgCode]) return [];
    return ORG_GROUP_MAPPING[orgCode].groups || [];
  };

  // 獲取公司代碼
  const getCompanyCode = (orgCode: string) => {
    if (!orgCode || !ORG_GROUP_MAPPING[orgCode]) return '';
    return ORG_GROUP_MAPPING[orgCode].companyCode;
  };

  // 新增採購群組行 - 複製當前行的採購組織
  const addPurchaseGroupRow = (sourceRow?: PurchaseGroupRow) => {
    const newRow: PurchaseGroupRow = {
      id: Date.now().toString(),
      companyCode: sourceRow?.companyCode || '',
      orgCode: sourceRow?.orgCode || '',
      groupCode: '',
    };
    setPurchaseGroupRows([...purchaseGroupRows, newRow]);
  };

  // 刪除採購群組行
  const deletePurchaseGroupRow = (id: string) => {
    setPurchaseGroupRows(purchaseGroupRows.filter(row => row.id !== id));
  };

  // 更新採購組織
  const updateOrgCode = (id: string, orgCode: string) => {
    const newCompanyCode = getCompanyCode(orgCode);
    setPurchaseGroupRows(purchaseGroupRows.map(row =>
      row.id === id ? { ...row, companyCode: newCompanyCode, orgCode, groupCode: '' } : row
    ));
  };

  // 更新採購群組
  const updateGroupCode = (id: string, groupCode: string) => {
    setPurchaseGroupRows(purchaseGroupRows.map(row =>
      row.id === id ? { ...row, groupCode } : row
    ));
  };

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="巨大帳號管理"
      breadcrumb="帳號管理 • 巨大帳號管理 • 巨大帳號設定"
    >
      <div className="bg-white h-full rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] flex flex-col overflow-hidden">

        {/* 頂部標籤和返回按鈕 */}
        <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
          <div onClick={onBack}><BackIcon /></div>
          <div
            className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
            onClick={() => setActiveTab('org')}
          >
            {activeTab === 'org' && (
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            )}
            <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${activeTab === 'org' ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
              採購組織設定
            </p>
          </div>
          <div
            className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
            onClick={() => setActiveTab('mail')}
          >
            {activeTab === 'mail' && (
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            )}
            <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${activeTab === 'mail' ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
              mail接收設定
            </p>
          </div>
          {/* 底部分隔線 */}
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
        </div>

        {/* 內容區 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'org' ? (
            <div className="h-full p-[24px] flex flex-col gap-[24px]">

              {/* 頂部：員工資訊 + 儲存按鈕 */}
              <div className="flex items-center justify-between shrink-0">
                <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] text-[#1c252e] text-[13px]">
                  {employeeName}({employeeAccount})
                </p>
                <button className="bg-[#1c252e] flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] w-[130px] hover:bg-[#2c3540] transition-colors cursor-pointer">
                  <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">儲存</p>
                </button>
              </div>

              {/* ===== 採購組織區域 ===== */}
              <div className="shrink-0">
                <div className="flex gap-[4px] items-center mb-[16px]">
                  <div className="relative inline-flex">
                    <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0">
                      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />
                      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">採購組織</p>
                    </div>
                  </div>
                  <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">({selectedOrganizations.length})</p>
                </div>

                {/* 採購組織按鈕組 */}
                <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
                  <div className="flex flex-wrap gap-[10px] items-center">
                    {ALL_ORG_LABELS.map((org) => (
                      <button
                        key={org}
                        className={`flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] shrink-0 cursor-pointer transition-colors relative ${
                          selectedOrganizations.includes(org)
                            ? 'bg-[#004680]'
                            : 'hover:bg-[#f4f6f8]'
                        }`}
                        onClick={() => toggleOrganization(org)}
                      >
                        {!selectedOrganizations.includes(org) && (
                          <div aria-hidden="true" className="absolute border border-[#637381] border-solid inset-0 pointer-events-none rounded-[8px]" />
                        )}
                        <p className={`font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] ${
                          selectedOrganizations.includes(org) ? 'text-white' : 'text-[#637381]'
                        }`}>
                          {org}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== 採購群組區域 ===== */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex gap-[4px] items-center mb-[16px]">
                  <div className="relative inline-flex">
                    <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0">
                      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />
                      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">採購群組</p>
                    </div>
                  </div>
                  <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">({purchaseGroupRows.filter(row => row.companyCode && row.orgCode && row.groupCode).length})</p>
                </div>

                {/* 採購群組表格 */}
                <div className="border border-[#919eab] border-solid rounded-[8px] overflow-hidden flex-1 min-h-0 flex flex-col">
                  <div className="p-[16px] flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col gap-[10px]">
                      {purchaseGroupRows.map((row, index) => (
                        <div key={row.id} className="bg-white h-[60px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full">
                          <div className="flex flex-row items-end size-full">
                            <div className="content-stretch flex gap-[8px] items-end py-[10px] relative size-full">
                              {/* 公司代碼 */}
                              <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[240px]">
                                {index === 0 && (
                                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-center text-ellipsis w-full whitespace-nowrap">公司代碼</p>
                                )}
                                <div className={`flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] rounded-[8px] w-full h-[34px] ${index === 0 ? '' : 'mt-[26px]'}`}>
                                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#919eab] text-[14px]">
                                    {row.companyCode || ''}
                                  </p>
                                </div>
                              </div>

                              {/* 採購組織 */}
                              <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start justify-center relative shrink-0 w-[240px]">
                                {index === 0 && (
                                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-center text-ellipsis w-full whitespace-nowrap">採購組織</p>
                                )}
                                <div className={`relative shrink-0 w-full h-[34px] ${index === 0 ? '' : 'mt-[26px]'}`}>
                                  <Select
                                    value={row.orgCode ? { value: row.orgCode, label: row.orgCode } : null}
                                    onChange={(option) => {
                                      const newOrgCode = option?.value || '';
                                      const newCompanyCode = getCompanyCode(newOrgCode);
                                      setPurchaseGroupRows(purchaseGroupRows.map(r =>
                                        r.id === row.id ? { ...r, companyCode: newCompanyCode, orgCode: newOrgCode, groupCode: '' } : r
                                      ));
                                    }}
                                    options={getAvailableOrgs().map(org => ({ value: org, label: org }))}
                                    placeholder="選擇組織"
                                    styles={customSelectStyles}
                                    isClearable
                                  />
                                </div>
                              </div>

                              {/* 採購群組 */}
                              <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[240px]">
                                {index === 0 && (
                                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-center text-ellipsis w-full whitespace-nowrap">採購群組</p>
                                )}
                                <div className={`relative shrink-0 w-full h-[34px] ${index === 0 ? '' : 'mt-[26px]'}`}>
                                  <Select
                                    value={row.groupCode ? { value: row.groupCode, label: row.groupCode } : null}
                                    onChange={(option) => updateGroupCode(row.id, option?.value || '')}
                                    options={getAvailableGroups(row.orgCode).map(group => ({ value: group, label: group }))}
                                    placeholder="選擇群組"
                                    styles={customSelectStyles}
                                    isDisabled={!row.orgCode}
                                    isClearable
                                  />
                                </div>
                              </div>

                              {/* 操作按鈕 */}
                              <div className={`flex gap-[8px] items-end pb-[5px] ${index === 0 ? '' : 'mt-[26px]'}`}>
                                {index > 0 && (
                                  <div
                                    onClick={() => deletePurchaseGroupRow(row.id)}
                                    className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity"
                                  >
                                    <Trash2 className="size-full text-[#1D7BF5]" strokeWidth={2} />
                                  </div>
                                )}
                                <div
                                  onClick={() => addPurchaseGroupRow(row)}
                                  className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity"
                                >
                                  <Plus className="size-full text-[#1D7BF5]" strokeWidth={2} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full overflow-auto custom-scrollbar">
              <MailSettingsTabContent
                showAddVendorOverlay={showAddVendorOverlay}
                setShowAddVendorOverlay={setShowAddVendorOverlay}
              />
            </div>
          )}
        </div>
      </div>

      {/* 新增廠商overlay */}
      {showAddVendorOverlay && (
        <AddVendorMailOverlay
          onClose={() => setShowAddVendorOverlay(false)}
          onSave={() => {
            console.log('保存廠商設定');
          }}
        />
      )}
    </ResponsivePageLayout>
  );
}