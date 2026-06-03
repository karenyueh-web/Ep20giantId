/**
 * InvoiceListPage — 發票作業 • 發票查詢
 *
 * 功能：
 *   - 狀態 Tab：All / DR / P / B / S / F / H（含筆數）
 *   - 搜尋列：發票日期(起/迄)、買方下拉
 *   - 表格：13 欄，sticky 發票號碼，DnD 排序、欄寬調整
 *   - Toolbar：N results found / Columns / Filters / Export
 *   - 分頁
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { SimpleDatePicker } from './SimpleDatePicker';
import { DropdownSelect } from './DropdownSelect';
import { PaginationControls } from './PaginationControls';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';
import { CheckboxIcon } from './CheckboxIcon';
import {
  loadInvoiceRecords, initInvoiceStore, saveInvoiceRecords, INVOICE_STATUS_CONFIG,
  type InvoiceRecord, type InvoiceStatus,
} from './invoiceStore';

// ── Tab 定義 ──────────────────────────────────────────────────────────────────

const STATUS_TABS: { key: InvoiceStatus | 'ALL'; label: string; status?: InvoiceStatus }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DR',  label: '草稿(DR)',       status: 'DR' },
  { key: 'P',   label: '資料處理中(P)', status: 'P'  },
  { key: 'B',   label: '採購確認中(B)', status: 'B'  },
  { key: 'S',   label: '轉發票成功(S)', status: 'S'  },
  { key: 'F',   label: '轉發票失敗(F)', status: 'F'  },
  { key: 'H',   label: '線下處理(H)',   status: 'H'  },
];

// ── Tab Badge 顏色（各狀態自己的顏色）──────────────────────────────────────────────────
function getTabBadgeStyle(status: InvoiceStatus | undefined, isActive: boolean) {
  if (!isActive || !status) return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
  switch (status) {
    case 'DR': return { bgColor: 'bg-[rgba(142,51,255,0.16)]',  textColor: 'text-[#5119b7]' };
    case 'P':  return { bgColor: 'bg-[rgba(0,94,184,0.16)]',    textColor: 'text-[#005eb8]' };
    case 'B':  return { bgColor: 'bg-[rgba(255,171,0,0.16)]',   textColor: 'text-[#b76e00]' };
    case 'S':  return { bgColor: 'bg-[rgba(34,197,94,0.16)]',   textColor: 'text-[#118d57]' };
    case 'F':  return { bgColor: 'bg-[rgba(255,86,48,0.16)]',   textColor: 'text-[#ff5630]' };
    case 'H':  return { bgColor: 'bg-[rgba(255,0,130,0.16)]',   textColor: 'text-[#c4027d]' };
    default:   return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
  }
}

// ── 欄位定義 ──────────────────────────────────────────────────────────────────

type InvListColKey =
  | 'status'
  | 'invoiceDate'
  | 'taxCode'
  | 'taxRate'
  | 'currency'
  | 'taxAmount'
  | 'totalAmount'
  | 'execNote'
  | 'vendorName'
  | 'buyerName'
  | 'detailCount'
  | 'invoiceType';

interface InvListCol {
  key: InvListColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

const DEFAULT_COLS: InvListCol[] = [
  { key: 'status',       label: '發票狀態',   width: 130, minWidth: 100 },
  { key: 'invoiceDate',  label: '發票日期',   width: 120, minWidth: 100 },
  { key: 'taxCode',      label: '稅碼',       width: 80,  minWidth: 60  },
  { key: 'taxRate',      label: '稅率',       width: 70,  minWidth: 60  },
  { key: 'currency',     label: '幣別',       width: 70,  minWidth: 60  },
  { key: 'taxAmount',    label: '發票稅額',   width: 120, minWidth: 100 },
  { key: 'totalAmount',  label: '發票總額',   width: 130, minWidth: 100 },
  { key: 'execNote',     label: '執行備註',   width: 200, minWidth: 120 },
  { key: 'vendorName',   label: '廠商(編號)', width: 200, minWidth: 140 },
  { key: 'buyerName',    label: '買方',       width: 240, minWidth: 160 },
  { key: 'detailCount',  label: '明細數量',   width: 90,  minWidth: 70  },
  { key: 'invoiceType',  label: '發票聯式',   width: 200, minWidth: 120 },
];

const CHECKBOX_W    = 48;  // checkbox 欄寬
const INVOICE_NO_W  = 150; // sticky 發票號碼欄
// STATUS_W 已移入 DEFAULT_COLS（key: 'status'）
const STORAGE_KEY   = 'invoiceList_v1_cols';

// ── 稅率顯示 ──────────────────────────────────────────────────────────────────
function formatTaxRate(v: string): string {
  if (!v && v !== '0') return '—';
  return `${v}%`;
}

// ── 發票聯式顯示 ──────────────────────────────────────────────────────────────
const INVOICE_TYPE_MAP: Record<string, string> = {
  '21': '21 三聯式、電子計算機統一發票',
  '22': '22 二聯式收銀機統一發票',
  '25': '25 三聯式收銀機統一發票',
};

// ── Cell 渲染 ─────────────────────────────────────────────────────────────────
function getCellValue(row: InvoiceRecord, key: InvListColKey): React.ReactNode {
  if (key === 'status') {
    return <StatusBadge status={row.status} />;
  }
  // ── 執行備註：P/S/F 狀態固定顯示，其他狀態顿譯原始就 ──
  if (key === 'execNote') {
    const overrideMap: Partial<Record<InvoiceStatus, string>> = {
      P: '回傳SAP中',
      S: '回傳SAP成功',
      F: '回傳SAP失敗',
    };
    const displayText = overrideMap[row.status as InvoiceStatus] ?? '';
    const s = displayText.trim() !== '' ? displayText : '—';
    const colorMap: Partial<Record<InvoiceStatus, string>> = {
      P: '#006c9c',
      S: '#118d57',
      F: '#b71d18',
    };
    const color = colorMap[row.status as InvoiceStatus];
    return (
      <p
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full"
        style={{ color: s === '—' ? '#919eab' : (color ?? '#1c252e') }}
        title={s}
      >
        {s}
      </p>
    );
  }
  if (key === 'taxAmount' || key === 'totalAmount') {
    const n = row[key];
    return (
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full text-right pr-[8px]">
        {n > 0 ? n.toLocaleString() : n === 0 ? '0' : '—'}
      </p>
    );
  }
  if (key === 'taxRate') {
    const s = formatTaxRate(row.taxRate);
    return (
      <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`}>
        {s}
      </p>
    );
  }
  if (key === 'invoiceType') {
    const s = INVOICE_TYPE_MAP[row.invoiceType] ?? (row.invoiceType || '—');
    return (
      <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`} title={s}>
        {s}
      </p>
    );
  }
  if (key === 'detailCount') {
    return (
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e]">
        {row.detailCount}
      </p>
    );
  }
  const v = String(row[key as keyof InvoiceRecord] ?? '');
  const s = v.trim() !== '' ? v : '—';
  return (
    <p
      className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`}
      title={s}
    >
      {s}
    </p>
  );
}

// ── 狀態 Badge（列表內顯示英文代碼）──────────────────────────────────────────────────
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const getStyle = (s: InvoiceStatus) => {
    switch (s) {
      case 'DR': return { bgColor: 'bg-[rgba(142,51,255,0.16)]',  textColor: 'text-[#5119b7]' };
      case 'P':  return { bgColor: 'bg-[rgba(0,184,217,0.16)]',   textColor: 'text-[#006c9c]' };
      case 'B':  return { bgColor: 'bg-[rgba(255,171,0,0.16)]',   textColor: 'text-[#b76e00]' };
      case 'S':  return { bgColor: 'bg-[rgba(34,197,94,0.16)]',   textColor: 'text-[#118d57]' };
      case 'F':  return { bgColor: 'bg-[rgba(255,86,48,0.16)]',   textColor: 'text-[#b71d18]' };
      case 'H':  return { bgColor: 'bg-[rgba(255,0,130,0.16)]',   textColor: 'text-[#c4027d]' };
      default:   return { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
    }
  };
  const { bgColor, textColor } = getStyle(status);
  return (
    <div className={`${bgColor} content-stretch flex h-[24px] items-center justify-center min-w-[24px] px-[8px] py-0 relative rounded-[6px] shrink-0 inline-flex`}>
      <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${textColor} text-[12px] text-center whitespace-nowrap`}>
        {status}
      </p>
    </div>
  );
}

// ── 日期篩選輸入框 ────────────────────────────────────────────────────────────
function DateFilterField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const PICKER_H = 320;
    const top = window.innerHeight - r.bottom >= PICKER_H ? r.bottom + 4 : r.top - PICKER_H - 4;
    setPos({ top, left: r.left });
    setOpen(v => !v);
  };
  return (
    <div className="relative w-full" onClick={handleClick}>
      <div className="relative h-[54px] cursor-pointer select-none">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-[rgba(145,158,171,0.2)]" />
        <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
          <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
          <p className="relative text-[12px] font-semibold text-[#637381]">{label}</p>
        </div>
        <div className="flex items-center gap-[8px] h-full px-[14px] pt-[14px] pb-[8px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={`font-['Public_Sans:Regular',sans-serif] text-[14px] flex-1 truncate ${value ? 'text-[#1c252e]' : 'text-[#c4cdd6]'}`}>
            {value || '選擇日期'}
          </span>
          {value && (
            <button
              onClick={e => { e.stopPropagation(); onChange(''); }}
              className="flex items-center justify-center w-[16px] h-[16px] hover:opacity-70 transition-opacity shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M8 2L2 8M2 2L8 8" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {open && (
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          onClick={e => e.stopPropagation()}>
          <SimpleDatePicker selectedDate={value} onDateSelect={d => { onChange(d); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

// ── 發票號碼關鍵字搜尋輸入框 ──────────────────────────────────────────────────
function InvoiceNoFilterField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full">
      <div className="relative h-[54px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-[rgba(145,158,171,0.2)]" />
        <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
          <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
          <p className="relative text-[12px] font-semibold text-[#637381]">{label}</p>
        </div>
        <div className="flex items-center gap-[8px] h-full px-[14px] pt-[14px] pb-[8px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="輸入發票號碼"
            className="flex-1 min-w-0 bg-transparent outline-none border-none font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] placeholder:text-[#c4cdd6]"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="flex items-center justify-center w-[16px] h-[16px] hover:opacity-70 transition-opacity shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M8 2L2 8M2 2L8 8" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export interface InvoiceListPageProps {
  onViewInvoice?: (record: InvoiceRecord) => void;
}

export function InvoiceListPage({ onViewInvoice }: InvoiceListPageProps = {}) {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── 初始化資料 ──
  useEffect(() => { initInvoiceStore(); }, []);

  // ── 資料 ──
  const [records, setRecords] = useState<InvoiceRecord[]>([]);
  useEffect(() => {
    setRecords(loadInvoiceRecords());
  }, []);

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'ALL'>('ALL');

  // ── 選取狀態（僅 DR 可勾選）──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 切換 Tab 時清除選取
  const handleTabChange = (tab: InvoiceStatus | 'ALL') => {
    setActiveTab(tab);
    setSelectedIds(new Set());
  };

  // ── 搜尋篩選 ──
  const [filterInvoiceNo, setFilterInvoiceNo] = useState('');
  const [filterBuyer, setFilterBuyer] = useState('');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo,   setDateTo]       = useState('');

  // ── 買方選項（動態建立）──
  const buyerOptions = useMemo(() => {
    const names = [...new Set(records.map(r => r.buyerName).filter(Boolean))].sort();
    return [{ value: '', label: '全部' }, ...names.map(n => ({ value: n, label: n }))];
  }, [records]);

  // ── 欄位管理 ──
  const loadCols = (): InvListCol[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as InvListCol[];
        const validKeys = new Set(DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as InvListColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns]           = useState<InvListCol[]>(() => loadCols());
  const [tempColumns, setTempColumns]   = useState<InvListCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog,   setShowFilterDialog]   = useState(false);
  const [filters,        setFilters]        = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: InvListColKey | 'invoiceNo' | null; dir: 'asc' | 'desc' | null }>({ key: 'createdAt' as any, dir: 'desc' });
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(100);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  const moveCol = useCallback((drag: InvListColKey, hover: InvListColKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, []);

  const updateWidth = useCallback((key: InvListColKey, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  const autoFitWidth = (key: InvListColKey) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 48;
    let maxDataW = 0;
    records.forEach(row => {
      const raw = String((row as any)[key] ?? '');
      const w = measureTextWidth(raw, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
      if (w > maxDataW) maxDataW = w;
    });
    const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  };

  const visibleColumns = columns.filter(c => c.visible !== false);

  // ── 過濾 ──
  const filteredData = useMemo(() => {
    let data = records;
    // Tab 過濾
    if (activeTab !== 'ALL') {
      data = data.filter(r => r.status === activeTab);
    }
    // 發票號碼關鍵字
    if (filterInvoiceNo.trim()) {
      const kw = filterInvoiceNo.trim().toLowerCase();
      data = data.filter(r => r.invoiceNo.toLowerCase().includes(kw));
    }
    // 買方
    if (filterBuyer) data = data.filter(r => r.buyerName === filterBuyer);
    // 日期起迄
    if (dateFrom) data = data.filter(r => r.invoiceDate >= dateFrom.replace(/-/g, '/'));
    if (dateTo)   data = data.filter(r => r.invoiceDate <= dateTo.replace(/-/g, '/'));
    // 進階篩選
    if (appliedFilters.length > 0) {
      data = data.filter(row => appliedFilters.every(f => {
        const val = String((row as any)[f.column] ?? '').toLowerCase();
        const fv = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains':    return val.includes(fv);
          case 'equals':      return val === fv;
          case 'notEquals':   return val !== fv;
          case 'startsWith':  return val.startsWith(fv);
          case 'endsWith':    return val.endsWith(fv);
          case 'isEmpty':     return !val.trim();
          case 'isNotEmpty':  return !!val.trim();
          default: return true;
        }
      }));
    }
    return data;
  }, [records, activeTab, filterInvoiceNo, filterBuyer, dateFrom, dateTo, appliedFilters]);

  // ── 排序 ──
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String((a as any)[sortConfig.key!] ?? '');
      const bv = String((b as any)[sortConfig.key!] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length, activeTab]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

  // ── Tab 計數 ──
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: records.length };
    records.forEach(r => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
    return counts;
  }, [records]);

  // 僅 DR Tab 提供勾選刪除
  const showCheckbox = activeTab === 'DR';

  const totalWidth = (showCheckbox ? CHECKBOX_W : 0) + INVOICE_NO_W + visibleColumns.reduce((s, c) => s + c.width, 0);

  const handleSort = (key: string) => {
    setSortConfig(s => ({ key: key as any, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  // ── Checkbox 選取邏輯（僅針對當頁 DR 資料）──
  const drRowsOnPage = useMemo(() => paginatedData.filter(r => r.status === 'DR'), [paginatedData]);
  const isAllDrSelected = drRowsOnPage.length > 0 && drRowsOnPage.every(r => selectedIds.has(r.id));
  const isSomeDrSelected = selectedIds.size > 0 && !isAllDrSelected;

  const toggleRow = (id: string) => {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleAllDr = () => {
    if (isAllDrSelected) {
      setSelectedIds(prev => { const s = new Set(prev); drRowsOnPage.forEach(r => s.delete(r.id)); return s; });
    } else {
      setSelectedIds(prev => { const s = new Set(prev); drRowsOnPage.forEach(r => s.add(r.id)); return s; });
    }
  };
  const handleDeleteSelected = () => {
    const remaining = records.filter(r => !selectedIds.has(r.id));
    saveInvoiceRecords(remaining);
    setRecords(remaining);
    setSelectedIds(new Set());
  };

  // ── 更新時間（模擬）──
  const [updateTime] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 狀態 Tab 列（依設計規範：gap-40px、h-48px、黑底線、灰色全寬底線）── */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full overflow-x-hidden">
            {STATUS_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key] ?? 0;
              const showCount = tab.key === 'ALL' ? true : count > 0;
              const badge = getTabBadgeStyle(tab.status, isActive);
              return (
                <div
                  key={tab.key}
                  className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
                  onClick={() => handleTabChange(tab.key)}
                >
                  {isActive && (
                    <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
                  )}
                  <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
                    {tab.label}
                  </p>
                  {showCount && (
                    <div className={`${badge.bgColor} content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0`}>
                      <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${badge.textColor} text-[12px] text-center`}>
                        {count}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {/* 全寬灰色底線 */}
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>
      </div>

      {/* ── 搜尋篩選列（四欄等寬：發票號碼、買方、發票日期起、迄）── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] pt-[16px] pb-[12px]">
        <div className="flex-1 min-w-0">
          <InvoiceNoFilterField label="發票號碼" value={filterInvoiceNo} onChange={v => { setFilterInvoiceNo(v); setPage(1); }} />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="買方"
            value={filterBuyer}
            onChange={v => { setFilterBuyer(v); setPage(1); }}
            options={buyerOptions}
          />
        </div>
        <div className="flex-1 min-w-0">
          <DateFilterField label="發票日期(起)" value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} />
        </div>
        <div className="flex-1 min-w-0">
          <DateFilterField label="發票日期(迄)" value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} />
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => { setTempColumns(JSON.parse(JSON.stringify(columns))); setShowColumnSelector(v => !v); }}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={() => { /* TODO */ }}
        actionButton={
          <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#005eb8] whitespace-nowrap ml-[8px]">
            更新時間：{updateTime}
          </span>
        }
        columnsButton={
          <ColumnSelector
            columns={tempColumns as Parameters<typeof ColumnSelector>[0]['columns']}
            onToggleColumn={key => setTempColumns(tempColumns.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={all => setTempColumns(tempColumns.map(c => ({ ...c, visible: all })))}
            onClose={() => setShowColumnSelector(false)}
            onApply={() => { setColumns(tempColumns as InvListCol[]); setShowColumnSelector(false); }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={[
              { key: 'invoiceNo',   label: '發票號碼' },
              ...DEFAULT_COLS.map(c => ({ key: c.key, label: c.label })),
            ]}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={(vf) => { setAppliedFilters(vf); setShowFilterDialog(false); setPage(1); }}
          />
        }
      />

      {/* ── 表格 ────────────────────────────────────────────────────── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>

            {/* 選取工具列（僅 DR Tab） */}
            {showCheckbox && selectedIds.size > 0 && (
              <div className="flex items-center gap-[12px] px-[16px] h-[52px] bg-[#e8f1fb] border-b border-[rgba(0,94,184,0.12)] sticky top-0 z-20">
                <CheckboxIcon checked={isAllDrSelected} indeterminate={isSomeDrSelected} onChange={toggleAllDr} />
                <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e]">{selectedIds.size} selected</span>
                <button
                  onClick={handleDeleteSelected}
                  className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#ff5630] hover:text-[#b71d18] transition-colors ml-[4px]"
                >
                  刪除
                </button>
              </div>
            )}

            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {/* Checkbox 欄頭（僅 DR Tab） */}
              {showCheckbox && (
                <div
                  className="flex items-center justify-center bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)] shrink-0"
                  style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W }}
                >
                  {selectedIds.size === 0 && drRowsOnPage.length > 0 && (
                    <CheckboxIcon checked={isAllDrSelected} indeterminate={isSomeDrSelected} onChange={toggleAllDr} />
                  )}
                </div>
              )}
              {/* 發票號碼 sticky */}
              <div
                className="flex items-center px-[16px] bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)] shrink-0"
                style={{ width: INVOICE_NO_W, minWidth: INVOICE_NO_W }}
              >
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap">發票號碼</p>
              </div>

              {/* 其他欄位 DnD */}
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  moveColumn={moveCol as any}
                  updateColumnWidth={updateWidth as any}
                  autoFitWidth={autoFitWidth as any}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={handleSort}
                  isLast={idx === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType="invoice-list-col"
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginatedData.map(row => (
              <div
                key={row.id}
                className={`flex border-b border-[rgba(145,158,171,0.08)] transition-colors ${
                  selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : 'hover:bg-[rgba(145,158,171,0.04)]'
                }`}
                style={{ minHeight: 56 }}
              >
                {/* Checkbox 欄（僅 DR Tab） */}
                {showCheckbox && (
                  <div
                    className="flex items-center justify-center border-r border-[rgba(145,158,171,0.08)] shrink-0"
                    style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W }}
                    onClick={e => e.stopPropagation()}
                  >
                    {row.status === 'DR' && (
                      <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => toggleRow(row.id)} />
                    )}
                  </div>
                )}
                {/* 發票號碼 */}
                <div
                  className="flex items-center px-[16px] border-r border-[rgba(145,158,171,0.08)] shrink-0 overflow-hidden"
                  style={{ width: INVOICE_NO_W, minWidth: INVOICE_NO_W }}
                >
                  <p
                    className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1677ff] hover:text-[#0958d9] underline truncate w-full cursor-pointer transition-colors"
                    title={row.invoiceNo}
                    onClick={() => onViewInvoice?.(row)}
                  >
                    {row.invoiceNo}
                  </p>
                </div>

                {/* 其他欄位 */}
                {visibleColumns.map((col, ci) => (
                  <div
                    key={`${row.id}-${col.key}`}
                    style={{ width: col.width }}
                    className={`flex items-center px-[16px] overflow-hidden ${ci < visibleColumns.length - 1 ? 'border-r border-[rgba(145,158,171,0.08)]' : ''}`}
                  >
                    {getCellValue(row, col.key)}
                  </div>
                ))}
                <div className="flex-1 min-w-0" />
              </div>
            ))}

            {/* 空狀態 */}
            {paginatedData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4cdd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的發票資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── 分頁 ────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page}
          totalItems={sortedData.length}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>
    </div>
  );
}
