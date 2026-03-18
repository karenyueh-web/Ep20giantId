import imgImgAvatar25 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";

function Img() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[48px]" data-name="img">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[500px]" data-name="#Img_Avatar.25">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-[#d1fff4] inset-0 rounded-[500px]" />
          <img alt="" className="absolute max-w-none object-cover rounded-[500px] size-full" src={imgImgAvatar25} />
        </div>
      </div>
    </div>
  );
}

export default function Avatar() {
  return (
    <div className="bg-[#dfe3e8] content-stretch flex items-center justify-center relative rounded-[500px] size-full" data-name="Avatar">
      <Img />
    </div>
  );
}