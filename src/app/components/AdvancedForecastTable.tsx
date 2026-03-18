import { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { CheckboxIcon } from './CheckboxIcon';
import type { FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';
import svgTrash from '@/imports/svg-g29eakwhmm';

// ── 型別定義 ─────────────────────────────────────────────────────────────────
export type ForecastColumnKey =
  | 'purchaseGroup' | 'purchaseOrg' | 'companyCode' | 'vendor'
  | 'uploadWeek' | 'deliveryWeek' | 'materialNo' | 'vendorMaterialNo' | 'productName'
  | 'leadTime' | 'deliveryDate' | 'purchaseQty' | 'diffQty' | 'unit'
  | 'updatedBy' | 'updatedDate';

export interface ForecastColumn {
  key: ForecastColumnKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

export interface ForecastOrderRow {
  id: number;
  purchaseGroup: string;
  purchaseOrg: string;
  companyCode: string;
  vendor: string;
  uploadWeek: string;
  deliveryWeek: string;
  materialNo: string;
  vendorMaterialNo: string;
  productName: string;
  leadTime: number;
  deliveryDate: string;
  purchaseQty: number;
  diffQty: number;
  unit: string;
  updatedBy: string;
  updatedDate: string;
}

// ── 預設欄位 ──────────────────────────────────────────────────────────────────
export const defaultForecastColumns: ForecastColumn[] = [
  { key: 'purchaseGroup',    label: '採購群組',    width: 100, minWidth: 80  },
  { key: 'purchaseOrg',      label: '採購組織',    width: 100, minWidth: 80  },
  { key: 'companyCode',      label: '公司代碼',    width: 100, minWidth: 80  },
  { key: 'vendor',           label: '廠商',        width: 210, minWidth: 140 },
  { key: 'uploadWeek',       label: '上傳週別',    width: 105, minWidth: 80  },
  { key: 'deliveryWeek',     label: '交期週別',    width: 105, minWidth: 80  },
  { key: 'materialNo',       label: '料號',        width: 175, minWidth: 120 },
  { key: 'vendorMaterialNo', label: '廠商料號',    width: 150, minWidth: 100 },
  { key: 'productName',      label: '品名',        width: 220, minWidth: 140 },
  { key: 'leadTime',         label: 'Lead time',   width: 95,  minWidth: 70  },
  { key: 'deliveryDate',     label: '交貨日期',    width: 110, minWidth: 90  },
  { key: 'purchaseQty',      label: '採購量',      width: 90,  minWidth: 70  },
  { key: 'diffQty',          label: '與上期差異量', width: 120, minWidth: 80  },
  { key: 'unit',             label: '單位',        width: 70,  minWidth: 55  },
  { key: 'updatedBy',        label: '更新者',      width: 100, minWidth: 80  },
  { key: 'updatedDate',      label: '更新日',      width: 115, minWidth: 90  },
];

// ── Mock 資料 ─────────────────────────────────────────────────────────────────
export const forecastOrderMockData: ForecastOrderRow[] = [
  {
    id: 1, purchaseGroup: 'PG01', purchaseOrg: '2000', companyCode: 'C001',
    vendor: '速聯國際(00010046)', uploadWeek: '2025/W20', deliveryWeek: '2025/W26',
    materialNo: '2201-FRM0046-F01', vendorMaterialNo: 'VN-FRM-046-01',
    productName: 'TCR ADVANCED SL DISC FRAME M',
    leadTime: 28, deliveryDate: '2025/06/28', purchaseQty: 150, diffQty: 50, unit: 'EA',
    updatedBy: 'buyer01', updatedDate: '2025/05/05',
  },
  {
    id: 2, purchaseGroup: 'PG01', purchaseOrg: '2000', companyCode: 'C001',
    vendor: '佳承精密(00010045)', uploadWeek: '2025/W20', deliveryWeek: '2025/W25',
    materialNo: '3301-WHL0045-F02', vendorMaterialNo: 'VN-WHL-045-02',
    productName: 'SLR 1 42 DISC WHEELSYSTEM REAR',
    leadTime: 21, deliveryDate: '2025/06/21', purchaseQty: 80, diffQty: -20, unit: 'SET',
    updatedBy: 'buyer01', updatedDate: '2025/05/05',
  },
  {
    id: 3, purchaseGroup: 'PG02', purchaseOrg: '2000', companyCode: 'C001',
    vendor: '久廣精密(00010053)', uploadWeek: '2025/W20', deliveryWeek: '2025/W24',
    materialNo: '4401-STM0053-F03', vendorMaterialNo: 'VN-STM-053-03',
    productName: 'CONTACT SL OD2 STEM 110MM',
    leadTime: 14, deliveryDate: '2025/06/14', purchaseQty: 200, diffQty: 0, unit: 'EA',
    updatedBy: 'buyer02', updatedDate: '2025/05/04',
  },
  {
    id: 4, purchaseGroup: 'PG02', purchaseOrg: '2100', companyCode: 'C001',
    vendor: '金盛元工業(00010059)', uploadWeek: '2025/W20', deliveryWeek: '2025/W27',
    materialNo: '5501-BRK0059-F04', vendorMaterialNo: 'VN-BRK-059-04',
    productName: 'SHIMANO BR-R9270 DURA-ACE CALIPER',
    leadTime: 35, deliveryDate: '2025/07/05', purchaseQty: 300, diffQty: 80, unit: 'EA',
    updatedBy: 'buyer02', updatedDate: '2025/05/04',
  },
  {
    id: 5, purchaseGroup: 'PG01', purchaseOrg: '2000', companyCode: 'C001',
    vendor: '台灣製造(00010012)', uploadWeek: '2025/W20', deliveryWeek: '2025/W23',
    materialNo: '6601-CRK0012-F05', vendorMaterialNo: 'VN-CRK-012-05',
    productName: 'SHIMANO FC-R9200 DURA-ACE 52/36T',
    leadTime: 10, deliveryDate: '2025/06/07', purchaseQty: 120, diffQty: -30, unit: 'SET',
    updatedBy: 'buyer03', updatedDate: '2025/05/03',
  },
  {
    id: 6, purchaseGroup: 'PG03', purchaseOrg: '2100', companyCode: 'C001',
    vendor: '速聯國際(00010046)', uploadWeek: '2025/W21', deliveryWeek: '2025/W28',
    materialNo: '7701-CST0046-F06', vendorMaterialNo: 'VN-CST-046-06',
    productName: 'SHIMANO CS-R9200 12-SPEED 11-34T',
    leadTime: 28, deliveryDate: '2025/07/12', purchaseQty: 500, diffQty: 120, unit: 'EA',
    updatedBy: 'buyer01', updatedDate: '2025/05/06',
  },
  {
    id: 7, purchaseGroup: 'PG03', purchaseOrg: '2000', companyCode: 'C001',
    vendor: '佳承精密(00010045)', uploadWeek: '2025/W21', deliveryWeek: '2025/W26',
    materialNo: '8801-TIR0045-F07', vendorMaterialNo: 'VN-TIR-045-07',
    productName: 'GAVIA FONDO 1 700X28C TUBELESS READY',
    leadTime: 21, deliveryDate: '2025/06/28', purchaseQty: 1000, diffQty: 0, unit: 'EA',
    updatedBy: 'buyer02', updatedDate: '2025/05/06',
  },
  {
    id: 8, purchaseGroup: 'PG02', purchaseOrg: '2100', companyCode: 'C001',
    vendor: '久廣精密(00010053)', uploadWeek: '2025/W21', deliveryWeek: '2025/W25',
    materialNo: '9901-HDL0053-F08', vendorMaterialNo: 'VN-HDL-053-08',
    productName: 'CONTACT SLR OD2 HANDLEBAR 420MM',
    leadTime: 14, deliveryDate: '2025/06/21', purchaseQty: 90, diffQty: -15, unit: 'EA',
    updatedBy: 'buyer03', updatedDate: '2025/05/07',
  },
  {
    id: 9, purchaseGroup: 'PG01', purchaseOrg: '2000', companyCode: 'C001',
    vendor: '金盛元工業(00010059)', uploadWeek: '2025/W21', deliveryWeek: '2025/W29',
    materialNo: '1129-SAD0059-F09', vendorMaterialNo: 'VN-SAD-059-09',
    productName: 'FLEET SLR SADDLE 143MM CARBON RAIL',
    leadTime: 42, deliveryDate: '2025/07/19', purchaseQty: 200, diffQty: 60, unit: 'EA',
    updatedBy: 'buyer01', updatedDate: '2025/05/07',
  },
  {
    id: 10, purchaseGroup: 'PG03', purchaseOrg: '2000', companyCode: 'C001',
    vendor: '台灣製造(00010012)', uploadWeek: '2025/W22', deliveryWeek: '2025/W27',
    materialNo: '2201-PED0012-F10', vendorMaterialNo: 'VN-PED-012-10',
    productName: 'LOOK KEO 2 MAX PEDAL',
    leadTime: 21, deliveryDate: '2025/07/05', purchaseQty: 400, diffQty: 0, unit: 'PR',
    updatedBy: 'buyer02', updatedDate: '2025/05/08',
  },
  {
    id: 11, purchaseGroup: 'PG02', purchaseOrg: '2100', companyCode: 'C001',
    vendor: '速聯國際(00010046)', uploadWeek: '2025/W22', deliveryWeek: '2025/W30',
    materialNo: '3301-FRK0046-F11', vendorMaterialNo: 'VN-FRK-046-11',
    productName: 'PROPEL ADVANCED PRO FORK CARBON',
    leadTime: 35, deliveryDate: '2025/07/26', purchaseQty: 60, diffQty: 25, unit: 'EA',
    updatedBy: 'buyer03', updatedDate: '2025/05/08',
  },
  {
    id: 12, purchaseGroup: 'PG01', purchaseOrg: '2000', companyCode: 'C001',
    vendor: '佳承精密(00010045)', uploadWeek: '2025/W22', deliveryWeek: '2025/W26',
    materialNo: '4401-DRL0045-F12', vendorMaterialNo: 'VN-DRL-045-12',
    productName: 'SHIMANO RD-R9250 Di2 12-SPEED',
    leadTime: 21, deliveryDate: '2025/06/28', purchaseQty: 180, diffQty: -40, unit: 'EA',
    updatedBy: 'buyer01', updatedDate: '2025/05/09',
  },
];

// ── DraggableColumnHeader ─────────────────────────────────────────────────────
const DRAG_TYPE = 'forecast-column';

const DraggableColumnHeader = ({
  column, index, moveColumn, updateColumnWidth, sortConfig, onSort, isLast,
}: {
  column: ForecastColumn;
  index: number;
  moveColumn: (dragKey: ForecastColumnKey, hoverKey: ForecastColumnKey) => void;
  updateColumnWidth: (key: ForecastColumnKey, width: number) => void;
  sortConfig: { key: ForecastColumnKey | null; direction: 'asc' | 'desc' | null };
  onSort: (key: ForecastColumnKey) => void;
  isLast?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: () => ({ columnKey: column.key, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: DRAG_TYPE,
    hover: (item: { columnKey: ForecastColumnKey; index: number }) => {
      if (item.index !== index) {
        moveColumn(item.columnKey, column.key);
        item.index = index;
      }
    },
  });

  const isSorted = sortConfig.key === column.key;
  const sortDir = isSorted ? sortConfig.direction : null;

  return (
    <Resizable
      size={{ width: column.width, height: 48 }}
      minWidth={column.minWidth}
      maxWidth={900}
      enable={{ right: true }}
      onResizeStop={(_e, _dir, _ref, d) => {
        updateColumnWidth(column.key, column.width + d.width);
      }}
      handleStyles={{
        right: { width: '4px', right: '0', cursor: 'col-resize', background: 'transparent', zIndex: 1 },
      }}
      handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
      className={`bg-[#f4f6f8] ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
    >
      <div
        ref={(node) => drag(drop(node))}
        className={`h-full flex items-center justify-start px-[16px] cursor-pointer select-none ${isDragging ? 'opacity-50' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (t.closest('[class*="resizable-handler"]')) return;
          onSort(column.key);
        }}
      >
        {/* 拖曳把手 */}
        {isHovered && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-[6px] shrink-0">
            <circle cx="5" cy="3"  r="1.5" fill="#919EAB" />
            <circle cx="11" cy="3"  r="1.5" fill="#919EAB" />
            <circle cx="5" cy="8"  r="1.5" fill="#919EAB" />
            <circle cx="11" cy="8"  r="1.5" fill="#919EAB" />
            <circle cx="5" cy="13" r="1.5" fill="#919EAB" />
            <circle cx="11" cy="13" r="1.5" fill="#919EAB" />
          </svg>
        )}
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[13px] whitespace-nowrap truncate">
          {column.label}
        </p>
        {/* 排序圖示 */}
        {sortDir && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[6px] shrink-0">
            {sortDir === 'asc'
              ? <path d="M8 3L12 7H4L8 3Z" fill="#637381" />
              : <path d="M8 13L4 9H12L8 13Z" fill="#637381" />}
          </svg>
        )}
      </div>
    </Resizable>
  );
};

// ── 與上期差異量 Cell ──────────────────────────────────────────────────────────
function DiffQtyCell({ value }: { value: number }) {
  if (value > 0) return <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#118d57]">+{value.toLocaleString()}</span>;
  if (value < 0) return <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#b71d18]">{value.toLocaleString()}</span>;
  return <span className="text-[#919eab] text-[13px]">—</span>;
}

// ── 儲存格值渲染 ──────────────────────────────────────────────────────────────
function getCellValue(row: ForecastOrderRow, key: ForecastColumnKey): React.ReactNode {
  switch (key) {
    case 'purchaseGroup':    return row.purchaseGroup;
    case 'purchaseOrg':      return row.purchaseOrg;
    case 'companyCode':      return row.companyCode;
    case 'vendor':           return row.vendor;
    case 'uploadWeek':       return row.uploadWeek;
    case 'deliveryWeek':     return row.deliveryWeek;
    case 'materialNo':       return row.materialNo;
    case 'vendorMaterialNo': return row.vendorMaterialNo;
    case 'productName':      return row.productName;
    case 'leadTime':         return `${row.leadTime} 天`;
    case 'deliveryDate':     return row.deliveryDate;
    case 'purchaseQty':      return row.purchaseQty.toLocaleString();
    case 'diffQty':          return <DiffQtyCell value={row.diffQty} />;
    case 'unit':             return row.unit;
    case 'updatedBy':        return row.updatedBy;
    case 'updatedDate':      return row.updatedDate;
    default:                 return null;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface AdvancedForecastTableProps {
  data: ForecastOrderRow[];
  userEmail?: string;
  onColumnsChange?: (cols: ForecastColumn[]) => void;
  columnsVersion?: number;
  appliedFilters?: FilterCondition[];
  onDeleteRows?: (ids: Set<number>) => void;
}

const CHECKBOX_COL_W = 88;

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function AdvancedForecastTable({
  data,
  userEmail = 'default',
  onColumnsChange,
  columnsVersion,
  appliedFilters,
  onDeleteRows,
}: AdvancedForecastTableProps) {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── localStorage key ──
  const getStorageKey = () => `forecastOrder_${userEmail}_columns`;

  const validKeys = useMemo(
    () => new Set(defaultForecastColumns.map(c => c.key)),
    []
  );

  const loadColumns = (): ForecastColumn[] => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const parsed = JSON.parse(saved) as ForecastColumn[];
        const filtered = parsed.filter(c => validKeys.has(c.key as ForecastColumnKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = defaultForecastColumns.filter(c => !savedKeys.has(c.key));
        const merged = [...filtered, ...newCols];
        if (merged.length > 0) return merged;
      }
    } catch { /* */ }
    return defaultForecastColumns.map(c => ({ ...c }));
  };

  const saveColumns = (cols: ForecastColumn[]) => {
    try { localStorage.setItem(getStorageKey(), JSON.stringify(cols)); } catch { /* */ }
  };

  // ── State ──
  const [columns, setColumns] = useState<ForecastColumn[]>(() => loadColumns());
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: ForecastColumnKey | null; direction: 'asc' | 'desc' | null }>({
    key: null, direction: null,
  });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── columnsVersion 變更 → 重新載入 ──
  useEffect(() => {
    if (columnsVersion !== undefined && columnsVersion > 0) {
      setIsLoadingFromStorage(true);
      setColumns(loadColumns());
      setTimeout(() => setIsLoadingFromStorage(false), 0);
    }
  }, [columnsVersion]);

  // ── 欄位變更 → 儲存 + 通知父 ──
  useEffect(() => {
    if (!isLoadingFromStorage) saveColumns(columns);
    if (onColumnsChange) onColumnsChange(columns);
  }, [columns, userEmail]);

  // ── 欄位拖拽排序 ──
  const moveColumn = useCallback((dragKey: ForecastColumnKey, hoverKey: ForecastColumnKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === dragKey);
      const hi = prev.findIndex(c => c.key === hoverKey);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, []);

  // ── 欄位寬度調整 ──
  const updateColumnWidth = useCallback((key: ForecastColumnKey, width: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width } : c));
  }, []);

  // ── 可見欄位 ──
  const visibleColumns = columns.filter(c => c.visible !== false);

  // ── 進階篩選 ──
  const advancedFilteredData = useMemo(() => {
    if (!appliedFilters || appliedFilters.length === 0) return data;
    return data.filter(row =>
      appliedFilters.every(filter => {
        const val = row[filter.column as keyof ForecastOrderRow];
        const fv = filter.value;
        const sv = String(val ?? '').toLowerCase();
        switch (filter.operator) {
          case 'contains':   return sv.includes(fv.toLowerCase());
          case 'equals':     return sv === fv.toLowerCase();
          case 'notEquals':  return sv !== fv.toLowerCase();
          case 'startsWith': return sv.startsWith(fv.toLowerCase());
          case 'endsWith':   return sv.endsWith(fv.toLowerCase());
          case 'isEmpty':    return !val || sv.trim() === '';
          case 'isNotEmpty': return !!val && sv.trim() !== '';
          default:           return true;
        }
      })
    );
  }, [data, appliedFilters]);

  // ── 排序 ──
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return advancedFilteredData;
    return [...advancedFilteredData].sort((a, b) => {
      const av = a[sortConfig.key as keyof ForecastOrderRow];
      const bv = b[sortConfig.key as keyof ForecastOrderRow];
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      const as = String(av), bs = String(bv);
      const isNum = /^\d/.test(as) && /^\d/.test(bs);
      const isChi = /^[\u4e00-\u9fa5]/.test(as) && /^[\u4e00-\u9fa5]/.test(bs);
      let cmp = 0;
      if (isNum) {
        cmp = parseFloat(as.match(/^[\d.]+/)?.[0] || '0') - parseFloat(bs.match(/^[\d.]+/)?.[0] || '0');
      } else if (isChi) {
        cmp = as.localeCompare(bs, 'zh-Hant-TW', { sensitivity: 'base' });
      } else {
        cmp = as.localeCompare(bs, 'en', { sensitivity: 'base' });
      }
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [advancedFilteredData, sortConfig]);

  // ── Checkbox ──
  const isAllSelected = sortedData.length > 0 && sortedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;
  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    isAllSelected ? sortedData.forEach(r => next.delete(r.id)) : sortedData.forEach(r => next.add(r.id));
    setSelectedIds(next);
  };
  const handleToggle = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // ── 刪除已選取資料 ──
  const handleDeleteSelected = () => {
    if (onDeleteRows) {
      onDeleteRows(new Set(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const totalWidth = CHECKBOX_COL_W + visibleColumns.reduce((s, c) => s + c.width, 0);

  const cellTextCls = "font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] truncate";

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, rowsPerPage]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full">

        {/* ── 選取狀態列（捲動區外，不會橫向位移） ── */}
        {selectedIds.size > 0 && (
          <div className="shrink-0 flex items-center h-[48px] bg-[#d9e8f5] border-b border-[rgba(145,158,171,0.08)]">
            {/* 左側：佔 CHECKBOX_COL_W 寬，與下方 checkbox cell 對齊 */}
            <div
              data-is-checkbox="true"
              className="flex items-center justify-center shrink-0"
              style={{ width: CHECKBOX_COL_W, minWidth: CHECKBOX_COL_W }}
            >
              <button
                data-is-checkbox="true"
                onClick={handleSelectAll}
                className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 16.6667 16.6667" fill="none">
                  <path clipRule="evenodd" d={svgTrash.p220f9900} fill="#00559C" fillRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* 計數文字（緊接 checkbox 欄後） */}
            <span className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] whitespace-nowrap">
              {selectedIds.size} selected
            </span>

            {/* 右側：刪除按鈕 */}
            <button
              data-is-checkbox="true"
              onClick={handleDeleteSelected}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,70,128,0.12)] transition-colors shrink-0 mr-[16px]"
              title="刪除已選取資料"
            >
              <svg width="15" height="16.6667" viewBox="0 0 15 16.6667" fill="none">
                <path d={svgTrash.p9117480} fill="#004680" />
                <path clipRule="evenodd" d={svgTrash.p27d3c500} fill="#004680" fillRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* ── 捲動區 ── */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* ── 一般表頭（永遠 sticky top-0） ── */}
            <div
              data-table-header="true"
              className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]"
            >
              {/* Checkbox 全選 */}
              <div
                data-is-checkbox="true"
                className="flex items-center justify-center shrink-0 bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)]"
                style={{ width: CHECKBOX_COL_W, minWidth: CHECKBOX_COL_W, height: 48 }}
              >
                <CheckboxIcon checked={isAllSelected} onChange={handleSelectAll} />
              </div>
              {/* 可拖拽/可調寬欄位 */}
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  moveColumn={moveColumn}
                  updateColumnWidth={updateColumnWidth}
                  sortConfig={sortConfig}
                  onSort={(key) => {
                    let dir: 'asc' | 'desc' | null = 'asc';
                    if (sortConfig.key === key && sortConfig.direction === 'asc') dir = 'desc';
                    setSortConfig({ key, direction: dir });
                  }}
                  isLast={idx === visibleColumns.length - 1}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* ── 資料列 ── */}
            {paginatedData.map((row) => (
              <div
                key={row.id}
                className={`flex border-b border-[rgba(145,158,171,0.08)] h-[52px] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${
                  selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : ''
                }`}
              >
                {/* Checkbox cell */}
                <div
                  data-is-checkbox="true"
                  className="flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)]"
                  style={{ width: CHECKBOX_COL_W, minWidth: CHECKBOX_COL_W }}
                >
                  <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => handleToggle(row.id)} />
                </div>
                {/* 資料欄位 */}
                {visibleColumns.map((col, ci) => {
                  const isLastCol = ci === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLastCol ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                      className={`flex items-center px-[16px] overflow-hidden ${isLastCol ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
                    >
                      <span className={cellTextCls}>
                        {getCellValue(row, col.key)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* ── 空資料提示 ── */}
            {sortedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">
                  無符合條件的預測訂單
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── 分頁控制 ── */}
        <div className="flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)] shrink-0">
          <PaginationControls
            currentPage={currentPage}
            totalItems={sortedData.length}
            itemsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      </div>
    </DndProvider>
  );
}
