import { readFileSync, readdirSync, writeFileSync } from 'fs';

const folder = process.cwd();
const files = readdirSync(folder);
const sapFile = files.find(f => f.includes('SAP'));
console.log('File:', sapFile);

const iconv = (await import('./node_modules/iconv-lite/lib/index.js')).default;
const buf = readFileSync(sapFile);
const text = iconv.decode(buf, 'big5');

const lines = text.split(/\r?\n/).slice(1); // 跳過 header
let count = 0;
const currencies = [];

for (const line of lines) {
  if (!line.trim()) continue;
  const cols = line.split(',');
  const code = cols[0]?.trim();
  const isoCode = cols[1]?.trim();
  const fullName = cols[5]?.trim() ?? '';
  const shortName = cols[6]?.trim() ?? '';

  if (!code) continue; // 只跳過沒有 code 的

  count++;
  // label 優先用短稱，沒有就用全稱，都沒有就只顯示 code
  const display = shortName || fullName || code;
  currencies.push({ code, isoCode, shortName: display, fullName, label: `${code} ${fullName || display}` });
}

console.log(`Total data rows: ${count}, currencies included: ${currencies.length}`);

// 輸出範例
currencies.slice(0, 5).forEach(c => console.log(JSON.stringify(c)));
console.log('...');
// TWD, USD, EUR, JPY
['TWD','USD','EUR','JPY','RMB'].forEach(c => {
  const found = currencies.find(x => x.code === c);
  if (found) console.log(JSON.stringify(found));
});

// Generate TypeScript
const tsContent = `// 自 SAP 幣別表自動生成，請勿手動修改
// 來源：SAP幣別表.csv（${currencies.length} 筆）
export interface CurrencyOption {
  code: string;       // 幣別代碼，如 TWD
  isoCode: string;    // ISO 代碼，如 TWD
  shortName: string;  // 短稱（或全稱），如 新台幣
  fullName: string;   // 全稱，如 中華民國（新台幣）
  label: string;      // 顯示文字，如 TWD 新台幣
}

export const SAP_CURRENCIES: CurrencyOption[] = [
${currencies.map(c => `  { code: "${c.code}", isoCode: "${c.isoCode}", shortName: "${c.shortName}", fullName: "${c.fullName}", label: "${c.label}" },`).join('\n')}
];

/** 依 code 快速查找 */
export const CURRENCY_MAP = new Map<string, CurrencyOption>(
  SAP_CURRENCIES.map(c => [c.code, c])
);
`;

writeFileSync('./src/app/data/currencyData.ts', tsContent, 'utf-8');
console.log(`\n✅ Written to src/app/data/currencyData.ts`);
