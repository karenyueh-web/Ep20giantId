import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use file:// URL for worker on Windows
const workerPath = join(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const filePath = join(__dirname, '國家代碼表.pdf');
const buf = readFileSync(filePath);
const uint8 = new Uint8Array(buf);

const loadingTask = getDocument({ data: uint8, useSystemFonts: true });
const pdf = await loadingTask.promise;

console.log('Total pages:', pdf.numPages);
let fullText = '';

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  const pageText = content.items.map(item => item.str).join(' ');
  fullText += `\n--- Page ${i} ---\n` + pageText;
}

writeFileSync(join(__dirname, 'country-pdf-raw.txt'), fullText, 'utf-8');
console.log('Written to country-pdf-raw.txt');
console.log('\n--- FIRST 3000 chars ---');
console.log(fullText.substring(0, 3000));
process.exit(0);
