import svgPaths from "./svg-imw9bns98t";

function Tab() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 1">
      <p className="css-ew64yg font-['Public_Sans:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">All</p>
    </div>
  );
}

function EndIcon() {
  return (
    <div className="bg-[rgba(255,86,48,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#b71d18] text-[12px] text-center">32</p>
    </div>
  );
}

function Tab1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 2">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">未處理(NP)</p>
      <EndIcon />
    </div>
  );
}

function EndIcon1() {
  return (
    <div className="bg-[rgba(145,158,171,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#637381] text-[12px] text-center">23</p>
    </div>
  );
}

function Tab2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 3">
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">廠商確認中(V)</p>
      <EndIcon1 />
    </div>
  );
}

function EndIcon2() {
  return (
    <div className="bg-[rgba(145,158,171,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#637381] text-[12px] text-center">48</p>
    </div>
  );
}

function Tab3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 4">
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">採購確認中(B)</p>
      <EndIcon2 />
    </div>
  );
}

function Tab4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="▼ Tab 5">
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#637381] text-[14px]">訂單已確認(CK)</p>
    </div>
  );
}

function Tab5() {
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
          <Tab3 />
          <Tab4 />
          <Tab5 />
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" data-name="divider" />
        </div>
      </div>
    </div>
  );
}

function LabelFocus() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] py-0 top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">訂單日期(起)</p>
    </div>
  );
}

function IconsDuotoneIcSolarCalendarMarkBoldDuotone() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/duotone/ic-solar:calendar-mark-bold-duotone">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/duotone/ic-solar:calendar-mark-bold-duotone">
          <path d={svgPaths.p33617100} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <g id="primary-shape">
            <path d={svgPaths.pd51dc00} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p3da10180} fill="var(--fill-0, #637381)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function EndAdornment() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px]" data-name="✳️ end adornment">
      <IconsDuotoneIcSolarCalendarMarkBoldDuotone />
    </div>
  );
}

function EndAdornment1() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment">
      <EndAdornment />
    </div>
  );
}

function Wrap() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <p className="css-g0mm18 flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis">Start date</p>
          <LabelFocus />
          <EndAdornment1 />
        </div>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[180px]" data-name="TextField">
      <Wrap />
    </div>
  );
}

function LabelFocus1() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] py-0 top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">訂單日期(迄)</p>
    </div>
  );
}

function IconsDuotoneIcSolarCalendarMarkBoldDuotone1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/duotone/ic-solar:calendar-mark-bold-duotone">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/duotone/ic-solar:calendar-mark-bold-duotone">
          <path d={svgPaths.p33617100} fill="var(--fill-0, #637381)" id="secondary-shape" opacity="0.4" />
          <g id="primary-shape">
            <path d={svgPaths.pd51dc00} fill="var(--fill-0, #637381)" />
            <path d={svgPaths.p3da10180} fill="var(--fill-0, #637381)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function EndAdornment2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px]" data-name="✳️ end adornment">
      <IconsDuotoneIcSolarCalendarMarkBoldDuotone1 />
    </div>
  );
}

function EndAdornment3() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment">
      <EndAdornment2 />
    </div>
  );
}

function Wrap1() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <p className="css-g0mm18 flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis">End date</p>
          <LabelFocus1 />
          <EndAdornment3 />
        </div>
      </div>
    </div>
  );
}

function TextField1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[180px]" data-name="TextField">
      <Wrap1 />
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

function LabelFocus2() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] py-0 top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">訂單號碼</p>
    </div>
  );
}

function EndAdornment4() {
  return <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />;
}

function Wrap2() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <StartAdornment1 />
          <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px]">&nbsp;</p>
          <LabelFocus2 />
          <EndAdornment4 />
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

function LabelFocus3() {
  return (
    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] py-0 top-[-5px]" data-name="label focus">
      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">廠商(編號)</p>
    </div>
  );
}

function EndAdornment5() {
  return <div className="absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2 translate-y-[-50%]" data-name="end adornment" />;
}

function Wrap3() {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] py-0 relative size-full">
          <StartAdornment3 />
          <p className="css-4hzbpn flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px]">華銘 ，SHIMANO SIC ，GCK，GEV</p>
          <LabelFocus3 />
          <EndAdornment5 />
        </div>
      </div>
    </div>
  );
}

function TextField3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap3 />
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
          <TextField3 />
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

function Button3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] py-0 relative rounded-bl-[8px] rounded-tl-[8px] shrink-0 w-[194px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(0,94,184,0.48)] border-b border-l border-solid border-t inset-0 pointer-events-none rounded-bl-[8px] rounded-tl-[8px]" />
      <div className="css-g0mm18 flex flex-col font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#005eb8] text-[12px] text-center tracking-[0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-ew64yg leading-[16px]">資料更新時間:2025/05/05 12:30</p>
      </div>
    </div>
  );
}

function StartIcon3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="start icon">
          <path d={svgPaths.pe11c500} fill="var(--fill-0, white)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#005eb8] content-stretch flex h-[36px] items-center justify-center px-[5px] py-0 relative rounded-br-[8px] rounded-tr-[8px] shrink-0 w-[40px]" data-name="Button">
      <StartIcon3 />
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="更新按鈕">
      <Button3 />
      <Button4 />
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
          <Component />
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
      <p className="css-ew64yg font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">華銘</p>
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

function LabelContainer1() {
  return (
    <div className="content-stretch flex items-start mr-[-2px] px-[5px] py-0 relative shrink-0" data-name="label container">
      <p className="css-ew64yg font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">{`SHIMANO SIC `}</p>
    </div>
  );
}

function Action1() {
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

function Chip1() {
  return (
    <div className="bg-[rgba(145,158,171,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] py-0 relative rounded-[8px] shrink-0" data-name="Chip">
      <LabelContainer1 />
      <Action1 />
    </div>
  );
}

function LabelContainer2() {
  return (
    <div className="content-stretch flex items-start mr-[-2px] px-[5px] py-0 relative shrink-0" data-name="label container">
      <p className="css-ew64yg font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">GCK</p>
    </div>
  );
}

function Action2() {
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

function Chip2() {
  return (
    <div className="bg-[rgba(145,158,171,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] py-0 relative rounded-[8px] shrink-0" data-name="Chip">
      <LabelContainer2 />
      <Action2 />
    </div>
  );
}

function LabelContainer3() {
  return (
    <div className="content-stretch flex items-start mr-[-2px] px-[5px] py-0 relative shrink-0" data-name="label container">
      <p className="css-ew64yg font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">GEV</p>
    </div>
  );
}

function Action3() {
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

function Chip3() {
  return (
    <div className="bg-[rgba(145,158,171,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] py-0 relative rounded-[8px] shrink-0" data-name="Chip">
      <LabelContainer3 />
      <Action3 />
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0" data-name="stack">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-0 pointer-events-none rounded-[8px]" />
      <Label />
      <Chip />
      <Chip1 />
      <Chip2 />
      <Chip3 />
    </div>
  );
}

function StartIcon4() {
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

function Button5() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[8px] py-0 relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon4 />
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
      <Button5 />
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
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">採購組織</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[97px]" data-name="Table/Cell">
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
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack5 />
    </div>
  );
}

function Stack6() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">訂單序號</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center justify-center relative shrink-0 w-[65px]" data-name="Table/Cell">
      <Stack6 />
    </div>
  );
}

function Stack7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">訂單狀態</p>
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
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">料號</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[140px]" data-name="Table/Cell">
      <Stack8 />
    </div>
  );
}

function Stack9() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">訂單日期</p>
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

function Stack10() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">驗收量</p>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[90px]" data-name="Table/Cell">
      <Stack10 />
    </div>
  );
}

function Stack11() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">訂貨量</p>
    </div>
  );
}

function TableCell8() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[90px]" data-name="Table/Cell">
      <Stack11 />
    </div>
  );
}

function Stack12() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0" data-name="stack">
      <p className="css-ew64yg font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">&nbsp;</p>
    </div>
  );
}

function TableCell9() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" data-name="Table/Cell">
      <Stack12 />
    </div>
  );
}

function Stack13() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="stack">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[4px] items-center p-[16px] w-full" />
      </div>
    </div>
  );
}

function TableCell10() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <Stack13 />
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
      <TableCell8 />
      <TableCell9 />
      <TableCell10 />
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
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">華銘(0001000641)</p>
    </div>
  );
}

function Stack14() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts />
    </div>
  );
}

function TableCell11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[194px]" data-name="Table/Cell">
      <Checkbox3 />
      <Stack14 />
    </div>
  );
}

function Texts1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">GEM採購..</p>
    </div>
  );
}

function Stack15() {
  return (
    <div className="content-stretch flex items-center overflow-clip px-0 py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts1 />
    </div>
  );
}

function TableCell12() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[97px]" data-name="Table/Cell">
      <Stack15 />
    </div>
  );
}

function Texts2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">400649723</p>
    </div>
  );
}

function Stack16() {
  return (
    <div className="content-stretch flex items-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts2 />
    </div>
  );
}

function TableCell13() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack16 />
    </div>
  );
}

function Texts3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">10</p>
    </div>
  );
}

function Stack17() {
  return (
    <div className="content-stretch flex items-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts3 />
    </div>
  );
}

function TableCell14() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[65px]" data-name="Table/Cell">
      <Stack17 />
    </div>
  );
}

function SecondaryAction() {
  return (
    <div className="bg-[rgba(255,86,48,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#b71d18] text-[12px] text-center">NP</p>
    </div>
  );
}

function TableCell15() {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative shrink-0 w-[100px]" data-name="Table/Cell">
      <SecondaryAction />
    </div>
  );
}

function Texts4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">1129-CSL0075-L01</p>
    </div>
  );
}

function Stack18() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts4 />
    </div>
  );
}

function TableCell16() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[140px]" data-name="Table/Cell">
      <Stack18 />
    </div>
  );
}

function Texts5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">2024/12/25</p>
    </div>
  );
}

function Stack19() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts5 />
    </div>
  );
}

function TableCell17() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[84px]" data-name="Table/Cell">
      <Stack19 />
    </div>
  );
}

function Texts6() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">0</p>
    </div>
  );
}

function Stack20() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts6 />
    </div>
  );
}

function TableCell18() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[90px]" data-name="Table/Cell">
      <Stack20 />
    </div>
  );
}

function Texts7() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">100</p>
    </div>
  );
}

function Stack21() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts7 />
    </div>
  );
}

function TableCell19() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[90px]" data-name="Table/Cell">
      <Stack21 />
    </div>
  );
}

function PrimaryAction() {
  return (
    <div className="bg-[#ffab00] content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[8px] py-0 relative rounded-[8px] shrink-0" data-name="✳️ primary action">
      <p className="css-ew64yg font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">訂單確認</p>
    </div>
  );
}

function TableCell20() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Table/Cell">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[16px] relative w-full">
          <PrimaryAction />
        </div>
      </div>
    </div>
  );
}

function TableOrderHead1() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
      <TableCell14 />
      <TableCell15 />
      <TableCell16 />
      <TableCell17 />
      <TableCell18 />
      <TableCell19 />
      <TableCell20 />
    </div>
  );
}

function IconsSolidIcCheckboxOff2() {
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

function IconContainer2() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcCheckboxOff2 />
    </div>
  );
}

function Checkbox4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer2 />
    </div>
  );
}

function Checkbox5() {
  return (
    <div className="content-stretch flex items-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="checkbox">
      <Checkbox4 />
    </div>
  );
}

function Texts8() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">SHIMANOSIC(0001000734)</p>
    </div>
  );
}

function Stack22() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts8 />
    </div>
  );
}

function TableCell21() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[194px]" data-name="Table/Cell">
      <Checkbox5 />
      <Stack22 />
    </div>
  );
}

function Texts9() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">GEM採購..</p>
    </div>
  );
}

function Stack23() {
  return (
    <div className="content-stretch flex items-center overflow-clip px-0 py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts9 />
    </div>
  );
}

function TableCell22() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[97px]" data-name="Table/Cell">
      <Stack23 />
    </div>
  );
}

function Texts10() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">400649723</p>
    </div>
  );
}

function Stack24() {
  return (
    <div className="content-stretch flex items-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts10 />
    </div>
  );
}

function TableCell23() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack24 />
    </div>
  );
}

function Texts11() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">10</p>
    </div>
  );
}

function Stack25() {
  return (
    <div className="content-stretch flex items-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts11 />
    </div>
  );
}

function TableCell24() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[65px]" data-name="Table/Cell">
      <Stack25 />
    </div>
  );
}

function SecondaryAction1() {
  return (
    <div className="bg-[rgba(255,86,48,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#b71d18] text-[12px] text-center">NP</p>
    </div>
  );
}

function TableCell25() {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative shrink-0 w-[100px]" data-name="Table/Cell">
      <SecondaryAction1 />
    </div>
  );
}

function Texts12() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">1129-CSL0075-L01</p>
    </div>
  );
}

function Stack26() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts12 />
    </div>
  );
}

function TableCell26() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[140px]" data-name="Table/Cell">
      <Stack26 />
    </div>
  );
}

function Texts13() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">2024/12/25</p>
    </div>
  );
}

function Stack27() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts13 />
    </div>
  );
}

function TableCell27() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[84px]" data-name="Table/Cell">
      <Stack27 />
    </div>
  );
}

function Texts14() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">0</p>
    </div>
  );
}

function Stack28() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts14 />
    </div>
  );
}

function TableCell28() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[90px]" data-name="Table/Cell">
      <Stack28 />
    </div>
  );
}

function Texts15() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">100</p>
    </div>
  );
}

function Stack29() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts15 />
    </div>
  );
}

function TableCell29() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[90px]" data-name="Table/Cell">
      <Stack29 />
    </div>
  );
}

function PrimaryAction1() {
  return (
    <div className="bg-[#ffab00] content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[8px] py-0 relative rounded-[8px] shrink-0" data-name="✳️ primary action">
      <p className="css-ew64yg font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">訂單確認</p>
    </div>
  );
}

function TableCell30() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Table/Cell">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[16px] relative w-full">
          <PrimaryAction1 />
        </div>
      </div>
    </div>
  );
}

function TableOrderHead2() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell21 />
      <TableCell22 />
      <TableCell23 />
      <TableCell24 />
      <TableCell25 />
      <TableCell26 />
      <TableCell27 />
      <TableCell28 />
      <TableCell29 />
      <TableCell30 />
    </div>
  );
}

function IconsSolidIcCheckboxOff3() {
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

function IconContainer3() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[500px] shrink-0" data-name="icon container">
      <IconsSolidIcCheckboxOff3 />
    </div>
  );
}

function Checkbox6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="✳️ checkbox">
      <IconContainer3 />
    </div>
  );
}

function Checkbox7() {
  return (
    <div className="content-stretch flex items-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="checkbox">
      <Checkbox6 />
    </div>
  );
}

function Texts16() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{`GCK(0000002120) `}</p>
    </div>
  );
}

function Stack30() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts16 />
    </div>
  );
}

function TableCell31() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[194px]" data-name="Table/Cell">
      <Checkbox7 />
      <Stack30 />
    </div>
  );
}

function Texts17() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">GEM採購..</p>
    </div>
  );
}

function Stack31() {
  return (
    <div className="content-stretch flex items-center overflow-clip px-0 py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts17 />
    </div>
  );
}

function TableCell32() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[97px]" data-name="Table/Cell">
      <Stack31 />
    </div>
  );
}

function Texts18() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">400649723</p>
    </div>
  );
}

function Stack32() {
  return (
    <div className="content-stretch flex items-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts18 />
    </div>
  );
}

function TableCell33() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack32 />
    </div>
  );
}

function Texts19() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">10</p>
    </div>
  );
}

function Stack33() {
  return (
    <div className="content-stretch flex items-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts19 />
    </div>
  );
}

function TableCell34() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[65px]" data-name="Table/Cell">
      <Stack33 />
    </div>
  );
}

function SecondaryAction2() {
  return (
    <div className="bg-[rgba(255,86,48,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#b71d18] text-[12px] text-center">NP</p>
    </div>
  );
}

function TableCell35() {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative shrink-0 w-[100px]" data-name="Table/Cell">
      <SecondaryAction2 />
    </div>
  );
}

function Texts20() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">1129-CSL0075-L01</p>
    </div>
  );
}

function Stack34() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts20 />
    </div>
  );
}

function TableCell36() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[140px]" data-name="Table/Cell">
      <Stack34 />
    </div>
  );
}

function Texts21() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">2024/12/25</p>
    </div>
  );
}

function Stack35() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts21 />
    </div>
  );
}

function TableCell37() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[84px]" data-name="Table/Cell">
      <Stack35 />
    </div>
  );
}

function Texts22() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">0</p>
    </div>
  );
}

function Stack36() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts22 />
    </div>
  );
}

function TableCell38() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[90px]" data-name="Table/Cell">
      <Stack36 />
    </div>
  );
}

function Texts23() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative shrink-0" data-name="texts">
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">100</p>
    </div>
  );
}

function Stack37() {
  return (
    <div className="content-stretch flex items-center justify-center px-0 py-[16px] relative shrink-0" data-name="stack">
      <Texts23 />
    </div>
  );
}

function TableCell39() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[90px]" data-name="Table/Cell">
      <Stack37 />
    </div>
  );
}

function PrimaryAction2() {
  return (
    <div className="bg-[#ffab00] content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[8px] py-0 relative rounded-[8px] shrink-0" data-name="✳️ primary action">
      <p className="css-ew64yg font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">訂單確認</p>
    </div>
  );
}

function TableCell40() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Table/Cell">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[16px] relative w-full">
          <PrimaryAction2 />
        </div>
      </div>
    </div>
  );
}

function TableOrderHead3() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell31 />
      <TableCell32 />
      <TableCell33 />
      <TableCell34 />
      <TableCell35 />
      <TableCell36 />
      <TableCell37 />
      <TableCell38 />
      <TableCell39 />
      <TableCell40 />
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
      <TableOrderHead1 />
      <TableOrderHead2 />
      <TableOrderHead3 />
      <Scroll />
      <TablePagination />
    </div>
  );
}

export default function Component1() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="訂單管理列表">
      <TableOrder />
    </div>
  );
}