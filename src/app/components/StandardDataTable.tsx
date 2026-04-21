/**
 * StandardDataTable — 專案標準表格元件
 *
 * 功能清單（符合表格系統規範）：
 *  ✅ DnD 欄位拖拉重排  (react-dnd)
 *  ✅ 欄位排序（點表頭）
 *  ✅ 欄位拖拽調整寬度  (re-resizable)
 *  ✅ 橫向拖拉捲動      (useHorizontalDragScroll)
 *  ✅ Checkbox 多選
 *  ✅ TableToolbar（Columns / Filters / Export）
 *  ✅ ColumnSelector 欄位顯示/隱藏
 *  ✅ FilterDialog 進階篩選
 *  ✅ localStorage 記憶欄位順序/寬度/可見性
 *  ✅ PaginationControls 分頁
 *
 * 使用方式：
 *  1. 定義 columns: StandardColumn<T>[]
 *  2. 提供 data: T[]（T 需有 id: number）
 *  3. 選填：onExportCsv、onExportExcel、actionButton 等
 *
 * 範例參考：OrderScheduleInquiryPage.tsx
 */

import { useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { CheckboxIcon } from './CheckboxIcon';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';

// ── 泛型欄位定義 ──────────────────────────────────────────────────────────────
export interface StandardColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
  /** true → 不展示於欄位選擇器，無法被使用者隱藏 */
  required?: boolean;
  /** 自訂 cell 渲染（不傳則預設顯示字串） */
  renderCell?: (value: unknown, row: T) => ReactNode;
}

// ── 表格 Props ────────────────────────────────────────────────────────────────
export interface StandardDataTableProps<T extends { id: number }> {
  /** 欄位定義 */
  columns: StandardColumn<T>[];
  /** 資料列 */
  data: T[];
  /** localStorage key（不同頁面需不同 key，避免衝突） */
  storageKey: string;
  /** Toolbar 匯出 CSV 回調（不傳則不顯示 Export） */
  onExportCsv?: () => void;
  /** Toolbar 匯出 Excel 回調 */
  onExportExcel?: () => void;
  /** Toolbar 右側自訂按鈕區 */
  actionButton?: ReactNode;
  /** 空資料時的提示文字 */
  emptyText?: string;
  /** 每列最小高度（預設 64px） */
  rowHeight?: number;
  /** 是否顯示 Checkbox 欄（預設 true） */
  showCheckbox?: boolean;
  /** 已選取的 ID 集合（受控模式） */
  selectedIds?: Set<number>;
  /** 切換單列 Checkbox */
  onToggleRow?: (id: number) => void;
  /** 切換全選 */
  onToggleAll?: (ids: number[]) => void;
  /** 外部篩選條件（如頁面頂部搜尋已做了第一層過濾） */
  externalFilteredData?: T[];
  /** 點擊列的回調 */
  onRowClick?: (row: T) => void;
}

// ── 欄位拖拉型別 ──────────────────────────────────────────────────────────────
const DRAG_TYPE = 'std-col';

// ── 可拖拉排序的表頭欄 ────────────────────────────────────────────────────────
function DraggableColHeader<T extends { id: number }>({
  col, index, moveCol, updateWidth, sortConfig, onSort, isLast,
}: {
  col: StandardColumn<T>;
  index: number;
  moveCol: (drag: string, hover: string) => void;
  updateWidth: (key: string, w: number) => void;
  sortConfig: { key: string | null; dir: 'asc' | 'desc' | null };
  onSort: (key: string) => void;
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
    hover: (item: { key: string; index: number }) => {
      if (item.index !== index) {
        moveCol(item.key, col.key);
        item.index = index;
      }
    },
  });

  const isSorted = sortConfig.key === col.key;

  return (
    <Resizable
      size={{ width: col.width, height: 56 }}
      minWidth={col.minWidth}
      maxWidth={900}
      enable={{ right: true }}
      onResizeStop={(_e, _d, _r, delta) => updateWidth(col.key, col.width + delta.width)}
      handleStyles={{ right: { width: '4px', right: 0, cursor: 'col-resize', background: 'transparent', zIndex: 1 } }}
      handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
      className={`bg-[#f4f6f8] ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
    >
      <div
        ref={node => drag(drop(node)) as unknown as void}
        className={`h-full flex items-center px-[16px] cursor-pointer select-none ${isDragging ? 'opacity-50' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSort(col.key)}
      >
        {/* 6-dot drag handle（hover 顯示） */}
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
        {/* 排序箭頭 */}
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

// ── 主元件 ────────────────────────────────────────────────────────────────────
const CHECKBOX_COL_W = 52;

export function StandardDataTable<T extends { id: number }>({
  columns: initialColumns,
  data,
  storageKey,
  onExportCsv,
  onExportExcel,
  actionButton,
  emptyText = '無符合條件的資料',
  rowHeight = 64,
  showCheckbox = true,
  selectedIds: controlledSelectedIds,
  onToggleRow,
  onToggleAll,
  externalFilteredData,
  onRowClick,
}: StandardDataTableProps<T>) {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── 欄位狀態（從 localStorage 載入，保留上次拖拉/可見/寬度設定）──────────
  const loadCols = (): StandardColumn<T>[] => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as StandardColumn<T>[];
        const validKeys = new Set(initialColumns.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = initialColumns.filter(c => !savedKeys.has(c.key));
        // 補回函式類型屬性（無法 JSON 序列化）及 required（設計時屬性）
        const merged = [...filtered, ...newCols].map(c => {
          const src = initialColumns.find(ic => ic.key === c.key);
          return src ? {
            ...c,
            renderCell: src.renderCell,
            required: src.required,
            label: src.label,
            // required 欄（操作欄）的寬度永遠以 prop 為準，不使用 localStorage 快取值
            ...(src.required ? { width: src.width, minWidth: src.minWidth } : {}),
          } : c;
        });
        return merged as StandardColumn<T>[];
      }
    } catch { /* ignore */ }
    return initialColumns.map(c => ({ ...c }));
  };


  const [columns, setColumns]         = useState<StandardColumn<T>[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<StandardColumn<T>[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog]     = useState(false);
  const [filters, setFilters]                       = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters]         = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });

  // 內部 Checkbox 狀態（非受控模式）
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<number>>(new Set());
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;

  // 分頁
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(100);

  // 儲存欄位設定
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(columns)); } catch { /* ignore */ }
  }, [columns, storageKey]);

  // ── 欄位操作 ────────────────────────────────────────────────────────────────
  const moveCol = useCallback((drag: string, hover: string) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev];
      const [removed] = next.splice(di, 1);
      next.splice(hi, 0, removed);
      return next;
    });
  }, []);

  const updateWidth = useCallback((key: string, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  const visibleColumns = columns.filter(c => c.visible !== false);
  // required=true 欄位（操作欄）固定在最右側，其餘欄位正常排列
  const normalVisibleCols = visibleColumns.filter(c => !c.required);
  const stickyRightCols   = visibleColumns.filter(c => !!c.required);

  // ── 進階篩選 ─────────────────────────────────────────────────────────────────
  const baseData = externalFilteredData ?? data;

  const filteredData = useMemo(() => {
    if (appliedFilters.length === 0) return baseData;
    return baseData.filter(row =>
      appliedFilters.every(f => {
        if (!f.column) return true;
        const rawVal = String((row as Record<string, unknown>)[f.column] ?? '');
        const fv = f.value ?? '';
        switch (f.operator) {
          case 'contains':   return rawVal.toLowerCase().includes(fv.toLowerCase());
          case 'equals':     return rawVal.toLowerCase() === fv.toLowerCase();
          case 'notEquals':  return rawVal.toLowerCase() !== fv.toLowerCase();
          case 'startsWith': return rawVal.toLowerCase().startsWith(fv.toLowerCase());
          case 'endsWith':   return rawVal.toLowerCase().endsWith(fv.toLowerCase());
          case 'isEmpty':    return !rawVal || rawVal.trim() === '';
          case 'isNotEmpty': return rawVal.trim() !== '';
          default:           return true;
        }
      })
    );
  }, [baseData, appliedFilters]);

  // ── 排序 ────────────────────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortConfig.key!] ?? '');
      const bv = String((b as Record<string, unknown>)[sortConfig.key!] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  // ── 分頁 ────────────────────────────────────────────────────────────────────
  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

  // ── Checkbox ────────────────────────────────────────────────────────────────
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));

  const handleSelectAll = () => {
    const ids = paginatedData.map(r => r.id);
    if (onToggleAll) {
      onToggleAll(ids);
    } else {
      setInternalSelectedIds(prev => {
        const next = new Set(prev);
        isAllSelected ? ids.forEach(id => next.delete(id)) : ids.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const handleToggleRow = (id: number) => {
    if (onToggleRow) {
      onToggleRow(id);
    } else {
      setInternalSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  // ── 排序 ────────────────────────────────────────────────────────────────────
  const handleSort = (key: string) => {
    setSortConfig(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  // ── totalWidth ───────────────────────────────────────────────────────────────
  const checkboxW = showCheckbox ? CHECKBOX_COL_W : 0;
  const stickyRightW = stickyRightCols.reduce((s, c) => s + c.width, 0);
  const totalWidth = checkboxW + normalVisibleCols.reduce((s, c) => s + c.width, 0) + stickyRightW;

  // ── 渲染 Cell ────────────────────────────────────────────────────────────────
  const renderCellValue = (col: StandardColumn<T>, row: T): ReactNode => {
    const raw = (row as Record<string, unknown>)[col.key];
    if (col.renderCell) return col.renderCell(raw, row);
    const val = raw !== undefined && raw !== null ? String(raw) : '';
    return (
      <p
        title={val}
        className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${val ? 'text-[#1c252e]' : 'text-[#919eab]'}`}
      >
        {val || '—'}
      </p>
    );
  };

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── TableToolbar（Columns / Filters / Export）── */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => {
          setTempColumns(JSON.parse(JSON.stringify(columns)));
          setShowColumnSelector(v => !v);
        }}
        onFiltersClick={() => setShowFilterDialog(v => !v)}
        onExportCsv={onExportCsv}
        onExportExcel={onExportExcel}
        actionButton={actionButton}
        columnsButton={
          <ColumnSelector
            columns={tempColumns.filter(c => !c.required) as Parameters<typeof ColumnSelector>[0]['columns']}
            onToggleColumn={key =>
              setTempColumns(tempColumns.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))
            }
            onToggleAll={all =>
              setTempColumns(tempColumns.map(c => c.required ? c : { ...c, visible: all }))
            }
            onClose={() => setShowColumnSelector(false)}
            onApply={() => {
              setColumns(tempColumns as StandardColumn<T>[]);
              try { localStorage.setItem(storageKey, JSON.stringify(tempColumns)); } catch { /* ignore */ }
              setShowColumnSelector(false);
            }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={initialColumns.map(c => ({ key: c.key, label: c.label }))}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); setPage(1); }}
          />
        }
      />

      {/* ── 已選取工具列 ── */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">
          {showCheckbox && (
            <div className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_COL_W, minWidth: CHECKBOX_COL_W }}>
              <button onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
                <CheckboxIcon checked={isAllSelected} onChange={handleSelectAll} />
              </button>
            </div>
          )}
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] ml-[8px]">
            {selectedIds.size} selected
          </span>
        </div>
      )}

      {/* ── 表格（DnD + 排序 + 欄寬 + 橫向拖拉捲動）── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>

            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {/* Checkbox 欄 */}
              {showCheckbox && (
                <div
                  className="flex items-center justify-center shrink-0 bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)]"
                  style={{ width: CHECKBOX_COL_W, minWidth: CHECKBOX_COL_W, height: 56, position: 'sticky', left: 0, zIndex: 20, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
                >
                  {/* 有選取時隱藏表頭 checkbox，規範同 AdvancedOrderTable */}
                  {selectedIds.size === 0 && (
                    <CheckboxIcon checked={isAllSelected} onChange={handleSelectAll} />
                  )}
                </div>
              )}
              {/* 可拖拉欄位（一般欄） */}
              {normalVisibleCols.map((col, idx) => (
                <DraggableColHeader
                  key={col.key}
                  col={col}
                  index={idx}
                  moveCol={moveCol}
                  updateWidth={updateWidth}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  isLast={idx === normalVisibleCols.length - 1}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
              {/* Sticky-right 操作欄表頭 */}
              {stickyRightCols.map((col) => (
                <div
                  key={col.key}
                  style={{ width: col.width, minWidth: col.minWidth, height: 56, position: 'sticky', right: 0, zIndex: 21, boxShadow: '-2px 0 4px -2px rgba(145,158,171,0.2)' }}
                  className="bg-[#f4f6f8] flex items-center justify-center shrink-0"
                />
              ))}
            </div>

            {/* 資料列 */}
            {paginatedData.map(row => (
              <div
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`flex border-b border-[rgba(145,158,171,0.08)] group transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : 'hover:bg-[rgba(145,158,171,0.04)]'}`}
                style={{ minHeight: rowHeight }}
              >
                {/* Checkbox cell */}
                {showCheckbox && (
                  <div
                    className="flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[rgba(145,158,171,0.04)]"
                    style={{ width: CHECKBOX_COL_W, minWidth: CHECKBOX_COL_W, position: 'sticky', left: 0, zIndex: 4, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
                    onClick={e => { e.stopPropagation(); handleToggleRow(row.id); }}
                  >
                    <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => handleToggleRow(row.id)} />
                  </div>
                )}
                {/* 一般資料欄 */}
                {normalVisibleCols.map((col, ci) => {
                  const isLastNormal = ci === normalVisibleCols.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={{ width: col.width }}
                      className={`flex items-center px-[16px] overflow-hidden ${isLastNormal ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
                    >
                      {renderCellValue(col, row)}
                    </div>
                  );
                })}
                {/* 填充剩餘空間 */}
                <div className="flex-1 min-w-0" />
                {/* Sticky-right 操作欄 */}
                {stickyRightCols.map((col) => (
                  <div
                    key={`${row.id}-${col.key}`}
                    style={{ width: col.width, minWidth: col.minWidth, position: 'sticky', right: 0, zIndex: 4, boxShadow: '-2px 0 4px -2px rgba(145,158,171,0.2)' }}
                    className={`flex items-center justify-center px-[8px] shrink-0 ${
                      selectedIds.has(row.id)
                        ? 'bg-[#eef4fb]'
                        : 'bg-white group-hover:bg-[#f5f6f7]'
                    }`}
                  >
                    {renderCellValue(col, row)}
                  </div>
                ))}
              </div>
            ))}

            {/* 空狀態 */}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">{emptyText}</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── 分頁 ── */}
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
