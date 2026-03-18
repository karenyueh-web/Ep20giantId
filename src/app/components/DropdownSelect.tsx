import svgPaths from "@/imports/svg-9lma1oefe7";
import { useState, useRef, useEffect } from 'react';

interface DropdownSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; color?: string }[];
  placeholder?: string;
  error?: boolean;
  className?: string;
  searchable?: boolean; // 新增：是否可搜尋
}

export function DropdownSelect({
  label,
  value,
  onChange,
  options,
  placeholder = '',
  error = false,
  className = '',
  searchable = false
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 搜尋關鍵字
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery(''); // 關閉時清空搜尋
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 當下拉選單打開且可搜尋時，自動聚焦搜尋框
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  // 篩選選項
  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* 下拉選單按鈕 */}
      <div 
        className="h-[54px] relative rounded-[8px] shrink-0 w-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div 
          aria-hidden="true" 
          className={`absolute border ${error ? 'border-red-500 border-2' : 'border-[rgba(145,158,171,0.2)]'} border-solid inset-0 pointer-events-none rounded-[8px]`} 
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[14px] relative size-full">
            <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px]">
              {displayText}
            </p>
            {/* Label */}
            <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
              <p className={`font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 ${error ? 'text-red-500' : 'text-[#637381]'} text-[12px]`}>
                {label}
              </p>
            </div>
            {/* 下拉箭頭 */}
            <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2">
              <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px]">
                <div className="relative shrink-0 size-[24px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <g>
                      <path d={svgPaths.p3a1c00f0} fill="#637381" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下拉選單選項 */}
      {isOpen && (
        <div className="absolute top-[58px] left-0 right-0 bg-white border border-[rgba(145,158,171,0.2)] rounded-[8px] shadow-lg z-50 max-h-[300px] overflow-hidden flex flex-col">
          {/* 搜尋欄位 */}
          {searchable && (
            <div className="px-[14px] py-[12px] border-b border-[rgba(145,158,171,0.2)] sticky top-0 bg-white z-10">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="搜尋..."
                className="w-full px-[12px] py-[8px] border border-[rgba(145,158,171,0.2)] rounded-[6px] font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] placeholder:text-[#919eab] outline-none focus:border-[#2196F3] transition-colors"
              />
            </div>
          )}
          
          {/* 選項列表 */}
          <div className="overflow-y-auto max-h-[240px]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`px-[14px] py-[12px] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors ${
                    index === 0 && !searchable ? 'rounded-t-[8px]' : ''
                  } ${index === filteredOptions.length - 1 ? 'rounded-b-[8px]' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <p 
                    className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] ${
                      option.color || 'text-[#1c252e]'
                    }`}
                  >
                    {option.label}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-[14px] py-[12px] text-center">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">
                  無符合的選項
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}