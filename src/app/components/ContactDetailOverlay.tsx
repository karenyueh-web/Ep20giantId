import svgPaths from "@/imports/svg-zn1kgjh4no";
import { useState } from 'react';
import { BaseOverlay } from './BaseOverlay';
import Select from 'react-select';

interface ContactDetailOverlayProps {
  name: string;
  emailEnabled: boolean;
  onClose: () => void;
}

export function ContactDetailOverlay({ name, emailEnabled, onClose }: ContactDetailOverlayProps) {
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(['1101(台灣廠生產採購)', '1013(GCX委購)', '1010(總部GEM委購)']);
  const [priority, setPriority] = useState('1 (收件人)');
  const [role, setRole] = useState('S (業務)');
  
  // 可編輯欄位的狀態
  const [contactName, setContactName] = useState(name);
  const [jobTitle, setJobTitle] = useState('Senior manager');
  const [language, setLanguage] = useState('');
  const [buyerContact, setBuyerContact] = useState('鄒芳肇Allen Zou');
  const [phone, setPhone] = useState('0355213698');
  const [email, setEmail] = useState('nine@jogon-pak.com');
  const [remarks, setRemarks] = useState('可代理OEM');

  const toggleOrganization = (org: string) => {
    setSelectedOrganizations(prev => 
      prev.includes(org) 
        ? prev.filter(o => o !== org)
        : [...prev, org]
    );
  };

  const handleSave = () => {
    // 儲存所有設定
    const savedData = {
      name: contactName,
      role,
      jobTitle,
      priority,
      language,
      buyerContact,
      phone,
      email,
      remarks,
      organizations: selectedOrganizations
    };
    console.log('儲存的資料：', savedData);
    alert('儲存成功！');
  };

  const availableOrgs = [
    '1101(台灣廠生產採購)',
    '1010(總部GEM委購)',
    '1011(GBD商品採購)',
    '1013(GCX委購)',
    '1014(GI委購)',
    '1017(GVM委購)',
    '4111(GEM prod.pur)',
    '4121(GHM prod.pur)',
    '2010(AIP生產採購)',
    '3000(GVM prod.pur)'
  ];

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

  return (
    <BaseOverlay onClose={onClose}>
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
        <button 
          className="bg-[#1c252e] flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] w-[130px] hover:bg-[#2c3540] transition-colors cursor-pointer"
          onClick={handleSave}
        >
          <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">儲存</p>
        </button>
      </div>

      {/* 內容區域 - 可滾動 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-[50px] py-[24px]">
        {/* 聯絡人基本資料 */}
        <div className="mb-[24px]">
          <div className="flex gap-[4px] items-center mb-[16px]">
            <div className="relative inline-flex">
              <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0">
                <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">聯絡人基本資料</p>
              </div>
            </div>
            <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] flex gap-[30px]">
              <span>{name}(久廣)</span>
              <span>收件狀態:{emailEnabled ? '啟用中' : '關閉中'}</span>
            </p>
          </div>

          {/* 基本資料表單 */}
          <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
            <div className="flex flex-col gap-[16px]">
              {/* 第一行：姓名、業務角色、業務職稱 */}
              <div className="flex gap-[16px] items-center w-full">
                {/* 姓名 */}
                <div className="flex gap-[10px] items-center flex-1">
                  <div className="w-[51px] shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">姓名</p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center justify-center">
                        <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="flex-1 font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 業務角色 */}
                <div className="flex gap-[10px] items-center flex-1">
                  <div className="w-[70px] shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">業務角色</p>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={{ value: role, label: role }}
                      onChange={(option) => setRole(option?.value || 'S (業務)')}
                      options={[
                        { value: 'Q (品保)', label: 'Q (品保)' },
                        { value: 'S (業務)', label: 'S (業務)' },
                        { value: 'B (採購)', label: 'B (採購)' },
                        { value: 'IB (整合採購)', label: 'IB (整合採購)' },
                        { value: 'MP (物料計畫)', label: 'MP (物料計畫)' },
                        { value: 'M (管理階層)', label: 'M (管理階層)' },
                      ]}
                      styles={customSelectStyles}
                    />
                  </div>
                </div>

                {/* 業務職稱 */}
                <div className="flex gap-[10px] items-center flex-1">
                  <div className="w-[70px] shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">業務職稱</p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center">
                        <div className="flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="flex-1 font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 第二行：優先序、語系、買方報價窗口 */}
              <div className="flex gap-[16px] items-center w-full">
                {/* 優先序 */}
                <div className="flex gap-[10px] items-center" style={{ flex: '1.2' }}>
                  <div className="w-[85px] shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">寄信優先序</p>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={{ value: priority, label: priority }}
                      onChange={(option) => setPriority(option?.value || '1 (收件人)')}
                      options={[
                        { value: '1 (收件人)', label: '1 (收件人)' },
                        { value: '2 (CC)', label: '2 (CC)' },
                        { value: '3 (BCC)', label: '3 (BCC)' },
                      ]}
                      styles={customSelectStyles}
                    />
                  </div>
                </div>

                {/* 語系 */}
                <div className="flex gap-[10px] items-center" style={{ flex: '0.8' }}>
                  <div className="w-[40px] shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">語系</p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center">
                        <div className="flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] bg-transparent border-none outline-none font-bold font-normal"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 買方報價窗口 */}
                <div className="flex gap-[10px] items-center flex-1">
                  <div className="w-[100px] shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">買方報價窗口</p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center">
                        <div className="flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={buyerContact}
                            onChange={(e) => setBuyerContact(e.target.value)}
                            className="flex-1 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 第三行：電話、mail、備註 */}
              <div className="flex gap-[16px] items-center w-full">
                {/* 電話 */}
                <div className="flex gap-[10px] items-center flex-1">
                  <div className="w-[51px] shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">電話</p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center">
                        <div className="flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="flex-1 font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* mail */}
                <div className="flex gap-[10px] items-center flex-1">
                  <div className="w-[70px] shrink-0">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">mail</p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center">
                        <div className="flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 備註 */}
                <div className="flex gap-[10px] items-center flex-1">
                  <div className="w-[51px] shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">備註</p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center">
                        <div className="flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="flex-1 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 聯絡人負責的採購組織 */}
        <div>
          <div className="flex gap-[4px] items-center mb-[16px]">
            <div className="relative inline-flex">
              <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0">
                <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 pointer-events-none" />
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">聯絡人負責的採購組織</p>
              </div>
            </div>
            <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">({selectedOrganizations.length})</p>
          </div>

          {/* 採購組織按鈕組 */}
          <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
            <div className="flex gap-[10px] items-center flex-wrap">
              {availableOrgs.map((org) => (
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
                  <p className={`font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] whitespace-nowrap ${
                    selectedOrganizations.includes(org) ? 'text-white' : 'text-[#637381]'
                  }`}>
                    {org}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseOverlay>
  );
}