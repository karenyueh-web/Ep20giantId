import svgPaths from "./svg-2bvk7xkhar";
import svgReturn from "./svg-cj340dtu48";
import svgClose from "./svg-db5hp8ke5l";
import { useState } from 'react';

// 廠商列表資料
const vendorList = [
  { id: 1, name: '愛爾蘭商速聯股份有限公司台灣分公司', epCode: '0001000460', axCode: '109010' },
  { id: 2, name: '金盛元興業股份有限公司', epCode: '0001000597', axCode: '' },
  { id: 3, name: '佳承精工股份有限公司', epCode: '0001000458', axCode: '' },
  { id: 4, name: '台灣製造股份有限公司', epCode: '0001000123', axCode: '109011' },
  { id: 5, name: '精密工業股份有限公司', epCode: '0001000456', axCode: '' },
  { id: 6, name: '鈞封國際有限公司', epCode: '', axCode: '' },
  { id: 7, name: '群創國際有限公司', epCode: '0001000789', axCode: '109015' },
];

export default function Component({ onClose, vendorData, isSuccessTab = false, onApprove }: { 
  onClose: () => void; 
  vendorData?: any; 
  isSuccessTab?: boolean;
  onApprove?: (vendorInfo: { name: string; email: string; company: string; epCode: string }) => void;
}) {
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(vendorData?.company || (isSuccessTab ? '愛爾蘭商速聯股份有限公司台灣分公司' : '鈞封國際有限公司'));
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['業務']);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 廠商姓名
  const vendorName = vendorData?.name || '陳先生';
  
  // 根據選擇的公司名稱查找對應的廠商代碼
  const currentVendor = vendorList.find(v => v.name === selectedCompany);
  const epCode = currentVendor?.epCode || '';
  const axCode = currentVendor?.axCode || '';
  
  // 判斷是否有廠商代碼（EP或AX任一有值就算有代碼）
  const hasVendorCode = !!(epCode || axCode);
  
  // email
  const email = vendorData?.email || 'mchao@sram.com';
  
  // 處理退回廠商
  const handleReturnVendor = () => {
    setShowRejectReason(true);
  };
  
  // 處理提交退回原因
  const handleSubmitReject = () => {
    console.log('退回原因:', rejectReason);
    setShowRejectReason(false);
    setRejectReason('');
    onClose();
  };
  
  // 處理核准
  const handleApprove = () => {
    console.log('核准廠商:', vendorName);
    
    // 如果有 onApprove 回調，傳遞廠商資訊
    if (onApprove) {
      onApprove({
        name: vendorName,
        email: email,
        company: selectedCompany,
        epCode: epCode
      });
    }
    
    onClose();
  };

  return (
    <div className="bg-white relative rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] size-full" data-name="帳號申請明細">
      {/* 標題和關閉按鈕 */}
      <div className="absolute flex flex-row gap-[16px] items-center left-[24px] top-[24px]">
        <button 
          className="content-stretch cursor-pointer flex items-center relative shrink-0 size-[24px] hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <div className="relative shrink-0 size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path clipRule="evenodd" d={svgClose.p66e40f0} fill="#637381" fillRule="evenodd" />
            </svg>
          </div>
        </button>
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px]">帳號申請明細</p>
      </div>

      {/* 表單內容 - 移除了 Tab 切換按鈕 */}
      <div className="absolute content-stretch flex flex-col gap-[18px] items-start left-[74px] top-[70px] w-[643px]">
        
        {/* 廠商姓名 */}
        <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-full">
          <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">廠商姓名</p>
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
            <div className="h-[40px] relative rounded-[8px] shrink-0 w-full">
              <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[14px] relative size-full">
                  <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#919eab] text-[14px] whitespace-pre-wrap">{vendorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 公司完整名稱 */}
        <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-full">
          <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">申請公司名稱</p>
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
            <div 
              className={`h-[40px] relative rounded-[8px] shrink-0 w-full ${!isSuccessTab ? 'cursor-pointer hover:border-[#1c252e]' : 'cursor-default'} transition-colors`}
              onClick={() => !isSuccessTab && setShowCompanySelector(true)}
            >
              <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[14px] relative size-full">
                  <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#919eab] text-[14px] whitespace-pre-wrap">{selectedCompany}</p>
                  {!isSuccessTab && (
                    <div className="-translate-y-1/2 absolute content-stretch flex items-center pr-[10px] right-0 top-1/2">
                      <div className="relative shrink-0 size-[20px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                          <path d={svgClose.p3f4b1500} fill="#637381" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 當為成功狀態時，顯示EP廠商代號 & AX廠商代號 */}
        {isSuccessTab && (
          <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">EP廠商代號</p>
            </div>
            <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">{epCode}</p>
            </div>
            <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">AX廠商代號</p>
            </div>
            <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">{axCode}</p>
            </div>
          </div>
        )}

        {/* 當為失敗狀態時，根據是否有廠商代碼顯示不同內容 */}
        {!isSuccessTab && (
          hasVendorCode ? (
            // 有廠商代碼時，顯示代碼訊息
            <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-full">
              <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">EP廠商代號</p>
              </div>
              <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">{epCode}</p>
              </div>
              <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">AX廠商代號</p>
              </div>
              <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">{axCode}</p>
              </div>
            </div>
          ) : (
            // 沒有廠商代碼時，顯示紅色錯誤訊息
            <div className="content-stretch flex h-[45px] items-center relative shrink-0 w-full">
              <p className="font-['Public_Sans:Regular','Noto_Sans_SC:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#ff5630] text-[14px]">查無SAP或AX供應商主檔資料，請確認廠商公司名稱是否有誤</p>
            </div>
          )
        )}

        {/* email */}
        <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-full">
          <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">email</p>
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
            <div className="h-[40px] relative rounded-[8px] shrink-0 w-full">
              <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[14px] relative size-full">
                  <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#919eab] text-[14px] whitespace-pre-wrap">{email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 申請角色 */}
        <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-full">
          <div className="content-stretch flex items-center relative shrink-0 w-[85px]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#637381] text-[14px]">申請角色</p>
          </div>
          {/* 業務 */}
          <div 
            className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative cursor-pointer"
            onClick={() => {
              if (selectedRoles.includes('業務')) {
                setSelectedRoles(selectedRoles.filter(role => role !== '業務'));
              } else {
                setSelectedRoles([...selectedRoles, '業務']);
              }
            }}
          >
            <div className={`h-[40px] relative rounded-[8px] shrink-0 w-full transition-colors ${selectedRoles.includes('業務') ? 'bg-[#00559c]' : 'bg-white'}`}>
              {!selectedRoles.includes('業務') && <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />}
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[14px] relative size-full">
                  <p className={`flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] text-center whitespace-pre-wrap ${selectedRoles.includes('業務') ? 'text-white' : 'text-[#919eab]'}`}>業務</p>
                </div>
              </div>
            </div>
          </div>
          {/* 品保 */}
          <div 
            className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative cursor-pointer"
            onClick={() => {
              if (selectedRoles.includes('品保')) {
                setSelectedRoles(selectedRoles.filter(role => role !== '品保'));
              } else {
                setSelectedRoles([...selectedRoles, '品保']);
              }
            }}
          >
            <div className={`h-[40px] relative rounded-[8px] shrink-0 w-full transition-colors ${selectedRoles.includes('品保') ? 'bg-[#00559c]' : 'bg-white'}`}>
              {!selectedRoles.includes('品保') && <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />}
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[14px] relative size-full">
                  <p className={`flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] text-center whitespace-pre-wrap ${selectedRoles.includes('品保') ? 'text-white' : 'text-[#919eab]'}`}>品保</p>
                </div>
              </div>
            </div>
          </div>
          {/* 下包商 */}
          <div 
            className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative cursor-pointer"
            onClick={() => {
              if (selectedRoles.includes('下包商')) {
                setSelectedRoles(selectedRoles.filter(role => role !== '下包商'));
              } else {
                setSelectedRoles([...selectedRoles, '下包商']);
              }
            }}
          >
            <div className={`h-[40px] relative rounded-[8px] shrink-0 w-full transition-colors ${selectedRoles.includes('下包商') ? 'bg-[#00559c]' : 'bg-white'}`}>
              {!selectedRoles.includes('下包商') && <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />}
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[14px] relative size-full">
                  <p className={`flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] text-center whitespace-pre-wrap ${selectedRoles.includes('下包商') ? 'text-white' : 'text-[#919eab]'}`}>下包商</p>
                </div>
              </div>
            </div>
          </div>
          {/* 開發人員 */}
          <div 
            className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative cursor-pointer"
            onClick={() => {
              if (selectedRoles.includes('開發人員')) {
                setSelectedRoles(selectedRoles.filter(role => role !== '開發人員'));
              } else {
                setSelectedRoles([...selectedRoles, '開發人員']);
              }
            }}
          >
            <div className={`h-[40px] relative rounded-[8px] shrink-0 w-full transition-colors ${selectedRoles.includes('開發人員') ? 'bg-[#00559c]' : 'bg-white'}`}>
              {!selectedRoles.includes('開發人員') && <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />}
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[14px] relative size-full">
                  <p className={`flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] text-center whitespace-pre-wrap ${selectedRoles.includes('開發人員') ? 'text-white' : 'text-[#919eab]'}`}>開發人員</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 確認通過 & 退回廠商 */}
        <div className="content-stretch flex gap-[10px] h-[45px] items-center relative shrink-0 w-full">
          <div className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
            <div 
              className={`h-[40px] relative rounded-[8px] shrink-0 w-full transition-opacity ${
                (isSuccessTab || hasVendorCode)
                  ? 'bg-[#00559c] cursor-pointer hover:opacity-90' 
                  : 'bg-[#dfe3e8] cursor-not-allowed'
              }`}
              onClick={(isSuccessTab || hasVendorCode) ? handleApprove : undefined}
            >
              {(!isSuccessTab && !hasVendorCode) && <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />}
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[14px] relative size-full">
                  <p className={`flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] text-center whitespace-pre-wrap ${
                    (isSuccessTab || hasVendorCode) ? 'text-white' : 'text-[rgba(145,158,171,0.8)]'
                  }`}>確認通過</p>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
            <div className="h-[40px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-[rgba(145,158,171,0.08)]" onClick={handleReturnVendor}>
              <div aria-hidden="true" className="absolute border border-[#1c252e] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[14px] relative size-full">
                  <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[14px] text-center whitespace-pre-wrap">退回廠商</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 廠商列表彈窗 */}
      {showCompanySelector && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} onClick={() => setShowCompanySelector(false)}>
          <div className="bg-white rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] w-[600px] max-h-[500px] flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* 標題 */}
            <div className="px-[24px] py-[20px] border-b border-[rgba(145,158,171,0.16)]">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">選擇廠商</p>
            </div>

            {/* 搜尋框 */}
            <div className="px-[24px] py-[16px]">
              <div className="h-[40px] relative rounded-[8px] w-full">
                <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center px-[14px] relative size-full">
                    <input
                      type="text"
                      className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px outline-none text-[#1c252e] text-[14px] bg-transparent"
                      placeholder="輸入關鍵字搜尋廠商..."
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 廠商列表 */}
            <div className="flex-1 overflow-y-auto px-[24px] pb-[20px] custom-scrollbar">
              {vendorList.filter(vendor =>
                vendor.name.toLowerCase().includes(companySearchTerm.toLowerCase())
              ).map(vendor => (
                <div
                  key={vendor.id}
                  className="py-[12px] px-[16px] border-b border-[rgba(145,158,171,0.08)] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                  onClick={() => {
                    setSelectedCompany(vendor.name);
                    setShowCompanySelector(false);
                    setCompanySearchTerm('');
                  }}
                >
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">{vendor.name}</p>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] text-[#637381] text-[12px] mt-[4px]">EP: {vendor.epCode} | AX: {vendor.axCode}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 退回原因彈窗 */}
      {showRejectReason && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} onClick={() => setShowRejectReason(false)}>
          <div className="bg-white rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] w-[771px] p-[42px] flex flex-col gap-[18px]" onClick={(e) => e.stopPropagation()}>
            
            {/* 返回按鈕和標題 */}
            <div className="flex flex-col gap-[7px] items-start">
              <button className="cursor-pointer flex items-center hover:opacity-70 transition-opacity" onClick={() => setShowRejectReason(false)}>
                <div className="relative shrink-0 size-[24px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d={svgReturn.p1310fb97} fill="#1877F2" fillRule="evenodd" />
                  </svg>
                </div>
              </button>
              <div className="flex flex-col">
                <div className="flex gap-[16px] items-center text-[#1c252e]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[18px]">退回原因</p>
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px]">*退回後，系統將寄信通知廠商帳號申請結果</p>
                </div>
              </div>
            </div>

            {/* 退回原因輸入框 */}
            <div className="h-[40px] relative rounded-[8px] w-full">
              <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[14px] relative size-full">
                  <input
                    type="text"
                    className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px outline-none text-[rgb(0,0,0)] text-[14px] bg-transparent placeholder:text-[#919eab]"
                    placeholder="請確認公司名稱是否有誤"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 退回廠商按鈕 */}
            <div className="bg-white content-stretch flex flex-col items-start relative w-full">
              <div className="bg-[#00559c] h-[40px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:opacity-90" onClick={handleSubmitReject}>
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex items-center justify-center px-[14px] relative size-full">
                    <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] text-center text-white whitespace-pre-wrap">退回廠商</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}