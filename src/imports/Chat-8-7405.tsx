import svgPaths from "./svg-k90cvtwh8p";
import svgPathsChat from "./svg-huvuhonro6";
import imgStack from "figma:asset/1a64bb29b96d52f74d342ea173c7a5a5756e6710.png";
import imgImgAvatar25 from "figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import imgImgAvatar1 from "figma:asset/d7c38e4c2ec5583f5bcb8f33bbcadbadf4ceed61.png";
import imgImgAvatar2 from "figma:asset/ba1f925e57c8f297bb26a2475302e1c715c37494.png";
import imgImgAvatar3 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";
import imgAIIcon from "figma:asset/0490a0a57586fe3010f08007d14c1172f63994de.png";
import { NavigationList } from '@/app/components/NavigationList';
import type { PageType } from '@/app/components/MainLayout';

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
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar3} />
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

function Button() {
  return (
    <div className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] py-0 relative rounded-[8px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white">
        <p className="css-ew64yg leading-[24px]">My setting</p>
      </div>
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

function SmallSelect() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative rounded-[8px] shrink-0" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">繁中</p>
      <IconsSolidIcEvaArrowIosDownwardFill />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Button />
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
    <div className="content-stretch flex flex-col items-center justify-end relative shrink-0 w-[248px]" data-name="巨大角色">
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

function NavVertical({ currentPage, onPageChange, onLogout }: { currentPage: PageType; onPageChange: (page: PageType) => void; onLogout?: () => void }) {
  return (
    <div className="absolute bg-[#2B2B2B] left-0 top-[-4px] bottom-[-30px] w-[280px]" data-name="NavVertical">
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
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar25} />
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

function Button1() {
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
      <Button1 />
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

function AIBar() {
  return (
    <div className="absolute left-[301px] top-[80px] w-[596px] h-[48px] rounded-[24px] px-[20px] flex items-center gap-[12px] cursor-pointer hover:opacity-90 transition-opacity z-10"
         style={{ background: 'linear-gradient(90deg, #61C6FF 0%, #3B9FFF 100%)' }}>
      <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C20 14.1217 19.1572 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20Z" fill="white"/>
          <path d="M12 6C11.7348 6 11.4804 6.10536 11.2929 6.29289C11.1054 6.48043 11 6.73478 11 7V12C11 12.2652 11.1054 12.5196 11.2929 12.7071C11.4804 12.8946 11.7348 13 12 13C12.2652 13 12.5196 12.8946 12.7071 12.7071C12.8946 12.5196 13 12.2652 13 12V7C13 6.73478 12.8946 6.48043 12.7071 6.29289C12.5196 6.10536 12.2652 6 12 6Z" fill="white"/>
          <path d="M12 14C11.7348 14 11.4804 14.1054 11.2929 14.2929C11.1054 14.4804 11 14.7348 11 15C11 15.2652 11.1054 15.5196 11.2929 15.7071C11.4804 15.8946 11.7348 16 12 16C12.2652 16 12.5196 15.8946 12.7071 15.7071C12.8946 15.5196 13 15.2652 13 15C13 14.7348 12.8946 14.4804 12.7071 14.2929C12.5196 14.1054 12.2652 14 12 14Z" fill="white"/>
        </svg>
      </div>
      <span className="text-[16px] font-semibold text-white leading-none">AI</span>
    </div>
  );
}

function IconsEmptyIcChatActive({ className }: { className?: string }) {
  return (
    <div className={className} data-name="icons/empty/ic-chat-active">
      <div className="absolute left-0 size-[120px] top-0" data-name="icons/empty/background">
        <div className="absolute inset-[9.42%_11.9%_8.83%_8.33%]" data-name="stack">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 95.714 98.1007">
            <g id="stack" opacity="0.48">
              <path clipRule="evenodd" d={svgPathsChat.p13246400} fill="var(--fill-0, #919EAB)" fillRule="evenodd" id="shape" opacity="0.48" />
              <path clipRule="evenodd" d={svgPathsChat.p58c35f0} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="shape_2" opacity="0.48" />
              <path clipRule="evenodd" d={svgPathsChat.p2a3d4100} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="shape_3" />
              <path clipRule="evenodd" d={svgPathsChat.p365c8900} fill="var(--fill-0, #919EAB)" fillRule="evenodd" id="shape_4" opacity="0.8" />
              <path clipRule="evenodd" d={svgPathsChat.p1b23ba80} fill="var(--fill-0, #22C55E)" fillRule="evenodd" id="shape_5" opacity="0.24" />
              <path clipRule="evenodd" d={svgPathsChat.p25558d00} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="shape_6" opacity="0.8" />
              <path clipRule="evenodd" d={svgPathsChat.p838e580} fill="var(--fill-0, #8E33FF)" fillRule="evenodd" id="shape_7" opacity="0.48" />
              <path clipRule="evenodd" d={svgPathsChat.pbff15f2} fill="var(--fill-0, #8E33FF)" fillRule="evenodd" id="shape_8" opacity="0.8" />
            </g>
          </svg>
        </div>
      </div>
      <div className="absolute inset-[25.83%_23.33%_26.46%_23.33%]" data-name="stack">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 57.2525">
          <g id="stack">
            <path d={svgPathsChat.p34f02f00} fill="url(#paint0_linear_13_1500)" id="shape" />
            <path d={svgPathsChat.p27495c20} fill="url(#paint1_linear_13_1500)" id="shape_2" opacity="0.2" />
            <g id="shape_3">
              <path d={svgPathsChat.p32a14a70} fill="url(#paint2_linear_13_1500)" />
              <path d={svgPathsChat.p15720e80} fill="url(#paint3_linear_13_1500)" />
              <path d={svgPathsChat.p6e59100} fill="url(#paint4_linear_13_1500)" />
            </g>
          </g>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_13_1500" x1="0" x2="56.8987" y1="0" y2="63.6048">
              <stop stopColor="#FFD666" />
              <stop offset="1" stopColor="#FFAB00" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_13_1500" x1="0" x2="54.8038" y1="2.0045" y2="50.2613">
              <stop stopColor="#FFAB00" />
              <stop offset="1" stopColor="#B76E00" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_13_1500" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
              <stop stopColor="#FFF5CC" />
              <stop offset="1" stopColor="#FFD666" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_13_1500" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
              <stop stopColor="#FFF5CC" />
              <stop offset="1" stopColor="#FFD666" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_13_1500" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
              <stop stopColor="#FFF5CC" />
              <stop offset="1" stopColor="#FFD666" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function ChatArea() {
  return (
    <div className="absolute bg-white h-[830px] overflow-clip left-[304px] rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] top-[114px] w-[1080px]" data-name="chat/Variant7">
      {/* Chat Header */}
      <div className="absolute content-stretch flex gap-[16px] h-[92px] items-center left-0 px-[20px] py-[16px] top-0 w-[1080px]" data-name="Chat/Header">
        <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
          <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
            <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
                <div className="absolute bg-[#fff2b9] inset-0 rounded-[500px]" />
                <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar3} />
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
          <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
            <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
                <div className="content-stretch flex items-center pl-0 pr-[8px] py-0 relative shrink-0" data-name="start adornment">
                  <div className="overflow-clip relative shrink-0 size-[24px]" data-name="start adornment">
                    <div className="absolute inset-[12.5%_12.48%_12.48%_12.5%]" data-name="primary-shape">
                      <div className="absolute inset-0" style={{ "--fill-0": "rgba(29, 123, 245, 1)" } as React.CSSProperties}>
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0058 18.0058">
                          <path d={svgPathsChat.p2e7aad00} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="css-g0mm18 flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis">廠商名稱、廠商姓名、對話內容</p>
                <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Chat List */}
      <div className="absolute content-stretch flex flex-col h-[738px] items-start left-0 px-0 py-[20px] top-[92px] w-[320px]">
        <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-r border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
          <div className="relative shrink-0 w-full" data-name="item">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
                <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
                  <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
                      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
                        <div className="absolute bg-[#ffdbde] inset-0 rounded-[500px]" />
                        <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar1} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
                    <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">巨大-ann</p>
                    <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
                  </div>
                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
                    <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">訂單編號: 4005....</p>
                    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
                      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">6</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
          <div className="relative shrink-0 w-full" data-name="item">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
                <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
                  <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
                      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
                        <div className="absolute bg-[#f6d3bd] inset-0 rounded-[500px]" />
                        <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar2} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
                    <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">巨大-OOO</p>
                    <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
                  </div>
                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
                    <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">我們的船運突然....</p>
                    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
                      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">2</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
          <div className="relative shrink-0 w-full" data-name="item">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
                <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
                  <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
                      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
                        <div className="absolute bg-[#fff2b9] inset-0 rounded-[500px]" />
                        <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar3} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
                    <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">巨大-OOO</p>
                    <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
                  </div>
                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
                    <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">好的，那我們這....</p>
                    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
                      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Empty State */}
      <div className="absolute content-stretch flex flex-col gap-[8px] items-center justify-center left-[320px] top-[310px] w-[760px]" data-name="stack">
        <IconsEmptyIcChatActive className="relative shrink-0 size-[120px]" />
        <p className="css-ew64yg font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#919eab] text-[18px]">You have raised the bar!</p>
        <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">Write something awesome...</p>
      </div>
      {/* Chat Input */}
      <div className="absolute bg-white content-stretch flex h-[102px] items-center left-[320px] px-[8px] py-0 top-[728px] w-[760px]" data-name="Chat/Input">
        <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-solid border-t inset-0 pointer-events-none" />
        <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
          <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:smiling-face-outline">
            <div className="absolute inset-[8.33%]" data-name="primary-shape">
              <div className="absolute inset-0" style={{ "--fill-0": "rgba(99, 115, 129, 1)" } as React.CSSProperties}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
                  <path d={svgPathsChat.p1f98d180} fill="var(--fill-0, #637381)" id="primary-shape" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#919eab] text-[14px]">Type a message</p>
        <div className="content-stretch flex items-start relative shrink-0" data-name="action">
          <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-solar:gallery-add-bold">
              <div className="absolute inset-[8.33%]" data-name="primary-shape">
                <div className="absolute inset-0" style={{ "--fill-0": "rgba(99, 115, 129, 1)" } as React.CSSProperties}>
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6675">
                    <g id="primary-shape">
                      <path d={svgPathsChat.p1e3ed0f0} fill="var(--fill-0, #637381)" />
                      <path clipRule="evenodd" d={svgPathsChat.p1123f980} fill="var(--fill-0, #637381)" fillRule="evenodd" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutDashboard({ currentPage, onPageChange, onLogout }: { currentPage: PageType; onPageChange: (page: PageType) => void; onLogout?: () => void }) {
  return (
    <div className="absolute bg-[#f5f5f7] h-[1200px] left-0 overflow-clip top-0 w-[1440px]" data-name="Layout/Dashboard">
      <NavVertical currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} />
      <ToggleButton />
      <AIBar />
      <p className="absolute css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[36px] left-[301px] text-[#1c252e] text-[24px] top-[37px] w-[1080px]">Chat</p>
      <ChatArea />
      <Upgrade />
    </div>
  );
}

function Img2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.25">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#ffd4b8] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar25} />
        </div>
      </div>
    </div>
  );
}

function Avatar2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img2 />
    </div>
  );
}

function StartAdornment2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="start adornment">
          <path d={svgPaths.p14834500} fill="var(--fill-0, #919EAB)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function StartAdornment3() {
  return (
    <div className="content-stretch flex items-center pl-0 pr-[8px] py-0 relative shrink-0" data-name="start adornment">
      <StartAdornment2 />
    </div>
  );
}

function EndAdornment1() {
  return <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />;
}

function Wrap1() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <StartAdornment3 />
          <p className="css-g0mm18 flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis">廠商名稱、廠商姓名、對話內容</p>
          <EndAdornment1 />
        </div>
      </div>
    </div>
  );
}

function TextField1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap1 />
    </div>
  );
}

function ChatHeader() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[92px] items-center left-0 px-[20px] py-[16px] top-0 w-[1080px]" data-name="Chat/Header">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <Avatar2 />
      <TextField1 />
    </div>
  );
}

function Img3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#ffdbde] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar1} />
        </div>
      </div>
    </div>
  );
}

function Status() {
  return (
    <div className="absolute bg-[#22c55e] bottom-[2px] right-[2px] rounded-[500px] size-[10px]" data-name="✳️ status">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[501px]" />
    </div>
  );
}

function Avatar3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img3 />
      <Status />
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">shimano-ann</p>
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">6</p>
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">訂單編號: 4005....</p>
      <Badge />
    </div>
  );
}

function Stack5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
      <Stack3 />
      <Stack4 />
    </div>
  );
}

function Item() {
  return (
    <div className="relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
          <Avatar3 />
          <Stack5 />
        </div>
      </div>
    </div>
  );
}

function Stack6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
      <Item />
    </div>
  );
}

function Img4() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#f6d3bd] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar2} />
        </div>
      </div>
    </div>
  );
}

function Status1() {
  return (
    <div className="absolute bg-[#22c55e] bottom-[2px] right-[2px] rounded-[500px] size-[10px]" data-name="✳️ status">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[501px]" />
    </div>
  );
}

function Avatar4() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img4 />
      <Status1 />
    </div>
  );
}

function Stack7() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">維樂-OOO</p>
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
    </div>
  );
}

function Badge1() {
  return (
    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">2</p>
    </div>
  );
}

function Stack8() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">我們的船運突然....</p>
      <Badge1 />
    </div>
  );
}

function Stack9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
      <Stack7 />
      <Stack8 />
    </div>
  );
}

function Item1() {
  return (
    <div className="relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
          <Avatar4 />
          <Stack9 />
        </div>
      </div>
    </div>
  );
}

function Stack10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
      <Item1 />
    </div>
  );
}

function Img5() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#fff2b9] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar3} />
        </div>
      </div>
    </div>
  );
}

function Status2() {
  return (
    <div className="absolute bottom-[2px] right-[2px] size-[10px]" data-name="✳️ status">
      <div className="absolute inset-[-10%]" style={{ "--fill-0": "rgba(255, 255, 255, 1)", "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <g id="â³ï¸ status">
            <path d={svgPaths.p177389f0} fill="var(--fill-0, white)" />
            <path d={svgPaths.p177389f0} stroke="var(--stroke-0, white)" />
            <circle cx="6" cy="6" id="ellipse" r="4" stroke="var(--stroke-0, #919EAB)" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Avatar5() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img5 />
      <Status2 />
    </div>
  );
}

function Stack11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">正新-OOO</p>
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
    </div>
  );
}

function Badge2() {
  return (
    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">1</p>
    </div>
  );
}

function Stack12() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">好的，那我們這....</p>
      <Badge2 />
    </div>
  );
}

function Stack13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
      <Stack11 />
      <Stack12 />
    </div>
  );
}

function Item2() {
  return (
    <div className="relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
          <Avatar5 />
          <Stack13 />
        </div>
      </div>
    </div>
  );
}

function Stack14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
      <Item2 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[738px] items-start left-0 px-0 py-[20px] top-[92px] w-[320px]">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-r border-solid inset-0 pointer-events-none" />
      <Stack6 />
      <Stack10 />
      <Stack14 />
    </div>
  );
}

function Stack15() {
  return (
    <div className="absolute inset-[9.42%_11.9%_8.83%_8.33%]" data-name="stack">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 95.714 98.1007">
        <g id="stack" opacity="0.48">
          <path clipRule="evenodd" d={svgPaths.p13246400} fill="var(--fill-0, #919EAB)" fillRule="evenodd" id="shape" opacity="0.48" />
          <path clipRule="evenodd" d={svgPaths.p58c35f0} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="shape_2" opacity="0.48" />
          <path clipRule="evenodd" d={svgPaths.p2a3d4100} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="shape_3" />
          <path clipRule="evenodd" d={svgPaths.p365c8900} fill="var(--fill-0, #919EAB)" fillRule="evenodd" id="shape_4" opacity="0.8" />
          <path clipRule="evenodd" d={svgPaths.p1b23ba80} fill="var(--fill-0, #22C55E)" fillRule="evenodd" id="shape_5" opacity="0.24" />
          <path clipRule="evenodd" d={svgPaths.p25558d00} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="shape_6" opacity="0.8" />
          <path clipRule="evenodd" d={svgPaths.p838e580} fill="var(--fill-0, #8E33FF)" fillRule="evenodd" id="shape_7" opacity="0.48" />
          <path clipRule="evenodd" d={svgPaths.pbff15f2} fill="var(--fill-0, #8E33FF)" fillRule="evenodd" id="shape_8" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}

function IconsEmptyBackground() {
  return (
    <div className="absolute left-0 size-[120px] top-0" data-name="icons/empty/background">
      <Stack15 />
    </div>
  );
}

function Stack16() {
  return (
    <div className="absolute inset-[25.83%_23.33%_26.46%_23.33%]" data-name="stack">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 57.2525">
        <g id="stack">
          <path d={svgPaths.p34f02f00} fill="url(#paint0_linear_8_2311)" id="shape" />
          <path d={svgPaths.p27495c20} fill="url(#paint1_linear_8_2311)" id="shape_2" opacity="0.2" />
          <g id="shape_3">
            <path d={svgPaths.p32a14a70} fill="url(#paint2_linear_8_2311)" />
            <path d={svgPaths.p15720e80} fill="url(#paint3_linear_8_2311)" />
            <path d={svgPaths.p6e59100} fill="url(#paint4_linear_8_2311)" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_8_2311" x1="0" x2="56.8987" y1="0" y2="63.6048">
            <stop stopColor="#FFD666" />
            <stop offset="1" stopColor="#FFAB00" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_8_2311" x1="0" x2="54.8038" y1="2.0045" y2="50.2613">
            <stop stopColor="#FFAB00" />
            <stop offset="1" stopColor="#B76E00" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_8_2311" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
            <stop stopColor="#FFF5CC" />
            <stop offset="1" stopColor="#FFD666" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_8_2311" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
            <stop stopColor="#FFF5CC" />
            <stop offset="1" stopColor="#FFD666" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_8_2311" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
            <stop stopColor="#FFF5CC" />
            <stop offset="1" stopColor="#FFD666" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function IconsEmptyIcChatActive() {
  return (
    <div className="relative shrink-0 size-[120px]" data-name="icons/empty/ic-chat-active">
      <IconsEmptyBackground />
      <Stack16 />
    </div>
  );
}

function Stack17() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-center justify-center left-[320px] top-[310px] w-[760px]" data-name="stack">
      <IconsEmptyIcChatActive />
      <p className="css-ew64yg font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#919eab] text-[18px]">You have raised the bar!</p>
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">Write something awesome...</p>
    </div>
  );
}

function IconsSolidIcEvaSmilingFaceOutline() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:smiling-face-outline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-eva:smiling-face-outline">
          <path d={svgPaths.p25a1d880} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconButton() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
      <IconsSolidIcEvaSmilingFaceOutline />
    </div>
  );
}

function IconsSolidIcSolarGalleryAddBold() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-solar:gallery-add-bold">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-solar:gallery-add-bold">
          <g id="primary-shape">
            <path d={svgPaths.p1f36bc00} fill="var(--fill-0, #637381)" />
            <path clipRule="evenodd" d={svgPaths.p2bb719f0} fill="var(--fill-0, #637381)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IconButton1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
      <IconsSolidIcSolarGalleryAddBold />
    </div>
  );
}

function Action() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="action">
      <IconButton1 />
    </div>
  );
}

function ChatInput() {
  return (
    <div className="absolute bg-white content-stretch flex h-[102px] items-center left-[320px] px-[8px] py-0 top-[728px] w-[760px]" data-name="Chat/Input">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <IconButton />
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#919eab] text-[14px]">Type a message</p>
      <Action />
    </div>
  );
}

function Chat() {
  return (
    <div className="absolute bg-white h-[830px] left-[301px] overflow-clip rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] top-[128px] w-[1080px]" data-name="chat">
      <ChatHeader />
      <Frame1 />
      <Stack17 />
      <ChatInput />
    </div>
  );
}

export default function Chat1({ currentPage, onPageChange, onLogout }: { currentPage: PageType; onPageChange: (page: PageType) => void; onLogout?: () => void }) {
  return (
    <div className="relative size-full" data-name="chat">
      <LayoutDashboard currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} />
      <Chat />
    </div>
  );
}