import svgPaths from "./svg-d2ezwvrgua";

function EndAdornment() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function Wrap() {
  return (
    <div className="h-[40px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#919eab] text-[14px] whitespace-pre-wrap">請確認公司名稱是否有誤</p>
          <EndAdornment />
        </div>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap />
    </div>
  );
}

function SmallSelect() {
  return (
    <div className="content-stretch flex h-[45px] items-center relative shrink-0 w-full" data-name="SmallSelect">
      <TextField />
    </div>
  );
}

function EndAdornment1() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function Wrap1() {
  return (
    <div className="bg-[#00559c] h-[40px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] text-center text-white whitespace-pre-wrap">退回廠商</p>
          <EndAdornment1 />
        </div>
      </div>
    </div>
  );
}

function TextField1() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap1 />
    </div>
  );
}

function SmallSelect1() {
  return (
    <div className="content-stretch flex h-[45px] items-center relative shrink-0 w-full" data-name="SmallSelect">
      <TextField1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[18px] items-start left-[64px] top-[118px] w-[643px]">
      <SmallSelect />
      <SmallSelect1 />
    </div>
  );
}

function IconsSolidIcSolarMultipleForwardLeftBroken() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:multiple-forward-left-broken">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-solar:multiple-forward-left-broken">
          <path clipRule="evenodd" d={svgPaths.p1310fb97} fill="var(--fill-0, #1877F2)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <button className="content-stretch cursor-pointer flex h-[15.764px] items-center relative shrink-0 w-[4.597px]">
      <IconsSolidIcSolarMultipleForwardLeftBroken />
    </button>
  );
}

function Component1() {
  return (
    <div className="h-[38.667px] relative shrink-0 w-[145.592px]" data-name="交貨排程">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pl-[24px] pr-[12px] py-[24px] relative size-full text-[#1c252e]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[18px]">退回原因</p>
          <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[14px]">*退回後，系統將寄信通知廠商帳號申請結果</p>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7px] items-start left-[36px] top-[42px] w-[146.002px]">
      <Frame />
      <Component1 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white relative rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] size-full" data-name="帳號申請明細">
      <Frame2 />
      <Frame1 />
    </div>
  );
}