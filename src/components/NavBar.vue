<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="logo">
        <span class="logo-text">海克斯大乱斗攻略</span>
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link" active-class="active">首页</router-link>
        <router-link to="/augments" class="nav-link" active-class="active">海克斯强化</router-link>
        <router-link to="/about" class="nav-link" active-class="active">关于</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 18px;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 15px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--accent);
  background: var(--bg-card);
}

.nav-link.active {
  color: var(--accent);
  background: var(--accent-light);
}
</style>
