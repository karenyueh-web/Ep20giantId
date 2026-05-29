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
  searchable?: boolean;
  disabled?: boolean;
}

export function DropdownSelect({
  label,
  value,
  onChange,
  options,
  placeholder = '',
  error = false,
  className = '',
  searchable = false,
  disabled = false,
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
        className={`h-[54px] relative rounded-[8px] shrink-0 w-full ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
      >
        <div 
          aria-hidden="true" 
          className={`absolute border ${error ? 'border-[#ff5630]' : 'border-[rgba(145,158,171,0.2)]'} border-solid inset-0 pointer-events-none rounded-[8px]`} 
        />
        {/* 浮動標籤 */}
        <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
          <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
          <p className={`relative text-[12px] font-semibold ${error ? 'text-[#ff5630]' : 'text-[#637381]'}`}>
            {label}
          </p>
        </div>
        {/* 內容區：對齊其他篩選欄位的 pt-[14px] pb-[8px] 定位 */}
        <div className="flex items-center gap-[8px] h-full px-[14px] pt-[14px] pb-[8px]">
          <p className={`flex-1 min-w-0 text-[14px] font-normal truncate ${selectedOption ? 'text-[#1c252e]' : 'text-[#c4cdd6]'}`}>
            {displayText}
          </p>
          {/* 下拉箭頭 */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M6 9l6 6 6-6" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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