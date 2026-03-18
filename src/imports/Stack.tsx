import svgPaths from "./svg-avohp1knl9";

function StackTextField({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="content-stretch flex flex-col items-start relative w-full">{children}</div>
    </div>
  );
}

function Wrap({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">{children}</div>
      </div>
    </div>
  );
}
type LabelFocusTextProps = {
  text: string;
};

function LabelFocusText({ text }: LabelFocusTextProps) {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px] whitespace-nowrap">{text}</p>
    </div>
  );
}

function StartAdornment() {
  return (
    <div className="content-stretch flex items-center pr-[8px] relative shrink-0">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="✳️ start adornment">
        <div className="absolute inset-[12.5%_12.48%_12.48%_12.5%]" data-name="primary-shape">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0058 18.0058">
            <path d={svgPaths.p2e7aad00} fill="var(--fill-0, #919EAB)" id="primary-shape" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Stack() {
  return (
    <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative size-full" data-name="stack">
      <StackTextField>
        <Wrap>
          <StartAdornment />
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">40064972310、40064972320</p>
          <LabelFocusText text="單號序號" />
          <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
        </Wrap>
      </StackTextField>
      <StackTextField>
        <Wrap>
          <StartAdornment />
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">&nbsp;</p>
          <LabelFocusText text="廠商(編號)" />
          <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
        </Wrap>
      </StackTextField>
    </div>
  );
}