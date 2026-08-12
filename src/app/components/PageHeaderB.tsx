import { useState } from 'react';
import svgPaths from "@/imports/svg-k90cvtwh8p";
import { BaseOverlay } from './BaseOverlay';

interface PageHeaderBProps {
  title: string;
  breadcrumb: string;
}

// AI Tool Icon
function StartAdornment() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="start adornment">
      <div className="absolute inset-[0_-16.67%_-33.33%_-16.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g filter="url(#filter0_d_2_19401)" id="start-adornment">
            <path d={svgPaths.p2cf2a500} fill="url(#paint0_linear_2_19401)" id="Union" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32" id="filter0_d_2_19401" width="32" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_19401" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_2_19401" mode="normal" result="shape" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_19401" x1="16" x2="16" y1="2.41703e-09" y2="24">
              <stop stopColor="#005EB8" />
              <stop offset="1" stopColor="#002A52" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// AI Tool Popover
function AIAssistantPopover({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      <div className="absolute right-0 top-[56px] z-[100] w-[420px] max-w-[calc(100vw-32px)] bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] border border-[rgba(145,158,171,0.12)]">
        <div className="p-[24px]">
          <div className="flex items-start justify-between mb-[16px]">
            <div className="flex items-center gap-[12px]">
              <div className="relative shrink-0 size-[32px]">
                <StartAdornment />
              </div>
              <div>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[16px] text-[#1c252e] leading-[24px]">
                  AI 助手
                </p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381] leading-[20px]">
                  詢問產品規格與功能
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] hover:bg-[#f4f6f8] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="bg-[#f9fafb] rounded-[12px] p-[16px] mb-[16px]">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] mb-[12px]">
              您好！我是 AI 助手，可以幫助您：
            </p>
            <ul className="space-y-[8px]">
              <li className="flex items-start gap-[8px]">
                <span className="text-[#005eb8] mt-[4px]">&#8226;</span>
                <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">查詢產品規格和技術參數</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#005eb8] mt-[4px]">&#8226;</span>
                <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">了解功能特性和使用方法</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#005eb8] mt-[4px]">&#8226;</span>
                <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">解答訂單和品質相關問題</span>
              </li>
            </ul>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="請輸入您的問題..."
              className="w-full h-[44px] px-[16px] py-[12px] border border-[rgba(145,158,171,0.2)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] placeholder:text-[#919eab] focus:outline-none focus:border-[#005eb8] transition-colors"
            />
            <button className="absolute right-[8px] top-[8px] w-[28px] h-[28px] bg-[#005eb8] rounded-[6px] flex items-center justify-center hover:bg-[#004a8f] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


// AI Pricing Overlay - 收費方案選擇
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-[2px]">
      <path d="M3 8L6.5 11.5L13 4.5" stroke="#005eb8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIconWhite() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-[2px]">
      <path d="M3 8L6.5 11.5L13 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const MONTHLY_FEATURES = [
  '無限制 AI 問答查詢',
  '訂單異常智慧分析',
  '品質報告摘要生成',
  '多語言翻譯支援（繁中/英/日）',
  '基本資料自動填入建議',
];

const YEARLY_FEATURES = [
  '無限制 AI 問答查詢',
  '訂單異常智慧分析',
  '品質報告摘要生成',
  '多語言翻譯支援（繁中/英/日）',
  '基本資料自動填入建議',
  '⭐ 優先客服支援（4 小時內回覆）',
  '⭐ 進階預測分析模組（Beta）',
];

function AIPricingOverlay({ onClose }: { onClose: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <BaseOverlay onClose={onClose} maxWidth="780px" autoHeight>
      <div className="relative w-full">
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path
              clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381"
              fillRule="evenodd"
            />
          </svg>
        </button>

        <div className="flex flex-col px-[48px] pt-[52px] pb-[40px] gap-[28px]">
          {/* 標題區 */}
          <div className="flex flex-col items-center gap-[8px]">
            {/* AI Icon */}
            <div className="relative size-[40px] mb-[4px]">
              <div className="absolute inset-[0_-16.67%_-33.33%_-16.67%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                  <g filter="url(#filter0_pricing)">
                    <path d={svgPaths.p2cf2a500} fill="url(#paint0_pricing)" />
                  </g>
                  <defs>
                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32" id="filter0_pricing" width="32" x="0" y="0">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="4" />
                      <feGaussianBlur stdDeviation="2" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow" />
                      <feBlend in="SourceGraphic" in2="effect1_dropShadow" mode="normal" result="shape" />
                    </filter>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_pricing" x1="16" x2="16" y1="2.41703e-09" y2="24">
                      <stop stopColor="#005EB8" />
                      <stop offset="1" stopColor="#002A52" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[22px] text-[#1c252e] leading-[32px] text-center">
              升級 AI 助手方案
            </p>
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] text-center">
              選擇最適合您的訂閱方案，解鎖完整 AI 功能
            </p>
          </div>

          {/* 兩張卡片 */}
          <div className="grid grid-cols-2 gap-[20px]">
            {/* ── 月繳卡片 ── */}
            <div
              className="relative rounded-[16px] border border-solid cursor-pointer transition-all duration-200 flex flex-col overflow-hidden"
              style={{
                borderColor: selectedPlan === 'monthly' ? '#005eb8' : 'rgba(145,158,171,0.24)',
                boxShadow: selectedPlan === 'monthly'
                  ? '0px 0px 0px 3px rgba(0,94,184,0.12)'
                  : '0px 2px 8px 0px rgba(145,158,171,0.12)',
              }}
              onClick={() => setSelectedPlan('monthly')}
              id="ai-plan-monthly"
            >
              {/* 頂部標籤列 */}
              <div className="h-[8px] w-full bg-[#e8f1fb]" />

              <div className="flex flex-col p-[24px] gap-[20px] flex-1">
                {/* 方案名稱 & 選中指示 */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[15px] text-[#637381] leading-[22px] uppercase tracking-[0.04em]">
                      月繳方案
                    </p>
                    <div className="flex items-baseline gap-[4px]">
                      <span className="font-['Public_Sans:Bold',sans-serif] font-bold text-[32px] text-[#1c252e] leading-[40px]">
                        NT$290
                      </span>
                      <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#919eab] leading-[22px]">
                        / 月
                      </span>
                    </div>
                  </div>
                  {/* 選中圓圈 */}
                  <div
                    className="size-[22px] rounded-full border-2 border-solid flex items-center justify-center transition-colors shrink-0"
                    style={{ borderColor: selectedPlan === 'monthly' ? '#005eb8' : 'rgba(145,158,171,0.4)' }}
                  >
                    {selectedPlan === 'monthly' && (
                      <div className="size-[11px] rounded-full bg-[#005eb8]" />
                    )}
                  </div>
                </div>

                {/* 分隔線 */}
                <div className="h-px bg-[rgba(145,158,171,0.16)]" />

                {/* 功能清單 */}
                <div className="flex flex-col gap-[10px]">
                  {MONTHLY_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-[10px]">
                      <CheckIcon />
                      <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#1c252e] leading-[22px]">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 訂閱按鈕 */}
                <button
                  className="w-full h-[40px] rounded-[8px] border border-solid border-[#005eb8] flex items-center justify-center mt-auto transition-all hover:bg-[#005eb8] hover:text-white group"
                  id="ai-subscribe-monthly"
                >
                  <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[24px] text-[#005eb8] group-hover:text-white transition-colors">
                    選擇月繳
                  </span>
                </button>
              </div>
            </div>

            {/* ── 年繳卡片（推薦）── */}
            <div
              className="relative rounded-[16px] cursor-pointer transition-all duration-200 flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #003d82 0%, #005eb8 60%, #0070cc 100%)',
                boxShadow: selectedPlan === 'yearly'
                  ? '0px 8px 32px 0px rgba(0,94,184,0.35)'
                  : '0px 4px 16px 0px rgba(0,94,184,0.2)',
                transform: selectedPlan === 'yearly' ? 'translateY(-2px)' : 'none',
              }}
              onClick={() => setSelectedPlan('yearly')}
              id="ai-plan-yearly"
            >
              {/* 推薦標籤 */}
              <div className="flex items-center justify-center h-[36px] bg-[rgba(255,255,255,0.12)]">
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[11px] text-white uppercase tracking-[0.08em] leading-[18px]">
                  ⭐ 推薦方案・省更多
                </p>
              </div>

              <div className="flex flex-col p-[24px] gap-[20px] flex-1">
                {/* 方案名稱 & 省錢標籤 */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[15px] text-[rgba(255,255,255,0.7)] leading-[22px] uppercase tracking-[0.04em]">
                      年繳方案
                    </p>
                    <div className="flex items-baseline gap-[4px]">
                      <span className="font-['Public_Sans:Bold',sans-serif] font-bold text-[32px] text-white leading-[40px]">
                        NT$249
                      </span>
                      <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[rgba(255,255,255,0.6)] leading-[22px]">
                        / 月
                      </span>
                    </div>
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[rgba(255,255,255,0.5)] leading-[18px]">
                      NT$2,988 / 年
                    </p>
                  </div>
                  {/* 省 NT$492 標籤 */}
                  <div className="bg-[rgba(255,255,255,0.18)] rounded-[8px] px-[10px] py-[4px] border border-[rgba(255,255,255,0.25)] border-solid">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[12px] text-white leading-[20px] whitespace-nowrap">
                      省 NT$492
                    </p>
                  </div>
                </div>

                {/* 分隔線 */}
                <div className="h-px bg-[rgba(255,255,255,0.15)]" />

                {/* 功能清單 */}
                <div className="flex flex-col gap-[10px]">
                  {YEARLY_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-[10px]">
                      <CheckIconWhite />
                      <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[rgba(255,255,255,0.9)] leading-[22px]">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 立即訂閱按鈕 */}
                <button
                  className="w-full h-[40px] rounded-[8px] bg-white flex items-center justify-center mt-auto transition-all hover:bg-[#f0f7ff] active:scale-[0.98]"
                  id="ai-subscribe-yearly"
                >
                  <span className="font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] leading-[24px] text-[#005eb8]">
                    立即訂閱年繳
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 底部說明 */}
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#919eab] leading-[18px] text-center">
            所有方案均提供 14 天免費試用 · 隨時可取消訂閱 · 含稅價格
          </p>
        </div>
      </div>
    </BaseOverlay>
  );
}

// AI Tool Button - responsive
function AIToolButton() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="relative flex-1 min-w-0">
      <div 
        className="bg-gradient-to-r from-[#ddf8fb] from-[43.75%] h-[46px] relative rounded-[99px] to-[#5abbf8] w-full cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setShowPricing(true)}
        id="ai-tool-button"
      >
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
            <div className="content-stretch flex items-center pl-0 pr-[8px] py-0 relative shrink-0">
              <StartAdornment />
            </div>
            <p className="css-g0mm18 flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis">
              AI
            </p>
          </div>
        </div>
      </div>
      
      {showPricing && <AIPricingOverlay onClose={() => setShowPricing(false)} />}
    </div>
  );
}

// B Header - responsive layout using flex instead of absolute
export function PageHeaderB({ title, breadcrumb }: PageHeaderBProps) {
  return (
    <div className="w-full h-[114px] bg-[#f5f5f7] px-[24px] shrink-0">
      <div className="flex items-center gap-[24px] h-full pl-[32px]">
        {/* Title & breadcrumb */}
        <div className="shrink-0">
          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[36px] text-[#1c252e] text-[24px]">
            {title}
          </p>
          {breadcrumb && (
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[20px] text-[#637381] text-[13px] mt-[4px] whitespace-nowrap">
              {breadcrumb}
            </p>
          )}
        </div>
        
        {/* AI Tool - hidden on small screens, flex on larger */}
        <div className="hidden md:flex flex-1 min-w-0">
          <AIToolButton />
        </div>
      </div>
    </div>
  );
}
