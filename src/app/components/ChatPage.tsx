import Chat from "@/imports/Chat";
import { NavVertical } from './NavVertical';
import { ToggleButton } from './ToggleButton';
import type { PageType } from './MainLayout';

export function ChatPage({ currentPage, onPageChange }: { currentPage: PageType; onPageChange: (page: PageType) => void }) {
  return (
    <div className="relative size-full">
      {/* 淺灰色背景層 - 與首頁同步 */}
      <div className="absolute bg-[#f5f5f7] h-[1024px] left-0 overflow-clip top-0 w-[1440px]">
        {/* 左側導航欄 */}
        <NavVertical currentPage={currentPage} onPageChange={onPageChange} />
        
        {/* Toggle按鈕 */}
        <ToggleButton />
        
        {/* 頂部標題 */}
        <p className="absolute css-4hzbpn font-['Public_Sans:Bold',sans-serif] font-bold leading-[36px] left-[301px] text-[#1c252e] text-[24px] top-[37px] w-[1080px]">Online Chat</p>
      </div>
      
      {/* Chat內容 */}
      <div className="absolute left-[304px] top-[114px] w-[1080px] h-[900px]">
        <Chat />
      </div>
    </div>
  );
}