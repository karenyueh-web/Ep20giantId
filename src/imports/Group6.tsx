import svgPaths from "./svg-ymkervaun9";

function Stack() {
  return (
    <div className="absolute inset-[0.17%_0_3.69%_0]" data-name="stack">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.0001 34.6104">
        <g id="stack">
          <path clipRule="evenodd" d={svgPaths.p394a5c00} fill="url(#paint0_linear_41_6249)" fillRule="evenodd" id="vector" />
          <path clipRule="evenodd" d={svgPaths.p24400500} fill="url(#paint1_linear_41_6249)" fillRule="evenodd" id="vector_2" />
          <g id="vector_3" opacity="0.48">
            <path clipRule="evenodd" d={svgPaths.p9c7a500} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p93aab80} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p824e980} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
          </g>
          <g id="vector_4">
            <path d={svgPaths.p3cf27300} fill="var(--fill-0, white)" />
            <path d={svgPaths.p34712180} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3c272500} fill="var(--fill-0, white)" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_41_6249" x1="12.2341" x2="36.0001" y1="10.8444" y2="34.6104">
            <stop stopColor="#77ED8B" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_41_6249" x1="0" x2="28.9534" y1="0.000213118" y2="28.9537">
            <stop stopColor="#00B8D9" />
            <stop offset="1" stopColor="#006C9C" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function IconsNotificationsIcChat() {
  return (
    <div className="relative shrink-0 size-[36px]" data-name="icons/notifications/ic-chat">
      <Stack />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <IconsNotificationsIcChat />
      <p className="[text-decoration-skip-ink:none] css-ew64yg decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#005eb8] text-[16px] underline" style={{ fontVariationSettings: "'wdth' 100" }}>
        歷程
      </p>
    </div>
  );
}

function DialogActions() {
  return (
    <div className="content-stretch flex gap-[12px] h-[55px] items-center justify-end p-[24px] relative shrink-0 w-[505px]" data-name="DialogActions">
      <Frame1 />
    </div>
  );
}

function DialogActions1() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[94.266px] items-center justify-end left-[408.78px] p-[24px] top-0 w-[763.651px]" data-name="DialogActions">
      <DialogActions />
    </div>
  );
}

function Component() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[94.266px] items-center left-[0.25px] pl-[24px] pr-[12px] py-[24px] top-0 w-[358.007px]" data-name="交貨排程">
      <p className="css-4hzbpn font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] w-[214px]">請選擇異動原因</p>
    </div>
  );
}

function Wrap() {
  return (
    <div className="flex-[1_0_0] min-h-[98px] min-w-px relative rounded-[8px] w-full" data-name="wrap">
      <div className="min-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start min-h-[inherit] px-[14px] py-[16px] relative size-full">
          <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px]">&nbsp;</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function IconsSolidIcSolarInfoCircleBold() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-solar:info-circle-bold">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-solar:info-circle-bold">
          <path clipRule="evenodd" d={svgPaths.p144ee300} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function HelperText() {
  return (
    <div className="relative shrink-0 w-full" data-name="✳️ helper text">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[4px] items-center pb-0 pl-[12px] pr-0 pt-[8px] relative w-full">
          <IconsSolidIcSolarInfoCircleBold />
          <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[18px] min-h-px min-w-px relative text-[#637381] text-[12px]">異動原因送出後不可再進行修改，請確認後再送出</p>
        </div>
      </div>
    </div>
  );
}

function Textarea() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[496.712px] items-start left-[28.25px] rounded-[8px] top-[74px] w-[1148px]" data-name="Textarea">
      <Wrap />
      <HelperText />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[28.25px] top-[74px]">
      <Textarea />
    </div>
  );
}

function IconsSolidIcRadioOn() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-radio-on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-radio-on">
          <path clipRule="evenodd" d={svgPaths.p27863c80} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer() {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcRadioOn />
    </div>
  );
}

function Radio() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Radio">
      <IconContainer />
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">需修改交期為</p>
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
    <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative rounded-[8px] shrink-0 w-[138px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">2025/01/10</p>
      <IconsSolidIcEvaArrowIosDownwardFill />
    </div>
  );
}

function SmallSelect1() {
  return (
    <div className="col-1 content-stretch flex gap-[10px] items-center justify-center ml-0 mt-0 relative row-1" data-name="SmallSelect">
      <Radio />
      <SmallSelect />
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill"></g>
      </svg>
    </div>
  );
}

function SmallSelect2() {
  return (
    <div className="col-1 content-stretch flex gap-[12px] items-center ml-[288px] mt-[3px] pl-[12px] pr-[8px] py-[6px] relative rounded-[8px] row-1 w-[816px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">請簡述原因，限50字</p>
      <IconsSolidIcEvaArrowIosDownwardFill1 />
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <SmallSelect1 />
      <SmallSelect2 />
    </div>
  );
}

function IconsSolidIcRadioOff() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-radio-off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-radio-off">
          <path clipRule="evenodd" d={svgPaths.p3b336900} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer1() {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcRadioOff />
    </div>
  );
}

function Radio1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Radio">
      <IconContainer1 />
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">不接單</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill"></g>
      </svg>
    </div>
  );
}

function SmallSelect3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">請簡述原因，限50字</p>
          <IconsSolidIcEvaArrowIosDownwardFill2 />
        </div>
      </div>
    </div>
  );
}

function SmallSelect4() {
  return (
    <div className="content-stretch flex gap-[10px] h-[40px] items-center justify-center relative shrink-0 w-full" data-name="SmallSelect">
      <Radio1 />
      <SmallSelect3 />
    </div>
  );
}

function IconsSolidIcRadioOff1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-radio-off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-radio-off">
          <path clipRule="evenodd" d={svgPaths.p3b336900} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer2() {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcRadioOff1 />
    </div>
  );
}

function Radio2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Radio">
      <IconContainer2 />
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">需拆期</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill"></g>
      </svg>
    </div>
  );
}

function SmallSelect5() {
  return (
    <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] relative rounded-[8px] shrink-0" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">請輸入期數</p>
      <IconsSolidIcEvaArrowIosDownwardFill3 />
    </div>
  );
}

function SmallSelect6() {
  return (
    <div className="content-stretch flex gap-[10px] h-[40px] items-center relative shrink-0 w-full" data-name="SmallSelect">
      <Radio2 />
      <SmallSelect5 />
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex flex-col font-normal gap-[4px] h-[60px] items-start leading-[22px] relative shrink-0 text-[14px] w-[150px]" data-name="stack">
      <p className="css-g0mm18 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] h-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-ellipsis w-full">項次</p>
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] relative shrink-0 text-[#919eab] w-full">1</p>
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex flex-col font-normal gap-[4px] h-[60px] items-start leading-[22px] relative shrink-0 text-[14px] w-[150px]" data-name="stack">
      <p className="css-g0mm18 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] h-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-ellipsis w-full">預計交期</p>
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] relative shrink-0 text-[#919eab] w-full">2025/01/10</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill4() {
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

function SmallSelect7() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative rounded-[8px] shrink-0 w-[138px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">2025/01/10</p>
      <IconsSolidIcEvaArrowIosDownwardFill4 />
    </div>
  );
}

function SmallSelect8() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="SmallSelect">
      <SmallSelect7 />
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
      <p className="css-g0mm18 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#ff3030] text-[14px] text-ellipsis w-full">廠商可交貨日期</p>
      <SmallSelect8 />
    </div>
  );
}

function EndAdornment() {
  return <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />;
}

function Wrap1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <p className="css-g0mm18 font-['Public_Sans:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#919eab] text-[15px] text-ellipsis w-[292px]">50</p>
          <EndAdornment />
        </div>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="content-stretch flex flex-col h-[34px] items-start relative shrink-0 w-[150px]" data-name="TextField">
      <Wrap1 />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
      <p className="css-g0mm18 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#ff3030] text-[14px] text-ellipsis w-full">交貨量</p>
      <TextField />
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-white h-[61px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[20px] items-center px-[45px] py-[10px] relative size-full">
          <Stack1 />
          <Stack2 />
          <Stack3 />
          <Stack4 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] h-[228.17px] items-start left-[48.25px] top-[103.65px] w-[1104px]">
      <Group3 />
      <SmallSelect4 />
      <SmallSelect6 />
      <Frame />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[28.25px] top-[74px]">
      <Group />
      <Frame2 />
    </div>
  );
}

function PrimaryAction() {
  return (
    <div className="bg-[#004680] flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ primary action">
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] py-0 relative size-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white">
            <p className="css-ew64yg leading-[24px]">提交採購</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecondaryAction() {
  return (
    <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ secondary action">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] py-0 relative size-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1c252e] text-[14px] text-center">
            <p className="css-ew64yg leading-[24px]">取消</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DialogActions2() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[94.266px] items-center justify-end left-[28.87px] p-[24px] top-[593.02px] w-[1143.312px]" data-name="DialogActions">
      <PrimaryAction />
      <SecondaryAction />
    </div>
  );
}

export default function Group2() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#f4f6f8] h-[689.002px] left-0 rounded-[8px] top-0 w-[1203.942px]" />
      <DialogActions1 />
      <Component />
      <Group1 />
      <DialogActions2 />
    </div>
  );
}