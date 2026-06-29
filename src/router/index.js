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
        path: 'augments',
        name: 'augments',
        component: () => import('@/pages/AugmentsPage.vue')
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
  history: createWebHistory(),
  routes
})

export default router
