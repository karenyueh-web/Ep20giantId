import { useState, useRef, useMemo } from 'react';
import { BaseOverlay } from './BaseOverlay';
import closeIconPaths from "@/imports/svg-gcyyqek0b9";
import { ResponsivePageLayout } from './ResponsivePageLayout';
import { DropdownSelect } from './DropdownSelect';
import { SimpleDatePicker } from './SimpleDatePicker';
import { OrderHistory } from './OrderHistory';
import { SAP_CURRENCIES } from '@/app/data/currencyData';
import type { PageType } from './MainLayout';
import type { UserRole } from '../App';
import type { InsuranceRecord, InsuranceStatus, HistoryEntry } from './insuranceData';
import { insuranceMockData } from './insuranceData';
import { MOCK_VENDORS } from './VendorManagementTable';

interface InsuranceDetailPageProps {
  record: InsuranceRecord;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: UserRole;
  onBack: () => void;
  onSave: (updated: InsuranceRecord) => void;
  onStatusChange: (id: number, status: InsuranceStatus) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
// 幣別使用系統共用 CurrencySelect 元件（CurrencySelect.tsx），不自訂選項清單
const CLAIM_BASIS_OPTIONS = [
  { value: 'A', label: 'A（索賠基礎制）' },
  { value: 'B', label: 'B（事故發生基礎制）' },
];
const FACTORY_LIST = ['GTM', 'GCK', 'GCM', 'GCT', 'GEV', 'GEM', 'GHM'];
const INSURANCE_TYPE_OPTIONS = [
  { value: 'CGL', label: 'CGL（Commercial General Liability）' },
  { value: 'PLG', label: 'PLG（Product Liability General）' },
  { value: 'PLI', label: 'PLI（Product Liability Insurance）' },
];

// ─── FloatingInput（標準表單輸入元件，帶浮動標籤）──────────────────────────────
// 規格來源：SKILL.md「⭐ 表單輸入元件規範」
// 比照 ShippingBasicSettingsPage.tsx 的完整實作（含 onFocus/onBlur 邊框互動）
function FloatingInput({
  label, value, onChange, disabled, placeholder, required, noResize, hasError, vendorField,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  noResize?: boolean;
  hasError?: boolean;
  vendorField?: boolean;
}) {
  const defaultBorder = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const handleFocus = (el: HTMLElement) => {
    if (disabled) return;
    const b = el.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
    if (b) { b.style.borderColor = '#1890FF'; b.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.15)'; }
  };
  const handleBlur = (el: HTMLElement) => {
    const b = el.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
    if (b) { b.style.borderColor = defaultBorder; b.style.boxShadow = 'none'; }
  };
  const labelBg = disabled ? '#f4f6f8' : 'white';
  const labelNode = (
    <div className="absolute flex items-center left-[14px] px-[2px] top-[-7px] z-10">
      <div className="absolute h-[2px] left-0 right-0 top-[7px]" style={{ background: labelBg }} />
      <p className="relative shrink-0 leading-[14px] whitespace-nowrap" style={{ fontSize: '14px', fontWeight: 600, color: hasError ? '#ff5630' : vendorField ? '#005eb8' : '#1c252e' }}>
        {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
        {label}
      </p>
    </div>
  );
  if (noResize) {
    return (
      <div className="relative w-full h-[54px]" style={{ background: disabled ? '#f4f6f8' : 'white', borderRadius: 8 }}>
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor: defaultBorder }} />
        {labelNode}
        <input
          type="text"
          className="w-full h-full rounded-[8px] px-[14px] pt-[14px] pb-[8px] text-[14px] outline-none bg-transparent border-0"
          style={{ color: disabled ? '#919eab' : '#1c252e' }}
          value={value}
          onChange={e => { if (!disabled) onChange?.(e.target.value); }}
          placeholder={disabled ? '' : (placeholder ?? '')}
          readOnly={disabled}
          onFocus={e => handleFocus(e.currentTarget)}
          onBlur={e => handleBlur(e.currentTarget)}
        />
      </div>
    );
  }
  return (
    <div className="relative w-full" style={{ minHeight: '54px', background: disabled ? '#f4f6f8' : 'white', borderRadius: 8 }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid" style={{ borderColor: defaultBorder }} />
      {labelNode}
      <textarea
        className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] outline-none bg-transparent border-0 leading-[22px]"
        style={{ resize: disabled ? 'none' : 'vertical', minHeight: '54px', color: disabled ? '#919eab' : '#1c252e' }}
        value={value}
        onChange={e => { if (!disabled) onChange?.(e.target.value); }}
        placeholder={disabled ? '' : (placeholder ?? '')}
        rows={1}
        readOnly={disabled}
        onFocus={e => handleFocus(e.currentTarget)}
        onBlur={e => handleBlur(e.currentTarget)}
      />
    </div>
  );
}

// ─── StatusBadge (大型，左上角) ────────────────────────────────────────────────
function StatusBadge({ status }: { status: InsuranceStatus }) {
  const styles: Record<InsuranceStatus, { bg: string; border: string; text: string; label: string }> = {
    V:  { bg: 'rgba(0,184,217,0.16)',  border: '#00b8d9', text: '#006c9c', label: '廠商確認中(V)' },
    G:  { bg: 'rgba(255,171,0,0.16)',  border: '#ffab00', text: '#B76E00', label: '巨大確認中(G)' },
    CL: { bg: 'rgba(34,197,94,0.08)',  border: '#22c55e', text: '#118D57', label: '關閉結案(CL)' },
  };
  const s = styles[status] ?? { bg: 'rgba(145,158,171,0.16)', border: '#919eab', text: '#637381', label: status };
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-w-[48px] px-[12px] py-0 relative rounded-[8px] shrink-0"
      style={{ backgroundColor: s.bg }}
    >
      <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]" style={{ borderColor: s.border }} />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[14px] whitespace-nowrap" style={{ color: s.text }}>
        {s.label}
      </p>
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
function SectionTitle({ title, required, vendorField }: { title: string; required?: boolean; vendorField?: boolean }) {
  return (
    <div className="h-[48px] min-h-[48px] relative shrink-0">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex items-center h-full px-[4px]">
        <p
          className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[18px] whitespace-nowrap"
          style={{ color: vendorField ? '#005eb8' : '#1c252e' }}
        >
          {required && <span style={{ color: '#ff5630', marginRight: '4px' }}>*</span>}
          {title}
        </p>
      </div>
    </div>
  );
}

// ─── CheckItem ────────────────────────────────────────────────────────────────
function CheckItem({
  label, checked, onChange, disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-[5px] cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="w-[15px] h-[15px] accent-[#005eb8] cursor-pointer"
      />
      <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e]">{label}</span>
    </label>
  );
}

// ─── ActionButton ────────────────────────────────────────────────────────────
function ActionButton({
  label, variant = 'primary', onClick,
}: {
  label: string;
  variant?: 'primary' | 'danger' | 'red' | 'green' | 'outline';
  onClick?: () => void;
}) {
  const cls =
    variant === 'danger' || variant === 'red'
      ? 'bg-[#ff5630] hover:bg-[#dd4015] text-white'
      : variant === 'green'
      ? 'bg-[#16a34a] hover:bg-[#15803d] text-white'
      : variant === 'outline'
      ? 'bg-white hover:bg-[#f4f6f8] text-[#1c252e] border border-[rgba(145,158,171,0.32)]'
      : 'bg-[#1c252e] hover:bg-[#2c3540] text-white';
  return (
    <button
      onClick={onClick}
      className={`h-[36px] w-[108px] rounded-[8px] text-[14px] font-semibold transition-colors shrink-0 ${cls}`}
    >
      {label}
    </button>
  );
}

// ─── FloatingDateField（與 ShipmentDetailPage 相同實作）───────────────────────
function FloatingDateField({
  label, value, onChange, required, placeholder = '選擇日期', hasError, disabled, vendorField,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  vendorField?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const openCalendar = () => {
    if (disabled) return;
    if (ref.current) {
      const CALENDAR_W = 280;
      const r = ref.current.getBoundingClientRect();
      const top = r.bottom + 4;
      const left = r.left + CALENDAR_W > window.innerWidth - 8 ? r.right - CALENDAR_W : r.left;
      setPos({ top, left });
    }
    setOpen(v => !v);
  };

  const borderColor = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)';

  return (
    <div className="relative w-full" ref={ref} style={{ minHeight: '54px', background: disabled ? '#f4f6f8' : 'white', borderRadius: 8 }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid transition-colors"
        style={{ borderColor }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-7px] z-10">
        <div className="absolute h-[2px] left-0 right-0 top-[7px]" style={{ background: disabled ? '#f4f6f8' : 'white' }} />
        <p className="relative shrink-0 leading-[14px]" style={{ fontSize: '14px', fontWeight: 600, color: hasError ? '#ff5630' : vendorField ? '#005eb8' : '#1c252e' }}>
          {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
          {label}
        </p>
      </div>
      <div
        className={`flex items-center gap-[8px] h-full min-h-[54px] px-[14px] pt-[14px] pb-[8px] select-none ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={openCalendar}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hasError ? '#ff5630' : '#637381'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`font-['Public_Sans:Regular',sans-serif] text-[14px] flex-1 min-w-0 truncate ${value ? 'text-[#1c252e]' : hasError ? 'text-[#ff5630]' : 'text-[#c4cdd6]'}`}>
          {value || (disabled ? '' : placeholder)}
        </span>
      </div>
      {open && (
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}>
          <SimpleDatePicker
            selectedDate={value}
            onDateSelect={d => { onChange(d); setOpen(false); }}
          />
        </div>
      )}
    </div>
  );
}

// ─── PremiumAmountRow: 保費金額 row ────────────────────────────────────────────
const LAST_USED_CURRENCY_KEY = 'insurance_last_used_currency';
function getLastUsedCurrencies(): string[] {
  try { const r = localStorage.getItem(LAST_USED_CURRENCY_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveLastUsedCurrency(code: string) {
  try {
    const prev = getLastUsedCurrencies().filter(c => c !== code);
    localStorage.setItem(LAST_USED_CURRENCY_KEY, JSON.stringify([code, ...prev].slice(0, 5)));
  } catch { /**/ }
}

function PremiumAmountRow({
  label, amount, currency, onAmountChange, onCurrencyChange, disabled, required, hasError: externalHasError, vendorField,
}: {
  label: string;
  amount: number | null;
  currency: string;
  onAmountChange?: (v: number | null) => void;
  onCurrencyChange?: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  vendorField?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery]   = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  // ── 千分位輸入狀態 ──
  const [inputText, setInputText] = useState<string | null>(null);
  const [internalHasError, setInternalHasError] = useState(false);
  // 外部驗證失敗 OR 內部 blur 失敗
  const hasError = externalHasError || internalHasError;

  // 格式化數值為千分位字串
  const formatNumber = (v: number | null): string => {
    if (v === null || v === undefined) return '';
    return v.toLocaleString('en-US');
  };

  // 解析千分位字串為數字
  const parseInput = (s: string): number | null => {
    const clean = s.replace(/,/g, '').trim();
    if (clean === '') return null;
    const n = Number(clean);
    return isNaN(n) ? null : n;
  };

  // 格式化純數字字串為千分位（保留小數）
  const formatRaw = (raw: string): string => {
    if (!raw) return '';
    const [intPart, decPart] = raw.split('.');
    const formatted = Number(intPart || '0').toLocaleString('en-US');
    return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
  };

  // 顯示值：inputText 有值時用它（含千分位），否則用格式化的 amount
  const displayValue = inputText !== null ? inputText : formatNumber(amount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const raw = el.value;
    // 只保留數字、一個小數點
    const digitsOnly = raw.replace(/[^\d.]/g, '');
    // 格式化為千分位
    const formatted = formatRaw(digitsOnly);
    // 計算游標：新字串比舊字串多了幾個逗號，對應補偏移
    const cursorPos = el.selectionStart ?? formatted.length;
    const oldCommas = (inputText ?? '').slice(0, cursorPos).replace(/[^,]/g, '').length;
    const newRawLen = digitsOnly.slice(0, cursorPos - oldCommas + (raw.slice(0, cursorPos).replace(/[^\d.]/g, '').length - digitsOnly.slice(0, cursorPos - oldCommas).length)).length;
    const newCommas = formatted.slice(0, newRawLen + Math.floor((newRawLen - 1) / 3)).replace(/[^,]/g, '').length;
    const newCursor = formatted.length; // 最簡單：游標移到尾端（解決逗號插入跳位問題）

    setInputText(formatted);
    setInternalHasError(false);
    const parsed = parseInput(formatted);
    onAmountChange?.(parsed);

    // 非同步設定游標（React 重渲前先設定會被蓋掉）
    requestAnimationFrame(() => {
      if (el.isConnected) el.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleBlur = () => {
    const parsed = parseInput(inputText ?? '');
    if (parsed !== null && parsed <= 0) {
      setInternalHasError(true);
    } else {
      setInternalHasError(false);
      onAmountChange?.(parsed);
    }
    setInputText(null);
  };

  const handleFocus = () => {
    // focus 時顯示千分位格式（不剝掉逗號，讓使用者直接看到格式化值）
    setInputText(formatNumber(amount));
    setInternalHasError(false);
  };

  const sorted = useMemo(() => {
    const lastUsed = getLastUsedCurrencies();
    if (!lastUsed.length) return SAP_CURRENCIES;
    const set = new Set(lastUsed);
    const recent = lastUsed.map(c => SAP_CURRENCIES.find(x => x.code === c)).filter(Boolean) as typeof SAP_CURRENCIES;
    return [...recent, ...SAP_CURRENCIES.filter(c => !set.has(c.code))];
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.shortName?.toLowerCase().includes(q) ||
      c.fullName?.toLowerCase().includes(q)
    );
  }, [sorted, query]);

  return (
    <div className="flex flex-col gap-[4px] min-w-0">
      {/* 上方 label */}
      <span
        className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] leading-[22px] truncate"
        style={{ color: hasError ? '#ff5630' : vendorField ? '#005eb8' : '#1c252e' }}
      >
        {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
        {label}
      </span>

      {/* 金額 + 幣別 組合 pill：relative 在這層，下拉面板定位於此 */}
      <div className={`relative flex items-center rounded-[8px] border h-[36px] transition-colors w-full ${
        hasError ? 'border-[#ff4842]' : 'border-[rgba(145,158,171,0.32)]'
      }`} style={{ background: disabled ? '#f4f6f8' : 'white' }}>
        {/* 金額 input */}
        <input
          type="text"
          inputMode="numeric"
          className="flex-1 min-w-0 h-full px-[12px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 placeholder:text-[#919eab]"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={disabled}
          placeholder={disabled ? '' : '金額'}
        />

        {/* 分隔線 */}
        <div className="w-[1px] h-[20px] bg-[rgba(145,158,171,0.32)] shrink-0" />

        {/* 幣別 pill trigger */}
        <button
          disabled={disabled}
          onClick={() => !disabled && setOpen(o => !o)}
          className="flex items-center gap-[4px] px-[10px] h-[36px] text-[13px] font-semibold text-[#1c252e] hover:bg-[#f4f6f8] rounded-r-[8px] transition-colors disabled:cursor-default shrink-0"
        >
          <span className="whitespace-nowrap">{currency || '幣別'}</span>
          {!disabled && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* 幣別搜尋式下拉面板 — 定位於 pill 容器下方左側 */}
        {open && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => { setOpen(false); setQuery(''); }} />
            <div
              className="absolute left-0 z-[100] bg-white rounded-[8px] shadow-[0px_8px_24px_rgba(0,0,0,0.12)] border border-[rgba(145,158,171,0.16)]"
              style={{ top: 'calc(100% + 8px)', minWidth: '320px', maxHeight: '320px', display: 'flex', flexDirection: 'column' }}
            >
              {/* 搜尋欄 */}
              <div className="px-[10px] py-[8px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
                <div className="flex items-center gap-[6px] border border-[rgba(145,158,171,0.32)] rounded-[6px] px-[10px] py-[5px] focus-within:border-[#005eb8] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <circle cx="11" cy="11" r="8" stroke="#919eab" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="#919eab" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="搜尋代碼或名稱..."
                    className="flex-1 text-[13px] text-[#1c252e] placeholder:text-[#c4cdd6] outline-none bg-transparent border-0"
                  />
                  {query && (
                    <button onClick={e => { e.stopPropagation(); setQuery(''); }} className="text-[#919eab] hover:text-[#1c252e]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>
              </div>
              {/* 選項列表 */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {filtered.length > 0 ? filtered.map((c, i) => {
                  const lastUsed = getLastUsedCurrencies();
                  const isLastRecent = !query && lastUsed.length > 0 && i === lastUsed.length - 1 && i < filtered.length - 1;
                  return (
                    <div key={`${c.code}-${i}`}>
                      <div
                        className={`px-[14px] py-[9px] cursor-pointer flex items-center justify-between transition-colors ${
                          currency === c.code ? 'bg-[rgba(0,94,184,0.08)]' : 'hover:bg-[rgba(145,158,171,0.06)]'
                        }`}
                        onClick={() => { saveLastUsedCurrency(c.code); onCurrencyChange?.(c.code); setOpen(false); setQuery(''); }}
                      >
                        <div>
                          <span className="font-semibold text-[13px] text-[#005eb8] mr-[8px]">{c.code}</span>
                          <span className="text-[13px] text-[#1c252e]">{c.fullName || c.shortName}</span>
                        </div>
                        {currency === c.code && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
                            <path d="M20 6 9 17l-5-5" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      {isLastRecent && <div className="mx-[14px] border-t border-[rgba(145,158,171,0.16)]" />}
                    </div>
                  );
                }) : (
                  <div className="px-[14px] py-[16px] text-center">
                    <p className="text-[13px] text-[#919eab]">無符合的幣別</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {/* 錯誤提示 */}
      {hasError && (
        <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[12px] text-[#ff4842] leading-[18px]">
          金額不可為 0
        </span>
      )}
    </div>
  );
}


// ─── Main Component ────────────────────────────────────────────────────────────
export function InsuranceDetailPage({
  record,
  currentPage,
  onPageChange,
  onLogout,
  userRole: initialUserRole = 'giant',
  onBack,
  onSave,
  onStatusChange,
}: InsuranceDetailPageProps) {
  const [activeRole, setActiveRole] = useState<UserRole>(initialUserRole);
  const isVendor = activeRole === 'vendor';
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState<InsuranceRecord>({ ...record });
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 從廠商明細查詢廠商資料（廠商編號、主要營業商品）──
  const vendorInfo = MOCK_VENDORS.find(v => v.code === form.vendorCode);
  const vendorDisplayCode = vendorInfo?.code ?? form.vendorCode;
  const vendorDisplayName = vendorInfo?.name ?? form.vendorName;
  // 主要營業商品優先讀取廠商明細頁面保存的 localStorage，否則從 MOCK_VENDORS 讀取
  const storedMainProducts =
    typeof window !== 'undefined'
      ? localStorage.getItem(`vendor_${vendorDisplayCode}_mainProducts`) ?? vendorInfo?.mainProducts ?? form.mainProducts
      : form.mainProducts;

  const set = <K extends keyof InsuranceRecord>(key: K, value: InsuranceRecord[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const isReadOnly =
    form.status === 'CL' ||
    (isVendor && (form.status === 'G' || form.status === 'CL'));

  // ── 去年同廠商的已結案資料 ──
  const lastYearRecord = insuranceMockData.find(
    r => r.vendorCode === record.vendorCode && r.year === record.year - 1 && r.status === 'CL',
  );

  // ── 同去年設定 ──
  const handleSameAsLastYear = (checked: boolean) => {
    if (checked && !lastYearRecord) return; // 無去年資料，不允許勾選
    set('sameAsLastYear', checked);
    if (checked && lastYearRecord) {
      set('factories', [...lastYearRecord.factories]);
    }
  };

  // ── 附件處理 ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    set('attachments', [...form.attachments, ...Array.from(files).map(f => ({ name: f.name, url: URL.createObjectURL(f) }))]);
    e.target.value = '';
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;
    set('attachments', [...form.attachments, ...Array.from(files).map(f => ({ name: f.name, url: URL.createObjectURL(f) }))]);
  };

  // ── 廠商必填欄位驗證 ──
  const validateVendorFields = (): string[] => {
    const missing: string[] = [];
    if (form.factories.length === 0)             missing.push('工廠涵蓋範圍（至少勾選一項）');
    if (!form.insuranceCompanyZh.trim())         missing.push('保險公司名稱（中）');
    if (!form.insuranceCompanyEn.trim())         missing.push('保險公司名稱（En）');
    if (!form.effectiveDate)                     missing.push('生效日期');
    if (!form.expiryDate)                        missing.push('截止日期');
    if (!form.creditRating.trim())               missing.push('保險公司信用評等');
    if (form.premium === null || form.premium <= 0)  missing.push('保費金額（需大於 0）');
    if (!form.premiumCurrency)                   missing.push('保費幣別');
    if (form.attachments.length === 0)           missing.push('保單附件（至少上傳一份）');
    return missing;
  };

  // ── 歷程輔助：逐欄比對差異，產生人可讀摘要 ──
  const buildChangeHistory = (prev: InsuranceRecord, next: InsuranceRecord, suffix = ''): HistoryEntry | null => {
    const actor = activeRole === 'vendor' ? (form.vendorName || '廠商') : '巨大';
    const FIELD_LABELS: Partial<Record<keyof InsuranceRecord, string>> = {
      insuranceCompanyZh: '保險公司名稱(中)',
      insuranceCompanyEn: '保險公司名稱(En)',
      effectiveDate:      '生效日期',
      expiryDate:         '截止日期',
      retroactiveDate:    '回朔日期',
      insuranceType:      '投保險種',
      insuredMaterial:    '投保物料',
      claimBasis:         '索賠制式',
      creditRating:       '保險公司信用評等',
      representative:     '代表人',
      notes:              '備註',
      premium:            '保費',
      premiumCurrency:    '保費幣別',
      contractPolicyAmount:   '合約簽訂保額',
      contractPolicyCurrency: '合約簽訂保額幣別',
      singleIncidentAmount:   '單一事故賠償金額',
      singleIncidentCurrency: '單一事故賠償金額幣別',
      standardPolicyAmount:   '標準保額',
      standardPolicyCurrency: '標準保額幣別',
      maxCompensation:        '廠商最高賠償金額',
      maxCompensationCurrency:'廠商最高賠償金額幣別',
      safetyParts:            '安全部品',
      contractSigned:         '合約簽訂',
      greenWave:              '綠波合約',
      oeAttachment:           'OE附約',
      mou:                    'MOU',
      humanRightsSurvey:      '供應商人權調查問卷',
      coversUSA:              '投保區域含美加',
      giantAsAdditional:      '巨大為附加被保險人',
      sameAsLastYear:         '同去年設定',
      factories:              '工廠涵蓋範圍',
      isPaid:                 '繳費狀態',
      attachments:            '保單附件',
    };
    const changed: string[] = [];
    (Object.keys(FIELD_LABELS) as (keyof InsuranceRecord)[]).forEach(key => {
      const a = JSON.stringify(prev[key]);
      const b = JSON.stringify(next[key]);
      if (a !== b) changed.push(FIELD_LABELS[key]!);
    });
    const summary = changed.length > 0
      ? `儲存${suffix}（修改：${changed.join('、')}）`
      : `儲存${suffix}（無欄位變更）`;
    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      actor,
      summary,
    };
  };

  // ── 動作按鈕 ──
  const handleSave = () => {
    const entry = buildChangeHistory(record, form);
    const updated = entry ? { ...form, history: [entry, ...form.history] } : form;
    onSave(updated);
  };

  const handleReturnToVendor = (reason: string) => {
    const newHistory: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      actor: activeRole === 'vendor' ? (form.vendorName || '廠商') : '巨大',
      summary: reason ? `退回廠商：${reason}` : '退回廠商',
    };
    const updatedForm = { ...form, history: [newHistory, ...form.history] };
    onSave(updatedForm);
    onStatusChange(form.id, 'V');
  };

  const handleCloseAfterSave = () => {
    const entry = buildChangeHistory(record, form, '並結案');
    const closedEntry: HistoryEntry = {
      id: (Date.now() + 1).toString(),
      timestamp: new Date().toISOString(),
      actor: activeRole === 'vendor' ? (form.vendorName || '廠商') : '巨大',
      summary: '確認結案',
    };
    const updated = { ...form, history: [closedEntry, ...(entry ? [entry] : []), ...form.history] };
    onSave(updated);
    onStatusChange(form.id, 'CL');
  };

  const handleConfirmClose = () => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      actor: activeRole === 'vendor' ? (form.vendorName || '廠商') : '巨大',
      summary: '確認結案',
    };
    const updated = { ...form, history: [entry, ...form.history] };
    onSave(updated);
    onStatusChange(form.id, 'CL');
  };

  const handleTransferToProcurement = () => {
    const missing = validateVendorFields();
    if (missing.length > 0) {
      setShowValidation(true);
      setMissingFields(missing);
      return;
    }
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      actor: form.vendorName || '廠商',
      summary: '轉交整合採購',
    };
    const updated = { ...form, history: [entry, ...form.history] };
    onSave(updated);
    onStatusChange(form.id, 'G');
  };

  // ── 動作按鈕列 ──
  function ActionButtons() {
    if (isVendor && form.status === 'V') {
      return (
        <div className="flex items-center gap-[8px]">
          <ActionButton label="轉交整合採購" onClick={handleTransferToProcurement} />
        </div>
      );
    }
    if (!isVendor && form.status === 'V') {
      return (
        <div className="flex items-center gap-[8px]">
          <ActionButton label="取消單據" variant="danger" onClick={() => alert('取消單據（mock）')} />
          <ActionButton label="退回廠商" variant="red" onClick={() => { setReturnReason(''); setShowReturnDialog(true); }} />
          <ActionButton label="儲存" variant="green" onClick={handleSave} />
          <ActionButton label="儲存後結案" onClick={handleCloseAfterSave} />
        </div>
      );
    }
    if (!isVendor && form.status === 'G') {
      return (
        <div className="flex items-center gap-[8px]">
          <ActionButton label="退回廠商" variant="red" onClick={() => { setReturnReason(''); setShowReturnDialog(true); }} />
          <ActionButton label="儲存" variant="green" onClick={handleSave} />
          <ActionButton label="儲存後結案" onClick={handleCloseAfterSave} />
        </div>
      );
    }
    return null;
  }

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={activeRole}
      title="產險資料維護"
      breadcrumb="產險資料維護 • 產險資料明細"
    >
      {/* 標準功能區容器框架：白底 rounded-[16px] shadow（與 list 頁完全一致） */}
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

        {/* ══ 頂部導覽條（固定，不捲動）══ */}
        <div className="shrink-0 bg-white border-b border-[rgba(145,158,171,0.16)] px-[24px] flex items-center justify-between" style={{ minHeight: 56 }}>
          {/* 左側：× + StatusBadge + 標題 */}
          <div className="flex items-center gap-[12px]">
            <div className="cursor-pointer hover:opacity-70 transition-opacity shrink-0" onClick={onBack}>
              <div className="relative size-[24px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d={closeIconPaths.p275a9800} fill="#637381" fillRule="evenodd" />
                </svg>
              </div>
            </div>
            <StatusBadge status={form.status} />
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px]">
              {form.year}供應商產險資料
            </p>
          </div>

          {/* 右側 */}
          <div className="flex items-center gap-[12px]">
            <div className="flex items-center gap-[6px] shrink-0 bg-[#f4f6f8] rounded-[8px] px-[10px] h-[32px]">
              <span className="text-[12px] text-[#637381] font-medium">角色：</span>
              <button onClick={() => setActiveRole('giant')} className={`text-[12px] font-semibold px-[6px] py-[1px] rounded-[4px] transition-colors ${activeRole === 'giant' ? 'bg-[#1c252e] text-white' : 'text-[#637381] hover:text-[#1c252e]'}`}>巨大</button>
              <span className="text-[#919eab] text-[12px]">⇄</span>
              <button onClick={() => setActiveRole('vendor')} className={`text-[12px] font-semibold px-[6px] py-[1px] rounded-[4px] transition-colors ${activeRole === 'vendor' ? 'bg-[#1c252e] text-white' : 'text-[#637381] hover:text-[#1c252e]'}`}>廠商</button>
            </div>
            <p onClick={() => setShowHistory(true)} className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:text-[#003d73] shrink-0">歷程</p>
            {!isReadOnly && <ActionButtons />}
          </div>
        </div>{/* end header */}

        {/* ══ 可捲動內容區 ══ */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="px-[24px] py-[20px] flex flex-col gap-[0px]">

            {/* ── 基本資訊 section ── */}
            <div className="flex items-center gap-[16px] mb-[16px]">
              <SectionTitle title="基本資訊" />
            </div>

            <div className="flex flex-col gap-[20px] mb-[24px] pt-[10px]">

              {/* Row 1: 廠商(編號) ・ 主要營業商品（靜態顯示，來自廠商明細） */}
              <div className="flex items-center gap-[32px] flex-wrap">
                <div className="flex items-center gap-[8px]">
                  <span className="shrink-0 font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">
                    廠商(編號)
                  </span>
                  <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381]">
                    {vendorDisplayName}({vendorDisplayCode})
                  </span>
                </div>
                <div className="flex items-center gap-[8px] flex-1 min-w-0">
                  <span className="shrink-0 font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">
                    主要營業商品
                  </span>
                  <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] flex-1 min-w-0 truncate">
                    {storedMainProducts || '—'}
                  </span>
                </div>
              </div>

              {/* Row 1b: 工廠涵蓋範圍 — 框框樣式（同其他備註） */}
              <div className="relative rounded-[8px] border border-[rgba(145,158,171,0.2)] h-[54px] px-[20px] flex items-center"
                style={{ background: isReadOnly ? '#f4f6f8' : 'white' }}
              >
                {/* 浮動標籤 */}
                <div className="absolute flex items-center left-[14px] px-[2px] top-[-7px] z-10">
                  <div className="absolute h-[2px] left-0 right-0 top-[7px]" style={{ background: isReadOnly ? '#f4f6f8' : 'white' }} />
                  <p className={`relative text-[14px] font-semibold ${
                    isVendor && !isReadOnly && showValidation && form.factories.length === 0
                      ? 'text-[#ff5630]'
                      : !isVendor ? 'text-[#005eb8]' : 'text-[#1c252e]'
                  }`}>
                    {isVendor && !isReadOnly && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
                    工廠涵蓋範圍
                  </p>
                </div>
                {/* 內容：同去年設定 + 分隔線 + 工廠 checkboxes */}
                <div className="flex items-center gap-[12px] flex-wrap">
                  <CheckItem
                    label="同去年設定"
                    checked={form.sameAsLastYear}
                    disabled={isReadOnly || !lastYearRecord}
                    onChange={handleSameAsLastYear}
                  />
                  <div className="w-[1px] h-[14px] bg-[rgba(145,158,171,0.32)]" />
                  {FACTORY_LIST.map(f => (
                    <CheckItem
                      key={f}
                      label={f}
                      checked={form.factories.includes(f)}
                      disabled={isReadOnly}
                      onChange={checked => {
                        // 工廠異動時，若同去年設定已勾 → 自動取消（視為不同於去年）
                        if (form.sameAsLastYear) set('sameAsLastYear', false);
                        if (checked) set('factories', [...form.factories, f]);
                        else set('factories', form.factories.filter(x => x !== f));
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Row 2+3: 保險公司名稱(中) 1份 / (En) 2份 並排 */}
              <div className="grid grid-cols-3 gap-[16px]">
                <div className="min-w-0">
                  <FloatingInput
                    label="保險公司名稱(中)"
                    value={form.insuranceCompanyZh}
                    onChange={v => set('insuranceCompanyZh', v)}
                    disabled={isReadOnly}
                    placeholder="請輸入中文名稱"
                    noResize
                    required={isVendor && !isReadOnly}
                    hasError={isVendor && !isReadOnly && showValidation && !form.insuranceCompanyZh.trim()}
                    vendorField={!isVendor}
                  />
                </div>
                <div className="col-span-2 min-w-0">
                  <FloatingInput
                    label="保險公司名稱(En)"
                    value={form.insuranceCompanyEn}
                    onChange={v => set('insuranceCompanyEn', v)}
                    disabled={isReadOnly}
                    placeholder="Please enter English name"
                    noResize
                    required={isVendor && !isReadOnly}
                    hasError={isVendor && !isReadOnly && showValidation && !form.insuranceCompanyEn.trim()}
                    vendorField={!isVendor}
                  />
                </div>
              </div>

              {/* Row 4: 生效日期 | 截止日期 | 保險公司信用評等（各自帶 floating label） */}
              <div className="flex items-center gap-[16px]">
                <div className="flex-1 min-w-0">
                  <FloatingDateField
                    label="生效日期"
                    value={form.effectiveDate}
                    onChange={v => set('effectiveDate', v)}
                    disabled={isReadOnly}
                    required={isVendor && !isReadOnly}
                    hasError={isVendor && !isReadOnly && showValidation && !form.effectiveDate}
                    vendorField={!isVendor}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <FloatingDateField
                    label="截止日期"
                    value={form.expiryDate}
                    onChange={v => set('expiryDate', v)}
                    disabled={isReadOnly}
                    required={isVendor && !isReadOnly}
                    hasError={isVendor && !isReadOnly && showValidation && !form.expiryDate}
                    vendorField={!isVendor}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <FloatingInput
                    label="保險公司信用評等"
                    value={form.creditRating}
                    onChange={v => set('creditRating', v)}
                    disabled={isReadOnly}
                    placeholder="如 AM Best: A+"
                    noResize
                    required={isVendor && !isReadOnly}
                    hasError={isVendor && !isReadOnly && showValidation && !form.creditRating.trim()}
                    vendorField={!isVendor}
                  />
                </div>
              </div>



              {/* ── 巨大視角專屬欄位 ── */}
              {!isVendor && (
                <>
                  {/* 回朔日期 + 投保險種 + 投保物料（同一列，三等欄） */}
                  <div className="flex items-center gap-[16px]">
                    <div className="flex-1 min-w-0">
                      <FloatingDateField
                        label="回朔日期"
                        value={form.retroactiveDate}
                        onChange={v => set('retroactiveDate', v)}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DropdownSelect
                        label="投保險種"
                        value={form.insuranceType}
                        onChange={v => set('insuranceType', v)}
                        options={INSURANCE_TYPE_OPTIONS}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <FloatingInput
                        label="投保物料"
                        value={form.insuredMaterial}
                        onChange={v => set('insuredMaterial', v)}
                        disabled={isReadOnly}
                        placeholder="請輸入投保物料"
                      />
                    </div>
                  </div>

                  {/* 索賠制式 + 代表人 + 備註（三等欄） */}
                  <div className="flex items-center gap-[16px]">
                    <div className="flex-1 min-w-0">
                      <DropdownSelect
                        label="索賠制式"
                        value={form.claimBasis}
                        onChange={v => set('claimBasis', v)}
                        options={CLAIM_BASIS_OPTIONS}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <FloatingInput
                        label="代表人"
                        value={form.representative}
                        onChange={v => set('representative', v)}
                        disabled={isReadOnly}
                        placeholder="代表人"
                        noResize
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <FloatingInput
                        label="備註"
                        value={form.notes}
                        onChange={v => set('notes', v)}
                        disabled={isReadOnly}
                        placeholder="備註"
                        noResize
                      />
                    </div>
                  </div>

                  {/* 其他備註 Checkboxes — 底色區塊 */}
                  <div className="relative rounded-[8px] border border-[rgba(145,158,171,0.2)] bg-[#f4f6f8] h-[54px] px-[20px] flex items-center">
                    {/* 浮動標籤 */}
                    <div className="absolute flex items-center left-[14px] px-[2px] top-[-7px] z-10">
                      <div className="absolute bg-[#f4f6f8] h-[2px] left-0 right-0 top-[7px]" />
                      <p className="relative text-[14px] font-semibold text-[#1c252e]">其他備註</p>
                    </div>
                    <div className="flex items-center gap-[16px] flex-wrap">
                      <CheckItem label="安全部品" checked={form.safetyParts} disabled={isReadOnly} onChange={v => set('safetyParts', v)} />
                      <CheckItem label="合約簽訂" checked={form.contractSigned} disabled={isReadOnly} onChange={v => set('contractSigned', v)} />
                      <CheckItem label="綠波合約" checked={form.greenWave} disabled={isReadOnly} onChange={v => set('greenWave', v)} />
                      <CheckItem label="OE附約" checked={form.oeAttachment} disabled={isReadOnly} onChange={v => set('oeAttachment', v)} />
                      <CheckItem label="MOU" checked={form.mou} disabled={isReadOnly} onChange={v => set('mou', v)} />
                      <CheckItem label="供應商人權調查問卷" checked={form.humanRightsSurvey} disabled={isReadOnly} onChange={v => set('humanRightsSurvey', v)} />
                      <CheckItem label="投保區域含美加" checked={form.coversUSA} disabled={isReadOnly} onChange={v => set('coversUSA', v)} />
                      <CheckItem label="巨大為附加被保險人" checked={form.giantAsAdditional} disabled={isReadOnly} onChange={v => set('giantAsAdditional', v)} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── 保費資訊 section ── */}
            <div className="flex items-center gap-[16px] mb-[16px]">
              <SectionTitle title="保費資訊" />
            </div>
            <div className="flex items-start gap-[16px] mb-[24px]">
              {/* 保費（廠商+巨大都顯示） */}
              <div className={isVendor ? 'w-fit' : 'flex-1 min-w-0'}>
                <PremiumAmountRow
                  label="保費"
                  amount={form.premium}
                  currency={form.premiumCurrency}
                  onAmountChange={v => set('premium', v)}
                  onCurrencyChange={v => set('premiumCurrency', v)}
                  disabled={isReadOnly}
                  required={isVendor && !isReadOnly}
                  hasError={isVendor && !isReadOnly && showValidation && (form.premium === null || form.premium <= 0)}
                  vendorField={!isVendor}
                />
              </div>

              {/* 巨大視角才顯示的四個金額 */}
              {!isVendor && (
                <>
                  <div className="flex-1 min-w-0">
                    <PremiumAmountRow
                      label="合約簽訂保額"
                      amount={form.contractPolicyAmount}
                      currency={form.contractPolicyCurrency}
                      onAmountChange={v => set('contractPolicyAmount', v)}
                      onCurrencyChange={v => set('contractPolicyCurrency', v)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <PremiumAmountRow
                      label="單一事故賠償金額"
                      amount={form.singleIncidentAmount}
                      currency={form.singleIncidentCurrency}
                      onAmountChange={v => set('singleIncidentAmount', v)}
                      onCurrencyChange={v => set('singleIncidentCurrency', v)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <PremiumAmountRow
                      label="標準保額"
                      amount={form.standardPolicyAmount}
                      currency={form.standardPolicyCurrency}
                      onAmountChange={v => set('standardPolicyAmount', v)}
                      onCurrencyChange={v => set('standardPolicyCurrency', v)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <PremiumAmountRow
                      label="廠商最高賠償金額"
                      amount={form.maxCompensation}
                      currency={form.maxCompensationCurrency}
                      onAmountChange={v => set('maxCompensation', v)}
                      onCurrencyChange={v => set('maxCompensationCurrency', v)}
                      disabled={isReadOnly}
                    />
                  </div>
                </>
              )}
            </div>

            {/* ── 保單附件 section ── */}
            <div className="flex items-center gap-[16px] mb-[16px]">
              <SectionTitle title="保單附件" required={isVendor && !isReadOnly} vendorField={!isVendor} />
              {isVendor && !isReadOnly && showValidation && form.attachments.length === 0 && (
                <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#ff5630] leading-[18px]">至少需上傳一份附件</span>
              )}
            </div>
            <div className="flex flex-col gap-[8px] mb-[24px]">
              {/* 附件列表 */}
              {form.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[8px] border border-[rgba(145,158,171,0.2)] hover:bg-[#f4f6f8] transition-colors group"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <a
                    href={att.url || '#'}
                    download={att.name}
                    onClick={e => { if (!att.url) e.preventDefault(); }}
                    className={`flex-1 text-[14px] truncate font-['Public_Sans:Regular',sans-serif] ${att.url ? 'text-[#005eb8] underline cursor-pointer hover:text-[#003d73]' : 'text-[#1c252e]'}`}
                  >
                    {att.name}
                  </a>
                  {!isReadOnly && (
                    <button
                      onClick={() => set('attachments', form.attachments.filter((_, i) => i !== idx))}
                      className="flex items-center gap-[4px] text-[13px] text-[#ff5630] hover:opacity-70 transition-opacity shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff5630" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              ))}

              {/* 上傳區域 */}
              {!isReadOnly && (
                <div
                  className="flex flex-col items-center justify-center gap-[6px] border-2 border-dashed border-[rgba(145,158,171,0.32)] rounded-[8px] py-[24px] cursor-pointer hover:border-[#005eb8] hover:bg-[rgba(0,94,184,0.02)] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#919eab" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[13px] text-[#637381]">點擊或拖曳上傳檔案</p>
                  <p className="text-[12px] text-[#919eab]">支援格式：PDF、JPG、PNG、XLSX｜單檔上限 10 MB</p>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>{/* end 保單附件 content */}
          </div>{/* end px-[24px] py-[20px] */}
        </div>{/* end overflow-y-auto */}
      </div>{/* end 白底卡片 */}

      {/* ══ 歷程 Modal（標準 OrderHistory 元件） ══ */}
      {showHistory && (
        <OrderHistory
          onClose={() => setShowHistory(false)}
          titleLabel="產險歷程"
          entries={form.history.map((h: HistoryEntry) => ({
            date: h.timestamp,
            event: h.summary,
            operator: h.actor,
            remark: '',
          }))}
        />
      )}

      {/* ══ 退回廠商原因彈窗 ══ */}
      {showReturnDialog && (
        <BaseOverlay onClose={() => setShowReturnDialog(false)} maxWidth="480px" maxHeight="360px">
          {/* 頂部標題 */}
          <div className="shrink-0 flex items-center gap-[12px] pl-[4px] pr-[16px] py-[4px] border-b border-[rgba(145,158,171,0.12)]">
            <div className="flex items-center justify-center rounded-[12px] shrink-0 size-[48px] bg-[rgba(0,94,184,0.08)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e]">請輸入退回原因</p>
            <button
              onClick={() => setShowReturnDialog(false)}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* 輸入區 */}
          <div className="flex-1 overflow-y-auto px-[20px] py-[16px] flex flex-col gap-[8px]">
            <div className="relative rounded-[8px] min-h-[140px]">
              <div aria-hidden="true" className="absolute border-2 border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <textarea
                value={returnReason}
                onChange={e => { if (e.target.value.length <= 50) setReturnReason(e.target.value); }}
                placeholder="請簡述退回原因，限 50 字"
                rows={6}
                className="w-full min-h-[140px] px-[16px] py-[12px] font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] bg-transparent outline-none resize-none placeholder:text-[#919eab] text-[#1c252e] rounded-[8px]"
              />
            </div>
            <p className="text-right text-[12px] text-[#919eab]">{returnReason.length} / 50</p>
          </div>
          {/* 底部按鈕 */}
          <div className="shrink-0 flex items-center justify-end gap-[8px] px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.12)]">
            <button
              onClick={() => setShowReturnDialog(false)}
              className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
            >
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">取消</span>
            </button>
            <button
              onClick={() => {
                setShowReturnDialog(false);
                handleReturnToVendor(returnReason.trim());
              }}
              className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] bg-[#004680] hover:bg-[#003560] transition-colors"
            >
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white">確認退回</span>
            </button>
          </div>
        </BaseOverlay>
      )}

      {/* ══ 廠商必填欄位驗證 Alert ══ */}
      {missingFields.length > 0 && (
        <BaseOverlay onClose={() => setMissingFields([])} maxWidth="420px" maxHeight="360px">
          {/* 頂部警示列 */}
          <div className="shrink-0 flex items-center gap-[12px] pl-[4px] pr-[16px] py-[4px] border-b border-[rgba(145,158,171,0.12)]">
            <div className="flex items-center justify-center rounded-[12px] shrink-0 size-[48px] bg-[rgba(255,86,48,0.08)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FF5630" strokeWidth="1.5" />
                <path d="M12 8v4M12 16h.01" stroke="#FF5630" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e]">尚未填寫必要欄位</p>
            <button
              onClick={() => setMissingFields([])}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* 內容 */}
          <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] mb-[12px]">轉交整合採購前請先完成以下欄位：</p>
            <ul className="space-y-[6px]">
              {missingFields.map(f => (
                <li key={f} className="flex items-center gap-[8px]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#FF5630] shrink-0" />
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">{f}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* 底部 */}
          <div className="shrink-0 flex justify-end px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.12)]">
            <button
              onClick={() => setMissingFields([])}
              className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors"
            >
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white">確認</span>
            </button>
          </div>
        </BaseOverlay>
      )}
    </ResponsivePageLayout>
  );
}
