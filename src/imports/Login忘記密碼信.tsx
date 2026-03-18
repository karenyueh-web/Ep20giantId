import svgPaths from "./svg-zhfmxhjy4a";
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
    <div className="absolute contents inset-[8.33%_16.67%_37.5%_16.67%]" data-name="vector">
      <div className="absolute inset-[8.33%_16.67%_37.5%_16.67%]" data-name="color">
        <div className="absolute inset-[-7.69%_-18.75%_-23.08%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 68">
            <g filter="url(#filter0_di_4118_2655)" id="color">
              <path clipRule="evenodd" d={svgPaths.p307f7b80} fill="var(--fill-0, #FFD666)" fillRule="evenodd" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="68" id="filter0_di_4118_2655" width="80" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="4" dy="4" />
                <feGaussianBlur stdDeviation="4" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.717647 0 0 0 0 0.431373 0 0 0 0 0 0 0 0 0.16 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4118_2655" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_4118_2655" mode="normal" result="shape" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="-1" dy="-1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.717647 0 0 0 0 0.431373 0 0 0 0 0 0 0 0 0.48 0" />
                <feBlend in2="shape" mode="normal" result="effect2_innerShadow_4118_2655" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%_16.67%_37.5%_16.67%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
    </div>
  );
}

function Vector1() {
  return (
    <div className="absolute inset-[20.83%_33.33%_58.33%_29.17%]" data-name="vector">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 20">
        <g id="vector">
          <g id="color">
            <path d={svgPaths.p10b18500} fill="var(--fill-0, #B76E00)" />
            <path d={svgPaths.p31ca6180} fill="var(--fill-0, #B76E00)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Vector2() {
  return (
    <div className="absolute contents inset-[26.05%_6.25%_8.33%_6.25%]" data-name="vector">
      <div className="absolute inset-[26.05%_6.25%_8.33%_6.25%]" data-name="color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 62.996">
          <path d={svgPaths.p367c5600} fill="var(--fill-0, #005EB8)" id="color" />
        </svg>
      </div>
      <div className="absolute inset-[26.05%_6.25%_8.33%_6.25%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
    </div>
  );
}

function IconsOtherIcEmailInbox() {
  return (
    <div className="overflow-clip relative shrink-0 size-[96px]" data-name="icons/other/ic-email-inbox">
      <Vector />
      <Vector1 />
      <Vector2 />
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center overflow-clip relative shrink-0 text-center w-full whitespace-pre-wrap" data-name="stack">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#1c252e] text-[20px] w-full">Please check your email!</p>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] max-w-[380px] relative shrink-0 text-[#637381] text-[14px] w-full">寄送成功，請至email收信</p>
    </div>
  );
}

function Head1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-end relative shrink-0 w-full" data-name="head">
      <IconsOtherIcEmailInbox />
      <Stack3 />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex gap-[4px] items-start leading-[22px] relative shrink-0 text-[14px]" data-name="stack">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#1c252e]">{`Don’t have a mail? `}</p>
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#005eb8]">{` Resend mail`}</p>
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

function Stack5() {
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
      <Stack4 />
      <Stack5 />
    </div>
  );
}

function AuthFormUpdatePassword() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-center justify-end max-w-[420px] relative rounded-[16px] shrink-0 w-[400px]" data-name="Auth/Form/UpdatePassword">
      <Content1 />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
      <Head1 />
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
    <div className="bg-white content-stretch flex items-center relative size-full" data-name="login-忘記密碼信">
      <Stack />
    </div>
  );
}