<template>
  <router-link :to="`/champion/${champion.id}`" class="champion-card">
    <div class="card-avatar">
      <img v-if="champion.imageUrl" :src="champion.imageUrl" :alt="champion.name" class="champion-img" @error="onImgError" />
      <span v-else class="avatar-text">{{ champion.name[0] }}</span>
    </div>
    <div class="card-info">
      <h3 class="card-name">{{ champion.name }}</h3>
      <p class="card-title">{{ champion.title }}</p>
      <div class="card-tags">
        <el-tag v-for="tag in champion.tags" :key="tag" size="small" class="tag">{{ tag }}</el-tag>
      </div>
    </div>
    <el-icon class="card-arrow" :size="18"><ArrowRight /></el-icon>
  </router-link>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
defineProps({ champion: { type: Object, required: true } })
const imgFailed = ref(false)
function onImgError(e) {
  e.target.style.display = 'none'
}
</script>

<style scoped>
.champion-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.champion-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent);
  transform: translateY(-2px);
}

.card-avatar {
  width: 52px;
  height: 52px;
  border-radius: 10px;
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

.avatar-text {
  font-size: 22px;
  font-weight: 700;
  color: #66b1ff;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.card-title {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  --el-tag-bg-color: rgba(64, 158, 255, 0.1);
  --el-tag-border-color: transparent;
  --el-tag-text-color: #80b8ff;
}

.card-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>
