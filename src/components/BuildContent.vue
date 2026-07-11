<template>
  <div class="build-content">
    <WhenToPick :whenToPick="build.whenToPick" />
    <ItemBuild :coreItems="build.coreItems" :fullItems="build.fullItems" />
    <SkillOrder :skillOrder="build.skillOrder" :skillDetail="build.skillDetail" />
    <AugmentSynergies :augments="build.augments" />
    <el-card v-if="build.playstyle" class="section-card" shadow="never"><template #header><span class="section-title">玩法思路</span></template><p class="playstyle-text">{{ build.playstyle }}</p></el-card>
    <el-card v-if="build.strengths && build.strengths.length" class="section-card" shadow="never">
      <template #header><span class="section-title">优势与劣势</span></template>
      <div class="sw-grid"><div class="sw-col"><span class="sw-label positive">优势</span><ul class="sw-list"><li v-for="s in build.strengths" :key="s">{{ s }}</li></ul></div><div v-if="build.weaknesses && build.weaknesses.length" class="sw-col"><span class="sw-label negative">劣势</span><ul class="sw-list"><li v-for="w in build.weaknesses" :key="w">{{ w }}</li></ul></div></div>
    </el-card>
    <el-card v-if="build.tips && build.tips.length" class="section-card" shadow="never"><template #header><span class="section-title">小贴士</span></template><ul class="tips-list"><li v-for="tip in build.tips" :key="tip">{{ tip }}</li></ul></el-card>
  </div>
</template>
<script setup>
import WhenToPick from './WhenToPick.vue'; import ItemBuild from './ItemBuild.vue'; import SkillOrder from './SkillOrder.vue'; import AugmentSynergies from './AugmentSynergies.vue'
defineProps({ build: { type: Object, required: true } })
</script>
<style scoped>
.build-content { display: flex; flex-direction: column; }
.section-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.playstyle-text { font-size: 15px; color: var(--text-primary); line-height: 1.9; }
.sw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 640px) { .sw-grid { grid-template-columns: 1fr; } }
.sw-label { font-size: 13px; font-weight: 600; margin-bottom: 8px; display: block; }
.sw-label.positive { color: #85ce61; } .sw-label.negative { color: #f56c6c; }
.sw-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.sw-list li { font-size: 14px; color: var(--text-secondary); padding-left: 14px; position: relative; }
.sw-list li::before { content: ''; position: absolute; left: 2px; top: 8px; width: 5px; height: 5px; border-radius: 50%; }
.sw-col:first-child .sw-list li::before { background: #85ce61; }
.sw-col:last-child .sw-list li::before { background: #f56c6c; }
.tips-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.tips-list li { font-size: 14px; color: var(--text-secondary); line-height: 1.7; padding-left: 20px; position: relative; }
.tips-list li::before { content: ''; position: absolute; left: 4px; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
</style>
