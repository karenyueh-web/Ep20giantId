import 'dotenv/config';
// sync-stitch.mjs ??將更?��???DESIGN.md ?�步??Stitch project
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';
import { readFileSync, writeFileSync } from 'fs';

const client = new StitchToolClient({
  apiKey: process.env.STITCH_API_KEY,
});
const stitch = new Stitch(client);

const PROJECT_ID = '10043003026964451146';
const project = stitch.project(PROJECT_ID);

// 讀??DESIGN.md
const designMd = readFileSync('./DESIGN.md', 'utf8');
console.log(`?? DESIGN.md loaded (${designMd.length} chars)`);

const prompt = `
Based on this design system specification, generate a comprehensive design system reference page.

${designMd}

Create a single-page visual reference showing:

1. **COLOR TOKENS** ??Show all color swatches in a grid:
   - Primary text #1c252e, Secondary #637381, Disabled #919eab
   - Link blue #1677ff, Action #004680, Brand blue #1D7BF5
   - Success #118d57, Error #b71d18, Warning #b76e00
   - BG: header #f4f6f8, toolbar-selected #d9e8f5, row-selected rgba(0,94,184,0.04)

2. **STATUS BADGES** ??All 8 status pills in a row:
   NP, V, B, CK, CP, DR, SS, CL

3. **TABLE COMPONENT ANATOMY** ??Show a mini table with:
   - Header row (56px, bg #f4f6f8) with: Checkbox col (88px) + DocNo col (160px, sticky) + 3 data cols
   - 2 data rows (76px each): first row selected (bg rgba(0,94,184,0.04)), second normal
   - DocNo as blue link (#1677ff), data text #1c252e, empty = "?? in #919eab

4. **SELECTION TOOLBAR** ??h:48px, bg #d9e8f5:
   Checkbox ??"2 selected" ??text-only buttons "檢�?" "?�部?�交廠�?" in #004680

5. **TOOLBAR BUTTONS** ??Show Columns, Filters, Export buttons side by side

6. **PAGINATION** ??"Rows per page: [100 ?�]  1??00 of 1842  ????

7. **TYPOGRAPHY SCALE** ??4 text samples with Public Sans

Use white background, clean layout with section headers. Professional B2B procurement system style.
`;

async function run() {
  try {
    console.log('🔄 Generating updated design spec in Stitch...');
    const screen = await project.generate(prompt);
    console.log('Screen ID:', screen.id);

    const raw = screen.data;

    if (raw?.htmlCode?.downloadUrl) {
      const res = await fetch(raw.htmlCode.downloadUrl);
      const html = await res.text();
      writeFileSync('./stitch-design-output.html', html, 'utf8');
      console.log(`✅ HTML saved (${html.length} chars) → stitch-design-output.html`);
    } else {
      console.log('⚠️  No htmlCode downloadUrl found.');
    }

    if (raw?.screenshot?.downloadUrl) {
      const res2 = await fetch(raw.screenshot.downloadUrl);
      const buf = Buffer.from(await res2.arrayBuffer());
      writeFileSync('./stitch-design-preview.png', buf);
      console.log(`🖼️ Screenshot saved (${buf.length} bytes) → stitch-design-preview.png`);
    } else {
      console.log('⚠️  No screenshot downloadUrl found.');
    }

    console.log('\n✅ Stitch sync complete!');
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    if (err.stack) console.error(err.stack);
  } finally {
    await client.close().catch(() => {});
  }
}

run();

