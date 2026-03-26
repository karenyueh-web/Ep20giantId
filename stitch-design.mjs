import 'dotenv/config';
// stitch-design.mjs ???��? Giant Global EP 設�?系統規�??�面
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';
import { writeFileSync } from 'fs';

const client = new StitchToolClient({
  apiKey: process.env.STITCH_API_KEY,
});
const stitch = new Stitch(client);

const prompt = `
Create a design system specification page for "Giant Global EP" ??a B2B procurement management system used by Giant Cycling Group.

Design DNA:
Font: Public Sans (Latin), Noto Sans JP (CJK)

Colors:
- Primary text: #1c252e
- Secondary text: #637381  
- Disabled/empty: #919eab
- Brand blue: #1D7BF5
- Link blue: #1677ff (hover:#0958d9)
- Action text: #004680
- Success green: #118d57
- Error red: #b71d18
- Warning amber: #b76e00
- Table header bg: #f4f6f8
- Selection toolbar bg: #d9e8f5
- Card bg: white, border shadow subtle

Show these sections clearly:

1. COLOR PALETTE ??swatches for all 13 colors above with labels and hex codes

2. TYPOGRAPHY SCALE ??using Public Sans:
   - 14px SemiBold #637381 ??"Table Header"
   - 14px Regular #1c252e ??"Table Body"
   - 14px SemiBold #004680 ??"Toolbar Action (text only)"
   - 14px Regular #1677ff underline ??"Link / Doc No"
   - 12px Bold ??"Status Badge"

3. STATUS BADGES ??inline pill shapes:
   CL (gray #637381 / bg rgba(145,158,171,0.12))
   V (amber #b76e00 / bg rgba(253,176,34,0.12))
   B (red #b71d18 / bg rgba(255,86,48,0.12))
   CK (cyan #006c9c / bg rgba(0,184,217,0.12))
   CP (green #118d57 / bg rgba(34,197,94,0.12))
   DR (gray)

4. TABLE ROW ANATOMY ??show one header row + two data rows with:
   - Sticky checkbox col (88px wide, bg #f4f6f8 for header)
   - Sticky Doc No col (160px, blue underline link)
   - Regular data columns
   - Header height 56px, row height 76px
   - Row border: 1px rgba(145,158,171,0.08)

5. SELECTION TOOLBAR ??h-48px, bg #d9e8f5:
   - Checkbox icon area
   - "2 selected" text in #1c252e
   - Text-only action buttons: "檢�?" "?�部?�交廠�?" in #004680, no background

6. CARD + DROPDOWN ??card with white bg, rounded 16px, shadow; dropdown with rounded 10px, shadow

Output as clean semantic HTML with embedded CSS. Professional, minimal, organized with section headers.
`;

console.log('?�� Connecting to Stitch...');

try {
  // ?��??�現??projects
  let project;
  try {
    const projects = await stitch.projects();
    console.log(`?? Found ${projects.length} project(s)`);
    if (projects.length > 0) {
      project = projects[0];
      console.log(`??Using existing project: ${project.id}`);
    }
  } catch (e) {
    console.log('?��?  list_projects failed, creating new one...');
  }

  if (!project) {
    project = await stitch.createProject('Giant Global EP Design System');
    console.log(`??Created project: ${project.id}`);
  }

  console.log('??Generating design system page (this may take 30??0s)...');
  const screen = await project.generate(prompt);

  const html = await screen.getHtml();
  console.log(`??HTML generated (${html.length} chars)`);

  writeFileSync('./stitch-design-output.html', html, 'utf8');
  console.log('?�� Saved ??stitch-design-output.html');

  try {
    const image = await screen.getImage();
    if (image) {
      const buf = Buffer.isBuffer(image) ? image : Buffer.from(image, 'base64');
      writeFileSync('./stitch-design-preview.png', buf);
      console.log('?���? Preview ??stitch-design-preview.png');
    }
  } catch (_) {
    console.log('?��?  Image export not available for this screen.');
  }

  await client.close();
  console.log('??Done!');

} catch (err) {
  console.error('??Error:', err.message || err);
  if (err.stack) console.error(err.stack);
  await client.close().catch(() => {});
  process.exit(1);
}

