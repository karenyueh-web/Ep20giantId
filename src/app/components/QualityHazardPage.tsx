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
import { HazardFileUploadOverlay, type HazardFileOverlayProps, type HazardFile } from './HazardFileUploadOverlay';
import { HazardTemplateOverlay } from './HazardTemplateOverlay';
import type { HistoryEntry } from './OrderStoreContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'All' | '廠商確認中(V)' | '巨大確認中(G)' | '關閉結案(CL)';

interface HazardRow {
  id: string;
  year: number;
  vendor: string;
  regulationCode: string;
  submittedStatus: string;
  regulationDesc: string;
  // 檔案欄位（多檔）
  thirdPartyFiles: HazardFile[];
  selfDeclFiles: HazardFile[];
  thirdPartyNotRequired: boolean;
  selfDeclNotRequired: boolean;
  // 日期
  vendorReplyDate: string;
  dataUpdateDate: string;
  // 狀態
  status: 'V' | 'G' | 'CL';
  lastEditor?: string;
  lastEditTime?: string;
  // 巨大確認結案
  thirdPartyConfirmed?: boolean;
  selfDeclConfirmed?: boolean;
  // 歷程
  thirdPartyHistory?: HistoryEntry[];
  selfDeclHistory?: HistoryEntry[];
}

// 顯示欄位 key（補正：表格 key 與 HazardRow 欄位名路由分離）
type DisplayColKey = 'year' | 'vendor' | 'regulationCode' | 'submittedStatus' | 'regulationDesc'
  | 'thirdPartyFile' | 'selfDeclFile' | 'vendorReplyDate';

interface ColDef {
  key: DisplayColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

// ─── 輔助函數 ─────────────────────────────────────────────────────────────

// 轉涵 HazardFile
const makeFile = (name: string, at: string, by?: string): HazardFile => ({ name, uploadedAt: at, uploadedBy: by });

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockData: HazardRow[] = [
  // ─ 速聯 ─
  { id: '1',  year: 2026, vendor: '速聯(000100463)', regulationCode: 'REACH', submittedStatus: 'V', regulationDesc: '化學品註冊、評估與授權限制法規',
    thirdPartyFiles: [makeFile('2026危害物質報告_REACH.pdf', '2026/01/15 09:30', '張OO')], thirdPartyNotRequired: false,
    selfDeclFiles: [], selfDeclNotRequired: false,
    vendorReplyDate: '', dataUpdateDate: '2026/01/15 09:30', status: 'V', lastEditor: '張OO', lastEditTime: '2026/01/15 09:30',
    thirdPartyHistory: [{ date: '2026/01/15 09:30', event: '上傳檔案', operator: '廠商-張OO', remark: '2026危害物質報告_REACH.pdf' }],
    selfDeclHistory: [],
  },
  { id: '2',  year: 2026, vendor: '速聯(000100463)', regulationCode: 'RoHS',  submittedStatus: 'V', regulationDesc: '限制電子電氣設備中某些有害物質',
    thirdPartyFiles: [makeFile('xxxxxxxxxx.pdf', '2026/01/20 14:05', '李 OO')], thirdPartyNotRequired: false,
    selfDeclFiles: [], selfDeclNotRequired: false,
    vendorReplyDate: '', dataUpdateDate: '2026/01/20 14:05', status: 'V', lastEditor: '李 OO', lastEditTime: '2026/01/20 14:05',
    thirdPartyHistory: [{ date: '2026/01/20 14:05', event: '上傳檔案', operator: '廠商-李 OO', remark: 'xxxxxxxxxx.pdf' }],
    selfDeclHistory: [],
  },
  { id: '3',  year: 2026, vendor: '速聯(000100463)', regulationCode: 'CP 65', submittedStatus: 'G', regulationDesc: '加州第65號提案（安全飲用水與有毒物質）',
    thirdPartyFiles: [], thirdPartyNotRequired: true,
    selfDeclFiles:   [], selfDeclNotRequired: true,
    vendorReplyDate: '2026/02/01 10:00', dataUpdateDate: '2026/01/28 09:00', status: 'G', lastEditor: '王 OO', lastEditTime: '2026/02/01 10:00',
    thirdPartyHistory: [{ date: '2026/01/28 08:50', event: '設定不需繳交', operator: '廠商-王 OO', remark: '' }],
    selfDeclHistory:   [{ date: '2026/01/28 08:55', event: '設定不需繳交', operator: '廠商-王 OO', remark: '' }],
  },
  { id: '4',  year: 2026, vendor: '速聯(000100463)', regulationCode: 'POPs',  submittedStatus: 'G', regulationDesc: '持久性有機污染物規範',
    thirdPartyFiles: [], thirdPartyNotRequired: true,
    selfDeclFiles:   [], selfDeclNotRequired: true,
    vendorReplyDate: '2026/02/01 10:15', dataUpdateDate: '2026/01/28 09:00', status: 'G', lastEditor: '王 OO', lastEditTime: '2026/02/01 10:15',
    thirdPartyHistory: [{ date: '2026/01/28 09:00', event: '設定不需繳交', operator: '廠商-王 OO', remark: '' }],
    selfDeclHistory:   [{ date: '2026/01/28 09:05', event: '設定不需繳交', operator: '廠商-王 OO', remark: '' }],
  },
  // ─ 邁達 ─
  { id: '5',  year: 2026, vendor: '邁達(000200112)', regulationCode: 'REACH', submittedStatus: 'G', regulationDesc: '化學品註冊、評估與授權限制法規',
    thirdPartyFiles: [makeFile('邁達_REACH報告.pdf', '2026/02/05 10:00', '陳 OO')], thirdPartyNotRequired: false,
    selfDeclFiles:   [makeFile('邁達_REACH宣告書.pdf', '2026/02/05 10:30', '陳 OO')], selfDeclNotRequired: false,
    vendorReplyDate: '2026/02/10 16:45', dataUpdateDate: '2026/02/05 10:00', status: 'G', lastEditor: '陳 OO', lastEditTime: '2026/02/10 16:45',
    thirdPartyHistory: [{ date: '2026/02/05 10:00', event: '轉交巨大', operator: '廠商-陳 OO', remark: '邁達_REACH報告.pdf' }],
    selfDeclHistory:   [{ date: '2026/02/05 10:30', event: '轉交巨大', operator: '廠商-陳 OO', remark: '邁達_REACH宣告書.pdf' }],
  },
  { id: '6',  year: 2026, vendor: '邁達(000200112)', regulationCode: 'RoHS',  submittedStatus: 'V', regulationDesc: '限制電子電氣設備中某些有害物質',
    thirdPartyFiles: [], thirdPartyNotRequired: false,
    selfDeclFiles:   [], selfDeclNotRequired: false,
    vendorReplyDate: '', dataUpdateDate: '2026/02/01 08:00', status: 'V',
    thirdPartyHistory: [], selfDeclHistory: [],
  },
  { id: '7',  year: 2026, vendor: '邁達(000200112)', regulationCode: 'PFAS',  submittedStatus: 'V', regulationDesc: '全氟和多氟烷基物質限制規範',
    thirdPartyFiles: [], thirdPartyNotRequired: false,
    selfDeclFiles:   [], selfDeclNotRequired: true,
    vendorReplyDate: '', dataUpdateDate: '2026/03/01 11:20', status: 'V', lastEditor: '張OO', lastEditTime: '2026/03/01 11:20',
    thirdPartyHistory: [], selfDeclHistory: [{ date: '2026/03/01 11:20', event: '設定不需繳交', operator: '廠商-張OO', remark: '' }],
  },
  // ─ 新興 ─
  { id: '8',  year: 2026, vendor: '新興(000300078)', regulationCode: 'REACH', submittedStatus: 'G', regulationDesc: '化學品註冊、評估與授權限制法規',
    thirdPartyFiles: [makeFile('新興_REACH報告.pdf', '2026/02/20 10:00', '小田OO'), makeFile('新興_REACH補件.pdf', '2026/02/22 09:00', '小田OO')], thirdPartyNotRequired: false,
    selfDeclFiles:   [makeFile('新興_REACH宣告.pdf', '2026/02/20 10:30', '小田OO')], selfDeclNotRequired: false,
    vendorReplyDate: '2026/02/28 08:55', dataUpdateDate: '2026/02/20 10:00', status: 'G', lastEditor: '小田OO', lastEditTime: '2026/02/28 08:55',
    thirdPartyHistory: [
      { date: '2026/02/22 09:00', event: '上傳檔案', operator: '廠商-小田OO', remark: '新興_REACH補件.pdf' },
      { date: '2026/02/20 10:00', event: '轉交巨大', operator: '廠商-小田OO', remark: '新興_REACH報告.pdf' },
    ],
    selfDeclHistory: [{ date: '2026/02/20 10:30', event: '轉交巨大', operator: '廠商-小田OO', remark: '新興_REACH宣告.pdf' }],
  },
  { id: '9',  year: 2026, vendor: '新興(000300078)', regulationCode: 'RoHS',  submittedStatus: 'V', regulationDesc: '限制電子電氣設備中某些有害物質',
    thirdPartyFiles: [makeFile('新興_RoHS報告.pdf', '2026/03/05 13:30', '小田OO')], thirdPartyNotRequired: false,
    selfDeclFiles:   [], selfDeclNotRequired: false,
    vendorReplyDate: '', dataUpdateDate: '2026/03/05 13:30', status: 'V', lastEditor: '小田OO', lastEditTime: '2026/03/05 13:30',
    thirdPartyHistory: [{ date: '2026/03/05 13:30', event: '上傳檔案', operator: '廠商-小田OO', remark: '新興_RoHS報告.pdf' }],
    selfDeclHistory: [],
  },
  // ─ 鉅德 ─
  { id: '10', year: 2026, vendor: '鉅德(000400055)', regulationCode: 'REACH', submittedStatus: 'CL', regulationDesc: '化學品註冊、評估與授權限制法規',
    thirdPartyFiles: [makeFile('鉅德_REACH報告.pdf', '2026/03/08 10:00', '吴OO')], thirdPartyNotRequired: false,
    selfDeclFiles:   [makeFile('鉅德_REACH宣告.pdf', '2026/03/08 10:30', '吴OO')], selfDeclNotRequired: false,
    vendorReplyDate: '2026/03/10 17:00', dataUpdateDate: '2026/03/12 09:00', status: 'CL',
    lastEditor: '吴OO', lastEditTime: '2026/03/12 09:00', thirdPartyConfirmed: true, selfDeclConfirmed: true,
    thirdPartyHistory: [
      { date: '2026/03/12 09:00', event: '已確認', operator: '巨大-吴OO', remark: '' },
      { date: '2026/03/08 10:00', event: '轉交巨大', operator: '廠商-吴OO', remark: '鉅德_REACH報告.pdf' },
    ],
    selfDeclHistory: [
      { date: '2026/03/12 09:00', event: '已確認', operator: '巨大-吴OO', remark: '' },
      { date: '2026/03/08 10:30', event: '轉交巨大', operator: '廠商-吴OO', remark: '鉅德_REACH宣告.pdf' },
    ],
  },
  { id: '11', year: 2026, vendor: '鉅德(000400055)', regulationCode: 'RoHS',  submittedStatus: 'CL', regulationDesc: '限制電子電氣設備中某些有害物質',
    thirdPartyFiles: [makeFile('鉅德_RoHS報告.pdf', '2026/03/13 09:00', '吴OO')], thirdPartyNotRequired: false,
    selfDeclFiles:   [makeFile('鉅德_RoHS宣告.pdf', '2026/03/13 09:30', '吴OO')], selfDeclNotRequired: false,
    vendorReplyDate: '2026/03/15 09:10', dataUpdateDate: '2026/03/16 10:00', status: 'CL',
    lastEditor: '吴OO', lastEditTime: '2026/03/16 10:00', thirdPartyConfirmed: true, selfDeclConfirmed: true,
    thirdPartyHistory: [
      { date: '2026/03/16 10:00', event: '已確認', operator: '巨大-吴OO', remark: '' },
      { date: '2026/03/13 09:00', event: '轉交巨大', operator: '廠商-吴OO', remark: '鉅德_RoHS報告.pdf' },
    ],
    selfDeclHistory: [
      { date: '2026/03/16 10:00', event: '已確認', operator: '巨大-吴OO', remark: '' },
      { date: '2026/03/13 09:30', event: '轉交巨大', operator: '廠商-吴OO', remark: '鉅德_RoHS宣告.pdf' },
    ],
  },
  { id: '12', year: 2025, vendor: '速聯(000100463)', regulationCode: 'REACH', submittedStatus: 'CL', regulationDesc: '化學品註冊、評估與授權限制法規',
    thirdPartyFiles: [makeFile('2025危害物質報告_REACH.pdf', '2025/02/25 10:00', '張OO')], thirdPartyNotRequired: false,
    selfDeclFiles:   [makeFile('2025_REACH宣告書.pdf', '2025/02/25 10:30', '張OO')], selfDeclNotRequired: false,
    vendorReplyDate: '2025/02/28 15:00', dataUpdateDate: '2025/03/01 10:00', status: 'CL',
    lastEditor: '張OO', lastEditTime: '2025/03/01 10:00', thirdPartyConfirmed: true, selfDeclConfirmed: true,
    thirdPartyHistory: [{ date: '2025/03/01 10:00', event: '已確認', operator: '巨大-張OO', remark: '' }],
    selfDeclHistory:   [{ date: '2025/03/01 10:00', event: '已確認', operator: '巨大-張OO', remark: '' }],
  },
];

const DEFAULT_COLUMNS: ColDef[] = [
  { key: 'year',            label: '年度',         width: 90,  minWidth: 80  },
  { key: 'vendor',          label: '廠商(編號)',    width: 180, minWidth: 140 },
  { key: 'regulationCode',  label: '法規代號',      width: 110, minWidth: 90  },
  { key: 'submittedStatus', label: '繳交狀態',      width: 100, minWidth: 80  },
  { key: 'regulationDesc',  label: '法規說明',      width: 240, minWidth: 160 },
  { key: 'thirdPartyFile',  label: '第三方檢測',    width: 180, minWidth: 140 },
  { key: 'selfDeclFile',    label: '自我宣告書',    width: 150, minWidth: 120 },
  { key: 'vendorReplyDate', label: '更新日期',      width: 165, minWidth: 130 },
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
function FileCell({ files, notRequired, isReturned, confirmed, onClick }: {
  files: HazardFile[];
  notRequired: boolean;
  isReturned?: boolean;
  confirmed?: boolean;
  onClick?: () => void;
}) {
  if (notRequired) {
    return (
      <span
        onClick={onClick}
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#919EAB] underline hover:text-[#637381] transition-colors cursor-pointer"
      >
        不需繳交
      </span>
    );
  }
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
  // 多檔
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

const COL_TYPE = 'HAZARD_COL';
const CHECKBOX_W = 52;

function DraggableColHeader({ col, index, isLast, sortKey, sortDir, onSort, onMoveCol, onResizeStart, onAutoFit }: {
  col: ColDef; index: number; isLast: boolean;
  sortKey: DisplayColKey | null; sortDir: 'asc' | 'desc';
  onSort: (key: DisplayColKey) => void;
  onMoveCol: (from: number, to: number) => void;
  onResizeStart: (key: DisplayColKey, startX: number, startW: number) => void;
  onAutoFit: (key: DisplayColKey) => void;
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
      {/* drag icon：absolute 定位，不佔文字空間 */}
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
  const [yearFilter, setYearFilter]               = useState(String(new Date().getFullYear()));
  const [regulationFilter, setRegulationFilter]   = useState('');
  const [thirdPartyFilter, setThirdPartyFilter]   = useState('');
  const [selfDeclFilter, setSelfDeclFilter]       = useState('');

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
  const [sortKey, setSortKey]   = useState<DisplayColKey | null>('vendorReplyDate');
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('desc');

  // Resize
  const resizingKey  = useRef<DisplayColKey | null>(null);
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
    if (thirdPartyFilter === '已繳' && row.thirdPartyFiles.length === 0 && !row.thirdPartyNotRequired) return false;
    if (thirdPartyFilter === '未繳' && (row.thirdPartyFiles.length > 0 || row.thirdPartyNotRequired)) return false;
    if (selfDeclFilter === '已繳' && row.selfDeclFiles.length === 0 && !row.selfDeclNotRequired) return false;
    if (selfDeclFilter === '未繳' && (row.selfDeclFiles.length > 0 || row.selfDeclNotRequired)) return false;
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

  const getRowDisplayDate = (row: HazardRow) =>
    row.status === 'G' ? row.vendorReplyDate : row.dataUpdateDate;

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const av = sortKey === 'vendorReplyDate' ? getRowDisplayDate(a) : String((a as any)[sortKey] ?? '');
    const bv = sortKey === 'vendorReplyDate' ? getRowDisplayDate(b) : String((b as any)[sortKey] ?? '');
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
  const handleSort = (key: DisplayColKey) => {
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

  const handleResizeStart = (key: DisplayColKey, startX: number, startW: number) => {
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

  const autoFitWidth = useCallback((key: DisplayColKey) => {
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
      const fileArr    = field === 'thirdParty' ? row.thirdPartyFiles    : row.selfDeclFiles;
      const notReq     = field === 'thirdParty' ? row.thirdPartyNotRequired : row.selfDeclNotRequired;
      const fileStatus: HazardFileOverlayProps['fileStatus'] =
        notReq ? 'notRequired' : fileArr.length > 0 ? 'uploaded' : 'pending';
      const history    = field === 'thirdParty' ? (row.thirdPartyHistory ?? []) : (row.selfDeclHistory ?? []);
      // 取最新一筆退回原因（廠商視角才顯示）
      const latestReturn = history.find(h => h.event === '退回廠商');
      const returnReason = row.status === 'V' && latestReturn ? latestReturn.remark : undefined;
      setUploadOverlay({
        year: row.year,
        vendor: row.vendor,
        regulationCode: row.regulationCode,
        regulationDesc: row.regulationDesc,
        field,
        fileStatus,
        files: fileArr,
        notRequired: notReq,
        history,
        returnReason,
        rowStatus: row.status,
        isGiant: row.status !== 'V',
      });
    };

    // 日期欄顯示：G 狀態顯示廠商回覆日期；V/CL 顯示資料更新日期
    const displayDate = row.status === 'G' ? row.vendorReplyDate : row.dataUpdateDate;

    switch (col.key) {
      case 'submittedStatus':
        return <StatusBadge status={row.status} />;
      case 'thirdPartyFile': {
        const tpHistory = row.thirdPartyHistory ?? [];
        const tpReturned = row.status === 'V' && tpHistory.some(h => h.event === '退回廠商');
        return <FileCell files={row.thirdPartyFiles} notRequired={row.thirdPartyNotRequired} isReturned={tpReturned} confirmed={row.thirdPartyConfirmed} onClick={() => openUploadOverlay('thirdParty')} />;
      }
      case 'selfDeclFile': {
        const sdHistory = row.selfDeclHistory ?? [];
        const sdReturned = row.status === 'V' && sdHistory.some(h => h.event === '退回廠商');
        return <FileCell files={row.selfDeclFiles} notRequired={row.selfDeclNotRequired} isReturned={sdReturned} confirmed={row.selfDeclConfirmed} onClick={() => openUploadOverlay('selfDecl')} />;
      }
      case 'vendorReplyDate':
        return <p className={baseClass}>{displayDate || ''}</p>;
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
          activeTab === '廠商確認中(V)' ? (
            <button
              onClick={() => setShowTemplateOverlay(true)}
              className="flex items-center h-[36px] px-[16px] rounded-[8px] text-[#1677ff] border border-[#1677ff] hover:bg-[rgba(22,119,255,0.06)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors"
            >
              宣告書範本
            </button>
          ) : undefined
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
          {activeTab === '巨大確認中(G)' ? (
            /* G 狀態：僅提供批次已確認 */
            <span
              onClick={() => {
                setData(prev => prev.map(r => {
                  if (!selectedIds.has(r.id)) return r;
                  const nowStr = (() => {
                    const now = new Date();
                    const p = (n: number) => String(n).padStart(2, '0');
                    return `${now.getFullYear()}/${p(now.getMonth()+1)}/${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`;
                  })();
                  const updated = { ...r, thirdPartyConfirmed: true, selfDeclConfirmed: true };
                  if (updated.thirdPartyConfirmed && updated.selfDeclConfirmed) {
                    updated.status = 'CL';
                    updated.submittedStatus = 'CL';
                    updated.dataUpdateDate = nowStr;
                  }
                  return updated;
                }));
                setSelectedIds(new Set());
              }}
              className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
            >
              已確認
            </span>
          ) : (
            /* V/CL 狀態：設定不繳交 */
            <>
              <span
                onClick={() => {
                setData(prev => prev.map(r => {
                    if (!selectedIds.has(r.id)) return r;
                    const updated = { ...r, thirdPartyNotRequired: true, thirdPartyFiles: [] };
                    if (updated.status === 'V') {
                      const isComplete = (files: HazardFile[], notReq: boolean) => notReq || files.length > 0;
                      const bothDone = isComplete(updated.thirdPartyFiles, updated.thirdPartyNotRequired)
                                    && isComplete(updated.selfDeclFiles, updated.selfDeclNotRequired);
                      if (bothDone) { updated.status = 'G'; updated.submittedStatus = 'G'; }
                    }
                    return updated;
                  }));
                  setSelectedIds(new Set());
                }}
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
              >
                設定不繳交第三方檢測
              </span>
              <span className="text-[rgba(145,158,171,0.4)] select-none">|</span>
              <span
                onClick={() => {
                setData(prev => prev.map(r => {
                    if (!selectedIds.has(r.id)) return r;
                    const updated = { ...r, selfDeclNotRequired: true, selfDeclFiles: [] };
                    if (updated.status === 'V') {
                      const isComplete = (files: HazardFile[], notReq: boolean) => notReq || files.length > 0;
                      const bothDone = isComplete(updated.thirdPartyFiles, updated.thirdPartyNotRequired)
                                    && isComplete(updated.selfDeclFiles, updated.selfDeclNotRequired);
                      if (bothDone) { updated.status = 'G'; updated.submittedStatus = 'G'; }
                    }
                    return updated;
                  }));
                  setSelectedIds(new Set());
                }}
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
              >
                設定不繳交自我宣告書
              </span>
            </>
          )}
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
                {selectedIds.size === 0 && (
                  <button onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
                    <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} />
                  </button>
                )}
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
                {visibleCols.map((col, i) => {
                  const isConfirmed =
                    (col.key === 'thirdPartyFile' && row.thirdPartyConfirmed) ||
                    (col.key === 'selfDeclFile'   && row.selfDeclConfirmed);
                  return (
                    <div
                      key={col.key}
                      className={`flex items-center px-[16px] h-[52px] shrink-0 overflow-hidden${isConfirmed ? ' bg-[rgba(34,197,94,0.1)]' : ''}`}
                      style={i === visibleCols.length - 1
                        ? { minWidth: col.width, flex: 1 }
                        : { width: col.width, minWidth: col.minWidth }}
                    >
                      {renderCell(col, row)}
                    </div>
                  );
                })}
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
          onSubmit={({ files: newFiles = [], action, returnReason }) => {
            if (!uploadOverlay) return;
            const nowStr = (() => {
              const now = new Date();
              const p = (n: number) => String(n).padStart(2, '0');
              return `${now.getFullYear()}/${p(now.getMonth()+1)}/${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`;
            })();

            setData(prev => prev.map(r => {
              const isTarget = r.year === uploadOverlay.year
                && r.vendor === uploadOverlay.vendor
                && r.regulationCode === uploadOverlay.regulationCode;
              if (!isTarget) return r;

              const isThird    = uploadOverlay.field === 'thirdParty';
              const filesKey   = isThird ? 'thirdPartyFiles'   : 'selfDeclFiles';
              const notReqKey  = isThird ? 'thirdPartyNotRequired' : 'selfDeclNotRequired';
              const confirmKey = isThird ? 'thirdPartyConfirmed' : 'selfDeclConfirmed';
              const histKey    = isThird ? 'thirdPartyHistory'  : 'selfDeclHistory';

              // 輔助：建立歷程記錄
              const addHistory = (event: string, remark = ''): HistoryEntry => ({
                date: nowStr, event, operator: '操作人員-OO', remark,
              });

              // ── 巨大：退回廠商（G → V）──
              if (action === 'returnToVendor') {
                const newEntry = addHistory('退回廠商', returnReason ?? '');
                return {
                  ...r,
                  [filesKey]: [],
                  [notReqKey]: false,
                  status: 'V', submittedStatus: 'V',
                  thirdPartyConfirmed: false, selfDeclConfirmed: false,
                  dataUpdateDate: nowStr,
                  [histKey]: [newEntry, ...(r[histKey] ?? [])],
                };
              }

              // ── 巨大：確認結案（標記此欄）──
              if (action === 'confirmClose') {
                const newEntry = addHistory('已確認');
                const updated: HazardRow = {
                  ...r,
                  [confirmKey]: true,
                  [histKey]: [newEntry, ...(r[histKey] ?? [])],
                };
                if (updated.thirdPartyConfirmed && updated.selfDeclConfirmed) {
                  updated.status = 'CL';
                  updated.submittedStatus = 'CL';
                  updated.dataUpdateDate = nowStr;
                }
                return updated;
              }

              // ── CL 重新開啟（CL → V）：重置此欄，整筆轉 V ──
              if (action === 'reopen' && r.status === 'CL') {
                const newEntry = addHistory('重新開啟');
                return {
                  ...r,
                  [filesKey]: [],
                  [notReqKey]: false,
                  [confirmKey]: false,
                  status: 'V',
                  submittedStatus: 'V',
                  dataUpdateDate: nowStr,
                  [histKey]: [newEntry, ...(r[histKey] ?? [])],
                };
              }

              // ── 一般設定 ──
              let updatedFiles  = r[filesKey] as HazardFile[];
              let updatedNotReq = r[notReqKey] as boolean;
              const newHistEntries: HistoryEntry[] = [];

              if (action === 'notRequired') {
                updatedNotReq = true;
                updatedFiles  = [];
                newHistEntries.push(addHistory('設定不需繳交'));
              } else if (action === 'reopen') {
                updatedNotReq = false;
                updatedFiles  = [];
                newHistEntries.push(addHistory('重新開啟上傳'));
              } else if (action === 'submitToGiant' || action === 'upload') {
                // 新增多檔
                const appended: HazardFile[] = newFiles.map(f => ({
                  name: f.name,
                  uploadedAt: nowStr,
                  uploadedBy: '操作人員',
                }));
                updatedFiles = [...updatedFiles, ...appended];
                appended.forEach(af => newHistEntries.push(addHistory(
                  action === 'submitToGiant' ? '轉交巨大' : '上傳檔案',
                  af.name,
                )));
              }

              const updated: HazardRow = {
                ...r,
                [filesKey]:  updatedFiles,
                [notReqKey]: updatedNotReq,
                [histKey]:   [...newHistEntries, ...(r[histKey] ?? [])],
              };

              // 自動重新計算 status（CL 不動）
              if (updated.status !== 'CL') {
                const isComplete = (files: HazardFile[], notReq: boolean) => notReq || files.length > 0;
                const bothDone = isComplete(updated.thirdPartyFiles, updated.thirdPartyNotRequired)
                              && isComplete(updated.selfDeclFiles, updated.selfDeclNotRequired);
                const newStatus = bothDone ? 'G' : 'V';
                if (updated.status === 'V' && newStatus === 'G') {
                  updated.vendorReplyDate = nowStr;
                }
                if (updated.status === 'G' && newStatus === 'V') {
                  updated.dataUpdateDate = nowStr;
                  updated.thirdPartyConfirmed = false;
                  updated.selfDeclConfirmed   = false;
                }
                updated.status = newStatus;
                updated.submittedStatus = newStatus;
              }

              return updated;
            }));
            setUploadOverlay(null);
          }}
        />
      )}

      {/* ── Template Overlay ── */}
      {showTemplateOverlay && (
        <HazardTemplateOverlay
          onClose={() => setShowTemplateOverlay(false)}
          isGiant={true} // 顯示新增/編輯功能
        />
      )}
    </div>
  );
}
