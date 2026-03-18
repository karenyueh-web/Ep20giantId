import svgPaths from "./svg-j17ickc90g";
type TablePaginationProps = {
  className?: string;
  dense?: boolean;
  mobile?: boolean;
  variant?: "Pagination";
};

function TablePagination({ className, dense = true, mobile = false, variant = "Pagination" }: TablePaginationProps) {
  const isMobileAndPagination = mobile && variant === "Pagination";
  const isNotMobileAndPagination = !mobile && variant === "Pagination";
  return (
    <div className={className || `content-stretch flex py-[10px] relative ${isMobileAndPagination ? "flex-col gap-[24px] items-start pl-[16px] pr-[8px] w-[375px]" : "gap-[20px] items-center justify-center px-[8px] w-[1080px]"}`}>
      {isNotMobileAndPagination && (
        <>
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center">Rows per page:</p>
          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="select">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">5</p>
            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
              <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]" data-name="primary-shape">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.34969 4.66909">
                  <path d={svgPaths.p29522f00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                </svg>
              </div>
            </div>
          </div>
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">6-10 of 11</p>
          <div className="content-stretch flex items-start relative shrink-0" data-name="next/prev">
            <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
              <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
                <div className="absolute inset-[20.83%_37.54%_20.83%_33.3%]" data-name="primary-shape">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.8323 11.6678">
                    <path d={svgPaths.p3d3af100} fill="var(--fill-0, #919EAB)" fillOpacity="0.8" id="primary-shape" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
              <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-forward-fill">
                <div className="absolute inset-[20.71%_33.09%_20.83%_37.49%]" data-name="primary-shape">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.88271 11.6925">
                    <path d={svgPaths.p2165200} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isMobileAndPagination && (
        <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full" data-name="stack">
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-right">Rows per page:</p>
          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="select">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">5</p>
            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
              <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]" data-name="primary-shape">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0245 7.00364">
                  <path d={svgPaths.p3c609d00} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                </svg>
              </div>
            </div>
          </div>
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px] whitespace-pre-wrap">6-10 of 11</p>
          <div className="content-stretch flex items-start relative shrink-0" data-name="next/prev">
            <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
              <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
                <div className="absolute inset-[20.83%_37.54%_20.83%_33.3%]" data-name="primary-shape">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.99876 14.0013">
                    <path d={svgPaths.pfcc7f80} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
              <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-forward-fill">
                <div className="absolute inset-[20.71%_33.09%_20.83%_37.49%]" data-name="primary-shape">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.05925 14.0311">
                    <path d={svgPaths.p2221d100} fill="var(--fill-0, #1D7BF5)" id="primary-shape" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isMobileAndPagination && dense && (
        <div className="content-stretch flex gap-[9px] items-center relative shrink-0" data-name="Switch">
          <div className="content-stretch flex flex-col h-[38px] items-start justify-center relative shrink-0" data-name="switch container">
            <div className="h-[20px] relative shrink-0 w-[33px]" data-name="switch">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 20">
                <g id="switch">
                  <path d={svgPaths.p19873780} fill="var(--fill-0, #919EAB)" fillOpacity="0.48" />
                  <circle cx="10" cy="10" fill="var(--fill-0, white)" id="thumb" r="7" />
                </g>
              </svg>
            </div>
          </div>
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">UnChecked</p>
        </div>
      )}
    </div>
  );
}

export default function Component({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex flex-col items-start relative"} data-name="員工帳號管理">
      <div className="bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 w-full" data-name="Table/Order">
        <div className="relative shrink-0 w-full" data-name="stack">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
                <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex items-center px-[14px] relative size-full">
                      <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="start adornment">
                        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="✳️ start adornment">
                          <div className="absolute inset-[12.5%_12.48%_12.48%_12.5%]" data-name="primary-shape">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0058 18.0058">
                              <path d={svgPaths.p2e7aad00} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">&nbsp;</p>
                      <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
                        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">採購姓名</p>
                      </div>
                      <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
                <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex items-center px-[14px] relative size-full">
                      <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="start adornment">
                        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="✳️ start adornment">
                          <div className="absolute inset-[12.5%_12.48%_12.48%_12.5%]" data-name="primary-shape">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0058 18.0058">
                              <path d={svgPaths.p2e7aad00} fill="var(--fill-0, #919EAB)" id="primary-shape" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">94854</p>
                      <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
                        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">採購帳號</p>
                      </div>
                      <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
                <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex items-center px-[14px] relative size-full">
                      <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">&nbsp;</p>
                      <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
                        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">採購組織</p>
                      </div>
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
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
                <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex items-center px-[14px] relative size-full">
                      <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap">&nbsp;</p>
                      <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
                        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">採購狀態</p>
                      </div>
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
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[560px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[12px] h-[62px] items-center justify-center px-[20px] relative shrink-0 w-[153px]" data-name="Table/FiltersResults">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1c252e] text-[14px]">
              <span className="leading-[22px]">{`1 `}</span>
              <span className="leading-[22px] text-[#637381]">results found</span>
            </p>
          </div>
          <div className="bg-white flex-[1_0_0] h-[62px] min-h-px min-w-px relative" data-name="DataGrid/Toolbar">
            <div className="flex flex-row items-center justify-end size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-end px-[20px] relative size-full">
                <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
                  <div className="overflow-clip relative shrink-0 size-[18px]" data-name="start icon">
                    <div className="absolute inset-[12.5%]" data-name="primary-shape">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 13.5">
                        <path d={svgPaths.p2db63c10} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Columns</p>
                </div>
                <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
                  <div className="overflow-clip relative shrink-0 size-[18px]" data-name="start icon">
                    <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-1/4" data-name="primary-shape">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 9">
                        <path d={svgPaths.p2d72280} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Filters</p>
                </div>
                <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
                  <div className="overflow-clip relative shrink-0 size-[18px]" data-name="start icon">
                    <div className="absolute inset-[12.5%]" data-name="primary-shape">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 13.5">
                        <path d={svgPaths.p3aee3700} fill="var(--fill-0, #1C252E)" id="primary-shape" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Export</p>
                </div>
                <div className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0" data-name="Button">
                  <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
                    <p className="leading-[24px]">更新人員名單</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative shrink-0 w-full" data-name="Table/FiltersResults">
          <div className="content-stretch flex flex-col items-start pb-[16px] px-[20px] relative w-full">
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="stack">
              <div className="content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0" data-name="stack">
                <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
                <div className="content-stretch flex font-semibold items-center leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]" data-name="label">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] relative shrink-0">採購帳號</p>
                  <p className="font-['Public_Sans:SemiBold',sans-serif] relative shrink-0">{` :`}</p>
                </div>
                <div className="bg-[rgba(145,158,171,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] relative rounded-[8px] shrink-0" data-name="Chip">
                  <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0" data-name="label container">
                    <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">94854</p>
                  </div>
                  <div className="mr-[-2px] opacity-48 overflow-clip relative shrink-0 size-[20px]" data-name="action">
                    <div className="absolute inset-[8.33%]" data-name="primary-shape">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
                        <path clipRule="evenodd" d={svgPaths.p11eab300} fill="var(--fill-0, #1C252E)" fillRule="evenodd" id="primary-shape" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[8px] relative rounded-[8px] shrink-0" data-name="Button">
                <div className="overflow-clip relative shrink-0 size-[20px]" data-name="start icon">
                  <div className="absolute inset-[8.29%_12.5%_8.37%_12.5%]" data-name="primary-shape">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 16.6667">
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
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-name="Table/Order/Head">
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">採購帳號</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">員工姓名</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">角色</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">SAP帳號</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[300px]" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">採購組織</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[140px]" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">採購群組</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[63px]" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">狀態</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[180px]" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">mail</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" data-name="Table/Cell">
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">&nbsp;</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
            <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="stack">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[4px] items-center p-[16px] w-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-[76px] relative shrink-0 w-full" data-name="Table/Order/Head">
          <div className="content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
            <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[100px]" data-name="Table/Cell">
              <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
                  <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline">G94854</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[150px]" data-name="Table/Cell">
              <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
                <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0" data-name="texts">
                  <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">李宜璇-Evelyn Lee</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
              <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">採購</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
              <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">G00094854</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0 w-[300px]" data-name="Table/Cell">
              <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">1101、1010、1011</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0 w-[140px]" data-name="Table/Cell">
              <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">T30、112</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center justify-end px-[10px] py-[16px] relative shrink-0 w-[63px]" data-name="Table/Cell">
              <div className="bg-[rgba(34,197,94,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0 w-[44px]" data-name="✳️ secondary action">
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#118d57] text-[12px] text-center">啟用</p>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0 w-[180px]" data-name="Table/Cell">
              <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">jennpham@giant.com.tw</p>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
        </div>
        <div className="relative shrink-0 w-full" data-name="Scroll">
          <div className="content-stretch flex items-start pl-[88px] pr-[50px] py-[4px] relative w-full">
            <div className="bg-[#637381] h-[6px] opacity-48 rounded-[12px] shrink-0 w-[64px]" data-name="scroll" />
          </div>
        </div>
        <TablePagination className="content-stretch flex gap-[20px] items-center justify-center overflow-clip px-[8px] py-[10px] relative shrink-0 w-[1080px]" />
      </div>
    </div>
  );
}