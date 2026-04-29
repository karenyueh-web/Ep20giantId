/**
 * ShipmentPrintDocPage — 出貨單 • 列印單據
 *
 * 完全對齊 ShipmentShippingInquiryPage 設計系統標準：
 *  - TAB: gap-[40px] / absolute border-b-2 inset-0 / font-medium text-[14px]
 *  - 表頭: flex sticky / DraggableColHeader / bg-[#f4f6f8] / h-56 / custom-scrollbar
 *  - 資料列: flex / sticky checkbox / border-b border-[rgba(145,158,171,0.08)]
 *  - Selection toolbar: bg-[#d9e8f5] / text-[#004680] / span + hover:opacity-70
 *  - TableToolbar: resultsCount / showColumnSelector / columnsButton / filtersButton
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
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
import { MOCK_SHIPMENTS } from './ShipmentListPage';
import {
  buildBoxRows, buildItemRows,
  BOX_DEFAULT_COLS, ITEM_DEFAULT_COLS,
  VENDOR_OPTIONS, TRANSPORT_LABEL,
  type BoxLineRow, type ShipmentItemRow,
  type BoxCol, type BoxColKey,
  type ItemCol, type ItemColKey,
} from './ShipmentShippingInquiryPage';
import { ShipmentPrintPage, type PrintTab } from './ShipmentPrintPage';
import React from 'react';

// ── DnD drag type ─────────────────────────────────────────────────────────────
const DRAG_BOX  = 'printdoc-box-col';
const DRAG_ITEM = 'printdoc-item-col';

// ── 共用 ──────────────────────────────────────────────────────────────────────
const CHECKBOX_W = 52;

// ── TAB 定義 ──────────────────────────────────────────────────────────────────
type MainTab = 'sticker-warehouse' | 'sticker-giant' | 'sticker-vendor' | 'doc-vendor';
const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'sticker-warehouse', label: '列印外箱貼紙（倉儲）' },
  { id: 'sticker-giant',     label: '列印外箱貼紙（幼獅）' },
  { id: 'sticker-vendor',    label: '列印外箱貼紙（下包商）' },
  { id: 'doc-vendor',        label: '列印出貨單（下包商）' },
];

interface PrintState {
  initialTab: PrintTab;
  tabs: PrintTab[];
}


// ── Cell 渲染：BoxLineRow ─────────────────────────────────────────────────────
function renderBoxCell(row: BoxLineRow, key: BoxColKey): React.ReactNode {
  if (key === 'transportType') {
    const map: Record<string, { bg: string; text: string }> = {
      S: { bg: 'rgba(0,120,212,0.10)', text: '#0068b8' },
      A: { bg: 'rgba(255,171,0,0.12)', text: '#b76e00' },
      T: { bg: 'rgba(34,197,94,0.12)', text: '#118d57' },
      E: { bg: 'rgba(145,85,255,0.10)', text: '#6b35c0' },
    };
    const cfg = map[row.transportType] ?? { bg: 'rgba(145,158,171,0.12)', text: '#637381' };
    return <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>{TRANSPORT_LABEL[row.transportType] ?? row.transportType}</span>;
  }
  if (key === 'barcode') {
    return <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] truncate block font-mono">{row.barcode}</span>;
  }
  const v = (row as any)[key];
  const s = v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : '—';
  return <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`} title={s}>{s}</p>;
}

// ── Cell 渲染：ShipmentItemRow ────────────────────────────────────────────────
function renderItemCell(row: ShipmentItemRow, key: ItemColKey): React.ReactNode {
  if (key === 'transportType') {
    const map: Record<string, { bg: string; text: string }> = {
      S: { bg: 'rgba(0,120,212,0.10)', text: '#0068b8' },
      A: { bg: 'rgba(255,171,0,0.12)', text: '#b76e00' },
      T: { bg: 'rgba(34,197,94,0.12)', text: '#118d57' },
      E: { bg: 'rgba(145,85,255,0.10)', text: '#6b35c0' },
    };
    const cfg = map[row.transportType] ?? { bg: 'rgba(145,158,171,0.12)', text: '#637381' };
    return <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>{TRANSPORT_LABEL[row.transportType] ?? row.transportType}</span>;
  }
  if (key === 'receivedQty') {
    const v = row.receivedQty;
    return <span className={`font-['Public_Sans:Regular',sans-serif] text-[14px] ${v > 0 ? 'text-[#118d57] font-medium' : 'text-[#c4cdd6]'}`}>{v}</span>;
  }
  const v = (row as any)[key];
  const s = v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : '—';
  return <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${s === '—' ? 'text-[#919eab]' : 'text-[#1c252e]'}`} title={s}>{s}</p>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// StickerTab — TAB 1/2/3 外箱貼紙
// ═══════════════════════════════════════════════════════════════════════════════
interface StickerTabConfig {
  storageKey: string;
  showOrderNoSearch: boolean;
  showEnglishSticker: boolean;
  showStoButton: boolean;
}

function StickerTab({ config, onPrint }: { config: StickerTabConfig; onPrint: (tab: PrintTab, availableTabs: PrintTab[]) => void }) {
  const [showStoPage, setShowStoPage] = useState(false);
  const allRows = useMemo(() => buildBoxRows(MOCK_SHIPMENTS), []);

  // 搜尋
  const [searchVendorShipNo, setSearchVendorShipNo] = useState('');
  const [searchOrderNo,      setSearchOrderNo]      = useState('');
  const [searchVendor,       setSearchVendor]       = useState('');

  // 欄位
  const loadCols = (): BoxCol[] => {
    try {
      const saved = localStorage.getItem(config.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as BoxCol[];
        const validKeys = new Set(BOX_DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as BoxColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = BOX_DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return BOX_DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns]         = useState<BoxCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<BoxCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog,   setShowFilterDialog]   = useState(false);
  const [filters,        setFilters]        = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: BoxColKey | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!showColumnSelector) return;
    try { localStorage.setItem(config.storageKey, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  const moveCol = useCallback((drag: BoxColKey, hover: BoxColKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev]; const [r] = next.splice(di, 1); next.splice(hi, 0, r); return next;
    });
  }, []);

  const updateWidth = useCallback((key: BoxColKey, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  const autoFitWidth = (key: BoxColKey) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const hW = measureTextWidth(col.label, '600 14px "Public Sans", sans-serif') + 32 + 16;
    let dW = 0;
    allRows.forEach(row => {
      const val = String((row as any)[key] ?? '');
      const w = measureTextWidth(val) + 32; if (w > dW) dW = w;
    });
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: Math.max(c.minWidth, Math.ceil(Math.max(hW, dW))) } : c));
  };

  const visibleColumns = columns.filter(c => c.visible !== false);

  const splitKw = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchesAny = (v: string, kws: string[]) => kws.some(kw => v.toLowerCase().includes(kw));

  const filteredData = useMemo(() => {
    let data = allRows;
    if (searchVendor) {
      const nameMap = new Map(MOCK_SHIPMENTS.map(r => [r.vendorCode, r.vendorName.replace(/\(.*\)/, '').trim()]));
      const vn = nameMap.get(searchVendor) ?? '';
      data = data.filter(r => r.vendorName === vn);
    }
    if (searchVendorShipNo.trim()) { const kws = splitKw(searchVendorShipNo); data = data.filter(r => matchesAny(r.vendorShipmentNo, kws)); }
    if (config.showOrderNoSearch && searchOrderNo.trim()) { const kws = splitKw(searchOrderNo); data = data.filter(r => matchesAny(r.orderDocSeq, kws)); }
    if (appliedFilters.length > 0) {
      data = data.filter(row => appliedFilters.every(f => {
        const val = String((row as any)[f.column] ?? '').toLowerCase();
        const fv = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains': return val.includes(fv);
          case 'equals': return val === fv;
          case 'notEquals': return val !== fv;
          case 'startsWith': return val.startsWith(fv);
          case 'endsWith': return val.endsWith(fv);
          case 'isEmpty': return !val;
          case 'isNotEmpty': return !!val.trim();
          default: return true;
        }
      }));
    }
    return data;
  }, [allRows, searchVendor, searchVendorShipNo, searchOrderNo, appliedFilters, config.showOrderNoSearch]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String((a as any)[sortConfig.key!] ?? '');
      const bv = String((b as any)[sortConfig.key!] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  const paginatedData = useMemo(() => {
    const s = (page - 1) * perPage; return sortedData.slice(s, s + perPage);
  }, [sortedData, page, perPage]);

  const isAllSelected  = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    isAllSelected ? paginatedData.forEach(r => next.delete(r.id)) : paginatedData.forEach(r => next.add(r.id));
    setSelectedIds(next);
  };
  const handleToggle = (id: string) => {
    const next = new Set(selectedIds); next.has(id) ? next.delete(id) : next.add(id); setSelectedIds(next);
  };

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const totalWidth = CHECKBOX_W + visibleColumns.reduce((s, c) => s + c.width, 0);
  const availableColsForFilter = columns.map(c => ({ key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible }));

  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  if (showStoPage) {
    return <StoStickerPage onBack={() => setShowStoPage(false)} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 搜尋列（不加 border-b） */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap px-[20px] pt-[16px] pb-[16px]">
        <SearchField label="廠商出貨單" value={searchVendorShipNo} onChange={setSearchVendorShipNo} />
        {config.showOrderNoSearch && (
          <SearchField label="訂單號碼" value={searchOrderNo} onChange={setSearchOrderNo} />
        )}
        <div className="flex-1 min-w-[180px] max-w-[260px]">
          <DropdownSelect label="廠商（編號）" value={searchVendor} onChange={setSearchVendor} options={VENDOR_OPTIONS} placeholder="全部" searchable={true} />
        </div>
      </div>

      {/* TableToolbar */}
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
            onApply={() => { setColumns(tempColumns); try { localStorage.setItem(config.storageKey, JSON.stringify(tempColumns)); } catch { /* */ } setShowColumnSelector(false); }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={availableColsForFilter as any}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); }}
          />
        }
        onExportExcel={() => showToast(`已匯出 ${filteredData.length} 筆 (Excel)`)}
        onExportCsv={() => showToast(`已匯出 ${filteredData.length} 筆 (CSV)`)}
        actionButton={
          config.showStoButton ? (
            <button
              onClick={() => setShowStoPage(true)}
              className="flex items-center gap-[6px] h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2d3748] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap shrink-0"
            >
              列印STO
            </button>
          ) : <div />
        }
      />

      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">
          <div data-is-checkbox="true" className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W }}>
            <button data-is-checkbox="true" onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
              <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} />
            </button>
          </div>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] whitespace-nowrap mr-[4px]">{selectedIds.size} selected</span>
          {/* 中文外箔貼紙：不管有沒有英文版，都只展限在可用 tabs 內 */}
          <span
            onClick={() => {
              const availableTabs: PrintTab[] = config.showEnglishSticker
                ? ['zh-sticker', 'en-sticker']
                : ['zh-sticker'];
              onPrint('zh-sticker', availableTabs);
            }}
            className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
          >中文外箱貼紙</span>
          {config.showEnglishSticker && (
            <>
              <span className="text-[rgba(145,158,171,0.4)] select-none">|</span>
              <span
                onClick={() => onPrint('en-sticker', ['zh-sticker', 'en-sticker'])}
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
              >英文外箱貼紙</span>
            </>
          )}
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
              {/* Checkbox sticky */}
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
                  moveColumn={moveCol as any} updateColumnWidth={updateWidth as any}
                  autoFitWidth={autoFitWidth as any}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={(key) => setSortConfig(s => ({ key: key as BoxColKey, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}
                  isLast={idx === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType={DRAG_BOX}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginatedData.map((row, rowIdx) => (
              <div
                key={row.id}
                className={`flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] group transition-colors ${selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : rowIdx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''}`}
                style={{ height: 52 }}
              >
                <div
                  data-is-checkbox="true"
                  className="flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                  style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, position: 'sticky', left: 0, zIndex: 4, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
                  onClick={() => handleToggle(row.id)}
                >
                  <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => handleToggle(row.id)} />
                </div>
                {visibleColumns.map((col, ci) => {
                  const isLast = ci === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width, minWidth: col.width }}
                      className={`flex items-center px-[12px] overflow-hidden ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}
                    >
                      {renderBoxCell(row, col.key)}
                    </div>
                  );
                })}
              </div>
            ))}

            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* 分頁 */}
      <div className="shrink-0 flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls currentPage={page} totalItems={sortedData.length} itemsPerPage={perPage} onPageChange={setPage} onItemsPerPageChange={n => { setPerPage(n); setPage(1); }} />
      </div>

      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/><path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ShipmentDocTab — TAB 4 列印出貨單
// ═══════════════════════════════════════════════════════════════════════════════
const DOC_TAB_KEY = 'printDoc_docTab_v1';

function ShipmentDocTab({ onPrint }: { onPrint: (tab: PrintTab, availableTabs: PrintTab[]) => void }) {
  const allRows = useMemo(() => buildItemRows(MOCK_SHIPMENTS), []);

  const [searchVendorShipNo, setSearchVendorShipNo] = useState('');
  const [searchOrderNo,      setSearchOrderNo]      = useState('');
  const [searchVendor,       setSearchVendor]       = useState('');

  const loadCols = (): ItemCol[] => {
    try {
      const saved = localStorage.getItem(DOC_TAB_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ItemCol[];
        const validKeys = new Set(ITEM_DEFAULT_COLS.map(c => c.key));
        const filtered = parsed.filter(c => validKeys.has(c.key as ItemColKey));
        const savedKeys = new Set(filtered.map(c => c.key));
        const newCols = ITEM_DEFAULT_COLS.filter(c => !savedKeys.has(c.key));
        return [...filtered, ...newCols];
      }
    } catch { /* */ }
    return ITEM_DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns]         = useState<ItemCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<ItemCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog,   setShowFilterDialog]   = useState(false);
  const [filters,        setFilters]        = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: ItemColKey | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!showColumnSelector) return;
    try { localStorage.setItem(DOC_TAB_KEY, JSON.stringify(columns)); } catch { /* */ }
  }, [columns]);

  const moveCol = useCallback((drag: ItemColKey, hover: ItemColKey) => {
    setColumns(prev => {
      const di = prev.findIndex(c => c.key === drag);
      const hi = prev.findIndex(c => c.key === hover);
      const next = [...prev]; const [r] = next.splice(di, 1); next.splice(hi, 0, r); return next;
    });
  }, []);

  const updateWidth = useCallback((key: ItemColKey, w: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: w } : c));
  }, []);

  const autoFitWidth = (key: ItemColKey) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const hW = measureTextWidth(col.label, '600 14px "Public Sans", sans-serif') + 32 + 16;
    let dW = 0;
    allRows.forEach(row => {
      const val = String((row as any)[key] ?? '');
      const w = measureTextWidth(val) + 32; if (w > dW) dW = w;
    });
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: Math.max(c.minWidth, Math.ceil(Math.max(hW, dW))) } : c));
  };

  const visibleColumns = columns.filter(c => c.visible !== false);

  const splitKw = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchesAny = (v: string, kws: string[]) => kws.some(kw => v.toLowerCase().includes(kw));

  const filteredData = useMemo(() => {
    let data = allRows;
    if (searchVendor) {
      const nameMap = new Map(MOCK_SHIPMENTS.map(r => [r.vendorCode, r.vendorName.replace(/\(.*\)/, '').trim()]));
      const vn = nameMap.get(searchVendor) ?? '';
      data = data.filter(r => r.vendorName === vn);
    }
    if (searchVendorShipNo.trim()) { const kws = splitKw(searchVendorShipNo); data = data.filter(r => matchesAny(r.vendorShipmentNo, kws)); }
    if (searchOrderNo.trim()) { const kws = splitKw(searchOrderNo); data = data.filter(r => matchesAny(r.orderDocSeq, kws)); }
    if (appliedFilters.length > 0) {
      data = data.filter(row => appliedFilters.every(f => {
        const val = String((row as any)[f.column] ?? '').toLowerCase();
        const fv = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains': return val.includes(fv);
          case 'equals': return val === fv;
          case 'notEquals': return val !== fv;
          case 'startsWith': return val.startsWith(fv);
          case 'endsWith': return val.endsWith(fv);
          case 'isEmpty': return !val;
          case 'isNotEmpty': return !!val.trim();
          default: return true;
        }
      }));
    }
    return data;
  }, [allRows, searchVendor, searchVendorShipNo, searchOrderNo, appliedFilters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.dir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String((a as any)[sortConfig.key!] ?? '');
      const bv = String((b as any)[sortConfig.key!] ?? '');
      const cmp = av.localeCompare(bv, 'zh-Hant-TW', { sensitivity: 'base' });
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => { setPage(1); }, [sortedData.length]);

  const paginatedData = useMemo(() => {
    const s = (page - 1) * perPage; return sortedData.slice(s, s + perPage);
  }, [sortedData, page, perPage]);

  const isAllSelected  = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    isAllSelected ? paginatedData.forEach(r => next.delete(r.id)) : paginatedData.forEach(r => next.add(r.id));
    setSelectedIds(next);
  };
  const handleToggle = (id: string) => {
    const next = new Set(selectedIds); next.has(id) ? next.delete(id) : next.add(id); setSelectedIds(next);
  };

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const totalWidth = CHECKBOX_W + visibleColumns.reduce((s, c) => s + c.width, 0);
  const availableColsForFilter = columns.map(c => ({ key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible }));

  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  return (
    <div className="flex flex-col h-full">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-end flex-wrap px-[20px] pt-[16px] pb-[16px]">
        <SearchField label="廠商出貨單" value={searchVendorShipNo} onChange={setSearchVendorShipNo} />
        <SearchField label="訂單號碼"   value={searchOrderNo}      onChange={setSearchOrderNo} />
        <div className="flex-1 min-w-[180px] max-w-[260px]">
          <DropdownSelect label="廠商（編號）" value={searchVendor} onChange={setSearchVendor} options={VENDOR_OPTIONS} placeholder="全部" searchable={true} />
        </div>
      </div>

      {/* TableToolbar */}
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
            onApply={() => { setColumns(tempColumns); try { localStorage.setItem(DOC_TAB_KEY, JSON.stringify(tempColumns)); } catch { /* */ } setShowColumnSelector(false); }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={availableColsForFilter as any}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={() => { setAppliedFilters(filters); setShowFilterDialog(false); }}
          />
        }
        onExportExcel={() => showToast(`已匯出 ${filteredData.length} 筆 (Excel)`)}
        onExportCsv={() => showToast(`已匯出 ${filteredData.length} 筆 (CSV)`)}
        actionButton={<div />}
      />

      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">
          <div data-is-checkbox="true" className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W }}>
            <button data-is-checkbox="true" onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
              <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} />
            </button>
          </div>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] whitespace-nowrap mr-[4px]">{selectedIds.size} selected</span>
          <span onClick={() => onPrint('zh-shipment', ['zh-shipment', 'en-shipment'])} className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity">列印中文出貨單</span>
          <span className="text-[rgba(145,158,171,0.4)] select-none">|</span>
          <span onClick={() => onPrint('en-shipment', ['zh-shipment', 'en-shipment'])} className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity">列印英文出貨單</span>
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
                  moveColumn={moveCol as any} updateColumnWidth={updateWidth as any}
                  autoFitWidth={autoFitWidth as any}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={(key) => setSortConfig(s => ({ key: key as ItemColKey, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}
                  isLast={idx === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType={DRAG_ITEM}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginatedData.map((row, rowIdx) => (
              <div
                key={row.id}
                className={`flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] group transition-colors ${selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : rowIdx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''}`}
                style={{ height: 52 }}
              >
                <div
                  data-is-checkbox="true"
                  className="flex items-center justify-center shrink-0 border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                  style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, position: 'sticky', left: 0, zIndex: 4, boxShadow: '2px 0 4px -2px rgba(145,158,171,0.16)' }}
                  onClick={() => handleToggle(row.id)}
                >
                  <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => handleToggle(row.id)} />
                </div>
                {visibleColumns.map((col, ci) => {
                  const isLast = ci === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width, minWidth: col.width }}
                      className={`flex items-center px-[12px] overflow-hidden ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}
                    >
                      {renderItemCell(row, col.key)}
                    </div>
                  );
                })}
              </div>
            ))}

            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* 分頁 */}
      <div className="shrink-0 flex items-center px-[20px] bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls currentPage={page} totalItems={sortedData.length} itemsPerPage={perPage} onPageChange={setPage} onItemsPerPageChange={n => { setPerPage(n); setPage(1); }} />
      </div>

      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/><path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 主元件
// ═══════════════════════════════════════════════════════════════════════════════
export function ShipmentPrintDocPage() {
  const [activeTab, setActiveTab]   = useState<MainTab>('sticker-warehouse');
  const [printState, setPrintState] = useState<PrintState | null>(null);

  // onPrint 同時傳入可用的 PrintTab 列表（由 StickerTab 依 config 決定）
  const handlePrint = useCallback((tab: PrintTab, availableTabs: PrintTab[]) => {
    setPrintState({ initialTab: tab, tabs: availableTabs });
  }, []);

  if (printState) {
    return (
      <ShipmentPrintPage
        vendorShipmentNo={MOCK_SHIPMENTS[0]?.vendorShipmentNo ?? '—'}
        initialTab={printState.initialTab}
        tabs={printState.tabs}
        onBack={() => setPrintState(null)}
      />
    );
  }

  const stickerConfigs: Record<Exclude<MainTab, 'doc-vendor'>, StickerTabConfig> = {
    'sticker-warehouse': { storageKey: 'printDoc_warehouse_v1', showOrderNoSearch: true,  showEnglishSticker: true,  showStoButton: false },
    'sticker-giant':     { storageKey: 'printDoc_giant_v1',     showOrderNoSearch: false, showEnglishSticker: false, showStoButton: true  },
    'sticker-vendor':    { storageKey: 'printDoc_vendor_v1',    showOrderNoSearch: true,  showEnglishSticker: true,  showStoButton: false },
  };

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* TAB 列（完全對齊 ShipmentShippingInquiryPage 標準） */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        {MAIN_TABS.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
          >
            {activeTab === tab.id && (
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            )}
            <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${activeTab === tab.id ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
              {tab.label}
            </p>
          </div>
        ))}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* TAB 內容 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab !== 'doc-vendor' ? (
          <StickerTab
            key={activeTab}
            config={stickerConfigs[activeTab as Exclude<MainTab, 'doc-vendor'>]}
            onPrint={handlePrint}
          />
        ) : (
          <ShipmentDocTab onPrint={handlePrint} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// StoStickerPage — 列印STO 獨立功能頁
// ═══════════════════════════════════════════════════════════════════════════════
function StoStickerPage({ onBack }: { onBack: () => void }) {
  const [stoNo, setStoNo]               = useState('');
  const [copies, setCopies]             = useState<number | ''>(1);
  const [previewSto, setPreviewSto]     = useState('');
  const [previewCopies, setPreviewCopies] = useState(0);

  // 當 stoNo 和 copies 都合法時，自動即時更新預覽
  useEffect(() => {
    const c = Number(copies);
    if (stoNo.trim() && c >= 1) {
      setPreviewSto(stoNo.trim());
      setPreviewCopies(c);
    }
  }, [stoNo, copies]);

  const handlePrint = () => {
    window.print();
  };

  const labels = previewCopies > 0
    ? Array.from({ length: previewCopies }, (_, i) => i)
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* ── 工具列 ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(145,158,171,0.08)] relative">
        <div className="content-stretch flex items-center h-[56px] px-[20px] gap-[16px] relative w-full">

          {/* ← 返回 */}
          <div
            onClick={onBack}
            className="overflow-clip relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="返回"
          >
            <IconsSolidIcSolarMultipleForwardLeftBroken />
          </div>


          {/* STO 編號 輸入 */}
          <div className="flex items-center gap-[8px] shrink-0">
            <span className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[13px] text-[#637381] whitespace-nowrap">STO編號</span>
            <div className="relative" style={{ minHeight: 36 }}>
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
                style={{ borderColor: 'rgba(145,158,171,0.3)' }}
              />
              <input
                type="text"
                value={stoNo}
                onChange={e => setStoNo(e.target.value)}
                placeholder="輸入 STO 編號"
                className="h-[36px] px-[12px] rounded-[8px] text-[14px] font-['Public_Sans:Regular',sans-serif] font-normal text-[#1c252e] placeholder-[#c4cdd6] bg-transparent outline-none"
                style={{ width: 180 }}
              />
            </div>
          </div>

          {/* 列印張數 輸入 */}
          <div className="flex items-center gap-[8px] shrink-0">
            <span className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[13px] text-[#637381] whitespace-nowrap">列印張數</span>
            <div className="relative" style={{ minHeight: 36 }}>
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
                style={{ borderColor: 'rgba(145,158,171,0.3)' }}
              />
              <input
                type="number"
                min={1}
                max={9999}
                value={copies}
                onChange={e => {
                  const v = e.target.value;
                  setCopies(v === '' ? '' : Math.max(1, parseInt(v, 10) || 1));
                }}
                className="h-[36px] px-[12px] rounded-[8px] text-[14px] font-['Public_Sans:Regular',sans-serif] font-normal text-[#1c252e] placeholder-[#c4cdd6] bg-transparent outline-none"
                style={{ width: 80 }}
              />
            </div>
          </div>

          {/* print 黑色按鈕（最後） */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-[7px] h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2d3748] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            print
          </button>

          {/* 底部灰色背景線 */}
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
        </div>
      </div>

      {/* ── 預覽區 ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[32px] py-[28px]">
        {labels.length === 0 ? (
          /* 空狀態 */
          <div className="flex flex-col items-center justify-center h-full gap-[16px]">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 72,
                height: 72,
                background: 'rgba(0,94,184,0.08)',
                boxShadow: '0 0 0 16px rgba(0,94,184,0.04)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] text-[#1c252e]">
              請輸入 STO 編號與列印張數
            </p>
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#919eab] text-center leading-[22px]">
              輸入完成後按 Enter 或點選「預覽」<br />預覽區將以一行兩欄方式顯示所有貼紙
            </p>
          </div>
        ) : (
          /* 貼紙預覽：固定一行兩欄 */
          <div
            className="grid gap-[16px]"
            style={{ gridTemplateColumns: '1fr 1fr' }}
          >
            {labels.map((_, i) => (
              <StoStickerCard key={i} stoNo={previewSto} index={i + 1} total={labels.length} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── STO 貼紙卡片 ──────────────────────────────────────────────────────────────
function StoStickerCard({ stoNo, index, total }: { stoNo: string; index: number; total: number }) {
  return (
    <div
      className="bg-white rounded-[12px] border border-[rgba(145,158,171,0.16)] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center"
      style={{ minHeight: 160, padding: '24px 16px' }}
    >
      {/* 序號 */}
      <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab] mb-[8px] tracking-wide">
        {index} / {total}
      </p>
      {/* STO 號碼 — 超大顯示 */}
      <p
        className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-center text-[#1c252e] leading-[1.1] break-all"
        style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}
      >
        {stoNo}
      </p>
    </div>
  );
}
