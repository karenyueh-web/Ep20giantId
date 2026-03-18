import svgPaths from "./svg-drc0l5sxl7";

function IconsSolidIcSolarInfoCircleBold() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:info-circle-bold">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-solar:info-circle-bold">
          <path clipRule="evenodd" d={svgPaths.p344480} fill="var(--fill-0, #00B8D9)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Icon() {
  return (
    <div className="content-stretch flex h-full items-start pl-[16px] pr-[12px] pt-[8px] relative shrink-0" data-name="icon">
      <IconsSolidIcSolarInfoCircleBold />
    </div>
  );
}

function Texts() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="texts">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[4px] items-start justify-center pr-[8px] py-[8px] relative w-full">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#003768] text-[16px]">請繼續設定廠商負責的採購組織和採購群組</p>
        </div>
      </div>
    </div>
  );
}

function IconsSolidIcMingcuteCloseLine() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="icons/solid/ic-mingcute:close-line">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="icons/solid/ic-mingcute:close-line">
          <path clipRule="evenodd" d={svgPaths.p2c5f7400} fill="var(--fill-0, #003768)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Close() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[28px]" data-name="close">
      <IconsSolidIcMingcuteCloseLine />
    </div>
  );
}

function Stack() {
  return (
    <button className="content-stretch cursor-pointer flex h-full items-start pt-[4px] relative shrink-0" data-name="stack">
      <Close />
    </button>
  );
}

export default function Alert() {
  return (
    <div className="bg-[#cafdf5] content-stretch flex items-center pr-[8px] py-[6px] relative rounded-[8px] size-full" data-name="Alert">
      <div className="flex flex-row items-center self-stretch">
        <Icon />
      </div>
      <Texts />
      <div className="flex flex-row items-center self-stretch">
        <Stack />
      </div>
    </div>
  );
}