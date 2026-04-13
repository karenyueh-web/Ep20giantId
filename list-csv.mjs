import { readdirSync } from 'fs';
const files = readdirSync('.');
const found = files.filter(f => !f.startsWith('.') && !['node_modules','src','public','dist'].includes(f));
console.log('Root files:', found);
