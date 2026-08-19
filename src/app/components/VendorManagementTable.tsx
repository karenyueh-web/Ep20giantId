import { useState, useCallback, useEffect, useMemo , useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';
import { MOCK_VENDORS } from '@/app/data/vendorData';
export type { VendorData } from '@/app/data/vendorData';

type ColumnKey = 'name' | 'fullName' | 'phone' | 'address' | 'salesCount' | 'mainProducts';

interface Column {
  key: ColumnKey;
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

interface VendorManagementTableProps {
  onVendorClick: (vendor: VendorData) => void;
  onSalesClick: (vendor: VendorData) => void;
  vendorNameFilter: string;
  salesPersonFilter: string;
  userEmail?: string;
  onColumnsChange?: (columns: Column[]) => void;
  columnsVersion?: number;
  appliedFilters?: FilterCondition[];
  onFilteredCountChange?: (count: number) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}










export function VendorManagementTable({ 
  onVendorClick,
  onSalesClick,
  vendorNameFilter,
  salesPersonFilter,
  userEmail = 'default',
  onColumnsChange,
  columnsVersion,
  appliedFilters,
  onFilteredCountChange,
  onLoadingChange
}: VendorManagementTableProps) {
  // 水平拖拽滾動
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const defaultColumns: Column[] = [
    { key: 'name', label: '廠商簡稱(編號)', width: 170, minWidth: 120 },
    { key: 'fullName', label: '廠商完整名稱', width: 250, minWidth: 100 },
    { key: 'phone', label: '電話', width: 180, minWidth: 100 },
    { key: 'address', label: '地址', width: 300, minWidth: 150 },
    { key: 'salesCount', label: '業務數', width: 120, minWidth: 80 },
    { key: 'mainProducts', label: '主要營業產品', width: 400, minWidth: 200 },
  ];

  // 初始為空陣列，避免進入頁面時先閃 mock 資料
  const [mockVendors, setMockVendors] = useState<VendorData[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    onLoadingChange?.(true);
    import('@/app/api/supplier/suppliers').then(({ fetchSuppliers }) => {
      fetchSuppliers({ limit: 100 })
        .then(res => {
          if (res.data.length === 0) {
            // API 回空資料，fallback 到 MOCK_VENDORS
            setMockVendors(MOCK_VENDORS);
            return;
          }
          const converted: VendorData[] = res.data.map((s, i) => ({
            id: i + 1,
            code: s.supplier_no,
            name: s.name,
            fullName: s.fullname_chinese ?? s.name,
            phone: s.phone ?? '',
            address: s.address ?? '',
            salesCount: 0,
            mainProducts: s.main_product ?? '',
            salesNames: [],
            _mdoId: s.id, // 存 UUID 供後續使用
          } as any));
          setMockVendors(converted);
        })
        .catch(err => {
          console.warn('廠商列表 API 失敗，使用 mock data', err);
          setMockVendors(MOCK_VENDORS);
        })
        .finally(() => {
          setApiLoading(false);
          onLoadingChange?.(false);
        });
    });
  }, []);

  // 生成 localStorage key
  const getStorageKey = () => {
    return `vendorManagement_${userEmail}_columns_v2`;
  };

  // 從 localStorage 載入欄位設定
  const loadColumnsFromStorage = (): Column[] => {
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
  };

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
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey | null; direction: 'asc' | 'desc' | null }>({ 
    key: null, 
    direction: null 
  });

  // 當 columnsVersion 變化時重新載入欄位設定
  useEffect(() => {
    if (columnsVersion !== undefined && columnsVersion > 0) {
      setIsLoadingFromStorage(true);
      const loadedColumns = loadColumnsFromStorage();
      setColumns(loadedColumns);
      setTimeout(() => setIsLoadingFromStorage(false), 0);
    }
  }, [columnsVersion]);

  // 當欄位變更時儲存到 localStorage 並通知父組件
  useEffect(() => {
    if (!isLoadingFromStorage) {
      saveColumnsToStorage(columns);
    }
    if (onColumnsChange) {
      onColumnsChange(columns);
    }
  }, [columns, userEmail]);

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

    // 篩選可見的欄位

  const visibleColumns = columns.filter(col => col.visible !== false);

  // 多重篩選
  const filteredVendors = mockVendors.filter(vendor => {
    // 廠商簡稱篩選
    const matchesVendorName = !vendorNameFilter || (() => {
      const tokens = vendorNameFilter.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      return tokens.some(t => vendor.name.toLowerCase().includes(t) || vendor.code.toLowerCase().includes(t));
    })();
    
    // 業務人員篩選
    const matchesSalesPerson = !salesPersonFilter || 
      vendor.salesNames.some(name => name.includes(salesPersonFilter));
    
    // 進階篩選條件
    const matchesAdvancedFilters = !appliedFilters || appliedFilters.length === 0 || appliedFilters.every(filter => {
      const vendorValue = vendor[filter.column as keyof VendorData];
      const filterValue = filter.value;
      
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
    
    return matchesVendorName && matchesSalesPerson && matchesAdvancedFilters;
  });

  // 通知父元件 filtered 數量（API 載入完成後才通知，避免閃跳 0）
  useEffect(() => {
    if (!apiLoading) {
      onFilteredCountChange?.(filteredVendors.length);
    }
  }, [filteredVendors.length, apiLoading]);

  // 排序函數
  const sortedVendors = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredVendors;
    }

    const sorted = [...filteredVendors].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const aStr = String(aValue);
      const bStr = String(bValue);

      const isNumber = /^\d/.test(aStr) && /^\d/.test(bStr);
      const isChinese = /^[\u4e00-\u9fa5]/.test(aStr) && /^[\u4e00-\u9fa5]/.test(bStr);

      let comparison = 0;

      if (isNumber) {
        const aNum = parseFloat(aStr.match(/^[\d.]+/)?.[0] || '0');
        const bNum = parseFloat(bStr.match(/^[\d.]+/)?.[0] || '0');
        comparison = aNum - bNum;
      } else if (isChinese) {
        comparison = aStr.localeCompare(bStr, 'zh-Hans-CN', { sensitivity: 'base' });
      } else {
        comparison = aStr.localeCompare(bStr, 'en', { sensitivity: 'base' });
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredVendors, sortConfig]);

  const getCellValue = (vendor: VendorData, key: ColumnKey) => {
    const value = vendor[key];
    
    if (key === 'name') {
      return (
        <button 
          className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] underline cursor-pointer truncate hover:opacity-70 transition-opacity text-left"
          onClick={() => onVendorClick(vendor)}
          title={`${vendor.name}(${vendor.code})`}
        >
          {vendor.name}({vendor.code})
        </button>
      );
    }
    
    if (key === 'salesCount') {
      // 用 salesNames.length 動態計算，確保與點進去的帳號數一致
      const count = vendor.salesNames.length;
      return (
        <button 
          className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] underline cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => onSalesClick(vendor)}
        >
          {count}
        </button>
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
                  isFiltered={!!appliedFilters?.some(f => f.column === column.key)}
                  dragType="vendor-mgmt-column"
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 表格數據 */}
            {apiLoading ? (
              // Skeleton loading rows
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex border-b border-[rgba(145,158,171,0.08)] h-[56px]">
                  {visibleColumns.map((column, colIndex) => {
                    const isLastCol = colIndex === visibleColumns.length - 1;
                    return (
                      <div
                        key={column.key}
                        style={isLastCol ? { minWidth: column.width, flex: 1 } : { width: column.width }}
                        className={`flex items-center px-[16px] ${isLastCol ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
                      >
                        <div className="h-[14px] rounded-[4px] bg-[rgba(145,158,171,0.15)] animate-pulse w-3/4" />
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              sortedVendors.map((vendor) => (
                <div 
                  key={vendor.id} 
                  className="flex border-b border-[rgba(145,158,171,0.08)] h-[56px] hover:bg-[rgba(145,158,171,0.04)]"
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
              ))
            )}
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