import svgPaths from "./svg-vcni536e4m";

function IconsSolidIcSolarAddCircleBold({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="icons/solid/ic-solar:add-circle-bold">
      <div className="absolute inset-[8.33%]" data-name="primary-shape">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path clipRule="evenodd" d={svgPaths.pa468400} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" id="primary-shape" />
        </svg>
      </div>
    </div>
  );
}

function IconsSolidIcSolarTrashBinTrashBold({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="icons/solid/ic-solar:trash-bin-trash-bold">
      <div className="absolute inset-[8.29%_12.5%_8.37%_12.5%]" data-name="primary-shape">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
          <g id="primary-shape">
            <path d={svgPaths.p309dd480} fill="var(--fill-0, #1D7BF5)" />
            <path clipRule="evenodd" d={svgPaths.p2846fa00} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function IconsSolidIcSolarCloseCircleBold({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="icons/solid/ic-solar:close-circle-bold">
      <div className="absolute inset-[8.33%]" data-name="primary-shape">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path clipRule="evenodd" d={svgPaths.p275a9800} fill="var(--fill-0, #1D7BF5)" fillRule="evenodd" id="primary-shape" />
        </svg>
      </div>
    </div>
  );
}

export default function Component({ className }: { className?: string }) {
  return (
    <div className={className || "bg-white h-[772px] relative rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] w-[1263px]"} data-name="新增廠商">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute contents left-[calc(50%-4.5px)] top-1/2">
        <div className="absolute bg-[#f4f6f8] h-[573px] left-[50px] rounded-[8px] top-[175px] w-[1154px]" />
        <div className="absolute content-stretch flex gap-[16px] h-[58.868px] items-center left-[52.13px] pl-[24px] pr-[12px] py-[24px] top-[58px] w-[760.17px]" data-name="交貨排程">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] w-[214px] whitespace-pre-wrap">請輸入廠商編號</p>
        </div>
        <button className="absolute content-stretch cursor-pointer flex items-center left-[50px] top-[24px]">
          <IconsSolidIcSolarCloseCircleBold className="overflow-clip relative shrink-0 size-[24px]" />
        </button>
        <div className="absolute contents left-[73px] top-[199px]">
          <div className="absolute contents inset-[25.78%_6.41%_6.09%_5.78%]">
            <div className="absolute contents inset-[25.78%_6.41%_6.09%_5.78%]">
              <div className="absolute contents inset-[25.78%_6.41%_6.09%_5.78%]">
                <div className="absolute bg-white inset-[25.78%_6.41%_6.09%_5.78%] rounded-[8px]">
                  <div className="absolute contents left-[12px] top-[7px]">
                    <div className="absolute content-stretch flex flex-col h-[381px] items-start left-[12px] rounded-[8px] top-[7px] w-[1083.749px]" data-name="Textarea">
                      <div className="flex-[1_0_0] min-h-[98px] min-w-px relative rounded-[8px] w-full" data-name="wrap">
                        <div className="min-h-[inherit] overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex items-start min-h-[inherit] px-[14px] py-[16px] relative size-full">
                            <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] whitespace-pre-wrap">&nbsp;</p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute content-stretch flex items-start px-[4px] py-[12px] right-0 top-0" data-name="scroll">
                        <div className="bg-[#637381] h-[64px] opacity-48 rounded-[12px] shrink-0 w-[6px]" data-name="scroll" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute content-stretch flex flex-col items-start left-[108px] top-[220px] w-[1044px]">
            <div className="content-stretch flex h-[56px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black text-center">廠商編號</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">採購組織</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center justify-center relative shrink-0 w-[80px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">ALL</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[80px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">小平台</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[80px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">新訂單</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[80px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">修正單通</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[80px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">紙本發票</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[80px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">出貨通知</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[80px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">單價異常</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex items-center relative shrink-0 w-[80px]" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">零件維護</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">索樣單</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex h-[76px] items-center pr-[2px] relative shrink-0 w-full" data-name="Table/Order/Head">
              <IconsSolidIcSolarTrashBinTrashBold className="mr-[-2px] overflow-clip relative shrink-0 size-[24px]" />
              <div className="content-stretch flex items-center mr-[-2px] relative shrink-0 w-[150px]" data-name="Table/Cell">
                <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
                  <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[15px]">天心(000100461)</p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex items-center mr-[-2px] overflow-clip relative shrink-0 w-[100px]" data-name="Table/Cell">
                <div className="content-stretch flex items-center overflow-clip py-[16px] relative shrink-0 w-[85px]" data-name="stack">
                  <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0" data-name="texts">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">4111</p>
                  </div>
                </div>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 63">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="content-stretch flex h-[76px] items-center pr-[2px] relative shrink-0 w-full" data-name="Table/Order/Head">
              <IconsSolidIcSolarTrashBinTrashBold className="mr-[-2px] overflow-clip relative shrink-0 size-[24px]" />
              <div className="content-stretch flex items-center mr-[-2px] relative shrink-0 w-[150px]" data-name="Table/Cell">
                <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
                  <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[15px]">天心(000100461)</p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex items-center mr-[-2px] overflow-clip relative shrink-0 w-[100px]" data-name="Table/Cell">
                <div className="content-stretch flex items-center overflow-clip py-[16px] relative shrink-0 w-[85px]" data-name="stack">
                  <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0" data-name="texts">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">4112</p>
                  </div>
                </div>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 63">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
              <div className="h-[20px] mr-[-2px] relative shrink-0 w-[80px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 20">
                  <g id="Frame 64">
                    <path d={svgPaths.p35ca120} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <IconsSolidIcSolarAddCircleBold className="absolute left-[359px] overflow-clip size-[40px] top-[114px]" />
      </div>
      <div className="absolute content-stretch flex flex-col items-start left-[73px] top-[110px] w-[272px]" data-name="TextField">
        <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center px-[14px] relative size-full">
              <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis whitespace-nowrap">天心(000100461)</p>
              <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
              <div className="-translate-y-1/2 absolute content-stretch flex items-center pr-[10px] right-0 top-1/2" data-name="select arrow">
                <div className="overflow-clip relative shrink-0 size-[20px]" data-name="start adornment">
                  <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]" data-name="primary-shape">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6871 5.83637">
                      <path d={svgPaths.p40bcb00} fill="var(--fill-0, #637381)" id="primary-shape" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex gap-[12px] items-center justify-end left-[863px] top-[127px]" data-name="DialogActions" />
      <div className="-translate-x-1/2 absolute bg-[#00559c] bottom-[78.89%] content-stretch flex gap-[8px] items-center justify-center left-[calc(50%+506.5px)] min-w-[64px] px-[12px] rounded-[8px] top-[16.45%] w-[130px]" data-name="✳️ primary action">
        <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
          <p className="leading-[24px]">儲存</p>
        </div>
      </div>
    </div>
  );
}