function Switch() {
  return (
    <div className="bg-[#005eb8] relative rounded-[500px] shrink-0 w-full" data-name="switch">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex items-center justify-end p-[3px] relative w-full">
          <div className="relative shrink-0 size-[14px]" data-name="thumb">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <circle cx="7" cy="7" fill="var(--fill-0, white)" id="thumb" r="7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function SwitchContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[38px] items-start justify-center min-h-px min-w-px relative" data-name="switch container">
      <Switch />
    </div>
  );
}

export default function SecondaryAction() {
  return (
    <div className="content-stretch flex gap-[9px] items-center relative size-full" data-name="✳️ secondary action">
      <SwitchContainer />
    </div>
  );
}