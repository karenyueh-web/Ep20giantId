import 'dotenv/config';
// grab-latest.mjs ???��??�??screen ??HTML ?�截??
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';
import { writeFileSync } from 'fs';

const client = new StitchToolClient({
  apiKey: process.env.STITCH_API_KEY,
});
const stitch = new Stitch(client);

const PROJECT_ID = '10043003026964451146';
const project = stitch.project(PROJECT_ID);
const SCREEN_ID = '9a1ac2dab21842e6ab99c0b8eaec575f';

try {
  const screen = await project.getScreen(SCREEN_ID);
  // screen ??Screen ?�件，raw data ??screen.data
  const raw = screen.data || screen;
  console.log('Keys:', Object.keys(raw));

  const htmlObj = raw.htmlCode;
  const ssObj = raw.screenshot;

  if (htmlObj?.downloadUrl) {
    const res = await fetch(htmlObj.downloadUrl);
    const html = await res.text();
    writeFileSync('./stitch-design-output.html', html, 'utf8');
    console.log(`??HTML (${html.length} chars) ??stitch-design-output.html`);
  } else {
    console.log('htmlCode:', JSON.stringify(htmlObj).slice(0, 200));
  }

  if (ssObj?.downloadUrl) {
    const res2 = await fetch(ssObj.downloadUrl);
    const buf = Buffer.from(await res2.arrayBuffer());
    writeFileSync('./stitch-design-preview.png', buf);
    console.log(`?���? Screenshot (${buf.length}B) ??stitch-design-preview.png`);
  } else {
    console.log('screenshot:', JSON.stringify(ssObj).slice(0, 200));
  }
} catch(e) {
  console.error('Error:', e.message);
} finally {
  await client.close().catch(()=>{});
}

