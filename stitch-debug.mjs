// stitch-debug.mjs — 查看 Stitch raw response
import { StitchToolClient } from '@google/stitch-sdk';
import { writeFileSync } from 'fs';

const client = new StitchToolClient({
  apiKey: 'AQ.Ab8RN6Kws5loiUQF-EC9yyTGKjQZumRwSZ9WcX1tOZMGH_3rmA',
});

try {
  await client.connect();

  // 先 list projects
  const projectsRaw = await client.callTool('list_projects', {});
  console.log('=== list_projects raw ===');
  console.log(JSON.stringify(projectsRaw, null, 2).slice(0, 500));

  const projectId = '758741352527483360';

  // generate screen
  console.log('\n=== calling generate_screen_from_text ===');
  const raw = await client.callTool('generate_screen_from_text', {
    projectId,
    prompt: 'A simple color palette page showing 5 color swatches: #1c252e, #637381, #1D7BF5, #118d57, #b71d18 with their hex labels. Clean white background.',
  });

  const rawStr = JSON.stringify(raw, null, 2);
  console.log('Response keys:', Object.keys(raw));
  writeFileSync('./stitch-raw.json', rawStr, 'utf8');
  console.log('Saved raw response to stitch-raw.json');
  console.log('Preview (first 2000 chars):\n', rawStr.slice(0, 2000));

} catch (err) {
  console.error('Error:', err.message);
  if (err.stack) console.error(err.stack);
} finally {
  await client.close().catch(() => {});
}
