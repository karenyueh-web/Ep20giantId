import svgPaths from "./svg-d84x18jyny";
import imgStack from "figma:asset/589083efc8d155f4aeebb5d7f1ec82f6c63c7b5b.png";
import imgImgAvatar25 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";
import imgImgAvatar26 from "figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import imgAvatar from "figma:asset/d7c38e4c2ec5583f5bcb8f33bbcadbadf4ceed61.png";
import imgAvatar1 from "figma:asset/ba1f925e57c8f297bb26a2475302e1c715c37494.png";
import { NavigationList } from "@/app/components/NavigationList";
import type { PageType } from "@/app/components/MainLayout";
import { useState } from 'react';
import { chatData } from '@/app/data/chatData';
import { VendorConfirmTable } from '@/imports/訂單section';
import { getDashboardStats } from '@/app/data/dashboardData';
import type { UserRole } from '@/app/App';
import { ResponsivePageLayout } from '@/app/components/ResponsivePageLayout';

function Stack() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="stack">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStack} />
      <div className="size-full" />
    </div>
  );
}

function Img() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.25">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#d1fff4] inset-0 rounded-[500px]" />
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

function IconsSolidIcEvaArrowIosDownwardFill() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill">
          <path d={svgPaths.p2b32f00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function LanguageSelector() {
  const [language, setLanguage] = useState<'繁中' | 'English'>('繁中');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
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
            <IconsSolidIcEvaArrowIosDownwardFill />
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
          <div className="absolute top-full left-0 right-0 mt-[4px] bg-[#3d4246] rounded-[8px] shadow-lg border border-[rgba(145,158,171,0.16)] z-[101] overflow-hidden">
            <div 
              className={`px-[12px] py-[8px] cursor-pointer hover:bg-[#2d3436] transition-colors ${language === '繁中' ? 'bg-[rgba(255,184,0,0.15)]' : ''}`}
              onClick={() => {
                setLanguage('繁中');
                setIsOpen(false);
              }}
            >
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">繁中</p>
            </div>
            <div 
              className={`px-[12px] py-[8px] cursor-pointer hover:bg-[#2d3436] transition-colors ${language === 'English' ? 'bg-[rgba(255,184,0,0.15)]' : ''}`}
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

function SmallSelect() {
  return <LanguageSelector />;
}

function Frame() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[176px]">
      <SmallSelect />
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center pb-[16px] pt-[12px] px-0 relative shrink-0 w-full" data-name="stack">
      <p className="css-ew64yg font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic overflow-hidden relative shrink-0 text-[#181d27] text-[14px] text-center text-ellipsis">廠商</p>
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-center text-ellipsis">hudson.alvarez@giant.com</p>
      <Frame />
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[248px]" data-name="廠商角色">
      <Avatar />
      <Stack1 />
    </div>
  );
}

function Subheader() {
  return (
    <div className="relative shrink-0 w-full" data-name="subheader">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-[8px] pl-[12px] pr-0 pt-[16px] relative w-full">
          <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#919eab] text-[11px] uppercase">OVERVIEW</p>
        </div>
      </div>
    </div>
  );
}

function Icon() {
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

function ItemIcon() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon />
    </div>
  );
}

function ItemText() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info() {
  return (
    <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ info">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">32+</p>
    </div>
  );
}

function NavVerticalItem() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon />
          <ItemText />
          <Info />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
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

function ItemIcon1() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon1 />
    </div>
  );
}

function ItemText1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">公佈欄</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info1() {
  return (
    <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ info">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">32+</p>
    </div>
  );
}

function NavVerticalItem1() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon1 />
          <ItemText1 />
          <Info1 />
        </div>
      </div>
    </div>
  );
}

function Icon2() {
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

function ItemIcon2() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon2 />
    </div>
  );
}

function ItemText2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] overflow-hidden relative shrink-0 text-[#005eb8] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">online chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info2() {
  return (
    <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ info">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">32+</p>
    </div>
  );
}

function NavVerticalItem2() {
  return (
    <div className="bg-[rgba(0,94,184,0.08)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon2 />
          <ItemText2 />
          <Info2 />
        </div>
      </div>
    </div>
  );
}

function Icon3() {
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

function ItemIcon3() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon3 />
    </div>
  );
}

function ItemText3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">收料查詢</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem3() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon3 />
          <ItemText3 />
        </div>
      </div>
    </div>
  );
}

function Icon4() {
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

function ItemIcon4() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon4 />
    </div>
  );
}

function ItemText4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">訂單排程查詢</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem4() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon4 />
          <ItemText4 />
        </div>
      </div>
    </div>
  );
}

function Icon5() {
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

function ItemIcon5() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon5 />
    </div>
  );
}

function ItemText5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">廠商帳號審核</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem5() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon5 />
          <ItemText5 />
        </div>
      </div>
    </div>
  );
}

function Subheader1() {
  return (
    <div className="relative shrink-0 w-full" data-name="subheader">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-[8px] pl-[12px] pr-0 pt-[16px] relative w-full">
          <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#919eab] text-[11px] uppercase">Management</p>
        </div>
      </div>
    </div>
  );
}

function Icon6() {
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

function ItemIcon6() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon6 />
    </div>
  );
}

function ItemText6() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">訂單管理</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill() {
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

function Arrow() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosForwardFill />
    </div>
  );
}

function NavVerticalItem6() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon6 />
          <ItemText6 />
          <Arrow />
        </div>
      </div>
    </div>
  );
}

function NavVerticalPoItem() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="NavVertical/PO/Item">
      <NavVerticalItem6 />
    </div>
  );
}

function Icon7() {
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

function ItemIcon7() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon7 />
    </div>
  );
}

function ItemText7() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">修正單管理</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill1() {
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

function Arrow1() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosForwardFill1 />
    </div>
  );
}

function NavVerticalItem7() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon7 />
          <ItemText7 />
          <Arrow1 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalChangePoItem() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="NavVertical/change po/Item">
      <NavVerticalItem7 />
    </div>
  );
}

function Icon8() {
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

function ItemIcon8() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon8 />
    </div>
  );
}

function ItemText8() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">出貨單</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill2() {
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

function Arrow2() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosForwardFill2 />
    </div>
  );
}

function NavVerticalItem8() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon8 />
          <ItemText8 />
          <Arrow2 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalInvoiceItem() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="NavVertical/Invoice/Item">
      <NavVerticalItem8 />
    </div>
  );
}

function Icon9() {
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

function ItemIcon9() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon9 />
    </div>
  );
}

function ItemText9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">發票作業</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill3() {
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

function Arrow3() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosForwardFill3 />
    </div>
  );
}

function NavVerticalItem9() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon9 />
          <ItemText9 />
          <Arrow3 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalInvoiceItem1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="NavVertical/Invoice/Item">
      <NavVerticalItem9 />
    </div>
  );
}

function Icon10() {
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

function ItemIcon10() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon10 />
    </div>
  );
}

function ItemText10() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">廠商評價</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem10() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon10 />
          <ItemText10 />
        </div>
      </div>
    </div>
  );
}

function Icon11() {
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

function ItemIcon11() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon11 />
    </div>
  );
}

function ItemText11() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">帳號管理</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill4() {
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

function Arrow4() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosForwardFill4 />
    </div>
  );
}

function NavVerticalItem11() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon11 />
          <ItemText11 />
          <Arrow4 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalBlogItem() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="NavVertical/Blog/Item">
      <NavVerticalItem11 />
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d={svgPaths.p37d0a200} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <path clipRule="evenodd" d={svgPaths.p2faf7980} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function ItemIcon12() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon12 />
    </div>
  );
}

function ItemText12() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">品保作業</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill5() {
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

function Arrow5() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosForwardFill5 />
    </div>
  );
}

function NavVerticalItem12() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon12 />
          <ItemText12 />
          <Arrow5 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalJobItem() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="NavVertical/Job/Item">
      <NavVerticalItem12 />
    </div>
  );
}

function Icon13() {
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

function ItemIcon13() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon13 />
    </div>
  );
}

function ItemText13() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">產險資料維護</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill6() {
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

function Arrow6() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosForwardFill6 />
    </div>
  );
}

function NavVerticalItem13() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon13 />
          <ItemText13 />
          <Arrow6 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalTourItem() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="NavVertical/Tour/Item">
      <NavVerticalItem13 />
    </div>
  );
}

function Icon14() {
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

function ItemIcon14() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon14 />
    </div>
  );
}

function ItemText14() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">新零件專案</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem14() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon14 />
          <ItemText14 />
        </div>
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path clipRule="evenodd" d={svgPaths.p28fbcc00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="secondary-shape" opacity="0.4" />
          <g id="primary-shape">
            <path d={svgPaths.p1292a9c0} fill="var(--fill-0, #637381)" />
            <path clipRule="evenodd" d={svgPaths.p94ab780} fill="var(--fill-0, #637381)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ItemIcon15() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon15 />
    </div>
  );
}

function ItemText15() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">ESG</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem15() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon15 />
          <ItemText15 />
        </div>
      </div>
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d={svgPaths.p158f900} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <g id="primary-shape">
            <path d={svgPaths.pd565100} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p3aa2d890} fill="var(--fill-0, #637381)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ItemIcon16() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon16 />
    </div>
  );
}

function ItemText16() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">出貨台灣捷安特</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem16() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon16 />
          <ItemText16 />
        </div>
      </div>
    </div>
  );
}

function Icon17() {
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

function ItemIcon17() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
      <Icon17 />
    </div>
  );
}

function ItemText17() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full">
            <p className="css-g0mm18 leading-[22px] overflow-hidden">系統設定</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill7() {
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

function Arrow7() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosForwardFill7 />
    </div>
  );
}

function NavVerticalItem17() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon17 />
          <ItemText17 />
          <Arrow7 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalTourItem1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="NavVertical/Tour/Item">
      <NavVerticalItem17 />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start overflow-clip relative shrink-0 w-full" data-name="list">
      <Subheader />
      <NavVerticalItem />
      <NavVerticalItem1 />
      <NavVerticalItem2 />
      <NavVerticalItem3 />
      <NavVerticalItem4 />
      <NavVerticalItem5 />
      <Subheader1 />
      <NavVerticalPoItem />
      <NavVerticalChangePoItem />
      <NavVerticalInvoiceItem />
      <NavVerticalInvoiceItem1 />
      <NavVerticalItem10 />
      <NavVerticalBlogItem />
      <NavVerticalJobItem />
      <NavVerticalTourItem />
      <NavVerticalItem14 />
      <NavVerticalItem15 />
      <NavVerticalItem16 />
      <NavVerticalTourItem1 />
    </div>
  );
}

function NavVertical({ currentPage, onPageChange, onLogout, userRole = 'vendor' }: { currentPage: PageType; onPageChange: (page: PageType) => void; onLogout?: () => void; userRole?: UserRole }) {
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

function IconsSolidIcEvaArrowIosBackFill() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-back-fill">
          <path d={svgPaths.p36867980} fill="var(--fill-0, #919EAB)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function ToggleButton() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[267px] rounded-[500px] size-[26px] top-[27px]" data-name="toggle-button">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.08)] border-solid inset-0 pointer-events-none rounded-[500px] shadow-[0px_1px_2px_0px_rgba(145,158,171,0.16)]" />
      <IconsSolidIcEvaArrowIosBackFill />
    </div>
  );
}

function Img1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.25">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#dad0fc] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar26} />
        </div>
      </div>
    </div>
  );
}

function Avatar1() {
  return (
    <div className="bg-[#dfe3e8] content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img1 />
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center pb-[16px] pt-[12px] px-0 relative shrink-0 text-[14px] text-center text-ellipsis w-full" data-name="stack">
      <p className="css-ew64yg font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic overflow-hidden relative shrink-0 text-[#181d27]">Stephanie Hung 洪鈴</p>
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] overflow-hidden relative shrink-0 text-[#637381]">hudson.alvarez@giant.com</p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] py-0 relative rounded-[8px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white">
        <p className="css-ew64yg leading-[24px]">Upgrade to Pro</p>
      </div>
    </div>
  );
}

function Upgrade() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-end left-[-546px] top-[32px] w-[248px]" data-name="upgrade">
      <Avatar1 />
      <Stack2 />
      <Button />
    </div>
  );
}

function StartAdornment() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="✳️ start adornment">
      <div className="absolute inset-[0_-16.67%_-33.33%_-16.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g filter="url(#filter0_d_2_19401)" id="â³ï¸ start adornment">
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

function StartAdornment1() {
  return (
    <div className="content-stretch flex items-center pl-0 pr-[8px] py-0 relative shrink-0" data-name="start adornment">
      <StartAdornment />
    </div>
  );
}

function EndAdornment() {
  return <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />;
}

function Wrap() {
  return (
    <div className="bg-gradient-to-r from-[#ddf8fb] from-[43.75%] h-[46px] relative rounded-[99px] shrink-0 to-[#5abbf8] w-full" data-name="wrap">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <StartAdornment1 />
          <p className="css-g0mm18 flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis">AI</p>
          <EndAdornment />
        </div>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[526px] top-[28px] w-[855px]" data-name="TextField">
      <Wrap />
    </div>
  );
}

function LayoutDashboard({ currentPage, onPageChange, onLogout, userRole = 'vendor' }: { currentPage: PageType; onPageChange: (page: PageType) => void; onLogout?: () => void; userRole?: UserRole }) {
  // Layout is now handled by ResponsivePageLayout in Dashboard1
  return null;
}

function Section() {
  return <div className="absolute h-[365px] left-[31px] top-[16px] w-[1049px]" data-name="公告section" />;
}

function Section1() {
  return <div className="absolute h-[444px] left-[36px] top-[386px] w-[1044px]" data-name="訂單section/採購" />;
}

function HelpIcon() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Help icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="help-circle">
          <path d={svgPaths.p27ffbb00} id="Icon" stroke="var(--stroke-0, #A4A7AE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#c3d5e6] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
      <div aria-hidden="true" className="absolute border border-[#99bfe3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#00559c] text-[12px] text-center">3</p>
    </div>
  );
}

function TextAndBadge() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Text and badge">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#00559c] text-[14px]">新訂單</p>
      <Badge />
    </div>
  );
}

function TabButtonBase() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-center pb-[12px] pt-0 px-[4px] relative shrink-0 w-[153px]" data-name="_Tab button base">
      <div aria-hidden="true" className="absolute border-[#025ba5] border-b-2 border-solid inset-0 pointer-events-none" />
      <TextAndBadge />
    </div>
  );
}

function Badge1() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
      <div aria-hidden="true" className="absolute border border-[#e9eaeb] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#414651] text-[12px] text-center">3</p>
    </div>
  );
}

function TextAndBadge1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Text and badge">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">廠商確認中(V)</p>
      <Badge1 />
    </div>
  );
}

function TabButtonBase1() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-center pb-[12px] pt-0 px-[4px] relative shrink-0 w-[153px]" data-name="_Tab button base">
      <TextAndBadge1 />
    </div>
  );
}

function Tabs() {
  return (
    <div className="content-stretch flex h-[32px] items-center relative shrink-0 w-[270px]" data-name="Tabs">
      <TabButtonBase />
      <TabButtonBase1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <Tabs />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <HelpIcon />
      <Frame2 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <Frame4 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <Frame5 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute content-stretch flex items-start left-[calc(50%-370.5px)] top-[calc(50%-183px)] translate-x-[-50%] translate-y-[-50%]">
      <Frame6 />
    </div>
  );
}

function TableHeaderLabel() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">公司</p>
    </div>
  );
}

function TableHeaderCell() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[6]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">巨大機械</p>
    </div>
  );
}

function TableCell() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[5]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">GVM</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">AIP愛普智</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText2 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">Backend Developer</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText3 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">Fullstack Developer</p>
    </div>
  );
}

function TableCell4() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText4 />
        </div>
      </div>
    </div>
  );
}

function Column() {
  return (
    <div className="content-stretch flex flex-col h-[260px] isolate items-start overflow-clip relative shrink-0 w-[168px]" data-name="Column">
      <TableHeaderCell />
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
    </div>
  );
}

function TableHeaderLabel1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">採購組織</p>
    </div>
  );
}

function TableHeaderCell1() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[4]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">台灣廠生產採購組織</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText5 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">GVM</p>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText6 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">AIP生產採購組織</p>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText7 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText7_1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">GVM</p>
    </div>
  );
}

function TableCell7_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText7_1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText7_2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">台灣廠生產採購組織</p>
    </div>
  );
}

function TableCell7_2() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText7_2 />
        </div>
      </div>
    </div>
  );
}

function Column1() {
  return (
    <div className="content-stretch flex flex-col h-full isolate items-start overflow-clip relative shrink-0 w-[187px]" data-name="Column">
      <TableHeaderCell1 />
      <TableCell5 />
      <TableCell6 />
      <TableCell7 />
      <TableCell7_1 />
      <TableCell7_2 />
    </div>
  );
}

function TableHeaderLabel2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">訂單類型</p>
    </div>
  );
}

function TableHeaderCell2() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[4]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel2 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">{`Z2QB `}</p>
    </div>
  );
}

function TableCell8() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText8 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">{`Z2QB `}</p>
    </div>
  );
}

function TableCell9() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText9 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">{`Z2QB `}</p>
    </div>
  );
}

function TableCell10() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText10 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText10_1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">{`Z2QB `}</p>
    </div>
  );
}

function TableCell10_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText10_1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText10_2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">{`Z2QB `}</p>
    </div>
  );
}

function TableCell10_2() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText10_2 />
        </div>
      </div>
    </div>
  );
}

function Column2() {
  return (
    <div className="content-stretch flex flex-col h-[260px] isolate items-center justify-center overflow-clip relative shrink-0 w-[158px]" data-name="Column">
      <TableHeaderCell2 />
      <TableCell8 />
      <TableCell9 />
      <TableCell10 />
      <TableCell10_1 />
      <TableCell10_2 />
    </div>
  );
}

function TableHeaderLabel3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">訂單號碼</p>
    </div>
  );
}

function TableHeaderCell3() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[4]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel3 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535455] text-[14px]">400000105410</p>
    </div>
  );
}

function TableCell11() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText11 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">400051332020</p>
    </div>
  );
}

function TableCell12() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText12 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">500004396020</p>
    </div>
  );
}

function TableCell13() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText13 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText13_1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535455] text-[14px]">400000105410</p>
    </div>
  );
}

function TableCell13_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText13_1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText13_2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]\">400051332020</p>
    </div>
  );
}

function TableCell13_2() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText13_2 />
        </div>
      </div>
    </div>
  );
}

function Column3() {
  return (
    <div className="content-stretch flex flex-col h-full isolate items-start overflow-clip relative shrink-0 w-[152px]" data-name="Column">
      <TableHeaderCell3 />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
      <TableCell13_1 />
      <TableCell13_2 />
    </div>
  );
}

function TableHeaderLabel4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">項次數</p>
    </div>
  );
}

function TableHeaderCell4() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[6]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel4 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">5</p>
    </div>
  );
}

function TableCell14() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[5]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText14 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">20</p>
    </div>
  );
}

function TableCell15() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText15 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">94</p>
    </div>
  );
}

function TableCell16() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText16 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/03</p>
    </div>
  );
}

function TableCell17() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText17 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/02</p>
    </div>
  );
}

function TableCell18() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText18 />
        </div>
      </div>
    </div>
  );
}

function Column4() {
  return (
    <div className="content-stretch flex flex-col h-[260px] isolate items-start overflow-clip relative shrink-0 w-[96px]" data-name="Column">
      <TableHeaderCell4 />
      <TableCell14 />
      <TableCell15 />
      <TableCell16 />
      <TableCell17 />
      <TableCell18 />
    </div>
  );
}

function TableHeaderLabel5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">訂單日期</p>
    </div>
  );
}

function TableHeaderCell5() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[5]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel5 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/06</p>
    </div>
  );
}

function TableCell19() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText19 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/05</p>
    </div>
  );
}

function TableCell20() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText20 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/03</p>
    </div>
  );
}

function TableCell21() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText21 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/02</p>
    </div>
  );
}

function TableCell22() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText22 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText22_1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/06</p>
    </div>
  );
}

function TableCell22_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText22_1 />
        </div>
      </div>
    </div>
  );
}

function Column5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[260px] isolate items-start min-h-px min-w-px overflow-clip relative" data-name="Column">
      <TableHeaderCell5 />
      <TableCell19 />
      <TableCell20 />
      <TableCell21 />
      <TableCell22 />
      <TableCell22_1 />
    </div>
  );
}

function TableHeaderLabel6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">&nbsp;</p>
    </div>
  );
}

function TableHeaderCell6() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[2]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel6 />
        </div>
      </div>
    </div>
  );
}

function ScrollBarControlFillWithBottomPadding() {
  return null; // 使用原生滾動條
}

function Column6() {
  return (
    <div className="content-stretch flex flex-col h-[395px] isolate items-start overflow-clip relative shrink-0 w-[40px]" data-name="Column">
      <TableHeaderCell6 />
      <ScrollBarControlFillWithBottomPadding />
    </div>
  );
}

// Header Row - 所有列的標題（固定不滾動）
function TableHeaderRow() {
  return (
    <div className="content-stretch flex items-start relative w-full shrink-0 z-[2] bg-[#f4f6f8]" data-name="TableHeaderRow">
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[168px]">
        <TableHeaderCell />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[187px]">
        <TableHeaderCell1 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[157px]">
        <TableHeaderCell2 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[176px]">
        <TableHeaderCell3 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[96px]">
        <TableHeaderCell4 />
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-start min-w-px overflow-clip relative">
        <TableHeaderCell5 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[40px]">
        <TableHeaderCell6 />
      </div>
    </div>
  );
}

// Body Content - 所有列的數據（可滾動）
function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px overflow-y-auto custom-scrollbar relative w-full z-[1]" data-name="Content">
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[168px]">
        <TableCell />
        <TableCell1 />
        <TableCell2 />
        <TableCell3 />
        <TableCell4 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[187px]">
        <TableCell5 />
        <TableCell6 />
        <TableCell7 />
        <TableCell7_1 />
        <TableCell7_2 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[157px]">
        <TableCell8 />
        <TableCell9 />
        <TableCell10 />
        <TableCell10_1 />
        <TableCell10_2 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[176px]">
        <TableCell11 />
        <TableCell12 />
        <TableCell13 />
        <TableCell13_1 />
        <TableCell13_2 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[96px]">
        <TableCell14 />
        <TableCell15 />
        <TableCell16 />
        <TableCell17 />
        <TableCell18 />
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-start min-w-px overflow-clip relative">
        <TableCell19 />
        <TableCell20 />
        <TableCell21 />
        <TableCell22 />
        <TableCell22_1 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[40px]">
        <ScrollBarControlFillWithBottomPadding />
      </div>
    </div>
  );
}

function Table() {
  return (
    <div className="absolute bg-white inset-[8.21%_0_0_0] rounded-[12px]" data-name="Table">
      <div className="content-stretch flex flex-col isolate items-start relative rounded-[inherit] size-full">
        <TableHeaderRow />
        <Content />
      </div>
      <div aria-hidden="true" className="absolute border border-[#e9eaeb] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]" />
    </div>
  );
}

function Section2() {
  const [activeOrderTab, setActiveOrderTab] = useState<'new' | 'vendor'>('new');
  const stats = getDashboardStats();

  return (
    <div className="absolute h-[390px] left-[36px] top-[413px] w-[1011px]" data-name="訂單section">
      {/* Tabs Header */}
      <div className="absolute content-stretch flex items-start left-[calc(50%-370.5px)] top-[calc(50%-183px)] translate-x-[-50%] translate-y-[-50%]">
        <div className="content-stretch flex items-center relative shrink-0">
          <HelpIcon />
          <div className="content-stretch flex items-start relative shrink-0">
            <div className="content-stretch flex h-[32px] items-center relative shrink-0 w-[270px]">
              {/* 新訂單 Tab */}
              <div 
                onClick={() => setActiveOrderTab('new')}
                className="content-stretch flex h-[32px] items-center justify-center pb-[12px] pt-0 px-[4px] relative shrink-0 w-[153px] cursor-pointer"
              >
                {activeOrderTab === 'new' && <div aria-hidden="true" className="absolute border-[#025ba5] border-b-2 border-solid inset-0 pointer-events-none" />}
                <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
                  <p className={`css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] ${activeOrderTab === 'new' ? 'text-[#00559c]' : 'text-[#717680]'}`}>新訂單</p>
                  <div className={`${activeOrderTab === 'new' ? 'bg-[#c3d5e6]' : 'bg-[#fafafa]'} content-stretch flex items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0`}>
                    <div aria-hidden="true" className={`absolute border ${activeOrderTab === 'new' ? 'border-[#99bfe3]' : 'border-[#e9eaeb]'} border-solid inset-0 pointer-events-none rounded-[16px]`} />
                    <p className={`css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[12px] text-center ${activeOrderTab === 'new' ? 'text-[#00559c]' : 'text-[#414651]'}`}>{stats.newOrdersCount}</p>
                  </div>
                </div>
              </div>
              
              {/* 廠商確認中(V) Tab */}
              <div 
                onClick={() => setActiveOrderTab('vendor')}
                className="content-stretch flex h-[32px] items-center justify-center pb-[12px] pt-0 px-[4px] relative shrink-0 w-[153px] cursor-pointer"
              >
                {activeOrderTab === 'vendor' && <div aria-hidden="true" className="absolute border-[#025ba5] border-b-2 border-solid inset-0 pointer-events-none" />}
                <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
                  <p className={`css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] ${activeOrderTab === 'vendor' ? 'text-[#00559c]' : 'text-[#717680]'}`}>廠商確認中(V)</p>
                  <div className={`${activeOrderTab === 'vendor' ? 'bg-[#c3d5e6]' : 'bg-[#fafafa]'} content-stretch flex items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0`}>
                    <div aria-hidden="true" className={`absolute border ${activeOrderTab === 'vendor' ? 'border-[#99bfe3]' : 'border-[#e9eaeb]'} border-solid inset-0 pointer-events-none rounded-[16px]`} />
                    <p className={`css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[12px] text-center ${activeOrderTab === 'vendor' ? 'text-[#00559c]' : 'text-[#414651]'}`}>{stats.vendorConfirmCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      {activeOrderTab === 'new' ? <Table /> : <VendorConfirmTable />}
    </div>
  );
}

function TextAndSupportingText23() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center min-h-px min-w-px relative self-stretch" data-name="Text and supporting text">
      <p className="css-4hzbpn font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] not-italic relative shrink-0 text-[#181d27] text-[18px] w-full">chatbox</p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full z-[2]" data-name="Content">
      <TextAndSupportingText23 />
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] isolate items-start left-0 px-[20px] py-0 top-[7px] w-[320px]" data-name="Section header">
      <Content1 />
    </div>
  );
}

function AvatarOnlineIndicator() {
  return (
    <div className="absolute bg-[#17b26a] bottom-0 right-0 rounded-[5px] size-[10px]" data-name="_Avatar online indicator">
      <div aria-hidden="true" className="absolute border-[1.5px] border-solid border-white inset-[-1.5px] pointer-events-none rounded-[6.5px]" />
    </div>
  );
}

function Avatar2() {
  return (
    <div className="relative rounded-[200px] shrink-0 size-[40px]" data-name="Avatar">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[200px]">
        <div className="absolute bg-[#ffdbde] inset-0 rounded-[200px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[200px] size-full" src={imgAvatar} />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[200px]" />
      <AvatarOnlineIndicator />
    </div>
  );
}

function TextAndSupportingText24() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[20px] not-italic relative shrink-0 text-[14px]" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#181d27]">巨大-ann</p>
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#535862]">訂單編號:4005....</p>
    </div>
  );
}

function AvatarAndText() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Avatar and text">
      <Avatar2 />
      <TextAndSupportingText24 />
    </div>
  );
}

function TableCell23() {
  return (
    <div className="flex-[1_0_0] h-[72px] max-h-[72px] min-h-px min-w-px relative" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[rgba(128,128,128,0.55)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] pl-0 pr-[24px] py-[16px] relative size-full">
          <AvatarAndText />
        </div>
      </div>
    </div>
  );
}

function Badge2() {
  return (
    <div className="bg-[#00bc4b] content-stretch flex items-center px-[10px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white">10</p>
    </div>
  );
}

function TableCell24() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-[10px]" data-name="Table cell">
      <div className="flex flex-row items-center justify-end max-h-[inherit] size-full">
        <div className="content-stretch flex items-center justify-end max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <Badge2 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="h-[82px] relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] py-[5px] relative size-full">
          <TableCell23 />
          <TableCell24 />
        </div>
      </div>
    </div>
  );
}

function AvatarOnlineIndicator1() {
  return (
    <div className="absolute bg-[#17b26a] bottom-0 right-0 rounded-[5px] size-[10px]" data-name="_Avatar online indicator">
      <div aria-hidden="true" className="absolute border-[1.5px] border-solid border-white inset-[-1.5px] pointer-events-none rounded-[6.5px]" />
    </div>
  );
}

function Avatar3() {
  return (
    <div className="relative rounded-[200px] shrink-0 size-[40px]" data-name="Avatar">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[200px]">
        <div className="absolute bg-[#f6d3bd] inset-0 rounded-[200px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[200px] size-full" src={imgAvatar1} />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[200px]" />
      <AvatarOnlineIndicator1 />
    </div>
  );
}

function TextAndSupportingText25() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[20px] not-italic relative shrink-0 text-[14px]" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#181d27]">巨大-OOO</p>
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#535862]">訂單編號:4005....</p>
    </div>
  );
}

function AvatarAndText1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Avatar and text">
      <Avatar3 />
      <TextAndSupportingText25 />
    </div>
  );
}

function TableCell25() {
  return (
    <div className="flex-[1_0_0] h-[72px] max-h-[72px] min-h-px min-w-px relative" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[rgba(128,128,128,0.55)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] pl-0 pr-[24px] py-[16px] relative size-full">
          <AvatarAndText1 />
        </div>
      </div>
    </div>
  );
}

function Badge3() {
  return (
    <div className="bg-[#00bc4b] content-stretch flex items-center px-[10px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white">10</p>
    </div>
  );
}

function TableCell26() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-[10px]" data-name="Table cell">
      <div className="flex flex-row items-center justify-end max-h-[inherit] size-full">
        <div className="content-stretch flex items-center justify-end max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <Badge3 />
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="h-[82px] relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] py-[5px] relative size-full">
          <TableCell25 />
          <TableCell26 />
        </div>
      </div>
    </div>
  );
}

function AvatarOnlineIndicator2() {
  return (
    <div className="absolute bg-[#17b26a] bottom-0 right-0 rounded-[5px] size-[10px]" data-name="_Avatar online indicator">
      <div aria-hidden="true" className="absolute border-[1.5px] border-solid border-white inset-[-1.5px] pointer-events-none rounded-[6.5px]" />
    </div>
  );
}

function Avatar4() {
  return (
    <div className="relative rounded-[200px] shrink-0 size-[40px]" data-name="Avatar">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[200px]">
        <div className="absolute bg-[#fff2b9] inset-0 rounded-[200px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[200px] size-full" src={imgImgAvatar26} />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[200px]" />
      <AvatarOnlineIndicator2 />
    </div>
  );
}

function TextAndSupportingText26() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[20px] not-italic relative shrink-0 text-[14px]" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#181d27]">巨大-OOO</p>
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#535862]">訂單編號:4005....</p>
    </div>
  );
}

function AvatarAndText2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Avatar and text">
      <Avatar4 />
      <TextAndSupportingText26 />
    </div>
  );
}

function TableCell27() {
  return (
    <div className="flex-[1_0_0] h-[72px] max-h-[72px] min-h-px min-w-px relative" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[rgba(128,128,128,0.55)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] pl-0 pr-[24px] py-[16px] relative size-full">
          <AvatarAndText2 />
        </div>
      </div>
    </div>
  );
}

function Badge4() {
  return (
    <div className="bg-[#00bc4b] content-stretch flex items-center px-[10px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white">10</p>
    </div>
  );
}

function TableCell28() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-[10px]" data-name="Table cell">
      <div className="flex flex-row items-center justify-end max-h-[inherit] size-full">
        <div className="content-stretch flex items-center justify-end max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <Badge4 />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="h-[82px] relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] py-[5px] relative size-full">
          <TableCell27 />
          <TableCell28 />
        </div>
      </div>
    </div>
  );
}

function Frame10({ onChatSelect }: { onChatSelect?: (chatId: string) => void }) {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-0 w-[469px] h-[280px] overflow-y-auto custom-scrollbar">
      {chatData.map((chat) => (
        <div 
          key={chat.id}
          onClick={() => onChatSelect?.(chat.id)}
          className="h-[82px] relative shrink-0 w-full cursor-pointer hover:bg-[#f9fafb] transition-colors"
        >
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center px-[20px] py-[5px] relative size-full">
              <div className="flex-[1_0_0] h-[72px] max-h-[72px] min-h-px min-w-px relative" data-name="Table cell">
                <div aria-hidden="true" className="absolute border-[rgba(128,128,128,0.55)] border-b border-solid inset-0 pointer-events-none" />
                <div className="flex flex-row items-center max-h-[inherit] size-full">
                  <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] pl-0 pr-[24px] py-[16px] relative size-full">
                    <div className="relative rounded-[200px] shrink-0 size-[40px]" data-name="Avatar">
                      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[200px]">
                        <div className="absolute inset-0 rounded-[200px]" style={{ backgroundColor: chat.avatarBg }} />
                        <img alt="" className="absolute max-w-none object-cover rounded-[200px] size-full" src={chat.avatar} />
                      </div>
                      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[200px]" />
                      <div className="absolute bg-[#17b26a] bottom-0 right-0 rounded-[5px] size-[10px]" data-name="_Avatar online indicator">
                        <div aria-hidden="true" className="absolute border-[1.5px] border-solid border-white inset-[-1.5px] pointer-events-none rounded-[6.5px]" />
                      </div>
                    </div>
                    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text and supporting text">
                      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#181d27] text-[14px]">{chat.name}</p>
                      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">{chat.lastMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[72px] max-h-[72px] relative shrink-0 w-[10px]" data-name="Table cell">
                <div className="flex flex-row items-center justify-end max-h-[inherit] size-full">
                  <div className="content-stretch flex items-center justify-end max-h-[inherit] px-[24px] py-[16px] relative size-full">
                    {chat.unreadCount > 0 && (
                      <div className="bg-[#00bc4b] content-stretch flex items-center px-[10px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
                        <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white">{chat.unreadCount}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScrollBarControlFillWithBottomPadding1() {
  return null; // 使用原生滾動條
}

function Frame9({ onChatSelect }: { onChatSelect?: (chatId: string) => void }) {
  return (
    <div className="absolute bg-white h-[280px] left-[19px] rounded-[12px] top-[39px] w-[466px]">
      <Frame10 onChatSelect={onChatSelect} />
      <ScrollBarControlFillWithBottomPadding1 />
    </div>
  );
}

function ChatSection({ onChatSelect }: { onChatSelect?: (chatId: string) => void }) {
  return (
    <div className="absolute bg-[rgba(0,122,255,0.15)] h-[338.04px] left-[549px] rounded-[12px] top-[43px] w-[505px]" data-name="chat section">
      <SectionHeader />
      <Frame9 onChatSelect={onChatSelect} />
    </div>
  );
}

function Badge5() {
  const stats = getDashboardStats();
  
  return (
    <div className="bg-[#fef3f2] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
      <div aria-hidden="true" className="absolute border border-[#fecdca] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#b42318] text-[12px] text-center">{stats.unreadAnnouncementsCount}</p>
    </div>
  );
}

function TextAndBadge2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="Text and badge">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] not-italic relative shrink-0 text-[#181d27] text-[18px]">未讀公告</p>
      <Badge5 />
    </div>
  );
}

function TextAndSupportingText27() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[2px] inset-[0_0.02%_92.77%_0] items-start justify-center" data-name="Text and supporting text">
      <TextAndBadge2 />
    </div>
  );
}

function TableHeaderLabel7() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">發布者</p>
    </div>
  );
}

function TableHeaderCell7() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[5]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel7 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText28() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">數位中心</p>
    </div>
  );
}

function TableCell29() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText28 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText29() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">台灣區委購(歐洲/大陸/越南)</p>
    </div>
  );
}

function TableCell30() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div className="flex flex-row items-center max-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText29 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function TextAndSupportingText30() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">GTM採購管理課</p>
    </div>
  );
}

function TableCell31() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText30 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText31() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">GTM採購管理課</p>
    </div>
  );
}

function TableCell32() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText31 />
        </div>
      </div>
    </div>
  );
}

function Column7() {
  return (
    <div className="content-stretch flex flex-col h-auto isolate items-start relative rounded-tl-[12px] shrink-0 w-[169px]" data-name="Column">
      <TableHeaderCell7 />
      <TableCell29 />
      <TableCell30 />
      <TableCell31 />
      <TableCell32 />
      <TableCell29 />
      <TableCell30 />
      <TableCell31 />
    </div>
  );
}

function TableHeaderLabel8() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">內容</p>
    </div>
  );
}

function TableHeaderCell8() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[5]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel8 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText32() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text and supporting text">
      <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#535862] text-[14px] w-[min-content]">Lorem ipsum dolor sit amet co........</p>
    </div>
  );
}

function TableCell33() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText32 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText33() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">Lorem ipsum dolor sit amet co........</p>
    </div>
  );
}

function TableCell34() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div className="flex flex-row items-center max-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText33 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function TextAndSupportingText34() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">Lorem ipsum dolor sit amet co........</p>
    </div>
  );
}

function TableCell35() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div className="flex flex-row items-center max-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText34 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function TextAndSupportingText35() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">Lorem ipsum dolor sit amet co........</p>
    </div>
  );
}

function TableCell36() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div className="flex flex-row items-center max-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText35 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Column8() {
  return (
    <div className="content-stretch flex flex-col h-auto isolate items-start relative shrink-0 w-[167px]" data-name="Column">
      <TableHeaderCell8 />
      <TableCell33 />
      <TableCell34 />
      <TableCell35 />
      <TableCell36 />
      <TableCell33 />
      <TableCell34 />
      <TableCell35 />
    </div>
  );
}

function TableHeaderLabel9() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">發布日期</p>
    </div>
  );
}

function TableHeaderCell9() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[5]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel9 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/06</p>
    </div>
  );
}

function TableCell37() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText36 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/05</p>
    </div>
  );
}

function TableCell38() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText37 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/03</p>
    </div>
  );
}

function TableCell39() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText38 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/03</p>
    </div>
  );
}

function TableCell40() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText39 />
        </div>
      </div>
    </div>
  );
}

function Column9() {
  return (
    <div className="content-stretch flex flex-col h-auto isolate items-start relative shrink-0 w-[143px]" data-name="Column">
      <TableHeaderCell9 />
      <TableCell37 />
      <TableCell38 />
      <TableCell39 />
      <TableCell40 />
      <TableCell37 />
      <TableCell38 />
      <TableCell39 />
    </div>
  );
}

function TableHeaderLabel10() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">&nbsp;</p>
    </div>
  );
}

function TableHeaderCell10() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[2]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel10 />
        </div>
      </div>
    </div>
  );
}

function ScrollBarControlFillWithBottomPadding2() {
  return null; // 使用原生滾動條
}

function Column10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[260px] isolate items-start min-h-px min-w-px overflow-clip relative rounded-tr-[12px]" data-name="Column">
      <TableHeaderCell10 />
      <ScrollBarControlFillWithBottomPadding2 />
    </div>
  );
}

// Header Row for 未讀公告 - 所有列的標題（固定不滾動）
function TableHeaderRow2() {
  return (
    <div className="content-stretch flex items-start relative w-full shrink-0 z-[2] bg-[#f4f6f8]" data-name="TableHeaderRow">
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative rounded-tl-[12px] shrink-0 w-[169px]">
        <TableHeaderCell7 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[167px]">
        <TableHeaderCell8 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[143px]">
        <TableHeaderCell9 />
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-start min-w-px overflow-clip relative rounded-tr-[12px]">
        <TableHeaderCell10 />
      </div>
    </div>
  );
}

// Body Content for 未讀公告 - 所有列的數據（可滾動）
function Content2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px overflow-y-auto custom-scrollbar relative w-full h-full z-[1]" data-name="Content">
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[169px]">
        <TableCell29 />
        <TableCell30 />
        <TableCell31 />
        <TableCell32 />
        <TableCell29 />
        <TableCell30 />
        <TableCell31 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[167px]">
        <TableCell33 />
        <TableCell34 />
        <TableCell35 />
        <TableCell36 />
        <TableCell33 />
        <TableCell34 />
        <TableCell35 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[143px]">
        <TableCell37 />
        <TableCell38 />
        <TableCell39 />
        <TableCell40 />
        <TableCell37 />
        <TableCell38 />
        <TableCell39 />
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-start min-w-px overflow-clip relative">
        <ScrollBarControlFillWithBottomPadding2 />
      </div>
    </div>
  );
}

function Table1() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col inset-[9.37%_0_0_0] isolate items-start rounded-[12px]" data-name="Table">
      <div aria-hidden="true" className="absolute border border-[#e9eaeb] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]" />
      <TableHeaderRow2 />
      <Content2 />
    </div>
  );
}

function Section3() {
  return (
    <div className="absolute h-[373px] left-[22px] top-[8px] w-[505px]" data-name="公告section">
      <TextAndSupportingText27 />
      <Table1 />
    </div>
  );
}

function TableOrder({ onChatSelect, userRole = 'vendor' }: { onChatSelect?: (chatId: string) => void; userRole?: UserRole }) {
  // 右側內容區域統一使用白色背景
  const cardBg = 'bg-white';
  
  return (
    <div className={`absolute ${cardBg} h-[830px] left-0 rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] top-0 w-full max-w-[1080px]`} data-name="Table/Order">
      <Section />
      <Section1 />
      <Section2 />
      <ChatSection onChatSelect={onChatSelect} />
      <Section3 />
    </div>
  );
}

function DashboardContent({ onChatSelect, userRole = 'vendor' }: { onChatSelect?: (chatId: string) => void; userRole?: UserRole }) {
  return (
    <div className="h-full w-full relative" data-name="dashboard">
      <TableOrder onChatSelect={onChatSelect} userRole={userRole} />
      {/* 整片毛玻璃遮罩 - 覆蓋整個Dashboard內容區域 */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/40 rounded-[16px] flex items-center justify-center z-50 cursor-not-allowed">
        <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[32px] text-[#1c252e] pointer-events-none">畫面建置中</p>
      </div>
    </div>
  );
}

export default function Dashboard1({ currentPage, onPageChange, onChatSelect, onLogout, userRole = 'vendor' }: { currentPage: PageType; onPageChange: (page: PageType) => void; onChatSelect?: (chatId: string) => void; onLogout?: () => void; userRole?: UserRole }) {
  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="Dashboard"
      breadcrumb=""
    >
      <DashboardContent onChatSelect={onChatSelect} userRole={userRole} />
    </ResponsivePageLayout>
  );
}