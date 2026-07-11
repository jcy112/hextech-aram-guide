import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue')
      },
      {
        path: 'champion/:id',
        name: 'champion-detail',
        component: () => import('@/pages/ChampionDetailPage.vue')
      },
      {
        path: 'champions',
        name: 'champions',
        component: () => import('@/pages/ChampionsPage.vue')
      },
      {
        path: 'augments',
        name: 'augments',
        component: () => import('@/pages/AugmentsPage.vue')
      },
      {
        path: 'augments-ranking',
        name: 'augments-ranking',
        component: () => import('@/pages/AugmentsRankingPage.vue')
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/pages/AboutPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/hextech-aram-guide/'),
  routes
})

export default router
