/**
 * CurrencySelect — 幣別下拉選擇器（帶搜尋 + 最近使用排序）
 *
 * 功能：
 *   1. 搜尋幣別（依代碼或短稱）
 *   2. 每次選擇後，記錄到 localStorage
 *   3. 下次開啟時，上次使用的幣別自動排到最前面
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { SAP_CURRENCIES } from '@/app/data/currencyData';
import svgPaths from '@/imports/svg-9lma1oefe7';

// localStorage key
const LAST_USED_KEY = 'shipment_last_used_currency';

function getLastUsedCurrencies(): string[] {
  try {
    const raw = localStorage.getItem(LAST_USED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLastUsedCurrency(code: string): void {
  try {
    const prev = getLastUsedCurrencies().filter(c => c !== code);
    localStorage.setItem(LAST_USED_KEY, JSON.stringify([code, ...prev].slice(0, 5)));
  } catch { /**/ }
}

interface CurrencySelectProps {
  label?: string;
  value: string;
  onChange: (code: string) => void;
  error?: boolean;
}

export function CurrencySelect({
  label = '幣別',
  value,
  onChange,
  error = false,
}: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // 自動聚焦搜尋框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // 依「最近使用」排序的完整選項
  const sortedOptions = useMemo(() => {
    const lastUsed = getLastUsedCurrencies();
    if (lastUsed.length === 0) return SAP_CURRENCIES;

    const lastUsedSet = new Set(lastUsed);
    const recent = lastUsed
      .map(code => SAP_CURRENCIES.find(c => c.code === code))
      .filter(Boolean) as typeof SAP_CURRENCIES;
    const rest = SAP_CURRENCIES.filter(c => !lastUsedSet.has(c.code));
    return [...recent, ...rest];
  }, [isOpen]); // 每次打開時重新計算

  // 搜尋篩選
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedOptions;
    return sortedOptions.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.shortName.toLowerCase().includes(q) ||
      c.fullName.toLowerCase().includes(q)
    );
  }, [sortedOptions, searchQuery]);

  const selected = SAP_CURRENCIES.find(c => c.code === value);
  const displayText = selected ? selected.label : '';

  const borderColor = error ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor  = error ? '#ff5630' : '#637381';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger */}
      <div
        className="h-[54px] relative rounded-[8px] shrink-0 w-full cursor-pointer"
        onClick={() => setIsOpen(v => !v)}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
          style={{ borderColor }}
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[14px] relative size-full">
            <p className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[#1c252e] text-[15px] truncate pr-[32px]">
              {displayText}
            </p>
            {/* Floating label */}
            <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
              <p
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[12px]"
                style={{ color: labelColor }}
              >
                {label}
              </p>
            </div>
            {/* 下拉箭頭 */}
            <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2">
              <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px]">
                <div className="relative shrink-0 size-[24px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <g><path d={svgPaths.p3a1c00f0} fill="#637381" /></g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-[58px] left-0 bg-white border border-[rgba(145,158,171,0.2)] rounded-[8px] shadow-lg z-50 flex flex-col"
          style={{ maxHeight: '320px', minWidth: '380px', width: '100%' }}>

          {/* 搜尋欄 */}
          <div className="px-[12px] py-[10px] border-b border-[rgba(145,158,171,0.12)] bg-white shrink-0">
            <div className="flex items-center gap-[8px] border border-[rgba(145,158,171,0.32)] rounded-[6px] px-[10px] py-[6px] focus-within:border-[#005eb8] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <circle cx="11" cy="11" r="8" stroke="#919eab" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="#919eab" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="搜尋代碼或名稱..."
                className="flex-1 font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] placeholder:text-[#c4cdd6] outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={e => { e.stopPropagation(); setSearchQuery(''); }}
                  className="shrink-0 text-[#919eab] hover:text-[#1c252e] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 選項列表 */}
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((c, idx) => {
                const isSelected = c.code === value;
                // 如果沒在搜尋，且有最近使用，在最後一個最近使用項後顯示分隔線
                const lastUsed = searchQuery ? [] : getLastUsedCurrencies();
                const isLastRecent = !searchQuery &&
                  lastUsed.length > 0 &&
                  idx === lastUsed.length - 1 &&
                  idx < filteredOptions.length - 1;

                return (
                  <div key={`${c.code}-${idx}`}>
                    <div
                      className={`px-[14px] py-[10px] cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-[rgba(0,94,184,0.08)]'
                          : 'hover:bg-[rgba(145,158,171,0.06)]'
                      }`}
                      onClick={() => {
                        saveLastUsedCurrency(c.code);
                        onChange(c.code);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div>
                        <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#005eb8] mr-[8px]">
                          {c.code}
                        </span>
                        <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[13px] text-[#1c252e]">
                          {c.fullName || c.shortName}
                        </span>
                      </div>
                      {isSelected && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                          <path d="M20 6 9 17l-5-5" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {isLastRecent && (
                      <div className="mx-[14px] border-t border-[rgba(145,158,171,0.16)]" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-[14px] py-[16px] text-center">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#919eab]">
                  無符合的幣別
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
