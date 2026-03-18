import clsx from "clsx";
import svgPaths from "./svg-mc6wfnflg0";

function IconsSolidIcEvaArrowIosDownwardFill({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]" data-name="primary-shape">
        {children}
      </div>
    </div>
  );
}

function Wrapper4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center size-full">
      <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">{children}</div>
    </div>
  );
}

function Wrapper3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
      <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative size-full">{children}</div>
    </div>
  );
}
type SmallSelect2Props = {
  additionalClassNames?: string;
};

function SmallSelect2({ children, additionalClassNames = "" }: React.PropsWithChildren<SmallSelect2Props>) {
  return (
    <div className={clsx("relative rounded-[8px]", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">{children}</div>
    </div>
  );
}

function Wrapper2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative">{children}</div>
      </div>
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="absolute inset-[8.33%]" data-name="primary-shape">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          {children}
        </svg>
      </div>
    </div>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0">
      <Wrapper1>{children}</Wrapper1>
    </div>
  );
}
type Text3Props = {
  text: string;
  additionalClassNames?: string;
};

function Text3({ text, additionalClassNames = "" }: Text3Props) {
  return (
    <div className={clsx("content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] relative", additionalClassNames)}>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] whitespace-nowrap">{text}</p>
      <div className="overflow-clip shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill" />
    </div>
  );
}
type RadioTextProps = {
  text: string;
};

function RadioText({ text }: RadioTextProps) {
  return (
    <Wrapper2>
      <Wrapper>
        <path clipRule="evenodd" d={svgPaths.p1adebd00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
      </Wrapper>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">{text}</p>
    </Wrapper2>
  );
}
type SmallSelect1Props = {
  text: string;
  text1: string;
};

function SmallSelect1({ text, text1 }: SmallSelect1Props) {
  return (
    <div className="h-[40px] relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[10px] items-center justify-center relative size-full">
          <RadioText text={text} />
          <SmallSelect2 additionalClassNames="flex-[1_0_0] min-h-px min-w-px">
            <Text3 text={text1} additionalClassNames="w-full" />
          </SmallSelect2>
        </div>
      </div>
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
type Text2Props = {
  text: string;
  additionalClassNames?: string;
};

function Text2({ text, additionalClassNames = "" }: Text2Props) {
  return (
    <div className={clsx("content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] relative", additionalClassNames)}>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] whitespace-nowrap">{text}</p>
      <div className="overflow-clip shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill" />
    </div>
  );
}
type Text1Props = {
  text: string;
};

function Text1({ text }: Text1Props) {
  return (
    <div className="flex flex-row items-center size-full">
      <Text2 text={text} additionalClassNames="w-full" />
    </div>
  );
}
type HelperProps = {
  text: string;
  text1: string;
};

function Helper({ text, text1 }: HelperProps) {
  return (
    <div className="flex flex-row items-center justify-end size-full">
      <div className="content-stretch flex gap-[12px] items-center justify-end px-[40px] py-[24px] relative size-full">
        <div className="bg-[#004680] flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ primary action">
          <Wrapper3>
            <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
              <p className="leading-[24px]">{text}</p>
            </div>
          </Wrapper3>
        </div>
        <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ secondary action">
          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <Wrapper3>
            <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">
              <p className="leading-[24px]">{text1}</p>
            </div>
          </Wrapper3>
        </div>
      </div>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <Wrapper4>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] whitespace-nowrap">{text}</p>
      <IconsSolidIcEvaArrowIosDownwardFill>
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.34969 4.66909">
          <path d={svgPaths.p29522f00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </svg>
      </IconsSolidIcEvaArrowIosDownwardFill>
    </Wrapper4>
  );
}
type SmallSelectProps = {
  className?: string;
  property1?: "Default" | "radio/enable" | "disable";
};

function SmallSelect({ className, property1 = "Default" }: SmallSelectProps) {
  const isDisable = property1 === "disable";
  const isRadioEnableOrDisable = ["radio/enable", "disable"].includes(property1);
  return (
    <div className={className || `relative ${isRadioEnableOrDisable ? "-translate-y-1/2" : ""}`}>
      <div className={`flex ${isRadioEnableOrDisable ? "flex-row items-center justify-center size-full" : "content-stretch items-start relative"}`}>
        {isRadioEnableOrDisable && (
          <div className="content-stretch flex gap-[10px] items-center justify-center relative">
            <Wrapper2>
              <Wrapper>
                <path clipRule="evenodd" d={svgPaths.p1adebd00} fill={isDisable ? "var(--fill-0, #1D7BF5)" : "var(--fill-0, #637381)"} fillRule="evenodd" id="primary-shape" />
              </Wrapper>
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">UnChecked</p>
            </Wrapper2>
            <div className={`relative rounded-[8px] shrink-0 w-[138px] ${isDisable ? "bg-[rgba(145,158,171,0.32)]" : ""}`} data-name="SmallSelect">
              <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <Wrapper4>
                <p className={`leading-[22px] relative shrink-0 text-[14px] whitespace-nowrap ${isDisable ? 'font-["Public_Sans:SemiBold",sans-serif] font-semibold text-[#1c252e]' : 'font-["Public_Sans:Regular",sans-serif] font-normal text-[#919eab]'}`}>{isDisable ? "Value" : property1 === "radio/enable" ? "2025/01/10" : ""}</p>
                <IconsSolidIcEvaArrowIosDownwardFill>
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isDisable ? "0 0 14.0245 7.00364" : "0 0 9.34969 4.66909"}>
                    <path d={isDisable ? svgPaths.p3c609d00 : svgPaths.p29522f00} fill={isDisable ? "var(--fill-0, #1D7BF5)" : "var(--fill-0, #1C252E)"} id="primary-shape" />
                  </svg>
                </IconsSolidIcEvaArrowIosDownwardFill>
              </Wrapper4>
            </div>
          </div>
        )}
        {property1 === "Default" && (
          <div className="relative rounded-[8px] shrink-0 w-[138px]" data-name="SmallSelect">
            <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <Text text="2025/01/10" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute contents left-[-0.17px] top-0">
        <div className="absolute contents left-[-0.17px] top-0">
          <div className="absolute contents left-[-0.17px] top-0">
            <div className="absolute bg-white h-[482px] left-[-0.17px] rounded-[8px] top-0 w-[1025.333px]" />
          </div>
          <div className="absolute h-[70px] left-0 top-[405px] w-[1025px]" data-name="DialogActions">
            <Helper text="提交採購" text1="取消" />
          </div>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[10px] h-[338.239px] items-start left-1/2 top-[calc(50%-52.86px)] w-[943px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] w-[214px]">請選擇異動原因</p>
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
            <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
              <div className="col-1 ml-0 mt-0 relative row-1 w-[253px]" data-name="SmallSelect">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex gap-[10px] items-center justify-center relative w-full">
                    <Wrapper2>
                      <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
                        <Wrapper1>
                          <path clipRule="evenodd" d={svgPaths.p3e1edfb0} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="primary-shape" />
                        </Wrapper1>
                      </div>
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">需修改交期為</p>
                    </Wrapper2>
                    <div className="relative rounded-[8px] shrink-0 w-[138px]" data-name="SmallSelect">
                      <div aria-hidden="true" className="absolute border border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <Text text="2025/01/10" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-1 ml-[262px] mt-[3px] relative rounded-[8px] row-1 w-[681px]" data-name="SmallSelect">
                <div aria-hidden="true" className="absolute border border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
                <Text1 text="請簡述原因，限50字" />
              </div>
            </div>
            <SmallSelect1 text="不接單" text1="請簡述原因，限50字" />
            <div className="h-[40px] relative shrink-0 w-full" data-name="SmallSelect">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[10px] items-center relative size-full">
                  <RadioText text="調整拆期" />
                  <SmallSelect2 additionalClassNames="shrink-0">
                    <Text3 text="請輸入期數" />
                  </SmallSelect2>
                </div>
              </div>
            </div>
            <div className="bg-white h-[61px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[20px] items-center px-[45px] py-[10px] relative size-full">
                  <Stack text="項次" text1="1" />
                  <Stack text="預計交期" text1="2025/01/10" />
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-ellipsis w-full whitespace-nowrap">統計交貨日期</p>
                    <SmallSelect className="relative shrink-0" />
                  </div>
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-ellipsis w-full whitespace-nowrap">交貨量</p>
                    <div className="h-[34px] relative shrink-0 w-[150px]" data-name="TextField">
                      <div className="content-stretch flex flex-col items-start relative size-full">
                        <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] w-full" data-name="wrap">
                          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                          <div className="flex flex-row items-center size-full">
                            <div className="content-stretch flex items-center px-[14px] relative size-full">
                              <p className="font-['Public_Sans:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#919eab] text-[15px] text-ellipsis w-[292px] whitespace-nowrap">50</p>
                              <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute contents left-[-0.17px] top-0">
        <div className="absolute contents left-[-0.17px] top-0">
          <div className="absolute contents left-[-0.17px] top-0">
            <div className="absolute bg-white h-[482px] left-[-0.17px] rounded-[8px] top-0 w-[1025.333px]" />
            <div className="absolute contents left-0 top-[31.02px]">
              <div className="absolute contents left-0 top-[405px]">
                <div className="absolute h-[70px] left-0 top-[405px] w-[1025px]" data-name="DialogActions">
                  <Helper text="提交採購" text1="取消" />
                </div>
              </div>
              <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[10px] h-[338.239px] items-start left-1/2 top-[calc(50%-52.86px)] w-[943px]">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] w-[214px]">請選擇異動原因</p>
                <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
                  <SmallSelect1 text="不接單" text1="請簡述原因，限50字" />
                  <div className="content-stretch flex gap-[10px] h-[40px] items-center relative shrink-0 w-full" data-name="SmallSelect">
                    <RadioText text="調整交貨排程" />
                    <SmallSelect2 additionalClassNames="shrink-0">
                      <Text2 text="請輸入期數" />
                    </SmallSelect2>
                    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <Text1 text="請簡述原因" />
                    </div>
                  </div>
                  <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                    <div className="col-1 h-[232px] ml-0 mt-0 relative rounded-[8px] row-1 w-[943px]" data-name="Textarea">
                      <div className="content-stretch flex flex-col items-start relative size-full">
                        <div className="flex-[1_0_0] min-h-[98px] min-w-px relative rounded-[8px] w-full" data-name="wrap">
                          <div className="min-h-[inherit] overflow-clip rounded-[inherit] size-full">
                            <div className="content-stretch flex items-start min-h-[inherit] px-[14px] py-[16px] relative size-full">
                              <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px]">&nbsp;</p>
                            </div>
                          </div>
                          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                        </div>
                        <div className="absolute right-0 top-0" data-name="scroll">
                          <div className="content-stretch flex items-start px-[4px] py-[12px] relative">
                            <div className="bg-[#637381] h-[64px] opacity-48 rounded-[12px] shrink-0 w-[6px]" data-name="scroll" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute h-[70px] left-0 top-[405px] w-[1025px]" data-name="DialogActions">
            <Helper text="提交採購" text1="取消" />
          </div>
        </div>
      </div>
    </div>
  );
}