import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '@/stores'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true, title: '首页' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: true, title: '关于' },
  },
  {
    path: '/stage-motion',
    name: 'stage-motion',
    component: () => import('../views/StageMotion.vue'),
    meta: { requiresAuth: true, title: '舞台运动' },
  },
  {
    path: '/backstage',
    component: () => import('../backstage/StageManagerBackstage.vue'),
    meta: { requiresAuth: true, title: '后台管理' },
    redirect: '/backstage/settings/model-upload',
    children: [
      {
        path: 'settings/model-upload',
        name: 'backstage-model-upload',
        component: () => import('../backstage/settings/ModelUpload.vue'),
        meta: { requiresAuth: true, title: '模型上传' },
      },
      {
        path: 'settings/element-motion',
        name: 'backstage-element-motion',
        component: () => import('../backstage/settings/ElementMotionSetup.vue'),
        meta: { requiresAuth: true, title: '元素运动配置' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.meta.title) {
    document.title = `${to.meta.title} - StageManager`
  }

  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && userStore.isLoggedIn) {
    return { name: 'home' }
  }
})

export default router
