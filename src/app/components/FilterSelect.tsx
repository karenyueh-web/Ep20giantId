import Select from 'react-select';

interface FilterSelectProps {
  placeholder?: string;
  value?: string | null;
  options: { value: string; label: string }[];
  onChange?: (value: string | null) => void;
  isDisabled?: boolean;
  isClearable?: boolean;
}

export function FilterSelect({ 
  placeholder = "選擇...", 
  value, 
  options, 
  onChange,
  isDisabled = false,
  isClearable = true 
}: FilterSelectProps) {
  
  // Filter Select 專用樣式 - 適合用於列表頁面的篩選
  const filterSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: '40px',
      height: '40px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#2196F3' : 'rgba(145, 158, 171, 0.2)',
      borderWidth: '1px',
      boxShadow: 'none',
      backgroundColor: 'white', // 白色背景
      '&:hover': {
        borderColor: state.isFocused ? '#2196F3' : 'rgba(145, 158, 171, 0.4)',
      },
      cursor: 'pointer',
    }),
    valueContainer: (base: any) => ({
      ...base,
      height: '40px',
      padding: '0 14px',
    }),
    input: (base: any) => ({
      ...base,
      margin: '0',
      padding: '0',
      color: '#1c252e',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: '0 10px',
      color: '#637381',
      '&:hover': {
        color: '#1c252e',
      },
    }),
    clearIndicator: (base: any) => ({
      ...base,
      padding: '0 10px',
      color: '#637381',
      '&:hover': {
        color: '#ff5630',
      },
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      marginTop: '4px',
      zIndex: 10,
    }),
    menuList: (base: any) => ({
      ...base,
      padding: '4px',
      maxHeight: '240px',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#2196F3' 
        : state.isFocused 
        ? 'rgba(33, 150, 243, 0.1)' 
        : 'white',
      color: state.isSelected ? 'white' : '#1c252e',
      padding: '10px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontFamily: "'Public_Sans:Regular', sans-serif",
      '&:active': {
        backgroundColor: '#2196F3',
        color: 'white',
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#919eab', // 灰色 placeholder
      fontSize: '14px',
      fontFamily: "'Public_Sans:Regular', sans-serif",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#1c252e',
      fontSize: '14px',
      fontFamily: "'Public_Sans:Regular', sans-serif",
    }),
    noOptionsMessage: (base: any) => ({
      ...base,
      color: '#919eab',
      fontSize: '14px',
      fontFamily: "'Public_Sans:Regular', sans-serif",
      padding: '12px',
    }),
  };

  const selectedOption = value 
    ? options.find(opt => opt.value === value) || null
    : null;

  const handleChange = (option: any) => {
    onChange?.(option?.value || null);
  };

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      styles={filterSelectStyles}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isSearchable={true}
      noOptionsMessage={() => "無符合的選項"}
      className="filter-select"
    />
  );
}