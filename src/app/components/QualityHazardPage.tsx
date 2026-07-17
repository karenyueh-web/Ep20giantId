import { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { CheckboxIcon } from './CheckboxIcon';
import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import { HazardFileUploadOverlay, type HazardFileOverlayProps } from './HazardFileUploadOverlay';
import { HazardTemplateOverlay } from './HazardTemplateOverlay';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'All' | '廠商確認中(V)' | '巨大確認中(G)' | '關閉結案(CL)';

type FileStatus = '待上傳' | '不需繳交' | string; // string = link text (filename)

interface HazardRow {
  id: string;
  year: number;             // 年度
  vendor: string;           // 廠商(編號)
  regulationCode: string;   // 法規代號
  submittedStatus: string;  // 繳交狀態
  regulationDesc: string;   // 法規說明
  thirdPartyFile: FileStatus; // 第三方檢測
  selfDeclFile: FileStatus;   // 自我宣告書
  vendorReplyDate: string;   // 廠商回覆日期
  status: 'V' | 'G' | 'CL';
}

type ColKey = keyof Omit<HazardRow, 'id' | 'status'>;

interface ColDef {
  key: ColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockData: HazardRow[] = [
  { id: '1',  year: 2025, vendor: '速聯(000100463)', regulationCode: 'REACH',  submittedStatus: 'V', regulationDesc: '化學品註冊、評估與授權限制法規', thirdPartyFile: '2025危害物質報告_REACH.pdf', selfDeclFile: '待上傳',  vendorReplyDate: '2025/02/01', status: 'V' },
  { id: '2',  year: 2025, vendor: '速聯(000100463)', regulationCode: 'RoHS',   submittedStatus: 'V', regulationDesc: '限制電子電氣設備中某些有害物質',   thirdPartyFile: 'xxxxxxxxxx.pdf',             selfDeclFile: '待上傳',  vendorReplyDate: '2025/02/01', status: 'V' },
  { id: '3',  year: 2025, vendor: '速聯(000100463)', regulationCode: 'CP 65',  submittedStatus: 'V', regulationDesc: '加州第65號提案（安全飲用水與有毒物質）', thirdPartyFile: '不需繳交',              selfDeclFile: '不需繳交', vendorReplyDate: '2025/02/01', status: 'V' },
  { id: '4',  year: 2025, vendor: '速聯(000100463)', regulationCode: 'POPs',   submittedStatus: 'V', regulationDesc: '持久性有機污染物規範',              thirdPartyFile: '不需繳交',              selfDeclFile: '不需繳交', vendorReplyDate: '2025/02/01', status: 'V' },
  { id: '5',  year: 2025, vendor: '邁達(000200112)', regulationCode: 'REACH',  submittedStatus: 'V', regulationDesc: '化學品註冊、評估與授權限制法規', thirdPartyFile: '已上傳',                     selfDeclFile: '已上傳',   vendorReplyDate: '2025/02/15', status: 'V' },
  { id: '6',  year: 2025, vendor: '邁達(000200112)', regulationCode: 'RoHS',   submittedStatus: 'G', regulationDesc: '限制電子電氣設備中某些有害物質',   thirdPartyFile: '待上傳',                     selfDeclFile: '待上傳',  vendorReplyDate: '',           status: 'G' },
  { id: '7',  year: 2025, vendor: '邁達(000200112)', regulationCode: 'PFAS',   submittedStatus: 'G', regulationDesc: '全氟和多氟烷基物質限制規範',         thirdPartyFile: '待上傳',                     selfDeclFile: '不需繳交', vendorReplyDate: '',           status: 'G' },
  { id: '8',  year: 2025, vendor: '新興(000300078)', regulationCode: 'REACH',  submittedStatus: 'V', regulationDesc: '化學品註冊、評估與授權限制法規', thirdPartyFile: '已上傳',                     selfDeclFile: '已上傳',   vendorReplyDate: '2025/03/01', status: 'V' },
  { id: '9',  year: 2025, vendor: '新興(000300078)', regulationCode: 'RoHS',   submittedStatus: 'V', regulationDesc: '限制電子電氣設備中某些有害物質',   thirdPartyFile: '已上傳',                     selfDeclFile: '待上傳',  vendorReplyDate: '2025/03/05', status: 'V' },
  { id: '10', year: 2025, vendor: '鉅德(000400055)', regulationCode: 'REACH',  submittedStatus: 'CL', regulationDesc: '化學品註冊、評估與授權限制法規', thirdPartyFile: '已上傳',                    selfDeclFile: '已上傳',   vendorReplyDate: '2025/03/10', status: 'CL' },
  { id: '11', year: 2025, vendor: '鉅德(000400055)', regulationCode: 'RoHS',   submittedStatus: 'CL', regulationDesc: '限制電子電氣設備中某些有害物質',  thirdPartyFile: '已上傳',                    selfDeclFile: '已上傳',   vendorReplyDate: '2025/03/15', status: 'CL' },
  { id: '12', year: 2024, vendor: '速聯(000100463)', regulationCode: 'REACH',  submittedStatus: 'CL', regulationDesc: '化學品註冊、評估與授權限制法規', thirdPartyFile: '已上傳',                    selfDeclFile: '已上傳',   vendorReplyDate: '2024/02/28', status: 'CL' },
];

const DEFAULT_COLUMNS: ColDef[] = [
  { key: 'year',            label: '年度',         width: 90,  minWidth: 80  },
  { key: 'vendor',          label: '廠商(編號)',    width: 180, minWidth: 140 },
  { key: 'regulationCode',  label: '法規代號',      width: 110, minWidth: 90  },
  { key: 'submittedStatus', label: '繳交狀態',      width: 100, minWidth: 80  },
  { key: 'regulationDesc',  label: '法規說明',      width: 240, minWidth: 160 },
  { key: 'thirdPartyFile',  label: '第三方檢測',    width: 180, minWidth: 140 },
  { key: 'selfDeclFile',    label: '自我宣告書',    width: 130, minWidth: 110 },
  { key: 'vendorReplyDate', label: '廠商回覆日期',  width: 130, minWidth: 110 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function measureTextWidth(text: string, font = '14px "Public Sans","Noto Sans JP",sans-serif'): number {
  let el = (measureTextWidth as any)._el as HTMLSpanElement | undefined;
  if (!el) {
    el = document.createElement('span');
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    (measureTextWidth as any)._el = el;
  }
  el.style.font = font;
  el.textContent = text;
  return el.offsetWidth;
}

// ─── Tab Component ────────────────────────────────────────────────────────────

function TabItem({ label, badge, isActive, badgeType, onClick }: {
  label: string; badge?: number; isActive: boolean; badgeType?: string; onClick: () => void;
}) {
  const getBadgeStyle = () => {
    if (!isActive) return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
    switch (badgeType) {
      case 'V': return { bg: 'bg-[rgba(0,184,217,0.16)]', text: 'text-[#006c9c]' };
      case 'G': return { bg: 'bg-[rgba(255,171,0,0.16)]',  text: 'text-[#B76E00]' };
      case 'CL': return { bg: 'bg-[rgba(34,197,94,0.16)]', text: 'text-[#118D57]' };
      default:  return { bg: 'bg-[rgba(0,184,217,0.16)]', text: 'text-[#006c9c]' };
    }
  };
  const bs = getBadgeStyle();
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
        {label}
      </p>
      {badge !== undefined && (
        <div className={`${bs.bg} flex h-[24px] items-center justify-center min-w-[24px] px-[6px] rounded-[6px] shrink-0`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] ${bs.text} text-[12px] text-center`}>{badge}</p>
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const getStyle = () => {
    switch (status) {
      case 'V': return { bg: 'rgba(0,184,217,0.16)', color: '#006c9c' };
      case 'G': return { bg: 'rgba(255,171,0,0.16)',  color: '#B76E00' };
      case 'CL': return { bg: 'rgba(34,197,94,0.16)', color: '#118D57' };
      default:  return { bg: 'rgba(145,158,171,0.16)', color: '#637381' };
    }
  };
  const s = getStyle();
  return (
    <div className="h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px]" style={{ backgroundColor: s.bg }}>
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-center whitespace-nowrap" style={{ color: s.color }}>
        {status}
      </p>
    </div>
  );
}

// ─── File Cell ────────────────────────────────────────────────────────────────
// 狀態規則：
//   待上傳（未上傳）→ 紅色底線，點擊觸發上傳
//   有檔名（已上傳）→ 藍色底線，顯示檔案名稱（含回紋針圖示）
//   不需繳交        → 淺灰底線，點擊有動作（待補功能）

function FileCell({ value, onClick }: { value: FileStatus; onClick?: () => void }) {
  // 未上傳：紅色底線
  if (value === '待上傳') {
    return (
      <span
        onClick={onClick}
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#ff5630] underline hover:text-[#cc3d1a] transition-colors cursor-pointer"
      >
        待上傳
      </span>
    );
  }
  // 不需繳交：淺灰底線
  if (value === '不需繳交') {
    return (
      <span
        onClick={onClick}
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#919EAB] underline hover:text-[#637381] transition-colors cursor-pointer"
      >
        不需繳交
      </span>
    );
  }
  // 已上傳（有檔名）：藍色底線 + 回紋針圖示
  return (
    <div className="flex items-center gap-[6px] min-w-0 cursor-pointer" onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
          stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors truncate"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}


// ─── Draggable Column Header ──────────────────────────────────────────────────

const COL_TYPE = 'HAZARD_COL';
const CHECKBOX_W = 52;

function DraggableColHeader({ col, index, isLast, sortKey, sortDir, onSort, onMoveCol, onResizeStart, onAutoFit }: {
  col: ColDef; index: number; isLast: boolean;
  sortKey: ColKey | null; sortDir: 'asc' | 'desc';
  onSort: (key: ColKey) => void;
  onMoveCol: (from: number, to: number) => void;
  onResizeStart: (key: ColKey, startX: number, startW: number) => void;
  onAutoFit: (key: ColKey) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({ type: COL_TYPE, item: { index }, collect: m => ({ isDragging: m.isDragging() }) });
  const [{ isOver }, drop] = useDrop({
    accept: COL_TYPE,
    collect: m => ({ isOver: m.isOver() }),
    drop: (item: { index: number }) => { if (item.index !== index) onMoveCol(item.index, index); },
  });
  drag(drop(ref));

  const isSorted = sortKey === col.key;
  return (
    <div
      ref={ref}
      className={`relative flex items-center gap-[4px] px-[16px] h-[56px] shrink-0 bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.12)] select-none cursor-pointer group ${isDragging ? 'opacity-40' : ''} ${isOver ? 'bg-[#e8f4ff]' : ''}`}
      style={{ width: col.width, minWidth: col.minWidth }}
      onClick={() => onSort(col.key)}
    >
      <div className="opacity-0 group-hover:opacity-40 transition-opacity shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#637381">
          <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
          <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
          <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
        </svg>
      </div>
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[#637381] text-[14px] truncate flex-1">
        {col.label}
      </p>
      {isSorted && <span className="text-[#1c252e] shrink-0">{sortDir === 'asc' ? '▲' : '▼'}</span>}
      {!isLast && (
        <div
          className="absolute right-0 top-0 bottom-0 w-[8px] cursor-col-resize hover:bg-[#1D7BF5] hover:bg-opacity-20 z-10 group/resize transition-colors"
          onMouseDown={e => {
            e.preventDefault(); e.stopPropagation();
            if (e.detail >= 2) { onAutoFit(col.key); return; }
            onResizeStart(col.key, e.clientX, col.width);
          }}
          title="拖拽調整欄寬；雙擊自動最適"
        >
          <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover/resize:bg-[#1D7BF5] transition-colors" />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QualityHazardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [data, setData] = useState<HazardRow[]>(mockData);

  // Search
  const [yearFilter, setYearFilter]               = useState('2025');
  const [regulationFilter, setRegulationFilter]   = useState('');
  const [thirdPartyFilter, setThirdPartyFilter]   = useState('已繳');
  const [selfDeclFilter, setSelfDeclFilter]       = useState('未繳');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Columns
  const [columns, setColumns]         = useState<ColDef[]>(DEFAULT_COLUMNS.map(c => ({ ...c, visible: true })));
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [tempColumns, setTempColumns] = useState<ColDef[]>([]);

  // Filters
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters]         = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // Sort
  const [sortKey, setSortKey]   = useState<ColKey | null>(null);
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc');

  // Resize
  const resizingKey  = useRef<ColKey | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  // Pagination
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(100);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { handleMouseDown } = useHorizontalDragScroll(scrollRef);

  // Overlay state
  const [uploadOverlay, setUploadOverlay] = useState<Omit<HazardFileOverlayProps, 'onClose' | 'onSubmit'> | null>(null);
  const [showTemplateOverlay, setShowTemplateOverlay] = useState(false);

  // ── Tab counts ──────────────────────────────────────────────────────────────
  const vCount  = data.filter(r => r.status === 'V').length;
  const gCount  = data.filter(r => r.status === 'G').length;
  const clCount = data.filter(r => r.status === 'CL').length;

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filteredData = data.filter(row => {
    if (activeTab !== 'All') {
      const m = activeTab.match(/\(([A-Z]+)\)/);
      if (m && row.status !== m[1]) return false;
    }
    if (yearFilter && String(row.year) !== yearFilter) return false;
    if (regulationFilter && !row.regulationCode.toLowerCase().includes(regulationFilter.toLowerCase()) && !row.regulationDesc.toLowerCase().includes(regulationFilter.toLowerCase())) return false;
    if (thirdPartyFilter === '已繳' && row.thirdPartyFile === '待上傳') return false;
    if (thirdPartyFilter === '未繳' && row.thirdPartyFile !== '待上傳') return false;
    if (selfDeclFilter === '已繳' && row.selfDeclFile === '待上傳') return false;
    if (selfDeclFilter === '未繳' && row.selfDeclFile !== '待上傳') return false;
    if (appliedFilters.length > 0) {
      return appliedFilters.every(f => {
        const val = String((row as any)[f.column] ?? '');
        switch (f.operator) {
          case 'contains':    return val.toLowerCase().includes(f.value.toLowerCase());
          case 'equals':      return val.toLowerCase() === f.value.toLowerCase();
          case 'notEquals':   return val.toLowerCase() !== f.value.toLowerCase();
          case 'startsWith':  return val.toLowerCase().startsWith(f.value.toLowerCase());
          case 'endsWith':    return val.toLowerCase().endsWith(f.value.toLowerCase());
          case 'isEmpty':     return !val.trim();
          case 'isNotEmpty':  return !!val.trim();
          default:            return true;
        }
      });
    }
    return true;
  });

  // ── Sort ────────────────────────────────────────────────────────────────────
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const av = String((a as any)[sortKey] ?? '');
    const bv = String((b as any)[sortKey] ?? '');
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const paginatedData = sortedData.slice((page - 1) * perPage, page * perPage);
  const visibleCols   = columns.filter(c => c.visible !== false);
  const totalWidth    = CHECKBOX_W + visibleCols.reduce((s, c) => s + c.width, 0);

  // ── Selection ───────────────────────────────────────────────────────────────
  const isAllSelected  = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => { const next = new Set(prev); paginatedData.forEach(r => next.delete(r.id)); return next; });
    } else {
      setSelectedIds(prev => { const next = new Set(prev); paginatedData.forEach(r => next.add(r.id)); return next; });
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSort = (key: ColKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleMoveCol = (from: number, to: number) => {
    setColumns(prev => {
      const vis = prev.filter(c => c.visible !== false);
      const hid = prev.filter(c => c.visible === false);
      const next = [...vis];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return [...next, ...hid];
    });
  };

  const handleResizeStart = (key: ColKey, startX: number, startW: number) => {
    resizingKey.current  = key;
    resizeStartX.current = startX;
    resizeStartW.current = startW;
    const onMove = (e: MouseEvent) => {
      if (!resizingKey.current) return;
      const delta = e.clientX - resizeStartX.current;
      setColumns(prev => prev.map(c =>
        c.key === resizingKey.current ? { ...c, width: Math.max(c.minWidth, resizeStartW.current + delta) } : c
      ));
    };
    const onUp = () => {
      resizingKey.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const autoFitWidth = useCallback((key: ColKey) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const hw = measureTextWidth(col.label, '600 14px "Public Sans","Noto Sans JP",sans-serif') + 48 + 16;
    let mw = 0;
    filteredData.forEach(row => {
      const w = measureTextWidth(String((row as any)[key] ?? '')) + 32;
      if (w > mw) mw = w;
    });
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: Math.max(c.minWidth, Math.ceil(Math.max(hw, mw))) } : c));
  }, [columns, filteredData]);

  // ── Column selector helpers ──────────────────────────────────────────────────
  const handleColumnsClick = () => {
    setTempColumns(columns.map(c => ({ ...c })));
    setShowColumnSelector(s => !s);
  };
  const handleToggleColumn = (key: string) => {
    setTempColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c));
  };
  const handleToggleAll = (selectAll: boolean) => {
    setTempColumns(prev => prev.map(c => ({ ...c, visible: selectAll })));
  };
  const handleApplyColumns = () => {
    setColumns(tempColumns);
    setShowColumnSelector(false);
  };

  const handleApplyFilters = (f: FilterCondition[]) => { setAppliedFilters(f); setShowFilterDialog(false); };

  const handleExportCsv = () => {
    const header = visibleCols.map(c => c.label).join(',');
    const rows = sortedData.map(row => visibleCols.map(c => `"${String((row as any)[c.key] ?? '')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '危害物質報告.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const renderCell = (col: ColDef, row: HazardRow) => {
    const baseClass = "font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full";

    const openUploadOverlay = (field: 'thirdParty' | 'selfDecl') => {
      const fileVal = field === 'thirdParty' ? row.thirdPartyFile : row.selfDeclFile;
      const fileStatus: HazardFileOverlayProps['fileStatus'] =
        fileVal === '待上傳' ? 'pending'
        : fileVal === '不需繳交' ? 'notRequired'
        : 'uploaded';
      setUploadOverlay({
        year: row.year,
        vendor: row.vendor,
        regulationCode: row.regulationCode,
        regulationDesc: row.regulationDesc,
        field,
        fileStatus,
        fileName: fileStatus === 'uploaded' ? fileVal : undefined,
        rowStatus: row.status,
        isGiant: false, // TODO: 接真實角色
      });
    };

    switch (col.key) {
      case 'submittedStatus':
        return <StatusBadge status={row.submittedStatus} />;
      case 'thirdPartyFile':
        return <FileCell value={row.thirdPartyFile} onClick={() => openUploadOverlay('thirdParty')} />;
      case 'selfDeclFile':
        return <FileCell value={row.selfDeclFile} onClick={() => openUploadOverlay('selfDecl')} />;
      default:
        return <p className={baseClass}>{String((row as any)[col.key] ?? '')}</p>;
    }
  };

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── Tabs ── */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        <TabItem label="All"           isActive={activeTab === 'All'}           onClick={() => { setActiveTab('All'); setPage(1); setSelectedIds(new Set()); }} />
        <TabItem label="廠商確認中(V)"  badge={vCount}  badgeType="V"  isActive={activeTab === '廠商確認中(V)'} onClick={() => { setActiveTab('廠商確認中(V)'); setPage(1); setSelectedIds(new Set()); }} />
        <TabItem label="巨大確認中(G)"  badge={gCount}  badgeType="G"  isActive={activeTab === '巨大確認中(G)'} onClick={() => { setActiveTab('巨大確認中(G)'); setPage(1); setSelectedIds(new Set()); }} />
        <TabItem label="關閉結案(CL)"   badge={clCount} badgeType="CL" isActive={activeTab === '關閉結案(CL)'}  onClick={() => { setActiveTab('關閉結案(CL)');  setPage(1); setSelectedIds(new Set()); }} />
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ── Search ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="年度"
            value={yearFilter}
            onChange={setYearFilter}
            options={[
              { value: '',     label: 'all' },
              { value: '2025', label: '2025' },
              { value: '2024', label: '2024' },
              { value: '2023', label: '2023' },
            ]}
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="法規" value={regulationFilter} onChange={setRegulationFilter} />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="第三方檢測報告"
            value={thirdPartyFilter}
            onChange={setThirdPartyFilter}
            options={[
              { value: '',   label: 'all' },
              { value: '已繳', label: '已繳' },
              { value: '未繳', label: '未繳' },
            ]}
          />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="自我宣告書"
            value={selfDeclFilter}
            onChange={setSelfDeclFilter}
            options={[
              { value: '',   label: 'all' },
              { value: '已繳', label: '已繳' },
              { value: '未繳', label: '未繳' },
            ]}
          />
        </div>
      </div>

      {/* ── Toolbar ── */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={() => setShowFilterDialog(s => !s)}
        onExportCsv={handleExportCsv}
        actionButton={
          <button
            onClick={() => setShowTemplateOverlay(true)}
            className="flex items-center h-[36px] px-[16px] rounded-[8px] text-[#1677ff] border border-[#1677ff] hover:bg-[rgba(22,119,255,0.06)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors"
          >
            宣告書範本
          </button>
        }
        columnsButton={
          <ColumnSelector
            columns={tempColumns.map(c => ({ key: c.key, label: c.label, visible: c.visible !== false }))}
            onToggleColumn={handleToggleColumn}
            onToggleAll={handleToggleAll}
            onClose={() => setShowColumnSelector(false)}
            onApply={handleApplyColumns}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={columns.map(c => ({ key: c.key, label: c.label }))}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />
        }
      />

      {/* ── Selection Toolbar ── */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">
          <div className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_W }}>
            <button onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
              <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} />
            </button>
          </div>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] mr-[4px] whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          {/* 設定不繳交第三方檢測 */}
          <span
            onClick={() => {
              setData(prev => prev.map(r =>
                selectedIds.has(r.id) ? { ...r, thirdPartyFile: '不需繳交' } : r
              ));
              setSelectedIds(new Set());
            }}
            className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
          >
            設定不繳交第三方檢測
          </span>
          <span className="text-[rgba(145,158,171,0.4)] select-none">|</span>
          {/* 設定不繳交自我宣告書 */}
          <span
            onClick={() => {
              setData(prev => prev.map(r =>
                selectedIds.has(r.id) ? { ...r, selfDeclFile: '不需繳交' } : r
              ));
              setSelectedIds(new Set());
            }}
            className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
          >
            設定不繳交自我宣告書
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          className="flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar cursor-grab active:cursor-grabbing"
        >
          <div style={{ minWidth: totalWidth }}>
            {/* Header */}
            <div className="flex sticky top-0 z-10">
              {/* Checkbox header */}
              <div
                className="bg-[#f4f6f8] flex items-center justify-center shrink-0 border-b border-[rgba(145,158,171,0.12)]"
                style={{ width: CHECKBOX_W, height: 56, position: 'sticky', left: 0, zIndex: 20 }}
              >
                <button onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
                  <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} />
                </button>
              </div>
              {visibleCols.map((col, i) => (
                <DraggableColHeader
                  key={col.key}
                  col={col}
                  index={i}
                  isLast={i === visibleCols.length - 1}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  onMoveCol={handleMoveCol}
                  onResizeStart={handleResizeStart}
                  onAutoFit={autoFitWidth}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0 border-b border-[rgba(145,158,171,0.12)]" />
            </div>

            {/* Rows */}
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">無資料</p>
              </div>
            ) : paginatedData.map(row => (
              <div
                key={row.id}
                className="flex border-b border-[rgba(145,158,171,0.12)] hover:bg-[rgba(145,158,171,0.04)] group transition-colors"
              >
                {/* Checkbox cell */}
                <div
                  data-is-checkbox="true"
                  className="flex items-center justify-center shrink-0 bg-white group-hover:bg-[rgba(145,158,171,0.04)] transition-colors"
                  style={{ width: CHECKBOX_W, position: 'sticky', left: 0, zIndex: 4 }}
                  onClick={e => e.stopPropagation()}
                >
                  <CheckboxIcon
                    checked={selectedIds.has(row.id)}
                    onChange={() => handleToggleRow(row.id)}
                  />
                </div>
                {visibleCols.map((col, i) => (
                  <div
                    key={col.key}
                    className="flex items-center px-[16px] h-[52px] shrink-0 overflow-hidden"
                    style={i === visibleCols.length - 1
                      ? { minWidth: col.width, flex: 1 }
                      : { width: col.width, minWidth: col.minWidth }}
                  >
                    {renderCell(col, row)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DndProvider>

      {/* ── Pagination ── */}
      <PaginationControls
        page={page}
        perPage={perPage}
        total={filteredData.length}
        onPageChange={setPage}
        onPerPageChange={n => { setPerPage(n); setPage(1); }}
      />

      {/* ── Upload Overlay ── */}
      {uploadOverlay && (
        <HazardFileUploadOverlay
          {...uploadOverlay}
          onClose={() => setUploadOverlay(null)}
          onSubmit={({ action, vendorNote: vn, giantNote: gn }) => {
            if (!uploadOverlay) return;
            // 更新對應 row 的檔案狀態
            setData(prev => prev.map(r => {
              const isTarget = r.year === uploadOverlay.year
                && r.vendor === uploadOverlay.vendor
                && r.regulationCode === uploadOverlay.regulationCode;
              if (!isTarget) return r;
              const fileKey = uploadOverlay.field === 'thirdParty' ? 'thirdPartyFile' : 'selfDeclFile';
              let newVal = r[fileKey];
              if (action === 'notRequired') newVal = '不需繳交';
              else if (action === 'reopen')   newVal = '待上傳';
              else if (action === 'submitToGiant' || action === 'upload') newVal = '已上傳';
              return { ...r, [fileKey]: newVal };
            }));
            setUploadOverlay(null);
          }}
        />
      )}

      {/* ── Template Overlay ── */}
      {showTemplateOverlay && (
        <HazardTemplateOverlay
          onClose={() => setShowTemplateOverlay(false)}
          isGiant={false} // TODO: 接真實角色
        />
      )}
    </div>
  );
}
