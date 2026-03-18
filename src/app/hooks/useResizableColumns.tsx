import { useState, useEffect, useCallback } from 'react';

interface ColumnWidthConfig {
  [key: string]: number;
}

export function useResizableColumns(
  initialWidths: ColumnWidthConfig,
  storageKey?: string
) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidthConfig>(() => {
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
    return initialWidths;
  });

  const [resizing, setResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // 保存到 localStorage
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`table-widths-${storageKey}`, JSON.stringify(columnWidths));
    }
  }, [columnWidths, storageKey]);

  // 開始調整大小
  const startResize = useCallback((e: React.MouseEvent, columnKey: string, minWidth: number = 50) => {
    e.preventDefault();
    setResizing(columnKey);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey]);
  }, [columnWidths]);

  // 處理鼠標移動和釋放
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);

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
  }, [resizing, startX, startWidth]);

  // 生成調整器組件
  const ResizeHandle = useCallback(({ columnKey }: { columnKey: string }) => (
    <div
      className="absolute right-0 top-0 bottom-0 w-[8px] cursor-col-resize hover:bg-[#005eb8] hover:bg-opacity-20 z-10 group transition-colors"
      onMouseDown={(e) => startResize(e, columnKey)}
      title="拖拽調整欄位寬度"
    >
      <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#005eb8] transition-colors" />
    </div>
  ), [startResize]);

  return {
    columnWidths,
    ResizeHandle,
    isResizing: resizing !== null
  };
}
