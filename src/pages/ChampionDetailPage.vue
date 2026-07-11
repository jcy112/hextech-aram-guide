<template>
  <div class="detail-page">
    <div v-if="champion">
      <div class="detail-header">
        <router-link to="/" class="back-link">
          <el-icon><ArrowLeft /></el-icon> 返回英雄列表
        </router-link>
        <div class="header-main">
          <div class="champion-avatar">
            <img :src="championImageUrl" :alt="champion.name" class="champion-img" @error="onImgError" />
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

      <WhenToPick v-if="champion.whenToPick" :whenToPick="champion.whenToPick" />

      <el-card v-if="champion.summonerSpells" class="section-card summoner-card" shadow="never">
        <template #header><span class="section-title">召唤师技能</span></template>
        <div class="summoner-content">
          <div class="summoner-main">
            <span class="summoner-label">主选</span>
            <span class="summoner-value primary">{{ champion.summonerSpells.primary }}</span>
          </div>
          <div class="summoner-main">
            <span class="summoner-label">副选</span>
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
                <img v-if="getItemImage(item)" :src="getItemImage(item)" class="item-icon" />
                <span class="item-num">{{ i + 1 }}</span>{{ item }}
              </div>
            </div>
            <el-divider />
            <div class="full-items">
              <div v-for="(item, i) in build.fullItems" :key="i" class="full-item">
                <img v-if="getItemImage(item)" :src="getItemImage(item)" class="item-icon" />
                <span class="item-num">{{ i + 1 }}</span>{{ item }}
              </div>
            </div>
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
              <span class="ath-winrate">胜率</span>
              <span class="ath-reason">推荐理由</span>
            </div>
            <div v-for="aug in build.augments" :key="aug.name" class="augment-table-row" :class="'priority-' + aug.priority">
              <span class="atd-priority">
                <span class="priority-badge" :class="'badge-' + aug.priority">{{ aug.priority }}</span>
              </span>
              <span class="atd-tier">
                <span class="tier-label" :class="'tl-' + aug.tier">{{ aug.tier }}</span>
              </span>
              <span class="atd-name">
                <img v-if="getAugmentImage(aug.name)" :src="getAugmentImage(aug.name)" class="augment-thumb" />
                <span class="augment-text-name">{{ aug.name }}</span>
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
import { ArrowLeft } from '@element-plus/icons-vue'
import championsIndex from '@/data/champions-index.json'
import championStats from '@/data/champion-stats.json'
import allAugments from '@/data/all-augments-aramkit.json'
import augmentStats from '@/data/augment-stats.json'
import itemImages from '@/data/item-images.json'
import WhenToPick from '@/components/WhenToPick.vue'
import MatchupSection from '@/components/MatchupSection.vue'
import GeneralTips from '@/components/GeneralTips.vue'

const augmentLookup = {}
allAugments.forEach(a => { augmentLookup[a.name] = a.imageUrl })

const augmentWinRateLookup = {}
augmentStats.forEach(a => { augmentWinRateLookup[a.name] = a.winRate })

function getAugmentImage(name) { return augmentLookup[name] || '' }
function getAugmentWinRate(name) { return augmentWinRateLookup[name] || '' }
function getItemImage(name) { return itemImages[name] || '' }

const route = useRoute()
const champion = ref(null)
const loading = ref(true)

const championImageUrl = computed(() => {
  if (!champion.value) return ''
  const info = championsIndex.find(c => c.id === champion.value.id)
  return info?.imageUrl || ''
})

const championStat = computed(() => {
  if (!champion.value) return null
  return championStats.find(s => s.id === champion.value.id) || null
})

function winRateClass(rate) {
  const val = parseFloat(rate)
  if (val >= 55) return 'wr-high'
  if (val >= 50) return 'wr-good'
  if (val >= 45) return 'wr-mid'
  return 'wr-low'
}

function buildTypeLabel(type) {
  const labels = {
    ad: 'AD物理',
    ap: 'AP法术',
    tank: '坦克',
    bruiser: '半肉',
    support: '辅助',
    assassin: '刺客',
    hybrid: '混伤',
    attackSpeed: '攻速',
    poke: 'Poke',
    onhit: '特效流'
  }
  return labels[type] || type
}

function formatPickCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

function onImgError(e) {
  e.target.style.display = 'none'
}

async function loadChampion(id) {
  loading.value = true
  champion.value = null
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

.detail-header {
  margin-bottom: 32px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.back-link:hover {
  color: var(--accent);
}

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

.champion-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.champion-name {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.champion-title-text {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.header-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.stat-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.stat-tier {
  color: #e6b422;
  background: rgba(230, 180, 34, 0.15);
}

.stat-tier.tier-t0 { color: #e6b422; background: rgba(230, 180, 34, 0.15); }
.stat-tier.tier-t1 { color: #e040fb; background: rgba(224, 64, 251, 0.15); }
.stat-tier.tier-t2 { color: #66b1ff; background: rgba(64, 158, 255, 0.15); }
.stat-tier.tier-t3 { color: #b0acc5; background: rgba(176, 172, 197, 0.1); }
.stat-tier.tier-t4 { color: #7a7599; background: rgba(122, 117, 153, 0.1); }

.stat-winrate {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.stat-pick {
  color: var(--text-muted);
  background: rgba(176, 172, 197, 0.08);
}

.champion-tags {
  display: flex;
  gap: 6px;
}

.build-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.build-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.build-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.build-type-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.build-type-badge.type-ad,
.build-type-badge.type-assassin { background: rgba(245, 108, 108, 0.15); color: #f89898; }

.build-type-badge.type-ap,
.build-type-badge.type.poke { background: rgba(184, 120, 208, 0.15); color: #c898e0; }

.build-type-badge.type-tank { background: rgba(103, 194, 58, 0.12); color: #85ce61; }

.build-type-badge.type-bruiser { background: rgba(230, 162, 60, 0.15); color: #e6a23c; }

.build-type-badge.type-support { background: rgba(64, 158, 255, 0.15); color: #66b1ff; }

.build-type-badge.type-hybrid { background: rgba(64, 158, 255, 0.12); color: #79bbff; }

.build-type-badge.type-attackSpeed,
.build-type-badge.type-onhit { background: rgba(230, 180, 34, 0.12); color: #e6c352; }

.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-count {
  font-size: 12px;
  color: var(--text-muted);
}

.items-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.core-items, .full-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.item-icon {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  flex-shrink: 0;
}

.core-item, .full-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 14px;
  color: var(--text-primary);
}

.item-num {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-primary);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skill-order {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.skill-chip {
  font-size: 12px;
  padding: 5px 8px;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.skill-chip.skill-r {
  background: rgba(64, 158, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.3);
  color: #66b1ff;
}

.skill-num {
  font-size: 10px;
  color: var(--text-muted);
  margin-right: 3px;
}

/* Augments table */
.augments-section {
  border-color: rgba(64, 158, 255, 0.2);
}

.augments-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.augments-table-header {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}

.ath-priority { width: 54px; flex-shrink: 0; }
.ath-tier { width: 50px; flex-shrink: 0; text-align: center; }
.ath-name { flex: 1; min-width: 120px; }
.ath-winrate { width: 58px; flex-shrink: 0; text-align: right; }
.ath-reason { flex: 2; min-width: 160px; }

.augment-table-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--bg-secondary);
  border-left: 3px solid var(--border-color);
  transition: background 0.15s;
}

.augment-table-row:hover {
  background: var(--bg-card-hover);
}

.augment-table-row.priority-核心 {
  border-left-color: #f56c6c;
}

.augment-table-row.priority-优先 {
  border-left-color: var(--accent);
}

.augment-table-row.priority-可选 {
  border-left-color: var(--text-muted);
}

.augment-table-row.priority-核心必拿 {
  border-left-color: #f56c6c;
  background: rgba(245, 108, 108, 0.06);
}

.augment-table-row.priority-情境可选 {
  border-left-color: var(--accent);
  background: rgba(64, 158, 255, 0.04);
}

.augment-table-row.priority-慎选避开 {
  border-left-color: #e6a23c;
  background: rgba(230, 162, 60, 0.05);
}

.atd-priority { width: 54px; flex-shrink: 0; }
.atd-tier { width: 50px; flex-shrink: 0; text-align: center; }
.atd-name { flex: 1; min-width: 120px; display: flex; align-items: center; gap: 6px; }
.atd-winrate { width: 58px; flex-shrink: 0; text-align: right; }
.atd-reason { flex: 2; min-width: 160px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

.priority-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
}

.badge-核心 { background: rgba(245, 108, 108, 0.2); color: #f89898; }
.badge-优先 { background: rgba(64, 158, 255, 0.2); color: #66b1ff; }
.badge-可选 { background: rgba(176, 172, 197, 0.15); color: var(--text-muted); }
.badge-核心必拿 { background: rgba(245, 108, 108, 0.22); color: #f56c6c; }
.badge-情境可选 { background: rgba(64, 158, 255, 0.2); color: #66b1ff; }
.badge-慎选避开 { background: rgba(230, 162, 60, 0.18); color: #e6a23c; }

.tier-label {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 600;
  white-space: nowrap;
}

.tl-棱彩 { background: rgba(184, 120, 208, 0.2); color: #c898e0; }
.tl-黄金 { background: rgba(200, 164, 78, 0.2); color: #d4b86a; }
.tl-白银 { background: rgba(160, 176, 192, 0.2); color: #b0c0d0; }

.augment-thumb {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}

.augment-text-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.winrate-badge {
  font-size: 13px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
}

.winrate-badge.wr-high { color: #67c23a; background: rgba(103, 194, 58, 0.1); }
.winrate-badge.wr-good { color: #409eff; background: rgba(64, 158, 255, 0.1); }
.winrate-badge.wr-mid { color: #e6a23c; background: rgba(230, 162, 60, 0.1); }
.winrate-badge.wr-low { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }

.no-data {
  font-size: 13px;
  color: var(--text-muted);
}

.playstyle-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.9;
}

.tips-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tips-list li {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  padding-left: 20px;
  position: relative;
}

.tips-list li::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.loading-state, .not-found {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}

/* Summoner Spells */
.summoner-card {
  margin-bottom: 16px;
}

.summoner-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summoner-main {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 3px solid var(--accent);
}

.summoner-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  min-width: 48px;
}

.summoner-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.summoner-value.primary {
  color: #f56c6c;
}

.summoner-value.secondary {
  color: #66b1ff;
}

.summoner-notes {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0;
  padding: 8px 14px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

@media (max-width: 640px) {
  .augments-table-header {
    display: none;
  }

  .augment-table-row {
    flex-wrap: wrap;
  }

  .atd-reason {
    min-width: 100%;
    flex-basis: 100%;
    margin-top: 4px;
    padding-left: 0;
  }

  .header-main {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
