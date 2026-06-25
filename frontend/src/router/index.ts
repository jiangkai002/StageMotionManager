import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
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
    redirect: '/stage-motion',
  },
  {
    path: '/stage-motion',
    name: 'stage-motion',
    component: () => import('../views/StageMotion.vue'),
    meta: { requiresAuth: true, title: '舞台运动' },
  },
  {
    path: '/flex-demo',
    name: 'flex-demo',
    component: () => import('../components/FlexLayoutDemo.vue'),
    meta: { requiresAuth: false, title: 'Flex布局演示' },
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
        component: () => import('../backstage/settings/ElementMotionParaSetup.vue'),
        meta: { requiresAuth: true, title: '元素运动配置' },
      },
      {
        path: 'settings/basic-info',
        name: 'backstage-basic-info',
        component: () => import('../backstage/settings/BasicInfoSetup.vue'),
        meta: { requiresAuth: true, title: '构件基础信息' },
      },
      {
        path: 'settings/operation-method',
        name: 'backstage-operation-method',
        component: () => import('../backstage/settings/OperationMethodSetup.vue'),
        meta: { requiresAuth: true, title: '操作方法管理' },
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
