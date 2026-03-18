import svgPaths from "./svg-ehas7th67d";
import imgImgAvatar25 from "figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import imgStack from "figma:asset/1a64bb29b96d52f74d342ea173c7a5a5756e6710.png";

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

function Button1() {
  return (
    <div className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">My setting</p>
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
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">繁中</p>
      <IconsSolidIcEvaArrowIosDownwardFill />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Button1 />
      <SmallSelect />
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center pb-[16px] pt-[12px] relative shrink-0 w-full" data-name="stack">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic overflow-hidden relative shrink-0 text-[#181d27] text-[14px] text-center text-ellipsis">GTM採購</p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-center text-ellipsis">hudson.alvarez@giant.com</p>
      <Frame />
    </div>
  );
}

function Component2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-end relative shrink-0 w-[248px]" data-name="巨大角色">
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

function StartIcon() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="start icon">
          <path d={svgPaths.p19ffc700} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon />
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Columns</p>
    </div>
  );
}

function StartIcon1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="start icon">
          <path d={svgPaths.p1f75ca00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon1 />
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Filters</p>
    </div>
  );
}

function StartIcon2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="start icon">
          <path d={svgPaths.p1cc51300} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon2 />
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Export</p>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">更新業務名單</p>
      </div>
    </div>
  );
}

function DataGridToolbar() {
  return (
    <div className="bg-white flex-[1_0_0] h-[62px] min-h-px min-w-px relative" data-name="DataGrid/Toolbar">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-end px-[20px] relative size-full">
          <Button2 />
          <Button3 />
          <Button4 />
          <Button5 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full">
      <DataGridToolbar />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">廠商名稱</p>
    </div>
  );
}

function TableCell() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack4 />
    </div>
  );
}

function Stack5() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">廠商完整名稱</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack5 />
    </div>
  );
}

function Stack6() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">電話</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack6 />
    </div>
  );
}

function Stack7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">地址</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[300px]" data-name="Table/Cell">
      <Stack7 />
    </div>
  );
}

function Stack8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">業務數</p>
    </div>
  );
}

function TableCell4() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack8 />
    </div>
  );
}

function Stack9() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">傳真</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack9 />
    </div>
  );
}

function Stack10() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">&nbsp;</p>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" data-name="Table/Cell">
      <Stack10 />
    </div>
  );
}

function Stack11() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="stack">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[4px] items-center p-[16px] w-full" />
      </div>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <Stack11 />
    </div>
  );
}

function TableOrderHead() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-name="Table/Order/Head">
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
      <TableCell5 />
      <TableCell6 />
      <TableCell7 />
    </div>
  );
}

function Texts() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[15px] underline">久廣(0001000531)</p>
    </div>
  );
}

function Stack12() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts />
    </div>
  );
}

function TableCell8() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack12 />
    </div>
  );
}

function Texts1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">久廣實業股份有限公司</p>
    </div>
  );
}

function Stack13() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts1 />
    </div>
  );
}

function TableCell9() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack13 />
    </div>
  );
}

function Texts2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">+886-37-756558</p>
    </div>
  );
}

function Stack14() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts2 />
    </div>
  );
}

function TableCell10() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack14 />
    </div>
  );
}

function Texts3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">苗栗縣通霄鎮中正路73號</p>
    </div>
  );
}

function Stack15() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts3 />
    </div>
  );
}

function TableCell11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[300px]" data-name="Table/Cell">
      <Stack15 />
    </div>
  );
}

function Texts4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline">4</p>
    </div>
  );
}

function Stack16() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts4 />
    </div>
  );
}

function TableCell12() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack16 />
    </div>
  );
}

function Texts5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">+886-3-7750836</p>
    </div>
  );
}

function Stack17() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts5 />
    </div>
  );
}

function TableCell13() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack17 />
    </div>
  );
}

function TableOrderHead1() {
  return (
    <div className="h-[76px] relative shrink-0 w-full" data-name="Table/Order/Head">
      <div className="content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
        <TableCell8 />
        <TableCell9 />
        <TableCell10 />
        <TableCell11 />
        <TableCell12 />
        <TableCell13 />
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Scroll() {
  return (
    <div className="relative shrink-0 w-full" data-name="Scroll">
      <div className="content-stretch flex items-start pl-[88px] pr-[50px] py-[4px] relative w-full">
        <div className="bg-[#637381] h-[6px] opacity-48 rounded-[12px] shrink-0 w-[64px]" data-name="scroll" />
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill2() {
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

function Select() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="select">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">5</p>
      <IconsSolidIcEvaArrowIosDownwardFill2 />
    </div>
  );
}

function IconsSolidIcEvaArrowIosBackFill1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-eva:arrow-ios-back-fill">
          <path d={svgPaths.p2c284900} fill="var(--fill-0, #919EAB)" fillOpacity="0.8" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconButton() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
      <IconsSolidIcEvaArrowIosBackFill1 />
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-forward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-eva:arrow-ios-forward-fill">
          <path d={svgPaths.p1543700} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconButton1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
      <IconsSolidIcEvaArrowIosForwardFill />
    </div>
  );
}

function NextPrev() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="next/prev">
      <IconButton />
      <IconButton1 />
    </div>
  );
}

function TablePagination() {
  return (
    <div className="content-stretch flex gap-[20px] items-center justify-center overflow-clip px-[8px] py-[10px] relative shrink-0 w-[1080px]" data-name="Table/Pagination">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center">Rows per page:</p>
      <Select />
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">6-10 of 11</p>
      <NextPrev />
    </div>
  );
}

function TableOrder() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 w-full" data-name="Table/Order">
      <Frame1 />
      <TableOrderHead />
      <TableOrderHead1 />
      <Scroll />
      <TablePagination />
    </div>
  );
}

function Component4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[304px] top-[129px]" data-name="廠商帳號管理">
      <TableOrder />
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

function LinkActive() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-center min-h-px min-w-px overflow-clip relative" data-name="link active">
      <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[14px] text-ellipsis whitespace-nowrap">廠商帳號管理</p>
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
      <LinkActive />
    </div>
  );
}

function Stack18() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start justify-center min-h-px min-w-[280px] relative" data-name="stack">
      <Links />
    </div>
  );
}

function Breadcrumb() {
  return (
    <div className="absolute content-start flex flex-wrap gap-[16px] items-start justify-end left-[304px] top-[85px] w-[720px]" data-name="Breadcrumb">
      <Stack18 />
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