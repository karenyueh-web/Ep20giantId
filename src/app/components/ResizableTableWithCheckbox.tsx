import { useState, useEffect, ReactNode } from 'react';

// ── 測量文字寬度（使用 DOM span，支援中文字型 fallback）──────────────────────
function measureTextWidth(text: string, font = '14px "Public Sans", "Noto Sans JP", sans-serif'): number {
  let el = (measureTextWidth as any)._el as HTMLSpanElement | undefined;
  if (!el) {
    el = document.createElement('span');
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    (measureTextWidth as any)._el = el;
  }
  el.style.font = font;
  el.textContent = text;
  return el.offsetWidth;
}

export interface ColumnConfig {
  key: string;
  label: string | ReactNode;
  defaultWidth: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any, index: number) => ReactNode;
  headerRender?: () => ReactNode;
}

interface ResizableTableWithCheckboxProps {
  columns: ColumnConfig[];
  data: any[];
  storageKey?: string;
  showCheckbox?: boolean;
  selectedIds?: Set<any>;
  onToggleSelect?: (id: any) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  getRowId?: (row: any) => any;
  emptyMessage?: string;
  headerBgColor?: string;
  className?: string;
}

export function ResizableTableWithCheckbox({
  columns,
  data,
  storageKey,
  showCheckbox = false,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected = false,
  getRowId = (row) => row.id,
  emptyMessage = '無資料',
  headerBgColor = 'bg-[#f4f6f8]',
  className = ''
}: ResizableTableWithCheckboxProps) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`table-widths-${storageKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved column widths:', e);
        }
      }
    }
    const widths: Record<string, number> = {};
    columns.forEach(col => {
      widths[col.key] = col.defaultWidth;
    });
    return widths;
  });

  const [resizing, setResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`table-widths-${storageKey}`, JSON.stringify(columnWidths));
    }
  }, [columnWidths, storageKey]);

  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.detail >= 2) {
      // 第二次 mousedown（雙擊的一部分）→ 自動最適欄寬
      const col = columns.find(c => c.key === columnKey);
      if (!col) return;
      const labelText = typeof col.label === 'string' ? col.label : '';
      const headerW = measureTextWidth(labelText, '600 14px "Public Sans", sans-serif') + 32 + 16;
      let maxDataW = 0;
      data.forEach(row => {
        const val = col.render ? '' : String(row[columnKey] ?? '');
        const w = measureTextWidth(val, '14px "Public Sans", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
      const minW = col.minWidth ?? 50;
      const bestFit = Math.max(minW, Math.ceil(Math.max(headerW, maxDataW)));
      setColumnWidths(prev => ({ ...prev, [columnKey]: bestFit }));
      return;
    }
    setResizing(columnKey);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(
        columns.find(col => col.key === resizing)?.minWidth || 50,
        startWidth + diff
      );

      setColumnWidths(prev => ({
        ...prev,
        [resizing]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizing, startX, startWidth, columns]);

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center justify-center';
      case 'right':
        return 'text-right justify-end';
      default:
        return 'text-left justify-start';
    }
  };

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      <table className="w-full border-collapse">
        <thead className={headerBgColor}>
          <tr className="relative">
            {showCheckbox && (
              <th className="relative p-[16px] w-[50px]" style={{ width: '50px' }}>
                {onToggleSelectAll && (
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="w-[18px] h-[18px] cursor-pointer"
                  />
                )}
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={`relative p-[16px] ${getAlignClass(column.align)}`}
                style={{ width: `${columnWidths[column.key]}px`, minWidth: `${columnWidths[column.key]}px` }}
              >
                {column.headerRender ? (
                  column.headerRender()
                ) : (
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px]">
                    {column.label}
                  </p>
                )}
                {index < columns.length - 1 && (
                  <div
                    className="absolute right-0 top-0 bottom-0 w-[8px] cursor-col-resize hover:bg-[#005eb8] hover:bg-opacity-20 z-10 group transition-colors"
                    onMouseDown={(e) => handleMouseDown(e, column.key)}
                    title="拖拽調整欄位寬度；雙擊自動最適欄寬"
                  >
                    <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#005eb8] transition-colors" />
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (showCheckbox ? 1 : 0)} className="text-center py-[40px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381] text-[14px]">
                  {emptyMessage}
                </p>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.has(rowId);
              
              return (
                <tr key={rowId} className="border-b border-[rgba(145,158,171,0.2)] hover:bg-[rgba(0,0,0,0.02)]">
                  {showCheckbox && (
                    <td className="p-[16px] w-[50px]" style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(rowId)}
                        className="w-[18px] h-[18px] cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`p-[16px] overflow-hidden ${getAlignClass(column.align)}`}
                      style={{ width: `${columnWidths[column.key]}px`, minWidth: `${columnWidths[column.key]}px` }}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={typeof row[column.key] === 'string' ? row[column.key] : ''}>
                        {column.render ? (
                          column.render(row[column.key], row, rowIndex)
                        ) : (
                          <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">
                            {row[column.key]}
                          </p>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
