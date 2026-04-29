import type { ReactNode, CSSProperties } from 'react';

// ── 共用 Cell 基礎樣式 ────────────────────────────────────────────────────────
// 統一管控行高、字級、padding、字型、文字顏色等基礎表格樣式。
// 各頁面的特殊渲染（Badge、連結、彩色文字等）透過 children 傳入。

interface TableCellProps {
  /** 欄位寬度（px） */
  width: number;
  /** 自訂內容（不傳則顯示 children 純文字） */
  children?: ReactNode;
  /** 額外 className */
  className?: string;
  /** 額外 inline style */
  style?: CSSProperties;
  /** 是否為最後一欄（不顯示右邊分隔線） */
  isLast?: boolean;
  /** 點擊事件 */
  onClick?: () => void;
}

export function TableCell({
  width,
  children,
  className = '',
  style,
  isLast = false,
  onClick,
}: TableCellProps) {
  return (
    <div
      className={`h-[52px] flex items-center px-[16px] shrink-0 ${
        isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'
      } ${className}`}
      style={{ width, ...style }}
      onClick={onClick}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] truncate w-full">
          {children}
        </p>
      ) : (
        children
      )}
    </div>
  );
}
