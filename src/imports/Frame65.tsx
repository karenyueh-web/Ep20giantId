import imgImgAvatar1 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";
import imgImgAvatar2 from "figma:asset/118714dd2f34a2640c0c9304d9d9d2994d44c72a.png";

function Img() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#ffdbb8] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar1} />
        </div>
      </div>
    </div>
  );
}

function Status() {
  return (
    <div className="absolute bg-[#22c55e] bottom-[2px] right-[2px] rounded-[500px] size-[10px]" data-name="✳️ status">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[501px]" />
    </div>
  );
}

function Avatar() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img />
      <Status />
    </div>
  );
}

function Stack() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Regular',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">
        <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal">華銘</span>-ann
      </p>
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
      <Stack />
    </div>
  );
}

function Item() {
  return (
    <div className="h-[80px] relative rounded-[12px] shrink-0 w-full" data-name="item">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[3px_1px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative size-full">
          <Avatar />
          <Stack1 />
        </div>
      </div>
    </div>
  );
}

function Img1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#bfd5cd] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar2} />
        </div>
      </div>
    </div>
  );
}

function Status1() {
  return (
    <div className="absolute bg-[#22c55e] bottom-[2px] right-[2px] rounded-[500px] size-[10px]" data-name="✳️ status">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[501px]" />
    </div>
  );
}

function Avatar1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img1 />
      <Status1 />
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Regular','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">
        <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular','Noto_Sans_JP:Bold',sans-serif] font-normal">華銘</span>-太古祥平
      </p>
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
      <Stack2 />
    </div>
  );
}

function Item1() {
  return (
    <div className="h-[80px] relative rounded-[12px] shrink-0 w-full" data-name="item">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[3px_1px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative size-full">
          <Avatar1 />
          <Stack3 />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[7px] top-[7px] w-[269px]">
      <Item />
      <Item1 />
    </div>
  );
}

function Stack4() {
  return (
    <div className="absolute h-[180px] left-0 rounded-[6px] top-0 w-[284px]" data-name="stack" style={{ backgroundImage: "linear-gradient(252.184deg, rgb(233, 247, 250) 3.2822%, rgb(249, 236, 252) 96.894%)" }}>
      <Frame />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-0 top-0">
      <Stack4 />
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="relative size-full">
      <Group />
    </div>
  );
}