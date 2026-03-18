// 共用的 Column Selector 組件

interface ColumnSelectorProps {
  columns: any[];
  onToggleColumn: (key: string) => void;
  onToggleAll?: (selectAll: boolean) => void;
  onClose: () => void;
  onApply: () => void;
}

export function ColumnSelector({ 
  columns, 
  onToggleColumn, 
  onToggleAll,
  onClose,
  onApply
}: ColumnSelectorProps) {
  const visibleCount = columns.filter(col => col.visible !== false).length;
  const allSelected = visibleCount === columns.length;
  
  return (
    <div 
      className="relative bg-white rounded-[8px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-[280px] max-h-[450px] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 標題 */}
      <div className="px-[16px] py-[12px] border-b border-[rgba(145,158,171,0.08)] flex items-center justify-between">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#1c252e] text-[14px]">
          顯示欄位 ({visibleCount}/{columns.length})
        </p>
        <button
          className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1D7BF5] hover:text-[#1565C0] transition-colors px-[4px]"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleAll) {
              onToggleAll(!allSelected);
            }
          }}
        >
          all
        </button>
      </div>
      
      {/* 欄位列表 */}
      <div className="overflow-y-auto custom-scrollbar flex-1">
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex items-center px-[16px] py-[12px] hover:bg-[rgba(145,158,171,0.04)] cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggleColumn(column.key);
            }}
          >
            {/* 自定義 Checkbox */}
            <div 
              className="flex items-center justify-center w-[20px] h-[20px] rounded-[4px] border-2 border-[rgba(145,158,171,0.3)] mr-[12px] shrink-0"
              style={{ 
                backgroundColor: column.visible !== false ? '#1D7BF5' : 'white',
                borderColor: column.visible !== false ? '#1D7BF5' : 'rgba(145,158,171,0.3)'
              }}
            >
              {column.visible !== false && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#1c252e] text-[14px] flex-1">
              {column.label.replace(/\(Z2QB\)/g, '').trim()}
            </p>
          </div>
        ))}
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