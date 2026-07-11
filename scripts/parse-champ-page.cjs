const fs = require('fs');
const html = fs.readFileSync(__dirname + '/../graves-page.html', 'utf8');

// Extract NUXT data
const match = html.match(/<script type="application\/json"[^>]*id="__NUXT_DATA__">([\s\S]*?)<\/script>/);
if (!match) { console.log('No NUXT data found'); process.exit(1); }

const data = JSON.parse(match[1]);
console.log('Data array length:', data.length);

// Look for champion-augment structures
// Nuxt payload format: [type, value] for ShallowReactive, Reactive etc.
// The state object has champion data with augment win rates

// First, find all strings that could be augment names
const allAugs = JSON.parse(fs.readFileSync(__dirname + '/../src/data/all-augments-aramkit.json', 'utf8'));
const augNameSet = new Set(allAugs.map(a => a.name));

// Print all string entries near augment names
let augNameIndices = [];
for (let i = 0; i < data.length; i++) {
  if (typeof data[i] === 'string' && augNameSet.has(data[i])) {
    augNameIndices.push(i);
  }
}

console.log('Found', augNameIndices.length, 'augment name references in data');

// For each augment name found, look at the surrounding context (next 5 values)
if (augNameIndices.length > 0) {
  console.log('\nFirst 5 augment references:');
  for (let idx = 0; idx < Math.min(5, augNameIndices.length); idx++) {
    const i = augNameIndices[idx];
    console.log(`\n--- Augment at index ${i}: "${data[i]}" ---`);
    for (let j = i; j < Math.min(i + 10, data.length); j++) {
      const val = data[j];
      if (typeof val === 'string' && val.includes('%')) {
        console.log(`  [${j}] WINRATE: ${val}`);
      } else if (typeof val === 'number' && val > 100 && val < 10000000) {
        console.log(`  [${j}] NUMBER (pick count?): ${val}`);
      } else if (typeof val === 'string' && val.length < 50 && val !== data[i]) {
        console.log(`  [${j}] "${val}"`);
      } else if (typeof val === 'number' && val >= 0 && val <= 100) {
        console.log(`  [${j}] small number: ${val}`);
      }
    }
  }
}

// Try to find the champion-augments data structure
// The state should be a Reactive object
// Look for objects with "augments" key patterns
function findAugmentStructures(obj, path, depth) {
  if (depth > 15) return;
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    // Check if this array looks like augment data
    if (obj.length > 0 && typeof obj[0] === 'object') {
      const keys = Object.keys(obj[0]);
      if (keys.includes('winRate') || keys.includes('pickRate') || keys.includes('matches')) {
        console.log(`\nPOTENTIAL AUGMENT ARRAY at ${path}:`, keys, 'length:', obj.length);
        console.log('Sample:', JSON.stringify(obj.slice(0, 2), null, 2).substring(0, 500));
      }
    }
    for (let i = 0; i < Math.min(obj.length, 3); i++) {
      findAugmentStructures(obj[i], `${path}[${i}]`, depth + 1);
    }
  } else {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'augments' || k === 'championAugments' || k === 'recommendedAugments') {
        console.log(`\nFOUND "${k}" at ${path}:`, typeof v, Array.isArray(v) ? 'array['+v.length+']' : v);
        if (Array.isArray(v) && v.length > 0) {
          console.log('First item:', JSON.stringify(v[0], null, 2).substring(0, 300));
        }
      }
      findAugmentStructures(v, `${path}.${k}`, depth + 1);
    }
  }
}

// Resolve the Nuxt references
function resolve(arr, val, visited = new Set()) {
  if (typeof val === 'number') {
    if (visited.has(val)) return val;
    visited.add(val);
    return resolve(arr, arr[val], visited);
  }
  if (Array.isArray(val)) return val.map(v => resolve(arr, v, visited));
  if (val && typeof val === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(val)) o[k] = resolve(arr, v, visited);
    return o;
  }
  return val;
}

const resolved = resolve(data, data);
console.log('\n\n=== STATE STRUCTURE ===');
if (resolved && resolved.state) {
  console.log('State type:', typeof resolved.state);
  if (typeof resolved.state === 'object' && !Array.isArray(resolved.state)) {
    for (const [k, v] of Object.entries(resolved.state)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const keys = Object.keys(v).slice(0, 10);
        console.log(k, 'keys:', keys);
      } else if (Array.isArray(v)) {
        console.log(k, 'array length:', v.length);
      } else {
        console.log(k, '=', typeof v === 'string' ? v.substring(0, 80) : v);
      }
    }
  }
  findAugmentStructures(resolved.state, 'state', 0);
}
