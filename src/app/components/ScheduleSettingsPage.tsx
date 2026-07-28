/**
 * ScheduleSettingsPage — 排程設定
 *
 * 遵循標準表格系統規範（手動組裝，參考 OrderScheduleInquiryPage.tsx）：
 *  ✅ DnD 欄位拖拉重排 (react-dnd)
 *  ✅ 欄位排序（點表頭）
 *  ✅ 欄位拖拽調整寬度（自製 resize handle + 雙擊自動最適）
 *  ✅ 橫向拖拉捲動 (useHorizontalDragScroll)
 *  ✅ TableToolbar（Columns / Filters / Export）
 *  ✅ ColumnSelector 欄位顯示/隱藏
 *  ✅ FilterDialog 進階篩選
 *  ✅ localStorage 記憶欄位設定
 *  ✅ PaginationControls 分頁
 *  ✅ BaseOverlay 新增/編輯 Modal
 */

import { useState, useMemo, useCallback, useEffect, useRef, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { PaginationControls } from './PaginationControls';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';
import { ToggleSwitch } from './ToggleSwitch';
import { BaseOverlay } from './BaseOverlay';
import { CheckboxIcon } from './CheckboxIcon';


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type SchedColKey = 'frequency' | 'name' | 'enabled' | 'url' | 'mailTypes' | 'updatedAt';

interface SchedCol {
  key: SchedColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

interface ScheduleRow {
  id: number;
  category: string;
  name: string;
  enabled: boolean;
  scheduleType: 'weekday' | 'date';
  days: string;             // 顯示用：每天 / 一、二、... / 10號、20號
  startTime: string;        // 幾點開始 (HH:mm)
  intervalMinutes: string;  // 執行間隔（分鐘）
  url: string;
  mailTypes: string;        // 顯示用：訂單通知信
  mailTypesArr: string[];
  updatedAt: string;
}

interface ScheduleForm {
  name: string;
  url: string;
  category: string;
  months: string[];
  scheduleType: 'weekday' | 'date';
  weekdays: string[];
  dateDays: string[];
  startTime: string;       // 幾點開始 (HH:mm)
  intervalMinutes: string; // 幾分執行一次
  mailTypes: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'schedule-settings-v2-cols';

const DEFAULT_COLS: SchedCol[] = [
  { key: 'name',       label: '排程名稱',    width: 200, minWidth: 140 },
  { key: 'enabled',    label: '啟用',        width: 88,  minWidth: 72  },
  { key: 'frequency',  label: '執行頻率',    width: 300, minWidth: 200 },
  { key: 'url',        label: 'URL',         width: 230, minWidth: 130 },
  { key: 'mailTypes',  label: '信件類別', width: 140, minWidth: 110 },
  { key: 'updatedAt',  label: '最近更新時間', width: 160, minWidth: 120 },
];

const CATEGORY_OPTIONS = ['信件通知', '觸發程式'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS = ['一','二','三','四','五','六','日'];
const DATE_DAYS = ['5','10','15','20','25','30'];
const MONTH_MAX_DAYS: Record<string, number> = {
  'Jan':31,'Feb':28,'Mar':31,'Apr':30,'May':31,'Jun':30,
  'Jul':31,'Aug':31,'Sep':30,'Oct':31,'Nov':30,'Dec':31,
};
const MAIL_TYPE_OPTIONS = ['小平台','新訂單','修正單通知','紙本發票','出貨通知','單價異常','零件維護','寄樣單'];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});
const INTERVAL_MIN_OPTIONS = [
  { value: 'once', label: '僅此一次' },
  { value: '5',    label: '5 分' },
  { value: '10',   label: '10 分' },
  { value: '15',   label: '15 分' },
  { value: '30',   label: '30 分' },
  { value: '60',   label: '1 小時' },
  { value: '90',   label: '1.5 小時' },
  { value: '120',  label: '2 小時' },
  { value: '180',  label: '3 小時' },
  { value: '240',  label: '4 小時' },
  { value: '360',  label: '6 小時' },
  { value: '480',  label: '8 小時' },
  { value: '720',  label: '12 小時' },
  { value: '1440', label: '24 小時' },
];

const INITIAL_FORM: ScheduleForm = {
  name: '', url: '', category: '信件通知',
  months: [], scheduleType: 'weekday',
  weekdays: ['一','二','三','四','五','六','日'], dateDays: [],
  startTime: '08:00', intervalMinutes: '60',
  mailTypes: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_DATA: ScheduleRow[] = [
  // ── 信件通知 ──
  { id:1,  category:'信件通知', name:'creat po錯誤',                                        enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'08:00', intervalMinutes:'120', url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:2,  category:'信件通知', name:'EP 訂單單價不一致通知',                               enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'30',  url:'', mailTypes:'單價異常',              mailTypesArr:['單價異常'],              updatedAt:'2025/10/10 08:00' },
  { id:3,  category:'信件通知', name:'SAP訂單資訊無抵到EP通知',                             enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'07:00', intervalMinutes:'60',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:4,  category:'信件通知', name:'訂單不同意通知',                                      enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'00:00', intervalMinutes:'60',  url:'', mailTypes:'新訂單',                mailTypesArr:['新訂單'],                updatedAt:'2025/10/10 08:00' },
  { id:5,  category:'信件通知', name:'訂單品名或規格同步變更通知',                          enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'30',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:6,  category:'信件通知', name:'訂單逾期稽催通知',                                    enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'30',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:7,  category:'信件通知', name:'接貨單通知',                                          enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'08:00', intervalMinutes:'120', url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:8,  category:'信件通知', name:'新訂單通知',                                          enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'08:00', intervalMinutes:'120', url:'', mailTypes:'新訂單',                mailTypesArr:['新訂單'],                updatedAt:'2025/10/10 08:00' },
  { id:9,  category:'信件通知', name:'新預測訂單通知',                                      enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'00:00', intervalMinutes:'60',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:10, category:'信件通知', name:'修正單不同意通知',                                    enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'00:00', intervalMinutes:'60',  url:'', mailTypes:'修正單通知',            mailTypesArr:['修正單通知'],            updatedAt:'2025/10/10 08:00' },
  { id:11, category:'信件通知', name:'修正單通知',                                          enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'16:00', intervalMinutes:'300', url:'', mailTypes:'修正單通知',            mailTypesArr:['修正單通知'],            updatedAt:'2025/10/10 08:00' },
  { id:12, category:'信件通知', name:'SAP採購單項次的定價日期控制變成不是【5收貨日期】',    enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'07:00', intervalMinutes:'60',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:13, category:'信件通知', name:'刪除出貨項次通知',                                    enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'00:00', intervalMinutes:'60',  url:'', mailTypes:'出貨通知',              mailTypesArr:['出貨通知'],              updatedAt:'2025/10/10 08:00' },
  { id:14, category:'信件通知', name:'物料狀態不合規定通知',                                enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'30',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:15, category:'信件通知', name:'出貨比對單價不一致通知',                              enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'30',  url:'', mailTypes:'單價異常',              mailTypesArr:['單價異常'],              updatedAt:'2025/10/10 08:00' },
  { id:16, category:'信件通知', name:'出貨單(IBDN)未同步SAP通知',                           enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'120', url:'', mailTypes:'出貨通知',              mailTypesArr:['出貨通知'],              updatedAt:'2025/10/10 08:00' },
  { id:17, category:'信件通知', name:'建立發票失敗',                                        enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五',     startTime:'07:30', intervalMinutes:'60',  url:'', mailTypes:'紙本發票、小平台',       mailTypesArr:['紙本發票','小平台'],     updatedAt:'2025/10/10 08:00' },
  { id:18, category:'信件通知', name:'發票價差通知',                                        enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五',     startTime:'07:30', intervalMinutes:'60',  url:'', mailTypes:'紙本發票、小平台',       mailTypesArr:['紙本發票','小平台'],     updatedAt:'2025/10/10 08:00' },
  { id:19, category:'信件通知', name:'發票於處理中狀態超過一天',                            enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'07:00', intervalMinutes:'60',  url:'', mailTypes:'紙本發票、小平台',       mailTypesArr:['紙本發票','小平台'],     updatedAt:'2025/10/10 08:00' },
  { id:20, category:'信件通知', name:'索樣單通知',                                          enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'60',  url:'', mailTypes:'寄樣單',                mailTypesArr:['寄樣單'],                updatedAt:'2025/10/10 08:00' },
  { id:21, category:'信件通知', name:'零件資訊維護通知',                                    enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'60',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:22, category:'信件通知', name:'廠商已維護零件資訊通知',                              enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', startTime:'00:00', intervalMinutes:'60',  url:'', mailTypes:'零件維護',              mailTypesArr:['零件維護'],              updatedAt:'2025/10/10 08:00' },
  { id:23, category:'信件通知', name:'請上傳檢驗或測試報告',                                enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'23:00', intervalMinutes:'60',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:24, category:'信件通知', name:'請繳交危害物質檢測報告',                              enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'07:00', intervalMinutes:'60',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  { id:25, category:'信件通知', name:'請上傳產品保險',                                      enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'60',  url:'', mailTypes:'',                    mailTypesArr:[],                        updatedAt:'2025/10/10 08:00' },
  // ── 觸發程式 ──
  { id:26, category:'觸發程式', name:'出貨單資訊回中台',                                    enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'30',  url:'', mailTypes:'', mailTypesArr:[], updatedAt:'2025/10/10 08:00' },
  { id:27, category:'觸發程式', name:'庫存同步作業',                                        enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'60',  url:'', mailTypes:'', mailTypesArr:[], updatedAt:'2025/10/10 08:00' },
  { id:28, category:'觸發程式', name:'訂單狀態更新',                                        enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'15',  url:'', mailTypes:'', mailTypesArr:[], updatedAt:'2025/10/10 08:00' },
  { id:29, category:'觸發程式', name:'SAP資料同步',                                         enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'30',  url:'', mailTypes:'', mailTypesArr:[], updatedAt:'2025/10/10 08:00' },
  { id:30, category:'觸發程式', name:'郵件佇列清理',                                        enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'240', url:'', mailTypes:'', mailTypesArr:[], updatedAt:'2025/10/10 08:00' },
  { id:31, category:'觸發程式', name:'收貨資料回傳',                                        enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'60',  url:'', mailTypes:'', mailTypesArr:[], updatedAt:'2025/10/10 08:00' },
  { id:32, category:'觸發程式', name:'價格異動偵測',                                        enabled:true,  scheduleType:'weekday', days:'每天',                  startTime:'08:00', intervalMinutes:'30',  url:'', mailTypes:'', mailTypesArr:[], updatedAt:'2025/10/10 08:00' },
  { id:33, category:'觸發程式', name:'初次危害物質報告繳交通知',                              enabled:true,  scheduleType:'date',    days:'7月31號',              startTime:'08:00', intervalMinutes:'once', url:'/api/quality/hazard/annual-init', mailTypes:'', mailTypesArr:[], updatedAt:'2026/07/17 08:00' },
  // ── 廠商評價 ──
  { id:34, category:'觸發程式', name:'廠商評價計算（交貨準時率、答交準時率、廠商評價表）', enabled:true,  scheduleType:'date',    days:'每月5號',              startTime:'08:00', intervalMinutes:'once', url:'/api/vendor-evaluation/calculate', mailTypes:'', mailTypesArr:[], updatedAt:'2025/10/10 08:00' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build display strings from form
// ─────────────────────────────────────────────────────────────────────────────
function buildDays(form: ScheduleForm): string {
  if (form.scheduleType === 'weekday') {
    if (form.weekdays.length === WEEKDAYS.length) return '每天';
    return form.weekdays.join('、');
  }
  return form.dateDays.join('、');
}
// 將分鐘數轉為友善顯示文字
function formatInterval(minutes: string): string {
  if (minutes === 'once') return '僅此一次';
  const m = parseInt(minutes);
  if (isNaN(m)) return minutes;
  if (m < 60) return `${m} 分`;
  const h = m / 60;
  return h % 1 === 0 ? `${h} 小時` : `${h} 小時`;
}
// 從 ScheduleRow 組出執行頻率摘要（列表欄位顯示用）
function buildRowSummary(row: ScheduleRow): string {
  const segs: string[] = [row.days];
  if (row.startTime) segs.push(row.startTime);
  if (row.intervalMinutes) segs.push('每 ' + formatInterval(row.intervalMinutes) + ' 執行一次');
  return segs.filter(Boolean).join('\u3000');
}

// ─────────────────────────────────────────────────────────────────────────────
// FloatingInput — Overlay 表單內文字輸入
// ─────────────────────────────────────────────────────────────────────────────
function FloatingInput({
  label, value, onChange, multiline = false, showError,
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; showError?: string;
}) {
  const borderColor = showError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor  = showError ? '#ff5630' : '#637381';
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor }} />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[14px] relative shrink-0 text-[12px]" style={{ color: labelColor }}>{label}</p>
      </div>
      {multiline ? (
        <textarea
          className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px] custom-scrollbar"
          style={{ resize: 'vertical', minHeight: '54px' }}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          className="w-full rounded-[8px] px-[14px] h-[54px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
      {showError && <p className="mt-[4px] text-[12px] text-[#ff5630]">{showError}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MultiChipSelect — 月份 / 連動信件類別 multi-select
// ─────────────────────────────────────────────────────────────────────────────
function MultiChipSelect({
  label, options, value, onChange, placeholder = '請選擇', bgColor = 'white', error = false,
}: {
  label?: string; options: string[]; value: string[];
  onChange: (v: string[]) => void; placeholder?: string; bgColor?: string; error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const openDropdown = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(o => !o);
  };

  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  const remove = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== opt));
  };

  return (
    <div className="relative" ref={ref}>
      {label && (
        <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10 pointer-events-none">
          <div className="absolute h-[2px] left-0 right-0 top-[5px] bg-white" />
          <p className={`font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[14px] relative shrink-0 text-[12px] ${error ? 'text-[#ff5630]' : 'text-[#637381]'}`}>{label}</p>
        </div>
      )}
      <div
        ref={triggerRef}
        className={`relative min-h-[54px] rounded-[8px] border border-solid px-[12px] pt-[20px] pb-[8px] flex flex-wrap gap-[4px] cursor-pointer pr-[36px] bg-white ${error ? 'border-[#ff5630]' : 'border-[rgba(145,158,171,0.2)]'}`}
        onClick={openDropdown}
      >
        {value.length === 0 && (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab] leading-[22px]">
            {placeholder}
          </span>
        )}
        {value.map(v => (
          <span key={v} className="flex items-center gap-[4px] bg-[#e8f4fd] text-[#005eb8] text-[12px] font-medium px-[8px] py-[2px] rounded-full leading-[20px]">
            {v}
            <button
              type="button"
              onClick={e => remove(v, e)}
              className="text-[#637381] hover:text-[#1c252e] leading-none text-[14px] w-[14px] h-[14px] flex items-center justify-center"
            >×</button>
          </span>
        ))}
        <svg className={`absolute right-[10px] top-1/2 -translate-y-1/2 transition-transform ${open ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {open && (
        <div
          className="bg-white rounded-[8px] shadow-[0px_8px_24px_-4px_rgba(145,158,171,0.24),0px_0px_2px_0px_rgba(145,158,171,0.2)] border border-[rgba(145,158,171,0.12)] overflow-y-auto"
          style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999, maxHeight: 240 }}
        >
          {options.map(opt => (
            <div
              key={opt}
              className="flex items-center gap-[10px] px-[14px] py-[10px] cursor-pointer hover:bg-[rgba(145,158,171,0.08)]"
              onMouseDown={e => { e.preventDefault(); toggle(opt); }}
            >
              <div
                className="w-[16px] h-[16px] rounded-[4px] border border-solid flex items-center justify-center shrink-0 transition-colors"
                style={{
                  backgroundColor: value.includes(opt) ? '#1890ff' : 'white',
                  borderColor: value.includes(opt) ? '#1890ff' : 'rgba(145,158,171,0.4)',
                }}
              >
                {value.includes(opt) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MonthGrid — 月份方格選擇
// ─────────────────────────────────────────────────────────────────────────────
function MonthGrid({ label, value, onChange, bgColor = '#EFF6FF' }: {
  label?: string; value: string[]; onChange: (v: string[]) => void; bgColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  const toggle = (m: string) => onChange(value.includes(m) ? value.filter(v => v !== m) : [...value, m]);
  const remove = (m: string, e: React.MouseEvent) => { e.stopPropagation(); onChange(value.filter(v => v !== m)); };

  return (
    <div className="relative" ref={ref}>
      {label && (
        <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10 pointer-events-none">
          <div className="absolute h-[2px] left-0 right-0 top-[5px]" style={{ backgroundColor: bgColor }} />
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[14px] relative shrink-0 text-[#637381] text-[12px]">{label}</p>
        </div>
      )}
      <div
        className="relative min-h-[54px] rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)] bg-white px-[12px] pt-[20px] pb-[8px] flex flex-wrap gap-[4px] cursor-pointer pr-[36px]"
        onClick={() => setOpen(o => !o)}
      >
        {value.length === 0 && (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab] leading-[22px]">選擇月份（留空=每月）</span>
        )}
        {value.map(m => (
          <span key={m} className="flex items-center gap-[4px] bg-[#dbeafe] text-[#1d4ed8] text-[12px] font-medium px-[8px] py-[2px] rounded-full leading-[20px]">
            {m}
            <button type="button" onClick={e => remove(m, e)} className="text-[#637381] hover:text-[#1c252e] leading-none">×</button>
          </span>
        ))}
        <svg className={`absolute right-[10px] top-1/2 -translate-y-1/2 transition-transform ${open ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white rounded-[8px] shadow-[0px_8px_24px_-4px_rgba(145,158,171,0.24),0px_0px_2px_0px_rgba(145,158,171,0.2)] border border-[rgba(145,158,171,0.12)] z-50 p-[8px]">
          <div className="grid grid-cols-4 gap-[4px]">
            {MONTHS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => toggle(m)}
                className={`h-[32px] rounded-[6px] text-[13px] font-medium transition-colors ${value.includes(m) ? 'bg-[#1890ff] text-white' : 'text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)]'}`}
              >{m}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox — schedule block 內使用
// ─────────────────────────────────────────────────────────────────────────────
function SchedCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <div
      className="flex items-center gap-[6px] cursor-pointer select-none py-[4px] pr-[4px]"
      onClick={() => onChange()}
    >
      <CheckboxIcon checked={checked} />
      <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] leading-[22px]">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DateDayInput — 日期模式數字輸入 + Tag 顯示
// ─────────────────────────────────────────────────────────────────────────────
function DateDayInput({
  value, onChange, maxDay, bgColor = '#EFF6FF',
}: {
  value: string[]; onChange: (v: string[]) => void; maxDay: number; bgColor?: string;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const raw = input.trim();
    if (!raw) return;
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 1 || n > maxDay) {
      setError(`請輸入 1 – ${maxDay} 的日期`);
      return;
    }
    const str = String(n);
    if (value.includes(str)) { setError('此日期已新增'); return; }
    onChange([...value, str].sort((a, b) => parseInt(a) - parseInt(b)));
    setInput('');
    setError('');
    inputRef.current?.focus();
  };

  const remove = (d: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== d));
  };

  return (
    <div className="flex flex-col gap-[4px]">
      <div
        className="relative min-h-[54px] rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)] px-[12px] pt-[20px] pb-[8px] flex flex-wrap gap-[4px] items-center cursor-text bg-white"
        onClick={() => inputRef.current?.focus()}
      >
        {/* floating label */}
        <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10 pointer-events-none">
          <div className="absolute h-[2px] left-0 right-0 top-[5px] bg-white" />
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[14px] relative shrink-0 text-[#637381] text-[12px]">指定日期</p>
        </div>

        {/* 已選 tags */}
        {value.map(d => (
          <span key={d} className="flex items-center gap-[4px] bg-[#e8f4fd] text-[#005eb8] text-[12px] font-medium px-[8px] py-[2px] rounded-full leading-[20px]">
            {d}號
            <button type="button" onClick={e => remove(d, e)}
              className="text-[#637381] hover:text-[#1c252e] leading-none text-[14px] w-[14px] h-[14px] flex items-center justify-center">
              ×
            </button>
          </span>
        ))}

        {/* 輸入框 */}
        <div className="flex items-center gap-[6px]">
          <input
            ref={inputRef}
            type="number"
            min="1"
            max={maxDay}
            className="outline-none bg-transparent text-[14px] text-[#1c252e] w-[52px] leading-[22px]"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder="幾號"
          />
          <button
            type="button"
            onClick={add}
            className="w-[24px] h-[24px] rounded-full bg-[#1890ff] text-white flex items-center justify-center hover:bg-[#096dd9] transition-colors shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      {/* 錯誤 / 提示 */}
      {error
        ? <p className="text-[12px] text-[#ff5630] pl-[2px]">{error}</p>
        : maxDay < 31 && <p className="text-[12px] text-[#637381] pl-[2px]">依選擇月份，日期上限為 {maxDay} 號</p>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ScheduleModal — 新增 / 編輯排程設定
// ─────────────────────────────────────────────────────────────────────────────
function ScheduleModal({
  mode, initialData, onSave, onClose,
}: {
  mode: 'add' | 'edit';
  initialData: ScheduleForm;
  onSave: (form: ScheduleForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ScheduleForm>(initialData);
  const [errors, setErrors] = useState<{ name?: string; url?: string; mailTypes?: string }>({});

  const upd = <K extends keyof ScheduleForm>(k: K, v: ScheduleForm[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = '必填欄位';
    if (!form.url.trim())  e.url  = '必填欄位';
    if (form.category === '信件通知' && form.mailTypes.length === 0) e.mailTypes = '必填欄位';
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  const toggleWeekday = (d: string) =>
    upd('weekdays', form.weekdays.includes(d) ? form.weekdays.filter(w => w !== d) : [...form.weekdays, d]);
  const toggleDateDay = (d: string) =>
    upd('dateDays', form.dateDays.includes(d) ? form.dateDays.filter(w => w !== d) : [...form.dateDays, d]);

  // 日期上限
  const maxDay = useMemo(() => {
    if (form.months.length === 0) return 31;
    return Math.min(...form.months.map(m => MONTH_MAX_DAYS[m] ?? 31));
  }, [form.months]);

  // 月份變更時，自動移除超出上限的日期
  useEffect(() => {
    if (form.scheduleType === 'date') {
      const filtered = form.dateDays.filter(d => parseInt(d) <= maxDay);
      if (filtered.length !== form.dateDays.length) upd('dateDays', filtered);
    }
  }, [maxDay, form.scheduleType]); // eslint-disable-line react-hooks/exhaustive-deps

  // 即時排程摘要文字
  const scheduleSummary = useMemo(() => {
    const segs: string[] = [];

    // 月份
    if (form.months.length > 0) segs.push('月份 ' + form.months.join('、'));

    // 星期 / 日期
    if (form.scheduleType === 'weekday') {
      const allDays = form.weekdays.length === WEEKDAYS.length;
      if (allDays) {
        segs.push('每天');
      } else if (form.weekdays.length > 0) {
        segs.push('週' + form.weekdays.join('、'));
      }
    } else {
      if (form.dateDays.length > 0) segs.push('每月 ' + form.dateDays.join('、') + '號');
    }

    // 時間
    if (form.startTime) {
      const lastIdx = segs.length - 1;
      if (lastIdx >= 0) {
        segs[lastIdx] = segs[lastIdx] + '的 ' + form.startTime;
      } else {
        segs.push(form.startTime);
      }
    }
    if (form.intervalMinutes) segs.push('每 ' + formatInterval(form.intervalMinutes) + ' 執行一次');

    return segs.join('　');
  }, [form.months, form.scheduleType, form.weekdays, form.dateDays,
      form.startTime, form.intervalMinutes]);

  return (
    <BaseOverlay onClose={onClose} maxWidth="760px" autoHeight>
      <div className="relative w-full flex flex-col">
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="#637381" fillRule="evenodd" />
          </svg>
        </button>

        {/* 內容 */}
        <div className="flex flex-col px-[32px] pt-[56px] pb-[32px] gap-[20px]">
          {/* 標題 + 排程類型 TAG */}
          <div className="flex items-center gap-[10px]">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
              {mode === 'add' ? '新增排程設定' : '編輯排程設定'}
            </p>
            {/* 排程類型 TAG */}
            <div
              className="relative flex items-center justify-center px-[10px] h-[24px] rounded-[6px] shrink-0"
              style={{
                backgroundColor: form.category === '信件通知' ? '#e8f4ff' : '#f4f6f8',
                border: `1px solid ${form.category === '信件通知' ? '#91c8f6' : '#c4cdd5'}`,
              }}
            >
              <p
                className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[12px] leading-none whitespace-nowrap"
                style={{ color: form.category === '信件通知' ? '#0065b3' : '#454f5b' }}
              >
                {form.category}
              </p>
            </div>
          </div>

          {/* 左右並排區域 */}
          <div className="flex gap-[20px] items-start">

            {/* Left: 基本欄位 */}
            <div className="flex flex-col gap-[16px] flex-1 min-w-0">
              <FloatingInput label="*排程名稱" value={form.name} onChange={v => { upd('name', v); setErrors(e => ({ ...e, name: undefined })); }} showError={errors.name} />
              <FloatingInput label="*URL" value={form.url} onChange={v => { upd('url', v); setErrors(e => ({ ...e, url: undefined })); }} multiline showError={errors.url} />
              {/* 信件類別：僅「信件通知」顯示 */}
              {form.category === '信件通知' && (
                <MultiChipSelect
                  label="*信件類別"
                  options={MAIL_TYPE_OPTIONS}
                  value={form.mailTypes}
                  onChange={v => { upd('mailTypes', v); setErrors(e => ({ ...e, mailTypes: undefined })); }}
                  placeholder="請選擇信件類別"
                  error={!!errors.mailTypes}
                />
              )}
            </div>

            {/* Right: 執行頻率 */}
            <div className="w-[400px] shrink-0 flex flex-col gap-[8px]">

          {/* 執行頻率區塊 */}
          <div className="rounded-[12px] overflow-hidden" style={{ border: '1px solid #bfdbfe' }}>
            {/* 區塊標題列 */}
            <div className="flex items-center gap-[8px] px-[16px] py-[10px]" style={{ backgroundColor: '#dbeafe' }}>
              {/* 時鐘 icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] leading-[22px]" style={{ color: '#1d4ed8' }}>執行頻率</p>
            </div>

            {/* 內容 */}
            <div className="p-[16px] flex flex-col gap-[14px]" style={{ backgroundColor: '#EFF6FF' }}>

            {/* 指定月份 */}
            <MonthGrid label="指定月份" value={form.months} onChange={v => upd('months', v)} bgColor="#EFF6FF" />

            <div className="h-[1px] bg-[rgba(145,158,171,0.16)]" />

            {/* 星期 / 日期 */}
            <div className="flex flex-col gap-[8px]">
              {/* Row 1: 排程類型 dropdown */}
              <DropdownSelect
                label="*排程類型"
                value={form.scheduleType}
                onChange={v => upd('scheduleType', v as 'weekday' | 'date')}
                options={[{ value: 'weekday', label: '星期' }, { value: 'date', label: '指定日期' }]}
              />

              {/* Row 2: 每天（星期模式） */}
              {form.scheduleType === 'weekday' && (
                <SchedCheckbox
                  checked={form.weekdays.length === WEEKDAYS.length}
                  onChange={() => {
                    if (form.weekdays.length === WEEKDAYS.length) {
                      upd('weekdays', []);
                    } else {
                      upd('weekdays', [...WEEKDAYS]);
                    }
                  }}
                  label="每天"
                />
              )}

              {/* Row 3: 星期 checkboxes */}
              {form.scheduleType === 'weekday' && (
                <div className="flex flex-nowrap gap-[8px]">
                  {WEEKDAYS.map(d => (
                    <SchedCheckbox key={d} checked={form.weekdays.includes(d)} onChange={() => toggleWeekday(d)} label={d} />
                  ))}
                </div>
              )}

              {/* 日期模式：數字輸入 */}
              {form.scheduleType === 'date' && (
                <DateDayInput
                  value={form.dateDays}
                  onChange={v => upd('dateDays', v)}
                  maxDay={maxDay}
                  bgColor="#EFF6FF"
                />
              )}
            </div>

            <div className="h-[1px] bg-[rgba(145,158,171,0.16)]" />

            {/* 時間設定：幾點開始 + 幾分一次 */}
            <div className="flex gap-[10px]">
              <div className="flex-1">
                <DropdownSelect
                  label="幾點開始"
                  value={form.startTime}
                  onChange={v => upd('startTime', v as string)}
                  options={TIME_OPTIONS.map(o => ({ value: o, label: o }))}
                  zIndex={120}
                />
              </div>
              <div className="flex-1">
                <DropdownSelect
                  label="多久執行一次"
                  value={form.intervalMinutes}
                  onChange={v => upd('intervalMinutes', v as string)}
                  options={INTERVAL_MIN_OPTIONS}
                />
              </div>
            </div>

            </div>{/* end 內容 div */}
          </div>{/* end 執行頻率 card */}

              {/* 即時摘要文字 */}
              {scheduleSummary && (
                <div className="flex items-center gap-[6px] pt-[4px]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] leading-[22px] text-[#1c252e]">
                    {scheduleSummary}
                  </p>
                </div>
              )}
            </div>{/* end right column */}
          </div>{/* end 左右並排 */}

          {/* 底部按鈕 */}
          <div className="flex gap-[12px]">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
              style={{ backgroundColor: '#00559c' }}
            >
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">儲存</p>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.32)] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ScheduleSettingsPage — Main
// ─────────────────────────────────────────────────────────────────────────────
export function ScheduleSettingsPage() {
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── 資料 ──────────────────────────────────────────────────────────────────
  const [data, setData] = useState<ScheduleRow[]>(INITIAL_DATA);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; row?: ScheduleRow } | null>(null);

  // ── 搜尋 / TAB ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState<'觸發程式' | '信件通知'>('觸發程式');
  const [searchName, setSearchName] = useState('');
  const [filterEnabled, setFilterEnabled] = useState('');

  // ── 欄位狀態 ──────────────────────────────────────────────────────────────
  const loadCols = (): SchedCol[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SchedCol[];
        const savedMap = new Map(parsed.map(c => [c.key, c]));
        return DEFAULT_COLS.map(src => {
          const s = savedMap.get(src.key);
          return s ? { ...src, visible: s.visible, width: Math.max(s.width ?? src.width, src.minWidth) } : { ...src };
        });
      }
    } catch { /* ignore */ }
    return DEFAULT_COLS.map(c => ({ ...c }));
  };

  const [columns, setColumns]         = useState<SchedCol[]>(() => loadCols());
  const [tempColumns, setTempColumns] = useState<SchedCol[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog]     = useState(false);
  const [filters, setFilters]                       = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters]         = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; dir: 'asc' | 'desc' | null }>({ key: null, dir: null });
  const [page, setPage]   = useState(1);
  const [perPage, setPerPage] = useState(100);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(columns)); } catch { /* ignore */ }
  }, [columns]);

  // ── 欄位操作 ──────────────────────────────────────────────────────────────
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

  const autoFitWidth = (key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 32 + 16;
    let maxDataW = 0;
    data.forEach(row => {
      const val = String((row as Record<string, unknown>)[key] ?? '');
      const w = measureTextWidth(val, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
      if (w > maxDataW) maxDataW = w;
    });
    const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  };

  const handleSort = (key: string) =>
    setSortConfig(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  const visibleColumns = columns.filter(c =>
    c.visible !== false &&
    !(activeTab === '觸發程式' && c.key === 'mailTypes')
  );
  const totalWidth = visibleColumns.reduce((s, c) => s + c.width, 0);

  // ── 篩選 ──────────────────────────────────────────────────────────────────
  const baseFiltered = useMemo(() => data.filter(r => {
    if (r.category !== activeTab) return false;
    if (searchName && !r.name.includes(searchName)) return false;
    if (filterEnabled === 'true'  && !r.enabled) return false;
    if (filterEnabled === 'false' &&  r.enabled) return false;
    return true;
  }), [data, activeTab, searchName, filterEnabled]);

  const filteredData = useMemo(() => {
    if (appliedFilters.length === 0) return baseFiltered;
    return baseFiltered.filter(row =>
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
          case 'isEmpty':    return !rawVal.trim();
          case 'isNotEmpty': return rawVal.trim() !== '';
          default:           return true;
        }
      })
    );
  }, [baseFiltered, appliedFilters]);

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

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, page, perPage]);

  // ── Toggle 啟用 ───────────────────────────────────────────────────────────
  const handleToggle = useCallback((id: number) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  // ── Modal ─────────────────────────────────────────────────────────────────
  const openAdd  = () => setModal({ mode: 'add', row: { id: 0, category: activeTab, name: '', enabled: true, scheduleType: 'weekday', days: '', startTime: '08:00', intervalMinutes: '60', url: '', mailTypes: '', mailTypesArr: [], updatedAt: '' } as ScheduleRow });
  const openEdit = useCallback((row: ScheduleRow) => setModal({ mode: 'edit', row }), []);

  const rowToForm = (row: ScheduleRow): ScheduleForm => {
    return {
      name: row.name, url: row.url, category: row.category, months: [],
      scheduleType: row.scheduleType,
      weekdays: row.scheduleType === 'weekday' && row.days && row.days !== '每天'
        ? row.days.split('、') : ['一','二','三','四','五','六','日'],
      dateDays: row.scheduleType === 'date' && row.days
        ? row.days.split('、').map(d => d.replace('號','')) : [],
      startTime: row.startTime || '08:00',
      intervalMinutes: row.intervalMinutes || '60',
      mailTypes: [...row.mailTypesArr],
    };
  };

  const handleSave = (form: ScheduleForm) => {
    const days = buildDays(form);
    const now  = new Date().toLocaleDateString('zh-TW', { year:'numeric', month:'2-digit', day:'2-digit' })
              + ' ' + new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit' });

    if (modal?.mode === 'add') {
      const newRow: ScheduleRow = {
        id: Date.now(),
        category: form.category, name: form.name, enabled: true,
        scheduleType: form.scheduleType, days,
        startTime: form.startTime, intervalMinutes: form.intervalMinutes,
        url: form.url,
        mailTypes: form.mailTypes.join('、'), mailTypesArr: form.mailTypes,
        updatedAt: now,
      };
      setData(prev => [newRow, ...prev]);
    } else if (modal?.mode === 'edit' && modal.row) {
      setData(prev => prev.map(r => r.id !== modal.row!.id ? r : {
        ...r,
        category: form.category, name: form.name,
        scheduleType: form.scheduleType, days,
        startTime: form.startTime, intervalMinutes: form.intervalMinutes,
        url: form.url,
        mailTypes: form.mailTypes.join('、'), mailTypesArr: form.mailTypes,
        updatedAt: now,
      }));
    }
    setModal(null);
  };

  // ── 渲染 Cell ─────────────────────────────────────────────────────────────
  const renderCell = (col: SchedCol, row: ScheduleRow): ReactNode => {
    switch (col.key) {
      case 'frequency':
        return (
          <p title={buildRowSummary(row)} className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate text-[#1c252e]">
            {buildRowSummary(row)}
          </p>
        );
      case 'name':
        return (
          <button
            onClick={() => openEdit(row)}
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors truncate text-left w-full"
          >
            {row.name}
          </button>
        );
      case 'enabled':
        return (
          <div onClick={e => e.stopPropagation()}>
            <ToggleSwitch checked={row.enabled} onChange={() => handleToggle(row.id)} />
          </div>
        );
      case 'url':
        return (
          <p title={row.url} className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate text-[#1c252e]">
            {row.url || '—'}
          </p>
        );
      default: {
        const val = String((row as Record<string, unknown>)[col.key] ?? '');
        return (
          <p title={val} className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate ${val ? 'text-[#1c252e]' : 'text-[#919eab]'}`}>
            {val || '—'}
          </p>
        );
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── TAB 列 ── */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        {(['觸發程式', '信件通知'] as const).map(tab => (
          <div
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
          >
            {/* Active 底線：absolute border-b-2 蓋滿整個 tab 高度 */}
            {activeTab === tab && (
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            )}
            <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
              activeTab === tab ? 'text-[#1c252e]' : 'text-[#637381]'
            }`}>
              {tab}
            </p>
          </div>
        ))}
        {/* 底部統一灰色底線（所有 TAB 共用，absolute） */}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ── A. 搜尋列 ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <div className="flex-1 min-w-0">
          <SearchField
            label="排程名稱"
            value={searchName}
            onChange={v => { setSearchName(v); setPage(1); }}
            type="search"
          />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="是否啟用"
            value={filterEnabled}
            onChange={v => { setFilterEnabled(v as string); setPage(1); }}
            options={[{ value: '', label: '全部' }, { value: 'true', label: '啟用' }, { value: 'false', label: '停用' }]}
          />
        </div>
      </div>

      {/* ── B. TableToolbar ── */}
      <TableToolbar
        resultsCount={filteredData.length}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={() => {
          setTempColumns(JSON.parse(JSON.stringify(columns)));
          if (showFilterDialog) setShowFilterDialog(false);
          setShowColumnSelector(v => !v);
        }}
        onFiltersClick={() => {
          if (showColumnSelector) setShowColumnSelector(false);
          setShowFilterDialog(v => !v);
        }}
        onExportCsv={() => {
          const header = visibleColumns.map(c => c.label).join(',');
          const rows   = sortedData.map(r => visibleColumns.map(c => `"${String((r as Record<string, unknown>)[c.key] ?? '')}"`).join(','));
          const csv = [header, ...rows].join('\n');
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
          a.download = '排程設定.csv';
          a.click();
        }}
        columnsButton={
          <ColumnSelector
            columns={tempColumns as Parameters<typeof ColumnSelector>[0]['columns']}
            onToggleColumn={key => setTempColumns(tempColumns.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c))}
            onToggleAll={all => setTempColumns(tempColumns.map(c => ({ ...c, visible: all })))}
            onClose={() => setShowColumnSelector(false)}
            onApply={() => {
              setColumns(tempColumns);
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tempColumns)); } catch { /* ignore */ }
              setShowColumnSelector(false);
            }}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={DEFAULT_COLS.map(c => ({ key: c.key, label: c.label }))}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={vf => { setAppliedFilters(vf); setShowFilterDialog(false); setPage(1); }}
          />
        }
        actionButton={
          <button
            onClick={openAdd}
            className="flex items-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors"
          >
            新增
          </button>
        }
      />

      {/* ── C. 表格（DnD + 欄寬 + 橫向拖拉）── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>

            {/* 表頭 */}
            <div className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  moveColumn={moveCol}
                  updateColumnWidth={updateWidth}
                  autoFitWidth={autoFitWidth}
                  sortConfig={{ key: sortConfig.key, direction: sortConfig.dir }}
                  onSort={handleSort}
                  isLast={idx === visibleColumns.length - 1}
                  isFiltered={!!appliedFilters?.some(f => f.column === col.key)}
                  dragType="sched-settings-col"
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {paginatedData.map(row => (
              <div
                key={row.id}
                className="flex border-b border-[rgba(145,158,171,0.08)] group hover:bg-[rgba(145,158,171,0.04)] transition-colors"
                style={{ minHeight: 64 }}
              >
                {visibleColumns.map((col, ci) => {
                  const isLast = ci === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${col.key}`}
                      style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width, minWidth: col.minWidth }}
                      className={`flex items-center px-[16px] overflow-hidden ${isLast ? '' : 'shrink-0 border-r border-[rgba(145,158,171,0.08)]'}`}
                    >
                      {renderCell(col, row)}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 空狀態 */}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab] text-[14px]">無符合條件的排程資料</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── D. 分頁 ── */}
      <div className="shrink-0 flex items-center bg-white border-t border-[rgba(145,158,171,0.08)]">
        <PaginationControls
          currentPage={page}
          totalItems={sortedData.length}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={n => { setPerPage(n); setPage(1); }}
        />
      </div>

      {/* ── Modal ── */}
      {modal && (
        <ScheduleModal
          mode={modal.mode}
          initialData={modal.row ? rowToForm(modal.row) : { ...INITIAL_FORM }}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
