import { useState, useEffect } from 'react';
import svgPaths from "@/imports/svg-90pu4m8y4o";
import type { PageType } from './MainLayout';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import { SalesAccountForm } from './SalesAccountForm';
import { SalesAccountDetailOverlay } from './SalesAccountDetailOverlay';
import { VendorContactsForm } from './VendorContactsForm';
import { ResponsivePageLayout } from './ResponsivePageLayout';

interface VendorDetailPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  onBack?: () => void;
  defaultTab?: TabType;
  userRole?: string;
  pendingVendorApproval?: {
    name: string;
    email: string;
    company: string;
    epCode: string;
  } | null;
  onClearPendingApproval?: () => void;
}

// Tab組件
type TabType = 'vendor' | 'sales' | 'contacts';

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onBack?: () => void;
}

function Tabs({ activeTab, onTabChange, onBack }: TabsProps) {
  return (
    <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full" data-name="Tabs">
      {/* 返回按鈕 */}
      {onBack && (
        <div 
          onClick={onBack}
          className="overflow-clip relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity"
        >
          <IconsSolidIcSolarMultipleForwardLeftBroken />
        </div>
      )}
      
      {/* 基本資料 Tab */}
      <div 
        className={`content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer ${
          activeTab === 'vendor' ? '' : ''
        }`}
        onClick={() => onTabChange('vendor')}
      >
        {activeTab === 'vendor' && (
          <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
        )}
        <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
          activeTab === 'vendor' ? 'text-[#1c252e]' : 'text-[#637381]'
        }`}>
          基本資料
        </p>
      </div>
      
      {/* 業務帳號 Tab */}
      <div 
        className={`content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer`}
        onClick={() => onTabChange('sales')}
      >
        {activeTab === 'sales' && (
          <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
        )}
        <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
          activeTab === 'sales' ? 'text-[#1c252e]' : 'text-[#637381]'
        }`}>
          業務帳號
        </p>
      </div>
      
      {/* 其他聯絡人 Tab */}
      <div 
        className={`content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer`}
        onClick={() => onTabChange('contacts')}
      >
        {activeTab === 'contacts' && (
          <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
        )}
        <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
          activeTab === 'contacts' ? 'text-[#1c252e]' : 'text-[#637381]'
        }`}>
          其他聯絡人
        </p>
      </div>
      
      <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" data-name="divider" />
    </div>
  );
}

// Checkbox組件
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-name="Table/Cell">
      <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
        <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
          <div 
            className={`content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0 ${
              disabled ? 'cursor-default' : 'cursor-pointer hover:bg-[#f4f6f8] transition-colors'
            }`}
            onClick={() => !disabled && onChange(!checked)}
            data-name="icon container"
          >
            <div className="overflow-clip relative shrink-0 size-[20px]">
              <div className="absolute inset-[8.33%]" data-name="primary-shape">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
                  <path 
                    clipRule="evenodd" 
                    d={checked ? svgPaths.p2dde97c0 : svgPaths.p3f5b84f0} 
                    fill={disabled ? (checked ? "#005eb8" : "#C4CDD5") : (checked ? "#005eb8" : "#637381")} 
                    fillRule="evenodd" 
                    id="primary-shape" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
          <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[14px] ${
            disabled ? (checked ? 'text-[#1c252e]' : 'text-[#C4CDD5]') : 'text-[#1c252e]'
          }`}>{label}</p>
        </div>
      </div>
    </div>
  );
}

// Radio組件
interface RadioProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

function Radio({ checked, onChange, label, disabled = false }: RadioProps) {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-name="Table/Cell">
      <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
        <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
          <div 
            className={`content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0 ${
              disabled ? 'cursor-default' : 'cursor-pointer hover:bg-[#f4f6f8] transition-colors'
            }`}
            onClick={() => !disabled && onChange()}
            data-name="icon container"
          >
            <div className="overflow-clip relative shrink-0 size-[20px]">
              <div className="absolute inset-[8.33%]" data-name="primary-shape">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
                  <path 
                    clipRule="evenodd" 
                    d={checked ? svgPaths.p28f2b480 : svgPaths.p3f5b84f0} 
                    fill={disabled ? (checked ? "#005eb8" : "#C4CDD5") : (checked ? "#005eb8" : "#637381")} 
                    fillRule="evenodd" 
                    id="primary-shape" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
          <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[14px] ${
            disabled ? (checked ? 'text-[#1c252e]' : 'text-[#C4CDD5]') : 'text-[#1c252e]'
          }`}>{label}</p>
        </div>
      </div>
    </div>
  );
}

// 廠商資訊表單內容
function VendorInfoForm() {
  const STORAGE_KEY = 'vendor_000100531_mainProducts';
  const SPECIAL_SETTINGS_KEY = 'vendor_000100531_specialSettings';
  
  const [vendorCode] = useState('000100531');
  const [vendorName] = useState('久廣');
  const [vendorFullName] = useState('久廣實業股份有限公司');
  const [axCode] = useState('');
  const [phone] = useState('+886-37-756558');
  const [fax] = useState('+886-3-7750836');
  const [address] = useState('苗栗縣通霄鎮中正路73號');
  
  // 從 localStorage 讀取初始值，如果沒有就使用默認值
  const getInitialMainProducts = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || '車架/前叉/吊耳/止栓/把手套/煞車附件/變速器固定座/座墊/座墊桿/標紙/螺絲';
  };

  // 從 localStorage 讀取特殊參與設定
  const getInitialSpecialSettings = () => {
    const saved = localStorage.getItem(SPECIAL_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      needInspectionReport: true,
      needPerformanceTest: true,
      needHazardousMaterial: true,
      insuranceOption: 'withMail',
      needMaterialInfo: true
    };
  };
  
  const [mainProducts, setMainProducts] = useState(getInitialMainProducts());
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // 特殊參與設定
  const initialSettings = getInitialSpecialSettings();
  const [needInspectionReport, setNeedInspectionReport] = useState(initialSettings.needInspectionReport);
  const [needPerformanceTest, setNeedPerformanceTest] = useState(initialSettings.needPerformanceTest);
  const [needHazardousMaterial, setNeedHazardousMaterial] = useState(initialSettings.needHazardousMaterial);
  const [insuranceOption, setInsuranceOption] = useState<'none' | 'withMail' | 'noMail'>(initialSettings.insuranceOption);
  const [needMaterialInfo, setNeedMaterialInfo] = useState(initialSettings.needMaterialInfo);

  // 組件載入時從 localStorage 讀取數據
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMainProducts(saved);
    }

    const savedSettings = localStorage.getItem(SPECIAL_SETTINGS_KEY);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNeedInspectionReport(settings.needInspectionReport);
      setNeedPerformanceTest(settings.needPerformanceTest);
      setNeedHazardousMaterial(settings.needHazardousMaterial);
      setInsuranceOption(settings.insuranceOption);
      setNeedMaterialInfo(settings.needMaterialInfo);
    }
  }, []);

  // 保存處理函數
  const handleSave = () => {
    // 保存主要營業產品到 localStorage
    localStorage.setItem(STORAGE_KEY, mainProducts);
    
    // 保存特殊參與設定到 localStorage
    const specialSettings = {
      needInspectionReport,
      needPerformanceTest,
      needHazardousMaterial,
      insuranceOption,
      needMaterialInfo
    };
    localStorage.setItem(SPECIAL_SETTINGS_KEY, JSON.stringify(specialSettings));
    
    setShowSaveSuccess(true);
    console.log('已儲存主要營業產品到 localStorage：', mainProducts);
    console.log('已儲存特殊參與設定到 localStorage：', specialSettings);
    
    // 3秒後隱藏成功提示
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-[24px] pb-[20px]">
      {/* 基本資料區塊 */}
      <div className="relative mb-[20px]">
        {/* 標題區 */}
        <div className="flex items-center justify-between mb-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="h-[45px] relative w-[72px]">
              <div className="absolute content-stretch flex flex-col items-start left-0 top-[-3px] w-[72px]">
                <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="Tab">
                  <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">基本資料</p>
                </div>
              </div>
            </div>
            <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">久廣(0001000531)</p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-[#1c252e] content-stretch flex gap-[8px] h-[44.201px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] w-[130px] hover:bg-[#2c3540] transition-colors cursor-pointer" 
            data-name="Button"
          >
            <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
              <p className="leading-[24px]">儲存</p>
            </div>
          </button>
        </div>

        {/* 保存成功提示 */}
        {showSaveSuccess && (
          <div className="fixed top-[100px] right-[50px] bg-[#00875a] text-white px-[20px] py-[12px] rounded-[8px] shadow-lg z-[1000] flex items-center gap-[12px]">
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <path d="M16.666 5L7.5 14.167 3.333 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px]">已成功儲存！</p>
          </div>
        )}
        
        {/* 表單框架 */}
        <div className="border border-[#919eab] border-solid rounded-[8px] p-[20px]">
          <div className="flex flex-col gap-[5px]">
            {/* 第一行：廠商代碼、廠商簡稱、廠商完整名稱 */}
            <div className="flex gap-[40px] w-full">
              {/* 廠商代碼：固定寬度 */}
              <div className="flex gap-[10px] items-center w-[260px]">
                <div className="w-[80px]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">廠商代碼</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-start py-[10px]">
                    <div className="flex-1 rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center justify-center">
                        <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={vendorCode}
                            readOnly
                            className="flex-1 font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 剩餘空間平均分配給兩組 */}
              <div className="flex flex-1 gap-[20px]">
                {/* 廠商簡稱組 */}
                <div className="flex flex-1 gap-[10px] items-center">
                  <div className="flex items-center shrink-0">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">廠商簡稱</p>
                  </div>
                  <div className="flex flex-1 items-start py-[10px]">
                    <div className="flex-1 rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center justify-center">
                        <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={vendorName}
                            readOnly
                            className="flex-1 font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 廠商完整名稱組 */}
                <div className="flex flex-1 gap-[10px] items-center">
                  <div className="flex items-center shrink-0">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">廠商完整名稱</p>
                  </div>
                  <div className="flex flex-1 items-center justify-end py-[10px]">
                    <div className="flex-1 rounded-[8px] relative">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center justify-center">
                        <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                          <input
                            type="text"
                            value={vendorFullName}
                            readOnly
                            className="flex-1 font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 第二行：AX廠商代碼、電話、傳真 */}
            <div className="flex gap-[10px] w-full">
              <div className="flex flex-1 gap-[10px] items-center">
                <div className="flex items-center">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">AX廠商代碼</p>
                </div>
                <div className="flex flex-1 items-center justify-end py-[10px]">
                  <div className="flex-1 rounded-[8px] relative">
                    <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                    <div className="flex items-center justify-center">
                      <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                        <input
                          type="text"
                          value={axCode}
                          readOnly
                          className="flex-1 font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-1 gap-[10px] items-center">
                <div className="flex items-center">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">電話</p>
                </div>
                <div className="flex flex-1 items-center justify-end py-[10px]">
                  <div className="flex-1 rounded-[8px] relative">
                    <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                    <div className="flex items-center justify-center">
                      <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                        <input
                          type="text"
                          value={phone}
                          readOnly
                          className="flex-1 font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-1 gap-[10px] items-center">
                <div className="flex items-center">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">傳真</p>
                </div>
                <div className="flex flex-1 items-center justify-end py-[10px]">
                  <div className="flex-1 rounded-[8px] relative">
                    <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                    <div className="flex items-center justify-center">
                      <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                        <input
                          type="text"
                          value={fax}
                          readOnly
                          className="flex-1 font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1c252e] text-[14px] bg-transparent border-none outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 第三行：地址 */}
            <div className="flex items-center w-full">
              <div className="flex flex-1 gap-[10px] items-center">
                <div className="w-[51px]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">地址</p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-end">
                    <div className="flex items-start justify-end pl-[10px] py-[10px] w-full">
                      <div className="flex-1 rounded-[8px] relative">
                        <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                        <div className="flex items-center justify-center">
                          <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                            <input
                              type="text"
                              value={address}
                              readOnly
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

            {/* 第四行：主要營業產品 */}
            <div className="flex items-center w-full">
              <div className="flex flex-1 gap-[39px] items-center">
                <div className="w-[51px]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">主要營業產品</p>
                </div>
                <div className="flex items-center justify-center pl-[10px] py-[10px] w-[906px]">
                  <div className="flex-1 rounded-[8px] relative">
                    <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
                    <div className="flex items-center justify-center">
                      <div className="flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] w-full">
                        <input
                          type="text"
                          value={mainProducts}
                          onChange={(e) => setMainProducts(e.target.value)}
                          className="flex-1 [text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] underline bg-transparent border-none outline-none"
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

      {/* 特殊參與設定區塊 */}
      <div className="relative">
        {/* 標題 */}
        <div className="flex items-center justify-between mb-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="content-stretch flex gap-[8px] h-[48px] items-center relative shrink-0" data-name="Tab">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid bottom-0 left-0 right-0 h-[2px] pointer-events-none" />
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">特殊參與設定</p>
            </div>
          </div>
        </div>

        {/* 設定框架 */}
        <div className="border border-[#919eab] border-solid rounded-[8px] p-[16px]">
          <div className="flex flex-col gap-px">
            {/* 第一組：需付檢驗報告、需付功性能測試報告 */}
            <div className="bg-[rgba(0,94,184,0.08)] rounded-tl-[8px] rounded-tr-[8px] h-[40px] flex items-center px-[16px]">
              <div className="flex gap-[10px] items-center">
                <Checkbox checked={needInspectionReport} onChange={setNeedInspectionReport} label="需付檢驗報告" />
                <Checkbox checked={needPerformanceTest} onChange={setNeedPerformanceTest} label="需付功性能測試報告" />
              </div>
            </div>

            {/* 第二組：需參與有害物質機制 */}
            <div className="rounded-bl-[8px] rounded-br-[8px] rounded-tr-[8px] h-[40px] flex items-center px-[16px]">
              <Checkbox checked={needHazardousMaterial} onChange={setNeedHazardousMaterial} label="需參與有害物質機制" />
            </div>

            {/* 第三組：產險資料選項 */}
            <div className="bg-[rgba(0,94,184,0.08)] rounded-bl-[8px] rounded-br-[8px] rounded-tr-[8px] h-[40px] flex items-center px-[16px]">
              <div className="flex gap-[10px] items-center">
                <Radio checked={insuranceOption === 'none'} onChange={() => setInsuranceOption('none')} label="不需付產險資料" />
                <Radio checked={insuranceOption === 'withMail'} onChange={() => setInsuranceOption('withMail')} label="需付產險資料並mail通知" />
                <Radio checked={insuranceOption === 'noMail'} onChange={() => setInsuranceOption('noMail')} label="需付產險資料，不需mail通知" />
              </div>
            </div>

            {/* 第四組：需填寫物料成份資訊 */}
            <div className="rounded-bl-[8px] rounded-br-[8px] rounded-tr-[8px] h-[40px] flex items-center px-[16px]">
              <Checkbox checked={needMaterialInfo} onChange={setNeedMaterialInfo} label="需填寫物料成份資訊" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// C區：內容區域
function ContentArea({ 
  activeTab, 
  onTabChange, 
  onBack,
  onAccountClick,
  pendingVendorApproval,
  onClearPendingApproval
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void; 
  onBack: () => void;
  onAccountClick: (account: any) => void;
  pendingVendorApproval?: {
    name: string;
    email: string;
    company: string;
    epCode: string;
  } | null;
  onClearPendingApproval?: () => void;
}) {
  return (
    <div className="w-full h-full">
      <div className="bg-white w-full h-full rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] flex flex-col gap-[9px] relative overflow-hidden">
        {/* Tabs */}
        <Tabs activeTab={activeTab} onTabChange={onTabChange} onBack={onBack} />
        
        {/* 內容 */}
        {activeTab === 'vendor' && <VendorInfoForm />}
        {activeTab === 'sales' && (
          <SalesAccountForm 
            onAccountClick={onAccountClick} 
            pendingVendorApproval={pendingVendorApproval}
            onClearPendingApproval={onClearPendingApproval}
          />
        )}
        {activeTab === 'contacts' && <VendorContactsForm />}
      </div>
    </div>
  );
}

export function VendorDetailPage({ currentPage, onPageChange, onLogout, onBack, defaultTab, userRole, pendingVendorApproval, onClearPendingApproval }: VendorDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab || 'vendor');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const vendorName = '久廣'; // 廠商簡稱
  
  // 使用 localStorage 儲存每個帳號的設定
  const STORAGE_KEY = 'sales_account_settings';
  
  // 從 localStorage 讀取帳號設定
  const getAccountSettings = (accountId: string) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const allSettings = JSON.parse(saved);
      return allSettings[accountId];
    }
    return null;
  };
  
  // 保存帳號設定到 localStorage
  const saveAccountSettings = (accountId: string, settings: any) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const allSettings = saved ? JSON.parse(saved) : {};
    allSettings[accountId] = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  };

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="廠商帳號管理"
      breadcrumb="帳號管理 • 廠商帳號管理 • 廠商資訊"
    >
      {/* C區：廠商詳細資訊 */}
      <ContentArea 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onBack={onBack} 
        onAccountClick={setSelectedAccount}
        pendingVendorApproval={pendingVendorApproval}
        onClearPendingApproval={onClearPendingApproval}
      />

      {/* Overlay - 浮在整個頁面上方 */}
      {selectedAccount && (
        <SalesAccountDetailOverlay
          email={selectedAccount.email}
          name={selectedAccount.name}
          code={selectedAccount.id}
          vendorName={vendorName}
          initialData={getAccountSettings(selectedAccount.id)}
          onClose={() => setSelectedAccount(null)}
          onSave={(data) => {
            // 保存設定到 localStorage
            saveAccountSettings(selectedAccount.id, data);
            
            // 更新業務帳號列表中的資料
            const accountsList = localStorage.getItem('sales_accounts_list');
            if (accountsList) {
              const accounts = JSON.parse(accountsList);
              const accountIndex = accounts.findIndex((acc: any) => acc.id === selectedAccount.id);
              
              if (accountIndex !== -1) {
                // 組合業務角色字串
                const rolesStr = data.roles.join('、');
                
                // 組合採購組織字串
                const orgsStr = data.organizations.join('、');
                
                // 組合採購群組字串
                const groupsStr = data.purchaseGroups
                  .map((group: any) => group.groupCode)
                  .filter((g: string) => g)
                  .join('、');
                
                // 更新帳號資料
                accounts[accountIndex] = {
                  ...accounts[accountIndex],
                  role: rolesStr,
                  purchaseOrg: orgsStr,
                  purchaseGroup: groupsStr
                };
                
                // 保存回 localStorage
                localStorage.setItem('sales_accounts_list', JSON.stringify(accounts));
                
                // 觸發一個自訂事件來通知 SalesAccountForm 更新
                window.dispatchEvent(new Event('salesAccountsUpdated'));
              }
            }
            
            alert(`設定已儲存！\n角色: ${data.roles.join(', ')}\n組織: ${data.organizations.length}個\n群組: ${data.purchaseGroups.length}筆`);
          }}
        />
      )}
    </ResponsivePageLayout>
  );
}