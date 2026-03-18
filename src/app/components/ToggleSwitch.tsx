interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ checked = false, onChange, disabled = false }: ToggleSwitchProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <button
      type="button"
      className={`relative inline-flex h-[22px] w-[40px] shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      style={{ backgroundColor: checked ? '#22c55e' : '#919EAB' }}
      onClick={handleToggle}
      title={checked ? '啟用中 - 點擊停用' : '已停用 - 點擊啟用'}
    >
      <span
        className="pointer-events-none inline-block size-[18px] rounded-full bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-in-out"
        style={{
          transform: checked ? 'translate(20px, 2px)' : 'translate(2px, 2px)',
        }}
      />
    </button>
  );
}