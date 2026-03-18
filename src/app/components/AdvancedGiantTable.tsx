import { useState, useCallback, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';

// 完全保留原有的 8 個欄位
type GiantColumnKey = 'account' | 'name' | 'role' | 'sapAccount' | 'purchaseOrg' | 'purchaseGroup' | 'status' | 'email';

interface Column {
  key: GiantColumnKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

// 保留原有的巨大帳號資料型別
interface GiantAccount {
  id: string;
  account: string;
  name: string;
  role: string;
  sapAccount: string;
  purchaseOrg: string;
  purchaseGroup: string;
  status: 'active' | 'inactive';
  email: string;
}

interface AdvancedGiantTableProps {
  data: GiantAccount[];
  onAccountClick?: (account: GiantAccount) => void;
  userEmail?: string;
  appliedFilters?: FilterCondition[];
  columnsVersion?: number; // 新增：用於強制重新載入欄位
}

const DraggableColumnHeader = ({ 
  column, 
  index, 
  moveColumn, 
  updateColumnWidth,
  sortConfig,
  onSort,
  isLast
}: { 
  column: Column; 
  index: number; 
  moveColumn: (dragKey: GiantColumnKey, hoverKey: GiantColumnKey) => void;
  updateColumnWidth: (key: GiantColumnKey, width: number) => void;
  sortConfig: { key: GiantColumnKey | null; direction: 'asc' | 'desc' | null };
  onSort: (key: GiantColumnKey) => void;
  isLast?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'column',
    item: () => ({ columnKey: column.key, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'column',
    hover: (item: { columnKey: GiantColumnKey; index: number }) => {
      if (item.index !== index) {
        moveColumn(item.columnKey, column.key);
        item.index = index;
      }
    },
  });

  const isSorted = sortConfig.key === column.key;
  const sortDirection = isSorted ? sortConfig.direction : null;

  return (
    <Resizable
      size={{ width: column.width, height: 56 }}
      minWidth={column.minWidth}
      maxWidth={800}
      enable={{ right: true }}
      onResizeStop={(e, direction, ref, d) => {
        updateColumnWidth(column.key, column.width + d.width);
      }}
      handleStyles={{
        right: {
          width: '4px',
          right: '0',
          cursor: 'col-resize',
          background: 'transparent',
          zIndex: 1,
        },
      }}
      handleClasses={{
        right: 'hover:bg-[#1D7BF5] transition-colors',
      }}
      className={`bg-[#f4f6f8] ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
    >
      <div
        ref={(node) => drag(drop(node))}
        className={`h-full flex items-center justify-start px-[16px] cursor-pointer ${
          isDragging ? 'opacity-50' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'P' || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'path') {
            onSort(column.key);
          }
        }}
      >
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
    </Resizable>
  );
};

export function AdvancedGiantTable({ 
  data,
  onAccountClick,
  userEmail = 'default',
  appliedFilters,
  columnsVersion
}: AdvancedGiantTableProps) {
  // 水平拖拽滾動
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // 保留原有的 8 個欄位定義
  const defaultColumns: Column[] = [
    { key: 'account', label: '員工帳號', width: 150, minWidth: 100 },
    { key: 'name', label: '員工姓名', width: 180, minWidth: 120 },
    { key: 'role', label: '角色', width: 100, minWidth: 80 },
    { key: 'sapAccount', label: 'SAP帳號', width: 150, minWidth: 120 },
    { key: 'purchaseOrg', label: '採購組織', width: 200, minWidth: 150 },
    { key: 'purchaseGroup', label: '採購群組', width: 140, minWidth: 100 },
    { key: 'status', label: '狀態', width: 100, minWidth: 80 },
    { key: 'email', label: 'mail', width: 200, minWidth: 150 },
  ];

  // 生成 localStorage key
  const getStorageKey = () => {
    return `giantAccount_${userEmail}_giant_columns`;
  };

  // 從 localStorage 載入欄位設定
  const loadColumnsFromStorage = useCallback((): Column[] => {
    const storageKey = getStorageKey();
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedColumns = JSON.parse(saved) as Column[];
        if (savedColumns.length === defaultColumns.length) {
          return savedColumns;
        }
      }
    } catch (error) {
      console.error('Failed to load columns from storage:', error);
    }
    
    return defaultColumns;
  }, [userEmail]);

  // 儲存欄位設定到 localStorage
  const saveColumnsToStorage = (cols: Column[]) => {
    const storageKey = getStorageKey();
    try {
      localStorage.setItem(storageKey, JSON.stringify(cols));
    } catch (error) {
      console.error('Failed to save columns to storage:', error);
    }
  };

  const [columns, setColumns] = useState<Column[]>(() => loadColumnsFromStorage());
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: GiantColumnKey | null; direction: 'asc' | 'desc' | null }>({ 
    key: null, 
    direction: null 
  });

  // 當 columnsVersion 變化時，重新載入欄位設定
  useEffect(() => {
    if (columnsVersion !== undefined && columnsVersion > 0) {
      const newColumns = loadColumnsFromStorage();
      setColumns(newColumns);
    }
  }, [columnsVersion, loadColumnsFromStorage]);

  // 當欄位變更時儲存到 localStorage
  useEffect(() => {
    if (!isLoadingFromStorage) {
      saveColumnsToStorage(columns);
    }
  }, [columns, userEmail]);

  const moveColumn = useCallback((dragKey: GiantColumnKey, hoverKey: GiantColumnKey) => {
    setColumns((prevColumns) => {
      const dragIndex = prevColumns.findIndex(col => col.key === dragKey);
      const hoverIndex = prevColumns.findIndex(col => col.key === hoverKey);
      const newColumns = [...prevColumns];
      const [removed] = newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, removed);
      return newColumns;
    });
  }, []);

  const updateColumnWidth = useCallback((key: GiantColumnKey, width: number) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const index = newColumns.findIndex(col => col.key === key);
      newColumns[index] = { ...newColumns[index], width };
      return newColumns;
    });
  }, []);

  // 篩選可見的欄位
  const visibleColumns = columns.filter(col => col.visible !== false);

  // 進階篩選
  const filteredAccounts = data.filter(account => {
    if (!appliedFilters || appliedFilters.length === 0) return true;
    
    return appliedFilters.every(filter => {
      const accountValue = account[filter.column as keyof GiantAccount];
      const filterValue = filter.value;
      const valueToCheck = String(accountValue || '');
      
      switch (filter.operator) {
        case 'contains':
          return valueToCheck.toLowerCase().includes(filterValue.toLowerCase());
        
        case 'equals':
          return valueToCheck.toLowerCase() === filterValue.toLowerCase();
        
        case 'notEquals':
          return valueToCheck.toLowerCase() !== filterValue.toLowerCase();
        
        case 'startsWith':
          return valueToCheck.toLowerCase().startsWith(filterValue.toLowerCase());
        
        case 'endsWith':
          return valueToCheck.toLowerCase().endsWith(filterValue.toLowerCase());
        
        case 'isEmpty':
          return !valueToCheck || valueToCheck.trim() === '';
        
        case 'isNotEmpty':
          return valueToCheck && valueToCheck.trim() !== '';
        
        default:
          return true;
      }
    });
  });

  // 排序函數
  const sortedAccounts = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredAccounts;
    }

    const sorted = [...filteredAccounts].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const aStr = String(aValue);
      const bStr = String(bValue);

      const comparison = aStr.localeCompare(bStr, 'zh-Hans-CN', { sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredAccounts, sortConfig]);

  const getCellValue = (account: GiantAccount, key: GiantColumnKey) => {
    const value = account[key];
    
    if (key === 'account') {
      return (
        <button 
          className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] underline cursor-pointer truncate hover:opacity-70 transition-opacity text-left"
          onClick={() => onAccountClick && onAccountClick(account)}
          title={String(value)}
        >
          {value}
        </button>
      );
    }
    
    if (key === 'status') {
      return (
        <div className={`content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0 ${
          value === 'active' ? 'bg-[rgba(34,197,94,0.16)]' : 'bg-[rgba(255,86,48,0.16)]'
        }`}>
          <p className={`font-['Public_Sans:Bold','Noto_Sans_SC:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[12px] text-center ${
            value === 'active' ? 'text-[#118d57]' : 'text-[#b71d18]'
          }`}>{value === 'active' ? '啟用' : '停用'}</p>
        </div>
      );
    }
    
    return (
      <p 
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] truncate w-full"
        title={String(value || '-')}
      >
        {value || '-'}
      </p>
    );
  };

  const totalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* 表格容器 - 支持横向滚动 */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表头 */}
            <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleColumns.map((column, index) => (
                <DraggableColumnHeader
                  key={column.key}
                  column={column}
                  index={index}
                  moveColumn={moveColumn}
                  updateColumnWidth={updateColumnWidth}
                  sortConfig={sortConfig}
                  onSort={(key) => {
                    let direction: 'asc' | 'desc' | null = 'asc';
                    if (sortConfig.key === key && sortConfig.direction === 'asc') {
                      direction = 'desc';
                    }
                    setSortConfig({ key, direction });
                  }}
                  isLast={index === visibleColumns.length - 1}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 表格数据 */}
            {sortedAccounts.map((account) => (
              <div 
                key={account.id} 
                className="flex border-b border-[rgba(145,158,171,0.08)] min-h-[76px] hover:bg-[rgba(145,158,171,0.04)]"
              >
                {visibleColumns.map((column, colIndex) => {
                  const isLastCol = colIndex === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${account.id}-${column.key}`}
                      style={isLastCol 
                        ? { minWidth: column.width, flex: 1 } 
                        : { width: column.width }}
                      className={`flex items-center justify-start px-[16px] py-[16px] ${isLastCol ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} overflow-hidden`}
                    >
                      {getCellValue(account, column.key)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

// 導出 columns 供 parent 使用
export const getGiantAccountColumns = (): Column[] => [
  { key: 'account', label: '員工帳號', width: 150, minWidth: 100 },
  { key: 'name', label: '員工姓名', width: 180, minWidth: 120 },
  { key: 'role', label: '角色', width: 100, minWidth: 80 },
  { key: 'sapAccount', label: 'SAP帳號', width: 150, minWidth: 120 },
  { key: 'purchaseOrg', label: '採購組織', width: 200, minWidth: 150 },
  { key: 'purchaseGroup', label: '採購群組', width: 140, minWidth: 100 },
  { key: 'status', label: '狀態', width: 100, minWidth: 80 },
  { key: 'email', label: 'mail', width: 200, minWidth: 150 },
];