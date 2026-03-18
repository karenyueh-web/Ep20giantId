import clsx from "clsx";
import svgPaths from "./svg-8n5vljrge6";
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

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#f4f6f8] h-[602.002px] left-0 rounded-[8px] top-0 w-[1203.942px]" />
      <div className="absolute content-stretch flex gap-[12px] h-[82.363px] items-center justify-end left-[408.78px] p-[24px] top-0 w-[763.651px]" data-name="DialogActions">
        <div className="content-stretch flex gap-[12px] h-[55px] items-center justify-end p-[24px] relative shrink-0 w-[505px]" data-name="DialogActions">
          <Wrapper additionalClassNames="bg-[#ff5630] shrink-0" text="強制關單" additionalClassNames1="h-full" />
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
            <div className="relative shrink-0 size-[36px]" data-name="icons/notifications/ic-chat">
              <div className="absolute inset-[0.17%_0_3.69%_0]" data-name="stack">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 23.0734">
                  <g id="stack">
                    <path clipRule="evenodd" d={svgPaths.p3a4a2480} fill="url(#paint0_linear_4221_1441)" fillRule="evenodd" id="vector" />
                    <path clipRule="evenodd" d={svgPaths.p24d6df00} fill="url(#paint1_linear_4221_1441)" fillRule="evenodd" id="vector_2" />
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
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4221_1441" x1="8.15606" x2="24" y1="7.22946" y2="23.0734">
                      <stop stopColor="#77ED8B" />
                      <stop offset="1" stopColor="#22C55E" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_4221_1441" x1="0" x2="19.3023" y1="0" y2="19.3023">
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
      <div className="absolute content-stretch flex gap-[16px] h-[82.363px] items-center left-[0.25px] pl-[24px] pr-[12px] py-[24px] top-0 w-[358.007px]" data-name="交貨排程">
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] w-[214px] whitespace-pre-wrap">請輸入退回原因</p>
      </div>
      <div className="absolute contents left-[28.24px] top-[69px]">
        <div className="absolute contents left-[28.24px] top-[69px]">
          <div className="absolute contents left-[28.24px] top-[69px]">
            <div className="absolute bg-white h-[444.647px] left-[28.24px] rounded-[8px] top-[69px] w-[1143.002px]">
              <div className="absolute h-[413px] left-[18.44px] top-[13px] w-[1104px]" data-name="SmallSelect">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex gap-[10px] items-center justify-center relative size-full">
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
                      <div aria-hidden="true" className="absolute border border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="content-stretch flex gap-[12px] items-start pl-[12px] pr-[8px] py-[6px] relative size-full">
                        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">請簡述原因，限50字</p>
                        <div className="overflow-clip shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[82.363px] left-[28.87px] top-[518.14px] w-[1143.312px]" data-name="DialogActions">
        <div className="flex flex-row items-center justify-end size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-end p-[24px] relative size-full">
            <Wrapper additionalClassNames="bg-[#004680] flex-[1_0_0] min-h-px" text="退回廠商" additionalClassNames1="size-full" />
            <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ secondary action">
              <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative size-full">
                  <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">
                    <p className="leading-[24px]">取消</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}