import svgPaths from '@/imports/svg-xef74bw57v';

interface VendorCheckboxProps {
  checked: boolean;
  onClick: () => void;
}

export function VendorCheckbox({ checked, onClick }: VendorCheckboxProps) {
  return (
    <div 
      onClick={onClick}
      className="w-[20px] h-[20px] cursor-pointer inline-flex items-center justify-center"
    >
      {checked ? (
        <svg className="w-full h-full" viewBox="0 0 20 20" fill="none" preserveAspectRatio="xMidYMid meet">
          <path d="M5 0C2.23858 0 0 2.23858 0 5V15C0 17.7614 2.23858 20 5 20H15C17.7614 20 20 17.7614 20 15V5C20 2.23858 17.7614 0 15 0H5ZM14.6152 7.25488C14.2753 6.9149 13.715 6.91494 13.375 7.25488L9.2451 11.3848L7.4951 9.63477C7.1551 9.29484 6.5949 9.29484 6.2549 9.63477C5.9149 9.97475 5.9149 10.525 6.2549 10.875L8.6348 13.2451C8.8048 13.4151 9.0251 13.4951 9.2451 13.4951C9.4751 13.4951 9.6953 13.4151 9.8652 13.2451L14.6152 8.49512C14.9552 8.15513 14.9552 7.60487 14.6152 7.25488Z" fill="#1D7BF5" />
        </svg>
      ) : (
        <svg className="w-full h-full" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="1" width="18" height="18" rx="4" fill="#919EAB"/>
        </svg>
      )}
    </div>
  );
}