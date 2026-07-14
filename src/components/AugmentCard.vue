<template>
  <div class="augment-card" :class="`tier-${tierClass(augment.tier)}`">
    <div class="augment-top">
      <img v-if="augment.imageUrl && !imgFailed" :src="augment.imageUrl" :alt="augment.name" class="augment-img" :class="`rarity-${tierClass(augment.tier)}`" @error="imgFailed = true" />
      <span v-else-if="augment.imageUrl" class="augment-img-placeholder" :class="`placeholder-${tierClass(augment.tier)}`">{{ augment.name[0] }}</span>
      <div class="augment-header">
        <span class="augment-name">{{ augment.name }}</span>
        <span class="augment-tier">{{ augment.tier }}</span>
      </div>
    </div>
    <p v-if="augment.effect" class="augment-effect">{{ augment.effect }}</p>
    <p v-if="augment.detail" class="augment-detail">{{ augment.detail }}</p>
    <div v-if="augment.suitableHeroes && augment.suitableHeroes.length" class="augment-heroes">
      <span class="heroes-label">推荐英雄：</span>
      <span v-for="h in augment.suitableHeroes" :key="h" class="hero-tag">{{ h }}</span>
    </div>
    <div v-if="augment.heroSynergy" class="synergy-list">
      <div v-for="(reason, hero) in augment.heroSynergy" :key="hero" class="synergy-item">
        <span class="synergy-hero">{{ hero }}</span>
        <span class="synergy-reason">{{ reason }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TIER_MAP } from '@/config.js'
defineProps({ augment: { type: Object, required: true } })
function tierClass(tier) { return TIER_MAP[tier] || tier }
const imgFailed = ref(false)
</script>

<style scoped>
.augment-card {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  transition: all 0.2s;
}

.augment-card:hover {
  transform: translateY(-1px);
}

.augment-card.tier-prismatic {
  border-color: rgba(184, 120, 208, 0.5);
  box-shadow: 0 0 16px rgba(184, 120, 208, 0.08);
}

.augment-card.tier-gold {
  border-color: rgba(200, 164, 78, 0.4);
}

.augment-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.augment-img {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  flex-shrink: 0;
}

.augment-img.rarity-prismatic {
  box-shadow: 0 0 10px rgba(184, 120, 208, 0.4);
}

.augment-img.rarity-gold {
  box-shadow: 0 0 8px rgba(200, 164, 78, 0.3);
}

.augment-img.rarity-silver {
  box-shadow: 0 0 6px rgba(160, 176, 192, 0.3);
}

.augment-img-placeholder {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.placeholder-prismatic {
  background: linear-gradient(135deg, #7b3fa3, #b878d0);
  box-shadow: 0 0 10px rgba(184, 120, 208, 0.4);
}

.placeholder-gold {
  background: linear-gradient(135deg, #8b6914, #d4b86a);
  box-shadow: 0 0 8px rgba(200, 164, 78, 0.3);
}

.placeholder-silver {
  background: linear-gradient(135deg, #6b7b8d, #b0c0d0);
  box-shadow: 0 0 6px rgba(160, 176, 192, 0.3);
}

.augment-header {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.augment-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.augment-tier {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
}

.tier-prismatic .augment-tier {
  background: rgba(184, 120, 208, 0.2);
  color: #c898e0;
}

.tier-gold .augment-tier {
  background: rgba(200, 164, 78, 0.2);
  color: #d4b86a;
}

.tier-silver .augment-tier {
  background: rgba(160, 176, 192, 0.2);
  color: #b0c0d0;
}

.augment-effect {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  margin-bottom: 8px;
  padding: 10px 14px;
  background: rgba(64, 158, 255, 0.06);
  border-radius: 6px;
  border-left: 3px solid var(--accent);
}

.augment-detail {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
}

.augment-heroes {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.hero-tag {
  color: var(--accent);
}

.heroes-label {
  color: var(--text-muted);
}

.synergy-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.synergy-item {
  display: flex;
  gap: 6px;
  font-size: 12px;
  line-height: 1.5;
}

.synergy-hero {
  color: var(--accent);
  font-weight: 600;
  white-space: nowrap;
}

.synergy-reason {
  color: var(--text-muted);
}
</style>
