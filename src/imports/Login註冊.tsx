import svgPaths from "./svg-9lma1oefe7";
import imgImage from "figma:asset/6f8230115b97ee933b04f1cc5c36c2fd194238ac.png";
import img02GiantGroupLogoWhite2 from "figma:asset/589083efc8d155f4aeebb5d7f1ec82f6c63c7b5b.png";

function Image() {
  return (
    <div className="h-[1024px] relative rounded-tr-[80px] shrink-0 w-[720px]" data-name="image">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-tr-[80px]">
        <div className="absolute inset-0 overflow-hidden rounded-tr-[80px]">
          <img alt="" className="absolute h-full left-[-236.64%] max-w-none top-0 w-[426.67%]" src={imgImage} />
        </div>
        <div className="absolute inset-0 rounded-tr-[80px]" style={{ backgroundImage: "linear-gradient(238.464deg, rgba(255, 255, 255, 0.45) 8.3009%, rgba(0, 0, 0, 0.45) 42.876%)" }} />
      </div>
      <div className="absolute flex h-[906.755px] items-center justify-center left-[41px] top-[27px] w-[290.13px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[90.39deg]">
          <div className="h-[283.992px] w-[904.847px]" data-name="02_Giant Group_Logo_White 1" />
        </div>
      </div>
      <div className="absolute h-[146.257px] left-[127px] top-[407px] w-[466px]" data-name="02_Giant Group_Logo_White 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover opacity-60 pointer-events-none size-full" src={img02GiantGroupLogoWhite2} />
      </div>
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[352px]" data-name="stack">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[24px] min-h-px min-w-px not-italic relative text-[#535862] text-[16px] text-center whitespace-pre-wrap">Welcome to Giant Group Purchasing Information Management Platform</p>
    </div>
  );
}

function Head() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-name="head">
      <p className="font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[38px] min-w-full not-italic relative shrink-0 text-[#1c252e] text-[30px] text-center w-[min-content] whitespace-pre-wrap">巨大線上供應商作業平台</p>
      <Stack2 />
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="stack">
      <Head />
    </div>
  );
}

function Button() {
  return (
    <div className="h-[21px] min-w-[64px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[10px] relative size-full">
          <p className="font-['Roboto:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[24px] relative shrink-0 text-[#637381] text-[16px] tracking-[0.15px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            註冊帳號
          </p>
        </div>
      </div>
    </div>
  );
}

function LabelFocus() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">姓名</p>
    </div>
  );
}

function EndAdornment() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function Wrap() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">五佰</p>
          <LabelFocus />
          <EndAdornment />
        </div>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <Wrap />
    </div>
  );
}

function LabelFocus1() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">廠商公司完整名稱</p>
    </div>
  );
}

function EndAdornment1() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function Wrap1() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">XXXX股份有限公司</p>
          <LabelFocus1 />
          <EndAdornment1 />
        </div>
      </div>
    </div>
  );
}

function TextField1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <Wrap1 />
    </div>
  );
}

function LabelFocus2() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">申請角色</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill">
          <path d={svgPaths.p3a1c00f0} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function EndAdornment3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px]" data-name="✳️ end adornment">
      <IconsSolidIcEvaArrowIosDownwardFill />
    </div>
  );
}

function EndAdornment2() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment">
      <EndAdornment3 />
    </div>
  );
}

function Wrap2() {
  return (
    <div className="absolute content-stretch flex h-[54px] items-center left-0 px-[14px] rounded-[8px] top-0 w-[352px]" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <LabelFocus2 />
      <EndAdornment2 />
    </div>
  );
}

function TextField2() {
  return (
    <div className="absolute h-[54px] left-0 top-0 w-[352px]" data-name="TextField">
      <Wrap2 />
    </div>
  );
}

function LabelContainer() {
  return (
    <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0" data-name="label container">
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">業務</p>
    </div>
  );
}

function Action() {
  return (
    <div className="mr-[-2px] relative shrink-0 size-[20px]" data-name="action">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g opacity="0.48">
          <path clipRule="evenodd" d={svgPaths.p9f8dc70} fill="var(--fill-0, #1C252E)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Chip() {
  return (
    <div className="bg-[rgba(0,94,184,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] relative rounded-[8px] shrink-0" data-name="Chip">
      <LabelContainer />
      <Action />
    </div>
  );
}

function LabelContainer1() {
  return (
    <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0" data-name="label container">
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">品保</p>
    </div>
  );
}

function Action1() {
  return (
    <div className="mr-[-2px] relative shrink-0 size-[20px]" data-name="action">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g opacity="0.48">
          <path clipRule="evenodd" d={svgPaths.p9f8dc70} fill="var(--fill-0, #1C252E)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Chip1() {
  return (
    <div className="bg-[rgba(0,94,184,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] relative rounded-[8px] shrink-0" data-name="Chip">
      <LabelContainer1 />
      <Action1 />
    </div>
  );
}

function LabelContainer2() {
  return (
    <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0" data-name="label container">
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">開發</p>
    </div>
  );
}

function Action2() {
  return (
    <div className="mr-[-2px] relative shrink-0 size-[20px]" data-name="action">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g opacity="0.48">
          <path clipRule="evenodd" d={svgPaths.p9f8dc70} fill="var(--fill-0, #1C252E)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Chip2() {
  return (
    <div className="bg-[rgba(0,94,184,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] relative rounded-[8px] shrink-0" data-name="Chip">
      <LabelContainer2 />
      <Action2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex gap-[9px] items-center left-[14px] top-[14px]">
      <Chip />
      <Chip1 />
      <Chip2 />
    </div>
  );
}

function Stack3() {
  return (
    <div className="h-[54px] relative shrink-0 w-full" data-name="stack">
      <TextField2 />
      <Frame />
    </div>
  );
}

function LabelFocus3() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">email(視同帳號)</p>
    </div>
  );
}

function EndAdornment4() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function Wrap3() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">demo@minimals.cc</p>
          <LabelFocus3 />
          <EndAdornment4 />
        </div>
      </div>
    </div>
  );
}

function TextField3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <Wrap3 />
    </div>
  );
}

function LabelFocus4() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">Password</p>
    </div>
  );
}

function EndAdornment5() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function StartAdornment() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="start adornment">
          <path d={svgPaths.p3f4b1500} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function SelectArrow() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex items-center pr-[10px] right-0 top-1/2" data-name="select arrow">
      <StartAdornment />
    </div>
  );
}

function Wrap4() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis whitespace-nowrap">6+ characters</p>
          <LabelFocus4 />
          <EndAdornment5 />
          <SelectArrow />
        </div>
      </div>
    </div>
  );
}

function TextField4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <Wrap4 />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="stack">
      <TextField4 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-black h-[48px] min-w-[64px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[16px] relative size-full">
          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[15px] text-white">Create account</p>
        </div>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
      <Button />
      <TextField />
      <TextField1 />
      <Stack3 />
      <TextField3 />
      <Stack4 />
      <Button1 />
    </div>
  );
}

function Auth() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[420px] relative rounded-[16px] shrink-0 w-[352px]" data-name="Auth">
      <Stack1 />
      <Content />
    </div>
  );
}

function Stack() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[165px] h-full items-center min-h-px min-w-px relative" data-name="stack">
      <Image />
      <Auth />
    </div>
  );
}

export default function Login() {
  return (
    <div className="bg-white content-stretch flex items-center relative size-full" data-name="login-註冊">
      <Stack />
    </div>
  );
}