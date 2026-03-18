import svgPaths from "@/imports/svg-d84x18jyny";

// 統一的收合按鈕組件
export function ToggleButton() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[267px] rounded-[500px] size-[26px] top-[27px] cursor-pointer hover:bg-[#f4f6f8] transition-colors z-50" data-name="toggle-button">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.08)] border-solid inset-0 pointer-events-none rounded-[500px] shadow-[0px_1px_2px_0px_rgba(145,158,171,0.16)]" />
      <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="icons/solid/ic-eva:arrow-ios-back-fill">
            <path d={svgPaths.p36867980} fill="var(--fill-0, #919EAB)" id="primary-shape" />
          </g>
        </svg>
      </div>
    </div>
  );
}