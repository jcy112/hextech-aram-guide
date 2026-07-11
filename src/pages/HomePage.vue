<template>
  <div class="home-page">
    <div class="hero-section">
      <h1 class="hero-title">海克斯大乱斗攻略</h1>
      <p class="hero-desc">
        英雄联盟 16.13 版本 · 海克斯大乱斗 3.0 · 数据来源 ARAMKit · 分析局数 5767.9万
      </p>
      <div class="quick-links">
        <router-link to="/champions" class="quick-link">
          <el-icon><Trophy /></el-icon>
          英雄胜率排行
        </router-link>
        <router-link to="/augments-ranking" class="quick-link">
          <el-icon><TrendCharts /></el-icon>
          海克斯胜率排行
        </router-link>
        <router-link to="/augments" class="quick-link">
          <el-icon><Collection /></el-icon>
          全部海克斯
        </router-link>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索英雄..."
          :prefix-icon="Search"
          size="large"
          clearable
          class="search-input"
        />
      </div>
      <div class="filter-tags">
        <el-button
          v-for="tag in allTags"
          :key="tag"
          :type="selectedTag === tag ? 'primary' : 'default'"
          size="small"
          round
          @click="selectedTag = selectedTag === tag ? '' : tag"
        >{{ tag }}</el-button>
      </div>
    </div>

    <div class="overview-section">
      <div class="overview-panel">
        <div class="panel-header">
          <h3 class="panel-title">强势英雄</h3>
          <router-link to="/champions" class="panel-link">完整排行 →</router-link>
        </div>
        <div class="top-list">
          <router-link
            v-for="(c, idx) in topChampions"
            :key="c.id"
            :to="'/champion/' + c.id"
            class="top-item"
          >
            <span class="top-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</span>
            <img v-if="getChampionImage(c.id)" :src="getChampionImage(c.id)" class="top-img" @error="onImgError" />
            <div class="top-info">
              <span class="top-name">{{ c.name }}</span>
              <span class="top-title">{{ c.title }}</span>
            </div>
            <span class="top-tier" :class="'tier-' + c.tier.toLowerCase()">{{ c.tier }}</span>
            <span class="top-winrate">{{ c.winRate }}</span>
          </router-link>
        </div>
      </div>

      <div class="overview-panel">
        <div class="panel-header">
          <h3 class="panel-title">强势海克斯</h3>
          <router-link to="/augments-ranking" class="panel-link">完整排行 →</router-link>
        </div>
        <div class="top-list">
          <div
            v-for="(a, idx) in topAugments"
            :key="a.slug"
            class="top-item"
          >
            <span class="top-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</span>
            <img v-if="a.imageUrl" :src="a.imageUrl" class="top-img" :class="'rarity-' + a.tier" @error="onImgError" />
            <div class="top-info">
              <span class="top-name">{{ a.name }}</span>
              <span class="top-tier-label" :class="'tier-' + a.tier">{{ a.tier }}</span>
            </div>
            <span class="top-winrate">{{ a.winRate }}</span>
          </div>
        </div>
      </div>
    </div>

    <h2 class="section-title">所有英雄</h2>

    <div class="champion-grid">
      <ChampionCard v-for="c in filteredChampions" :key="c.id" :champion="c" />
    </div>

    <el-empty v-if="filteredChampions.length === 0" description="未找到匹配的英雄" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Trophy, TrendCharts, Collection } from '@element-plus/icons-vue'
import ChampionCard from '@/components/ChampionCard.vue'
import championsIndex from '@/data/champions-index.json'
import championStats from '@/data/champion-stats.json'
import augmentStats from '@/data/augment-stats.json'

const searchText = ref('')
const selectedTag = ref('')

const allTags = computed(() => {
  const tags = new Set()
  championsIndex.forEach(c => c.tags.forEach(t => tags.add(t)))
  return [...tags]
})

const topChampions = computed(() => championStats.slice(0, 5))
const topAugments = computed(() => augmentStats.slice(0, 5))

const filteredChampions = computed(() => {
  let result = championsIndex
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter(c => c.name.includes(q) || c.title.includes(q) || c.id.includes(q))
  }
  if (selectedTag.value) {
    result = result.filter(c => c.tags.includes(selectedTag.value))
  }
  return result
})

function getChampionImage(id) {
  const info = championsIndex.find(c => c.id === id)
  return info?.imageUrl || ''
}

function onImgError(e) {
  e.target.style.display = 'none'
}
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 48px 0 32px;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.hero-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.quick-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.2s;
}

.quick-link:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-card-hover);
  transform: translateY(-1px);
}

.search-bar {
  max-width: 480px;
  margin: 0 auto 20px;
}

.filter-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Overview panels */
.overview-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto 40px;
}

.overview-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.panel-link {
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
}

.panel-link:hover {
  color: var(--accent-hover);
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background 0.15s;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

a.top-item:hover {
  background: var(--bg-card-hover);
}

.top-rank {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.top-rank.rank-1 {
  background: rgba(230, 180, 34, 0.25);
  color: #e6b422;
}

.top-rank.rank-2 {
  background: rgba(192, 192, 192, 0.2);
  color: #c0c0c0;
}

.top-rank.rank-3 {
  background: rgba(205, 127, 50, 0.2);
  color: #cd7f32;
}

.top-rank.rank-4, .top-rank.rank-5 {
  background: rgba(176, 172, 197, 0.1);
  color: var(--text-muted);
}

.top-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

.top-img.rarity-棱彩 {
  box-shadow: 0 0 8px rgba(184, 120, 208, 0.35);
}

.top-img.rarity-黄金 {
  box-shadow: 0 0 6px rgba(200, 164, 78, 0.3);
}

.top-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.top-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.top-title {
  font-size: 11px;
  color: var(--text-muted);
}

.top-tier-label {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.top-tier-label.tier-棱彩 {
  background: rgba(184, 120, 208, 0.2);
  color: #c898e0;
}

.top-tier-label.tier-黄金 {
  background: rgba(200, 164, 78, 0.2);
  color: #d4b86a;
}

.top-tier-label.tier-白银 {
  background: rgba(160, 176, 192, 0.2);
  color: #b0c0d0;
}

.top-tier {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  flex-shrink: 0;
}

.top-tier.tier-t0 {
  background: rgba(230, 180, 34, 0.2);
  color: #e6b422;
}

.top-tier.tier-t1 {
  background: rgba(224, 64, 251, 0.2);
  color: #e040fb;
}

.top-tier.tier-t2 {
  background: rgba(64, 158, 255, 0.2);
  color: #66b1ff;
}

.top-tier.tier-t3 {
  background: rgba(176, 172, 197, 0.15);
  color: #b0acc5;
}

.top-tier.tier-t4 {
  background: rgba(122, 117, 153, 0.12);
  color: #7a7599;
}

.top-winrate {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
  width: 58px;
  text-align: right;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 14px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .overview-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .champion-grid {
    grid-template-columns: 1fr;
  }
  .hero-title {
    font-size: 26px;
  }
}
</style>
