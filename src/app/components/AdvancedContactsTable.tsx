import { useState, useCallback, useEffect, useMemo , useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToggleSwitch } from './ToggleSwitch';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';

// 完全保留原有的 8 個欄位
type ContactColumnKey = 'name' | 'role' | 'priority' | 'purchaseOrg' | 'emailEnabled' | 'email' | 'phone' | 'remark';

interface Column {
  key: ContactColumnKey;
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

// 保留原有的聯絡人資料型別 - 完全的 8 個欄位
interface Contact {
  name: string;
  role: string;
  priority: string;
  purchaseOrg: string;
  emailEnabled: boolean;
  email: string;
  phone: string;
  remark: string;
}

interface AdvancedContactsTableProps {
  data: Contact[];
  onContactClick?: (name: string) => void;
  onToggleChange?: (name: string, enabled: boolean) => void;
  userEmail?: string;
  appliedFilters?: FilterCondition[];
  columnsVersion?: number; // 新增：用於強制重新載入欄位
}




export function AdvancedContactsTable({ 
  data,
  onContactClick,
  onToggleChange,
  userEmail = 'default',
  appliedFilters,
  columnsVersion
}: AdvancedContactsTableProps) {
  // 水平拖拽滾動
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // 保留原有的 8 個欄位定義
  const defaultColumns: Column[] = [
    { key: 'name', label: '業務姓名', width: 150, minWidth: 100 },
    { key: 'role', label: '業務角色', width: 120, minWidth: 80 },
    { key: 'priority', label: '寄信優先序', width: 140, minWidth: 100 },
    { key: 'purchaseOrg', label: '採購組織', width: 200, minWidth: 150 },
    { key: 'emailEnabled', label: '啟用寄信', width: 100, minWidth: 90 },
    { key: 'email', label: 'mail', width: 200, minWidth: 150 },
    { key: 'phone', label: '電話', width: 150, minWidth: 100 },
    { key: 'remark', label: '備註', width: 180, minWidth: 120 },
  ];

  // 生成 localStorage key
  const getStorageKey = () => {
    return `contacts_${userEmail}_contacts_columns`;
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
  const [sortConfig, setSortConfig] = useState<{ key: ContactColumnKey | null; direction: 'asc' | 'desc' | null }>({ 
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

  const moveColumn = useCallback((dragKey: ContactColumnKey, hoverKey: ContactColumnKey) => {
    setColumns((prevColumns) => {
      const dragIndex = prevColumns.findIndex(col => col.key === dragKey);
      const hoverIndex = prevColumns.findIndex(col => col.key === hoverKey);
      const newColumns = [...prevColumns];
      const [removed] = newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, removed);
      return newColumns;
    });
  }, []);

  const updateColumnWidth = useCallback((key: ContactColumnKey, width: number) => {
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
  const filteredContacts = data.filter(contact => {
    if (!appliedFilters || appliedFilters.length === 0) return true;
    
    return appliedFilters.every(filter => {
      const contactValue = contact[filter.column as keyof Contact];
      const filterValue = filter.value;
      
      let valueToCheck = '';
      if (filter.column === 'emailEnabled') {
        valueToCheck = contactValue ? 'true' : 'false';
      } else {
        valueToCheck = String(contactValue || '');
      }
      
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
  const sortedContacts = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredContacts;
    }

    const sorted = [...filteredContacts].sort((a, b) => {
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
  }, [filteredContacts, sortConfig]);

  const getCellValue = (contact: Contact, key: ContactColumnKey) => {
    const value = contact[key];
    
    if (key === 'name') {
      return (
        <button 
          className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] underline cursor-pointer truncate hover:opacity-70 transition-opacity text-left"
          onClick={() => onContactClick && onContactClick(contact.name)}
          title={String(value)}
        >
          {value}
        </button>
      );
    }
    
    if (key === 'emailEnabled') {
      return (
        <div className="flex items-center justify-center">
          <ToggleSwitch
            checked={value as boolean}
            onChange={(enabled) => onToggleChange && onToggleChange(contact.name, enabled)}
          />
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


// ── 雙擊自動最適欄寬 ───────────────────────────────────────────────────────
  const autoFitWidth = (key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const labelText = typeof col.label === 'string' ? col.label : '';
    const headerW = measureTextWidth(labelText, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 32 + 16;
    let maxDataW = 0;
    try {
      (data || []).forEach((row: any) => {
        const raw = String(row[key] ?? '');
        const w = measureTextWidth(raw, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
    } catch { /* data may not be available */ }
    const bestFit = Math.max(col.minWidth ?? 50, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  };
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
                  autoFitWidth={autoFitWidth}
                  sortConfig={sortConfig}
                  onSort={(key) => {
                    let direction: 'asc' | 'desc' | null = 'asc';
                    if (sortConfig.key === key && sortConfig.direction === 'asc') {
                      direction = 'desc';
                    }
                    setSortConfig({ key, direction });
                  }}
                  isLast={index === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === column.key)}
                  dragType="contacts-column"
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 表格数据 */}
            {sortedContacts.map((contact, idx) => (
              <div 
                key={`${contact.name}-${idx}`} 
                className="flex border-b border-[rgba(145,158,171,0.08)] min-h-[76px] hover:bg-[rgba(145,158,171,0.04)]"
              >
                {visibleColumns.map((column, colIndex) => {
                  const isLastCol = colIndex === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${contact.name}-${idx}-${column.key}`}
                      style={isLastCol 
                        ? { minWidth: column.width, flex: 1 } 
                        : { width: column.width }}
                      className={`flex items-center justify-start px-[16px] py-[16px] ${isLastCol ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} overflow-hidden`}
                    >
                      {getCellValue(contact, column.key)}
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
export const getContactsColumns = (): Column[] => [
  { key: 'name', label: '業務姓名', width: 150, minWidth: 100 },
  { key: 'role', label: '業務角色', width: 120, minWidth: 80 },
  { key: 'priority', label: '寄信優先序', width: 140, minWidth: 100 },
  { key: 'purchaseOrg', label: '採購組織', width: 200, minWidth: 150 },
  { key: 'emailEnabled', label: '啟用寄信', width: 100, minWidth: 90 },
  { key: 'email', label: 'mail', width: 200, minWidth: 150 },
  { key: 'phone', label: '電話', width: 150, minWidth: 100 },
  { key: 'remark', label: '備註', width: 180, minWidth: 120 },
];