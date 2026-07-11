<template>
  <div class="champions-page">
    <div class="page-header">
      <h1 class="page-title">英雄排行</h1>
      <p class="page-desc">
        海克斯大乱斗 v16.13 · 全分段 · 数据来源 ARAMKit · 分析局数 5767.9万
      </p>
    </div>

    <div class="stats-bar">
      <div class="stat-card" v-for="s in summaryStats" :key="s.label">
        <span class="stat-value">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </div>

    <div class="controls">
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="搜索英雄名称或称号..."
          :prefix-icon="Search"
          clearable
          size="large"
        />
      </div>
      <div class="filter-row">
        <div class="tier-filters">
          <el-radio-group v-model="filterTier" size="small">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="T0">T0</el-radio-button>
            <el-radio-button value="T1">T1</el-radio-button>
            <el-radio-button value="T2">T2</el-radio-button>
            <el-radio-button value="T3">T3</el-radio-button>
            <el-radio-button value="T4">T4</el-radio-button>
          </el-radio-group>
        </div>
        <div class="tag-filters">
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
    </div>

    <div class="table-container">
      <table class="champion-table">
        <thead>
          <tr>
            <th class="col-rank" @click="toggleSort('rank')">
              # <span v-if="sortKey === 'rank'" class="sort-arrow">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th class="col-name">英雄</th>
            <th class="col-tier">梯度</th>
            <th class="col-winrate sortable" @click="toggleSort('winRate')">
              胜率 <span v-if="sortKey === 'winRate'" class="sort-arrow">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th class="col-pickrate sortable" @click="toggleSort('pickCount')">
              选取数 <span v-if="sortKey === 'pickCount'" class="sort-arrow">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in sortedChampions"
            :key="c.id"
            class="champion-row"
            @click="goToChampion(c.id)"
          >
            <td class="col-rank">
              <span class="rank-num" :class="'rank-' + c.tier.toLowerCase()">{{ c.rank }}</span>
            </td>
            <td class="col-name">
              <div class="champion-cell">
                <div class="champion-avatar">
                  <img
                    :src="getChampionImage(c.id)"
                    :alt="c.name"
                    class="champion-img"
                    loading="lazy"
                    @error="onImgError"
                  />
                </div>
                <div class="champion-info">
                  <span class="champion-name">{{ c.name }}</span>
                  <span class="champion-title">{{ c.title }}</span>
                </div>
              </div>
            </td>
            <td class="col-tier">
              <span class="tier-badge" :class="'tier-' + c.tier.toLowerCase()">{{ c.tier }}</span>
            </td>
            <td class="col-winrate">
              <div class="winrate-cell">
                <span class="winrate-value">{{ c.winRate }}</span>
                <div class="winrate-bar">
                  <div class="winrate-fill" :style="{ width: c.winRate }"></div>
                </div>
              </div>
            </td>
            <td class="col-pickrate">
              <span class="pick-count">{{ formatNumber(c.pickCount) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <el-empty v-if="sortedChampions.length === 0" description="没有匹配的英雄" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import championStats from '@/data/champion-stats.json'
import championsIndex from '@/data/champions-index.json'

const router = useRouter()
const searchText = ref('')
const filterTier = ref('')
const selectedTag = ref('')
const sortKey = ref('rank')
const sortAsc = ref(true)

const allTags = computed(() => {
  const tags = new Set()
  championStats.forEach(c => c.tags.forEach(t => tags.add(t)))
  return [...tags].sort()
})

const summaryStats = computed(() => [
  { label: '英雄总数', value: championStats.length },
  { label: 'T0 英雄', value: championStats.filter(c => c.tier === 'T0').length },
  { label: '最高胜率', value: championStats[0]?.winRate || '-' },
  { label: '总对局', value: '5767.9万' }
])

const filteredChampions = computed(() => {
  let result = championStats
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    )
  }
  if (filterTier.value) {
    result = result.filter(c => c.tier === filterTier.value)
  }
  if (selectedTag.value) {
    result = result.filter(c => c.tags.includes(selectedTag.value))
  }
  return result
})

const sortedChampions = computed(() => {
  const sorted = [...filteredChampions.value]
  sorted.sort((a, b) => {
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
  return sorted
})

function toggleSort(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = false
  }
}

function goToChampion(id) {
  router.push(`/champion/${id}`)
}

function getChampionImage(id) {
  const info = championsIndex.find(c => c.id === id)
  return info?.imageUrl || ''
}

function onImgError(e) {
  e.target.style.display = 'none'
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

.stats-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 20px;
  text-align: center;
  min-width: 90px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
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
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.tier-filters {
  display: flex;
  gap: 0;
}

.tag-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
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

.champion-table {
  width: 100%;
  border-collapse: collapse;
}

.champion-table thead th {
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

.champion-table thead th:first-child {
  border-radius: 10px 0 0 0;
}

.champion-table thead th:last-child {
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

.champion-row {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border-color);
}

.champion-row:hover {
  background: var(--bg-card-hover);
}

.champion-row:last-child {
  border-bottom: none;
}

.champion-row td {
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

.rank-num.rank-t0 {
  color: #e6b422;
}

.rank-num.rank-t1 {
  color: #e040fb;
}

.rank-num.rank-t2 {
  color: var(--accent);
}

.rank-num.rank-t3 {
  color: var(--text-secondary);
}

.rank-num.rank-t4 {
  color: var(--text-muted);
}

.champion-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.champion-avatar {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2a2545, #4a4080);
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

.champion-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.champion-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.champion-title {
  font-size: 12px;
  color: var(--text-muted);
}

.col-tier {
  width: 60px;
  text-align: center;
}

.tier-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.tier-badge.tier-t0 {
  background: rgba(230, 180, 34, 0.2);
  color: #e6b422;
}

.tier-badge.tier-t1 {
  background: rgba(224, 64, 251, 0.2);
  color: #e040fb;
}

.tier-badge.tier-t2 {
  background: rgba(64, 158, 255, 0.2);
  color: #66b1ff;
}

.tier-badge.tier-t3 {
  background: rgba(176, 172, 197, 0.15);
  color: #b0acc5;
}

.tier-badge.tier-t4 {
  background: rgba(122, 117, 153, 0.12);
  color: #7a7599;
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
  background: linear-gradient(90deg, #409eff, #66b1ff);
  transition: width 0.3s ease;
}

.col-pickrate {
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

  .col-pickrate,
  .col-tier {
    display: none;
  }

  .champion-table thead th,
  .champion-row td {
    padding: 10px 8px;
  }

  .stats-bar {
    gap: 6px;
  }

  .stat-card {
    padding: 8px 12px;
    min-width: 70px;
  }
}
</style>
