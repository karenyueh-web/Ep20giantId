# DESIGN.md — Giant Global EP 設計系統 DNA

> 每次新增功能前，必須先讀此文件，不得自行定義任何設計值。

---

## 一、技術棧

| 項目 | 值 |
|------|---|
| CSS 框架 | Tailwind CSS v4（inline arbitrary values） |
| 字型 | Public Sans（英數）、Noto Sans JP（中文）、Inter |
| 圖示 | 自製 SVG（無 icon library） |
| 框架 | React + TypeScript (Vite) |

---

## 二、Color Tokens（配色）

### 主要語意色

| Token | HEX | 用途 |
|-------|-----|------|
| `text-primary` | `#1c252e` | 主要文字、標題、按鈕 |
| `text-secondary` | `#637381` | 次要文字、標籤、placeholder |
| `text-disabled` | `#919eab` | 禁用文字、空值 dash (—) |
| `text-link` | `#1677ff` | 藍字連結（訂單號、修正單號），hover: `#0958d9` |
| `text-link-action` | `#004680` | ToolbarBtn 行動文字 |
| `text-success` | `#118d57` | 成功、正數差異量 |
| `text-error` | `#b71d18` | 錯誤、負數差異量 |
| `text-warning` | `#b76e00` | 警告 |

### 背景色

| Token | HEX | 用途 |
|-------|-----|------|
| `bg-page` | `#ffffff` | 主內容背景 |
| `bg-header` | `#f4f6f8` | 表格表頭列背景 |
| `bg-sidebar` | `#1c252e`（暗色漸層） | 左側導覽列 |
| `bg-toolbar-selected` | `#d9e8f5` | 選取工具列背景（checkbox 選中後） |
| `bg-row-selected` | `rgba(0,94,184,0.04)` | 表格選中列背景 |
| `bg-hover` | `rgba(145,158,171,0.04)` | 表格 hover 列背景 |
| `bg-dropdown-hover` | `#f4f6f8` | 下拉選單 hover 項 |
| `bg-lang-selected` | `rgba(0,94,184,0.08)` | 語系選單已選中項 |

### 品牌藍

| Token | HEX | 用途 |
|-------|-----|------|
| `brand-blue` | `#1D7BF5` | Checkbox on、欄位 resize handle hover |
| `brand-dark-blue` | `#005eb8` | CDV icon、CSV 匯出 icon |
| `brand-deep` | `#004680` | ToolbarBtn text、購確按鈕 |

### 邊框色

| Token | 值 | 用途 |
|-------|---|------|
| `border-default` | `rgba(145,158,171,0.08)` | 表格分隔線、卡片邊框 |
| `border-medium` | `rgba(145,158,171,0.12)` | Dropdown 邊框 |
| `border-strong` | `rgba(145,158,171,0.24)` | filter badge |
| `border-input` | `rgba(145,158,171,0.32)` | 輸入框邊框 |

### 陰影

| 場景 | 值 |
|------|---|
| 卡片 | `0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px -4px rgba(145,158,171,0.12)` |
| Dropdown | `0px 0px 2px rgba(145,158,171,0.24), 0px 20px 40px -4px rgba(145,158,171,0.24)` |
| Sticky 右邊界 | `2px 0 4px -2px rgba(145,158,171,0.16)` |
| Sticky doc no 右邊界 | `2px 0 4px -2px rgba(145,158,171,0.18)` |

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

| 場景 | size | leading |
|------|------|---------|
| 表格表頭 | `14px` | `24px` |
| 表格資料列 | `14px` | `22px` |
| Toolbar badge / tag | `13px` | `22px` |
| Dropdown 描述文字 | `11px` | — |
| 狀態小徽章 | `12px` | `20px` |

---

## 四、Layout 規格

### 頁面容器（Content Card）

```
bg-white
rounded-[16px]
shadow: 0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px -4px rgba(145,158,171,0.12)
overflow-hidden
```

### 搜尋列（Search Bar）

```
padding: pl-[20px] pr-[20px] pt-[20px] pb-[16px]
gap: gap-[16px]
```

### 工具列（TableToolbar）

```
padding: px-[20px] py-[16px]
bg: bg-white
```

### 選取工具列（SelectionToolbar）

```
height: h-[48px]
bg: bg-[#d9e8f5]
border-bottom: border-b border-[rgba(145,158,171,0.08)]
```

### 表格表頭列

```
height: 56px
bg: bg-[#f4f6f8]
sticky: top-0 z-10
border-bottom: border-b border-[rgba(145,158,171,0.08)]
```

### 表格資料列

- **一般清單**：`h-[52px]`
- **修正單 / 歷史訂單**：`h-[76px]`

### 分頁列（Pagination）

```
padding: px-[20px]
bg: bg-white
border-top: border-t border-[rgba(145,158,171,0.08)]
```

---

## 五、元件規格

### Checkbox 欄（Sticky Left）

```
width: 88px（訂單類大表格）/ 56px（修正單類）
position: sticky; left: 0; z-index: 4（資料列）/ z-index: 20（表頭）
bg: bg-[#f4f6f8]（表頭）/ bg-white（資料列）
boxShadow: 2px 0 4px -2px rgba(145,158,171,0.16)
```

### Sticky 文件號欄（Doc No）

```
width: 依各元件（CorrectionListWithTabs: 可拖曳調整, HistoryOrderListWithTabs: 160px）
position: sticky; left: [checkbox width]; z-index: 3（資料列）/ z-index: 19（表頭）
boxShadow: 2px 0 4px -2px rgba(145,158,171,0.18)
```

### 藍字連結（Clickable Doc No）

```
font: Public_Sans:Regular / Noto_Sans_JP:Regular, font-normal
size: text-[14px], leading-[22px]
color: text-[#1677ff]
hover: hover:text-[#0958d9]
decoration: underline
```

### ToolbarBtn（文字行動按鈕，選取工具列內）

```html
<button class="flex items-center justify-center px-[12px] py-[16px] hover:opacity-70 transition-opacity disabled:opacity-35 shrink-0">
  <span class="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#004680] text-[14px] text-center whitespace-nowrap">
    動作文字
  </span>
</button>
```

> ❗ **ToolbarBtn 沒有背景色、沒有邊框、不是實心按鈕**，只有純文字 + hover opacity

### ToolbarDivider

```
h-[28px] w-px bg-[rgba(99,115,129,0.32)] shrink-0 mx-[4px]
```

### Tab Item

```
height: h-[48px]
active: border-b-2 border-[#1c252e] text-[#1c252e]
inactive: text-[#637381]
badge bg: bg-[rgba(145,158,171,0.16)]
badge text: text-[#637381] font-bold text-[12px]
```

### Status Badge

| 狀態 | 背景 | 文字色 |
|------|------|--------|
| CL / 已關閉 | `rgba(145,158,171,0.12)` | `#637381` |
| NP / 未確認 | `rgba(145,158,171,0.12)` | `#637381` |
| V / 廠商確認中 | `rgba(253,176,34,0.12)` | `#b76e00` |
| B / 待採購處理 | `rgba(255,86,48,0.12)` | `#b71d18` |
| CK / 採購確認 | `rgba(0,184,217,0.12)` | `#006c9c` |
| CP / 已確認 | `rgba(34,197,94,0.12)` | `#118d57` |
| DR / 草稿 | `rgba(145,158,171,0.12)` | `#637381` |
| SS / 執行中 | `rgba(99,115,129,0.12)` | `#454f5b` |

### 表格欄位 Resizable Handle

```
width: 4px; cursor: col-resize; background: transparent; z-index: 1
hover class: hover:bg-[#1D7BF5]
```

### 拖曳把手（DnD Column Header）

```
6 dots SVG, fill: #919EAB
出現條件: isHovered === true（onMouseEnter/Leave 控制）
```

### Dropdown / Popover

```
bg: bg-white
rounded: rounded-[10px]
shadow: 0px 0px 2px rgba(145,158,171,0.24), 0px 20px 40px -4px rgba(145,158,171,0.24)
border: border border-[rgba(145,158,171,0.12)]
padding: py-[6px]
item padding: px-[14px] py-[10px]
item hover: hover:bg-[rgba(145,158,171,0.06)]
```

### Toast 提示

```
position: fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250]
bg: bg-[#1c252e] text-white
padding: px-[24px] py-[12px]
rounded: rounded-[8px]
shadow: 0px 8px 16px rgba(0,0,0,0.16)
icon: success → stroke #22c55e
```

### Input / SearchField

```
border: 1px solid rgba(145,158,171,0.32)
border-radius: 8px
height: ~36px
focus: border-color #2196F3, border-width 2px, shadow: 0 2px 8px rgba(33,150,243,0.15)
placeholder: text-[#919eab]
```

---

## 六、互動規則

1. **Sticky 欄必填 `boxShadow`**：checkbox 用 `2px 0 4px -2px rgba(145,158,171,0.16)`，doc no 用 `...0.18`
2. **Group hover**：資料列加 `group` class，sticky 欄加 `group-hover:bg-[#f6f7f8]`
3. **Rows per page 預設 100**，選項為 100 / 500 / 1000 / 5000
4. **表格行中點空值顯示 `—`（em dash）**，class 用 `text-[#919eab]`
5. **新功能一律參考現有同類功能的設計**，禁止自行定義顏色/間距/字體

---

## 七、Sidebar 配色（暗色）

```
bg: #1c252e（暗色）
active item: rgba(255,184,0,0.2) 底色（採購主題：rgba(255,184,0,0.2)）
icon normal: fill #637381
icon active: fill #ffb800（採購主題）/ fill #1D7BF5（預設）
user name: text-white
user email: text-white opacity
```

---

## 八、開發規範

- 永遠先查已有功能是否有相同視覺設計，有則直接複製 class
- 不自訂顏色值、不修改字體規格、不調整間距，除非明確設計變更
- Stitch 生成的 UI 僅供靈感參考，實際實作必須遵循此文件

---

## 九、表格元件系統（Table Component System）

### 9.1 整體架構（Layer Stack）

每個表格頁面由以下 zone 由上而下疊加：

```
┌─────────────────────────────────────────────────────┐
│ 1. 搜尋列（Search Bar）          shrink-0            │
│ 2. TableToolbar                  shrink-0            │
│ 3. SelectionToolbar（條件顯示）   shrink-0            │
│ 4. 表格本體（含 overflow scroll）  flex-1 min-h-0    │
│    ├─ 表頭列（sticky top-0）                         │
│    └─ 資料列（loop）                                 │
│ 5. PaginationControls            shrink-0            │
└─────────────────────────────────────────────────────┘
```

外層容器固定規格：
```
bg-white, flex flex-col, h-full, rounded-[16px]
shadow: 0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px -4px rgba(145,158,171,0.12)
overflow-hidden
```

---

### 9.2 表格本體 scroll 容器

```tsx
// overflow 容器
className="flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar"
// 啟用拖曳捲動時
cursor: grab / active:cursor-grabbing

// 內容最小寬度（防止欄位被壓縮）
<div style={{ minWidth: `${totalWidth}px` }}>
```

`totalWidth` = checkbox 欄寬 + docNo 欄寬 + 所有可見欄寬之和

---

### 9.3 表頭列（Header Row）

```
position: sticky; top: 0; z-index: 10
border-bottom: 1px solid rgba(145,158,171,0.08)
height: 56px
```

**欄位順序（固定區 → 可拖曳區）：**

| 欄位 | 寬度 | sticky | z-index |
|------|------|--------|---------|
| Checkbox 欄 | 88px（訂單）/ 56px（修正單） | left:0 | 20 |
| DocNo 欄（單號序號） | 依元件設定 | left:[checkbox寬] | 19 |
| 一般欄（可拖曳） | 依各欄設定 | — | — |
| 最末欄 flex-1 填充 | min-w-0 | — | — |

表頭 label 樣式：
```
font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold
text-[14px] leading-[24px] text-[#637381]
whitespace-nowrap truncate
```

---

### 9.4 資料列（Data Row）

| 功能模組 | 行高 | 說明 |
|------|------|------|
| 一般採購訂單 / 預測訂單 | `h-[52px]` | 單行資料 |
| 修正單查詢 / 歷史訂單查詢 | `h-[76px]` | 含多行資訊 |

資料列 class 樣式：
```tsx
className={`flex border-b border-[rgba(145,158,171,0.08)] h-[76px]
  hover:bg-[rgba(145,158,171,0.04)]
  group transition-colors
  ${selected ? 'bg-[rgba(0,94,184,0.04)]' : ''}`}
```

**Checkbox 欄（資料列）：**
```
position:sticky; left:0; z-index:4
bg-white; group-hover:bg-[#f6f7f8]
boxShadow: 2px 0 4px -2px rgba(145,158,171,0.16)
border-right: 1px solid rgba(145,158,171,0.08)
```

**DocNo 欄（資料列）：**
```
position:sticky; left:[checkbox寬]; z-index:3
bg-white; group-hover:bg-[#f6f7f8]
boxShadow: 2px 0 4px -2px rgba(145,158,171,0.18)
border-right: 1px solid rgba(145,158,171,0.08)
px-[16px]
```

**一般資料欄：**
```
px-[16px]; overflow-hidden
border-right: 1px solid rgba(145,158,171,0.08)（最後一欄無 border-right）
最後一欄：min-width:[col.width]px; flex:1（填滿剩餘空間）
```

**空值顯示：**
```tsx
// 空值一律顯示 em dash，且為 disabled 色
<p className="... text-[#919eab]">—</p>
// 有值
<p className="... text-[#1c252e] truncate">{value}</p>
```

---

### 9.5 欄位型別系統（Column Key System）

以 `AdvancedOrderTable` 為基準的 `OrderColumnKey`：

```
── 狀態 & 標頭 ──
status | orderNo | orderDate

── 訂單基本資料 ──
orderType | company | purchaseOrg | orderSeq | docSeqNo
purchaser | orderQty | acceptQty | comparePrice | unit

── 廠商 & 料號 ──
leadtime | vendorCode | vendorName | materialNo | customerBrand | vendorMaterialNo

── 品名 & 規格 ──
productName | specification

── 交貨排程 ──
expectedDelivery | vendorDeliveryDate | deliveryQty | dayDiff | schedLineIndex
productionScheduleDate | prodSchedDayDiff

── 其他 ──
inTransitQty | undeliveredQty | lineItemNote | internalNote | materialPOContent
```

**欄位定義介面：**
```ts
interface OrderColumn {
  key: OrderColumnKey;
  label: string;       // 表頭顯示文字
  width: number;       // 初始寬度（px）
  minWidth: number;    // 拖曳最小寬度（px）
  visible?: boolean;   // 預設隱藏用 visible: false
}
```

**預設欄寬規格（代表性欄位）：**

| 欄位 | width | minWidth |
|------|-------|----------|
| 狀態 | 110 | 90 |
| 訂單號碼 | 140 | 100 |
| 廠商名稱 | 200 | 120 |
| 料號 | 200 | 120 |
| 規格 | 280 | 150 |
| 差異天數 | 100 | 80 |

---

### 9.6 欄寬調整（Resizable）

使用 `re-resizable` 套件：

```tsx
<Resizable
  size={{ width: col.width, height: 56 }}
  minWidth={col.minWidth}
  maxWidth={900}
  enable={{ right: true }}
  onResizeStop={(_e, _d, _r, delta) =>
    updateWidth(col.key, col.width + delta.width)
  }
  handleStyles={{
    right: { width: '4px', right: 0, cursor: 'col-resize', background: 'transparent', zIndex: 1 }
  }}
  handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
>
```

---

### 9.7 欄位拖曳排序（DnD）

使用 `react-dnd` + `HTML5Backend`：

```tsx
// 拖曳把手圖示（hover 時顯示）
// 6 dots SVG, fill: #919EAB
// 出現條件：onMouseEnter → setHovered(true)

const [{ isDragging }, drag] = useDrag({
  type: 'COLUMN_TYPE',
  item: () => ({ key: col.key, index }),
  collect: m => ({ isDragging: m.isDragging() }),
});

const [, drop] = useDrop({
  accept: 'COLUMN_TYPE',
  hover: (item) => {
    if (item.index !== index) { moveColumn(item.key, col.key); item.index = index; }
  },
});
```

拖曳中的欄位：`opacity-50`

---

### 9.8 TableToolbar 工具列

位置：搜尋列下方、表格上方（`shrink-0`）

```
padding: px-[20px] py-[16px]
bg: bg-white
layout: flex items-center justify-between
```

**左側：**
```tsx
<p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#1c252e] text-[14px]">
  <span>{count} </span>
  <span className="text-[#637381]">results found</span>
</p>
```

**右側 Toolbar Buttons：**

| 按鈕 | 圖示顏色 | 文字 | hover |
|------|----------|------|-------|
| Columns | stroke `#1C252E` | Bold 13px `#1c252e` | `hover:bg-[rgba(145,158,171,0.08)]` |
| Filters | stroke `#1C252E` | Bold 13px `#1c252e` | 同上 |
| Export ▾ | 含 chevron | Bold 13px `#1c252e` | 同上 |

Export Dropdown 選項：
- 匯出 Excel：圖示 stroke `#118d57`，SemiBold 13px「匯出 Excel」+ Regular 11px 描述
- 匯出 CSV：圖示 stroke `#005eb8`，同上格式

---

### 9.9 SelectionToolbar 選取工具列

**觸發條件：** `selectedIds.size > 0`

```
height: h-[48px]
bg: bg-[#d9e8f5]
border-bottom: border-b border-[rgba(145,158,171,0.08)]
position: scroll 容器外（固定不捲動）
```

從左至右：
1. **Checkbox 區**（寬度同表格 checkbox 欄）→ 點擊全選/取消全選
2. **`{n} selected`** 計數文字（SemiBold 14px `#1c252e`，`mr-[4px]`）
3. **ToolbarBtn(s)**（純文字，`#004680`）+ ToolbarDivider 分隔

**ToolbarBtn 原始 class（禁止修改）：**
```tsx
// button
"flex items-center justify-center px-[12px] py-[16px] hover:opacity-70 transition-opacity disabled:opacity-35 shrink-0"

// span
"font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#004680] text-[14px] text-center whitespace-nowrap"
```

---

### 9.10 PaginationControls 分頁元件

Props：
```ts
interface PaginationControlsProps {
  currentPage?: number;       // 預設 1
  totalItems: number;
  itemsPerPage?: number;      // 預設 100
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}
```

**Rows per page 選項（固定）：** `[100, 500, 1000, 5000]`

Rows per page 下拉按鈕：
```
border: 1px solid rgba(145,158,171,0.32)
border-radius: 6px; bg-white
hover: border-[rgba(145,158,171,0.56)]
text: 14px Regular #1c252e
```

下拉選單（fixed 定位，突破 overflow:hidden）：
```
bg-white; rounded-[8px]
shadow: 0px 8px 24px -4px rgba(145,158,171,0.24), 0px 0px 2px rgba(145,158,171,0.2)
border: rgba(145,158,171,0.16)
```

已選中項：`bg-[rgba(0,94,184,0.08)] font-semibold text-[#005eb8]`
hover 項：`hover:bg-[rgba(145,158,171,0.08)] text-[#1c252e]`

導覽按鈕：
- 圓形 `size-[36px]`，hover: `bg-[rgba(145,158,171,0.08)]`
- 不可用: `opacity-30 cursor-not-allowed`

範圍文字：`{start}–{end} of {total}`（Regular 14px `#1c252e`）

---

### 9.11 各功能表格配置對比

| 功能 | Checkbox 寬 | DocNo 欄 | 行高 | DnD | Resizable |
|------|------------|---------|------|-----|-----------|
| 採購訂單查詢 | 88px | docSeqNo (160px+) | 52px | ✅ | ✅ |
| 預測訂單查詢 | 88px | 無 sticky docNo | 52px | ✅ | ✅ |
| 修正單查詢 | 56px | correctionDocNo（可調整） | 76px | ✅ | ✅ |
| 歷史訂單查詢 | 88px | 單號序號 (160px) | 76px | ✅ | ✅ |

---

### 9.12 狀態差異天數（dayDiff）樣式

```tsx
// 無差異
<span className="text-[#1c252e] text-[14px]">0</span>

// 正數（廠商比預計晚，紅色警示）
<span className="text-[#b71d18] ... bg-[rgba(255,86,48,0.12)] rounded-[6px] px-[8px]">
  +{n} 天
</span>

// 負數（廠商比預計早，綠色）
<span className="text-[#118d57] ... bg-[rgba(34,197,94,0.12)] rounded-[6px] px-[8px]">
  {n} 天
</span>
```
