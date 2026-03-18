import svgPaths from "@/imports/svg-imw9bns98t";

interface PaginationControlsProps {
  currentPage?: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function PaginationControls({ 
  currentPage = 1, 
  totalItems, 
  itemsPerPage = 25,
  onPageChange,
  onItemsPerPageChange 
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="content-stretch flex gap-[20px] items-center justify-center overflow-clip px-[8px] py-[10px] relative shrink-0 w-full">
      {/* Rows per page */}
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap">
        Rows per page:
      </p>

      {/* Rows per page selector */}
      <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
        <div className="relative">
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] pr-[4px]">
            {itemsPerPage}
          </p>
          {/* Invisible <select> overlaid for interaction */}
          <select
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange?.(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          >
            {PAGE_SIZE_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="relative shrink-0 size-[16px] pointer-events-none">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <g>
              <path d={svgPaths.p2b32f00} fill="var(--fill-0, #1C252E)" />
            </g>
          </svg>
        </div>
      </div>

      {/* Range display */}
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">
        {totalItems === 0 ? '0' : `${startItem}–${endItem}`} of {totalItems}
      </p>

      {/* Prev / Next buttons */}
      <div className="content-stretch flex items-start relative shrink-0">
        {/* Prev */}
        <div
          className={`content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] ${
            currentPage > 1
              ? 'cursor-pointer hover:bg-[rgba(145,158,171,0.08)]'
              : 'cursor-not-allowed opacity-30'
          }`}
          onClick={handlePrevPage}
        >
          <div className="relative shrink-0 size-[20px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <g>
                <path d={svgPaths.pe50180} fill="var(--fill-0, #919EAB)" fillOpacity="0.8" />
              </g>
            </svg>
          </div>
        </div>

        {/* Next */}
        <div
          className={`content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] ${
            currentPage < totalPages
              ? 'cursor-pointer hover:bg-[rgba(145,158,171,0.08)]'
              : 'cursor-not-allowed opacity-30'
          }`}
          onClick={handleNextPage}
        >
          <div className="relative shrink-0 size-[20px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <g>
                <path d={svgPaths.p1543700} fill="var(--fill-0, #1C252E)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
