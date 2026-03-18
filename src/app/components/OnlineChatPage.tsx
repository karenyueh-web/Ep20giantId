import Chat1 from "@/imports/Chat-8-7405";
import type { PageType } from './MainLayout';

interface OnlineChatPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
}

export function OnlineChatPage({ currentPage, onPageChange, onLogout }: OnlineChatPageProps) {
  return (
    <div className="relative w-[1440px] h-[1024px] bg-white overflow-hidden">
      <Chat1 currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} />
    </div>
  );
}
