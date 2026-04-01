import { useState } from 'react';
import svgPaths from "@/imports/svg-k90cvtwh8p";

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

// AI Tool Button - responsive
function AIToolButton() {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="relative flex-1 min-w-0">
      <div 
        className="bg-gradient-to-r from-[#ddf8fb] from-[43.75%] h-[46px] relative rounded-[99px] to-[#5abbf8] w-full cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setShowPopover(!showPopover)}
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
      
      {showPopover && <AIAssistantPopover onClose={() => setShowPopover(false)} />}
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
