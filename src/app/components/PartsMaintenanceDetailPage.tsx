'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { SearchField } from '@/app/components/SearchField';
import { DropdownSelect } from '@/app/components/DropdownSelect';
import { DeleteButton } from '@/app/components/ActionButtons';
import type { PartRecord, BrandSetting } from '@/app/components/partsMaintenanceData';
import {
  BRAND_OPTIONS, TRADE_TERMS_OPTIONS, QUOTE_UNIT_OPTIONS,
  PRODUCT_TYPE_OPTIONS, WEIGHT_UNIT_OPTIONS, CURRENCY_OPTIONS,
} from '@/app/components/partsMaintenanceData';

// ── Props ────────────────────────────────────────────────────────────────────

interface PartsMaintenanceDetailPageProps {
  part: PartRecord;
  onClose: () => void;
  onSave: (updatedPart: PartRecord) => void;
}

// ── Tab type ─────────────────────────────────────────────────────────────────

type TabId = 'info' | 'composition';

const TABS: { id: TabId; label: string }[] = [
  { id: 'info', label: '物料資訊維護' },
  { id: 'composition', label: '物料成分設定' },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function PartsMaintenanceDetailPage({
  part,
  onClose,
  onSave,
}: PartsMaintenanceDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>('info');

  // ── Editable field state ─────────────────────────────────────────────────
  const [syncDtcDte, setSyncDtcDte] = useState(part.syncDtcDte);
  const [qaCompletionDate, setQaCompletionDate] = useState(part.qaCompletionDate);
  const [sampleDate, setSampleDate] = useState(part.sampleDate);
  const [firstDeliveryDate, setFirstDeliveryDate] = useState(part.firstDeliveryDate);
  const [grossWeight, setGrossWeight] = useState(part.grossWeight);
  const [netWeight, setNetWeight] = useState(part.netWeight);
  const [weightUnit, setWeightUnit] = useState(part.weightUnit);
  const [vendorPartNo, setVendorPartNo] = useState(part.vendorPartNo);
  const [remark, setRemark] = useState(part.remark);

  // ── Brand settings state ─────────────────────────────────────────────────
  const [brandSettings, setBrandSettings] = useState<BrandSetting[]>(
    () => part.brandSettings.map(bs => ({ ...bs })),
  );

  // ── Brand settings helpers ───────────────────────────────────────────────
  const handleAddBrand = () => {
    setBrandSettings(prev => [
      ...prev,
      {
        id: Date.now(),
        brand: '',
        unitPrice: '',
        currency: '',
        quoteQty: '',
        leadTime: '',
        moq: '',
        tradeTerms: '',
        tradeTermsPlace: '',
        quoteUnit: '',
        productType: '',
      },
    ]);
  };

  const handleDeleteBrand = (id: number) => {
    setBrandSettings(prev => prev.filter(bs => bs.id !== id));
  };

  const updateBrand = (id: number, field: keyof BrandSetting, value: string) => {
    setBrandSettings(prev =>
      prev.map(bs => (bs.id === id ? { ...bs, [field]: value } : bs)),
    );
  };

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const savedAt = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const hasQuote = brandSettings.some(bs => bs.unitPrice.trim() !== '');
    const quoteStatus: 'quoted' | 'pending' = hasQuote ? 'quoted' : 'pending';

    const updatedPart: PartRecord = {
      ...part,
      syncDtcDte,
      qaCompletionDate,
      sampleDate,
      firstDeliveryDate,
      grossWeight,
      netWeight,
      weightUnit,
      vendorPartNo,
      remark,
      brandSettings,
      quoteStatus,
      savedAt,
    };

    onSave(updatedPart);
    toast('儲存成功');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <Toaster />

      {/* ════════ Tabs ════════ */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        {TABS.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
          >
            {activeTab === tab.id && (
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            )}
            <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
              activeTab === tab.id ? 'text-[#1c252e]' : 'text-[#637381]'
            }`}>
              {tab.label}
            </p>
          </div>
        ))}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ════════ Content ════════ */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-[24px] py-[20px]">
        {activeTab === 'info' ? (
          <InfoContent
            part={part}
            syncDtcDte={syncDtcDte}
            setSyncDtcDte={setSyncDtcDte}
            qaCompletionDate={qaCompletionDate}
            setQaCompletionDate={setQaCompletionDate}
            sampleDate={sampleDate}
            setSampleDate={setSampleDate}
            firstDeliveryDate={firstDeliveryDate}
            setFirstDeliveryDate={setFirstDeliveryDate}
            grossWeight={grossWeight}
            setGrossWeight={setGrossWeight}
            netWeight={netWeight}
            setNetWeight={setNetWeight}
            weightUnit={weightUnit}
            setWeightUnit={setWeightUnit}
            vendorPartNo={vendorPartNo}
            setVendorPartNo={setVendorPartNo}
            remark={remark}
            setRemark={setRemark}
            brandSettings={brandSettings}
            onAddBrand={handleAddBrand}
            onDeleteBrand={handleDeleteBrand}
            onUpdateBrand={updateBrand}
            onSave={handleSave}
          />
        ) : (
          <UnderConstructionContent />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 1 — 物料資訊維護
// ═══════════════════════════════════════════════════════════════════════════════

interface InfoContentProps {
  part: PartRecord;
  syncDtcDte: boolean;
  setSyncDtcDte: (v: boolean) => void;
  qaCompletionDate: string;
  setQaCompletionDate: (v: string) => void;
  sampleDate: string;
  setSampleDate: (v: string) => void;
  firstDeliveryDate: string;
  setFirstDeliveryDate: (v: string) => void;
  grossWeight: string;
  setGrossWeight: (v: string) => void;
  netWeight: string;
  setNetWeight: (v: string) => void;
  weightUnit: string;
  setWeightUnit: (v: string) => void;
  vendorPartNo: string;
  setVendorPartNo: (v: string) => void;
  remark: string;
  setRemark: (v: string) => void;
  brandSettings: BrandSetting[];
  onAddBrand: () => void;
  onDeleteBrand: (id: number) => void;
  onUpdateBrand: (id: number, field: keyof BrandSetting, value: string) => void;
  onSave: () => void;
}

function InfoContent({
  part,
  syncDtcDte,
  setSyncDtcDte,
  qaCompletionDate,
  setQaCompletionDate,
  sampleDate,
  setSampleDate,
  firstDeliveryDate,
  setFirstDeliveryDate,
  grossWeight,
  setGrossWeight,
  netWeight,
  setNetWeight,
  weightUnit,
  setWeightUnit,
  vendorPartNo,
  setVendorPartNo,
  remark,
  setRemark,
  brandSettings,
  onAddBrand,
  onDeleteBrand,
  onUpdateBrand,
  onSave,
}: InfoContentProps) {
  return (
    <div className="space-y-[24px]">
      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-[12px]">
        <div className="flex items-center gap-[20px]">
          <h2 className="text-[18px] font-semibold text-[#1c252e]">基本資料設定</h2>
          <label className="flex items-center gap-[8px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncDtcDte}
              onChange={e => setSyncDtcDte(e.target.checked)}
              className="w-[16px] h-[16px] accent-[#1890FF] cursor-pointer"
            />
            <span className="text-[14px] text-[#1c252e]">同步零件資訊(DTC、DTE)</span>
          </label>
        </div>
        <div className="flex items-center gap-[12px]">
          <button
            onClick={onSave}
            className="bg-[#1890FF] text-white rounded-[8px] h-[40px] px-[20px] text-[14px] font-medium hover:bg-[#1060c0] transition-colors"
          >
            儲存
          </button>
          <button
            onClick={() => toast('功能開發中')}
            className="bg-[#1c252e] text-white rounded-[8px] h-[40px] px-[20px] text-[14px] font-medium hover:bg-[#2d3a47] transition-colors"
          >
            列印報價單
          </button>
        </div>
      </div>

      {/* ── Read-only fields (中台帶入) ────────────────────────────────────── */}
      <div className="space-y-[12px]">
        <div className="flex flex-wrap gap-x-[40px] gap-y-[8px]">
          <ReadOnlyField label="廠商" value={`${part.vendorName}(${part.vendorCode})`} />
          <ReadOnlyField label="料號" value={part.material} />
          <ReadOnlyField label="採購組織" value={part.purchaseOrg} />
          <ReadOnlyField label="工廠" value={part.plant} />
        </div>
        <div>
          <ReadOnlyField label="長規格敘述" value={part.longDescription} />
        </div>
      </div>

      {/* ── Editable fields (bordered box) ─────────────────────────────────── */}
      <div className="border border-[rgba(145,158,171,0.2)] rounded-[12px] p-[24px] space-y-[16px]">
        {/* Row 1: Dates */}
        <div className="flex gap-[16px]">
          <SearchField label="廠商QA計畫完成日期" value={qaCompletionDate} onChange={setQaCompletionDate} type="date" />
          <SearchField label="可送樣日" value={sampleDate} onChange={setSampleDate} type="date" />
          <SearchField label="預計首批可供貨日(出廠日)" value={firstDeliveryDate} onChange={setFirstDeliveryDate} type="date" />
        </div>
        {/* Row 2: Weights */}
        <div className="flex gap-[16px]">
          <SearchField label="毛重" value={grossWeight} onChange={setGrossWeight} type="search" />
          <SearchField label="淨重" value={netWeight} onChange={setNetWeight} type="search" />
          <DropdownSelect label="重量單位" value={weightUnit} onChange={setWeightUnit} options={WEIGHT_UNIT_OPTIONS} />
        </div>
        {/* Row 3: Vendor part no & remark */}
        <div className="flex gap-[16px]">
          <SearchField label="廠商料號" value={vendorPartNo} onChange={setVendorPartNo} type="search" />
          <SearchField label="備註" value={remark} onChange={setRemark} type="search" />
        </div>
      </div>

      {/* ── Brand settings table ───────────────────────────────────────────── */}
      <BrandSettingsSection
        brandSettings={brandSettings}
        onAdd={onAddBrand}
        onDelete={onDeleteBrand}
        onUpdate={onUpdateBrand}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Read-only field
// ═══════════════════════════════════════════════════════════════════════════════

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline">
      <span className="font-semibold text-[14px] text-[#1c252e]">{label}</span>
      <span className="ml-[8px] text-[14px] text-[#637381]">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Brand Settings Section
// ═══════════════════════════════════════════════════════════════════════════════

interface BrandSettingsSectionProps {
  brandSettings: BrandSetting[];
  onAdd: () => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: keyof BrandSetting, value: string) => void;
}

const BRAND_TABLE_COLUMNS = [
  { key: 'brand' as const, label: '品牌', width: '120px', type: 'select' as const, options: BRAND_OPTIONS },
  { key: 'unitPrice' as const, label: '採購單價', width: '100px', type: 'text' as const },
  { key: 'currency' as const, label: '幣別', width: '90px', type: 'select' as const, options: CURRENCY_OPTIONS },
  { key: 'quoteQty' as const, label: '報價數量', width: '100px', type: 'text' as const },
  { key: 'leadTime' as const, label: 'Lead Time', width: '100px', type: 'text' as const },
  { key: 'moq' as const, label: 'MOQ', width: '90px', type: 'text' as const },
  { key: 'tradeTerms' as const, label: '國貿條件', width: '130px', type: 'select' as const, options: TRADE_TERMS_OPTIONS },
  { key: 'tradeTermsPlace' as const, label: '國貿條件約定地點', width: '140px', type: 'text' as const },
  { key: 'quoteUnit' as const, label: '報價單位', width: '120px', type: 'select' as const, options: QUOTE_UNIT_OPTIONS },
  { key: 'productType' as const, label: '標準品/客製品', width: '120px', type: 'select' as const, options: PRODUCT_TYPE_OPTIONS },
];

function BrandSettingsSection({ brandSettings, onAdd, onDelete, onUpdate }: BrandSettingsSectionProps) {
  return (
    <div className="space-y-[12px]">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <h3 className="text-[18px] font-semibold text-[#1c252e]">品牌設定</h3>
          <span className="text-[14px] text-[#637381]">({brandSettings.length})</span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#1890FF] hover:bg-[#1060c0] text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar border border-[rgba(145,158,171,0.2)] rounded-[8px]">
        <table className="w-full border-collapse" style={{ minWidth: '1340px' }}>
          {/* Header */}
          <thead>
            <tr className="bg-[#f4f6f8]">
              {BRAND_TABLE_COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="text-left text-[12px] font-semibold text-[#637381] px-[8px] py-[10px] whitespace-nowrap"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              <th className="w-[50px] px-[4px] py-[10px]" />
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {brandSettings.length === 0 ? (
              <tr>
                <td colSpan={BRAND_TABLE_COLUMNS.length + 1} className="text-center py-[24px] text-[14px] text-[#919eab]">
                  尚無品牌設定，請點擊 ＋ 新增
                </td>
              </tr>
            ) : (
              brandSettings.map(bs => (
                <tr key={bs.id} className="border-t border-[rgba(145,158,171,0.08)] items-center">
                  {BRAND_TABLE_COLUMNS.map(col => (
                    <td key={col.key} className="px-[8px] py-[6px]">
                      {col.type === 'select' ? (
                        <select
                          value={(bs as any)[col.key]}
                          onChange={e => onUpdate(bs.id, col.key as keyof BrandSetting, e.target.value)}
                          className="border border-[rgba(145,158,171,0.2)] rounded-[6px] h-[36px] px-[8px] text-[13px] w-full bg-white text-[#1c252e] outline-none focus:border-[#1890FF] transition-colors cursor-pointer"
                        >
                          <option value="">請選擇</option>
                          {col.options!.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={(bs as any)[col.key]}
                          onChange={e => onUpdate(bs.id, col.key as keyof BrandSetting, e.target.value)}
                          className="border border-[rgba(145,158,171,0.2)] rounded-[6px] h-[36px] px-[8px] text-[13px] w-full bg-white text-[#1c252e] outline-none focus:border-[#1890FF] transition-colors"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-[4px] py-[6px]">
                    <DeleteButton onClick={() => onDelete(bs.id)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 2 — Under Construction
// ═══════════════════════════════════════════════════════════════════════════════

function UnderConstructionContent() {
  return (
    <div className="relative flex-1 min-h-[300px]">
      {/* Blurred mock content */}
      <div className="absolute inset-0" style={{ filter: 'blur(4px)' }}>
        <div className="p-[40px] space-y-[16px]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[40px] bg-[rgba(145,158,171,0.08)] rounded-[8px]" />
          ))}
        </div>
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ backdropFilter: 'blur(2px)' }}>
        <div className="bg-white/80 rounded-[16px] px-[40px] py-[24px] shadow-lg text-center">
          <p className="text-[20px] font-semibold text-[#1c252e] mb-[8px]">畫面建置中</p>
          <p className="text-[14px] text-[#637381]">此功能正在開發中，敬請期待</p>
        </div>
      </div>
    </div>
  );
}
