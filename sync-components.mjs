// sync-components.mjs — 將 COMPONENT_MANIFEST.md 同步至 Stitch 生成元件展示頁
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';
import { readFileSync, writeFileSync } from 'fs';

const client = new StitchToolClient({
  apiKey: 'AQ.Ab8RN6Kws5loiUQF-EC9yyTGKjQZumRwSZ9WcX1tOZMGH_3rmA',
});
const stitch = new Stitch(client);
const PROJECT_ID = '758741352527483360';
const project = stitch.project(PROJECT_ID);

const manifest = readFileSync('./COMPONENT_MANIFEST.md', 'utf8');
console.log(`📄 COMPONENT_MANIFEST.md loaded (${manifest.length} chars)`);

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
- CheckboxIcon: 20×20px, unchecked (#919EAB) | checked (#1D7BF5 fill)
- CustomCheckbox: 16×16px, smaller version

**Section 2: Dropdowns**
- DropdownSelect: tall (54px) with floating label "狀態" and selected value "廠商確認中 V"
- FilterSelect: shorter (40px), react-select style, placeholder "選擇廠商..."

**Section 3: ColumnSelector panel** (280px wide card):
  Header: "顯示欄位 (5/8)" | "all" button in blue
  List of checkboxes: 訂單狀態✓, 訂單號碼✓, 廠商名稱✓, 料號✓, 規格✓, 採購人員☐, 公司☐, 採購組織☐
  Footer: 取消 | 應用 buttons

**Section 4: FilterDialog panel** (480px wide):
  Header: "進階篩選 (2)"
  Row 1: [廠商名稱 ▾] [包含 ▾] [速聯] [✕]
  Row 2: [訂單狀態 ▾] [等於 ▾] [V] [✕]
  "+ 新增篩選條件" button (dashed border, blue)
  Footer: 取消 | 應用

**Section 5: TableToolbar**
  Left: "1842 results found"
  Right: [Columns icon] [Filters icon] [Export ▾ icon]

**Section 6: Status Badges** - all 8 in a row:
  NP(gray) V(amber) B(red) CK(cyan) CP(green) DR(gray) SS(dark) CL(gray)

**Section 7: Button System** - all variants:
  Primary(#1D7BF5), Secondary(gray text), ToolbarBtn(#004680 text only), Ghost(dashed)

**Section 8: PaginationControls:**
  "Rows per page: [100 ▾]  1–100 of 1842  ‹ ›"

**Section 9: BaseOverlay preview** - small frame showing modal card with shadow

White background, clean grid layout, section titles in bold #1c252e, spacing between sections.
`;

async function run() {
  try {
    console.log('⏳ Generating component library page in Stitch...');
    const screen = await project.generate(prompt);

    // getScreen 取得帶 htmlCode 的 raw data
    const fetched = await project.getScreen(screen.id);
    const raw = fetched.data || fetched;
    console.log('Screen ID:', screen.id);

    const htmlObj = raw.htmlCode;
    const ssObj = raw.screenshot;

    if (htmlObj?.downloadUrl) {
      const res = await fetch(htmlObj.downloadUrl);
      const html = await res.text();
      writeFileSync('./stitch-components-output.html', html, 'utf8');
      console.log(`✅ HTML saved (${html.length} chars) → stitch-components-output.html`);
    }

    if (ssObj?.downloadUrl) {
      const res2 = await fetch(ssObj.downloadUrl);
      const buf = Buffer.from(await res2.arrayBuffer());
      writeFileSync('./stitch-components-preview.png', buf);
      console.log(`🖼️  Screenshot (${buf.length}B) → stitch-components-preview.png`);
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
