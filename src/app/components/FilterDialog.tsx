import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

// Filter 條件介面
export interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface FilterDialogProps {
  filters: FilterCondition[];
  availableColumns: { key: string; label: string }[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  onClose: () => void;
  onApply: (validFilters: FilterCondition[]) => void;
}

// 操作符選項
const operatorOptions = [
  { value: 'contains', label: '包含' },
  { value: 'equals', label: '等於' },
  { value: 'notEquals', label: '不等於' },
  { value: 'startsWith', label: '開頭是' },
  { value: 'endsWith', label: '結尾是' },
  { value: 'isEmpty', label: '為空' },
  { value: 'isNotEmpty', label: '不為空' }
];

// ── 輕量自訂下拉選單（取代原生 <select>）──────────────────────────────────
function MiniSelect({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  // 計算面板位置
  const calcPanel = () => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
      zIndex: 10000,
    });
  };

  // 開啟時同步定位
  useLayoutEffect(() => {
    if (!open) return;
    calcPanel();
    window.addEventListener('scroll', calcPanel, true);
    window.addEventListener('resize', calcPanel);
    return () => {
      window.removeEventListener('scroll', calcPanel, true);
      window.removeEventListener('resize', calcPanel);
    };
  }, [open]);

  // 點擊外部關閉
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        className="w-full h-[36px] px-[10px] pr-[28px] rounded-[6px] border border-[rgba(145,158,171,0.2)] bg-white text-left font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] outline-none focus:border-[#1D7BF5] transition-colors truncate"
        onClick={() => setOpen(v => !v)}
      >
        {selected?.label || <span className="text-[#919eab]">{placeholder}</span>}
        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`absolute right-[8px] top-1/2 -translate-y-1/2 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* 下拉面板 → Portal 到 body，不受父層 overflow:hidden 影響 */}
      {open && createPortal(
        <div
          ref={panelRef}
          style={panelStyle}
          className="bg-white border border-[rgba(145,158,171,0.16)] rounded-[8px] shadow-[0px_8px_16px_-4px_rgba(145,158,171,0.24)] max-h-[240px] overflow-y-auto custom-scrollbar py-[4px]"
          onMouseDown={e => e.stopPropagation()}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              className={`px-[10px] py-[8px] cursor-pointer text-[13px] font-['Public_Sans:Regular',sans-serif] transition-colors truncate ${
                opt.value === value
                  ? 'bg-[rgba(29,123,245,0.08)] text-[#1D7BF5] font-semibold'
                  : 'text-[#1c252e] hover:bg-[rgba(145,158,171,0.06)]'
              }`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ── FilterDialog ──────────────────────────────────────────────────────────────
export function FilterDialog({
  filters,
  availableColumns,
  onFiltersChange,
  onClose,
  onApply
}: FilterDialogProps) {
  // 使用本地狀態管理篩選條件
  const [localFilters, setLocalFilters] = useState<FilterCondition[]>(() =>
    filters.length > 0 ? [...filters] : [{ id: '1', column: '', operator: 'contains', value: '' }]
  );

  const needsValueInput = (op: string) => op !== 'isEmpty' && op !== 'isNotEmpty';

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: '',
      operator: 'contains',
      value: ''
    };
    setLocalFilters([...localFilters, newFilter]);
  };

  const removeFilter = (id: string) => {
    if (localFilters.length <= 1) return;
    setLocalFilters(localFilters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, field: keyof FilterCondition, value: string) => {
    setLocalFilters(localFilters.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const handleApply = () => {
    const validFilters = localFilters.filter(f => f.column && f.operator);
    onFiltersChange(validFilters);
    onApply(validFilters);
  };

  return (
    <div
      className="relative bg-white rounded-[8px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-[480px] max-h-[500px] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 標題 */}
      <div className="px-[16px] py-[12px] border-b border-[rgba(145,158,171,0.08)]">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#1c252e] text-[14px]">
          進階篩選 ({localFilters.filter(f => f.column && f.operator).length})
        </p>
      </div>
      
      {/* 篩選條件列表 */}
      <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 p-[16px]">
        {localFilters.map((filter) => (
          <div key={filter.id} className="flex gap-[8px] mb-[12px] items-start">
            {/* 欄位選擇 — 自訂下拉 */}
            <MiniSelect
              value={filter.column}
              onChange={(val) => updateFilter(filter.id, 'column', val)}
              options={availableColumns.map(col => ({ value: col.key, label: col.label }))}
              placeholder="選擇欄位"
              className="flex-1 min-w-0"
            />

            {/* 操作符選擇 — 自訂下拉 */}
            <MiniSelect
              value={filter.operator}
              onChange={(val) => updateFilter(filter.id, 'operator', val)}
              options={operatorOptions}
              placeholder="操作符"
              className="w-[100px] shrink-0"
            />

            {/* 值輸入框 */}
            {needsValueInput(filter.operator) && (
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                placeholder="輸入值"
                className="flex-1 min-w-0 h-[36px] px-[10px] rounded-[6px] border border-[rgba(145,158,171,0.2)] font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] outline-none focus:border-[#1D7BF5] transition-colors"
              />
            )}

            {/* 刪除按鈕 */}
            <button
              onClick={() => removeFilter(filter.id)}
              className="w-[36px] h-[36px] shrink-0 flex items-center justify-center rounded-[6px] hover:bg-[rgba(255,86,48,0.08)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="#FF5630" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}

        {/* 新增篩選條件按鈕 */}
        <button
          onClick={addFilter}
          className="w-full h-[36px] flex items-center justify-center gap-[8px] rounded-[6px] border border-dashed border-[rgba(145,158,171,0.3)] hover:border-[#1D7BF5] hover:bg-[rgba(29,123,245,0.04)] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 4.5V13.5M4.5 9H13.5" stroke="#1D7BF5" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1D7BF5]">
            新增篩選條件
          </p>
        </button>
      </div>
      
      {/* 底部按鈕 */}
      <div className="px-[16px] py-[12px] border-t border-[rgba(145,158,171,0.08)] bg-white flex gap-[8px] justify-end">
        <button
          className="px-[16px] py-[8px] rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          取消
        </button>
        <button
          className="px-[16px] py-[8px] rounded-[8px] bg-[#1D7BF5] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#1565C0] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleApply();
          }}
        >
          應用
        </button>
      </div>
    </div>
  );
}
