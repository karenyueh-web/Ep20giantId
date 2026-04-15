/**
 * CountrySelect — 原產國家下拉選擇器（帶搜尋 + 最近使用排序）
 * 使用 position:fixed 動態定位，解決表格 overflow 容器截切問題。
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { SAP_COUNTRIES } from '@/app/data/countryData';

const LAST_USED_KEY = 'shipment_last_used_country';

function getLastUsed(): string[] {
  try {
    const raw = localStorage.getItem(LAST_USED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLastUsed(code: string): void {
  try {
    const prev = getLastUsed().filter(c => c !== code);
    localStorage.setItem(LAST_USED_KEY, JSON.stringify([code, ...prev].slice(0, 5)));
  } catch { /**/ }
}

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // 開啟時計算位置
  const openDropdown = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setIsOpen(true);
  };

  // 點擊外部關閉
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // 自動聚焦搜尋欄
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // 最近使用排序
  const sortedOptions = useMemo(() => {
    const lastUsed = getLastUsed();
    if (lastUsed.length === 0) return SAP_COUNTRIES;
    const set = new Set(lastUsed);
    const recent = lastUsed.map(c => SAP_COUNTRIES.find(o => o.code === c)).filter(Boolean) as typeof SAP_COUNTRIES;
    const rest = SAP_COUNTRIES.filter(c => !set.has(c.code));
    return [...recent, ...rest];
  }, [isOpen]);

  // 搜尋篩選（startsWith：從頭比對，避免 "US" 配到 Austria/Russia 等）
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedOptions;
    return sortedOptions.filter(c =>
      c.code.toLowerCase().startsWith(q) ||
      c.zhName.toLowerCase().startsWith(q)
    );
  }, [sortedOptions, searchQuery]);

  return (
    <div className="relative w-full">
      {/* 觸發器：顯示代碼 */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => isOpen ? (setIsOpen(false), setSearchQuery('')) : openDropdown()}
        className="w-full h-[32px] px-[6px] border border-[rgba(145,158,171,0.32)] rounded-[6px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e] outline-none hover:border-[#1c252e] focus:border-[#1c252e] bg-white cursor-pointer transition-colors flex items-center justify-between gap-[2px]"
      >
        <span className="truncate">{value || '—'}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M6 9l6 6 6-6" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 下拉面板（fixed 定位，跳脫 overflow 限制） */}
      {isOpen && (
        <div
          ref={panelRef}
          className="bg-white border border-[rgba(145,158,171,0.2)] rounded-[8px] shadow-lg flex flex-col"
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: '280px', maxHeight: '300px', zIndex: 9999 }}
        >
          {/* 搜尋 */}
          <div className="px-[10px] py-[8px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
            <div className="flex items-center gap-[6px] border border-[rgba(145,158,171,0.32)] rounded-[6px] px-[8px] py-[5px] focus-within:border-[#005eb8] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <circle cx="11" cy="11" r="8" stroke="#919eab" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="#919eab" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="搜尋代碼或國家名稱..."
                className="flex-1 font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e] placeholder:text-[#c4cdd6] outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={e => { e.stopPropagation(); setSearchQuery(''); }}
                  className="shrink-0 text-[#919eab] hover:text-[#1c252e] transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 選項列表 */}
          <div className="overflow-y-auto flex-1">
            {filtered.length > 0 ? (
              filtered.map((c, idx) => {
                const isSelected = c.code === value;
                const lastUsed = searchQuery ? [] : getLastUsed();
                const isLastRecent = !searchQuery && lastUsed.length > 0 &&
                  idx === lastUsed.length - 1 && idx < filtered.length - 1;

                return (
                  <div key={`${c.code}-${idx}`}>
                    <div
                      className={`px-[10px] py-[7px] cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-[rgba(0,94,184,0.08)]' : 'hover:bg-[rgba(145,158,171,0.06)]'
                      }`}
                      onClick={() => {
                        saveLastUsed(c.code);
                        onChange(c.code);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-center gap-[8px] min-w-0">
                        <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#005eb8] shrink-0 w-[24px]">
                          {c.code}
                        </span>
                        <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[12px] text-[#1c252e] truncate">
                          {c.zhName}
                        </span>
                      </div>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-[4px]">
                          <path d="M20 6 9 17l-5-5" stroke="#005eb8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {isLastRecent && (
                      <div className="mx-[10px] border-t border-[rgba(145,158,171,0.16)]" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-[10px] py-[14px] text-center">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">無符合的國家</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
