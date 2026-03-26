import 'dotenv/config';
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';
import { writeFileSync } from 'fs';

const client = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
const stitch = new Stitch(client);

const PROJECT_ID = '10043003026964451146';
const project = stitch.project(PROJECT_ID);

try {
  console.log('Generating...');
  const screen = await project.generate('Create a simple red button component.');
  console.log('Screen ID:', screen.id);
  console.log('Screen data keys:', screen.data ? Object.keys(screen.data) : 'no data');

  // Try getHtml
  console.log('Calling getHtml()...');
  try {
    const html = await screen.getHtml();
    console.log('HTML length:', html?.length);
    if (html) writeFileSync('./debug-output.html', html, 'utf8');
  } catch (e) {
    console.error('getHtml() error:', e.message);
    console.error(e.stack);
  }

} catch (e) {
  console.error('Top-level error:', e.message);
  console.error(e.stack);
} finally {
  await client.close().catch(() => {});
}
