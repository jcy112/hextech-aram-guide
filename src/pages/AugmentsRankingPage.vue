<template>
  <div class="augments-page">
    <div class="page-header">
      <h1 class="page-title">海克斯排行</h1>
      <p class="page-desc">
        海克斯大乱斗 v16.13 · 全分段 · 数据来源 ARAMKit · 共 {{ augmentStats.length }} 个强化符文
      </p>
    </div>

    <div class="controls">
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="搜索海克斯名称..."
          :prefix-icon="Search"
          clearable
          size="large"
        />
      </div>
      <div class="filter-row">
        <div class="tier-filters">
          <el-radio-group v-model="filterTier" size="small">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="棱彩">棱彩</el-radio-button>
            <el-radio-button value="黄金">黄金</el-radio-button>
            <el-radio-button value="白银">白银</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="augment-table">
        <thead>
          <tr>
            <th class="col-rank sortable" @click="toggleSort('rank')">
              # <span v-if="sortKey === 'rank'" class="sort-arrow">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th class="col-name">海克斯</th>
            <th class="col-tier">稀有度</th>
            <th class="col-winrate sortable" @click="toggleSort('winRate')">
              胜率 <span v-if="sortKey === 'winRate'" class="sort-arrow">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th class="col-pick sortable" @click="toggleSort('pickCount')">
              选取数 <span v-if="sortKey === 'pickCount'" class="sort-arrow">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in filteredAugments"
            :key="a.slug"
            class="augment-row"
          >
            <td class="col-rank">
              <span class="rank-num">{{ a.rank }}</span>
            </td>
            <td class="col-name">
              <div class="augment-cell">
                <img
                  v-if="a.imageUrl"
                  :src="a.imageUrl"
                  :alt="a.name"
                  class="augment-img"
                  :class="'rarity-' + a.tier"
                  loading="lazy"
                  @error="onImgError"
                />
                <div class="augment-info">
                  <span class="augment-name">{{ a.name }}</span>
                  <span class="augment-effect" v-if="a.effect">{{ truncateEffect(a.effect) }}</span>
                </div>
              </div>
            </td>
            <td class="col-tier">
              <span class="tier-badge" :class="'tier-' + a.tier">{{ a.tier }}</span>
            </td>
            <td class="col-winrate">
              <div class="winrate-cell">
                <span class="winrate-value">{{ a.winRate }}</span>
                <div class="winrate-bar">
                  <div class="winrate-fill" :class="'bar-' + a.tier" :style="{ width: a.winRate }"></div>
                </div>
              </div>
            </td>
            <td class="col-pick">
              <span class="pick-count">{{ formatNumber(a.pickCount) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <el-empty v-if="filteredAugments.length === 0" description="没有匹配的海克斯强化" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import augmentStats from '@/data/augment-stats.json'

const searchText = ref('')
const filterTier = ref('')
const sortKey = ref('rank')
const sortAsc = ref(true)

const filteredAugments = computed(() => {
  let result = [...augmentStats]
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.effect && a.effect.toLowerCase().includes(q))
    )
  }
  if (filterTier.value) {
    result = result.filter(a => a.tier === filterTier.value)
  }
  result.sort((a, b) => {
    let cmp = 0
    if (sortKey.value === 'rank') {
      cmp = a.rank - b.rank
    } else if (sortKey.value === 'winRate') {
      cmp = parseFloat(a.winRate) - parseFloat(b.winRate)
    } else if (sortKey.value === 'pickCount') {
      cmp = a.pickCount - b.pickCount
    }
    return sortAsc.value ? cmp : -cmp
  })
  return result
})

function toggleSort(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = false
  }
}

function onImgError(e) {
  e.target.style.display = 'none'
}

function truncateEffect(text) {
  return text.length > 60 ? text.slice(0, 60) + '...' : text
}

function formatNumber(n) {
  if (n >= 10000) {
    return (n / 10000).toFixed(1) + '万'
  }
  return n.toLocaleString()
}
</script>

<style scoped>
.page-header {
  text-align: center;
  padding: 40px 0 16px;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.page-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.controls {
  max-width: 1100px;
  margin: 0 auto 20px;
}

.search-box {
  max-width: 480px;
  margin: 0 auto 16px;
}

.filter-row {
  display: flex;
  justify-content: center;
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  overflow-x: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.augment-table {
  width: 100%;
  border-collapse: collapse;
}

.augment-table thead th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  white-space: nowrap;
  user-select: none;
}

.augment-table thead th:first-child {
  border-radius: 10px 0 0 0;
}

.augment-table thead th:last-child {
  border-radius: 0 10px 0 0;
}

.sortable {
  cursor: pointer;
}

.sortable:hover {
  color: var(--accent);
}

.sort-arrow {
  font-size: 10px;
  margin-left: 2px;
}

.augment-row {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}

.augment-row:hover {
  background: var(--bg-card-hover);
}

.augment-row:last-child {
  border-bottom: none;
}

.augment-row td {
  padding: 12px 16px;
  vertical-align: middle;
}

.col-rank {
  width: 50px;
  text-align: center;
}

.rank-num {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
}

.augment-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.augment-img {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  flex-shrink: 0;
}

.augment-img.rarity-棱彩 {
  box-shadow: 0 0 10px rgba(184, 120, 208, 0.4);
}

.augment-img.rarity-黄金 {
  box-shadow: 0 0 8px rgba(200, 164, 78, 0.3);
}

.augment-img.rarity-白银 {
  box-shadow: 0 0 6px rgba(160, 176, 192, 0.3);
}

.augment-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.augment-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.augment-effect {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 2px;
}

.col-tier {
  width: 70px;
  text-align: center;
}

.tier-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.tier-badge.tier-棱彩 {
  background: rgba(184, 120, 208, 0.2);
  color: #c898e0;
}

.tier-badge.tier-黄金 {
  background: rgba(200, 164, 78, 0.2);
  color: #d4b86a;
}

.tier-badge.tier-白银 {
  background: rgba(160, 176, 192, 0.2);
  color: #b0c0d0;
}

.col-winrate {
  width: 180px;
}

.winrate-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.winrate-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  width: 60px;
  text-align: right;
  flex-shrink: 0;
}

.winrate-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.winrate-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.winrate-fill.bar-棱彩 {
  background: linear-gradient(90deg, #b878d0, #d0a0e8);
}

.winrate-fill.bar-黄金 {
  background: linear-gradient(90deg, #c8a44e, #e0c870);
}

.winrate-fill.bar-白银 {
  background: linear-gradient(90deg, #a0b0c0, #c0d0e0);
}

.col-pick {
  width: 90px;
  text-align: right;
}

.pick-count {
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .page-title {
    font-size: 24px;
  }

  .col-pick,
  .col-tier {
    display: none;
  }

  .augment-table thead th,
  .augment-row td {
    padding: 10px 8px;
  }

  .augment-effect {
    display: none;
  }
}
</style>
