import svgPaths from "./svg-g5za5i81de";

function SmallSelectIconsSolidIcEvaArrowIosDownwardFill({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]" data-name="primary-shape">
        {children}
      </div>
    </div>
  );
}

function SmallSelectHelper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center size-full">
      <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">{children}</div>
    </div>
  );
}

function PrimaryShape({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute inset-[8.33%]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        {children}
      </svg>
    </div>
  );
}
type StackProps = {
  text: string;
  text1: string;
};

function Stack({ text, text1 }: StackProps) {
  return (
    <div className="content-stretch flex flex-col font-normal gap-[4px] h-[60px] items-start leading-[22px] relative shrink-0 text-[14px] w-[150px]">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] h-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-ellipsis w-full whitespace-nowrap">{text}</p>
      <p className="font-['Public_Sans:Regular',sans-serif] relative shrink-0 text-[#919eab] w-full">{text1}</p>
    </div>
  );
}
type SmallSelectProps = {
  className?: string;
  property1?: "Default" | "radio/enable" | "disable";
};

function SmallSelect({ className, property1 = "Default" }: SmallSelectProps) {
  const isRadioEnableOrDisable = ["radio/enable", "disable"].includes(property1);
  return (
    <div className={className || `relative ${isRadioEnableOrDisable ? "-translate-y-1/2" : ""}`}>
      <div className={`flex ${isRadioEnableOrDisable ? "flex-row items-center justify-center size-full" : "content-stretch items-start relative"}`}>
        {isRadioEnableOrDisable && (
          <div className="content-stretch flex gap-[10px] items-center justify-center relative">
            <div className="relative shrink-0" data-name="Radio">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center relative">
                  <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
                    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icons/solid/ic-radio-off">
                      <PrimaryShape>
                        <path clipRule="evenodd" d={svgPaths.p1adebd00} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" id="primary-shape" />
                      </PrimaryShape>
                    </div>
                  </div>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">UnChecked</p>
                </div>
              </div>
            </div>
            <div className={`relative rounded-[8px] shrink-0 w-[138px] ${property1 === "disable" ? "bg-[rgba(145,158,171,0.32)]" : ""}`} data-name="SmallSelect">
              <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <SmallSelectHelper>
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">Value</p>
                <SmallSelectIconsSolidIcEvaArrowIosDownwardFill>
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0245 7.00364">
                    <path d={svgPaths.p3c609d00} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                  </svg>
                </SmallSelectIconsSolidIcEvaArrowIosDownwardFill>
              </SmallSelectHelper>
            </div>
          </div>
        )}
        {property1 === "Default" && (
          <div className="relative rounded-[8px] shrink-0 w-[138px]" data-name="SmallSelect">
            <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <SmallSelectHelper>
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] whitespace-nowrap">2025/01/10</p>
              <SmallSelectIconsSolidIcEvaArrowIosDownwardFill>
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.34969 4.66909">
                  <path d={svgPaths.p29522f00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                </svg>
              </SmallSelectIconsSolidIcEvaArrowIosDownwardFill>
            </SmallSelectHelper>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute contents left-0 top-0">
        <div className="absolute bg-white h-[268px] left-0 rounded-[8px] top-0 w-[1143.002px]">
          <div className="absolute bg-white content-stretch flex gap-[20px] items-center left-[0.44px] px-[20px] py-[10px] rounded-tl-[8px] rounded-tr-[8px] top-0 w-[791px]">
            <Stack text="項次" text1="1" />
            <Stack text="預計交期" text1="2025/01/10" />
            <Stack text="廠商可交貨日期" text1="2025/01/10" />
            <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#ff3b30] text-[14px] text-ellipsis w-full whitespace-nowrap">生管端交貨日期</p>
              <SmallSelect className="relative shrink-0" />
            </div>
            <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#ff3030] text-[14px] text-ellipsis w-full whitespace-nowrap">交貨量</p>
              <div className="h-[34px] relative shrink-0 w-[150px]" data-name="TextField">
                <div className="content-stretch flex flex-col items-start relative size-full">
                  <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] w-full" data-name="wrap">
                    <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                    <div className="flex flex-row items-center size-full">
                      <div className="content-stretch flex items-center px-[14px] relative size-full">
                        <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal h-[22px] leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis whitespace-nowrap">100</p>
                        <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute left-[851.01px] overflow-clip size-[36px] top-[36.36px]" data-name="icons/solid/ic-solar:add-circle-bold">
            <PrimaryShape>
              <path clipRule="evenodd" d={svgPaths.pa468400} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" id="primary-shape" />
            </PrimaryShape>
          </div>
        </div>
      </div>
    </div>
  );
}