import svgPaths from "@/imports/svg-2gq4xnil6q";
import closeIconPaths from "@/imports/svg-gcyyqek0b9";

// 打印機圖標
function IconsSolidIcSolarPrinterMinimalisticBold() {
  return (
    <div className="relative shrink-0 size-[36px] cursor-pointer hover:opacity-80">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 36">
        <g>
          <g>
            <path d={svgPaths.p1db90400} fill="var(--fill-0, #1D7BF5)" />
            <path d={svgPaths.p19b82c00} fill="var(--fill-0, #1D7BF5)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// 聊天圖標
function Stack() {
  return (
    <div className="absolute inset-[0.17%_0_3.69%_0]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.0001 34.6104">
        <g>
          <path clipRule="evenodd" d={svgPaths.p394a5c00} fill="url(#paint0_linear_87_21242)" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p24400500} fill="url(#paint1_linear_87_21242)" fillRule="evenodd" />
          <g opacity="0.48">
            <path clipRule="evenodd" d={svgPaths.p9c7a500} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p93aab80} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p824e980} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
          </g>
          <g>
            <path d={svgPaths.p3cf27300} fill="var(--fill-0, white)" />
            <path d={svgPaths.p34712180} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3c272500} fill="var(--fill-0, white)" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_87_21242" x1="12.2341" x2="36.0001" y1="10.8444" y2="34.6104">
            <stop stopColor="#77ED8B" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_87_21242" x1="0" x2="28.9534" y1="0.00021312" y2="28.9537">
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
    <div className="relative shrink-0 size-[36px] cursor-pointer hover:opacity-80">
      <Stack />
    </div>
  );
}

// 頂部操作區
function TopActions() {
  return (
    <div className="content-stretch flex gap-[12px] items-center">
      <IconsSolidIcSolarPrinterMinimalisticBold />
      <IconsNotificationsIcChat />
      <p className="[text-decoration-skip-ink:none] css-ew64yg decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:text-[#003d73]" style={{ fontVariationSettings: "'wdth' 100" }}>
        歷程
      </p>
    </div>
  );
}

// 狀態標籤
function StatusBadge({ status }: { status: string }) {
  // 根據不同狀態顯示不同顏色
  const statusConfig = {
    '廠商確認中': { bg: 'rgba(0,184,217,0.16)', border: '#00b8d9', text: '#006c9c', code: 'V' },
    '巨大確認中': { bg: 'rgba(255,171,0,0.16)', border: '#ffab00', text: '#B76E00', code: 'G' },
    '已結案': { bg: 'rgba(34,197,94,0.08)', border: '#22c55e', text: '#22c55e', code: 'CL' },
    '處理中': { bg: 'rgba(255,171,0,0.08)', border: '#ffab00', text: '#ffab00', code: '' },
    '取消': { bg: 'rgba(145,158,171,0.16)', border: '#919eab', text: '#637381', code: 'CE' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['廠商確認中'];
  
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-w-[48px] px-[12px] py-0 relative rounded-[8px] shrink-0" style={{ backgroundColor: config.bg }}>
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[14px] whitespace-nowrap" style={{ color: config.text }}>
        {config.code ? `${status}(${config.code})` : status}
      </p>
    </div>
  );
}

// 頂部標題區
function TopHeader({ abnormalNumber, status }: { abnormalNumber: string; status: string }) {
  return (
    <div className="content-stretch flex gap-[17px] items-center">
      <StatusBadge status={status} />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">{`品質異常單:  ${abnormalNumber}`}</p>
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[16px] text-[#637381] text-[12px] tracking-[0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        2025/01/01 00:00
      </p>
    </div>
  );
}

// 資訊項目
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="content-stretch flex gap-[10px] items-start shrink-0 w-[200px]">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e] text-[14px]">{label}</p>
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381] text-[14px]">{value}</p>
    </div>
  );
}

// 基本資訊區
function BasicInfo() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start px-0 py-[10px] w-full">
      <div className="content-stretch flex gap-[10px] items-center w-full">
        <InfoItem label="協調者" value="G00036986" />
        <InfoItem label="廠商(編號)" value="華銘(0001000641)" />
        <InfoItem label="訂單號碼" value="4000649723" />
        <InfoItem label="數量" value="60" />
      </div>
      <div className="content-stretch flex gap-[10px] items-center w-full">
        <div className="content-stretch flex gap-[10px] items-start shrink-0 w-[410px]">
          <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e] text-[14px]">料號</p>
          <p className="css-ew64yg font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[14px]">1127-BB2980-004</p>
        </div>
        <div className="content-stretch flex gap-[10px] items-start shrink-0 w-[410px]">
          <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e] text-[14px]">長規格敘述</p>
          <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381] text-[14px]">REMEDY 7 A 17.5~21.5 TK426-M 金油下-無膜標(一般色) TS1186D</p>
        </div>
      </div>
    </div>
  );
}

// 不良情形和應急處理區域（灰色背景）
function IssueSection() {
  return (
    <div className="flex gap-[13px] w-full py-[20px]">
      {/* 不良情形 */}
      <div className="flex-1">
        <div className="border border-[#637381] rounded-[8px] h-[176px] relative">
          <div className="p-[10px] h-full flex flex-col">
            <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black mb-[10px]">不良情形</p>
            <div className="flex-1 overflow-y-auto custom-scrollbar font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#637381] text-[14px]">
              <p className="css-4hzbpn mb-0">{`1.料號1159-HAK11X-01) 碟煞座飾片, `}</p>
              <p className="css-4hzbpn mb-0">{`2.來貨碟煞座兩孔尺寸精度異常( 如附件), 判定NG, `}</p>
              <p className="css-4hzbpn mb-0">{`3.因尺寸精度異常造成在產線無法組裝而影響生產, `}</p>
              <p className="css-4hzbpn mb-0">{`4.GTM廠內未上線庫存共有1112PCS,避免生產因此問題停線。GTM先全檢良品供產線生產, `}</p>
              <p className="css-4hzbpn mb-0">{`5.不良數有60個, 將辦理J訂單退回.全檢會產生相關費用會歸屬貴司扣款, `}</p>
              <p className="css-4hzbpn">{`6.1/21到貨一批數量:433SET,訂單號碼: 4000675605-020,  全檢後不良數量:14SET, 將辦理J訂單退回.`}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 應急處理 */}
      <div className="flex-1">
        <div className="border border-[#637381] rounded-[8px] h-[176px] relative">
          <div className="p-[10px] h-full flex flex-col">
            <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black mb-[10px]">應急處理</p>
            <div className="flex-1 font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#637381] text-[14px]">
              <p className="css-4hzbpn mb-0">{`1-1.60W上叉發泡成型膨脹導致中管不入，檢驗後挑除重量不符標準內之不良品 `}</p>
              <p className="css-4hzbpn">1-2.39L 22pcs、42L 87pcs、45L 102pcs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 廠商回覆區塊
function VendorReply({ status }: { status: string }) {
  const isReadOnly = status === '巨大確認中';
  
  return (
    <div className="px-[24px] py-[20px]">
      {/* 標題和按鈕 */}
      <div className="content-stretch flex h-[51px] items-center justify-between w-full mb-[10px]">
        <div className="content-stretch flex items-center">
          <div className="content-stretch flex flex-col items-start shrink-0 w-[72px]">
            <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">廠商回覆</p>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center p-[10px]">
            <p className="css-ew64yg font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[16px] text-[#637381] text-[12px] tracking-[0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              2025/01/02 00:00 朱紋賢
            </p>
          </div>
        </div>
        {!isReadOnly && (
          <div className="content-stretch flex gap-[12px] h-[70px] items-center justify-end px-[10px] py-[24px] w-[140px]">
            <div className="bg-[#1c252e] flex-[1_0_0] h-[36px] min-h-px min-w-[64px] rounded-[8px] cursor-pointer hover:bg-[#2c3540]">
              <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[12px] py-0 size-full">
                  <p className="css-ew64yg font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">回覆巨大</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 選擇器 */}
      <div className="content-stretch flex gap-[17px] items-center mb-[10px]">
        {/* 審核者 */}
        <div className="content-stretch flex gap-[10px] h-[45px] items-center shrink-0 w-[240px]">
          <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">審核者</p>
          <div className="bg-white flex-[1_0_0] min-h-px min-w-px rounded-[8px] relative">
            <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
                <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">方詩椀</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 填表者 */}
        <div className="content-stretch flex gap-[10px] h-[45px] items-center shrink-0 w-[240px]">
          <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">填表者</p>
          <div className="bg-white flex-[1_0_0] min-h-px min-w-px rounded-[8px] relative">
            <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
                <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">朱紋賢</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 原因分析 */}
      <div className="mb-[10px]">
        <div className="bg-white border border-[#1c252e] border-solid rounded-[8px] relative">
          <div className="p-[10px] min-h-[105px]">
            <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black mb-[7px]">原因分析</p>
            <p className="css-ew64yg font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#1c252e] text-[12px]">因NC钻孔夹具磨损，未及时修正，导致钻孔偏心，产生不良</p>
          </div>
        </div>
      </div>

      {/* 提出對策 */}
      <div className="mb-[10px]">
        <div className="bg-white border border-[#1c252e] border-solid rounded-[8px] relative">
          <div className="p-[10px] min-h-[105px]">
            <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black mb-[7px]">提出對策</p>
            <p className="css-ew64yg font-['Public_Sans:Light','Noto_Sans_JP:Light','Noto_Sans_SC:Light',sans-serif] font-light leading-[24px] text-[#1c252e] text-[12px]">因NC钻孔夹具磨损，未及时1、应急厂商库存及厂内库存安排全检，不良挑出 2、即刻修改NC夹具，重做检具，确保生产无错位再生产 3、制做专用检具，制程生产中及出货依检具检测管控，防止不良产生及流出修正，导致钻孔偏心，产生不良</p>
          </div>
        </div>
      </div>

      {/* 附件區 */}
      <div className="content-stretch flex flex-col gap-[10px] items-start w-full">
        <p className="css-4hzbpn font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold h-[29px] leading-[22px] text-[#1c252e] text-[14px] w-full">附件</p>
        
        {/* 上傳區 */}
        <div className="bg-white rounded-[8px] w-full relative">
          <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col items-center justify-center p-[40px] w-full">
              <div className="content-stretch flex flex-col gap-[8px] items-center w-full">
                <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px] text-center w-full">
                  <span>{`Click to `}</span>
                  <span className="text-[#005eb8] cursor-pointer hover:text-[#003d73]">browse</span>
                  <span>{` through your machine.`}</span>
                </p>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
        </div>
      </div>
    </div>
  );
}

// 巨大回覆區塊（橙色背景）
function GiantReply() {
  return (
    <div className="bg-[#fff1e5] px-[24px] py-[20px] rounded-bl-[16px] rounded-br-[16px]">
      {/* 標題和時間 */}
      <div className="content-stretch flex items-center mb-[10px]">
        <div className="content-stretch flex flex-col items-start shrink-0 w-[72px]">
          <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0">
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">巨大回覆</p>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-center p-[10px]">
          <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[16px] text-[#637381] text-[12px] tracking-[0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            2025/01/02 00:00 洪玲
          </p>
        </div>
      </div>

      {/* 確認回覆 */}
      <div className="mb-[10px]">
        <div className="bg-white border border-[#1c252e] border-solid rounded-[8px] relative">
          <div className="p-[10px] min-h-[105px]">
            <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black mb-[7px]">確認回覆</p>
            <p className="css-ew64yg font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#1c252e] text-[12px]">後續會要求廠商圖面修改尺寸，確認來貨車把手尺寸符合圖面要求</p>
          </div>
        </div>
      </div>

      {/* 附件區 */}
      <div className="content-stretch flex flex-col gap-[10px] items-start w-full">
        <p className="css-4hzbpn font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold h-[29px] leading-[22px] text-[#1c252e] text-[14px] w-full">附件</p>
        
        {/* 上傳區 */}
        <div className="bg-white rounded-[8px] w-full relative">
          <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col items-center justify-center p-[40px] w-full">
              <div className="content-stretch flex flex-col gap-[8px] items-center w-full">
                <p className="css-4hzbpn font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px] text-center w-full">
                  <span>{`Click to `}</span>
                  <span className="text-[#005eb8] cursor-pointer hover:text-[#003d73]">browse</span>
                  <span>{` through your machine.`}</span>
                </p>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
        </div>
      </div>
    </div>
  );
}

// 主組件
interface QualityAbnormalDetailProps {
  abnormalNumber: string;
  status: string;
  onClose?: () => void;
}

export function QualityAbnormalDetail({ abnormalNumber, status, onClose }: QualityAbnormalDetailProps) {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar rounded-[16px] relative">
      {/* 關閉按鈕 */}
      {onClose && (
        <div 
          className="absolute left-[20px] top-[15px] cursor-pointer hover:opacity-70 transition-opacity z-10" 
          onClick={onClose}
        >
          <div className="relative size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path clipRule="evenodd" d={closeIconPaths.p275a9800} fill="#637381" fillRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      {/* 灰色背景區域 - 頂部部分 */}
      <div className="bg-[#f4f6f8] rounded-tl-[16px] rounded-tr-[16px] px-[24px] pt-[24px]">
        {/* 頂部標題和操作按鈕 */}
        <div className="flex h-[84px] items-center justify-between pl-[20px]">
          <TopHeader abnormalNumber={abnormalNumber} status={status} />
          <TopActions />
        </div>

        {/* 基本資訊 */}
        <BasicInfo />

        {/* 不良情形和應急處理 */}
        <IssueSection />
      </div>

      {/* 廠商回覆區（白色背景） */}
      <VendorReply status={status} />

      {/* 巨大回覆區（橙色背景）- 只在非「廠商確認中」狀態時顯示 */}
      {status !== '廠商確認中' && <GiantReply />}
    </div>
  );
}