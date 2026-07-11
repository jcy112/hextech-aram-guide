<template>
  <el-card v-if="tips && tips.length" class="section-card" shadow="never">
    <template #header><span class="section-title">通用技巧</span></template>
    <ul class="tips-list"><li v-for="tip in tips" :key="tip"><span class="tip-bulb">&#x2B50;</span>{{ tip }}</li></ul>
  </el-card>
</template>
<script setup>defineProps({ tips: { type: Array, default: () => [] } })</script>
<style scoped>
.section-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.tips-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.tips-list li { font-size: 14px; color: var(--text-secondary); line-height: 1.7; padding-left: 24px; position: relative; }
.tip-bulb { position: absolute; left: 0; top: 1px; font-size: 14px; }
</style>
