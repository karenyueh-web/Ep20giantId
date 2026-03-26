import 'dotenv/config';
// sync-design-system.mjs ???�步?��?DESIGN_SYSTEM.md ??Stitch
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';
import { readFileSync, writeFileSync } from 'fs';

const client = new StitchToolClient({
  apiKey: process.env.STITCH_API_KEY,
});
const stitch = new Stitch(client);
const PROJECT_ID = '10043003026964451146';
const project = stitch.project(PROJECT_ID);

const doc = readFileSync('./DESIGN_SYSTEM.md', 'utf8');
console.log(`?? DESIGN_SYSTEM.md loaded (${doc.length} chars)`);

const prompt = `
Create a "Design System Reference" page for "Giant Global EP" ??a B2B procurement platform.

Use STRICTLY these design tokens:
- Font: Public Sans + Noto Sans JP
- Primary text: #1c252e, Secondary: #637381, Disabled: #919eab
- Link blue: #1677ff (ONLY color for clickable links), hover: #0958d9
- Brand blue (buttons/checkbox): #1D7BF5
- Action text: #004680 (toolbar text-only buttons)
- Success: #118d57, Error: #b71d18, Warning: #b76e00
- Table header bg: #f4f6f8 (343 uses), Toolbar selected: #d9e8f5

Show this design system in a beautiful single-page layout:

?��??��??��? SECTION 1: COLOR PALETTE ?��??��??��?
Grid of color swatches (3 columns):
Row 1 ??Text colors: #1c252e "Primary Text" | #637381 "Secondary" | #919eab "Disabled"
Row 2 ??Action colors: #1677ff "Link Blue ??unified" | #004680 "Action" | #1D7BF5 "Brand Blue"
Row 3 ??Semantic: #118d57 "Success" | #b71d18 "Error" | #b76e00 "Warning"
Row 4 ??Backgrounds: #f4f6f8 "Table Header" | #d9e8f5 "Selected Toolbar" | #1c252e "Sidebar"

?��??��??��? SECTION 2: TYPOGRAPHY ?��??��??��?
Show 4 text examples with Public Sans:
- Heading Bold 20px #1c252e
- Body Regular 14px #1c252e
- Secondary 14px #637381
- Disabled/Placeholder 14px #919eab

?��??��??��? SECTION 3: STATUS BADGES ?��??��??��?
All 8 badges in a row:
NP(gray bg #637381 text) | V(amber #b76e00) | B(red #b71d18) | CK(cyan #006c9c)
CP(green #118d57) | DR(gray) | SS(dark #454f5b) | CL(gray)
Each: rounded-6px, px-8 py-2, SemiBold 12px

?��??��??��? SECTION 4: BORDER RADIUS SCALE ?��??��??��?
6 boxes: [6px Badge] [8px Button?�] [10px Dropdown] [12px Card] [16px Page] [??00px Avatar]

?��??��??��? SECTION 5: BUTTON SYSTEM ?��??��??��?
All 6 button variants in a row:
A) Primary: bg #1D7BF5 white text "?�用"
B) Secondary: text #637381 "?��?"
C) Toolbar: icon+text #1c252e "Columns"
D) ToolbarAction: text-only #004680 "檢�?"
E) Danger: 36px red hover ??F) Ghost: dashed border "+ ?��?條件"

?��??��??��? SECTION 6: INPUT PATTERNS ?��??��??��?
3 inputs stacked:
- Standard h-36 border rounded-8 "?��?廠�?..."
- Floating label h-54 "?�???? with label "訂單?�?? at top-left edge
- react-select h-40 clearable "?��?廠�?... ?"

?��??��??��? SECTION 7: PANEL PATTERN (ColumnSelector) ?��??��??��?
Show a small panel card (280px):
Header: "顯示欄�? (5/8)" | [all]
Body: checkbox list (3 checked, 2 unchecked)
Footer: [?��?] [?�用]

?��??��??��? SECTION 8: TABLE COMPONENT ?��??��??��?
Mini procurement table:
Header row (56px bg #f4f6f8): [??88px sticky] [?��?序�? 160px sticky] [訂單?��?] [廠�??�稱] [?�?�]
Row 1 (76px, selected #rgba(0,94,184,0.04)): [?�] [400649723010 ??#1677ff underline] [2025/04/10] [?�聯?��?] [CP badge]
Row 2 (76px): [?�] [400649724020] [2025/04/11] [久廣精�?] [V badge]
Footer: SelectionToolbar h-48 bg #d9e8f5: [?�] "1 selected" | "檢�?" "?�交"

?��??��??��? SECTION 9: Z-INDEX STACK ?��??��??��?
Horizontal layers visualization showing:
Sticky(z-4) ??Table Header(z-10) ??Toolbar Dropdown(z-100) ??Modal(z-200) ??Toast(z-250) ??Pagination(z-9999)

White background, clean grid layout.
`;

async function run() {
  try {
    console.log('🔄 Syncing DESIGN_SYSTEM.md to Stitch...');
    const screen = await project.generate(prompt);
    console.log('Screen ID:', screen.id);

    const raw = screen.data;

    if (raw?.htmlCode?.downloadUrl) {
      const res = await fetch(raw.htmlCode.downloadUrl);
      const html = await res.text();
      writeFileSync('./stitch-design-system-output.html', html, 'utf8');
      console.log(`✅ HTML (${html.length} chars) → stitch-design-system-output.html`);
    } else {
      console.log('⚠️  No htmlCode downloadUrl found.');
    }

    if (raw?.screenshot?.downloadUrl) {
      const res2 = await fetch(raw.screenshot.downloadUrl);
      const buf = Buffer.from(await res2.arrayBuffer());
      writeFileSync('./stitch-design-system-preview.png', buf);
      console.log(`🖼️ Screenshot (${buf.length}B) → stitch-design-system-preview.png`);
    } else {
      console.log('⚠️  No screenshot downloadUrl found.');
    }

    console.log('\n✅ DESIGN_SYSTEM.md synced to Stitch!');
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    if (err.stack) console.error(err.stack);
  } finally {
    await client.close().catch(() => {});
  }
}
run();

