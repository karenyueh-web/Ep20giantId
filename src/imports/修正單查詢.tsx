import clsx from "clsx";
import svgPaths from "./svg-mbpt3bnv7i";
type Wrapper11Props = {
  additionalClassNames?: string;
};

function Wrapper11({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper11Props>) {
  return (
    <div className={clsx("relative", additionalClassNames)}>
      <div className="content-stretch flex flex-col items-start relative w-full">{children}</div>
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
    <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
      <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-h-[inherit] min-w-[inherit] relative">{children}</div>
    </div>
  );
}

function ComponentIconButton({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative rounded-[500px] shrink-0 size-[36px]">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative size-full">{children}</div>
      </div>
    </div>
  );
}

function Wrapper7({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[48px] min-h-[48px] min-w-[48px] relative shrink-0">
      <Wrapper8>{children}</Wrapper8>
    </div>
  );
}
type Wrapper6Props = {
  additionalClassNames?: string;
};

function Wrapper6({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper6Props>) {
  return (
    <div className={clsx("overflow-clip relative shrink-0 size-[20px]", additionalClassNames)}>
      <div className="absolute inset-[8.33%]" data-name="primary-shape">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
          {children}
        </svg>
      </div>
    </div>
  );
}
type Wrapper5Props = {
  additionalClassNames?: string;
};

function Wrapper5({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper5Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative">{children}</div>
      </div>
    </div>
  );
}
type Wrapper4Props = {
  additionalClassNames?: string;
};

function Wrapper4({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper4Props>) {
  return (
    <Wrapper10 additionalClassNames={clsx("h-[24px] min-w-[24px] relative rounded-[6px] shrink-0", additionalClassNames)}>
      <div className="content-stretch flex gap-[6px] h-full items-center justify-center min-w-[inherit] px-[6px] relative">{children}</div>
    </Wrapper10>
  );
}
type TableCell1Props = {
  additionalClassNames?: string;
};

function TableCell1({ children, additionalClassNames = "" }: React.PropsWithChildren<TableCell1Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center relative w-full">{children}</div>
      </div>
    </div>
  );
}

function Wrapper3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative w-full">{children}</div>
      </div>
    </div>
  );
}
type Wrapper3Props = {
  additionalClassNames?: string;
};
type Wrapper2Props = {
  additionalClassNames?: string;
  text: string;
  additionalClassNames1?: string;
};

function Wrapper2({ children, additionalClassNames = "", text, additionalClassNames1 = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative w-full">
          <div className={clsx("content-stretch flex items-center py-[16px] relative shrink-0", additionalClassNames)}>
            <TextsText text={text} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper9 additionalClassNames="h-[30px]">
      <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[4px] relative">{children}</div>
    </Wrapper9>
  );
}
type ComponentButtonTextProps = {
  text: string;
};

function ComponentButtonText({ text, children }: React.PropsWithChildren<ComponentButtonTextProps>) {
  return (
    <Wrapper1>
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="start icon">
        <div className="absolute inset-[12.5%]" data-name="primary-shape">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 13.5">
            {children}
          </svg>
        </div>
      </div>
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px] whitespace-nowrap">{text}</p>
    </Wrapper1>
  );
}
type TableCellProps = {
  additionalClassNames?: string;
};

function TableCell({ additionalClassNames = "" }: TableCellProps) {
  return (
    <div className={clsx("relative", additionalClassNames)}>
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex items-center justify-end p-[16px] w-full" />
      </div>
    </div>
  );
}
type TableCellText1Props = {
  text: string;
  additionalClassNames?: string;
};

function TableCellText1({ text, additionalClassNames = "" }: TableCellText1Props) {
  return (
    <Wrapper3 additionalClassNames={additionalClassNames}>
      <StackText text={text} additionalClassNames="justify-center" />
    </Wrapper3>
  );
}
type TableCellTextProps = {
  text: string;
};

function TableCellText({ text }: TableCellTextProps) {
  return (
    <Wrapper3 additionalClassNames="w-[120px]">
      <StackText text={text} />
    </Wrapper3>
  );
}
type TextsTextProps = {
  text: string;
  additionalClassNames?: string;
};

function TextsText({ text, additionalClassNames = "" }: TextsTextProps) {
  return (
    <div className={clsx("content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0", additionalClassNames)}>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">{text}</p>
    </div>
  );
}

function StackText({ text, additionalClassNames = "" }: StackTextProps) {
  return (
    <div className={clsx("content-stretch flex items-center py-[16px] relative shrink-0", additionalClassNames)}>
      <TextsText text={text} />
    </div>
  );
}
type WrapperProps = {
  text: string;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
  text6: string;
  text7: string;
  text8: string;
};

function Wrapper({ text, text1, text2, text3, text4, text5, text6, text7, text8, children }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className="content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
      <TableCell1 additionalClassNames="w-[194px]">
        <ComponentCheckbox>
          <path clipRule="evenodd" d={svgPaths.p39b35980} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </ComponentCheckbox>
        <StackText text={text} additionalClassNames="justify-center" />
      </TableCell1>
      <TableCell1 additionalClassNames="w-[97px]">
        <div className="content-stretch flex items-center overflow-clip py-[16px] relative shrink-0 w-[85px]" data-name="stack">
          <TextsText text={text1} additionalClassNames="overflow-clip" />
        </div>
      </TableCell1>
      <div className="relative shrink-0 w-[100px]" data-name="Table/Cell">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center p-[16px] relative w-full">
            <Wrapper4 additionalClassNames="bg-[rgba(0,94,184,0.16)]">
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center whitespace-nowrap">{children}</p>
            </Wrapper4>
          </div>
        </div>
      </div>
      <TableCellText text={text2} />
      <TableCellText text={text3} />
      <Wrapper2 additionalClassNames="w-[65px]" text={text4} />
      <TableCellText1 text={text5} additionalClassNames="w-[140px]" />
      <TableCellText1 text={text6} additionalClassNames="w-[110px]" />
      <Wrapper2 additionalClassNames="w-[90px]" text={text7} additionalClassNames1="justify-center" />
      <Wrapper2 additionalClassNames="w-[90px]" text={text8} additionalClassNames1="justify-center" />
      <TableCell additionalClassNames="flex-[1_0_0] min-h-px min-w-px" />
      <TableCell additionalClassNames="shrink-0 w-[68px]" />
    </div>
  );
}
type TextProps = {
  text: string;
  additionalClassNames?: string;
};

function Text({ text, additionalClassNames = "" }: TextProps) {
  return (
    <div className={clsx("content-stretch flex items-center relative w-full", additionalClassNames)}>
      <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] whitespace-nowrap">{text}</p>
      </div>
    </div>
  );
}
type ComponentTableCellTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ComponentTableCellText({ text, additionalClassNames = "" }: ComponentTableCellTextProps) {
  return (
    <div className={clsx("bg-[#f4f6f8] relative shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center size-full">
        <Text text={text} />
      </div>
    </div>
  );
}
type ComponentStackTextProps = {
  text: string;
};

function ComponentStackText({ text }: ComponentStackTextProps) {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0">
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center whitespace-nowrap">{text}</p>
    </div>
  );
}

function ComponentCheckbox({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative shrink-0">
      <Wrapper5>
        <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
          <Wrapper6>{children}</Wrapper6>
        </div>
      </Wrapper5>
    </div>
  );
}
type ComponentTextFieldProps = {
  text: string;
  text1: string;
};

function ComponentTextField({ text, text1, children }: React.PropsWithChildren<ComponentTextFieldProps>) {
  return (
    <Wrapper11 additionalClassNames="flex-[1_0_0] min-h-px min-w-px">
      <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
        <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[14px] relative size-full">
            <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="start adornment">
              <div className="overflow-clip relative shrink-0 size-[24px]" data-name="✳️ start adornment">
                <div className="absolute inset-[12.5%_12.48%_12.48%_12.5%]" data-name="primary-shape">
                  <svg fill="none" preserveAspectRatio="none" viewBox="0 0 18.0058 18.0058" className="absolute block size-full">
                    <path d={svgPaths.p2e7aad00} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">{text}</p>
            <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px] whitespace-nowrap">{text1}</p>
            </div>
            <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
          </div>
        </div>
      </div>
    </Wrapper11>
  );
}
type ComponentTabTextProps = {
  text: string;
};

function ComponentTabText({ text }: ComponentTabTextProps) {
  return (
    <Wrapper7>
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px] whitespace-nowrap">{text}</p>
    </Wrapper7>
  );
}
type ComponentTabProps = {
  text: string;
  text1: string;
};

function ComponentTab({ text, text1 }: ComponentTabProps) {
  return (
    <Wrapper7>
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px] whitespace-nowrap">{text}</p>
      <Wrapper4 additionalClassNames="bg-[rgba(145,158,171,0.16)]">
        <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#637381] text-[12px] text-center whitespace-nowrap">{text1}</p>
      </Wrapper4>
    </Wrapper7>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" data-name="修正單查詢">
      <div className="content-stretch flex flex-col items-start relative size-full">
        <Wrapper11 additionalClassNames="shrink-0 w-[1080px]">
          <div className="bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 w-full" data-name="Table/Order">
            <div className="relative shrink-0 w-full" data-name="Tabs">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[40px] items-center px-[20px] relative w-full">
                  <Wrapper7>
                    <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px] whitespace-nowrap">All</p>
                  </Wrapper7>
                  <div className="h-[48px] min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 2">
                    <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
                    <Wrapper8>
                      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">草稿(DR)</p>
                      <Wrapper4 additionalClassNames="bg-[rgba(255,171,0,0.16)]">
                        <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#b76e00] text-[12px] text-center whitespace-nowrap">32</p>
                      </Wrapper4>
                    </Wrapper8>
                  </div>
                  <ComponentTab text="廠商確認中(V)" text1="23" />
                  <ComponentTab text="採購確認中(B)" text1="48" />
                  <ComponentTabText text="單據已確認，資料處理中(CP)" />
                  <ComponentTabText text="修正通過(SS)" />
                  <ComponentTabText text="關閉結案(CL)" />
                  <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" data-name="divider" />
                </div>
              </div>
            </div>
            <div className="relative shrink-0 w-full" data-name="stack">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
                  <ComponentTextField text="&nbsp;" text1="訂單號碼" />
                  <ComponentTextField text="&nbsp;" text1="訂單序號" />
                </div>
              </div>
            </div>
            <div className="content-stretch flex gap-[560px] items-start relative shrink-0 w-full">
              <div className="h-[62px] relative shrink-0 w-[153px]" data-name="Table/FiltersResults">
                <div className="flex flex-col items-center justify-center size-full">
                  <div className="content-stretch flex flex-col gap-[12px] items-center justify-center px-[20px] relative size-full">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">
                      <span className="leading-[22px]">{`3 `}</span>
                      <span className="leading-[22px] text-[#637381]">results found</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white flex-[1_0_0] h-[62px] min-h-px min-w-px relative" data-name="DataGrid/Toolbar">
                <div className="flex flex-row items-center justify-end size-full">
                  <div className="content-stretch flex gap-[12px] items-center justify-end px-[20px] relative size-full">
                    <ComponentButtonText text="Columns">
                      <path d={svgPaths.p2db63c10} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                    </ComponentButtonText>
                    <Wrapper1>
                      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="start icon">
                        <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-1/4" data-name="primary-shape">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 9">
                            <path d={svgPaths.p2d72280} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px] whitespace-nowrap">Filters</p>
                    </Wrapper1>
                    <ComponentButtonText text="Export">
                      <path d={svgPaths.p3aee3700} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                    </ComponentButtonText>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative shrink-0 w-full" data-name="Table/FiltersResults">
              <div className="content-stretch flex flex-col items-start pb-[16px] px-[20px] relative w-full">
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="stack">
                  <div className="content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0" data-name="stack">
                    <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
                    <div className="content-stretch flex font-semibold items-center leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap" data-name="label">
                      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] relative shrink-0">訂單序號</p>
                      <p className="font-['Public_Sans:SemiBold',sans-serif] relative shrink-0">{` :`}</p>
                    </div>
                    <div className="bg-[rgba(145,158,171,0.08)] h-[24px] relative rounded-[8px] shrink-0" data-name="Chip">
                      <div className="flex flex-row items-center size-full">
                        <div className="content-stretch flex h-full items-center pl-[3px] pr-[5px] relative">
                          <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0" data-name="label container">
                            <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center whitespace-nowrap">10</p>
                          </div>
                          <Wrapper6 additionalClassNames="mr-[-2px] opacity-48">
                            <path clipRule="evenodd" d={svgPaths.p11eab300} fill="var(--fill-0, #1C252E)" fillRule="evenodd" id="primary-shape" />
                          </Wrapper6>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Wrapper9 additionalClassNames="h-[36px]">
                    <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[8px] relative">
                      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="start icon">
                        <div className="absolute inset-[8.29%_12.5%_8.37%_12.5%]" data-name="primary-shape">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 16.6667">
                            <g id="primary-shape">
                              <path d={svgPaths.p9117480} fill="var(--fill-0, #FF5630)" />
                              <path clipRule="evenodd" d={svgPaths.p27d3c500} fill="var(--fill-0, #FF5630)" fillRule="evenodd" />
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ff5630] text-[14px] text-center whitespace-nowrap">
                        <p className="leading-[24px]">Clear</p>
                      </div>
                    </div>
                  </Wrapper9>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-name="Table/Order/Head">
              <Wrapper3 additionalClassNames="bg-[#f4f6f8] w-[200px]">
                <ComponentCheckbox>
                  <path clipRule="evenodd" d={svgPaths.p39b35980} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
                </ComponentCheckbox>
                <ComponentStackText text="廠商(編號)" />
              </Wrapper3>
              <ComponentTableCellText text="採購組織" additionalClassNames="w-[97px]" />
              <ComponentTableCellText text="修正單狀態" additionalClassNames="w-[97px]" />
              <ComponentTableCellText text="修正單號" additionalClassNames="w-[120px]" />
              <ComponentTableCellText text="訂單號碼" additionalClassNames="w-[120px]" />
              <div className="bg-[#f4f6f8] relative shrink-0 w-[65px]" data-name="Table/Cell">
                <div className="flex flex-row items-center justify-center size-full">
                  <Text text="訂單序號" additionalClassNames="justify-center" />
                </div>
              </div>
              <Wrapper3 additionalClassNames="bg-[#f4f6f8] w-[140px]">
                <ComponentStackText text="料號" />
              </Wrapper3>
              <Wrapper3 additionalClassNames="bg-[#f4f6f8] w-[110px]">
                <ComponentStackText text="訂單日期" />
              </Wrapper3>
              <Wrapper3 additionalClassNames="bg-[#f4f6f8] w-[90px]">
                <ComponentStackText text="驗收量" />
              </Wrapper3>
              <Wrapper3 additionalClassNames="bg-[#f4f6f8] w-[90px]">
                <ComponentStackText text="訂貨量" />
              </Wrapper3>
              <Wrapper5 additionalClassNames="bg-[#f4f6f8]">
                <ComponentStackText text="&nbsp;" />
              </Wrapper5>
              <div className="bg-[#f4f6f8] flex-[1_0_0] min-h-px min-w-px relative" data-name="Table/Cell">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center relative w-full">
                    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="stack">
                      <div className="flex flex-row items-center size-full">
                        <div className="content-stretch flex gap-[4px] items-center p-[16px] w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[76px] relative shrink-0 w-full" data-name="Table/Order/Head">
              <Wrapper text="SHIMANOSIC(0001000734)" text1="GEM採購.." text2="00000001" text3="400649723" text4="10" text5="1129-CSL0075-L01" text6="2024/12/25" text7="0" text8="100">
                V
              </Wrapper>
              <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
            </div>
            <div className="h-[76px] relative shrink-0 w-full" data-name="Table/Order/Head">
              <Wrapper text="SHIMANOSIC(0001000734)" text1="GEM採購.." text2="00000002" text3="400649723" text4="10" text5="1129-CSL0075-L01" text6="2024/12/25" text7="0" text8="100">
                V
              </Wrapper>
              <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
            </div>
            <div className="h-[76px] relative shrink-0 w-full" data-name="Table/Order/Head">
              <Wrapper text="SHIMANOSIC(0001000734)" text1="GEM採購.." text2="00000003" text3="400649723" text4="10" text5="1129-CSL0075-L01" text6="2024/12/25" text7="0" text8="100">
                V
              </Wrapper>
              <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
            </div>
            <div className="relative shrink-0 w-full" data-name="Scroll">
              <div className="content-stretch flex items-start pl-[88px] pr-[50px] py-[4px] relative w-full">
                <div className="bg-[#637381] h-[6px] opacity-48 rounded-[12px] shrink-0 w-[64px]" data-name="scroll" />
              </div>
            </div>
            <div className="relative shrink-0 w-[1080px]" data-name="Table/Pagination">
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex gap-[20px] items-center justify-center px-[8px] py-[10px] relative w-full">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">Rows per page:</p>
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="select">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">5</p>
                    <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
                      <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]" data-name="primary-shape">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.34969 4.66909">
                          <path d={svgPaths.p29522f00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">6-10 of 11</p>
                  <div className="content-stretch flex items-start relative shrink-0" data-name="next/prev">
                    <ComponentIconButton>
                      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
                        <div className="absolute inset-[20.83%_37.54%_20.83%_33.3%]" data-name="primary-shape">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.8323 11.6678">
                            <path d={svgPaths.p3d3af100} fill="var(--fill-0, #919EAB)" fillOpacity="0.8" id="primary-shape" />
                          </svg>
                        </div>
                      </div>
                    </ComponentIconButton>
                    <ComponentIconButton>
                      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-forward-fill">
                        <div className="absolute inset-[20.71%_33.09%_20.83%_37.49%]" data-name="primary-shape">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.88271 11.6925">
                            <path d={svgPaths.p2165200} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                          </svg>
                        </div>
                      </div>
                    </ComponentIconButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Wrapper11>
      </div>
    </div>
  );
}