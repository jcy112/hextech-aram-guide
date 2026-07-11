<template>
  <el-card class="section-card" shadow="never">
    <template #header><span class="section-title">出装方案</span></template>
    <div class="items-section"><h4 class="items-label">核心出装</h4>
      <div class="items-row"><div v-for="(item, i) in coreItems" :key="i" class="item-chip"><img v-if="getItemImage(item)" :src="getItemImage(item)" class="item-icon" @error="onImgError" /><span class="item-name">{{ item }}</span></div></div>
    </div>
    <el-divider />
    <div class="items-section"><h4 class="items-label">六神装</h4>
      <div class="items-row"><div v-for="(item, i) in fullItems" :key="i" class="item-chip"><img v-if="getItemImage(item)" :src="getItemImage(item)" class="item-icon" @error="onImgError" /><span class="item-name">{{ item }}</span></div></div>
    </div>
  </el-card>
</template>
<script setup>
import itemImages from '@/data/item-images.json'
defineProps({ coreItems: { type: Array, required: true }, fullItems: { type: Array, required: true } })
function getItemImage(name) { return itemImages[name] || '' }
function onImgError(e) { e.target.style.display = 'none' }
</script>
<style scoped>
.section-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.items-section { margin-bottom: 4px; }
.items-label { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
.items-row { display: flex; gap: 8px; flex-wrap: wrap; }
.item-chip { display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 14px; font-size: 14px; color: var(--text-primary); }
.item-icon { width: 28px; height: 28px; border-radius: 4px; flex-shrink: 0; }
.item-name { white-space: nowrap; }
</style>
