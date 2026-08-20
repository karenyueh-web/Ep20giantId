# ⏸ MDO 待補欄位追蹤

> 建立日期：2026-08-14
> 目的：記錄 EP 前台已有、MDO 尚未支援的欄位，待 MDO 後端補齊後串接

---

## 廠商聯絡人（`/api/v1/product-master/supplier-contacts`）

目前 `UpsertSupplierContactDto` 缺少以下 EP 特有欄位：

| EP 前台欄位 | 型別 | 說明 | 暫時處理方式 |
|------------|------|------|------------|
| `purchaseOrg` | `string` | 採購組織（頓號分隔，如 `1101、1013`） | localStorage（key: `vendor_contacts_list`）|
| `emailEnabled` | `boolean` | 是否寄送通知信件 | localStorage |
| `remark` | `string` | 備註 | localStorage |

### 等 MDO 補上後要做的事
1. 在 `UpsertSupplierContactDto` 加入這 3 個欄位
2. 更新 `src/app/api/supplier/supplierContacts.ts` 的 interface
3. 更新 `VendorContactsForm.tsx` 移除 localStorage fallback，改為完整 API 寫入

---

## 廠商主檔（`/api/v1/product-master/suppliers`）

目前已全部對齊，無待補欄位。✅

---

## 業務帳號（`/api/v1/vendor-account`）

整個模組 MDO 尚未部署，完全使用 localStorage：

| EP 前台欄位 | 型別 | 說明 |
|------------|------|------|
| `email` | `string` | 業務登入 Email |
| `name` | `string` | 業務人員姓名 |
| `role` | `string` | 單一角色（業務/品保/開發）|
| `purchaseOrg` | `string` | 採購組織 |
| `purchaseGroup` | `string` | 採購群組 |
| `status` | `'active' \| 'inactive'` | 啟用狀態 |

等 MDO 部署 vendor-account 相關 endpoint 後再串接。

---

## 廠商帳號審核（ReviewVendorAccount）

整個模組 MDO 尚未部署，目前使用 mock data：

| 狀態 | 審核流程 |
|------|---------|
| SS（初審成功）| 核准 → 需呼叫 `ReviewVendorAccount` command（未部署）|
| FF（初審失敗）| 退回 → 需呼叫 `ReviewVendorAccount` command（未部署）|

---

## 物料資訊維護（`/api/v1/product-master/items` + `/api/v1/pricing/supplier-quotations`）

### 品牌設定（BrandSetting）→ 已全部串接 ✅
使用 `pricing/supplier-quotations` 完整支援所有欄位。

### 基本資料（PartRecord）→ 待補 6 個欄位

| EP 前台欄位 | 型別 | 說明 | 暫時處理方式 |
|------------|------|------|------------|
| `qaCompletionDate` | `string` | 廠商QA計畫完成日期 | in-memory store（MOCK_PARTS）|
| `sampleDate` | `string` | 可送樣日 | in-memory store |
| `firstDeliveryDate` | `string` | 預計首批可供貨日(出貨日) | in-memory store |
| `vendorPartNo` | `string` | 廠商料號（當前料號）| in-memory store |
| `remark` | `string` | 備註 | in-memory store |
| `syncDtcDte` | `boolean` | 同步DTC/DTE checkbox | in-memory store |

### MDO 補欄位後要做的事
1. 在 `ItemResponseDto` 或新的 DTO 加入上述 6 個欄位
2. 更新 `src/app/api/material/items.ts` 的 `MdoItem` interface
3. 更新 `PartsMaintenanceDetailPage.tsx` 的 `handleSave`，改為呼叫 item update command
4. 移除 in-memory store 的 fallback

---

## Option Lists 多語言設定（`/api/v1/platform-core/option-lists`）

### ⚠️ 待後端修正：EP appPresentation.display_label 不支援語言切換

**問題根因**：resolve endpoint 優先使用 `appPresentation.display_label`（不分語言），
只要該欄位有值，`lang` 參數就完全無效，未來切英文模式也不會顯示英文。

**各 listCode 現況**：

| listCode | 受影響的 code | 現在 EP display_label | 正確做法 |
|----------|-------------|----------------------|---------|
| `INCOTERM` | CIF / EXW / FOB / FOR 全部 | `Ex Works（工廠交貨）` 等 | 清空 display_label + 補 zh-TW translation |
| `CUSTOMIZATION_TYPE` | STANDARD / CUSTOM | `Standard（標準品）` 等 | 清空 display_label + 補 zh-TW translation |
| `WEIGHT_UOM` | OZ | `OZ` | 清空 display_label（其餘 G / KG / TON 已正常）|
| `BRAND` | — | 無設定 | ✅ 已正常 |
| `QUOTE_UOM` | — | 無設定 | ✅ 已正常 |

**修正方式（每個受影響的 option item）**：
1. 清空 EP `appPresentation.display_label`
2. 補 `translations[lang=zh-TW].name` = 中文名稱（如 `工廠交貨`、`標準品`）
3. 確認 `translations[lang=en].name` 已存在英文名稱（大多已有）

修正後前端只需傳不同 `lang` 即可切換，完全不需改程式碼。

> 前端 workaround 現況：
> - `INCOTERM` / `QUOTE_UOM` / `WEIGHT_UOM`：`toIncotermOptions()`（因 resolve 直接回傳中文 default_label，顯示正確但 INCOTERM 帶英文全寫）
> - `CUSTOMIZATION_TYPE`：`toChineseLabelOptions()`（萃取括號內中文）
> - 待後端修正後可統一改回 `toDropdownOptions()`，並移除兩個 workaround 函式

### ✅ 已建立的 listCode

所有 listCode 均已建立並串接完成：BRAND / INCOTERM / QUOTE_UOM / WEIGHT_UOM / CUSTOMIZATION_TYPE / CURRENCY

