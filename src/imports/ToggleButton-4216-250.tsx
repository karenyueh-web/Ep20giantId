export default function ToggleButton() {
  return (
    <div className="bg-[rgba(0,94,184,0.08)] relative rounded-[8px] size-full" data-name="ToggleButton">
      <div aria-hidden="true" className="absolute border border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative size-full">
          <div className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#005eb8] text-[16px] text-center whitespace-nowrap">
            <p className="mb-0">廠商確認中(V)</p>
            <p>17056357</p>
          </div>
        </div>
      </div>
    </div>
  );
}