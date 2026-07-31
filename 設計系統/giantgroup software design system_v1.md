# Giant Group Software Design System

供全公司開發人員於各系統開發時共同遵循的 UI 規範。請查閱對應章節，不自行定義顏色、間距、字型或圓角值和元件。

## 1. 顏色系統

### 品牌色
| Token | Hex | 用途 |
|---|---|---|
| brand-blue | #1D7BF5 | Checkbox on、Apply 按鈕 |
| brand-csv-icon | #005eb8 | CSV 匯出 icon（僅圖示） |
| brand-deep | #004680 | ToolbarBtn 文字、採購確認按鈕 |

### 背景色
| Token | Hex | 用途 |
|---|---|---|
| bg-page | #ffffff | 主內容背景 |
| bg-header | #f4f6f8 | 表格表頭（343 次） |
| bg-sidebar | #1c252e | 左側導覽列（暗色） |
| bg-toolbar-selected | #d9e8f5 | SelectionToolbar 選取背景 |
| bg-row-selected | rgba(0,94,184,0.04) | 表格選中列 |
| bg-hover | rgba(145,158,171,0.04) | 表格 row hover |
| bg-btn-hover | rgba(145,158,171,0.08) | Toolbar 按鈕 hover（145 次） |
| bg-lang-selected | rgba(0,94,184,0.08) | 語系/分頁 selected |

### 文字色
| Token | Hex | 用途 |
|---|---|---|
| text-primary | #1c252e | 主要文字（1,463 次） |
| text-secondary | #637381 | 次要文字、表頭標籤（915 次） |
| text-disabled | #919eab | 禁用文字、空值 —（349 次） |
| text-link | #1677ff | 藍字連結，hover #0958d9 |
| text-link-action | #004680 | ToolbarBtn 純文字按鈕 |
| text-success | #118d57 | 成功、正數差異天數 |
| text-error | #b71d18 | 錯誤、負數差異天數 |
| text-warning | #b76e00 | 警告（V 狀態） |

### 邊框色
| Token | Hex | 用途 |
|---|---|---|
| border-default | rgba(145,158,171,0.08) | 表格分隔線 |
| border-medium | rgba(145,158,171,0.12) | Dropdown 邊框 |
| border-strong | rgba(145,158,171,0.24) | Filter badge |
| border-input | rgba(145,158,171,0.2) | 輸入框，focus → #1D7BF5 |
| border-input-strong | rgba(145,158,171,0.32) | Pagination 下拉按鈕 |

### 狀態色（表格 Status Badge）
| Code | Label | Background | Text |
|---|---|---|---|
| NP | 未確認 | rgba(145,158,171,0.12) | #637381 |
| V | 廠商確認中 | rgba(253,176,34,0.12) | #b76e00 |
| B | 待採購處理 | rgba(255,86,48,0.12) | #b71d18 |
| CK | 採購確認 | rgba(0,184,217,0.12) | #006c9c |
| CP | 已確認 | rgba(34,197,94,0.12) | #118d57 |
| DR | 草稿 | rgba(145,158,171,0.12) | #637381 |
| SS | 執行中 | rgba(99,115,129,0.12) | #454f5b |
| CL | 已關閉 | rgba(145,158,171,0.12) | #637381 |

## 2. 字型與大小規範

英數 Public Sans，中文 Noto Sans JP，數字/表格資料建議 Inter Medium。

| 場景 | Size | Leading | Weight |
|---|---|---|---|
| 表格表頭 label | 14px | 24px | SemiBold |
| 表格資料列 | 14px | 22px | Regular |
| Toolbar badge / tag | 13px | 22px | Bold |
| 狀態小徽章 | 12px | 20px | SemiBold |
| Floating Label | 12px | 12px | SemiBold |
| Dropdown 描述文字 | 11px | — | Regular |

## 3. 尺寸系統

### Border Radius
| 值 | 次數 | 用途 |
|---|---|---|
| 8px | 1,466 | 按鈕、Input、Dropdown容器（主導值） |
| 500px | 376 | 圓形：頭像、Chip、圓形按鈕 |
| 16px | 135 | 頁面主卡片、BaseOverlay卡片 |
| 6px | 90 | Status Badge、篩選select、Danger按鈕 |
| 12px | 73 | Tab badge、中型Card |
| 10px | 6 | Dropdown/Popover浮層精緻版 |
| 4px | 29 | CustomCheckbox |

### Height 高度系統
| 值 | 用途 |
|---|---|
| 30px | Toolbar 圖示按鈕（92 次） |
| 36px | Input 框、FilterDialog select（286 次） |
| 40px | FilterSelect、搜尋按鈕（190 次） |
| 48px | SelectionToolbar、Tab 列、主按鈕（294 次） |
| 54px | DropdownSelect（floating label，99 次） |
| 56px | 表格表頭與資料列（統一） |

## 4. 陰影 & 遮罩系統

| 名稱 | CSS | 用途 |
|---|---|---|
| Card 標準 | 0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px rgba(145,158,171,0.12) | Popover, Panel |
| Card 懸浮 | 0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px -4px rgba(145,158,171,0.12) | Content Card |
| Modal | -40px 40px 80px 0px rgba(145,158,171,0.24) | Overlay 卡片 |
| Toast | 0px 8px 16px rgba(0,0,0,0.16) | 通知 |
| Dropdown 精緻 | 0px 0px 2px rgba(145,158,171,0.24), 0px 20px 40px -4px rgba(145,158,171,0.24) | Export 下拉 |

Modal 遮罩規格：
```
fixed inset-0 z-[200]
background: rgba(0,0,0,0.3)
display:flex; align-items:center; justify-content:center; padding:20px
```

## 5. Z-Index 層次

| z-index | 用途 |
|---|---|
| 1 | Resizable handle（47 次） |
| 2~5 | 一般 Sticky 元素 |
| 3 | Sticky DocNo 資料列 |
| 4 | Sticky Checkbox 資料列 |
| 10 | 表格表頭 sticky |
| 100 | Toolbar Dropdown（Columns/Filters/Export） |
| 200 | Modal/Overlay 背景遮罩 |
| 250 | Toast 通知 |
| 300 | 巢狀 Modal |
| 9999 | fixed 定位 Pagination 下拉 |

## 6. 圖示庫 Icon Library

17 個標準圖示，涵蓋導覽圖示與編輯/刪除/返回/關閉等操作圖示。secondary shape 用 opacity 0.4 疊加 primary shape，色彩依原始用途保留（灰階為預設可主題化，紅色/藍色為固定語意色）。Edit/Delete 為系統標準操作按鈕，禁止另行繪製。新增圖示請比照相同結構（secondary/primary 分層、24×24 viewBox、fill 使用 var(--fill-0, #637381) 可被主題覆蓋）。

圖示清單：Dashboard, Announcement, Order, CorrectOrder, Shipping, Invoice, Account, SystemSettings, Parts, Insurance, Quality, ArrowDown, ArrowRight, Delete/Trash, Back/返回, Edit/編輯, Close/關閉。

## 7. UI 元件

每個元件包含用途說明、互動狀態展示與程式碼範例。

### 7.1 Button
六種變體：Primary / Secondary / ToolbarBtn / Toolbar 圖示按鈕 / Danger（虛線 Ghost）/ 圓形圖示按鈕。Disabled：主按鈕 opacity 0.5，ToolbarBtn opacity 0.35。
```jsx
// Primary
<button className="px-[16px] py-[8px] rounded-[8px] bg-[#1D7BF5] text-white font-semibold text-[14px] hover:bg-[#1565C0]">Apply</button>

// Secondary
<button className="px-[16px] py-[8px] rounded-[8px] text-[#637381] font-semibold hover:bg-[rgba(145,158,171,0.08)]">取消</button>

// ToolbarBtn（純文字，禁止改為實心按鈕）
<button className="px-[12px] py-[16px] hover:opacity-70 disabled:opacity-35">
  <span className="font-semibold text-[#004680] text-[14px]">動作文字</span>
</button>
```

### 7.2 Checkbox
CheckboxIcon（20×20，表格/全選）與 CustomCheckbox（16×16，欄位切換）。
```jsx
// CheckboxIcon 20x20
<CheckboxIcon checked={selected} onChange={setSelected} />
// checked fill #1D7BF5 / unchecked fill #919EAB

// CustomCheckbox 16x16
<CustomCheckbox checked={visible} onClick={toggle} />
// checked: rect fill #1D7BF5 + white check, rx=2
```

### 7.3 Input / Select
一般表單輸入框（含 error / disabled 狀態）、DropdownSelect（floating label，支援 searchable）與 FilterSelect（react-select 封裝視覺還原）。
```jsx
<DropdownSelect
  label="部門"
  value={value}
  onChange={setValue}
  options={[{ value: 'a', label: '採購部' }]}
  error={!value}
/>
// 容器 h-[54px] rounded-[8px]; error → border red-500 2px

<FilterSelect
  placeholder="選擇廠商..."
  options={vendorOptions}
  onChange={setVendor}
/>
```

### 7.4 Status Badge
8 種狀態碼統一規格：px-8 py-2, rounded-6, SemiBold 12px。另有差異天數（dayDiff）樣式：正數紅底紅字、負數綠底綠字、0/空值灰字。
```jsx
const STATUS_MAP = {
  NP: { label: '未確認', bg: 'rgba(145,158,171,0.12)', text: '#637381' },
  V:  { label: '廠商確認中', bg: 'rgba(253,176,34,0.12)', text: '#b76e00' },
  CP: { label: '已確認', bg: 'rgba(34,197,94,0.12)', text: '#118d57' },
};
<span className="inline-flex px-[8px] py-[2px] rounded-[6px] text-[12px] font-semibold"
  style={{ background: STATUS_MAP[code].bg, color: STATUS_MAP[code].text }}>
  {STATUS_MAP[code].label}
</span>
```

### 7.5 Table Toolbar
表格上方工具列：結果計數 + Columns/Filters/Export（下拉）。
```jsx
<TableToolbar
  resultsCount={128}
  showColumnSelector={showColumns}
  showFilterDialog={showFilters}
  onColumnsClick={() => setShowColumns(true)}
  onFiltersClick={() => setShowFilters(true)}
  onExportExcel={exportExcel}
  onExportCsv={exportCsv}
/>
```

### 7.6 Column Selector
欄位顯示/隱藏切換面板。
```jsx
<ColumnSelector
  columns={columns}
  onToggleColumn={toggleColumn}
  onToggleAll={selectAll}
  onClose={() => setOpen(false)}
  onApply={handleApply}
/>
```

### 7.7 Filter Dialog
進階篩選條件設定，支援新增/刪除條件。operator: contains|equals|notEquals|startsWith|endsWith|isEmpty|isNotEmpty。
```jsx
<FilterDialog
  filters={filters}
  availableColumns={columns}
  onFiltersChange={setFilters}
  onClose={() => setOpen(false)}
  onApply={handleApply}
/>
```

### 7.8 Pagination
表格底部分頁，Rows per page 固定選項 [100, 500, 1000, 5000]。
```jsx
<PaginationControls
  currentPage={page}
  totalItems={842}
  itemsPerPage={itemsPerPage}
  onPageChange={setPage}
  onItemsPerPageChange={setItemsPerPage}
/>
// PAGE_SIZE_OPTIONS = [100, 500, 1000, 5000]
```

### 7.9 Table Row / Header
表頭與資料列統一 56px。選中列 background rgba(0,94,184,0.04)，hover rgba(145,158,171,0.04)，空值顯示 —。
```jsx
<div className="flex border-b border-[rgba(145,158,171,0.08)] h-[56px] hover:bg-[rgba(145,158,171,0.04)] group">
  {/* 選中列另加 bg-[rgba(0,94,184,0.04)] */}
  ...
</div>
// 空值: <p className="text-[#919eab]">—</p>
```

### 7.10 Overlay / Modal（BaseOverlay）
所有 Modal 的底層容器：黑色 30% 遮罩 + 白卡片，rounded-16。
```jsx
<BaseOverlay onClose={handleClose} maxWidth="520px">
  <PanelHeader title="..." onClose={handleClose} />
  <div className="p-[24px]">內容</div>
  <PanelFooter onCancel={handleClose} onApply={handleApply} />
</BaseOverlay>
// 遮罩: fixed inset-0 z-[200] bg-black/30
```

### 7.11 Toast
底部置中通知，2.5 秒後自動消失。
```jsx
showToast('操作成功');
// fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250]
// bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px]
// 2.5s 後 auto dismiss
```

### 7.12 Sidebar Nav Item
左側導覽項目，一般主題（藍）與採購主題（黑黃）兩種配色。
```jsx
// active
className="bg-[rgba(255,184,0,0.2)] rounded-[8px]"
// hover
className="hover:bg-[rgba(255,255,255,0.08)]"
// icon: fill #637381 → active fill #ffb800（採購主題）
```

---
本檔案由 Design System Book（DC）匯出，反映目前 Book 內顯示的完整色彩、字型、尺寸、陰影、圖示與元件規格，供貼回 GitHub repo 使用。
