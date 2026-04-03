import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const qPath = path.join(root, 'archetype-data', 'archetype-questions.js');
const aPath = path.join(root, 'archetype-data', 'archetypes.js');

const q = fs.readFileSync(qPath, 'utf8');
const ids = new Set();
for (const m of q.matchAll(/archetypes:\s*\[([^\]]+)\]/g)) {
  for (const part of m[1].split(',')) {
    const x = part.trim().replace(/['"]/g, '');
    if (/^[a-z_]+$/.test(x)) ids.add(x);
  }
}
for (const m of q.matchAll(/\{\s*id:\s*'([a-z_]+)'\s*,\s*weight:/g)) {
  ids.add(m[1]);
}

const archText = fs.readFileSync(aPath, 'utf8');
const taxonomy = new Set();
for (const m of archText.matchAll(/^\s{2}([a-z_]+):\s*\{/gm)) {
  taxonomy.add(m[1]);
}

const inQuestionsNotTax = [...ids].filter((id) => !taxonomy.has(id)).sort();
const inTaxNotQuestions = [...taxonomy].filter((id) => !ids.has(id)).sort();

console.log(JSON.stringify({ questionRefCount: ids.size, taxonomyCount: taxonomy.size, inQuestionsNotTax, inTaxNotQuestions }, null, 2));
