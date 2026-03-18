function Link() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="link">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">帳號管理</p>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="link">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">巨大帳號管理</p>
    </div>
  );
}

function LinkActive() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-center min-h-px min-w-px relative" data-name="link active">
      <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#919eab] text-[14px] text-ellipsis whitespace-nowrap">巨大帳號設定</p>
    </div>
  );
}

function Links() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="links">
      <Link />
      <div className="relative shrink-0 size-[4px]" data-name="dot">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="var(--fill-0, #919EAB)" id="dot" r="2" />
        </svg>
      </div>
      <Link1 />
      <div className="relative shrink-0 size-[4px]" data-name="dot">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="var(--fill-0, #919EAB)" id="dot" r="2" />
        </svg>
      </div>
      <LinkActive />
    </div>
  );
}

function Stack() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start justify-center min-h-px min-w-[280px] relative" data-name="stack">
      <Links />
    </div>
  );
}

export default function Breadcrumb() {
  return (
    <div className="content-start flex flex-wrap gap-[16px] items-start justify-end relative size-full" data-name="Breadcrumb">
      <Stack />
    </div>
  );
}