import svgPaths from "./svg-2bvk7xkhar";
import { useState } from 'react';

// 模擬數據 - 導出供其他組件使用
export const mockVendorsSuccess = [
  { id: 1, name: '孫中海', status: 'SS', company: '金盛元興業股份有限公司', epCode: '0001000597', axCode: '', role: '業務', email: 'yvette.hsieh@gw-mfg.com', time: '2025/10/10 00:00' },
  { id: 2, name: '尾小保', status: 'SS', company: '佳承精工股份有限公司', epCode: '0001000458', axCode: '', role: '業務', email: 'Emma_Lu@jagwire.com.tw', time: '2025/10/10 00:00' },
  { id: 3, name: '陳先生', status: 'SS', company: '愛爾蘭商速聯股份有限公司台灣分公司', epCode: '0001000460', axCode: '109010', role: '業務', email: 'mchao@sram.com', time: '2025/10/10 00:00' },
  { id: 6, name: '張品保', status: 'SS', company: '品質精工股份有限公司', epCode: '0001000789', axCode: '109012', role: '品保', email: 'zhang@example.com', time: '2025/10/09 00:00' },
  { id: 7, name: '李下包', status: 'SS', company: '下游製造股份有限公司', epCode: '0001000890', axCode: '', role: '下包商', email: 'li@example.com', time: '2025/10/08 00:00' },
];

export const mockVendorsFail = [
  { id: 4, name: '李小姐', status: 'FF', company: '台灣製造股份有限公司', role: '品保', email: 'lee@example.com', time: '2025/10/09 00:00', failReason: '查無SAP或AX供應商主檔資料，請確認廠商名稱是否正確' },
  { id: 5, name: '王經理', status: 'FF', company: '精密工業股份有限公司', role: '業務', email: 'wang@example.com', time: '2025/10/08 00:00', failReason: '查無SAP或AX供應商主檔資料，請確認廠商名稱是否正確' },
];

function EndIcon({ count }: { count: number }) {
  return (
    <div className="bg-[rgba(0,94,184,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#00559c] text-[12px] text-center">{count}</p>
    </div>
  );
}

function EndIconFail({ count }: { count: number }) {
  return (
    <div className="bg-[rgba(255,86,48,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#b71d18] text-[12px] text-center">{count}</p>
    </div>
  );
}

function EndIcon1({ count }: { count: number }) {
  return (
    <div className="bg-[rgba(145,158,171,0.16)] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0" data-name="✳️ end icon">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#637381] text-[12px] text-center">{count}</p>
    </div>
  );
}

function Tab1({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div 
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer" 
      data-name="▼ Tab 7"
      data-tab="success"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'}`}>初審成功(SS)</p>
      {isActive ? <EndIcon count={5} /> : <EndIcon1 count={5} />}
    </div>
  );
}

function Tab({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div 
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer" 
      data-name="▼ Tab 3"
      data-tab="fail"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'}`}>初審失敗(FF)</p>
      {isActive ? <EndIconFail count={2} /> : <EndIcon1 count={2} />}
    </div>
  );
}

function Tabs({ activeTab, onTabChange }: { activeTab: 'success' | 'fail'; onTabChange: (tab: 'success' | 'fail') => void }) {
  return (
    <div className="relative shrink-0 w-full" data-name="Tabs">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[40px] items-center px-[20px] relative w-full">
          <Tab1 isActive={activeTab === 'success'} onClick={() => onTabChange('success')} />
          <Tab isActive={activeTab === 'fail'} onClick={() => onTabChange('fail')} />
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

function Wrap({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <StartAdornment />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder=" "
            className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] bg-transparent border-none outline-none"
          />
          <LabelFocus />
          <EndAdornment />
        </div>
      </div>
    </div>
  );
}

function TextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap value={value} onChange={onChange} />
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

function Wrap1({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <StartAdornment2 />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder=" "
            className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] bg-transparent border-none outline-none"
          />
          <LabelFocus1 />
          <EndAdornment1 />
        </div>
      </div>
    </div>
  );
}

function TextField1({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap1 value={value} onChange={onChange} />
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

function Wrap2({ selectedRole, onClick }: { selectedRole: string; onClick: () => void }) {
  return (
    <div className="h-[54px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:border-[#1c252e] transition-colors" data-name="wrap" onClick={onClick}>
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[14px] relative size-full">
          <p className={`flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] whitespace-pre-wrap ${selectedRole ? 'text-[#1c252e]' : 'text-[#919eab]'}`}>
            {selectedRole || '\u00A0'}
          </p>
          <LabelFocus2 />
          <EndAdornment2 />
          <SelectArrow />
        </div>
      </div>
    </div>
  );
}

function TextField2({ selectedRole, onClick, showDropdown, onSelectRole }: { 
  selectedRole: string; 
  onClick: () => void;
  showDropdown: boolean;
  onSelectRole: (role: string) => void;
}) {
  const availableRoles = ['業務', '品保', '下包商', '開發人員'];
  
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="TextField">
      <Wrap2 selectedRole={selectedRole} onClick={onClick} />
      
      {/* 角色下拉選單 - 完美對齊 */}
      {showDropdown && (
        <>
          {/* 背景遮罩，點擊關閉下拉選單 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClick}
          />
          
          {/* 下拉選單 - 寬度自動與父元素一致 */}
          <div className="absolute left-0 right-0 top-[58px] z-50">
            <div className="bg-white rounded-[8px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full py-[8px]">
              {/* 全部選項 */}
              <div
                className="px-[16px] py-[10px] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                onClick={() => onSelectRole('')}
              >
                <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] ${!selectedRole ? 'text-[#00559c] font-semibold' : 'text-[#1c252e]'}`}>
                  全部角色
                </p>
              </div>
              
              {/* 各角色選項 */}
              {availableRoles.map((role) => (
                <div
                  key={role}
                  className="px-[16px] py-[10px] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                  onClick={() => onSelectRole(role)}
                >
                  <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] ${selectedRole === role ? 'text-[#00559c] font-semibold' : 'text-[#1c252e]'}`}>
                    {role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stack({ 
  vendorNameFilter, 
  companyNameFilter, 
  onVendorNameChange, 
  onCompanyNameChange,
  selectedRole, 
  onRoleClick,
  showRoleDropdown,
  onSelectRole,
  activeTab
}: { 
  vendorNameFilter: string;
  companyNameFilter: string;
  onVendorNameChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  selectedRole: string; 
  onRoleClick: () => void;
  showRoleDropdown: boolean;
  onSelectRole: (role: string) => void;
  activeTab: 'success' | 'fail';
}) {
  return (
    <div className="relative shrink-0 w-full" data-name="stack">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
          <TextField value={vendorNameFilter} onChange={onVendorNameChange} />
          {/* 初審失敗(FF)狀態下隱藏公司名稱搜尋 */}
          {activeTab === 'success' && (
            <TextField1 value={companyNameFilter} onChange={onCompanyNameChange} />
          )}
          <TextField2 selectedRole={selectedRole} onClick={onRoleClick} showDropdown={showRoleDropdown} onSelectRole={onSelectRole} />
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

// FF狀態專用表頭 (移除EP代號和AX代號，增加失敗原因)
function StackFailReason() {
  return (
    <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0" data-name="stack">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">失敗原因</p>
    </div>
  );
}

function TableCellFailReason() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <StackFailReason />
    </div>
  );
}

function TableOrderHeadFail() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell5 />
      <TableCell6 />
      <TableCellFailReason />
      <TableCell7 />
    </div>
  );
}

function Texts({ name }: { name: string }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline cursor-pointer" data-vendor-name={name}>{name}</p>
    </div>
  );
}

function Stack9({ name }: { name: string }) {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts name={name} />
    </div>
  );
}

function TableCell8({ name }: { name: string }) {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[150px]" data-name="Table/Cell">
      <Stack9 name={name} />
    </div>
  );
}

function SecondaryAction({ status }: { status: string }) {
  const isFailStatus = status === 'FF';
  const bgColor = isFailStatus ? 'bg-[rgba(255,86,48,0.16)]' : 'bg-[rgba(0,94,184,0.16)]';
  const textColor = isFailStatus ? 'text-[#b71d18]' : 'text-[#00559c]';
  
  return (
    <div className={`${bgColor} content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0`} data-name="✳️ secondary action">
      <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${textColor} text-[12px] text-center`}>{status}</p>
    </div>
  );
}

function TableCell9({ status }: { status: string }) {
  return (
    <div className="content-stretch flex items-center justify-center p-[16px] relative shrink-0 w-[100px]" data-name="Table/Cell">
      <SecondaryAction status={status} />
    </div>
  );
}

function Texts1({ company }: { company: string }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{company}</p>
    </div>
  );
}

function Stack10({ company }: { company: string }) {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <Texts1 company={company} />
    </div>
  );
}

function TableCell10({ company }: { company: string }) {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[120px]" data-name="Table/Cell">
      <Stack10 company={company} />
    </div>
  );
}

function Texts2({ epCode }: { epCode: string }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{epCode}</p>
    </div>
  );
}

function Stack11({ epCode }: { epCode: string }) {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts2 epCode={epCode} />
    </div>
  );
}

function TableCell11({ epCode }: { epCode: string }) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack11 epCode={epCode} />
    </div>
  );
}

function Texts3({ axCode }: { axCode: string }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{axCode}</p>
    </div>
  );
}

function Stack12({ axCode }: { axCode: string }) {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts3 axCode={axCode} />
    </div>
  );
}

function TableCell12({ axCode }: { axCode: string }) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack12 axCode={axCode} />
    </div>
  );
}

function Texts4({ role }: { role: string }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{role}</p>
    </div>
  );
}

function Stack13({ role }: { role: string }) {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts4 role={role} />
    </div>
  );
}

function TableCell13({ role }: { role: string }) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[110px]" data-name="Table/Cell">
      <Stack13 role={role} />
    </div>
  );
}

function Texts5({ email }: { email: string }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{email}</p>
    </div>
  );
}

function Stack14({ email }: { email: string }) {
  return (
    <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0" data-name="stack">
      <Texts5 email={email} />
    </div>
  );
}

function TableCell14({ email }: { email: string }) {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[200px]" data-name="Table/Cell">
      <Stack14 email={email} />
    </div>
  );
}

function Texts6({ time }: { time: string }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{time}</p>
    </div>
  );
}

function Stack15({ time }: { time: string }) {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]" data-name="stack">
      <Texts6 time={time} />
    </div>
  );
}

function TableCell15({ time }: { time: string }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Table/Cell">
      <Stack15 time={time} />
    </div>
  );
}

function TableOrderHead1() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell8 name="孫中海" />
      <TableCell9 status="SS" />
      <TableCell10 company="金盛元興業股份有限公司" />
      <TableCell11 epCode="0001000597" />
      <TableCell12 axCode="" />
      <TableCell13 role="業務" />
      <TableCell14 email="yvette.hsieh@gw-mfg.com" />
      <TableCell15 time="2025/10/10 00:00" />
    </div>
  );
}

function TableOrderHead2() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell8 name="尾小保" />
      <TableCell9 status="SS" />
      <TableCell10 company="佳承精工股份有限公司" />
      <TableCell11 epCode="0001000458" />
      <TableCell12 axCode="" />
      <TableCell13 role="業務" />
      <TableCell14 email="Emma_Lu@jagwire.com.tw" />
      <TableCell15 time="2025/10/10 00:00" />
    </div>
  );
}

function TableOrderHead3() {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell8 name="陳先生" />
      <TableCell9 status="SS" />
      <TableCell10 company="愛爾蘭商速聯股份有限公司台灣分公司" />
      <TableCell11 epCode="0001000460" />
      <TableCell12 axCode="109010" />
      <TableCell13 role="業務" />
      <TableCell14 email="mchao@sram.com" />
      <TableCell15 time="2025/10/10 00:00" />
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

// 動態渲染列表行
function TableRow({ vendor }: { vendor: typeof mockVendorsSuccess[0] }) {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell8 name={vendor.name} />
      <TableCell9 status={vendor.status} />
      <TableCell10 company={vendor.company} />
      <TableCell11 epCode={vendor.epCode} />
      <TableCell12 axCode={vendor.axCode || ' '} />
      <TableCell13 role={vendor.role} />
      <TableCell14 email={vendor.email} />
      <TableCell15 time={vendor.time} />
    </div>
  );
}

// FF狀態專用表格行 (移除EP代號和AX代號，增加失敗原因)
function TextsFailReason({ failReason }: { failReason: string }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0" data-name="texts">
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{failReason}</p>
    </div>
  );
}

function StackFailReason16({ failReason }: { failReason: string }) {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0" data-name="stack">
      <TextsFailReason failReason={failReason} />
    </div>
  );
}

function TableCellFailReasonData({ failReason }: { failReason: string }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center overflow-clip min-h-px min-w-px relative" data-name="Table/Cell">
      <StackFailReason16 failReason={failReason} />
    </div>
  );
}

function TableRowFail({ vendor }: { vendor: typeof mockVendorsFail[0] }) {
  return (
    <div className="content-stretch flex h-[76px] items-center relative shrink-0 w-full" data-name="Table/Order/Head">
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
      <TableCell8 name={vendor.name} />
      <TableCell9 status={vendor.status} />
      <TableCell10 company={vendor.company} />
      <TableCell13 role={vendor.role} />
      <TableCell14 email={vendor.email} />
      <TableCellFailReasonData failReason={vendor.failReason || ''} />
      <TableCell15 time={vendor.time} />
    </div>
  );
}

function TableOrder() {
  const [activeTab, setActiveTab] = useState<'success' | 'fail'>('success');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [vendorNameFilter, setVendorNameFilter] = useState('');
  const [companyNameFilter, setCompanyNameFilter] = useState('');
  
  // 根據 tab 選擇資料
  const baseVendors = activeTab === 'success' ? mockVendorsSuccess : mockVendorsFail;
  
  // 多重篩選：角色 + 廠商姓名 + 公司名稱
  const filteredVendors = baseVendors.filter(vendor => {
    const matchesRole = !selectedRole || vendor.role === selectedRole;
    const matchesVendorName = !vendorNameFilter || vendor.name.toLowerCase().includes(vendorNameFilter.toLowerCase());
    const matchesCompanyName = !companyNameFilter || vendor.company.toLowerCase().includes(companyNameFilter.toLowerCase());
    return matchesRole && matchesVendorName && matchesCompanyName;
  });
  
  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setShowRoleDropdown(false);
  };
  
  return (
    <div className="bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 w-full" data-name="Table/Order">
      <Tabs activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        // 切換 tab 時清空所有篩選
        setSelectedRole('');
        setVendorNameFilter('');
        setCompanyNameFilter('');
      }} />
      
      {/* 篩選區域 */}
      <Stack 
        vendorNameFilter={vendorNameFilter} 
        companyNameFilter={companyNameFilter} 
        onVendorNameChange={setVendorNameFilter} 
        onCompanyNameChange={setCompanyNameFilter}
        selectedRole={selectedRole} 
        onRoleClick={() => setShowRoleDropdown(!showRoleDropdown)} 
        showRoleDropdown={showRoleDropdown}
        onSelectRole={handleSelectRole}
        activeTab={activeTab}
      />
      
      {/* Results found 和工具列 */}
      <div className="content-stretch flex gap-[560px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[12px] h-[62px] items-center justify-center px-[20px] relative shrink-0 w-[153px]" data-name="Table/FiltersResults">
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1c252e] text-[14px]">
            <span className="leading-[22px]">{filteredVendors.length} </span>
            <span className="leading-[22px] text-[#637381]">results found</span>
          </p>
        </div>
        <DataGridToolbar />
      </div>
      
      {/* 根據 tab 顯示不同的表頭 */}
      {activeTab === 'success' ? <TableOrderHead /> : <TableOrderHeadFail />}
      
      {/* 動態渲染列表 */}
      {filteredVendors.map(vendor => (
        activeTab === 'success' ? <TableRow key={vendor.id} vendor={vendor} /> : <TableRowFail key={vendor.id} vendor={vendor} />
      ))}
      
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