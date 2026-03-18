import svgPaths from "./svg-9fgq629tv2";
import imgImgAvatar25 from "figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import imgImgAvatar1 from "figma:asset/d7c38e4c2ec5583f5bcb8f33bbcadbadf4ceed61.png";
import imgImgAvatar2 from "figma:asset/ba1f925e57c8f297bb26a2475302e1c715c37494.png";
import imgImgAvatar3 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";

function Img() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.25">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#ffd4b8] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar25} />
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img />
    </div>
  );
}

function StartAdornment() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="start adornment">
          <path d={svgPaths.p14834500} fill="var(--fill-0, #919EAB)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function StartAdornment1() {
  return (
    <div className="content-stretch flex items-center pl-0 pr-[8px] py-0 relative shrink-0" data-name="start adornment">
      <StartAdornment />
    </div>
  );
}

function EndAdornment() {
  return <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />;
}

function Wrap() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <StartAdornment1 />
          <p className="css-g0mm18 flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[15px] text-ellipsis">廠商名稱、廠商姓名、對話內容</p>
          <EndAdornment />
        </div>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap />
    </div>
  );
}

function ChatHeader() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[92px] items-center left-0 px-[20px] py-[16px] top-0 w-[1080px]" data-name="Chat/Header">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <Avatar />
      <TextField />
    </div>
  );
}

function Img1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#ffdbde] inset-0 rounded-[500px]" />
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

function Avatar1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img1 />
      <Status />
    </div>
  );
}

function Stack() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">shimano-ann</p>
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">6</p>
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">訂單編號: 4005....</p>
      <Badge />
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
      <Stack />
      <Stack1 />
    </div>
  );
}

function Item() {
  return (
    <div className="relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
          <Avatar1 />
          <Stack2 />
        </div>
      </div>
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
      <Item />
    </div>
  );
}

function Img2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#f6d3bd] inset-0 rounded-[500px]" />
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

function Avatar2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img2 />
      <Status1 />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">維樂-OOO</p>
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
    </div>
  );
}

function Badge1() {
  return (
    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">2</p>
    </div>
  );
}

function Stack5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">我們的船運突然....</p>
      <Badge1 />
    </div>
  );
}

function Stack6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
      <Stack4 />
      <Stack5 />
    </div>
  );
}

function Item1() {
  return (
    <div className="relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
          <Avatar2 />
          <Stack6 />
        </div>
      </div>
    </div>
  );
}

function Stack7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
      <Item1 />
    </div>
  );
}

function Img3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#fff2b9] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar3} />
        </div>
      </div>
    </div>
  );
}

function Status2() {
  return (
    <div className="absolute bottom-[2px] right-[2px] size-[10px]" data-name="✳️ status">
      <div className="absolute inset-[-10%]" style={{ "--fill-0": "rgba(255, 255, 255, 1)", "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <g id="â³ï¸ status">
            <path d={svgPaths.p177389f0} fill="var(--fill-0, white)" />
            <path d={svgPaths.p177389f0} stroke="var(--stroke-0, white)" />
            <circle cx="6" cy="6" id="ellipse" r="4" stroke="var(--stroke-0, #919EAB)" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Avatar3() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0" data-name="Avatar">
      <Img3 />
      <Status2 />
    </div>
  );
}

function Stack8() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">正新-OOO</p>
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#919eab] text-[12px] text-right w-[52px]">3 days</p>
    </div>
  );
}

function Badge2() {
  return (
    <div className="bg-[#22c55e] content-stretch flex h-[20px] items-center justify-center min-w-[20px] px-[6px] py-0 relative rounded-[500px] shrink-0" data-name="Badge">
      <p className="css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center text-white w-[7px]">1</p>
    </div>
  );
}

function Stack9() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#637381] text-[14px]">好的，那我們這....</p>
      <Badge2 />
    </div>
  );
}

function Stack10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="stack">
      <Stack8 />
      <Stack9 />
    </div>
  );
}

function Item2() {
  return (
    <div className="relative shrink-0 w-full" data-name="item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[20px] py-[12px] relative w-full">
          <Avatar3 />
          <Stack10 />
        </div>
      </div>
    </div>
  );
}

function Stack11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="stack">
      <Item2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex flex-col h-[738px] items-start left-0 px-0 py-[20px] top-[92px] w-[320px]">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-r border-solid inset-0 pointer-events-none" />
      <Stack3 />
      <Stack7 />
      <Stack11 />
    </div>
  );
}

function Stack12() {
  return (
    <div className="absolute inset-[9.42%_11.9%_8.83%_8.33%]" data-name="stack">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 95.714 98.1007">
        <g id="stack" opacity="0.48">
          <path clipRule="evenodd" d={svgPaths.p13246400} fill="var(--fill-0, #919EAB)" fillRule="evenodd" id="shape" opacity="0.48" />
          <path clipRule="evenodd" d={svgPaths.p58c35f0} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="shape_2" opacity="0.48" />
          <path clipRule="evenodd" d={svgPaths.p2a3d4100} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="shape_3" />
          <path clipRule="evenodd" d={svgPaths.p365c8900} fill="var(--fill-0, #919EAB)" fillRule="evenodd" id="shape_4" opacity="0.8" />
          <path clipRule="evenodd" d={svgPaths.p1b23ba80} fill="var(--fill-0, #22C55E)" fillRule="evenodd" id="shape_5" opacity="0.24" />
          <path clipRule="evenodd" d={svgPaths.p25558d00} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="shape_6" opacity="0.8" />
          <path clipRule="evenodd" d={svgPaths.p838e580} fill="var(--fill-0, #8E33FF)" fillRule="evenodd" id="shape_7" opacity="0.48" />
          <path clipRule="evenodd" d={svgPaths.pbff15f2} fill="var(--fill-0, #8E33FF)" fillRule="evenodd" id="shape_8" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}

function IconsEmptyBackground() {
  return (
    <div className="absolute left-0 size-[120px] top-0" data-name="icons/empty/background">
      <Stack12 />
    </div>
  );
}

function Stack13() {
  return (
    <div className="absolute inset-[25.83%_23.33%_26.46%_23.33%]" data-name="stack">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 57.2525">
        <g id="stack">
          <path d={svgPaths.p34f02f00} fill="url(#paint0_linear_8_2311)" id="shape" />
          <path d={svgPaths.p27495c20} fill="url(#paint1_linear_8_2311)" id="shape_2" opacity="0.2" />
          <g id="shape_3">
            <path d={svgPaths.p32a14a70} fill="url(#paint2_linear_8_2311)" />
            <path d={svgPaths.p15720e80} fill="url(#paint3_linear_8_2311)" />
            <path d={svgPaths.p6e59100} fill="url(#paint4_linear_8_2311)" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_8_2311" x1="0" x2="56.8987" y1="0" y2="63.6048">
            <stop stopColor="#FFD666" />
            <stop offset="1" stopColor="#FFAB00" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_8_2311" x1="0" x2="54.8038" y1="2.0045" y2="50.2613">
            <stop stopColor="#FFAB00" />
            <stop offset="1" stopColor="#B76E00" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_8_2311" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
            <stop stopColor="#FFF5CC" />
            <stop offset="1" stopColor="#FFD666" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_8_2311" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
            <stop stopColor="#FFF5CC" />
            <stop offset="1" stopColor="#FFD666" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_8_2311" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
            <stop stopColor="#FFF5CC" />
            <stop offset="1" stopColor="#FFD666" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function IconsEmptyIcChatActive() {
  return (
    <div className="relative shrink-0 size-[120px]" data-name="icons/empty/ic-chat-active">
      <IconsEmptyBackground />
      <Stack13 />
    </div>
  );
}

function Stack14() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-center justify-center left-[320px] top-[310px] w-[760px]" data-name="stack">
      <IconsEmptyIcChatActive />
      <p className="css-ew64yg font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#919eab] text-[18px]">You have raised the bar!</p>
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#919eab] text-[14px]">Write something awesome...</p>
    </div>
  );
}

function IconsSolidIcEvaSmilingFaceOutline() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:smiling-face-outline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-eva:smiling-face-outline">
          <path d={svgPaths.p93fc100} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconButton() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
      <IconsSolidIcEvaSmilingFaceOutline />
    </div>
  );
}

function IconsSolidIcSolarGalleryAddBold() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-solar:gallery-add-bold">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-solar:gallery-add-bold">
          <g id="primary-shape">
            <path d={svgPaths.p23f2fd80} fill="var(--fill-0, #637381)" />
            <path clipRule="evenodd" d={svgPaths.p2bb719f0} fill="var(--fill-0, #637381)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IconButton1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
      <IconsSolidIcSolarGalleryAddBold />
    </div>
  );
}

function Action() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="action">
      <IconButton1 />
    </div>
  );
}

function ChatInput() {
  return (
    <div className="absolute bg-white content-stretch flex h-[102px] items-center left-[320px] px-[8px] py-0 top-[728px] w-[760px]" data-name="Chat/Input">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <IconButton />
      <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#919eab] text-[14px]">Type a message</p>
      <Action />
    </div>
  );
}

export default function Chat() {
  return (
    <div className="bg-white overflow-clip relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] size-full" data-name="chat">
      <ChatHeader />
      <Frame />
      <Stack14 />
      <ChatInput />
    </div>
  );
}