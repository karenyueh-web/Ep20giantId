import { useEffect } from 'react';
import svgPaths from "@/imports/svg-2nf30zaffc";
import imgImage from "figma:asset/6f8230115b97ee933b04f1cc5c36c2fd194238ac.png";
import img02GiantGroupLogoWhite2 from "figma:asset/589083efc8d155f4aeebb5d7f1ec82f6c63c7b5b.png";

interface RegisterSuccessPageProps {
  onBackToLogin?: () => void;
}

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

function StartAdornment1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="✳️ start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="✳️ start adornment">
          <g id="primary-shape">
            <path d={svgPaths.p36ca1000} fill="var(--fill-0, #4CAF50)" />
            <path d={svgPaths.p27291100} fill="var(--fill-0, #4CAF50)" />
          </g>
        </g>
      </svg>
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
    <div className="h-auto min-h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-start px-[14px] py-[16px] relative size-full">
          <StartAdornment />
          <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#4caf50] text-[20px] text-left whitespace-normal">已收到您的申請，我們將盡快審核您的帳號，將以mail通知審核結果</p>
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

function Content() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="content">
      <TextField />
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

export function RegisterSuccessPage({ onBackToLogin }: RegisterSuccessPageProps) {
  // Auto redirect to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onBackToLogin) {
        onBackToLogin();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [onBackToLogin]);

  return (
    <div className="bg-white content-stretch flex items-center relative size-full" data-name="login-註冊成功">
      <Stack />
    </div>
  );
}