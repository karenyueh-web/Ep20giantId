import clsx from "clsx";
import svgPaths from "./svg-vi2pceknlo";
type HelperProps = {
  text: string;
  text1: string;
  text2: string;
};

function Helper({ text, text1, text2 }: HelperProps) {
  return (
    <div className="bg-white content-stretch flex gap-[20px] items-center p-[10px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-[1076px]">
      <ListItemTextText1 text="202522" />
      <ListItemTextText1 text="1100" />
      <ListItemTextText1 text="1101" />
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-[138px]">
        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">{"華銘(0001000641)"}</p>
      </div>
      <ListItemTextText1 text="3G915094K1" />
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">{text}</p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px] w-[76px] whitespace-pre-wrap">{text1}</p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">{text2}</p>
    </div>
  );
}
type ListItemTextText1Props = {
  text: string;
};

function ListItemTextText1({ text }: ListItemTextText1Props) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">{text}</p>
    </div>
  );
}
type ListItemTextTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ListItemTextText({ text, additionalClassNames = "" }: ListItemTextTextProps) {
  return (
    <div className={clsx("content-stretch flex flex-col items-start relative shrink-0", additionalClassNames)}>
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{text}</p>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute contents left-0 top-0">
        <div className="absolute bg-white left-0 rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_8px_16px_0px_rgba(145,158,171,0.16)] top-0 w-[1148px]" data-name="Snackbar">
          <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex gap-[12px] items-center pl-[4px] py-[4px] relative w-full">
              <div className="bg-[rgba(255,86,48,0.08)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[48px]" data-name="icon">
                <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:danger-bold">
                  <div className="absolute inset-[8.33%_12.5%]" data-name="primary-shape">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
                      <path clipRule="evenodd" d={svgPaths.p3d63d600} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="primary-shape" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="flex-[1_0_0] font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px] whitespace-pre-wrap">您無權限刪除以下訂單</p>
            </div>
          </div>
        </div>
        <div className="absolute contents left-0 top-[56px]">
          <div className="absolute contents inset-[8.98%_0_0_0]">
            <div className="absolute contents inset-[8.98%_0_0_0]">
              <div className="absolute contents inset-[8.98%_0_0_0]">
                <div className="absolute bg-white inset-[8.98%_0_0_0] rounded-bl-[8px] rounded-br-[8px]">
                  <div className="absolute content-stretch flex flex-col gap-[206px] items-start left-0 top-0 w-[1060px]">
                    <div className="relative shrink-0 w-full">
                      <div className="content-stretch flex flex-col items-start px-[10px] relative w-full">
                        <div className="bg-white content-stretch flex gap-[20px] items-center p-[10px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-[1076px]">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="ListItemText">
                            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] w-[56px] whitespace-pre-wrap">上傳周別</p>
                          </div>
                          <ListItemTextText text="公司" additionalClassNames="w-[100px]" />
                          <ListItemTextText text="採購組織" additionalClassNames="w-[100px]" />
                          <ListItemTextText text="廠商" additionalClassNames="w-[141px]" />
                          <ListItemTextText text="物料號碼" additionalClassNames="w-[100px]" />
                          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] w-[76px] whitespace-pre-wrap">交貨日期</p>
                          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] w-[76px] whitespace-pre-wrap">交貨量</p>
                          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] w-[76px] whitespace-pre-wrap">上傳人員</p>
                          <div className="relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
                            <div className="flex flex-row items-end justify-center size-full">
                              <div className="content-stretch flex items-end justify-center size-full" />
                            </div>
                          </div>
                        </div>
                        <Helper text="2024/12/12" text1="200" text2="OOO" />
                        <Helper text="2024/12/12" text1="200" text2="OOO" />
                        <Helper text="2024/12/12" text1="200" text2="OOO" />
                        <Helper text="2024/12/12" text1="200" text2="OOO" />
                        <Helper text="2024/12/12" text1="200" text2="OOO" />
                        <Helper text="2024/12/12" text1="200" text2="OOO" />
                      </div>
                    </div>
                    <div className="h-[15px] relative shrink-0 w-full" data-name="Scroll">
                      <div className="content-stretch flex items-start pl-[88px] pr-[50px] py-[4px] relative size-full">
                        <div className="bg-[#637381] h-[6px] opacity-48 rounded-[12px] shrink-0 w-[64px]" data-name="scroll" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-[calc(50%+538.83px)] rounded-bl-[8px] rounded-br-[8px] top-[calc(50%-160.92px)]" data-name="Scroll">
                <div className="content-stretch flex items-start px-[4px] py-[24px] relative">
                  <div className="bg-[#637381] h-[64px] opacity-48 rounded-[12px] shrink-0 w-[6px]" data-name="scroll" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}