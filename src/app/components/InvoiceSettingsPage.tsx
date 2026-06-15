/**
 * InvoiceSettingsPage — 發票設定
 *
 * 三個 TAB：
 *  1. 字軌主檔：資料更新時間（SAP拉取）、年、月、稅碼、字軌
 *  2. 發票截止日期：年、月、截止日期（連結，點擊開啟日期選擇器）、更新時間-人員
 *  3. 工廠稅率：SAP工廠代號、稅率、有效日期、操作（刪除 / 修改）
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { CheckboxIcon } from './CheckboxIcon';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';
import { SimpleDatePicker } from './SimpleDatePicker';
import { TRACK_DATA, type TrackRecord } from './invoiceSettingsStore';
import { DropdownSelect } from './DropdownSelect';
import { UpdateTimeLabel } from './UpdateTimeLabel';
import { ActionCellButtons } from './ActionButtons';
import { INVOICE_TYPE_OPTIONS } from './invoiceDetailData';


// ── react-dnd drag types ──────────────────────────────────────────────────────
const DRAG_TYPE_TRACK    = 'invoice-track-col';
const DRAG_TYPE_DEAD     = 'invoice-deadline-col';
const DRAG_TYPE_FAC_TAX  = 'invoice-factory-tax-col';

// ──────────────────────────────────────────────────────────────────────────────
// 字軌主檔資料與型別從共用模組引入（invoiceSettingsStore.ts）

// Mock 資料：發票截止日期
interface DeadlineRecord {
  id: number;
  year: string;
  month: string;
  deadline: string;    // YYYY/MM/DD
  updatedAt: string;   // 更新時間-人員
}

// ── 業務規則：每年 10/1 自動 insert 下一年度資料，截止日預設為各月最後一天 ──
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate(); // month 傳 1-12，Date(y, m, 0) 取該月最後一天
}

/**
 * 產生某年度 12 筆截止日期資料
 * @param systemTimestamp - 系統自動帶入時間（格式 YYYY/MM/DD HH:mm-系統）
 * @param manualOverrides - 人工修改的覆蓋值（key = "YYYY/MM"）
 */
function generateYearDeadlines(
  year: number,
  idStart: number,
  systemTimestamp: string,
  manualOverrides: Record<string, string> = {},
): DeadlineRecord[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month   = i + 1;
    const lastDay = getLastDayOfMonth(year, month);
    const monthStr = String(month).padStart(2, '0');
    const dayStr   = String(lastDay).padStart(2, '0');
    const key = `${year}/${monthStr}`;
    return {
      id:        idStart + i,
      year:      String(year),
      month:     monthStr,
      deadline:  `${year}/${monthStr}/${dayStr}`,
      // 人工修改 > 系統帶入時間
      updatedAt: manualOverrides[key] ?? systemTimestamp,
    };
  });
}

function buildMockDeadlineData(): DeadlineRecord[] {
  const today        = new Date();
  const currentYear  = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12

  const records: DeadlineRecord[] = [];
  let idCounter = 1;

  // 前一年：由 {前前年}/10/01 產生，模擬部分月份已人工修改
  const prevYear = currentYear - 1;
  const prevSysTs = `${currentYear - 2}/10/01 00:00-系統`;
  const prevManual: Record<string, string> = {
    [`${prevYear}/01`]: `${prevYear}/02/01 00:00-財務OOO`,
    [`${prevYear}/02`]: `${prevYear}/02/01 00:00-財務OOO`,
    [`${prevYear}/03`]: `${prevYear}/03/01 09:15-財務OOO`,
  };
  records.push(...generateYearDeadlines(prevYear, idCounter, prevSysTs, prevManual));
  idCounter += 12;

  // 當年：由 {前一年}/10/01 產生
  const curSysTs = `${currentYear - 1}/10/01 00:00-系統`;
  records.push(...generateYearDeadlines(currentYear, idCounter, curSysTs));
  idCounter += 12;

  // 下一年：只有當月 >= 10 月時才已被 insert
  if (currentMonth >= 10) {
    const nextSysTs = `${currentYear}/10/01 00:00-系統`;
    records.push(...generateYearDeadlines(currentYear + 1, idCounter, nextSysTs));
  }

  return records;
}

const DEADLINE_DATA: DeadlineRecord[] = buildMockDeadlineData();



// ──────────────────────────────────────────────────────────────────────────────
// 欄位定義型別

interface ColDef<T> {
  key: keyof T & string;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
  required?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// 字軌主檔 Tab

type TrackColKey = keyof TrackRecord;

function useTableCols<T>(initialCols: ColDef<T>[], storageKey: string) {
  const [cols, setCols] = useState<ColDef<T>[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as ColDef<T>[];
        const savedMap = new Map(parsed.map(c => [c.key, c]));
        const valid = new Set(initialCols.map(c => c.key));
        const filtered = parsed.filter(c => valid.has(c.key));
        if (filtered.length === initialCols.length) {
          // 保留使用者的 width/hidden，但 label 以程式碼為準
          return initialCols.map(c => ({
            ...savedMap.get(c.key)!,
            label: c.label,
            minWidth: c.minWidth,
            required: c.required,
          }));
        }
      }
    } catch { /* ignore */ }
    return initialCols.map(c => ({ ...c }));
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(cols)); } catch { /* ignore */ }
  }, [cols, storageKey]);

  return [cols, setCols] as const;
}

const TRACK_COLS_INIT: ColDef<TrackRecord>[] = [
  { key: 'year',    label: '年',  width: 120, minWidth: 80  },
  { key: 'month',   label: '月',  width: 100, minWidth: 80  },
  { key: 'taxCode', label: '稅碼', width: 140, minWidth: 100 },
  { key: 'track',   label: '字軌', width: 180, minWidth: 120 },
];

function TrackTab() {
  const STORAGE_KEY = 'invoice-settings-track-v1';
  const [cols, setCols] = useTableCols<TrackRecord>(TRACK_COLS_INIT, STORAGE_KEY);
  const [tempCols, setTempCols] = useState<ColDef<TrackRecord>[]>([]);
  const [showColSelector, setShowColSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  // 搜尋篩選
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterTaxCode, setFilterTaxCode] = useState('');
  const [filterTrack, setFilterTrack] = useState('');

  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const yearOptions = useMemo(() => {
    const years = [...new Set(TRACK_DATA.map(r => r.year))].sort((a, b) => b.localeCompare(a));
    return [{ value: '', label: '全部' }, ...years.map(y => ({ value: y, label: y }))];
  }, []);

  const monthOptions = [
    { value: '', label: '全部' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') })),
  ];

  const taxCodeOptions = useMemo(() => {
    const codes = [...new Set(TRACK_DATA.map(r => r.taxCode))].sort();
    return [{ value: '', label: '全部' }, ...codes.map(c => ({ value: c, label: c }))];
  }, []);

  // 第一層：搜尋欄過濾
  const searchFiltered = useMemo(() => {
    return TRACK_DATA.filter(r =>
      (!filterYear || r.year === filterYear) &&
      (!filterMonth || r.month === filterMonth) &&
      (!filterTaxCode || r.taxCode === filterTaxCode) &&
      (!filterTrack || r.track.toLowerCase().includes(filterTrack.toLowerCase()))
    );
  }, [filterYear, filterMonth, filterTaxCode, filterTrack]);

  // 第二層：進階篩選
  const filtered = useMemo(() => {
    if (appliedFilters.length === 0) return searchFiltered;
    return searchFiltered.filter(row =>
      appliedFilters.every(f => {
        if (!f.column) return true;
        const val = String((row as any)[f.column] ?? '');
        const fv = f.value ?? '';
        switch (f.operator) {
          case 'contains': return val.toLowerCase().includes(fv.toLowerCase());
          case 'equals': return val.toLowerCase() === fv.toLowerCase();
          case 'notEquals': return val.toLowerCase() !== fv.toLowerCase();
          case 'startsWith': return val.toLowerCase().startsWith(fv.toLowerCase());
          case 'endsWith': return val.toLowerCase().endsWith(fv.toLowerCase());
          case 'isEmpty': return !val.trim();
          case 'isNotEmpty': return !!val.trim();
          default: return true;
        }
      })
    );
  }, [searchFiltered, appliedFilters]);

  // 排序
  const sorted = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String((a as any)[sortConfig.key!] ?? '');
      const bv = String((b as any)[sortConfig.key!] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortConfig]);

  useEffect(() => { setPage(1); }, [sorted.length]);

  const paginated = useMemo(() => {
    const s = (page - 1) * perPage;
    return sorted.slice(s, s + perPage);
  }, [sorted, page, perPage]);

  const visibleCols = cols.filter(c => c.visible !== false);

  const moveCol = useCallback((drag: string, hover: string) => {
    setCols(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, [setCols]);

  const updateWidth = useCallback((key: string, w: number) => {
    setCols(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, [setCols]);

  const autoFitWidth = useCallback((key: string) => {
    setCols(prev => {
      const col = prev.find(c => c.key === key);
      if (!col) return prev;
      const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 48;
      let maxDataW = 0;
      TRACK_DATA.forEach(row => {
        const val = String((row as any)[key] ?? '');
        const w = measureTextWidth(val, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
      const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
      return prev.map(c => c.key === key ? { ...c, width: bestFit } : c);
    });
  }, [setCols]);

  const handleSort = (key: string) => {
    setSortConfig(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const totalWidth = visibleCols.reduce((s, c) => s + c.width, 0);

  // 資料更新時間（模擬）
  const dataUpdateTime = '2025/05/05 12:30';

  // 已套用的篩選 tags
  const activeTags: { label: string; onClear: () => void }[] = [];
  if (filterYear) activeTags.push({ label: `年：${filterYear}`, onClear: () => setFilterYear('') });
  if (filterMonth) activeTags.push({ label: `月：${filterMonth}`, onClear: () => setFilterMonth('') });
  if (filterTaxCode) activeTags.push({ label: `稅碼：${filterTaxCode}`, onClear: () => setFilterTaxCode('') });

  const clearAll = () => { setFilterYear(''); setFilterMonth(''); setFilterTaxCode(''); setFilterTrack(''); };

  return (
    <div className="flex flex-col h-full">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-end px-[20px] pt-[16px] pb-[16px]">
        <div className="flex-1 min-w-[120px]">
          <DropdownSelect
            label="年"
            value={filterYear}
            onChange={setFilterYear}
            options={yearOptions}
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <DropdownSelect
            label="月"
            value={filterMonth}
            onChange={setFilterMonth}
            options={monthOptions}
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <DropdownSelect
            label="稅碼"
            value={filterTaxCode}
            onChange={setFilterTaxCode}
            options={taxCodeOptions}
          />
        </div>
        {/* 字軌搜尋欄 */}
        <div className="flex-1 min-w-[140px]" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', height: 54, overflow: 'visible' }}>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                borderRadius: 8, border: '1px solid rgba(145,158,171,0.2)',
              }}
            />
            <div style={{ position: 'absolute', top: -5, left: 14, display: 'flex', alignItems: 'center', padding: '0 2px', zIndex: 10 }}>
              <div style={{ position: 'absolute', background: 'white', height: 2, left: 0, right: 0, top: 5 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: '#637381', position: 'relative' }}>字軌</p>
            </div>
            <div className="flex items-center gap-[8px] px-[14px]" style={{ height: 54 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M21 21L15 15M17 11C17 14.3137 14.3137 17 11 17C7.68629 17 5 14.3137 5 11C5 7.68629 7.68629 5 11 5C14.3137 5 17 7.68629 17 11Z" stroke="#919EAB" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={filterTrack}
                onChange={e => setFilterTrack(e.target.value)}
                placeholder="搜尋字軌..."
                className="flex-1 bg-transparent text-[14px] text-[#1c252e] placeholder:text-[#919eab] outline-none"
              />
            </div>
          </div>
        </div>
      </div>


      {/* Toolbar */}
      <TableToolbar
        resultsCount={filtered.length}
        showColumnSelector={showColSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => { setTempCols(JSON.parse(JSON.stringify(cols))); setShowColSelector(v => !v); }}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={() => { /* TODO */ }}
        actionButton={
          <span className="ml-[8px]">
            <UpdateTimeLabel label="資料更新時間" currentTime={dataUpdateTime} />
          </span>
        }
        columnsButton={
          <ColumnSelector
            columns={tempCols.filter(c => !c.required) as Parameters<typeof ColumnSelector>[0]['columns']}
            onToggleColumn={key => setTempCols(tempCols.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={all => setTempCols(tempCols.map(c => c.required ? c : { ...c, visible: all }))}
            onClose={() => setShowColSelector(false)}
            onApply={() => { setCols(tempCols as ColDef<TrackRecord>[]); setShowColSelector(false); }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={TRACK_COLS_INIT.map(c => ({ key: c.key, label: c.label }))}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={(vf) => { setAppliedFilters(vf); setShowFilterDialog(false); setPage(1); }}
          />
        }
      />

      {/* 篩選標籤列 */}
      {activeTags.length > 0 && (
        <div className="shrink-0 flex items-center gap-[8px] px-[20px] pb-[12px] flex-wrap">
          {activeTags.map((tag, i) => (
            <div key={i} className="flex items-center gap-[4px] bg-[rgba(0,94,184,0.08)] px-[10px] py-[4px] rounded-[6px]">
              <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{tag.label}</span>
              <button onClick={tag.onClear} className="flex items-center justify-center w-[16px] h-[16px] hover:opacity-70 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M8 2L2 8M2 2L8 8" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={clearAll}
            className="flex items-center gap-[4px] text-[#ff5630] hover:opacity-70 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px]">Clear</span>
          </button>
        </div>
      )}

      {/* 表格 */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleCols.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  moveColumn={moveCol}
                  updateColumnWidth={updateWidth}
                  autoFitWidth={autoFitWidth}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={handleSort}
                  isLast={idx === visibleCols.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType={DRAG_TYPE_TRACK}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginated.map(row => (
              <div
                key={row.id}
                className="flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors"
                style={{ minHeight: 64 }}
              >
                {visibleCols.map((col, ci) => (
                  <div
                    key={`${row.id}-${col.key}`}
                    style={{ width: col.width }}
                    className={`flex items-center px-[16px] overflow-hidden ${ci < visibleCols.length - 1 ? 'border-r border-[rgba(145,158,171,0.08)]' : ''}`}
                  >
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full">
                      {String((row as any)[col.key] ?? '')}
                    </p>
                  </div>
                ))}
                <div className="flex-1 min-w-0" />
              </div>
            ))}

            {/* 空狀態 */}
            {paginated.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* 分頁 */}
      <div className="shrink-0 flex items-center bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page}
          totalItems={sorted.length}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 發票截止日期 Tab

const DEADLINE_COLS_INIT: ColDef<DeadlineRecord>[] = [
  { key: 'year',      label: '年',        width: 120, minWidth: 80  },
  { key: 'month',     label: '月',        width: 100, minWidth: 80  },
  { key: 'deadline',  label: '截止日期',  width: 200, minWidth: 140 },
  { key: 'updatedAt', label: '更新時間-人員', width: 280, minWidth: 200 },
];

function DeadlineTab() {
  const STORAGE_KEY = 'invoice-settings-deadline-v1';
  const [cols, setCols] = useTableCols<DeadlineRecord>(DEADLINE_COLS_INIT, STORAGE_KEY);
  const [tempCols, setTempCols] = useState<ColDef<DeadlineRecord>[]>([]);
  const [showColSelector, setShowColSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  // 搜尋篩選
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // 日期選擇器狀態
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  const [deadlineData, setDeadlineData] = useState<DeadlineRecord[]>(DEADLINE_DATA);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const yearOptions = useMemo(() => {
    const years = [...new Set(deadlineData.map(r => r.year))].sort((a, b) => b.localeCompare(a));
    return [{ value: '', label: '全部' }, ...years.map(y => ({ value: y, label: y }))];
  }, [deadlineData]);

  const monthOptions = [
    { value: '', label: '全部' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') })),
  ];

  // 點擊外部關閉日期選擇器
  useEffect(() => {
    if (!editingId) return;
    const handler = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setEditingId(null);
        setPickerPos(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingId]);

  // 搜尋過濾
  const searchFiltered = useMemo(() => {
    return deadlineData.filter(r =>
      (!filterYear || r.year === filterYear) &&
      (!filterMonth || r.month === filterMonth)
    );
  }, [deadlineData, filterYear, filterMonth]);

  const filtered = useMemo(() => {
    if (appliedFilters.length === 0) return searchFiltered;
    return searchFiltered.filter(row =>
      appliedFilters.every(f => {
        if (!f.column) return true;
        const val = String((row as any)[f.column] ?? '');
        const fv = f.value ?? '';
        switch (f.operator) {
          case 'contains': return val.toLowerCase().includes(fv.toLowerCase());
          case 'equals': return val.toLowerCase() === fv.toLowerCase();
          case 'notEquals': return val.toLowerCase() !== fv.toLowerCase();
          case 'startsWith': return val.toLowerCase().startsWith(fv.toLowerCase());
          case 'endsWith': return val.toLowerCase().endsWith(fv.toLowerCase());
          case 'isEmpty': return !val.trim();
          case 'isNotEmpty': return !!val.trim();
          default: return true;
        }
      })
    );
  }, [searchFiltered, appliedFilters]);

  // ── 自訂預設排序：當年 → 未來年（升序）→ 過去年（降序），年內月份由大到小 ──
  const sorted = useMemo(() => {
    const data = [...filtered];

    if (sortConfig.key && sortConfig.dir) {
      // 使用者手動點欄位表頭 → 走一般欄位排序
      data.sort((a, b) => {
        const av = String((a as any)[sortConfig.key!] ?? '');
        const bv = String((b as any)[sortConfig.key!] ?? '');
        const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
        return sortConfig.dir === 'asc' ? cmp : -cmp;
      });
      return data;
    }

    // 預設排序：當年 → 未來年升序 → 過去年降序，各年內月份降序
    const currentYear = new Date().getFullYear();
    const yearPriority = (year: number): number => {
      if (year === currentYear) return 0;
      if (year > currentYear)  return 1;            // 未來年：priority 1（值越小越前）
      return 2;                                      // 過去年：priority 2
    };

    data.sort((a, b) => {
      const ay = Number(a.year);
      const by = Number(b.year);
      const pa = yearPriority(ay);
      const pb = yearPriority(by);

      if (pa !== pb) return pa - pb;                // 先比 priority 群組

      // 同群組內：未來年份升序（小→大），過去年份降序（大→小），當年只有一個不影響
      if (pa === 1) {
        if (ay !== by) return ay - by;              // 未來年：小年在前
      } else if (pa === 2) {
        if (ay !== by) return by - ay;              // 過去年：大年在前
      }

      // 同年：月份降序（12→1）
      return Number(b.month) - Number(a.month);
    });

    return data;
  }, [filtered, sortConfig]);

  useEffect(() => { setPage(1); }, [sorted.length]);

  const paginated = useMemo(() => {
    const s = (page - 1) * perPage;
    return sorted.slice(s, s + perPage);
  }, [sorted, page, perPage]);

  const visibleCols = cols.filter(c => c.visible !== false);

  const moveCol = useCallback((drag: string, hover: string) => {
    setCols(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, [setCols]);

  const updateWidth = useCallback((key: string, w: number) => {
    setCols(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, [setCols]);

  const autoFitWidth = useCallback((key: string) => {
    setCols(prev => {
      const col = prev.find(c => c.key === key);
      if (!col) return prev;
      const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 48;
      let maxDataW = 0;
      deadlineData.forEach(row => {
        const val = String((row as any)[key] ?? '');
        const w = measureTextWidth(val, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
      const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
      return prev.map(c => c.key === key ? { ...c, width: bestFit } : c);
    });
  }, [setCols, deadlineData]);

  const handleSort = (key: string) => {
    setSortConfig(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const handleDateSelect = (id: number, date: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}-OOO`;
    setDeadlineData(prev => prev.map(r =>
      r.id === id ? { ...r, deadline: date, updatedAt: timestamp } : r
    ));
    setEditingId(null);
  };

  const totalWidth = visibleCols.reduce((s, c) => s + c.width, 0);

  // 篩選 tags
  const activeTags: { label: string; onClear: () => void }[] = [];
  if (filterYear) activeTags.push({ label: `年：${filterYear}`, onClear: () => setFilterYear('') });
  if (filterMonth) activeTags.push({ label: `月：${filterMonth}`, onClear: () => setFilterMonth('') });
  const clearAll = () => { setFilterYear(''); setFilterMonth(''); };

  // 渲染 cell
  const renderCell = (col: ColDef<DeadlineRecord>, row: DeadlineRecord, isEditing: boolean, rowIdx: number) => {
    if (col.key === 'deadline') {
      return (
        <div ref={isEditing ? datePickerRef : undefined}>
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
            onClick={(e) => {
              if (isEditing) {
                setEditingId(null);
                setPickerPos(null);
              } else {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const PICKER_HEIGHT = 320; // SimpleDatePicker 大約高度
                const spaceBelow = window.innerHeight - rect.bottom;
                const top = spaceBelow >= PICKER_HEIGHT
                  ? rect.bottom + 4          // 下方空間足夠 → 向下展開
                  : rect.top - PICKER_HEIGHT - 4; // 下方不足 → 向上展開
                setPickerPos({ top, left: rect.left });
                setEditingId(row.id);
              }
            }}
          >
            {row.deadline || '—'}
          </button>
        </div>
      );
    }
    const val = String((row as any)[col.key] ?? '');
    return (
      <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${val ? 'text-[#1c252e]' : 'text-[#919eab]'}`}>
        {val || '—'}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap px-[20px] pt-[16px] pb-[16px]">
        <div style={{ width: 440 }}>
          <DropdownSelect label="年" value={filterYear} onChange={setFilterYear} options={yearOptions} />
        </div>
        <div style={{ width: 440 }}>
          <DropdownSelect label="月" value={filterMonth} onChange={setFilterMonth} options={monthOptions} />
        </div>
      </div>

      {/* Toolbar */}
      <TableToolbar
        resultsCount={filtered.length}
        showColumnSelector={showColSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => { setTempCols(JSON.parse(JSON.stringify(cols))); setShowColSelector(v => !v); }}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={() => { /* TODO */ }}
        columnsButton={
          <ColumnSelector
            columns={tempCols.filter(c => !c.required) as Parameters<typeof ColumnSelector>[0]['columns']}
            onToggleColumn={key => setTempCols(tempCols.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={all => setTempCols(tempCols.map(c => c.required ? c : { ...c, visible: all }))}
            onClose={() => setShowColSelector(false)}
            onApply={() => { setCols(tempCols as ColDef<DeadlineRecord>[]); setShowColSelector(false); }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={DEADLINE_COLS_INIT.map(c => ({ key: c.key, label: c.label }))}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={(vf) => { setAppliedFilters(vf); setShowFilterDialog(false); setPage(1); }}
          />
        }
      />

      {/* 篩選標籤列 */}
      {activeTags.length > 0 && (
        <div className="shrink-0 flex items-center gap-[8px] px-[20px] pb-[12px] flex-wrap">
          {activeTags.map((tag, i) => (
            <div key={i} className="flex items-center gap-[4px] bg-[rgba(0,94,184,0.08)] px-[10px] py-[4px] rounded-[6px]">
              <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{tag.label}</span>
              <button onClick={tag.onClear} className="flex items-center justify-center w-[16px] h-[16px] hover:opacity-70 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M8 2L2 8M2 2L8 8" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={clearAll} className="flex items-center gap-[4px] text-[#ff5630] hover:opacity-70 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px]">Clear</span>
          </button>
        </div>
      )}

      {/* 表格 */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleCols.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  moveColumn={moveCol}
                  updateColumnWidth={updateWidth}
                  autoFitWidth={autoFitWidth}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={handleSort}
                  isLast={idx === visibleCols.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType={DRAG_TYPE_DEAD}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginated.map((row, rowIdx) => {
              const isEditing = editingId === row.id;
              return (
                <div
                  key={row.id}
                  className="flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors"
                  style={{ minHeight: 64 }}
                >
                  {visibleCols.map((col, ci) => (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={{ width: col.width }}
                      className={`flex items-center px-[16px] overflow-visible relative ${ci < visibleCols.length - 1 ? 'border-r border-[rgba(145,158,171,0.08)]' : ''}`}
                    >
                      {renderCell(col, row, col.key === 'deadline' && isEditing, rowIdx)}
                    </div>
                  ))}
                  <div className="flex-1 min-w-0" />
                </div>
              );
            })}

            {paginated.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* 分頁 */}
      <div className="shrink-0 flex items-center bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page}
          totalItems={sorted.length}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>

      {/* 日期選擇器 Portal：渲染到 document.body，避免 overflow-hidden 截斷 */}
      {editingId !== null && pickerPos && createPortal(
        <div
          ref={datePickerRef}
          className="fixed z-[9999]"
          style={{ top: pickerPos.top, left: pickerPos.left }}
        >
          <SimpleDatePicker
            selectedDate={deadlineData.find(r => r.id === editingId)?.deadline ?? ''}
            onDateSelect={(date) => handleDateSelect(editingId, date)}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 工廠稅率 Tab

interface FactoryTaxRecord {
  id: number;
  factoryCode: string;   // SAP工廠代號
  companyCode: string;   // 公司代碼（新增）
  bondedType: string;    // 保稅/非保稅（新增）
  invoiceType: string;   // 發票聯式（新增；越南等海外可留空）
  taxCode: string;       // 稅碼（新增，最多10字元）
  taxRate: number;       // 稅率（%）
  effectiveDate: string; // 有效日期 YYYY/MM/DD
  updatedAt: string;     // 更新時間-人員
}

// ── 公司選項（來自 ORG_TO_COMPANY 唯一公司，下拉選單用）──
const COMPANY_CODE_OPTIONS = [
  { value: '',     label: '全部' },
  { value: '1100', label: '巨大機械(1100)' },
  { value: '1400', label: 'AIP愛普智(1400)' },
  { value: '3110', label: 'Giant Vietnam(3110)' },
  { value: '4110', label: 'GEM(4110)' },
  { value: '4120', label: 'GHM(4120)' },
];

// 新增/修改 Dialog 用（去掉「全部」選項）
const COMPANY_CODE_OPTIONS_EDIT = COMPANY_CODE_OPTIONS.filter(o => o.value !== '');

// ── 保稅選項 ──
const BONDED_TYPE_OPTIONS_EDIT = [
  { value: '保稅',  label: '保稅'  },
  { value: '非保稅', label: '非保稅' },
];

// 發票聯式選項（帶空白選項供越南等海外工廠使用）
const INVOICE_TYPE_OPTIONS_WITH_NA = [
  { value: '', label: '（不適用）' },
  ...INVOICE_TYPE_OPTIONS,
];

// ── 工廠稅率初始資料 ──────────────────────────────────────────────────────────
// 版本號：每次修改 FACTORY_TAX_DATA_INIT 時只需更新此數字
const FACTORY_TAX_DATA_VERSION = 6;

const FACTORY_TAX_DATA_INIT: FactoryTaxRecord[] = [
  { id: 1, factoryCode: 'GTM1', companyCode: '1100', bondedType: '保稅', invoiceType: '22', taxCode: 'V1', taxRate: 5, effectiveDate: '2019/01/01', updatedAt: '2026/06/11 00:00-系統' },
  { id: 2, factoryCode: 'GVM1', companyCode: '3110', bondedType: '保稅', invoiceType: '',   taxCode: 'V1', taxRate: 8, effectiveDate: '2026/12/31', updatedAt: '2026/06/11 00:00-系統' },
  { id: 3, factoryCode: 'AIP1', companyCode: '1100', bondedType: '保稅', invoiceType: '22', taxCode: 'V1', taxRate: 5, effectiveDate: '2019/01/01', updatedAt: '2026/06/11 00:00-系統' },
  { id: 4, factoryCode: 'AIP2', companyCode: '1100', bondedType: '保稅', invoiceType: '22', taxCode: 'V1', taxRate: 5, effectiveDate: '2019/01/01', updatedAt: '2026/06/11 00:00-系統' },
  { id: 5, factoryCode: 'DTC1', companyCode: '1100', bondedType: '保稅', invoiceType: '22', taxCode: 'V1', taxRate: 5, effectiveDate: '2019/01/01', updatedAt: '2026/06/11 00:00-系統' },
  { id: 6, factoryCode: 'DTE1', companyCode: '1100', bondedType: '保稅', invoiceType: '22', taxCode: 'V1', taxRate: 5, effectiveDate: '2019/01/01', updatedAt: '2026/06/11 00:00-系統' },
  { id: 7, factoryCode: 'DTG1', companyCode: '1100', bondedType: '保稅', invoiceType: '22', taxCode: 'V1', taxRate: 5, effectiveDate: '2019/01/01', updatedAt: '2026/06/11 00:00-系統' },
  { id: 8, factoryCode: 'DTI1', companyCode: '1100', bondedType: '保稅', invoiceType: '22', taxCode: 'V1', taxRate: 5, effectiveDate: '2019/01/01', updatedAt: '2026/06/11 00:00-系統' },
];

const FAC_TAX_COLS_INIT: ColDef<FactoryTaxRecord>[] = [
  { key: 'factoryCode',   label: 'SAP工廠代號', width: 160, minWidth: 120 },
  { key: 'companyCode',   label: '公司(代碼)',  width: 200, minWidth: 140 },
  { key: 'bondedType',    label: '保稅/非保',   width: 120, minWidth: 100 },
  { key: 'invoiceType',   label: '發票聯式',    width: 240, minWidth: 140 },
  { key: 'taxCode',       label: '稅碼',        width: 120, minWidth: 80  },
  { key: 'taxRate',       label: '稅率',        width: 100, minWidth: 80  },
  { key: 'effectiveDate', label: '生效日期',    width: 160, minWidth: 120 },
  { key: 'updatedAt',     label: '更新時間-人員', width: 260, minWidth: 180 },
  { key: 'id',            label: '操作',        width: 100, minWidth: 100, required: true },
];

// ── 新增工廠稅率 Dialog ────────────────────────────────────────────
interface AddFactoryTaxDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (record: Omit<FactoryTaxRecord, 'id' | 'updatedAt'>) => void;
  existingData: FactoryTaxRecord[];
}

// 小工具：浮動標籤輸入框
function FieldInput({
  label, value, onChange, placeholder, maxLength, type = 'text', suffix, hasError,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; type?: string;
  suffix?: string; hasError?: boolean;
}) {
  const borderColor = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor  = hasError ? '#ff5630' : '#637381';
  return (
    <div style={{ position: 'relative', height: 54 }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 8, border: `1px solid ${borderColor}` }} />
      <div style={{ position: 'absolute', top: -5, left: 14, display: 'flex', alignItems: 'center', padding: '0 2px', zIndex: 10 }}>
        <div style={{ position: 'absolute', background: 'white', height: 2, left: 0, right: 0, top: 5 }} />
        <p style={{ fontSize: 12, fontWeight: 600, color: labelColor, position: 'relative' }}>{label}</p>
      </div>
      <div className="flex items-center gap-[8px] px-[14px]" style={{ height: 54 }}>
        <input
          type={type}
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? 'any' : undefined}
          maxLength={maxLength}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? ''}
          className="flex-1 bg-transparent text-[14px] text-[#1c252e] placeholder:text-[#919eab] outline-none"
          style={type === 'number' ? { appearance: 'textfield' } : undefined}
        />
        {suffix && <span className="text-[14px] font-semibold text-[#637381] shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

// 浮動標籤日期選擇器
function FieldDatePicker({
  label, value, onChange, hasError,
}: {
  label: string; value: string; onChange: (v: string) => void; hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const borderColor = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor  = hasError ? '#ff5630' : '#637381';
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left });
    setOpen(v => !v);
  };
  return (
    <div style={{ position: 'relative', height: 54 }} onClick={handleClick}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 8, border: `1px solid ${borderColor}` }} />
      <div style={{ position: 'absolute', top: -5, left: 14, display: 'flex', alignItems: 'center', padding: '0 2px', zIndex: 10 }}>
        <div style={{ position: 'absolute', background: 'white', height: 2, left: 0, right: 0, top: 5 }} />
        <p style={{ fontSize: 12, fontWeight: 600, color: labelColor, position: 'relative' }}>{label}</p>
      </div>
      <div className="flex items-center gap-[8px] px-[14px] cursor-pointer" style={{ height: 54 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#919eab" strokeWidth="1.5"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="#919eab" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className={`text-[14px] flex-1 ${value ? 'text-[#1c252e]' : 'text-[#919eab]'}`}>{value || '選擇日期...'}</span>
      </div>
      {open && (
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }} onClick={e => e.stopPropagation()}>
          <SimpleDatePicker selectedDate={value} onDateSelect={d => { onChange(d); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function AddFactoryTaxDialog({ open, onClose, onConfirm, existingData }: AddFactoryTaxDialogProps) {
  const [factoryCode,  setFactoryCode]  = useState('');
  const [companyCode,  setCompanyCode]  = useState('');
  const [bondedType,   setBondedType]   = useState('');
  const [invoiceType,  setInvoiceType]  = useState('');
  const [taxCode,      setTaxCode]      = useState('');
  const [taxRateStr,   setTaxRateStr]   = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!factoryCode.trim())  e.factoryCode  = '必填';
    if (!companyCode)         e.companyCode  = '必選';
    if (!bondedType)          e.bondedType   = '必選';
    if (!taxRateStr || isNaN(Number(taxRateStr))) e.taxRate = '必填，請輸入數字';
    if (!effectiveDate) {
      e.effectiveDate = '必填';
    } else if (factoryCode && companyCode && bondedType &&
      existingData.some(r =>
        r.factoryCode === factoryCode.trim() &&
        r.companyCode === companyCode &&
        r.bondedType  === bondedType &&
        r.effectiveDate === effectiveDate
      )
    ) {
      e.effectiveDate = `該工廠+公司+保稅別已有相同生效日期（${effectiveDate}）的稅率設定`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onConfirm({ factoryCode: factoryCode.trim(), companyCode, bondedType, invoiceType, taxCode, taxRate: Number(taxRateStr), effectiveDate });
    handleClose();
  };

  const handleClose = () => {
    setFactoryCode(''); setCompanyCode(''); setBondedType(''); setInvoiceType('');
    setTaxCode(''); setTaxRateStr(''); setEffectiveDate(''); setErrors({});
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center"
      style={{ background: 'rgba(28,37,46,0.45)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-[520px] max-w-[calc(100vw-48px)] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[16px] border-b border-[rgba(145,158,171,0.12)] sticky top-0 bg-white z-10">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e]">新增工廠稅率</p>
          <button onClick={handleClose} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.08)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#637381" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-[24px] py-[20px] flex flex-col gap-[20px]">

          {/* SAP工廠代號 */}
          <div>
            <FieldInput
              label="SAP工廠代號"
              value={factoryCode}
              onChange={v => { setFactoryCode(v); setErrors(p => ({ ...p, factoryCode: '' })); }}
              placeholder="請輸入工廠代號（最多10字）"
              maxLength={10}
              hasError={!!errors.factoryCode}
            />
            {errors.factoryCode && <p className="mt-[4px] text-[#ff5630] text-[12px]">{errors.factoryCode}</p>}
          </div>

          {/* 公司(代碼) */}
          <div>
            <DropdownSelect
              label="公司(代碼)"
              value={companyCode}
              onChange={v => { setCompanyCode(v); setErrors(p => ({ ...p, companyCode: '' })); }}
              options={COMPANY_CODE_OPTIONS_EDIT}
              searchable={false}
              hasError={!!errors.companyCode}
            />
            {errors.companyCode && <p className="mt-[4px] text-[#ff5630] text-[12px]">{errors.companyCode}</p>}
          </div>

          {/* 保稅/非保稅 */}
          <div>
            <DropdownSelect
              label="保稅/非保稅"
              value={bondedType}
              onChange={v => { setBondedType(v); setErrors(p => ({ ...p, bondedType: '' })); }}
              options={BONDED_TYPE_OPTIONS_EDIT}
              searchable={false}
              hasError={!!errors.bondedType}
            />
            {errors.bondedType && <p className="mt-[4px] text-[#ff5630] text-[12px]">{errors.bondedType}</p>}
          </div>

          {/* 發票聯式（非必選） */}
          <div>
            <DropdownSelect
              label="發票聯式"
              value={invoiceType}
              onChange={setInvoiceType}
              options={INVOICE_TYPE_OPTIONS_WITH_NA}
              searchable={false}
            />
          </div>

          {/* 稅碼 */}
          <div>
            <FieldInput
              label="稅碼"
              value={taxCode}
              onChange={setTaxCode}
              placeholder="請輸入稅碼（最多10字）"
              maxLength={10}
            />
          </div>

          {/* 稅率 */}
          <div>
            <FieldInput
              label="稅率"
              value={taxRateStr}
              onChange={v => { setTaxRateStr(v); setErrors(p => ({ ...p, taxRate: '' })); }}
              placeholder="0"
              type="number"
              suffix="%"
              hasError={!!errors.taxRate}
            />
            {errors.taxRate && <p className="mt-[4px] text-[#ff5630] text-[12px]">{errors.taxRate}</p>}
          </div>

          {/* 生效日期 */}
          <div>
            <FieldDatePicker
              label="生效日期"
              value={effectiveDate}
              onChange={v => { setEffectiveDate(v); setErrors(p => ({ ...p, effectiveDate: '' })); }}
              hasError={!!errors.effectiveDate}
            />
            {errors.effectiveDate && <p className="mt-[4px] text-[#ff5630] text-[12px]">{errors.effectiveDate}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[24px] pb-[24px] pt-[8px]">
          <button
            onClick={handleClose}
            className="h-[40px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] text-[14px] font-semibold text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="h-[40px] px-[20px] rounded-[8px] bg-[#005eb8] text-white text-[14px] font-semibold hover:bg-[#003d82] transition-colors"
          >
            確認新增
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 修改工廠稅率 Dialog ────────────────────────────────────────────
interface EditFactoryTaxDialogProps {
  open: boolean;
  record: FactoryTaxRecord | null;
  onClose: () => void;
  onConfirm: (id: number, taxRate: number, taxCode: string, effectiveDate: string) => void;
  existingData: FactoryTaxRecord[];
}

function EditFactoryTaxDialog({ open, record, onClose, onConfirm, existingData }: EditFactoryTaxDialogProps) {
  const [taxRateStr,    setTaxRateStr]    = useState('');
  const [taxCode,       setTaxCode]       = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (record) {
      setTaxRateStr(String(record.taxRate));
      setTaxCode(record.taxCode ?? '');
      setEffectiveDate(record.effectiveDate);
      setErrors({});
    }
  }, [record]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!taxRateStr || isNaN(Number(taxRateStr))) e.taxRate = '必填，請輸入數字';
    if (!effectiveDate) {
      e.effectiveDate = '必填';
    } else if (record && existingData.some(r =>
      r.id !== record.id &&
      r.factoryCode === record.factoryCode &&
      r.companyCode === record.companyCode &&
      r.bondedType  === record.bondedType &&
      r.effectiveDate === effectiveDate
    )) {
      e.effectiveDate = `該工廠+公司+保稅別已有相同生效日期（${effectiveDate}）的稅率設定`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!record || !validate()) return;
    onConfirm(record.id, Number(taxRateStr), taxCode, effectiveDate);
    onClose();
  };

  // 公司、保稅別、發票聯式的顯示用 label
  const companyLabel   = COMPANY_CODE_OPTIONS.find(o => o.value === record?.companyCode)?.label ?? record?.companyCode ?? '';
  const invoiceLabel   = INVOICE_TYPE_OPTIONS_WITH_NA.find(o => o.value === (record?.invoiceType ?? ''))?.label ?? record?.invoiceType ?? '';

  if (!open || !record) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center"
      style={{ background: 'rgba(28,37,46,0.45)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-[520px] max-w-[calc(100vw-48px)] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[16px] border-b border-[rgba(145,158,171,0.12)] sticky top-0 bg-white z-10">
          <div>
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e]">修改工廠稅率</p>
            <p className="text-[13px] text-[#637381] mt-[2px]">工廠：{record.factoryCode}　公司：{companyLabel}　{record.bondedType}</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.08)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#637381" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-[24px] py-[20px] flex flex-col gap-[20px]">

          {/* 唯讀資訊小提示區 */}
          <div className="rounded-[8px] px-[14px] py-[10px] flex flex-col gap-[4px]" style={{ backgroundColor: 'rgba(145,158,171,0.06)', border: '1px solid rgba(145,158,171,0.16)' }}>
            <p className="text-[12px] text-[#637381] font-semibold mb-[2px]">唯讀欄位（不可修改）</p>
            <div className="grid grid-cols-2 gap-x-[16px] gap-y-[4px]">
              <span className="text-[13px] text-[#637381]">SAP工廠代號：<span className="text-[#1c252e] font-semibold">{record.factoryCode}</span></span>
              <span className="text-[13px] text-[#637381]">公司：<span className="text-[#1c252e] font-semibold">{companyLabel}</span></span>
              <span className="text-[13px] text-[#637381]">保稅/非保：<span className="text-[#1c252e] font-semibold">{record.bondedType}</span></span>
              <span className="text-[13px] text-[#637381]">發票聯式：<span className="text-[#1c252e] font-semibold">{invoiceLabel || '（不適用）'}</span></span>
            </div>
          </div>

          {/* 稅率（可改） */}
          <div>
            <FieldInput
              label="稅率"
              value={taxRateStr}
              onChange={v => { setTaxRateStr(v); setErrors(p => ({ ...p, taxRate: '' })); }}
              placeholder="0"
              type="number"
              suffix="%"
              hasError={!!errors.taxRate}
            />
            {errors.taxRate && <p className="mt-[4px] text-[#ff5630] text-[12px]">{errors.taxRate}</p>}
          </div>

          {/* 稅碼（可改） */}
          <div>
            <FieldInput
              label="稅碼"
              value={taxCode}
              onChange={setTaxCode}
              placeholder="請輸入稅碼（最多10字）"
              maxLength={10}
            />
          </div>

          {/* 生效日期（可改） */}
          <div>
            <FieldDatePicker
              label="生效日期"
              value={effectiveDate}
              onChange={v => { setEffectiveDate(v); setErrors(p => ({ ...p, effectiveDate: '' })); }}
              hasError={!!errors.effectiveDate}
            />
            {errors.effectiveDate && <p className="mt-[4px] text-[#ff5630] text-[12px]">{errors.effectiveDate}</p>}
          </div>
        </div>


        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[24px] pb-[24px] pt-[8px]">
          <button
            onClick={onClose}
            className="h-[40px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] text-[14px] font-semibold text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="h-[40px] px-[20px] rounded-[8px] bg-[#005eb8] text-white text-[14px] font-semibold hover:bg-[#003d82] transition-colors"
          >
            確認修改
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 刪除確認 Dialog ──────────────────────────────────────────────────────────
interface DeleteConfirmDialogProps {
  open: boolean;
  record: FactoryTaxRecord | null;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmDialog({ open, record, onClose, onConfirm }: DeleteConfirmDialogProps) {
  if (!open || !record) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center"
      style={{ background: 'rgba(28,37,46,0.45)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-[420px] max-w-[calc(100vw-48px)] flex flex-col">
        <div className="flex items-start gap-[16px] px-[24px] pt-[24px] pb-[20px]">
          <div className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[rgba(255,86,48,0.08)] shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#ff5630" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] text-[#1c252e]">確認刪除</p>
            <p className="text-[14px] text-[#637381] mt-[6px] leading-[22px]">
              確定要刪除工廠 <span className="font-semibold text-[#1c252e]">{record.factoryCode}</span> 稅率 <span className="font-semibold text-[#1c252e]">{record.taxRate}%</span>（生效日期 {record.effectiveDate}）的設定嗎？此操作無法還原。
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-[12px] px-[24px] pb-[24px]">
          <button
            onClick={onClose}
            className="h-[40px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] text-[14px] font-semibold text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="h-[40px] px-[20px] rounded-[8px] bg-[#ff5630] text-white text-[14px] font-semibold hover:bg-[#b71d18] transition-colors"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── FactoryTaxTab 主體 ───────────────────────────────────────────────────────
function FactoryTaxTab() {
  const STORAGE_KEY     = 'invoice-settings-factory-tax-v2';
  const DATA_STORAGE_KEY = 'invoice-settings-factory-tax-data';
  const [data, setData] = useState<FactoryTaxRecord[]>(() => {
    try {
      const saved = localStorage.getItem(DATA_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { version: number; records: FactoryTaxRecord[] };
        if (parsed.version === FACTORY_TAX_DATA_VERSION) return parsed.records;
      }
    } catch { /* ignore */ }
    return FACTORY_TAX_DATA_INIT;
  });
  const [cols, setCols] = useTableCols<FactoryTaxRecord>(FAC_TAX_COLS_INIT, STORAGE_KEY);
  const [tempCols, setTempCols] = useState<ColDef<FactoryTaxRecord>[]>([]);
  const [showColSelector, setShowColSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  // 搜尋
  const [filterFactory, setFilterFactory] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterTaxRate, setFilterTaxRate] = useState('');

  // Dialog states
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<FactoryTaxRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FactoryTaxRecord | null>(null);

  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // 搜尋過濾
  const searchFiltered = useMemo(() =>
    data.filter(r =>
      (!filterFactory || r.factoryCode === filterFactory) &&
      (!filterCompany  || r.companyCode === filterCompany) &&
      (!filterTaxRate  || String(r.taxRate).includes(filterTaxRate.trim()))
    ),
    [data, filterFactory, filterCompany, filterTaxRate]
  );

  const filtered = useMemo(() => {
    if (appliedFilters.length === 0) return searchFiltered;
    return searchFiltered.filter(row =>
      appliedFilters.every(f => {
        if (!f.column) return true;
        const val = String((row as any)[f.column] ?? '');
        const fv = f.value ?? '';
        switch (f.operator) {
          case 'contains': return val.toLowerCase().includes(fv.toLowerCase());
          case 'equals': return val.toLowerCase() === fv.toLowerCase();
          case 'notEquals': return val.toLowerCase() !== fv.toLowerCase();
          case 'startsWith': return val.toLowerCase().startsWith(fv.toLowerCase());
          case 'endsWith': return val.toLowerCase().endsWith(fv.toLowerCase());
          case 'isEmpty': return !val.trim();
          case 'isNotEmpty': return !!val.trim();
          default: return true;
        }
      })
    );
  }, [searchFiltered, appliedFilters]);

  const sorted = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String((a as any)[sortConfig.key!] ?? '');
      const bv = String((b as any)[sortConfig.key!] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortConfig]);

  useEffect(() => { setPage(1); }, [sorted.length]);

  const paginated = useMemo(() => {
    const s = (page - 1) * perPage;
    return sorted.slice(s, s + perPage);
  }, [sorted, page, perPage]);

  const visibleCols = cols.filter(c => c.visible !== false);

  const moveCol = useCallback((drag: string, hover: string) => {
    setCols(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, [setCols]);

  const updateWidth = useCallback((key: string, w: number) => {
    setCols(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, [setCols]);

  const autoFitWidth = useCallback((key: string) => {
    setCols(prev => {
      const col = prev.find(c => c.key === key);
      if (!col) return prev;
      const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 48;
      let maxDataW = 0;
      data.forEach(row => {
        const val = String((row as any)[key] ?? '');
        const w = measureTextWidth(val, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
      const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
      return prev.map(c => c.key === key ? { ...c, width: bestFit } : c);
    });
  }, [setCols, data]);

  const handleSort = (key: string) => {
    setSortConfig(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const totalWidth = visibleCols.reduce((s, c) => s + c.width, 0);

  // 資料持久化：data 變動時自動存入 localStorage（含版本號）
  useEffect(() => {
    try { localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify({ version: FACTORY_TAX_DATA_VERSION, records: data })); } catch { /* ignore */ }
  }, [data]);

  // CRUD handlers
  const makeTimestamp = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}-OOO`;
  };

  const handleAdd = (record: Omit<FactoryTaxRecord, 'id' | 'updatedAt'>) => {
    const newId = Math.max(0, ...data.map(d => d.id)) + 1;
    setData(prev => [...prev, { ...record, id: newId, updatedAt: makeTimestamp() }]);
  };

  const handleEdit = (id: number, taxRate: number, taxCode: string, effectiveDate: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, taxRate, taxCode, effectiveDate, updatedAt: makeTimestamp() } : r));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setData(prev => prev.filter(r => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // 篩選 tags
  const activeTags: { label: string; onClear: () => void }[] = [];
  if (filterFactory) activeTags.push({ label: `工廠：${filterFactory}`, onClear: () => setFilterFactory('') });
  if (filterCompany) activeTags.push({ label: `公司：${COMPANY_CODE_OPTIONS.find(o => o.value === filterCompany)?.label ?? filterCompany}`, onClear: () => setFilterCompany('') });
  const clearAll = () => { setFilterFactory(''); setFilterCompany(''); setFilterTaxRate(''); };

  // 新增按鈕（放在 toolbar actionButton）
  const addButton = (
    <button
      onClick={() => setShowAdd(true)}
      className="flex items-center gap-[6px] h-[34px] px-[14px] rounded-[8px] bg-[#005eb8] text-white text-[13px] font-semibold hover:bg-[#003d82] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      新增
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap px-[20px] pt-[16px] pb-[16px]">
        {/* 工廠 */}
        <div className="flex-1 min-w-[140px]">
          <DropdownSelect
            label="工廠"
            value={filterFactory}
            onChange={setFilterFactory}
            searchable
            options={[
              { value: '', label: '全部' },
              ...Array.from(new Set(data.map(r => r.factoryCode)))
                .sort()
                .map(code => ({ value: code, label: code })),
            ]}
          />
        </div>
        {/* 公司 */}
        <div className="flex-1 min-w-[160px]">
          <DropdownSelect
            label="公司(代碼)"
            value={filterCompany}
            onChange={setFilterCompany}
            searchable={false}
            options={COMPANY_CODE_OPTIONS}
          />
        </div>
        {/* 稅率關鍵字搜尋 */}
        <div className="flex-1 min-w-[140px]" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', height: 54, overflow: 'visible' }}>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                borderRadius: 8, border: '1px solid rgba(145,158,171,0.2)',
              }}
            />
            <div style={{ position: 'absolute', top: -5, left: 14, display: 'flex', alignItems: 'center', padding: '0 2px', zIndex: 10 }}>
              <div style={{ position: 'absolute', background: 'white', height: 2, left: 0, right: 0, top: 5 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: '#637381', position: 'relative' }}>稅率</p>
            </div>
            <div className="flex items-center gap-[8px] px-[14px]" style={{ height: 54 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M21 21L15 15M17 11C17 14.3137 14.3137 17 11 17C7.68629 17 5 14.3137 5 11C5 7.68629 7.68629 5 11 5C14.3137 5 17 7.68629 17 11Z" stroke="#919EAB" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={filterTaxRate}
                onChange={e => setFilterTaxRate(e.target.value)}
                placeholder="搜尋稅率..."
                className="flex-1 bg-transparent text-[14px] text-[#1c252e] placeholder:text-[#919eab] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <TableToolbar
        resultsCount={filtered.length}
        showColumnSelector={showColSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => { setTempCols(JSON.parse(JSON.stringify(cols))); setShowColSelector(v => !v); }}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={() => { /* TODO */ }}
        actionButton={addButton}
        columnsButton={
          <ColumnSelector
            columns={tempCols.filter(c => !c.required) as Parameters<typeof ColumnSelector>[0]['columns']}
            onToggleColumn={key => setTempCols(tempCols.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={all => setTempCols(tempCols.map(c => c.required ? c : { ...c, visible: all }))}
            onClose={() => setShowColSelector(false)}
            onApply={() => { setCols(tempCols as ColDef<FactoryTaxRecord>[]); setShowColSelector(false); }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={FAC_TAX_COLS_INIT.filter(c => !c.required).map(c => ({ key: c.key, label: c.label }))}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={(vf) => { setAppliedFilters(vf); setShowFilterDialog(false); setPage(1); }}
          />
        }
      />

      {/* 篩選標籤列 */}
      {activeTags.length > 0 && (
        <div className="shrink-0 flex items-center gap-[8px] px-[20px] pb-[12px] flex-wrap">
          {activeTags.map((tag, i) => (
            <div key={i} className="flex items-center gap-[4px] bg-[rgba(0,94,184,0.08)] px-[10px] py-[4px] rounded-[6px]">
              <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{tag.label}</span>
              <button onClick={tag.onClear} className="flex items-center justify-center w-[16px] h-[16px] hover:opacity-70 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M8 2L2 8M2 2L8 8" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={clearAll} className="flex items-center gap-[4px] text-[#ff5630] hover:opacity-70 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px]">Clear</span>
          </button>
        </div>
      )}

      {/* 表格 */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleCols.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  moveColumn={moveCol}
                  updateColumnWidth={updateWidth}
                  autoFitWidth={autoFitWidth}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={col.key === 'id' ? () => {} : handleSort}
                  isLast={idx === visibleCols.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType={DRAG_TYPE_FAC_TAX}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginated.map(row => (
              <div
                key={row.id}
                className="flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors"
                style={{ minHeight: 64 }}
              >
                {visibleCols.map((col, ci) => (
                  <div
                    key={`${row.id}-${col.key}`}
                    style={{ width: col.width }}
                    className={`flex items-center px-[16px] overflow-hidden ${ci < visibleCols.length - 1 ? 'border-r border-[rgba(145,158,171,0.08)]' : ''}`}
                  >
                    {col.key === 'id' ? (
                      <ActionCellButtons
                        onEdit={() => setEditTarget(row)}
                        onDelete={() => setDeleteTarget(row)}
                      />
                    ) : col.key === 'taxRate' ? (
                      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full">
                        {row.taxRate}%
                      </p>
                    ) : col.key === 'companyCode' ? (
                      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full">
                        {COMPANY_CODE_OPTIONS.find(o => o.value === row.companyCode)?.label ?? row.companyCode}
                      </p>
                    ) : col.key === 'invoiceType' ? (
                      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full">
                        {INVOICE_TYPE_OPTIONS_WITH_NA.find(o => o.value === (row.invoiceType ?? ''))?.label ?? row.invoiceType}
                      </p>
                    ) : (
                      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full">
                        {String((row as any)[col.key] ?? '')}
                      </p>
                    )}
                  </div>
                ))}
                <div className="flex-1 min-w-0" />
              </div>
            ))}

            {paginated.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* 分頁 */}
      <div className="shrink-0 flex items-center bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page}
          totalItems={sorted.length}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>

      {/* Dialogs */}
      <AddFactoryTaxDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onConfirm={handleAdd}
        existingData={data}
      />
      <EditFactoryTaxDialog
        open={!!editTarget}
        record={editTarget}
        onClose={() => setEditTarget(null)}
        onConfirm={handleEdit}
        existingData={data}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        record={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 主頁面元件

type TabKey = 'track' | 'deadline' | 'factory-tax';

export function InvoiceSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('track');

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* TAB 列 */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        {/* 字軌主檔 */}
        <div
          onClick={() => setActiveTab('track')}
          className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
        >
          {activeTab === 'track' && (
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
          )}
          <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${activeTab === 'track' ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
            字軌主檔
          </p>
        </div>

        {/* 發票截止日期 */}
        <div
          onClick={() => setActiveTab('deadline')}
          className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
        >
          {activeTab === 'deadline' && (
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
          )}
          <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${activeTab === 'deadline' ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
            發票截止日期
          </p>
        </div>

        {/* 工廠稅率 */}
        <div
          onClick={() => setActiveTab('factory-tax')}
          className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
        >
          {activeTab === 'factory-tax' && (
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
          )}
          <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${activeTab === 'factory-tax' ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
            工廠稅率
          </p>
        </div>

        {/* 底部灰色底線 */}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* TAB 內容 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {activeTab === 'track' && <TrackTab />}
        {activeTab === 'deadline' && <DeadlineTab />}
        {activeTab === 'factory-tax' && <FactoryTaxTab />}
      </div>
    </div>
  );
}
