<template>
  <div class="about-page">
    <div class="page-header">
      <h1 class="page-title">关于本站</h1>
    </div>

    <el-card class="about-card" shadow="never">
      <template #header><span class="card-title">网站简介</span></template>
      <p>海克斯大乱斗攻略站，专注于《英雄联盟》「海克斯大乱斗」模式的攻略内容。</p>
      <p>本站基于 <strong>26.12 版本（2026年6月）</strong>，即海克斯大乱斗 3.0 版本。</p>
    </el-card>

    <el-card class="about-card" shadow="never">
      <template #header><span class="card-title">版本变更</span></template>
      <ul class="version-list">
        <li><strong>26.12（2026年6月）：</strong>羁绊系统正式移除，新增约50种技能强化符文，部分经典羁绊效果转为独立符文保留</li>
        <li><strong>26.03（2026年2月）：</strong>引入羁绊/套装加成系统，新增通行证</li>
        <li><strong>25.21（2025年10月）：</strong>海克斯大乱斗模式正式上线</li>
      </ul>
    </el-card>

    <el-card class="about-card" shadow="never">
      <template #header><span class="card-title">内容说明</span></template>
      <p>所有攻略内容基于个人游戏经验手动编写。目前覆盖 5 个英雄，后续逐步扩充。攻略包含出装推荐、技能加点、海克斯强化选择建议以及玩法思路。</p>
    </el-card>

    <el-card class="about-card" shadow="never">
      <template #header><span class="card-title">海克斯大乱斗 3.0 核心机制</span></template>
      <ul>
        <li>游戏内每局可在特定等级（1/3/7/11/15级）从随机出现的强化符文中选择</li>
        <li>强化符文分为三个等级：<strong>白银、黄金、棱彩</strong>（稀有度递增）</li>
        <li>分为五大类型：技能强化、伤害强化、生存强化、机动强化、功能强化</li>
        <li>3.0版本移除了羁绊系统，但新增大量技能强化类符文，可改写英雄技能形态</li>
      </ul>
    </el-card>
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
  padding: 48px 0 32px;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
}

.about-card {
  max-width: 720px;
  margin: 0 auto 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.about-card p {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.9;
  margin-bottom: 8px;
}

.about-card ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-card li {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  padding-left: 16px;
  position: relative;
}

.about-card li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.about-card strong {
  color: var(--text-primary);
}

.version-list li {
  font-size: 14px;
}
</style>
