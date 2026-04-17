import svgCheckboxOn from '@/imports/svg-jk6epzc9me';

interface CheckboxIconProps {
  checked: boolean;
  indeterminate?: boolean;
  onClick?: () => void;
  onChange?: (checked: boolean) => void;
}

/**
 * CheckboxIcon — 統一 Checkbox 元件
 * 使用與 AdvancedOrderTable / TableOrderHead (Figma) 完全相同的 SVG
 *
 * checked=true   → svg-jk6epzc9me p2dde97c0  藍底白勾  fill #005EB8  (Figma checkbox-on)
 * indeterminate  → 藍底白橫線（同尺寸 viewBox）
 * checked=false  → 灰色圓角方框（Figma checkbox-off 對應，16.6667×16.6667 r=3.5）
 */
export function CheckboxIcon({ checked, indeterminate, onClick, onChange }: CheckboxIconProps) {
  const handleClick = () => {
    if (onChange) onChange(!checked);
    else if (onClick) onClick();
  };

  return (
    <div
      className="h-[20px] w-[20px] cursor-pointer flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
      onClick={handleClick}
    >
      {indeterminate ? (
        /* 部分選取：藍底白橫線 */
        <svg width="20" height="20" viewBox="0 0 16.6667 16.6667" fill="none">
          <rect x="0.5" y="0.5" width="15.6667" height="15.6667" rx="3" fill="#005EB8" />
          <path d="M4.5 8.333h7.667" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : checked ? (
        /* 全選：Figma checkbox-on */
        <svg width="20" height="20" viewBox="0 0 16.6667 16.6667" fill="none">
          <path clipRule="evenodd" d={svgCheckboxOn.p2dde97c0} fill="#005EB8" fillRule="evenodd" />
        </svg>
      ) : (
        /* 未選：灰色圓角空框，與 Figma checkbox-off 視覺一致 */
        <svg width="20" height="20" viewBox="0 0 16.6667 16.6667" fill="none">
          <rect x="0.75" y="0.75" width="15.1667" height="15.1667" rx="3" stroke="#919EAB" strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </div>
  );
}