import { useState, useRef } from 'react';
import { ResponsivePageLayout } from './ResponsivePageLayout';
import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import { OrderHistory } from './OrderHistory';
import type { PageType } from './MainLayout';
import type { UserRole } from '../App';
import type { InsuranceRecord, InsuranceStatus, HistoryEntry } from './insuranceData';
import { insuranceMockData } from './insuranceData';

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
const CURRENCY_OPTIONS = ['USD', 'EUR', 'TWD', 'JPY', 'CNY'].map(c => ({ value: c, label: c }));
const CLAIM_BASIS_OPTIONS = [
  { value: 'A', label: 'A（索賠基礎制）' },
  { value: 'B', label: 'B（事故發生基礎制）' },
];
const FACTORY_LIST = ['GTM', 'GCK', 'GCM', 'GCT', 'GEV', 'GEM', 'GHM'];
const INSURANCE_TYPE_LIST = ['CGL', 'PLG', 'PLI'];

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
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0">
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">
        {title}
      </p>
    </div>
  );
}

// ─── FormRow: label 左 + 內容右，一整行 ────────────────────────────────────────
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[12px] w-full min-h-[36px]">
      <span className="shrink-0 font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[22px] w-[120px]">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── InlineInput: 底線 input ────────────────────────────────────────────────────
function InlineInput({
  value, onChange, disabled, placeholder,
}: {
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      className="w-full h-[32px] border-b border-[rgba(145,158,171,0.4)] bg-transparent px-[4px] text-[14px] outline-none focus:border-[#1890ff] transition-colors"
      style={{ color: disabled ? '#919eab' : '#1c252e' }}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={disabled}
      placeholder={disabled ? '' : (placeholder ?? '')}
    />
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
  variant?: 'primary' | 'danger' | 'outline';
  onClick?: () => void;
}) {
  const cls =
    variant === 'danger'
      ? 'bg-[#ff5630] hover:bg-[#dd4015] text-white'
      : variant === 'outline'
      ? 'bg-white hover:bg-[#f4f6f8] text-[#1c252e] border border-[rgba(145,158,171,0.32)]'
      : 'bg-[#1c252e] hover:bg-[#2c3540] text-white';
  return (
    <button
      onClick={onClick}
      className={`h-[36px] px-[20px] rounded-[8px] text-[14px] font-semibold transition-colors shrink-0 ${cls}`}
    >
      {label}
    </button>
  );
}

// ─── PremiumAmountRow: 保費金額 row ────────────────────────────────────────────
function PremiumAmountRow({
  label, amount, currency, onAmountChange, onCurrencyChange, disabled,
}: {
  label: string;
  amount: number | null;
  currency: string;
  onAmountChange?: (v: number | null) => void;
  onCurrencyChange?: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-[8px]">
      <span className="shrink-0 font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[22px] w-[120px]">
        {label}
      </span>
      <input
        className="w-[160px] h-[32px] border-b border-[rgba(145,158,171,0.4)] bg-transparent px-[4px] text-[14px] outline-none focus:border-[#1890ff] transition-colors"
        style={{ color: disabled ? '#919eab' : '#1c252e' }}
        type="number"
        value={amount !== null ? String(amount) : ''}
        onChange={e => onAmountChange?.(e.target.value === '' ? null : Number(e.target.value))}
        readOnly={disabled}
        placeholder={disabled ? '' : '金額'}
      />
      <div className="w-[120px] shrink-0">
        <DropdownSelect
          label="幣別"
          value={currency}
          onChange={v => onCurrencyChange?.(v)}
          options={CURRENCY_OPTIONS}
          disabled={disabled}
        />
      </div>
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
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState<InsuranceRecord>({ ...record });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof InsuranceRecord>(key: K, value: InsuranceRecord[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const isReadOnly =
    form.status === 'CL' ||
    (isVendor && (form.status === 'G' || form.status === 'CL'));

  // ── 同去年設定 ──
  const handleSameAsLastYear = (checked: boolean) => {
    set('sameAsLastYear', checked);
    if (checked) {
      const lastYear = insuranceMockData.find(
        r => r.vendorCode === record.vendorCode && r.year === record.year - 1 && r.status === 'CL',
      );
      if (lastYear) set('factories', [...lastYear.factories]);
    }
  };

  // ── 附件處理 ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    set('attachments', [...form.attachments, ...Array.from(files).map(f => ({ name: f.name }))]);
    e.target.value = '';
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;
    set('attachments', [...form.attachments, ...Array.from(files).map(f => ({ name: f.name }))]);
  };

  // ── 動作按鈕 ──
  const handleSave = () => onSave(form);
  const handleReturnToVendor = () => onStatusChange(form.id, 'V');
  const handleCloseAfterSave = () => { onSave(form); onStatusChange(form.id, 'CL'); };
  const handleConfirmClose = () => onStatusChange(form.id, 'CL');
  const handleTransferToProcurement = () => onStatusChange(form.id, 'G');

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
          <ActionButton label="退回廠商" onClick={handleReturnToVendor} />
          <ActionButton label="儲存後結案" onClick={handleCloseAfterSave} />
        </div>
      );
    }
    if (!isVendor && form.status === 'G') {
      return (
        <div className="flex items-center gap-[8px]">
          <ActionButton label="退回廠商" onClick={handleReturnToVendor} />
          <ActionButton label="確認結案" onClick={handleConfirmClose} />
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
      <div className="overflow-y-auto custom-scrollbar h-full">
        <div className="px-[24px] py-[20px] flex flex-col gap-[0px]">

          {/* ══ Header: 狀態TAG + 標題 + 右側圖示按鈕 ══ */}
          <div className="flex items-center gap-[16px] mb-[20px] flex-wrap">
            <StatusBadge status={form.status} />
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[22px] text-[#1c252e] flex-1 min-w-0 whitespace-nowrap">
              {form.year}供應商產險資料
            </p>

            {/* 角色切換（測試用） */}
            <div className="flex items-center gap-[6px] shrink-0 bg-[#f4f6f8] rounded-[8px] px-[10px] h-[32px]">
              <span className="text-[12px] text-[#637381] font-medium">角色：</span>
              <button
                onClick={() => setActiveRole('giant')}
                className={`text-[12px] font-semibold px-[6px] py-[1px] rounded-[4px] transition-colors ${
                  activeRole === 'giant' ? 'bg-[#1c252e] text-white' : 'text-[#637381] hover:text-[#1c252e]'
                }`}
              >巨大</button>
              <span className="text-[#919eab] text-[12px]">⇄</span>
              <button
                onClick={() => setActiveRole('vendor')}
                className={`text-[12px] font-semibold px-[6px] py-[1px] rounded-[4px] transition-colors ${
                  activeRole === 'vendor' ? 'bg-[#1c252e] text-white' : 'text-[#637381] hover:text-[#1c252e]'
                }`}
              >廠商</button>
            </div>

            {/* 💬 聊天 */}
            <button className="flex items-center gap-[4px] text-[14px] text-[#637381] hover:text-[#1c252e] transition-colors shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* 歷程 */}
            <p
              onClick={() => setShowHistory(true)}
              className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:text-[#003d73] shrink-0"
            >
              歷程
            </p>

            {/* 返回 */}
            <button
              onClick={onBack}
              className="flex items-center gap-[6px] h-[36px] px-[14px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white hover:bg-[#f4f6f8] transition-colors text-[14px] text-[#637381] font-medium shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              返回
            </button>
          </div>

          {/* ══ 主內容 + 歷程面板 ══ */}
          <div className="flex gap-[24px] items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-[0px]">

              {/* ── 基本資訊 section ── */}
              <div className="flex items-center gap-[16px] mb-[16px]">
                <SectionTitle title="基本資訊" />
                {/* 動作按鈕放在 section title 右邊 */}
                {!isReadOnly && (
                  <div className="ml-auto">
                    <ActionButtons />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-[10px] mb-[24px]">
                {/* 廠商 + 主要營業商品 */}
                <div className="flex items-center gap-[32px] flex-wrap">
                  <div className="flex items-center gap-[8px]">
                    <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">廠商(編號)</span>
                    <span className="font-normal text-[14px] text-[#637381]">{form.vendorName}({form.vendorCode})</span>
                  </div>
                  <div className="flex items-center gap-[8px] flex-1 min-w-0">
                    <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">主要營業商品</span>
                    {isReadOnly ? (
                      <span className="font-normal text-[14px] text-[#637381]">{form.mainProducts || '—'}</span>
                    ) : (
                      <input
                        className="flex-1 min-w-0 h-[28px] border-b border-[rgba(145,158,171,0.4)] bg-transparent px-[4px] text-[14px] outline-none focus:border-[#1890ff] transition-colors text-[#1c252e]"
                        value={form.mainProducts}
                        onChange={e => set('mainProducts', e.target.value)}
                        placeholder="請輸入主要營業商品"
                      />
                    )}
                  </div>
                </div>

                {/* 保險公司名稱(中) */}
                <FormRow label="保險公司名稱(中)">
                  <InlineInput value={form.insuranceCompanyZh} onChange={v => set('insuranceCompanyZh', v)} disabled={isReadOnly} placeholder="請輸入中文名稱" />
                </FormRow>

                {/* 保險公司名稱(En) */}
                <FormRow label="保險公司名稱(En)">
                  <InlineInput value={form.insuranceCompanyEn} onChange={v => set('insuranceCompanyEn', v)} disabled={isReadOnly} placeholder="Please enter English name" />
                </FormRow>

                {/* 生效日 + 截止日 + 回朔日（僅巨大） */}
                <div className="flex items-center gap-[16px] flex-wrap">
                  <div className="flex items-center gap-[8px]">
                    <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">生效日期</span>
                    <div className="w-[180px]">
                      <SearchField
                        type="date"
                        label="生效日期"
                        value={form.effectiveDate}
                        onChange={v => set('effectiveDate', v)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">截止日期</span>
                    <div className="w-[180px]">
                      <SearchField
                        type="date"
                        label="截止日期"
                        value={form.expiryDate}
                        onChange={v => set('expiryDate', v)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                  {!isVendor && (
                    <div className="flex items-center gap-[8px]">
                      <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">回朔日期</span>
                      <div className="w-[180px]">
                        <SearchField
                          type="date"
                          label="回朔日期"
                          value={form.retroactiveDate}
                          onChange={v => set('retroactiveDate', v)}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 工廠涵蓋範圍 */}
                <div className="flex items-center gap-[12px] flex-wrap">
                  <span className="shrink-0 font-semibold text-[14px] text-[#1c252e] w-[120px]">工廠涵蓋範圍</span>
                  <CheckItem label="同去年設定" checked={form.sameAsLastYear} disabled={isReadOnly} onChange={handleSameAsLastYear} />
                  <div className="w-[1px] h-[14px] bg-[rgba(145,158,171,0.32)]" />
                  {FACTORY_LIST.map(f => (
                    <CheckItem
                      key={f}
                      label={f}
                      checked={form.factories.includes(f)}
                      disabled={isReadOnly}
                      onChange={checked => {
                        if (checked) set('factories', [...form.factories, f]);
                        else set('factories', form.factories.filter(x => x !== f));
                      }}
                    />
                  ))}
                </div>

                {/* 巨大視角專屬欄位 */}
                {!isVendor && (
                  <>
                    {/* 投保險種 + 投保物料 + 保險公司信用評等 */}
                    <div className="flex items-center gap-[16px] flex-wrap">
                      <div className="flex items-center gap-[8px]">
                        <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">投保險種</span>
                        <div className="flex items-center gap-[10px]">
                          {INSURANCE_TYPE_LIST.map(type => (
                            <CheckItem
                              key={type}
                              label={type}
                              checked={form.insuranceType.includes(type)}
                              disabled={isReadOnly}
                              onChange={checked => {
                                if (checked) set('insuranceType', [...form.insuranceType, type]);
                                else set('insuranceType', form.insuranceType.filter(t => t !== type));
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-[8px] flex-1 min-w-0">
                        <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">投保物料</span>
                        <input
                          className="flex-1 min-w-0 h-[28px] border-b border-[rgba(145,158,171,0.4)] bg-transparent px-[4px] text-[14px] outline-none focus:border-[#1890ff] transition-colors text-[#1c252e]"
                          value={form.insuredMaterial}
                          onChange={e => set('insuredMaterial', e.target.value)}
                          readOnly={isReadOnly}
                          placeholder={isReadOnly ? '' : '請輸入投保物料'}
                        />
                      </div>
                    </div>

                    {/* 索賠制式 + 代表人 + 備註 */}
                    <div className="flex items-center gap-[16px] flex-wrap">
                      <div className="flex items-center gap-[8px]">
                        <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">索賠制式</span>
                        <div className="w-[200px]">
                          <DropdownSelect
                            label="索賠制式"
                            value={form.claimBasis}
                            onChange={v => set('claimBasis', v)}
                            options={CLAIM_BASIS_OPTIONS}
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">代表人</span>
                        <input
                          className="w-[140px] h-[28px] border-b border-[rgba(145,158,171,0.4)] bg-transparent px-[4px] text-[14px] outline-none focus:border-[#1890ff] transition-colors text-[#1c252e]"
                          value={form.representative}
                          onChange={e => set('representative', e.target.value)}
                          readOnly={isReadOnly}
                          placeholder={isReadOnly ? '' : '代表人'}
                        />
                      </div>
                      <div className="flex items-center gap-[8px] flex-1 min-w-0">
                        <span className="shrink-0 font-semibold text-[14px] text-[#1c252e]">備註</span>
                        <input
                          className="flex-1 min-w-0 h-[28px] border-b border-[rgba(145,158,171,0.4)] bg-transparent px-[4px] text-[14px] outline-none focus:border-[#1890ff] transition-colors text-[#1c252e]"
                          value={form.notes}
                          onChange={e => set('notes', e.target.value)}
                          readOnly={isReadOnly}
                          placeholder={isReadOnly ? '' : '備註'}
                        />
                      </div>
                    </div>

                    {/* 保險公司信用評等 */}
                    <div className="flex items-center gap-[8px]">
                      <span className="shrink-0 font-semibold text-[14px] text-[#1c252e] w-[120px]">保險公司信用評等</span>
                      <input
                        className="w-[200px] h-[28px] border-b border-[rgba(145,158,171,0.4)] bg-transparent px-[4px] text-[14px] outline-none focus:border-[#1890ff] transition-colors text-[#1c252e]"
                        value={form.creditRating}
                        onChange={e => set('creditRating', e.target.value)}
                        readOnly={isReadOnly}
                        placeholder={isReadOnly ? '' : '如 AM Best: A+'}
                      />
                    </div>

                    {/* 條款 Checkboxes */}
                    <div className="flex items-center gap-[12px] flex-wrap">
                      <span className="shrink-0 font-semibold text-[14px] text-[#1c252e] w-[120px]">條款</span>
                      <CheckItem label="安全部品" checked={form.safetyParts} disabled={isReadOnly} onChange={v => set('safetyParts', v)} />
                      <CheckItem label="合約簽訂" checked={form.contractSigned} disabled={isReadOnly} onChange={v => set('contractSigned', v)} />
                      <CheckItem label="綠波合約" checked={form.greenWave} disabled={isReadOnly} onChange={v => set('greenWave', v)} />
                      <CheckItem label="OE附約" checked={form.oeAttachment} disabled={isReadOnly} onChange={v => set('oeAttachment', v)} />
                      <CheckItem label="MOU" checked={form.mou} disabled={isReadOnly} onChange={v => set('mou', v)} />
                      <CheckItem label="供應商人權調查問卷" checked={form.humanRightsSurvey} disabled={isReadOnly} onChange={v => set('humanRightsSurvey', v)} />
                      <CheckItem label="投保區域含美加" checked={form.coversUSA} disabled={isReadOnly} onChange={v => set('coversUSA', v)} />
                      <CheckItem label="巨大為附加被保險人" checked={form.giantAsAdditional} disabled={isReadOnly} onChange={v => set('giantAsAdditional', v)} />
                    </div>
                  </>
                )}

                {/* 廠商視角：信用評等 */}
                {isVendor && (
                  <div className="flex items-center gap-[8px]">
                    <span className="shrink-0 font-semibold text-[14px] text-[#1c252e] w-[120px]">保險公司信用評等</span>
                    <input
                      className="w-[200px] h-[28px] border-b border-[rgba(145,158,171,0.4)] bg-transparent px-[4px] text-[14px] outline-none focus:border-[#1890ff] transition-colors text-[#1c252e]"
                      value={form.creditRating}
                      onChange={e => set('creditRating', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder={isReadOnly ? '' : '如 AM Best: A+'}
                    />
                  </div>
                )}
              </div>

              {/* ── 保費資訊 section ── */}
              <div className="flex items-center gap-[16px] mb-[16px]">
                <SectionTitle title="保費資訊" />
              </div>
              <div className="flex flex-col gap-[10px] mb-[24px]">
                {/* 保費（廠商+巨大都顯示） */}
                <PremiumAmountRow
                  label="保費"
                  amount={form.premium}
                  currency={form.premiumCurrency}
                  onAmountChange={v => set('premium', v)}
                  onCurrencyChange={v => set('premiumCurrency', v)}
                  disabled={isReadOnly}
                />

                {/* 巨大視角才顯示 */}
                {!isVendor && (
                  <>
                    <div className="flex items-center gap-[16px] flex-wrap">
                      <PremiumAmountRow
                        label="合約簽訂保額"
                        amount={form.contractPolicyAmount}
                        currency={form.contractPolicyCurrency}
                        onAmountChange={v => set('contractPolicyAmount', v)}
                        onCurrencyChange={v => set('contractPolicyCurrency', v)}
                        disabled={isReadOnly}
                      />
                      <PremiumAmountRow
                        label="單一事故賠償金額"
                        amount={form.singleIncidentAmount}
                        currency={form.singleIncidentCurrency}
                        onAmountChange={v => set('singleIncidentAmount', v)}
                        onCurrencyChange={v => set('singleIncidentCurrency', v)}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center gap-[16px] flex-wrap">
                      <PremiumAmountRow
                        label="標準保額"
                        amount={form.standardPolicyAmount}
                        currency={form.standardPolicyCurrency}
                        onAmountChange={v => set('standardPolicyAmount', v)}
                        onCurrencyChange={v => set('standardPolicyCurrency', v)}
                        disabled={isReadOnly}
                      />
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
                <SectionTitle title="保單附件" />
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
                    <span className="flex-1 text-[14px] text-[#1c252e] truncate font-['Public_Sans:Regular',sans-serif]">{att.name}</span>
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
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                  </div>
                )}
              </div>

              {/* 儲存按鈕 */}
              {!isReadOnly && (
                <div className="flex justify-end pt-[8px]">
                  <button
                    onClick={handleSave}
                    className="h-[36px] px-[24px] rounded-[8px] flex items-center justify-center transition-colors hover:bg-[#004680]"
                    style={{ backgroundColor: '#00559c' }}
                  >
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white leading-[24px]">儲存</p>
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

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
    </ResponsivePageLayout>
  );
}
