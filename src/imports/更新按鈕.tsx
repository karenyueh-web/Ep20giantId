import svgPaths from "./svg-xqdbomdz5p";

export default function Component() {
  return (
    <div className="relative size-full" data-name="更新按鈕">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative size-full">
          <div className="h-[36px] min-w-[64px] relative rounded-bl-[8px] rounded-tl-[8px] shrink-0 w-[194px]" data-name="Button">
            <div aria-hidden="true" className="absolute border-[rgba(0,94,184,0.48)] border-b border-l border-solid border-t inset-0 pointer-events-none rounded-bl-[8px] rounded-tl-[8px]" />
            <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative size-full">
                <div className="flex flex-col font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#005eb8] text-[12px] text-center tracking-[0.4px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[16px]">資料更新時間:2025/05/05 12:30</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#005eb8] content-stretch flex h-[36px] items-center justify-center px-[5px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0 w-[40px]" data-name="Button">
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="start icon">
              <div className="absolute inset-[14.38%_13.54%_9.39%_13.54%]" data-name="primary-shape">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.5833 15.2472">
                  <path d={svgPaths.p326f900} fill="var(--fill-0, white)" id="primary-shape" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}