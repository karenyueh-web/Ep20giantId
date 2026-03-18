import { useState } from 'react';

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
  onApply: () => void;
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

export function FilterDialog({
  filters,
  availableColumns,
  onFiltersChange,
  onClose,
  onApply
}: FilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<FilterCondition[]>(
    filters.length > 0 ? filters : [{ id: Date.now().toString(), column: '', operator: 'contains', value: '' }]
  );

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: '',
      operator: 'contains',
      value: ''
    };
    const updated = [...localFilters, newFilter];
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const removeFilter = (id: string) => {
    const updated = localFilters.filter(f => f.id !== id);
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const updateFilter = (id: string, field: keyof FilterCondition, value: string) => {
    const updated = localFilters.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    );
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const needsValueInput = (operator: string) => {
    return operator !== 'isEmpty' && operator !== 'isNotEmpty';
  };

  return (
    <div 
      className="relative bg-white rounded-[8px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-[480px] max-h-[500px] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 標題 */}
      <div className="px-[16px] py-[12px] border-b border-[rgba(145,158,171,0.08)]">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#1c252e] text-[14px]">
          進階篩選 ({localFilters.filter(f => f.column && f.operator).length})
        </p>
      </div>
      
      {/* 篩選條件列表 */}
      <div className="overflow-y-auto custom-scrollbar flex-1 p-[16px]">
        {localFilters.map((filter, index) => (
          <div key={filter.id} className="flex gap-[8px] mb-[12px] items-start">
            {/* 欄位選擇 */}
            <select
              value={filter.column}
              onChange={(e) => updateFilter(filter.id, 'column', e.target.value)}
              className="flex-1 h-[36px] px-[12px] rounded-[6px] border border-[rgba(145,158,171,0.2)] font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] outline-none focus:border-[#1D7BF5]"
            >
              <option value="">選擇欄位</option>
              {availableColumns.map(col => (
                <option key={col.key} value={col.key}>{col.label}</option>
              ))}
            </select>

            {/* 操作符選擇 */}
            <select
              value={filter.operator}
              onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
              className="w-[120px] h-[36px] px-[12px] rounded-[6px] border border-[rgba(145,158,171,0.2)] font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] outline-none focus:border-[#1D7BF5]"
            >
              {operatorOptions.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>

            {/* 值輸入框 */}
            {needsValueInput(filter.operator) && (
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                placeholder="輸入值"
                className="flex-1 h-[36px] px-[12px] rounded-[6px] border border-[rgba(145,158,171,0.2)] font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] outline-none focus:border-[#1D7BF5]"
              />
            )}

            {/* 刪除按鈕 */}
            <button
              onClick={() => removeFilter(filter.id)}
              className="w-[36px] h-[36px] flex items-center justify-center rounded-[6px] hover:bg-[rgba(255,86,48,0.08)] transition-colors"
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
            onApply();
          }}
        >
          應用
        </button>
      </div>
    </div>
  );
}
