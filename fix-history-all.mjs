import fs from 'fs';

const files = [
  'src/app/components/CorrectionListWithTabs.tsx',
  'src/app/components/CorrectionDetailPage.tsx',
  'src/app/components/CorrectionCreatePage.tsx',
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  const before = c;
  
  // Remove patterns like: " — 狀態 ${...} → ${...}" or " — XX → YY" from event strings
  // Pattern 1: template literal with variables: ` — 狀態 ${row.correctionStatus} → ${newStatus}`
  c = c.replace(/\s*—\s*狀態\s*\$\{[^}]+\}\s*→\s*\$\{[^}]+\}/g, '');
  // Pattern 2: template literal: ` — 狀態 ${row.correctionStatus} → CL`
  c = c.replace(/\s*—\s*狀態\s*\$\{[^}]+\}\s*→\s*\w+/g, '');
  // Pattern 3: literal strings like " — DR → V" or " — V → CP" or " — B → CP" or " — CP → SS"
  c = c.replace(/\s*—\s*[A-Z]{1,3}\s*→\s*[A-Z]{1,3}/g, '');
  
  if (c !== before) {
    fs.writeFileSync(file, c, 'utf8');
    const count = (before.length - c.length);
    console.log(`✅ ${file}: removed ${count} chars of status transition text`);
  } else {
    console.log(`— ${file}: no changes needed`);
  }
}

// Verify no more " → " patterns in event strings
for (const file of files) {
  const c = fs.readFileSync(file, 'utf8');
  const eventLines = c.split('\n').filter(l => l.includes("event:") && l.includes('→'));
  if (eventLines.length > 0) {
    console.log(`⚠️  ${file} still has → in event lines:`);
    eventLines.forEach(l => console.log('    ' + l.trim()));
  }
}
console.log('Done.');
