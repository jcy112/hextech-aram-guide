// Script to update all champion summoner spells
// Rule: Flash always primary; secondary based on tags
const fs = require('fs')
const path = require('path')

const championsDir = path.join(__dirname, '..', 'src', 'data', 'champions')

const SNOWBALL_TAGS = ['战士', '坦克', '刺客', '辅助']
const GHOST_TAGS = ['射手', '法师']

const notesMap = {
  '雪球': '闪现保命/拉扯，雪球快速进场开团切后排。',
  '疾跑': '闪现保命，疾跑拉扯风筝打持续输出。'
}

function getSecondary(tags) {
  const primary = tags[0]
  if (primary && SNOWBALL_TAGS.includes(primary)) return '雪球'
  if (primary && GHOST_TAGS.includes(primary)) return '疾跑'
  return '雪球'
}

const files = fs.readdirSync(championsDir).filter(f => f.endsWith('.json'))
let updated = 0

for (const file of files) {
  const filePath = path.join(championsDir, file)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const tags = data.tags || []
  const secondary = getSecondary(tags)

  data.summonerSpells = {
    primary: '闪现',
    secondary,
    notes: notesMap[secondary]
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  updated++
  console.log(`[${updated}] ${data.name} (${tags.join(', ')}) → 闪现 + ${secondary}`)
}

console.log(`\nDone. Updated ${updated} champions.`)
