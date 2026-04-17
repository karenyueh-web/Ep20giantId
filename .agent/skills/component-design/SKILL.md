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
| `SearchField` | `SearchField.tsx` | 搜尋輸入框（帶圖標） | - |
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
| ✅ **欄寬拖拽調整** | `re-resizable`（`<Resizable>`） | 拖拽欄位右邊框調整寬度，hover 顯示藍色高亮 |
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
2. 建立 `DraggableColHeader`（`useDrag` + `useDrop` + `<Resizable>`）
3. 主元件引入 `useHorizontalDragScroll`
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

  {/* B. 搜尋列 */}
  <div className="shrink-0 border-b px-[20px] py-[16px]">
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
| 參考來源 | `CorrectionCreatePage.tsx` `batchActions` 區塊 |

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
    <span className="font-semibold text-[14px] text-[#1c252e] leading-[24px] mr-[4px] whitespace-nowrap">
      {selectedIds.size} selected
    </span>

    {/* ③ 分隔線 */}
    <div className="w-[1px] h-[16px] bg-[rgba(0,94,184,0.24)] mx-[12px] shrink-0" />

    {/* ④ 操作一（藍色文字） */}
    <button
      onClick={handleActionA}
      className="font-semibold text-[14px] text-[#005eb8] hover:text-[#004a94] hover:underline transition-colors shrink-0 whitespace-nowrap"
    >
      操作一
    </button>

    {/* ⑤ 分隔線（多個操作時加） */}
    <div className="w-[1px] h-[16px] bg-[rgba(0,94,184,0.24)] mx-[12px] shrink-0" />

    {/* ⑥ 操作二（藍色文字） */}
    <button
      onClick={handleActionB}
      className="font-semibold text-[14px] text-[#005eb8] hover:text-[#004a94] hover:underline transition-colors shrink-0 whitespace-nowrap"
    >
      操作二
    </button>

  </div>
)}
```

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

## Step 4：設計決策流程

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

## Step 5：實作規範

### ✅ 應該做

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

- [ ] 查看設計系統 `theme.css` 確認色彩 token
- [ ] 確認 `src/app/components/ui/` 有無可用的 shadcn 元件
- [ ] 確認 `src/app/components/` 有無已封裝的業務元件
- [ ] 參考相似頁面（如 `OrderListWithTabs.tsx`、`CorrectionCreatePage.tsx`）的佈局模式
- [ ] 確認不使用寫死色碼（`#ffffff`、`rgb(...)` 等）
- [ ] 確認 scrollable 容器套用 `.custom-scrollbar`
- [ ] 表單類下拉選擇使用 `DropdownSelect` 而非原生 `<select>`

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
