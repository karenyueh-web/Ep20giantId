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
| `CheckboxIcon.tsx` | Checkbox 圖示元件 |
| `useHorizontalDragScroll.ts` | 橫向拖拉捲動 hook |
| `PaginationControls.tsx` | 分頁控制元件 |

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
| ⭐ **標準表格元件** | `src/app/components/StandardDataTable.tsx` |
| ⭐ **標準表格手動模板** | `src/app/components/HistoryOrderListWithTabs.tsx` |
