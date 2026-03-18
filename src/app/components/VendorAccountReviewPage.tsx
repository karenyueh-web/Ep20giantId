import { NavVertical } from './NavVertical';
import { ToggleButton } from './ToggleButton';
import { PageHeaderB } from './PageHeaderB';
import VendorAccountReviewContent from '@/imports/廠商帳號審核-4007-9767';
import AccountApplicationDetail from '@/imports/帳號申請明細';
import { useState } from 'react';
import type { PageType } from './MainLayout';
import type { UserRole } from '@/app/App';

interface VendorAccountReviewPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: UserRole;
  onApproveVendor?: (vendorInfo: { name: string; email: string; company: string; epCode: string }) => void;
}

export function VendorAccountReviewPage({ 
  currentPage, 
  onPageChange, 
  onLogout,
  userRole = 'procurement',
  onApproveVendor
}: VendorAccountReviewPageProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'success' | 'fail'>('success');

  // 處理確認通過
  const handleApprove = (vendorInfo: { name: string; email: string; company: string; epCode: string }) => {
    console.log('審核通過廠商:', vendorInfo);
    
    // 調用父組件的回調函數
    if (onApproveVendor) {
      onApproveVendor(vendorInfo);
    }
  };

  return (
    <div className="relative w-[1440px] h-[1024px] bg-[#f5f5f7] overflow-hidden">
      {/* A區：左側導航欄 - 採購角色黑底白字 */}
      <NavVertical 
        currentPage={currentPage} 
        onPageChange={onPageChange} 
        onLogout={onLogout}
        userRole={userRole}
      />
      
      {/* Toggle按鈕 */}
      <ToggleButton />
      
      {/* B區：頂部標題和AI搜索欄 */}
      <PageHeaderB 
        title="廠商帳號審核"
        showAI={true}
      />
      
      {/* C區：內容區域 - 與首頁定位一致 */}
      <div className="absolute left-[304px] top-[114px] w-[1080px] h-[830px]">
        <div className="bg-white w-full h-full rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] overflow-hidden relative">
          <div onClick={(e) => {
            const target = e.target as HTMLElement;
            // 檢查是否點擊了廠商姓名連結
            if (target.closest('[data-vendor-name]')) {
              const vendorName = target.closest('[data-vendor-name]')?.getAttribute('data-vendor-name');
              // 這裡可以根據需要傳遞更多資料
              setSelectedVendor({ name: vendorName });
              setShowOverlay(true);
            }
            // 檢查是否點擊了 tab 切換
            if (target.closest('[data-tab]')) {
              const tab = target.closest('[data-tab]')?.getAttribute('data-tab') as 'success' | 'fail';
              if (tab) {
                setCurrentTab(tab);
              }
            }
          }}>
            <VendorAccountReviewContent />
          </div>

          {/* Overlay遮罩和彈窗 - 相對於C區定位 */}
          {showOverlay && (
            <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} onClick={() => setShowOverlay(false)}>
              {/* 彈窗內容 */}
              <div 
                className="w-[792px] h-[568px]" 
                onClick={(e) => e.stopPropagation()}
              >
                <AccountApplicationDetail 
                  onClose={() => setShowOverlay(false)} 
                  vendorData={selectedVendor}
                  isSuccessTab={currentTab === 'success'}
                  onApprove={handleApprove}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}