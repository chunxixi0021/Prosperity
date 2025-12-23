import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/weather',
      name: 'Weather',
      component: () => import('../views/Weather.vue')
    },
    {
      path: '/outfit',
      name: 'Outfit',
      component: () => import('../views/Outfit.vue')
    },
    {
      path: '/custom-outfit',
      name: 'CustomOutfit',
      component: () => import('../views/CustomOutfit.vue')
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('../views/History.vue')
    }
  ]
})

export default router

