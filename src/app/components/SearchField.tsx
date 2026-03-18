import { useState, useRef, useEffect } from 'react';
import svgPaths from "@/imports/svg-imw9bns98t";
import { SimpleDatePicker } from './SimpleDatePicker';

interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 'search' shows magnifying glass on left; 'date' shows calendar icon on right */
  type?: 'search' | 'date';
}

export function SearchField({ label, value, onChange, placeholder = ' ', type = 'search' }: SearchFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉日曆
  useEffect(() => {
    if (!showPicker) return;
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [showPicker]);

  return (
    <div className="flex-1 flex flex-col relative" ref={containerRef}>
      <div className="h-[54px] relative rounded-[8px] w-full">
        <div className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px] z-[1]" />
        <div className="flex flex-row items-center size-full">
          <div className="flex items-center px-[14px] relative size-full">
            {/* Search icon (left) */}
            {type === 'search' && (
              <div className="flex items-center pr-[8px] shrink-0">
                <div className="relative shrink-0 size-[24px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p14834500} fill="#919EAB" />
                  </svg>
                </div>
              </div>
            )}
            {type === 'date' ? (
              /* ─── Date 欄位：點擊開啟 SimpleDatePicker ─── */
              <>
                <div
                  className="flex-1 min-w-0 h-full flex items-center cursor-pointer select-none"
                  onClick={() => setShowPicker(prev => !prev)}
                >
                  <span
                    className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[15px] min-w-0 truncate ${value ? 'text-[#1c252e]' : 'text-[#919eab]'}`}
                  >
                    {value || placeholder}
                  </span>
                </div>
                {/* 清除按鈕 */}
                {value && (
                  <div
                    className="flex items-center justify-center shrink-0 size-[28px] rounded-full cursor-pointer hover:bg-[rgba(145,158,171,0.12)] transition-colors"
                    onClick={(e) => { e.stopPropagation(); onChange(''); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="#919EAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {/* Calendar duotone icon */}
                <div
                  className="flex items-center justify-center shrink-0 rounded-[500px] size-[40px] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                  onClick={() => setShowPicker(prev => !prev)}
                >
                  <div className="relative shrink-0 size-[24px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d={svgPaths.p33617100} fill="#637381" opacity="0.4" />
                      <path d={svgPaths.pd51dc00} fill="#637381" />
                      <path d={svgPaths.p3da10180} fill="#637381" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[15px] bg-transparent border-none outline-none min-w-0"
                style={{ border: 'none', outline: 'none' }}
              />
            )}
            {/* Floating label */}
            <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] pointer-events-none z-[4]">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">
                {label}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* SimpleDatePicker dropdown */}
      {type === 'date' && showPicker && (
        <div className="absolute top-[58px] left-0 z-[100]">
          <SimpleDatePicker
            selectedDate={value}
            onDateSelect={(date) => {
              onChange(date);
              setShowPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
