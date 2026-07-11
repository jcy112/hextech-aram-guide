<template>
  <div v-if="builds.length > 1" class="build-selector">
    <button v-for="build in builds" :key="build.id" :class="['build-tab', { active: modelValue === build.id }]" @click="$emit('update:modelValue', build.id)">
      <span :class="['type-badge', `type-${build.type}`]">{{ build.type }}</span>
      <span class="build-name">{{ build.name }}</span>
      <span v-if="build.summary" class="build-summary">{{ build.summary }}</span>
    </button>
  </div>
</template>
<script setup>
defineProps({ builds: { type: Array, required: true }, modelValue: { type: String, required: true } })
defineEmits(['update:modelValue'])
</script>
<style scoped>
.build-selector { display: flex; gap: 4px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px; }
.build-tab { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 12px 18px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-card); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; min-width: 160px; flex-shrink: 0; text-align: left; font-family: inherit; }
.build-tab:hover { border-color: var(--accent); color: var(--text-primary); }
.build-tab.active { border-color: var(--accent); background: var(--accent-light); color: var(--text-primary); }
.type-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; }
.type-badge.type-AD { background: rgba(245, 108, 108, 0.2); color: #f56c6c; }
.type-badge.type-AP { background: rgba(64, 158, 255, 0.2); color: #66b1ff; }
.type-badge.type-Tank { background: rgba(103, 194, 58, 0.2); color: #85ce61; }
.type-badge.type-Assassin { background: rgba(184, 120, 208, 0.2); color: #c898e0; }
.type-badge.type-Special { background: rgba(230, 162, 60, 0.2); color: #e6a23c; }
.type-badge.type-General { background: rgba(176, 172, 197, 0.15); color: var(--text-muted); }
.build-name { font-size: 15px; font-weight: 600; white-space: nowrap; }
.build-summary { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.build-tab.active .build-summary { color: var(--text-secondary); }
</style>
