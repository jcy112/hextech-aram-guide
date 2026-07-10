const fs = require('fs');
const path = require('path');
const champsDir = path.join(__dirname, '..', 'src', 'data', 'champions');
const indexPath = path.join(__dirname, '..', 'src', 'data', 'champions-index.json');
const champions = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log('Total champions:', champions.length);
let gen = 0, skip = 0;

for (const c of champions) {
  const fp = path.join(champsDir, c.id + '.json');
  let ex = null;
  try { ex = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch(e) {}
  if (ex && ex.matchup && ex.builds && ex.builds[0] && ex.builds[0].id && ex.builds[0].type) { skip++; continue; }
  gen++;
  if (gen <= 3) console.log('Generated:', c.id);
}
console.log('Would generate:', gen, 'Skip:', skip, 'Total:', champions.length);
