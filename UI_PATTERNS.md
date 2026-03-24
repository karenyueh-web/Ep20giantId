# UI_PATTERNS.md — Giant Global EP 全專案 UI 模式分析

> 掃描自全專案 320 個檔案（src/ 下所有 .tsx .ts .css），自動提取高頻 className 與視覺模式。
> 這些模式雖**未獨立為元件**，但在整個設計系統中有統一規律，應視同設計規範的一部分。

---

## 一、Border Radius（圓角）系統

| 值 | 出現次數 | 用途場景 |
|----|---------|---------|
| `rounded-[8px]` | **1,466** | 按鈕、Input 框、Dropdown 選單、Card 小元素 |
| `rounded-[500px]` | **376** | 圓形按鈕/頭像/Chip（完全圓）|
| `rounded-[16px]` | **135** | 頁面 Content Card、BaseOverlay 卡片 |
| `rounded-[6px]` | **90** | Status Badge、小型 Input、篩選行 select |
| `rounded-[inherit]` | **76** | SVG overlay、繼承父元素圓角 |
| `rounded-[12px]` | **73** | Tab 徽章、中型 Card |
| `rounded-[4px]` | **29** | Checkbox（CustomCheckbox）|
| `rounded-[10px]` | **6** | Dropdown/Popover 卡片 |

### 圓角決策規則（統一規範）

```
8px  → 通用：按鈕、輸入框、下拉選單容器
6px  → 小型：Badge、篩選 select、Pagination 下拉
10px → Dropdown/Popover 浮層
12px → 中型 Card/Tag
16px → 頁面主卡片、Modal 卡片
500px → 圓形：頭像、圓形按鈕、Chip
```

---

## 二、Box Shadow（陰影）系統

| 效果名稱 | Tailwind class | 出現次數 | 用途 |
|---------|--------------|---------|------|
| **Card 標準陰影** | `shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)]` | **43** | ColumnSelector, FilterDialog, Popover |
| **Card 懸浮陰影** | `shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)]` | **30** | Content Card, 大卡片 |
| **Modal 大陰影** | `shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)]` | **22** | BaseOverlay, OrderDetail |
| **Modal 大陰影 2** | `shadow-[-40px_40px_80px_-8px_rgba(145,158,171,0.24)]` | **6** | 部分 Overlay 變體 |
| **Toast 陰影** | `shadow-[0px_8px_16px_rgba(0,0,0,0.16)]` | **6** | Toast/底部提示 |
| **Popover 深陰影** | `shadow-[0px_8px_24px_rgba(0,0,0,0.18)]` | **5** | 較大的 Dropdown |
| **細線陰影** | `shadow-[0px_1px_2px_0px_rgba(145,158,171,0.16)]` | **5** | 小型浮層邊緣 |
| **Dropdown 精緻陰影** | `shadow-[0px_0px_2px_0px_rgba(145,158,171,0.24),0px_20px_40px_-4px_rgba(145,158,171,0.24)]` | **3** | Export Dropdown |

### 陰影決策規則

```
小型 Popover/Card  → 0px 0px 2px + 0px 12px 24px（145系列）
大型 Modal/Overlay → -40px 40px 80px（145系列）
Toast/通知         → 0px 8px 16px rgba(0,0,0,0.16)
Pagination 下拉    → 0px 8px 24px -4px + 0px 0px 2px
```

---

## 三、Background Colors（背景色）高頻統計

| 顏色 | 次數 | 語意 |
|------|------|------|
| `bg-[#f4f6f8]` | **343** | 表格表頭、禁用區域、hover 填充 |
| `bg-[rgba(145,158,171,0.08)]` | **145** | Toolbar 按鈕 hover、通用 hover |
| `bg-[#1c252e]` | **63** | Sidebar、Toast 背景 |
| `bg-[#004680]` | **58** | 品牌深藍按鈕（確認採購等）|
| `bg-[#637381]` | **55** | 禁用狀態、圖示填充 |
| `bg-[rgba(145,158,171,0.16)]` | **31** | Tab badge、次要 hover |
| `bg-[rgba(0,94,184,0.08)]` | **28** | 語系 selected、分頁 selected |
| `bg-[rgba(0,94,184,0.16)]` | **26** | 舊版 SelectionToolbar（已改為 d9e8f5）|
| `bg-[rgba(145,158,171,0.04)]` | **23** | 表格 row hover |
| `bg-[#22c55e]` | **23** | 成功狀態圖示 |
| `bg-[#1D7BF5]` | **17** | 品牌藍按鈕（Apply/Primary）|
| `bg-[#dfe3e8]` | **15** | Avatar 背景 |
| `bg-[#ff5630]` | **15** | 錯誤狀態按鈕/圖示 |
| `bg-[#d9e8f5]` | *(從 CSS vars)* | SelectionToolbar 選取背景 |

---

## 四、Text Colors（文字色）高頻統計

| 顏色 | 次數 | 語意 |
|------|------|------|
| `text-[#1c252e]` | **1,463** | 主要文字（全專案最高頻） |
| `text-[#637381]` | **915** | 次要文字、表頭標籤 |
| `text-[#919eab]` | **349** | 禁用/空值/placeholder |
| `text-[#005eb8]` | **164** | 連結色（部分功能） |
| `text-[#535862]` | **84** | 表格 icon label |
| `text-[#ff5630]` | **73** | 錯誤文字、警示 |
| `text-[#118d57]` | **36** | 成功文字 |
| `text-[#b71d18]` | **33** | 嚴重錯誤 |
| `text-[#b76e00]` | **30** | 警告文字 |
| `text-[#00559c]` | **30** | 深藍連結（部分 Chat 功能）|
| `text-[#454f5b]` | **26** | SS 狀態文字 |

---

## 五、Height（高度）系統

| 高度 | 次數 | 典型用途 |
|------|------|---------|
| `h-[48px]` | **294** | SelectionToolbar、Tab 列、按鈕大版 |
| `h-[36px]` | **286** | Input 框、FilterDialog select、小按鈕 |
| `h-[40px]` | **190** | FilterSelect（react-select）、中型按鈕 |
| `h-[72px]` | **173** | 大型 Row（Search 區域欄位） |
| `h-[24px]` | **123** | Icon 容器、小標籤 |
| `h-[54px]` | **99** | DropdownSelect（floating label） |
| `h-[30px]` | **92** | Toolbar 圖示按鈕 |
| `h-[76px]` | **82** | 修正單/歷史訂單表格行高 |
| `h-[62px]` | **51** | 搜尋 Row |
| `h-[44px]` | **86** | 中型 Card Header |

### 高度決策規則

```
30px → Toolbar 圖示按鈕
36px → 一般 Input / Select
40px → 中型 Input（react-select）/ 搜尋按鈕
48px → Tab 列、SelectionToolbar、主按鈕
54px → Floating Label 下拉選單
52px → 一般表格資料列
76px → 多行表格資料列（修正單/歷史訂單）
```

---

## 六、Z-Index 層次系統

| z-index | 次數 | 層次語意 |
|---------|------|---------|
| `z-[1]` | 47 | Resizable handle |
| `z-[2]` | 27 | 一般浮層 |
| `z-[3]` | 16 | Sticky DocNo 欄（資料列） |
| `z-[4]` | 17 | Sticky Checkbox 欄（資料列） |
| `z-[5]` | 10 | 一般 Sticky |
| `z-[100]` | 8 | Toolbar Dropdown |
| `z-[200]` | 15 | **BaseOverlay 遮罩**（主要 Modal 層） |
| `z-[250]` | 7 | **Toast 通知** |
| `z-[300]` | 7 | 更高層 Modal |
| `z-[1000]` | 4 | Chat/特殊 UI |
| `z-[9999]` | 2 | Pagination dropdown（fixed 定位） |

### Z-Index 層次體系

```
1–5     → Sticky 欄、Resizable handle
10      → 表格表頭 sticky
100     → Toolbar Dropdown（Columns/Filters/Export）
200     → Modal/Overlay 背景遮罩
250     → Toast/成功通知
300+    → 巢狀 Modal
9999    → 突破所有 overflow 的 fixed 元素（分頁下拉）
```

---

## 七、未獨立的 UI 模式（Implicit Patterns）

### Pattern A：通用按鈕 Primary

**出現位置：** ColumnSelector、FilterDialog、各 Overlay footer
```css
px-[16px] py-[8px] rounded-[8px]
bg-[#1D7BF5] text-white
font-semibold text-[14px]
hover:bg-[#1565C0]
transition-colors
```

### Pattern B：通用按鈕 Secondary（Cancel）

**出現位置：** 所有含 footer 按鈕的 panel
```css
px-[16px] py-[8px] rounded-[8px]
text-[#637381]
font-semibold text-[14px]
hover:bg-[rgba(145,158,171,0.08)]
transition-colors
```

### Pattern C：Toolbar 圖示按鈕

**出現位置：** TableToolbar（Columns / Filters / Export）
```css
flex items-center gap-[8px]
h-[30px] px-[4px] rounded-[8px]
hover:bg-[rgba(145,158,171,0.08)]
```

### Pattern D：Popover/Dropdown 浮層卡片

**統一規格（出現 50+ 次）：**
```css
/* 小型（ColumnSelector, FilterDialog）*/
bg-white rounded-[8px]
shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)]
border border-[rgba(145,158,171,0.12)]

/* 精緻型（Export Dropdown）*/
rounded-[10px]
shadow-[0px_0px_2px_0px_rgba(145,158,171,0.24),0px_20px_40px_-4px_rgba(145,158,171,0.24)]
```

### Pattern E：Modal/Overlay 背景

**統一規格（22+ 次）：**
```css
fixed inset-0 z-[200]
bg-black/30
flex items-center justify-center p-[20px]
```

**Modal 卡片：**
```css
bg-white rounded-[16px]
shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)]
flex flex-col overflow-hidden
```

### Pattern F：Form Input 框

**出現 100+ 次：**
```css
h-[36px] px-[12px] rounded-[6px]
border border-[rgba(145,158,171,0.2)]
font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]
outline-none focus:border-[#1D7BF5]
```

**Floating Label Input（DropdownSelect 型）:**
```css
h-[54px] rounded-[8px]
border border-[rgba(145,158,171,0.2)]
/* label: absolute top-[-5px] text-[12px] text-[#637381] */
```

### Pattern G：Panel Header

**出現於 ColumnSelector、FilterDialog、各 Overlay：**
```css
px-[16px] py-[12px]
border-b border-[rgba(145,158,171,0.08)]
/* title: SemiBold 14px #1c252e */
```

### Pattern H：Panel Footer（雙按鈕）

**統一出現於各 popup panel：**
```css
px-[16px] py-[12px]
border-t border-[rgba(145,158,171,0.08)]
bg-white flex gap-[8px] justify-end
/* 取消 + 應用按鈕 */
```

### Pattern I：Sidebar Nav Item

**出現 50+ 次：**
```css
/* active */
bg-[rgba(255,184,0,0.2)] rounded-[8px]
/* hover */
hover:bg-[rgba(255,255,255,0.08)]
/* icon: fill #637381 → active fill #ffb800 */
```

### Pattern J：Toast 通知

**出現 6 次：**
```css
fixed bottom-[24px] left-1/2 -translate-x-1/2
z-[250] bg-[#1c252e] text-white
px-[24px] py-[12px] rounded-[8px]
shadow-[0px_8px_16px_rgba(0,0,0,0.16)]
```

### Pattern K：Search Bar 容器

**出現於各 List 頁頂部：**
```css
/* 搜尋 row: */
flex gap-[16px] items-end
pl-[20px] pr-[20px] pt-[20px] pb-[16px]
shrink-0

/* 各個 FilterSelect 欄位等寬排列 */
```

### Pattern L：Danger 刪除按鈕

**出現於 FilterDialog、各刪除操作：**
```css
w-[36px] h-[36px] flex items-center justify-center
rounded-[6px]
hover:bg-[rgba(255,86,48,0.08)]
/* icon: stroke #FF5630 */
```

### Pattern M：Ghost 新增按鈕（虛線邊框）

**出現於 FilterDialog 等：**
```css
w-full h-[36px] flex items-center justify-center gap-[8px]
rounded-[6px] border border-dashed
border-[rgba(145,158,171,0.3)]
hover:border-[#1D7BF5]
hover:bg-[rgba(29,123,245,0.04)]
transition-colors
/* icon + text: #1D7BF5 */
```

---

## 八、Border Color 系統

| 值 | 用途 |
|----|------|
| `border-[rgba(145,158,171,0.08)]` | 表格分隔線、Panel header/footer border |
| `border-[rgba(145,158,171,0.12)]` | Dropdown 邊框 |
| `border-[rgba(145,158,171,0.2)]` | Input 邊框（一般）|
| `border-[rgba(145,158,171,0.32)]` | Input 邊框（稍強）|
| `border-[#1D7BF5]` | focus Input、hover Ghost button |

---

## 九、設計系統完整性評估

### ✅ 已統一的模式
- 圓角：8px 絕對主導（1466次），層次清晰
- 表格陰影：`145系列` 統一（佔 90%+）
- 主要文字色：#1c252e（1463次，最高頻單一值）
- Modal 遮罩：`bg-black/30 z-[200]` 完全統一

### ⚠️ 有細微不一致
- 連結藍：`#1677ff` vs `#005eb8` 兩種（建議統一為 `#1677ff`）
- SelectionToolbar 背景：出現 `rgba(0,94,184,0.16)` 和 `#d9e8f5` 兩種（應統一為 `#d9e8f5`）
- 表格行高：部分頁面仍 `52px`，部分已 `76px`（依功能有意區分）

### 📋 建議新增為獨立元件
- `PanelHeader`（px-16 py-12 + border-b + SemiBold title）
- `PanelFooter`（px-16 py-12 + border-t + Cancel/Apply 組合）
- `StatusBadge`（目前內嵌在各表格，應抽出共用）
- `ToastNotification`（目前多處複製實作）
- `DangerDeleteButton`（36×36 hover red）
- `GhostAddButton`（虛線邊框新增按鈕）
