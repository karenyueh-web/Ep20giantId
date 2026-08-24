# ⏸ MDO 待補欄位追蹤

> 建立日期：2026-08-14
> 目的：記錄 EP 前台已有、MDO 尚未支援的欄位，待 MDO 後端補齊後串接
> **規則：每次串接 API 後必須同步更新此檔案**

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

### 基本資料（PartRecord）→ 剩餘欄位（寫入）待後端補 items update endpoint

| EP 前台欄位 | 型別 | 說明 | 狀態 |
|------------|------|------|------|
| `qaCompletionDate` | `string` | 廠商QA計畫完成日期 | ✅ 已串接 `supplier-material-introductions.qa_plan_completed_date` |
| `sampleDate` | `string` | 可送樣日 | ✅ 已串接 `supplier-material-introductions.sample_available_date` |
| `firstDeliveryDate` | `string` | 預計首批可供貨日(出貨日) | ✅ 已串接 `supplier-material-introductions.estimated_first_supply_date` |
| `vendorPartNo` | `string` | 廠商料號 | ✅ 已串接 `supplier-materials.supplier_material_no` |
| `remark` | `string` | 備註 | ✅ 已串接 `supplier-material-introductions.remark` |
| `grossWeight` | `string` | 毛重 | ⏸ 讀：`items.gross_weight` ✅ / 寫：items 無 update endpoint，待後端補 |
| `netWeight` | `string` | 淨重 | ⏸ 讀：`items.net_weight` ✅ / 寫：items 無 update endpoint，待後端補 |
| `weightUnit` | `string` | 重量單位 | ⏸ 讀：`items.weight_uom` ✅ / 寫：items 無 update endpoint，待後端補 |
| `longDescription` | `string` | 長規格敘述 | ⏸ 讀：`items.description` ✅ / 寫：items 無 update endpoint，待後端補 |
| `syncDtcDte` | `boolean` | 同步DTC/DTE checkbox | ❌ MDO 無此概念，保留 in-memory |

### MDO 補 items update endpoint 後要做的事
1. 確認 `items/commands/update`（或 `patch`）endpoint 部署
2. 更新 `src/app/api/material/items.ts` 加入 update function
3. 在 `PartsMaintenanceDetailPage.tsx` 的 `handleSave` 加入 items update 呼叫（毛重/淨重/重量單位/長規格敘述）

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

---

## 物料成分總檔（EsgMaterialSummaryPage）→ 待補欄位

| EP 前台欄位 | 對應 MDO API | 問題 | 狀態 |
|------------|-------------|------|------|
| `plant`（工廠） | `supplier-quotations.plant_code` | ✅ 已改以報價單 API 為主軸，plant_code 可直接取用 | ✅ 已串接 |
| `unitWeight`（單位重量） | `supplier-quotations.unit_weight`（未存在） | MDO supplier-quotations 目前無此欄位，需後端新增 | ❌ 待 MDO 補欄位 |

### 單位重量串接方式（MDO 補好後執行）
1. 確認 `SupplierQuotationResponseDto` 已新增 `unit_weight` 欄位
2. 更新 `src/app/api/pricing/supplierQuotations.ts` 的 `MdoSupplierQuotation` interface 加入 `unit_weight`
3. 在 `EsgMaterialSummaryPage.tsx` 的 row building 中將 `unitWeight: ''` 改為 `unitWeight: String(q.unit_weight ?? '')`

---

## 索樣單（`/api/v1/order-transaction/sample-orders`）

> 串接日期：2026-08-21

### ✅ 已完成串接

| 項目 | 說明 |
|------|------|
| GET 列表 | `fetchSampleOrders()` — 自動分頁（limit=100），mapper 轉換完成 |
| GET 詳情 | `fetchSampleOrder(id)` — 已實作，可供詳情頁使用 |
| 欄位對應 | `supplier_code/name`、`plant_code`、`material_no`、`long_description`、`supplier_material_no`、`demand_date`、`demand_qty`、`available_date`、`supplier_ship_date`、`supplier_daily_capacity` 全部 mapper 完成 |
| 列印索樣單 | `To:` 改用 `supplierName(supplierCode)`，分組 key 改 supplierCode |

### ✅ 已修復 Bug（2026-08-24）

| 項目 | 修復結果 |
|------|---------|
| `POST /commands/create` whitelist bug | ✅ 已修復，所有欄位正常通過 |
| `POST /commands/create` Prisma date cast bug | ✅ 已修復，`sampleDate`/`demandDate` 正常寫入 |
| `POST /commands/supplier-reply` Prisma date cast | ✅ 已修復，日期欄位正常寫入 |
| `revisionNo` 新增為所有 command 的 required 欄位 | ✅ 前端已同步更新，從 `mdoRevisionNo` 取得 |

### ⏸ 待 MDO 補充

| 項目 | 問題 | traceId / 說明 |
|------|------|---------------|
| **`/sample-orders/{id}/history`** | 歷程 endpoint 尚未部署，前端歷程目前為本地 mock | — |
| **物料群組欄位** | MDO `MdoSampleOrderItem` 無 `material_group`，列印索樣單該欄空白 | 需 MDO 或 SAP 補充 |
