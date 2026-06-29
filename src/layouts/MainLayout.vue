<template>
  <div class="layout">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <p>海克斯大乱斗攻略站 · 版本 26.12（2026年6月）</p>
    </footer>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.footer {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
  border-top: 1px solid var(--border-color);
}
</style>
