// extract-html.mjs
import { readFileSync, writeFileSync } from 'fs';
const d = JSON.parse(readFileSync('./stitch-raw.json', 'utf8'));
const screen = d.outputComponents[0].design.screens[0];

if (screen.htmlCode) {
  writeFileSync('./stitch-design-output.html', screen.htmlCode, 'utf8');
  console.log('??HTML saved to stitch-design-output.html, chars:', screen.htmlCode.length);
}

if (screen.screenshot) {
  // screenshot may be base64 or URL
  if (screen.screenshot.startsWith('data:') || /^[A-Za-z0-9+/]+=*$/.test(screen.screenshot.slice(0,50))) {
    const base64 = screen.screenshot.replace(/^data:image\/\w+;base64,/, '');
    writeFileSync('./stitch-design-preview.png', Buffer.from(base64, 'base64'));
    console.log('?–¼ï¸? Preview saved to stitch-design-preview.png');
  } else {
    console.log('screenshot URL:', screen.screenshot.slice(0, 100));
  }
}
