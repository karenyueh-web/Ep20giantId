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
  label: string;
  defaultWidth: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => ReactNode;
}

interface ResizableTableProps {
  columns: ColumnConfig[];
  data: any[];
  storageKey?: string; // 用於 localStorage 保存列寬
  headerClassName?: string;
  rowClassName?: string;
  emptyMessage?: string;
}

export function ResizableTable({
  columns,
  data,
  storageKey,
  headerClassName = 'bg-[#f4f6f8]',
  rowClassName = '',
  emptyMessage = '無資料'
}: ResizableTableProps) {
  // 從 localStorage 載入保存的列寬，或使用默認寬度
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
    // 初始化默認寬度
    const widths: Record<string, number> = {};
    columns.forEach(col => {
      widths[col.key] = col.defaultWidth;
    });
    return widths;
  });

  const [resizing, setResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // 保存列寬到 localStorage
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
      const headerW = measureTextWidth(String(col.label), '600 14px "Public Sans", sans-serif') + 32 + 16;
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
        return 'justify-center text-center';
      case 'right':
        return 'justify-end text-right';
      default:
        return 'justify-start text-left';
    }
  };

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* 表格標題 */}
      <div className={`content-stretch flex items-center overflow-clip relative shrink-0 w-full ${headerClassName}`}>
        {columns.map((column, index) => (
          <div
            key={column.key}
            className="content-stretch flex items-center relative shrink-0"
            style={{ width: `${columnWidths[column.key]}px` }}
          >
            <div className={`content-stretch flex gap-[4px] items-center p-[16px] relative shrink-0 w-full ${getAlignClass(column.align)}`}>
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#637381] text-[14px]">
                {column.label}
              </p>
            </div>
            {/* 拖拽調整器（拖拽 or 雙擊自動最適） */}
            {index < columns.length - 1 && (
              <div
                className="absolute right-0 top-0 bottom-0 w-[8px] cursor-col-resize hover:bg-[#005eb8] hover:bg-opacity-20 z-10 group transition-colors"
                onMouseDown={(e) => handleMouseDown(e, column.key)}
                title="拖拽調整欄位寬度；雙擊自動最適欄寬"
              >
                <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#005eb8] transition-colors" />
              </div>
            )}
          </div>
        ))}
        {/* 填充剩餘空間 */}
        <div className={`content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative ${headerClassName}`}>
          <div className="flex-[1_0_0] min-h-px min-w-px relative">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[4px] items-center p-[16px] w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 表格內容 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-[40px]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381] text-[14px]">
              {emptyMessage}
            </p>
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`h-[76px] relative shrink-0 w-full border-b border-[rgba(145,158,171,0.2)] ${rowClassName}`}
            >
              <div className="content-stretch flex items-center overflow-clip relative size-full">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="content-stretch flex items-center relative shrink-0 overflow-hidden"
                    style={{ width: `${columnWidths[column.key]}px` }}
                  >
                    <div className={`content-stretch flex items-center py-[16px] relative shrink-0 w-full ${getAlignClass(column.align)}`}>
                      <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative shrink-0 w-full overflow-hidden">
                        {column.render ? (
                          column.render(row[column.key], row)
                        ) : (
                          <p 
                            title={typeof row[column.key] === 'string' ? row[column.key] : ''}
                            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] relative text-[#1c252e] text-[14px] w-full overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {row[column.key]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
