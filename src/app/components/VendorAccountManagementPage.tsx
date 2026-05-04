import { useState, useEffect } from 'react';
import { NavVertical } from './NavVertical';
import { ToggleButton } from './ToggleButton';
import svgPaths from "@/imports/svg-c0egreeez0";
import { PageHeaderB } from './PageHeaderB';
import type { PageType } from './MainLayout';
import { PaginationControls } from './PaginationControls';
import { getActiveSalesAccountCount } from './SalesAccountForm';
import { useResizableColumns } from '../hooks/useResizableColumns';
import { VendorDetailPage } from './VendorDetailPage';
import type { UserRole } from '../App';

interface VendorAccountManagementPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: UserRole;
  pendingVendorApproval?: {
    name: string;
    email: string;
    company: string;
    epCode: string;
  } | null;
  onClearPendingApproval?: () => void;
}

// 廠商資料型別
interface VendorData {
  id: number;
  code: string;
  name: string;
  fullName: string;
  phone: string;
  address: string;
  salesCount: number;
  mainProducts: string;
  salesNames: string[]; // 該廠商的業務人員姓名列表
}

// 巨大角色廠商列表資料（11筆測試資料）
// 動態計算啟用的業務數量
const getGiantVendorList = (): VendorData[] => {
  const activeSalesCount = getActiveSalesAccountCount();
  
  return [
    {
      id: 1,
      code: '0001000001',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['張淑玲', 'OOO', '品保'] // 廠商1的業務人員
    },
    {
      id: 2,
      code: '0001000002',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['OOO', '蔡英文'] // 廠商2的業務人員
    },
    {
      id: 3,
      code: '0001000003',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['張淑玲', '品保'] // 廠商3的業務人員
    },
    {
      id: 4,
      code: '0001000004',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['OOO'] // 廠商4的業務人員
    },
    {
      id: 5,
      code: '0001000005',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['張淑玲', 'OOO', '蔡英文'] // 廠商5的業務人員
    },
    {
      id: 6,
      code: '0001000006',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['品保'] // 廠商6的業務人員
    },
    {
      id: 7,
      code: '0001000007',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['張淑玲', '蔡英文'] // 廠商7的業務人員
    },
    {
      id: 8,
      code: '0001000008',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['OOO', '品保'] // 廠商8的業務人員
    },
    {
      id: 9,
      code: '0001000009',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['蔡英文'] // 廠商9的業務人員
    },
    {
      id: 10,
      code: '0001000010',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['張淑玲', 'OOO', '品保', '蔡英文'] // 廠商10的業務人員
    },
    {
      id: 11,
      code: '0001000011',
      name: '廠商',
      fullName: '久廣實業股份有限公司',
      phone: '+886-37-756558',
      address: '苗栗縣通霄鎮中正路73號',
      salesCount: activeSalesCount,
      mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
      salesNames: ['OOO'] // 廠商11的業務人員
    }
  ];
};

// 巨大角色專用：廠商帳號管理表格組件
function GiantVendorTable({ onVendorClick, onSalesClick }: { onVendorClick: () => void, onSalesClick: () => void }) {
  const [vendorNameSearch, setVendorNameSearch] = useState('');
  const [salesPersonSearch, setSalesPersonSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage_, setCurrentPage_] = useState(1);
  const [filteredVendorCode, setFilteredVendorCode] = useState<string>('');

  // 篩選資料
  const filteredData = getGiantVendorList().filter(vendor => {
    if (filteredVendorCode && vendor.code !== filteredVendorCode) {
      return false;
    }
    if (vendorNameSearch && !vendor.name.includes(vendorNameSearch) && !vendor.code.includes(vendorNameSearch)) {
      return false;
    }
    // 業務人員姓名篩選
    if (salesPersonSearch) {
      const hasMatchingSales = vendor.salesNames.some(salesName => 
        salesName.includes(salesPersonSearch)
      );
      if (!hasMatchingSales) {
        return false;
      }
    }
    return true;
  });

  const totalResults = filteredData.length;
  const totalPages = Math.ceil(totalResults / rowsPerPage);
  const startIndex = (currentPage_ - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalResults);
  const currentData = filteredData.slice(startIndex, endIndex);

  // 清除篩選
  const handleClearFilter = () => {
    setFilteredVendorCode('');
  };

  // 應用搜尋篩選
  const handleSearch = () => {
    if (vendorNameSearch) {
      const found = getGiantVendorList().find(v => 
        v.code.includes(vendorNameSearch) || v.name.includes(vendorNameSearch)
      );
      if (found) {
        setFilteredVendorCode(found.code);
      }
    }
  };

  return (
    <div className="bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 w-full">
      
      {/* 搜尋欄位區 */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[16px] items-center pl-[20px] pr-[8px] py-[20px] relative w-full">
            {/* 廠商簡稱(編號) */}
            <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
              <div className="h-[54px] relative rounded-[8px] shrink-0 w-full">
                <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]"/>
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center px-[14px] relative size-full">
                    {/* Icon */}
                    <div className="content-stretch flex items-center pr-[8px] relative shrink-0">
                      <div className="relative shrink-0 size-[24px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                          <path d={svgPaths.p14834500} fill="#919EAB"/>
                        </svg>
                      </div>
                    </div>
                    {/* Input */}
                    <input
                      type="text"
                      placeholder=""
                      className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px outline-none text-[#1c252e] text-[15px] bg-transparent border-none"
                      value={vendorNameSearch}
                      onChange={(e) => setVendorNameSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                    {/* Label - 始終顯示 */}
                    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
                      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]"/>
                      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">廠商簡稱(編號)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 業務人員 */}
            <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
              <div className="h-[54px] relative rounded-[8px] shrink-0 w-full">
                <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]"/>
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center px-[14px] relative size-full">
                    {/* Icon */}
                    <div className="content-stretch flex items-center pr-[8px] relative shrink-0">
                      <div className="relative shrink-0 size-[24px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                          <path d={svgPaths.p14834500} fill="#919EAB"/>
                        </svg>
                      </div>
                    </div>
                    {/* Input */}
                    <input
                      type="text"
                      placeholder=""
                      className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px outline-none text-[#1c252e] text-[15px] bg-transparent border-none"
                      value={salesPersonSearch}
                      onChange={(e) => setSalesPersonSearch(e.target.value)}
                    />
                    {/* Label - 始終顯示 */}
                    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
                      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]"/>
                      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">業務人員</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 結果統計和工具列 */}
      <div className="content-stretch flex gap-[560px] items-start relative shrink-0 w-full">
        {/* 結果統計 */}
        <div className="content-stretch flex flex-col gap-[12px] h-[62px] items-center justify-center px-[20px] relative shrink-0 w-[153px]">
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1c252e] text-[14px]">
            <span className="leading-[22px]">{totalResults} </span>
            <span className="leading-[22px] text-[#637381]">results found</span>
          </p>
        </div>

        {/* 工具列按鈕 */}
        <div className="bg-white flex-[1_0_0] h-[62px] min-h-px min-w-px relative">
          <div className="flex flex-row items-center justify-end size-full">
            <div className="content-stretch flex gap-[12px] items-center justify-end px-[20px] relative size-full">
              {/* Columns 按鈕 */}
              <button className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0 hover:bg-[#f4f6f8] transition-colors">
                <div className="relative shrink-0 size-[18px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                    <path d={svgPaths.p19ffc700} fill="#1C252E"/>
                  </svg>
                </div>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Columns</p>
              </button>

              {/* Filters 按鈕 */}
              <button className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0 hover:bg-[#f4f6f8] transition-colors">
                <div className="relative shrink-0 size-[18px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                    <path d={svgPaths.p1f75ca00} fill="#1C252E"/>
                  </svg>
                </div>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Filters</p>
              </button>

              {/* Export 按鈕 */}
              <button className="content-stretch flex gap-[8px] h-[30px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0 hover:bg-[#f4f6f8] transition-colors">
                <div className="relative shrink-0 size-[18px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                    <path d={svgPaths.p1cc51300} fill="#1C252E"/>
                  </svg>
                </div>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Export</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 篩選條件顯示 */}
      {filteredVendorCode && (
        <div className="relative shrink-0 w-full">
          <div className="content-stretch flex flex-col items-start pb-[16px] px-[20px] relative w-full">
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
              {/* 篩選 */}
              <div className="content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[8px] shrink-0">
                <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-0 pointer-events-none rounded-[8px]"/>
                <div className="content-stretch flex font-semibold items-center leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] relative shrink-0">廠商簡稱(編號)</p>
                  <p className="font-['Public_Sans:SemiBold',sans-serif] relative shrink-0"> :</p>
                </div>
                {/* Chip */}
                <div className="bg-[rgba(145,158,171,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] relative rounded-[8px] shrink-0">
                  <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0">
                    <p className="font-['Public_Sans:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] text-center">{filteredVendorCode}</p>
                  </div>
                  <button 
                    className="mr-[-2px] relative shrink-0 size-[20px] hover:opacity-70 transition-opacity"
                    onClick={handleClearFilter}
                  >
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                      <g opacity="0.48">
                        <path clipRule="evenodd" d={svgPaths.p9f8dc70} fill="#1C252E" fillRule="evenodd"/>
                      </g>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Clear 按鈕 */}
              <button 
                className="content-stretch flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[8px] relative rounded-[8px] shrink-0 hover:bg-[rgba(255,86,48,0.08)] transition-colors"
                onClick={handleClearFilter}
              >
                <div className="relative shrink-0 size-[20px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                    <path d={svgPaths.pdd7bf00} fill="#FF5630"/>
                    <path clipRule="evenodd" d={svgPaths.p10baac40} fill="#FF5630" fillRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex flex-col font-['Public_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ff5630] text-[14px] text-center whitespace-nowrap">
                  <p className="leading-[24px]">Clear</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 表格區域 - 標題列和資料列一起滾動 */}
      <div className="flex-1 overflow-x-auto overflow-y-auto w-full custom-scrollbar">
        {/* 表格標題列 */}
        <div className="content-stretch flex items-center relative shrink-0 min-w-max sticky top-0 z-10">
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]">
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">廠商簡稱(編號)</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]">
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">廠商完整名稱</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[150px]">
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">電話</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[300px]">
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">地址</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[100px]">
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">業務數</p>
            </div>
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0 w-[600px]">
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">主要營業產品</p>
            </div>
          </div>
        </div>

        {/* 資料列區域 */}
        {currentData.map((vendor) => (
          <div key={vendor.id} className="min-h-[76px] relative shrink-0 min-w-max">
            <div className="content-stretch flex items-center overflow-clip relative size-full">
              {/* 廠商簡稱(編號) */}
              <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[150px]">
                <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]">
                  <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0">
                    <button 
                      className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[15px] underline hover:opacity-70 transition-opacity text-left"
                      onClick={onVendorClick}
                    >
                      {vendor.name}({vendor.code})
                    </button>
                  </div>
                </div>
              </div>

              {/* 廠商完整名稱 */}
              <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[150px]">
                <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[85px]">
                  <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0">
                    <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px]">{vendor.fullName}</p>
                  </div>
                </div>
              </div>

              {/* 電話 */}
              <div className="content-stretch flex items-center relative shrink-0 w-[150px]">
                <div className="content-stretch flex items-center py-[16px] relative shrink-0">
                  <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{vendor.phone}</p>
                  </div>
                </div>
              </div>

              {/* 地址 */}
              <div className="content-stretch flex items-center relative shrink-0 w-[300px]">
                <div className="content-stretch flex items-center py-[16px] relative shrink-0">
                  <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{vendor.address}</p>
                  </div>
                </div>
              </div>

              {/* 業務數 */}
              <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[100px]">
                <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0">
                  <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0">
                    <button 
                      className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline hover:opacity-70 transition-opacity"
                      onClick={onSalesClick}
                    >
                      {vendor.salesCount}
                    </button>
                  </div>
                </div>
              </div>

              {/* 主要營業產品 */}
              <div className="content-stretch flex items-center relative shrink-0 w-[600px]">
                <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-full">
                  <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0 w-full">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] break-words">{vendor.mainProducts}</p>
                  </div>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none"/>
          </div>
        ))}
      </div>

      {/* 分頁控制 */}
      <div className="content-stretch flex gap-[20px] items-center justify-center overflow-clip px-[8px] py-[10px] relative shrink-0 w-[1080px]">
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center">Rows per page:</p>
        
        {/* Select */}
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
          <select 
            className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] outline-none bg-transparent cursor-pointer"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage_(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <div className="relative shrink-0 size-[16px] pointer-events-none">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path d={svgPaths.p2b32f00} fill="#1C252E"/>
            </svg>
          </div>
        </div>

        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">
          {startIndex + 1}-{endIndex} of {totalResults}
        </p>

        {/* 分頁按鈕 */}
        <div className="content-stretch flex items-start relative shrink-0">
          {/* 上一頁 */}
          <button 
            className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] hover:bg-[rgba(145,158,171,0.08)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage_(Math.max(1, currentPage_ - 1))}
            disabled={currentPage_ === 1}
          >
            <div className="relative shrink-0 size-[20px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p2c284900} fill="rgba(145,158,171,0.8)"/>
              </svg>
            </div>
          </button>
          {/* 下一頁 */}
          <button 
            className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] hover:bg-[rgba(145,158,171,0.08)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage_(Math.min(totalPages, currentPage_ + 1))}
            disabled={currentPage_ === totalPages || totalResults === 0}
          >
            <div className="relative shrink-0 size-[20px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p1543700} fill="#1C252E"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// C區：廠商帳號管理表格組件（廠商角色用）
function VendorTable({ onVendorClick, onSalesClick }: { onVendorClick: () => void; onSalesClick: () => void }) {
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // 使用可調整欄寬 Hook
  const { columnWidths, ResizeHandle } = useResizableColumns({
    vendorName: 150,
    fullName: 200,
    phone: 180,
    address: 300,
    salesCount: 100,
    mainProducts: 300  // 增加主要產品欄位的寬度以容納更多內容
  }, 'vendor-accounts');

  // 只有一筆廠商資料（當前登入的廠商）
  // 使用getActiveSalesAccountCount獲取啟用的業務數量
  const vendorData = {
    code: '0001000531',
    name: '久廣',
    fullName: '久廣實業股份有限公司',
    phone: '+886-37-756558',
    address: '苗栗縣通霄鎮中正路73號',
    salesCount: getActiveSalesAccountCount(), // 從SalesAccountForm獲取啟用的業務數量
    mainProducts: '單梁/剪叉/吊车/把手/盤車附件/逃逸器固定座/座梯/建梯器/標貼/螺絲',
  };

  return (
    <div className="bg-white content-stretch flex flex-col h-[830px] items-start relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 w-full" data-name="Table/Order">
      {/* 工具欄 */}
      <div className="bg-white relative w-full" data-name="DataGrid/Toolbar">
        <div className="flex flex-row items-center justify-end w-full">
          <div className="content-stretch flex gap-[12px] items-center justify-end px-[20px] py-[16px] relative w-full">
            <button className="content-stretch flex gap-[8px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0 hover:bg-[#f4f6f8] transition-colors cursor-pointer">
              <div className="relative shrink-0 size-[18px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p19ffc700} fill="var(--fill-0, #1C252E)" />
                </svg>
              </div>
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Columns</p>
            </button>
            <button className="content-stretch flex gap-[8px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0 hover:bg-[#f4f6f8] transition-colors cursor-pointer">
              <div className="relative shrink-0 size-[18px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p1f75ca00} fill="var(--fill-0, #1C252E)" />
                </svg>
              </div>
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Filters</p>
            </button>
            <button className="content-stretch flex gap-[8px] items-center justify-center min-w-[64px] px-[4px] relative rounded-[8px] shrink-0 hover:bg-[#f4f6f8] transition-colors cursor-pointer">
              <div className="relative shrink-0 size-[18px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p1cc51300} fill="var(--fill-0, #1C252E)" />
                </svg>
              </div>
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] relative shrink-0 text-[#1c252e] text-[13px]">Export</p>
            </button>
            <button className="bg-[#1c252e] content-stretch flex gap-[8px] items-center justify-center min-w-[64px] px-[12px] py-[6px] relative rounded-[8px] shrink-0 hover:bg-[#2c3540] transition-colors cursor-pointer">
              <div className="flex flex-col font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
                <p className="leading-[24px]">更新業務名單</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 表格區域 - 添加水平滾動 */}
      <div className="flex-1 w-full overflow-x-auto overflow-y-auto custom-scrollbar">
        {/* 表格標題行 */}
        <div className="content-stretch flex items-center overflow-clip relative shrink-0 min-w-max" data-name="Table/Order/Head">
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.vendorName}px` }}>
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">廠商簡稱(編號)</p>
            </div>
            <ResizeHandle columnKey="vendorName" />
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.fullName}px` }}>
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">廠商完整名稱</p>
            </div>
            <ResizeHandle columnKey="fullName" />
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.phone}px` }}>
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">電話</p>
            </div>
            <ResizeHandle columnKey="phone" />
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.address}px` }}>
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">地址</p>
            </div>
            <ResizeHandle columnKey="address" />
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.salesCount}px` }}>
            <div className="content-stretch flex gap-[4px] items-center justify-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px] text-center">業務數</p>
            </div>
            <ResizeHandle columnKey="salesCount" />
          </div>
          <div className="bg-[#f4f6f8] content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.mainProducts}px` }}>
            <div className="content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">主要營業產品</p>
            </div>
          </div>
        </div>

        {/* 表格數據行（只有一筆資料） */}
        <div className="h-[76px] relative shrink-0 min-w-max" data-name="Table/Order/Row">
          <div className="content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
            {/* 廠商簡稱(編號) */}
            <div className="content-stretch flex items-center overflow-clip relative shrink-0" style={{ width: `${columnWidths.vendorName}px` }}>
              <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0 w-full">
                  <p 
                    onClick={onVendorClick}
                    className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[15px] underline cursor-pointer hover:text-[#004080] w-full overflow-hidden text-ellipsis whitespace-nowrap"
                    title={`${vendorData.name}(${vendorData.code})`}
                  >
                    {vendorData.name}({vendorData.code})
                  </p>
                </div>
              </div>
            </div>
            {/* 廠商完整名稱 */}
            <div className="content-stretch flex items-center overflow-clip relative shrink-0" style={{ width: `${columnWidths.fullName}px` }}>
              <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start justify-center overflow-clip px-[16px] relative shrink-0 w-full">
                  <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[13px] w-full overflow-hidden text-ellipsis whitespace-nowrap" title={vendorData.fullName}>{vendorData.fullName}</p>
                </div>
              </div>
            </div>
            {/* 電話 */}
            <div className="content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.phone}px` }}>
              <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0 w-full">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] w-full overflow-hidden text-ellipsis whitespace-nowrap" title={vendorData.phone}>{vendorData.phone}</p>
                </div>
              </div>
            </div>
            {/* 地址 */}
            <div className="content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.address}px` }}>
              <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0 w-full">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] w-full overflow-hidden text-ellipsis whitespace-nowrap" title={vendorData.address}>{vendorData.address}</p>
                </div>
              </div>
            </div>
            {/* 業務數 */}
            <div className="content-stretch flex items-center overflow-clip relative shrink-0" style={{ width: `${columnWidths.salesCount}px` }}>
              <div className="content-stretch flex items-center justify-center py-[16px] relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0 w-full">
                  <p 
                    onClick={onSalesClick}
                    className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#005eb8] text-[14px] underline cursor-pointer hover:text-[#004080] transition-colors"
                  >
                    {vendorData.salesCount}
                  </p>
                </div>
              </div>
            </div>
            {/* 主要營業產品 */}
            <div className="content-stretch flex items-center relative shrink-0" style={{ width: `${columnWidths.mainProducts}px` }}>
              <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0 w-full">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]" title={vendorData.mainProducts}>{vendorData.mainProducts}</p>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.2)] border-b border-solid inset-0 pointer-events-none" />
        </div>
      </div>

      {/* 分頁控制 */}
      <div className="content-stretch flex gap-[20px] items-center justify-center overflow-clip px-[8px] py-[10px] relative shrink-0 w-[1080px]">
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center">Rows per page:</p>
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] bg-transparent border-none outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <div className="relative shrink-0 size-[16px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path d={svgPaths.p2b32f00} fill="var(--fill-0, #1C252E)" />
            </svg>
          </div>
        </div>
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">
          1-1 of 1
        </p>
        <div className="content-stretch flex items-start relative shrink-0">
          <button
            disabled
            className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] opacity-40 cursor-not-allowed"
          >
            <div className="relative shrink-0 size-[20px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p2c284900} fill="var(--fill-0, #919EAB)" fillOpacity="0.8" />
              </svg>
            </div>
          </button>
          <button
            disabled
            className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] opacity-40 cursor-not-allowed"
          >
            <div className="relative shrink-0 size-[20px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p1543700} fill="var(--fill-0, #919EAB)" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function VendorAccountManagementPage({ currentPage, onPageChange, onLogout, userRole, pendingVendorApproval, onClearPendingApproval }: VendorAccountManagementPageProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'vendor' | 'sales'>('vendor');

  // 檢測待審核通過的廠商資訊
  useEffect(() => {
    if (pendingVendorApproval) {
      console.log('收到待審核通過的廠商:', pendingVendorApproval);
      // 自動打開詳細頁面並切換到業務帳號tab
      setDefaultTab('sales');
      setShowDetail(true);
    }
  }, [pendingVendorApproval]);

  // 如果要顯示詳細頁面，則渲染VendorDetailPage
  if (showDetail) {
    return (
      <VendorDetailPage 
        currentPage={currentPage}
        onPageChange={onPageChange}
        onLogout={onLogout}
        onBack={() => {
          setShowDetail(false);
          setDefaultTab('vendor'); // 返回時重置默認tab
          // 清除待審核廠商資訊
          if (onClearPendingApproval) {
            onClearPendingApproval();
          }
        }}
        defaultTab={defaultTab}
        pendingVendorApproval={pendingVendorApproval}
        onClearPendingApproval={onClearPendingApproval}
      />
    );
  }

  // 否則顯示列表頁面
  return (
    <div className="relative w-[1440px] h-[1024px] bg-[#f5f5f7] overflow-hidden">
      {/* A區：左側導航欄 */}
      <NavVertical currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} userRole={userRole} />
      
      {/* Toggle按鈕 */}
      <ToggleButton />
      
      {/* B區：使用統一的PageHeaderB組件 */}
      <PageHeaderB 
        title="廠商帳號管理"
        breadcrumb="帳號管理 • 廠商帳號管理"
      />
      
      {/* C區：廠商帳號管理表格 */}
      <div className="absolute left-[304px] top-[114px] w-[1080px] h-[900px]">
        {userRole === 'giant' ? (
          <GiantVendorTable 
            onVendorClick={() => {
              setDefaultTab('vendor');
              setShowDetail(true);
            }} 
            onSalesClick={() => {
              setDefaultTab('sales'); // 點擊業務數時，設置默認打開業務帳號頁籤
              setShowDetail(true);
            }} 
          />
        ) : (
          <VendorTable 
            onVendorClick={() => {
              setDefaultTab('vendor');
              setShowDetail(true);
            }} 
            onSalesClick={() => {
              setDefaultTab('sales'); // 點擊業務數時，設置默認打開業務帳號頁籤
              setShowDetail(true);
            }} 
          />
        )}
      </div>
    </div>
  );
}