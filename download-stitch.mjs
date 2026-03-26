// download-stitch.mjs ??å¾?downloadUrl ?–å? HTML ?Œæˆª??import { readFileSync, writeFileSync } from 'fs';

const d = JSON.parse(readFileSync('./stitch-raw.json', 'utf8'));
const screen = d.outputComponents[0].design.screens[0];

// ä¸‹è? HTML
if (screen.htmlCode?.downloadUrl) {
  console.log('â¬‡ï?  Downloading HTML from:', screen.htmlCode.downloadUrl.slice(0, 80) + '...');
  const res = await fetch(screen.htmlCode.downloadUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading HTML`);
  const html = await res.text();
  writeFileSync('./stitch-design-output.html', html, 'utf8');
  console.log(`??HTML saved (${html.length} chars) ??stitch-design-output.html`);
}

// ä¸‹è??ªå?
if (screen.screenshot?.downloadUrl) {
  console.log('â¬‡ï?  Downloading screenshot...');
  const res2 = await fetch(screen.screenshot.downloadUrl);
  if (!res2.ok) throw new Error(`HTTP ${res2.status} downloading screenshot`);
  const buf = Buffer.from(await res2.arrayBuffer());
  writeFileSync('./stitch-design-preview.png', buf);
  console.log(`?–¼ï¸? Screenshot saved (${buf.length} bytes) ??stitch-design-preview.png`);
}

console.log('\n?? Stitch Design System Theme:');
const t = screen.theme;
console.log('  Primary:', t.overridePrimaryColor);
console.log('  Neutral:', t.overrideNeutralColor);
console.log('  Secondary:', t.overrideSecondaryColor);
console.log('  Tertiary:', t.overrideTertiaryColor);
console.log('  Font:', t.bodyFont);
