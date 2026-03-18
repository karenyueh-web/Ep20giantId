import svgPaths from "./svg-g29eakwhmm";

export default function TableOrderHead() {
  return (
    <div className="bg-[#d9e8f5] content-stretch flex gap-[900px] items-center relative size-full" data-name="Table/Order/Head">
      <div className="relative shrink-0 w-[129px]" data-name="Table/Cell">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center relative w-full">
            <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
              <div className="relative shrink-0" data-name="✳️ checkbox">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center relative">
                    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
                      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-indeterminate">
                        <div className="absolute inset-[8.33%]" data-name="primary-shape">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
                            <path clipRule="evenodd" d={svgPaths.p220f9900} fill="var(--fill-0, #00559C)" fillRule="evenodd" id="primary-shape" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="stack">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] relative w-full">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black">3 selected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-[68px]" data-name="Table/Cell">
        <div className="flex flex-row items-center justify-end size-full">
          <div className="content-stretch flex items-center justify-end p-[16px] relative w-full">
            <div className="relative rounded-[500px] shrink-0 size-[36px]" data-name="✳️ secondary action">
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative size-full">
                  <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-solar:trash-bin-trash-bold">
                    <div className="absolute inset-[8.29%_12.5%_8.37%_12.5%]" data-name="primary-shape">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 16.6667">
                        <g id="primary-shape">
                          <path d={svgPaths.p9117480} fill="var(--fill-0, #004680)" />
                          <path clipRule="evenodd" d={svgPaths.p27d3c500} fill="var(--fill-0, #004680)" fillRule="evenodd" />
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
  );
}