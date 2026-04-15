/**
 * 解析 PDF 解出的原始文字，生成 countryData.ts
 * 資料來源：國家代碼表.pdf（繁體中文版）
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(__dirname, 'country-pdf-raw.txt'), 'utf-8');

// 只取第 1-4 頁（國家代碼表），跳過銀行、幣別
const countrySection = raw.split('--- Page 5 ---')[0];

// 用 2 個以上空格分割，得到 token 陣列
const tokens = countrySection
  .split(/\s{2,}/)
  .map(t => t.trim())
  .filter(t => t.length > 0);

const REGIONS = new Set(['亞洲', '歐洲', '美洲', '其他']);
const CODE_RE = /^[A-Z]{2}$/;

// 跳過的 header/page number tokens
const SKIP_TOKENS = new Set(['國家代碼表', '代碼', '國家中文名稱', '地區', '1', '2', '3', '4']);

// 非標準 SAP 自訂代碼跳過
const SKIP_CODES = new Set(['XD','XF','XG','XH','XO','XP','XQ','XR','XS','YA','YB','PZ']);

const countries = [];
const seen = new Set();

for (let i = 0; i < tokens.length - 2; i++) {
  const tok = tokens[i];
  if (SKIP_TOKENS.has(tok)) continue;
  
  if (CODE_RE.test(tok) && !SKIP_CODES.has(tok)) {
    const name = tokens[i + 1];
    const region = tokens[i + 2];
    
    // name 不能是另一個 code 或 region 字
    if (name && region && REGIONS.has(region) && !CODE_RE.test(name) && !REGIONS.has(name) && !SKIP_TOKENS.has(name)) {
      if (!seen.has(tok)) {
        seen.add(tok);
        countries.push({ code: tok, zhName: name, region });
        i += 2; // 跳過已處理的 name / region
      }
    }
  }
}

// 排序
countries.sort((a, b) => a.code.localeCompare(b.code));

console.log(`Parsed ${countries.length} countries`);
['TW','CN','US','JP','DE','VN','TH','IN','HK','SG','KR','GB','FR'].forEach(c => {
  const found = countries.find(x => x.code === c);
  console.log(`  ${c}: ${found ? found.zhName + ' (' + found.region + ')' : 'NOT FOUND'}`);
});

// 生成 TypeScript 檔案
const tsContent = `// 自 國家代碼表.pdf 生成（繁體中文版）
// 共 ${countries.length} 個國家/地區
export interface CountryOption {
  code: string;    // ISO 3166-1 Alpha-2，如 TW
  zhName: string;  // 繁體中文名稱，如 中華民國
  label: string;   // 顯示文字，如 TW 中華民國
}

export const SAP_COUNTRIES: CountryOption[] = [
${countries.map(c => `  { code: "${c.code}", zhName: "${c.zhName}", label: "${c.code} ${c.zhName}" },`).join('\n')}
];

/** 依 code 快速查找 */
export const COUNTRY_MAP = new Map<string, CountryOption>(
  SAP_COUNTRIES.map(c => [c.code, c])
);
`;

const outPath = join(__dirname, 'src/app/data/countryData.ts');
writeFileSync(outPath, tsContent, 'utf-8');
console.log(`\n✅ Written ${countries.length} countries to ${outPath}`);
