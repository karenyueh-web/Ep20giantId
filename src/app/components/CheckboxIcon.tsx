import svgPaths from '@/imports/svg-vcni536e4m';

interface CheckboxIconProps {
  checked: boolean;
  onClick?: () => void;
  onChange?: (checked: boolean) => void;
}

export function CheckboxIcon({ checked, onClick, onChange }: CheckboxIconProps) {
  return (
    <div 
      className="h-[20px] w-[20px] cursor-pointer flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
      onClick={() => {
        if (onChange) {
          onChange(!checked);
        } else if (onClick) {
          onClick();
        }
      }}
    >
      {/* viewBox 裁切至 x=30~50 的 checkbox 圖形區域，確保圖示完整置中 */}
      <svg className="block" width="20" height="20" fill="none" viewBox="30 0 20 20">
        <g>
          <path 
            d={svgPaths.p35ca120} 
            fill={checked ? '#1D7BF5' : '#919EAB'} 
          />
        </g>
      </svg>
    </div>
  );
}