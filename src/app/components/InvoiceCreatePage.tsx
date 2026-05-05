import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { CheckboxIcon } from './CheckboxIcon';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { PaginationControls } from './PaginationControls';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';
import {
  type InvoiceAcceptRow, type InvCol, type InvColKey,
  DEFAULT_COLS, BONDED_OPTIONS, PURCHASE_ORG_OPTIONS, invoiceMockData,
} from './invoiceCreateData';

const STORAGE_KEY_PREFIX = 'invoiceCreate_v1_';
const CHECKBOX_W = 88;

// ── Cell 渲染 ─────────────────────────────────────────────────────────────────
function getCellValue(row: InvoiceAcceptRow, key: InvColKey): React.ReactNode {
  const v = row[key];
  const s = v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : '—';
  return (
    <p
      className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`}
      title={s}
    >
      {s}
    </p>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function InvoiceCreatePage() {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  const [currentUserEmail] = useState<string>(() => localStorage.getItem('currentUserEmail') || 'default');
  const storageKey = `${STORAGE_KEY_PREFIX}${currentUserEmail}`;

  // ── 欄位狀態 ──
  const loadCols = (): InvCol[] => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as InvCol[];
        const validKeys = new Set(DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as InvColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns] = useState<InvCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<InvCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: InvColKey | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── 搜尋條件 ──
  const [bondedSearch, setBondedSearch] = useState('');
  const [purchaseOrgSearch, setPurchaseOrgSearch] = useState('');
  const [orderNoSearch, setOrderNoSearch] = useState('');

  // ── localStorage 同步 ──
  useEffect(() => {
    if (!showColumnSelector) return;
    try { localStorage.setItem(storageKey, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  // ── 欄位拖拉 ──
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

  // ── 搜尋 + 篩選 ──
  const splitKeywords = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);

  const filteredData = useMemo(() => {
    let data = invoiceMockData;
    if (bondedSearch) {
      // 訂單類型最後一碼：B=保稅, D=非保稅
      data = data.filter(r => {
        const lastChar = r.orderType.slice(-1).toUpperCase();
        if (bondedSearch === '保稅') return lastChar === 'B';
        if (bondedSearch === '非保稅') return lastChar === 'D';
        return true;
      });
    }
    if (purchaseOrgSearch) data = data.filter(r => r.purchaseOrg === purchaseOrgSearch);
    if (orderNoSearch.trim()) {
      const kws = splitKeywords(orderNoSearch);
      data = data.filter(r => kws.some(kw => r.orderNo.toLowerCase().includes(kw)));
    }
    if (appliedFilters.length > 0) {
      data = data.filter(row => appliedFilters.every(f => {
        const val = String(row[f.column as keyof InvoiceAcceptRow] ?? '').toLowerCase();
        const fv = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains': return val.includes(fv);
          case 'equals': return val === fv;
          case 'notEquals': return val !== fv;
          case 'startsWith': return val.startsWith(fv);
          case 'endsWith': return val.endsWith(fv);
          case 'isEmpty': return !val || val.trim() === '';
          case 'isNotEmpty': return val.trim() !== '';
          default: return true;
        }
      }));
    }
    return data;
  }, [bondedSearch, purchaseOrgSearch, orderNoSearch, appliedFilters]);

  // ── 排序 ──
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String(a[sortConfig.key as keyof InvoiceAcceptRow] ?? '');
      const bv = String(b[sortConfig.key as keyof InvoiceAcceptRow] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  // ── 分頁 ──
  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

  // ── 選取 ──
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    isAllSelected ? paginatedData.forEach(r => next.delete(r.id)) : paginatedData.forEach(r => next.add(r.id));
    setSelectedIds(next);
  };

  const handleToggle = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // ── 自動最適欄寬 ──
  const autoFitWidth = useCallback((key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 32 + 16;
    let maxDataW = 0;
    try {
      (sortedData || []).forEach((row: any) => {
        const w = measureTextWidth(String(row[key] ?? ''), '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
        if (w > maxDataW) maxDataW = w;
      });
    } catch { /* */ }
    const bestFit = Math.max(col.minWidth ?? 50, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  }, [columns, sortedData]);

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const totalWidth = CHECKBOX_W + visibleColumns.reduce((s, c) => s + c.width, 0);
  const availableColsForFilter = columns.map(c => ({ key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible }));

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列 ── */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap pl-[20px] pr-[20px] pt-[20px] pb-[16px]">
        <div className="flex-1 min-w-[160px]">
          <DropdownSelect
            label="保稅/非保稅" value={bondedSearch} onChange={setBondedSearch}
            options={BONDED_OPTIONS} placeholder="全部" searchable={false}
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <DropdownSelect
            label="採購組織" value={purchaseOrgSearch} onChange={setPurchaseOrgSearch}
            options={PURCHASE_ORG_OPTIONS} placeholder="全部" searchable={true}
          />
        </div>
        <SearchField label="訂單號碼" value={orderNoSearch} onChange={setOrderNoSearch} />
      </div>

      {/* ── Toolbar ── */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => { setTempColumns(JSON.parse(JSON.stringify(columns))); setShowColumnSelector(!showColumnSelector); }}
        onFiltersClick={() => setShowFilterDialog(!showFilterDialog)}
        columnsButton={
          <ColumnSelector
            columns={tempColumns as any}
            onToggleColumn={(key) => setTempColumns(tempColumns.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={(all) => setTempColumns(tempColumns.map(c => ({ ...c, visible: all })))}
            onClose={() => setShowColumnSelector(false)}
            onApply={() => {
              setColumns(tempColumns);
              try { localStorage.setItem(storageKey, JSON.stringify(tempColumns)); } catch { /* */ }
              setShowColumnSelector(false);
            }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={availableColsForFilter as any}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={(vf) => { setAppliedFilters(vf); setShowFilterDialog(false); }}
          />
        }
        onExportExcel={() => showToast(`已匯出 ${filteredData.length} 筆 (Excel)`)}
        onExportCsv={() => showToast(`已匯出 ${filteredData.length} 筆 (CSV)`)}
        actionButton={<div />}
      />

      {/* ── 選取工具列 ── */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">
          <div data-is-checkbox="true" className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W }}>
            <button data-is-checkbox="true" onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
              <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} />
            </button>
          </div>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] whitespace-nowrap mr-[4px]">
            {selectedIds.size} selected
          </span>
        </div>
      )}

      {/* ── 表格 ── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>

            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              <div
                data-is-checkbox="true"
                className="flex items-center justify-center shrink-0 bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)]"
                style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, height: 56, position: 'sticky', left: 0, zIndex: 20, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
              >
                {selectedIds.size === 0 && (
                  <CheckboxIcon checked={isAllSelected} onChange={handleSelectAll} />
                )}
              </div>
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key} column={col} index={idx}
                  moveColumn={moveCol} updateColumnWidth={updateWidth} autoFitWidth={autoFitWidth}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={(key) => setSortConfig(s => ({ key: key as any, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}
                  isLast={idx === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType="inv-create-col"
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginatedData.map(row => (
              <div
                key={row.id}
                className={`flex border-b border-[rgba(145,158,171,0.08)] h-[76px] hover:bg-[rgba(145,158,171,0.04)] group transition-colors ${selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : ''}`}
              >
                <div
                  data-is-checkbox="true"
                  className="flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                  style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, position: 'sticky', left: 0, zIndex: 4, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
                >
                  <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => handleToggle(row.id)} />
                </div>
                {visibleColumns.map((col, ci) => {
                  const isLast = ci === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                      className={`flex items-center px-[16px] overflow-hidden ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
                    >
                      {getCellValue(row, col.key)}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 空狀態 */}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的已驗收資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── 分頁 ── */}
      <div className="shrink-0 flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page} totalItems={sortedData.length} itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-10.5l-5 5L6 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
