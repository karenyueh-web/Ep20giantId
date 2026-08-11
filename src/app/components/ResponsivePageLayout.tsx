import { NavVertical } from './NavVertical';
import { NavTopBar } from './NavTopBar';
import { PageHeaderB } from './PageHeaderB';
import type { PageType } from './MainLayout';
import { useSidebar } from './SidebarContext';
import { useNavTheme } from './NavThemeContext';

interface ResponsivePageLayoutProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
  title: string;
  breadcrumb: string;
  children: React.ReactNode;
  /** Custom header instead of PageHeaderB (e.g. ChatPageNew uses custom title) */
  customHeader?: React.ReactNode;
  /** Additional content to render outside the content area but inside the page */
  overlays?: React.ReactNode;
}

export function ResponsivePageLayout({
  currentPage,
  onPageChange,
  onLogout,
  userRole = 'giant',
  title,
  breadcrumb,
  children,
  customHeader,
  overlays
}: ResponsivePageLayoutProps) {
  const { isOpen, isMobile, isTablet, toggle, close } = useSidebar();
  const { navLayout } = useNavTheme();
  const showOverlay = (isMobile || isTablet) && isOpen;
  // Desktop collapsed = mini sidebar (88px), mobile/tablet collapsed = fully hidden
  const isDesktopMini = !isOpen && !isMobile && !isTablet;

  // ── Top Nav 模式 ────────────────────────────────────────────────────────────
  if (navLayout === 'topnav') {
    return (
      <div className="relative w-full h-screen bg-[#f5f5f7] overflow-hidden flex flex-col">
        {/* A: Top Navigation Bar */}
        <NavTopBar
          currentPage={currentPage}
          onPageChange={onPageChange}
          onLogout={onLogout}
        />

        {/* B: Page header */}
        <div className="shrink-0 relative">
          {customHeader || (
            <PageHeaderB title={title} breadcrumb={breadcrumb} />
          )}
        </div>

        {/* C: Content area */}
        <div className="flex-1 min-h-0 px-[24px] pb-[10px] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Overlays */}
        {overlays}
      </div>
    );
  }

  // ── Sidebar 模式（原有邏輯）────────────────────────────────────────────────
  return (
    <div className="relative w-full h-screen bg-[#f5f5f7] overflow-hidden flex">
      {/* Mobile overlay backdrop */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/40 z-[198] transition-opacity"
          onClick={close}
        />
      )}

      {/* A: Sidebar */}
      <div
        className={`
          shrink-0 z-[199] transition-all duration-300 ease-in-out
          ${isMobile || isTablet
            ? `fixed top-0 left-0 h-full w-[280px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `relative ${isOpen ? 'w-[280px]' : 'w-[88px]'}`
          }
        `}
        data-name="NavVertical"
      >
        <NavVertical
          currentPage={currentPage}
          onPageChange={(page) => {
            onPageChange(page);
            if (isMobile || isTablet) close();
          }}
          onLogout={onLogout}
          userRole={userRole}
          isMini={isDesktopMini}
        />

        {/* 收合 tab：浮在 sidebar 右側邊線上，desktop only */}
        {!isMobile && !isTablet && (
          <button
            onClick={toggle}
            title={isOpen ? '收合選單' : '展開選單'}
            className="absolute right-0 top-[36px] translate-x-1/2 z-[201] bg-white rounded-full size-[22px] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#f0f0f0] shadow-[0_1px_6px_rgba(0,0,0,0.18)]"
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              className={`transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
            >
              <path d="M15 18L9 12L15 6" stroke="#637381" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Main area: header + content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* B: Header */}
        <div className="shrink-0 relative">
          {/* 漢堡選單：僅 mobile / tablet 顯示 */}
          {(isMobile || isTablet) && (
            <button
              onClick={toggle}
              className="absolute left-[10px] top-[28px] z-50 bg-white rounded-full size-[32px] flex items-center justify-center shadow-[0px_1px_3px_0px_rgba(145,158,171,0.2)] hover:bg-[#f4f6f8] transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M3 10H17M3 15H17" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {customHeader || (
            <PageHeaderB title={title} breadcrumb={breadcrumb} />
          )}
        </div>

        {/* C: Content area */}
        <div className="flex-1 min-h-0 px-[24px] pb-[10px] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>

      {/* Overlays */}
      {overlays}
    </div>
  );
}