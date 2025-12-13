import { createRouter, createWebHistory, RouterView } from 'vue-router'
import Tr from "@/i18n/translation"

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: "/:locale?",
      component: RouterView,
      beforeEnter: Tr.routeMiddleware,
      children: [
        {
          path: ':pathMatch(.*)*',
          component: () => import('@/views/404.vue')
        },
        {
          path: '',
          name: 'home',
          component: () => import('@/views/Home.vue')
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/Auth/Login.vue')
        },
        {
          path: 'registration',
          name: 'registration',
          component: () => import('@/views/Auth/Reg.vue')
        },
        {
          path: 'restore',
          name: 'restore',
          component: () => import('@/views/Auth/Restore.vue')
        },
        {
          path: 'newpass',
          name: 'newpass',
          component: () => import('@/views/Auth/NewPass.vue')
        },
        {
          path: 'personal',
          name: 'personal',
          component: () => import('@/views/Personal.vue')
        },
        {
          path: 'articles',
          name: 'articles',
          component: () => import('@/views/Articles.vue')
        },
        {
          path: 'faq',
          name: 'faq',
          component: () => import('@/views/Faq.vue')
        },
        {
          path: 'partner',
          name: 'partner',
          component: () => import('@/views/Partner.vue')
        },
        {
          path: 'quiz',
          name: 'quiz',
          component: () => import('@/views/Quiz.vue')
        },
        {
          path: 'setting',
          name: 'setting',
          component: () => import('@/views/Setting.vue')
        },
      ]
    }
  ],
  // scrollBehavior(to, savedPosition) {
  scrollBehavior(to) {
    if (to.hash) {
      return ({
        el: to.hash,
        behavior: 'auto',
      })
    // } else if (savedPosition) {
    //     return (savedPosition);
    } else {
      return {left: 0, top: 0}
    }
  },
})

export default router