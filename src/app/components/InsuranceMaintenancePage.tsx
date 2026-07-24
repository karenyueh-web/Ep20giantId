import { useState, useRef, useCallback } from 'react';
import { ResponsivePageLayout } from './ResponsivePageLayout';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';

import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import { BaseOverlay } from './BaseOverlay';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { PageType } from './MainLayout';
import type { UserRole } from '../App';
import type { InsuranceRecord, InsuranceStatus } from './insuranceData';
import { insuranceMockData, MOCK_TODAY } from './insuranceData';
import { InsuranceDetailPage } from './InsuranceDetailPage';

interface InsuranceMaintenancePageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: UserRole;
}

type TabKey = 'All' | '廠商確認中(V)' | '巨大確認中(G)' | '關閉結案(CL)';

function StatusBadge({ status }: { status: InsuranceStatus }) {
  const styles: Record<InsuranceStatus, { bg: string; text: string }> = {
    V:  { bg: 'rgba(0,184,217,0.16)',  text: '#006c9c' },
    G:  { bg: 'rgba(255,171,0,0.16)',  text: '#B76E00' },
    CL: { bg: 'rgba(34,197,94,0.16)', text: '#118D57' },
  };
  const { bg, text } = styles[status] ?? { bg: 'rgba(145,158,171,0.16)', text: '#637381' };
  return (
    <div className="h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px]" style={{ backgroundColor: bg }}>
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-center whitespace-nowrap" style={{ color: text }}>{status}</p>
    </div>
  );
}

function TabItem({ label, isActive, badge, type, onClick }: {
  label: string; isActive?: boolean; badge?: string; type?: string; onClick?: () => void;
}) {
  const getBadgeColor = () => {
    if (!isActive) return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
    switch (type) {
      case 'V':  return { bg: 'bg-[rgba(0,184,217,0.16)]',  text: 'text-[#006c9c]' };
      case 'G':  return { bg: 'bg-[rgba(255,171,0,0.16)]',  text: 'text-[#B76E00]' };
      case 'CL': return { bg: 'bg-[rgba(34,197,94,0.16)]', text: 'text-[#118D57]' };
      default:   return { bg: 'bg-[rgba(0,184,217,0.16)]',  text: 'text-[#006c9c]' };
    }
  };
  const bc = getBadgeColor();
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer" onClick={onClick}>
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>{label}</p>
      {badge !== undefined && (
        <div className={`${bc.bg} content-stretch flex h-[24px] items-center justify-center min-w-[24px] px-[6px] relative rounded-[6px] shrink-0`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] shrink-0 ${bc.text} text-[12px] text-center`}>{badge}</p>
        </div>
      )}
    </div>
  );
}

type ColKey = 'year' | 'vendor' | 'status' | 'effectiveDate' | 'expiryDate';
interface ColDef { key: ColKey; label: string; width: number; minWidth: number; }

const DEFAULT_COLS: ColDef[] = [
  { key: 'year',          label: '年度',      width: 180, minWidth: 120 },
  { key: 'vendor',        label: '廠商(編號)', width: 260, minWidth: 160 },
  { key: 'status',        label: '繳交狀態',   width: 120, minWidth: 100 },
  { key: 'effectiveDate', label: '生效日',     width: 160, minWidth: 120 },
  { key: 'expiryDate',    label: '截止日',     width: 160, minWidth: 120 },
];

function measureTextWidth(text: string, font = '14px "Public Sans", "Noto Sans JP", sans-serif'): number {
  let el = (measureTextWidth as any)._el as HTMLSpanElement | undefined;
  if (!el) {
    el = document.createElement('span');
    el.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:-9999px';
    document.body.appendChild(el);
    (measureTextWidth as any)._el = el;
  }
  el.style.font = font;
  el.textContent = text;
  return el.offsetWidth;
}

const DRAG_TYPE = 'INS_COL';
function DraggableColHeader({
  col, index, isLast, onMove, sortKey, sortDir, onSort, onResizeStart, onAutoFit,
}: {
  col: ColDef; index: number; isLast: boolean;
  onMove: (from: number, to: number) => void;
  sortKey: ColKey | null; sortDir: 'asc' | 'desc';
  onSort: (key: ColKey) => void;
  onResizeStart: (key: ColKey, startX: number, startW: number) => void;
  onAutoFit: (key: ColKey) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({ type: DRAG_TYPE, item: { index }, collect: m => ({ isDragging: m.isDragging() }) });
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    drop: (item: { index: number }) => { if (item.index !== index) onMove(item.index, index); },
    collect: m => ({ isOver: m.isOver() }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      className={`group relative flex items-center bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.08)] cursor-pointer select-none shrink-0 ${isOver ? 'bg-[#e8f4fd]' : ''}`}
      style={{ width: col.width, minWidth: col.minWidth, height: 56, opacity: isDragging ? 0.4 : 1 }}
      onClick={() => onSort(col.key)}
    >
      <div className="absolute left-[2px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="5" cy="4" r="1.2" fill="#637381"/><circle cx="5" cy="8" r="1.2" fill="#637381"/><circle cx="5" cy="12" r="1.2" fill="#637381"/>
          <circle cx="11" cy="4" r="1.2" fill="#637381"/><circle cx="11" cy="8" r="1.2" fill="#637381"/><circle cx="11" cy="12" r="1.2" fill="#637381"/>
        </svg>
      </div>
      <div className="flex items-center px-[16px] w-full">
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[#637381] text-[14px] truncate flex-1">{col.label}</p>
        {sortKey === col.key && <span className="ml-[4px] text-[#637381] text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>}
      </div>
      {!isLast && (
        <div
          className="absolute right-0 top-0 bottom-0 w-[8px] cursor-col-resize hover:bg-[#1D7BF5] hover:bg-opacity-20 z-10 transition-colors"
          onMouseDown={e => {
            e.preventDefault(); e.stopPropagation();
            if (e.detail >= 2) { onAutoFit(col.key); return; }
            onResizeStart(col.key, e.clientX, col.width);
          }}
        >
          <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#1D7BF5] transition-colors" />
        </div>
      )}
    </div>
  );
}

type ExpiryTab = '7days' | '15days' | '30days';
function parseDate(s: string): Date { return s ? new Date(s.replace(/\//g, '-')) : new Date('9999-12-31'); }

function ExpiryModal({ onClose, data, onRowClick }: {
  onClose: () => void;
  data: InsuranceRecord[];
  onRowClick: (row: InsuranceRecord) => void;
}) {
  const [tab, setTab] = useState<ExpiryTab>('7days');
  const today = parseDate(MOCK_TODAY);
  const getExpiring = (days: number) => {
    const limit = new Date(today); limit.setDate(limit.getDate() + days);
    return data.filter(r => { if (!r.expiryDate) return false; const exp = parseDate(r.expiryDate); return exp >= today && exp <= limit; });
  };
  const rows7 = getExpiring(7); const rows15 = getExpiring(15); const rows30 = getExpiring(30);
  const currentRows = tab === '7days' ? rows7 : tab === '15days' ? rows15 : rows30;
  const tabDefs = [
    { key: '7days' as ExpiryTab, label: 'expire in 7 days', count: rows7.length },
    { key: '15days' as ExpiryTab, label: 'expire in 15 days', count: rows15.length },
    { key: '30days' as ExpiryTab, label: 'expire in 30 days', count: rows30.length },
  ];
  return (
    <BaseOverlay onClose={onClose} maxWidth="720px" maxHeight="520px">
      <div className="relative w-full h-full flex flex-col">
        <button className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none"><path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="#637381" fillRule="evenodd" /></svg>
        </button>
        <div className="px-[50px] pt-[56px] pb-[16px] shrink-0">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">即將過期產險</p>
        </div>
        <div className="px-[50px] shrink-0 flex gap-[8px]">
          {tabDefs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-[8px] px-[16px] py-[10px] rounded-[8px] transition-colors ${tab === t.key ? 'bg-[#1c252e] text-white' : 'bg-[rgba(145,158,171,0.08)] text-[#637381] hover:bg-[rgba(145,158,171,0.16)]'}`}>
              <span className="font-['Public_Sans:Medium',sans-serif] font-medium text-[14px] leading-[22px]">{t.label}</span>
              {t.count > 0 && <span className={`min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-[12px] font-bold px-[6px] ${tab === t.key ? 'bg-[#ff5630] text-white' : 'bg-[rgba(145,158,171,0.24)] text-[#637381]'}`}>{t.count}</span>}
            </button>
          ))}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-[50px] py-[16px]">
          {currentRows.length === 0 ? (
            <div className="flex items-center justify-center h-[120px] text-[#637381] text-[14px]">目前無即將過期的產險資料</div>
          ) : (
            <div className="flex flex-col">
              {currentRows.map(row => (
                <div key={row.id}
                  className="flex items-center py-[16px] border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] gap-[16px] cursor-pointer"
                  onClick={() => { onClose(); onRowClick(row); }}
                >
                  <div className="w-[140px] shrink-0">
                    <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors">{row.year}產險資料</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] truncate">{row.vendorName}({row.vendorCode})</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-[8px]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#919EAB" strokeWidth="1.5"/><path d="M3 9h18M8 2v4M16 2v4" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381]">{row.effectiveDate} - {row.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseOverlay>
  );
}

export function InsuranceMaintenancePage({ currentPage, onPageChange, onLogout, userRole = 'giant' }: InsuranceMaintenancePageProps) {
  const [tableData, setTableData] = useState<InsuranceRecord[]>(insuranceMockData);
  const [selectedRow, setSelectedRow] = useState<InsuranceRecord | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [yearFilter, setYearFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');
  const [columns, setColumns] = useState<ColDef[]>(DEFAULT_COLS);

  const [sortKey, setSortKey] = useState<ColKey | null>('year');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const resizingCol = useRef<ColKey | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [tempColumns, setTempColumns] = useState<{ key: string; label: string; visible?: boolean }[]>([]);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { handleMouseDown } = useHorizontalDragScroll(scrollContainerRef);

  const yearOptions = [
    { label: '全部年度', value: '' },
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
  ];
  const paidOptions = [
    { label: '全部', value: '' },
    { label: '已繳', value: 'paid' },
    { label: '未繳', value: 'unpaid' },
  ];

  const filteredData = tableData.filter(r => {
    if (activeTab === '廠商確認中(V)' && r.status !== 'V') return false;
    if (activeTab === '巨大確認中(G)' && r.status !== 'G') return false;
    if (activeTab === '關閉結案(CL)' && r.status !== 'CL') return false;
    if (yearFilter && String(r.year) !== yearFilter) return false;
    if (vendorFilter && !r.vendorName.includes(vendorFilter) && !r.vendorCode.includes(vendorFilter)) return false;
    if (paidFilter === 'paid' && !r.isPaid) return false;
    if (paidFilter === 'unpaid' && r.isPaid) return false;
    for (const f of appliedFilters) {
      const val = String((r as any)[f.column] ?? '');
      switch (f.operator) {
        case 'contains': if (!val.toLowerCase().includes(f.value.toLowerCase())) return false; break;
        case 'equals': if (val.toLowerCase() !== f.value.toLowerCase()) return false; break;
        case 'startsWith': if (!val.toLowerCase().startsWith(f.value.toLowerCase())) return false; break;
      }
    }
    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = String((a as any)[sortKey] ?? '');
    const bVal = String((b as any)[sortKey] ?? '');
    const cmp = aVal.localeCompare(bVal, 'zh-TW');
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sortedData.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginatedData = sortedData.slice((safePage - 1) * perPage, safePage * perPage);
  const vCount  = tableData.filter(r => r.status === 'V').length;
  const gCount  = tableData.filter(r => r.status === 'G').length;
  const clCount = tableData.filter(r => r.status === 'CL').length;

  const handleSort = (key: ColKey) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc'); } };
  const handleMoveCol = useCallback((from: number, to: number) => setColumns(prev => { const next = [...prev]; const [m] = next.splice(from, 1); next.splice(to, 0, m); return next; }), []);
  const handleResizeStart = useCallback((key: ColKey, startX: number, startW: number) => {
    resizingCol.current = key; resizeStartX.current = startX; resizeStartW.current = startW;
    const onMove = (e: MouseEvent) => { if (!resizingCol.current) return; const delta = e.clientX - resizeStartX.current; setColumns(prev => prev.map(c => c.key === resizingCol.current ? { ...c, width: Math.max(c.minWidth, resizeStartW.current + delta) } : c)); };
    const onUp = () => { resizingCol.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, []);
  const handleAutoFit = useCallback((key: ColKey) => {
    const col = columns.find(c => c.key === key); if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 48;
    let maxDataW = 0;
    sortedData.forEach(row => {
      let text = '';
      if (key === 'year') text = `${row.year}產險資料`;
      else if (key === 'vendor') text = `${row.vendorName}(${row.vendorCode})`;
      else if (key === 'status') text = row.status;
      else if (key === 'effectiveDate') text = row.effectiveDate;
      else if (key === 'expiryDate') text = row.expiryDate;
      const w = measureTextWidth(text) + 32; if (w > maxDataW) maxDataW = w;
    });
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: Math.max(c.minWidth, Math.ceil(Math.max(headerW, maxDataW))) } : c));
  }, [columns, sortedData]);

  const totalWidth = columns.reduce((s, c) => s + c.width, 0) + 48;

  if (selectedRow) {
    const liveRow = tableData.find(r => r.id === selectedRow.id) ?? selectedRow;
    return (
      <InsuranceDetailPage
        record={liveRow}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onLogout={onLogout}
        userRole={userRole}
        onBack={() => setSelectedRow(null)}
        onSave={updated => { setTableData(prev => prev.map(r => r.id === updated.id ? updated : r)); setSelectedRow(null); }}
        onStatusChange={(id, status) => { setTableData(prev => prev.map(r => r.id === id ? { ...r, status } : r)); setSelectedRow(null); }}
      />
    );
  }

  return (
    <ResponsivePageLayout currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} userRole={userRole} title="產險資料維護" breadcrumb="產險資料維護">
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
        {/* Tabs */}
        <div className="relative shrink-0 w-full">
          <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full">
            <TabItem label="All" isActive={activeTab === 'All'} onClick={() => setActiveTab('All')} />
            <TabItem label="廠商確認中(V)" badge={String(vCount)} type="V" isActive={activeTab === '廠商確認中(V)'} onClick={() => setActiveTab('廠商確認中(V)')} />
            <TabItem label="巨大確認中(G)" badge={String(gCount)} type="G" isActive={activeTab === '巨大確認中(G)'} onClick={() => setActiveTab('巨大確認中(G)')} />
            <TabItem label="關閉結案(CL)"  badge={String(clCount)} type="CL" isActive={activeTab === '關閉結案(CL)'} onClick={() => setActiveTab('關閉結案(CL)')} />
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>
        {/* 搜尋列 */}
        <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
          <div className="flex-1 min-w-0"><DropdownSelect label="年度" value={yearFilter} onChange={setYearFilter} options={yearOptions} /></div>
          <div className="flex-1 min-w-0"><SearchField label="廠商" value={vendorFilter} onChange={setVendorFilter} placeholder="廠商名稱或編號" /></div>
          <div className="flex-1 min-w-0"><DropdownSelect label="已繳/未繳" value={paidFilter} onChange={setPaidFilter} options={paidOptions} /></div>
        </div>
        {/* Toolbar */}
        <TableToolbar
          resultsCount={filteredData.length}
          showColumnSelector={showColumnSelector}
          showFilterDialog={showFilterDialog}
          onColumnsClick={() => { setTempColumns(columns.map(c => ({ key: c.key, label: c.label, visible: true }))); setShowColumnSelector(!showColumnSelector); }}
          onFiltersClick={() => setShowFilterDialog(!showFilterDialog)}
          columnsButton={
            <ColumnSelector
              columns={tempColumns}
              onToggleColumn={key => setTempColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c))}
              onToggleAll={sel => setTempColumns(prev => prev.map(c => ({ ...c, visible: sel })))}
              onClose={() => setShowColumnSelector(false)}
              onApply={() => setShowColumnSelector(false)}
            />
          }
          filtersButton={
            <FilterDialog
              filters={filters}
              availableColumns={columns.map(c => ({ key: c.key, label: c.label }))}
              onFiltersChange={setFilters}
              onClose={() => setShowFilterDialog(false)}
              onApply={f => { setAppliedFilters(f); setShowFilterDialog(false); }}
            />
          }
          actionButton={
            <button
              id="insurance-expiry-list-btn"
              onClick={() => setShowExpiryModal(true)}
              className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#005eb8] hover:text-[#003d82] transition-colors cursor-pointer whitespace-nowrap"
            >快到期名單</button>
          }
        />

        {/* Table */}
        <DndProvider backend={HTML5Backend}>
          <div ref={scrollContainerRef} onMouseDown={handleMouseDown} className="flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar cursor-grab">
            <div style={{ minWidth: totalWidth }} className="w-full">
              {/* Header */}
              <div className="flex sticky top-0 z-10">
                {columns.map((col, idx) => (
                  <DraggableColHeader key={col.key} col={col} index={idx} isLast={idx === columns.length - 1}
                    onMove={handleMoveCol} sortKey={sortKey} sortDir={sortDir}
                    onSort={handleSort} onResizeStart={handleResizeStart} onAutoFit={handleAutoFit} />
                ))}
                {/* 填充欄：撐滿剩餘寬度 */}
                <div className="flex-1 bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.08)]" style={{ height: 56 }} />
              </div>
              {/* Rows */}
              {paginatedData.length === 0 ? (
                <div className="flex items-center justify-center py-[60px] text-[#637381] text-[14px]">沒有符合條件的資料</div>
              ) : paginatedData.map(row => (
                <div key={row.id} className="group flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] cursor-pointer" onClick={() => setSelectedRow(row)}>
                  {columns.map(col => (
                    <div key={col.key} className="flex items-center px-[16px] border-r border-[rgba(145,158,171,0.06)]" style={{ width: col.width, minWidth: col.minWidth, height: 52 }}>
                      {col.key === 'year' && (
                        <button onClick={e => { e.stopPropagation(); setSelectedRow(row); }} className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer truncate">{row.year}產險資料</button>
                      )}
                      {col.key === 'vendor' && <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate">{row.vendorName}({row.vendorCode})</p>}
                      {col.key === 'status' && <StatusBadge status={row.status} />}
                      {col.key === 'effectiveDate' && <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate">{row.effectiveDate || '—'}</p>}
                      {col.key === 'expiryDate' && <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate">{row.expiryDate || '—'}</p>}
                    </div>
                  ))}
                  {/* 填充格：撐滿剩餘寬度 */}
                  <div className="flex-1" style={{ height: 52 }} />
                </div>
              ))}
            </div>
          </div>
        </DndProvider>
        {/* 分頁 */}
        <PaginationControls currentPage={safePage} totalPages={totalPages} perPage={perPage} totalItems={sortedData.length}
          onPageChange={setPage} onPerPageChange={pp => { setPerPage(pp); setPage(1); }} />
      </div>
      {showExpiryModal && <ExpiryModal onClose={() => setShowExpiryModal(false)} data={tableData} onRowClick={row => setSelectedRow(row)} />}
    </ResponsivePageLayout>
  );
}
