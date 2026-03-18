import clsx from "clsx";
import svgPaths from "./svg-4izgkrgdk8";
type Wrapper12Props = {
  additionalClassNames?: string;
};

function Wrapper12({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper12Props>) {
  return (
    <div className="h-[34px] relative shrink-0 w-[150px]">
      <div className="content-stretch flex flex-col items-start relative size-full">
        <div className={clsx("relative rounded-[8px] w-full", additionalClassNames)}>
          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center px-[14px] relative size-full">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Wrapper11({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center size-full">
      <div className="content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}
type Wrapper10Props = {
  additionalClassNames?: string;
};

function Wrapper10({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper10Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">{children}</div>
    </div>
  );
}
type Wrapper9Props = {
  additionalClassNames?: string;
};

function Wrapper9({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper9Props>) {
  return <Wrapper10 additionalClassNames={clsx("min-w-[64px] relative rounded-[8px] shrink-0", additionalClassNames)}>{children}</Wrapper10>;
}

function Wrapper8({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex gap-[10px] items-center relative w-full">{children}</div>
    </div>
  );
}
type DialogActionsProps = {
  additionalClassNames?: string;
};

function DialogActions({ children, additionalClassNames = "" }: React.PropsWithChildren<DialogActionsProps>) {
  return (
    <div className={clsx("absolute h-[70px] left-0 w-[1025px]", additionalClassNames)}>
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-end py-[24px] relative size-full">{children}</div>
      </div>
    </div>
  );
}

function ComponentTab({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[48px] min-h-[48px] min-w-[48px] relative shrink-0">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-h-[inherit] min-w-[inherit] relative">{children}</div>
      </div>
    </div>
  );
}

function PrimaryShape({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute inset-[8.29%_12.5%_8.37%_12.5%]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g id="primary-shape">{children}</g>
      </svg>
    </div>
  );
}

function Wrapper7({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <Wrapper8>{children}</Wrapper8>
    </div>
  );
}

function Wrapper6({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative rounded-[8px] shrink-0 w-[138px]">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">{children}</div>
      </div>
    </div>
  );
}

function Wrap({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapProps>) {
  return (
    <div className={clsx("relative rounded-[8px] w-full", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">{children}</div>
      </div>
    </div>
  );
}
type Wrapper5Props = {
  additionalClassNames?: string;
};

function Wrapper5({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper5Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center relative size-full">{children}</div>
      </div>
    </div>
  );
}
type Wrapper4Props = {
  additionalClassNames?: string;
};

function Wrapper4({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper4Props>) {
  return <Wrapper5 additionalClassNames={clsx("h-[40px] relative", additionalClassNames)}>{children}</Wrapper5>;
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative">{children}</div>
      </div>
    </div>
  );
}

function Wrapper2({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper9 additionalClassNames="h-[30px]">
      <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[4px] relative">{children}</div>
    </Wrapper9>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper11>
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
        <div className="absolute inset-[20.83%_37.54%_20.83%_33.3%]" data-name="primary-shape">
          {children}
        </div>
      </div>
    </Wrapper11>
  );
}

function ComponentHelper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
        <div aria-hidden="true" className="absolute border border-[#dfe3e8] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] relative size-full">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] whitespace-nowrap">{children}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
type IconButtonProps = {
  additionalClassNames?: string;
};

function IconButton({ children, additionalClassNames = "" }: React.PropsWithChildren<IconButtonProps>) {
  return (
    <div className={clsx("relative rounded-[500px] shrink-0", additionalClassNames)}>
      <Wrapper11>
        <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-forward-fill">
          <div className="absolute inset-[20.71%_33.09%_20.83%_37.49%]" data-name="primary-shape">
            {children}
          </div>
        </div>
      </Wrapper11>
    </div>
  );
}
type ComponentButtonText1Props = {
  text: string;
};

function ComponentButtonText1({ text, children }: React.PropsWithChildren<ComponentButtonText1Props>) {
  return (
    <Wrapper2>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="start icon">
        <div className="absolute inset-[12.5%]" data-name="primary-shape">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            {children}
          </svg>
        </div>
      </div>
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px] whitespace-nowrap">{text}</p>
    </Wrapper2>
  );
}
type RadioTextProps = {
  text: string;
};

function RadioText({ text }: RadioTextProps) {
  return (
    <Wrapper3>
      <div className="content-stretch flex items-start p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icons/solid/ic-radio-off">
          <Wrapper>
            <path clipRule="evenodd" d={svgPaths.p1adebd00} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" id="primary-shape" />
          </Wrapper>
        </div>
      </div>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">{text}</p>
    </Wrapper3>
  );
}
type SmallSelectText1Props = {
  text: string;
  additionalClassNames?: string;
};

function SmallSelectText1({ text, children, additionalClassNames = "" }: React.PropsWithChildren<SmallSelectText1Props>) {
  return (
    <Wrapper5 additionalClassNames={clsx("absolute h-[45.326px] top-0", additionalClassNames)}>
      <RadioText text={text} />
      <SmallSelectText text="2025/01/10" />
    </Wrapper5>
  );
}
type ComponentSmallSelectText1Props = {
  text: string;
  additionalClassNames?: string;
};

function ComponentSmallSelectText1({ text, additionalClassNames = "" }: ComponentSmallSelectText1Props) {
  return (
    <div className={clsx("relative rounded-[8px]", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] whitespace-nowrap">{text}</p>
          <div className="overflow-clip shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill" />
        </div>
      </div>
    </div>
  );
}
type ComponentStackText1Props = {
  text: string;
  additionalClassNames?: string;
};

function ComponentStackText1({ text, additionalClassNames = "" }: ComponentStackText1Props) {
  return (
    <div className={clsx("content-stretch flex flex-col h-full items-start relative shrink-0", additionalClassNames)}>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] w-full">{text}</p>
    </div>
  );
}
type ComponentTextFieldText1Props = {
  text: string;
};

function ComponentTextFieldText1({ text }: ComponentTextFieldText1Props) {
  return (
    <Wrapper12 additionalClassNames="h-[40px] shrink-0">
      <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis whitespace-nowrap">{text}</p>
      <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
    </Wrapper12>
  );
}

function SmallSelect1() {
  return (
    <div className="relative shrink-0">
      <div className="content-stretch flex items-start relative">
        <SmallSelectText text="2025/01/10" />
      </div>
    </div>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute inset-[8.33%]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        {children}
      </svg>
    </div>
  );
}

function Helper3() {
  return (
    <div className="content-stretch flex flex-col h-[39px] items-start relative shrink-0 w-[239px]">
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
        <SmallSelect text="UnChecked" text1="2025/01/10" />
      </div>
    </div>
  );
}
type SmallSelectTextProps = {
  text: string;
};

function SmallSelectText({ text }: SmallSelectTextProps) {
  return (
    <Wrapper6>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] whitespace-nowrap">{text}</p>
      <IconsSolidIcEvaArrowIosDownwardFill />
    </Wrapper6>
  );
}
type SmallSelectProps = {
  text: string;
  text1: string;
};

function SmallSelect({ text, text1, children }: React.PropsWithChildren<SmallSelectProps>) {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 w-[239px]">
      <Wrapper8>
        <RadioText text={text} />
        <SmallSelectText text={text1} />
      </Wrapper8>
    </div>
  );
}
type ComponentTextFieldTextProps = {
  text: string;
};

function ComponentTextFieldText({ text }: ComponentTextFieldTextProps) {
  return (
    <Wrapper12 additionalClassNames="flex-[1_0_0] min-h-px min-w-px">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#919eab] text-[15px] text-ellipsis w-[292px] whitespace-nowrap">{text}</p>
      <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
    </Wrapper12>
  );
}
type ComponentSmallSelectTextProps = {
  text: string;
};

function ComponentSmallSelectText({ text, children }: React.PropsWithChildren<ComponentSmallSelectTextProps>) {
  return (
    <div className="relative shrink-0">
      <div className="content-stretch flex items-start relative">
        <Wrapper6>
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px] whitespace-nowrap">{text}</p>
          <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
            <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]" data-name="primary-shape">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.34969 4.66909">
                {children}
              </svg>
            </div>
          </div>
        </Wrapper6>
      </div>
    </div>
  );
}
type ComponentStackProps = {
  text: string;
  text1: string;
  additionalClassNames?: string;
};

function ComponentStack({ text, text1, additionalClassNames = "" }: ComponentStackProps) {
  return (
    <div className={clsx("content-stretch flex flex-col font-normal gap-[4px] h-[60px] items-start leading-[22px] relative shrink-0 text-[14px]", additionalClassNames)}>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] h-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-ellipsis w-full whitespace-nowrap">{text}</p>
      <p className="font-['Public_Sans:Regular',sans-serif] relative shrink-0 text-[#919eab] w-full">{text1}</p>
    </div>
  );
}
type ComponentSecondaryActionTextProps = {
  text: string;
};

function ComponentSecondaryActionText({ text }: ComponentSecondaryActionTextProps) {
  return (
    <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative size-full">
          <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">
            <p className="leading-[24px]">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
type ComponentPrimaryActionTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ComponentPrimaryActionText({ text, additionalClassNames = "" }: ComponentPrimaryActionTextProps) {
  return (
    <Wrapper10 additionalClassNames={clsx("flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]", additionalClassNames)}>
      <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative size-full">
        <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
          <p className="leading-[24px]">{text}</p>
        </div>
      </div>
    </Wrapper10>
  );
}
type TableCell1Props = {
  additionalClassNames?: string;
};

function TableCell1({ additionalClassNames = "" }: TableCell1Props) {
  return (
    <div className={clsx("relative", additionalClassNames)}>
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex items-center justify-end p-[16px] w-full" />
      </div>
    </div>
  );
}
type TableCellTextProps = {
  text: string;
  additionalClassNames?: string;
};

function TableCellText({ text, additionalClassNames = "" }: TableCellTextProps) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative w-full">
          <StackText text={text} />
        </div>
      </div>
    </div>
  );
}
type Text1Props = {
  text: string;
  additionalClassNames?: string;
};

function Text1({ text, additionalClassNames = "" }: Text1Props) {
  return (
    <div className={clsx("flex flex-row items-center size-full", additionalClassNames)}>
      <div className="content-stretch flex items-center relative w-full">
        <StackText text={text} />
      </div>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="content-stretch flex items-center relative">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">{text}</p>
    </div>
  );
}
type StackTextProps = {
  text: string;
};

function StackText({ text }: StackTextProps) {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0">
      <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">{text}</p>
      </div>
    </div>
  );
}
type TableOrderHeadProps = {
  text: string;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
  text6: string;
  text7: string;
};

function TableOrderHead({ text, text1, text2, text3, text4, text5, text6, text7 }: TableOrderHeadProps) {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <div className="relative shrink-0 w-[194px]" data-name="Table/Cell">
        <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex items-center relative w-full">
            <ComponentCheckbox>
              <path clipRule="evenodd" d={svgPaths.p21d8a650} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" id="primary-shape" />
            </ComponentCheckbox>
            <StackText text={text} />
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-[97px]" data-name="Table/Cell">
        <Text1 text={text1} additionalClassNames="overflow-clip rounded-[inherit]" />
      </div>
      <div className="relative shrink-0 w-[120px]" data-name="Table/Cell">
        <Text1 text={text2} />
      </div>
      <TableCellText text={text3} additionalClassNames="w-[65px]" />
      <div className="relative shrink-0 w-[140px]" data-name="Table/Cell">
        <Text1 text={text4} />
      </div>
      <div className="relative shrink-0 w-[110px]" data-name="Table/Cell">
        <Text1 text={text5} />
      </div>
      <TableCellText text={text6} additionalClassNames="w-[90px]" />
      <TableCellText text={text7} additionalClassNames="w-[90px]" />
      <TableCell1 additionalClassNames="flex-[1_0_0] min-h-px min-w-px" />
      <TableCell1 additionalClassNames="shrink-0 w-[68px]" />
    </div>
  );
}
type TableCellProps = {
  additionalClassNames?: string;
};

function TableCell({ additionalClassNames = "" }: TableCellProps) {
  return (
    <div className={clsx("bg-[#f4f6f8] relative shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative w-full">
          <ComponentStackText text="Table th" />
        </div>
      </div>
    </div>
  );
}
type ComponentStackTextProps = {
  text: string;
};

function ComponentStackText({ text }: ComponentStackTextProps) {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] whitespace-nowrap">{text}</p>
    </div>
  );
}

function ComponentCheckbox({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0">
      <Wrapper3>
        <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
          <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-off">
            <Wrapper>{children}</Wrapper>
          </div>
        </div>
      </Wrapper3>
    </div>
  );
}
type ComponentListItemText1Props = {
  text: string;
  text1: string;
  additionalClassNames?: string;
};

function ComponentListItemText1({ text, text1, additionalClassNames = "" }: ComponentListItemText1Props) {
  return (
    <div className={clsx("content-stretch flex gap-[10px] items-start relative shrink-0", additionalClassNames)}>
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">{text}</p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">{text1}</p>
    </div>
  );
}
type Helper2Props = {
  text: string;
  text1: string;
  additionalClassNames?: string;
};

function Helper2({ text, text1, additionalClassNames = "" }: Helper2Props) {
  return (
    <div className={clsx("content-stretch flex gap-[10px] items-start relative shrink-0 w-[400px]", additionalClassNames)}>
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">{text}</p>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">{text1}</p>
    </div>
  );
}
type ComponentListItemTextProps = {
  text: string;
  text1: string;
};

function ComponentListItemText({ text, text1 }: ComponentListItemTextProps) {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[200px]">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">{text}</p>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">{text1}</p>
    </div>
  );
}
type Helper1Props = {
  additionalClassNames?: string;
};

function Helper1({ additionalClassNames = "" }: Helper1Props) {
  return (
    <div className={clsx("overflow-clip relative shrink-0", additionalClassNames)}>
      <PrimaryShape>
        <path d={svgPaths.p309dd480} fill="var(--fill-0, #1D7BF5)" />
        <path clipRule="evenodd" d={svgPaths.p2846fa00} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" />
      </PrimaryShape>
    </div>
  );
}
type ComponentButtonTextProps = {
  text: string;
};

function ComponentButtonText({ text }: ComponentButtonTextProps) {
  return (
    <Wrapper9 additionalClassNames="h-[36px]">
      <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[8px] relative">
        <Helper1 additionalClassNames="size-[20px]" />
        <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ff5630] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[24px]">{text}</p>
        </div>
      </div>
    </Wrapper9>
  );
}
type ComponentChipTextProps = {
  text: string;
};

function ComponentChipText({ text }: ComponentChipTextProps) {
  return (
    <div className="bg-[rgba(145,158,171,0.08)] h-[24px] relative rounded-[8px] shrink-0">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex h-full items-center pl-[3px] pr-[5px] relative">
          <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0" data-name="label container">
            <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center whitespace-nowrap">{text}</p>
          </div>
          <div className="mr-[-2px] opacity-48 overflow-clip relative shrink-0 size-[20px]" data-name="action">
            <Wrapper>
              <path clipRule="evenodd" d={svgPaths.p275a9800} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" id="primary-shape" />
            </Wrapper>
          </div>
        </div>
      </div>
    </div>
  );
}

function Helper() {
  return (
    <ComponentTextField text="Value" text1="Label">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0058 18.0058">
        <path d={svgPaths.p2e7aad00} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
      </svg>
    </ComponentTextField>
  );
}
type ComponentTextFieldProps = {
  text: string;
  text1: string;
};

function ComponentTextField({ text, text1, children }: React.PropsWithChildren<ComponentTextFieldProps>) {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="content-stretch flex flex-col items-start relative w-full">
        <Wrap additionalClassNames="h-[54px] shrink-0">
          <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="start adornment">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="✳️ start adornment">
              <div className="absolute inset-[12.5%_12.48%_12.48%_12.5%]" data-name="primary-shape">
                {children}
              </div>
            </div>
          </div>
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">{text}</p>
          <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
            <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px] whitespace-nowrap">{text1}</p>
          </div>
          <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
        </Wrap>
      </div>
    </div>
  );
}

function TablePaginationNextPrev() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <div className="relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
        <Wrapper1>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.99876 14.0013">
            <path d={svgPaths.pfcc7f80} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
          </svg>
        </Wrapper1>
      </div>
      <IconButton additionalClassNames="size-[36px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.05925 14.0311">
          <path d={svgPaths.p2221d100} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
        </svg>
      </IconButton>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]" data-name="primary-shape">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0245 7.00364">
          <path d={svgPaths.p3c609d00} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
        </svg>
      </div>
    </div>
  );
}
type TablePaginationSelectTextProps = {
  text: string;
};

function TablePaginationSelectText({ text }: TablePaginationSelectTextProps) {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">{text}</p>
      <IconsSolidIcEvaArrowIosDownwardFill />
    </div>
  );
}
type TablePaginationProps = {
  className?: string;
  dense?: boolean;
  mobile?: boolean;
  variant?: "Pagination";
};

function TablePagination({ className, dense = true, mobile = false, variant = "Pagination" }: TablePaginationProps) {
  const isMobileAndPagination = mobile && variant === "Pagination";
  return (
    <div className={className || `relative ${isMobileAndPagination ? "w-[375px]" : "w-[1080px]"}`}>
      <div className={`flex ${isMobileAndPagination ? "content-stretch flex-col gap-[24px] items-start pl-[16px] pr-[8px] py-[10px] relative w-full" : "flex-row items-center justify-center size-full"}`}>
        {!mobile && variant === "Pagination" && (
          <div className="content-stretch flex gap-[20px] items-center justify-center px-[8px] py-[10px] relative w-full">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">Rows per page:</p>
            <TablePaginationSelectText text="5" />
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">6-10 of 11</p>
            <TablePaginationNextPrev />
          </div>
        )}
        {isMobileAndPagination && (
          <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full" data-name="stack">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-right whitespace-nowrap">Rows per page:</p>
            <TablePaginationSelectText text="5" />
            <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">6-10 of 11</p>
            <TablePaginationNextPrev />
          </div>
        )}
        {isMobileAndPagination && dense && (
          <div className="relative shrink-0" data-name="Switch">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[9px] items-center relative">
                <div className="content-stretch flex flex-col h-[38px] items-start justify-center relative shrink-0" data-name="switch container">
                  <div className="h-[20px] relative shrink-0 w-[33px]" data-name="switch">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 20">
                      <g id="switch">
                        <path d={svgPaths.p19873780} fill="var(--fill-0, #919EAB)" fillOpacity="0.48" />
                        <circle cx="10" cy="10" fill="var(--fill-0, white)" id="thumb" r="7" />
                      </g>
                    </svg>
                  </div>
                </div>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">UnChecked</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
type ComponentProps = {
  className?: string;
  property1?: "建立修正單/原單調整" | "建立修正單/列表" | "建立修正單/selected" | "建立修正單/拆單";
};

function Component({ className, property1 = "建立修正單/列表" }: ComponentProps) {
  const is = property1 === "建立修正單/原單調整";
  const is1 = property1 === "建立修正單/拆單";
  const is2 = property1 === "建立修正單/列表";
  const isOr = ["建立修正單/原單調整", "建立修正單/拆單"].includes(property1);
  const isOrSelected = ["建立修正單/列表", "建立修正單/selected"].includes(property1);
  const isSelected = property1 === "建立修正單/selected";
  return (
    <div className={className || `relative ${isOr ? "" : "w-[1080px]"}`}>
      <div className={`content-stretch flex flex-col items-start relative ${isOr ? "" : "w-full"}`}>
        <div className={`bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 ${isOr ? "w-[1080px]" : "w-full"}`} data-name="Table/Order">
          {isOrSelected && (
            <div className="relative shrink-0 w-full" data-name="stack">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
                  <Helper />
                  <Helper />
                  <Helper />
                </div>
              </div>
            </div>
          )}
          <div className={`relative shrink-0 w-full ${isOr ? "" : "content-stretch flex gap-[560px] items-start"}`}>
            {isOrSelected && (
              <>
                <div className="h-[62px] relative shrink-0 w-[153px]" data-name="Table/FiltersResults">
                  <div className="flex flex-col items-center justify-center size-full">
                    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center px-[20px] relative size-full">
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[0] min-w-full relative shrink-0 text-[#1c252e] text-[0px] text-[14px] w-[min-content]">
                        <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px]">8</span>
                        <span className="leading-[22px]">{` `}</span>
                        <span className="leading-[22px] text-[#637381]">results found</span>
                      </p>
                      <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="stack">
                        <div className="content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0" data-name="stack">
                          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
                          <div className="content-stretch flex font-['Public_Sans:SemiBold',sans-serif] font-semibold items-center leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap" data-name="label">
                            <p className="relative shrink-0">Category 1</p>
                            <p className="relative shrink-0">{` :`}</p>
                          </div>
                          <ComponentChipText text="Chip" />
                        </div>
                        <div className="content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0" data-name="stack">
                          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
                          <div className="content-stretch flex font-['Public_Sans:SemiBold',sans-serif] font-semibold items-center leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap" data-name="label">
                            <p className="relative shrink-0">Category 2</p>
                            <p className="relative shrink-0">{` :`}</p>
                          </div>
                          <ComponentChipText text="Chip" />
                          <ComponentChipText text="Chip" />
                        </div>
                        <ComponentButtonText text="Medium" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white flex-[1_0_0] h-[62px] min-h-px min-w-px relative" data-name="DataGrid/Toolbar">
                  <div className="flex flex-row items-center justify-end size-full">
                    <div className="content-stretch flex gap-[12px] items-center justify-end px-[20px] relative size-full">
                      <ComponentButtonText1 text="Small">
                        <path d={svgPaths.p223f4f00} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                      </ComponentButtonText1>
                      <Wrapper2>
                        <div className="overflow-clip relative shrink-0 size-[18px]" data-name="start icon">
                          <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-1/4" data-name="primary-shape">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 12">
                              <path d={svgPaths.p5807900} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                            </svg>
                          </div>
                        </div>
                        <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px] whitespace-nowrap">Small</p>
                      </Wrapper2>
                      <ComponentButtonText1 text="Small">
                        <path d={svgPaths.p16c66280} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                      </ComponentButtonText1>
                    </div>
                  </div>
                </div>
              </>
            )}
            {isOr && (
              <div className="content-stretch flex flex-col gap-[10px] items-start px-[23px] py-[10px] relative w-full">
                {is && (
                  <>
                    <div className="content-stretch flex gap-[10px] items-start relative shrink-0">
                      <div className="bg-[#d3f4e0] h-[48px] min-w-[48px] relative rounded-[8px] shrink-0" data-name="ToggleButton">
                        <div aria-hidden="true" className="absolute border border-[#118d57] border-solid inset-0 pointer-events-none rounded-[8px]" />
                        <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                          <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[12px] relative">
                            <div className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#118d57] text-[16px] text-center whitespace-nowrap">
                              <p className="mb-0">訂單已確認(CK)</p>
                              <p>40064973190</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ComponentTab>
                        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] whitespace-nowrap">原訂單資訊</p>
                      </ComponentTab>
                    </div>
                    <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap">
                      <ComponentListItemText text="公司" text1="巨大機械" />
                      <ComponentListItemText text="採購組織" text1="台灣廠生產採購組織" />
                      <ComponentListItemText1 text="訂單號碼" text1="4000649723" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="訂單序號" text1="10" additionalClassNames="w-[200px]" />
                      <ComponentListItemText text="廠商(編號)" text1="華銘(0001000641)" />
                    </div>
                    <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap">
                      <ComponentListItemText1 text="訂貨量" text1="100" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="驗收量" text1="0" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="在途量" text1="0" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="廠商料號" text1="X4MK01-0100" additionalClassNames="w-[410px]" />
                    </div>
                    <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap">
                      <ComponentListItemText1 text="料號" text1="1127-BB2980-004" additionalClassNames="w-[400px]" />
                      <Helper2 text="品名" text1="F 下叉接頭 A6061 2PC JSG019 ALL-SIZE SU" />
                    </div>
                    <Helper2 text="規格" text1="車架料 上叉支桿 鋁6061 G2B63F/29 74.8X80.2 GIANT" additionalClassNames="leading-[22px] text-[14px] whitespace-nowrap" />
                  </>
                )}
                {is1 && (
                  <>
                    <ComponentTab>
                      <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">原訂單資訊</p>
                    </ComponentTab>
                    <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap">
                      <ComponentListItemText text="公司" text1="巨大機械" />
                      <ComponentListItemText text="採購組織" text1="台灣廠生產採購組織" />
                      <ComponentListItemText1 text="訂單號碼" text1="4000649723" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="訂單序號" text1="10" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="單號序號" text1="400064972310" additionalClassNames="w-[200px]" />
                    </div>
                    <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap">
                      <ComponentListItemText1 text="訂貨量" text1="100" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="驗收量" text1="0" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="在途量" text1="0" additionalClassNames="w-[200px]" />
                      <ComponentListItemText1 text="統計預計交期" text1="2025/01/10" additionalClassNames="w-[200px]" />
                      <ComponentListItemText text="廠商(編號)" text1="華銘(0001000641)" />
                    </div>
                    <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap">
                      <ComponentListItemText1 text="廠商料號" text1="X4MK01-0100" additionalClassNames="w-[410px]" />
                      <ComponentListItemText1 text="料號" text1="1127-BB2980-004" additionalClassNames="w-[400px]" />
                    </div>
                    <Helper2 text="品名" text1="F 下叉接頭 A6061 2PC JSG019 ALL-SIZE SU" additionalClassNames="leading-[22px] text-[14px] whitespace-nowrap" />
                  </>
                )}
              </div>
            )}
          </div>
          {isOrSelected && (
            <>
              <div className="relative shrink-0 w-full" data-name="Table/FiltersResults">
                <div className="content-stretch flex flex-col items-start pb-[16px] px-[20px] relative w-full">
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="stack">
                    <div className="content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0" data-name="stack">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
                      <div className="content-stretch flex font-semibold items-center leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap" data-name="label">
                        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] relative shrink-0">廠商</p>
                        <p className="font-['Public_Sans:SemiBold',sans-serif] relative shrink-0">{` :`}</p>
                      </div>
                      <ComponentChipText text="Chip" />
                      <ComponentChipText text="Chip" />
                      <ComponentChipText text="Chip" />
                      <ComponentChipText text="Chip" />
                    </div>
                    <ComponentButtonText text="Medium" />
                  </div>
                </div>
              </div>
              <div className={`content-stretch flex items-center relative shrink-0 w-full ${isSelected ? "bg-[rgba(0,94,184,0.16)]" : ""}`} data-name="Table/Order/Head">
                <div className={`relative shrink-0 w-[200px] ${isSelected ? "" : "bg-[#f4f6f8]"}`} data-name="Table/Cell">
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex items-center relative w-full">
                      <ComponentCheckbox>
                        <path clipRule="evenodd" d={svgPaths.p21d8a650} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" id="primary-shape" />
                      </ComponentCheckbox>
                      <ComponentStackText text="Table th" />
                    </div>
                  </div>
                </div>
                <div className={`relative ${isSelected ? "flex-[1_0_0] min-h-px min-w-px" : "bg-[#f4f6f8] shrink-0 w-[97px]"}`} data-name="Table/Cell">
                  <div className={`flex flex-row items-center size-full ${isSelected ? "justify-end" : ""}`}>
                    <div className={`content-stretch flex items-center relative w-full ${isSelected ? "justify-end" : ""}`}>
                      <ComponentStackText text="Table th" />
                    </div>
                  </div>
                </div>
                <div className={`relative shrink-0 ${isSelected ? "" : "bg-[#f4f6f8] w-[120px]"}`} data-name="Table/Cell">
                  <div className={`flex flex-row items-center size-full ${isSelected ? "justify-end" : ""}`}>
                    <div className={`content-stretch flex items-center relative ${isSelected ? "justify-end" : "w-full"}`}>
                      <ComponentStackText text="Table th" />
                    </div>
                  </div>
                </div>
                <div className={`relative shrink-0 ${isSelected ? "" : "bg-[#f4f6f8] w-[65px]"}`} data-name="Table/Cell">
                  <div className={`flex flex-row items-center size-full ${isSelected ? "justify-end" : "justify-center"}`}>
                    <div className={`content-stretch flex items-center relative ${isSelected ? "justify-end" : "justify-center w-full"}`}>
                      <ComponentStackText text="Table th" />
                    </div>
                  </div>
                </div>
                {is2 && (
                  <>
                    <TableCell additionalClassNames="w-[140px]" />
                    <TableCell additionalClassNames="w-[110px]" />
                    <TableCell additionalClassNames="w-[90px]" />
                    <TableCell additionalClassNames="w-[90px]" />
                    <Wrapper3 additionalClassNames="bg-[#f4f6f8]">
                      <ComponentStackText text="Table th" />
                    </Wrapper3>
                    <div className="bg-[#f4f6f8] flex-[1_0_0] min-h-px min-w-px relative" data-name="Table/Cell">
                      <div className="flex flex-row items-center size-full">
                        <div className="content-stretch flex items-center relative w-full">
                          <div className="content-stretch flex gap-[4px] items-center p-[16px] shrink-0" data-name="stack" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {isSelected && (
                  <div className="h-[30px] relative shrink-0 w-[5px]" data-name="stack">
                    <div aria-hidden="true" className="absolute border-[#919eab] border-r border-solid inset-[0_-0.5px_0_0] pointer-events-none" />
                    <div className="flex flex-row items-center justify-center size-full">
                      <div className="content-stretch flex items-center justify-center py-[16px] size-full" />
                    </div>
                  </div>
                )}
              </div>
              <TableOrderHead text="Table td" text1="Table td" text2="Table td" text3="Table td" text4="Table td" text5="Table td" text6="Table td" text7="Table td" />
              <TableOrderHead text="Table td" text1="Table td" text2="Table td" text3="Table td" text4="Table td" text5="Table td" text6="Table td" text7="Table td" />
              <TableOrderHead text="Table td" text1="Table td" text2="Table td" text3="Table td" text4="Table td" text5="Table td" text6="Table td" text7="Table td" />
              <div className="relative shrink-0 w-full" data-name="Scroll">
                <div className="content-stretch flex items-start pl-[88px] pr-[50px] py-[4px] relative w-full">
                  <div className="bg-[#637381] h-[6px] opacity-48 rounded-[12px] shrink-0 w-[64px]" data-name="scroll" />
                </div>
              </div>
              <TablePagination className="relative shrink-0 w-[1080px]" />
            </>
          )}
          {isOr && (
            <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
              <div className="bg-[#f4f6f8] col-1 h-[634px] ml-0 mt-0 rounded-[8px] row-1 w-[1080px]" />
              <div className="col-1 content-stretch flex gap-[12px] h-[86.741px] items-center justify-end ml-[366.47px] mt-[17.35px] p-[24px] relative row-1 w-[685.036px]" data-name="DialogActions">
                <div className="content-stretch flex gap-[12px] h-[55px] items-center justify-end p-[24px] relative shrink-0 w-[505px]" data-name="DialogActions">
                  <div className="content-stretch flex items-center relative shrink-0">
                    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
                      <div className="relative shrink-0 size-[36px]" data-name="icons/notifications/ic-chat">
                        <div className="absolute inset-[0.17%_0_3.69%_0]" data-name="stack">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 23.0734">
                            <g id="stack">
                              <path clipRule="evenodd" d={svgPaths.p3a4a2480} fill="url(#paint0_linear_4330_12145)" fillRule="evenodd" id="vector" />
                              <path clipRule="evenodd" d={svgPaths.p24d6df00} fill="url(#paint1_linear_4330_12145)" fillRule="evenodd" id="vector_2" />
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
                              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4330_12145" x1="8.15606" x2="24" y1="7.22946" y2="23.0734">
                                <stop stopColor="#77ED8B" />
                                <stop offset="1" stopColor="#22C55E" />
                              </linearGradient>
                              <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_4330_12145" x1="0" x2="19.3023" y1="0" y2="19.3023">
                                <stop stopColor="#00B8D9" />
                                <stop offset="1" stopColor="#006C9C" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#005eb8] text-[16px] underline whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        歷程
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-1 content-stretch flex gap-[16px] h-[86.741px] items-center ml-0 mt-[17.35px] pl-[24px] pr-[12px] py-[24px] relative row-1 w-[321.151px]" data-name="交貨排程">
                <div className="content-stretch flex gap-[17px] items-center relative shrink-0">
                  <div className={`h-[48px] min-w-[48px] relative rounded-[8px] shrink-0 ${is1 ? "bg-[rgba(142,51,255,0.08)] w-[93px]" : "bg-[rgba(0,94,184,0.08)]"}`} data-name="ToggleButton">
                    <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[8px] ${is1 ? "border-[#8e33ff]" : "border-[#005eb8]"}`} />
                    <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                      <div className={`content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative ${is1 ? "size-full" : "h-full"}`}>
                        <div className={`font-semibold leading-[22px] relative shrink-0 whitespace-nowrap ${is1 ? 'font-["Public_Sans:SemiBold",sans-serif] text-[#8e33ff] text-[14px]' : 'font-["Public_Sans:SemiBold","Noto_Sans_JP:Bold",sans-serif] text-[#005eb8] text-[16px] text-center'}`}>
                          <p className="mb-0">{is1 ? "拆單" : is ? "原單調整" : ""}</p>
                          <p>17056357</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] whitespace-nowrap">修正項目</p>
                </div>
                <div className="content-stretch flex gap-[6px] h-[86px] items-center justify-center relative shrink-0" data-name="Pagination">
                  <div className="opacity-48 relative rounded-[500px] shrink-0 size-[40px]" data-name="IconButton">
                    <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[500px]" />
                    <Wrapper1>
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={is1 ? "0 0 6.99876 14.0013" : "0 0 5.8323 11.6678"}>
                        <path d={is1 ? svgPaths.pfcc7f80 : svgPaths.p3d3af100} fill={is1 ? "var(--fill-0, #1D7BF5)" : "var(--fill-0, #637381)"} id="primary-shape" />
                      </svg>
                    </Wrapper1>
                  </div>
                  <div className="flex flex-col font-['Public_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 size-[40px] text-[#1c252e] text-[14px] text-center">
                    <p className="leading-[22px]">1/20</p>
                  </div>
                  <IconButton additionalClassNames="bg-[#005eb8] size-[40px]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={is1 ? "0 0 7.05925 14.0311" : "0 0 5.88271 11.6925"}>
                      <path d={is1 ? svgPaths.p2221d100 : svgPaths.p2165200} fill={is1 ? "var(--fill-0, #1D7BF5)" : "var(--fill-0, white)"} id="primary-shape" />
                    </svg>
                  </IconButton>
                </div>
              </div>
              <div className="col-1 h-[506px] ml-[27px] mt-[104px] relative row-1 w-[1025px]">
                <div className="absolute contents left-[-0.17px] top-0">
                  {is && (
                    <DialogActions additionalClassNames="top-[405px]">
                      <ComponentPrimaryActionText text="提交廠商" additionalClassNames="bg-[#004680]" />
                      <ComponentSecondaryActionText text="暫存" />
                    </DialogActions>
                  )}
                  <div className="absolute contents left-[-0.17px] top-0">
                    <div className="absolute contents left-[-0.17px] top-0">
                      <div className={`absolute bg-white left-[-0.17px] rounded-[8px] top-0 w-[1025.333px] ${is1 ? "h-[407px]" : "h-[405px]"}`} />
                    </div>
                  </div>
                  <div className={`-translate-x-1/2 -translate-y-1/2 absolute left-1/2 w-[943px] ${is1 ? "h-[414.343px] top-[calc(50%-7.83px)]" : "content-stretch flex flex-col h-[338.239px] items-start top-[calc(50%-52.86px)]"}`}>
                    <div className={is1 ? "absolute contents left-0 top-0" : "grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"}>
                      <div className={is1 ? "absolute contents left-0 top-[60.46px]" : "col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-[97.36px] place-items-start relative row-1"}>
                        <div className={`rounded-[8px] w-[943px] ${is1 ? "absolute h-[291.54px] left-0 top-[60.46px]" : "col-1 h-[257.281px] ml-0 mt-0 relative row-1"}`} data-name="Textarea">
                          <div className="content-stretch flex flex-col items-start relative size-full">
                            <div className={`min-h-[98px] relative rounded-[8px] w-full ${is1 ? "shrink-0" : "flex-[1_0_0] min-w-px"}`} data-name="wrap">
                              <div className="min-h-[inherit] overflow-clip rounded-[inherit] size-full">
                                <div className={`content-stretch flex items-start min-h-[inherit] px-[14px] py-[16px] relative ${is1 ? "w-full" : "size-full"}`}>
                                  <p className={`flex-[1_0_0] font-["Public_Sans:Regular",sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[15px] ${is1 ? "text-[#919eab]" : "text-[#1c252e]"}`}>{is1 ? "Label" : is ? "&nbsp;" : ""}</p>
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
                        <div className={`content-stretch flex flex-col gap-[10px] items-start w-[861px] ${is1 ? "absolute left-[31px] top-[83.55px]" : "col-1 ml-[5px] mt-[22.37px] relative row-1"}`}>
                          <div className={`bg-white h-[60px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 ${is1 ? "content-stretch flex gap-[10px] items-center pr-[45px] py-[10px] w-[899px]" : "w-full"}`}>
                            {is && (
                              <div className="flex flex-row items-center size-full">
                                <div className="content-stretch flex gap-[20px] items-center px-[45px] py-[10px] relative size-full">
                                  <ComponentStack text="項次" text1="1" additionalClassNames="w-[50px]" />
                                  <ComponentStack text="預計交期" text1="2025/01/10" additionalClassNames="w-[100px]" />
                                  <ComponentStack text="原廠商交期" text1="2025/01/15" additionalClassNames="w-[100px]" />
                                  <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#ff5630] text-[14px] text-ellipsis w-full whitespace-nowrap">新廠商可交貨日</p>
                                    <ComponentSmallSelectText text="2025/01/15">
                                      <path d={svgPaths.p29522f00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                                    </ComponentSmallSelectText>
                                  </div>
                                  <ComponentStack text="原交貨量" text1="20" additionalClassNames="w-[100px]" />
                                  <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#ff5630] text-[14px] text-ellipsis w-full whitespace-nowrap">新交貨量</p>
                                    <ComponentTextFieldText text="20" />
                                  </div>
                                </div>
                              </div>
                            )}
                            {is1 && (
                              <>
                                <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[80px]" data-name="stack">
                                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-ellipsis w-full whitespace-nowrap">單據序號</p>
                                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-w-full relative shrink-0 text-[#919eab] text-[14px] w-[min-content]">1</p>
                                  <div className="h-[39px] shrink-0 w-[239px]" />
                                </div>
                                <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[239px]" data-name="stack">
                                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-[14px] text-ellipsis w-full whitespace-nowrap">{` 料號`}</p>
                                  <Helper3 />
                                </div>
                                <div className="content-stretch flex flex-col font-normal gap-[4px] h-[60px] items-start leading-[22px] relative shrink-0 text-[14px] w-[80px]" data-name="stack">
                                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] h-[22px] overflow-hidden relative shrink-0 text-[#ff5630] text-ellipsis w-full whitespace-nowrap">訂單序號</p>
                                  <p className="font-['Public_Sans:Regular',sans-serif] relative shrink-0 text-[#919eab] w-full">10</p>
                                </div>
                                <ComponentStack text="預計交期" text1="2025/01/10" additionalClassNames="w-[80px]" />
                                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#ff5630] text-[14px] text-ellipsis w-full whitespace-nowrap">廠商可交貨日</p>
                                  <SmallSelect1 />
                                </div>
                                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[150px]" data-name="stack">
                                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[22px] leading-[22px] overflow-hidden relative shrink-0 text-[#ff5630] text-[14px] text-ellipsis w-full whitespace-nowrap">交貨量</p>
                                  <ComponentTextFieldText1 text="Label" />
                                </div>
                              </>
                            )}
                          </div>
                          <div className={`bg-white h-[38px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 ${is1 ? "content-stretch flex gap-[10px] items-center py-[10px] w-[899px]" : "w-full"}`} data-name="項次2">
                            {is && (
                              <div className="flex flex-row items-center size-full">
                                <div className="content-stretch flex gap-[20px] items-center px-[45px] py-[10px] relative size-full">
                                  <ComponentStackText1 text="2" additionalClassNames="w-[50px]" />
                                  <ComponentStackText1 text="2025/01/10" additionalClassNames="w-[100px]" />
                                  <ComponentStackText1 text="2025/01/20" additionalClassNames="w-[100px]" />
                                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-[150px]" data-name="stack">
                                    <ComponentSmallSelectText text="2025/01/20">
                                      <path d={svgPaths.p29522f00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                                    </ComponentSmallSelectText>
                                  </div>
                                  <ComponentStackText1 text="30" additionalClassNames="w-[100px]" />
                                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-[150px]" data-name="stack">
                                    <ComponentTextFieldText text="30" />
                                  </div>
                                  <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:trash-bin-trash-bold">
                                    <PrimaryShape>
                                      <path d={svgPaths.p309dd480} fill="var(--fill-0, #FF5630)" />
                                      <path clipRule="evenodd" d={svgPaths.p2846fa00} fill="var(--fill-0, #FF5630)" fillRule="evenodd" />
                                    </PrimaryShape>
                                  </div>
                                </div>
                              </div>
                            )}
                            {is1 && (
                              <>
                                <ComponentStackText1 text="2" additionalClassNames="w-[80px]" />
                                <Helper3 />
                                <ComponentStackText1 text="450" additionalClassNames="w-[80px]" />
                                <ComponentStackText1 text="2025/01/10" additionalClassNames="w-[80px]" />
                                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[150px]" data-name="stack">
                                  <SmallSelect1 />
                                </div>
                                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[150px]" data-name="stack">
                                  <ComponentTextFieldText1 text="Label" />
                                </div>
                                <Helper1 additionalClassNames="size-[24px]" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {is && (
                        <div className="col-1 h-[97px] ml-0 mt-0 relative row-1 w-[943px]">
                          <div className="absolute content-stretch flex flex-col items-start left-0 top-[-0.02px] w-[943px]">
                            <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full">
                              <Wrapper7>
                                <div className="relative shrink-0" data-name="Checkbox">
                                  <div className="flex flex-row items-center size-full">
                                    <Text text="原料號" />
                                  </div>
                                </div>
                                <ComponentHelper>1127-BB2980-004</ComponentHelper>
                              </Wrapper7>
                              <Wrapper7>
                                <Wrapper3>
                                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#ff5630] text-[14px] whitespace-nowrap">新料號</p>
                                </Wrapper3>
                                <ComponentHelper>{` `}</ComponentHelper>
                              </Wrapper7>
                            </div>
                          </div>
                          <div className="absolute content-stretch flex gap-[10px] items-start justify-end left-0 top-[43.98px] w-[943px]">
                            <Wrapper4 additionalClassNames="flex-[1_0_0] min-h-px min-w-px">
                              <div className="relative shrink-0" data-name="Checkbox">
                                <div className="flex flex-row items-center size-full">
                                  <Text text="交貨排程" />
                                </div>
                              </div>
                              <ComponentSmallSelectText1 text="調整期數" additionalClassNames="shrink-0 w-[138px]" />
                            </Wrapper4>
                            <Wrapper4 additionalClassNames="shrink-0 w-[723px]">
                              <div className="relative shrink-0" data-name="Checkbox">
                                <div className="flex flex-row items-center size-full">
                                  <Text text="修正備註" />
                                </div>
                              </div>
                              <ComponentSmallSelectText1 text="&nbsp;" additionalClassNames="flex-[1_0_0] min-h-px min-w-px" />
                            </Wrapper4>
                          </div>
                        </div>
                      )}
                      {is1 && (
                        <>
                          <SmallSelectText1 text="UnChecked" additionalClassNames="left-0 w-[943px]" />
                          <SmallSelectText1 text="UnChecked" additionalClassNames="left-[205px] w-[738px]" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {is1 && (
                  <DialogActions additionalClassNames="top-[412px]">
                    <ComponentPrimaryActionText text="Action" additionalClassNames="bg-[#1c252e]" />
                    <ComponentSecondaryActionText text="Cancel" />
                  </DialogActions>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Component1() {
  return <Component className="relative size-full" property1="建立修正單/原單調整" />;
}