<template>
  <el-card v-if="whenToPick" class="section-card" shadow="never">
    <template #header><span class="section-title">适用场景</span></template>
    <div class="wtp-grid">
      <div v-if="whenToPick.teamNeeds" class="wtp-item"><span class="wtp-label">团队需要</span><span class="wtp-text">{{ whenToPick.teamNeeds }}</span></div>
      <div v-if="whenToPick.enemyComposition" class="wtp-item"><span class="wtp-label">敌方阵容</span><span class="wtp-text">{{ whenToPick.enemyComposition }}</span></div>
      <div v-if="whenToPick.synergies" class="wtp-item"><span class="wtp-label">阵容配合</span><span class="wtp-text">{{ whenToPick.synergies }}</span></div>
      <div v-if="whenToPick.avoidWhen" class="wtp-item avoid"><span class="wtp-label avoid-label">慎选场景</span><span class="wtp-text">{{ whenToPick.avoidWhen }}</span></div>
    </div>
  </el-card>
</template>
<script setup>defineProps({ whenToPick: { type: Object, default: null } })</script>
<style scoped>
.section-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.wtp-grid { display: flex; flex-direction: column; gap: 10px; }
.wtp-item { display: flex; gap: 12px; padding: 10px 14px; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid var(--accent); }
.wtp-item.avoid { border-left-color: #f56c6c; background: rgba(245, 108, 108, 0.05); }
.wtp-label { font-size: 13px; font-weight: 600; color: var(--accent); white-space: nowrap; min-width: 64px; }
.avoid-label { color: #f56c6c; }
.wtp-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
</style>
