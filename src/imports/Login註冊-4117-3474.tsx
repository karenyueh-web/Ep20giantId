import svgPaths from "./svg-blfjb9is82";
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

function IconsOtherIcPassword() {
  return (
    <div className="overflow-clip relative shrink-0 size-[96px]" data-name="icons/other/ic-password">
      <div className="absolute inset-[8.33%_27.61%_56.3%_27.83%]" data-name="color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42.7813 33.9535">
          <path d={svgPaths.p1a84e780} fill="var(--fill-0, #FFD666)" id="color" />
        </svg>
      </div>
      <div className="absolute inset-[8.33%_27.61%_56.3%_27.83%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
      <div className="absolute inset-[41.25%_17.48%_8.33%_17.71%]" data-name="color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62.2169 48.4046">
          <path clipRule="evenodd" d={svgPaths.p832c140} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="color" />
        </svg>
      </div>
      <div className="absolute inset-[41.25%_17.48%_8.33%_17.71%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
      <div className="absolute inset-[49.51%_39.53%_16.62%_39.76%]" data-name="color">
        <div className="absolute inset-[0_0_0_0.42%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.796 32.5204">
            <path clipRule="evenodd" d={svgPaths.pb105e80} fill="var(--fill-0, white)" fillRule="evenodd" id="color" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center overflow-clip relative shrink-0 text-center w-full whitespace-pre-wrap" data-name="stack">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#1c252e] text-[20px] w-full">Forgot your password?</p>
      <p className="font-['Roboto:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[24px] max-w-[380px] relative shrink-0 text-[#637381] text-[16px] tracking-[0.15px] w-full" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        請輸入您的帳號email，我們將寄重置流程至您的信箱
      </p>
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
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis whitespace-nowrap">example@gmail.com</p>
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

function Button() {
  return (
    <div className="bg-[#1c252e] h-[48px] min-w-[64px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[16px] relative size-full">
          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[15px] text-white">Send request</p>
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
      <Button />
      <Stack4 />
    </div>
  );
}

function Head1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-end relative shrink-0 w-full" data-name="head">
      <IconsOtherIcPassword />
      <Stack3 />
      <Content1 />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="content">
      <Head1 />
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