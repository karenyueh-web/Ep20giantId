import imgImage9 from "figma:asset/2e851582cd76fb62e4bff0ecb2b3f04315f22c29.png";

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start justify-center relative size-full">
      <div className="flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] min-w-full relative shrink-0 text-[36px] text-black w-[min-content]">
        <p className="leading-[44px] whitespace-pre-wrap">欄位點擊可排序</p>
      </div>
      <div className="h-[329px] relative shrink-0 w-[1151px]" data-name="image 9">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage9} />
      </div>
    </div>
  );
}