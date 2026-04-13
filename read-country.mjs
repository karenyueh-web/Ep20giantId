import { readFileSync, writeFileSync } from 'fs';

// 讀取 API 回應
const raw = readFileSync(
  'C:\\Users\\G00106917\\.gemini\\antigravity\\brain\\c2c4d593-763d-4895-a1a6-c9c3a39df5e9\\.system_generated\\steps\\634\\content.md',
  'utf-8'
);

// 取出 JSON 部分（跳過前 5 行 header）
const jsonStr = raw.split('---\n')[1]?.trim() || raw.split('\n').slice(4).join('\n');
const countries = JSON.parse(jsonStr);

// 整理：code + 中文名
const result = countries
  .filter(c => c.cca2 && c.translations?.zho?.common)
  .map(c => ({
    code: c.cca2,
    zhName: c.translations.zho.common,
    enName: c.name.common,
    label: `${c.cca2} ${c.translations.zho.common}`
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

console.log(`Total: ${result.length} countries`);
// 驗證幾個常用的
['TW','CN','US','JP','DE','VN','TH','IN'].forEach(code => {
  const found = result.find(c => c.code === code);
  if (found) console.log(JSON.stringify(found));
});

// 生成 TypeScript
const tsContent = `// 自 REST Countries API 生成，ISO 3166-1 Alpha-2 國家代碼
// 共 ${result.length} 個國家/地區
export interface CountryOption {
  code: string;    // ISO 3166-1 Alpha-2，如 TW
  zhName: string;  // 中文名稱（簡體），如 台湾
  enName: string;  // 英文名稱，如 Taiwan
  label: string;   // 顯示文字，如 TW 台湾
}

export const SAP_COUNTRIES: CountryOption[] = [
${result.map(c => `  { code: "${c.code}", zhName: "${c.zhName}", enName: "${c.enName}", label: "${c.label}" },`).join('\n')}
];

/** 依 code 快速查找 */
export const COUNTRY_MAP = new Map<string, CountryOption>(
  SAP_COUNTRIES.map(c => [c.code, c])
);
`;

writeFileSync('./src/app/data/countryData.ts', tsContent, 'utf-8');
console.log('\n✅ Written to src/app/data/countryData.ts');
