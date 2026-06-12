import React, { useState, useRef, useEffect, useCallback } from 'react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 計算 fixed 定位座標
  // 優先向下展開；下方空間不足時改向右展開；右側也不足時向左展開
  const calcPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const MENU_W = 260;
    const MENU_H = 300;
    const GAP = 4;
    const spaceBelow = window.innerHeight - rect.bottom - 8;

    if (spaceBelow >= Math.min(MENU_H * 0.5, 160)) {
      // ① 下方空間足夠 → 往下展開（同寬按鈕）
      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        top: rect.bottom + GAP,
        maxHeight: Math.min(MENU_H, spaceBelow),
        zIndex: 9999,
      });
    } else {
      // 下方不足 → 判斷右側 or 左側
      const spaceRight = window.innerWidth - rect.right - 8;
      const maxH = Math.min(MENU_H, window.innerHeight - 8);
      // bottom 對齊按鈕底部（選單從下往上長）
      const bottomOffset = window.innerHeight - rect.bottom;

      if (spaceRight >= MENU_W) {
        // ② 右側空間足夠 → 向右展開，底部對齊按鈕底部
        setDropdownStyle({
          position: 'fixed',
          left: rect.right + GAP,
          width: MENU_W,
          bottom: bottomOffset,
          maxHeight: maxH,
          zIndex: 9999,
        });
      } else {
        // ③ 向左展開，底部對齊按鈕底部
        setDropdownStyle({
          position: 'fixed',
          left: Math.max(8, rect.left - MENU_W - GAP),
          width: MENU_W,
          bottom: bottomOffset,
          maxHeight: maxH,
          zIndex: 9999,
        });
      }
    }
  }, []);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', calcPosition, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', calcPosition, true);
    };
  }, [isOpen, calcPosition]);

  // 當下拉選單打開且可搜尋時，自動聚焦搜尋框
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => { searchInputRef.current?.focus(); }, 100);
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) calcPosition();
    setIsOpen(prev => !prev);
  };

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
        ref={buttonRef}
        className={`h-[54px] relative rounded-[8px] shrink-0 w-full ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        onClick={handleToggle}
      >
        <div
          aria-hidden="true"
          className={`absolute border ${error ? 'border-[#ff5630]' : 'border-[rgba(145,158,171,0.2)]'} border-solid inset-0 pointer-events-none rounded-[8px]`}
        />
        {/* 浮動標籤（label 為空時不渲染） */}
        {label && (
          <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
            <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
            <p className={`relative text-[12px] font-semibold ${error ? 'text-[#ff5630]' : 'text-[#637381]'}`}>
              {label}
            </p>
          </div>
        )}
        {/* 內容區：有 label 時加上偏移讓文字避開浮動標籤 */}
        <div className={`flex items-center gap-[8px] h-full px-[14px] ${label ? 'pt-[14px] pb-[8px]' : ''}`}>
          <p className={`flex-1 min-w-0 text-[14px] font-normal truncate ${selectedOption ? 'text-[#1c252e]' : 'text-[#c4cdd6]'}`}>
            {displayText}
          </p>
          {/* 下拉箭頭 */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M6 9l6 6 6-6" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 下拉選單（fixed 定位，穿透 overflow 容器） */}
      {isOpen && (
        <div
          style={dropdownStyle}
          className="bg-white border border-[rgba(145,158,171,0.2)] rounded-[8px] shadow-lg overflow-hidden flex flex-col"
        >
          {/* 搜尋欄位 */}
          {searchable && (
            <div className="px-[14px] py-[12px] border-b border-[rgba(145,158,171,0.2)] sticky top-0 bg-white z-10 shrink-0">
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
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                // 自動拆分 "CODE (中文說明)" 成兩行
                const parenIdx = option.label.indexOf(' (');
                const hasDesc = parenIdx !== -1;
                const codePart = hasDesc ? option.label.slice(0, parenIdx) : option.label;
                const descPart = hasDesc ? option.label.slice(parenIdx + 1) : null;

                return (
                  <div
                    key={option.value}
                    className={`px-[14px] py-[10px] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors ${
                      index === 0 && !searchable ? 'rounded-t-[8px]' : ''
                    } ${index === filteredOptions.length - 1 ? 'rounded-b-[8px]' : ''}`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    {/* 主文字（英文代碼或純文字選項） */}
                    <p className={`font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] text-[14px] ${option.color || 'text-[#1c252e]'}`}>
                      {codePart}
                    </p>
                    {/* 中文說明（若有括號說明則顯示在下方） */}
                    {descPart && (
                      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[18px] text-[12px] text-[#637381] mt-[1px]">
                        {descPart}
                      </p>
                    )}
                  </div>
                );
              })
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