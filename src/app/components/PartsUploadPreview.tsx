// ── 零件資訊上傳預覽確認 ─────────────────────────────────────────────────────
import { useMemo } from 'react';
import type { PartRecord, BrandSetting } from './partsMaintenanceData';
import {
  BRAND_OPTIONS,
  CURRENCY_OPTIONS,
  TRADE_TERMS_OPTIONS,
  QUOTE_UNIT_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
  getParts,
} from './partsMaintenanceData';

// ── 合法選項值 Set（用於快速查詢）─────────────────────────────────────────────
const VALID_BRANDS       = new Set(BRAND_OPTIONS.map(o => o.value));
const VALID_CURRENCIES   = new Set(CURRENCY_OPTIONS.map(o => o.value));
const VALID_TRADE_TERMS  = new Set(TRADE_TERMS_OPTIONS.map(o => o.value));
const VALID_QUOTE_UNITS  = new Set(QUOTE_UNIT_OPTIONS.map(o => o.value));
const VALID_PRODUCT_TYPE = new Set(PRODUCT_TYPE_OPTIONS.map(o => o.value));
const VALID_WEIGHT_UNITS = new Set(WEIGHT_UNIT_OPTIONS.map(o => o.value));

// ── 驗證結果型別 ─────────────────────────────────────────────────────────────

export interface CellError {
  field: string;
  message: string;
}

/** 每列的驗證狀態 */
export type RowStatus = 'passed' | 'noInput' | 'error';

export interface RowValidationResult {
  rowIndex: number;
  status: RowStatus;
  errors: CellError[];
  data: Record<string, string>;
}

export interface ValidationSummary {
  sheet1Results: RowValidationResult[];
  sheet2Results: RowValidationResult[];
  /** 分頁 1 統計 */
  sheet1Total: number;
  sheet1Passed: number;
  sheet1NoInput: number;
  sheet1Errors: number;
  /** 分頁 2 統計 */
  sheet2Total: number;
  sheet2Passed: number;
  sheet2NoInput: number;
  sheet2Errors: number;
  /** 全部統計 */
  totalRows: number;
  passedRows: number;
  errorRows: number;
  /** 將完成報價的不重複物料數（基本資料設定驗證正確的物料，去重後） */
  quotedMaterialCount: number;
  /** 即將被覆蓋的品牌設定料號列表 */
  overrideWarnings: string[];
}

// ── 備註列過濾 ───────────────────────────────────────────────────────────────

/** 判斷一列是否為範本備註列（非真實資料），應自動忽略 */
function isRemarkRow(row: Record<string, string>): boolean {
  const material = (row['物料'] ?? '').trim();
  if (material.startsWith('※')) return true;
  if (material.startsWith('若有')) return true;
  if (material === '') return true;
  return false;
}

// ── 日期工具 ─────────────────────────────────────────────────────────────────

/**
 * 嘗試將各種日期格式解析為 YYYYMMDD。
 * 支援: YYYYMMDD, YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD, Excel 數值日期
 * @returns 正規化後的 YYYYMMDD 字串，若無法解析回傳 null
 */
export function normalizeDateToYYYYMMDD(val: string): string | null {
  const s = val.trim();
  if (!s) return null;

  // 嘗試 YYYYMMDD（純 8 位數字）
  if (/^\d{8}$/.test(s)) {
    const y = parseInt(s.slice(0, 4), 10);
    const m = parseInt(s.slice(4, 6), 10);
    const d = parseInt(s.slice(6, 8), 10);
    if (isValidDate(y, m, d)) return s;
    return null;
  }

  // 嘗試 YYYY/MM/DD 或 YYYY-MM-DD 或 YYYY.MM.DD
  const match = s.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    if (isValidDate(y, m, d)) {
      return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
    }
    return null;
  }

  // 嘗試 Excel 序號日期（純數字，通常 > 40000）
  if (/^\d+$/.test(s) && parseInt(s, 10) > 19000101) {
    // 非 YYYYMMDD 也非序號的大數字，無法處理
    return null;
  }
  if (/^\d+$/.test(s)) {
    const serial = parseInt(s, 10);
    if (serial > 1 && serial < 100000) {
      // Excel 日期序號
      const epoch = new Date(1899, 11, 30); // Excel epoch
      const date = new Date(epoch.getTime() + serial * 86400000);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      if (y >= 2000 && y <= 2100) {
        return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
      }
    }
  }

  return null;
}

function isValidDate(y: number, m: number, d: number): boolean {
  if (y < 2000 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// ── 驗證引擎 ─────────────────────────────────────────────────────────────────

function isValidNumber(val: string): boolean {
  if (!val || val.trim() === '') return true;
  return !isNaN(Number(val)) && isFinite(Number(val));
}

function isValidOption(val: string, validSet: Set<string>): boolean {
  if (!val || val.trim() === '') return true;
  return validSet.has(val.trim());
}

export function validateUploadData(
  sheet1Data: Record<string, string>[],
  sheet2Data: Record<string, string>[],
): ValidationSummary {
  const allParts = getParts();
  const systemMap = new Map<string, PartRecord>();
  for (const p of allParts) {
    const key = `${p.material}|${p.plant}|${p.purchaseOrg}`;
    systemMap.set(key, p);
  }

  // ── 分頁 2：先過濾掉備註列 ──
  const cleanSheet2Data = sheet2Data.filter(row => !isRemarkRow(row));

  // ── 分頁 1：基本資料驗證 ──
  const sheet1Results: RowValidationResult[] = sheet1Data.map((row, i) => {
    const errors: CellError[] = [];
    const material = row['物料'] ?? '';
    const plant = row['工廠'] ?? '';
    const purchaseOrg = row['採購組織'] ?? '';
    const key = `${material}|${plant}|${purchaseOrg}`;

    // 1. 唯讀欄位篡改檢查
    const systemRecord = systemMap.get(key);
    if (!systemRecord) {
      errors.push({ field: '物料', message: '物料/工廠/採購組織與系統資料不符' });
    } else {
      const vendorDisplay = row['供應商'] ?? '';
      if (vendorDisplay && !vendorDisplay.includes(systemRecord.vendorCode)) {
        errors.push({ field: '供應商', message: '供應商資訊與系統不一致' });
      }
      const desc = row['長規格敘述'] ?? '';
      if (desc && desc !== systemRecord.longDescription) {
        errors.push({ field: '長規格敘述', message: '長規格敘述與系統不一致' });
      }
    }

    // 2. 數值格式檢查
    for (const { field, value } of [
      { field: '毛重', value: row['毛重'] },
      { field: '淨重', value: row['淨重'] },
    ]) {
      if (value && !isValidNumber(value)) {
        errors.push({ field, message: `${field}必須為數字` });
      }
    }

    // 3. 選項值合法性檢查
    if (!isValidOption(row['重量單位'] ?? '', VALID_WEIGHT_UNITS)) {
      errors.push({ field: '重量單位', message: '無效的重量單位，可選：KG, G, LB, OZ' });
    }

    // 4. 同步DTC/DTE 值檢查
    const syncVal = (row['同步DTC/DTE'] ?? '').trim().toUpperCase();
    if (syncVal && syncVal !== 'Y' && syncVal !== 'N') {
      errors.push({ field: '同步DTC/DTE', message: '必須為 Y 或 N' });
    }

    // 5. 日期格式檢查（有填才驗，自動轉換格式）
    const dateFields = [
      { field: '廠商QA認證完成日期', value: row['廠商QA認證完成日期'] },
      { field: '可配合日期',         value: row['可配合日期'] },
      { field: '首次交貨可出貨日期', value: row['首次交貨可出貨日期'] },
    ];
    for (const { field, value } of dateFields) {
      if (value && value.trim()) {
        const normalized = normalizeDateToYYYYMMDD(value);
        if (!normalized) {
          errors.push({ field, message: `日期格式錯誤` });
        } else {
          // 過去日期檢查
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const y = parseInt(normalized.slice(0, 4), 10);
          const m = parseInt(normalized.slice(4, 6), 10) - 1;
          const d = parseInt(normalized.slice(6, 8), 10);
          const inputDate = new Date(y, m, d);
          if (inputDate < today) {
            errors.push({ field, message: `日期不得填過去日期` });
          } else {
            // 自動正規化：回寫到 row 供後續匯入使用
            row[field] = normalized;
          }
        }
      }
    }

    // 6. 判定狀態：通過 vs 無輸入資料
    const qaDate     = (row['廠商QA認證完成日期'] ?? '').trim();
    const sampleDate = (row['可配合日期'] ?? '').trim();
    const delivDate  = (row['首次交貨可出貨日期'] ?? '').trim();
    const vendorPart = (row['廠商料號'] ?? '').trim();
    const hasQuoteInput = !!(qaDate || sampleDate || delivDate || vendorPart);

    // 決定狀態
    let status: RowStatus;
    if (errors.length > 0) {
      status = 'error';
    } else if (!hasQuoteInput) {
      status = 'noInput';
    } else {
      status = 'passed';
    }

    return { rowIndex: i, status, errors, data: row };
  });

  // ── 分頁 2：品牌設定驗證 ──
  const sheet1Keys = new Set(
    sheet1Data.map(r => `${r['物料'] ?? ''}|${r['工廠'] ?? ''}|${r['採購組織'] ?? ''}`)
  );
  const brandCombinations = new Set<string>();

  const sheet2Results: RowValidationResult[] = cleanSheet2Data.map((row, i) => {
    const errors: CellError[] = [];
    const material = row['物料'] ?? '';
    const plant = row['工廠'] ?? '';
    const purchaseOrg = row['採購組織'] ?? '';
    const brand = row['品牌'] ?? '';

    const key = `${material}|${plant}|${purchaseOrg}`;
    if (!sheet1Keys.has(key)) {
      errors.push({ field: '物料', message: '物料/工廠/採購組織在「基本資料設定」中找不到對應資料' });
    }

    const combo = `${material}|${plant}|${purchaseOrg}|${brand}`;
    if (brandCombinations.has(combo)) {
      errors.push({ field: '品牌', message: `同一料號的品牌「${brand}」重複` });
    } else {
      brandCombinations.add(combo);
    }

    if (!isValidOption(brand, VALID_BRANDS)) {
      errors.push({ field: '品牌', message: '無效的品牌選項' });
    }
    if (!isValidOption(row['幣別'] ?? '', VALID_CURRENCIES)) {
      errors.push({ field: '幣別', message: '無效的幣別' });
    }
    if (!isValidOption(row['國貿條件'] ?? '', VALID_TRADE_TERMS)) {
      errors.push({ field: '國貿條件', message: '無效的國貿條件' });
    }
    if (!isValidOption(row['報價單位'] ?? '', VALID_QUOTE_UNITS)) {
      errors.push({ field: '報價單位', message: '無效的報價單位' });
    }
    if (!isValidOption(row['標準品/客製品'] ?? '', VALID_PRODUCT_TYPE)) {
      errors.push({ field: '標準品/客製品', message: '無效的標準品/客製品選項' });
    }

    for (const { field, value } of [
      { field: '採購單價', value: row['採購單價'] },
      { field: '報價數量', value: row['報價數量'] },
      { field: 'Lead Time', value: row['Lead Time'] },
      { field: 'MOQ', value: row['MOQ'] },
    ]) {
      if (value && !isValidNumber(value)) {
        errors.push({ field, message: `${field}必須為數字` });
      }
    }

    // 判定品牌設定的「無輸入資料」：採購單價、報價數量、Lead Time、MOQ 全空
    const hasPricingInput = !!(
      (row['採購單價'] ?? '').trim() ||
      (row['報價數量'] ?? '').trim() ||
      (row['Lead Time'] ?? '').trim() ||
      (row['MOQ'] ?? '').trim()
    );

    let status: RowStatus;
    if (errors.length > 0) {
      status = 'error';
    } else if (!hasPricingInput) {
      status = 'noInput';
    } else {
      status = 'passed';
    }
    return { rowIndex: i, status, errors, data: row };
  });

  // ── 覆蓋提醒 ──
  const overrideWarnings: string[] = [];
  const materialsWithBrands = new Set<string>();
  for (const row of cleanSheet2Data) {
    const m = row['物料'] ?? '';
    const pl = row['工廠'] ?? '';
    const po = row['採購組織'] ?? '';
    const key = `${m}|${pl}|${po}`;
    const systemRecord = systemMap.get(key);
    if (systemRecord && systemRecord.brandSettings.length > 0) {
      if (!materialsWithBrands.has(key)) {
        materialsWithBrands.add(key);
        overrideWarnings.push(m);
      }
    }
  }

  // ── 統計 ──
  const sheet1Errors  = sheet1Results.filter(r => r.status === 'error').length;
  const sheet1NoInput = sheet1Results.filter(r => r.status === 'noInput').length;
  const sheet1Passed  = sheet1Results.filter(r => r.status === 'passed').length;
  const sheet2Errors  = sheet2Results.filter(r => r.status === 'error').length;
  const sheet2NoInput = sheet2Results.filter(r => r.status === 'noInput').length;
  const sheet2Passed  = sheet2Results.filter(r => r.status === 'passed').length;

  // 去重計算通過的物料數（以 物料+工廠+採購組織 為唯一鍵）
  const quotedMaterials = new Set<string>();
  for (const r of sheet1Results) {
    if (r.status === 'passed') {
      const key = `${r.data['物料'] ?? ''}|${r.data['工廠'] ?? ''}|${r.data['採購組織'] ?? ''}`;
      quotedMaterials.add(key);
    }
  }
  const quotedMaterialCount = quotedMaterials.size;

  return {
    sheet1Results,
    sheet2Results,
    sheet1Total: sheet1Results.length,
    sheet1Passed,
    sheet1NoInput,
    sheet1Errors,
    sheet2Total: sheet2Results.length,
    sheet2Passed,
    sheet2NoInput,
    sheet2Errors,
    totalRows: sheet1Results.length + sheet2Results.length,
    passedRows: sheet1Passed + sheet2Passed,
    errorRows: sheet1Errors + sheet2Errors,
    overrideWarnings,
    quotedMaterialCount,
  };
}

// ── 預覽 UI Props ────────────────────────────────────────────────────────────

interface PartsUploadPreviewProps {
  summary: ValidationSummary;
  onCancel: () => void;
  onConfirm: () => void;
}

// ── 預覽 UI 元件 ─────────────────────────────────────────────────────────────

export function PartsUploadPreview({ summary, onCancel, onConfirm }: PartsUploadPreviewProps) {
  const { sheet1Results, sheet2Results, overrideWarnings } = summary;
  const hasErrors = summary.errorRows > 0;
  const canConfirm = summary.quotedMaterialCount > 0;

  return (
    <div className="flex flex-col h-full gap-[16px]">

      {/* ── 將完成報價數量 ── */}
      <div className="shrink-0 flex items-center gap-[8px] px-[14px] py-[10px] rounded-[8px] bg-[rgba(0,70,128,0.06)] border border-[rgba(0,70,128,0.16)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <circle cx="12" cy="12" r="10" stroke="#004680" strokeWidth="2"/>
          <path d="M8 12l3 3 5-5" stroke="#004680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#004680]">
          將完成報價數量：{summary.quotedMaterialCount}
        </p>
      </div>

      {/* ── 覆蓋警告 ── */}
      {overrideWarnings.length > 0 && (
        <div className="shrink-0 flex items-start gap-[8px] px-[14px] py-[10px] rounded-[8px] bg-[rgba(255,171,0,0.08)] border border-[rgba(255,171,0,0.24)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[2px]">
            <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#b76e00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#b76e00]">
              以下料號的品牌設定將被覆蓋
            </p>
            <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381] mt-[2px]">
              {overrideWarnings.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* ── 預覽表格區 ── */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
        <PreviewSection
          title="基本資料設定"
          results={sheet1Results}
          total={summary.sheet1Total}
          passed={summary.sheet1Passed}
          noInput={summary.sheet1NoInput}
          errors={summary.sheet1Errors}
        />

        {sheet2Results.length > 0 && (
          <div className="mt-[20px]">
            <PreviewSection
              title="品牌設定"
              results={sheet2Results}
              total={summary.sheet2Total}
              passed={summary.sheet2Passed}
              noInput={summary.sheet2NoInput}
              errors={summary.sheet2Errors}
            />
          </div>
        )}
      </div>

      {/* ── 底部按鈕列 ── */}
      <div className="flex items-center justify-end gap-[12px] shrink-0 pt-[4px]">
        <button onClick={onCancel}
          className="h-[36px] min-w-[80px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors">
          取消
        </button>
        <button onClick={onConfirm} disabled={!canConfirm}
          className="h-[36px] min-w-[80px] px-[16px] rounded-[8px] bg-[#004680] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white hover:bg-[#003a6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          確認匯入
        </button>
      </div>
    </div>
  );
}

// ── 預覽分區元件 ─────────────────────────────────────────────────────────────

function PreviewSection({
  title, results, total, passed, errors, noInput,
}: {
  title: string;
  results: RowValidationResult[];
  total: number;
  passed: number;
  errors: number;
  noInput?: number;
}) {
  if (results.length === 0) return null;

  // 錯誤優先排序：error → passed → noInput
  const sortedResults = useMemo(() => {
    const order: Record<RowStatus, number> = { error: 0, passed: 1, noInput: 2 };
    return [...results].sort((a, b) => order[a.status] - order[b.status]);
  }, [results]);

  const headers = useMemo(() => {
    const allKeys = new Set<string>();
    for (const r of results) {
      for (const k of Object.keys(r.data)) allKeys.add(k);
    }
    return Array.from(allKeys);
  }, [results]);

  const errorFieldMap = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const r of results) {
      if (r.errors.length > 0) {
        map.set(r.rowIndex, new Set(r.errors.map(e => e.field)));
      }
    }
    return map;
  }, [results]);

  const errorMsgMap = useMemo(() => {
    const map = new Map<number, Map<string, string>>();
    for (const r of results) {
      if (r.errors.length > 0) {
        const fieldMap = new Map<string, string>();
        for (const e of r.errors) {
          fieldMap.set(e.field, e.message);
        }
        map.set(r.rowIndex, fieldMap);
      }
    }
    return map;
  }, [results]);

  return (
    <div>
      {/* 分區標題 + 統計 */}
      <div className="flex items-center gap-[12px] mb-[6px]">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">
          {title}
        </p>
        <div className="flex items-center gap-[10px]">
          <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">
            共 {total} 筆
          </span>
          <span className="inline-flex items-center gap-[4px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#118d57]">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#118d57]" />
            驗證正確 {passed}
          </span>
          {(noInput ?? 0) > 0 && (
            <span className="inline-flex items-center gap-[4px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#919eab]" />
              無輸入資料 {noInput}
            </span>
          )}
          {errors > 0 && (
            <span className="inline-flex items-center gap-[4px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#ff5630]">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#ff5630]" />
              錯誤 {errors}
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto border border-[rgba(145,158,171,0.16)] rounded-[8px]">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-[rgba(145,158,171,0.06)]">
              <th className="px-[8px] py-[6px] text-left font-semibold text-[#637381] border-b border-[rgba(145,158,171,0.12)] whitespace-nowrap sticky left-0 bg-[rgba(145,158,171,0.06)] z-[5]">
                #
              </th>
              <th className="px-[8px] py-[6px] text-left font-semibold text-[#637381] border-b border-[rgba(145,158,171,0.12)] whitespace-nowrap">
                狀態
              </th>
              {headers.map(h => (
                <th key={h} className="px-[8px] py-[6px] text-left font-semibold text-[#637381] border-b border-[rgba(145,158,171,0.12)] whitespace-nowrap">
                  {h}
                </th>
              ))}
              {/* 錯誤訊息欄 */}
              <th className="px-[8px] py-[6px] text-left font-semibold text-[#ff5630] border-b border-[rgba(145,158,171,0.12)] whitespace-nowrap min-w-[180px]">
                錯誤訊息
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map(row => {
              const rowErrorFields = errorFieldMap.get(row.rowIndex);
              const rowErrorMsgs = errorMsgMap.get(row.rowIndex);

              // 列背景色
              const rowBg = row.status === 'error'
                ? 'bg-[rgba(255,86,48,0.04)]'
                : row.status === 'noInput'
                  ? 'bg-white'
                  : 'bg-[rgba(17,141,87,0.02)]';

              return (
                <tr
                  key={row.rowIndex}
                  className={`border-b border-[rgba(145,158,171,0.08)] ${rowBg} hover:bg-[rgba(145,158,171,0.06)] transition-colors`}
                >
                  {/* # */}
                  <td className="px-[8px] py-[5px] text-[#919eab] whitespace-nowrap sticky left-0 bg-inherit z-[5]">
                    {row.rowIndex + 1}
                  </td>
                  {/* 狀態 — 純 icon */}
                  <td className="px-[8px] py-[5px] whitespace-nowrap text-center">
                    {row.status === 'error' ? (
                      <span title={row.errors.map(e => e.message).join('\n')} className="inline-flex items-center justify-center cursor-help">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#ff5630" strokeWidth="2"/>
                          <path d="M15 9l-6 6M9 9l6 6" stroke="#ff5630" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </span>
                    ) : row.status === 'noInput' ? (
                      <span title="無輸入資料" className="inline-flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#ffab00" opacity="0.2"/>
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ffab00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 9v4M12 16.5h.01" stroke="#ffab00" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </span>
                    ) : (
                      <span title="驗證正確" className="inline-flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#118d57" strokeWidth="2"/>
                          <path d="M8 12l3 3 5-5" stroke="#118d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </td>
                  {/* 資料欄位 */}
                  {headers.map(h => {
                    const isErrorCell = rowErrorFields?.has(h);
                    const errMsg = rowErrorMsgs?.get(h);
                    return (
                      <td
                        key={h}
                        className={`px-[8px] py-[5px] whitespace-nowrap max-w-[200px] truncate ${
                          isErrorCell ? 'text-[#ff5630]' : 'text-[#1c252e]'
                        }`}
                      >
                        {row.data[h] || '\u2014'}
                      </td>
                    );
                  })}
                  {/* 錯誤訊息欄 */}
                  <td className="px-[8px] py-[5px] min-w-[180px]">
                    {row.errors.length > 0 ? (
                      <span className="text-[#ff5630] text-[12px] leading-[18px] whitespace-pre-wrap">
                        {row.errors.map(e => e.message).join('\n')}
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
