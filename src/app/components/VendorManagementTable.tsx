import { useState, useCallback, useEffect, useMemo , useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';

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
  onVendorClick: () => void;
  onSalesClick: () => void;
  vendorNameFilter: string;
  salesPersonFilter: string;
  userEmail?: string;
  onColumnsChange?: (columns: Column[]) => void;
  columnsVersion?: number;
  appliedFilters?: FilterCondition[];
}

export interface VendorData {
  id: number;
  code: string;
  name: string;
  fullName: string;
  phone: string;
  address: string;
  salesCount: number;
  mainProducts: string;
  salesNames: string[];
}

export const MOCK_VENDORS: VendorData[] = [
  { id: 1,  code: '0001000001', name: '久廣實業',   fullName: '久廣實業股份有限公司',         phone: '+886-37-756558',  address: '苗栗縣通霄鎮中正路73號',          salesCount: 3, mainProducts: '單梁/剪叉/吊车/把手/盤車附件', salesNames: ['張淑玲','王小明','品保'] },
  { id: 2,  code: '0001000002', name: '永豐金屬',   fullName: '永豐金屬工業股份有限公司',     phone: '+886-4-23581234', address: '台中市西屯區工業區一路88號',        salesCount: 2, mainProducts: '鋼材/五金零件/機械零組件',     salesNames: ['李四','王小明'] },
  { id: 3,  code: '0001000003', name: '立德科技',   fullName: '立德科技股份有限公司',         phone: '+886-2-26581111', address: '新北市汐止區新台五路一段99號',      salesCount: 4, mainProducts: '電子零件/控制器/感測器',      salesNames: ['張淑玲','李四','陳品保','林業務'] },
  { id: 4,  code: '0001000004', name: '鴻海精密',   fullName: '鴻海精密工業股份有限公司',     phone: '+886-2-22683466', address: '新北市土城區自由街2號',            salesCount: 5, mainProducts: '精密模具/塑膠射出/組裝代工', salesNames: ['王小明','陳品保','林業務','張淑玲','李四'] },
  { id: 5,  code: '0001000005', name: '台達電子',   fullName: '台達電子工業股份有限公司',     phone: '+886-3-3591234',  address: '桃園市龜山區工業一路8號',          salesCount: 3, mainProducts: '電源供應器/風扇/散熱模組',   salesNames: ['陳品保','林業務','張淑玲'] },
  { id: 6,  code: '0001000006', name: '億光電子',   fullName: '億光電子工業股份有限公司',     phone: '+886-2-26989898', address: '新北市土城區中央路四段75號',       salesCount: 2, mainProducts: 'LED/光電元件/照明模組',      salesNames: ['李四','王小明'] },
  { id: 7,  code: '0001000007', name: '正隆紙業',   fullName: '正隆股份有限公司',             phone: '+886-2-27015388', address: '台北市大安區敦化南路二段207號',    salesCount: 1, mainProducts: '包裝紙箱/工業用紙',          salesNames: ['林業務'] },
  { id: 8,  code: '0001000008', name: '南亞塑膠',   fullName: '南亞塑膠工業股份有限公司',     phone: '+886-2-27178888', address: '台北市松山區敦化北路201號',        salesCount: 4, mainProducts: '塑膠原料/塑膠加工品',        salesNames: ['張淑玲','王小明','陳品保','李四'] },
  { id: 9,  code: '0001000009', name: '台塑企業',   fullName: '台灣塑膠工業股份有限公司',     phone: '+886-2-27122211', address: '台北市松山區敦化北路201號',        salesCount: 2, mainProducts: '石化原料/塑膠製品',          salesNames: ['林業務','陳品保'] },
  { id: 10, code: '0001000010', name: '華碩電腦',   fullName: '華碩電腦股份有限公司',         phone: '+886-2-28943447', address: '台北市北投區立功街112號',          salesCount: 3, mainProducts: '電腦零組件/主機板/顯示卡',  salesNames: ['王小明','張淑玲','李四'] },
  { id: 11, code: '0001000011', name: '友達光電',   fullName: '友達光電股份有限公司',         phone: '+886-3-5008800',  address: '新竹科學園區力行二路1號',          salesCount: 4, mainProducts: '液晶面板/顯示器模組',        salesNames: ['陳品保','林業務','張淑玲','王小明'] },
  { id: 12, code: '0001000641', name: '華銘',       fullName: '信隆車料工業股份有限公司',     phone: '+886-4-22222222', address: '台中市大甲區順帆路19號',          salesCount: 2, mainProducts: '車料/零件',                   salesNames: ['王小明','陳品保'] },
  { id: 13, code: '0001000045', name: '佳承精密',   fullName: '佳承精密工業股份有限公司',     phone: '+886-2-33333333', address: '新北市新店區北新路三段200號',      salesCount: 1, mainProducts: '精密零件',                    salesNames: ['李四'] },
  { id: 14, code: '0001000053', name: '久廣精密',   fullName: '久廣精密工業股份有限公司',     phone: '+886-7-44444444', address: '高雄市前鎮區中山三路12號',         salesCount: 2, mainProducts: '精密零件',                    salesNames: ['林業務','張淑玲'] },
  { id: 15, code: '0001000059', name: '金盛元工業', fullName: '金盛元工業股份有限公司',       phone: '+886-4-55555555', address: '彰化縣員林市員東路一段500號',      salesCount: 1, mainProducts: '零件',                        salesNames: ['王小明'] },
  { id: 16, code: '0001000012', name: '台灣製造',   fullName: '台灣製造工業股份有限公司',     phone: '+886-4-66666666', address: '台中市西屯區工業區一路100號',      salesCount: 1, mainProducts: '零件',                        salesNames: ['陳品保'] },
  { id: 17, code: '0001000046', name: '速聯國際',   fullName: '速聯國際股份有限公司',         phone: '+886-3-77777777', address: '桃園市龜山區文化二路29號',         salesCount: 1, mainProducts: '零件',                        salesNames: ['李四'] },
];




export function VendorManagementTable({ 
  onVendorClick,
  onSalesClick,
  vendorNameFilter,
  salesPersonFilter,
  userEmail = 'default',
  onColumnsChange,
  columnsVersion,
  appliedFilters
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

  // 使用匯出的 MOCK_VENDORS
  const mockVendors = MOCK_VENDORS;

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
    const matchesVendorName = !vendorNameFilter || 
      vendor.name.toLowerCase().includes(vendorNameFilter.toLowerCase()) ||
      vendor.code.includes(vendorNameFilter);
    
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
          onClick={onVendorClick}
          title={`${vendor.name}(${vendor.code})`}
        >
          {vendor.name}({vendor.code})
        </button>
      );
    }
    
    if (key === 'salesCount') {
      return (
        <button 
          className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] underline cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onSalesClick}
        >
          {value}
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

            {/* 表格数据 */}
            {sortedVendors.map((vendor) => (
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