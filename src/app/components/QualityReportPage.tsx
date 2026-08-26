import { localDateToDisplay } from '../utils/dateTime';
import { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';

import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import { ReportFileUploadOverlay, type ReportFile } from './ReportFileUploadOverlay';
import type { HistoryEntry } from './OrderStoreContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'All' | '廠商確認中(V)' | '巨大確認中(G)' | '關閉結案(CL)';

interface ReportRow {
  id: string;
  reportType: string;
  vendor: string;
  shipmentNo: string;       // 出貨單號（保留供 Overlay 顯示用）
  vendorShipNo: string;     // 廠商出貨單
  shipSeq: string;          // 出貨序號
  shipDate: string;         // 出貨日（保留供 Overlay 顯示用）
  partNo: string;
  productName: string;      // 品名
  orderNo: string;          // 訂單號碼
  orderSeq: string;         // 訂單序號
  specDesc: string;         // 長規格敘述
  vendorReplyDate: string;  // 廠商回覆日期（保留供記錄用）
  createdAt: string;        // 建檔日
  updatedAt: string;        // 更新時間
  files: ReportFile[];
  status: 'V' | 'G' | 'CL';
  history?: HistoryEntry[];
  returnReason?: string;
}

// Display column keys (docStatus and attachment are virtual — rendered specially)
type ColKey = 'reportType' | 'vendor' | 'vendorShipNo' | 'shipSeq' | 'docStatus' | 'partNo' | 'productName' | 'orderNo' | 'orderSeq' | 'attachment' | 'specDesc' | 'createdAt' | 'updatedAt';

interface ColDef {
  key: ColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeFile = (name: string, at: string, by?: string): ReportFile => ({ name, uploadedAt: at, uploadedBy: by });

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

function nowStr(): string {
  return localDateToDisplay();
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
// 廠商出貨單、料號、廠商資訊均與 ShipmentListPage.tsx MOCK_SHIPMENTS 對齊

const mockData: ReportRow[] = [
  // ─ 速聯國際 × VND-2025-88002 × 料號 1129-FRK0046-I02（品次20）─
  {
    id: '1', reportType: '檢驗報告', vendor: '速聯國際(0001000046)',
    shipmentNo: '', vendorShipNo: 'VND-2025-88002', shipSeq: '20',
    shipDate: '2025/09/01 00:00',
    partNo: '1129-FRK0046-I02', productName: '1129-FRK0046-I02',
    orderNo: '4500600051', orderSeq: '10',
    specDesc: 'FORK ROAD CARBON 700C 12X100 FLAT MOUNT',
    vendorReplyDate: '', createdAt: '2025/09/01 00:00', updatedAt: '2025/09/01 00:00',
    files: [], status: 'V', history: [],
  },
  {
    id: '2', reportType: '功能測試報告', vendor: '速聯國際(0001000046)',
    shipmentNo: '', vendorShipNo: 'VND-2025-88002', shipSeq: '20',
    shipDate: '2025/09/01 00:00',
    partNo: '1129-FRK0046-I02', productName: '1129-FRK0046-I02',
    orderNo: '4500600051', orderSeq: '10',
    specDesc: 'FORK ROAD CARBON 700C 12X100 FLAT MOUNT',
    vendorReplyDate: '', createdAt: '2025/09/01 00:00', updatedAt: '2025/09/01 00:00',
    files: [], status: 'V', history: [],
  },
  // ─ 佳承精密 × SHP-2025-0046 × 料號 1129-SAD0045-E02（品次20）─
  {
    id: '3', reportType: '檢驗報告', vendor: '佳承精密(0001000045)',
    shipmentNo: '', vendorShipNo: 'SHP-2025-0046', shipSeq: '20',
    shipDate: '2025/07/05 00:00',
    partNo: '1129-SAD0045-E02', productName: '1129-SAD0045-E02',
    orderNo: '4500200012', orderSeq: '10',
    specDesc: 'SADDLE ROAD LIGHTWEIGHT CARBON RAIL 142MM',
    vendorReplyDate: '', createdAt: '2025/07/05 00:00', updatedAt: '2025/07/05 00:00',
    files: [], status: 'V', history: [],
  },
  {
    id: '4', reportType: '功能測試報告', vendor: '佳承精密(0001000045)',
    shipmentNo: '', vendorShipNo: 'SHP-2025-0046', shipSeq: '20',
    shipDate: '2025/07/05 00:00',
    partNo: '1129-SAD0045-E02', productName: '1129-SAD0045-E02',
    orderNo: '4500200012', orderSeq: '10',
    specDesc: 'SADDLE ROAD LIGHTWEIGHT CARBON RAIL 142MM',
    vendorReplyDate: '', createdAt: '2025/07/05 00:00', updatedAt: '2025/07/05 00:00',
    files: [], status: 'V', history: [],
  },
  // ─ 金盛元工業 × INV-20250620-002 × 料號 6601-CHN0059-G01（品次10）─
  {
    id: '5', reportType: '檢驗報告', vendor: '金盛元工業(0001000059)',
    shipmentNo: '', vendorShipNo: 'INV-20250620-002', shipSeq: '10',
    shipDate: '2025/06/20 00:00',
    partNo: '6601-CHN0059-G01', productName: '6601-CHN0059-G01',
    orderNo: '4500400030', orderSeq: '10',
    specDesc: 'CHAIN 12S 126L NARROW WIDE SILVER',
    vendorReplyDate: '2025/06/25 00:00', createdAt: '2025/06/20 00:00', updatedAt: '2025/06/24 00:00',
    files: [makeFile('金盛元_CHN0059_檢驗報告.pdf', '2025/06/24 09:30', '金盛元-李OO')],
    status: 'G',
    history: [{ date: '2025/06/24 09:30', event: '轉交巨大', operator: '廠商-金盛元-李OO', remark: '金盛元_CHN0059_檢驗報告.pdf' }],
  },
  {
    id: '6', reportType: '功能測試報告', vendor: '金盛元工業(0001000059)',
    shipmentNo: '', vendorShipNo: 'INV-20250620-002', shipSeq: '10',
    shipDate: '2025/06/20 00:00',
    partNo: '6601-CHN0059-G01', productName: '6601-CHN0059-G01',
    orderNo: '4500400030', orderSeq: '10',
    specDesc: 'CHAIN 12S 126L NARROW WIDE SILVER',
    vendorReplyDate: '2025/06/26 00:00', createdAt: '2025/06/20 00:00', updatedAt: '2025/06/25 00:00',
    files: [makeFile('金盛元_CHN0059_功能測試報告.pdf', '2025/06/25 14:00', '金盛元-李OO')],
    status: 'G',
    history: [{ date: '2025/06/25 14:00', event: '轉交巨大', operator: '廠商-金盛元-李OO', remark: '金盛元_CHN0059_功能測試報告.pdf' }],
  },
  // ─ 久廣精密 × INV-20250610-001 × 料號 3301-DRL0053-F02（品次20）─
  {
    id: '7', reportType: '檢驗報告', vendor: '久廣精密(0001000053)',
    shipmentNo: '1720580750', vendorShipNo: 'INV-20250610-001', shipSeq: '20',
    shipDate: '2025/06/10 00:00',
    partNo: '3301-DRL0053-F02', productName: '3301-DRL0053-F02',
    orderNo: '4500300021', orderSeq: '10',
    specDesc: 'DERAILLEUR REAR 12S ELECTRONIC GRP2 BLACK',
    vendorReplyDate: '2025/06/14 00:00', createdAt: '2025/06/10 00:00', updatedAt: '2025/06/13 00:00',
    files: [makeFile('久廣_DRL0053_檢驗報告.pdf', '2025/06/13 10:00', '久廣-王OO')],
    status: 'CL',
    history: [
      { date: '2025/06/16 09:00', event: '已確認', operator: '巨大-陳OO', remark: '' },
      { date: '2025/06/13 10:00', event: '轉交巨大', operator: '廠商-久廣-王OO', remark: '久廣_DRL0053_檢驗報告.pdf' },
    ],
  },
  {
    id: '8', reportType: '功能測試報告', vendor: '久廣精密(0001000053)',
    shipmentNo: '1720580750', vendorShipNo: 'INV-20250610-001', shipSeq: '20',
    shipDate: '2025/06/10 00:00',
    partNo: '3301-DRL0053-F02', productName: '3301-DRL0053-F02',
    orderNo: '4500300021', orderSeq: '10',
    specDesc: 'DERAILLEUR REAR 12S ELECTRONIC GRP2 BLACK',
    vendorReplyDate: '2025/06/15 00:00', createdAt: '2025/06/10 00:00', updatedAt: '2025/06/14 00:00',
    files: [makeFile('久廣_DRL0053_功能測試報告.pdf', '2025/06/14 15:30', '久廣-王OO')],
    status: 'CL',
    history: [
      { date: '2025/06/17 10:00', event: '已確認', operator: '巨大-陳OO', remark: '' },
      { date: '2025/06/14 15:30', event: '轉交巨大', operator: '廠商-久廣-王OO', remark: '久廣_DRL0053_功能測試報告.pdf' },
    ],
  },
  // ─ 佳承精密 × SHP-2025-0045 × 料號 8801-TIR0045-D01（品次10）─
  {
    id: '9', reportType: '檢驗報告', vendor: '佳承精密(0001000045)',
    shipmentNo: '1720580760', vendorShipNo: 'SHP-2025-0045', shipSeq: '10',
    shipDate: '2025/06/15 00:00',
    partNo: '8801-TIR0045-D01', productName: '8801-TIR0045-D01',
    orderNo: '4500200010', orderSeq: '10',
    specDesc: 'TYRE ROAD 700X25C FOLDING CLINCHER BLACK',
    vendorReplyDate: '', createdAt: '2025/06/15 00:00', updatedAt: '2025/06/15 00:00',
    files: [], status: 'V', history: [],
  },
  {
    id: '10', reportType: '功能測試報告', vendor: '佳承精密(0001000045)',
    shipmentNo: '1720580760', vendorShipNo: 'SHP-2025-0045', shipSeq: '10',
    shipDate: '2025/06/15 00:00',
    partNo: '8801-TIR0045-D01', productName: '8801-TIR0045-D01',
    orderNo: '4500200010', orderSeq: '10',
    specDesc: 'TYRE ROAD 700X25C FOLDING CLINCHER BLACK',
    vendorReplyDate: '', createdAt: '2025/06/15 00:00', updatedAt: '2025/06/15 00:00',
    files: [], status: 'V', history: [],
  },
  // ─ 華銘 × 91775297 × 料號 5501-BRK0641-C01（品次10）─
  {
    id: '11', reportType: '檢驗報告', vendor: '華銘(0001000641)',
    shipmentNo: '1720580800', vendorShipNo: '91775297', shipSeq: '10',
    shipDate: '2025/07/10 00:00',
    partNo: '5501-BRK0641-C01', productName: '5501-BRK0641-C01',
    orderNo: '4500100003', orderSeq: '10',
    specDesc: 'BRAKE CALIPER HYDRAULIC DISC FLAT MOUNT FRONT BLACK',
    vendorReplyDate: '', createdAt: '2025/07/10 00:00', updatedAt: '2025/07/10 00:00',
    files: [], status: 'V', history: [],
  },
];



const DEFAULT_COLUMNS: ColDef[] = [
  // ── 預設顯示欄位 ──
  { key: 'reportType',   label: '報告種類',  width: 130, minWidth: 110 },
  { key: 'vendor',       label: '廠商(編號)', width: 180, minWidth: 140 },
  { key: 'vendorShipNo', label: '廠商出貨單', width: 170, minWidth: 130 },
  { key: 'shipSeq',      label: '出貨序號',  width: 100, minWidth: 80  },
  { key: 'docStatus',    label: '單據狀態',  width: 100, minWidth: 80  },
  { key: 'partNo',       label: '料號',      width: 180, minWidth: 140 },
  { key: 'attachment',   label: '附件',      width: 180, minWidth: 130 },
  { key: 'specDesc',     label: '長規格敘述', width: 220, minWidth: 160 },
  // ── 預設隱藏欄位（可透過 Column Selector 開啟）──
  { key: 'productName',  label: '品名',      width: 200, minWidth: 150, visible: false },
  { key: 'orderNo',      label: '訂單號碼',  width: 140, minWidth: 110, visible: false },
  { key: 'orderSeq',     label: '訂單序號',  width: 100, minWidth: 80,  visible: false },
  { key: 'createdAt',    label: '建檔日',    width: 110, minWidth: 90,  visible: false },
  { key: 'updatedAt',    label: '更新時間',  width: 150, minWidth: 90  },
];

// ─── Tab Component ────────────────────────────────────────────────────────────

function TabItem({ label, badge, isActive, badgeType, onClick }: {
  label: string; badge?: number; isActive: boolean; badgeType?: string; onClick: () => void;
}) {
  const getBadgeStyle = () => {
    if (!isActive) return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]' };
    switch (badgeType) {
      case 'V':  return { bg: 'bg-[rgba(0,184,217,0.16)]',  text: 'text-[#006c9c]' };
      case 'G':  return { bg: 'bg-[rgba(255,171,0,0.16)]',  text: 'text-[#B76E00]' };
      case 'CL': return { bg: 'bg-[rgba(34,197,94,0.16)]',  text: 'text-[#118D57]' };
      default:   return { bg: 'bg-[rgba(0,184,217,0.16)]',  text: 'text-[#006c9c]' };
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
      case 'V':  return { bg: 'rgba(0,184,217,0.16)',   color: '#006c9c' };
      case 'G':  return { bg: 'rgba(255,171,0,0.16)',   color: '#B76E00' };
      case 'CL': return { bg: 'rgba(34,197,94,0.16)',   color: '#118D57' };
      default:   return { bg: 'rgba(145,158,171,0.16)', color: '#637381' };
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

// ─── Report File Cell ─────────────────────────────────────────────────────────

function ReportFileCell({ files, isReturned, onClick }: { files: ReportFile[]; isReturned?: boolean; onClick?: () => void }) {
  if (files.length === 0) {
    return (
      <div className="flex items-center gap-[6px]">
        {isReturned && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0" title="已被退回">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#B76E00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="#B76E00" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="#B76E00" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        )}
        <span
          onClick={onClick}
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#ff5630] underline hover:text-[#cc3d1a] transition-colors cursor-pointer"
        >
          待上傳
        </span>
      </div>
    );
  }
  if (files.length === 1) {
    return (
      <div className="flex items-center gap-[6px] min-w-0 cursor-pointer" onClick={onClick}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
            stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors truncate"
          title={files[0].name}
        >
          {files[0].name}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-[6px]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
          stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span
        onClick={onClick}
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
      >
        {files.length} 份文件
      </span>
    </div>
  );
}

// ─── Draggable Column Header ──────────────────────────────────────────────────

const COL_TYPE = 'QUALITY_REPORT_COL';

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
      className={`relative flex items-center px-[16px] h-[56px] shrink-0 bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.12)] select-none cursor-pointer group ${isDragging ? 'opacity-40' : ''} ${isOver ? 'bg-[#e8f4ff]' : ''}`}
      style={{ width: col.width, minWidth: col.minWidth }}
      onClick={() => onSort(col.key)}
    >
      {/* Drag icon — absolute, non-blocking */}
      <div className="absolute left-[2px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
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
      {/* Resize handle */}
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

export function QualityReportPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [data, setData] = useState<ReportRow[]>(mockData);

  // Search
  const [reportTypeFilter, setReportTypeFilter] = useState('');
  const [submittedFilter, setSubmittedFilter]   = useState('');
  const [partNoFilter, setPartNoFilter]         = useState('');
  const [vendorFilter, setVendorFilter]         = useState('');

  // Columns
  const [columns, setColumns]               = useState<ColDef[]>(DEFAULT_COLUMNS.map(c => ({ ...c, visible: true })));
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [tempColumns, setTempColumns]       = useState<ColDef[]>([]);

  // Filters
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters]               = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // Sort
  const [sortKey, setSortKey] = useState<ColKey | null>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Resize
  const resizingKey  = useRef<ColKey | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  // Pagination
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(100);

  const { scrollContainerRef, handleMouseDown } = useHorizontalDragScroll();

  // Overlay
  const [uploadOverlay, setUploadOverlay] = useState<{
    rowId: string;
    vendor: string;
    shipmentNo: string;
    vendorShipNo: string;
    partNo: string;
    shipDate: string;
    reportType: string;
    files: ReportFile[];
    rowStatus: 'V' | 'G' | 'CL';
    isGiant: boolean;
    history?: HistoryEntry[];
    returnReason?: string;
  } | null>(null);

  // ── Tab counts (from full data) ──────────────────────────────────────────────
  const vCount  = data.filter(r => r.status === 'V').length;
  const gCount  = data.filter(r => r.status === 'G').length;
  const clCount = data.filter(r => r.status === 'CL').length;

  // ── Helper: get sort value for a column ─────────────────────────────────────
  const getSortValue = (row: ReportRow, key: ColKey): string => {
    switch (key) {
      case 'docStatus':  return row.status;
      case 'attachment': return row.files.length > 0 ? '已上傳' : '待上傳';
      default:           return String((row as any)[key] ?? '');
    }
  };

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filteredData = data.filter(row => {
    // Tab filter
    if (activeTab !== 'All') {
      const m = activeTab.match(/\(([A-Z]+)\)/);
      if (m && row.status !== m[1]) return false;
    }
    // Search filters
    if (reportTypeFilter && !row.reportType.includes(reportTypeFilter)) return false;
    if (submittedFilter === '已繳' && row.files.length === 0) return false;
    if (submittedFilter === '未繳' && row.files.length > 0) return false;
    if (partNoFilter && !row.partNo.toLowerCase().includes(partNoFilter.toLowerCase())) return false;
    if (vendorFilter) {
      const tokens = vendorFilter.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      if (!tokens.some(t => row.vendor.toLowerCase().includes(t))) return false;
    }
    // Advanced filters
    if (appliedFilters.length > 0) {
      return appliedFilters.every(f => {
        const val = String((row as any)[f.column] ?? '');
        switch (f.operator) {
          case 'contains':   return val.toLowerCase().includes(f.value.toLowerCase());
          case 'equals':     return val.toLowerCase() === f.value.toLowerCase();
          case 'notEquals':  return val.toLowerCase() !== f.value.toLowerCase();
          case 'startsWith': return val.toLowerCase().startsWith(f.value.toLowerCase());
          case 'endsWith':   return val.toLowerCase().endsWith(f.value.toLowerCase());
          case 'isEmpty':    return !val.trim();
          case 'isNotEmpty': return !!val.trim();
          default:           return true;
        }
      });
    }
    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const av = getSortValue(a, sortKey);
    const bv = getSortValue(b, sortKey);
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const paginatedData = sortedData.slice((page - 1) * perPage, page * perPage);
  const visibleCols   = columns.filter(c => c.visible !== false);
  const totalWidth    = visibleCols.reduce((s, c) => s + c.width, 0);

  // ── Handlers ─────────────────────────────────────────────────────────────────
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
      const w = measureTextWidth(getSortValue(row, key)) + 32;
      if (w > mw) mw = w;
    });
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: Math.max(c.minWidth, Math.ceil(Math.max(hw, mw))) } : c));
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const rows = sortedData.map(row => visibleCols.map(c => `"${getSortValue(row, c.key)}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '檢驗測試報告.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Open upload overlay ───────────────────────────────────────────────────────
  const openUploadOverlay = (row: ReportRow) => {
    setUploadOverlay({
      rowId:        row.id,
      vendor:       row.vendor,
      shipmentNo:   row.shipmentNo,
      vendorShipNo: row.vendorShipNo,
      partNo:       row.partNo,
      shipDate:     row.shipDate,
      reportType:   row.reportType,
      files:        row.files,
      rowStatus:    row.status,
      isGiant:      row.status !== 'V',
      history:      row.history,
      returnReason: row.returnReason,
    });
  };

  // ── Handle overlay submit ────────────────────────────────────────────────────
  const handleOverlaySubmit = (
    rowId: string,
    submitData: {
      files?: File[];
      action: 'submitToGiant' | 'returnToVendor' | 'confirmClose' | 'reopen';
      returnReason?: string;
    }
  ) => {
    const ts = nowStr();
    setData(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const updated = { ...r };

      if (submitData.action === 'submitToGiant') {
        const newFiles: ReportFile[] = (submitData.files ?? []).map(f => ({
          name: f.name, uploadedAt: ts, uploadedBy: '廠商',
        }));
        updated.files = [...r.files, ...newFiles];
        updated.status = 'G';
        updated.vendorReplyDate = ts;
        updated.returnReason = undefined;
        updated.history = [
          { date: ts, event: '轉交巨大', operator: '廠商', remark: newFiles.map(f => f.name).join(', ') },
          ...(r.history ?? []),
        ];
      } else if (submitData.action === 'confirmClose') {
        updated.status = 'CL';
        updated.history = [
          { date: ts, event: '已確認', operator: '巨大', remark: '' },
          ...(r.history ?? []),
        ];
      } else if (submitData.action === 'returnToVendor') {
        updated.status = 'V';
        updated.files = [];          // 清除舊檔案，廠商須重新上傳
        updated.returnReason = submitData.returnReason;
        updated.history = [
          { date: ts, event: '退回廠商', operator: '巨大', remark: submitData.returnReason ?? '' },
          ...(r.history ?? []),
        ];
      } else if (submitData.action === 'reopen') {
        updated.status = 'V';
        updated.files = [];          // 清除舊檔案，廠商須重新上傳
        updated.returnReason = undefined;
        updated.history = [
          { date: ts, event: '重新開啟', operator: '巨大', remark: '' },
          ...(r.history ?? []),
        ];
      }

      updated.updatedAt = ts;   // 任何狀態變更都更新最後異動時間
      return updated;
    }));
    setUploadOverlay(null);
  };


  // ── Batch confirm (Selection Bar — G tab only) ───────────────────────────────
  const handleBatchConfirm = () => {
    const ts = nowStr();
    setData(prev => prev.map(r => {
      if (!selectedIds.has(r.id) || r.status !== 'G') return r;
      return {
        ...r,
        status: 'CL',
        updatedAt: ts,
        history: [
          { date: ts, event: '已確認', operator: '巨大', remark: '' },
          ...(r.history ?? []),
        ],
      };
    }));
    setSelectedIds(new Set());
  };

  // ── renderCell ────────────────────────────────────────────────────────────────
  const renderCell = (col: ColDef, row: ReportRow) => {
    const baseClass = "font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e] truncate w-full";
    switch (col.key) {
      case 'docStatus':
        return <StatusBadge status={row.status} />;
      case 'attachment':
        return <ReportFileCell files={row.files} isReturned={row.status === 'V' && !!row.returnReason} onClick={() => openUploadOverlay(row)} />;
      default:
        return <p className={baseClass}>{String((row as any)[col.key] ?? '')}</p>;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── Tabs ── */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        <TabItem label="All"           isActive={activeTab === 'All'}           onClick={() => { setActiveTab('All');           setPage(1); }} />
        <TabItem label="廠商確認中(V)"  badge={vCount}  badgeType="V"  isActive={activeTab === '廠商確認中(V)'} onClick={() => { setActiveTab('廠商確認中(V)'); setPage(1); }} />
        <TabItem label="巨大確認中(G)"  badge={gCount}  badgeType="G"  isActive={activeTab === '巨大確認中(G)'} onClick={() => { setActiveTab('巨大確認中(G)'); setPage(1); }} />
        <TabItem label="關閉結案(CL)"   badge={clCount} badgeType="CL" isActive={activeTab === '關閉結案(CL)'}  onClick={() => { setActiveTab('關閉結案(CL)');  setPage(1); }} />
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ── Search ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="報告種類"
            value={reportTypeFilter}
            onChange={setReportTypeFilter}
            options={[
              { value: '',         label: 'all' },
              { value: '檢驗報告',   label: '檢驗報告' },
              { value: '功能測試報告', label: '功能測試報告' },
            ]}
          />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="已繳/未繳"
            value={submittedFilter}
            onChange={setSubmittedFilter}
            options={[
              { value: '',   label: 'all' },
              { value: '已繳', label: '已繳' },
              { value: '未繳', label: '未繳' },
            ]}
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="料號" value={partNoFilter} onChange={setPartNoFilter} />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="廠商(編號)" value={vendorFilter} onChange={setVendorFilter} placeholder="廠商名稱或代碼，多選請用逗號分隔" />
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


      {/* ── Table ── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className="flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar cursor-grab active:cursor-grabbing"
        >
          <div style={{ minWidth: totalWidth }}>

            {/* Table Header */}
            <div className="flex sticky top-0 z-10">
              {/* Draggable column headers */}
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
              {/* Fill remaining space */}
              <div className="flex-1 bg-[#f4f6f8] min-w-0 border-b border-[rgba(145,158,171,0.12)]" />
            </div>

            {/* Table Rows */}
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">無資料</p>
              </div>
            ) : paginatedData.map(row => (
              <div
                key={row.id}
                className="flex border-b border-[rgba(145,158,171,0.12)] hover:bg-[rgba(145,158,171,0.04)] group transition-colors"
              >
                {/* Data cells */}
                {visibleCols.map((col, i) => (
                  <div
                    key={col.key}
                    className="flex items-center px-[16px] h-[56px] shrink-0 overflow-hidden"
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
        <ReportFileUploadOverlay
          {...uploadOverlay}
          onClose={() => setUploadOverlay(null)}
          onSubmit={data => handleOverlaySubmit(uploadOverlay.rowId, data)}
        />
      )}

    </div>
  );
}
