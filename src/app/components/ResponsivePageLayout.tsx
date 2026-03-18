import { NavVertical } from './NavVertical';
import { PageHeaderB } from './PageHeaderB';
import type { PageType } from './MainLayout';
import { useSidebar } from './SidebarContext';

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
  const showOverlay = (isMobile || isTablet) && isOpen;
  // Desktop collapsed = mini sidebar (88px), mobile/tablet collapsed = fully hidden
  const isDesktopMini = !isOpen && !isMobile && !isTablet;

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
          shrink-0 bg-[#2B2B2B] z-[199] transition-all duration-300 ease-in-out
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
      </div>

      {/* Main area: header + content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* B: Header */}
        <div className="shrink-0 relative">
          {/* Hamburger / toggle button */}
          <button
            onClick={toggle}
            className="absolute left-[10px] top-[28px] z-50 bg-white rounded-full size-[32px] flex items-center justify-center shadow-[0px_1px_3px_0px_rgba(145,158,171,0.2)] hover:bg-[#f4f6f8] transition-colors cursor-pointer"
          >
            {(isMobile || isTablet) ? (
              /* Hamburger icon */
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M3 10H17M3 15H17" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              /* Collapse arrow */
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                className={`transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
              >
                <path d="M10.06 12L11 11.06L7.94667 8L11 4.94L10.06 4L6.06 8L10.06 12Z" fill="#919EAB" />
              </svg>
            )}
          </button>

          {customHeader || (
            <PageHeaderB title={title} breadcrumb={breadcrumb} />
          )}
        </div>

        {/* C: Content area */}
        <div className="flex-1 min-h-0 px-[24px] pb-[10px] overflow-hidden">
          {children}
        </div>
      </div>

      {/* Overlays */}
      {overlays}
    </div>
  );
}