import 'dotenv/config';
// sync-components.mjs ??�?COMPONENT_MANIFEST.md ?�步??Stitch ?��??�件展示??
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';
import { readFileSync, writeFileSync } from 'fs';

const client = new StitchToolClient({
  apiKey: process.env.STITCH_API_KEY,
});
const stitch = new Stitch(client);
const PROJECT_ID = '10043003026964451146';
const project = stitch.project(PROJECT_ID);

const manifest = readFileSync('./COMPONENT_MANIFEST.md', 'utf8');
console.log(`?? COMPONENT_MANIFEST.md loaded (${manifest.length} chars)`);

const prompt = `
Create a comprehensive UI component library showcase page for "Giant Global EP" - a B2B procurement management system.

Based on this component manifest:
${manifest.slice(0, 6000)}

Design tokens:
- Font: Public Sans (Latin), Noto Sans JP (CJK)
- Primary text: #1c252e, Secondary: #637381, Disabled: #919eab
- Brand blue: #1D7BF5, Link: #1677ff, Action: #004680
- Success: #118d57, Error: #b71d18, Warning: #b76e00
- Table header bg: #f4f6f8, Selection toolbar bg: #d9e8f5

Show these components as visual examples:

**Section 1: Checkboxes**
- CheckboxIcon: 20?20px, unchecked (#919EAB) | checked (#1D7BF5 fill)
- CustomCheckbox: 16?16px, smaller version

**Section 2: Dropdowns**
- DropdownSelect: tall (54px) with floating label "?�?? and selected value "廠�?確�?�?V"
- FilterSelect: shorter (40px), react-select style, placeholder "?��?廠�?..."

**Section 3: ColumnSelector panel** (280px wide card):
  Header: "顯示欄�? (5/8)" | "all" button in blue
  List of checkboxes: 訂單?�?��?, 訂單?�碼?? 廠�??�稱?? ?��??? 規格?? ?�購人員?? ?�司?? ?�購組�???  Footer: ?��? | ?�用 buttons

**Section 4: FilterDialog panel** (480px wide):
  Header: "?��?篩選 (2)"
  Row 1: [廠�??�稱 ?�] [?�含 ?�] [?�聯] [?�]
  Row 2: [訂單?�???�] [等於 ?�] [V] [?�]
  "+ ?��?篩選條件" button (dashed border, blue)
  Footer: ?��? | ?�用

**Section 5: TableToolbar**
  Left: "1842 results found"
  Right: [Columns icon] [Filters icon] [Export ??icon]

**Section 6: Status Badges** - all 8 in a row:
  NP(gray) V(amber) B(red) CK(cyan) CP(green) DR(gray) SS(dark) CL(gray)

**Section 7: Button System** - all variants:
  Primary(#1D7BF5), Secondary(gray text), ToolbarBtn(#004680 text only), Ghost(dashed)

**Section 8: PaginationControls:**
  "Rows per page: [100 ?�]  1??00 of 1842  ????

**Section 9: BaseOverlay preview** - small frame showing modal card with shadow

White background, clean grid layout, section titles in bold #1c252e, spacing between sections.
`;

async function run() {
  try {
    console.log('🔄 Generating component library page in Stitch...');
    const screen = await project.generate(prompt);
    console.log('Screen ID:', screen.id);

    const raw = screen.data;

    if (raw?.htmlCode?.downloadUrl) {
      const res = await fetch(raw.htmlCode.downloadUrl);
      const html = await res.text();
      writeFileSync('./stitch-components-output.html', html, 'utf8');
      console.log(`✅ HTML saved (${html.length} chars) → stitch-components-output.html`);
    } else {
      console.log('⚠️  No htmlCode downloadUrl found.');
    }

    if (raw?.screenshot?.downloadUrl) {
      const res2 = await fetch(raw.screenshot.downloadUrl);
      const buf = Buffer.from(await res2.arrayBuffer());
      writeFileSync('./stitch-components-preview.png', buf);
      console.log(`🖼️ Screenshot (${buf.length}B) → stitch-components-preview.png`);
    } else {
      console.log('⚠️  No screenshot downloadUrl found.');
    }

    console.log('\n✅ Component manifest synced to Stitch!');
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    if (err.stack) console.error(err.stack);
  } finally {
    await client.close().catch(() => {});
  }
}

run();

