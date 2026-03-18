import svgPaths from "./svg-v3l7yzgb32";

function EndIcon() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">3</p>
    </div>
  );
}

function Tab1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 7">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">採購確認中(B)</p>
      <EndIcon />
    </div>
  );
}

function EndIcon1() {
  return (
    <div className="bg-[rgba(145,158,171,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#637381] text-[12px] text-center">2</p>
    </div>
  );
}

function Tab() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 3">
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">初審失敗(F)</p>
      <EndIcon1 />
    </div>
  );
}

function Tabs() {
  return (
    <div className="relative shrink-0 w-full" data-name="Tabs">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[40px] items-center px-[20px] relative w-full">
          <Tab1 />
          <Tab />
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" data-name="divider" />
        </div>
      </div>
    </div>
  );
}

function StartAdornment1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="✳️ start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="â³ï¸ start adornment">
          <path d={svgPaths.p14834500} fill="var(--fill-0, #919EAB)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function StartAdornment() {
  return (
    <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="start adornment">
      <StartAdornment1 />
    </div>
  );
}

function LabelFocus() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">廠商姓名</p>
    </div>
  );
}

function EndAdornment() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function Wrap() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <StartAdornment />
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] whitespace-pre-wrap">&nbsp;</p>
          <LabelFocus />
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

function StartAdornment3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="✳️ start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="â³ï¸ start adornment">
          <path d={svgPaths.p14834500} fill="var(--fill-0, #919EAB)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function StartAdornment2() {
  return (
    <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="start adornment">
      <StartAdornment3 />
    </div>
  );
}

function LabelFocus1() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">公司名稱</p>
    </div>
  );
}

function EndAdornment1() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function Wrap1() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <StartAdornment2 />
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] whitespace-pre-wrap">&nbsp;</p>
          <LabelFocus1 />
          <EndAdornment1 />
        </div>
      </div>
    </div>
  );
}

function TextField1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap1 />
    </div>
  );
}

function LabelFocus2() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">申請角色</p>
    </div>
  );
}

function EndAdornment2() {
  return <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment" />;
}

function StartAdornment4() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="start adornment">
          <path d={svgPaths.p3f4b1500} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function SelectArrow() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex items-center pr-[10px] right-0 top-1/2" data-name="select arrow">
      <StartAdornment4 />
    </div>
  );
}

function Wrap2() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px] whitespace-pre-wrap">&nbsp;</p>
          <LabelFocus2 />
          <EndAdornment2 />
          <SelectArrow />
        </div>
      </div>
    </div>
  );
}

function TextField2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap2 />
    </div>
  );
}

function Stack() {
  return (
    <div className="relative shrink-0 w-full" data-name="stack">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
          <TextField />
          <TextField1 />
          <TextField2 />
        </div>
      </div>
    </div>
  );
}

function TableFiltersResults() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[62px] items-center justify-center px-[20px] relative shrink-0 w-[153px]" data-name="Table/FiltersResults">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1c252e] text-[14px]">
        <span className="leading-[22px]">{`3 `}</span>
        <span className="leading-[22px] text-[#637381]">results found</span>
      </p>
    </div>
  );
}

function StartIcon() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="start icon">
          <path d={svgPaths.p19ffc700} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon />
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Columns</p>
    </div>
  );
}

function StartIcon1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="start icon">
          <path d={svgPaths.p1f75ca00} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon1 />
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Filters</p>
    </div>
  );
}

function StartIcon2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="start icon">
          <path d={svgPaths.p1cc51300} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon2 />
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Export</p>
    </div>
  );
}

function DataGridToolbar() {
  return (
    <div className="bg-white flex-[1_0_0] h-[62px] min-h-px min-w-px relative" data-name="DataGrid/Toolbar">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-end px-[20px] relative size-full">
          <Button />
          <Button1 />
          <Button2 />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[560px] items-start relative shrink-0 w-full">
      <TableFiltersResults />
      <DataGridToolbar />
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">廠商姓名</p>
    </div>
  );
}

function TableCell() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center justify-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack1 />
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">申請狀態</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack2 />
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">公司完整名稱</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack3 />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">EP廠商代號</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack4 />
    </div>
  );
}

function Stack5() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">AX代號</p>
    </div>
  );
}

function TableCell4() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack5 />
    </div>
  );
}

function Stack6() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">申請角色</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack6 />
    </div>
  );
}

function Stack7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">email</p>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[200px]" data-name="Table/Cell">
      <Stack7 />
    </div>
  );
}

function Stack8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">申請時間</p>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <Stack8 />
    </div>
  );
}

function TableOrderHead() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
      <TableCell5 />
      <TableCell6 />
      <TableCell7 />
    </div>
  );
}

function Texts() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline">孫中海</p>
    </div>
  );
}

function Stack9() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts />
    </div>
  );
}

function TableCell8() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack9 />
    </div>
  );
}

function SecondaryAction() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">B</p>
    </div>
  );
}

function TableCell9() {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative shrink-0 w-[100px]" data-name="Table/Cell">
      <SecondaryAction />
    </div>
  );
}

function Texts1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">金盛元興業股份有限公司</p>
    </div>
  );
}

function Stack10() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts1 />
    </div>
  );
}

function TableCell10() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack10 />
    </div>
  );
}

function Texts2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">0001000597</p>
    </div>
  );
}

function Stack11() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts2 />
    </div>
  );
}

function TableCell11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack11 />
    </div>
  );
}

function Texts3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">&nbsp;</p>
    </div>
  );
}

function Stack12() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts3 />
    </div>
  );
}

function TableCell12() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack12 />
    </div>
  );
}

function Texts4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">業務</p>
    </div>
  );
}

function Stack13() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts4 />
    </div>
  );
}

function TableCell13() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack13 />
    </div>
  );
}

function Texts5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">yvette.hsieh@gw-mfg.com</p>
    </div>
  );
}

function Stack14() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts5 />
    </div>
  );
}

function TableCell14() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[200px]" data-name="Table/Cell">
      <Stack14 />
    </div>
  );
}

function Texts6() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">2025/10/10 00:00</p>
    </div>
  );
}

function Stack15() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts6 />
    </div>
  );
}

function TableCell15() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <Stack15 />
    </div>
  );
}

function TableOrderHead1() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell8 />
      <TableCell9 />
      <TableCell10 />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
      <TableCell14 />
      <TableCell15 />
    </div>
  );
}

function Texts7() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline">尾小保</p>
    </div>
  );
}

function Stack16() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts7 />
    </div>
  );
}

function TableCell16() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack16 />
    </div>
  );
}

function SecondaryAction1() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">B</p>
    </div>
  );
}

function TableCell17() {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative shrink-0 w-[100px]" data-name="Table/Cell">
      <SecondaryAction1 />
    </div>
  );
}

function Texts8() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">佳承精工股份有限公司</p>
    </div>
  );
}

function Stack17() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts8 />
    </div>
  );
}

function TableCell18() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack17 />
    </div>
  );
}

function Texts9() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">0001000458</p>
    </div>
  );
}

function Stack18() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts9 />
    </div>
  );
}

function TableCell19() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack18 />
    </div>
  );
}

function Texts10() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">&nbsp;</p>
    </div>
  );
}

function Stack19() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts10 />
    </div>
  );
}

function TableCell20() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack19 />
    </div>
  );
}

function Texts11() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">業務</p>
    </div>
  );
}

function Stack20() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts11 />
    </div>
  );
}

function TableCell21() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack20 />
    </div>
  );
}

function Texts12() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">Emma_Lu@jagwire.com.tw</p>
    </div>
  );
}

function Stack21() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts12 />
    </div>
  );
}

function TableCell22() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[200px]" data-name="Table/Cell">
      <Stack21 />
    </div>
  );
}

function Texts13() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">2025/10/10 00:00</p>
    </div>
  );
}

function Stack22() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts13 />
    </div>
  );
}

function TableCell23() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <Stack22 />
    </div>
  );
}

function TableOrderHead2() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell16 />
      <TableCell17 />
      <TableCell18 />
      <TableCell19 />
      <TableCell20 />
      <TableCell21 />
      <TableCell22 />
      <TableCell23 />
    </div>
  );
}

function Texts14() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline">陳先生</p>
    </div>
  );
}

function Stack23() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts14 />
    </div>
  );
}

function TableCell24() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack23 />
    </div>
  );
}

function SecondaryAction2() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">B</p>
    </div>
  );
}

function TableCell25() {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative shrink-0 w-[100px]" data-name="Table/Cell">
      <SecondaryAction2 />
    </div>
  );
}

function Texts15() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">愛爾蘭商速聯股份有限公司台灣分公司</p>
    </div>
  );
}

function Stack24() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts15 />
    </div>
  );
}

function TableCell26() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack24 />
    </div>
  );
}

function Texts16() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">0001000460</p>
    </div>
  );
}

function Stack25() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts16 />
    </div>
  );
}

function TableCell27() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack25 />
    </div>
  );
}

function Texts17() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">109010</p>
    </div>
  );
}

function Stack26() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts17 />
    </div>
  );
}

function TableCell28() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack26 />
    </div>
  );
}

function Texts18() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">業務</p>
    </div>
  );
}

function Stack27() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts18 />
    </div>
  );
}

function TableCell29() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack27 />
    </div>
  );
}

function Texts19() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">mchao@sram.com</p>
    </div>
  );
}

function Stack28() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts19 />
    </div>
  );
}

function TableCell30() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[200px]" data-name="Table/Cell">
      <Stack28 />
    </div>
  );
}

function Texts20() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">2025/10/10 00:00</p>
    </div>
  );
}

function Stack29() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts20 />
    </div>
  );
}

function TableCell31() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <Stack29 />
    </div>
  );
}

function TableOrderHead3() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell24 />
      <TableCell25 />
      <TableCell26 />
      <TableCell27 />
      <TableCell28 />
      <TableCell29 />
      <TableCell30 />
      <TableCell31 />
    </div>
  );
}

function Scroll() {
  return (
    <div className="relative shrink-0 w-full" data-name="Scroll">
      <div className="content-stretch flex items-start pl-[88px] pr-[50px] py-[4px] relative w-full">
        <div className="bg-[#637381] h-[6px] opacity-48 rounded-[12px] shrink-0 w-[64px]" data-name="scroll" />
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

function Select() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="select">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">5</p>
      <IconsSolidIcEvaArrowIosDownwardFill />
    </div>
  );
}

function IconsSolidIcEvaArrowIosBackFill() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-eva:arrow-ios-back-fill">
          <path d={svgPaths.p2c284900} fill="var(--fill-0, #919EAB)" fillOpacity="0.8" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconButton() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
      <IconsSolidIcEvaArrowIosBackFill />
    </div>
  );
}

function IconsSolidIcEvaArrowIosForwardFill() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-forward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-eva:arrow-ios-forward-fill">
          <path d={svgPaths.p1543700} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconButton1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px]" data-name="IconButton">
      <IconsSolidIcEvaArrowIosForwardFill />
    </div>
  );
}

function NextPrev() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="next/prev">
      <IconButton />
      <IconButton1 />
    </div>
  );
}

function TablePagination() {
  return (
    <div className="content-stretch flex gap-[20px] items-center justify-center overflow-clip px-[8px] py-[10px] relative shrink-0 w-[1080px]" data-name="Table/Pagination">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center">Rows per page:</p>
      <Select />
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">6-10 of 11</p>
      <NextPrev />
    </div>
  );
}

function TableOrder() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 w-full" data-name="Table/Order">
      <Tabs />
      <Stack />
      <Frame />
      <TableOrderHead />
      <TableOrderHead1 />
      <TableOrderHead2 />
      <TableOrderHead3 />
      <Scroll />
      <TablePagination />
    </div>
  );
}

export default function Component() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="廠商帳號審核">
      <TableOrder />
    </div>
  );
}