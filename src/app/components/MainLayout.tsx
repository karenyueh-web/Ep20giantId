import { NavigationList } from './NavigationList';
import imgStack from "figma:asset/1a64bb29b96d52f74d342ea173c7a5a5756e6710.png";
import svgPaths from "@/imports/svg-d84x18jyny";
import { useState } from 'react';

// 頁面類型定義
export type PageType =
  // ── OVERVIEW ──
  | 'dashboard' | 'announcement' | 'online-chat'
  | 'receiving-inquiry' | 'schedule-inquiry'
  | 'vendor-account-review'
  // ── MANAGEMENT > 訂單管理 ──
  | 'order-list' | 'order-forecast' | 'order-exchange' | 'order-return' | 'order-history'
  | 'order-schedule-change'
  // ── MANAGEMENT > 修正單管理 ──
  | 'correction-create' | 'correction-list' | 'correction-history'
  // ── MANAGEMENT > 出貨單 ──
  | 'shipping-create' | 'shipping-list' | 'shipping-packing' | 'shipping-print' | 'shipping-settings'
  // ── MANAGEMENT > 發票作業 ──
  | 'invoice-create' | 'invoice-list' | 'invoice-settings'
  // ── MANAGEMENT > 零件/索樣維護 ──
  | 'parts-maintain' | 'parts-quote' | 'parts-sample'
  // ── MANAGEMENT > 品保作業 ──
  | 'quality-abnormal' | 'quality-report' | 'quality-hazard' | 'quality-other'
  // ── MANAGEMENT > 產險 / 新零件 / 廠商評價 / ESG / 出貨台灣 ──
  | 'insurance-maintain'
  | 'newparts-project' | 'newparts-settings'
  | 'vendor-evaluation'
  | 'esg-material' | 'esg-maintain'
  | 'shipment-tw-order' | 'shipment-tw-shipping' | 'shipment-tw-print'
  // ── MANAGEMENT > 帳號管理 ──
  | 'vendor-account-management' | 'giant-account-management'
  // ── 個人設定 ──
  | 'personal-settings';

// MainLayout組件
interface MainLayoutProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
}

// 頂部Stack組件（GIANT GROUP Logo）
function Stack() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="stack">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStack} />
      <div className="size-full" />
    </div>
  );
}

// 語言選擇器組件
function LanguageSelector() {
  const [language, setLanguage] = useState<'繁中' | 'English'>('繁中');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-[176px]">
      {/* 語言選擇按鈕 */}
      <div 
        className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] cursor-pointer hover:bg-[#f4f6f8] transition-colors border border-[#1c252e] border-solid"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
            <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">
              {language}
            </p>
            <div className="relative shrink-0 size-[16px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <g>
                  <path d={svgPaths.p15e72a00} fill="#1C252E" />
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
            <div 
              className={`px-[12px] py-[8px] cursor-pointer hover:bg-[#f4f6f8] transition-colors ${language === '繁中' ? 'bg-[rgba(0,94,184,0.08)]' : ''}`}
              onClick={() => {
                setLanguage('繁中');
                setIsOpen(false);
              }}
            >
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">繁中</p>
            </div>
            <div 
              className={`px-[12px] py-[8px] cursor-pointer hover:bg-[#f4f6f8] transition-colors ${language === 'English' ? 'bg-[rgba(0,94,184,0.08)]' : ''}`}
              onClick={() => {
                setLanguage('English');
                setIsOpen(false);
              }}
            >
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e]">English</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 左側導航欄組件
function NavVertical({ currentPage, onPageChange, onLogout }: MainLayoutProps) {
  return (
    <div className="absolute bg-[#2B2B2B] left-0 top-0 h-[1024px] w-[280px]" data-name="NavVertical">
      <div className="content-stretch flex flex-col items-center overflow-y-auto overflow-x-hidden custom-scrollbar pb-[40px] pt-0 px-[16px] relative rounded-[inherit] w-full h-full">
        <Stack />
        {/* 使用統一的 NavigationList 組件，它已經包含了用戶信息、語言選擇器和所有導航項目 */}
        <NavigationList currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} />
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.12)] border-r border-solid inset-0 pointer-events-none" />
    </div>
  );
}

// 右側內容區域組件
function ContentArea({ currentPage }: { currentPage: PageType }) {
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="size-full">
            {/* Dashboard內容將在這裡渲染 */}
            <div className="p-8">
              <h1 className="text-2xl font-bold text-[#1c252e]">Dashboard</h1>
              <p className="mt-4 text-[#637381]">Dashboard頁面內容</p>
            </div>
          </div>
        );
      case 'announcement':
        return (
          <div className="size-full">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-[#1c252e]">公佈欄</h1>
              <p className="mt-4 text-[#637381]">公佈欄頁面內容（待開發）</p>
            </div>
          </div>
        );
      case 'online-chat':
        return (
          <div className="size-full">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-[#1c252e]">Online Chat</h1>
              <p className="mt-4 text-[#637381]">Online Chat頁面內容（待開發）</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute left-[280px] top-0 right-0 h-[1024px] bg-[#f5f5f7]">
      {renderContent()}
    </div>
  );
}

export function MainLayout({ currentPage, onPageChange, onLogout }: MainLayoutProps) {
  return (
    <div className="relative size-full bg-[#f5f5f7] overflow-hidden">
      <NavVertical currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} />
      <ContentArea currentPage={currentPage} />
    </div>
  );
}