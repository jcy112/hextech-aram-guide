// Generate augment-heroes.json by reverse-searching champion data
// For each augment, find heroes that recommend it (bestFit / otherFit)
const fs = require('fs')
const path = require('path')

const championsDir = path.join(__dirname, '..', 'src', 'data', 'champions')
const outputFile = path.join(__dirname, '..', 'src', 'data', 'augment-heroes.json')

const augmentMap = {} // augment name → { bestFit: [], otherFit: [] }

const files = fs.readdirSync(championsDir).filter(f => f.endsWith('.json'))

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(championsDir, file), 'utf-8'))
  const heroName = data.name
  const builds = data.builds || []

  for (const build of builds) {
    for (const aug of (build.augments || [])) {
      if (!augmentMap[aug.name]) {
        augmentMap[aug.name] = { bestFit: [], otherFit: [] }
      }

      if (aug.priority === '核心必拿') {
        augmentMap[aug.name].bestFit.push({
          hero: heroName,
          reason: aug.reason || ''
        })
      } else if (aug.priority === '情境可选') {
        augmentMap[aug.name].otherFit.push({
          hero: heroName,
          reason: aug.reason || ''
        })
      }
      // 慎选避开 → skip
    }
  }
}

// Convert to array, pick top 3 (bestFit first, then otherFit)
const result = {}
for (const [name, data] of Object.entries(augmentMap)) {
  const top3 = [...data.bestFit, ...data.otherFit].slice(0, 3)
  result[name] = {
    bestFit: data.bestFit.slice(0, 3),
    otherFit: data.otherFit.slice(0, 5),
    top3
  }
}

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8')

const totalAugs = Object.keys(result).length
const withBestFit = Object.values(result).filter(v => v.bestFit.length > 0).length
const withAny = Object.values(result).filter(v => v.top3.length > 0).length
console.log(`Generated augment-heroes.json: ${totalAugs} augments`)
console.log(`  With bestFit: ${withBestFit}`)
console.log(`  With any hero: ${withAny}`)
