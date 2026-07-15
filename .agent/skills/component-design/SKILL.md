---
name: component-design
description: 建立新功能時，先查閱設計系統規範與既有元件樣式，避免自訂義樣式與重複造輪子。當用戶要求建立新頁面、新元件、新功能時，使用此 skill。
---

# Component Design Skill

## 目標

每次新增功能前，**先做元件設計調查**，確保新元件：
1. 使用設計系統的 CSS 變數與 Tailwind tokens
2. 複用現有 UI 元件庫，不重新自定義
3. 沿用既有業務元件的互動模式

---

## Step 1：查閱設計系統規範

### 色彩系統（CSS Variables）

設計系統定義在 `src/styles/theme.css`，**所有顏色必須使用 CSS 變數或 Tailwind 對應 token**：

| 用途 | CSS 變數 | Tailwind Class |
|------|----------|---------------|
| 主背景 | `var(--background)` | `bg-background` |
| 主前景（文字） | `var(--foreground)` | `text-foreground` |
| 卡片背景 | `var(--card)` | `bg-card` |
| 主色調 | `var(--primary)` | `bg-primary` / `text-primary` |
| 次要色 | `var(--secondary)` | `bg-secondary` |
| 靜音色（灰色） | `var(--muted)` | `bg-muted` |
| 靜音文字 | `var(--muted-foreground)` | `text-muted-foreground` |
| 強調色 | `var(--accent)` | `bg-accent` |
| 破壞性操作（紅） | `var(--destructive)` | `bg-destructive` / `text-destructive` |
| 邊框 | `var(--border)` | `border-border` |
| 輸入框背景 | `var(--input-background)` | `bg-input-background` |
| 環形焦點 | `var(--ring)` | `ring-ring` |

**採購角色主題（黑黃配色）**：套用 `.procurement-theme` class 可自動切換為金黃配色系。

### 圓角系統

| Token | 值 |
|-------|----|
| `rounded-sm` | `calc(var(--radius) - 4px)` |
| `rounded-md` | `calc(var(--radius) - 2px)` |
| `rounded-lg` | `var(--radius)` = `0.625rem` |
| `rounded-xl` | `calc(var(--radius) + 4px)` |

### 字體系統

- 標題 h1：`text-2xl font-medium`
- 標題 h2：`text-xl font-medium`
- 標題 h3：`text-lg font-medium`
- 內文、label、button：`text-base font-medium`
- Input：`text-base font-normal`

### 自定義 CSS Utilities

| Class | 用途 |
|-------|------|
| `.custom-scrollbar` | 統一的 scrollbar 樣式（灰色細滾動條） |
| `.custom-select` | 原生 `<select>` 的統一樣式（54px 高、8px 圓角） |

---

## Step 2：查閱可用 UI 元件庫

位置：`src/app/components/ui/`（基於 **shadcn/ui**，共 48 個元件）

### 常用元件快速參考

| 元件 | 檔案 | 用途 |
|------|------|------|
| `Button` | `button.tsx` | 所有按鈕，支援 variant: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` |
| `Input` | `input.tsx` | 文字輸入框 |
| `Textarea` | `textarea.tsx` | 多行文字輸入 |
| `Select` | `select.tsx` | 下拉選單（Radix UI） |
| `Dialog` | `dialog.tsx` | Modal 對話框 |
| `Sheet` | `sheet.tsx` | 側滑抽屜 |
| `Tabs` | `tabs.tsx` | 頁籤切換 |
| `Table` | `table.tsx` | 資料表格基礎元件 |
| `Badge` | `badge.tsx` | 狀態標籤 |
| `Card` | `card.tsx` | 卡片容器 |
| `Checkbox` | `checkbox.tsx` | 核取方塊 |
| `Switch` | `switch.tsx` | 開關切換 |
| `Popover` | `popover.tsx` | 彈出框（用於日期選擇器等） |
| `Tooltip` | `tooltip.tsx` | 工具提示 |
| `ScrollArea` | `scroll-area.tsx` | 可捲動區塊 |
| `Separator` | `separator.tsx` | 分隔線 |
| `Form` | `form.tsx` | 表單容器（搭配 react-hook-form） |
| `Label` | `label.tsx` | 表單標籤 |
| `Alert` | `alert.tsx` | 提示訊息 |
| `Avatar` | `avatar.tsx` | 頭像元件 |
| `Progress` | `progress.tsx` | 進度條 |
| `Pagination` | `pagination.tsx` | 分頁（shadcn 版） |
| `DropdownMenu` | `dropdown-menu.tsx` | 下拉操作選單 |
| `Calendar` | `calendar.tsx` | 日曆選擇器 |
| `Sonner` | `sonner.tsx` | Toast 通知 |
| `Skeleton` | `skeleton.tsx` | 載入骨架屏 |

---

## Step 3：查閱既有業務元件

位置：`src/app/components/`

在使用 shadcn/ui 之前，先確認是否已有業務封裝元件：

### 已封裝的業務元件清單

| 元件 | 檔案 | 用途 | 文件 |
|------|------|------|------|
| `ActionButtons` | `ActionButtons.tsx` | **操作 Icon 按鈕**（`EditButton` / `DeleteButton` / `ActionCellButtons`），表格操作欄專用 | 見下方「操作按鈕規範」 |
| `DropdownSelect` | `DropdownSelect.tsx` | **帶浮動標籤的下拉選單**，統一用於所有下拉選擇 | `README_Dropdown.md` |
| `SearchField` | `SearchField.tsx` | 搜尋輸入框（`type="search"`）或**日期選擇器**（`type="date"`，含清除按鈕 + calendar icon + SimpleDatePicker）| ⚠️ **日期篩選欄位一律用 `<SearchField type="date" />`，禁止自製日期選擇器元件** |
| `PaginationControls` | `PaginationControls.tsx` | 分頁控制列（業務版） | - |
| `TableToolbar` | `TableToolbar.tsx` | 資料表格工具列（搜尋+篩選+操作按鈕組合） | - |
| `FilterDialog` | `FilterDialog.tsx` | 篩選對話框 | - |
| `FilterSelect` | `FilterSelect.tsx` | 篩選專用選擇器 | - |
| `StatusMultiSelect` | `StatusMultiSelect.tsx` | 狀態多選元件 | - |
| `SimpleDatePicker` | `SimpleDatePicker.tsx` | 日期選擇器（業務封裝版） | - |
| `ColumnSelector` | `ColumnSelector.tsx` | 欄位顯示/隱藏選擇器 | - |
| `ResizableTable` | `ResizableTable.tsx` | 可調整欄寬的資料表格 | - |
| `ResizableTableWithCheckbox` | `ResizableTableWithCheckbox.tsx` | 可調整欄寬 + 多選的資料表格 | - |
| ⭐ `StandardDataTable` | `StandardDataTable.tsx` | **標準表格系統元件**（DnD拖拉+排序+欄寬+Toolbar+分頁全套） | 見下方「標準表格系統」章節 |
| ⭐ `UpdateTimeLabel` | `UpdateTimeLabel.tsx` | **更新時間標籤元件**（純文字版 + hover 顯示下次更新時間 tooltip） | 見下方「更新時間規範」章節 |
| ⭐ `NextUpdateTooltip` | `UpdateTimeLabel.tsx` | **更新時間 wrapper**（包住有框+刷新鈕版本的更新時間元素） | 見下方「更新時間規範」章節 |
| `PageHeaderB` | `PageHeaderB.tsx` | 頁面標題列（B 型樣式） | - |
| `ResponsivePageLayout` | `ResponsivePageLayout.tsx` | 響應式頁面佈局容器 | - |
| `BaseOverlay` | `BaseOverlay.tsx` | Overlay 基礎元件 | - |
| `ToggleButton` | `ToggleButton.tsx` | 切換按鈕 | - |
| `ToggleSwitch` | `ToggleSwitch.tsx` | 切換開關（業務版） | - |
| `CustomCheckbox` | `CustomCheckbox.tsx` | 自定義 Checkbox | - |
| `CheckboxIcon` | `CheckboxIcon.tsx` | Checkbox 圖標元件 | - |

### 頁面骨架模式（Layout Patterns）

參考 `MainLayout.tsx`、`NavigationList.tsx`、`OrderListWithTabs.tsx` 了解：
- 側邊欄配置
- 頂部導航
- 分頁 (Tabs) + 資料表格 的標準頁面結構

---

## ⭐ Overlay 彈窗規範（重要：建新彈窗前必讀）

> **⚠️ 禁止**：建立新彈窗/Dialog 時，**禁止自行用 `fixed div` 或 `createPortal` 從頭製作背景遮罩和白色卡片**。必須使用以下標準結構。

### 強制執行流程

建立任何新彈窗前，**必須依序執行**：
1. 查閱本章節規範
2. 搜尋 `src/app/components/` 中現有 Overlay 元件（`AddVendorMailOverlay.tsx`、`ContactDetailOverlay.tsx`、`ForecastUploadOverlay.tsx` 等）
3. 參考最相近的現有彈窗作為範本，再動工

### 基礎結構：`BaseOverlay`

所有彈窗必須用 `BaseOverlay` 作為外層容器：

```tsx
import { BaseOverlay } from './BaseOverlay';

<BaseOverlay onClose={onClose} maxWidth="560px" maxHeight="600px">
  {/* ⚠️ 必須加這層 relative wrapper，否則 absolute 關閉按鈕無法正確錨定 */}
  <div className="relative w-full h-full">
    {/* 關閉按鈕 absolute 定位於此 */}
    {/* 內容區 */}
  </div>
</BaseOverlay>
```

`BaseOverlay` 提供：
- `fixed inset-0 z-[200]` 半透明黑色遮罩（`bg-black/30`）
- 白色卡片（`bg-white rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)]`）
- 點擊遮罩自動關閉

### 關閉按鈕規格

| 屬性 | 規格 |
|------|------|
| 位置 | `absolute left-[20px] top-[20px] z-10` |
| 圖示 | 灰色 SVG X（`fill="#637381"`），24×24px |
| 互動 | `hover:opacity-70 transition-opacity` |
| 參考來源 | `AddVendorMailOverlay.tsx`（第 134–150 行） |

```tsx
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
```

### 內容區佈局

```tsx
<div className="flex flex-col h-full px-[50px] pt-[58px] pb-[40px] gap-[24px]">
  {/* 標題 */}
  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
    標題文字
  </p>

  {/* 表單欄位 */}
  <div className="flex flex-col gap-[16px] flex-1">
    {/* FloatingInput × n */}
  </div>

  {/* 儲存按鈕 */}
  <button
    className="w-full h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
    style={{ backgroundColor: '#00559c' }}
  >
    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">儲存</p>
  </button>
</div>
```

### 儲存按鈕規格

| 屬性 | 規格 |
|------|------|
| 背景色 | `#00559c`（**禁止使用** `#1d4ed8`、`#1890ff` 等其他藍色） |
| Hover 色 | `#004680` |
| 高度 | `h-[36px]` |
| 圓角 | `rounded-[8px]` |
| 文字 | `Public_Sans:Bold`、`font-bold`、`text-[14px]`、`text-white` |
| 參考來源 | `AddVendorMailOverlay.tsx`（第 194–204 行） |

### 表單輸入：FloatingInput

彈窗內的文字輸入框使用 `FloatingInput`（定義於 `ShippingBasicSettingsPage.tsx`），**禁止使用原生 `<input>` 直接放入彈窗**。

```tsx
function FloatingInput({ label, value, onChange, required, showError }) {
  const isError = !!showError;
  const borderColor = isError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor  = isError ? '#ff5630' : '#637381';
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{ borderColor }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p style={{ fontSize: '12px', fontWeight: 600, color: labelColor }}>{label}</p>
      </div>
      <textarea
        className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
        style={{ resize: 'vertical', minHeight: '54px' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={1}
      />
      {showError && <p className="mt-[4px] text-[12px] text-[#ff5630]">{showError}</p>}
    </div>
  );
}
```

### 下拉選單：DropdownSelect

彈窗內的下拉選單使用 `DropdownSelect`（參考 `AddVendorMailOverlay.tsx` 第 161–173 行）。

### 現有 Overlay 元件一覽（建新彈窗前必查）

| 元件 | 檔案 | 適用場景 |
|------|------|---------|
| `AddVendorMailOverlay` | `AddVendorMailOverlay.tsx` | 含表格的複雜彈窗範本 |
| `ContactDetailOverlay` | `ContactDetailOverlay.tsx` | 含表單欄位的詳細資訊彈窗 |
| `ForecastUploadOverlay` | `ForecastUploadOverlay.tsx` | 上傳/匯入類彈窗 |
| `UploadContactOverlay` | `UploadContactOverlay.tsx` | 上傳聯絡人類彈窗 |
| ⭐ `ForecastDeleteDeniedOverlay` | `ForecastDeleteDeniedOverlay.tsx` | **錯誤警示彈窗範本**（操作不符合條件時） |

---

## ⭐ 錯誤提示規範（Error Alert）

> **⚠️ 禁止**：當操作不符合條件需要提示使用者錯誤時，**禁止使用 `toast.error`、`sonner`、或自製 `fixed div`**。必須使用以下標準 Alert 彈窗。

### 標準錯誤警示彈窗結構

參考範本：`ForecastDeleteDeniedOverlay.tsx`、`QuotationPrintListPage.tsx`（廠商不一致警示）

```tsx
import { BaseOverlay } from './BaseOverlay';

// 1. State 控制顯示/隱藏
const [showAlert, setShowAlert] = useState(false);

// 2. 觸發條件不符合時開啟
if (/* 不符合條件 */) {
  setShowAlert(true);
  return;
}

// 3. JSX
{showAlert && (
  <BaseOverlay onClose={() => setShowAlert(false)} maxWidth="480px" maxHeight="280px">

    {/* 頂部警示列 */}
    <div className="shrink-0 flex items-center gap-[12px] pl-[4px] pr-[16px] py-[4px] border-b border-[rgba(145,158,171,0.12)]">
      {/* 紅色警示 Icon */}
      <div className="flex items-center justify-center rounded-[12px] shrink-0 size-[48px] bg-[rgba(255,86,48,0.08)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="#FF5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* 標題 */}
      <p className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e]">
        錯誤標題
      </p>
      {/* 關閉按鈕 */}
      <button
        onClick={() => setShowAlert(false)}
        className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>

    {/* 說明文字區 */}
    <div className="flex-1 flex items-center px-[24px] py-[20px]">
      <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] leading-[22px]">
        錯誤說明文字，可用 <strong className="text-[#1c252e]">粗體</strong> 強調關鍵字。
      </p>
    </div>

    {/* 底部確認按鈕 */}
    <div className="shrink-0 flex items-center justify-end px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.12)] bg-[rgba(255,86,48,0.04)]">
      <button
        onClick={() => setShowAlert(false)}
        className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors"
      >
        <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white leading-none">確認</span>
      </button>
    </div>
  </BaseOverlay>
)}
```

### 視覺規格

| 項目 | 規格 |
|------|------|
| 彈窗尺寸 | `maxWidth="480px" maxHeight="280px"`（純訊息型）；若需列出資料則加大 |
| Icon 容器 | `size-[48px] rounded-[12px] bg-[rgba(255,86,48,0.08)]`（淡紅底） |
| Icon | 三角形警示 SVG，`stroke="#FF5630"`，24×24 |
| 標題 | `font-semibold text-[14px] text-[#1c252e]` |
| 說明文字 | `text-[14px] text-[#637381]`，關鍵字用 `<strong className="text-[#1c252e]">` 強調 |
| 底部背景 | `bg-[rgba(255,86,48,0.04)]`（極淡紅） |
| 確認按鈕 | `bg-[#1c252e] hover:bg-[#2c3540]`，`h-[36px] px-[20px] rounded-[8px]` |
| 參考來源 | `ForecastDeleteDeniedOverlay.tsx`、`QuotationPrintListPage.tsx` |

---

## ⭐ 操作按鈕規範（ActionButtons）

> 表格列中的「編輯」與「刪除」按鈕必須統一使用 `ActionButtons.tsx`，**禁止自行繪製 SVG 或自訂樣式**。

### 可用 exports

| 元件 | 用途 |
|------|------|
| `ActionCellButtons` | 組合 Edit + Delete，表格操作欄標準用法（**優先使用**） |
| `EditButton` | 單獨編輯按鈕（藍色鉛筆 `#1890FF`，透明背景） |
| `DeleteButton` | 單獨刪除按鈕（紅色垃圾桶 `#FF5630`，透明背景） |

### 使用範例

```tsx
import { ActionCellButtons } from './ActionButtons';

// 在 StandardDataTable 的欄位定義中使用：
{
  key: 'id', label: '', width: 80, minWidth: 80, required: true,
  renderCell: (_val, row) => (
    <ActionCellButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteTarget(row)} />
  ),
}
```

### Icon 規格

| 屬性 | 編輯按鈕 | 刪除按鈕 |
|------|----------|----------|
| Icon 來源 | Material Design Edit path | `svgPaths.p309dd480` (頂蓋) + `svgPaths.p2846fa00` (桶身) |
| 顏色 | `#1890FF`（藍） | `#FF5630`（紅） |
| 背景 | 透明，hover 淡藍圓圈 | 透明，hover 淡紅圓圈 |
| 尺寸 | 42×42px，SVG 24×24 | 42×42px，SVG 22×26 |

---

## ⭐ 表單輸入元件規範（Form Input Components）

> 所有表單的下拉選單和文字輸入必須使用 `DropdownSelect` 和 `FloatingInput`，**禁止使用原生 `<select>` 或不帶浮動標籤的 `<input>`**。

### 可用元件

| 元件 | 檔案 | 用途 |
|------|------|------|
| `DropdownSelect` | `DropdownSelect.tsx` | 帶浮動標籤的下拉選單（可搜尋） |
| `FloatingInput` | 目前定義於 `ShippingBasicSettingsPage.tsx`，未來可提取至共用 | 帶浮動標籤的可調大小文字輸入框 |

### 統一樣式規範

| 屬性 | 預設狀態 | 必填未填（Error）狀態 |
|------|----------|----------------------|
| 邊框顏色 | `rgba(145,158,171,0.2)` | `#ff5630` |
| 邊框粗細 | `1px`（`border`） | `1px`（`border`）— **不使用 `border-2`** |
| 標籤顏色 | `#637381` | `#ff5630` |
| 標籤位置 | 壓在 border 上方（`top: -5px`） | 同左 |
| 標籤字重 | `font-semibold`（600） | 同左 |
| 標籤字體大小 | `12px` | 同左 |
| 圓角 | `rounded-[8px]` | 同左 |
| 高度 | `54px`（min-height） | 同左 |
| Focus 邊框 | `#1890FF` + `box-shadow: 0 0 0 2px rgba(24,144,255,0.15)` | 同左 |

### 標籤結構（Material Outlined 風格）

```tsx
{/* border overlay */}
<div
  aria-hidden="true"
  className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
  style={{ borderColor: error ? '#ff5630' : 'rgba(145,158,171,0.2)' }}
/>
{/* label 壓在 border 線上 */}
<div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
  <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
  <p style={{ fontSize: '12px', fontWeight: 600, color: error ? '#ff5630' : '#637381' }}>
    {label}
  </p>
</div>
```

### FloatingInput 特性

- 使用 `<textarea>` 取代 `<input>`
- `resize: vertical` — 使用者可拖拽右下角調整高度
- `min-height: 54px`

### 使用範例

```tsx
{/* 下拉選單 */}
<DropdownSelect
  label="工廠"
  value={factory}
  onChange={setFactory}
  options={factoryOptions}
  error={!factory}  // 必填驗證
/>

{/* 文字輸入 */}
<FloatingInput
  label="儲存地點代號"
  value={code}
  onChange={setCode}
  placeholder="如: 2610"
  required={true}
/>
```

---

## ⭐ 標準表格系統（Standard Table System）

> 當用戶說「**符合表格系統**」或「**按照表格系統製作**」時，必須包含以下所有功能。

### 必備功能清單

| 功能 | 實作方式 | 說明 |
|------|----------|------|
| ✅ **欄位拖拉重排** | `react-dnd` (`useDrag` + `useDrop`) | Hover 時顯示 6-dot drag icon，拖拉改變欄位順序 |
| ✅ **欄位排序** | 點擊表頭觸發，顯示 ▲/▼ 排序箭頭 | 欄位頂端點擊切換 asc/desc |
| ✅ **欄寬拖拽調整** | 自製 resize handle（`div` + `mousedown`/`mousemove`/`mouseup`） | 拖拽欄位右邊框調整寬度，hover 顯示藍色高亮。**禁止使用 `re-resizable`**（會攔截 dblclick） |
| ✅ **雙擊欄寬自動最適** | `measureTextWidth` + `e.detail >= 2` | 雙擊欄位右邊框，自動計算表頭 + 所有資料列的最大文字寬度並展開欄位 |
| ✅ **橫向拖拉捲動** | `useHorizontalDragScroll` | 在表格空白處按住拖拉可左右捲動，cursor 變 grab |
| ✅ **Checkbox 多選** | `CheckboxIcon` | 表頭全選 + 每列勾選 |
| ✅ **TableToolbar** | `TableToolbar` | 左側顯示 results count，右側有 Columns / Filters / Export 按鈕 |
| ✅ **欄位顯示/隱藏** | `ColumnSelector` | 點 Columns 開啟，可勾選顯示欄位，記憶至 localStorage |
| ✅ **進階篩選** | `FilterDialog` | 點 Filters 開啟，支援包含/等於/開頭是等運算符 |
| ✅ **匯出** | `onExportCsv` / `onExportExcel` | 依當前顯示欄位匯出 |
| ✅ **localStorage 記憶** | 欄位順序 + 寬度 + 可見性 | 重整頁面後保留上次設定 |
| ✅ **PaginationControls** | `PaginationControls` | 分頁（含 Rows per page 選擇） |

### 使用方式（兩種選擇）

**方式 A：直接使用 `StandardDataTable`（推薦，最快）**

```tsx
import { StandardDataTable, type StandardColumn } from './StandardDataTable';

// 1. 定義欄位
const COLUMNS: StandardColumn<MyRow>[] = [
  { key: 'name',  label: '名稱', width: 180, minWidth: 120 },
  { key: 'date',  label: '日期', width: 120, minWidth: 100 },
  // ...
];

// 2. 使用元件
<StandardDataTable
  columns={COLUMNS}
  data={filteredData}          // 外部已過濾好的資料
  storageKey="my-page-v1"      // 每頁面唯一 key
  onExportCsv={() => exportCsv(filteredData, COLUMNS)}
/>
```

**方式 B：手動組裝（當需要 sticky 欄、自訂列高等特殊需求）**

參考 `HistoryOrderListWithTabs.tsx`（標準模板），包含：
1. 定義 `type ColKey` + `interface ColDef`
2. 建立 `DraggableColHeader`（`useDrag` + `useDrop` + 自製 resize handle + 雙擊自動最適）
3. 加入 `measureTextWidth` 工具函式（DOM span 方式，支援中文）
4. 主元件引入 `useHorizontalDragScroll`
4. `<DndProvider backend={HTML5Backend}>`
5. 繪製 sticky Checkbox 欄（`position: sticky, left: 0, zIndex: 20`）
6. 排列 `<DraggableColHeader>` 陣列
7. 在 data rows 下方加 empty state
8. 外層套 `<TableToolbar>` + `<PaginationControls>`

### 標準頁面結構（Tab + 搜尋 + 表格）

```tsx
<div className="bg-white flex flex-col h-full relative rounded-[16px] ...">
  {/* A. Tabs */}
  <div className="shrink-0 border-b ...">  {/* TabItem × n */}  </div>

  {/* B. 搜尋/篩選列 ⚠️ 禁止加 border-b！TableToolbar 本身已有分隔效果 */}
  <div className="shrink-0 px-[20px] py-[16px]">
    <SearchField /> ...
  </div>

  {/* C. TableToolbar */}
  <TableToolbar ... />

  {/* D. 表格（DnD + Resizable + 橫向拖拉） */}
  <DndProvider backend={HTML5Backend}>
    <div ref={scrollContainerRef} onMouseDown={handleMouseDown}
         className="flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar cursor-grab">
      <div style={{ minWidth: totalWidth }}>
        {/* 表頭：sticky */}
        <div className="flex sticky top-0 z-10">
          {/* Checkbox 欄 */}
          <div style={{ position: 'sticky', left: 0, zIndex: 20 }}> ... </div>
          {/* DraggableColHeader × n */}
        </div>
        {/* 資料列 */}
        {paginatedData.map(row => (
          <div key={row.id} className="flex border-b hover:bg-...">
            <div style={{ position: 'sticky', left: 0, zIndex: 4 }}> {/* Checkbox cell */} </div>
            {visibleColumns.map(col => <div key={col.key}> ... </div>)}
          </div>
        ))}
      </div>
    </div>
  </DndProvider>

  {/* E. 分頁 */}
  <PaginationControls ... />
</div>
```

### 標準表格系統關鍵檔案

| 檔案 | 用途 |
|------|------|
| `StandardDataTable.tsx` | **泛型標準表格元件**（直接使用） |
| `HistoryOrderListWithTabs.tsx` | **手動組裝標準模板** |
| `TableToolbar.tsx` | Toolbar（Columns/Filters/Export 按鈕） |
| `ColumnSelector.tsx` | 欄位顯示/隱藏選擇器 |
| `FilterDialog.tsx` | 進階篩選對話框 |
| `CheckboxIcon.tsx` | Checkbox 圖示元件：使用 Figma 原始 SVG（`svg-jk6epzc9me` p2dde97c0）。三態：空框（灰）/ 藍底白勾（selected）/ 藍底橫線（indeterminate）。**全系統唯一標準，禁止自行繪製 checkbox** |
| `useHorizontalDragScroll.ts` | 橫向拖拉捲動 hook |
| `PaginationControls.tsx` | 分頁控制元件 |

### ⚠️ 欄寬調整實作規範（自製 Resize Handle）

> **禁止使用 `re-resizable` 套件**。該套件會在 `mousedown` 階段攔截事件，導致 `dblclick` 無法觸發。

#### 1. `measureTextWidth` 工具函式（必備）

使用 DOM `<span>` 方式測量文字寬度，**不可使用 Canvas API**（Canvas `measureText` 不支援中文字型 fallback）：

```tsx
function measureTextWidth(text: string, font = '14px "Public Sans", "Noto Sans JP", sans-serif'): number {
  let el = (measureTextWidth as any)._el as HTMLSpanElement | undefined;
  if (!el) {
    el = document.createElement('span');
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    (measureTextWidth as any)._el = el;
  }
  el.style.font = font;
  el.textContent = text;
  return el.offsetWidth;
}
```

#### 2. Resize Handle 結構（每個欄位標頭右側）

使用 `e.detail >= 2` 在 `mousedown` 中偵測雙擊（比 `onDoubleClick` 更可靠，避免 resize 時序衝突）：

```tsx
{/* 欄寬調整 handle：拖拽調寬 或 雙擊自動最適 */}
{!isLast && (
  <div
    className="absolute right-0 top-0 bottom-0 w-[8px] cursor-col-resize hover:bg-[#1D7BF5] hover:bg-opacity-20 z-10 group transition-colors"
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.detail >= 2) {
        // 第二次 mousedown（雙擊的一部分）→ 自動最適
        autoFitWidth(col.key);
        return;
      }
      setResizing(true);
      resizeStartX.current = e.clientX;
      resizeStartW.current = col.width;
    }}
    title="拖拽調整欄位寬度；雙擊自動最適欄寬"
  >
    <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#1D7BF5] transition-colors" />
  </div>
)}
```

#### 3. `autoFitWidth` 計算邏輯

```tsx
const autoFitWidth = useCallback((key: ColKey) => {
  const col = columns.find(c => c.key === key);
  if (!col) return;
  // 表頭：SemiBold 14px + padding
  const headerW = measureTextWidth(col.label, '600 14px "Public Sans", "Noto Sans JP", sans-serif') + 32 + 16;
  // 資料列：Regular 14px + padding
  let maxDataW = 0;
  data.forEach(row => {
    const val = String((row as any)[key] ?? '');
    const w = measureTextWidth(val, '14px "Public Sans", "Noto Sans JP", sans-serif') + 32;
    if (w > maxDataW) maxDataW = w;
  });
  const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
  setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
}, [columns, data]);
```

---

## ⭐ 選取後操作列規範（Selection Toolbar）

> 表格勾選列後，在 `TableToolbar` 下方浮現選取工具列，供使用者對已選資料執行批次操作。

### 視覺規格

| 項目 | 規格 |
|------|------|
| 背景色 | `bg-[#d9e8f5]`（淺藍） |
| 高度 | `h-[48px]` |
| 位置 | TableToolbar 下方、表頭上方（`border-b border-[rgba(145,158,171,0.08)]`） |
| **一般操作文字色** | `text-[#004680]`（深藍，**非 #005eb8**）|
| **危險操作文字色** | `text-[#ff5630]`（紅色，如「刪除單」）|
| Hover 狀態 | `hover:opacity-70 transition-opacity` |
| 操作 padding | `px-[10px] py-[16px]` |
| 操作間分隔線 | 垂直線 `1px`，高度 `30px`，色 `bg-[#919eab]`，`opacity-30`，左右各 `mx-[2px]` |
| 字重 | `font-semibold`（600） |
| 字體大小 | `text-[14px]` |
| **⚠️ 字型（必填）** | `font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif]`（**缺少此 class 會造成字型不一致，必須與 `font-semibold` 一起使用**） |
| 參考來源 | `OrderListWithTabs.tsx` `batchActions` 區塊 |

### 結構模板

```tsx
{selectedIds.size > 0 && (
  <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">

    {/* ① Checkbox：全選/取消全選（與表頭 Checkbox 對齊） */}
    <div className="flex items-center justify-center shrink-0" style={{ width: CHECKBOX_W }}>
      <button onClick={handleSelectAll} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors">
        <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} />
      </button>
    </div>

    {/* ② X selected 數量文字（深色，非藍色） */}
    <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] mr-[4px] whitespace-nowrap">
      {selectedIds.size} selected
    </span>

    {/* ③ 操作按鈕（用 span，非 button，對齊 OrderListWithTabs 標準） */}
    <span
      onClick={handleActionA}
      className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
    >操作一</span>

    {/* ④ 操作間分隔：只有多個 CTA 時才加 | 字符，單一 CTA 不需要分隔線 */}
    <span className="text-[rgba(145,158,171,0.4)] select-none">|</span>

    {/* ⑤ 操作按鈕二 */}
    <span
      onClick={handleActionB}
      className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
    >操作二</span>

  </div>
)}
```

> ⚠️ **注意**：操作按鈕使用 `<span>` 而非 `<button>`，字色為 `text-[#004680]`（非 `#005eb8`），分隔線用 `|` 字符加 `text-[rgba(145,158,171,0.4)]`，hover 效果為 `hover:opacity-70`（非 hover:underline）。
> 參考來源：`OrderListWithTabs.tsx` `batchActions` 區塊（第 1034-1044 行）

### CheckboxIcon 狀態說明

`CheckboxIcon` 支援三種視覺狀態，選取列時使用 `indeterminate`：

```tsx
<CheckboxIcon
  checked={isAllSelected}       // 全部選取 → 藍底白勾
  indeterminate={isSomeSelected} // 部分選取 → 藍底白橫線
  onChange={handleSelectAll}
/>

// 判斷邏輯（放在 hooks 宣告後）：
const isAllSelected  = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));
const isSomeSelected = selectedIds.size > 0 && !isAllSelected;
```

### 實作範例（出貨單查詢）

```
✅ 選取多筆 → 顯示: [☑] 3 selected  |  刪除單  |  重拋SAP
                                    ↑ 垂直分隔線（1px, rgba(0,94,184,0.24)）
```

---

## ⭐ 明細頁大 TAG 規範（Detail Page Document Number TAG）

> 在明細頁的操作列（Header bar）中，用於顯示單據號碼（如廠商出貨單號、修正單號）的大型 TAG 元件。

### 視覺規格

| 項目 | 規格 |
|------|------|
| 高度 | `h-[48px]` |
| 圓角 | `rounded-[8px]` |
| 最小寬度 | `min-w-[48px]`（自動依內容撐開） |
| padding | `px-[12px]` |
| 上方標籤文字 | `text-[10px]`、`font-normal`、`opacity-70`、`leading-[14px]` |
| 下方值文字 | `text-[16px]`、`font-semibold`、`leading-[22px]`、`whitespace-nowrap` |
| 文字對齊 | 置中（`text-center`） |
| 參考來源 | `CorrectionDetailPage.tsx` Header bar 區塊（Tag 1 & Tag 2） |

### 色票

| 用途 | 背景色 | 邊框色 | 文字色 |
|------|--------|--------|--------|
| 藍色（廠商出貨單號、修正單號） | `#005eb8` | `#003d82` | `white` |
| 深色（修正類型，不拆單/拆單） | `#1c252e` | 無 | `white` |
| 紅色（刪單模式） | `#ff5630` | 無 | `white` |
| 綠色（訂單狀態 CK） | `#d3f4e0` | `#118d57` | `#118d57` |

### 結構模板

```tsx
{/* 大 TAG：單據號碼（藍色） */}
<div
  className="h-[48px] min-w-[48px] relative rounded-[8px] shrink-0"
  style={{ backgroundColor: '#005eb8' }}
>
  {/* 邊框 overlay */}
  <div
    aria-hidden="true"
    className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]"
    style={{ borderColor: '#003d82' }}
  />
  <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
    <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[12px] relative">
      <div className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[16px] text-center whitespace-nowrap text-white">
        {/* 上方小標籤 */}
        <p className="text-[10px] font-normal opacity-70 mb-0 leading-[14px]">標籤文字</p>
        {/* 下方主值 */}
        <p>單據號碼</p>
      </div>
    </div>
  </div>
</div>
```

### 使用時機

- 明細頁 Header bar 中顯示**當前單據號碼**（如廠商出貨單號、修正單號）
- 同一列可並排多個 TAG（如修正類型 TAG + 修正單號 TAG）
- **不適用於**：列表表格、搜尋結果、小型狀態標籤（那些應用 Badge 元件）

---

## ⭐ 區塊標題規範（Section Title）

> 明細頁內各區塊的標題元件，帶有底部黑色 2px 底線，用於區分不同功能區塊。
> **禁止自行使用 `<h2>` + 自訂樣式或 `border-b` 實作，必須使用以下標準結構。**

### 視覺規格

| 項目 | 規格 |
|------|------|
| 高度 | `h-[48px] min-h-[48px]` |
| 字體 | `font-semibold`（600）, `text-[18px]` |
| 字色 | `text-[#1c252e]` |
| 底線 | `absolute border-[#1c252e] border-b-2 border-solid inset-0`（覆蓋整個高度的底線） |
| 左右 padding | `px-[4px]` |
| 參考來源 | `InvoiceDetailPage.tsx`（第 865–870 行）、`ShipmentDetailPage.tsx` |

### HTML 結構模板

```tsx
{/* 區塊標題（Section Title）*/}
<div className="h-[48px] min-h-[48px] relative shrink-0">
  {/* 底線：absolute 覆蓋整個高度 */}
  <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
  <div className="flex items-center justify-center h-full px-[4px]">
    <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">
      區塊名稱
    </p>
  </div>
</div>
```

### 帶額外資訊的區塊標題（如計數、副標題）

若需在標題右側顯示附加資訊（數量、狀態等），將標題與附加資訊水平排列：

```tsx
<div className="flex items-center gap-[8px]">
  {/* 標準區塊標題 */}
  <div className="h-[48px] min-h-[48px] relative shrink-0">
    <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
    <div className="flex items-center justify-center h-full px-[4px]">
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">
        區塊名稱
      </p>
    </div>
  </div>
  {/* 計數或附加資訊 */}
  <span className="text-[14px] text-[#637381]">(3)</span>
</div>
```

### 使用時機

- 明細頁內容卡片中，區分不同功能區塊的標題（如「基本資料設定」、「品牌設定」、「發票明細」）
- 每個區塊開頭使用，搭配下方內容形成視覺分層
- **不適用於**：TAB 標籤（用 TAB 規範）、頁面主標題（用 PageHeader）

---


建立新元件時，依序遵循此決策樹：

```
需要一個新 UI 元素？
  │
  ├─ 是否已有對應業務元件（Step 3 清單）？
  │    └─ 是 → 直接使用，不新增
  │
  ├─ 是否為通用 UI 模式（按鈕、輸入框、對話框...）？
  │    └─ 是 → 使用 shadcn/ui 元件（Step 2 清單）
  │
  ├─ 需要業務邏輯封裝？
  │    └─ 是 → 在業務元件基礎上封裝，並加入 Step 3 清單
  │
  └─ 確實需要全新樣式？
       └─ 是 → 使用設計系統 CSS 變數（Step 1），禁止寫死色碼
```

---

## ⭐ 全域性 UI 設計規範

> 以下規則由使用者確認，**適用全系統所有頁面**，實作時無需重複詢問。

---

### 5. 狀態 Badge（Status Badge）

> 表格中顯示單據狀態（如 DR/V/B/SC/CL/CC）的色塊標籤。

| 屬性 | 規格 |
|------|------|
| 形狀 | `rounded-[6px]`（**⚠️ 禁止使用 `rounded-full`，系統無圓形 Badge**） |
| 高度 | `h-[24px]` |
| 最小寬度 | `min-w-[24px]` |
| 內距 | `px-[6px]` |
| 字型 | `font-['Public_Sans:Bold',sans-serif] font-bold` |
| 字體大小 | `text-[12px]` |
| 行高 | `leading-[20px]` |
| 內容 | 狀態**代碼**文字（如 `V`、`SC`、`CL`），`text-center whitespace-nowrap` |
| 參考來源 | `CorrectionListWithTabs.tsx` `StatusBadge` 元件（第 180 行） |

#### 標準結構

```tsx
<div className="h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px]"
     style={{ backgroundColor: bgColor }}>
  <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-center whitespace-nowrap"
     style={{ color: textColor }}>
    {statusCode}
  </p>
</div>
```

---

### 6. 連結（Link）樣式

> 所有可點擊的藍字連結（如單號序號、截止日期等）必須統一使用以下規範。

| 屬性 | 規格 |
|------|------|
| **⚠️ 字型（必填）** | `font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif]`（**缺少此 class 字型會錯，必須與 `font-normal` 一起使用**） |
| 顏色 | `text-[#1677ff]` |
| 底線 | `underline`（**常態顯示，非 hover 才出現**） |
| Hover 顏色 | `hover:text-[#0958d9]`（加深） |
| 過渡動畫 | `transition-colors` |
| 參考來源 | `PartsMaintenancePage.tsx` 料號欄、`HistoryOrderListWithTabs.tsx` 單號序號欄 |

#### 標準 className

```tsx
className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
```

#### 使用範例

```tsx
<button
  onClick={handleClick}
  className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
>
  40065100110
</button>
```

> ⚠️ **禁止**：
> - ❌ `text-[#1890ff]`（操作按鈕色，不適用連結）
> - ❌ `text-[#005eb8]`（TAG/主色，不適用連結）
> - ❌ `hover:underline`（底線必須常態顯示，不能只在 hover 顯示）

---

### 1. TAB 樣式（頁籤切換）

適用場景：所有頁面層級的 TAB 切換列（如「出貨明細查詢 / 裝箱明細查詢」、「基本資料 / 業務帳號 / 其他聯絡人」）。

**必須使用以下結構（對齊 `VendorDetailPage.tsx` `Tabs` 元件）**：

```tsx
{/* TAB 外層容器 */}
<div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">

  {/* 每個 TAB */}
  <div
    onClick={() => setActiveTab('tabId')}
    className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
  >
    {/* Active 底線：absolute border-b-2 蓋滿整個 tab 高度 */}
    {activeTab === 'tabId' && (
      <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
    )}
    {/* TAB 文字 */}
    <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
      activeTab === 'tabId' ? 'text-[#1c252e]' : 'text-[#637381]'
    }`}>
      TAB 標題
    </p>
  </div>

  {/* 底部統一灰色底線（所有 TAB 共用，absolute） */}
  <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
</div>
```

| 項目 | 規格 |
|------|------|
| 高度 | `h-[48px]` |
| 間距 | `gap-[40px]` 左右 padding `px-[20px]` |
| 字體 | `font-medium text-[14px]` |
| Active 底線 | `absolute border-b-2 border-[#1c252e] inset-0`，蓋滿整個 tab 格 |
| Inactive 字色 | `text-[#637381]` |
| Active 字色 | `text-[#1c252e]` |
| 底部背景線 | `absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0` |
| 參考來源 | `VendorDetailPage.tsx` `Tabs` 元件（第 35–97 行） |

---

### 2. 搜尋列規範（不加裝飾線 + 平均欄寬 + 使用 SearchField）

頁面中搜尋條件區塊有三個強制規則：

#### 2-1. 不加 `border-b`
搜尋條件區塊**下方不加** `border-b`，TableToolbar 本身已有分隔效果。

#### 2-2. ⭐ 搜尋欄位平均欄寬（必須遵守）
每個搜尋欄位**必須**用 `<div className="flex-1 min-w-0">` 包裹，讓所有欄位自動平均分配可用寬度。  
**禁止**用 `style={{ width: 'Xpx' }}` 或 `w-[Xpx]` 固定個別欄寬。

```tsx
{/* ✅ 正確：平均欄寬，每個欄位 flex-1 min-w-0 */}
<div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
  <div className="flex-1 min-w-0">
    <DropdownSelect label="採購組織" value={...} onChange={...} options={...} />
  </div>
  <div className="flex-1 min-w-0">
    <SearchField label="供應商" value={...} onChange={...} />
  </div>
  <div className="flex-1 min-w-0">
    <SearchField label="料號" value={...} onChange={...} />
  </div>
</div>

{/* ❌ 錯誤：固定寬度，欄位不等寬 */}
<div className="shrink-0 flex flex-wrap gap-[12px] items-end px-[20px] py-[16px]">
  <div style={{ width: '200px' }}><DropdownSelect .../></div>
  <div style={{ width: '220px' }}><input .../></div>  {/* ❌ 也禁止用原生 input */}
</div>
```

#### 2-3. 文字輸入欄位使用 `SearchField`，禁止用原生 `<input>`
搜尋列中的文字輸入一律使用 `<SearchField>` 元件，**禁止自製 `<input>` + 自訂浮動 label**。

```tsx
{/* ✅ */}
<SearchField label="供應商" value={keyword} onChange={setKeyword} placeholder="名稱或代碼關鍵字" />

{/* ❌ 禁止 */}
<div className="relative" style={{ width: '220px' }}>
  <div className="absolute inset-0 ...border..." />
  <p className="absolute ...label...">供應商</p>
  <input type="text" className="w-full h-[54px]..." />
</div>
```

| 規則 | 說明 |
|------|------|
| 容器 | `shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]` |
| 每個欄位 | `<div className="flex-1 min-w-0">` 包裹 |
| 下拉 | `<DropdownSelect>` |
| 文字輸入 | `<SearchField>` |
| 裝飾線 | 無 `border-b` |
| 參考來源 | `QuotationPrintListPage.tsx`（第 224–250 行）|

---

### 3. 表身（表格 row）字體大小統一 14px

所有資料表格的 cell 文字（falback text、數值、字串）一律使用 `text-[14px]`，**不使用 `text-[13px]`**。

```tsx
{/* ✅ 正確：表格 cell 值文字 */}
<p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ...">
  {value}
</p>

{/* ❌ 錯誤 */}
<p className="... text-[13px] ...">...
```

> 例外：`SearchField` 的 floating label（壓在框線上方的小標題）使用 `text-[13px]`，這是正確的且不受此規範影響。

---

### 4. 分頁（PaginationControls）預設每頁 100 筆

所有使用 `PaginationControls` 的頁面，`perPage` 初始值一律設為 `100`：

```tsx
{/* ✅ */}
const [perPage, setPerPage] = useState(100);

{/* ❌ */}
const [perPage, setPerPage] = useState(50);
```

---

### 6. ⭐ 功能列表頁的正確 Layout 結構（避免出現多餘分隔線/弧角）

> **問題根源**：`StandardDataTable` 自帶 `rounded-[16px] shadow` 的 card 外框。若在外層再包一個 card div，兩層 card 疊加會在搜尋列下方出現一條奇怪分隔線，以及表格左上角出現露出的弧角。

#### ✅ 正確結構：一個外層 card 包住搜尋列 + StandardDataTable

```tsx
// 參考：PartsMaintenancePage.tsx、QuotationPrintListPage.tsx

return (
  {/* 唯一的 card wrapper，包含所有內容 */}
  <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

    {/* A. Tabs（如有）*/}
    ...

    {/* B. 搜尋列：無 border-b，無額外 shadow/rounded */}
    <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
      <DropdownSelect ... />
      <SearchField ... />
    </div>

    {/* C. StandardDataTable：必須加 className="rounded-none shadow-none" */}
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <StandardDataTable
        ...
        className="rounded-none shadow-none"
      />
    </div>
  </div>
);
```

#### ❌ 錯誤結構（勿用）

```tsx
// ❌ 錯誤：外層 card + 內層 StandardDataTable card = 兩層 card 疊加
<div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[...] overflow-hidden">
  <div className="shrink-0 border-b ...">  {/* ❌ 加了 border-b */}
    <SearchField />
  </div>
  <div className="flex-1 min-h-0">
    <StandardDataTable />  {/* ❌ 沒有 className="rounded-none shadow-none" */}
  </div>
</div>
```

#### 關鍵規則

| 規則 | 說明 |
|------|------|
| 搜尋列 **不加** `border-b` | 見規範 2，加了會變成多餘分隔線 |
| `StandardDataTable` 嵌入時必加 `className="rounded-none shadow-none"` | 去掉自帶的 card 圓角，否則左上角露出弧角 |
| 整頁只有**一個** card wrapper div | 外層 card 提供圓角 shadow，不再需要 StandardDataTable 自帶的 card 樣式 |

---

### 7. ⭐ Checkbox 事件處理規範（避免雙重 toggle 互相抵銷）

> **問題根源**：`CheckboxIcon` 的 `onChange` 和外層 `<button>` / container `div` 的 `onClick` 同時呼叫同一個 handler，導致 toggle 被執行兩次，functional state update 疊加後回到原始狀態，看起來像「點不到」。

#### ✅ 正確寫法：handler 只交由一方呼叫

```tsx
{/* ✅ row checkbox cell：cell div 只負責 stopPropagation，handler 由 CheckboxIcon.onChange 呼叫 */}
<div
  data-is-checkbox="true"   // 必加，讓 useHorizontalDragScroll 跳過此區域
  onClick={e => e.stopPropagation()}  // 只阻止事件繼續冒泡到 row，不呼叫 handler
>
  <CheckboxIcon checked={selectedIds.has(row.id)} onChange={() => handleToggleRow(row.id)} />
</div>

{/* ✅ 全選 button：button 負責呼叫，CheckboxIcon 不再傳 onChange */}
<button onClick={handleSelectAll}>
  <CheckboxIcon checked={isAllSelected} indeterminate={isSomeSelected} />
  {/* ❌ 錯誤寫法：onChange={handleSelectAll} — 會和 button.onClick 各呼叫一次，兩次 toggle 抵銷 */}
</button>
```

#### ❌ 錯誤寫法

```tsx
{/* ❌ 錯誤：cell div 和 CheckboxIcon 都呼叫 handler → 執行兩次 → 抵銷 */}
<div onClick={e => { e.stopPropagation(); handleToggleRow(row.id); }}>
  <CheckboxIcon onChange={() => handleToggleRow(row.id)} />
</div>

{/* ❌ 錯誤：button 和 CheckboxIcon 都呼叫 handler */}
<button onClick={handleSelectAll}>
  <CheckboxIcon onChange={handleSelectAll} />
</button>
```

#### 規則摘要

| 情境 | 誰呼叫 handler | CheckboxIcon |
|------|---------------|---------------|
| row checkbox cell | `CheckboxIcon.onChange` | 有 `onChange` |
| 全選 button（Selection Toolbar 或表頭） | `button.onClick` | **無** `onChange` |
| row checkbox cell 的外層 div | 只 `stopPropagation()` | — |

> ⚠️ **所有 checkbox cell container 必須加 `data-is-checkbox="true"`**，讓 `useHorizontalDragScroll` 排除這個區域，否則整個 checkbox 欄只有 SVG 本身可以點擊（外圈空白會被 drag scroll 攔截）。


### 8. ⭐ ToggleSwitch 在表格 Cell 中的正確用法

> 表格列中放置啟用/停用 Toggle 時，必須加 `stopPropagation` 包裹，避免 Toggle 點擊事件冒泡到列的 `onRowClick` 或 drag scroll 機制。

#### ✅ 正確寫法

```tsx
// renderCell 或 inline cell JSX
case 'enabled':
  return (
    <div onClick={e => e.stopPropagation()}>
      <ToggleSwitch
        checked={row.enabled}
        onChange={() => handleToggle(row.id)}
      />
    </div>
  );
```

#### ❌ 錯誤寫法

```tsx
// ❌ 沒有 stopPropagation wrapper → 點 Toggle 會觸發 row click / drag scroll
<ToggleSwitch checked={row.enabled} onChange={() => handleToggle(row.id)} />
```

| 規則 | 說明 |
|------|------|
| wrapper div | `onClick={e => e.stopPropagation()}` 必填 |
| 啟用色 | `#22c55e`（綠），停用色 `#919EAB`（灰），由 `ToggleSwitch` 內建，禁止外部覆寫 |
| 欄寬 | `width: 72, minWidth: 72` |
| 參考來源 | `ScheduleSettingsPage.tsx` `renderCell` `enabled` case |

---

### 9. ⭐ 設定類列表頁規範（Settings List Page）

> 管理「系統設定項目」的列表頁（如排程設定、權限設定、發票設定等），需遵循以下固定結構。

#### 頁面結構

```
白色 card wrapper（rounded-[16px] shadow）
  ├── A. 搜尋列（flex-1 min-w-0 等寬欄位）
  ├── B. TableToolbar（含「新增」actionButton）
  ├── C. 表格（DnD + 欄寬 + 橫向拖拉）
  │     ├── 表頭：DraggableColumnHeader × n + flex-1 fill + sticky-right 操作欄
  │     └── 資料列：badge cell + link cell + ToggleSwitch cell + sticky-right EditButton
  └── D. PaginationControls
```

#### 「新增」按鈕放在 TableToolbar actionButton

```tsx
<TableToolbar
  ...
  actionButton={
    <button
      onClick={openAdd}
      className="flex items-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors"
    >
      新增
    </button>
  }
/>
```

#### Sticky-right 操作欄（表頭 + 資料列）

```tsx
{/* 表頭 sticky-right */}
<div
  className="bg-[#f4f6f8] flex items-center justify-center shrink-0"
  style={{ width: 64, height: 56, position: 'sticky', right: 0, zIndex: 21, boxShadow: '-2px 0 4px -2px rgba(145,158,171,0.2)' }}
/>

{/* 資料列 sticky-right */}
<div
  className="flex items-center justify-center px-[8px] shrink-0 bg-white group-hover:bg-[#f5f6f7]"
  style={{ width: 64, minWidth: 64, position: 'sticky', right: 0, zIndex: 4, boxShadow: '-2px 0 4px -2px rgba(145,158,171,0.2)' }}
>
  <EditButton onClick={() => openEdit(row)} />
</div>
```

#### 分類 Badge（category badge in table cell）

```tsx
<span className={`inline-flex items-center h-[22px] px-[8px] rounded-[6px] text-[12px] font-semibold leading-none whitespace-nowrap ${
  category === '信件通知'
    ? 'bg-[rgba(0,94,184,0.12)] text-[#005eb8]'
    : 'bg-[rgba(183,110,0,0.12)] text-[#b76e00]'
}`}>
  {category}
</span>
```

| 規則 | 說明 |
|------|------|
| 操作欄欄寬 | `width: 64, minWidth: 64` |
| 操作欄 zIndex（表頭）| `zIndex: 21` |
| 操作欄 zIndex（資料列）| `zIndex: 4` |
| 操作欄 boxShadow | `-2px 0 4px -2px rgba(145,158,171,0.2)` |
| 分類 badge 圓角 | `rounded-[6px]`（非 rounded-full）|
| 排程名稱連結 | 點擊開啟 Edit Modal（非 `text-[#1677ff] underline`，用 `text-[#005eb8] hover:underline`）|
| 參考來源 | `ScheduleSettingsPage.tsx` |

---


```tsx
// ✅ 使用 shadcn/ui Button
import { Button } from '@/app/components/ui/button';
<Button variant="outline">取消</Button>

// ✅ 使用業務 DropdownSelect
import { DropdownSelect } from './DropdownSelect';
<DropdownSelect label="城市" value={city} onChange={setCity} options={cityOptions} />

// ✅ 使用設計系統色彩 token
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">

// ✅ 使用 custom-scrollbar
<div className="overflow-y-auto custom-scrollbar">

// ✅ 使用既有佈局元件
import { ResponsivePageLayout } from './ResponsivePageLayout';
```

### ❌ 禁止做

```tsx
// ❌ 寫死顏色
<div style={{ backgroundColor: '#ffffff', color: '#0a0a0a' }}>

// ❌ 寫死顏色 class（非 token）
<div className="bg-white text-black">

// ❌ 重新建立已有的業務元件
const MyDropdown = () => { /* 自製下拉選單 */ }

// ❌ 省略設計系統圓角
<div style={{ borderRadius: '10px' }}>  // 應使用 rounded-lg
```

---

## Step 6：新功能開發前的 Checklist

在開始撰寫任何 JSX 前，完成以下確認：

- [ ] ⭐ **先找同類型的既有功能頁面，閱讀其原始碼**。例如：列表頁找 `ShippingBasicSettingsPage.tsx`（使用 `StandardDataTable`）或 `OrderListWithTabs.tsx`（手動組裝表格），明細頁找 `CorrectionDetailPage.tsx`。**完全對齊該頁面的 HTML 結構、className、元件組合方式，禁止自行設計版面佈局。**
- [ ] 查看設計系統 `theme.css` 確認色彩 token
- [ ] 確認 `src/app/components/ui/` 有無可用的 shadcn 元件
- [ ] 確認 `src/app/components/` 有無已封裝的業務元件
- [ ] 確認不使用寫死色碼（`#ffffff`、`rgb(...)` 等）
- [ ] 確認 scrollable 容器套用 `.custom-scrollbar`
- [ ] 表單類下拉選擇使用 `DropdownSelect` 而非原生 `<select>`
- [ ] **若新功能有顯示「更新時間 / 資料更新時間」，必須使用 `UpdateTimeLabel` 或 `NextUpdateTooltip`**（見「更新時間元件規範」章節）

---

## 參考資源

| 資源 | 路徑 |
|------|------|
| 設計系統 CSS 變數 | `src/styles/theme.css` |
| shadcn/ui 元件庫 | `src/app/components/ui/` |
| 業務元件 | `src/app/components/` |
| DropdownSelect 文件 | `src/app/components/README_Dropdown.md` |
| 頁面佈局範例 | `src/app/components/OrderListWithTabs.tsx` |
| 表單頁面範例 | `src/app/components/CorrectionCreatePage.tsx` |
| 帳號設定範例 | `src/app/components/EmployeeAccountSettingPage.tsx` |
| ⭐ **操作按鈕元件** | `src/app/components/ActionButtons.tsx` |
| ⭐ **標準表格元件** | `src/app/components/StandardDataTable.tsx` |
| ⭐ **標準表格手動模板** | `src/app/components/HistoryOrderListWithTabs.tsx` |
| ⭐ **更新時間元件** | `src/app/components/UpdateTimeLabel.tsx` |
