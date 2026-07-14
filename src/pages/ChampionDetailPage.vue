<template>
  <div class="detail-page">
    <div v-if="champion">
      <div class="detail-header">
        <router-link to="/" class="back-link">
          <el-icon><ArrowLeft /></el-icon> 返回英雄列表
        </router-link>
        <div class="header-main">
          <div class="champion-avatar">
            <img v-if="championImageUrl && !avatarFailed" :src="championImageUrl" :alt="champion.name" class="champion-img" @error="avatarFailed = true" />
            <span v-else class="avatar-placeholder">{{ champion.name[0] }}</span>
          </div>
          <div class="header-info">
            <h1 class="champion-name">{{ champion.name }}</h1>
            <p class="champion-title-text">{{ champion.title }}</p>
            <div class="header-stats" v-if="championStat">
              <span class="stat-badge stat-tier" :class="'tier-' + championStat.tier.toLowerCase()">{{ championStat.tier }}</span>
              <span class="stat-badge stat-winrate">
                胜率 {{ championStat.winRate }}
              </span>
              <span class="stat-badge stat-pick">
                选取 {{ formatPickCount(championStat.pickCount) }}
              </span>
            </div>
            <div class="champion-tags">
              <el-tag v-for="tag in champion.tags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- ARAM Balance Modifiers -->
      <el-card v-if="aramBalance" class="section-card balance-card" shadow="never">
        <template #header><span class="section-title">ARAM 平衡修正</span></template>
        <div class="balance-grid">
          <div v-if="aramBalance.damageDealt" class="balance-item">
            <span class="balance-label">造成伤害</span>
            <span class="balance-value" :class="balanceClass(aramBalance.damageDealt)">{{ formatBalance(aramBalance.damageDealt) }}</span>
          </div>
          <div v-if="aramBalance.damageTaken" class="balance-item">
            <span class="balance-label">承受伤害</span>
            <span class="balance-value" :class="balanceClass(aramBalance.damageTaken, true)">{{ formatBalance(aramBalance.damageTaken) }}</span>
          </div>
          <div v-if="aramBalance.healing" class="balance-item">
            <span class="balance-label">治疗量</span>
            <span class="balance-value" :class="balanceClass(aramBalance.healing)">{{ formatBalance(aramBalance.healing) }}</span>
          </div>
          <div v-if="aramBalance.abilityHaste" class="balance-item">
            <span class="balance-label">技能急速</span>
            <span class="balance-value" :class="balanceClass(aramBalance.abilityHaste)">{{ formatBalance(aramBalance.abilityHaste) }}</span>
          </div>
          <div v-if="aramBalance.tenacity" class="balance-item">
            <span class="balance-label">韧性</span>
            <span class="balance-value" :class="balanceClass(aramBalance.tenacity)">{{ formatBalance(aramBalance.tenacity) }}</span>
          </div>
          <div v-if="aramBalance.attackSpeed" class="balance-item">
            <span class="balance-label">攻击速度</span>
            <span class="balance-value" :class="balanceClass(aramBalance.attackSpeed)">{{ formatBalance(aramBalance.attackSpeed) }}</span>
          </div>
        </div>
        <p class="balance-note">以上为 ARAM 专属平衡修正（相对于召唤师峡谷），数据来源于 ARAMKit。</p>
      </el-card>

      <!-- Strength & Weakness -->
      <el-card v-if="champion.strengthReason" class="section-card" shadow="never">
        <template #header><span class="section-title">强度分析</span></template>
        <div class="strength-section">
          <div v-if="champion.strengthReason.strengths" class="strength-block">
            <h4 class="strength-subtitle strong">优势</h4>
            <ul class="strength-list">
              <li v-for="(s, i) in champion.strengthReason.strengths" :key="'s' + i">{{ s }}</li>
            </ul>
          </div>
          <div v-if="champion.strengthReason.weaknesses" class="strength-block">
            <h4 class="strength-subtitle weak">劣势</h4>
            <ul class="strength-list">
              <li v-for="(w, i) in champion.strengthReason.weaknesses" :key="'w' + i">{{ w }}</li>
            </ul>
          </div>
          <p v-if="champion.strengthReason.summary" class="strength-summary">{{ champion.strengthReason.summary }}</p>
        </div>
      </el-card>

      <WhenToPick v-if="champion.whenToPick" :whenToPick="champion.whenToPick" />

      <el-card v-if="champion.runes" class="section-card runes-card" shadow="never">
        <template #header><span class="section-title">符文推荐</span></template>
        <div class="runes-grid">
          <div v-for="rune in champion.runes" :key="rune.name" class="rune-block">
            <div class="rune-header">
              <span class="rune-name">{{ rune.name }}</span>
              <span v-if="rune.style" class="rune-style">{{ rune.style }}</span>
            </div>
            <div class="rune-paths">
              <div class="rune-path" v-if="rune.keystone">
                <span class="rune-path-label">基石</span>
                <span class="rune-path-value">{{ rune.keystone }}</span>
              </div>
              <div class="rune-path" v-if="rune.primary">
                <span class="rune-path-label">主系</span>
                <span class="rune-path-value">{{ rune.primary }}</span>
              </div>
              <div class="rune-path" v-if="rune.secondary">
                <span class="rune-path-label">副系</span>
                <span class="rune-path-value">{{ rune.secondary }}</span>
              </div>
              <div class="rune-path" v-if="rune.shards">
                <span class="rune-path-label">碎片</span>
                <span class="rune-path-value">{{ rune.shards }}</span>
              </div>
            </div>
            <p v-if="rune.reason" class="rune-reason">{{ rune.reason }}</p>
          </div>
        </div>
        <p class="rune-tip">ARAM 符文选择思路：无对线阶段，优先选择常驻战斗收益、续航和减伤类符文。</p>
      </el-card>

      <el-card v-if="champion.summonerSpells" class="section-card summoner-card" shadow="never">
        <template #header><span class="section-title">召唤师技能</span></template>
        <div class="summoner-content">
          <div class="summoner-main">
            <span class="summoner-label">主选</span>
            <img v-if="getSpellImage(champion.summonerSpells.primary)" :src="getSpellImage(champion.summonerSpells.primary)" class="spell-icon" @error="e => e.target.style.display = 'none'" />
            <span class="summoner-value primary">{{ champion.summonerSpells.primary }}</span>
          </div>
          <div class="summoner-main">
            <span class="summoner-label">副选</span>
            <img v-if="getSpellImage(champion.summonerSpells.secondary)" :src="getSpellImage(champion.summonerSpells.secondary)" class="spell-icon" @error="e => e.target.style.display = 'none'" />
            <span class="summoner-value secondary">{{ champion.summonerSpells.secondary }}</span>
          </div>
          <p v-if="champion.summonerSpells.notes" class="summoner-notes">{{ champion.summonerSpells.notes }}</p>
        </div>
      </el-card>

      <div v-for="(build, idx) in champion.builds" :key="idx" class="build-block">
        <div class="build-header">
          <h2 class="build-name">{{ build.name }}</h2>
          <span v-if="build.buildType" class="build-type-badge" :class="'type-' + build.buildType">{{ buildTypeLabel(build.buildType) }}</span>
        </div>

        <el-card class="section-card" shadow="never">
          <template #header><span class="section-title">核心出装</span></template>
          <div class="items-display">
            <div class="core-items">
              <div v-for="(item, i) in build.coreItems" :key="i" class="core-item">
                <div class="item-icon-wrap">
                  <img v-if="getItemImage(item)" :src="getItemImage(item)" class="item-icon" loading="lazy" />
                  <span v-else class="item-icon-placeholder"><el-icon><Box /></el-icon></span>
                </div>
                <span class="item-num">{{ i + 1 }}</span>{{ item }}
              </div>
            </div>
            <el-divider />
            <div class="full-items">
              <div v-for="(item, i) in build.fullItems" :key="i" class="full-item">
                <div class="item-icon-wrap">
                  <img v-if="getItemImage(item)" :src="getItemImage(item)" class="item-icon" loading="lazy" />
                  <span v-else class="item-icon-placeholder"><el-icon><Box /></el-icon></span>
                </div>
                <span class="item-num">{{ i + 1 }}</span>{{ item }}
              </div>
            </div>
          </div>
          <div v-if="build.itemNotes" class="item-notes">
            <p v-for="(note, i) in build.itemNotes" :key="i" class="item-note">{{ note }}</p>
          </div>
        </el-card>

        <el-card class="section-card" shadow="never">
          <template #header><span class="section-title">技能加点：{{ build.skillOrder }}</span></template>
          <div class="skill-order">
            <span v-for="(skill, i) in build.skillDetail" :key="i" class="skill-chip" :class="{ 'skill-r': skill === 'R' }">
              <span class="skill-num">{{ i + 1 }}</span>{{ skill }}
            </span>
          </div>
        </el-card>

        <el-card class="section-card augments-section" shadow="never">
          <template #header>
            <div class="section-header-row">
              <span class="section-title">海克斯强化推荐</span>
              <span class="section-count">{{ build.augments.length }} 个推荐</span>
            </div>
          </template>
          <div class="augments-table">
            <div class="augments-table-header">
              <span class="ath-priority">优先级</span>
              <span class="ath-tier">稀有度</span>
              <span class="ath-name">海克斯名称</span>
              <span class="ath-effect">效果</span>
              <span class="ath-winrate">胜率</span>
              <span class="ath-reason">推荐理由</span>
            </div>
            <div v-for="aug in build.augments" :key="aug.name" class="augment-table-row" :class="'priority-' + aug.priority">
              <span class="atd-priority">
                <span class="priority-badge" :class="'badge-' + aug.priority">{{ aug.priority }}</span>
              </span>
              <span class="atd-tier">
                <span class="tier-label" :class="'tl-' + tierClass(aug.tier)">{{ aug.tier }}</span>
              </span>
              <span class="atd-name">
                <img v-if="getAugmentImage(aug.name)" :src="getAugmentImage(aug.name)" class="augment-thumb" loading="lazy" @error="e => e.target.style.display = 'none'" />
                <span class="augment-text-name">{{ aug.name }}</span>
              </span>
              <span class="atd-effect">
                <el-tooltip v-if="getAugmentEffect(aug.name)" :content="getAugmentEffect(aug.name)" placement="top" effect="dark" :show-after="300">
                  <span class="effect-text">{{ truncateEffect(getAugmentEffect(aug.name), 30) }}</span>
                </el-tooltip>
                <span v-else class="no-data">-</span>
              </span>
              <span class="atd-winrate">
                <span v-if="getAugmentWinRate(aug.name)" class="winrate-badge" :class="winRateClass(getAugmentWinRate(aug.name))">
                  {{ getAugmentWinRate(aug.name) }}
                </span>
                <span v-else class="no-data">-</span>
              </span>
              <span class="atd-reason">{{ aug.reason }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="section-card" shadow="never">
          <template #header><span class="section-title">玩法思路</span></template>
          <p class="playstyle-text">{{ build.playstyle }}</p>
        </el-card>

        <el-card class="section-card" shadow="never">
          <template #header><span class="section-title">小贴士</span></template>
          <ul class="tips-list">
            <li v-for="tip in build.tips" :key="tip">{{ tip }}</li>
          </ul>
        </el-card>
      </div>

      <MatchupSection v-if="champion.matchup" :matchup="champion.matchup" :builds="champion.builds" />
      <GeneralTips v-if="champion.generalTips && champion.generalTips.length" :tips="champion.generalTips" />
    </div>

    <div v-else-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>

    <div v-else class="not-found">
      <el-empty description="英雄数据未找到">
        <router-link to="/"><el-button type="primary">返回首页</el-button></router-link>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Box } from '@element-plus/icons-vue'
import championsIndex from '@/data/champions-index.json'
import championStats from '@/data/champion-stats.json'
import allAugments from '@/data/all-augments-aramkit.json'
import augmentStats from '@/data/augment-stats.json'
import itemImages from '@/data/item-images.json'
import summonerSpellImages from '@/data/summoner-spell-images.json'
import WhenToPick from '@/components/WhenToPick.vue'
import MatchupSection from '@/components/MatchupSection.vue'
import GeneralTips from '@/components/GeneralTips.vue'
import { TIER_MAP } from '@/config.js'

const augmentLookup = {}
allAugments.forEach(a => { augmentLookup[a.name] = a.imageUrl })

const augmentEffectLookup = {}
allAugments.forEach(a => { augmentEffectLookup[a.name] = a.effect })

const augmentWinRateLookup = {}
augmentStats.forEach(a => { augmentWinRateLookup[a.name] = a.winRate })

function getAugmentImage(name) { return augmentLookup[name] || '' }
function getAugmentEffect(name) { return augmentEffectLookup[name] || '' }
function getAugmentWinRate(name) { return augmentWinRateLookup[name] || '' }
function getItemImage(name) { return itemImages[name] || '' }
function getSpellImage(name) { return summonerSpellImages[name] || '' }
function truncateEffect(text, max = 50) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}
function tierClass(tier) { return TIER_MAP[tier] || tier }

const route = useRoute()
const champion = ref(null)
const loading = ref(true)
const avatarFailed = ref(false)

const championImageUrl = computed(() => {
  if (!champion.value) return ''
  const info = championsIndex.find(c => c.id === champion.value.id)
  return info?.imageUrl || ''
})

const championStat = computed(() => {
  if (!champion.value) return null
  return championStats.find(s => s.id === champion.value.id) || null
})

const aramBalance = computed(() => {
  return champion.value?.aramBalance || null
})

function balanceClass(value, inverse = false) {
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  if (inverse) {
    return num > 100 ? 'balance-nerf' : (num < 100 ? 'balance-buff' : '')
  }
  return num > 100 ? 'balance-buff' : (num < 100 ? 'balance-nerf' : '')
}

function formatBalance(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return (num >= 100 ? '+' : '') + (num - 100).toFixed(0) + '%'
}

function winRateClass(rate) {
  const val = parseFloat(rate)
  if (val >= 55) return 'wr-high'
  if (val >= 50) return 'wr-good'
  if (val >= 45) return 'wr-mid'
  return 'wr-low'
}

function buildTypeLabel(type) {
  const labels = {
    ad: 'AD物理', ap: 'AP法术', tank: '坦克', bruiser: '半肉', support: '辅助',
    assassin: '刺客', hybrid: '混伤', attackSpeed: '攻速', poke: 'Poke', onhit: '特效流'
  }
  return labels[type] || type
}

function formatPickCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

async function loadChampion(id) {
  loading.value = true
  champion.value = null
  avatarFailed.value = false
  try {
    const data = await import(`@/data/champions/${id}.json`)
    champion.value = data.default || data
  } catch {
    champion.value = null
  }
  loading.value = false
}

watch(() => route.params.id, (id) => loadChampion(id), { immediate: true })
</script>

<style scoped>
.detail-page {
  max-width: 880px;
  margin: 0 auto;
}

.detail-header { margin-bottom: 32px; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.back-link:hover { color: var(--accent); }

.header-main {
  display: flex;
  align-items: center;
  gap: 18px;
}

.champion-avatar {
  width: 72px;
  height: 72px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1a3050, #3050a0);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.champion-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder {
  font-size: 30px;
  font-weight: 700;
  color: #66b1ff;
}

.champion-name { font-size: 30px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.champion-title-text { font-size: 15px; color: var(--text-muted); margin-bottom: 8px; }

.header-stats { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }

.stat-badge { padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; }
.stat-tier { color: #e6b422; background: rgba(230, 180, 34, 0.15); }
.stat-tier.tier-t0 { color: #e6b422; background: rgba(230, 180, 34, 0.15); }
.stat-tier.tier-t1 { color: #e040fb; background: rgba(224, 64, 251, 0.15); }
.stat-tier.tier-t2 { color: #66b1ff; background: rgba(64, 158, 255, 0.15); }
.stat-tier.tier-t3 { color: #b0acc5; background: rgba(176, 172, 197, 0.1); }
.stat-tier.tier-t4 { color: #7a7599; background: rgba(122, 117, 153, 0.1); }
.stat-winrate { color: #67c23a; background: rgba(103, 194, 58, 0.1); }
.stat-pick { color: var(--text-muted); background: rgba(176, 172, 197, 0.08); }
.champion-tags { display: flex; gap: 6px; }

/* Balance card */
.balance-card { border-color: rgba(230, 162, 60, 0.2); }
.balance-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.balance-item {
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px 14px; background: var(--bg-secondary); border-radius: 8px;
}
.balance-label { font-size: 12px; color: var(--text-muted); }
.balance-value { font-size: 18px; font-weight: 700; }
.balance-buff { color: #67c23a; }
.balance-nerf { color: #f56c6c; }
.balance-note { margin-top: 12px; font-size: 12px; color: var(--text-muted); }

/* Strength section */
.strength-section { display: flex; flex-direction: column; gap: 12px; }
.strength-block { padding: 0; }
.strength-subtitle { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
.strength-subtitle.strong { color: #67c23a; }
.strength-subtitle.weak { color: #f56c6c; }
.strength-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.strength-list li { font-size: 14px; color: var(--text-secondary); line-height: 1.7; padding-left: 14px; position: relative; }
.strength-list li::before { content: '·'; position: absolute; left: 2px; color: var(--accent); font-weight: 700; }
.strength-summary { font-size: 14px; color: var(--text-secondary); line-height: 1.8; padding: 10px 14px; background: var(--bg-secondary); border-radius: 8px; }

/* Runes */
.runes-card { border-color: rgba(184, 120, 208, 0.2); }
.runes-grid { display: flex; flex-direction: column; gap: 12px; }
.rune-block { background: var(--bg-secondary); border-radius: 8px; padding: 14px 16px; }
.rune-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.rune-name { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.rune-style { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(184, 120, 208, 0.15); color: #c898e0; }
.rune-paths { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.rune-path { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.rune-path-label { color: var(--text-muted); min-width: 36px; }
.rune-path-value { color: var(--text-primary); font-weight: 500; }
.rune-reason { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
.rune-tip { margin-top: 12px; font-size: 12px; color: var(--text-muted); font-style: italic; }

/* Build */
.build-block { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.build-header { display: flex; align-items: center; gap: 12px; }
.build-name { font-size: 20px; font-weight: 600; color: var(--text-primary); }
.build-type-badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.build-type-badge.type-ad, .build-type-badge.type-assassin { background: rgba(245, 108, 108, 0.15); color: #f89898; }
.build-type-badge.type-ap, .build-type-badge.type-poke { background: rgba(184, 120, 208, 0.15); color: #c898e0; }
.build-type-badge.type-tank { background: rgba(103, 194, 58, 0.12); color: #85ce61; }
.build-type-badge.type-bruiser { background: rgba(230, 162, 60, 0.15); color: #e6a23c; }
.build-type-badge.type-support { background: rgba(64, 158, 255, 0.15); color: #66b1ff; }
.build-type-badge.type-hybrid { background: rgba(64, 158, 255, 0.12); color: #79bbff; }
.build-type-badge.type-attackSpeed, .build-type-badge.type-onhit { background: rgba(230, 180, 34, 0.12); color: #e6c352; }

.section-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.section-header-row { display: flex; justify-content: space-between; align-items: center; }
.section-count { font-size: 12px; color: var(--text-muted); }

.items-display { display: flex; flex-direction: column; gap: 8px; }
.core-items, .full-items { display: flex; gap: 8px; flex-wrap: wrap; }
.item-icon-wrap { width: 28px; height: 28px; border-radius: 4px; flex-shrink: 0; background: var(--bg-primary); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.item-icon { width: 100%; height: 100%; object-fit: cover; }
.item-icon-placeholder { color: var(--text-muted); font-size: 14px; }
.core-item, .full-item { display: flex; align-items: center; gap: 6px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 14px; font-size: 14px; color: var(--text-primary); }
.item-num { font-size: 11px; color: var(--text-muted); background: var(--bg-primary); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.item-notes { margin-top: 12px; padding: 10px 14px; background: rgba(230, 162, 60, 0.06); border-radius: 8px; border-left: 3px solid #e6a23c; display: flex; flex-direction: column; gap: 6px; }
.item-note { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin: 0; }

.skill-order { display: flex; gap: 3px; flex-wrap: wrap; }
.skill-chip { font-size: 12px; padding: 5px 8px; border-radius: 4px; background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-color); }
.skill-chip.skill-r { background: rgba(64, 158, 255, 0.15); border-color: rgba(64, 158, 255, 0.3); color: #66b1ff; }
.skill-num { font-size: 10px; color: var(--text-muted); margin-right: 3px; }

/* Augments */
.augments-section { border-color: rgba(64, 158, 255, 0.2); }
.augments-table { display: flex; flex-direction: column; gap: 6px; }
.augments-table-header { display: flex; gap: 8px; padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); }
.ath-priority { width: 54px; flex-shrink: 0; }
.ath-tier { width: 50px; flex-shrink: 0; text-align: center; }
.ath-name { flex: 1; min-width: 100px; }
.ath-effect { width: 130px; flex-shrink: 0; }
.ath-winrate { width: 54px; flex-shrink: 0; text-align: right; }
.ath-reason { flex: 1.5; min-width: 140px; }

.augment-table-row { display: flex; gap: 8px; align-items: center; padding: 10px 12px; border-radius: 6px; background: var(--bg-secondary); border-left: 3px solid var(--border-color); transition: background 0.15s; }
.augment-table-row:hover { background: var(--bg-card-hover); }
.augment-table-row.priority-核心 { border-left-color: #f56c6c; }
.augment-table-row.priority-优先 { border-left-color: var(--accent); }
.augment-table-row.priority-可选 { border-left-color: var(--text-muted); }
.augment-table-row.priority-核心必拿 { border-left-color: #f56c6c; background: rgba(245, 108, 108, 0.06); }
.augment-table-row.priority-情境可选 { border-left-color: var(--accent); background: rgba(64, 158, 255, 0.04); }
.augment-table-row.priority-慎选避开 { border-left-color: #e6a23c; background: rgba(230, 162, 60, 0.05); }

.atd-priority { width: 54px; flex-shrink: 0; }
.atd-tier { width: 50px; flex-shrink: 0; text-align: center; }
.atd-name { flex: 1; min-width: 100px; display: flex; align-items: center; gap: 6px; }
.atd-effect { width: 130px; flex-shrink: 0; }
.atd-winrate { width: 54px; flex-shrink: 0; text-align: right; }
.atd-reason { flex: 1.5; min-width: 140px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

.effect-text {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  cursor: default;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.priority-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 3px; white-space: nowrap; }
.badge-核心 { background: rgba(245, 108, 108, 0.2); color: #f89898; }
.badge-优先 { background: rgba(64, 158, 255, 0.2); color: #66b1ff; }
.badge-可选 { background: rgba(176, 172, 197, 0.15); color: var(--text-muted); }
.badge-核心必拿 { background: rgba(245, 108, 108, 0.22); color: #f56c6c; }
.badge-情境可选 { background: rgba(64, 158, 255, 0.2); color: #66b1ff; }
.badge-慎选避开 { background: rgba(230, 162, 60, 0.18); color: #e6a23c; }

.tier-label { font-size: 11px; padding: 2px 8px; border-radius: 3px; font-weight: 600; white-space: nowrap; }
.tl-prismatic { background: rgba(184, 120, 208, 0.2); color: #c898e0; }
.tl-gold { background: rgba(200, 164, 78, 0.2); color: #d4b86a; }
.tl-silver { background: rgba(160, 176, 192, 0.2); color: #b0c0d0; }

.augment-thumb { width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0; }
.augment-text-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.winrate-badge { font-size: 13px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
.wr-high { color: #67c23a; background: rgba(103, 194, 58, 0.1); }
.wr-good { color: #409eff; background: rgba(64, 158, 255, 0.1); }
.wr-mid { color: #e6a23c; background: rgba(230, 162, 60, 0.1); }
.wr-low { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }
.no-data { font-size: 13px; color: var(--text-muted); }

.playstyle-text { font-size: 15px; color: var(--text-primary); line-height: 1.9; }

.tips-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.tips-list li { font-size: 14px; color: var(--text-secondary); line-height: 1.7; padding-left: 20px; position: relative; }
.tips-list li::before { content: ''; position: absolute; left: 4px; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

.loading-state, .not-found { text-align: center; padding: 80px 0; color: var(--text-muted); }

/* Summoner Spells */
.summoner-card { margin-bottom: 16px; }
.summoner-content { display: flex; flex-direction: column; gap: 12px; }
.summoner-main { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid var(--accent); }
.summoner-label { font-size: 13px; font-weight: 600; color: var(--accent); min-width: 48px; }
.spell-icon { width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0; }
.summoner-value { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.summoner-value.primary { color: #f56c6c; }
.summoner-value.secondary { color: #66b1ff; }
.summoner-notes { font-size: 13px; color: var(--text-muted); line-height: 1.7; margin: 0; padding: 8px 14px; background: var(--bg-secondary); border-radius: 8px; }

@media (max-width: 640px) {
  .augments-table-header { display: none; }
  .augment-table-row { flex-wrap: wrap; }
  .atd-reason { min-width: 100%; flex-basis: 100%; margin-top: 4px; padding-left: 0; }
  .header-main { flex-direction: column; align-items: flex-start; }
  .balance-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
