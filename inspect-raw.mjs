// inspect-raw.mjs
import { readFileSync, writeFileSync } from 'fs';
const d = JSON.parse(readFileSync('./stitch-raw.json', 'utf8'));
const screen = d.outputComponents[0].design.screens[0];
console.log('screen keys:', Object.keys(screen));
if (screen.code) {
  console.log('code keys:', Object.keys(screen.code));
  if (screen.code.html) {
    writeFileSync('./stitch-design-output.html', screen.code.html, 'utf8');
    console.log('HTML saved! chars:', screen.code.html.length);
  }
}
if (screen.components) {
  console.log('components count:', screen.components.length);
  console.log('first component keys:', Object.keys(screen.components[0] || {}));
}
// log full screen structure (trimmed)
const str = JSON.stringify(screen, null, 2);
writeFileSync('./screen-structure.json', str.slice(0, 20000), 'utf8');
console.log('Partial structure saved to screen-structure.json');
