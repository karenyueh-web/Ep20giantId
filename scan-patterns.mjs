// scan-patterns.mjs ???¨å?æ¡?UI Patterns ?ƒæ?
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = './src';
const RESULTS = {};

// ?¶é??€??.tsx .ts .css æª”æ?
function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) collectFiles(full, files);
    else if (['.tsx', '.ts', '.css'].includes(extname(entry))) files.push(full);
  }
  return files;
}

const files = collectFiles(SRC_DIR);
console.log(`?? Found ${files.length} files`);

// è¨ˆæ•¸?¨å·¥??function countMatches(text, pattern) {
  const map = {};
  let m;
  const re = new RegExp(pattern, 'g');
  while ((m = re.exec(text)) !== null) {
    const k = m[0];
    map[k] = (map[k] || 0) + 1;
  }
  return map;
}

// ?ˆä½µè¨ˆæ•¸
function merge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    target[k] = (target[k] || 0) + v;
  }
}

// ?„ç¨®æ¨¡å?
const rounded = {};
const shadows = {};
const bgColors = {};
const textColors = {};
const borderColors = {};
const zIndexes = {};
const heights = {};
const paddings = {};
const gaps = {};
const fontSizes = {};
const fontFamilies = {};

for (const f of files) {
  let text;
  try { text = readFileSync(f, 'utf8'); } catch { continue; }

  merge(rounded,      countMatches(text, 'rounded-\\[[\\w%.]+\\]'));
  merge(shadows,      countMatches(text, 'shadow-\\[[^\\]]+\\]'));
  merge(bgColors,     countMatches(text, 'bg-\\[(?:#[0-9a-fA-F]{3,8}|rgba?\\([^)]+\\))\\]'));
  merge(textColors,   countMatches(text, 'text-\\[(?:#[0-9a-fA-F]{3,8}|rgba?\\([^)]+\\))\\]'));
  merge(borderColors, countMatches(text, 'border-\\[(?:rgba?\\([^)]+\\)|#[0-9a-fA-F]{3,8})\\]'));
  merge(zIndexes,     countMatches(text, 'z-\\[\\d+\\]'));
  merge(heights,      countMatches(text, 'h-\\[\\d+px\\]'));
  merge(paddings,     countMatches(text, 'p[xy]?-\\[\\d+px\\]'));
  merge(gaps,         countMatches(text, 'gap-\\[\\d+px\\]'));
  merge(fontSizes,    countMatches(text, 'text-\\[\\d+px\\]'));
  merge(fontFamilies, countMatches(text, "font-\\['.+?'\\]"));
}

// ?’å? top N
function top(obj, n = 20) {
  return Object.entries(obj).sort((a,b) => b[1]-a[1]).slice(0, n);
}

// ?„è???UI Patternï¼šæ???/ input / popover / modal é¡žç? className ?†å?
// ?ƒæ?å¸¸è? pattern è¡?const buttonPatterns = [];
const inputPatterns = [];
const popoverPatterns = [];
const modalPatterns = [];

const BTN_RE = /className="([^"]*(?:rounded|px|py|bg|text|hover|font)[^"]{30,})"/g;
const INPUT_RE = /className="([^"]*(?:border|rounded|px|h-\[|focus)[^"]{30,})"/g;

// ?–å? 5 ?‹å”¯ä¸€æ¨?œ¬
const seen = new Set();
for (const f of files) {
  let text;
  try { text = readFileSync(f, 'utf8'); } catch { continue; }

  let m;
  const re = new RegExp(BTN_RE.source, 'g');
  while ((m = re.exec(text)) !== null) {
    const cls = m[1].trim();
    if (!seen.has(cls) && (cls.includes('rounded') || cls.includes('px-'))) {
      if (cls.includes('hover:') && cls.includes('transition') && !cls.includes('flex-col')) {
        if (buttonPatterns.length < 12) buttonPatterns.push(cls);
        seen.add(cls);
      }
    }
  }

  const re2 = new RegExp(INPUT_RE.source, 'g');
  while ((m = re2.exec(text)) !== null) {
    const cls = m[1].trim();
    if (!seen.has(cls) && cls.includes('border') && cls.includes('rounded') && inputPatterns.length < 8) {
      inputPatterns.push(cls);
      seen.add(cls);
    }
  }

  // popover / dropdown patterns
  const popRe = /className="([^"]*(?:shadow|rounded-\[8px\]|rounded-\[10px\]|rounded-\[12px\])[^"]*(?:bg-white|overflow)[^"]{10,})"/g;
  let pm;
  while ((pm = popRe.exec(text)) !== null) {
    const cls = pm[1].trim();
    if (!seen.has(cls) && popoverPatterns.length < 8) {
      popoverPatterns.push(cls);
      seen.add(cls);
    }
  }

  // modal/overlay patterns
  const modalRe = /className="([^"]*fixed[^"]*(?:inset|z-\[)[^"]{10,})"/g;
  let mm;
  while ((mm = modalRe.exec(text)) !== null) {
    const cls = mm[1].trim();
    if (!seen.has(cls) && modalPatterns.length < 6) {
      modalPatterns.push(cls);
      seen.add(cls);
    }
  }
}

const report = {
  roundedValues: top(rounded),
  shadowValues: top(shadows),
  bgColors: top(bgColors),
  textColors: top(textColors, 30),
  borderColors: top(borderColors),
  zIndexes: top(zIndexes),
  heights: top(heights),
  paddings: top(paddings),
  gaps: top(gaps),
  fontSizes: top(fontSizes),
  fontFamilies: top(fontFamilies),
  buttonPatterns: buttonPatterns.slice(0,10),
  inputPatterns,
  popoverPatterns,
  modalPatterns,
};

writeFileSync('./patterns-report.json', JSON.stringify(report, null, 2), 'utf8');
console.log('??patterns-report.json saved');
console.log('\n=== TOP rounded-* ===');
report.roundedValues.forEach(([k,v]) => console.log(`  ${v.toString().padStart(4)} ${k}`));
console.log('\n=== TOP shadow-* ===');
report.shadowValues.forEach(([k,v]) => console.log(`  ${v.toString().padStart(4)} ${k.slice(0,80)}`));
console.log('\n=== TOP bg colors ===');
report.bgColors.forEach(([k,v]) => console.log(`  ${v.toString().padStart(4)} ${k}`));
console.log('\n=== TOP text colors ===');
report.textColors.slice(0,15).forEach(([k,v]) => console.log(`  ${v.toString().padStart(4)} ${k}`));
console.log('\n=== heights ===');
report.heights.forEach(([k,v]) => console.log(`  ${v.toString().padStart(4)} ${k}`));
console.log('\n=== z-index ===');
report.zIndexes.forEach(([k,v]) => console.log(`  ${v.toString().padStart(4)} ${k}`));
