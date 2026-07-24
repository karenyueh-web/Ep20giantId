# 專案規則（Project Rules）

## 開發前必讀規範

### SKILL.md 必須完整閱讀
開發新頁面、新元件、新功能前，讀取 `SKILL.md` 時**必須完整讀完全部內容**，包含 801 行之後的部分。

- `view_file` 一次最多顯示 800 行，若檔案超過 800 行，**必須繼續呼叫一次讀取剩餘行數**
- 看到提示 *"The above content does NOT show the entire file contents"* 時，**必須繼續讀完**，不可假設前半段已足夠
- 讀完整份 SKILL.md 後，才可以開始動工

### 元件規範（避免重造輪子）
- **啟用/停用 Toggle** 一律使用 `<ToggleSwitch>` 元件（啟用為綠色 `#22c55e`），**禁止自訂顏色或自製 Toggle 元件**
- **新彈窗/Dialog** 必須用 `BaseOverlay` 作為外層容器，禁止用 `fixed div` 或 `createPortal` 自製遮罩
- **錯誤提示** 禁止用 `toast.error`，必須用標準 Alert 彈窗（`ForecastDeleteDeniedOverlay` 為範本）

### StandardDataTable 使用規則
- 嵌入已有外層卡片的頁面（Tab + 搜尋列 + 表格 的 Settings 類頁面），**必須傳入 `embedded` prop**，否則搜尋列下方會出現多餘的 shadow 邊緣
- 搜尋列容器 **禁止加 `border-b`**，`TableToolbar` 本身已有分隔效果

### 表格標題列 Checkbox 顯示規則
- 表格有 Selection Bar（批次操作列）的頁面，標題列 checkbox 必須在有列被選取時隱藏
  - 條件：`selectedIds.size > 0` 時，不渲染標題列的 checkbox 按鈕
  - 原因：Selection Bar 上方已有相同的全選/取消功能，重複顯示造成 UI 冗餘
  - ✅ 正確：`{selectedIds.size === 0 && <button onClick={handleSelectAll}>...</button>}`
  - ❌ 錯誤：標題列 checkbox 永遠顯示，不管 selection bar 是否出現

### 搜尋列欄寬規則
- 搜尋列中每個欄位（SearchField / DropdownSelect）的容器**一律加 `flex-1 min-w-0`**，讓所有欄位自動平均分配寬度
- **禁止放空的佔位 `<div />`** 來維持特定欄數對齊；有幾個搜尋欄就放幾欄，寬度自動平均

### JSX 語法禁則
- **`{/* 註解 */}` 只能放在 JSX 元素的子節點位置，絕對禁止放在 prop 列表中間**
  - ❌ 錯誤：`<Comp prop1={a} {/* 說明 */} prop2={b} />`
  - ✅ 正確：把註解改成行內文字說明，或用 `// 單行註解` 寫在 prop 前一行（JSX 外部）
  - 若需要在 prop 旁解釋，直接寫在 JSX 元素的前一行 comment 即可

### ⭐ 歷程（OrderHistory）使用規範
- **禁止自製歷程面板**（側邊欄、自訂 inline 列表、自訂 Modal 等）
- 所有功能頁面的「歷程」功能，**一律使用 `OrderHistory` 元件**（位於 `src/app/components/OrderHistory.tsx`）
- `OrderHistory` 是一個**全螢幕 Modal**（`fixed inset-0 z-[200]`），點遮罩或返回箭頭可關閉

#### 正確用法
```tsx
import { OrderHistory } from './OrderHistory';

// state 控制開關
const [showHistory, setShowHistory] = useState(false);

// 歷程按鈕（點擊開啟）
<button onClick={() => setShowHistory(true)}>歷程</button>

// Modal（放在 return 最外層，與其他內容並列）
{showHistory && (
  <OrderHistory
    onClose={() => setShowHistory(false)}
    titleLabel="產險歷程"           // 自訂標題，選填
    entries={history.map(h => ({
      date: h.timestamp,            // 對應欄位：日期
      event: h.summary,             // 對應欄位：事項
      operator: h.actor,            // 對應欄位：操作人員
      remark: '',                   // 對應欄位：備註
    }))}
  />
)}
```

#### entries 格式（來自 `OrderStoreContext.HistoryEntry`）
| 欄位 | 說明 |
|------|------|
| `date` | 時間戳記，顯示於「日期」欄 |
| `event` | 事項摘要，顯示於「事項」欄 |
| `operator` | 操作人員名稱，顯示於「操作人員」欄 |
| `remark` | 備註，顯示於「備註」欄（可傳空字串） |

#### ❌ 禁止的做法
- ❌ 自製側邊欄（`shrink-0 flex flex-col rounded-[12px] border ...`）
- ❌ 自製 inline 歷程列表（`form.history.map(...)`）
- ❌ 用 `BaseOverlay` 自製歷程彈窗
- ❌ 傳入與 `OrderStoreContext.HistoryEntry` 不符的 entries 結構
- ❌ 「歷程」觸發元素使用 `<button>` 加灰色樣式

#### 歷程觸發按鈕的正確樣式（藍色底線文字）
參考 `QualityAbnormalDetail.tsx` 的 `TopActions` 元件：
```tsx
{/* ✅ 正確：藍色底線文字，Roboto 字體 */}
<p
  onClick={() => setShowHistory(true)}
  className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:text-[#003d73] shrink-0"
>
  歷程
</p>

{/* ❌ 錯誤：灰色 button 或自訂顏色 */}
<button className="text-[#637381]..." style={{ color: '...' }}>歷程</button>
```
