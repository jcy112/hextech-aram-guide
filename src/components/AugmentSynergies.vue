<template>
  <el-card v-if="augments && augments.length" class="section-card augments-card" shadow="never">
    <template #header><span class="section-title">海克斯强化推荐</span></template>
    <div class="augments-list">
      <div v-for="aug in augments" :key="aug.name" :class="['augment-row', `priority-${aug.priority}`]">
        <img v-if="getAugmentImage(aug.name)" :src="getAugmentImage(aug.name)" class="augment-thumb" @error="onImgError" />
        <span class="augment-priority">{{ aug.priority }}</span>
        <span v-if="aug.tier" :class="['augment-tier-badge', `tier-${aug.tier}`]">{{ aug.tier }}</span>
        <div class="augment-info">
          <div class="augment-name-row"><span class="augment-name">{{ aug.name }}</span><span v-if="aug.synergyLevel" :class="['synergy-badge', `synergy-${aug.synergyLevel}`]">{{ aug.synergyLevel }}</span></div>
          <span class="augment-reason">{{ aug.reason }}</span>
          <span v-if="aug.synergyDetail" class="synergy-detail">{{ aug.synergyDetail }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>
<script setup>
import allAugments from '@/data/all-augments-aramkit.json'
const augmentLookup = {}; allAugments.forEach(a => { augmentLookup[a.name] = a.imageUrl })
defineProps({ augments: { type: Array, default: () => [] } })
function getAugmentImage(n) { return augmentLookup[n] || '' }
function onImgError(e) { e.target.style.display = 'none' }
</script>
<style scoped>
.augments-card { background: var(--bg-card); border: 1px solid rgba(64, 158, 255, 0.15); border-radius: 10px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.augments-list { display: flex; flex-direction: column; gap: 10px; }
.augment-row { display: flex; gap: 10px; padding: 12px 16px; align-items: flex-start; border-radius: 8px; background: var(--bg-secondary); border-left: 3px solid var(--border-color); }
.augment-row.priority-核心 { border-left-color: #f56c6c; background: rgba(245, 108, 108, 0.06); }
.augment-row.priority-优先 { border-left-color: var(--accent); background: rgba(64, 158, 255, 0.05); }
.augment-thumb { width: 36px; height: 36px; border-radius: 6px; flex-shrink: 0; }
.augment-priority { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 3px; white-space: nowrap; height: fit-content; margin-top: 2px; }
.priority-核心 .augment-priority { background: rgba(245, 108, 108, 0.2); color: #f89898; }
.priority-优先 .augment-priority { background: rgba(64, 158, 255, 0.2); color: #66b1ff; }
.priority-可选 .augment-priority { background: rgba(176, 172, 197, 0.15); color: var(--text-muted); }
.augment-tier-badge { font-size: 11px; padding: 2px 8px; border-radius: 3px; font-weight: 600; white-space: nowrap; height: fit-content; margin-top: 2px; }
.tier-棱彩 { background: rgba(184, 120, 208, 0.2); color: #c898e0; }
.tier-黄金 { background: rgba(200, 164, 78, 0.2); color: #d4b86a; }
.tier-白银 { background: rgba(160, 176, 192, 0.2); color: #b0c0d0; }
.augment-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.augment-name-row { display: flex; align-items: center; gap: 8px; }
.augment-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.synergy-badge { font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 4px; letter-spacing: 0.5px; }
.synergy-S { background: rgba(230, 162, 60, 0.2); color: #e6a23c; }
.synergy-A { background: rgba(103, 194, 58, 0.2); color: #85ce61; }
.synergy-B { background: rgba(64, 158, 255, 0.2); color: #66b1ff; }
.synergy-C { background: rgba(176, 172, 197, 0.15); color: var(--text-muted); }
.augment-reason { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
.synergy-detail { font-size: 12px; color: var(--text-muted); line-height: 1.5; padding: 6px 10px; background: rgba(230, 162, 60, 0.05); border-radius: 6px; margin-top: 2px; }
</style>
