import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface StatusOption {
  value: string;
  label: string;
  color: string;
  bgColor: string;
}

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { value: 'NP', label: 'NP - 未處理',     color: '#b71d18', bgColor: 'rgba(255,86,48,0.16)' },
  { value: 'V',  label: 'V - 廠商確認中',   color: '#006c9c', bgColor: 'rgba(0,184,217,0.16)' },
  { value: 'B',  label: 'B - 採購確認中',   color: '#5119b7', bgColor: 'rgba(142,51,255,0.16)' },
  { value: 'CK', label: 'CK - 訂單已確認',  color: '#118d57', bgColor: 'rgba(34,197,94,0.16)' },
  { value: 'CL', label: 'CL - 關閉結案',    color: '#637381', bgColor: 'rgba(145,158,171,0.16)' },
];

interface StatusMultiSelectProps {
  label?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  options?: StatusOption[];
}

export function StatusMultiSelect({
  label = '訂單狀態',
  selected,
  onChange,
  options = DEFAULT_STATUS_OPTIONS,
}: StatusMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
      setSearch('');
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  // [] = all selected (no filter)
  const isAllSelected = selected.length === 0;

  const handleToggleAll = () => {
    // Always reset to "all" (empty array)
    onChange([]);
  };

  const handleToggleOption = (value: string) => {
    let next: string[];
    if (selected.length === 0) {
      // Currently "all" → clicking one means "select only that one"?
      // Actually, deselect "all" and select all EXCEPT the clicked one? 
      // No — user expects: click an option = filter to that option only? 
      // More intuitive: "all" is checked → click individual = uncheck "all", check only that item
      // But the UX should be: checkboxes. "All" checked = all checked.
      // Clicking individual when all checked → uncheck that one = select all except that one
      next = options.filter(o => o.value !== value).map(o => o.value);
    } else if (selected.includes(value)) {
      next = selected.filter(v => v !== value);
      // Don't allow empty via individual uncheck → if last one, reset to all
      if (next.length === 0) {
        next = [];
      }
    } else {
      next = [...selected, value];
      // If all are now selected, reset to [] (= all)
      if (next.length === options.length) {
        next = [];
      }
    }
    onChange(next);
  };

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.value.toLowerCase().includes(search.toLowerCase())
  );

  const removeTag = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = selected.filter(v => v !== value);
    onChange(next.length === 0 ? [] : next);
  };

  // --- Indeterminate state: some but not all selected
  const isIndeterminate = !isAllSelected && selected.length > 0 && selected.length < options.length;

  return (
    <div className="flex-1 flex flex-col relative min-w-0" ref={containerRef}>
      {/* Trigger */}
      <div
        className="h-[54px] relative rounded-[8px] w-full cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="flex items-center px-[14px] h-full gap-[6px] min-w-0">
          {/* Tags / placeholder */}
          <div className="flex-1 flex items-center gap-[4px] min-w-0 overflow-hidden">
            {isAllSelected ? (
              <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[15px] text-[#919eab] truncate select-none">
                全部
              </span>
            ) : (
              <>
                {selected.slice(0, 3).map(v => {
                  const opt = options.find(o => o.value === v);
                  if (!opt) return null;
                  return (
                    <span
                      key={v}
                      className="inline-flex items-center gap-[3px] h-[24px] px-[6px] rounded-[6px] shrink-0"
                      style={{ backgroundColor: opt.bgColor }}
                    >
                      <span
                        className="font-['Public_Sans:Bold',sans-serif] font-bold text-[12px] leading-[20px] whitespace-nowrap"
                        style={{ color: opt.color }}
                      >
                        {opt.value}
                      </span>
                      <X
                        size={12}
                        style={{ color: opt.color }}
                        className="cursor-pointer shrink-0 hover:opacity-70"
                        onClick={(e) => removeTag(v, e)}
                      />
                    </span>
                  );
                })}
                {selected.length > 3 && (
                  <span className="text-[12px] text-[#637381] shrink-0 whitespace-nowrap">+{selected.length - 3}</span>
                )}
              </>
            )}
          </div>

          <ChevronDown
            size={16}
            className={`text-[#637381] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />

          {/* Floating label */}
          <div className="absolute flex items-center left-[10px] px-[4px] top-[-6px] pointer-events-none">
            <div className="absolute bg-white inset-x-0 h-[2px] top-[6px]" />
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px] whitespace-nowrap">
              {label}
            </p>
          </div>
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 z-[200] bg-white rounded-[10px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.24),0px_20px_40px_-4px_rgba(145,158,171,0.24)] border border-[rgba(145,158,171,0.12)] overflow-hidden"
          style={{ minWidth: '240px', width: '100%' }}
        >
          {/* Search */}
          <div className="flex items-center gap-[8px] px-[12px] py-[10px] border-b border-[rgba(145,158,171,0.12)]">
            <Search size={16} className="text-[#919eab] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜尋狀態..."
              className="flex-1 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] bg-transparent border-none outline-none min-w-0"
              autoFocus
              onClick={e => e.stopPropagation()}
            />
            {search && (
              <X
                size={14}
                className="text-[#919eab] cursor-pointer shrink-0 hover:opacity-70"
                onClick={(e) => { e.stopPropagation(); setSearch(''); }}
              />
            )}
          </div>

          {/* "All" option */}
          <button
            type="button"
            className="w-full flex items-center gap-[10px] px-[14px] py-[9px] hover:bg-[rgba(145,158,171,0.06)] cursor-pointer transition-colors text-left"
            onClick={(e) => { e.stopPropagation(); handleToggleAll(); }}
          >
            <div
              className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${
                isAllSelected
                  ? 'bg-[#005eb8] border-[#005eb8]'
                  : isIndeterminate
                    ? 'bg-[#005eb8] border-[#005eb8]'
                    : 'border-[rgba(145,158,171,0.5)] bg-white'
              }`}
            >
              {isAllSelected && (
                <Check size={12} color="white" strokeWidth={3} />
              )}
              {isIndeterminate && (
                <div className="w-[8px] h-[2px] bg-white rounded-full" />
              )}
            </div>
            <span className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[13px] text-[#1c252e]">
              全部 (All)
            </span>
          </button>

          <div className="h-[1px] bg-[rgba(145,158,171,0.12)]" />

          {/* Options list */}
          <div className="max-h-[220px] overflow-y-auto py-[4px]">
            {filteredOptions.length === 0 ? (
              <div className="px-[14px] py-[10px] text-[13px] text-[#919eab]">無符合結果</div>
            ) : (
              filteredOptions.map(option => {
                const checked = isAllSelected || selected.includes(option.value);
                return (
                  <button
                    type="button"
                    key={option.value}
                    className="w-full flex items-center gap-[10px] px-[14px] py-[9px] hover:bg-[rgba(145,158,171,0.06)] cursor-pointer transition-colors text-left"
                    onClick={(e) => { e.stopPropagation(); handleToggleOption(option.value); }}
                  >
                    <div
                      className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? 'bg-[#005eb8] border-[#005eb8]'
                          : 'border-[rgba(145,158,171,0.5)] bg-white'
                      }`}
                    >
                      {checked && (
                        <Check size={12} color="white" strokeWidth={3} />
                      )}
                    </div>
                    <span
                      className="inline-flex items-center h-[24px] px-[6px] rounded-[6px] shrink-0"
                      style={{ backgroundColor: option.bgColor }}
                    >
                      <span
                        className="font-['Public_Sans:Bold',sans-serif] font-bold text-[12px] leading-[20px]"
                        style={{ color: option.color }}
                      >
                        {option.value}
                      </span>
                    </span>
                    <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#637381]">
                      {option.label.replace(`${option.value} - `, '')}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
