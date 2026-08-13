import svgPaths from "@/imports/svg-ktc85z3o0g";
import { useState, useRef, useEffect } from "react";
import Select from 'react-select';
import { Trash2, Plus, X } from 'lucide-react';
import { getVendorRoles } from '@/app/config/roleStore';
import { MOCK_VENDORS } from '@/app/data/vendorData';

interface SalesAccountDetailOverlayProps {
  email: string;
  name: string;
  code: string;
  vendorName: string;
  onClose: () => void;
  onSave: (data: {
    roles: string[];
    organizations: string[];
    purchaseGroups: PurchaseGroupRow[];
    proxyVendorCodes: string[];
  }) => void;
  initialData?: {
    roles: string[];
    organizations: string[];
    purchaseGroups: PurchaseGroupRow[];
    proxyVendorCodes?: string[];
  };
}

interface VendorOption {
  code: string;
  name: string;
  fullName: string;
}

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

interface PurchaseGroupRow {
  id: string;
  companyCode: string;
  orgCode: string;
  groupCode: string;
}

export function SalesAccountDetailOverlay({ email, name, code, vendorName, onClose, onSave, initialData }: SalesAccountDetailOverlayProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialData?.roles ?? []);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(initialData?.organizations || []);
  const [purchaseGroupRows, setPurchaseGroupRows] = useState<PurchaseGroupRow[]>(() => {
    if (initialData?.purchaseGroups && initialData.purchaseGroups.length > 0) {
      return initialData.purchaseGroups;
    }
    return [{ id: '1', companyCode: '', orgCode: '', groupCode: '' }];
  });
  const [proxyVendorCodes, setProxyVendorCodes] = useState<string[]>(initialData?.proxyVendorCodes ?? []);
  const [proxyInput, setProxyInput] = useState('');
  const [proxyDropdownOpen, setProxyDropdownOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });
  const proxyInputRef = useRef<HTMLInputElement>(null);
  const proxyDropdownRef = useRef<HTMLDivElement>(null);


  const filteredProxyOptions: VendorOption[] = proxyInput.trim().length === 0
    ? []
    : MOCK_VENDORS
        .filter(v => {
          const q = proxyInput.trim().toLowerCase();
          return (
            v.code.toLowerCase().includes(q) ||
            v.name.toLowerCase().includes(q) ||
            v.fullName.toLowerCase().includes(q)
          ) && !proxyVendorCodes.includes(v.code);
        })
        .slice(0, 8);

  useEffect(() => {
    if (proxyDropdownOpen && proxyInputRef.current) {
      const r = proxyInputRef.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - r.bottom - 16; // 16px 邊距
      setDropdownRect({
        top: r.bottom + 4,
        left: r.left,
        width: r.width,
        maxHeight: Math.min(280, Math.max(120, availableHeight)),
      });
    }
  }, [proxyDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        proxyDropdownRef.current &&
        !proxyDropdownRef.current.contains(e.target as Node) &&
        proxyInputRef.current &&
        !proxyInputRef.current.contains(e.target as Node)
      ) {
        setProxyDropdownOpen(false);
      }
    };
    const closeOnScroll = (e: Event) => {
      // 如果 scroll 發生在 dropdown 內部，不要關閉
      if (proxyDropdownRef.current && proxyDropdownRef.current.contains(e.target as Node)) return;
      setProxyDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnScroll);
    };
  }, []);


  const addProxyVendor = (vendor: VendorOption) => {
    if (!proxyVendorCodes.includes(vendor.code)) {
      setProxyVendorCodes(prev => [...prev, vendor.code]);
    }
    setProxyInput('');
    setProxyDropdownOpen(false);
    proxyInputRef.current?.focus();
  };

  const removeProxyVendor = (vendorCode: string) => {
    setProxyVendorCodes(prev => prev.filter(c => c !== vendorCode));
  };

  const getProxyVendorLabel = (vendorCode: string) => {
    const v = MOCK_VENDORS.find(mv => mv.code === vendorCode);
    return v ? `${v.name}(${v.code})` : vendorCode;
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleOrganization = (org: string) => {
    setSelectedOrganizations(prev =>
      prev.includes(org) ? prev.filter(o => o !== org) : [...prev, org]
    );
  };

  const addPurchaseGroupRow = (sourceRow?: PurchaseGroupRow) => {
    const newRow: PurchaseGroupRow = {
      id: Date.now().toString(),
      companyCode: sourceRow?.companyCode || '',
      orgCode: sourceRow?.orgCode || '',
      groupCode: '',
    };
    setPurchaseGroupRows(prev => [...prev, newRow]);
  };

  const deletePurchaseGroupRow = (id: string) => {
    setPurchaseGroupRows(prev => prev.filter(row => row.id !== id));
  };

  const updateGroupCode = (id: string, groupCode: string) => {
    setPurchaseGroupRows(prev =>
      prev.map(row => row.id === id ? { ...row, groupCode } : row)
    );
  };

  const getAvailableOrgs = () => selectedOrganizations;

  const getAvailableGroups = (orgCode: string) => {
    if (!orgCode || !ORG_GROUP_MAPPING[orgCode]) return [];
    return ORG_GROUP_MAPPING[orgCode].groups || [];
  };

  const getCompanyCode = (orgCode: string) => {
    if (!orgCode || !ORG_GROUP_MAPPING[orgCode]) return '';
    return ORG_GROUP_MAPPING[orgCode].companyCode;
  };

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: '34px',
      height: '34px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#2196F3' : 'rgba(145, 158, 171, 0.32)',
      borderWidth: state.isFocused ? '2px' : '1px',
      boxShadow: state.isFocused ? '0 2px 8px rgba(33, 150, 243, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
      '&:hover': { borderColor: state.isFocused ? '#2196F3' : 'rgba(145, 158, 171, 0.6)' },
      padding: '0',
    }),
    valueContainer: (base: any) => ({ ...base, height: '34px', padding: '0 12px' }),
    input: (base: any) => ({ ...base, margin: '0', padding: '0' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base: any) => ({ ...base, padding: '0 8px', color: '#637381' }),
    menu: (base: any) => ({ ...base, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }),
    menuList: (base: any) => ({ ...base, padding: '4px' }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2196F3' : state.isFocused ? 'rgba(33, 150, 243, 0.1)' : 'white',
      color: state.isSelected ? 'white' : '#1c252e',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontFamily: "'Public_Sans:Regular', sans-serif",
      '&:active': { backgroundColor: '#2196F3' },
    }),
    placeholder: (base: any) => ({ ...base, color: '#919eab', fontSize: '14px', fontFamily: "'Public_Sans:Regular', sans-serif" }),
    singleValue: (base: any) => ({ ...base, color: '#1c252e', fontSize: '14px', fontFamily: "'Public_Sans:Regular', sans-serif" }),
  };

  const handleSave = () => {
    onSave({
      roles: selectedRoles,
      organizations: selectedOrganizations,
      purchaseGroups: purchaseGroupRows.filter(row => row.orgCode && row.groupCode),
      proxyVendorCodes,
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
          <button
            className="bg-[#1c252e] flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] w-[130px] hover:bg-[#2c3540] transition-colors cursor-pointer"
            onClick={handleSave}
          >
            <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">儲存</p>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-[50px] py-[24px]">

          {/* mail 設定 */}
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
            <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
              <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0 w-[284px]">
                <div aria-hidden="true" className="absolute border border-[#637381] border-solid inset-0 pointer-events-none rounded-[8px]" />
                <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c252e] text-[14px] text-center tracking-[0.25px] whitespace-nowrap">{email}</p>
              </div>
            </div>
          </div>

          {/* 廠商角色 */}
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
            <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
              <div className="flex gap-[10px] items-center">
                {getVendorRoles().map((roleItem) => (
                  <button
                    key={roleItem.id}
                    className={`flex gap-[8px] h-[36px] items-center justify-center w-[90px] px-[12px] rounded-[8px] shrink-0 cursor-pointer transition-colors relative ${selectedRoles.includes(roleItem.label) ? 'bg-[#004680]' : 'hover:bg-[#f4f6f8]'}`}
                    onClick={() => toggleRole(roleItem.label)}
                  >
                    {!selectedRoles.includes(roleItem.label) && (
                      <div aria-hidden="true" className="absolute border border-[#637381] border-solid inset-0 pointer-events-none rounded-[8px]" />
                    )}
                    <p className={`font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] ${selectedRoles.includes(roleItem.label) ? 'text-white' : 'text-[#637381]'}`}>
                      {roleItem.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 採購組織 */}
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
            <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
              <div className="flex flex-wrap gap-[10px] items-center">
                {['1101(台灣廠生產採購)', '1010(總部GEM委購)', '1011(GBD商品採購)', '1013(GCX委購)', '1014(GI委購)', '1017(GVM委購)', '4111(GEM prod.pur)', '4121(GHM prod.pur)', '2010(AIP採購)', '3000(GVM prod.pur)'].map((org) => {
                    const match = org.match(/^([^(]+)(\(.+\))$/);
                    const code = match ? match[1] : org;
                    const desc = match ? match[2] : '';
                    return (
                      <button
                        key={org}
                        className={`flex flex-col items-center justify-center w-[130px] min-h-[48px] py-[6px] px-[8px] rounded-[8px] shrink-0 cursor-pointer transition-colors relative ${selectedOrganizations.includes(org) ? 'bg-[#004680]' : 'hover:bg-[#f4f6f8]'}`}
                        onClick={() => toggleOrganization(org)}
                      >
                        {!selectedOrganizations.includes(org) && (
                          <div aria-hidden="true" className="absolute border border-[#637381] border-solid inset-0 pointer-events-none rounded-[8px]" />
                        )}
                        <p className={`font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[20px] text-[13px] ${selectedOrganizations.includes(org) ? 'text-white' : 'text-[#637381]'}`}>
                          {code}
                        </p>
                        {desc && (
                          <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[18px] text-[12px] ${selectedOrganizations.includes(org) ? 'text-white opacity-80' : 'text-[#919eab]'}`}>
                            {desc}
                          </p>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* 採購群組 */}
          <div className="mb-[24px]">
            <div className="flex gap-[4px] items-center mb-[16px]">
              <div className="relative inline-flex">
                <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0">
                  <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">採購群組</p>
                </div>
              </div>
              <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">({purchaseGroupRows.filter(row => row.companyCode && row.orgCode && row.groupCode).length})</p>
            </div>
            <div className="border border-[#919eab] border-solid rounded-[8px] overflow-hidden">
              <div className="p-[16px] min-h-[232px] max-h-[350px] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-[10px]">
                  {purchaseGroupRows.map((row, index) => (
                    <div key={row.id} className="bg-white h-[60px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full">
                      <div className="flex flex-row items-end size-full">
                        <div className="content-stretch flex gap-[8px] items-end py-[10px] relative size-full">
                          <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[240px]">
                            {index === 0 && (
                              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-center text-ellipsis w-full whitespace-nowrap">公司代碼</p>
                            )}
                            <div className={`flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] rounded-[8px] w-full h-[34px] ${index === 0 ? '' : 'mt-[26px]'}`}>
                              <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#919eab] text-[14px]">{row.companyCode || ''}</p>
                            </div>
                          </div>
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
                                  setPurchaseGroupRows(prev => prev.map(r =>
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
                          <div className={`flex gap-[8px] items-end pb-[5px] ${index === 0 ? '' : 'mt-[26px]'}`}>
                            {index > 0 && (
                              <div onClick={() => deletePurchaseGroupRow(row.id)} className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity">
                                <Trash2 className="size-full text-[#1D7BF5]" strokeWidth={2} />
                              </div>
                            )}
                            <div onClick={() => addPurchaseGroupRow(row)} className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity">
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

          {/* 代理多廠出貨 */}
          <div>
            <div className="flex gap-[4px] items-center mb-[16px]">
              <div className="relative inline-flex">
                <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0">
                  <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">代理多廠出貨</p>
                </div>
              </div>
              <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">({proxyVendorCodes.length})</p>
            </div>
            {/* 用 relative wrapper 包住 border 容器，讓 dropdown 定位在 border 框外面正確浮動 */}
            <div className="relative">
              <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
                <div className="relative">
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)]" />
                  <div className="absolute flex items-center left-[14px] px-[2px] top-[-9px] z-10 bg-white">
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>輸入廠商名稱或編號搜尋</p>
                  </div>
                  <input
                    ref={proxyInputRef}
                    type="text"
                    value={proxyInput}
                    onChange={e => { setProxyInput(e.target.value); setProxyDropdownOpen(true); }}
                    onFocus={() => proxyInput.trim() && setProxyDropdownOpen(true)}
                    onKeyDown={e => { if (e.key === 'Escape') { setProxyDropdownOpen(false); setProxyInput(''); } }}
                    placeholder=""
                    className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
                  />
                </div>

                {/* Tags 在 border 框內 */}
                {proxyVendorCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-[8px] mt-[16px]">
                    {proxyVendorCodes.map(pCode => (
                      <div key={pCode} className="inline-flex items-center gap-[6px] h-[28px] px-[10px] rounded-[8px] bg-[rgba(0,94,184,0.1)]">
                        <span className="font-['Public_Sans:Medium',sans-serif] font-medium text-[13px] text-[#005eb8]">{getProxyVendorLabel(pCode)}</span>
                        <button
                          type="button"
                          onClick={() => removeProxyVendor(pCode)}
                          className="flex items-center justify-center w-[16px] h-[16px] rounded-full hover:bg-[rgba(0,94,184,0.2)] transition-colors"
                        >
                          <X size={10} strokeWidth={2.5} className="text-[#005eb8]" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#919eab] mt-[12px]">尚未設定代理廠商</p>
                )}
              </div>

              {/* Dropdown 用 position:fixed 定位在 viewport，完全不受 Modal overflow 截斷 */}
              {proxyDropdownOpen && filteredProxyOptions.length > 0 && (
                <div
                  ref={proxyDropdownRef}
                  style={{
                    position: 'fixed',
                    top: dropdownRect.top,
                    left: dropdownRect.left,
                    width: dropdownRect.width,
                    maxHeight: dropdownRect.maxHeight,
                    zIndex: 9999,
                  }}
                  className="bg-white rounded-[8px] shadow-[0px_8px_24px_0px_rgba(145,158,171,0.24)] border border-[rgba(145,158,171,0.16)] overflow-y-auto"
                >
                  {filteredProxyOptions.map(v => (
                    <button
                      key={v.code}
                      type="button"
                      className="w-full flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[rgba(0,94,184,0.06)] transition-colors text-left"
                      onMouseDown={e => { e.preventDefault(); addProxyVendor(v); }}
                    >
                      <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e] shrink-0">{v.code}</span>
                      <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#637381] truncate">{v.name}・{v.fullName}</span>
                    </button>
                  ))}
                </div>
              )}
              {proxyDropdownOpen && proxyInput.trim().length > 0 && filteredProxyOptions.length === 0 && (
                <div
                  ref={proxyDropdownRef}
                  style={{
                    position: 'fixed',
                    top: dropdownRect.top,
                    left: dropdownRect.left,
                    width: dropdownRect.width,
                    zIndex: 9999,
                  }}
                  className="bg-white rounded-[8px] shadow-[0px_8px_24px_0px_rgba(145,158,171,0.24)] border border-[rgba(145,158,171,0.16)] px-[14px] py-[12px]"
                >
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#919eab]">查無符合廠商</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
