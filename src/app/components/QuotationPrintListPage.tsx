'use client';

/**
 * QuotationPrintListPage — 列印報價單功能列表頁
 *
 * 功能：
 * - 展開所有已報價物料 × 品牌設定，每筆品牌設定 = 一筆列表資料（共 15 個欄位）
 * - 搜尋：公司（search 下拉）、採購組織（search 下拉）、料號（關鍵字輸入）
 * - 多選後點「產生報價單」 → 跳轉報價單列印畫面
 */

import { useState, useMemo, useCallback } from 'react';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import { BaseOverlay } from './BaseOverlay';
import QuotationPrintPage from './QuotationPrintPage';
import {
  getParts,
  PURCHASE_ORG_OPTIONS,
  type PartRecord,
} from './partsMaintenanceData';
import { MOCK_VENDORS } from './VendorManagementTable';

// ── 展開後的列資料型別（需有 id: number 供 StandardDataTable 使用）───────────
interface QuoteFlatRow {
  /** 數字 id：供 StandardDataTable 識別用（= rowIndex） */
  id: number;
  // 基本資料欄位
  vendorCode: string;
  vendorDisplay: string;
  material: string;
  purchaseOrg: string;
  plant: string;
  longDescription: string;
  // 品牌設定欄位
  brand: string;
  unitPrice: string;
  currency: string;
  quoteQty: string;
  leadTime: string;
  moq: string;
  tradeTerms: string;
  tradeTermsPlace: string;
  quoteUnit: string;
  productType: string;
  // 原始引用（供產生報價單使用）
  _partId: number;
  _brandId: number;
}

// ── 公司下拉選項（從 MOCK_VENDORS 建立，含空值「全部」）──────────────────────
const COMPANY_OPTIONS = [
  { value: '', label: '全部' },
  ...MOCK_VENDORS.map((v) => ({
    value: v.code,
    label: `${v.name}(${v.code})`,
  })),
];

// ── 主元件 ────────────────────────────────────────────────────────────────────
interface QuotationPrintListPageProps {
  userRole?: string;
}

export default function QuotationPrintListPage({ userRole: _userRole }: QuotationPrintListPageProps) {
  // ── Alert 彈窗狀態 ─────────────────────────────────────────────────────
  const [showVendorAlert, setShowVendorAlert] = useState(false);

  // ── 篩選 state ───────────────────────────────────────────────────────────────
  const [filterCompany, setFilterCompany] = useState('');
  const [filterPurchaseOrg, setFilterPurchaseOrg] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');

  // ── 選取 state（受控模式，Set<number>）───────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ── 報價單列印模式 ─────────────────────────────────────────────────────────
  const [printMode, setPrintMode] = useState(false);
  const [printParts, setPrintParts] = useState<PartRecord[]>([]);
  const [printSelectedBrandIds, setPrintSelectedBrandIds] = useState<Set<number>>(new Set());

  // ── 展開資料：PartRecord × BrandSetting → QuoteFlatRow[]（含 id 序號）─────
  const allFlatRows = useMemo<QuoteFlatRow[]>(() => {
    const parts = getParts();
    let idx = 0;
    return parts
      .filter((p) => p.brandSettings.length > 0)
      .flatMap((p) =>
        p.brandSettings.map((bs) => ({
          id: ++idx,
          // 基本資料
          vendorCode: p.vendorCode,
          vendorDisplay: `${p.vendorName}(${p.vendorCode})`,
          material: p.material,
          purchaseOrg: p.purchaseOrg,
          plant: p.plant,
          longDescription: p.longDescription,
          // 品牌設定
          brand: bs.brand,
          unitPrice: bs.unitPrice,
          currency: bs.currency,
          quoteQty: bs.quoteQty,
          leadTime: bs.leadTime,
          moq: bs.moq,
          tradeTerms: bs.tradeTerms,
          tradeTermsPlace: bs.tradeTermsPlace,
          quoteUnit: bs.quoteUnit,
          productType: bs.productType,
          // 原始引用
          _partId: p.id,
          _brandId: bs.id,
        }))
      );
  }, []);

  // ── 套用篩選 ─────────────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let data = allFlatRows;
    if (filterCompany.trim()) {
      const kw = filterCompany.trim().toLowerCase();
      data = data.filter((r) =>
        r.vendorDisplay.toLowerCase().includes(kw) || r.vendorCode.toLowerCase().includes(kw)
      );
    }
    if (filterPurchaseOrg) {
      data = data.filter((r) => r.purchaseOrg === filterPurchaseOrg);
    }
    if (filterMaterial.trim()) {
      const kw = filterMaterial.trim().toLowerCase();
      data = data.filter((r) => r.material.toLowerCase().includes(kw));
    }
    return data;
  }, [allFlatRows, filterCompany, filterPurchaseOrg, filterMaterial]);

  // ── 選取處理（對應 StandardDataTable 的 onToggleRow / onToggleAll）────────
  const handleToggleRow = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((ids: number[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  // ── 產生報價單 ───────────────────────────────────────────────────────────────
  const handleGenerateQuotation = useCallback(() => {
    const selectedRows = allFlatRows.filter((r) => selectedIds.has(r.id));

    // 驗證：必須同一家廠商
    const uniqueVendors = new Set(selectedRows.map((r) => r.vendorCode));
    if (uniqueVendors.size > 1) {
      setShowVendorAlert(true);
      return;
    }

    const partIds = [...new Set(selectedRows.map((r) => r._partId))];
    const parts = getParts().filter((p) => partIds.includes(p.id));
    const brandIds = new Set(selectedRows.map((r) => r._brandId));
    setPrintParts(parts);
    setPrintSelectedBrandIds(brandIds);
    setPrintMode(true);
  }, [allFlatRows, selectedIds]);

  // ── 報價單列印畫面 ────────────────────────────────────────────────────────
  if (printMode) {
    return (
      <QuotationPrintPage
        parts={printParts}
        selectedBrandIds={printSelectedBrandIds}
        onBack={() => setPrintMode(false)}
      />
    );
  }

  // ── 欄位定義（15 欄，平均欄寬 150px）────────────────────────────
  const columns: StandardColumn<QuoteFlatRow>[] = [
    { key: 'material',        label: '料號',                width: 150, minWidth: 100 },
    { key: 'vendorDisplay',   label: '廠商(編號)',          width: 150, minWidth: 100 },
    { key: 'purchaseOrg',     label: '採購組織',            width: 150, minWidth: 100 },
    { key: 'plant',           label: '工廠',                width: 150, minWidth: 100 },
    { key: 'longDescription', label: '長規格敘述',          width: 150, minWidth: 100 },
    { key: 'brand',           label: '品牌',                width: 150, minWidth: 100 },
    { key: 'unitPrice',       label: '採購單價',            width: 150, minWidth: 100 },
    { key: 'currency',        label: '幣別',                width: 150, minWidth: 100 },
    { key: 'quoteQty',        label: '報價數量',            width: 150, minWidth: 100 },
    { key: 'leadTime',        label: 'Lead Time',           width: 150, minWidth: 100 },
    { key: 'moq',             label: 'MOQ',                 width: 150, minWidth: 100 },
    { key: 'tradeTerms',      label: '訂貨條件',            width: 150, minWidth: 100 },
    { key: 'tradeTermsPlace', label: '訂貨條件約定地點',    width: 150, minWidth: 100 },
    { key: 'quoteUnit',       label: '報價單位',            width: 150, minWidth: 100 },
    { key: 'productType',     label: '標準品/客製品',       width: 150, minWidth: 100 },
  ];

  // ── batchActions：傳給 StandardDataTable 內建選取工具列 ──────────────────────
  const batchActions = (
    <span
      onClick={handleGenerateQuotation}
      className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
    >
      列印報價單
    </span>
  );

  // ── 渲染 ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列 ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <div className="flex-1 min-w-0">
          <SearchField
            label="料號"
            value={filterMaterial}
            onChange={setFilterMaterial}
            type="search"
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="廠商"
            value={filterCompany}
            onChange={setFilterCompany}
            type="search"
          />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="採購組織"
            value={filterPurchaseOrg}
            onChange={setFilterPurchaseOrg}
            options={PURCHASE_ORG_OPTIONS}
            searchable
          />
        </div>
      </div>

      {/* ── StandardDataTable（15 欄 + batchActions）── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<QuoteFlatRow>
          columns={columns}
          data={filteredRows}
          storageKey="quotation-print-list-v2"
          showCheckbox
          externalFilteredData={filteredRows}
          selectedIds={selectedIds}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
          batchActions={batchActions}
          onExportCsv={() => {}}
          className="rounded-none shadow-none"
        />
      </div>

      {/* ── 廠商不一致 Alert 彈窗 ── */}
      {showVendorAlert && (
        <BaseOverlay onClose={() => setShowVendorAlert(false)} maxWidth="480px" maxHeight="280px">
          {/* 頂部警示列 */}
          <div className="shrink-0 flex items-center gap-[12px] pl-[4px] pr-[16px] py-[4px] border-b border-[rgba(145,158,171,0.12)]">
            <div className="flex items-center justify-center rounded-[12px] shrink-0 size-[48px] bg-[rgba(255,86,48,0.08)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#FF5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e]">
              無法列印報價單
            </p>
            <button
              onClick={() => setShowVendorAlert(false)}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* 說明文字 */}
          <div className="flex-1 flex items-center px-[24px] py-[20px]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] leading-[22px]">
              已選取的資料包含多家廠商，列印報價單必須選取<strong className="text-[#1c252e]"> 同一家廠商 </strong>的資料。
            </p>
          </div>

          {/* 底部確認按鈕 */}
          <div className="shrink-0 flex items-center justify-end px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.12)] bg-[rgba(255,86,48,0.04)]">
            <button
              onClick={() => setShowVendorAlert(false)}
              className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors"
            >
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white leading-none">確認</span>
            </button>
          </div>
        </BaseOverlay>
      )}
    </div>
  );
}
