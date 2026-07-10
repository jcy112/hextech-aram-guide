<template>
  <div v-if="matchup" class="matchup-section">
    <h2 class="matchup-title">对局思路</h2>
    <p class="matchup-desc">针对不同敌方阵容的打法调整与出装推荐</p>
    <div class="matchup-grid">
      <el-card v-for="mt in matchupEntries" :key="mt.key" :class="['matchup-card', mt.key]" shadow="never" @click="mt.buildId && $emit('selectBuild', mt.buildId)" :body-style="{ cursor: mt.buildId ? 'pointer' : 'default' }">
        <template #header><div class="matchup-header"><span class="matchup-icon">{{ mt.icon }}</span><span class="matchup-arch">{{ mt.label }}</span></div></template>
        <p class="matchup-strategy">{{ mt.data.strategy }}</p>
        <div v-if="mt.data.items && mt.data.items.length" class="matchup-items"><el-tag v-for="item in mt.data.items" :key="item" size="small" type="info">{{ item }}</el-tag></div>
        <div v-if="mt.data.augments && mt.data.augments.length" class="matchup-augments"><el-tag v-for="aug in mt.data.augments" :key="aug" size="small" effect="plain">{{ aug }}</el-tag></div>
        <div v-if="mt.buildName" class="build-hint">推荐出装：<strong>{{ mt.buildName }}</strong></div>
        <p v-if="mt.data.tips" class="matchup-tips">{{ mt.data.tips }}</p>
      </el-card>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ matchup: { type: Object, default: null }, builds: { type: Array, default: () => [] } })
defineEmits(['selectBuild'])
const config = [{ key:'againstTank', label:'对阵坦克', icon:'🛡️' },{ key:'againstPoke', label:'对阵消耗', icon:'🏹' },{ key:'againstAssassin', label:'对阵刺客', icon:'🗡️' },{ key:'againstHeal', label:'对阵回复', icon:'💚' }]
const matchupEntries = computed(() => {
  if (!props.matchup) return []
  const bm = {}; props.builds.forEach(b => { bm[b.id] = b.name })
  return config.filter(c => props.matchup[c.key]).map(c => ({ ...c, data: props.matchup[c.key], buildId: props.matchup[c.key].buildRecommendation || '', buildName: bm[props.matchup[c.key].buildRecommendation] || '' }))
})
</script>
<style scoped>
.matchup-section { margin: 32px 0 16px; }
.matchup-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.matchup-desc { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; }
.matchup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 640px) { .matchup-grid { grid-template-columns: 1fr; } }
.matchup-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; transition: all 0.2s; }
.matchup-card:hover { transform: translateY(-2px); }
.matchup-card.againstTank:hover { border-color: #85ce61; }
.matchup-card.againstPoke:hover { border-color: #66b1ff; }
.matchup-card.againstAssassin:hover { border-color: #c898e0; }
.matchup-card.againstHeal:hover { border-color: #85ce61; }
.matchup-header { display: flex; align-items: center; gap: 8px; }
.matchup-icon { font-size: 18px; }
.matchup-arch { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.matchup-strategy { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 10px; }
.matchup-items { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.matchup-augments { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.build-hint { font-size: 12px; color: var(--accent); margin-bottom: 6px; }
.matchup-tips { font-size: 12px; color: var(--text-muted); line-height: 1.5; padding-top: 8px; border-top: 1px solid var(--border-color); }
</style>
