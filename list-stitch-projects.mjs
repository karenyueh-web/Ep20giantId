import 'dotenv/config';
import { StitchToolClient } from '@google/stitch-sdk';
import { Stitch } from './node_modules/@google/stitch-sdk/dist/generated/src/index.js';

const client = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
const stitch = new Stitch(client);

try {
  const projects = await stitch.projects();
  console.log(`Found ${projects.length} project(s):`);
  for (const p of projects) {
    console.log(`  ID: ${p.id}  Name: ${p.name || '(no name)'}`);
  }
  if (projects.length === 0) {
    console.log('No projects found — will need to create a new one.');
    const newProj = await stitch.createProject('Giant Global EP');
    console.log(`Created new project ID: ${newProj.id}`);
  }
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await client.close().catch(() => {});
}
