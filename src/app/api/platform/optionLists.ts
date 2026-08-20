import { mdoList, mdoGet } from '../client';

// ── MDO Schema ────────────────────────────────────────────────────────────────

/** resolve 後的選項項目 */
export interface ResolvedOptionItem {
  code: string;       // 選項代碼（用於存值）
  label: string;      // 顯示名稱（依 appCode + lang fallback 解析）
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
}

/** resolve 後的清單 */
export interface ResolvedOptionList {
  listCode: string;
  appCode: string;
  lang: string;
  items: ResolvedOptionItem[];
}

/** 原始 OptionList 清單項目（/option-lists 查詢用） */
export interface OptionListRecord {
  id: string;
  enterprise_id: string;
  list_code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── 前台使用的 listCode 常數 ──────────────────────────────────────────────────
// resolve endpoint 說明：「listCode 取清單；依 appCode 呈現設定決定 is_visible；
//   顯示名稱 fallback：appPresentation.display_label → translation → default_label」

/** 零件資訊維護用到的所有 listCode
 * ✅ 已建立：BRAND, INCOTERM, QUOTE_UOM, WEIGHT_UOM, CUSTOMIZATION_TYPE, CURRENCY
 */
export const PARTS_LIST_CODES = {
  BRAND: 'BRAND',
  INCOTERM: 'INCOTERM',
  QUOTE_UOM: 'QUOTE_UOM',
  WEIGHT_UOM: 'WEIGHT_UOM',
  SPEC_TYPE: 'CUSTOMIZATION_TYPE',
  CURRENCY: 'CURRENCY',
} as const;

export type PartsListCode = (typeof PARTS_LIST_CODES)[keyof typeof PARTS_LIST_CODES];

// ── 前台下拉格式 ──────────────────────────────────────────────────────────────

/** DropdownSelect / DropdownMultiSelect 使用的選項格式 */
export interface DropdownOption {
  value: string;
  label: string;
}

/** 將 ResolvedOptionItem 轉成 DropdownOption（濾掉停用 + 不顯示的） */
export function toDropdownOptions(items: ResolvedOptionItem[]): DropdownOption[] {
  return items
    .filter(i => i.isActive && i.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
    .map(i => ({ value: i.code, label: i.label }));
}

/**
 * 將 INCOTERM 選項格式化為「CODE (中文說明)」格式
 * DropdownSelect 偵測到 " (" 時自動拆成兩行：
 *   上方（粗體）：英文代碼，如 EXW
 *   下方（灰色）：中文說明，如（工廠交貨）
 */
export function toIncotermOptions(items: ResolvedOptionItem[]): DropdownOption[] {
  return items
    .filter(i => i.isActive && i.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
    .map(i => ({
      value: i.code,
      label: i.label ? `${i.code} (${i.label})` : i.code,
    }));
}

/**
 * 從 label 萃取「（中文）」裡的中文部分，格式化為「CODE (中文)」兩行顯示。
 * 適用於 MDO label 包含英文前綴的清單，如 "Standard（標準品）" → 只取「標準品」。
 * 若 label 中無「（）」，直接使用完整 label。
 */
export function toChineseLabelOptions(items: ResolvedOptionItem[]): DropdownOption[] {
  return items
    .filter(i => i.isActive && i.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
    .map(i => {
      // 嘗試萃取全形括號內的中文，如 "Standard（標準品）" → "標準品"
      const match = i.label?.match(/[（(]([^）)]+)[）)]/);
      const chinesePart = match ? match[1] : i.label;
      return {
        value: i.code,
        label: chinesePart ? `${i.code} (${chinesePart})` : i.code,
      };
    });
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** 依前台應用 + 語言解析單一清單（推薦用法） */
export async function resolveOptionList(
  listCode: string,
  appCode = 'EP',
  lang = 'zh-TW',
): Promise<ResolvedOptionList> {
  return mdoGet<ResolvedOptionList>(
    `/platform-core/option-lists/resolve?listCode=${encodeURIComponent(listCode)}&appCode=${encodeURIComponent(appCode)}&lang=${encodeURIComponent(lang)}`,
  );
}

/** 一次解析多個 listCode（並行請求，失敗的 code 回傳空陣列並 warn） */
export async function resolveOptionLists(
  listCodes: string[],
  appCode = 'EP',
  lang = 'zh-TW',
): Promise<Record<string, ResolvedOptionItem[]>> {
  const results = await Promise.allSettled(
    listCodes.map(code => resolveOptionList(code, appCode, lang)),
  );
  return Object.fromEntries(
    listCodes.map((code, i) => {
      const r = results[i];
      if (r.status === 'fulfilled') return [code, r.value.items];
      console.warn(`[optionLists] ${code} 載入失敗:`, (r as PromiseRejectedResult).reason);
      return [code, [] as ResolvedOptionItem[]];
    }),
  );
}

/** 取得 option-lists 清單（管理用，需 platform_core scope） */
export async function fetchOptionLists(params?: {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}): Promise<{ data: OptionListRecord[]; total: number }> {
  const res = await mdoList<OptionListRecord>('/platform-core/option-lists', params);
  return { data: res.data, total: res.pagination?.total ?? res.data.length };
}
