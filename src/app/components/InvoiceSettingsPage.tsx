/**
 * InvoiceSettingsPage — 發票設定
 *
 * 兩個 TAB：
 *  1. 字軌主檔：資料更新時間（SAP拉取）、年、月、稅碼、字軌
 *  2. 發票截止日期：年、月、截止日期（連結，點擊開啟日期選擇器）、更新時間-人員
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
import { DropdownSelect } from './DropdownSelect';


// ── react-dnd drag types ──────────────────────────────────────────────────────
const DRAG_TYPE_TRACK = 'invoice-track-col';
const DRAG_TYPE_DEAD  = 'invoice-deadline-col';

// ──────────────────────────────────────────────────────────────────────────────
// Mock 資料：字軌主檔
interface TrackRecord {
  id: number;
  year: string;
  month: string;
  taxCode: string;
  track: string;
}

const TRACK_DATA: TrackRecord[] = [
  { id: 1,  year: '2025', month: '01', taxCode: 'V0', track: 'HT' },
  { id: 2,  year: '2025', month: '01', taxCode: 'V0', track: 'HU' },
  { id: 3,  year: '2025', month: '02', taxCode: 'V0', track: 'HT' },
  { id: 4,  year: '2025', month: '02', taxCode: 'V0', track: 'HV' },
  { id: 5,  year: '2025', month: '03', taxCode: 'V1', track: 'JA' },
  { id: 6,  year: '2025', month: '03', taxCode: 'V1', track: 'JB' },
  { id: 7,  year: '2025', month: '04', taxCode: 'V0', track: 'HW' },
  { id: 8,  year: '2025', month: '04', taxCode: 'V0', track: 'HX' },
  { id: 9,  year: '2025', month: '05', taxCode: 'V0', track: 'HY' },
  { id: 10, year: '2025', month: '05', taxCode: 'V1', track: 'JC' },
  { id: 11, year: '2025', month: '06', taxCode: 'V0', track: 'HZ' },
  { id: 12, year: '2024', month: '01', taxCode: 'V0', track: 'GT' },
  { id: 13, year: '2024', month: '02', taxCode: 'V0', track: 'GU' },
  { id: 14, year: '2024', month: '03', taxCode: 'V1', track: 'IA' },
];

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
        const valid = new Set(initialCols.map(c => c.key));
        const filtered = parsed.filter(c => valid.has(c.key));
        return filtered.length === initialCols.length ? filtered : initialCols.map(c => ({ ...c }));
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
          <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#005eb8] whitespace-nowrap ml-[8px]">
            資料更新時間：{dataUpdateTime}
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
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); setPage(1); }}
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
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); setPage(1); }}
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
// 主頁面元件

type TabKey = 'track' | 'deadline';

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

        {/* 底部灰色底線 */}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* TAB 內容 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {activeTab === 'track' ? <TrackTab /> : <DeadlineTab />}
      </div>
    </div>
  );
}
