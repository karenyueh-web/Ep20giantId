import { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';
import { useDrag, useDrop } from 'react-dnd';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { SearchField } from './SearchField';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';

// ── 型別 ─────────────────────────────────────────────────────────────────────
type ScheduleTab = 'ALL' | 'CK' | 'CL';

type SchedColKey =
  | 'status' | 'vendorCodeName' | 'orderNo' | 'orderSeq' | 'expectedDelivery'
  | 'itemNo' | 'plannedDeliveryQty' | 'vendorCanDeliverDate'
  | 'pmDeliveryDate' | 'diffDaysA' | 'diffDaysB'
  | 'pmItemNo' | 'pmDeliveryQty'
  | 'inTransitQty' | 'acceptQty' | 'materialNo' | 'longSpec' | 'scheduleReqNo';

interface SchedCol {
  key: SchedColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

export interface ScheduleRow {
  id: number;
  vendorCodeName: string;
  orderNo: string;
  orderSeq: string;
  expectedDelivery: string;
  status: 'CK' | 'CL';
  itemNo: string;
  plannedDeliveryQty: number;
  vendorCanDeliverDate: string;
  pmDeliveryDate: string;
  pmItemNo: string;
  pmDeliveryQty: number;
  inTransitQty: number;
  acceptQty: number;
  materialNo: string;
  longSpec: string;
  scheduleReqNo: string;
}

// ── 預設欄位 ─────────────────────────────────────────────────────────────────
const DEFAULT_COLS: SchedCol[] = [
  { key: 'status',               label: '狀態',             width: 90,  minWidth: 80  },
  { key: 'vendorCodeName',       label: '廠商(編號)',       width: 180, minWidth: 120 },
  { key: 'orderNo',              label: '訂單號碼',         width: 130, minWidth: 100 },
  { key: 'orderSeq',             label: '訂單序號',         width: 100, minWidth: 80  },
  { key: 'expectedDelivery',     label: '預計交期',         width: 120, minWidth: 100 },
  { key: 'itemNo',               label: '項次',             width: 80,  minWidth: 60  },
  { key: 'plannedDeliveryQty',   label: '預計交貨量',       width: 110, minWidth: 90  },
  { key: 'vendorCanDeliverDate', label: '廠商可交日期',     width: 130, minWidth: 100 },
  { key: 'pmDeliveryDate',       label: '生管端交貨日期',   width: 130, minWidth: 100 },
  { key: 'diffDaysA',            label: '差異天數A',         width: 100, minWidth: 80  },
  { key: 'diffDaysB',            label: '差異天數B',         width: 100, minWidth: 80  },
  { key: 'pmItemNo',             label: '生管端項次',       width: 100, minWidth: 80  },
  { key: 'pmDeliveryQty',        label: '生管端交貨量',     width: 120, minWidth: 90  },
  { key: 'inTransitQty',         label: '在途量',           width: 90,  minWidth: 70  },
  { key: 'acceptQty',            label: '驗收量',           width: 90,  minWidth: 70  },
  { key: 'materialNo',           label: '料號',             width: 170, minWidth: 120 },
  { key: 'longSpec',             label: '長規格',           width: 240, minWidth: 140 },
  { key: 'scheduleReqNo',        label: '交貨排程請購單號', width: 170, minWidth: 130 },
];

const STORAGE_KEY = 'scheduleInquiry_v5_cols';
const CHECKBOX_W = 52;

// ── 假資料 ───────────────────────────────────────────────────────────────────
const MOCK_DATA: ScheduleRow[] = [
  { id: 1,  vendorCodeName: '華銘(0001000641)',        orderNo: '400649723', orderSeq: '10', expectedDelivery: '2025/09/04', status: 'CK', itemNo: '1', plannedDeliveryQty: 500,  vendorCanDeliverDate: '2025/09/04', pmDeliveryDate: '2025/09/01', pmItemNo: '1', pmDeliveryQty: 500,  inTransitQty: 0,   acceptQty: 0,   materialNo: '1129-CSL0075-L01', longSpec: 'CHAIN 12S 126L SHIMANO M8100',                  scheduleReqNo: 'PR2025-001234' },
  { id: 2,  vendorCodeName: 'SHIMANO SIC(0001000734)', orderNo: '400649724', orderSeq: '10', expectedDelivery: '2024/12/25', status: 'CK', itemNo: '1', plannedDeliveryQty: 1000, vendorCanDeliverDate: '2024/12/25', pmDeliveryDate: '2024/12/25', pmItemNo: '1', pmDeliveryQty: 1000, inTransitQty: 200, acceptQty: 800, materialNo: '1129-CSL0075-L02', longSpec: 'CHAIN 11S 116L SHIMANO CN-HG601',               scheduleReqNo: 'PR2024-009876' },
  { id: 3,  vendorCodeName: 'GCK(0000002120)',         orderNo: '400649725', orderSeq: '10', expectedDelivery: '2025/10/17', status: 'CK', itemNo: '1', plannedDeliveryQty: 300,  vendorCanDeliverDate: '2025/10/17', pmDeliveryDate: '2025/10/20', pmItemNo: '1', pmDeliveryQty: 300,  inTransitQty: 0,   acceptQty: 0,   materialNo: '1129-CSL0076-L01', longSpec: 'CHAIN 12S 126L KMC X12',                       scheduleReqNo: 'PR2025-003456' },
  { id: 4,  vendorCodeName: 'GEV(0001002345)',         orderNo: '400649726', orderSeq: '20', expectedDelivery: '2025/11/30', status: 'CK', itemNo: '1', plannedDeliveryQty: 750,  vendorCanDeliverDate: '2025/11/28', pmDeliveryDate: '2025/11/30', pmItemNo: '1', pmDeliveryQty: 750,  inTransitQty: 100, acceptQty: 0,   materialNo: '1130-CSL0080-L01', longSpec: 'DERAILLEUR RD SHIMANO DEORE M6100 12SPD',       scheduleReqNo: 'PR2025-004567' },
  { id: 5,  vendorCodeName: '台灣SRAM(0001003210)',    orderNo: '400649727', orderSeq: '10', expectedDelivery: '2025/08/15', status: 'CL', itemNo: '1', plannedDeliveryQty: 200,  vendorCanDeliverDate: '2025/08/15', pmDeliveryDate: '2025/08/12', pmItemNo: '1', pmDeliveryQty: 200,  inTransitQty: 0,   acceptQty: 200, materialNo: '1131-BRK0010-L01', longSpec: 'BRAKE SET SRAM LEVEL TL HYDRAULIC',             scheduleReqNo: 'PR2025-005678' },
  { id: 6,  vendorCodeName: '速聯(0001004321)',        orderNo: '400649728', orderSeq: '10', expectedDelivery: '2025/07/20', status: 'CL', itemNo: '2', plannedDeliveryQty: 450,  vendorCanDeliverDate: '2025/07/20', pmDeliveryDate: '2025/07/18', pmItemNo: '2', pmDeliveryQty: 450,  inTransitQty: 0,   acceptQty: 450, materialNo: '1132-HUB0020-L01', longSpec: 'HUB REAR SHIMANO DEORE XT M8100 12SPD',         scheduleReqNo: 'PR2025-006789' },
  { id: 7,  vendorCodeName: '華銘(0001000641)',        orderNo: '400649729', orderSeq: '30', expectedDelivery: '2026/01/10', status: 'CK', itemNo: '1', plannedDeliveryQty: 600,  vendorCanDeliverDate: '2026/01/08', pmDeliveryDate: '2026/01/10', pmItemNo: '1', pmDeliveryQty: 600,  inTransitQty: 0,   acceptQty: 0,   materialNo: '1133-CST0030-L01', longSpec: 'CASSETTE SHIMANO SLX M7100 12SPD 10-51T',       scheduleReqNo: 'PR2026-000123' },
  { id: 8,  vendorCodeName: 'GEV(0001002345)',         orderNo: '400649730', orderSeq: '10', expectedDelivery: '2025/12/05', status: 'CK', itemNo: '1', plannedDeliveryQty: 1200, vendorCanDeliverDate: '2025/12/03', pmDeliveryDate: '2025/12/05', pmItemNo: '1', pmDeliveryQty: 1200, inTransitQty: 300, acceptQty: 0,   materialNo: '1134-CRK0040-L01', longSpec: 'CRANKSET SHIMANO DEORE M6100 2x12SPD 170mm',    scheduleReqNo: 'PR2025-007890' },
  { id: 9,  vendorCodeName: 'SHIMANO SIC(0001000734)', orderNo: '400649731', orderSeq: '20', expectedDelivery: '2025/06/30', status: 'CL', itemNo: '1', plannedDeliveryQty: 800,  vendorCanDeliverDate: '2025/06/30', pmDeliveryDate: '2025/06/28', pmItemNo: '1', pmDeliveryQty: 800,  inTransitQty: 0,   acceptQty: 800, materialNo: '1135-FD0050-L01',  longSpec: 'FRONT DERAILLEUR SHIMANO DEORE M6100 2x12SPD',  scheduleReqNo: 'PR2025-008901' },
  { id: 10, vendorCodeName: 'GCK(0000002120)',         orderNo: '400649732', orderSeq: '10', expectedDelivery: '2026/02/14', status: 'CK', itemNo: '1', plannedDeliveryQty: 400,  vendorCanDeliverDate: '2026/02/12', pmDeliveryDate: '2026/02/14', pmItemNo: '1', pmDeliveryQty: 400,  inTransitQty: 0,   acceptQty: 0,   materialNo: '1136-STM0060-L01', longSpec: 'STEM GIANT CONTACT SLR OD2 6DEG 80mm',          scheduleReqNo: 'PR2026-000456' },
  { id: 11, vendorCodeName: '台灣SRAM(0001003210)',    orderNo: '400649733', orderSeq: '10', expectedDelivery: '2025/05/20', status: 'CL', itemNo: '1', plannedDeliveryQty: 250,  vendorCanDeliverDate: '2025/05/20', pmDeliveryDate: '2025/05/18', pmItemNo: '1', pmDeliveryQty: 250,  inTransitQty: 0,   acceptQty: 250, materialNo: '1137-HBR0070-L01', longSpec: 'HANDLEBAR GIANT CONNECT OD2 FLAT 680mm',         scheduleReqNo: 'PR2025-002345' },
  { id: 12, vendorCodeName: '速聯(0001004321)',        orderNo: '400649734', orderSeq: '20', expectedDelivery: '2026/03/28', status: 'CK', itemNo: '1', plannedDeliveryQty: 550,  vendorCanDeliverDate: '2026/03/25', pmDeliveryDate: '2026/03/28', pmItemNo: '1', pmDeliveryQty: 550,  inTransitQty: 0,   acceptQty: 0,   materialNo: '1138-SAR0080-L01', longSpec: 'SADDLE GIANT CONTACT NEUTRAL 143mm',            scheduleReqNo: 'PR2026-000789' },
];

// ── Tab 元件 ──────────────────────────────────────────────────────────────────
interface TabItemProps {
  label: string; count?: number; isActive: boolean;
  onClick: () => void; status?: ScheduleTab;
}
function TabItem({ label, count, isActive, onClick, status }: TabItemProps) {
  const getBadge = (st?: ScheduleTab) => {
    if (!isActive || !st) return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
    if (st === 'CK') return { bg: 'bg-[rgba(34,197,94,0.16)]', text: 'text-[#118d57]' };
    return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
  };
  const badge = getBadge(status);
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer px-[4px]"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
        {label}
      </p>
      {count !== undefined && (
        <div className={`${badge.bg} flex items-center justify-center h-[24px] min-w-[24px] px-[6px] rounded-[6px] shrink-0`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] shrink-0 ${badge.text} text-[12px] text-center`}>{count}</p>
        </div>
      )}
    </div>
  );
}

// ── 可拖拉欄位表頭（完全對齊 HistoryOrderListWithTabs 模式）─────────────────
const DRAG_TYPE = 'sched-col';

function DraggableColHeader({
  col, index, moveCol, updateWidth, sortConfig, onSort, isLast,
}: {
  col: SchedCol; index: number;
  moveCol: (drag: SchedColKey, hover: SchedColKey) => void;
  updateWidth: (key: SchedColKey, w: number) => void;
  sortConfig: { key: SchedColKey | null; dir: 'asc' | 'desc' | null };
  onSort: (key: SchedColKey) => void;
  isLast?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: () => ({ key: col.key, index }),
    collect: m => ({ isDragging: m.isDragging() }),
  });
  const [, drop] = useDrop({
    accept: DRAG_TYPE,
    hover: (item: { key: SchedColKey; index: number }) => {
      if (item.index !== index) { moveCol(item.key, col.key); item.index = index; }
    },
  });

  const isSorted = sortConfig.key === col.key;

  return (
    <Resizable
      size={{ width: col.width, height: 56 }}
      minWidth={col.minWidth} maxWidth={900}
      enable={{ right: true }}
      onResizeStop={(_e, _d, _r, delta) => updateWidth(col.key, col.width + delta.width)}
      handleStyles={{ right: { width: '4px', right: 0, cursor: 'col-resize', background: 'transparent', zIndex: 1 } }}
      handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
      className={`bg-[#f4f6f8] ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
    >
      <div
        ref={node => drag(drop(node)) as any}
        className={`h-full flex items-center px-[16px] cursor-pointer select-none ${isDragging ? 'opacity-50' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSort(col.key)}
      >
        {hovered && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-[6px] shrink-0">
            <circle cx="5" cy="3" r="1.5" fill="#919EAB" /><circle cx="11" cy="3" r="1.5" fill="#919EAB" />
            <circle cx="5" cy="8" r="1.5" fill="#919EAB" /><circle cx="11" cy="8" r="1.5" fill="#919EAB" />
            <circle cx="5" cy="13" r="1.5" fill="#919EAB" /><circle cx="11" cy="13" r="1.5" fill="#919EAB" />
          </svg>
        )}
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap truncate">
          {col.label}
        </p>
        {isSorted && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[6px] shrink-0">
            {sortConfig.dir === 'asc'
              ? <path d="M8 3L12 7H4L8 3Z" fill="#637381" />
              : <path d="M8 13L4 9H12L8 13Z" fill="#637381" />}
          </svg>
        )}
      </div>
    </Resizable>
  );
}

// ── 日期差異天數計算（dateA - dateB，正數=延後，負數=提前）─────────────────────
function dateDiffDays(dateA: string, dateB: string): number | null {
  if (!dateA || !dateB) return null;
  const p = (s: string) => new Date(s.replace(/\//g, '-')).getTime();
  return Math.round((p(dateA) - p(dateB)) / 86400000);
}

// ── 匯出 CSV ──────────────────────────────────────────────────────────────────
function exportToCsv(data: ScheduleRow[], cols: SchedCol[]) {
  const visible = cols.filter(c => c.visible !== false);
  const header = visible.map(c => `"${c.label}"`).join(',');
  const rows = data.map(r => visible.map(c => {
    let v: string;
    if (c.key === 'diffDaysA') {
      const d = dateDiffDays(r.pmDeliveryDate, r.expectedDelivery);
      v = d !== null ? (d > 0 ? `+${d}` : String(d)) : '';
    } else if (c.key === 'diffDaysB') {
      const d = dateDiffDays(r.pmDeliveryDate, r.vendorCanDeliverDate);
      v = d !== null ? (d > 0 ? `+${d}` : String(d)) : '';
    } else {
      const raw = r[c.key as keyof ScheduleRow];
      v = raw !== undefined && raw !== null ? String(raw) : '';
    }
    return `"${v}"`;
  }).join(','));
  const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `排程總表查詢_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ── 主頁面元件 ────────────────────────────────────────────────────────────────
interface OrderScheduleInquiryPageProps { userRole?: string; }

export function OrderScheduleInquiryPage({ userRole: _userRole }: OrderScheduleInquiryPageProps) {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const [activeTab, setActiveTab] = useState<ScheduleTab>('ALL');

  // 日期差異 Chip 篩選
  // 'ALL'=全部, 'ANY_DIFF'=所有日期有差異, 'CFN2_DIFF'=預計交期≠cfn2, 'CFN1_DIFF'=cfn2≠廠商可交日期
  type DateChip = 'ALL' | 'ANY_DIFF' | 'CFN2_DIFF' | 'CFN1_DIFF';
  const [dateChip, setDateChip] = useState<DateChip>('ALL');

  // 搜尋
  const [docSeqNoSearch, setDocSeqNoSearch]     = useState('');
  const [vendorSearch, setVendorSearch]         = useState('');
  const [deliveryDateFrom, setDeliveryDateFrom] = useState('');
  const [deliveryDateTo, setDeliveryDateTo]     = useState('');

  // 欄位管理（從 localStorage 載入，保留上次拖拉/排序設定）
  const loadCols = (): SchedCol[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SchedCol[];
        const validKeys = new Set(DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as SchedColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns]         = useState<SchedCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<SchedCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog]     = useState(false);
  const [filters, setFilters]                       = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters]         = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SchedColKey | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });


  // 分頁
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(100);

  // 儲存欄位設定
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  // 欄位拖拉
  const moveCol = useCallback((drag: SchedColKey, hover: SchedColKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, []);

  // 欄寬更新
  const updateWidth = useCallback((key: SchedColKey, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  const visibleColumns = columns.filter(c => c.visible !== false);

  // ── 搜尋過濾 ─────────────────────────────────────────────────────────────
  const splitKw = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchAny = (v: string, kws: string[]) => kws.some(k => v.toLowerCase().includes(k));

  const searchFiltered = useMemo(() => {
    let r = MOCK_DATA;
    if (activeTab !== 'ALL') r = r.filter(x => x.status === activeTab);
    // Chip 日期差異篩選
    if (dateChip === 'ANY_DIFF') {
      // 三個日期不全部相同（任意一對不同即符合）
      r = r.filter(x => {
        const a = x.expectedDelivery, b = x.vendorCanDeliverDate, c = x.pmDeliveryDate;
        return (a && b && a !== b) || (a && c && a !== c) || (b && c && b !== c);
      });
    } else if (dateChip === 'CFN2_DIFF') {
      r = r.filter(x => x.expectedDelivery && x.pmDeliveryDate && x.expectedDelivery !== x.pmDeliveryDate);
    } else if (dateChip === 'CFN1_DIFF') {
      r = r.filter(x => x.vendorCanDeliverDate && x.pmDeliveryDate && x.vendorCanDeliverDate !== x.pmDeliveryDate);
    }
    if (docSeqNoSearch.trim()) {
      const kws = splitKw(docSeqNoSearch);
      r = r.filter(x => matchAny(x.orderNo + x.orderSeq, kws));
    }
    if (vendorSearch.trim()) {
      const kws = splitKw(vendorSearch);
      r = r.filter(x => matchAny(x.vendorCodeName, kws));
    }
    if (deliveryDateFrom.trim()) r = r.filter(x => x.expectedDelivery >= deliveryDateFrom.replace(/-/g, '/'));
    if (deliveryDateTo.trim())   r = r.filter(x => x.expectedDelivery <= deliveryDateTo.replace(/-/g, '/'));
    return r;
  }, [activeTab, dateChip, docSeqNoSearch, vendorSearch, deliveryDateFrom, deliveryDateTo]);

  // ── 進階篩選 ──────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (appliedFilters.length === 0) return searchFiltered;
    return searchFiltered.filter(row =>
      appliedFilters.every(f => {
        if (!f.column) return true;
        const rawVal = String(row[f.column as keyof ScheduleRow] ?? '');
        const fv = f.value ?? '';
        switch (f.operator) {
          case 'contains':   return rawVal.toLowerCase().includes(fv.toLowerCase());
          case 'equals':     return rawVal.toLowerCase() === fv.toLowerCase();
          case 'notEquals':  return rawVal.toLowerCase() !== fv.toLowerCase();
          case 'startsWith': return rawVal.toLowerCase().startsWith(fv.toLowerCase());
          case 'endsWith':   return rawVal.toLowerCase().endsWith(fv.toLowerCase());
          case 'isEmpty':    return !rawVal || rawVal.trim() === '' || rawVal === '-';
          case 'isNotEmpty': return rawVal.trim() !== '' && rawVal !== '-';
          default:           return true;
        }
      })
    );
  }, [searchFiltered, appliedFilters]);

  // ── 排序 ──────────────────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String(a[sortConfig.key as keyof ScheduleRow] ?? '');
      const bv = String(b[sortConfig.key as keyof ScheduleRow] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  // ── Tab 計數 ──────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    CK: MOCK_DATA.filter(r => r.status === 'CK').length,
    CL: MOCK_DATA.filter(r => r.status === 'CL').length,
  }), []);

  // ── 分頁 ──────────────────────────────────────────────────────────────────
  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

  // ── 欄位選擇 ─────────────────────────────────────────────────────────────
  const handleColumnsClick = () => {
    setTempColumns(JSON.parse(JSON.stringify(columns)));
    setShowColumnSelector(v => !v);
  };

  // ── 排序點擊 ──────────────────────────────────────────────────────────────
  const handleSort = (key: SchedColKey) => {
    setSortConfig(s => ({
      key,
      dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const totalWidth = visibleColumns.reduce((s, c) => s + c.width, 0);

  // ── Cell 背景色 helper ────────────────────────────────────────────────────
  const getCellHighlight = (colKey: SchedColKey, row: ScheduleRow): string => {
    // Chip A: 預計交期 ≠ 生管端 → expectedDelivery + pmDeliveryDate + diffDaysA 標粉色
    if (dateChip === 'CFN2_DIFF') {
      const diff = row.expectedDelivery && row.pmDeliveryDate && row.expectedDelivery !== row.pmDeliveryDate;
      if (diff && (colKey === 'expectedDelivery' || colKey === 'pmDeliveryDate' || colKey === 'diffDaysA'))
        return 'bg-[rgba(255,86,48,0.12)]';
    }
    // Chip B: 廠商可交 ≠ 生管端 → vendorCanDeliverDate + pmDeliveryDate + diffDaysB 標黃色
    if (dateChip === 'CFN1_DIFF') {
      const diff = row.vendorCanDeliverDate && row.pmDeliveryDate && row.vendorCanDeliverDate !== row.pmDeliveryDate;
      if (diff && (colKey === 'vendorCanDeliverDate' || colKey === 'pmDeliveryDate' || colKey === 'diffDaysB'))
        return 'bg-[rgba(255,193,7,0.2)]';
    }
    // ALL / ANY_DIFF: pmDeliveryDate 粉, vendorCanDeliverDate 黃，不標其餘
    if (dateChip === 'ALL' || dateChip === 'ANY_DIFF') {
      if (colKey === 'pmDeliveryDate' &&
          row.expectedDelivery && row.pmDeliveryDate && row.expectedDelivery !== row.pmDeliveryDate)
        return 'bg-[rgba(255,86,48,0.12)]';
      if (colKey === 'vendorCanDeliverDate' &&
          row.vendorCanDeliverDate && row.pmDeliveryDate && row.vendorCanDeliverDate !== row.pmDeliveryDate)
        return 'bg-[rgba(255,193,7,0.2)]';
    }
    return '';
  };

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── A. Tabs ───────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(145,158,171,0.2)] px-[20px]">
        <div className="flex gap-[4px]">
          <TabItem label="All"            isActive={activeTab === 'ALL'} onClick={() => { setActiveTab('ALL'); setPage(1); }} />
          <TabItem label="訂單已確認(CK)" count={counts.CK} isActive={activeTab === 'CK'} onClick={() => { setActiveTab('CK'); setPage(1); }} status="CK" />
          <TabItem label="已關閉(CL)"     count={counts.CL} isActive={activeTab === 'CL'} onClick={() => { setActiveTab('CL'); setPage(1); }} status="CL" />
        </div>
      </div>

      {/* ── B. 日期差異篩選 Chips ────────────────────── */}
      <div className="shrink-0 flex gap-[8px] flex-wrap px-[20px] pt-[12px] pb-[4px]">
        {([
          { id: 'ALL',      label: '全部' },
          { id: 'ANY_DIFF', label: '所有日期有差異訂單' },
          { id: 'CFN2_DIFF',label: 'A:預計交期與生管端交期(cfn2)不同' },
          { id: 'CFN1_DIFF',label: 'B:生管端交期(cfn2)與廠商可交貨日期(cfn1)不同' },
        ] as const).map(chip => (
          <button
            key={chip.id}
            onClick={() => { setDateChip(chip.id); setPage(1); }}
            className={[
              'shrink-0 h-[32px] px-[12px] rounded-[8px] text-[13px] font-medium transition-colors whitespace-nowrap',
              dateChip === chip.id
                ? 'bg-[#1c252e] text-white'
                : 'border border-[rgba(145,158,171,0.32)] text-[#637381] hover:border-[#1c252e] hover:text-[#1c252e] bg-white',
            ].join(' ')}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── C. 搜尋列 ─────────────────────────────────── */}
      <div className="shrink-0 flex gap-[12px] flex-wrap px-[20px] py-[16px]">
        <div className="flex-1 min-w-[160px] max-w-[220px]">
          <SearchField label="預計交期(起)" value={deliveryDateFrom} onChange={v => { setDeliveryDateFrom(v); setPage(1); }} placeholder="Start date" type="date" />
        </div>
        <div className="flex-1 min-w-[160px] max-w-[220px]">
          <SearchField label="預計交期(迄)" value={deliveryDateTo}   onChange={v => { setDeliveryDateTo(v);   setPage(1); }} placeholder="End date" type="date" />
        </div>
        <div className="flex-1 min-w-[180px] max-w-[280px]">
          <SearchField label="單號序號" value={docSeqNoSearch} onChange={v => { setDocSeqNoSearch(v); setPage(1); }} type="search" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <SearchField label="廠商(編號)" value={vendorSearch} onChange={v => { setVendorSearch(v); setPage(1); }} type="search" />
        </div>
      </div>

      {/* ── C. Toolbar ────────────────────────────────── */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={() => exportToCsv(filteredData, columns)}
        columnsButton={
          <ColumnSelector
            columns={tempColumns as any}
            onToggleColumn={key => setTempColumns(tempColumns.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={all => setTempColumns(tempColumns.map(c => ({ ...c, visible: all })))}
            onClose={() => setShowColumnSelector(false)}
            onApply={() => {
              setColumns(tempColumns);
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tempColumns)); } catch { /* */ }
              setShowColumnSelector(false);
            }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={DEFAULT_COLS.map(c => ({ key: c.key, label: c.label }))}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); setPage(1); }}
          />
        }
      />


      {/* ── E. 表格（DnD + 排序 + 欄寬調整 + 拖拉捲動）── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>

            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {/* 可拖拉欄 */}
              {visibleColumns.map((col, idx) => (
                <DraggableColHeader
                  key={col.key} col={col} index={idx}
                  moveCol={moveCol} updateWidth={updateWidth}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  isLast={idx === visibleColumns.length - 1}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginatedData.map(row => (
              <div
                key={row.id}
                className="flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors"
                style={{ minHeight: 64 }}
              >
                {/* 一般欄 */}
                {visibleColumns.map((col, ci) => {
                  const isLast = ci === visibleColumns.length - 1;
                  const isDiffCol = col.key === 'diffDaysA' || col.key === 'diffDaysB';
                  const diffDays = isDiffCol
                    ? (col.key === 'diffDaysA'
                        ? dateDiffDays(row.pmDeliveryDate, row.expectedDelivery)
                        : dateDiffDays(row.pmDeliveryDate, row.vendorCanDeliverDate))
                    : null;
                  const raw = isDiffCol ? undefined : row[col.key as keyof ScheduleRow];
                  const val = raw !== undefined && raw !== null ? String(raw) : '';
                  const highlight = getCellHighlight(col.key, row);
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                      className={`flex items-center px-[16px] overflow-hidden transition-colors ${highlight} ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
                    >
                      {col.key === 'status' ? (
                        <span className={[
                          'inline-flex items-center h-[22px] px-[8px] rounded-[6px] text-[12px] font-bold leading-none whitespace-nowrap',
                          row.status === 'CK'
                            ? 'bg-[rgba(34,197,94,0.16)] text-[#118d57]'
                            : 'bg-[rgba(145,158,171,0.16)] text-[#637381]',
                        ].join(' ')}>
                          {row.status}
                        </span>
                      ) : isDiffCol ? (
                        diffDays === null ? (
                          <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] w-full text-[#919eab]">—</p>
                        ) : (
                          <p className={`font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[14px] w-full ${
                            diffDays > 0 ? 'text-[#b71d18]' : diffDays < 0 ? 'text-[#118d57]' : 'text-[#1c252e]'
                          }`}>
                            {diffDays > 0 ? `+${diffDays}` : String(diffDays)}
                          </p>
                        )
                      ) : (
                        <p
                          title={val}
                          className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${val ? 'text-[#1c252e]' : 'text-[#919eab]'}`}
                        >
                          {val || '—'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 空狀態 */}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的排程資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── F. 分頁 ───────────────────────────────────── */}
      <div className="shrink-0 flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page} totalItems={sortedData.length} itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>
    </div>
  );
}
