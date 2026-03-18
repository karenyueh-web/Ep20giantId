import svgPaths from "./svg-jk6epzc9me";

export default function TableOrderHead() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex items-center justify-between relative size-full" data-name="Table/Order/Head">
      <div className="relative shrink-0 w-[200px]" data-name="Table/Cell">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center relative w-full">
            <div className="content-stretch flex items-center pl-[8px] relative shrink-0" data-name="checkbox">
              <div className="relative shrink-0" data-name="✳️ checkbox">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center relative">
                    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
                      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-on">
                        <div className="absolute inset-[8.33%]" data-name="primary-shape">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.666 16.666">
                            <path d={svgPaths.p2dde97c0} fill="var(--fill-0, #005EB8)" id="primary-shape" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[14px] text-black text-center whitespace-nowrap">3 selected</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Table/Cell">
        <div className="flex flex-row items-center justify-end size-full">
          <div className="content-stretch flex items-center justify-end w-full" />
        </div>
      </div>
      <div className="content-stretch flex items-center justify-center px-[10px] py-[16px] relative shrink-0" data-name="stack">
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#004680] text-[14px] text-center whitespace-nowrap">批次同意</p>
      </div>
    </div>
  );
}