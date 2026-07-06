'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { SearchField } from '@/app/components/SearchField'; // 日期欄位保留
import { DropdownSelect } from '@/app/components/DropdownSelect';
import { DeleteButton } from '@/app/components/ActionButtons';
import { BaseOverlay } from '@/app/components/BaseOverlay';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import type { PartRecord, BrandSetting, PartHistoryEntry, MaterialComposition } from '@/app/components/partsMaintenanceData';
import {
  BRAND_OPTIONS, TRADE_TERMS_OPTIONS, QUOTE_UNIT_OPTIONS,
  PRODUCT_TYPE_OPTIONS, WEIGHT_UNIT_OPTIONS, CURRENCY_OPTIONS,
  updatePart,
} from '@/app/components/partsMaintenanceData';
import { OrderHistory } from '@/app/components/OrderHistory';
import {
  type EsgMaterialRecord,
  getEsgMaterials,
} from '@/app/components/esgMaterialData';
import { StandardDataTable, type StandardColumn } from '@/app/components/StandardDataTable';
import QuotationPrintPage from '@/app/components/QuotationPrintPage';

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
  const [showPrint, setShowPrint] = useState(false);

  // ── 歷程相關狀態 ──────────────────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PartHistoryEntry[]>(part.history ?? []);

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
    () => (part.brandSettings ?? []).map(bs => ({ ...bs })),
  );

  // ── Material compositions state ──────────────────────────────────────────
  const [materialCompositions, setMaterialCompositions] = useState<MaterialComposition[]>(
    () => part.materialCompositions?.map(mc => ({ ...mc })) ?? [],
  );

  // ── Brand settings helpers ───────────────────────────────────────────────
  const handleAddBrand = () => {
    setBrandSettings(prev => [
      ...prev,
      {
        id: Date.now(),
        brand: 'ALL',
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

    // 廠商QA計畫完成日期、可送樣日、預計首批可供貨日、廠商料號，任一有填即歸類「已報價」
    const hasQuote =
      qaCompletionDate.trim() !== '' ||
      sampleDate.trim() !== '' ||
      firstDeliveryDate.trim() !== '' ||
      vendorPartNo.trim() !== '';
    const quoteStatus: 'quoted' | 'pending' = hasQuote ? 'quoted' : 'pending';

    // ── 歷程：比對變更欄位，產生異動摘要 ────────────────────────────────────
    const changes: string[] = [];
    if (qaCompletionDate !== part.qaCompletionDate)
      changes.push(`廠商QA計畫完成日期: ${part.qaCompletionDate || '(空)'}\u2192${qaCompletionDate || '(空)'}`);
    if (sampleDate !== part.sampleDate)
      changes.push(`可送樣日: ${part.sampleDate || '(空)'}\u2192${sampleDate || '(空)'}`);
    if (firstDeliveryDate !== part.firstDeliveryDate)
      changes.push(`預計首批可供貨日: ${part.firstDeliveryDate || '(空)'}\u2192${firstDeliveryDate || '(空)'}`);
    if (vendorPartNo !== part.vendorPartNo)
      changes.push(`廠商料號: ${part.vendorPartNo || '(空)'}\u2192${vendorPartNo || '(空)'}`);
    if (grossWeight !== part.grossWeight)
      changes.push(`毛重: ${part.grossWeight}\u2192${grossWeight}`);
    if (netWeight !== part.netWeight)
      changes.push(`淨重: ${part.netWeight}\u2192${netWeight}`);
    if (weightUnit !== part.weightUnit)
      changes.push(`重量單位: ${part.weightUnit}\u2192${weightUnit}`);
    if (remark !== part.remark)
      changes.push('備註已修改');
    if (syncDtcDte !== part.syncDtcDte)
      changes.push(`同步DTC/DTE: ${part.syncDtcDte ? '是' : '否'}\u2192${syncDtcDte ? '是' : '否'}`);
    // 品牌設定逐筆比對（以 id 為 key）
    const addedBrands = brandSettings.filter(nb => !part.brandSettings.some(ob => ob.id === nb.id));
    const removedBrands = part.brandSettings.filter(ob => !brandSettings.some(nb => nb.id === ob.id));
    const modifiedBrands = brandSettings.filter(nb => {
      const ob = part.brandSettings.find(o => o.id === nb.id);
      return ob && JSON.stringify({ ...ob, id: 0 }) !== JSON.stringify({ ...nb, id: 0 });
    });
    const fmtBrand = (b: BrandSetting) =>
      `${b.brand || '(未選)'}(${b.currency || '—'} ${b.unitPrice || '—'}/報價量:${b.quoteQty || '—'}/MOQ:${b.moq || '—'})`;
    const BRAND_FIELD_LABELS: Partial<Record<keyof BrandSetting, string>> = {
      brand: '品牌', unitPrice: '採購單價', currency: '幣別',
      quoteQty: '報價數量', leadTime: 'Lead Time', moq: 'MOQ',
      tradeTerms: '國貿條件', tradeTermsPlace: '國貿條件地點',
      quoteUnit: '報價單位', productType: '標準/客製品',
    };
    if (addedBrands.length > 0)
      changes.push(`新增品牌: ${addedBrands.map(fmtBrand).join('、')}`);
    if (removedBrands.length > 0)
      changes.push(`刪除品牌: ${removedBrands.map(fmtBrand).join('、')}`);
    for (const nb of modifiedBrands) {
      const ob = part.brandSettings.find(o => o.id === nb.id)!;
      const brandName = nb.brand || ob.brand || '(未選)';
      const fieldDiffs: string[] = [];
      for (const key of Object.keys(BRAND_FIELD_LABELS) as (keyof BrandSetting)[]) {
        if (String(ob[key] ?? '') !== String(nb[key] ?? '')) {
          fieldDiffs.push(`${BRAND_FIELD_LABELS[key]}: ${ob[key] || '(空)'}→${nb[key] || '(空)'}`);
        }
      }
      if (fieldDiffs.length > 0)
        changes.push(`修改品牌設定[${brandName}]: ${fieldDiffs.join('、')}`);
    }

    // 事項標籤
    const eventLabel = '修改零件資料';

    const newEntry: PartHistoryEntry = {
      date: savedAt,
      event: eventLabel,
      operator: `廠商-${part.vendorName}`,
      remark: changes.length > 0 ? changes.join('；') : '無變更',
    };
    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);

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
      materialCompositions,
      quoteStatus,
      savedAt,
      history: updatedHistory,
    };

    onSave(updatedPart);
    toast('儲存成功');
  };

  // ── Render ───────────────────────────────────────────────────────────────

  // 列印報價單：切換為全頁列印預覽
  if (showPrint) {
    return (
      <QuotationPrintPage
        part={part}
        onBack={() => setShowPrint(false)}
      />
    );
  }

  return (
    <>
      <Toaster />

      {/* ════════ Header (返回 + Tabs) ════════ */}
      <div className="shrink-0 px-[24px] pt-[16px] pb-0 border-b border-[rgba(145,158,171,0.12)]">

        {/* 返回箭頭列 */}
        <div className="flex items-center gap-[10px] mb-[4px]">
          <div onClick={onClose} className="shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity">
            <IconsSolidIcSolarMultipleForwardLeftBroken />
          </div>

          {/* Tabs */}
          <div className="flex gap-[32px] items-end h-[48px] relative">
            {TABS.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex gap-[8px] h-[48px] items-center justify-center relative shrink-0 cursor-pointer"
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
          </div>
        </div>
      </div>

      {/* ════════ Content ════════ */}
      <div className="px-[24px] py-[20px]">
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
            onShowHistory={() => setShowHistory(true)}
            onPrint={() => setShowPrint(true)}
          />
        ) : (
          <MaterialCompositionTab
            part={part}
            compositions={materialCompositions}
            onAdd={(mc) => {
              setMaterialCompositions(prev => {
                const next = [...prev, mc];
                // 即時寫入 store，使用 next 保證是最新內容
                updatePart({ ...part, materialCompositions: next });
                return next;
              });
            }}
            onDelete={(id) => {
              const next = materialCompositions.filter(mc => mc.id !== id);
              setMaterialCompositions(next);
              // 即時寫入 store
              updatePart({ ...part, materialCompositions: next });
            }}
          />
        )}
      </div>

      {/* ── 零件歷程彈窗 ──────────────────────────────────────────── */}
      {showHistory && (
        <OrderHistory
          onClose={() => setShowHistory(false)}
          entries={[...history].reverse()}
          titleLabel="零件資料歷程"
          correctionDocNo={part.material}
          correctionDocNoLabel="料號"
        />
      )}
    </>
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
  onShowHistory: () => void;
  onPrint: () => void;
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
  onShowHistory,
  onPrint,
}: InfoContentProps) {
  return (
    <div className="space-y-[24px]">
      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-[12px]">
        <div className="flex items-center gap-[16px]">
          {/* 區塊標題：Section Title 規範 */}
          <div className="h-[48px] min-h-[48px] relative shrink-0">
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            <div className="flex items-center justify-center h-full px-[4px]">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">
                基本資料設定
              </p>
            </div>
          </div>
          {part.plant === 'GTM1' && (
            <label className="flex items-center gap-[8px] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncDtcDte}
                onChange={e => setSyncDtcDte(e.target.checked)}
                className="w-[16px] h-[16px] accent-[#1890FF] cursor-pointer"
              />
              <span className="text-[14px] text-[#1c252e]">同步零件資訊(DTC、DTE)</span>
            </label>
          )}
        </div>
        <div className="flex items-center gap-[12px]">
          <p
            className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70 select-none whitespace-nowrap"
            style={{ fontVariationSettings: "'wdth' 100" }}
            onClick={onShowHistory}
          >
            歷程
          </p>
          <button
            onClick={onSave}
            className="bg-[#1890FF] text-white rounded-[8px] h-[40px] min-w-[100px] px-[20px] text-[14px] font-semibold hover:bg-[#1060c0] transition-colors"
          >
            儲存
          </button>
          <button
            onClick={onPrint}
            className="bg-[#1c252e] text-white rounded-[8px] h-[40px] min-w-[100px] px-[20px] text-[14px] font-semibold hover:bg-[#2d3a47] transition-colors"
          >
            列印報價單
          </button>
        </div>
      </div>

      {/* ── Read-only fields (中台帶入) ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-[40px] gap-y-[8px]">
        <ReadOnlyField label="廠商" value={`${part.vendorName}(${part.vendorCode})`} />
        <ReadOnlyField label="料號" value={part.material} />
        <ReadOnlyField label="採購組織" value={part.purchaseOrg} />
        <ReadOnlyField label="工廠" value={part.plant} />
        <ReadOnlyField label="長規格敘述" value={part.longDescription} />
      </div>

      {/* ── Editable fields (bordered box) ─────────────────────────────────── */}
      <div className="border border-[rgba(145,158,171,0.2)] rounded-[12px] p-[24px] space-y-[16px]">
        {/* Row 1: 日期類 + 廠商料號 */}
        <div className="grid grid-cols-4 gap-[16px]">
          <SearchField label="廠商QA計畫完成日期" value={qaCompletionDate} onChange={setQaCompletionDate} type="date" />
          <SearchField label="可送樣日" value={sampleDate} onChange={setSampleDate} type="date" />
          <SearchField label="預計首批可供貨日(出廠日)" value={firstDeliveryDate} onChange={setFirstDeliveryDate} type="date" />
          <FloatingInput label="廠商料號" value={vendorPartNo} onChange={setVendorPartNo} />
        </div>
        {/* Row 2: 重量類 + 備註 */}
        <div className="grid grid-cols-4 gap-[16px]">
          <FloatingInput label="毛重" value={grossWeight} onChange={setGrossWeight} />
          <FloatingInput label="淨重" value={netWeight} onChange={setNetWeight} />
          <DropdownSelect label="重量單位" value={weightUnit} onChange={setWeightUnit} options={WEIGHT_UNIT_OPTIONS} />
          <FloatingInput label="備註" value={remark} onChange={setRemark} />
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
// FloatingInput — 純文字浮動 label 輸入框（無搜尋 icon）
// ═══════════════════════════════════════════════════════════════════════════════

function FloatingInput({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full h-[54px]">
      {/* border overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)] transition-colors"
      />
      {/* 浮動標籤 */}
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative text-[12px] font-semibold text-[#637381]">{label}</p>
      </div>
      {/* 輸入框 */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-full rounded-[8px] px-[14px] pt-[14px] pb-[8px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 focus:ring-0"
        onFocus={e => {
          const border = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLElement;
          if (border) { border.style.borderColor = '#1890FF'; border.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.15)'; }
        }}
        onBlur={e => {
          const border = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLElement;
          if (border) { border.style.borderColor = 'rgba(145,158,171,0.2)'; border.style.boxShadow = ''; }
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Read-only field
// ═══════════════════════════════════════════════════════════════════════════════

function ReadOnlyField({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-baseline">
      <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">{label}</span>
      <span className="ml-[8px] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px]" style={{ color: valueColor ?? '#637381' }}>{value}</span>
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
  { key: 'brand' as const, label: '品牌', width: '120px', type: 'select' as const, options: BRAND_OPTIONS, storageKey: 'parts_brand_brand' },
  { key: 'unitPrice' as const, label: '採購單價', width: '100px', type: 'text' as const },
  { key: 'currency' as const, label: '幣別', width: '90px', type: 'select' as const, options: CURRENCY_OPTIONS, storageKey: 'parts_brand_currency' },
  { key: 'quoteQty' as const, label: '報價數量', width: '100px', type: 'text' as const },
  { key: 'leadTime' as const, label: 'Lead Time', width: '100px', type: 'text' as const },
  { key: 'moq' as const, label: 'MOQ', width: '90px', type: 'text' as const },
  { key: 'tradeTerms' as const, label: '國貿條件', width: '130px', type: 'select' as const, options: TRADE_TERMS_OPTIONS, storageKey: 'parts_brand_tradeTerms' },
  { key: 'tradeTermsPlace' as const, label: '國貿條件約定地點', width: '140px', type: 'text' as const },
  { key: 'quoteUnit' as const, label: '報價單位', width: '120px', type: 'select' as const, options: QUOTE_UNIT_OPTIONS, storageKey: 'parts_brand_quoteUnit' },
  { key: 'productType' as const, label: '標準品/客製品', width: '120px', type: 'select' as const, options: PRODUCT_TYPE_OPTIONS, storageKey: 'parts_brand_productType' },
];

function BrandSettingsSection({ brandSettings, onAdd, onDelete, onUpdate }: BrandSettingsSectionProps) {
  return (
    <div className="space-y-[12px]">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          {/* 區塊標題：Section Title 規範 */}
          <div className="h-[48px] min-h-[48px] relative shrink-0">
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            <div className="flex items-center justify-center h-full px-[4px]">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">
                品牌設定
              </p>
            </div>
          </div>
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
                <tr key={bs.id} className="border-t border-[rgba(145,158,171,0.08)]">
                  {BRAND_TABLE_COLUMNS.map(col => (
                    <td key={col.key} className="px-[8px] py-[6px] align-middle">
                      {col.type === 'select' ? (
                        <DropdownSelect
                          label=""
                          value={(bs as any)[col.key]}
                          onChange={v => onUpdate(bs.id, col.key as keyof BrandSetting, v)}
                          options={[{ value: '', label: '請選擇' }, ...col.options!]}
                          placeholder="請選擇"
                          searchable
                          storageKey={(col as any).storageKey}
                        />
                      ) : (
                        <div className="relative w-full h-[54px]">
                          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)]" />
                          <input
                            type="text"
                            value={(bs as any)[col.key]}
                            onChange={e => onUpdate(bs.id, col.key as keyof BrandSetting, e.target.value)}
                            className="w-full h-full rounded-[8px] px-[14px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 focus:ring-0"
                          />
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-[4px] py-[6px] align-middle">
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
// Tab 2 — 物料成分設定
// ═══════════════════════════════════════════════════════════════════════════════

interface MaterialCompositionTabProps {
  part: PartRecord;
  compositions: MaterialComposition[];
  onAdd: (mc: MaterialComposition) => void;
  onDelete: (id: number) => void;
}

type McWithSeq = MaterialComposition & { _seq: number };

function MaterialCompositionTab({ part, compositions, onAdd, onDelete }: MaterialCompositionTabProps) {
  const [showSelectOverlay, setShowSelectOverlay] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // 已選用的 ESG ID 集合（防重複新增）
  const usedEsgIds = useMemo(() => new Set(compositions.map(mc => mc.esgMaterialId)), [compositions]);

  // 帶序號的顯示資料
  const displayData: McWithSeq[] = useMemo(
    () => compositions.map((mc, i) => ({ ...mc, _seq: i + 1 })),
    [compositions],
  );

  const handleConfirmAdd = useCallback((records: EsgMaterialRecord[]) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;
    records.forEach((record, i) => {
      const newMc: MaterialComposition = {
        id: Date.now() + i,
        esgMaterialId: record.id,
        nameTw: record.nameTw,
        nameCn: record.nameCn,
        nameEn: record.nameEn,
        carbonEmission: record.carbonEmission,
        createdBy: '目前使用者',
        createdAt: dateStr,
      };
      onAdd(newMc);
    });
    toast(`已新增 ${records.length} 筆成分`);
    setShowSelectOverlay(false);
  }, [onAdd]);

  const handleDelete = useCallback((id: number) => {
    onDelete(id);
    toast('已刪除成分');
    setDeleteTargetId(null);
  }, [onDelete]);


  // 欄位定義
  // 所有來自 ESG 的欄位（材料名、碳排量）皆即時從 store 查詢，不使用快照值
  const columns: StandardColumn<McWithSeq>[] = useMemo(() => [
    { key: '_seq', label: '#', width: 52, minWidth: 44 },
    {
      key: 'nameTw',
      label: '材料名',
      width: 140,
      minWidth: 100,
      renderCell: (_val, row) => {
        const esgRecord = getEsgMaterials().find(m => m.id === row.esgMaterialId);
        return <span className="font-normal text-[14px] text-[#1c252e]">{esgRecord?.nameTw ?? row.nameTw}</span>;
      },
    },
    {
      key: 'nameCn',
      label: '材料名(簡體中文)',
      width: 180,
      minWidth: 130,
      renderCell: (_val, row) => {
        const esgRecord = getEsgMaterials().find(m => m.id === row.esgMaterialId);
        return <span className="font-normal text-[14px] text-[#1c252e]">{esgRecord?.nameCn ?? row.nameCn}</span>;
      },
    },
    {
      key: 'nameEn',
      label: '材料名(英文)',
      width: 220,
      minWidth: 150,
      renderCell: (_val, row) => {
        const esgRecord = getEsgMaterials().find(m => m.id === row.esgMaterialId);
        return <span className="font-normal text-[14px] text-[#1c252e]">{esgRecord?.nameEn ?? row.nameEn}</span>;
      },
    },
    {
      key: 'carbonEmission',
      label: '炭排量(kg CO₂e)',
      width: 140,
      minWidth: 110,
      renderCell: (_val, row) => {
        const esgRecord = getEsgMaterials().find(m => m.id === row.esgMaterialId);
        return <span className="font-normal text-[14px] text-[#1c252e]">{String(esgRecord?.carbonEmission ?? row.carbonEmission)}</span>;
      },
    },
    {
      key: 'createdBy',
      label: '更新資訊',
      width: 240,
      minWidth: 160,
      renderCell: (_val, row) => (
        <span className="font-normal text-[14px] text-[#637381] whitespace-nowrap">
          {row.updatedBy ?? row.createdBy} — {row.updatedAt ?? row.createdAt}
        </span>
      ),
    },
    {
      key: 'id',
      label: '',
      width: 60,
      minWidth: 60,
      required: true,
      renderCell: (_val, row) => (
        <DeleteButton onClick={() => setDeleteTargetId(row.id)} />
      ),
    },
  ] as StandardColumn<McWithSeq>[], []);

  // 新增按鈕
  const actionButton = (
    <button
      onClick={() => setShowSelectOverlay(true)}
      className="flex items-center gap-[6px] h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] text-white text-[14px] font-medium hover:bg-[#2d3a46] transition-colors whitespace-nowrap shrink-0"
    >
      新增
    </button>
  );

  return (
    <div className="space-y-[16px]">
      {/* 物料身份資訊 */}
      <div className="flex flex-wrap gap-x-[40px] gap-y-[4px] items-baseline">
        <ReadOnlyField label="廠商" value={`${part.vendorName}(${part.vendorCode})`} />
        <ReadOnlyField label="料號" value={part.material} valueColor="#005eb8" />
      </div>
      <div>
        <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">長規格敘述</span>
        <span className="ml-[8px] font-normal text-[14px] text-[#637381]">{part.longDescription}</span>
      </div>

      {/* 成分表格（StandardDataTable） */}
      <StandardDataTable<McWithSeq>
        columns={columns}
        data={displayData}
        storageKey="parts-composition-v1"
        showCheckbox={false}
        actionButton={actionButton}
        externalFilteredData={displayData}
        onExportCsv={() => toast('匯出 CSV 功能開發中')}
      />

      {/* 選擇材料 Overlay */}
      {showSelectOverlay && (
        <MaterialSelectOverlay
          usedEsgIds={usedEsgIds}
          onClose={() => setShowSelectOverlay(false)}
          onConfirm={handleConfirmAdd}
        />
      )}


      {/* 刪除確認 Dialog */}
      {deleteTargetId !== null && (
        <DeleteConfirmOverlay
          materialName={compositions.find(mc => mc.id === deleteTargetId)?.nameTw ?? ''}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => handleDelete(deleteTargetId)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MaterialSelectOverlay — 從 ESG 材料庫選擇成分
// ═══════════════════════════════════════════════════════════════════════════════

interface MaterialSelectOverlayProps {
  usedEsgIds: Set<number>;
  onClose: () => void;
  onConfirm: (records: EsgMaterialRecord[]) => void;
}

function MaterialSelectOverlay({ usedEsgIds, onClose, onConfirm }: MaterialSelectOverlayProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ESC 關閉
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return getEsgMaterials();
    return getEsgMaterials().filter(m =>
      m.nameTw.toLowerCase().includes(kw) ||
      m.nameCn.toLowerCase().includes(kw) ||
      m.nameEn.toLowerCase().includes(kw),
    );
  }, [search]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedRecords = useMemo(
    () => getEsgMaterials().filter(m => selectedIds.has(m.id)),
    [selectedIds],
  );

  const handleConfirm = () => {
    if (selectedRecords.length === 0) return;
    onConfirm(selectedRecords);
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="560px" maxHeight="680px">
      <div className="relative w-full h-full">
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path
              clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381"
              fillRule="evenodd"
            />
          </svg>
        </button>

        {/* 內容區 */}
        <div className="flex flex-col h-full px-[40px] pt-[58px] pb-[32px] gap-[20px]">
          {/* 標題 */}
          <div className="flex flex-col gap-[4px]">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
              選擇材料成分
            </p>
            <p className="text-[13px] text-[#637381]">來源：ESG &gt; 材料維護，請從下方清單選擇</p>
          </div>

          {/* 搜尋欄 */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)]"
            />
            <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
              <p className="relative text-[12px] font-semibold text-[#637381]">搜尋材料名</p>
            </div>
            <div className="flex items-center">
              <svg className="absolute left-[14px] text-[#919eab] mt-[6px]" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="輸入材料名搜尋..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-[8px] pl-[38px] pr-[14px] pt-[18px] pb-[8px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 focus:ring-0"
              />
            </div>
          </div>

          {/* 選擇列表 */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-[rgba(145,158,171,0.12)] rounded-[8px]">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-[32px] text-[14px] text-[#919eab]">無搜尋結果</div>
            ) : (
              filtered.map(m => {
                const isUsed = usedEsgIds.has(m.id);
                const isSelected = selectedIds.has(m.id);
                return (
                  <button
                    key={m.id}
                    disabled={isUsed}
                    onClick={() => !isUsed && toggleSelect(m.id)}
                    className={[
                      'w-full text-left px-[16px] py-[10px] border-b border-[rgba(145,158,171,0.08)] transition-colors',
                      isUsed ? 'opacity-40 cursor-not-allowed bg-transparent' :
                        isSelected ? 'bg-[#e8f4fe]' : 'hover:bg-[rgba(145,158,171,0.04)] cursor-pointer',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-[12px]">
                      {/* Checkbox */}
                      <div className={[
                        'w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors',
                        isUsed ? 'border-[#c4cdd5] bg-[#f4f6f8]' :
                          isSelected ? 'border-[#00559c] bg-[#00559c]' : 'border-[#c4cdd5] bg-white',
                      ].join(' ')}>
                        {isSelected && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-medium truncate ${isSelected ? 'text-[#00559c]' : 'text-[#1c252e]'}`}>
                          {m.nameTw}
                        </p>
                        <p className="text-[12px] text-[#637381] mt-[2px] truncate">{m.nameEn}</p>
                      </div>
                      {isUsed && (
                        <span className="text-[11px] text-[#919eab] bg-[#f4f6f8] px-[6px] py-[2px] rounded-[4px] shrink-0">已新增</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* 已選清單預覽 */}
          {selectedRecords.length > 0 && (
            <div className="bg-[#f4f8fd] rounded-[8px] px-[16px] py-[10px] border border-[rgba(0,85,156,0.12)]">
              <p className="text-[12px] font-semibold text-[#637381] mb-[8px]">已選擇 {selectedRecords.length} 筆材料</p>
              <div className="flex flex-col gap-[4px] max-h-[88px] overflow-y-auto custom-scrollbar">
                {selectedRecords.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#1c252e] truncate flex-1">{r.nameTw}</span>
                    <button
                      onClick={() => toggleSelect(r.id)}
                      className="ml-[8px] text-[#919eab] hover:text-[#d32f2f] transition-colors shrink-0"
                      title="移除"
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="currentColor" fillRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 確認按鈕 */}
          <button
            onClick={handleConfirm}
            disabled={selectedRecords.length === 0}
            className="w-full h-[36px] rounded-[8px] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#004680]"
            style={{ backgroundColor: '#00559c' }}
          >
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">
              {selectedRecords.length > 0 ? `確認新增（${selectedRecords.length} 筆）` : '確認新增'}
            </p>
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DeleteConfirmOverlay — 刪除成分確認對話框
// ═══════════════════════════════════════════════════════════════════════════════

function DeleteConfirmOverlay({
  materialName, onClose, onConfirm,
}: { materialName: string; onClose: () => void; onConfirm: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <BaseOverlay onClose={onClose} maxWidth="420px" maxHeight="280px">
      <div className="relative w-full h-full">
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path
              clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381"
              fillRule="evenodd"
            />
          </svg>
        </button>
        <div className="flex flex-col h-full px-[40px] pt-[58px] pb-[32px] gap-[20px]">
          <div>
            <p className="font-semibold text-[18px] text-[#1c252e] leading-[28px]">刪除物料成分</p>
            <p className="text-[14px] text-[#637381] mt-[8px]">
              確認刪除「<span className="font-semibold text-[#1c252e]">{materialName}</span>」？此操作無法復原。
            </p>
          </div>
          <div className="flex gap-[12px] mt-auto">
            <button
              onClick={onClose}
              className="flex-1 h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.32)] text-[14px] font-medium text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-[36px] rounded-[8px] bg-[#ff5630] text-white text-[14px] font-bold hover:bg-[#cc4020] transition-colors"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EditCompositionOverlay — 編輯物料成分（炭排量）
// ═══════════════════════════════════════════════════════════════════════════════

function EditCompositionOverlay({
  composition, onClose, onSave,
}: {
  composition: MaterialComposition;
  onClose: () => void;
  onSave: (updated: MaterialComposition) => void;
}) {
  const [carbonEmission, setCarbonEmission] = useState(String(composition.carbonEmission));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const hasError = submitted && (!carbonEmission.trim() || isNaN(Number(carbonEmission)));

  const handleSave = () => {
    setSubmitted(true);
    if (!carbonEmission.trim() || isNaN(Number(carbonEmission))) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;
    onSave({
      ...composition,
      carbonEmission: Number(carbonEmission),
      updatedBy: '目前使用者',
      updatedAt: dateStr,
    });
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="480px" maxHeight="440px">
      <div className="relative w-full h-full">
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path
              clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381"
              fillRule="evenodd"
            />
          </svg>
        </button>

        <div className="flex flex-col h-full px-[50px] pt-[58px] pb-[40px] gap-[20px]">
          {/* 標題 */}
          <div className="flex flex-col gap-[4px]">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
              編輯物料成分
            </p>
          </div>

          {/* 唯讀資訊 */}
          <div className="bg-[#f4f6f8] rounded-[8px] px-[16px] py-[12px] space-y-[4px]">
            <p className="text-[12px] text-[#637381]">材料名(繁中)：<span className="font-semibold text-[#1c252e]">{composition.nameTw}</span></p>
            <p className="text-[12px] text-[#637381]">材料名(簡中)：<span className="font-medium text-[#1c252e]">{composition.nameCn}</span></p>
            <p className="text-[12px] text-[#637381]">材料名(EN)：<span className="font-medium text-[#1c252e]">{composition.nameEn}</span></p>
          </div>

          {/* 可編輯：炭排量 */}
          <div className="relative w-full" style={{ minHeight: '54px' }}>
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
              style={{ borderColor: hasError ? '#ff5630' : 'rgba(145,158,171,0.2)' }}
            />
            <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
              <p
                className="relative shrink-0 leading-[12px]"
                style={{ fontSize: '12px', fontWeight: 600, color: hasError ? '#ff5630' : '#637381' }}
              >
                炭排量(kg CO₂e)
              </p>
            </div>
            <input
              type="text"
              className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0"
              value={carbonEmission}
              onChange={e => {
                const filtered = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                setCarbonEmission(filtered);
              }}
              onFocus={e => {
                const border = e.currentTarget.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
                if (border) { border.style.borderColor = '#1890FF'; border.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.15)'; }
              }}
              onBlur={e => {
                const border = e.currentTarget.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
                if (border) { border.style.borderColor = hasError ? '#ff5630' : 'rgba(145,158,171,0.2)'; border.style.boxShadow = ''; }
              }}
            />
            {hasError && <p className="mt-[4px] text-[12px] text-[#ff5630]">請輸入有效數字</p>}
          </div>

          {/* 儲存按鈕 */}
          <button
            onClick={handleSave}
            className="w-full h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors mt-auto"
            style={{ backgroundColor: '#00559c' }}
          >
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">儲存</p>
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}
