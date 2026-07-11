// Extract giftData objects from the old Next.js gift pages into gifts.json
const fs = require('fs');
const path = require('path');

const APP = "/sessions/sharp-determined-wright/mnt/7 Motivational Gifts Of the Father/Abacus.ai files/motivational_giftings/app/app";
const slugs = ['catalyst', 'servant', 'erudite', 'enthusiast', 'host', 'strategist', 'lover'];

function extractObject(src, varName) {
  const startIdx = src.indexOf(`const ${varName} = {`);
  if (startIdx === -1) return null;
  let i = src.indexOf('{', startIdx);
  let depth = 0, inStr = null, esc = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (inStr) { if (c === inStr) inStr = null; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    if (c === '}') { depth--; if (depth === 0) return src.slice(i, j + 1); }
  }
  return null;
}

const gifts = {};
for (const slug of slugs) {
  const src = fs.readFileSync(path.join(APP, slug, 'page.tsx'), 'utf8');
  let block = extractObject(src, 'giftData');
  if (!block) { console.error('FAILED', slug); continue; }
  // Neutralize icon identifiers (lucide components) -> strings
  block = block.replace(/icon:\s*([A-Za-z][A-Za-z0-9]*)/g, 'icon: "$1"');
  let obj;
  try { obj = eval('(' + block + ')'); }
  catch (e) { console.error('EVAL FAIL', slug, e.message); continue; }
  gifts[slug] = obj;
  console.log(slug, 'keys:', Object.keys(obj).join(','));
}
fs.writeFileSync(__dirname + '/content/gifts.json', JSON.stringify(gifts, null, 2));
console.log('WROTE gifts.json', Object.keys(gifts).length, 'gifts');
