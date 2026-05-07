interface CustomCheckboxProps {
  checked: boolean;
  onClick: () => void;
  size?: number;
}

export function CustomCheckbox({ checked, onClick, size = 16 }: CustomCheckboxProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {checked ? (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="2" fill="#1D7BF5"/>
          <path d="M12 5L6.5 10.5L4 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="1.5" fill="#B0B8C1"/>
        </svg>
      )}
    </div>
  );
}