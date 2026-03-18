function DialogActionsHelper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
      <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] relative size-full">{children}</div>
    </div>
  );
}

export default function DialogActions() {
  return (
    <div className="relative size-full" data-name="DialogActions">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-end p-[24px] relative size-full">
          <div className="bg-[#004680] flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ primary action">
            <DialogActionsHelper>
              <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
                <p className="leading-[24px]">確認修改</p>
              </div>
            </DialogActionsHelper>
          </div>
          <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ secondary action">
            <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <DialogActionsHelper>
              <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">
                <p className="leading-[24px]">取消</p>
              </div>
            </DialogActionsHelper>
          </div>
        </div>
      </div>
    </div>
  );
}