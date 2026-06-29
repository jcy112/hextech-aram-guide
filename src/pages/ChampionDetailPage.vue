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
            <div class="champion-tags">
              <el-tag v-for="tag in champion.tags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <div v-for="(build, idx) in champion.builds" :key="idx" class="build-block">
        <h2 class="build-name">{{ build.name }}</h2>

        <!-- 核心出装 -->
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

        <!-- 技能加点 -->
        <el-card class="section-card" shadow="never">
          <template #header><span class="section-title">技能加点：{{ build.skillOrder }}</span></template>
          <div class="skill-order">
            <span v-for="(skill, i) in build.skillDetail" :key="i" class="skill-chip" :class="{ 'skill-r': skill === 'R' }">
              <span class="skill-num">{{ i + 1 }}</span>{{ skill }}
            </span>
          </div>
        </el-card>

        <!-- 海克斯强化推荐 -->
        <el-card class="section-card augments-section" shadow="never">
          <template #header><span class="section-title">海克斯强化推荐</span></template>
          <div class="augments-list">
            <div v-for="aug in build.augments" :key="aug.name" class="augment-row" :class="`priority-${aug.priority}`">
              <img v-if="getAugmentImage(aug.name)" :src="getAugmentImage(aug.name)" class="augment-thumb" />
              <span class="augment-priority">{{ aug.priority }}</span>
              <span v-if="aug.tier" class="augment-tier-badge" :class="`tier-${aug.tier}`">{{ aug.tier }}</span>
              <div class="augment-info">
                <span class="augment-name">{{ aug.name }}</span>
                <span class="augment-reason">{{ aug.reason }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 玩法思路 -->
        <el-card class="section-card" shadow="never">
          <template #header><span class="section-title">玩法思路</span></template>
          <p class="playstyle-text">{{ build.playstyle }}</p>
        </el-card>

        <!-- 小贴士 -->
        <el-card class="section-card" shadow="never">
          <template #header><span class="section-title">小贴士</span></template>
          <ul class="tips-list">
            <li v-for="tip in build.tips" :key="tip">{{ tip }}</li>
          </ul>
        </el-card>
      </div>
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
import allAugments from '@/data/all-augments-aramkit.json'
import itemImages from '@/data/item-images.json'

const augmentLookup = {}
allAugments.forEach(a => { augmentLookup[a.name] = a.imageUrl })

function getAugmentImage(name) { return augmentLookup[name] || '' }
function getItemImage(name) { return itemImages[name] || '' }

const route = useRoute()
const champion = ref(null)
const loading = ref(true)

const championImageUrl = computed(() => {
  if (!champion.value) return ''
  const info = championsIndex.find(c => c.id === champion.value.id)
  return info?.imageUrl || ''
})

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
  max-width: 800px;
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
  width: 68px;
  height: 68px;
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

.avatar-text {
  font-size: 30px;
  font-weight: 700;
  color: #66b1ff;
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
  margin-bottom: 6px;
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

.build-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

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

.augments-section {
  border-color: rgba(64, 158, 255, 0.2);
}

.augments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.augment-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  flex-shrink: 0;
  align-self: center;
}

.augment-row {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  align-items: flex-start;
  border-radius: 8px;
  background: var(--bg-secondary);
  border-left: 3px solid var(--border-color);
}

.augment-row.priority-核心 {
  border-left-color: #f56c6c;
  background: rgba(245, 108, 108, 0.06);
}

.augment-row.priority-优先 {
  border-left-color: var(--accent);
  background: rgba(64, 158, 255, 0.06);
}

.augment-row.priority-可选 {
  border-left-color: var(--text-muted);
}

.augment-priority {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
  height: fit-content;
}

.priority-核心 .augment-priority {
  background: rgba(245, 108, 108, 0.2);
  color: #f89898;
}

.priority-优先 .augment-priority {
  background: rgba(64, 158, 255, 0.2);
  color: #66b1ff;
}

.priority-可选 .augment-priority {
  background: rgba(176, 172, 197, 0.15);
  color: var(--text-muted);
}

.augment-tier-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 600;
  white-space: nowrap;
  height: fit-content;
  margin-right: 4px;
}

.augment-tier-badge.tier-棱彩 {
  background: rgba(184, 120, 208, 0.2);
  color: #c898e0;
}

.augment-tier-badge.tier-黄金 {
  background: rgba(200, 164, 78, 0.2);
  color: #d4b86a;
}

.augment-tier-badge.tier-白银 {
  background: rgba(160, 176, 192, 0.2);
  color: #b0c0d0;
}

.augment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.augment-info .augment-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.augment-reason {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
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
</style>
