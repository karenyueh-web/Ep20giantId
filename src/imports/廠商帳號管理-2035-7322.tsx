import svgPaths from "./svg-q8o3r60yru";
import imgImgAvatar25 from "figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import imgStack from "figma:asset/1a64bb29b96d52f74d342ea173c7a5a5756e6710.png";
import imgImgAvatar26 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";

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

function Stack() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center pb-[16px] pt-[12px] relative shrink-0 text-[14px] text-center text-ellipsis w-full" data-name="stack">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic overflow-hidden relative shrink-0 text-[#181d27]">Stephanie Hung 洪鈴</p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] overflow-hidden relative shrink-0 text-[#637381]">hudson.alvarez@giant.com</p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">Upgrade to Pro</p>
      </div>
    </div>
  );
}

function Upgrade() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-end left-[-546px] top-[32px] w-[248px]" data-name="upgrade">
      <Avatar />
      <Stack />
      <Button />
    </div>
  );
}

function StartAdornment1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="✳️ start adornment">
      <div className="absolute inset-[0_-16.67%_-33.33%_-16.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g filter="url(#filter0_d_2025_9896)" id="â³ï¸ start adornment">
            <path d={svgPaths.p2cf2a500} fill="url(#paint0_linear_2025_9896)" id="Union" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32" id="filter0_d_2025_9896" width="32" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2025_9896" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_2025_9896" mode="normal" result="shape" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2025_9896" x1="16" x2="16" y1="2.89867e-09" y2="24">
              <stop stopColor="#005EB8" />
              <stop offset="1" stopColor="#002A52" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function StartAdornment() {
  return (
    <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="start adornment">
      <StartAdornment1 />
    </div>
  );
}

function EndAdornment() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function Wrap() {
  return (
    <div className="bg-gradient-to-r from-[#ddf8fb] from-[43.75%] h-[46px] relative rounded-[99px] shrink-0 to-[#5abbf8] w-full" data-name="wrap">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <StartAdornment />
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis whitespace-nowrap">AI</p>
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

function LayoutDashboard() {
  return (
    <div className="absolute bg-white h-[1200px] left-0 overflow-clip top-0 w-[1440px]" data-name="Layout/Dashboard">
      <ToggleButton />
      <p className="absolute font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[36px] left-[301px] text-[#1c252e] text-[24px] top-[37px] w-[1080px] whitespace-pre-wrap">廠商帳號管理</p>
      <Upgrade />
      <TextField />
    </div>
  );
}

function Stack1() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="stack">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStack} />
      <div className="size-full" />
    </div>
  );
}

function Img1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.25">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#d1fff4] inset-0 rounded-[500px]" />
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
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">繁中</p>
          <IconsSolidIcEvaArrowIosDownwardFill />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[176px]">
      <SmallSelect />
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center pb-[16px] pt-[12px] relative shrink-0 w-full" data-name="stack">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic overflow-hidden relative shrink-0 text-[#181d27] text-[14px] text-center text-ellipsis">廠商</p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-center text-ellipsis">hudson.alvarez@giant.com</p>
      <Frame />
    </div>
  );
}

function Component2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[248px]" data-name="廠商角色">
      <Avatar1 />
      <Stack2 />
    </div>
  );
}

function Subheader() {
  return (
    <div className="relative shrink-0 w-full" data-name="subheader">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-[8px] pl-[12px] pt-[16px] relative w-full">
          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#919eab] text-[11px] uppercase">OVERVIEW</p>
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
    <div className="content-stretch flex items-center justify-center pr-[12px] relative shrink-0" data-name="item-icon">
      <Icon />
    </div>
  );
}

function ItemText() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pr-[16px] relative w-full">
          <div className="flex flex-col font-['Public_Sans:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full whitespace-nowrap">
            <p className="leading-[22px] overflow-hidden">Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info() {
  return (
    <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ info">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">32+</p>
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
    <div className="content-stretch flex items-center justify-center pr-[12px] relative shrink-0" data-name="item-icon">
      <Icon1 />
    </div>
  );
}

function ItemText1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pr-[16px] relative w-full">
          <div className="flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full whitespace-nowrap">
            <p className="leading-[22px] overflow-hidden">公佈欄</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info1() {
  return (
    <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ info">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">32+</p>
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
    <div className="content-stretch flex items-center justify-center pr-[12px] relative shrink-0" data-name="item-icon">
      <Icon2 />
    </div>
  );
}

function ItemText2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pr-[16px] relative w-full">
          <div className="flex flex-col font-['Public_Sans:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full whitespace-nowrap">
            <p className="leading-[22px] overflow-hidden">online chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info2() {
  return (
    <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ info">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">32+</p>
    </div>
  );
}

function NavVerticalItem2() {
  return (
    <div className="bg-[rgba(255,255,255,0)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
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

function Subheader1() {
  return (
    <div className="relative shrink-0 w-full" data-name="subheader">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-[8px] pl-[12px] pt-[16px] relative w-full">
          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#919eab] text-[11px] uppercase">Management</p>
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
          <path d={svgPaths.p2089f300} fill="var(--fill-0, #005EB8)" id="secondary-shape" opacity="0.4" />
          <path d={svgPaths.p15dd3c80} fill="var(--fill-0, #005EB8)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function ItemIcon3() {
  return (
    <div className="content-stretch flex items-center justify-center pr-[12px] relative shrink-0" data-name="item-icon">
      <Icon3 />
    </div>
  );
}

function ItemText3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pr-[16px] relative w-full">
          <div className="flex flex-col font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold justify-center leading-[0] overflow-hidden relative shrink-0 text-[#005eb8] text-[14px] text-ellipsis w-full whitespace-nowrap">
            <p className="leading-[22px] overflow-hidden">帳號管理</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill">
          <path d={svgPaths.p2b32f00} fill="var(--fill-0, #005EB8)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Arrow() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[8px] relative shrink-0" data-name="arrow">
      <IconsSolidIcEvaArrowIosDownwardFill1 />
    </div>
  );
}

function NavVerticalItem3() {
  return (
    <div className="bg-[rgba(0,94,184,0.08)] min-h-[44px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <ItemIcon3 />
          <ItemText3 />
          <Arrow />
        </div>
      </div>
    </div>
  );
}

function NavVerticalShapeDivider() {
  return (
    <div className="content-stretch flex flex-col items-end relative self-stretch shrink-0" data-name="NavVertical/Shape/Divider">
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-[22px]" data-name="line">
        <div aria-hidden="true" className="absolute border-[#edeff2] border-r-2 border-solid inset-[0_-1px_0_0] pointer-events-none" />
      </div>
      <div className="h-[36px] shrink-0 w-full" data-name="space-md" />
      <div className="absolute h-[4px] left-[10px] top-[-4px] w-[12px]" data-name="line">
        <div aria-hidden="true" className="absolute border-[#edeff2] border-r-2 border-solid inset-[0_-1px_0_0] pointer-events-none" />
      </div>
    </div>
  );
}

function NavVerticalShapeRadius() {
  return (
    <div className="content-stretch flex flex-col h-full items-start relative shrink-0" data-name="NavVertical/Shape/Radius">
      <div className="bg-[#edeff2] flex-[1_0_0] min-h-px min-w-px relative w-px" data-name="space">
        <div aria-hidden="true" className="absolute border-[#edeff2] border-l border-solid inset-[0_0_0_-1px] pointer-events-none" />
      </div>
      <div className="relative shrink-0 size-[12px]" data-name="12px">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
            <path d={svgPaths.p1055de00} fill="var(--stroke-0, #EDEFF2)" id="12px" />
          </svg>
        </div>
      </div>
      <div className="flex-[1_0_0] min-h-px min-w-px w-[8px]" data-name="space" />
      <div className="shrink-0 size-[8px]" data-name="8px" />
    </div>
  );
}

function ItemText4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pr-[16px] relative w-full">
          <div className="flex flex-col font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold justify-center leading-[0] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-ellipsis w-full whitespace-nowrap">
            <p className="leading-[22px] overflow-hidden">廠商帳號管理</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[rgba(145,158,171,0.08)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]" data-name="container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pl-[12px] pr-[8px] py-[4px] relative size-full">
          <ItemText4 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem4() {
  return (
    <div className="content-stretch flex gap-px items-center min-h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center self-stretch">
        <NavVerticalShapeRadius />
      </div>
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Container />
      </div>
    </div>
  );
}

function NavVerticalShapeRadius1() {
  return (
    <div className="content-stretch flex flex-col h-full items-start relative shrink-0" data-name="NavVertical/Shape/Radius">
      <div className="bg-[#edeff2] flex-[1_0_0] min-h-px min-w-px relative w-px" data-name="space">
        <div aria-hidden="true" className="absolute border-[#edeff2] border-l border-solid inset-[0_0_0_-1px] pointer-events-none" />
      </div>
      <div className="relative shrink-0 size-[12px]" data-name="12px">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
            <path d={svgPaths.p1055de00} fill="var(--stroke-0, #EDEFF2)" id="12px" />
          </svg>
        </div>
      </div>
      <div className="flex-[1_0_0] min-h-px min-w-px w-[8px]" data-name="space" />
      <div className="shrink-0 size-[8px]" data-name="8px" />
    </div>
  );
}

function ItemText5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pr-[16px] relative w-full">
          <div className="flex flex-col font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-ellipsis w-full whitespace-nowrap">
            <p className="leading-[22px] overflow-hidden">巨大帳號管理</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]" data-name="container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pl-[12px] pr-[8px] py-[4px] relative size-full">
          <ItemText5 />
        </div>
      </div>
    </div>
  );
}

function NavVerticalItem5() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center min-h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="NavVertical/Item">
      <div className="flex flex-row items-center self-stretch">
        <NavVerticalShapeRadius1 />
      </div>
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Container1 />
      </div>
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative" data-name="list">
      <NavVerticalItem4 />
      <NavVerticalItem5 />
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="stack">
      <NavVerticalShapeDivider />
      <List1 />
    </div>
  );
}

function Component3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="帳號管理模組">
      <NavVerticalItem3 />
      <Stack3 />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px overflow-clip relative w-full" data-name="list">
      <Subheader />
      <NavVerticalItem />
      <NavVerticalItem1 />
      <NavVerticalItem2 />
      <Subheader1 />
      <Component3 />
    </div>
  );
}

function Component1() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] bottom-[-180px] left-[-9px] top-[4px] w-[280px]" data-name="發票作業">
      <div className="content-stretch flex flex-col items-center overflow-clip pb-[40px] px-[16px] relative rounded-[inherit] size-full">
        <Stack1 />
        <Component2 />
        <List />
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.12)] border-r border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Tab1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 1">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">基本資料</p>
    </div>
  );
}

function Tab2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 2">
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">業務帳號</p>
    </div>
  );
}

function Tab4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 7">
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">其它聯絡人</p>
    </div>
  );
}

function Tabs() {
  return (
    <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-[1080px]" data-name="Tabs">
      <Tab1 />
      <Tab2 />
      <Tab4 />
      <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" data-name="divider" />
    </div>
  );
}

function Checkbox() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[51px]" data-name="Checkbox">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">廠商代碼</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill" />
      </svg>
    </div>
  );
}

function SmallSelect1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">000100531</p>
          <IconsSolidIcEvaArrowIosDownwardFill2 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="content-stretch flex items-start pl-[10px] py-[10px] relative w-full">
        <SmallSelect1 />
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-[250px]">
      <Checkbox />
      <Frame1 />
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Checkbox">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">廠商簡稱</p>
    </div>
  );
}

function SmallSelect2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">久廣</p>
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px py-[10px] relative">
      <SmallSelect2 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-[250px]">
      <Checkbox1 />
      <Frame2 />
    </div>
  );
}

function Checkbox2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Checkbox">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">廠商完整名稱</p>
    </div>
  );
}

function SmallSelect3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">久廣實業股份有限公司</p>
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-end min-h-px min-w-px py-[10px] relative">
      <SmallSelect3 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] items-center min-h-px min-w-px relative">
      <Checkbox2 />
      <Frame3 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <Frame5 />
      <Frame6 />
      <Frame9 />
    </div>
  );
}

function Checkbox3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Checkbox">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">AX廠商代碼</p>
    </div>
  );
}

function SmallSelect4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">&nbsp;</p>
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-end min-h-px min-w-px py-[10px] relative">
      <SmallSelect4 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] items-center min-h-px min-w-px relative">
      <Checkbox3 />
      <Frame4 />
    </div>
  );
}

function Checkbox4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Checkbox">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">電話</p>
    </div>
  );
}

function SmallSelect5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">+886-37-756558</p>
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-end min-h-px min-w-px py-[10px] relative">
      <SmallSelect5 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] items-center min-h-px min-w-px relative">
      <Checkbox4 />
      <Frame7 />
    </div>
  );
}

function Checkbox5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Checkbox">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">傳真</p>
    </div>
  );
}

function SmallSelect6() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">+886-3-7750836</p>
        </div>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-end min-h-px min-w-px py-[10px] relative">
      <SmallSelect6 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] items-center min-h-px min-w-px relative">
      <Checkbox5 />
      <Frame12 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <Frame8 />
      <Frame10 />
      <Frame11 />
    </div>
  );
}

function Checkbox6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[51px]" data-name="Checkbox">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">地址</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill" />
      </svg>
    </div>
  );
}

function SmallSelect7() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">苗栗縣通霄鎮中正路73號</p>
          <IconsSolidIcEvaArrowIosDownwardFill3 />
        </div>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="flex flex-row justify-end size-full">
        <div className="content-stretch flex items-start justify-end pl-[10px] py-[10px] relative w-full">
          <SmallSelect7 />
        </div>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] items-center min-h-px min-w-px relative">
      <Checkbox6 />
      <Frame14 />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame13 />
    </div>
  );
}

function Checkbox7() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[51px]" data-name="Checkbox">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">主要營業產品</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill" />
      </svg>
    </div>
  );
}

function SmallSelect8() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] underline">車架/前叉/吊耳/止栓/把手套/煞車附件/變速器固定座/座墊/座墊桿/標紙/螺絲</p>
          <IconsSolidIcEvaArrowIosDownwardFill4 />
        </div>
      </div>
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[10px] py-[10px] relative shrink-0 w-[906px]">
      <SmallSelect8 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[39px] items-center min-h-px min-w-px relative">
      <Checkbox7 />
      <Frame21 />
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[996px]">
      <Frame20 />
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0">
      <Frame15 />
      <Frame17 />
      <Frame18 />
      <Frame19 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="col-1 content-stretch flex flex-col h-[229px] items-start ml-[14px] mt-[80px] relative row-1 w-[1006px]">
      <Frame32 />
    </div>
  );
}

function Tab() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="Tab">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">基本資料</p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-[-3px] w-[72px]">
      <Tab />
    </div>
  );
}

function Frame22() {
  return (
    <div className="h-[45px] relative shrink-0 w-[72px]">
      <Frame23 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="col-1 content-stretch flex gap-[10px] h-[55.251px] items-center ml-0 mt-0 relative row-1 w-[223px]">
      <Frame22 />
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">久廣(0001000531)</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#1c252e] col-1 content-stretch flex gap-[8px] h-[44.201px] items-center justify-center min-w-[64px] ml-[902px] mt-[11.05px] px-[12px] relative rounded-[8px] row-1 w-[130px]" data-name="Button">
      <div className="flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">儲存</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <div className="border border-[#919eab] border-solid col-1 h-[246.788px] ml-0 mt-[69.21px] rounded-[8px] row-1 w-[1034px]" />
      <Frame16 />
      <Frame26 />
      <Button1 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex flex-col h-[328px] items-center relative shrink-0 w-full">
      <Group />
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[1080px]">
      <Frame27 />
    </div>
  );
}

function Tab3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="Tab">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">特殊參與設定</p>
    </div>
  );
}

function Frame25() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-[-3px] w-[72px]">
      <Tab3 />
    </div>
  );
}

function Frame24() {
  return (
    <div className="h-[45px] relative shrink-0 w-[72px]">
      <Frame25 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="absolute content-stretch flex h-[36.018px] items-center right-[833px] top-0 w-[223px]">
      <Frame24 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[24px] top-0">
      <div className="absolute border border-[#919eab] border-solid h-[350.577px] left-[24px] rounded-[8px] top-[60.02px] w-[1034px]" />
      <Frame30 />
    </div>
  );
}

function Pagination() {
  return <div className="absolute h-[24px] left-[65px] top-[396px] w-[219px]" data-name="Pagination" />;
}

function SmallSelect9() {
  return (
    <div className="bg-[rgba(0,94,184,0.08)] col-1 content-stretch flex gap-[12px] h-[40px] items-center justify-center ml-0 mt-0 pl-[12px] pr-[8px] py-[6px] relative rounded-tl-[8px] rounded-tr-[8px] row-1 w-[994px]" data-name="SmallSelect">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">&nbsp;</p>
    </div>
  );
}

function IconsSolidIcCheckboxOn() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-checkbox-on">
          <path d={svgPaths.p19d65300} fill="var(--fill-0, #005EB8)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcCheckboxOn />
    </div>
  );
}

function Checkbox9() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer />
    </div>
  );
}

function Checkbox8() {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
      <Checkbox9 />
    </div>
  );
}

function Texts() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">需付檢驗報告</p>
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
      <Texts />
    </div>
  );
}

function TableCell() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[219px]" data-name="Table/Cell">
      <Checkbox8 />
      <Stack4 />
    </div>
  );
}

function IconsSolidIcCheckboxOn1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-checkbox-on">
          <path d={svgPaths.p19d65300} fill="var(--fill-0, #005EB8)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer1() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcCheckboxOn1 />
    </div>
  );
}

function Checkbox11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer1 />
    </div>
  );
}

function Checkbox10() {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
      <Checkbox11 />
    </div>
  );
}

function Texts1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">需付功性能測試報告</p>
    </div>
  );
}

function Stack5() {
  return (
    <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
      <Texts1 />
    </div>
  );
}

function TableCell1() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[219px]" data-name="Table/Cell">
      <Checkbox10 />
      <Stack5 />
    </div>
  );
}

function Pagination2() {
  return (
    <div className="content-stretch flex h-[24px] items-center relative shrink-0 w-[219px]" data-name="Pagination">
      <TableCell1 />
    </div>
  );
}

function Pagination1() {
  return (
    <div className="col-1 content-stretch flex gap-[10px] h-[24px] items-center ml-[16px] mt-[8px] relative row-1 w-[219px]" data-name="Pagination">
      <TableCell />
      <Pagination2 />
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <SmallSelect9 />
      <Pagination1 />
    </div>
  );
}

function SmallSelect10() {
  return (
    <div className="col-1 content-stretch flex gap-[12px] h-[40px] items-center justify-center ml-0 mt-0 pl-[12px] pr-[8px] py-[6px] relative rounded-bl-[8px] rounded-br-[8px] rounded-tr-[8px] row-1 w-[994px]" data-name="SmallSelect">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">&nbsp;</p>
    </div>
  );
}

function IconsSolidIcCheckboxOn2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-checkbox-on">
          <path d={svgPaths.p19d65300} fill="var(--fill-0, #005EB8)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer2() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcCheckboxOn2 />
    </div>
  );
}

function Checkbox13() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer2 />
    </div>
  );
}

function Checkbox12() {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
      <Checkbox13 />
    </div>
  );
}

function Texts2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">需參與有害物質機制</p>
    </div>
  );
}

function Stack6() {
  return (
    <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
      <Texts2 />
    </div>
  );
}

function TableCell2() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[219px]" data-name="Table/Cell">
      <Checkbox12 />
      <Stack6 />
    </div>
  );
}

function Pagination3() {
  return (
    <div className="col-1 content-stretch flex h-[24px] items-center ml-[16px] mt-[8px] relative row-1 w-[219px]" data-name="Pagination">
      <TableCell2 />
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <SmallSelect10 />
      <Pagination3 />
    </div>
  );
}

function SmallSelect11() {
  return (
    <div className="bg-[rgba(0,94,184,0.08)] col-1 content-stretch flex gap-[12px] h-[40px] items-center justify-center ml-0 mt-0 pl-[12px] pr-[8px] py-[6px] relative rounded-bl-[8px] rounded-br-[8px] rounded-tr-[8px] row-1 w-[994px]" data-name="SmallSelect">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">&nbsp;</p>
    </div>
  );
}

function IconsSolidIcRadioOff() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-radio-off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-radio-off">
          <path clipRule="evenodd" d={svgPaths.p2f97b300} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer3() {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcRadioOff />
    </div>
  );
}

function Checkbox15() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer3 />
    </div>
  );
}

function Checkbox14() {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
      <Checkbox15 />
    </div>
  );
}

function Texts3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">不需付產險資料</p>
    </div>
  );
}

function Stack7() {
  return (
    <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
      <Texts3 />
    </div>
  );
}

function TableCell3() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[257px]" data-name="Table/Cell">
      <Checkbox14 />
      <Stack7 />
    </div>
  );
}

function Pagination5() {
  return (
    <div className="content-stretch flex h-[24px] items-center relative shrink-0 w-[219px]" data-name="Pagination">
      <TableCell3 />
    </div>
  );
}

function IconsSolidIcRadioOn() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-radio-on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-radio-on">
          <path clipRule="evenodd" d={svgPaths.p2f1aa000} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer4() {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcRadioOn />
    </div>
  );
}

function Checkbox17() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer4 />
    </div>
  );
}

function Checkbox16() {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
      <Checkbox17 />
    </div>
  );
}

function Texts4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">需付產險資料並mail通知</p>
    </div>
  );
}

function Stack8() {
  return (
    <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
      <Texts4 />
    </div>
  );
}

function TableCell4() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[219px]" data-name="Table/Cell">
      <Checkbox16 />
      <Stack8 />
    </div>
  );
}

function IconsSolidIcRadioOff1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-radio-off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-radio-off">
          <path clipRule="evenodd" d={svgPaths.p2f97b300} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer5() {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcRadioOff1 />
    </div>
  );
}

function Checkbox19() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer5 />
    </div>
  );
}

function Checkbox18() {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
      <Checkbox19 />
    </div>
  );
}

function Texts5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">需付產險資料，不需mail通知</p>
    </div>
  );
}

function Stack9() {
  return (
    <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
      <Texts5 />
    </div>
  );
}

function TableCell5() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[257px]" data-name="Table/Cell">
      <Checkbox18 />
      <Stack9 />
    </div>
  );
}

function Pagination6() {
  return (
    <div className="content-stretch flex h-[24px] items-center relative shrink-0 w-[257px]" data-name="Pagination">
      <TableCell5 />
    </div>
  );
}

function Pagination4() {
  return (
    <div className="col-1 content-stretch flex gap-[10px] h-[24px] items-center ml-[16px] mt-[8px] relative row-1 w-[219px]" data-name="Pagination">
      <Pagination5 />
      <TableCell4 />
      <Pagination6 />
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <SmallSelect11 />
      <Pagination4 />
    </div>
  );
}

function SmallSelect12() {
  return (
    <div className="col-1 content-stretch flex gap-[12px] h-[40px] items-center justify-center ml-0 mt-0 pl-[12px] pr-[8px] py-[6px] relative rounded-bl-[8px] rounded-br-[8px] rounded-tr-[8px] row-1 w-[994px]" data-name="SmallSelect">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#1c252e] text-[14px]">&nbsp;</p>
    </div>
  );
}

function IconsSolidIcCheckboxOn3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-checkbox-on">
          <path d={svgPaths.p19d65300} fill="var(--fill-0, #005EB8)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer6() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcCheckboxOn3 />
    </div>
  );
}

function Checkbox21() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer6 />
    </div>
  );
}

function Checkbox20() {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
      <Checkbox21 />
    </div>
  );
}

function Texts6() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">需填寫物料成份資訊</p>
    </div>
  );
}

function Stack10() {
  return (
    <div className="content-stretch flex items-center justify-center py-[8px] relative shrink-0" data-name="stack">
      <Texts6 />
    </div>
  );
}

function TableCell6() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[219px]" data-name="Table/Cell">
      <Checkbox20 />
      <Stack10 />
    </div>
  );
}

function Pagination7() {
  return (
    <div className="col-1 content-stretch flex h-[24px] items-center ml-[16px] mt-[8px] relative row-1 w-[219px]" data-name="Pagination">
      <TableCell6 />
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <SmallSelect12 />
      <Pagination7 />
    </div>
  );
}

function Frame31() {
  return (
    <div className="absolute content-stretch flex flex-col gap-px items-start leading-[0] left-[43px] top-[76px] w-[994px]">
      <Group2 />
      <Group3 />
      <Group4 />
      <Group5 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="h-[496px] relative shrink-0 w-[1080px]">
      <Group1 />
      <Pagination />
      <Frame31 />
    </div>
  );
}

function Component4() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[9px] h-[830px] items-start left-[304px] rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] top-[129px] w-[1080px]" data-name="廠商基本資料">
      <Tabs />
      <Frame29 />
      <Frame28 />
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="link">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">帳號管理</p>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="link">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">廠商帳號管理</p>
    </div>
  );
}

function LinkActive() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-center min-h-px min-w-px relative" data-name="link active">
      <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[14px] text-ellipsis whitespace-nowrap">廠商資訊</p>
    </div>
  );
}

function Links() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="links">
      <Link />
      <div className="relative shrink-0 size-[4px]" data-name="dot">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="var(--fill-0, #919EAB)" id="dot" r="2" />
        </svg>
      </div>
      <Link1 />
      <div className="relative shrink-0 size-[4px]" data-name="dot">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="var(--fill-0, #919EAB)" id="dot" r="2" />
        </svg>
      </div>
      <LinkActive />
    </div>
  );
}

function Stack11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start justify-center min-h-px min-w-[280px] relative" data-name="stack">
      <Links />
    </div>
  );
}

function Breadcrumb() {
  return (
    <div className="absolute content-start flex flex-wrap gap-[16px] items-start justify-end left-[304px] top-[85px] w-[720px]" data-name="Breadcrumb">
      <Stack11 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" data-name="廠商帳號管理">
      <LayoutDashboard />
      <Component1 />
      <Component4 />
      <Breadcrumb />
    </div>
  );
}