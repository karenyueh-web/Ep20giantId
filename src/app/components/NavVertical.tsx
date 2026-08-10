import { NavigationList } from './NavigationList';
import imgAvatar from "@/assets/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import type { PageType } from './MainLayout';
import { useSidebar } from './SidebarContext';
import { useNavTheme } from './NavThemeContext';
import { useRef, useLayoutEffect } from 'react';

// Giant Group Logo — 純文字版（點擊回 Dashboard）
function Stack({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex flex-col justify-center px-[4px] h-[72px] shrink-0 w-full cursor-pointer select-none group"
      onClick={onClick}
      title="回到 Dashboard"
      data-name="stack"
    >
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-none text-white text-[18px] tracking-[0.04em] uppercase group-hover:text-[rgba(255,255,255,0.8)] transition-colors">
        Giant Group
      </p>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[20px] text-white text-[16px] mt-[2px] group-hover:text-[rgba(255,255,255,0.8)] transition-colors">
        vendor online operation platform
      </p>
    </div>
  );
}

// Mini avatar — clickable to expand sidebar
function StackMini({ onExpand }: { onExpand: () => void }) {
  return (
    <div
      className="h-[72px] flex items-center justify-center shrink-0 w-full cursor-pointer group"
      onClick={onExpand}
      title="展開選單"
      data-name="stack-mini"
    >
      <div className="relative size-[44px]">
        {/* Avatar ring that glows on hover */}
        <div className="size-full rounded-full overflow-hidden ring-2 ring-[rgba(255,255,255,0.18)] group-hover:ring-[rgba(255,184,0,0.7)] transition-all duration-200 shadow-[0_0_0_3px_rgba(255,255,255,0.06)]">
          <img
            alt="User Avatar"
            className="w-full h-full object-cover"
            src={imgAvatar}
          />
        </div>
        {/* Expand hint arrow badge */}
        <div className="absolute -bottom-[1px] -right-[1px] size-[16px] bg-[#FFB800] rounded-full flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform duration-200">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M2.5 1.5L5.5 4L2.5 6.5" stroke="#1c252e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

interface NavVerticalProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: 'vendor' | 'purchaser' | 'giant';
  isMini?: boolean;
}

const NAV_SCROLL_KEY = 'nav-sidebar-scrollTop';

// Responsive sidebar - fills parent container
export function NavVertical({ currentPage, onPageChange, onLogout, isMini = false }: NavVerticalProps) {
  const { open } = useSidebar();
  const { theme, navLayout, toggleLayout, canUseTopNav } = useNavTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  // mount 時從 sessionStorage 還原捲動位置
  useLayoutEffect(() => {
    if (scrollRef.current) {
      const saved = parseInt(sessionStorage.getItem(NAV_SCROLL_KEY) || '0', 10);
      scrollRef.current.scrollTop = saved;
    }
  }, []); // 只在 mount 時執行一次

  // 頁面切換時先把捲動位置存到 sessionStorage，再切頁
  const handlePageChange = (page: PageType) => {
    if (scrollRef.current) {
      sessionStorage.setItem(NAV_SCROLL_KEY, String(scrollRef.current.scrollTop));
    }
    onPageChange(page);
  };

  // sidebar 手動捲動時也即時儲存（避免使用者直接捲動後沒觸發切頁）
  const handleScroll = () => {
    if (scrollRef.current) {
      sessionStorage.setItem(NAV_SCROLL_KEY, String(scrollRef.current.scrollTop));
    }
  };


  return (
    <div className="w-full h-full flex flex-col" data-name="NavVertical" style={{ backgroundColor: theme.bg }}>
      {/* 捲動內容區 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto overflow-x-hidden custom-scrollbar pt-0"
        style={{ paddingLeft: isMini ? '0' : '16px', paddingRight: isMini ? '0' : '16px' }}
      >
        {isMini ? <StackMini onExpand={open} /> : <Stack onClick={() => handlePageChange('dashboard')} />}
        <NavigationList
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLogout={onLogout}
          isMini={isMini}
        />
      </div>

      {/* ── 底部工具列：Logout + 版面切換（並排，固定不捲動）── */}
      <div
        className="shrink-0 flex items-center justify-center gap-[8px] h-[64px]"
        style={{ borderTop: `1px solid ${theme.borderColor}` }}
      >
        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Logout"
            className="relative flex items-center justify-center rounded-[500px] size-[44px] cursor-pointer hover:bg-[rgba(255,255,255,0.15)] transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* 版面切換（僅在選單 ≤ 10 個時顯示） */}
        {canUseTopNav && (
          <button
            onClick={toggleLayout}
            title={navLayout === 'sidebar' ? '切換為頂部導覽列' : '切換為側邊導覽列'}
            className="relative flex items-center justify-center rounded-[500px] size-[44px] cursor-pointer hover:bg-[rgba(255,255,255,0.15)] transition-colors shrink-0"
          >
            {navLayout === 'sidebar' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="3" y="3" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M3 11h18M3 16h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="3" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M11 6h10M11 10h10M11 14h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        )}
      </div>

      <div aria-hidden="true" className="absolute border-r border-solid inset-0 pointer-events-none" style={{ borderColor: theme.borderColor }} />
    </div>
  );
}