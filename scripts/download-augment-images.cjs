// Download augment icons to public/assets/augment/
// Tries multiple sources for each augment image
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const allAugments = require('../src/data/all-augments-aramkit.json')
const outputDir = path.join(__dirname, '..', 'public', 'assets', 'augment')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { timeout: 10000, rejectUnauthorized: false }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        fs.unlinkSync(dest)
        download(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
      file.on('error', (err) => { fs.unlinkSync(dest); reject(err) })
    })
    req.on('timeout', () => { req.destroy(); file.close(); fs.unlinkSync(dest); reject(new Error('timeout')) })
    req.on('error', (err) => { file.close(); try { fs.unlinkSync(dest) } catch {}; reject(err) })
  })
}

async function tryDownload(augment) {
  const { slug, imageUrl } = augment
  const dest = path.join(outputDir, slug + '.webp')

  // Skip if already exists
  if (fs.existsSync(dest)) {
    console.log(`[SKIP] ${slug} (already exists)`)
    return true
  }

  // Extract numeric ID from original URL (e.g., "1134" from "1134-08f73f42c331.webp")
  const match = imageUrl.match(/(\d+)-[a-f0-9]+\.webp/)
  const assetId = match ? match[1] : null

  const sources = [
    // Original aramkit URL (may work with different CDN)
    imageUrl,
    // CommunityDragon latest
    assetId ? `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/maps/modespecificdata/augments/${slug}/${slug}.png` : null,
    // CommunityDragon PBE
    assetId ? `https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/maps/modespecificdata/augments/icons/${assetId}.png` : null,
  ].filter(Boolean)

  for (const url of sources) {
    try {
      await download(url, dest)
      console.log(`[OK] ${slug} ← ${url}`)
      return true
    } catch (e) {
      // Try next source
    }
  }

  console.log(`[FAIL] ${slug} — could not download from any source`)
  return false
}

async function main() {
  let success = 0
  let fail = 0

  for (const aug of allAugments) {
    const ok = await tryDownload(aug)
    if (ok) success++
    else fail++
  }

  console.log(`\nDone: ${success} downloaded, ${fail} failed`)
}

main()
