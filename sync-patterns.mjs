import 'dotenv/config';
// sync-patterns.mjs ??�?UI_PATTERNS.md ?�步??Stitch，�??�全 UI Patterns 展示??
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';
import { readFileSync, writeFileSync } from 'fs';

const client = new StitchToolClient({
  apiKey: process.env.STITCH_API_KEY,
});
const stitch = new Stitch(client);
const PROJECT_ID = '10043003026964451146';
const project = stitch.project(PROJECT_ID);

const patterns = readFileSync('./UI_PATTERNS.md', 'utf8');
console.log(`?? UI_PATTERNS.md loaded (${patterns.length} chars)`);

const prompt = `
Design a comprehensive "UI Patterns Reference" page for "Giant Global EP" ??a B2B procurement system.

DESIGN TOKENS (strict):
- Primary text: #1c252e, Secondary: #637381, Disabled: #919eab
- Brand blue: #1D7BF5, Deep blue button: #004680, Link: #1677ff
- Success: #118d57, Error: #b71d18, Warning: #b76e00
- Font: Public Sans (English), Noto Sans JP (CJK)
- Table header bg: #f4f6f8, Selection toolbar: #d9e8f5

Show ALL of these patterns as live visual examples:

?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???SECTION 1: BORDER RADIUS SCALE
?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???Show 6 boxes side by side, each labeled:
??6px ??Badge, small input
??8px ??Button, Input (most common, 1466 uses)
??10px ??Dropdown panel
??12px ??Medium card
??16px ??Page card, Modal
??500px ??Avatar, Chip

?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???SECTION 2: SHADOW LEVELS
?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???4 cards showing shadow intensity levels:
??Flat: no shadow (inline)
??Card: 0px 0px 2px rgba(145,158,171,0.2), 0px 12px 24px rgba(145,158,171,0.12)
??Modal: -40px 40px 80px rgba(145,158,171,0.24)
??Toast: 0px 8px 16px rgba(0,0,0,0.16)

?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???SECTION 3: BUTTON PATTERNS (A?�C)
?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???Row of buttons:
A) Primary: bg #1D7BF5, white text, rounded-8px, px-16 py-8, hover #1565C0
B) Secondary/Cancel: text #637381, rounded-8px, hover bg rgba(145,158,171,0.08)
C) Toolbar icon+text: h-30px gap-8 rounded-8 hover light gray ??show "Columns", "Filters", "Export ??
D) ToolbarAction (text-only): text #004680, SemiBold, no border ??"檢�?", "?�交"
E) Danger delete: 36?36px, rounded-6, hover red bg ??show ??icon
F) Ghost add: full-width dashed border, hover blue border ??"+ ?��?篩選條件"

?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???SECTION 4: INPUT PATTERNS (D?�F)
?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???D) Standard Input: h-36px rounded-6px border rgba(145,158,171,0.2), focus border #1D7BF5
E) Floating Label Dropdown (DropdownSelect): h-54px rounded-8px with "?�?? label floating at top-left edge
F) React-Select (FilterSelect): h-40px rounded-8px with clear button, searchable

?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???SECTION 5: POPOVER / PANEL PATTERNS (G?�H)
?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???G) Small Panel (ColumnSelector / FilterDialog style):
  - Header: px-16 py-12, border-bottom rgba(0.08), SemiBold 14px title
  - Body: list rows with hover
  - Footer: px-16 py-12, border-top rgba(0.08), Cancel + Apply buttons
  White bg, rounded-8, Card shadow

H) Dropdown List (Export style):
  - rounded-10, Dropdown shadow
  - Items: px-14 py-10, hover rgba(145,158,171,0.06)
  - Show: "?�出 Excel" (icon green) + "?�出 CSV" (icon blue)

?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???SECTION 6: MODAL OVERLAY PATTERN (I)
?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???I) Show modal preview:
  - Dark overlay: bg-black/30 (show as semi-transparent background)
  - White card: rounded-16px, Modal shadow
  - Modal header + content area + footer pattern

?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???SECTION 7: FUNCTIONAL PATTERNS (J?�M)
?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???J) Toast: fixed bottom, bg #1c252e, text white, rounded-8, shadow ??"??下�??��?"
K) Search Bar Row: flex gap-16, FilterSelect fields side by side + search button
L) Selection Toolbar: h-48 bg #d9e8f5, checkbox area + "2 selected" + text-only action buttons
M) Sidebar Nav Item: dark bg #1c252e, active item amber glow rgba(255,184,0,0.2), icon + label

?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???SECTION 8: Z-INDEX STACK DIAGRAM
?��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��???Vertical diagram showing layers:
??z-1 to z-5: Sticky columns, Resizable handles
??z-10: Table header sticky
??z-100: Toolbar dropdowns
??z-200: Modal overlays
??z-250: Toast notifications
??z-9999: Fixed pagination dropdown

Clean white background, section titles as bold headers #1c252e with #f4f6f8 section bg strips.
Show actual rendered examples, NOT just text descriptions.
`;

async function run() {
  try {
    console.log('🔄 Generating UI Patterns showcase in Stitch...');
    const screen = await project.generate(prompt);
    console.log('Screen ID:', screen.id);

    const raw = screen.data;

    if (raw?.htmlCode?.downloadUrl) {
      const res = await fetch(raw.htmlCode.downloadUrl);
      const html = await res.text();
      writeFileSync('./stitch-patterns-output.html', html, 'utf8');
      console.log(`✅ HTML (${html.length} chars) → stitch-patterns-output.html`);
    } else {
      console.log('⚠️  No htmlCode downloadUrl found.');
    }

    if (raw?.screenshot?.downloadUrl) {
      const res2 = await fetch(raw.screenshot.downloadUrl);
      const buf = Buffer.from(await res2.arrayBuffer());
      writeFileSync('./stitch-patterns-preview.png', buf);
      console.log(`🖼️ Screenshot (${buf.length}B) → stitch-patterns-preview.png`);
    } else {
      console.log('⚠️  No screenshot downloadUrl found.');
    }

    console.log('\n✅ UI Patterns synced to Stitch!');
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    if (err.stack) console.error(err.stack);
  } finally {
    await client.close().catch(() => {});
  }
}

run();


