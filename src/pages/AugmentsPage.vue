<template>
  <div class="augments-page">
    <div class="page-header">
      <h1 class="page-title">海克斯强化</h1>
      <p class="page-desc">
        海克斯大乱斗 3.0 · v16.13版本 · 共211个强化符文 · 数据来源 ARAMKit
      </p>
    </div>

    <div class="filter-bar">
      <span class="filter-label">筛选等级：</span>
      <el-radio-group v-model="filterTier" size="small">
        <el-radio-button value="">全部（211）</el-radio-button>
        <el-radio-button value="棱彩">棱彩（71）</el-radio-button>
        <el-radio-button value="黄金">黄金（80）</el-radio-button>
        <el-radio-button value="白银">白银（60）</el-radio-button>
      </el-radio-group>
    </div>

    <div class="augments-grid">
      <AugmentCard v-for="aug in filteredAugments" :key="aug.id" :augment="aug" />
    </div>

    <el-empty v-if="filteredAugments.length === 0" description="没有匹配的强化符文" />

    <div class="footnote">
      注：以上为海克斯大乱斗3.0目前确认的部分强化符文。完整列表将在后续更新中补充。
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AugmentCard from '@/components/AugmentCard.vue'
import allAugments from '@/data/all-augments-aramkit.json'

const filterTier = ref('')

const filteredAugments = computed(() => {
  let result = allAugments
  if (filterTier.value) {
    result = result.filter(a => a.tier === filterTier.value)
  }
  return result
})
</script>

<style scoped>
.page-header {
  text-align: center;
  padding: 48px 0 32px;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.page-desc {
  font-size: 14px;
  color: var(--text-muted);
}

.filter-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.augments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

@media (max-width: 640px) {
  .augments-grid {
    grid-template-columns: 1fr;
  }
}

.footnote {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 32px;
}
</style>
