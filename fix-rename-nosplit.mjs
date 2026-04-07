import { readFileSync, writeFileSync } from 'fs';

const files = [
  'src/app/components/OrderCsvManager.tsx',
];

const replacements = [
  // UI 顯示文字
  ['下載批次建立（不拆單調整）', '下載批次建立（不拆單）'],
  ['批次建立修正單（不拆單調整）', '批次建立修正單（不拆單）'],
  ['不拆單調整 — 匯入預覽', '不拆單 — 匯入預覽'],
  ['拆單 ＋ 不拆單調整 — 匯入預覽', '拆單 ＋ 不拆單 — 匯入預覽'],
  ['欄位說明（不拆單調整）：', '欄位說明（不拆單）：'],
  ['支援「下載批次建立（不拆單調整）」匯出的', '支援「下載批次建立（不拆單）」匯出的'],
  ['支援「下載批次建立（拆單）」或「下載批次建立（不拆單調整）」匯出的', '支援「下載批次建立（拆單）」或「下載批次建立（不拆單）」匯出的'],
  // Badge 標籤
  ['>不拆單調整<', '>不拆單<'],
  ['A 不拆單調整', 'A 不拆單'],
  // 錯誤提示
  ['請使用「下載批次建立（不拆單調整）」匯出的範本', '請使用「下載批次建立（不拆單）」匯出的範本'],
  // 同時存在說明
  ['拆單與不拆單調整範本', '拆單與不拆單範本'],
  // 修正碼說明行
  ['不拆單調整（需填新廠商交期', '不拆單（需填新廠商交期'],
  ['A＝不拆單調整（需填新廠商交期', 'A＝不拆單（需填新廠商交期'],
  ['A — 不拆單調整（需填「新廠商交期」', 'A — 不拆單（需填「新廠商交期」'],
  // 下載檔名
  ['批次建立修正單(不拆單調整)', '批次建立修正單(不拆單)'],
];

for (const f of files) {
  let content = readFileSync(f, 'utf8');
  const orig = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== orig) {
    writeFileSync(f, content, 'utf8');
    console.log(`Updated: ${f}`);
  } else {
    console.log(`No change: ${f}`);
  }
}
console.log('Done.');
