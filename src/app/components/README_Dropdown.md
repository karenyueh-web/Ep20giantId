# 下拉選單元件使用說明

系統中統一使用 `DropdownSelect` 組件來實現所有下拉選單功能。

## 組件位置
`/src/app/components/DropdownSelect.tsx`

## 使用範例

### 1. 基本使用（廠商帳號管理 - 城市選擇）
```tsx
import { DropdownSelect } from './DropdownSelect';

const [city, setCity] = useState('高雄');

<DropdownSelect
  label="城市"
  value={city}
  onChange={setCity}
  options={[
    { value: '台北', label: '台北' },
    { value: '高雄', label: '高雄' },
    { value: '台中', label: '台中' }
  ]}
/>
```

### 2. 廠商名稱選擇（帶顏色選項）
```tsx
const [vendorName, setVendorName] = useState('');

<DropdownSelect
  label="廠商名稱"
  value={vendorName}
  onChange={setVendorName}
  options={[
    { value: 'all', label: '全部', color: 'text-[#005eb8]' },
    { value: 'taiwan', label: '台灣廠（整採）' },
    { value: 'gotech', label: 'Gotech' },
    { value: 'partner', label: '下游協力廠' }
  ]}
  placeholder="請選擇廠商"
/>
```

### 3. 申請角色選擇
```tsx
const [role, setRole] = useState('');

<DropdownSelect
  label="申請角色"
  value={role}
  onChange={setRole}
  options={[
    { value: 'sales', label: '業務' },
    { value: 'qa', label: '品保' },
    { value: 'subcontractor', label: '下包商' },
    { value: 'developer', label: '開發人員' }
  ]}
  error={!role}  // 驗證錯誤時顯示紅色邊框
/>
```

### 4. 業務角色選擇（聯絡人資訊）
```tsx
const [businessRole, setBusinessRole] = useState('S (業務)');

<DropdownSelect
  label="業務角色"
  value={businessRole}
  onChange={setBusinessRole}
  options={[
    { value: 'Q (品保)', label: 'Q (品保)' },
    { value: 'S (業務)', label: 'S (業務)' },
    { value: 'B (採購)', label: 'B (採購)' },
    { value: 'IB (整合採購)', label: 'IB (整合採購)' },
    { value: 'MP (物料計畫)', label: 'MP (物料計畫)' },
    { value: 'M (管理階層)', label: 'M (管理階層)' }
  ]}
/>
```

### 5. 優先序選擇
```tsx
const [priority, setPriority] = useState('1 (收件人)');

<DropdownSelect
  label="優先序"
  value={priority}
  onChange={setPriority}
  options={[
    { value: '1 (收件人)', label: '1 (收件人)' },
    { value: '2 (CC)', label: '2 (CC)' },
    { value: '3 (BCC)', label: '3 (BCC)' }
  ]}
  className="w-full"
/>
```

## Props 參數說明

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| label | string | 是 | 下拉選單標籤（浮動顯示） |
| value | string | 是 | 當前選中的值 |
| onChange | (value: string) => void | 是 | 值改變時的回調函數 |
| options | Array<{value: string, label: string, color?: string}> | 是 | 選項列表 |
| placeholder | string | 否 | 未選擇時的佔位文字 |
| error | boolean | 否 | 是否顯示錯誤狀態（紅色邊框） |
| className | string | 否 | 額外的 CSS 類名 |

## 樣式特點

1. **54px 高度**：統一的輸入框高度
2. **浮動標籤**：點擊前標籤在上方小字顯示
3. **圓角邊框**：8px 圓角
4. **下拉箭頭**：右側固定顯示向下箭頭圖標
5. **選項列表**：
   - 白色背景
   - 圓角陰影
   - Hover 時顯示淺灰色背景
   - 最大高度 300px，超過可滾動
6. **點擊外部關閉**：自動檢測外部點擊並關閉選單
7. **錯誤狀態**：紅色邊框和紅色標籤

## 已使用位置

- ✅ 廠商帳號管理 - 城市選擇
- ✅ 廠商帳號管理 - 廠商名稱選擇
- ✅ 帳號審核頁面 - 申請角色選擇
- ✅ 聯絡人資訊 - 業務角色選擇
- ✅ 聯絡人資訊 - 優先序選擇
- ✅ 註冊頁面 - 申請角色選擇
