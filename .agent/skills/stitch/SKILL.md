---
name: stitch
description: 使用 Google Stitch SDK 與 Stitch AI 互動，根據文字描述生成 UI 畫面（HTML/CSS/React），取得生成結果的 HTML 和截圖。當用戶要求生成 UI 畫面、設計稿、或要求使用 Stitch 生成介面時，讀取此 skill。
---

# Google Stitch Skill

## 設定

- **API Key**：`AQ.Ab8RN6LueFDYKPCrhoZlNxui7kc6PgpmXFdXxsLl4KIzfgnSlg`
- **環境變數名稱**：`STITCH_API_KEY`
- **npm 套件**：`@google/stitch-sdk`

## 安裝 SDK

如尚未安裝，先在專案目錄執行：

```bash
npm install @google/stitch-sdk
```

## 基本使用方式（Node.js / Script）

```js
import { StitchToolClient } from '@google/stitch-sdk';

const stitch = new StitchToolClient({
  apiKey: 'AQ.Ab8RN6LueFDYKPCrhoZlNxui7kc6PgpmXFdXxsLl4KIzfgnSlg',
});

// 列出可用工具
const tools = await stitch.listTools();

// 生成 UI 畫面
const screen = await stitch.project().generate('A login page with email and password fields');

// 取得 HTML
const html = await screen.getHtml();

// 取得截圖
const image = await screen.getImage();
```

## 使用步驟

1. **安裝套件**：確認 `@google/stitch-sdk` 已安裝
2. **初始化 Client**：使用上方 API key 建立 `StitchToolClient`
3. **生成畫面**：呼叫 `stitch.project().generate('<描述>')`，描述用英文或中文皆可
4. **取得結果**：
   - `screen.getHtml()` → 取得 HTML/CSS 輸出
   - `screen.getImage()` → 取得預覽截圖（base64 或 buffer）
5. **輸出格式**：預設為 HTML/CSS，可指定 Tailwind CSS 或 React 元件

## 注意事項

- API key 已配置，直接使用無需另行申請
- Stitch 為 Google Labs 實驗性產品，功能持續更新
- 生成的 UI 為靜態 HTML，需自行整合到框架
