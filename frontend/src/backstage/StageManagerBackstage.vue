<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import logo from '@/assets/logo.png'
import modelUpload from '@/assets/modelUpload.svg'
import stageMotion from '@/assets/stageMotion.svg'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => String(route.meta.title ?? '后台管理'))
const username = computed(() => userStore.username || '管理员')

function handleMenuSelect(path: string) {
  router.push(path)
}

function goFrontStage() {
  router.push('/stage-motion')
}

function handleLogout() {
  userStore.logout()
  router.replace('/login')
}
</script>

<template>
  <el-container class="backstage-page">
    <el-aside class="backstage-aside" width="232px">
      <div class="brand">
        <img :src="logo" class="brand-mark" alt="logo" />
        <div>
          <h1>舞台运动管理</h1>
          <p>后台管理</p>
        </div>
      </div>

      <el-menu
        class="backstage-menu"
        :default-active="activeMenu"
        background-color="#ffffff"
        text-color="#1f2937"
        active-text-color="#ffffff"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/backstage/settings/model-upload">
          <img :src="modelUpload" class="menu-icon" />
          <span>模型上传</span>
        </el-menu-item>
        <el-menu-item index="/backstage/settings/element-motion">
          <img :src="stageMotion" class="menu-icon" />
          <span>元素运动配置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="backstage-header">
        <div>
          <p class="breadcrumb">后台 / 设置</p>
          <h2>{{ pageTitle }}</h2>
        </div>

        <div class="header-actions">
          <el-dropdown trigger="click">
            <el-button type="primary">
              {{ username }}
              <span class="dropdown-caret"></span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="backstage-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.backstage-page {
  --el-color-primary: #2563eb;
  min-height: 100vh;
  color: #1f2937;
  background: #f4f7fb;
}

.backstage-aside {
  display: flex;
  flex-direction: column;
  background: #286afe;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  height: 72px;
  padding: 0 20px;
  color: #ffffff;
}

.brand-mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #101828;
  background: #ffffff;
  border-radius: 8px;
}

.brand h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
}

.brand p {
  margin: 3px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.backstage-menu {
  flex: 1;
  border-right: 0;
}

.backstage-menu :deep(.el-menu-item) {
  height: 48px;
  margin: 4px 12px;
  border-radius: 8px;
}

.backstage-menu :deep(.el-menu-item.is-active) {
  background: #2563eb;
}

.backstage-menu :deep(.el-menu-item:hover) {
  color: #2563eb;
}

.backstage-menu :deep(.el-menu-item.is-active:hover) {
  color: #ffffff;
}

.menu-icon {
  display: inline-grid;
  width: 22px;
  height: 22px;
  margin-right: 10px;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #101828;
  background: transparent;
  border-radius: 6px;
}

.backstage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 28px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb {
  margin: 0 0 2px;
  font-size: 12px;
  color: #64748b;
}

.backstage-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dropdown-caret {
  margin-left: 6px;
  font-size: 12px;
}

.backstage-main {
  padding: 24px;
  overflow: auto;
}

@media (max-width: 860px) {
  .backstage-page {
    flex-direction: column;
  }

  .backstage-aside {
    width: 100% !important;
  }

  .backstage-header {
    height: auto;
    gap: 14px;
    align-items: flex-start;
    padding: 18px;
    flex-direction: column;
  }

  .backstage-main {
    padding: 16px;
  }
}
</style>
