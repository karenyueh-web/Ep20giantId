import { useState, useRef, useEffect } from 'react';
import svgPaths from "@/imports/svg-imw9bns98t";

interface PaginationControlsProps {
  currentPage?: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}

const PAGE_SIZE_OPTIONS = [100, 500, 1000, 5000];

export function PaginationControls({ 
  currentPage = 1, 
  totalItems, 
  itemsPerPage = 100,
  onPageChange,
  onItemsPerPageChange 
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);

  // 計算下拉選單的 fixed 位置（自動偵測上/下空間）
  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuHeight = PAGE_SIZE_OPTIONS.length * 40 + 8; // 每項約 40px
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow >= menuHeight) {
        // 往下展開
        setDropPos({ top: rect.bottom + 4, left: rect.left });
      } else {
        // 往上展開
        setDropPos({ top: rect.top - menuHeight - 4, left: rect.left });
      }
    }
    setOpen(v => !v);
  };

  // 點擊外部關閉
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current && !btnRef.current.contains(target)) {
        // 點到 fixed 下拉區域內不關閉
        const dropdown = document.getElementById('pagination-dropdown');
        if (dropdown && dropdown.contains(target)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handlePrevPage = () => {
    if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
  };

  return (
    <div className="content-stretch flex gap-[20px] items-center justify-center overflow-clip px-[8px] py-[10px] relative shrink-0 w-full">
      {/* Rows per page label */}
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">
        Rows per page:
      </p>

      {/* 自訂下拉按鈕 */}
      <div className="relative shrink-0">
        <button
          ref={btnRef}
          onClick={handleOpen}
          className="flex items-center gap-[4px] px-[10px] py-[4px] rounded-[6px] border border-[rgba(145,158,171,0.32)] bg-white hover:border-[rgba(145,158,171,0.56)] transition-colors cursor-pointer"
        >
          <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] text-[#1c252e] min-w-[36px] text-center">
            {itemsPerPage}
          </span>
          <div className="relative shrink-0 size-[16px] pointer-events-none">
            <svg className={`block size-full transition-transform duration-150 ${open ? 'rotate-180' : ''}`} fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <g><path d={svgPaths.p2b32f00} fill="var(--fill-0, #1C252E)" /></g>
            </svg>
          </div>
        </button>
      </div>

      {/* fixed 定位的下拉選單，突破 overflow:hidden */}
      {open && dropPos && (
        <div
          id="pagination-dropdown"
          style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, zIndex: 9999 }}
          className="bg-white rounded-[8px] shadow-[0px_8px_24px_-4px_rgba(145,158,171,0.24),0px_0px_2px_0px_rgba(145,158,171,0.2)] border border-[rgba(145,158,171,0.16)] overflow-hidden min-w-[80px]"
        >
          {PAGE_SIZE_OPTIONS.map(n => (
            <div
              key={n}
              onMouseDown={e => {
                e.preventDefault();
                onItemsPerPageChange?.(n);
                setOpen(false);
              }}
              className={`px-[20px] py-[9px] text-[14px] leading-[22px] cursor-pointer transition-colors whitespace-nowrap text-center
                ${n === itemsPerPage
                  ? "bg-[rgba(0,94,184,0.08)] font-semibold text-[#005eb8]"
                  : "text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)]"
                }`}
              style={{ fontFamily: n === itemsPerPage ? "'Public_Sans:SemiBold',sans-serif" : "'Public_Sans:Regular',sans-serif" }}
            >
              {n}
            </div>
          ))}
        </div>
      )}

      {/* Range display */}
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">
        {totalItems === 0 ? '0' : `${startItem}–${endItem}`} of {totalItems}
      </p>

      {/* Prev / Next buttons */}
      <div className="content-stretch flex items-start relative shrink-0">
        <div
          className={`content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] ${
            currentPage > 1 ? 'cursor-pointer hover:bg-[rgba(145,158,171,0.08)]' : 'cursor-not-allowed opacity-30'
          }`}
          onClick={handlePrevPage}
        >
          <div className="relative shrink-0 size-[20px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <g><path d={svgPaths.pe50180} fill="var(--fill-0, #919EAB)" fillOpacity="0.8" /></g>
            </svg>
          </div>
        </div>
        <div
          className={`content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] ${
            currentPage < totalPages ? 'cursor-pointer hover:bg-[rgba(145,158,171,0.08)]' : 'cursor-not-allowed opacity-30'
          }`}
          onClick={handleNextPage}
        >
          <div className="relative shrink-0 size-[20px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <g><path d={svgPaths.p1543700} fill="var(--fill-0, #1C252E)" /></g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
