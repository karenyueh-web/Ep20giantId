import svgPaths from "./svg-2712drtnvy";

function Tab() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 1">
      <p className="css-ew64yg font-['Public_Sans:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">All</p>
    </div>
  );
}

function EndIcon() {
  return (
    <div className="bg-[rgba(0,184,217,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#006c9c] text-[12px] text-center">23</p>
    </div>
  );
}

function Tab1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 3">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">廠商確認中(V)</p>
      <EndIcon />
    </div>
  );
}

function EndIcon1() {
  return (
    <div className="bg-[rgba(145,158,171,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#637381] text-[12px] text-center">48</p>
    </div>
  );
}

function Tab2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 4">
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">巨大確認中(G)</p>
      <EndIcon1 />
    </div>
  );
}

function Tab4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 9">
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">取消(CE)</p>
    </div>
  );
}

function Tab3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 6">
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">關閉結案(CL)</p>
    </div>
  );
}

function Tabs() {
  return (
    <div className="relative shrink-0 w-full" data-name="Tabs">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full">
          <Tab />
          <Tab1 />
          <Tab2 />
          <Tab4 />
          <Tab3 />
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" data-name="divider" />
        </div>
      </div>
    </div>
  );
}

function StartAdornment() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="✳️ start adornment">
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

function LabelFocus() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] py-0 top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">品質異常單號</p>
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
          <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px]">&nbsp;</p>
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

function StartAdornment2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="✳️ start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="start adornment">
          <path d={svgPaths.p14834500} fill="var(--fill-0, #919EAB)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function StartAdornment3() {
  return (
    <div className="content-stretch flex items-center pl-0 pr-[8px] py-0 relative shrink-0" data-name="start adornment">
      <StartAdornment2 />
    </div>
  );
}

function LabelFocus1() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] py-0 top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">料號</p>
    </div>
  );
}

function EndAdornment1() {
  return <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />;
}

function Wrap1() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <StartAdornment3 />
          <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px]">&nbsp;</p>
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

function StartAdornment4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="✳️ start adornment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="start adornment">
          <path d={svgPaths.p14834500} fill="var(--fill-0, #919EAB)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function StartAdornment5() {
  return (
    <div className="content-stretch flex items-center pl-0 pr-[8px] py-0 relative shrink-0" data-name="start adornment">
      <StartAdornment4 />
    </div>
  );
}

function LabelFocus2() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] py-0 top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">廠商(編號)</p>
    </div>
  );
}

function EndAdornment2() {
  return <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />;
}

function Wrap2() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <StartAdornment5 />
          <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px]">速聯</p>
          <LabelFocus2 />
          <EndAdornment2 />
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
    <div className="content-stretch flex flex-col gap-[12px] h-[62px] items-center justify-center px-[20px] py-0 relative shrink-0 w-[153px]" data-name="Table/FiltersResults">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">
        <span>{`3 `}</span>
        <span className="text-[#637381]">results found</span>
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
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] py-0 relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon />
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Columns</p>
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
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] py-0 relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon1 />
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Filters</p>
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
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] py-0 relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon2 />
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Export</p>
    </div>
  );
}

function DataGridToolbar() {
  return (
    <div className="bg-white flex-[1_0_0] h-[62px] min-h-px min-w-px relative" data-name="DataGrid/Toolbar">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-end px-[20px] py-0 relative size-full">
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
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] relative shrink-0">廠商</p>
      <p className="css-ew64yg font-['Public_Sans:SemiBold',sans-serif] relative shrink-0">{` :`}</p>
    </div>
  );
}

function LabelContainer() {
  return (
    <div className="content-stretch flex items-start mr-[-2px] px-[5px] py-0 relative shrink-0" data-name="label container">
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">速聯</p>
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
    <div className="bg-[rgba(145,158,171,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] py-0 relative rounded-[8px] shrink-0" data-name="Chip">
      <LabelContainer />
      <Action />
    </div>
  );
}

function Stack1() {
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
            <path d={svgPaths.pb542600} fill="var(--fill-0, #FF5630)" />
            <path clipRule="evenodd" d={svgPaths.p10baac40} fill="var(--fill-0, #FF5630)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[8px] py-0 relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon3 />
      <div className="css-g0mm18 flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ff5630] text-[14px] text-center">
        <p className="css-ew64yg leading-[24px]">Clear</p>
      </div>
    </div>
  );
}

function Stack2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="stack">
      <Stack1 />
      <Button3 />
    </div>
  );
}

function TableFiltersResults1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Table/FiltersResults">
      <div className="content-stretch flex flex-col items-start pb-[16px] pt-0 px-[20px] relative w-full">
        <Stack2 />
      </div>
    </div>
  );
}

function IconsSolidIcCheckboxOff() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-checkbox-off">
          <path clipRule="evenodd" d={svgPaths.p20b96a00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcCheckboxOff />
    </div>
  );
}

function Checkbox() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer />
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="content-stretch flex items-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="checkbox">
      <Checkbox />
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">廠商(編號)</p>
    </div>
  );
}

function TableCell() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[200px]" data-name="Table/Cell">
      <Checkbox1 />
      <Stack3 />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">品質異常單號</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack4 />
    </div>
  );
}

function Stack5() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">訂單號碼</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack5 />
    </div>
  );
}

function Stack6() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">單據狀態</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack6 />
    </div>
  );
}

function Stack7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">料號</p>
    </div>
  );
}

function TableCell4() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[140px]" data-name="Table/Cell">
      <Stack7 />
    </div>
  );
}

function Stack8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">開單日期</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack8 />
    </div>
  );
}

function Stack9() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">長規格敘述</p>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack9 />
    </div>
  );
}

function TableCell7() {
  return <div className="bg-[#f4f6f8] content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px" data-name="Table/Cell" />;
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

function IconsSolidIcCheckboxOff1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-checkbox-off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-checkbox-off">
          <path clipRule="evenodd" d={svgPaths.p20b96a00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function IconContainer1() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcCheckboxOff1 />
    </div>
  );
}

function Checkbox2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer1 />
    </div>
  );
}

function Checkbox3() {
  return (
    <div className="content-stretch flex items-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="checkbox">
      <Checkbox2 />
    </div>
  );
}

function Texts() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">速聯(000100463)</p>
    </div>
  );
}

function Stack10() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts />
    </div>
  );
}

function TableCell8() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[194px]" data-name="Table/Cell">
      <Checkbox3 />
      <Stack10 />
    </div>
  );
}

function Texts1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] css-ew64yg decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline">000200000981</p>
    </div>
  );
}

function Stack11() {
  return (
    <div className="content-stretch flex items-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts1 />
    </div>
  );
}

function TableCell9() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack11 />
    </div>
  );
}

function Texts2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">4000172727</p>
    </div>
  );
}

function Stack12() {
  return (
    <div className="content-stretch flex items-center overflow-clip px-0 py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts2 />
    </div>
  );
}

function TableCell10() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[100px]" data-name="Table/Cell">
      <Stack12 />
    </div>
  );
}

function SecondaryAction() {
  return (
    <div className="bg-[rgba(0,184,217,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#006c9c] text-[12px] text-center">V</p>
    </div>
  );
}

function TableCell11() {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative shrink-0 w-[100px]" data-name="Table/Cell">
      <SecondaryAction />
    </div>
  );
}

function Texts3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">1129-CSL0075-L01</p>
    </div>
  );
}

function Stack13() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts3 />
    </div>
  );
}

function TableCell12() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[140px]" data-name="Table/Cell">
      <Stack13 />
    </div>
  );
}

function Texts4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">2024/12/25</p>
    </div>
  );
}

function Stack14() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts4 />
    </div>
  );
}

function TableCell13() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack14 />
    </div>
  );
}

function Texts5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">REMEDY 7 A 17.5~21.5 TK426-M 金油下-無膜標(一般色) TS1186D</p>
    </div>
  );
}

function Stack15() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts5 />
    </div>
  );
}

function TableCell14() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px overflow-clip relative" data-name="Table/Cell">
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
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">5</p>
      <IconsSolidIcEvaArrowIosDownwardFill />
    </div>
  );
}

function IconsSolidIcEvaArrowIosBackFill() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-eva:arrow-ios-back-fill">
          <path d={svgPaths.pe50180} fill="var(--fill-0, #919EAB)" fillOpacity="0.8" id="primary-shape" />
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
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center">Rows per page:</p>
      <Select />
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">6-10 of 11</p>
      <NextPrev />
    </div>
  );
}

function TableOrder() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] shrink-0 w-full" data-name="Table/Order">
      <Tabs />
      <Stack />
      <Frame />
      <TableFiltersResults1 />
      <TableOrderHead />
      {[...Array(3).keys()].map((_, i) => (
        <TableOrderHead1 key={i} />
      ))}
      <Scroll />
      <TablePagination />
    </div>
  );
}

export default function Component() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="品質異常單">
      <TableOrder />
    </div>
  );
}