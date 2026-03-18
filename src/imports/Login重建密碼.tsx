import svgPaths from "./svg-0q8h3xf1oa";
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
      <div className="absolute flex h-[906.755px] items-center justify-center left-[41px] top-[27px] w-[290.13px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
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
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[24px] min-h-px min-w-px not-italic relative text-[#535862] text-[16px] text-center whitespace-pre-wrap">Welcome to Giant Group vendor online operation platform</p>
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

function Vector() {
  return (
    <div className="absolute contents inset-[6.82%_6.26%_6.52%_9.59%]" data-name="vector">
      <div className="absolute inset-[6.82%_6.26%_6.52%_9.59%]" data-name="color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80.7869 83.2024">
          <g id="color">
            <path d={svgPaths.p6712500} fill="var(--fill-0, #005EB8)" />
            <path d={svgPaths.p82ca00} fill="var(--fill-0, #005EB8)" />
          </g>
        </svg>
      </div>
      <div className="absolute inset-[6.82%_6.26%_6.52%_9.59%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
    </div>
  );
}

function IconsOtherIcEmailSent() {
  return (
    <div className="overflow-clip relative shrink-0 size-[96px]" data-name="icons/other/ic-email-sent">
      <div className="absolute inset-[16.59%_16.06%_6.52%_29.38%]" data-name="vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52.3707 73.8216">
          <path d={svgPaths.p1ee49980} fill="var(--fill-0, #00559C)" id="vector" />
        </svg>
      </div>
      <Vector />
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 text-center w-full whitespace-pre-wrap" data-name="stack">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#1c252e] text-[20px] w-full">Please reset password</p>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] max-w-[380px] relative shrink-0 text-[#637381] text-[14px] w-full">請重置密碼</p>
    </div>
  );
}

function Head1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-end relative shrink-0 w-full" data-name="head">
      <IconsOtherIcEmailSent />
      <Stack3 />
    </div>
  );
}

function LabelFocus() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">Email address</p>
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
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[24px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[16px] text-ellipsis whitespace-nowrap">demo@minimals.cc</p>
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

function IconsSolidIcSolarEyeClosedBold() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:eye-closed-bold">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-solar:eye-closed-bold">
          <path clipRule="evenodd" d={svgPaths.p2349d00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function EndAdornment2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px]" data-name="✳️ end adornment">
      <IconsSolidIcSolarEyeClosedBold />
    </div>
  );
}

function EndAdornment1() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment">
      <EndAdornment2 />
    </div>
  );
}

function Wrap1() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis whitespace-nowrap">Password</p>
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

function IconsSolidIcSolarEyeClosedBold1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:eye-closed-bold">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-solar:eye-closed-bold">
          <path clipRule="evenodd" d={svgPaths.p2349d00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function EndAdornment4() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px]" data-name="✳️ end adornment">
      <IconsSolidIcSolarEyeClosedBold1 />
    </div>
  );
}

function EndAdornment3() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment">
      <EndAdornment4 />
    </div>
  );
}

function Wrap2() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis whitespace-nowrap">Confirm New Password</p>
          <EndAdornment3 />
        </div>
      </div>
    </div>
  );
}

function TextField2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <Wrap2 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#1c252e] h-[48px] min-w-[64px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[16px] relative size-full">
          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[15px] text-white">Update password</p>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosBackFill() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-back-fill">
          <path d={svgPaths.p36867980} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="stack">
      <IconsSolidIcEvaArrowIosBackFill />
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">Return to sign in</p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
      <TextField />
      <TextField1 />
      <TextField2 />
      <Button />
      <Stack4 />
    </div>
  );
}

function AuthFormUpdatePassword() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-center justify-end max-w-[420px] relative rounded-[16px] shrink-0 w-[400px]" data-name="Auth/Form/UpdatePassword">
      <Head1 />
      <Content1 />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="content">
      <AuthFormUpdatePassword />
    </div>
  );
}

function Auth() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[420px] relative rounded-[16px] shrink-0 w-[420px]" data-name="Auth">
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
    <div className="bg-white content-stretch flex items-center relative size-full" data-name="login-重建密碼">
      <Stack />
    </div>
  );
}