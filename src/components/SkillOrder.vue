<template>
  <el-card class="section-card" shadow="never">
    <template #header><div class="skill-header"><span class="section-title">技能加点</span><span class="skill-summary">{{ skillOrder }}</span></div></template>
    <div class="skill-grid"><div v-for="(skill, i) in skillDetail" :key="i" :class="['skill-cell', `skill-${skill.toLowerCase()}`]"><span class="skill-level">{{ i + 1 }}</span><span class="skill-letter">{{ skill }}</span></div></div>
  </el-card>
</template>
<script setup>
defineProps({ skillOrder: { type: String, required: true }, skillDetail: { type: Array, required: true } })
</script>
<style scoped>
.section-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 16px; }
.skill-header { display: flex; align-items: baseline; justify-content: space-between; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.skill-summary { font-size: 13px; font-weight: 600; color: var(--accent); }
.skill-grid { display: flex; gap: 4px; flex-wrap: wrap; }
.skill-cell { width: 42px; height: 48px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: var(--bg-secondary); border: 1px solid var(--border-color); }
.skill-level { font-size: 10px; color: var(--text-muted); }
.skill-letter { font-size: 13px; font-weight: 700; color: var(--text-secondary); }
.skill-cell.skill-q { border-bottom: 2px solid #f56c6c; }
.skill-cell.skill-w { border-bottom: 2px solid #85ce61; }
.skill-cell.skill-e { border-bottom: 2px solid #66b1ff; }
.skill-cell.skill-r { border-color: rgba(230, 162, 60, 0.4); background: rgba(230, 162, 60, 0.1); }
.skill-cell.skill-r .skill-letter { color: #e6a23c; }
</style>
