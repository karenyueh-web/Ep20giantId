import svgPaths from "@/imports/svg-ktc85z3o0g";
import { useState } from "react";
import Select from 'react-select';
import { Trash2, Plus } from 'lucide-react';

interface SalesAccountDetailOverlayProps {
  email: string;
  name: string;
  code: string;
  vendorName: string; // 新增：廠商簡稱
  onClose: () => void;
  onSave: (data: {
    roles: string[];
    organizations: string[];
    purchaseGroups: PurchaseGroupRow[];
  }) => void;
  initialData?: {
    roles: string[];
    organizations: string[];
    purchaseGroups: PurchaseGroupRow[];
  };
}

// 組織與群組對照表
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

// 採購群組行的類型
interface PurchaseGroupRow {
  id: string;
  companyCode: string; // 公司代碼
  orgCode: string; // 採購組織代碼
  groupCode: string; // 採購群組代碼
}

export function SalesAccountDetailOverlay({ email, name, code, vendorName, onClose, onSave, initialData }: SalesAccountDetailOverlayProps) {
  // 狀態管理：選中的角色和組織
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialData?.roles || ['業務']);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(initialData?.organizations || []);
  
  // 採購群組行數據 - 確保至少有一筆資料
  const [purchaseGroupRows, setPurchaseGroupRows] = useState<PurchaseGroupRow[]>(() => {
    if (initialData?.purchaseGroups && initialData.purchaseGroups.length > 0) {
      return initialData.purchaseGroups;
    }
    return [{ id: '1', companyCode: '', orgCode: '', groupCode: '' }];
  });

  // 切換選項的函數
  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const toggleOrganization = (org: string) => {
    setSelectedOrganizations(prev => 
      prev.includes(org) 
        ? prev.filter(o => o !== org)
        : [...prev, org]
    );
  };

  // 新增採購群組行 - 複製當前行的採購組織
  const addPurchaseGroupRow = (sourceRow?: PurchaseGroupRow) => {
    const newRow: PurchaseGroupRow = {
      id: Date.now().toString(),
      companyCode: sourceRow?.companyCode || '',
      orgCode: sourceRow?.orgCode || '',
      groupCode: '', // 採購群組保持空白，讓使用者選擇
    };
    setPurchaseGroupRows([...purchaseGroupRows, newRow]);
  };

  // 刪除採購群組行
  const deletePurchaseGroupRow = (id: string) => {
    setPurchaseGroupRows(purchaseGroupRows.filter(row => row.id !== id));
  };

  // 更新採購組織
  const updateOrgCode = (id: string, orgCode: string) => {
    setPurchaseGroupRows(purchaseGroupRows.map(row => 
      row.id === id ? { ...row, orgCode, groupCode: '' } : row
    ));
  };

  // 更新採購群組
  const updateGroupCode = (id: string, groupCode: string) => {
    setPurchaseGroupRows(purchaseGroupRows.map(row => 
      row.id === id ? { ...row, groupCode } : row
    ));
  };

  // 獲取可選的採購組織（只有被選中的組織）
  const getAvailableOrgs = () => {
    return selectedOrganizations;
  };

  // 獲取可選的採購群組（根據公司代碼）
  const getAvailableGroups = (orgCode: string) => {
    if (!orgCode || !ORG_GROUP_MAPPING[orgCode]) return [];
    const companyCode = ORG_GROUP_MAPPING[orgCode].companyCode;
    return ORG_GROUP_MAPPING[orgCode].groups || [];
  };

  // 獲取公司代碼
  const getCompanyCode = (orgCode: string) => {
    if (!orgCode || !ORG_GROUP_MAPPING[orgCode]) return '';
    return ORG_GROUP_MAPPING[orgCode].companyCode;
  };

  // React Select 自定義樣式
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
      padding: state.isFocused ? '0' : '0',
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

  // 處理儲存
  const handleSave = () => {
    onSave({
      roles: selectedRoles,
      organizations: selectedOrganizations,
      purchaseGroups: purchaseGroupRows.filter(row => row.orgCode && row.groupCode),
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-[20px]"
      onClick={onClose}
    >
      <div 
        className="bg-white h-full max-h-[760px] w-full max-w-[1000px] rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 頂部標題列 - 固定不滾動 */}
        <div className="flex items-center justify-between px-[50px] py-[24px] border-b border-[rgba(145,158,171,0.08)] shrink-0">
          <div className="flex gap-[10px] items-center">
            <button 
              className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path clipRule="evenodd" d={svgPaths.p66e40f0} fill="#637381" fillRule="evenodd" />
              </svg>
            </button>
          </div>
          <button className="bg-[#1c252e] flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] w-[130px] hover:bg-[#2c3540] transition-colors cursor-pointer" onClick={handleSave}>
            <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">儲存</p>
          </button>
        </div>

        {/* 內容區域 - 可滾動 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-[50px] py-[24px]">
          {/* mail設定區域 */}
          <div className="mb-[24px]">
            <div className="flex gap-[4px] items-center mb-[16px]">
              <div className="relative inline-flex">
                <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0">
                  <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">mail</p>
                </div>
              </div>
              <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">{name}({vendorName})</p>
            </div>

            {/* Email輸入框 */}
            <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
              <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0 w-[284px]">
                <div aria-hidden="true" className="absolute border border-[#637381] border-solid inset-0 pointer-events-none rounded-[8px]" />
                <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c252e] text-[14px] text-center tracking-[0.25px] whitespace-nowrap">{email}</p>
              </div>
            </div>
          </div>

          {/* 廠商角色區域 */}
          <div className="mb-[24px]">
            <div className="flex gap-[4px] items-center mb-[16px]">
              <div className="relative inline-flex">
                <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0">
                  <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">廠商角色</p>
                </div>
              </div>
              <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">({selectedRoles.length})</p>
            </div>

            {/* 角色按鈕組 */}
            <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
              <div className="flex gap-[10px] items-center">
                {['業務', '品保', '下包商', '業務人員'].map((role) => (
                  <button
                    key={role}
                    className={`flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] shrink-0 cursor-pointer transition-colors relative ${
                      selectedRoles.includes(role)
                        ? 'bg-[#004680]'
                        : 'hover:bg-[#f4f6f8]'
                    }`}
                    onClick={() => toggleRole(role)}
                  >
                    {!selectedRoles.includes(role) && (
                      <div aria-hidden="true" className="absolute border border-[#637381] border-solid inset-0 pointer-events-none rounded-[8px]" />
                    )}
                    <p className={`font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] ${
                      selectedRoles.includes(role) ? 'text-white' : 'text-[#637381]'
                    }`}>
                      {role}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 採購組織區域 */}
          <div className="mb-[24px]">
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
                {['1101(台灣廠生產採購)', '1010(總部GEM委購)', '1011(GBD商品採購)', '1013(GCX委購)', '1014(GI委購)', '1017(GVM委購)', '4111(GEM prod.pur)', '4121(GHM prod.pur)', '2010(AIP採購)', '3000(GVM prod.pur)'].map((org) => (
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

          {/* 採購群組區域 */}
          <div>
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
            <div className="border border-[#919eab] border-solid rounded-[8px] overflow-hidden">
              <div className="p-[16px] min-h-[232px] max-h-[350px] overflow-y-auto custom-scrollbar">
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
      </div>
    </div>
  );
}