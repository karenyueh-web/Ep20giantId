import { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

// ── 共用表頭欄位介面 ──────────────────────────────────────────────────────────
export interface ColumnDef {
  key: string;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

// ── DraggableColumnHeader Props ──────────────────────────────────────────────
interface DraggableColumnHeaderProps {
  /** 欄位定義 */
  column: ColumnDef;
  /** 欄位在可見列表中的 index */
  index: number;
  /** 拖放排序回呼 */
  moveColumn: (dragKey: string, hoverKey: string) => void;
  /** 更新欄寬回呼 */
  updateColumnWidth: (key: string, width: number) => void;
  /** 雙擊自動最適欄寬回呼 */
  autoFitWidth: (key: string) => void;
  /** 排序設定 */
  sortConfig: { key: string | null; direction: 'asc' | 'desc' | null };
  /** 排序回呼 */
  onSort: (key: string) => void;
  /** 是否為最後一欄（最後一欄不顯示右邊 resize handle） */
  isLast?: boolean;
  /** 此欄是否正在被 filter 篩選（高亮為淺黃色） */
  isFiltered?: boolean;
  /** react-dnd 的 drag type，預設 'table-column' */
  dragType?: string;
}

// ── 共用 DraggableColumnHeader ──────────────────────────────────────────────
export function DraggableColumnHeader({
  column,
  index,
  moveColumn,
  updateColumnWidth,
  autoFitWidth,
  sortConfig,
  onSort,
  isLast = false,
  isFiltered = false,
  dragType = 'table-column',
}: DraggableColumnHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  // ── 自製 resize drag（可靠且支持 dblclick） ──
  const [resizing, setResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.current;
      const newW = Math.max(column.minWidth, resizeStartW.current + diff);
      updateColumnWidth(column.key, newW);
    };
    const onUp = () => setResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizing, column.minWidth, column.key, updateColumnWidth]);

  const [{ isDragging }, drag] = useDrag({
    type: dragType,
    item: () => ({ columnKey: column.key, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: dragType,
    hover: (item: { columnKey: string; index: number }) => {
      if (item.index !== index) {
        moveColumn(item.columnKey, column.key);
        item.index = index;
      }
    },
  });

  const isSorted = sortConfig.key === column.key;
  const sortDirection = isSorted ? sortConfig.direction : null;

  return (
    <div
      className={`relative shrink-0 ${isFiltered ? 'bg-[#fff8e1]' : 'bg-[#f4f6f8]'} ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
      style={{ width: column.width, height: 56 }}
    >
      <div
        ref={(node) => drag(drop(node))}
        className={`h-full flex items-center justify-start px-[16px] cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).tagName === 'P' ||
            (e.target as HTMLElement).tagName === 'svg' ||
            (e.target as HTMLElement).tagName === 'path'
          ) {
            onSort(column.key);
          }
        }}
      >
        {/* 6-dot drag handle（hover 顯示） */}
        {isHovered && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-[6px] shrink-0">
            <circle cx="5" cy="3" r="1.5" fill="#919EAB" />
            <circle cx="11" cy="3" r="1.5" fill="#919EAB" />
            <circle cx="5" cy="8" r="1.5" fill="#919EAB" />
            <circle cx="11" cy="8" r="1.5" fill="#919EAB" />
            <circle cx="5" cy="13" r="1.5" fill="#919EAB" />
            <circle cx="11" cy="13" r="1.5" fill="#919EAB" />
          </svg>
        )}

        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap">
          {column.label}
        </p>

        {sortDirection && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[6px] shrink-0">
            {sortDirection === 'asc' ? (
              <path d="M8 3L12 7H4L8 3Z" fill="#637381" />
            ) : (
              <path d="M8 13L4 9H12L8 13Z" fill="#637381" />
            )}
          </svg>
        )}
      </div>

      {/* 欄寬調整 handle：拖拽調寬 或 雙擊自動最適 */}
      {!isLast && (
        <div
          className="absolute right-0 top-0 bottom-0 w-[8px] cursor-col-resize hover:bg-[#1D7BF5] hover:bg-opacity-20 z-10 group transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.detail >= 2) {
              autoFitWidth(column.key);
              return;
            }
            setResizing(true);
            resizeStartX.current = e.clientX;
            resizeStartW.current = column.width;
          }}
          title="拖拽調整欄位寬度；雙擊自動最適欄寬"
        >
          <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#1D7BF5] transition-colors" />
        </div>
      )}
    </div>
  );
}
