<template>
  <div class="home-page">
    <div class="hero-section">
      <h1 class="hero-title">海克斯大乱斗 3.0</h1>
      <p class="hero-desc">
        英雄联盟 26.12 版本 · 羁绊系统已移除 · 全新技能强化符文上线
      </p>
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

    <div class="champion-grid">
      <ChampionCard v-for="c in filteredChampions" :key="c.id" :champion="c" />
    </div>

    <el-empty v-if="filteredChampions.length === 0" description="未找到匹配的英雄" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import ChampionCard from '@/components/ChampionCard.vue'
import championsIndex from '@/data/champions-index.json'

const searchText = ref('')
const selectedTag = ref('')

const allTags = computed(() => {
  const tags = new Set()
  championsIndex.forEach(c => c.tags.forEach(t => tags.add(t)))
  return [...tags]
})

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
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 56px 0 40px;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.hero-desc {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.search-bar {
  max-width: 480px;
  margin: 0 auto 20px;
}

.search-input {
  --el-input-bg-color: var(--bg-card);
  --el-input-border-color: var(--border-color);
}

.filter-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 14px;
  margin-top: 32px;
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
