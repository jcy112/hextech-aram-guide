const fs = require('fs')
const path = require('path')

const indexPath = path.join(__dirname, '..', 'src', 'data', 'champions-index.json')
const champions = JSON.parse(fs.readFileSync(indexPath, 'utf8'))

const hotHeroSet = new Set([
  'varus', 'sion', 'trundle', 'aatrox', 'akali', 'ashe', 'brand',
  'caitlyn', 'darius', 'draven', 'ezreal', 'fiora', 'gangplank',
  'garen', 'jax', 'jayce', 'jinx', 'kaisa', 'katarina', 'khazix',
  'leblanc', 'leesin', 'lucian', 'lux', 'malphite', 'masteryi',
  'missfortune', 'mordekaiser', 'morgana', 'ornn', 'pantheon',
  'pyke', 'rengar', 'riven', 'samira', 'senna', 'sett', 'shaco',
  'shen', 'swain', 'sylas', 'tahmkench', 'teemo', 'thresh',
  'twistedfate', 'vayne', 'veigar', 'vi', 'viktor', 'vladimir',
  'xayah', 'yasuo', 'yone', 'zed', 'ziggs', 'zoe', 'zyra'
])

function getBuildTypes(tags) {
  const types = new Set()
  for (const tag of tags) {
    switch (tag) {
      case '射手': types.add('AD'); break
      case '法师': types.add('AP'); break
      case '坦克': types.add('Tank'); break
      case '刺客': types.add('Assassin'); break
      case '战士': types.add('AD'); types.add('Tank'); break
      case '辅助': types.add('Special'); break
    }
  }
  return [...types]
}

for (const c of champions) {
  c.hotHero = hotHeroSet.has(c.id)
  c.buildTypes = getBuildTypes(c.tags)
}

fs.writeFileSync(indexPath, JSON.stringify(champions, null, 2), 'utf8')
console.log('Updated ' + champions.length + ' champions')
console.log('Hot heroes: ' + champions.filter(function(c) { return c.hotHero }).length)
