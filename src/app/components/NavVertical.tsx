import { NavigationList } from './NavigationList';
import imgStack from "@/assets/giant-logo-white.png";
import imgAvatar from "@/assets/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import type { PageType } from './MainLayout';
import { useSidebar } from './SidebarContext';
import { useRef, useLayoutEffect } from 'react';

// Giant GROUP Logo — full banner
function Stack() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="stack">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStack} />
      <div className="size-full" />
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
    <div className="bg-[#2B2B2B] w-full h-full" data-name="NavVertical">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="content-stretch flex flex-col items-center overflow-y-auto overflow-x-hidden custom-scrollbar pb-[40px] pt-0 relative rounded-[inherit] w-full h-full"
        style={{ paddingLeft: isMini ? '0' : '16px', paddingRight: isMini ? '0' : '16px' }}
      >
        {isMini ? <StackMini onExpand={open} /> : <Stack />}
        <NavigationList
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLogout={onLogout}
          isMini={isMini}
        />
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(145,158,171,0.12)] border-r border-solid inset-0 pointer-events-none" />
    </div>
  );
}