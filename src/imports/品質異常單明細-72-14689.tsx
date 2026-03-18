import svgPaths from "./svg-vy67gnvnjn";

function IconsSolidIcSolarPrinterMinimalisticBold() {
  return (
    <div className="relative shrink-0 size-[36px]" data-name="icons/solid/ic-solar:printer-minimalistic-bold">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 36">
        <g id="icons/solid/ic-solar:printer-minimalistic-bold">
          <g id="primary-shape">
            <path d={svgPaths.p1db90400} fill="var(--fill-0, #1D7BF5)" />
            <path d={svgPaths.p19b82c00} fill="var(--fill-0, #1D7BF5)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Stack() {
  return (
    <div className="absolute inset-[0.17%_0_3.69%_0]" data-name="stack">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.0001 34.6102">
        <g id="stack">
          <path clipRule="evenodd" d={svgPaths.p150e6600} fill="url(#paint0_linear_72_14824)" fillRule="evenodd" id="vector" />
          <path clipRule="evenodd" d={svgPaths.p3f4db700} fill="url(#paint1_linear_72_14824)" fillRule="evenodd" id="vector_2" />
          <g id="vector_3" opacity="0.48">
            <path clipRule="evenodd" d={svgPaths.p132d7300} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p35eccd00} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p9897380} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
          </g>
          <g id="vector_4">
            <path d={svgPaths.p3d28d500} fill="var(--fill-0, white)" />
            <path d={svgPaths.p395728c0} fill="var(--fill-0, white)" />
            <path d={svgPaths.p28c7300} fill="var(--fill-0, white)" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_72_14824" x1="12.2341" x2="36.0001" y1="10.8442" y2="34.6102">
            <stop stopColor="#77ED8B" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_72_14824" x1="0" x2="28.9534" y1="-3.44869e-10" y2="28.9535">
            <stop stopColor="#00B8D9" />
            <stop offset="1" stopColor="#006C9C" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function IconsNotificationsIcChat() {
  return (
    <div className="relative shrink-0 size-[36px]" data-name="icons/notifications/ic-chat">
      <Stack />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <IconsSolidIcSolarPrinterMinimalisticBold />
      <IconsNotificationsIcChat />
      <p className="[text-decoration-skip-ink:none] css-ew64yg decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#005eb8] text-[16px] underline" style={{ fontVariationSettings: "'wdth' 100" }}>
        歷程
      </p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame4 />
    </div>
  );
}

function DialogActions() {
  return (
    <div className="content-stretch flex gap-[12px] h-[55px] items-center justify-end p-[24px] relative shrink-0 w-[505px]" data-name="DialogActions">
      <Frame5 />
    </div>
  );
}

function DialogActions1() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[84px] items-center justify-end left-[734px] p-[24px] top-0 w-[346px]" data-name="DialogActions">
      <DialogActions />
    </div>
  );
}

function ToggleButton() {
  return (
    <div className="bg-[rgba(0,184,217,0.08)] content-stretch flex gap-[8px] h-[48px] items-center justify-center min-w-[48px] px-[12px] py-0 relative rounded-[8px] shrink-0 w-[93px]" data-name="ToggleButton">
      <div aria-hidden="true" className="absolute border border-[#00b8d9] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#00b8d9] text-[14px]">廠商確認中</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[17px] items-center relative shrink-0">
      <ToggleButton />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">{`品質異常單:  000200000981`}</p>
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#637381] text-[12px] tracking-[0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        2025/01/01 00:00
      </p>
    </div>
  );
}

function Component() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[84px] items-center left-[10px] pl-[24px] pr-[12px] py-0 top-0 w-[411px]" data-name="交貨排程">
      <Frame3 />
    </div>
  );
}

function ListItemText() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[200px]" data-name="ListItemText">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">協調者</p>
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">G00036986</p>
    </div>
  );
}

function ListItemText1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[200px]" data-name="ListItemText">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">廠商(編號)</p>
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">華銘(0001000641)</p>
    </div>
  );
}

function ListItemText2() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[200px]" data-name="ListItemText">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">訂單號碼</p>
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">4000649723</p>
    </div>
  );
}

function ListItemText3() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[200px]" data-name="ListItemText">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">數量</p>
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">60</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <ListItemText />
      <ListItemText1 />
      <ListItemText2 />
      <ListItemText3 />
    </div>
  );
}

function ListItemText4() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[410px]" data-name="ListItemText">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">料號</p>
      <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">1127-BB2980-004</p>
    </div>
  );
}

function ListItemText5() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-[410px]" data-name="ListItemText">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold relative shrink-0 text-[#1c252e]">長規格敘述</p>
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal relative shrink-0 text-[#637381]">REMEDY 7 A 17.5~21.5 TK426-M 金油下-無膜標(一般色) TS1186D</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <ListItemText4 />
      <ListItemText5 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[22px] left-[calc(50%+5.5px)] px-0 py-[10px] text-[14px] top-[84px] translate-x-[-50%] w-[1027px]">
      <Frame />
      <Frame2 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute content-stretch flex h-[146px] items-start left-[47px] overflow-clip p-[10px] top-[185px] w-[471px]">
      <div className="flex-[1_0_0] font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] min-h-px min-w-px relative text-[#637381] text-[14px]">
        <p className="css-4hzbpn mb-0">{`1.料號1159-HAK11X-01) 碟煞座飾片, `}</p>
        <p className="css-4hzbpn mb-0">{`2.來貨碟煞座兩孔尺寸精度異常( 如附件), 判定NG, `}</p>
        <p className="css-4hzbpn mb-0">{`3.因尺寸精度異常造成在產線無法組裝而影響生產, `}</p>
        <p className="css-4hzbpn mb-0">{`4.GTM廠內未上線庫存共有1112PCS,避免生產因此問題停線。GTM先全檢良品供產線生產, `}</p>
        <p className="css-4hzbpn mb-0">{`5.不良數有60個, 將辦理J訂單退回.全檢會產生相關費用會歸屬貴司扣款, `}</p>
        <p className="css-4hzbpn">{`6.1/21到貨一批數量:433SET,訂單號碼: 4000675605-020,  全檢後不良數量:14SET, 將辦理J訂單退回.`}</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[545px] top-[167px]">
      <p className="absolute css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] left-[558.45px] text-[14px] text-black top-[171px] w-[68.46px]">應急處理</p>
      <div className="absolute border border-[#637381] border-solid h-[176px] left-[545px] rounded-[8px] top-[167px] w-[500px]" />
      <div className="absolute font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light h-[99px] leading-[24px] left-[558px] text-[#637381] text-[14px] top-[206px] w-[426px]">
        <p className="css-4hzbpn mb-0">{`1-1.60W上叉發泡成型膨脹導致中管不入，檢驗後挑除重量不符標準內之不良品 `}</p>
        <p className="css-4hzbpn">1-2.39L 22pcs、42L 87pcs、45L 102pcs</p>
      </div>
    </div>
  );
}

function Tab() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="Tab">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">廠商回覆</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[72px]">
      <Tab />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex items-center justify-center p-[10px] relative shrink-0">
      <p className="css-ew64yg font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#637381] text-[12px] tracking-[0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        2025/01/02 00:00 朱紋賢
      </p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame6 />
      <Frame10 />
    </div>
  );
}

function SecondaryAction() {
  return (
    <div className="bg-[#1c252e] flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]" data-name="✳️ secondary action">
      <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] py-0 relative size-full">
          <div className="css-g0mm18 flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white">
            <p className="css-ew64yg leading-[24px]">回覆巨大</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DialogActions2() {
  return (
    <div className="content-stretch flex gap-[12px] h-[70px] items-center justify-end px-[10px] py-[24px] relative shrink-0 w-[140px]" data-name="DialogActions">
      <SecondaryAction />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex h-[51px] items-center justify-between relative shrink-0 w-full">
      <Frame11 />
      <DialogActions2 />
    </div>
  );
}

function Checkbox() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Checkbox">
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">審核者</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill"></g>
      </svg>
    </div>
  );
}

function SmallSelect() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">方詩椀</p>
          <IconsSolidIcEvaArrowIosDownwardFill />
        </div>
      </div>
    </div>
  );
}

function SmallSelect1() {
  return (
    <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-[240px]" data-name="SmallSelect">
      <Checkbox />
      <SmallSelect />
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Checkbox">
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">填表者</p>
    </div>
  );
}

function IconsSolidIcEvaArrowIosDownwardFill1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-downward-fill"></g>
      </svg>
    </div>
  );
}

function SmallSelect2() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="SmallSelect">
      <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] relative w-full">
          <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">朱紋賢</p>
          <IconsSolidIcEvaArrowIosDownwardFill1 />
        </div>
      </div>
    </div>
  );
}

function SmallSelect3() {
  return (
    <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-[240px]" data-name="SmallSelect">
      <Checkbox1 />
      <SmallSelect2 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex gap-[17px] items-center relative shrink-0">
      <SmallSelect1 />
      <SmallSelect3 />
    </div>
  );
}

function Group1() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="bg-white border border-[#1c252e] border-solid col-1 h-[105px] ml-0 mt-0 rounded-[8px] row-1 w-[1013px]" />
      <p className="col-1 css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[26px] leading-[24px] ml-[8px] mt-0 relative row-1 text-[14px] text-black w-[61px]">原因分析</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="col-1 content-stretch flex h-[52px] items-start ml-[13px] mt-[17px] p-[10px] relative row-1 w-[473px]">
      <p className="css-ew64yg font-['Public_Sans:Light','Noto_Sans_JP:Light','Noto_Sans_SC:Light',sans-serif] font-light leading-[24px] relative shrink-0 text-[#1c252e] text-[12px]">因NC钻孔夹具磨损，未及时修正，导致钻孔偏心，产生不良</p>
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Group1 />
      <Frame8 />
    </div>
  );
}

function Group2() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="bg-white border border-[#1c252e] border-solid col-1 h-[105px] ml-0 mt-0 rounded-[8px] row-1 w-[1013px]" />
      <p className="col-1 css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[26px] leading-[24px] ml-[8px] mt-0 relative row-1 text-[14px] text-black w-[61px]">提出對策</p>
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Group2 />
      <p className="col-1 css-4hzbpn font-['Public_Sans:Light','Noto_Sans_JP:Light','Noto_Sans_SC:Light',sans-serif] font-light leading-[24px] ml-[24px] mt-[27px] relative row-1 text-[#1c252e] text-[12px] w-[975px]">因NC钻孔夹具磨损，未及时1、应急厂商库存及厂内库存安排全检，不良挑出 2、即刻修改NC夹具，重做检具，确保生产无错位再生产 3、制做专用检具，制程生产中及出货依检具检测管控，防止不良产生及流出修正，导致钻孔偏心，产生不良</p>
    </div>
  );
}

function IconsSolidIcEvaAttach2Fill() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icons/solid/ic-eva:attach-2-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icons/solid/ic-eva:attach-2-fill">
          <path d={svgPaths.pc53d780} fill="var(--fill-0, #637381)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-center min-h-px min-w-px relative" data-name="stack">
      <IconsSolidIcEvaAttach2Fill />
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_SC:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#637381] text-[12px]">{`QA-1361 辐条牙端金属件出现倒角和无倒角两种.pdf `}</p>
    </div>
  );
}

function StartIcon() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="start icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="start icon">
          <g id="primary-shape">
            <path d={svgPaths.p38baf800} fill="var(--fill-0, #FF5630)" />
            <path clipRule="evenodd" d={svgPaths.pef8f400} fill="var(--fill-0, #FF5630)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] py-0 relative rounded-[8px] shrink-0" data-name="Button">
      <StartIcon />
      <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#ff5630] text-[13px]">Delete</p>
    </div>
  );
}

function Stack2() {
  return (
    <div className="bg-[#f4f6f8] relative rounded-[8px] shrink-0 w-full" data-name="stack">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[4px] items-center p-[8px] relative w-full">
          <Stack1 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Stack3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="stack">
      <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px] text-center w-full">
        <span>{`Click to `}</span>
        <span className="text-[#005eb8]">browse</span>
        <span>{` through your machine.`}</span>
      </p>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[rgba(145,158,171,0.08)] relative rounded-[8px] shrink-0 w-full" data-name="container">
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[40px] relative w-full">
          <Stack3 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
    </div>
  );
}

function Upload() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Upload">
      <Container />
    </div>
  );
}

function Stack4() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[1009px]" data-name="stack">
      <p className="css-4hzbpn font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold h-[29px] leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] w-full">附件</p>
      <Stack2 />
      <Upload />
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-start left-[32px] top-[402px] w-[1022px]">
      <Frame12 />
      <Frame13 />
      <Group3 />
      <Group4 />
      <Stack4 />
    </div>
  );
}

function Tab1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0" data-name="Tab">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">巨大回覆</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[72px]">
      <Tab1 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex items-center justify-center p-[10px] relative shrink-0">
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#637381] text-[12px] tracking-[0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        &nbsp;
      </p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute content-stretch flex items-center left-[32px] top-[1037.5px]">
      <Frame7 />
      <Frame15 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-[32px] top-[1099px]">
      <div className="absolute bg-white border border-[#637381] border-solid h-[105px] left-[32px] rounded-[8px] top-[1099px] w-[1013px]" />
      <p className="absolute css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[26px] leading-[24px] left-[40px] text-[#637381] text-[14px] top-[1099px] w-[61px]">確認回覆</p>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[32px] top-[1099px]">
      <Group5 />
    </div>
  );
}

export default function Component1() {
  return (
    <div className="bg-white relative shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] size-full" data-name="品質異常單明細">
      <div className="absolute bg-[#f4f6f8] h-[358px] left-0 rounded-tl-[8px] rounded-tr-[8px] top-0 w-[1080px]" />
      <div className="absolute bg-[#fff1e5] h-[419px] left-0 top-[992px] w-[1080px]" />
      <DialogActions1 />
      <Component />
      <Frame1 />
      <p className="absolute css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] left-[45.45px] text-[14px] text-black top-[171px] w-[68.46px]">不良情形</p>
      <div className="absolute border border-[#637381] border-solid h-[176px] left-[32px] rounded-[8px] top-[167px] w-[500px]" />
      <Frame9 />
      <Group />
      <Frame14 />
      <Frame16 />
      <Group6 />
      <div className="absolute flex h-[64px] items-center justify-center left-[511px] top-[183px] w-[6px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <div className="bg-[#637381] h-[6px] opacity-48 rounded-[12px] w-[64px]" data-name="scroll" />
        </div>
      </div>
    </div>
  );
}