import clsx from "clsx";
import svgPaths from "./svg-1rbp83ogos";

function Wrapper5({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[34px] relative shrink-0 w-[150px]">
      <div className="content-stretch flex flex-col items-start relative size-full">{children}</div>
    </div>
  );
}

function PaginationHelper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center size-full">
      <div className="content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}

function Frame7Helper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
      <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[12px] relative">{children}</div>
    </div>
  );
}

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

function Wrap({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] w-full">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">{children}</div>
      </div>
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
type StackTextProps = {
  text: string;
};

function StackText({ text }: StackTextProps) {
  return (
    <div className="content-stretch flex flex-col h-full items-start relative shrink-0 w-[80px]">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] w-full">{text}</p>
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
type Stack1Props = {
  text: string;
  text1: string;
  additionalClassNames?: string;
};

function Stack1({ text, text1, additionalClassNames = "" }: Stack1Props) {
  return (
    <div className={clsx("content-stretch flex flex-col font-normal gap-[4px] h-[60px] items-start leading-[22px] relative shrink-0 text-[14px]", additionalClassNames)}>
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

function Stack() {
  return (
    <div className="absolute inset-[0.17%_0_3.69%_0]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 23.0734">
        <g id="stack">
          <path clipRule="evenodd" d={svgPaths.p3a4a2480} fill="url(#paint0_linear_4385_6175)" fillRule="evenodd" id="vector" />
          <path clipRule="evenodd" d={svgPaths.p24d6df00} fill="url(#paint1_linear_4385_6175)" fillRule="evenodd" id="vector_2" />
          <g id="vector_3" opacity="0.48">
            <path clipRule="evenodd" d={svgPaths.p1c344620} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p356ce880} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p1f1f1b00} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
          </g>
          <g id="vector_4">
            <path d={svgPaths.p2d7e32c0} fill="var(--fill-0, white)" />
            <path d={svgPaths.p26d26b00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p355dbd80} fill="var(--fill-0, white)" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4385_6175" x1="8.15606" x2="24" y1="7.22946" y2="23.0734">
            <stop stopColor="#77ED8B" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_4385_6175" x1="0" x2="19.3023" y1="0" y2="19.3023">
            <stop stopColor="#00B8D9" />
            <stop offset="1" stopColor="#006C9C" />
          </linearGradient>
        </defs>
      </svg>
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
type SmallSelectTextProps = {
  text: string;
};

function SmallSelectText({ text }: SmallSelectTextProps) {
  return (
    <div className="relative rounded-[8px] shrink-0 w-[138px]">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Text text={text} />
    </div>
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
        {property1 === "Default" && <SmallSelectText text="2025/01/10" />}
      </div>
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#f4f6f8] h-[634px] left-0 rounded-[8px] top-0 w-[1080px]" />
      <div className="absolute content-stretch flex gap-[12px] h-[86.741px] items-center justify-end left-[366.47px] p-[24px] top-[17.35px] w-[685.036px]" data-name="DialogActions">
        <div className="content-stretch flex gap-[12px] h-[55px] items-center justify-end p-[24px] relative shrink-0 w-[505px]" data-name="DialogActions">
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
            <div className="relative shrink-0 size-[36px]" data-name="icons/notifications/ic-chat">
              <Stack />
            </div>
            <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
              <div className="relative shrink-0 size-[36px]" data-name="icons/notifications/ic-chat">
                <Stack />
              </div>
              <p className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#005eb8] text-[16px] underline whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                歷程
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex gap-[16px] h-[86.741px] items-center left-0 pl-[24px] pr-[12px] py-[24px] top-[17.35px] w-[321.151px]" data-name="交貨排程">
        <div className="content-stretch flex gap-[17px] items-center relative shrink-0">
          <div className="bg-[#1c252e] h-[48px] min-w-[48px] relative rounded-[8px] shrink-0" data-name="ToggleButton">
            <Frame7Helper>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">不拆單調整</p>
            </Frame7Helper>
          </div>
          <div className="bg-[rgba(0,94,184,0.08)] h-[48px] min-w-[48px] relative rounded-[8px] shrink-0" data-name="ToggleButton">
            <div aria-hidden="true" className="absolute border border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <Frame7Helper>
              <div className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] text-center whitespace-nowrap">
                <p className="mb-0">廠商確認中(V)</p>
                <p>17056357</p>
              </div>
            </Frame7Helper>
          </div>
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] whitespace-nowrap">修正項目</p>
        </div>
        <div className="content-stretch flex gap-[6px] h-[86px] items-center justify-center relative shrink-0" data-name="Pagination">
          <div className="opacity-48 relative rounded-[500px] shrink-0 size-[40px]" data-name="IconButton">
            <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[500px]" />
            <PaginationHelper>
              <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
                <div className="absolute inset-[20.83%_37.54%_20.83%_33.3%]" data-name="primary-shape">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.8323 11.6678">
                    <path d={svgPaths.p3d3af100} fill="var(--fill-0, #637381)" id="primary-shape" />
                  </svg>
                </div>
              </div>
            </PaginationHelper>
          </div>
          <div className="flex flex-col font-['Public_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 size-[40px] text-[#1c252e] text-[14px] text-center">
            <p className="leading-[22px]">1/20</p>
          </div>
          <div className="bg-[#005eb8] relative rounded-[500px] shrink-0 size-[40px]" data-name="IconButton">
            <PaginationHelper>
              <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-forward-fill">
                <div className="absolute inset-[20.71%_33.09%_20.83%_37.49%]" data-name="primary-shape">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.88271 11.6925">
                    <path d={svgPaths.p2165200} fill="var(--fill-0, white)" id="primary-shape" />
                  </svg>
                </div>
              </div>
            </PaginationHelper>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute h-[506px] left-[calc(50%-0.5px)] top-[104px] w-[1025px]">
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
                    <Stack1 text="項次" text1="1" additionalClassNames="w-[150px]" />
                    <Stack1 text="預計交期" text1="2025/01/10" additionalClassNames="w-[150px]" />
                    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-ellipsis w-full whitespace-nowrap">統計交貨日期</p>
                      <SmallSelect className="relative shrink-0" />
                    </div>
                    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-ellipsis w-full whitespace-nowrap">交貨量</p>
                      <Wrapper5>
                        <Wrap>
                          <p className="font-['Public_Sans:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#919eab] text-[15px] text-ellipsis w-[292px] whitespace-nowrap">50</p>
                          <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
                        </Wrap>
                      </Wrapper5>
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
                      <div className="col-1 content-stretch flex flex-col gap-[10px] items-start ml-[31px] mt-[23.11px] relative row-1 w-[861px]">
                        <div className="bg-white content-stretch flex gap-[10px] h-[60px] items-center pr-[45px] py-[10px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-[899px]">
                          <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[80px]" data-name="stack">
                            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-ellipsis w-full whitespace-nowrap">項次</p>
                            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-w-full relative shrink-0 text-[#919eab] text-[14px] w-[min-content]">1</p>
                            <div className="h-[39px] shrink-0 w-[239px]" />
                          </div>
                          <Stack1 text="預計交期" text1="2025/01/10" additionalClassNames="w-[80px]" />
                          <Stack1 text="原廠商交期" text1="2025/01/10" additionalClassNames="w-[80px]" />
                          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#005eb8] text-[14px] text-ellipsis w-full whitespace-nowrap">新廠商可交貨日</p>
                            <div className="relative shrink-0" data-name="SmallSelect">
                              <div className="content-stretch flex items-start relative">
                                <SmallSelectText text="2025/01/15" />
                              </div>
                            </div>
                          </div>
                          <Stack1 text="原交貨量" text1="200" additionalClassNames="w-[80px]" />
                          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#005eb8] text-[14px] text-ellipsis w-full whitespace-nowrap">新交貨量</p>
                            <Wrapper5>
                              <Wrap>
                                <p className="font-['Public_Sans:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#919eab] text-[15px] text-ellipsis w-[292px] whitespace-nowrap">20</p>
                                <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
                              </Wrap>
                            </Wrapper5>
                          </div>
                        </div>
                        <div className="bg-white content-stretch flex gap-[10px] h-[38px] items-center py-[10px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-[899px]" data-name="項次2">
                          <StackText text="2" />
                          <StackText text="2025/01/10" />
                          <StackText text="2025/01/10" />
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-[150px]" data-name="stack">
                            <div className="relative shrink-0" data-name="SmallSelect">
                              <div className="content-stretch flex items-start relative">
                                <SmallSelectText text="2025/01/20" />
                              </div>
                            </div>
                          </div>
                          <StackText text="200" />
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-[150px]" data-name="stack">
                            <Wrapper5>
                              <Wrap>
                                <p className="font-['Public_Sans:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#919eab] text-[15px] text-ellipsis w-[292px] whitespace-nowrap">30</p>
                                <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
                              </Wrap>
                            </Wrapper5>
                          </div>
                          <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:trash-bin-trash-bold">
                            <div className="absolute inset-[8.29%_12.5%_8.37%_12.5%]" data-name="primary-shape">
                              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
                                <g id="primary-shape">
                                  <path d={svgPaths.p309dd480} fill="var(--fill-0, #FF5630)" />
                                  <path clipRule="evenodd" d={svgPaths.p2846fa00} fill="var(--fill-0, #FF5630)" fillRule="evenodd" />
                                </g>
                              </svg>
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
    </div>
  );
}