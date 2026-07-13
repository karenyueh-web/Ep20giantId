# 巨大機械 Middle Platform — 前台專案 GAP 分析報告

> **產出日期**：2026-07-09  
> **比對來源**：
> - [giant-mdo-platform-design-guideline.md](file:///c:/Users/G00106917/Desktop/Ep2-giantId/mdo/giant-mdo-platform-design-guideline.md)（MDO 設計指南）
> - [giant-mdo-data-object-design.md](file:///c:/Users/G00106917/Desktop/Ep2-giantId/mdo/giant-mdo-data-object-design.md)（資料物件設計文件）
> - `src/app/` 前台專案程式碼（含共用主檔 / 訂單管理欄位定義 `.md`）

---

## 目錄

1. [執行摘要](#1-執行摘要)
2. [已涵蓋的 Object Types 對照](#2-已涵蓋的-object-types-對照)
3. [未涵蓋的 Object Types（缺口）](#3-未涵蓋的-object-types缺口)
4. [欄位級 GAP 分析](#4-欄位級-gap-分析)
5. [命名規範 GAP](#5-命名規範-gap)
6. [設計原則 GAP（架構層）](#6-設計原則-gap架構層)
7. [GAP 彙總表](#7-gap-彙總表)
8. [建議行動方案](#8-建議行動方案)

---

## 1. 執行摘要

本報告將前台專案 `src/app/` 的所有欄位規格（含 TypeScript 介面、mock data、欄位定義 `.md` 文件）與 MDO 設計指南及資料物件設計文件進行逐項比對，共發現 **7 大類 GAP**：

| GAP 類別 | 數量 | 嚴重度 |
|----------|:----:|:------:|
| 🔴 缺少 MDO 必要欄位（enterpriseId / ERP 同步欄位） | 26 處 | 高 |
| 🔴 未對應的 Object Types（前台有、MDO 無設計） | 14 個 | 高 |
| 🟡 欄位命名不一致 | 18 處 | 中 |
| 🟡 前台自建資料定義 vs MDO canonical 概念衝突 | 8 處 | 中 |
| 🟡 缺少 Link Type 語意關聯 | 12 處 | 中 |
| 🟢 前台多出但不違反指引的 UI 專用欄位 | 多處 | 低 |
| 🟢 型別差異（可 additive 修正） | 6 處 | 低 |

---

## 2. 已涵蓋的 Object Types 對照

以下表格比對 MDO 資料物件設計（26 個 Object Types）與前台專案的對應情況：

### 2.1 有對應的 Object Types

| MDO Object Type | 前台對應模組/介面 | 對應程度 | 說明 |
|----------------|-----------------|:--------:|------|
| `Currency` | `CurrencySelect`, `currencyData.ts` | ⚠️ 部分 | 前台有 214 筆幣別但結構不同（見 §4.1） |
| `ExchangeRate` | `OrderDetail.exchangeRate` 欄位 | ⚠️ 部分 | 僅作為訂單內嵌欄位，未獨立 Object |
| `Item` | `PartRecord`, `partsMaintenanceData.ts` | ⚠️ 部分 | 前台用 `material` / `partNo`，命名不一致 |
| `ItemPlantContext` | `PartRecord.plant` + `purchaseOrg` | ⚠️ 部分 | 未拆為獨立 Context Object |
| `Supplier` | `VendorDetail`, `VendorManagementTable` | ⚠️ 部分 | 前台稱 Vendor 而非 Supplier，欄位差異大 |
| `Organization` | `ORG_TO_COMPANY` 映射 | ⚠️ 部分 | 僅作為靜態映射，無完整 Object |
| `Employee` | `EmployeeAccountSettingPage` | ❌ 極少 | 僅帳號管理，無 MDO 定義的員工域欄位 |
| `CostCenter` | ❌ 無 | ❌ 無 | 前台完全未使用 |
| `EmployeeDetail` ~ `WorkAttribute` | ❌ 無 | ❌ 無 | HR 域完全未涵蓋 |

### 2.2 MDO 定義但前台完全未涵蓋的 Object Types（共 18 個）

| MDO Object Type | 類別 | 說明 |
|----------------|------|------|
| `CostCenter` | Master | 成本中心 — 前台無此功能 |
| `ExchangeRateHistory` | Event | 匯率歷史 — 前台無此功能 |
| `SupplierSourceKey` | Relationship | 供應商系統鍵對應 — 前台無此功能 |
| `EmployeeDetail` | Child | HR 子物件 |
| `EmployeeAttribute` | Child | HR 子物件 |
| `EmployeePrivacy` | Child (PII) | HR 子物件 |
| `EmployeeBank` | Child (PII) | HR 子物件 |
| `EmergencyContact` | Child | HR 子物件 |
| `EmployeeAttendance` | Transaction | HR 出勤 |
| `EmployeeIdMapping` | Child | HR 系統鍵 |
| `Position` (work_m) | Child | HR 職務 |
| `WorkAttribute` | Child | HR 職務屬性 |
| `WorkPerformance` | Transaction | HR 績效 |
| `SalaryProfile` | Relationship | HR 薪資檔 |
| `SalaryDetail` | Configuration | HR 薪資明細 |
| `Bonus` | Transaction | HR 獎金 |
| `BonusAttribute` | Configuration | HR 獎金屬性 |
| `EmployeeOrgAssignment` | Relationship | HR 組織指派 |
| `CompensationMapping` | Relationship | HR 薪酬對照 |

> [!NOTE]
> HR Workforce 域的 18 個 Object Types 完全未在前台專案中涵蓋。這可能是前台系統範圍設定（前台是供應商/訂單管理平台），但若 MDO 規劃中這些功能需在此系統呈現，則為重大缺口。

---

## 3. 未涵蓋的 Object Types（缺口）

以下為**前台專案已有但 MDO 設計文件未定義**的業務物件，代表前台自行建立了 MDO 尚未納入的 Object Types：

| 前台 Object | 前台介面/模組 | 類別推斷 | MDO 缺口類型 |
|-------------|-------------|---------|-------------|
| **Order** (訂單) | `OrderRow`, `OrderDetail`, `OrderCsvManager` | Transaction (Aggregate Root) | 🔴 MDO 未設計 |
| **OrderLineItem** (訂單行項目) | `OrderLineItem`, `ScheduleLine` | Child / Relationship | 🔴 MDO 未設計 |
| **Shipment** (出貨單) | `ShipmentData`, `ShipmentLineItem` | Transaction | 🔴 MDO 未設計 |
| **Invoice** (發票) | `InvoiceRecord`, `InvoiceDetailRow` | Transaction | 🔴 MDO 未設計 |
| **Correction** (折讓單) | `CorrectionOrder`, `CorrectionListWithTabs` | Transaction | 🔴 MDO 未設計 |
| **SampleOrder** (索樣單) | `SampleOrderRecord` | Transaction | 🔴 MDO 未設計 |
| **ExchangeOrder** (換貨單) | `ExchangeOrderItem` | Transaction | 🔴 MDO 未設計 |
| **ReturnOrder** (退貨單) | `ReturnOrderItem` | Transaction | 🔴 MDO 未設計 |
| **ForecastOrder** (預測訂單) | `ForecastOrder` | Transaction | 🔴 MDO 未設計 |
| **ScheduleChange** (交期變更) | `ScheduleRow`, `ScheduleChange` | Transaction | 🔴 MDO 未設計 |
| **QualityAbnormal** (品質異常) | `QualityAbnormalPage` | Transaction | 🔴 MDO 未設計 |
| **Contact** (聯絡人) | `ContactDetailOverlay`, `VendorContactsForm` | Master (Child of Vendor) | 🔴 MDO 未設計 |
| **VendorEvaluation** (供應商評鑑) | `VendorEvaluationPage` | Transaction / Configuration | 🔴 MDO 未設計 |
| **EsgMaterial** (ESG 材料) | `EsgMaterialRecord`, `MaterialComposition` | Master / Configuration | 🔴 MDO 未設計 |

> [!IMPORTANT]
> **前台專案的核心業務流程（訂單 → 出貨 → 發票 → 折讓）在 MDO 資料物件設計中完全未被定義。** 這是最大的 GAP —— MDO 設計文件僅涵蓋底層基礎服務域（Cost Center / Exchange Rate / Material / Supplier / Employee），而前台系統所需的上層業務交易域尚未設計。

---

## 4. 欄位級 GAP 分析

### 4.1 Currency（幣別）

| GAP | MDO 設計 | 前台實作 | 嚴重度 |
|-----|---------|---------|:------:|
| 欄位名不同 | `currency_code` | `code` / `isoCode` | 🟡 |
| 欄位名不同 | `name` | `shortName` / `fullName` | 🟡 |
| 缺少欄位 | `minor_unit` (number) | `decimalPlaces` (名稱不同但概念相同) | 🟢 |
| 多出欄位 | — | `symbol`, `label` | 🟢 UI 專用 |
| 缺少欄位 | `status` (active/inactive) | 前台無此欄位 | 🟡 |
| 前台有額外欄位 | — | `exchangeRateTWD` | 🟡 應由 ExchangeRate Function 提供 |

### 4.2 Item / Material（物料）

| GAP | MDO 設計 (`Item`) | 前台實作 (`PartRecord` / `Material`) | 嚴重度 |
|-----|---------|---------|:------:|
| 🔴 **命名根本不同** | `Item` + `material_no` | `PartRecord` + `material` 或 `partNo` | 🔴 |
| 缺少 `enterpriseId` | ✓ 必填 | ❌ 完全無 | 🔴 |
| 缺少 ERP 同步欄位 | `erpStatus`, `erpReferenceNumber`, `erpSyncAt`, `erpLastError` | ❌ 完全無 | 🔴 |
| 缺少 `material_type` | ✓ SAP 物料類型 | ❌ 無 | 🟡 |
| 缺少 `material_group_no` / `material_group_description` | ✓ | ❌ 無 | 🟡 |
| 缺少 `material_inventory_unit` / `material_base_unit` | ✓ | ❌ 無 | 🟡 |
| 缺少 `material_hierarchy` | ✓ 產品階層 | ❌ 無 | 🟡 |
| 缺少 `model_name` | ✓ 車型 | 前台有 `modelName`（但在不同位置） | 🟢 |
| 缺少 `is_giip` | ✓ | ❌ 無 | 🟢 |
| 缺少 `authorization_group` | ✓ | ❌ 無 | 🟡 |
| 缺少 `old_material_no` | ✓ 舊料號 | ❌ 無 | 🟡 |
| 缺少 `cross_plant_material_status` | ✓ 跨廠物料狀態 | `status` (active/inactive/discontinued) — 語意不同 | 🟡 |
| 缺少 `net_weight` / `gross_weight` / `volume` 的 MDO 標準結構 | ✓ | 前台有 `grossWeight`, `netWeight` 但為 string 非 number | 🟡 |
| 前台多出欄位 | — | `qaCompletionDate`, `sampleDate`, `firstDeliveryDate`, `syncDtcDte`, `brandSettings[]`, `materialCompositions[]`, `quoteStatus`, `notifyStatus` | 🟡 需評估是否納入 MDO |

### 4.3 ItemPlantContext（物料廠別 context）

| GAP | MDO 設計 | 前台實作 | 嚴重度 |
|-----|---------|---------|:------:|
| 🔴 **未獨立建模** | 獨立 Object Type | 僅為 `PartRecord` 的 `plant` + `purchaseOrg` 欄位 | 🔴 |
| 缺少 `plant_material_status` | ✓ | ❌ 無 | 🟡 |
| 缺少 `is_purchase` | ✓ | ❌ 無 | 🟡 |
| 缺少 `commodity_code` | ✓ | ❌ 無 | 🟡 |
| 缺少 `country_of_origin` | ✓ | 前台有 `countryOfOrigin`（在 PartRecord 層而非 context 層） | 🟡 |
| 缺少 `procurement_type` / `special_procurement_type` | ✓ | ❌ 無 | 🟡 |
| 缺少 `effectiveFrom` / `effectiveTo` | ✓ (MDO 新增) | ❌ 無 | 🟡 |

### 4.4 Supplier / Vendor（供應商）

| GAP | MDO 設計 (`Supplier`) | 前台實作 (`Vendor`) | 嚴重度 |
|-----|---------|---------|:------:|
| 🔴 **名稱不一致** | `Supplier` | `Vendor` | 🔴 canonical 名稱衝突 |
| 缺少 `enterpriseId` | ✓ 必填 | ❌ 完全無 | 🔴 |
| 缺少 ERP 同步欄位 | `erpStatus`, `erpReferenceNumber`, `erpSyncAt`, `erpLastError` | ❌ 完全無 | 🔴 |
| 欄位對應差異 | `business_partner_no` | 前台無此欄位 | 🔴 |
| 欄位對應差異 | `gcm_code/gck_code/gev_code/gct_code/gtm_code` | 前台無此欄位（6碼查詢鍵） | 🟡 |
| 欄位對應差異 | `brief_chinese/brief_english/fullname_chinese/fullname_english` | 前台用 `companyName` 單欄 | 🟡 |
| 前台多出的欄位 | — | `paymentTerms`, `shipmentTerms`, `shippingMethod`, `taxId`, `invoiceName`, `invoiceAddress`, `shippingAddress`, `contactPerson`, `contactEmail`, `contactPhone`, `salesEmployee`, `vendorCategory` | 🟡 需評估 |
| MDO 的 `SupplierSourceKey` 子物件 | ✓ (`plm_key`, `erp_key`) | ❌ 前台完全無 | 🟡 |

### 4.5 Organization（組織）

| GAP | MDO 設計 | 前台實作 | 嚴重度 |
|-----|---------|---------|:------:|
| 🔴 **未獨立建模** | 完整階層 Object Type（14 欄位 + Links） | 僅 `ORG_TO_COMPANY` 靜態映射 + `purchaseOrg` 欄位 | 🔴 |
| 缺少完整欄位 | `id`, `company_code`, `company_name`, `name`, `sub_type_id`, `hr_partner`, `inactive`, `cost_center_id`, `manager_id`, `pid`, `workday_id`, `start_date`, `end_date` | 僅 `orgCode`, `orgName`, `companyCode`, `companyName` | 🟡 |
| 缺少階層關聯 | `parentOrg → Organization` (self-reference) | ❌ 無 | 🔴 |
| 缺少管理者關聯 | `managedBy → Employee` | ❌ 無 | 🟡 |

### 4.6 ExchangeRate（匯率）

| GAP | MDO 設計 | 前台實作 | 嚴重度 |
|-----|---------|---------|:------:|
| 🔴 **未獨立建模** | 獨立 Object Type（7 欄位） | 僅為 `OrderDetail.exchangeRate` 單一 number 欄位 | 🔴 |
| 缺少 `from_currency_code` / `to_currency_code` | ✓ | 僅有匯率值，無幣別對 | 🔴 |
| 缺少 `exchange_type` | ✓ (`MONTH_AVERAGE_RATE` etc.) | ❌ 無 | 🟡 |
| 缺少 `ExchangeRateHistory` | ✓ (append-only 歷史) | ❌ 無 | 🟡 |

### 4.7 Employee（員工）

| GAP | MDO 設計 | 前台實作 | 嚴重度 |
|-----|---------|---------|:------:|
| 🔴 **幾乎未對應** | Aggregate Root + 8 子物件 | `EmployeeAccountSettingPage` 僅有 5 欄位 | 🔴 |
| MDO: `employee_id`, `create_date`, `enterpriseId` + 8 子物件 | 前台: `employeeId`, `employeeName`, `department`, `email`, `role` | 僅帳號管理用途 | 🟡 |

---

## 5. 命名規範 GAP

依據 MDO 設計指南 §4.1（Object Type 命名 PascalCase 單數，欄位用支援型別），以下為前台與 MDO 命名不一致的彙整：

| # | 概念 | MDO 標準名 | 前台使用名 | 出現位置 | 影響 |
|---|------|-----------|-----------|---------|------|
| 1 | 供應商 | `Supplier` | `Vendor` | 全系統 | 🔴 canonical 名稱不一致 |
| 2 | 物料 | `Item` / `material_no` | `PartRecord` / `material` / `partNo` | 零件維護 | 🔴 canonical 名稱不一致 |
| 3 | 物料名稱 | `material_description` | `productName` / `longDescription` / `specification` / `longSpec` | 多處 | 🟡 3~4 種不同名稱 |
| 4 | 工廠 | `plant` (ItemPlantContext) | `plant` / `plantCode` | 混用 | 🟡 |
| 5 | 公司 | `company_code` (Organization) | `company` / `companyCode` | 混用 | 🟡 |
| 6 | 交期 | — | `leadtime` / `leadTime` | 大小寫不一 | 🟡 |
| 7 | 幣別代碼 | `currency_code` | `code` / `isoCode` / `currency` | 多處 | 🟡 |
| 8 | 匯率 | `ExchangeRate` (Object) | `exchangeRate` (field) | OrderDetail | 🟡 |
| 9 | 採購組織 | — (Organization.type) | `purchaseOrg` / `EKORG` | 混用 | 🟡 |
| 10 | 廠商料號 | — | `vendorMaterialNo` / `vendorPartNo` / `vend_part_no` | 3 種名稱 | 🟡 |
| 11 | 訂單數量 | — | `orderQty` (number) / `orderQty` (string in CSV) | 型別不一 | 🟡 |
| 12 | 料號 | `material_no` | `materialNo` / `material` / `partNo` / `itemNo` / `part_no` | 5 種名稱 | 🔴 嚴重不一致 |
| 13 | 品名 | `material_description` | `productName` / `partName` / `itemName` / `materialName` | 4 種名稱 | 🔴 嚴重不一致 |
| 14 | 供應商代碼 | `business_partner_no` | `vendorCode` / `vend_no` | 2 種名稱 | 🟡 |
| 15 | 有效期起 | `validFrom` (MDO 標準) | `valid_from` / `vaild_from` | DB 拼字錯 | 🟡 已在 MDO 設計中修正 |
| 16 | 獎金型別 | `bonusType` | `bouns_types` | DB 拼字錯 | 🟡 已在 MDO 設計中修正 |
| 17 | 員工姓名國別 | `localNameCountry` | `local_name_coutry` | DB 拼字錯 | 🟡 已在 MDO 設計中修正 |
| 18 | 狀態碼 | MDO 無統一定義 | `NP/V/B/CK/CL` (訂單) / `DR/V/SC/CL/CC` (索樣) / `DR/P/B/S/F/H` (發票) | 各模組自定義 | 🟡 |

---

## 6. 設計原則 GAP（架構層）

依據 MDO 設計指南的 10 大核心設計原則（§2），以下為前台專案的架構層 GAP：

### 6.1 enterpriseId 租戶隔離（§2.8, §6）

> [!CAUTION]
> **MDO 鐵律**：「Tenant-scoped business records 必須有 `enterpriseId`」
> 
> **前台現況**：`共用主檔欄位定義20260618.md` 中 Vendor 和 Item 有定義 `enterpriseId`，但前台程式碼的 TypeScript 介面（`OrderRow`, `InvoiceRecord`, `ShipmentData` 等）**全部未包含 `enterpriseId` 欄位**。

| Object | 欄位定義 `.md` 有 `enterpriseId` | TypeScript 介面有 `enterpriseId` | GAP |
|--------|:---:|:---:|:---:|
| Vendor | ✓ | ❌ | 🔴 |
| Item/Part | ✓ | ❌ | 🔴 |
| Order | 定義文件有 | ❌ | 🔴 |
| Shipment | 定義文件有 | ❌ | 🔴 |
| Invoice | 定義文件有 | ❌ | 🔴 |
| Correction | 定義文件有 | ❌ | 🔴 |
| SampleOrder | 定義文件有 | ❌ | 🔴 |
| ForecastOrder | 定義文件有 | ❌ | 🔴 |

### 6.2 ERP 同步欄位（§4.1, §7）

> [!WARNING]
> **MDO 規範**：「ERP synced records 必須有 `erpStatus`, `erpReferenceNumber`, `erpSyncAt`，建議加 `erpLastError`」
> 
> **前台現況**：所有 Object Types 均**完全缺少** ERP 同步欄位。

### 6.3 Read = query, Write = Action（§2.4）

> **MDO 規範**：「查詢可以是 read API；任何新增、修改、刪除、審核、同步都必須走 Action」
> 
> **前台現況**：前台使用 mock data + 本地 state 管理，尚未接入真實 API。但目前的設計中並無 Action 概念（沒有 `idempotencyKey`、`precondition`、`compensation`、`audit log`）。

### 6.4 Function 是純邏輯（§4.3）

> **MDO 規範**：「Function 只能驗證、計算、轉換、聚合、推薦或查詢，不寫資料」
> 
> **前台現況**：計算邏輯（如訂單金額、稅額、匯率換算）散落在各組件的 render function 中，未抽成可重用的 Function。

**受影響的計算邏輯：**
- `InvoiceDetailPage` — 發票稅額、含稅/未稅小計計算
- `OrderDetail` — 訂單總金額、淨額計算
- `CorrectionCreatePage` — 折讓金額計算
- `QuotationPrintPage` — 報價金額計算
- `ShipmentCreatePage` — 重量、體積計算

### 6.5 Link Type 語意關聯（§4.2）

> **MDO 規範**：「Link Type 必須有語意名稱、cardinality、reverseName」
> 
> **前台現況**：前台使用 FK 引用（如 `vendorCode`, `orderNo`），但未定義語意 Link Types。

**缺少的 Link Types：**

| 關係 | MDO 要求 | 前台現況 |
|------|---------|---------|
| Order → Vendor | 需要 Link Type | 僅 `vendorCode` FK |
| Order → OrderLineItem | 需要 Link Type | 內嵌陣列，無獨立關聯 |
| Shipment → Order | 需要 Link Type | 僅 `orderNo` FK |
| Invoice → Order | 需要 Link Type | 僅 `orderNo` FK |
| Invoice → Shipment | 需要 Link Type | 僅 `shipmentNo` FK |
| Correction → Invoice | 需要 Link Type | 僅 `invoiceNo` FK |
| SampleOrder → Item | 需要 Link Type | 僅 `material` FK |
| Contact → Vendor | 需要 Link Type | 僅 `vendorCode` FK |
| PartRecord → BrandSetting | 需要 Link Type | 內嵌陣列 |
| PartRecord → MaterialComposition | 需要 Link Type | 內嵌陣列 |
| QualityAbnormal → Order | 需要 Link Type | 僅 `orderNo` FK |
| VendorEvaluation → Vendor | 需要 Link Type | 僅 `vendorCode` FK |

### 6.6 Canonical Object 策略（§5）

> **MDO 規範**：「設計新物件前必須先查平台物件目錄是否已有相同概念」
> 
> **前台現況有以下 Canonical 衝突：**

| 衝突 | 說明 |
|------|------|
| `Vendor` vs `Supplier` | 前台叫 `Vendor`，MDO 叫 `Supplier`，指同一概念 |
| `PartRecord` vs `Item` | 前台叫 `PartRecord`/`Part`，MDO 叫 `Item`，指同一概念 |
| `material` vs `materialNo` vs `partNo` | 同一概念 3 種命名 |
| `productName` vs `partName` vs `itemName` | 同一概念 3 種命名 |
| `longDescription` vs `specification` vs `longSpec` | 同一概念 3 種命名 |
| `plant` vs `plantCode` | 同一概念 2 種命名 |
| `company` vs `companyCode` | 同一概念 2 種命名 |
| `vendorMaterialNo` vs `vendorPartNo` vs `vend_part_no` | 同一概念 3 種命名 |

### 6.7 前台自建業務邏輯（§10.2 Rule 9）

> **MDO 規範**：「前台不能重寫平台已有 Function 的業務邏輯，例如自行算 warranty eligibility、ATP promising、exchange rate」
> 
> **前台違反處：**
> - `currencyData.ts` 中有 `exchangeRateTWD` 欄位 — 匯率應由 `ExchangeRate` Function 提供
> - `invoiceStore.ts` 中有發票稅額計算邏輯 — 應為平台 Function
> - `OrderDetail` 中有訂單金額計算 — 應為平台 Function
> - 前台硬編碼 `ORG_TO_COMPANY` 映射 — 應由 Organization resolver Function 提供

### 6.8 Consumer Declaration（§10.3）

> **MDO 規範**：「每個前台 App 必須在 consumer contract registry 宣告依賴」
> 
> **前台現況**：❌ 完全無 consumer declaration 文件。MDO 設計審查 Checklist（附錄 B）也標記此項為待建立。

### 6.9 API 規範（§9）

> **MDO 規範**：標準 API 路徑為 `GET /api/v1/{pbc}`, `POST /api/v1/{pbc}/commands/:action`
> 
> **前台現況**：前台使用 mock data，無真實 API 呼叫。路由結構為頁面路由（`/orders`, `/invoices`），非 API 路由。當接入真實 API 時，需確保遵循 MDO API 標準。

---

## 7. GAP 彙總表

### 7.1 按嚴重度彙整

| ID | GAP 描述 | 影響範圍 | 嚴重度 | 建議優先序 |
|:--:|---------|---------|:------:|:---------:|
| G01 | **訂單交易域（Order/Shipment/Invoice/Correction 等 14 個 Object Types）在 MDO 未設計** | MDO 設計文件 | 🔴 高 | P0 |
| G02 | **前台所有 Object Types 缺少 `enterpriseId` 租戶隔離欄位**（TypeScript 介面層） | 全系統 | 🔴 高 | P0 |
| G03 | **前台所有 Object Types 缺少 ERP 同步欄位** (`erpStatus` / `erpReferenceNumber` / `erpSyncAt`) | 全系統 | 🔴 高 | P1 |
| G04 | **`Vendor` vs `Supplier` canonical 名稱衝突** | 全系統 | 🔴 高 | P1 |
| G05 | **`PartRecord` vs `Item` canonical 名稱衝突** + 料號欄位名 5 種變體 | 全系統 | 🔴 高 | P1 |
| G06 | **品名欄位 4 種命名**（`productName` / `partName` / `itemName` / `materialName`） | 全系統 | 🔴 高 | P1 |
| G07 | `ExchangeRate` 未獨立建模，僅為訂單嵌入欄位 | 訂單 / 發票 | 🟡 中 | P2 |
| G08 | `Organization` 未獨立建模，僅為靜態映射 | 組織管理 | 🟡 中 | P2 |
| G09 | 缺少 12 組 Link Type 語意關聯定義 | 全系統 | 🟡 中 | P2 |
| G10 | 計算邏輯散落在前台組件，未抽為 Function | 發票 / 訂單 / 折讓 | 🟡 中 | P2 |
| G11 | 前台硬編碼 `ORG_TO_COMPANY` 映射 | 發票建立 | 🟡 中 | P2 |
| G12 | 前台 `currencyData.ts` 內嵌 `exchangeRateTWD` | 幣別資料 | 🟡 中 | P2 |
| G13 | 無 Consumer Declaration 文件 | 治理 | 🟡 中 | P2 |
| G14 | HR Workforce 域 18 個 Object Types 前台完全未涵蓋 | HR 模組 | 🟡 中 | P3 (視範圍) |
| G15 | 各模組狀態碼自定義，無統一列舉 | 全系統 | 🟡 中 | P2 |
| G16 | `CostCenter` / `ExchangeRateHistory` / `SupplierSourceKey` 前台未使用 | 基礎服務 | 🟢 低 | P3 |
| G17 | 前台 UI 專用欄位（`label`, `symbol`, `avatar` 等）未影響 MDO | UI 層 | 🟢 低 | 不須處理 |
| G18 | 部分欄位型別差異（string vs number） | 資料層 | 🟢 低 | P3 |

### 7.2 按模組彙整

| 模組 | 🔴 高 | 🟡 中 | 🟢 低 | 主要 GAP |
|------|:-----:|:-----:|:-----:|---------|
| 訂單管理 | 3 | 4 | 1 | MDO 未設計 + 命名 + enterpriseId |
| 出貨管理 | 2 | 3 | 0 | MDO 未設計 + enterpriseId |
| 發票管理 | 2 | 4 | 0 | MDO 未設計 + 計算邏輯 |
| 折讓管理 | 2 | 2 | 0 | MDO 未設計 |
| 供應商管理 | 3 | 4 | 1 | Vendor/Supplier 命名 + 欄位差異 |
| 物料/零件 | 3 | 5 | 1 | Item/Part 命名 + Context Object |
| 幣別/匯率 | 1 | 3 | 1 | ExchangeRate 未獨立建模 |
| 組織 | 1 | 2 | 0 | Organization 未獨立建模 |
| 品質管理 | 1 | 1 | 0 | MDO 未設計 |
| ESG | 1 | 1 | 0 | MDO 未設計 |
| HR | 0 | 1 | 0 | 前台範圍外 |

---

## 8. 建議行動方案

### P0：立即處理（阻塞性問題）

#### A1. 擴充 MDO 資料物件設計文件，補充訂單交易域

> [!IMPORTANT]
> 最關鍵的 GAP 是 **MDO 資料物件設計文件僅涵蓋底層基礎服務域**，而前台核心業務（訂單 → 出貨 → 發票 → 折讓）完全未被 MDO 定義。需要在 MDO 設計文件中新增以下 Object Types：

```text
新增 Object Types（依 §4.1.6 模板）:
├── Order                    (Transaction, Aggregate Root)
├── OrderLineItem            (Child of Order)
├── ScheduleLine             (Child of OrderLineItem)
├── Shipment                 (Transaction)
├── ShipmentLineItem         (Child of Shipment)
├── Invoice                  (Transaction)
├── InvoiceLineItem          (Child of Invoice)
├── Correction               (Transaction)
├── CorrectionLineItem       (Child of Correction)
├── SampleOrder              (Transaction)
├── ExchangeOrder            (Transaction)
├── ReturnOrder              (Transaction)
├── ForecastOrder            (Transaction)
├── ScheduleChange           (Transaction)
├── QualityAbnormal          (Transaction)
├── Contact                  (Master, Child of Vendor/Supplier)
├── VendorEvaluation         (Configuration)
├── EsgMaterial              (Master/Configuration)
└── MaterialComposition      (Relationship)
```

#### A2. 在前台 TypeScript 介面中加入 `enterpriseId`

所有 tenant-scoped 介面需新增 `enterpriseId: string` 欄位。

---

### P1：短期處理（命名統一）

#### A3. 統一 canonical 名稱

| 決定項 | 建議 | 理由 |
|--------|------|------|
| `Vendor` vs `Supplier` | 統一用 `Supplier`，前台 UI 可顯示「供應商」 | MDO canonical 標準 |
| `PartRecord` vs `Item` | 統一用 `Item`，前台 UI 可顯示「料件」 | MDO canonical 標準 |
| 料號欄位名 | 統一用 `materialNo` | MDO 設計文件標準 |
| 品名欄位名 | 統一用 `productName`（短描述）+ `longDescription`（長描述） | MDO `material_description` 的對應 |

#### A4. 加入 ERP 同步欄位

對所有需與 SAP 同步的 Object Types 加入 `erpStatus`, `erpReferenceNumber`, `erpSyncAt`, `erpLastError`。

---

### P2：中期處理

#### A5. 獨立建模 ExchangeRate 和 Organization

- `ExchangeRate` 應從訂單嵌入欄位抽出為獨立 Object，並透過 `getExchangeRate` Function 提供查詢。
- `Organization` 應從靜態映射改為獨立 Object，透過 API 查詢。
- 移除 `ORG_TO_COMPANY` 硬編碼映射。

#### A6. 定義 Link Types

為所有跨 Object 的關聯建立語意 Link Types（見 §6.5 表格）。

#### A7. 抽取計算邏輯為 Function

將散落在前台的計算邏輯（稅額、金額、匯率換算）抽成可重用 Function。

#### A8. 建立 Consumer Declaration

為本前台系統建立 consumer declaration 文件，宣告依賴的 API endpoint 和欄位。

#### A9. 統一狀態碼定義

建立統一的狀態碼列舉（或至少在 MDO 層面統一定義各 Object 的 `status` select options）。

---

### P3：長期處理

#### A10. 評估 HR Workforce 域需求
確認前台系統是否需要涵蓋 HR 域功能。

#### A11. 欄位型別標準化
將前台中型別不一致的欄位（如 `grossWeight: string` → `number`）逐步修正。

#### A12. 建立 API Specification
當前台接入真實 API 時，建立符合 MDO 標準的 API specification。
