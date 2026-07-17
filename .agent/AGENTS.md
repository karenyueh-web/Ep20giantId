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

### 搜尋列欄寬規則
- 搜尋列中每個欄位（SearchField / DropdownSelect）的容器**一律加 `flex-1 min-w-0`**，讓所有欄位自動平均分配寬度
- **禁止放空的佔位 `<div />`** 來維持特定欄數對齊；有幾個搜尋欄就放幾欄，寬度自動平均
