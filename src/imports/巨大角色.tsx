import svgPaths from "./svg-aoi0f7rsax";
import imgImgAvatar25 from "figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";

function Img() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.25">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#dad0fc] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar25} />
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="bg-[#dfe3e8] content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#1c252e] content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">My setting</p>
      </div>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill">
          <path d={svgPaths.p2b32f00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function SmallSelect() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative rounded-[8px] shrink-0" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">繁中</p>
      <IconsSolidIcEvaArrowIosDownwardFill />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Button />
      <SmallSelect />
    </div>
  );
}

function Stack() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center pb-[16px] pt-[12px] relative shrink-0 w-full" data-name="stack">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic overflow-hidden relative shrink-0 text-[#181d27] text-[14px] text-center text-ellipsis">GTM採購</p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] overflow-hidden relative shrink-0 text-[#637381] text-[14px] text-center text-ellipsis">hudson.alvarez@giant.com</p>
      <Frame />
    </div>
  );
}

export default function Component() {
  return (
    <div className="content-stretch flex flex-col items-center justify-end relative size-full" data-name="巨大角色">
      <Avatar />
      <Stack />
    </div>
  );
}