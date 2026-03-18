import { useState, useCallback, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';
import { CheckboxIcon } from './CheckboxIcon';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';

// 完全保留原有的 11 個欄位
type MailSettingColumnKey = 'vendorCode' | 'purchaseOrg' | 'all' | 'smallPlatform' | 'newOrder' | 'correction' | 'paperInvoice' | 'shipping' | 'priceAbnormal' | 'partsMaintenance' | 'sample';

interface Column {
  key: MailSettingColumnKey;
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

// 郵件接收設定資料型別
interface MailSettingData {
  id: string;
  vendorCode: string;
  purchaseOrg: string;
  all: boolean;
  smallPlatform: boolean;
  newOrder: boolean;
  correction: boolean;
  paperInvoice: boolean;
  shipping: boolean;
  priceAbnormal: boolean;
  partsMaintenance: boolean;
  sample: boolean;
}

interface AdvancedMailSettingsTableProps {
  data: MailSettingData[];
  onCheckboxChange?: (id: string, field: MailSettingColumnKey, value: boolean) => void;
  userEmail?: string;
  appliedFilters?: FilterCondition[];
  columnsVersion?: number;
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
  moveColumn: (dragKey: MailSettingColumnKey, hoverKey: MailSettingColumnKey) => void;
  updateColumnWidth: (key: MailSettingColumnKey, width: number) => void;
  sortConfig: { key: MailSettingColumnKey | null; direction: 'asc' | 'desc' | null };
  onSort: (key: MailSettingColumnKey) => void;
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
    hover: (item: { columnKey: MailSettingColumnKey; index: number }) => {
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

export function AdvancedMailSettingsTable({ 
  data,
  onCheckboxChange,
  userEmail = 'default',
  appliedFilters,
  columnsVersion
}: AdvancedMailSettingsTableProps) {
  // 水平拖拽滾動
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // 保留原有的 11 個欄位定義
  const defaultColumns: Column[] = [
    { key: 'vendorCode', label: '廠商編號', width: 150, minWidth: 100 },
    { key: 'purchaseOrg', label: '採購組織', width: 120, minWidth: 80 },
    { key: 'all', label: 'ALL', width: 80, minWidth: 60 },
    { key: 'smallPlatform', label: '小平台', width: 80, minWidth: 60 },
    { key: 'newOrder', label: '新訂單', width: 80, minWidth: 60 },
    { key: 'correction', label: '修正單通知', width: 100, minWidth: 80 },
    { key: 'paperInvoice', label: '紙本發票', width: 80, minWidth: 60 },
    { key: 'shipping', label: '出貨通知', width: 80, minWidth: 60 },
    { key: 'priceAbnormal', label: '單價異常', width: 80, minWidth: 60 },
    { key: 'partsMaintenance', label: '零件維護', width: 80, minWidth: 60 },
    { key: 'sample', label: '索樣單', width: 80, minWidth: 60 },
  ];

  // 生成 localStorage key
  const getStorageKey = () => {
    return `mailSettings_${userEmail}_columns`;
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
  const [sortConfig, setSortConfig] = useState<{ key: MailSettingColumnKey | null; direction: 'asc' | 'desc' | null }>({ 
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

  const moveColumn = useCallback((dragKey: MailSettingColumnKey, hoverKey: MailSettingColumnKey) => {
    setColumns((prevColumns) => {
      const dragIndex = prevColumns.findIndex(col => col.key === dragKey);
      const hoverIndex = prevColumns.findIndex(col => col.key === hoverKey);
      const newColumns = [...prevColumns];
      const [removed] = newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, removed);
      return newColumns;
    });
  }, []);

  const updateColumnWidth = useCallback((key: MailSettingColumnKey, width: number) => {
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
  const filteredData = data.filter(item => {
    if (!appliedFilters || appliedFilters.length === 0) return true;
    
    return appliedFilters.every(filter => {
      const itemValue = item[filter.column as keyof MailSettingData];
      const filterValue = filter.value;
      const valueToCheck = String(itemValue || '');
      
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
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortConfig.direction === 'asc' 
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const aStr = String(aValue);
      const bStr = String(bValue);

      const comparison = aStr.localeCompare(bStr, 'zh-Hans-CN', { sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const getCellValue = (item: MailSettingData, key: MailSettingColumnKey) => {
    const value = item[key];
    
    // Checkbox 欄位
    if (['all', 'smallPlatform', 'newOrder', 'correction', 'paperInvoice', 'shipping', 'priceAbnormal', 'partsMaintenance', 'sample'].includes(key)) {
      return (
        <div className="flex items-center justify-center">
          <CheckboxIcon 
            checked={value as boolean} 
            onChange={(checked) => onCheckboxChange && onCheckboxChange(item.id, key, checked)}
          />
        </div>
      );
    }
    
    // 文字欄位
    return (
      <p 
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] truncate w-full"
        title={String(value || '-')}
      >
        {value || '-'}
      </p>
    );
  };

  const checkboxKeys: MailSettingColumnKey[] = ['all', 'smallPlatform', 'newOrder', 'correction', 'paperInvoice', 'shipping', 'priceAbnormal', 'partsMaintenance', 'sample'];

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
            {sortedData.map((item) => (
              <div 
                key={item.id} 
                className="flex border-b border-[rgba(145,158,171,0.08)] min-h-[76px] hover:bg-[rgba(145,158,171,0.04)]"
              >
                {visibleColumns.map((column, colIndex) => {
                  const isLastCol = colIndex === visibleColumns.length - 1;
                  const isCheckbox = checkboxKeys.includes(column.key);
                  return (
                    <div
                      key={`${item.id}-${column.key}`}
                      style={isLastCol 
                        ? { minWidth: column.width, flex: 1 } 
                        : { width: column.width }}
                      className={`flex items-center ${isCheckbox ? 'justify-center' : 'justify-start'} px-[16px] py-[16px] ${isLastCol ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} overflow-hidden`}
                    >
                      {getCellValue(item, column.key)}
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
export const getMailSettingsColumns = (): Column[] => [
  { key: 'vendorCode', label: '廠商編號', width: 150, minWidth: 100 },
  { key: 'purchaseOrg', label: '採購組織', width: 120, minWidth: 80 },
  { key: 'all', label: 'ALL', width: 80, minWidth: 60 },
  { key: 'smallPlatform', label: '小平台', width: 80, minWidth: 60 },
  { key: 'newOrder', label: '新訂單', width: 80, minWidth: 60 },
  { key: 'correction', label: '修正單通知', width: 100, minWidth: 80 },
  { key: 'paperInvoice', label: '紙本發票', width: 80, minWidth: 60 },
  { key: 'shipping', label: '出貨通知', width: 80, minWidth: 60 },
  { key: 'priceAbnormal', label: '單價異常', width: 80, minWidth: 60 },
  { key: 'partsMaintenance', label: '零件維護', width: 80, minWidth: 60 },
  { key: 'sample', label: '索樣單', width: 80, minWidth: 60 },
];