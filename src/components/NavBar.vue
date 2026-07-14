<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="logo">
        <span class="logo-text">海克斯大乱斗攻略</span>
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link" active-class="active">首页</router-link>
        <router-link to="/champions" class="nav-link" active-class="active">英雄排行</router-link>
        <router-link to="/augments-ranking" class="nav-link" active-class="active">海克斯排行</router-link>
        <router-link to="/mechanics" class="nav-link" active-class="active">ARAM 机制</router-link>
        <router-link to="/mayhem" class="nav-link" active-class="active">Mayhem</router-link>
        <router-link to="/tips" class="nav-link" active-class="active">新手指南</router-link>
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
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  gap: 12px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-link {
  padding: 8px 14px;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--accent);
  background: var(--bg-card);
}

.nav-link.active {
  color: var(--accent);
  background: var(--accent-light);
}

@media (max-width: 768px) {
  .navbar-inner {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 12px;
    gap: 8px;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 12px;
  }

  .logo-text {
    font-size: 16px;
  }
}
</style>
