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
type SchedColKey = 'category' | 'name' | 'enabled' | 'days' | 'times' | 'url' | 'mailTypes' | 'updatedAt';

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
  days: string;          // 顯示用：每天 / 一、二、... / 10號、20號
  times: string;         // 顯示用：16:00、20:00 / 30 min
  timesArr: string[];    // 實際時間陣列（form 使用）
  url: string;
  mailTypes: string;     // 顯示用：訂單通知信
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
const STORAGE_KEY = 'schedule-settings-v1-cols';

const DEFAULT_COLS: SchedCol[] = [
  { key: 'category',   label: '分類',        width: 100, minWidth: 80  },
  { key: 'name',       label: '排程名稱',    width: 200, minWidth: 140 },
  { key: 'enabled',    label: '啟用',        width: 88,  minWidth: 72  },
  { key: 'days',       label: '星期/日期',   width: 170, minWidth: 120 },
  { key: 'times',      label: '時段/時間',   width: 140, minWidth: 100 },
  { key: 'url',        label: 'URL',         width: 230, minWidth: 130 },
  { key: 'mailTypes',  label: '連動信件類別', width: 140, minWidth: 110 },
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
const MAIL_TYPE_OPTIONS = ['訂單通知信','修正單通知信','出貨通知信','帳款通知信'];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});
const INTERVAL_MIN_OPTIONS = [
  { value: '10',  label: '10 分' },
  { value: '15',  label: '15 分' },
  { value: '30',  label: '30 分' },
  { value: '60',  label: '60 分' },
  { value: '90',  label: '90 分' },
  { value: '120', label: '120 分' },
  { value: '180', label: '180 分' },
  { value: '240', label: '240 分' },
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
  { id:1,  category:'信件通知', name:'Creat PO 錯誤',         enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', times:'120 min',      timesArr:['120 min'],       url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22abc%22%7D', mailTypes:'',            mailTypesArr:[],              updatedAt:'2025/10/10 08:00' },
  { id:2,  category:'觸發程式', name:'出貨單資訊回中台',       enabled:true,  scheduleType:'weekday', days:'每天',                  times:'30 min',       timesArr:['30 min'],        url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22def%22%7D', mailTypes:'',            mailTypesArr:[],              updatedAt:'2025/10/10 08:00' },
  { id:3,  category:'信件通知', name:'SA訂單資訊無到EP通知',   enabled:true,  scheduleType:'weekday', days:'每天',                  times:'16:00、20:00',  timesArr:['16:00','20:00'], url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22oArW%22%7D', mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:4,  category:'信件通知', name:'訂單不同意通知',         enabled:true,  scheduleType:'date',    days:'10號、20號、30號',      times:'00:00',        timesArr:['00:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22ghi%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:5,  category:'信件通知', name:'修正單通知',             enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', times:'00:00',        timesArr:['00:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22jkl%22%7D',  mailTypes:'修正單通知信', mailTypesArr:['修正單通知信'],updatedAt:'2025/10/10 08:00' },
  { id:6,  category:'信件通知', name:'修正單不同意通知',       enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', times:'16:00、20:00',  timesArr:['16:00','20:00'], url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22mno%22%7D',  mailTypes:'修正單通知信', mailTypesArr:['修正單通知信'],updatedAt:'2025/10/10 08:00' },
  { id:7,  category:'信件通知', name:'廠商交期提醒',           enabled:false, scheduleType:'weekday', days:'一、二、三、四、五',     times:'09:00',        timesArr:['09:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22pqr%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:8,  category:'觸發程式', name:'庫存同步作業',           enabled:true,  scheduleType:'weekday', days:'每天',                  times:'60 min',       timesArr:['60 min'],        url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22stu%22%7D',  mailTypes:'',            mailTypesArr:[],              updatedAt:'2025/10/10 08:00' },
  { id:9,  category:'信件通知', name:'訂單逾期通知',           enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五',     times:'08:00',        timesArr:['08:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22vwx%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:10, category:'信件通知', name:'出貨單發送通知',         enabled:true,  scheduleType:'weekday', days:'每天',                  times:'10:00、14:00',  timesArr:['10:00','14:00'], url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22yza%22%7D',  mailTypes:'出貨通知信',   mailTypesArr:['出貨通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:11, category:'觸發程式', name:'訂單狀態更新',           enabled:true,  scheduleType:'weekday', days:'每天',                  times:'15 min',       timesArr:['15 min'],        url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22bcd%22%7D',  mailTypes:'',            mailTypesArr:[],              updatedAt:'2025/10/10 08:00' },
  { id:12, category:'信件通知', name:'帳款逾期提醒',           enabled:false, scheduleType:'date',    days:'5號、20號',             times:'09:00',        timesArr:['09:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22efg%22%7D',  mailTypes:'帳款通知信',   mailTypesArr:['帳款通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:13, category:'信件通知', name:'新訂單確認通知',         enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五',     times:'08:30',        timesArr:['08:30'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22hij%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:14, category:'觸發程式', name:'SAP資料同步',            enabled:true,  scheduleType:'weekday', days:'每天',                  times:'30 min',       timesArr:['30 min'],        url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22klm%22%7D',  mailTypes:'',            mailTypesArr:[],              updatedAt:'2025/10/10 08:00' },
  { id:15, category:'信件通知', name:'廠商評分發送',           enabled:true,  scheduleType:'date',    days:'1號',                   times:'09:00',        timesArr:['09:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22nop%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:16, category:'信件通知', name:'延誤預警通知',           enabled:true,  scheduleType:'weekday', days:'一、三、五',            times:'14:00',        timesArr:['14:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22qrs%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:17, category:'觸發程式', name:'郵件佇列清理',           enabled:true,  scheduleType:'weekday', days:'每天',                  times:'240 min',      timesArr:['240 min'],       url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22tuv%22%7D',  mailTypes:'',            mailTypesArr:[],              updatedAt:'2025/10/10 08:00' },
  { id:18, category:'信件通知', name:'催貨通知',               enabled:false, scheduleType:'weekday', days:'一、二、三、四、五',     times:'11:00',        timesArr:['11:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22wxy%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:19, category:'信件通知', name:'訂單取消確認',           enabled:true,  scheduleType:'weekday', days:'每天',                  times:'16:00',        timesArr:['16:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22zab%22%7D',  mailTypes:'修正單通知信', mailTypesArr:['修正單通知信'],updatedAt:'2025/10/10 08:00' },
  { id:20, category:'觸發程式', name:'收貨資料回傳',           enabled:true,  scheduleType:'weekday', days:'每天',                  times:'60 min',       timesArr:['60 min'],        url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22cde%22%7D',  mailTypes:'',            mailTypesArr:[],              updatedAt:'2025/10/10 08:00' },
  { id:21, category:'信件通知', name:'異常訂單警示',           enabled:true,  scheduleType:'weekday', days:'一、二、三、四、五、六', times:'08:00、17:00',  timesArr:['08:00','17:00'], url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22fgh%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:22, category:'信件通知', name:'廠商聯絡資訊更新提醒',  enabled:false, scheduleType:'date',    days:'15號',                  times:'09:00',        timesArr:['09:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22ijk%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:23, category:'觸發程式', name:'價格異動偵測',           enabled:true,  scheduleType:'weekday', days:'每天',                  times:'30 min',       timesArr:['30 min'],        url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22lmn%22%7D',  mailTypes:'',            mailTypesArr:[],              updatedAt:'2025/10/10 08:00' },
  { id:24, category:'信件通知', name:'月結報表發送',           enabled:true,  scheduleType:'date',    days:'1號',                   times:'08:00',        timesArr:['08:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22opq%22%7D',  mailTypes:'帳款通知信',   mailTypesArr:['帳款通知信'],  updatedAt:'2025/10/10 08:00' },
  { id:25, category:'信件通知', name:'年度廠商評鑑通知',       enabled:false, scheduleType:'date',    days:'1號',                   times:'09:00',        timesArr:['09:00'],         url:'Lflowchat.drawio.html#%7B%22pageId%22%3A%22rst%22%7D',  mailTypes:'訂單通知信',   mailTypesArr:['訂單通知信'],  updatedAt:'2025/10/10 08:00' },
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
function buildTimes(form: ScheduleForm): string {
  const parts: string[] = [];
  if (form.startTime) parts.push(form.startTime);
  if (form.intervalMinutes) parts.push('每' + form.intervalMinutes + '分執行一次');
  return parts.join('，') || '-';
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
  label, options, value, onChange, placeholder = '請選擇', bgColor = 'white',
}: {
  label?: string; options: string[]; value: string[];
  onChange: (v: string[]) => void; placeholder?: string; bgColor?: string;
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
          <div className="absolute h-[2px] left-0 right-0 top-[5px]" style={{ backgroundColor: bgColor }} />
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[14px] relative shrink-0 text-[#637381] text-[12px]">{label}</p>
        </div>
      )}
      <div
        className="relative min-h-[54px] rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)] px-[12px] pt-[20px] pb-[8px] flex flex-wrap gap-[4px] cursor-pointer pr-[36px]"
        style={{ backgroundColor: bgColor }}
        onClick={() => setOpen(o => !o)}
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
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white rounded-[8px] shadow-[0px_8px_24px_-4px_rgba(145,158,171,0.24),0px_0px_2px_0px_rgba(145,158,171,0.2)] border border-[rgba(145,158,171,0.12)] z-50 overflow-hidden">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-[10px] px-[14px] py-[10px] cursor-pointer hover:bg-[rgba(145,158,171,0.08)]">
              <div
                className="w-[16px] h-[16px] rounded-[4px] border border-solid flex items-center justify-center shrink-0 transition-colors"
                style={{
                  backgroundColor: value.includes(opt) ? '#1890ff' : 'white',
                  borderColor: value.includes(opt) ? '#1890ff' : 'rgba(145,158,171,0.4)',
                }}
                onClick={() => toggle(opt)}
              >
                {value.includes(opt) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]" onClick={() => toggle(opt)}>{opt}</span>
            </label>
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
        className="relative min-h-[54px] rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)] px-[12px] pt-[20px] pb-[8px] flex flex-wrap gap-[4px] items-center cursor-text"
        style={{ backgroundColor: bgColor }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* floating label */}
        <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10 pointer-events-none">
          <div className="absolute h-[2px] left-0 right-0 top-[5px]" style={{ backgroundColor: bgColor }} />
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
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const upd = <K extends keyof ScheduleForm>(k: K, v: ScheduleForm[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = '必填欄位';
    if (!form.url.trim())  e.url  = '必填欄位';
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
    if (form.intervalMinutes) segs.push('每 ' + form.intervalMinutes + ' 分執行一次');

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
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            {mode === 'add' ? '新增排程設定' : '編輯排程設定'}
          </p>

          {/* 左右並排區域 */}
          <div className="flex gap-[20px] items-start">

            {/* Left: 基本欄位 */}
            <div className="flex flex-col gap-[16px] flex-1 min-w-0">
              <FloatingInput label="*排程名稱" value={form.name} onChange={v => { upd('name', v); setErrors(e => ({ ...e, name: undefined })); }} showError={errors.name} />
              <FloatingInput label="*URL" value={form.url} onChange={v => { upd('url', v); setErrors(e => ({ ...e, url: undefined })); }} multiline showError={errors.url} />
              <DropdownSelect
                label="*分類"
                value={form.category}
                onChange={v => upd('category', v as string)}
                options={CATEGORY_OPTIONS.map(c => ({ value: c, label: c }))}
              />
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
              {/* Row 1: 排程類型 dropdown（最適欄寬） */}
              <div className="w-fit">
                <DropdownSelect
                  widthFit
                  label="*排程類型"
                  value={form.scheduleType}
                  onChange={v => upd('scheduleType', v as 'weekday' | 'date')}
                  options={[{ value: 'weekday', label: '星期' }, { value: 'date', label: '指定日期' }]}
                  className="min-w-[140px]"
                />
              </div>

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
                  label="幾分執行一次"
                  value={form.intervalMinutes}
                  onChange={v => upd('intervalMinutes', v as string)}
                  options={INTERVAL_MIN_OPTIONS}
                />
              </div>
            </div>

            {/* 連動信件類別：僅「信件通知」分類顯示（含上方分隔線） */}
            {form.category === '信件通知' && (<>
              <div className="h-[1px] bg-[rgba(145,158,171,0.16)]" />
              <MultiChipSelect
                label="連動信件類別"
                options={MAIL_TYPE_OPTIONS}
                value={form.mailTypes}
                onChange={v => upd('mailTypes', v)}
                placeholder="請選擇連動信件類別"
                bgColor="#EFF6FF"
              />
            </>)}
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

  // ── 搜尋 ──────────────────────────────────────────────────────────────────
  const [searchName, setSearchName]     = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterEnabled, setFilterEnabled]   = useState('');

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

  const visibleColumns = columns.filter(c => c.visible !== false);
  const totalWidth = visibleColumns.reduce((s, c) => s + c.width, 0);

  // ── 篩選 ──────────────────────────────────────────────────────────────────
  const baseFiltered = useMemo(() => data.filter(r => {
    if (searchName && !r.name.includes(searchName) && !r.category.includes(searchName)) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterEnabled === 'true'  && !r.enabled) return false;
    if (filterEnabled === 'false' &&  r.enabled) return false;
    return true;
  }), [data, searchName, filterCategory, filterEnabled]);

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
  const openAdd  = () => setModal({ mode: 'add' });
  const openEdit = useCallback((row: ScheduleRow) => setModal({ mode: 'edit', row }), []);

  const rowToForm = (row: ScheduleRow): ScheduleForm => {
    return {
      name: row.name, url: row.url, category: row.category, months: [],
      scheduleType: row.scheduleType,
      weekdays: row.scheduleType === 'weekday' && row.days !== '每天'
        ? row.days.split('、') : ['一','二','三','四','五','六','日'],
      dateDays: row.scheduleType === 'date' ? row.days.split('、').map(d => d.replace('號','')) : [],
      startTime: row.timesArr.length > 0 && !row.timesArr[0].includes('min')
        ? row.timesArr[0] : '08:00',
      intervalMinutes: row.timesArr.length === 1 && row.timesArr[0].includes('min')
        ? row.timesArr[0].replace(' min', '') : '60',
      mailTypes: [...row.mailTypesArr],
    };
  };

  const handleSave = (form: ScheduleForm) => {
    const days  = buildDays(form);
    const timesArr = [form.startTime];
    const timesDisplay = buildTimes(form);
    const now = new Date().toLocaleDateString('zh-TW', { year:'numeric', month:'2-digit', day:'2-digit' })
              + ' ' + new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit' });

    if (modal?.mode === 'add') {
      const newRow: ScheduleRow = {
        id: Date.now(),
        category: form.category, name: form.name, enabled: true,
        scheduleType: form.scheduleType, days,
        times: timesDisplay, timesArr,
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
        times: timesDisplay, timesArr,
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
      case 'category':
        return (
          <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate text-[#1c252e]">
            {row.category}
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
          <p title={row.url} className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[12px] truncate text-[#637381]">
            {row.url}
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
            label="類別"
            value={filterCategory}
            onChange={v => { setFilterCategory(v as string); setPage(1); }}
            options={[{ value: '', label: '全部' }, ...CATEGORY_OPTIONS.map(c => ({ value: c, label: c }))]}
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
