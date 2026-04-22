import { useState, useCallback, useEffect, useMemo , useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { mockVendorsSuccess, mockVendorsFail } from '@/imports/廠商帳號審核-4007-9767';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';

type ColumnKey = 'name' | 'status' | 'company' | 'epCode' | 'axCode' | 'role' | 'email' | 'time' | 'failReason';

interface Column {
  key: ColumnKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean; // 新增：欄位是否可見
}

interface VendorReviewTableProps {
  activeTab: 'success' | 'fail';
  onVendorClick: (vendorName: string) => void;
  vendorNameFilter: string;
  companyNameFilter: string;
  selectedRole: string;
  userEmail?: string; // 新增：用戶郵箱，用於區分不同用戶的設定
  onColumnsChange?: (visibleColumns: Column[]) => void; // 新增：欄位變更回調
  columnsVersion?: number; // 新增：版本號，用於觸發重新載入
  appliedFilters?: FilterCondition[]; // 新增：進階篩選條件
}

// Filter 條件介面
interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}


// ── 測量文字寬度（使用 DOM span，支援中文字型 fallback）──────────────────────
function measureTextWidth(text: string, font = '14px "Public Sans", "Noto Sans JP", sans-serif'): number {
  let el = (measureTextWidth as any)._el as HTMLSpanElement | undefined;
  if (!el) {
    el = document.createElement('span');
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    (measureTextWidth as any)._el = el;
  }
  el.style.font = font;
  el.textContent = text;
  return el.offsetWidth;
}

const DraggableColumnHeader = ({ 
  column, 
  index, 
  moveColumn, 
  updateColumnWidth, autoFitWidth, sortConfig,
  onSort,
  isLast
}: { 
  column: Column; 
  index: number; 
  moveColumn: (dragKey: ColumnKey, hoverKey: ColumnKey) => void;
  updateColumnWidth: (key: ColumnKey, width: number) => void;
  autoFitWidth: (key: any) => void;
  sortConfig: { key: ColumnKey | null; direction: 'asc' | 'desc' | null };
  onSort: (key: ColumnKey) => void;
  isLast?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // ── 自製 resize drag（可靠且支持 dblclick） ──
  const [resizing, setResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.current;
      const newW = Math.max(column.minWidth, resizeStartW.current + diff);
      updateColumnWidth(column.key, newW);
    };
    const onUp = () => setResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizing]);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'column',
    item: () => ({ columnKey: column.key, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'column',
    hover: (item: { columnKey: ColumnKey; index: number }) => {
      if (item.index !== index) {
        moveColumn(item.columnKey, column.key);
        item.index = index;
      }
    },
  });

  const isSorted = sortConfig.key === column.key;
  const sortDirection = isSorted ? sortConfig.direction : null;

  return (
    <div
      className={`relative bg-[#f4f6f8] shrink-0 ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
      style={{ width: column.width, height: 56 }}
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
        {/* 拖曳符號 */}
        {isHovered && (
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            className="mr-[6px] shrink-0"
          >
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
        
        {/* 排序圖標 */}
        {sortDirection && (
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            className="ml-[6px] shrink-0"
          >
            {sortDirection === 'asc' ? (
              <path d="M8 3L12 7H4L8 3Z" fill="#637381" />
            ) : (
              <path d="M8 13L4 9H12L8 13Z" fill="#637381" />
            )}
          </svg>
        )}
      </div>
      {/* 欄寬調整 handle：拖拽調寬 或 雙擊自動最適 */}
      {!isLast && (
        <div
          className="absolute right-0 top-0 bottom-0 w-[8px] cursor-col-resize hover:bg-[#1D7BF5] hover:bg-opacity-20 z-10 group transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.detail >= 2) {
              autoFitWidth(column.key);
              return;
            }
            setResizing(true);
            resizeStartX.current = e.clientX;
            resizeStartW.current = column.width;
          }}
          title="拖拽調整欄位寬度；雙擊自動最適欄寬"
        >
          <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#1D7BF5] transition-colors" />
        </div>
      )}
    </div>
  );
};

export function VendorReviewTable({ 
  activeTab, 
  onVendorClick, 
  vendorNameFilter, 
  companyNameFilter, 
  selectedRole,
  userEmail = 'default',
  onColumnsChange,
  columnsVersion,
  appliedFilters
}: VendorReviewTableProps) {
  // 水平拖拽滾動
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const successColumns: Column[] = [
    { key: 'name', label: '廠商姓名', width: 150, minWidth: 100 },
    { key: 'status', label: '申請狀態', width: 150, minWidth: 100 },
    { key: 'company', label: '申請公司名稱', width: 250, minWidth: 100 },
    { key: 'epCode', label: 'EP廠商代號', width: 150, minWidth: 100 },
    { key: 'axCode', label: 'AX代號', width: 150, minWidth: 100 },
    { key: 'role', label: '申請角色', width: 150, minWidth: 100 },
    { key: 'email', label: 'email', width: 220, minWidth: 100 },
    { key: 'time', label: '申請時間', width: 180, minWidth: 100 },
  ];

  const failColumns: Column[] = [
    { key: 'name', label: '廠商姓名', width: 150, minWidth: 100 },
    { key: 'status', label: '申請狀態', width: 150, minWidth: 100 },
    { key: 'company', label: '申請公司名稱', width: 250, minWidth: 100 },
    { key: 'role', label: '申請角色', width: 150, minWidth: 100 },
    { key: 'email', label: 'email', width: 220, minWidth: 100 },
    { key: 'failReason', label: '失敗原因', width: 300, minWidth: 100 },
    { key: 'time', label: '申請時間', width: 180, minWidth: 100 },
  ];

  // 生成 localStorage key
  const getStorageKey = (tab: 'success' | 'fail') => {
    return `vendorReview_${userEmail}_${tab}_columns`;
  };

  // 從 localStorage 載入欄位設定
  const loadColumnsFromStorage = (tab: 'success' | 'fail'): Column[] => {
    const storageKey = getStorageKey(tab);
    const defaultColumns = tab === 'success' ? successColumns : failColumns;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedColumns = JSON.parse(saved) as Column[];
        // 驗證儲存的欄位是否有效
        if (savedColumns.length === defaultColumns.length) {
          return savedColumns;
        }
      }
    } catch (error) {
      console.error('Failed to load columns from storage:', error);
    }
    
    return defaultColumns;
  };

  // 儲存欄位設定到 localStorage
  const saveColumnsToStorage = (tab: 'success' | 'fail', cols: Column[]) => {
    const storageKey = getStorageKey(tab);
    try {
      localStorage.setItem(storageKey, JSON.stringify(cols));
    } catch (error) {
      console.error('Failed to save columns to storage:', error);
    }
  };

  const [columns, setColumns] = useState<Column[]>(() => loadColumnsFromStorage(activeTab));
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey | null; direction: 'asc' | 'desc' | null }>({ 
    key: null, 
    direction: null 
  });

  // 当tab切换时更新columns
  useEffect(() => {
    setIsLoadingFromStorage(true);
    const loadedColumns = loadColumnsFromStorage(activeTab);
    setColumns(loadedColumns);
    setTimeout(() => setIsLoadingFromStorage(false), 0);
  }, [activeTab, userEmail]);
  
  // 當 columnsVersion 變化時重新載入欄位設定
  useEffect(() => {
    if (columnsVersion !== undefined && columnsVersion > 0) {
      setIsLoadingFromStorage(true);
      const loadedColumns = loadColumnsFromStorage(activeTab);
      setColumns(loadedColumns);
      setTimeout(() => setIsLoadingFromStorage(false), 0);
    }
  }, [columnsVersion]);

  // 當欄位變更時儲存到 localStorage 並通知父組件（但不在從 storage 載入時觸發）
  useEffect(() => {
    if (!isLoadingFromStorage) {
      saveColumnsToStorage(activeTab, columns);
    }
    if (onColumnsChange) {
      onColumnsChange(columns);
    }
  }, [columns, activeTab, userEmail]);

  const moveColumn = useCallback((dragKey: ColumnKey, hoverKey: ColumnKey) => {
    setColumns((prevColumns) => {
      const dragIndex = prevColumns.findIndex(col => col.key === dragKey);
      const hoverIndex = prevColumns.findIndex(col => col.key === hoverKey);
      const newColumns = [...prevColumns];
      const [removed] = newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, removed);
      return newColumns;
    });
  }, []);

  const updateColumnWidth = useCallback((key: ColumnKey, width: number) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const index = newColumns.findIndex(col => col.key === key);
      newColumns[index] = { ...newColumns[index], width };
      return newColumns;
    });
  }, []);

    // 更新欄位可見性
  const updateColumnVisibility = useCallback((updatedColumns: Column[]) => {
    setColumns(updatedColumns);
  }, []);

  // 暴露給父組件的方法
  useEffect(() => {
    if (onColumnsChange) {
      // @ts-ignore
      onColumnsChange.updateColumns = updateColumnVisibility;
    }
  }, [onColumnsChange, updateColumnVisibility]);

  // 篩選可見的欄位

  const visibleColumns = columns.filter(col => col.visible !== false);

  // 根据tab选择数据
  const baseVendors = activeTab === 'success' ? mockVendorsSuccess : mockVendorsFail;
  
  // 多重筛选
  const filteredVendors = baseVendors.filter(vendor => {
    const matchesRole = !selectedRole || vendor.role === selectedRole;
    const matchesVendorName = !vendorNameFilter || vendor.name.toLowerCase().includes(vendorNameFilter.toLowerCase());
    const matchesCompanyName = !companyNameFilter || vendor.company.toLowerCase().includes(companyNameFilter.toLowerCase());
    
    // 進階篩選條件
    const matchesAdvancedFilters = !appliedFilters || appliedFilters.length === 0 || appliedFilters.every(filter => {
      const vendorValue = vendor[filter.column as keyof typeof vendor];
      const filterValue = filter.value;
      
      // 處理不同的操作符
      switch (filter.operator) {
        case 'contains':
          return vendorValue && String(vendorValue).toLowerCase().includes(filterValue.toLowerCase());
        
        case 'equals':
          return vendorValue && String(vendorValue).toLowerCase() === filterValue.toLowerCase();
        
        case 'notEquals':
          return !vendorValue || String(vendorValue).toLowerCase() !== filterValue.toLowerCase();
        
        case 'startsWith':
          return vendorValue && String(vendorValue).toLowerCase().startsWith(filterValue.toLowerCase());
        
        case 'endsWith':
          return vendorValue && String(vendorValue).toLowerCase().endsWith(filterValue.toLowerCase());
        
        case 'isEmpty':
          return !vendorValue || String(vendorValue).trim() === '';
        
        case 'isNotEmpty':
          return vendorValue && String(vendorValue).trim() !== '';
        
        default:
          return true;
      }
    });
    
    return matchesRole && matchesVendorName && matchesCompanyName && matchesAdvancedFilters;
  });

  // 排序函數
  const sortedVendors = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredVendors;
    }

    const sorted = [...filteredVendors].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      // 處理空值
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const aStr = String(aValue);
      const bStr = String(bValue);

      // 檢測數據類型
      const isNumber = /^\d/.test(aStr) && /^\d/.test(bStr);
      const isChinese = /^[\u4e00-\u9fa5]/.test(aStr) && /^[\u4e00-\u9fa5]/.test(bStr);

      let comparison = 0;

      if (isNumber) {
        // 數字排序：提取開頭的數字部分進行比較
        const aNum = parseFloat(aStr.match(/^[\d.]+/)?.[0] || '0');
        const bNum = parseFloat(bStr.match(/^[\d.]+/)?.[0] || '0');
        comparison = aNum - bNum;
      } else if (isChinese) {
        // 中文排序：使用 localeCompare 的拼音排序（筆畫排序較複雜，使用拼音作為近似）
        comparison = aStr.localeCompare(bStr, 'zh-Hans-CN', { sensitivity: 'base' });
      } else {
        // 英文和其他：使用 localeCompare
        comparison = aStr.localeCompare(bStr, 'en', { sensitivity: 'base' });
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredVendors, sortConfig]);

  const getCellValue = (vendor: any, key: ColumnKey) => {
    const value = vendor[key];
    if (key === 'name') {
      return (
        <p 
          className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] underline cursor-pointer truncate"
          onClick={() => onVendorClick(vendor.name)}
          title={value}
        >
          {value}
        </p>
      );
    }
    if (key === 'status') {
      const isFailStatus = value === 'FF';
      return (
        <div className={`${isFailStatus ? 'bg-[rgba(255,86,48,0.16)]' : 'bg-[rgba(0,94,184,0.16)]'} flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] rounded-[6px]`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] ${isFailStatus ? 'text-[#b71d18]' : 'text-[#00559c]'} text-[12px] text-center`}>
            {value}
          </p>
        </div>
      );
    }
    return (
      <p 
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] truncate w-full"
        title={value || '-'}
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
      (sortedVendors || []).forEach((row: any) => {
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
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 表格数据 */}
            {sortedVendors.map((vendor, rowIndex) => (
              <div 
                key={vendor.id} 
                className="flex border-b border-[rgba(145,158,171,0.08)] h-[76px] hover:bg-[rgba(145,158,171,0.04)]"
              >
                {visibleColumns.map((column, colIndex) => {
                  const isLastCol = colIndex === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${vendor.id}-${column.key}`}
                      style={isLastCol 
                        ? { minWidth: column.width, flex: 1 } 
                        : { width: column.width }}
                      className={`flex items-center justify-start px-[16px] ${isLastCol ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} overflow-hidden`}
                    >
                      {getCellValue(vendor, column.key)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 分页控制 */}
        <div className="flex items-center justify-center gap-[24px] px-[23px] py-[16px] bg-white border-t border-[rgba(145,158,171,0.08)] shrink-0">
          <div className="flex items-center gap-[8px]">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[14px]">
              Rows per page:
            </p>
            <select className="px-[8px] py-[4px] border border-[rgba(145,158,171,0.2)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] text-[14px]">
              <option>5</option>
              <option>10</option>
              <option>25</option>
            </select>
          </div>
          
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[14px]">
            1-{filteredVendors.length} of {filteredVendors.length}
          </p>
          
          <div className="flex items-center gap-[8px]">
            <button className="p-[4px] hover:bg-[rgba(145,158,171,0.08)] rounded-[4px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="p-[4px] hover:bg-[rgba(145,158,171,0.08)] rounded-[4px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}