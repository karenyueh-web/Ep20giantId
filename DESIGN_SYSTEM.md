# DESIGN_SYSTEM.md — Giant Global EP 設計系統

> **這是唯一的設計系統參考文件**，整合自 DESIGN.md、COMPONENT_MANIFEST.md、UI_PATTERNS.md。
> 每次新增功能前必須先讀此文件，**不得自行定義任何設計值**。

---

## 目錄

1. [技術棧](#一技術棧)
2. [Color Tokens](#二color-tokens)
3. [Typography](#三typography)
4. [尺寸系統](#四尺寸系統)
5. [陰影 & 遮罩系統](#五陰影--遮罩系統)
6. [Z-Index 層次](#六z-index-層次)
7. [Layout 規格](#七layout-規格)
8. [元件規格（獨立元件）](#八元件規格獨立元件)
9. [UI Patterns（未獨立但統一的視覺模式）](#九ui-patterns未獨立但統一的視覺模式)
10. [表格元件系統](#十表格元件系統)
11. [開發規範](#十一開發規範)

---

## 一、技術棧

| 項目 | 值 |
|------|---|
| CSS 框架 | Tailwind CSS v4（inline arbitrary values） |
| 字型 | Public Sans（英數）、Noto Sans JP（中文）、Inter |
| 圖示 | 自製 SVG（無 icon library） |
| 框架 | React + TypeScript (Vite) |
| DnD | react-dnd + HTML5Backend |
| 欄寬調整 | re-resizable |
| 下拉選擇 | react-select（FilterSelect 專用） |

---

## 二、Color Tokens

### 主要語意色

| Token | HEX | 用途 |
|-------|-----|------|
| `text-primary` | `#1c252e` | 主要文字（全專案 **1,463** 次，最高頻） |
| `text-secondary` | `#637381` | 次要文字、表頭標籤（**915** 次） |
| `text-disabled` | `#919eab` | 禁用文字、空值 —（**349** 次） |
| `text-link` | `#1677ff` | **藍字連結**（訂單號、修正單號），hover: `#0958d9` |
| `text-link-action` | `#004680` | ToolbarBtn 純文字行動按鈕 |
| `text-success` | `#118d57` | 成功、正數差異天數 |
| `text-error` | `#b71d18` | 錯誤、負數差異天數 |
| `text-warning` | `#b76e00` | 警告（V 狀態） |

> ❗ **連結藍統一使用 `#1677ff`**。`#005eb8` 僅用於 CSV icon 等非連結情境（圖示填色），不用於文字連結。

### 背景色

| Token | HEX | 用途 |
|-------|-----|------|
| `bg-page` | `#ffffff` | 主內容背景 |
| `bg-header` | `#f4f6f8` | 表格表頭（**343** 次）、禁用區域 |
| `bg-sidebar` | `#1c252e` | 左側導覽列（暗色） |
| `bg-toolbar-selected` | `#d9e8f5` | SelectionToolbar 選取背景 |
| `bg-row-selected` | `rgba(0,94,184,0.04)` | 表格選中列 |
| `bg-hover` | `rgba(145,158,171,0.04)` | 表格 row hover |
| `bg-btn-hover` | `rgba(145,158,171,0.08)` | Toolbar 按鈕 hover（**145** 次）|
| `bg-lang-selected` | `rgba(0,94,184,0.08)` | 語系 / 分頁 selected |

### 品牌藍

| Token | HEX | 用途 |
|-------|-----|------|
| `brand-blue` | `#1D7BF5` | Checkbox on、Apply 按鈕、Resize handle hover |
| `brand-csv-icon` | `#005eb8` | CSV 匯出 icon（**僅圖示**，非文字） |
| `brand-deep` | `#004680` | ToolbarBtn 文字、採購確認按鈕背景 |

### 狀態色

| 狀態 | 文字色 | 背景色 |
|------|--------|--------|
| CL / NP / DR | `#637381` | `rgba(145,158,171,0.12)` |
| V / 警告 | `#b76e00` | `rgba(253,176,34,0.12)` |
| B / 錯誤 | `#b71d18` | `rgba(255,86,48,0.12)` |
| CK | `#006c9c` | `rgba(0,184,217,0.12)` |
| CP / 成功 | `#118d57` | `rgba(34,197,94,0.12)` |
| SS | `#454f5b` | `rgba(99,115,129,0.12)` |

### 邊框色

| Token | 值 | 用途 |
|-------|---|------|
| `border-default` | `rgba(145,158,171,0.08)` | 表格分隔線、Panel header/footer border |
| `border-medium` | `rgba(145,158,171,0.12)` | Dropdown 邊框 |
| `border-strong` | `rgba(145,158,171,0.24)` | Filter badge |
| `border-input` | `rgba(145,158,171,0.2)` | 輸入框（一般），focus → `#1D7BF5` |
| `border-input-strong` | `rgba(145,158,171,0.32)` | Pagination 下拉按鈕 |

---

## 三、Typography

### 字型組合

| 類型 | class |
|------|-------|
| 標題 Bold | `font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold` |
| 標題 SemiBold | `font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold` |
| 內文 Regular | `font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal` |
| 數字/英文 Medium | `font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium` |

### 字體大小對照

| 場景 | size | leading | weight |
|------|------|---------|--------|
| 表格表頭 label | `14px` | `24px` | SemiBold |
| 表格資料列 | `14px` | `22px` | Regular |
| Toolbar badge / tag | `13px` | `22px` | Bold |
| 狀態小徽章 | `12px` | `20px` | SemiBold |
| Floating Label | `12px` | `12px` | SemiBold |
| Dropdown 描述文字 | `11px` | — | Regular |

---

## 四、尺寸系統

### Border Radius（圓角）— 掃描自 320 個檔案

| 值 | 次數 | 用途 |
|----|------|------|
| `8px` | **1,466** | 按鈕、Input、Dropdown容器（**主導值**） |
| `500px` | **376** | 圓形：頭像、Chip、圓形按鈕 |
| `16px` | **135** | 頁面主卡片、BaseOverlay 卡片 |
| `6px` | **90** | Status Badge、篩選 select、Danger 刪除按鈕 |
| `12px` | **73** | Tab badge、中型 Card |
| `10px` | **6** | Dropdown/Popover 浮層精緻版 |
| `4px` | **29** | CustomCheckbox |

**決策規則：**
```
36px input, 小按鈕    → rounded-[6px]
btn, input, dropdown   → rounded-[8px]（通用，最高頻）
dropdown panel 精緻版  → rounded-[10px]
medium card, tab badge → rounded-[12px]
page card, modal card  → rounded-[16px]
avatar, chip, round btn → rounded-[500px]
```

### Height（高度）— 標準高度系統

| 高度 | 次數 | 用途 |
|------|------|------|
| `h-[30px]` | 92 | Toolbar 圖示按鈕 |
| `h-[36px]` | **286** | Input 框、FilterDialog select |
| `h-[40px]` | **190** | FilterSelect（react-select）、搜尋按鈕 |
| `h-[48px]` | **294** | SelectionToolbar、Tab 列、主按鈕 |
| `h-[52px]` | — | 一般表格資料列 |
| `h-[54px]` | 99 | DropdownSelect（floating label） |
| `h-[56px]` | — | 表格表頭 |
| `h-[76px]` | 82 | 修正單/歷史訂單資料列 |

---

## 五、陰影 & 遮罩系統

### Box Shadow 層級

| 層級 | 值 | 用途 |
|------|---|------|
| **Card 標準** | `0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px rgba(145,158,171,0.12)` | Popover, Panel（**43** 次） |
| **Card 懸浮** | `0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px -4px rgba(145,158,171,0.12)` | Content Card（**30** 次） |
| **Modal** | `-40px 40px 80px 0px rgba(145,158,171,0.24)` | Overlay 卡片（**22** 次） |
| **Toast** | `0px 8px 16px rgba(0,0,0,0.16)` | 通知（**6** 次） |
| **Dropdown 精緻** | `0px 0px 2px rgba(145,158,171,0.24), 0px 20px 40px -4px rgba(145,158,171,0.24)` | Export 下拉（**3** 次） |
| **Sticky 右邊界** | `2px 0 4px -2px rgba(145,158,171,0.16)` | Checkbox sticky 欄 |
| **Sticky DocNo 右邊界** | `2px 0 4px -2px rgba(145,158,171,0.18)` | DocNo sticky 欄 |
| **Pagination 下拉** | `0px 8px 24px -4px rgba(145,158,171,0.24), 0px 0px 2px rgba(145,158,171,0.2)` | fixed 分頁選單 |

### Modal / Overlay 背景遮罩

```css
/* 統一規格（全專案 15+ 處） */
fixed inset-0 z-[200]
bg-black/30
flex items-center justify-center p-[20px]
```

---

## 六、Z-Index 層次

| z-index | 用途 |
|---------|------|
| `z-[1]` | Resizable handle（47 次） |
| `z-[2~5]` | 一般 Sticky 元素 |
| `z-[3]` | Sticky DocNo 資料列 |
| `z-[4]` | Sticky Checkbox 資料列 |
| `z-[10]` | 表格表頭 sticky |
| `z-[19]` | Sticky DocNo 表頭 |
| `z-[20]` | Sticky Checkbox 表頭 |
| `z-[100]` | Toolbar Dropdown（Columns/Filters/Export） |
| `z-[200]` | **Modal/Overlay 背景遮罩** |
| `z-[250]` | **Toast 通知** |
| `z-[300]` | 巢狀 Modal |
| `z-[9999]` | fixed 定位 Pagination 下拉（突破 overflow:hidden） |

---

## 七、Layout 規格

### 頁面容器（Content Card）
```
bg-white
rounded-[16px]
shadow: Card 懸浮陰影
overflow-hidden
flex flex-col h-full
```

### 搜尋列（Search Bar）
```
padding: pl-[20px] pr-[20px] pt-[20px] pb-[16px]
gap: gap-[16px]
shrink-0
```

### TableToolbar
```
padding: px-[20px] py-[16px]
bg-white; shrink-0
flex items-center justify-between
```

### SelectionToolbar
```
height: h-[48px]
bg: bg-[#d9e8f5]
border-bottom: border-b border-[rgba(145,158,171,0.08)]
shrink-0（scroll 容器外，固定不捲動）
```

### 表格表頭列
```
height: 56px
bg: bg-[#f4f6f8]
sticky: top-0 z-[10]
border-bottom: border-b border-[rgba(145,158,171,0.08)]
```

### 表格資料列

- **一般清單**：`h-[52px]`
- **修正單 / 歷史訂單**：`h-[76px]`

### 分頁列（Pagination）
```
padding: px-[8px] py-[10px]
bg-white; shrink-0
border-top: border-t border-[rgba(145,158,171,0.08)]
```

---

## 八、元件規格（獨立元件）

> 掃描自 `src/app/components/`，以下為 9 個可複用 UI 元件。

---

### CheckboxIcon

**用途：** 表格 Checkbox 欄、SelectionToolbar 全選

```ts
interface CheckboxIconProps {
  checked: boolean;
  onClick?: () => void;
  onChange?: (checked: boolean) => void;
}
```

```
size: 20×20px
checked fill: #1D7BF5
unchecked fill: #919EAB
hover: opacity-80; transition: opacity
```

---

### CustomCheckbox

**用途：** ColumnSelector 欄位切換（小型）

```ts
interface CustomCheckboxProps {
  checked: boolean;
  onClick: () => void;
}
```

```
size: 16×16px
checked: rect fill #1D7BF5 + white checkmark, rx=2
unchecked: rect fill #B0B8C1, rx=1.5
```

---

### DropdownSelect

**用途：** 表單字段用下拉（floating label），OrderDetail、修正單建立

```ts
interface DropdownSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; color?: string }[];
  placeholder?: string;
  error?: boolean;
  className?: string;
  searchable?: boolean;
}
```

```
容器: h-[54px] rounded-[8px]
邊框: 1px solid rgba(145,158,171,0.2)（正常）/ red-500 2px（error）
Floating label: top:-5px left:14px, 12px SemiBold #637381
顯示文字: 15px Regular #1c252e; px-[14px]

下拉選單: top:58px rounded-[8px]; max-h-[300px]
選項 hover: rgba(145,158,171,0.08); 14px Regular #1c252e
空結果: 14px #919eab「無符合的選項」

searchable=true 時: input h-36 border rgba(0.2) rounded-6 focus:#2196F3
```

---

### FilterSelect

**用途：** 搜尋列篩選欄（react-select 封裝）

```ts
interface FilterSelectProps {
  placeholder?: string;
  value?: string | null;
  options: { value: string; label: string }[];
  onChange?: (value: string | null) => void;
  isDisabled?: boolean;
  isClearable?: boolean;
}
```

```
control: h-[40px] rounded-[8px]
邊框: rgba(145,158,171,0.2)（正常）/ #2196F3（focus）
dropdown indicator: #637381 / hover #1c252e
clear indicator: hover #ff5630
選項: 14px Public Sans; selected bg #2196F3
```

---

### TableToolbar

**用途：** 表格上方工具列（結果計數 + Columns/Filters/Export）

```ts
interface TableToolbarProps {
  resultsCount: number;
  showColumnSelector: boolean;
  showFilterDialog: boolean;
  onColumnsClick: () => void;
  onFiltersClick: () => void;
  columnsButton?: React.ReactNode;
  filtersButton?: React.ReactNode;
  actionButton?: React.ReactNode;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
}
```

```
左側: "{n} results found" → n SemiBold #1c252e + "results found" Regular #637381
右側按鈕: h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)]
  icon: 18px SVG stroke #1C252E; label: Bold 13px #1c252e

Export Dropdown: w-[280px] rounded-[10px]; Dropdown 精緻陰影
  Excel: stroke #118d57; CSV: stroke #005eb8
  item: px-[14px] py-[10px]; hover:bg-[rgba(145,158,171,0.06)]
```

---

### ColumnSelector

**用途：** 欄位顯示/隱藏切換面板

```ts
interface ColumnSelectorProps {
  columns: { key: string; label: string; visible?: boolean }[];
  onToggleColumn: (key: string) => void;
  onToggleAll?: (selectAll: boolean) => void;
  onClose: () => void;
  onApply: () => void;
}
```

```
卡片: w-[280px] max-h-[450px] rounded-[8px]; Card 標準陰影
標題: SemiBold 14px #1c252e「顯示欄位 (n/total)」+ "all" #1D7BF5
欄位行: hover:bg-[rgba(145,158,171,0.04)]; CustomCheckbox 16px + Regular 14px label
底部: 取消（text-[#637381]）+ 應用（bg-[#1D7BF5]）
```

---

### FilterDialog

**用途：** 進階篩選條件設定

```ts
export interface FilterCondition {
  id: string;
  column: string;
  operator: 'contains'|'equals'|'notEquals'|'startsWith'|'endsWith'|'isEmpty'|'isNotEmpty';
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

```
卡片: w-[480px] max-h-[500px] rounded-[8px]; Card 標準陰影
篩選行: 欄位 select(flex-1) + 操作符 select(w-120) + 值 input(flex-1) + 刪除(36×36)
  input/select: h-[36px] rounded-[6px] border rgba(0.2) focus:#1D7BF5
  刪除: hover:bg-[rgba(255,86,48,0.08)]; icon stroke #FF5630
新增條件: border-dashed rgba(0.3) hover:border #1D7BF5; icon+text #1D7BF5
底部: 取消 + 應用（同 ColumnSelector）
```

---

### PaginationControls

**用途：** 表格底部分頁

```ts
interface PaginationControlsProps {
  currentPage?: number;       // 預設 1
  totalItems: number;
  itemsPerPage?: number;      // 預設 100
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}
// PAGE_SIZE_OPTIONS: [100, 500, 1000, 5000]
```

```
Rows per page 下拉: px-[10px] py-[4px] rounded-[6px]
  border rgba(145,158,171,0.32); hover rgba(0.56)
  fixed 定位 z-[9999]; Pagination 下拉陰影

已選中: bg-[rgba(0,94,184,0.08)] SemiBold text-[#005eb8]（品牌選中色，非連結）
hover: bg-[rgba(145,158,171,0.08)] text-[#1c252e]

導覽: size-[36px] 圓形; disabled: opacity-30 cursor-not-allowed
範圍文字: "{start}–{end} of {total}" 14px Regular #1c252e
```

---

### BaseOverlay

**用途：** 所有 Overlay/Modal 的底層容器

```ts
interface BaseOverlayProps {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;    // 預設 '1000px'
  maxHeight?: string;   // 預設 '760px'
}
```

```
遮罩: fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-[20px]
卡片: bg-white rounded-[16px] Modal 陰影 flex flex-col overflow-hidden
      maxWidth / maxHeight 由 props 控制
```

---

## 九、UI Patterns（未獨立但統一的視覺模式）

> 以下模式**不是獨立元件**，但在全專案中有統一規律。新增功能時必須遵循。

---

### Pattern A：Primary 按鈕

**出現位置：** ColumnSelector、FilterDialog、Overlay footer

```css
px-[16px] py-[8px] rounded-[8px]
bg-[#1D7BF5] text-white font-semibold text-[14px]
hover:bg-[#1565C0] transition-colors
```

### Pattern B：Secondary 按鈕（取消）

```css
px-[16px] py-[8px] rounded-[8px]
text-[#637381] font-semibold text-[14px]
hover:bg-[rgba(145,158,171,0.08)] transition-colors
```

### Pattern C：Toolbar 圖示按鈕

```css
flex items-center gap-[8px] h-[30px] px-[4px] rounded-[8px]
hover:bg-[rgba(145,158,171,0.08)]
/* icon 18px + Bold 13px label */
```

### Pattern D：ToolbarBtn（純文字行動按鈕）

```tsx
<button className="flex items-center justify-center px-[12px] py-[16px] hover:opacity-70 transition-opacity disabled:opacity-35 shrink-0">
  <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#004680] text-[14px] text-center whitespace-nowrap">
    動作文字
  </span>
</button>
```

> ❗ **ToolbarBtn 沒有背景色、沒有邊框**，禁止改成實心按鈕。

### Pattern E：Danger 刪除按鈕

```css
w-[36px] h-[36px] flex items-center justify-center
rounded-[6px]
hover:bg-[rgba(255,86,48,0.08)]
/* icon stroke #FF5630 */
```

### Pattern F：Ghost 新增按鈕（虛線邊框）

```css
w-full h-[36px] flex items-center justify-center gap-[8px]
rounded-[6px] border border-dashed border-[rgba(145,158,171,0.3)]
hover:border-[#1D7BF5] hover:bg-[rgba(29,123,245,0.04)]
transition-colors
/* icon + text #1D7BF5 */
```

### Pattern G：Panel Header

**出現於 ColumnSelector、FilterDialog、各 Overlay：**

```css
px-[16px] py-[12px]
border-b border-[rgba(145,158,171,0.08)]
/* title: SemiBold 14px #1c252e */
```

### Pattern H：Panel Footer（雙按鈕）

```css
px-[16px] py-[12px]
border-t border-[rgba(145,158,171,0.08)]
bg-white flex gap-[8px] justify-end
/* 取消(B) + 應用(A) */
```

### Pattern I：Small Panel 卡片容器

```css
bg-white rounded-[8px]
shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)]
/* 內部: Panel Header + 捲動內容 + Panel Footer */
```

### Pattern J：Toast 通知

```css
fixed bottom-[24px] left-1/2 -translate-x-1/2
z-[250] bg-[#1c252e] text-white
px-[24px] py-[12px] rounded-[8px]
shadow-[0px_8px_16px_rgba(0,0,0,0.16)]
/* success icon: stroke #22c55e */
```

### Pattern K：藍字連結（Clickable DocNo）

```css
font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal
text-[14px] leading-[22px]
text-[#1677ff] underline
hover:text-[#0958d9]
cursor-pointer
```

### Pattern L：Sidebar Nav Item

```css
/* active */
bg-[rgba(255,184,0,0.2)] rounded-[8px]
/* hover */
hover:bg-[rgba(255,255,255,0.08)]
/* icon: fill #637381 → active fill #ffb800（採購主題）*/
```

### Pattern M：ToolbarDivider

```css
h-[28px] w-px bg-[rgba(99,115,129,0.32)] shrink-0 mx-[4px]
```

---

## 十、表格元件系統

### 10.1 整體架構（Layer Stack）

```
┌─────────────────────────────────────────────────────┐
│ 1. 搜尋列（Search Bar）          shrink-0            │
│ 2. TableToolbar                  shrink-0            │
│ 3. SelectionToolbar（條件顯示）   shrink-0            │
│ 4. 表格本體（overflow scroll）   flex-1 min-h-0      │
│    ├─ 表頭列（sticky top-0）                         │
│    └─ 資料列（loop）                                 │
│ 5. PaginationControls            shrink-0            │
└─────────────────────────────────────────────────────┘
外層: bg-white flex flex-col h-full rounded-[16px] overflow-hidden Card 懸浮陰影
```

### 10.2 表頭列

```
height: 56px; bg-[#f4f6f8]; sticky top-0 z-[10]
border-b border-[rgba(145,158,171,0.08)]
label: SemiBold 14px #637381; whitespace-nowrap truncate
```

| 欄位 | 寬度 | sticky | z-index |
|------|------|--------|---------|
| Checkbox 欄 | 88px（訂單）/ 56px（修正單） | left:0 | 20 |
| DocNo 欄 | 依元件設定 | left:[checkbox寬] | 19 |
| 一般欄 | 依設定 | — | — |

### 10.3 資料列

```tsx
className={`flex border-b border-[rgba(145,158,171,0.08)] h-[76px]
  hover:bg-[rgba(145,158,171,0.04)] group transition-colors
  ${selected ? 'bg-[rgba(0,94,184,0.04)]' : ''}`}
```

**Sticky Checkbox 欄（資料列）：**
```
sticky left:0 z-[4]; bg-white; group-hover:bg-[#f6f7f8]
boxShadow: 2px 0 4px -2px rgba(145,158,171,0.16)
```

**Sticky DocNo 欄（資料列）：**
```
sticky left:[checkbox寬] z-[3]; bg-white; group-hover:bg-[#f6f7f8]
boxShadow: 2px 0 4px -2px rgba(145,158,171,0.18)
px-[16px]
```

**空值顯示：**
```tsx
<p className="text-[#919eab]">—</p>  {/* 空值 */}
<p className="text-[#1c252e] truncate">{value}</p>  {/* 有值 */}
```

### 10.4 各功能表格配置

| 功能 | Checkbox 寬 | DocNo | 行高 | DnD | Resizable |
|------|------------|-------|------|-----|-----------|
| 採購訂單查詢 | 88px | docSeqNo (160px+) | 52px | ✅ | ✅ |
| 預測訂單查詢 | 88px | 無 sticky | 52px | ✅ | ✅ |
| 修正單查詢 | 56px | correctionDocNo | 76px | ✅ | ✅ |
| 歷史訂單查詢 | 88px | 單號序號 (160px) | 76px | ✅ | ✅ |
| 品質異常查詢 | 無 | abnormalNumber | 76px | ✅ | ✅ |

### 10.5 欄寬調整（Resizable）

```tsx
<Resizable
  size={{ width: col.width, height: 56 }}
  minWidth={col.minWidth} maxWidth={900}
  enable={{ right: true }}
  onResizeStop={(_, __, ___, delta) => updateWidth(col.key, col.width + delta.width)}
  handleStyles={{ right: { width:'4px', cursor:'col-resize', background:'transparent', zIndex:1 }}}
  handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
>
```

### 10.6 欄位拖曳排序（DnD）

```tsx
const [{ isDragging }, drag] = useDrag({
  type: 'COLUMN_TYPE',
  item: () => ({ key: col.key, index }),
  collect: m => ({ isDragging: m.isDragging() }),
});
// 拖曳中: opacity-50
// 拖曳把手: 6 dots SVG fill #919EAB，hover 時顯示
```

### 10.7 差異天數（dayDiff）樣式

```tsx
// 0
<span className="text-[#1c252e] text-[14px]">0</span>

// 正數（廠商晚交，紅色警示）
<span className="text-[#b71d18] bg-[rgba(255,86,48,0.12)] rounded-[6px] px-[8px]">+{n} 天</span>

// 負數（廠商早交，綠色）
<span className="text-[#118d57] bg-[rgba(34,197,94,0.12)] rounded-[6px] px-[8px]">{n} 天</span>
```

---

## 十一、表格進階功能規格

> 以下 8 項功能為**所有 Advanced\*Table 元件的共同實作模式**，參照 `AdvancedQualityTable.tsx`。

---

### 功能一：欄位拖曳排序（react-dnd）

**套件：** `react-dnd` + `react-dnd-html5-backend`

**每個表格使用獨立 type 字串（避免跨表格衝突）：**

| 表格 | DnD type |
|------|----------|
| 品質異常 | `'quality-column'` |
| 採購訂單 | `'order-column'` |
| 修正單 | `'correction-column'` |

```tsx
// 外層必須包 DndProvider
<DndProvider backend={HTML5Backend}>
  {/* ... */}
</DndProvider>

// 表頭欄位：同時接 drag + drop ref
const [{ isDragging }, drag] = useDrag({
  type: 'quality-column',
  item: () => ({ columnKey: column.key, index }),
  collect: (monitor) => ({ isDragging: monitor.isDragging() }),
});

const [, drop] = useDrop({
  accept: 'quality-column',
  hover: (item: { columnKey: ColumnKey; index: number }) => {
    if (item.index !== index) {
      moveColumn(item.columnKey, column.key);
      item.index = index;  // 更新 index 防止 flicker
    }
  },
});

// 合併 ref
<div ref={(node) => drag(drop(node))} className={isDragging ? 'opacity-50' : ''}>
```

**moveColumn 實作：**
```ts
const moveColumn = useCallback((dragKey: ColumnKey, hoverKey: ColumnKey) => {
  setColumns((prev) => {
    const dragIndex = prev.findIndex(col => col.key === dragKey);
    const hoverIndex = prev.findIndex(col => col.key === hoverKey);
    const newColumns = [...prev];
    const [removed] = newColumns.splice(dragIndex, 1);
    newColumns.splice(hoverIndex, 0, removed);
    return newColumns;
  });
}, []);
```

**拖曳把手 SVG（6 個圓點，hover 時顯示）：**
```tsx
{isHovered && (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-[6px] shrink-0">
    <circle cx="5" cy="3" r="1.5" fill="#919EAB" />
    <circle cx="11" cy="3" r="1.5" fill="#919EAB" />
    <circle cx="5" cy="8" r="1.5" fill="#919EAB" />
    <circle cx="11" cy="8" r="1.5" fill="#919EAB" />
    <circle cx="5" cy="13" r="1.5" fill="#919EAB" />
    <circle cx="11" cy="13" r="1.5" fill="#919EAB" />
  </svg>
)}
```

---

### 功能二：欄位寬度調整（re-resizable）

```tsx
<Resizable
  size={{ width: column.width, height: 56 }}
  minWidth={column.minWidth}
  maxWidth={800}
  enable={{ right: true }}
  onResizeStop={(e, direction, ref, d) => {
    updateColumnWidth(column.key, column.width + d.width);
  }}
  handleStyles={{
    right: { width: '4px', right: '0', cursor: 'col-resize', background: 'transparent', zIndex: 1 },
  }}
  handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
  className={`bg-[#f4f6f8] ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
>
```

```ts
const updateColumnWidth = useCallback((key: ColumnKey, width: number) => {
  setColumns((prev) => {
    const newColumns = [...prev];
    const index = newColumns.findIndex(col => col.key === key);
    newColumns[index] = { ...newColumns[index], width };
    return newColumns;
  });
}, []);
```

---

### 功能三：欄位排序（點擊標題 asc/desc）

**狀態：**
```ts
const [sortConfig, setSortConfig] = useState<{
  key: ColumnKey | null;
  direction: 'asc' | 'desc' | null;
}>({ key: null, direction: null });
```

**切換邏輯：** 點擊同欄 asc→desc，點擊新欄從 asc 開始

**排序演算法（自動判別數字 / 中文 / 英文）：**
```ts
const sortedData = useMemo(() => {
  if (!sortConfig.key || !sortConfig.direction) return data;
  return [...data].sort((a, b) => {
    const aStr = String(a[sortConfig.key!] ?? '');
    const bStr = String(b[sortConfig.key!] ?? '');
    if (!aStr) return 1;  if (!bStr) return -1;
    const isNumber = /^\d/.test(aStr) && /^\d/.test(bStr);
    const isChinese = /^[\u4e00-\u9fa5]/.test(aStr);
    let comparison = 0;
    if (isNumber) {
      const aNum = parseFloat(aStr.match(/^[\d.]+/)?.[0] || '0');
      const bNum = parseFloat(bStr.match(/^[\d.]+/)?.[0] || '0');
      comparison = aNum - bNum;
    } else if (isChinese) {
      comparison = aStr.localeCompare(bStr, 'zh-Hans-CN', { sensitivity: 'base' });
    } else {
      comparison = aStr.localeCompare(bStr, 'en', { sensitivity: 'base' });
    }
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
}, [data, sortConfig]);
```

**排序圖示：**
```tsx
{sortDirection && (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[6px] shrink-0">
    {sortDirection === 'asc'
      ? <path d="M8 3L12 7H4L8 3Z" fill="#637381" />    // 上三角 = ASC
      : <path d="M8 13L4 9H12L8 13Z" fill="#637381" />  // 下三角 = DESC
    }
  </svg>
)}
```

---

### 功能四：Columns 欄位顯示/隱藏

```ts
// visible?: boolean — undefined 或 true = 顯示；false = 隱藏
const visibleColumns = columns.filter(col => col.visible !== false);
```

結合 `ColumnSelector` 元件（詳見第八章），Apply 時通過 `onColumnsChange` 回傳父元件並儲存 localStorage。

---

### 功能五：Filters 進階篩選

```ts
import type { FilterCondition } from './FilterDialog';
const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

// 篩選管道（useMemo 最後一步）
const filteredData = useMemo(() => {
  if (!appliedFilters.length) return baseData;
  return baseData.filter(item =>
    appliedFilters.every(filter => {
      const val = String(item[filter.column as keyof Row] ?? '');
      const fv = filter.value;
      switch (filter.operator) {
        case 'contains':   return val.toLowerCase().includes(fv.toLowerCase());
        case 'equals':     return val.toLowerCase() === fv.toLowerCase();
        case 'notEquals':  return val.toLowerCase() !== fv.toLowerCase();
        case 'startsWith': return val.toLowerCase().startsWith(fv.toLowerCase());
        case 'endsWith':   return val.toLowerCase().endsWith(fv.toLowerCase());
        case 'isEmpty':    return !val.trim();
        case 'isNotEmpty': return !!val.trim();
        default:           return true;
      }
    })
  );
}, [baseData, appliedFilters]);
```

---

### 功能六：localStorage 持久化

**Key 格式：** `{featureName}_{userEmail}_{tab}_columns`

```ts
const getStorageKey = (tab: string) => {
  const safeTab = tab.replace(/[^a-zA-Z0-9]/g, '_');
  return `qualityAbnormal_${userEmail}_${safeTab}_columns`;
};

// 載入（欄位數一致才使用，防版本不符）
const loadColumnsFromStorage = (tab: string): Column[] => {
  try {
    const saved = localStorage.getItem(getStorageKey(tab));
    if (saved) {
      const parsed = JSON.parse(saved) as Column[];
      if (parsed.length === defaultColumns.length) return parsed;
    }
  } catch {}
  return defaultColumns.map(col => ({ ...col }));
};

// 儲存
const saveColumnsToStorage = (tab: string, cols: Column[]) => {
  try { localStorage.setItem(getStorageKey(tab), JSON.stringify(cols)); } catch {}
};
```

**Tab 切換時重新載入，欄位變更時自動儲存：**
```ts
useEffect(() => {
  setIsLoadingFromStorage(true);
  setColumns(loadColumnsFromStorage(activeTab));
  setTimeout(() => setIsLoadingFromStorage(false), 0);
}, [activeTab, userEmail]);

useEffect(() => {
  if (!isLoadingFromStorage) saveColumnsToStorage(activeTab, columns);
}, [columns, activeTab]);

// 父元件傳入 columnsVersion 時強制重新載入
useEffect(() => {
  if (columnsVersion && columnsVersion > 0)
    setColumns(loadColumnsFromStorage(activeTab));
}, [columnsVersion]);
```

---

### 功能七：水平拖曳捲動（useHorizontalDragScroll）

**Hook 位置：** `src/app/components/useHorizontalDragScroll.ts`

```ts
const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();
```

```tsx
<div
  ref={scrollContainerRef}
  onMouseDown={handleMouseDown}
  className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar
    ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
>
```

**排除規則（不可修改）：**
- `button, a, input, select, textarea, label, [role="button"], [role="checkbox"]` → 不觸發拖曳
- `[data-table-header="true"]` (表頭) → 不觸發
- `[data-is-checkbox="true"]` (checkbox 欄) → 不觸發
- re-resizable handle → 不觸發
- `svg`, `p` 元素 → 不觸發（保留文字選取）
- 超過 **3px** 才算拖曳（防誤觸）
- 全域監聽 mousemove/mouseup（支援超出容器邊界拖曳）

**表頭必須加 data-table-header 標記：**
```tsx
<div data-table-header="true" className="flex sticky top-0 z-10 ...">
```

---

### 功能八：flex-1 min-h-0 容器架構

> ❗ **必須遵守此架構**，否則 scrollbar 無法正確顯示。

```tsx
<DndProvider backend={HTML5Backend}>
  {/* 主容器 */}
  <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full">

    {/* 捲動區 */}
    <div ref={scrollContainerRef} onMouseDown={handleMouseDown}
      className="flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar">
      <div style={{ minWidth: `${totalWidth}px` }}>

        {/* 表頭 */}
        <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
          {visibleColumns.map((col, i) => <DraggableColumnHeader key={col.key} ... />)}
          <div className="flex-1 bg-[#f4f6f8] min-w-0" />  {/* 填滿剩餘 */}
        </div>

        {/* 資料列 */}
        {sortedData.map(row => (
          <div key={row.id} className="flex border-b border-[rgba(145,158,171,0.08)] h-[76px] hover:bg-[rgba(145,158,171,0.04)]">
            {visibleColumns.map((col, i) => {
              const isLast = i === visibleColumns.length - 1;
              return (
                <div key={`${row.id}-${col.key}`}
                  // ⚠️ 最後欄用 style（flex-1），其他欄固定寬度
                  style={isLast ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                  className={`flex items-center px-[16px] overflow-hidden
                    ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
                >
                  {getCellValue(row, col.key)}
                </div>
              );
            })}
          </div>
        ))}

        {/* 空資料 */}
        {sortedData.length === 0 && (
          <div className="flex items-center justify-center py-[60px]">
            <p className="text-[#919eab] text-[14px]">無符合條件的資料</p>
          </div>
        )}
      </div>
    </div>

    {/* 分頁（固定底部） */}
    <div className="shrink-0 border-t border-[rgba(145,158,171,0.08)]">
      <PaginationControls ... />
    </div>
  </div>
</DndProvider>
```

---

## 十二、開發規範

1. **永遠先參考此文件** — 不得自行定義顏色、間距、字型、圓角值
2. **連結藍統一 `#1677ff`** — hover `#0958d9`，禁止使用 `#005eb8` 作為文字連結色
3. **SelectionToolbar 背景統一 `#d9e8f5`** — 舊版 `rgba(0,94,184,0.16)` 為廢棄值，遇到請修正
4. **新增功能先查現有同類** — 有相同視覺行為則直接複製 className，不重新設計
5. **ToolbarBtn 禁止改為實心按鈕** — 純文字 + `#004680` + hover opacity
6. **空值一律顯示 `—`（em dash）**，class `text-[#919eab]`
7. **Rows per page 預設 100**，選項固定為 `[100, 500, 1000, 5000]`
8. **表格容器必須用 `flex-1 min-h-0`**，否則 scrollbar 無法正常顯示
9. **DnD type 字串每個表格獨立**，禁止跨表格共用同一 type
10. **欄位排序優先判斷數字 → 中文 → 英文**，對應使用不同 locale 的 `localeCompare`
11. **localStorage key 格式固定：** `{feature}_{userEmail}_{tab}_columns`
12. **Stitch 生成 UI 僅供靈感**，實際實作必須遵循此文件

---

*由 `scan-patterns.mjs` 掃描 320 個檔案自動生成，並手動整合驗證。*
*最後更新：2026-03-20*
