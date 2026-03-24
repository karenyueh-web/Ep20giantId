# COMPONENT_MANIFEST.md — Giant Global EP 元件清單

> 掃描自 `src/app/components/`，共 81 個檔案。本文件僅收錄**可複用 UI 元件**（排除頁面、context、資料層）。

---

## 元件分類總覽

| 類別 | 元件數 | 元件名稱 |
|------|--------|---------|
| 基礎選取 | 4 | CheckboxIcon, CustomCheckbox, DropdownSelect, FilterSelect |
| 表格系統 | 7 | AdvancedOrderTable, AdvancedForecastTable, AdvancedGiantTable, AdvancedContactsTable, AdvancedSalesTable, AdvancedQualityTable, AdvancedMailSettingsTable |
| 工具列 | 3 | TableToolbar, ColumnSelector, FilterDialog |
| 分頁 | 1 | PaginationControls |
| Overlay / Modal | 2 | BaseOverlay, OrderDetail |
| 導覽 | 2 | NavigationList, NavVertical |
| 狀態 | 1 | StatusBadge（內嵌於各表格元件） |

---

## 一、基礎選取元件

---

### 1. CheckboxIcon

**路徑：** `components/CheckboxIcon.tsx`
**用途：** 表格 Checkbox 欄、SelectionToolbar 全選控制

#### Props
```ts
interface CheckboxIconProps {
  checked: boolean;
  onClick?: () => void;       // 次要，優先 onChange
  onChange?: (checked: boolean) => void; // 主要事件
}
```

#### 視覺規格
```
size: 20×20px
checked fill: #1D7BF5（品牌藍）
unchecked fill: #919EAB（disabled 色）
hover: opacity-80
transition: opacity
cursor: pointer
```

#### 使用範例
```tsx
<CheckboxIcon checked={selected} onChange={v => setSelected(v)} />
```

---

### 2. CustomCheckbox

**路徑：** `components/CustomCheckbox.tsx`
**用途：** 小型 checkbox，用於 ColumnSelector 欄位切換

#### Props
```ts
interface CustomCheckboxProps {
  checked: boolean;
  onClick: () => void;
}
```

#### 視覺規格
```
size: 16×16px
checked: rect fill #1D7BF5 + checkmark stroke white 1.5px, rx=2
unchecked: rect fill #B0B8C1, rx=1.5
cursor: pointer
```

> **差異：** CheckboxIcon 用 SVG path（來自 imports），CustomCheckbox 直接在元件內繪製 SVG。

---

### 3. DropdownSelect

**路徑：** `components/DropdownSelect.tsx`
**用途：** 表單字段用下拉選擇器（有 floating label），用於 OrderDetail、修正單建立表單

#### Props
```ts
interface DropdownSelectProps {
  label: string;                              // floating label 文字
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; color?: string }[];
  placeholder?: string;                       // 預設 ''
  error?: boolean;                            // 錯誤狀態（邊框紅色）
  className?: string;
  searchable?: boolean;                       // 是否顯示搜尋框，預設 false
}
```

#### 視覺規格
```
主容器高度: 54px; rounded-[8px]
邊框: 1px solid rgba(145,158,171,0.2)（正常）/ red-500 2px（錯誤）
Floating label: 絕對定位 top:-5px left:14px; text-[12px] #637381（正常）/ red-500（錯誤）
  背景切割: bg-white h-[2px]（遮蓋邊框）
顯示文字: 15px Regular #1c252e; px-[14px]
下拉箭頭: 24px SVG fill #637381

下拉選單:
  top: 58px; rounded-[8px]
  border: rgba(145,158,171,0.2); max-h-[300px]
  選項 hover: bg-[rgba(145,158,171,0.08)]
  選項文字: 14px Regular #1c252e
  空結果: 14px #919eab「無符合的選項」

搜尋欄（searchable=true）:
  input: px-[12px] py-[8px]; border rgba(145,158,171,0.2); rounded-[6px]
  focus: border-[#2196F3]
```

---

### 4. FilterSelect

**路徑：** `components/FilterSelect.tsx`
**用途：** 搜尋列篩選欄位（react-select 封裝），用於 OrderListWithTabs 頂部搜尋

#### Props
```ts
interface FilterSelectProps {
  placeholder?: string;        // 預設「選擇...」
  value?: string | null;
  options: { value: string; label: string }[];
  onChange?: (value: string | null) => void;
  isDisabled?: boolean;        // 預設 false
  isClearable?: boolean;       // 預設 true
}
```

#### 視覺規格（react-select 自訂樣式）
```
control 高度: 40px; rounded-[8px]
邊框: 1px rgba(145,158,171,0.2)（正常）/ #2196F3（focused）
hover 邊框: rgba(145,158,171,0.4)

dropdown indicator: #637381，hover #1c252e
clear indicator: #637381，hover #ff5630

下拉選單: rounded-[8px]; shadow: 0 4px 12px rgba(0,0,0,0.15); mt-[4px]
選項: 14px Public_Sans:Regular; padding 10px 12px; rounded-[4px]
  selected: bg #2196F3; text white
  focused: bg rgba(33,150,243,0.1)

placeholder: 14px #919eab
singleValue: 14px #1c252e
```

---

## 二、工具列元件

---

### 5. TableToolbar

**路徑：** `components/TableToolbar.tsx`
**用途：** 表格上方工具列，含結果計數、Columns/Filters/Export 按鈕

#### Props
```ts
interface TableToolbarProps {
  resultsCount: number;
  showColumnSelector: boolean;
  showFilterDialog: boolean;
  onColumnsClick: () => void;
  onFiltersClick: () => void;
  columnsButton?: React.ReactNode;   // ColumnSelector 面板
  filtersButton?: React.ReactNode;   // FilterDialog 面板
  actionButton?: React.ReactNode;    // 自訂右側按鈕（如 SelectionToolbar）
  onExportExcel?: () => void;        // 有此 prop 才顯示 Export > 匯出 Excel
  onExportCsv?: () => void;          // 有此 prop 才顯示 Export > 匯出 CSV
}
```

#### 視覺規格
```
容器: px-[20px] py-[16px]; bg-white; flex justify-between items-center

左側計數:
  "{count} " SemiBold 14px #1c252e
  "results found" Regular 14px #637381

右側按鈕組（gap-[12px]）:
  各按鈕: h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)]
  icon: 18px SVG stroke #1C252E
  label: Bold 13px #1c252e

Export Dropdown（有 onExportExcel/Csv 時顯示）:
  卡片: w-[280px] rounded-[10px]
        shadow: 0px 0px 2px rgba(145,158,171,0.24), 0px 20px 40px -4px rgba(145,158,171,0.24)
        border: rgba(145,158,171,0.12); py-[6px]
  Excel 選項: icon stroke #118d57; SemiBold 13px + Regular 11px 描述
  CSV 選項: icon stroke #005eb8; 同上
  item: px-[14px] py-[10px]; hover:bg-[rgba(145,158,171,0.06)]
```

---

### 6. ColumnSelector

**路徑：** `components/ColumnSelector.tsx`
**用途：** 欄位顯示/隱藏切換面板，點擊 Toolbar Columns 按鈕後呈現

#### Props
```ts
interface ColumnSelectorProps {
  columns: { key: string; label: string; visible?: boolean }[];
  onToggleColumn: (key: string) => void;
  onToggleAll?: (selectAll: boolean) => void;
  onClose: () => void;
  onApply: () => void;
}
```

#### 視覺規格
```
卡片: w-[280px] max-h-[450px] rounded-[8px]
      shadow: 0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px rgba(145,158,171,0.12)

標題列: px-[16px] py-[12px]; border-b rgba(145,158,171,0.08)
  計數: SemiBold 14px #1c252e「顯示欄位 (n/total)」
  all 按鈕: SemiBold 14px #1D7BF5; hover #1565C0

欄位行: px-[16px] py-[12px]; hover:bg-[rgba(145,158,171,0.04)]
  checkbox（CustomCheckbox 16px）:
    checked: fill #1D7BF5 + white checkmark
    unchecked: border rgba(145,158,171,0.3) 2px; bg white; rounded-[4px]
  label: Regular 14px #1c252e

底部按鈕:
  取消: px-[16px] py-[8px] rounded-[8px]; text-[#637381]; hover:bg-[rgba(145,158,171,0.08)]
  應用: bg-[#1D7BF5]; text-white; hover:bg-[#1565C0]; rounded-[8px]
```

---

### 7. FilterDialog

**路徑：** `components/FilterDialog.tsx`
**用途：** 進階篩選條件設定面板，點擊 Toolbar Filters 按鈕後呈現

#### Props
```ts
export interface FilterCondition {
  id: string;
  column: string;
  operator: 'contains' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty';
  value: string;
}

interface FilterDialogProps {
  filters: FilterCondition[];
  availableColumns: { key: string; label: string }[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  onClose: () => void;
  onApply: () => void;
}
```

#### 操作符選項
```
包含 / 等於 / 不等於 / 開頭是 / 結尾是 / 為空 / 不為空
（isEmpty / isNotEmpty 不顯示 value 輸入框）
```

#### 視覺規格
```
卡片: w-[480px] max-h-[500px] rounded-[8px]
      shadow: 0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px rgba(145,158,171,0.12)

標題列: px-[16px] py-[12px]; border-b rgba(145,158,171,0.08)
  SemiBold 14px #1c252e「進階篩選 (n)」

篩選行（flex gap-[8px]）:
  欄位 select: flex-1 h-[36px]; border rgba(145,158,171,0.2); rounded-[6px]
  操作符 select: w-[120px] h-[36px]; 同上
  值 input: flex-1 h-[36px]; 同上; focus:#1D7BF5
  刪除按鈕: 36×36px rounded-[6px]; icon stroke #FF5630; hover:bg-[rgba(255,86,48,0.08)]

新增條件按鈕:
  w-full h-[36px]; border-dashed rgba(145,158,171,0.3)
  hover: border-[#1D7BF5] bg-[rgba(29,123,245,0.04)]
  icon + 文字 SemiBold 14px #1D7BF5

底部按鈕: 同 ColumnSelector
```

---

## 三、分頁元件

---

### 8. PaginationControls

**路徑：** `components/PaginationControls.tsx`
**用途：** 表格底部分頁控制列

#### Props
```ts
interface PaginationControlsProps {
  currentPage?: number;          // 預設 1
  totalItems: number;
  itemsPerPage?: number;         // 預設 100
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}
```

#### PAGE_SIZE_OPTIONS（固定）
```
[100, 500, 1000, 5000]
```

#### 視覺規格
```
容器: flex gap-[20px] items-center justify-center; px-[8px] py-[10px]
文字: Regular 14px #1c252e

Rows per page 下拉按鈕:
  px-[10px] py-[4px] rounded-[6px]
  border: rgba(145,158,171,0.32)（正常）/ rgba(145,158,171,0.56)（hover）
  文字: Regular 14px #1c252e min-w-[36px] text-center
  chevron: 16px SVG，open 時 rotate-180

下拉選單（fixed 定位突破 overflow:hidden）:
  bg-white rounded-[8px]
  shadow: 0px 8px 24px -4px rgba(145,158,171,0.24), 0px 0px 2px rgba(145,158,171,0.2)
  border: rgba(145,158,171,0.16)
  選項: px-[20px] py-[9px]; text-center; text-[14px]
    已選中: bg-[rgba(0,94,184,0.08)] font-semibold text-[#005eb8]
    hover: bg-[rgba(145,158,171,0.08)] text-[#1c252e]

範圍文字: "{start}–{end} of {total}"

導覽按鈕: 36×36px 圓形; hover:bg-[rgba(145,158,171,0.08)]
  不可用: opacity-30 cursor-not-allowed
```

---

## 四、Overlay 元件

---

### 9. BaseOverlay

**路徑：** `components/BaseOverlay.tsx`
**用途：** 所有 Overlay/Modal 的底層容器，提供背景遮罩 + 白色卡片

#### Props
```ts
interface BaseOverlayProps {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;     // 預設 '1000px'
  maxHeight?: string;    // 預設 '760px'
}
```

#### 視覺規格
```
遮罩層: fixed inset-0 z-[200]; bg-black/30; flex items-center justify-center; p-[20px]
  點擊遮罩 → onClose

卡片: bg-white; h-full w-full; rounded-[16px]
      shadow: -40px 40px 80px 0px rgba(145,158,171,0.24)
      flex flex-col overflow-hidden
      maxWidth / maxHeight 由 props 控制（預設 1000×760px）
      點擊卡片 → e.stopPropagation()
```

#### 延伸元件
以 BaseOverlay 為基礎包裝的元件包括：
`ForecastUploadOverlay`, `OrderBatchDialogs`, `AddVendorMailOverlay`

---

## 五、狀態徽章規格

StatusBadge 內嵌於各表格元件中，無獨立元件檔，以下為統一規格：

```
shape: inline-flex px-[8px] py-[2px] rounded-[6px]
font: SemiBold / Bold 12px leading-[20px]
```

| 狀態碼 | 文字 | 背景 | 文字色 |
|--------|------|------|--------|
| `NP` | 未確認 | `rgba(145,158,171,0.12)` | `#637381` |
| `V` | 廠商確認中 | `rgba(253,176,34,0.12)` | `#b76e00` |
| `B` | 待採購處理 | `rgba(255,86,48,0.12)` | `#b71d18` |
| `CK` | 採購確認 | `rgba(0,184,217,0.12)` | `#006c9c` |
| `CP` | 已確認 | `rgba(34,197,94,0.12)` | `#118d57` |
| `DR` | 草稿 | `rgba(145,158,171,0.12)` | `#637381` |
| `SS` | 執行中 | `rgba(99,115,129,0.12)` | `#454f5b` |
| `CL` | 已關閉 | `rgba(145,158,171,0.12)` | `#637381` |

---

## 六、表格大家族

以下元件共享 `AdvancedOrderTable` 的架構（DnD + Resizable + Sticky）：

| 元件 | 資料類型 | 主要差異 |
|------|---------|---------|
| `AdvancedOrderTable` | 採購訂單 | 包含 batchActions、actionButton 插槽 |
| `AdvancedForecastTable` | 預測訂單 | 含 importCSV、forecastUpload 功能 |
| `AdvancedGiantTable` | 巨大帳號 | 含 role 管理 |
| `AdvancedContactsTable` | 廠商聯絡人 | 含 mail 設定 |
| `AdvancedSalesTable` | 銷售訂單 | 唯讀，含 SalesRow 型別 |
| `AdvancedQualityTable` | 品質記錄 | 唯讀 |
| `AdvancedMailSettingsTable` | 信件設定 | 含 toggle 開關 |

所有表格共用設計規格詳見 `DESIGN.md 第九章`。

---

## 七、按鈕系統小結

| 類型 | 外觀 | 典型 class |
|------|------|-----------|
| Primary | 藍色實心 | `bg-[#1D7BF5] text-white rounded-[8px] px-[16px] py-[8px] hover:bg-[#1565C0]` |
| Secondary | 灰色文字，無背景 | `text-[#637381] rounded-[8px] px-[16px] py-[8px] hover:bg-[rgba(145,158,171,0.08)]` |
| ToolbarBtn（行動） | 純文字，無邊框 | `text-[#004680] SemiBold 14px hover:opacity-70` |
| Toolbar 圖示按鈕 | 圖示+文字，透明背景 | `h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)]` |
| Danger | 紅色 hover | `hover:bg-[rgba(255,86,48,0.08)]` + icon stroke #FF5630 |
| Ghost（新增條件） | 虛線邊框 | `border-dashed hover:border-[#1D7BF5] hover:bg-[rgba(29,123,245,0.04)]` |
