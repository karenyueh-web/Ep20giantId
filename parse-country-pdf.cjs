const fs = require('fs');
const path = require('path');

// Use pdfjs-dist which is already installed
const pdfjsLib = require('pdfjs-dist');

async function parsePdf() {
  const filePath = path.join(__dirname, '國家代碼表.pdf');
  const buf = fs.readFileSync(filePath);
  const uint8 = new Uint8Array(buf);

  // Disable worker for Node.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  const loadingTask = pdfjsLib.getDocument({ data: uint8, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true });
  const pdf = await loadingTask.promise;

  console.log('Total pages:', pdf.numPages);
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += `\n--- Page ${i} ---\n` + pageText;
  }

  fs.writeFileSync(path.join(__dirname, 'country-pdf-raw.txt'), fullText, 'utf-8');
  console.log('Written to country-pdf-raw.txt');
  console.log('\n--- FIRST 3000 chars ---');
  console.log(fullText.substring(0, 3000));
}

parsePdf().catch(err => console.error('Error:', err.message, err.stack));
