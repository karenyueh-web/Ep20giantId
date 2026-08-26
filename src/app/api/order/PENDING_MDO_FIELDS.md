# 訂單管理模組 — MDO 待補欄位追蹤

> 最後更新：2026-08-26  
> 參考 GAP 報告：`brain/order_management_gap_report.md`

---

## 一般訂單（`PurchaseOrderResponseDto` + `PurchaseOrderLineItemResponseDto`）

### 主表層級缺漏

| 前端欄位 | 前端顯示名稱 | 期望 MDO 欄位名 | 優先度 |
|---------|------------|--------------|------|
| `orderDate` | 訂單日期 | `orderDate` (date) | 🔴 高 |
| `purchaseOrg` | 採購組織 | `purchaseOrg` | 🔴 高 |

### 行項目層級缺漏（`PurchaseOrderLineItemResponseDto`）

| 前端欄位 | 前端顯示名稱 | 期望 MDO 欄位名 | 優先度 |
|---------|------------|--------------|------|
| `productName` | 品名 | `productName` | 🔴 高 |
| `specification` | 規格 | `specification` 或 `longSpec` | 🔴 高 |
| `acceptQty` | 驗收量 | `acceptQty` 或 `receivedQty` | 🔴 高 |
| `deliveryQty` | 交貨量 | `deliveryQty` 或 `shippedQty` | 🔴 高 |
| `unit` | 單位 | `unit` 或 `uom` | 🔴 中 |
| `currency` | 幣別 | `currency` | 🔴 中 |
| `leadtime` | Lead Time | `leadTime` (number, days) | 🟡 中 |
| `vendorMaterialNo` | 廠商料號 | `supplierMaterialNo` | 🟡 中 |
| `storageLocationCode` | 儲存地點代碼 | `storageLocation` | 🟡 低 |
| `customerBrand` | 客戶品牌 | `customerBrand` | 🟡 低 |
| `comparePrice` | 比對單價 | — | 🟡 低（可透過 quotationId → pricing 查詢） |
| `lineItemNote` | 單項小記 | `note` | 🟡 低 |
| `internalNote` | 項目註記(內部) | `internalNote` | 🟡 低 |
| `materialPOContent` | 物料PO內文 | `poContent` | 🟡 低 |

### 需跨模組查詢

| 前端欄位 | 資料來源 | 方式 |
|---------|--------|------|
| `vendorName` 廠商名稱 | `partner-commercial/business-partners` | `GET /business-partners?supplierCode=` |
| `inTransitQty` 在途量 | `stock-inventory/stock-positions` | `GET /stock-positions/{id}/in-transit-levels` |

---

## 預測訂單（`ForecastOrderItemDto`）

| 前端欄位 | 前端顯示名稱 | 期望 MDO 欄位名 | 優先度 |
|---------|------------|--------------|------|
| `updatedBy` | 更新者 | `updatedBy` | 🟡 中 |
| `updatedDate` | 更新日 | `updatedAt` (date) | 🟡 中 |

> 另外：GET response schema 尚未在 docs-json 正式定義，目前依 upload DTO 推斷。

---

## 變更生管排程（`ScheduleChangeItemDto`）

| 前端欄位 | 前端顯示名稱 | 期望 MDO 欄位名 | 優先度 |
|---------|------------|--------------|------|
| `inTransitQty` | 在途量 | — | 需跨模組查 stock-inventory |
| `purchaseOrg` | 採購組織 | `purchaseOrg` | 🟡 中 |
| `productName` | 品名 | `productName` | 🔴 高 |

---

## 歷史訂單

| 問題 | 期望解法 |
|-----|---------|
| 無獨立 history endpoint | 建議：`GET /purchase-orders?status=CL` 即為歷史訂單；或 MDO 新增 `/history-orders` endpoint |

---

## 查詢條件缺漏

| 功能 | 期望 query param | 影響模組 |
|-----|----------------|---------|
| 訂單日期區間起 | `orderDateFrom` (date) | 一般訂單 |
| 訂單日期區間迄 | `orderDateTo` (date) | 一般訂單 |
| 採購組織篩選 | `purchaseOrg` | 一般訂單 |
| 刪單/正常單篩選 | `isDeleted` (boolean) 已有，但需確認可否直接篩選 | 一般訂單 |
