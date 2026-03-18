import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import svgPaths from "@/imports/svg-d84x18jyny";
import type { PageType } from './MainLayout';
import imgImgAvatar25 from "figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import Settings from "@/imports/Settings";
import { mockVendorsSuccess, mockVendorsFail } from '@/imports/廠商帳號審核-4007-9767';
import { useLanguage, type Language } from './LanguageContext';
import { useSidebar } from './SidebarContext';

// 用戶頭像組件
function Img() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.25">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#dad0fc] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar25} />
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="bg-[#dfe3e8] content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img />
    </div>
  );
}

// 語言選擇器組件
function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languageOptions: { value: Language; label: string }[] = [
    { value: '繁中', label: '繁中' },
    { value: '簡中', label: '簡中' },
    { value: 'English', label: 'English' },
  ];

  return (
    <div className="relative w-full">
      {/* 語言選擇按鈕 - 白框白字 */}
      <div 
        className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-white border-solid"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
            <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-white text-[14px]">
              {language}
            </p>
            <div className="relative shrink-0 size-[16px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <g id="icons/solid/ic-eva:arrow-ios-downward-fill">
                  <path d={svgPaths.p2b32f00} fill="white" id="primary-shape" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 下拉選單 */}
      {isOpen && (
        <>
          {/* 遮罩層 */}
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)}
          />
          {/* 選單內容 */}
          <div className="absolute top-full left-0 right-0 mt-[4px] bg-white rounded-[8px] shadow-lg border border-[rgba(145,158,171,0.16)] z-[101] overflow-hidden">
            {languageOptions.map((opt) => (
              <div
                key={opt.value}
                className={`px-[12px] py-[8px] cursor-pointer hover:bg-[#f4f6f8] transition-colors ${language === opt.value ? 'bg-[rgba(0,94,184,0.08)]' : ''}`}
                onClick={() => {
                  setLanguage(opt.value);
                  setIsOpen(false);
                }}
              >
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">{opt.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// 用戶信息組件
interface UserInfoProps {
  onPageChange: (page: PageType) => void;
}

function UserInfo({ onPageChange }: UserInfoProps) {
  // 從 localStorage 讀取當前用戶資訊
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 'g00106917@giant.com';
  const currentUserRole = localStorage.getItem('currentUserRole') || '巨大角色';
  
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full mb-[8px]" data-name="採購角色">
      <Avatar />
      <div className="content-stretch flex flex-col gap-[8px] items-center pb-[16px] pt-[12px] px-0 relative shrink-0 w-full" data-name="stack">
        <p className="css-ew64yg font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic overflow-hidden relative shrink-0 text-[rgb(255,255,255)] text-[14px] text-center text-ellipsis">{currentUserRole}</p>
        <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] overflow-hidden relative shrink-0 text-white text-[14px] text-center text-ellipsis">{currentUserEmail}</p>
        
        {/* 兩個按鈕容器 */}
        <div className="content-stretch flex flex-row gap-[8px] items-center relative shrink-0 w-[176px]">
          {/* My Setting 按鈕 - 白底黑色圖標 */}
          <button 
            onClick={() => onPageChange('personal-settings')}
            className="flex-1 min-h-px min-w-px relative rounded-[8px] cursor-pointer bg-white hover:bg-[#f0f0f0] transition-colors border border-white border-solid py-[6px] px-[12px] flex items-center justify-center"
          >
            <div className="size-[20px]">
              <Settings />
            </div>
          </button>
          
          {/* 語言選擇器按鈕 - 白框白字 */}
          <div className="flex-1">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  );
}

// 基礎Icon組件
function DashboardIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <g id="secondary-shape" opacity="0.4">
            <path d={svgPaths.p221baf80} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p1ed75400} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p2e5eca80} fill="var(--fill-0, #637381)" />
          </g>
          <path d={svgPaths.p355b77f0} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function AnnouncementIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path clipRule="evenodd" d={svgPaths.p1708dd00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="secondary-shape" opacity="0.4" />
          <g id="primary-shape">
            <path d={svgPaths.p2026eb00} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p1460cf80} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.pd033800} fill="var(--fill-0, #637381)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function OrderIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d={svgPaths.p30038d00} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <path d={svgPaths.p24a8a480} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function CorrectOrderIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d={svgPaths.pfe11980} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <g id="primary-shape">
            <path d={svgPaths.p20335180} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p262dc180} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p30de4e00} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p3193ba00} fill="var(--fill-0, #637381)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ShippingIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path clipRule="evenodd" d={svgPaths.p371b4a80} fill="var(--fill-0, #637381)" fillRule="evenodd" id="secondary-shape" opacity="0.4" />
          <g id="primary-shape">
            <path d={svgPaths.p2619b700} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p18478a00} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p7a25e80} fill="var(--fill-0, #637381)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function InvoiceIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path clipRule="evenodd" d={svgPaths.p17dbb400} fill="var(--fill-0, #637381)" fillRule="evenodd" id="secondary-shape" opacity="0.4" />
          <g id="primary-shape">
            <path d={svgPaths.p3aaaa000} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p1607c00} fill="var(--fill-0, #637381)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function AccountIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <g id="secondary-shape" opacity="0.4">
            <path d={svgPaths.p2081df40} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p13464000} fill="var(--fill-0, #637381)" />
          </g>
          <rect fill="var(--fill-0, #637381)" height="8" id="primary-shape" rx="2" width="8" x="2" y="4" />
        </g>
      </svg>
    </div>
  );
}

function VendorApprovalIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <g id="secondary-shape" opacity="0.4">
            <path d={svgPaths.p2081df40} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p13464000} fill="var(--fill-0, #637381)" />
          </g>
          <rect fill="var(--fill-0, #637381)" height="8" id="primary-shape" rx="2" width="8" x="2" y="4" />
        </g>
      </svg>
    </div>
  );
}

function PartsIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d={svgPaths.p13c08680} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <path d={svgPaths.p3ff3d80} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function InsuranceIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d={svgPaths.p2089f300} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <path d={svgPaths.p15dd3c80} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function QualityIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="var(--fill-0, #637381)" opacity="0.4" />
          <path d="M10.5 13l-2-2-1.41 1.41L10.5 15.83l6-6L15.09 8.41z" fill="var(--fill-0, #637381)" />
        </g>
      </svg>
    </div>
  );
}

function ReceivingIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d={svgPaths.p30038d00} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <path d={svgPaths.p24a8a480} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function ScheduleIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d={svgPaths.p30038d00} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <path d={svgPaths.p24a8a480} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill">
          <path d={svgPaths.p2b32f00} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-forward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-forward-fill">
          <path d={svgPaths.p30b81800} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

// 選單項目組件
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  hasSubmenu?: boolean;
  isActive?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, badge, hasSubmenu, isActive, isExpanded, onClick }: NavItemProps) {
  return (
    <div 
      className={`min-h-[44px] relative rounded-[8px] shrink-0 w-full cursor-pointer transition-colors ${
        isActive ? 'bg-[rgba(255,184,0,0.15)]' : 'bg-[rgba(255,255,255,0)] hover:bg-[rgba(255,184,0,0.08)]'
      }`}
      data-name="NavVertical/Item"
      onClick={onClick}
      style={{
        ['--fill-0' as any]: '#FFB800'
      }}
    >
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
            {icon}
          </div>
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
            <div className="flex flex-col items-center justify-center size-full">
              <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
                <div className={`css-g0mm18 flex flex-col font-['Public_Sans:${isActive ? 'SemiBold' : 'Medium'}',sans-serif] ${isActive ? 'font-semibold' : 'font-medium'} justify-center leading-[0] overflow-hidden relative shrink-0 ${isActive ? 'text-[#ffb800]' : 'text-[#a8aeb3]'} text-[14px] text-ellipsis w-full`}>
                  <p className="css-g0mm18 leading-[22px] overflow-hidden">{label}</p>
                </div>
              </div>
            </div>
          </div>
          {badge && (
            <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ info">
              <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">{badge}</p>
            </div>
          )}
          {hasSubmenu && (
            <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
              {isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 子選單項目組件
interface SubMenuItemProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  page?: PageType;
  onNavigate?: (page: PageType) => void;
}

function SubMenuItem({ label, isActive, onClick, page, onNavigate }: SubMenuItemProps) {
  const handleClick = onClick ?? (page && onNavigate ? () => onNavigate(page) : undefined);
  return (
    <div 
      className={`min-h-[40px] relative rounded-[8px] shrink-0 w-full cursor-pointer transition-colors ${
        isActive ? 'bg-[rgba(255,184,0,0.12)]' : 'bg-[rgba(255,255,255,0)] hover:bg-[rgba(255,184,0,0.05)]'
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[48px] pr-[8px] py-[4px] relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative">
            <div className="flex flex-col items-center justify-center size-full">
              <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
                <div className={`css-g0mm18 flex flex-col font-['Public_Sans:${isActive ? 'SemiBold' : 'Regular'}',sans-serif] ${isActive ? 'font-semibold' : 'font-normal'} justify-center leading-[0] overflow-hidden relative shrink-0 ${isActive ? 'text-[#ffc933]' : 'text-[#8a9099]'} hover:text-white text-[13px] text-ellipsis w-full transition-colors`}>
                  <p className="css-g0mm18 leading-[20px] overflow-hidden">{label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mini NavItem ────────────────────────────────────────────────────────────
interface NavItemMiniProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
  onClick?: () => void;
}

function NavItemMini({ icon, label, isActive, hasSubmenu, onClick }: NavItemMiniProps) {
  return (
    <div
      className={`relative flex flex-col items-center gap-[5px] h-[58px] justify-end pb-[6px] pt-[8px] rounded-[8px] w-full cursor-pointer transition-colors ${
        isActive ? 'bg-[rgba(255,184,0,0.15)]' : 'hover:bg-[rgba(255,184,0,0.08)]'
      }`}
      onClick={onClick}
      style={{ ['--fill-0' as any]: isActive ? '#FFB800' : '#637381' }}
    >
      {/* Submenu arrow indicator */}
      {hasSubmenu && (
        <div className="absolute top-[7px] right-[6px]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3.5 2.5L6.5 5L3.5 7.5" stroke="#637381" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      {/* Icon */}
      <div className="shrink-0">
        {icon}
      </div>
      {/* Label */}
      <span
        className={`text-[10px] text-center leading-[14px] overflow-hidden text-ellipsis whitespace-nowrap w-full px-[4px] ${
          isActive ? 'text-[#ffb800]' : 'text-[#8a9099]'
        }`}
        style={{ fontFamily: "'Public_Sans:Medium', sans-serif", fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── Mini Flyout data ────────────────────────────────────────────────────────
const MINI_SUBMENUS: Record<string, { label: string; page?: PageType }[]> = {
  order: [
    { label: '一般訂單查詢',  page: 'order-list' },
    { label: '換貨(J)單據查詢',  page: 'order-exchange' },
    { label: '退貨單據查詢',  page: 'order-return' },
    { label: '預測訂單查詢',  page: 'order-forecast' },
    { label: '變更生管排程',  page: 'order-schedule-change' },
    { label: '歷史訂單查詢',  page: 'order-history' },
  ],
  correction: [
    { label: '建立修正單',    page: 'correction-create' },
    { label: '修正單查詢',    page: 'correction-list' },
  ],
  shipping: [
    { label: '建立出貨單',    page: 'shipping-create' },
    { label: '出貨單查詢',    page: 'shipping-list' },
    { label: '出貨/裝箱明細',page: 'shipping-packing' },
    { label: '列印單據',      page: 'shipping-print' },
    { label: '基本設定',      page: 'shipping-settings' },
  ],
  invoice: [
    { label: '開立發票',      page: 'invoice-create' },
    { label: '發票查詢',      page: 'invoice-list' },
    { label: '發票設定',      page: 'invoice-settings' },
  ],
  parts: [
    { label: '零件資訊維護',  page: 'parts-maintain' },
    { label: '列印報價單',    page: 'parts-quote' },
    { label: '索樣單',        page: 'parts-sample' },
  ],
  quality: [
    { label: '品質異常單',    page: 'quality-abnormal' },
    { label: '檢驗/測試報告',page: 'quality-report' },
    { label: '危害物質管理',  page: 'quality-hazard' },
    { label: '其他設定',      page: 'quality-other' },
  ],
  newparts: [
    { label: '新零件專案維護',page: 'newparts-project' },
    { label: '專案設定',      page: 'newparts-settings' },
  ],
  esg: [
    { label: '物料成分總檔',  page: 'esg-material' },
    { label: '材料維護',      page: 'esg-maintain' },
  ],
  'shipment-tw': [
    { label: '訂單查詢',      page: 'shipment-tw-order' },
    { label: '出貨單查詢',    page: 'shipment-tw-shipping' },
    { label: '列印外箱貼紙',  page: 'shipment-tw-print' },
  ],
  account: [
    { label: '廠商帳號管理',  page: 'vendor-account-management' },
    { label: '巨大帳號管理',  page: 'giant-account-management' },
  ],
};

// ─── Mini Flyout Panel (rendered via portal) ─────────────────────────────────
interface MiniNavFlyoutProps {
  menuId: string;
  label: string;
  top: number;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MiniNavFlyout({ menuId, label, top, currentPage, onNavigate, onMouseEnter, onMouseLeave }: MiniNavFlyoutProps) {
  const items = MINI_SUBMENUS[menuId] ?? [];
  return createPortal(
    <div
      className="fixed z-[500] overflow-hidden"
      style={{ left: 94, top }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Card */}
      <div
        className="bg-[#1a2230] rounded-[10px] shadow-[0_8px_40px_rgba(0,0,0,0.55)] border border-[rgba(255,255,255,0.07)] overflow-hidden"
        style={{ minWidth: 196 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[14px] pt-[11px] pb-[10px] border-b border-[rgba(255,255,255,0.07)]">
          <p
            className="text-white text-[13px] leading-[18px]"
            style={{ fontFamily: "'Public_Sans:SemiBold',sans-serif", fontWeight: 600 }}
          >
            {label}
          </p>
          {/* Small chevron-right decoration */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Sub-items */}
        {items.map((item, idx) => {
          const isActive = !!(item.page && currentPage === item.page);
          const clickable = !!item.page;
          return (
            <div
              key={idx}
              className={`flex items-center gap-[10px] px-[14px] py-[9px] transition-colors ${
                isActive
                  ? 'bg-[rgba(255,184,0,0.13)]'
                  : clickable
                    ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.06)]'
                    : 'opacity-40 cursor-not-allowed'
              }`}
              onClick={() => clickable && onNavigate(item.page!)}
            >
              <div
                className={`size-[5px] rounded-full shrink-0 transition-colors ${
                  isActive ? 'bg-[#FFB800]' : 'bg-[#4a5568]'
                }`}
              />
              <p
                className={`text-[13px] leading-[20px] transition-colors ${
                  isActive ? 'text-[#FFB800]' : 'text-[#a8aeb3] hover:text-white'
                }`}
                style={{ fontFamily: isActive ? "'Public_Sans:SemiBold',sans-serif" : "'Public_Sans:Regular',sans-serif", fontWeight: isActive ? 600 : 400 }}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
      {/* Left connector triangle */}
      <div
        className="absolute top-[16px] -left-[7px] w-0 h-0"
        style={{
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderRight: '7px solid rgba(255,255,255,0.07)',
        }}
      />
      <div
        className="absolute top-[17px] -left-[6px] w-0 h-0"
        style={{
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '6px solid #1a2230',
        }}
      />
    </div>,
    document.body
  );
}

// ─── Mini item wrapper with hover-flyout ─────────────────────────────────────
interface MiniSubmenuItemProps {
  menuId: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onShow: (menuId: string, label: string, rect: DOMRect) => void;
  onHide: () => void;
}

function MiniSubmenuItem({ menuId, icon, label, isActive, onShow, onHide }: MiniSubmenuItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="w-full"
      onMouseEnter={() => ref.current && onShow(menuId, label, ref.current.getBoundingClientRect())}
      onMouseLeave={onHide}
    >
      <NavItemMini icon={icon} label={label} isActive={isActive} hasSubmenu />
    </div>
  );
}

// ─── Mini Nav Layout (manages flyout state) ───────────────────────────────────
interface MiniNavLayoutProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
}

function MiniNavLayout({ currentPage, onPageChange, onLogout }: MiniNavLayoutProps) {
  const [flyout, setFlyout] = useState<{ menuId: string; label: string; top: number } | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFlyout = useCallback((menuId: string, label: string, rect: DOMRect) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const items = MINI_SUBMENUS[menuId] ?? [];
    const flyoutHeight = items.length * 38 + 50;
    const top = Math.max(8, Math.min(rect.top, window.innerHeight - flyoutHeight - 16));
    setFlyout({ menuId, label, top });
  }, []);

  const startHide = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setFlyout(null), 130);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => {
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  const handleNavigate = useCallback((page: PageType) => {
    onPageChange(page);
    setFlyout(null);
  }, [onPageChange]);

  return (
    <div className="flex flex-col gap-[4px] items-center w-full px-[4px]" data-name="list-mini">
      {/* Direct nav items (no submenu) */}
      <NavItemMini icon={<VendorApprovalIcon />} label="廠商審核" isActive={currentPage === 'vendor-account-review'} onClick={() => onPageChange('vendor-account-review')} />
      <NavItemMini icon={<DashboardIcon />} label="Dashboard" isActive={currentPage === 'dashboard'} onClick={() => onPageChange('dashboard')} />
      <NavItemMini icon={<AnnouncementIcon />} label="公佈欄" isActive={currentPage === 'announcement'} onClick={() => onPageChange('announcement')} />
      <NavItemMini icon={<AnnouncementIcon />} label="Online Chat" isActive={currentPage === 'online-chat'} onClick={() => onPageChange('online-chat')} />
      <NavItemMini icon={<ReceivingIcon />} label="收料查詢" isActive={currentPage === 'receiving-inquiry'} onClick={() => onPageChange('receiving-inquiry')} />
      <NavItemMini icon={<ScheduleIcon />} label="排程查詢" isActive={currentPage === 'schedule-inquiry'} onClick={() => onPageChange('schedule-inquiry')} />

      <div className="w-full h-px bg-[rgba(145,158,171,0.12)] my-[4px]" />

      {/* Submenu items — hover reveals flyout */}
      <MiniSubmenuItem menuId="order" icon={<OrderIcon />} label="訂單管理" isActive={['order-list','order-forecast','order-exchange','order-return'].includes(currentPage)} onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="correction" icon={<CorrectOrderIcon />} label="修正單" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="shipping" icon={<ShippingIcon />} label="出貨單" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="invoice" icon={<InvoiceIcon />} label="發票作業" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="parts" icon={<PartsIcon />} label="零件維護" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="quality" icon={<QualityIcon />} label="品保作業" isActive={currentPage === 'quality-abnormal'} onShow={showFlyout} onHide={startHide} />
      <NavItemMini icon={<InsuranceIcon />} label="產險維護" onClick={() => {}} />
      <MiniSubmenuItem menuId="newparts" icon={<PartsIcon />} label="新零件" onShow={showFlyout} onHide={startHide} />
      <NavItemMini icon={<QualityIcon />} label="廠商評價" onClick={() => {}} />
      <MiniSubmenuItem menuId="esg" icon={<InsuranceIcon />} label="ESG" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="shipment-tw" icon={<ShippingIcon />} label="出貨台灣" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="account" icon={<AccountIcon />} label="帳號管理" isActive={['vendor-account-management','giant-account-management'].includes(currentPage)} onShow={showFlyout} onHide={startHide} />

      {/* Logout */}
      {onLogout && (
        <div className="mt-[8px] w-full">
          <button onClick={onLogout} className="w-full h-[40px] bg-[rgba(183,29,24,0.15)] hover:bg-[rgba(183,29,24,0.25)] rounded-[8px] transition-colors cursor-pointer flex items-center justify-center" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7Z" fill="#b71d18"/>
              <path d="M4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="#b71d18" opacity="0.6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Flyout portal */}
      {flyout && (
        <MiniNavFlyout
          menuId={flyout.menuId}
          label={flyout.label}
          top={flyout.top}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onMouseEnter={cancelHide}
          onMouseLeave={startHide}
        />
      )}
    </div>
  );
}

// 主導航列表組件
interface NavigationListProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  isMini?: boolean;
}

export function NavigationList({ currentPage, onPageChange, onLogout, isMini = false }: NavigationListProps) {
  const { open } = useSidebar();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // 根據當前頁面自動展開相應的菜單
    const autoExpanded: string[] = [];
    
    if (['order-list', 'order-forecast', 'order-exchange', 'order-return'].includes(currentPage)) {
      autoExpanded.push('order');
    }
    if (currentPage === 'quality-abnormal') {
      autoExpanded.push('quality');
    }
    
    return autoExpanded;
  });

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // When in mini mode, clicking a submenu parent expands the sidebar + opens the menu
  const handleMiniSubmenuClick = (menuId: string) => {
    open();
    setExpandedMenus(prev =>
      prev.includes(menuId) ? prev : [...prev, menuId]
    );
  };

  // 計算廠商帳號審核的總數量
  const vendorAccountReviewCount = mockVendorsSuccess.length + mockVendorsFail.length;
  const vendorAccountReviewBadge = vendorAccountReviewCount > 0 ? `${vendorAccountReviewCount}` : undefined;

  // ── MINI layout ──────────────────────────────────────────────────────────
  if (isMini) {
    return (
      <MiniNavLayout
        currentPage={currentPage}
        onPageChange={onPageChange}
        onLogout={onLogout}
      />
    );
  }

  // ── FULL layout ───────────────────────────────────────────────────────────
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="list">
      {/* 用戶信息區塊 - 包含頭像、角色、email和語言選擇器 */}
      <UserInfo onPageChange={onPageChange} />
      
      {/* OVERVIEW 區塊 */}
      <div className="relative shrink-0 w-full" data-name="subheader">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center pb-[8px] pl-[12px] pr-0 pt-[16px] relative w-full">
            <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#919eab] text-[11px] uppercase">OVERVIEW</p>
          </div>
        </div>
      </div>
      
      {/* 新增：廠商帳號審核 */}
      <NavItem 
        icon={<VendorApprovalIcon />} 
        label="廠商帳號審核" 
        isActive={currentPage === 'vendor-account-review'}
        onClick={() => onPageChange('vendor-account-review')}
        badge={vendorAccountReviewBadge}
      />
      
      <NavItem 
        icon={<DashboardIcon />} 
        label="Dashboard" 
        badge="32+" 
        isActive={currentPage === 'dashboard'}
        onClick={() => onPageChange('dashboard')}
      />
      <NavItem 
        icon={<AnnouncementIcon />} 
        label="公佈欄" 
        badge="32+" 
        isActive={currentPage === 'announcement'}
        onClick={() => onPageChange('announcement')}
      />
      <NavItem 
        icon={<AnnouncementIcon />} 
        label="online chat" 
        badge="32+" 
        isActive={currentPage === 'online-chat'}
        onClick={() => onPageChange('online-chat')}
      />
      
      {/* 新增：收料查詢 */}
      <NavItem 
        icon={<ReceivingIcon />} 
        label="收料查詢" 
        isActive={currentPage === 'receiving-inquiry'}
        onClick={() => onPageChange('receiving-inquiry')}
      />
      
      {/* 新增：訂單排程查詢 */}
      <NavItem 
        icon={<ScheduleIcon />} 
        label="訂單排程查詢" 
        isActive={currentPage === 'schedule-inquiry'}
        onClick={() => onPageChange('schedule-inquiry')}
      />

      {/* MANAGEMENT 區塊 */}
      <div className="relative shrink-0 w-full" data-name="subheader">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center pb-[8px] pl-[12px] pr-0 pt-[16px] relative w-full">
            <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#919eab] text-[11px] uppercase">Management</p>
          </div>
        </div>
      </div>

      {/* 1. 訂單管理 */}
      <div className="w-full">
        <NavItem 
          icon={<OrderIcon />} 
          label="訂單管理" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('order')}
          onClick={() => toggleMenu('order')}
        />
        {expandedMenus.includes('order') && (
          <div className="w-full">
            <SubMenuItem 
              label="一般訂單查詢" 
              isActive={currentPage === 'order-list'}
              onClick={() => onPageChange('order-list')} 
            />
            <SubMenuItem 
              label="換貨(J)單據查詢" 
              isActive={currentPage === 'order-exchange'}
              onClick={() => onPageChange('order-exchange')} 
            />
            <SubMenuItem 
              label="退貨單據查詢" 
              isActive={currentPage === 'order-return'}
              onClick={() => onPageChange('order-return')} 
            />
            <SubMenuItem 
              label="預測訂單查詢" 
              isActive={currentPage === 'order-forecast'}
              onClick={() => onPageChange('order-forecast')} 
            />
            {/* 新增子功能 */}
            <SubMenuItem label="變更生管排程" page="order-schedule-change" onNavigate={onPageChange} isActive={currentPage === 'order-schedule-change'} />
            <SubMenuItem label="歷史訂單查詢" isActive={currentPage === 'order-history'} onClick={() => onPageChange('order-history')} />
          </div>
        )}
      </div>

      {/* 2. 修正單管理 */}
      <div className="w-full">
        <NavItem 
          icon={<CorrectOrderIcon />} 
          label="修正單管理" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('correction')}
          onClick={() => toggleMenu('correction')}
        />
        {expandedMenus.includes('correction') && (
          <div className="w-full">
            <SubMenuItem label="建立修正單" page="correction-create" onNavigate={onPageChange} isActive={currentPage === 'correction-create'} />
            <SubMenuItem label="修正單查詢" page="correction-list" onNavigate={onPageChange} isActive={currentPage === 'correction-list'} />
          </div>
        )}
      </div>

      {/* 3. 出貨單 */}
      <div className="w-full">
        <NavItem 
          icon={<ShippingIcon />} 
          label="出貨單" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('shipping')}
          onClick={() => toggleMenu('shipping')}
        />
        {expandedMenus.includes('shipping') && (
          <div className="w-full">
            <SubMenuItem label="建立出貨單" page="shipping-create" onNavigate={onPageChange} isActive={currentPage === 'shipping-create'} />
            <SubMenuItem label="出貨單查詢" page="shipping-list" onNavigate={onPageChange} isActive={currentPage === 'shipping-list'} />
            <SubMenuItem label="出貨/裝箱明細" page="shipping-packing" onNavigate={onPageChange} isActive={currentPage === 'shipping-packing'} />
            <SubMenuItem label="列印單據" page="shipping-print" onNavigate={onPageChange} isActive={currentPage === 'shipping-print'} />
            {/* 新增子功能 */}
            <SubMenuItem label="基本設定" page="shipping-settings" onNavigate={onPageChange} isActive={currentPage === 'shipping-settings'} />
          </div>
        )}
      </div>

      {/* 4. 發票作業 */}
      <div className="w-full">
        <NavItem 
          icon={<InvoiceIcon />} 
          label="發票作業" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('invoice')}
          onClick={() => toggleMenu('invoice')}
        />
        {expandedMenus.includes('invoice') && (
          <div className="w-full">
            <SubMenuItem label="開立發票" page="invoice-create" onNavigate={onPageChange} isActive={currentPage === 'invoice-create'} />
            <SubMenuItem label="發票查詢" page="invoice-list" onNavigate={onPageChange} isActive={currentPage === 'invoice-list'} />
            {/* 新增子功能 */}
            <SubMenuItem label="發票設定" page="invoice-settings" onNavigate={onPageChange} isActive={currentPage === 'invoice-settings'} />
          </div>
        )}
      </div>

      {/* 5. 零件/索樣維護 */}
      <div className="w-full">
        <NavItem 
          icon={<PartsIcon />} 
          label="零件/索樣維護" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('parts')}
          onClick={() => toggleMenu('parts')}
        />
        {expandedMenus.includes('parts') && (
          <div className="w-full">
            <SubMenuItem label="零件資訊維護" page="parts-maintain" onNavigate={onPageChange} isActive={currentPage === 'parts-maintain'} />
            <SubMenuItem label="列印報價單" page="parts-quote" onNavigate={onPageChange} isActive={currentPage === 'parts-quote'} />
            {/* 新增子功能 */}
            <SubMenuItem label="索樣單" page="parts-sample" onNavigate={onPageChange} isActive={currentPage === 'parts-sample'} />
          </div>
        )}
      </div>

      {/* 6. 品保作業 */}
      <div className="w-full">
        <NavItem 
          icon={<QualityIcon />} 
          label="品保作業" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('quality')}
          onClick={() => toggleMenu('quality')}
        />
        {expandedMenus.includes('quality') && (
          <div className="w-full">
            <SubMenuItem 
              label="品質異常單" 
              isActive={currentPage === 'quality-abnormal'}
              onClick={() => onPageChange('quality-abnormal')}
              page="quality-abnormal"
            />
            <SubMenuItem label="檢驗/測試報告" page="quality-report" onNavigate={onPageChange} isActive={currentPage === 'quality-report'} />
            <SubMenuItem label="危害物質管理" page="quality-hazard" onNavigate={onPageChange} isActive={currentPage === 'quality-hazard'} />
            {/* 新增子功能 */}
            <SubMenuItem label="其他設定" page="quality-other" onNavigate={onPageChange} isActive={currentPage === 'quality-other'} />
          </div>
        )}
      </div>

      {/* 7. 產險資料維護 */}
      <NavItem 
        icon={<InsuranceIcon />} 
        label="產險資料維護" 
      />

      {/* 8. 新零件維護 */}
      <div className="w-full">
        <NavItem 
          icon={<PartsIcon />} 
          label="新零件維護" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('newparts')}
          onClick={() => toggleMenu('newparts')}
        />
        {expandedMenus.includes('newparts') && (
          <div className="w-full">
            <SubMenuItem label="新零件專案維護" page="newparts-project" onNavigate={onPageChange} isActive={currentPage === 'newparts-project'} />
            <SubMenuItem label="專案設定" page="newparts-settings" onNavigate={onPageChange} isActive={currentPage === 'newparts-settings'} />
          </div>
        )}
      </div>

      {/* 9. 廠商評價 */}
      <NavItem 
        icon={<QualityIcon />} 
        label="廠商評價" 
      />

      {/* 10. ESG */}
      <div className="w-full">
        <NavItem 
          icon={<InsuranceIcon />} 
          label="ESG" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('esg')}
          onClick={() => toggleMenu('esg')}
        />
        {expandedMenus.includes('esg') && (
          <div className="w-full">
            <SubMenuItem label="物料成分總檔" page="esg-material" onNavigate={onPageChange} isActive={currentPage === 'esg-material'} />
            <SubMenuItem label="材料維護" page="esg-maintain" onNavigate={onPageChange} isActive={currentPage === 'esg-maintain'} />
          </div>
        )}
      </div>

      {/* 11. 出貨台灣捷安特 */}
      <div className="w-full">
        <NavItem 
          icon={<ShippingIcon />} 
          label="出貨台灣捷安特" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('shipment-tw')}
          onClick={() => toggleMenu('shipment-tw')}
        />
        {expandedMenus.includes('shipment-tw') && (
          <div className="w-full">
            <SubMenuItem label="訂單查詢" page="shipment-tw-order" onNavigate={onPageChange} isActive={currentPage === 'shipment-tw-order'} />
            <SubMenuItem label="出貨單查詢" page="shipment-tw-shipping" onNavigate={onPageChange} isActive={currentPage === 'shipment-tw-shipping'} />
            <SubMenuItem label="列印外箱貼紙" page="shipment-tw-print" onNavigate={onPageChange} isActive={currentPage === 'shipment-tw-print'} />
          </div>
        )}
      </div>

      {/* 12. 帳號管理 - 移到最後 */}
      <div className="w-full">
        <NavItem 
          icon={<AccountIcon />} 
          label="帳號管理" 
          hasSubmenu 
          isExpanded={expandedMenus.includes('account')}
          onClick={() => toggleMenu('account')}
        />
        {expandedMenus.includes('account') && (
          <div className="w-full">
            <SubMenuItem 
              label="廠商帳號管理" 
              isActive={currentPage === 'vendor-account-management'}
              onClick={() => onPageChange('vendor-account-management')}
              page="vendor-account-management"
            />
            <SubMenuItem 
              label="巨大帳號管理" 
              isActive={currentPage === 'giant-account-management'}
              onClick={() => onPageChange('giant-account-management')}
              page="giant-account-management"
            />
          </div>
        )}
      </div>

      {/* 登出按鈕 */}
      {onLogout && (
        <div className="mt-[16px] w-full">
          <button
            onClick={onLogout}
            className="w-full h-[48px] bg-[#ffe5e5] hover:bg-[#ffcccc] rounded-[8px] transition-colors cursor-pointer"
          >
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#b71d18] leading-[22px]">
              Logout
            </p>
          </button>
        </div>
      )}
    </div>
  );
}