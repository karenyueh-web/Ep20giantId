import svgPaths from "./svg-jygnp2xhtk";

function HelpIcon() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Help icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="help-circle">
          <path d={svgPaths.p27ffbb00} id="Icon" stroke="var(--stroke-0, #A4A7AE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
      <div aria-hidden="true" className="absolute border border-[#e9eaeb] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#414651] text-[12px] text-center">3</p>
    </div>
  );
}

function TextAndBadge() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Text and badge">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#717680] text-[14px]">新訂單</p>
      <Badge />
    </div>
  );
}

function TabButtonBase() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-center pb-[12px] pt-0 px-[4px] relative shrink-0 w-[153px]" data-name="_Tab button base">
      <TextAndBadge />
    </div>
  );
}

function Badge1() {
  return (
    <div className="bg-[#c3d5e6] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0" data-name="Badge">
      <div aria-hidden="true" className="absolute border border-[#99bfe3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#00559c] text-[12px] text-center">3</p>
    </div>
  );
}

function TextAndBadge1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Text and badge">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#00559c] text-[14px]">廠商確認中(V)</p>
      <Badge1 />
    </div>
  );
}

function TabButtonBase1() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-center pb-[12px] pt-0 px-[4px] relative shrink-0 w-[153px]" data-name="_Tab button base">
      <div aria-hidden="true" className="absolute border-[#025ba5] border-b-2 border-solid inset-0 pointer-events-none" />
      <TextAndBadge1 />
    </div>
  );
}

function Tabs() {
  return (
    <div className="content-stretch flex h-[32px] items-center relative shrink-0 w-[270px]" data-name="Tabs">
      <TabButtonBase />
      <TabButtonBase1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <Tabs />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <HelpIcon />
      <Frame2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <Frame3 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex items-start left-[calc(50%-359.5px)] top-[calc(50%-183px)] translate-x-[-50%] translate-y-[-50%]">
      <Frame />
    </div>
  );
}

function TableHeaderLabel() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">公司</p>
    </div>
  );
}

function TableHeaderCell() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[6]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">巨大機械</p>
    </div>
  );
}

function TableCell() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[5]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">GVM</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">AIP愛普智</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText2 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">Backend Developer</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText3 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">Fullstack Developer</p>
    </div>
  );
}

function TableCell4() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText4 />
        </div>
      </div>
    </div>
  );
}

function Column() {
  return (
    <div className="content-stretch flex flex-col h-[260px] isolate items-start overflow-clip relative shrink-0 w-[168px]" data-name="Column">
      <TableHeaderCell />
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
    </div>
  );
}

function TableHeaderLabel1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">採購組織</p>
    </div>
  );
}

function TableHeaderCell1() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[4]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">台灣廠生產採購組織</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText5 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">GVM</p>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText6 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">AIP生產採購組織</p>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText7 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText7_1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">GVM</p>
    </div>
  );
}

function TableCell7_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText7_1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText7_2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">台灣廠生產採購組織</p>
    </div>
  );
}

function TableCell7_2() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText7_2 />
        </div>
      </div>
    </div>
  );
}

function Column1() {
  return (
    <div className="content-stretch flex flex-col h-full isolate items-start overflow-clip relative shrink-0 w-[187px]" data-name="Column">
      <TableHeaderCell1 />
      <TableCell5 />
      <TableCell6 />
      <TableCell7 />
      <TableCell7_1 />
      <TableCell7_2 />
    </div>
  );
}

function TableHeaderLabel2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">訂單狀態</p>
    </div>
  );
}

function TableHeaderCell2() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[4]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel2 />
        </div>
      </div>
    </div>
  );
}

function SecondaryAction() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">V</p>
    </div>
  );
}

function TableCell8() {
  return (
    <div className="h-[72px] relative shrink-0 w-full z-[3]" data-name="Table/Cell">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[16px] relative size-full">
          <SecondaryAction />
        </div>
      </div>
    </div>
  );
}

function SecondaryAction1() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">V</p>
    </div>
  );
}

function TableCell9() {
  return (
    <div className="h-[72px] relative shrink-0 w-full z-[2]" data-name="Table/Cell">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[16px] relative size-full">
          <SecondaryAction1 />
        </div>
      </div>
    </div>
  );
}

function SecondaryAction2() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">V</p>
    </div>
  );
}

function TableCell10() {
  return (
    <div className="h-[72px] relative shrink-0 w-full z-[1]" data-name="Table/Cell">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[16px] relative size-full">
          <SecondaryAction2 />
        </div>
      </div>
    </div>
  );
}

function SecondaryAction2_1() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">V</p>
    </div>
  );
}

function TableCell10_1() {
  return (
    <div className="h-[72px] relative shrink-0 w-full z-[1]" data-name="Table/Cell">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[16px] relative size-full">
          <SecondaryAction2_1 />
        </div>
      </div>
    </div>
  );
}

function SecondaryAction2_2() {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ secondary action">
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">V</p>
    </div>
  );
}

function TableCell10_2() {
  return (
    <div className="h-[72px] relative shrink-0 w-full z-[1]" data-name="Table/Cell">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[16px] relative size-full">
          <SecondaryAction2_2 />
        </div>
      </div>
    </div>
  );
}

function Column2() {
  return (
    <div className="content-stretch flex flex-col h-[260px] isolate items-center justify-center overflow-clip relative shrink-0 w-[158px]" data-name="Column">
      <TableHeaderCell2 />
      <TableCell8 />
      <TableCell9 />
      <TableCell10 />
      <TableCell10_1 />
      <TableCell10_2 />
    </div>
  );
}

function TableHeaderLabel3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">訂單號碼</p>
    </div>
  );
}

function TableHeaderCell3() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[4]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel3 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535455] text-[14px]">400000105410</p>
    </div>
  );
}

function TableCell11() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText8 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">400051332020</p>
    </div>
  );
}

function TableCell12() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText9 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">500004396020</p>
    </div>
  );
}

function TableCell13() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText10 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText10_1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535455] text-[14px]">400000105410</p>
    </div>
  );
}

function TableCell13_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText10_1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText10_2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">400051332020</p>
    </div>
  );
}

function TableCell13_2() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText10_2 />
        </div>
      </div>
    </div>
  );
}

function Column3() {
  return (
    <div className="content-stretch flex flex-col h-full isolate items-start overflow-clip relative shrink-0 w-[152px]" data-name="Column">
      <TableHeaderCell3 />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
      <TableCell13_1 />
      <TableCell13_2 />
    </div>
  );
}

function TableHeaderLabel4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">訂單序號</p>
    </div>
  );
}

function TableHeaderCell4() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[6]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel4 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">10</p>
    </div>
  );
}

function TableCell14() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[5]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText11 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">20</p>
    </div>
  );
}

function TableCell15() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText12 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">30</p>
    </div>
  );
}

function TableCell16() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText13 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/03</p>
    </div>
  );
}

function TableCell17() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText14 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/02</p>
    </div>
  );
}

function TableCell18() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText15 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText15_1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">10</p>
    </div>
  );
}

function TableCell17_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText15_1 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText15_2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">20</p>
    </div>
  );
}

function TableCell18_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText15_2 />
        </div>
      </div>
    </div>
  );
}

function Column4() {
  return (
    <div className="content-stretch flex flex-col h-[260px] isolate items-start overflow-clip relative shrink-0 w-[96px]" data-name="Column">
      <TableHeaderCell4 />
      <TableCell14 />
      <TableCell15 />
      <TableCell16 />
      <TableCell17 />
      <TableCell18 />
    </div>
  );
}

function TableHeaderLabel5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">訂單日期</p>
    </div>
  );
}

function TableHeaderCell5() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[5]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel5 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/06</p>
    </div>
  );
}

function TableCell19() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText16 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/05</p>
    </div>
  );
}

function TableCell20() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText17 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/03</p>
    </div>
  );
}

function TableCell21() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText18 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/02</p>
    </div>
  );
}

function TableCell22() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText19 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText19_1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/06</p>
    </div>
  );
}

function TableCell22_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText19_1 />
        </div>
      </div>
    </div>
  );
}

function Column5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[260px] isolate items-start min-h-px min-w-px overflow-clip relative" data-name="Column">
      <TableHeaderCell5 />
      <TableCell19 />
      <TableCell20 />
      <TableCell21 />
      <TableCell22 />
      <TableCell22_1 />
    </div>
  );
}

function TableHeaderLabel6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">廠商回覆日期</p>
    </div>
  );
}

function TableHeaderCell6() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[5]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel6 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/10</p>
    </div>
  );
}

function TableCell23() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[4]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText20 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/07</p>
    </div>
  );
}

function TableCell24() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[3]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText21 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/05</p>
    </div>
  );
}

function TableCell25() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[2]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText22 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/02</p>
    </div>
  );
}

function TableCell26() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText23 />
        </div>
      </div>
    </div>
  );
}

function TextAndSupportingText23_1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#535862] text-[14px]">2025/06/10</p>
    </div>
  );
}

function TableCell26_1() {
  return (
    <div className="h-[72px] max-h-[72px] relative shrink-0 w-full z-[1]" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center max-h-[inherit] px-[24px] py-[16px] relative size-full">
          <TextAndSupportingText23_1 />
        </div>
      </div>
    </div>
  );
}

function Column6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[260px] isolate items-start min-h-px min-w-px overflow-clip relative" data-name="Column">
      <TableHeaderCell6 />
      <TableCell23 />
      <TableCell24 />
      <TableCell25 />
      <TableCell26 />
      <TableCell26_1 />
    </div>
  );
}

function TableHeaderLabel7() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="_Table header label">
      <p className="css-ew64yg font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#717680] text-[12px]">&nbsp;</p>
    </div>
  );
}

function TableHeaderCell7() {
  return (
    <div className="bg-[#fafafa] h-[44px] max-h-[44px] relative shrink-0 w-full z-[2]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#e9eaeb] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center max-h-[inherit] size-full">
        <div className="content-stretch flex items-center max-h-[inherit] px-[24px] py-[12px] relative size-full">
          <TableHeaderLabel7 />
        </div>
      </div>
    </div>
  );
}

function ScrollBarControlFillWithBottomPadding() {
  return (
    <div className="content-stretch flex flex-col h-[351px] items-center justify-center pb-[80px] pl-[12px] pr-[6px] pt-[8px] relative shrink-0 z-[1]" data-name="_Scroll bar (control fill with bottom padding)">
      <div className="bg-black flex-[1_0_0] min-h-px min-w-px opacity-15 relative rounded-[8px] w-[6px]" data-name="Bar">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[9px]" />
      </div>
    </div>
  );
}

function Column7() {
  return (
    <div className="content-stretch flex flex-col h-[395px] isolate items-start overflow-clip relative shrink-0 w-[40px]" data-name="Column">
      <TableHeaderCell7 />
      <ScrollBarControlFillWithBottomPadding />
    </div>
  );
}

// Header Row - 所有列的標題（固定不滾動）
function TableHeaderRow() {
  return (
    <div className="content-stretch flex items-start relative w-full shrink-0 z-[2] bg-white" data-name="TableHeaderRow">
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[145px]">
        <TableHeaderCell />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[187px]">
        <TableHeaderCell1 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[157px]">
        <TableHeaderCell2 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[176px]">
        <TableHeaderCell3 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[80px]">
        <TableHeaderCell4 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[96px]">
        <TableHeaderCell5 />
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-start min-w-px overflow-clip relative">
        <TableHeaderCell6 />
      </div>
    </div>
  );
}

// Body Content - 所有列的數據（可滾動）
function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px overflow-y-auto custom-scrollbar relative w-full z-[1]" data-name="Content">
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[145px]">
        <TableCell />
        <TableCell1 />
        <TableCell2 />
        <TableCell3 />
        <TableCell4 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[187px]">
        <TableCell5 />
        <TableCell6 />
        <TableCell7 />
        <TableCell7_1 />
        <TableCell7_2 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[157px]">
        <TableCell8 />
        <TableCell9 />
        <TableCell10 />
        <TableCell10_1 />
        <TableCell10_2 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[176px]">
        <TableCell11 />
        <TableCell12 />
        <TableCell13 />
        <TableCell13_1 />
        <TableCell13_2 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[80px]">
        <TableCell14 />
        <TableCell15 />
        <TableCell16 />
        <TableCell17_1 />
        <TableCell18_1 />
      </div>
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative shrink-0 w-[96px]">
        <TableCell19 />
        <TableCell20 />
        <TableCell21 />
        <TableCell22 />
        <TableCell22_1 />
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-start min-w-px overflow-clip relative">
        <TableCell23 />
        <TableCell24 />
        <TableCell25 />
        <TableCell26 />
        <TableCell26_1 />
      </div>
    </div>
  );
}

function Table() {
  return (
    <div className="absolute bg-white inset-[8.21%_0_0_0] rounded-[12px]" data-name="Table">
      <div className="content-stretch flex flex-col isolate items-start relative rounded-[inherit] size-full">
        <TableHeaderRow />
        <Content />
      </div>
      <div aria-hidden="true" className="absolute border border-[#e9eaeb] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]" />
    </div>
  );
}

// 導出Table組件供Dashboard使用
export { Table as VendorConfirmTable };

export default function section() {
  return (
    <div className="relative size-full" data-name="訂單section">
      <Frame1 />
      <Table />
    </div>
  );
}