import clsx from "clsx";
import svgPaths from "./svg-4x09ghq1iv";
type WrapperProps = {
  additionalClassNames?: string;
  text: string;
  additionalClassNames1?: string;
};

function Wrapper({ children, additionalClassNames = "", text, additionalClassNames1 = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("h-[36px] min-w-[64px] relative rounded-[8px]", additionalClassNames)}>
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className={clsx("content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative", additionalClassNames)}>
          <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
            <p className="leading-[24px]">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
type Stack1Props = {
  text: string;
  text1: string;
};

function Stack1({ text, text1 }: Stack1Props) {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[150px]">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] h-[22px] overflow-hidden relative shrink-0 text-[#0c0c0d] text-ellipsis w-full whitespace-nowrap">{text}</p>
      <p className="font-['Public_Sans:Regular',sans-serif] relative shrink-0 text-[#919eab] w-full whitespace-pre-wrap">{text1}</p>
    </div>
  );
}
type StackProps = {
  text: string;
  text1: string;
};

function Stack({ text, text1 }: StackProps) {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[150px]">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] h-[22px] overflow-hidden relative shrink-0 text-[#1c252e] text-ellipsis w-full whitespace-nowrap">{text}</p>
      <p className="font-['Public_Sans:Regular',sans-serif] relative shrink-0 text-[#919eab] w-full whitespace-pre-wrap">{text1}</p>
    </div>
  );
}
type ListItemText2Props = {
  text: string;
  text1: string;
};

function ListItemText2({ text, text1 }: ListItemText2Props) {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[400px]">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">{text}</p>
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#005eb8] underline w-[788px] whitespace-pre-wrap">{text1}</p>
    </div>
  );
}
type ListItemText1Props = {
  text: string;
  text1: string;
  additionalClassNames?: string;
};

function ListItemText1({ text, text1, additionalClassNames = "" }: ListItemText1Props) {
  return (
    <div className={clsx("content-stretch flex gap-[10px] items-start relative shrink-0", additionalClassNames)}>
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">{text}</p>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">{text1}</p>
    </div>
  );
}
type ListItemTextProps = {
  text: string;
  text1: string;
  additionalClassNames?: string;
};

function ListItemText({ text, text1, additionalClassNames = "" }: ListItemTextProps) {
  return (
    <div className={clsx("content-stretch flex gap-[10px] items-start relative shrink-0", additionalClassNames)}>
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">{text}</p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">{text1}</p>
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" data-name="訂單明細">
      <div className="absolute bg-white inset-0 rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)]" data-name="dialog" />
      <div className="absolute bg-white content-stretch flex flex-col gap-[10px] inset-[2.67%_3.35%_9.37%_3.46%] items-start">
        <div className="content-stretch flex gap-[17px] items-center relative shrink-0 w-[1204px]">
          <div className="bg-[rgba(0,94,184,0.08)] h-[48px] min-w-[48px] relative rounded-[8px] shrink-0" data-name="ToggleButton">
            <div aria-hidden="true" className="absolute border border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[12px] relative">
                <div className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#005eb8] text-[16px] text-center whitespace-nowrap">
                  <p className="mb-0">廠商確認中(V)</p>
                  <p>17056357</p>
                </div>
              </div>
            </div>
          </div>
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">基本資料</p>
          <p className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#005eb8] text-[16px] underline" style={{ fontVariationSettings: "'wdth' 100" }}>
            more
          </p>
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">2025/01/01 00:00</p>
        </div>
        <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full">
            <ListItemText text="訂單類型" text1="Z2QB" additionalClassNames="w-[200px]" />
            <ListItemText1 text="公司" text1="巨大機械" additionalClassNames="w-[200px]" />
            <ListItemText1 text="採購組織" text1="台灣廠生產採購組織" additionalClassNames="w-[200px]" />
            <ListItemText text="訂單序號" text1="10" additionalClassNames="w-[200px]" />
            <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[154px]" data-name="ListItemText">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">單號序號</p>
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">400064972310</p>
              <ListItemText text="採購人員" text1="OOO" additionalClassNames="w-[200px]" />
            </div>
          </div>
          <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full">
            <ListItemText text="訂貨量" text1="100" additionalClassNames="w-[200px]" />
            <ListItemText text="驗收量" text1="0" additionalClassNames="w-[200px]" />
            <ListItemText text="比對單價" text1="300" additionalClassNames="w-[200px]" />
            <ListItemText text="單位" text1="SET" additionalClassNames="w-[200px]" />
            <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[200px]" data-name="ListItemText">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">leadtime</p>
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">5</p>
            </div>
          </div>
          <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full">
            <ListItemText1 text="廠商(編號)" text1="華銘(0001000641)" additionalClassNames="w-[200px]" />
            <ListItemText text="料號" text1="1127-BB2980-004" additionalClassNames="w-[201px]" />
            <ListItemText text="客戶品牌" text1="G01" additionalClassNames="w-[200px]" />
            <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[260px]" data-name="ListItemText">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">廠商料號</p>
              <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#005eb8] underline">X4MK01-0100(限整採可編輯)</p>
            </div>
          </div>
          <div className="content-stretch flex items-center relative shrink-0 w-full">
            <ListItemText1 text="品名" text1="F 下叉接頭 A6061 2PC JSG019 ALL-SIZE SU" additionalClassNames="leading-[22px] text-[14px] w-[400px]" />
          </div>
          <div className="content-stretch flex items-center relative shrink-0 w-full">
            <div className="content-stretch flex gap-[10px] items-start leading-[22px] relative shrink-0 text-[14px] w-[400px]" data-name="ListItemText">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">規格</p>
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381] w-[1090px] whitespace-pre-wrap">{`(KR8020DLRFSX170)(J-KIT DIRECT)ST-R8020L+BR-R8070R W/O 5"FM(35MM) 1700 W/BLK CABLE(SM-BH90-JK-SSR) RESIN W/FIN (FOR MOUNT OF 140MM) W/35X48MMx2 BOLT`}</p>
            </div>
          </div>
          <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full">
            <ListItemText2 text="項目註記(內部)" text1="2305,24SU_COSPEED_G_ER(限GEM採購可改)" />
            <ListItemText2 text="物料PO內文" text1="DISCONTINUED, CHANGE TO 1560-CROSSC-0008(限GEM採購可改)" />
          </div>
        </div>
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
          <div className="bg-[#f4f6f8] col-1 h-[602.002px] ml-0 mt-0 rounded-[8px] row-1 w-[1203.942px]" />
          <div className="col-1 content-stretch flex gap-[12px] h-[82.363px] items-center justify-end ml-[408.78px] mt-0 p-[24px] relative row-1 w-[763.651px]" data-name="DialogActions">
            <div className="content-stretch flex gap-[12px] h-[55px] items-center justify-end p-[24px] relative shrink-0 w-[505px]" data-name="DialogActions">
              <Wrapper additionalClassNames="bg-[#ff5630] shrink-0" text="強制關單" additionalClassNames1="h-full" />
              <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
                <div className="relative shrink-0 size-[36px]" data-name="icons/notifications/ic-chat">
                  <div className="absolute inset-[0.17%_0_3.69%_0]" data-name="stack">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 23.0734">
                      <g id="stack">
                        <path clipRule="evenodd" d={svgPaths.p3a4a2480} fill="url(#paint0_linear_4215_1585)" fillRule="evenodd" id="vector" />
                        <path clipRule="evenodd" d={svgPaths.p24d6df00} fill="url(#paint1_linear_4215_1585)" fillRule="evenodd" id="vector_2" />
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
                        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4215_1585" x1="8.15606" x2="24" y1="7.22946" y2="23.0734">
                          <stop stopColor="#77ED8B" />
                          <stop offset="1" stopColor="#22C55E" />
                        </linearGradient>
                        <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_4215_1585" x1="0" x2="19.3023" y1="0" y2="19.3023">
                          <stop stopColor="#00B8D9" />
                          <stop offset="1" stopColor="#006C9C" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <p className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#005eb8] text-[16px] underline" style={{ fontVariationSettings: "'wdth' 100" }}>
                  歷程
                </p>
              </div>
            </div>
          </div>
          <div className="col-1 content-stretch flex gap-[16px] h-[82.363px] items-center ml-[0.25px] mt-0 pl-[24px] pr-[12px] py-[24px] relative row-1 w-[358.007px]" data-name="交貨排程">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] w-[214px] whitespace-pre-wrap">請確認交貨排程是否OK</p>
          </div>
          <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[28.24px] mt-[69px] place-items-start relative row-1">
            <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
              <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
                <div className="bg-white col-1 h-[444.647px] ml-0 mt-0 relative rounded-[8px] row-1 w-[1143.002px]">
                  <div className="absolute bg-white content-stretch flex font-normal gap-[20px] items-center justify-center leading-[22px] left-[0.01px] p-[10px] rounded-tl-[8px] rounded-tr-[8px] text-[14px] top-0 w-[942px]">
                    <Stack text="項次" text1="1" />
                    <Stack text="預計交期" text1="2025/01/10" />
                    <div className="content-stretch flex flex-col gap-[4px] h-[60px] items-start relative shrink-0 w-[150px]" data-name="stack">
                      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] h-[22px] overflow-hidden relative shrink-0 text-[#ff3b30] text-ellipsis w-full whitespace-nowrap">廠商可交貨日期</p>
                      <p className="font-['Public_Sans:Regular',sans-serif] relative shrink-0 text-[#919eab] w-full whitespace-pre-wrap">2025/01/10</p>
                    </div>
                    <Stack1 text="交貨量" text1="100" />
                    <Stack1 text="差異日期" text1="0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-1 h-[82.363px] ml-[28.87px] mt-[518.14px] relative row-1 w-[1143.312px]" data-name="DialogActions">
            <div className="flex flex-row items-center justify-end size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-end p-[24px] relative size-full">
                <Wrapper additionalClassNames="bg-[#004680] flex-[1_0_0] min-h-px" text="訂單確認" additionalClassNames1="size-full" />
                <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ secondary action">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                    <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative size-full">
                      <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">
                        <p className="leading-[24px]">退回廠商</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute aspect-[24/24] left-[1.63%] overflow-clip right-[96.52%] top-[15px]" data-name="icons/solid/ic-solar:close-circle-bold">
        <div className="absolute inset-[8.33%]" data-name="primary-shape">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
            <path clipRule="evenodd" d={svgPaths.p275a9800} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
          </svg>
        </div>
      </div>
    </div>
  );
}