import svgPaths from "./svg-nwf96mlax5";

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
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">廠商名稱(編號)</p>
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
          <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] whitespace-pre-wrap">00531</p>
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
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">業務人員</p>
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

function Stack() {
  return (
    <div className="relative shrink-0 w-full" data-name="stack">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
          <TextField />
          <TextField1 />
        </div>
      </div>
    </div>
  );
}

function TableFiltersResults() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[62px] items-center justify-center px-[20px] relative shrink-0 w-[153px]" data-name="Table/FiltersResults">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1c252e] text-[14px]">
        <span className="leading-[22px]">{`1 `}</span>
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

function Label() {
  return (
    <div className="content-stretch flex font-semibold items-center leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]" data-name="label">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] relative shrink-0">廠商名稱</p>
      <p className="font-['Public_Sans:SemiBold',sans-serif] relative shrink-0">{` :`}</p>
    </div>
  );
}

function LabelContainer() {
  return (
    <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0" data-name="label container">
      <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">00531</p>
    </div>
  );
}

function Action() {
  return (
    <div className="mr-[-2px] relative shrink-0 size-[20px]" data-name="action">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g opacity="0.48">
          <path clipRule="evenodd" d={svgPaths.p9f8dc70} fill="var(--fill-0, #1C252E)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Chip() {
  return (
    <div className="bg-[rgba(145,158,171,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] relative rounded-[8px] shrink-0" data-name="Chip">
      <LabelContainer />
      <Action />
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0" data-name="stack">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
      <Label />
      <Chip />
    </div>
  );
}

function StartIcon3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="start icon">
          <g id="primary-shape">
            <path d={svgPaths.pdd7bf00} fill="var(--fill-0, #FF5630)" />
            <path clipRule="evenodd" d={svgPaths.p10baac40} fill="var(--fill-0, #FF5630)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[8px] relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon3 />
      <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ff5630] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[24px]">Clear</p>
      </div>
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="stack">
      <Stack2 />
      <Button3 />
    </div>
  );
}

function TableFiltersResults1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Table/FiltersResults">
      <div className="content-stretch flex flex-col items-start pb-[16px] px-[20px] relative w-full">
        <Stack1 />
      </div>
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">廠商名稱</p>
    </div>
  );
}

function TableCell() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack3 />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">廠商完整名稱</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack4 />
    </div>
  );
}

function Stack5() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">電話</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack5 />
    </div>
  );
}

function Stack6() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">地址</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[300px]" data-name="Table/Cell">
      <Stack6 />
    </div>
  );
}

function Stack7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">業務數</p>
    </div>
  );
}

function TableCell4() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack7 />
    </div>
  );
}

function Stack8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">傳真</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack8 />
    </div>
  );
}

function Stack9() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">&nbsp;</p>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" data-name="Table/Cell">
      <Stack9 />
    </div>
  );
}

function Stack10() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="stack">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[4px] items-center p-[16px] w-full" />
      </div>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <Stack10 />
    </div>
  );
}

function TableOrderHead() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-name="Table/Order/Head">
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
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[15px] underline">久廣(0001000531)</p>
    </div>
  );
}

function Stack11() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts />
    </div>
  );
}

function TableCell8() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack11 />
    </div>
  );
}

function Texts1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">久廣實業股份有限公司</p>
    </div>
  );
}

function Stack12() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts1 />
    </div>
  );
}

function TableCell9() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack12 />
    </div>
  );
}

function Texts2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">+886-37-756558</p>
    </div>
  );
}

function Stack13() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts2 />
    </div>
  );
}

function TableCell10() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack13 />
    </div>
  );
}

function Texts3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">苗栗縣通霄鎮中正路73號</p>
    </div>
  );
}

function Stack14() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts3 />
    </div>
  );
}

function TableCell11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[300px]" data-name="Table/Cell">
      <Stack14 />
    </div>
  );
}

function Texts4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline">4</p>
    </div>
  );
}

function Stack15() {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts4 />
    </div>
  );
}

function TableCell12() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack15 />
    </div>
  );
}

function Texts5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">+886-3-7750836</p>
    </div>
  );
}

function Stack16() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts5 />
    </div>
  );
}

function TableCell13() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack16 />
    </div>
  );
}

function TableOrderHead1() {
  return (
    <div className="h-[76px] relative shrink-0 w-full" data-name="Table/Order/Head">
      <div className="content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
        <TableCell8 />
        <TableCell9 />
        <TableCell10 />
        <TableCell11 />
        <TableCell12 />
        <TableCell13 />
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
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
      <Stack />
      <Frame />
      <TableFiltersResults1 />
      <TableOrderHead />
      <TableOrderHead1 />
      <Scroll />
      <TablePagination />
    </div>
  );
}

export default function Component() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="廠商帳號管理">
      <TableOrder />
    </div>
  );
}