// @refresh reset
import { ChatPageNew } from "@/app/components/ChatPageNew";
import { OrderManagementPage } from "@/app/components/OrderManagementPage";
import { QualityAbnormalFullPage } from "@/app/components/QualityAbnormalFullPage";
import VendorAccountManagementPageNew from "@/app/components/VendorAccountManagementPageNew";
import { VendorAccountReviewPageNew } from "@/app/components/VendorAccountReviewPageNew";
import { GiantAccountManagementPageNew } from "@/app/components/GiantAccountManagementPageNew";
import { UnderConstructionPage } from "@/app/components/UnderConstructionPage";
import { ShippingBasicSettingsPage } from "@/app/components/ShippingBasicSettingsPage";
import { ShipmentCreatePage } from "@/app/components/ShipmentCreatePage";
import { ShipmentListPage } from "@/app/components/ShipmentListPage";
import { CorrectionCreatePage } from "@/app/components/CorrectionCreatePage";
import { CorrectionListWithTabs } from "@/app/components/CorrectionListWithTabs";
import { HistoryCorrectionListPage } from "@/app/components/HistoryCorrectionListPage";
import { OrderScheduleInquiryPage } from "@/app/components/OrderScheduleInquiryPage";
import { ResponsivePageLayout } from "@/app/components/ResponsivePageLayout";
import { LoginPage } from "@/app/components/LoginPage";
import { RegisterPage } from "@/app/components/RegisterPage";
import { RegisterSuccessPage } from "@/app/components/RegisterSuccessPage";
import { ForgotPasswordPage } from "@/app/components/ForgotPasswordPage";
import type { PageType } from '@/app/components/MainLayout';
import { useIdleTimer } from '@/app/hooks/useIdleTimer';
import { useState } from 'react';
import { SidebarProvider } from '@/app/components/SidebarContext';
import { LanguageProvider } from '@/app/components/LanguageContext';
import { OrderStoreProvider } from '@/app/components/OrderStoreContext';

export type UserRole = 'vendor' | 'procurement' | 'giant';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('vendor');
  const [showRegister, setShowRegister] = useState(false);
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [pendingVendorApproval, setPendingVendorApproval] = useState<{
    name: string;
    email: string;
    company: string;
    epCode: string;
  } | null>(null);

  const handleLoginSuccess = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setShowRegister(false);
    setShowRegisterSuccess(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('vendor');
    setCurrentPage('dashboard');
  };

  // Idle timer: auto logout after 1 hour
  useIdleTimer({
    onIdle: () => {
      if (isLoggedIn) {
        handleLogout();
        alert('系統閒置超過1小時，已自動登出');
      }
    },
    idleTime: 3600000,
    enabled: isLoggedIn,
  });

  const handleRegisterClick = () => {
    setShowRegister(true);
    setShowForgotPassword(false);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setShowRegister(false);
    setShowRegisterSuccess(false);
  };

  const handleGoToRegisterFromForgot = () => {
    setShowForgotPassword(false);
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
    setShowRegisterSuccess(false);
    setShowForgotPassword(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setShowRegisterSuccess(true);
  };

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setCurrentPage('online-chat');
  };

  const handleVendorApproval = (vendorInfo: { name: string; email: string; company: string; epCode: string }) => {
    console.log('處理廠商審核通過:', vendorInfo);
    setPendingVendorApproval(vendorInfo);
    setCurrentPage('vendor-account-management');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'online-chat':
        return <ChatPageNew currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout} userRole={userRole} initialChatId={selectedChatId} />;
      case 'order-list':
      case 'order-forecast':
      case 'order-exchange':
      case 'order-return':
      case 'order-history':
      case 'order-schedule-change':
        return <OrderManagementPage currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout} userRole={userRole} />;
      case 'correction-create':
        return (
          <ResponsivePageLayout
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            userRole={userRole}
            title="建立修正單"
            breadcrumb="修正單管理 • 建立修正單"
          >
            <CorrectionCreatePage userRole={userRole} onNavigateToList={() => handlePageChange('correction-list')} />
          </ResponsivePageLayout>
        );
      case 'correction-list':
        return (
          <ResponsivePageLayout
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            userRole={userRole}
            title="修正單查詢"
            breadcrumb="修正單管理 • 修正單查詢"
          >
            <CorrectionListWithTabs userRole={userRole} />
          </ResponsivePageLayout>
        );
      case 'correction-history':
        return (
          <ResponsivePageLayout
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            userRole={userRole}
            title="歷史修正單"
            breadcrumb="修正單管理 • 歷史修正單"
          >
            <HistoryCorrectionListPage userRole={userRole} />
          </ResponsivePageLayout>
        );
      case 'quality-abnormal':
        return <QualityAbnormalFullPage currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout} userRole={userRole} />;
      case 'vendor-account-management':
        return <VendorAccountManagementPageNew currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout} userRole={userRole} pendingVendorApproval={pendingVendorApproval} onClearPendingApproval={() => setPendingVendorApproval(null)} />;
      case 'vendor-account-review':
        return <VendorAccountReviewPageNew currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout} userRole={userRole} onApproveVendor={handleVendorApproval} />;
      case 'giant-account-management':
        return <GiantAccountManagementPageNew currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout} userRole={userRole} />;
      case 'schedule-inquiry':
        return (
          <ResponsivePageLayout
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            userRole={userRole}
            title="排程總表查詢"
            breadcrumb=""
          >
            <OrderScheduleInquiryPage userRole={userRole} />
          </ResponsivePageLayout>
        );
      // ── 出貨單管理：建立出貨單 ──
      case 'shipping-create':
        return (
          <ResponsivePageLayout
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            userRole={userRole}
            title="建立出貨單"
            breadcrumb="出貨單管理 • 建立出貨單"
          >
            <ShipmentCreatePage userRole={userRole} />
          </ResponsivePageLayout>
        );
      // ── 出貨單管理：出貨單查詢 ──
      case 'shipping-list':
        return (
          <ResponsivePageLayout
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            userRole={userRole}
            title="出貨單查詢"
            breadcrumb="出貨單管理 • 出貨單查詢"
          >
            <ShipmentListPage />
          </ResponsivePageLayout>
        );
      // ── 尚未建置的功能頁面 → 畫面建置中 ──
      case 'shipping-settings':
        return (
          <ResponsivePageLayout
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            userRole={userRole}
            title="基本設定"
            breadcrumb="出貨單管理 • 基本設定"
          >
            <ShippingBasicSettingsPage />
          </ResponsivePageLayout>
        );
      case 'invoice-create':
      case 'invoice-list':
      case 'invoice-settings':
      case 'parts-maintain':
      case 'parts-quote':
      case 'parts-sample':
      case 'quality-report':
      case 'quality-hazard':
      case 'quality-other':
      case 'insurance-maintain':
      case 'newparts-project':
      case 'newparts-settings':
      case 'vendor-evaluation':
      case 'esg-material':
      case 'esg-maintain':
      case 'shipment-tw-order':
      case 'shipment-tw-shipping':
      case 'shipment-tw-print':
      case 'personal-settings':
      default:
        return <UnderConstructionPage currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout} userRole={userRole} />;
    }
  };

  // Login/Register pages - responsive
  if (!isLoggedIn) {
    return (
      <LanguageProvider>
        <OrderStoreProvider>
          <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
            <div className="w-full h-full min-h-screen bg-white overflow-hidden">
              {showRegisterSuccess ? (
                <RegisterSuccessPage onBackToLogin={handleBackToLogin} />
              ) : showRegister ? (
                <RegisterPage onBackToLogin={handleBackToLogin} onRegisterSuccess={handleRegisterSuccess} />
              ) : showForgotPassword ? (
                <ForgotPasswordPage onBackToLogin={handleBackToLogin} onGoToRegister={handleGoToRegisterFromForgot} />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} onRegisterClick={handleRegisterClick} onForgotPassword={handleForgotPasswordClick} />
              )}
            </div>
          </div>
        </OrderStoreProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <OrderStoreProvider>
        <SidebarProvider>
          <div className={`w-full min-h-screen ${userRole === 'procurement' ? 'procurement-theme bg-white' : 'bg-[#f9fafb]'}`}>
            {renderPage()}
          </div>
        </SidebarProvider>
      </OrderStoreProvider>
    </LanguageProvider>
  );
}