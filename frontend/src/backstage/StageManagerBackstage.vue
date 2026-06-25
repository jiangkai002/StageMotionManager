<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import logo from '@/assets/logo.svg'
import modelUpload from '@/assets/modelUpload.svg'
import stageMotion from '@/assets/stageMotion.svg'
import basicInfo from '@/assets/basicInfo.svg'
import operationMethod from '@/assets/operationMethod.svg'
import maintenanceRequirement from '@/assets/maintenanceRequirement.svg'

interface NavigationItem {
  path: string
  title: string
  description: string
  icon: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const navigationItems: NavigationItem[] = [
  {
    path: '/backstage/settings/model-upload',
    title: '模型上传',
    description: '维护舞台模型资源',
    icon: modelUpload,
  },
  {
    path: '/backstage/settings/element-motion',
    title: '构件运动参数配置',
    description: '配置元素运动参数',
    icon: stageMotion,
  },
  {
    path: '/backstage/settings/basic-info',
    title: '构件基础信息',
    description: '管理构件基础参数',
    icon: basicInfo,
  },
  {
    path: '/backstage/settings/operation-method',
    title: '操作方法管理',
    description: '管理各构件操作步骤',
    icon: operationMethod,
  },
  {
    path: '/backstage/settings/maintenance-requirement',
    title: '维保要求管理',
    description: '维护设备保养要求',
    icon: maintenanceRequirement,
  },
]

const activeMenu = computed(() => route.path)
const currentNavigation = computed(() => navigationItems.find((item) => item.path === route.path))
const pageTitle = computed(() => currentNavigation.value?.title ?? '后台管理')
const pageDescription = computed(
  () => currentNavigation.value?.description ?? '集中管理舞台资源与运动配置',
)
const username = computed(() => userStore.username || '管理员')
const userInitial = computed(() => username.value.trim().slice(0, 1).toUpperCase() || 'A')

function handleMenuSelect(path: string) {
  if (path !== route.path) router.push(path)
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
    <el-aside class="backstage-aside" width="272px">
      <div class="brand">
        <img :src="logo" class="brand-mark" alt="StageManager" />
        <div class="brand-copy">
          <h1>StageManager</h1>
          <p>舞台运动管理后台</p>
        </div>
      </div>

      <div class="nav-section-label">管理</div>
      <el-menu class="backstage-menu" :default-active="activeMenu" @select="handleMenuSelect">
        <el-menu-item v-for="item in navigationItems" :key="item.path" :index="item.path">
          <img :src="item.icon" class="menu-icon" alt="" />
          <span class="menu-text">
            <strong>{{ item.title }}</strong>
            <small>{{ item.description }}</small>
          </span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container class="content-shell">
      <el-header class="backstage-header">
        <div class="header-title">
          <p class="breadcrumb">后台 / 设置</p>
          <h2>{{ pageTitle }}</h2>
          <span>{{ pageDescription }}</span>
        </div>

        <div class="header-actions">
          <el-dropdown trigger="click">
            <button class="profile-button" type="button">
              <span class="avatar">{{ userInitial }}</span>
              <span class="profile-copy">
                <strong>{{ username }}</strong>
                <small>管理员</small>
              </span>
              <span class="chevron" aria-hidden="true"></span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="backstage-main">
        <div class="content-frame">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.backstage-page {
  --fluent-brand: #0f6cbd;
  --fluent-brand-hover: #115ea3;
  --fluent-brand-subtle: #ebf3fc;
  --fluent-bg: #f5f5f5;
  --fluent-surface: #ffffff;
  --fluent-surface-subtle: #fafafa;
  --fluent-border: #e0e0e0;
  --fluent-border-strong: #d1d1d1;
  --fluent-text: #242424;
  --fluent-text-muted: #616161;
  --fluent-text-subtle: #707070;
  --fluent-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  --el-color-primary: var(--fluent-brand);
  height: 100vh;
  min-height: 0;
  overflow: hidden;
  color: var(--fluent-text);
  background: var(--fluent-bg);
  font-family:
    'Segoe UI',
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.backstage-aside {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 14px 12px;
  background: var(--fluent-surface);
  border-right: 1px solid var(--fluent-border);
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 56px;
  padding: 6px 8px 18px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 1px solid var(--fluent-border);
  border-radius: 8px;
}

.brand-copy {
  min-width: 0;
}

.brand h1 {
  margin: 0;
  overflow: hidden;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  color: var(--fluent-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand p {
  margin: 1px 0 0;
  overflow: hidden;
  font-size: 12px;
  line-height: 16px;
  color: var(--fluent-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-section-label {
  padding: 0 12px 8px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: var(--fluent-text-subtle);
}

.backstage-menu {
  flex: 1;
  background: transparent;
  border-right: 0;
}

.backstage-menu :deep(.el-menu-item) {
  position: relative;
  height: 56px;
  gap: 12px;
  align-items: center;
  padding: 0 12px !important;
  margin: 2px 0;
  color: var(--fluent-text);
  border-radius: 6px;
}

.backstage-menu :deep(.el-menu-item::before) {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 2px;
  width: 3px;
  content: '';
  background: transparent;
  border-radius: 2px;
}

.backstage-menu :deep(.el-menu-item:hover) {
  background: var(--fluent-surface-subtle);
}

.backstage-menu :deep(.el-menu-item.is-active) {
  color: var(--fluent-text);
  background: var(--fluent-brand-subtle);
}

.backstage-menu :deep(.el-menu-item.is-active::before) {
  background: var(--fluent-brand);
}

.menu-icon {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
}

.menu-text {
  display: grid;
  min-width: 0;
  line-height: 1.2;
}

.menu-text strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  color: var(--fluent-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-text small {
  overflow: hidden;
  margin-top: 3px;
  font-size: 12px;
  color: var(--fluent-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aside-footer {
  padding-top: 12px;
  border-top: 1px solid var(--fluent-border);
}

.workspace-status {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  background: var(--fluent-surface-subtle);
  border: 1px solid var(--fluent-border);
  border-radius: 8px;
}

.status-dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  background: #13a10e;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(19, 161, 14, 0.12);
}

.workspace-status strong,
.workspace-status span {
  display: block;
  line-height: 18px;
}

.workspace-status strong {
  font-size: 13px;
  font-weight: 600;
}

.workspace-status span {
  font-size: 12px;
  color: var(--fluent-text-muted);
}

.content-shell {
  min-width: 0;
  min-height: 0;
}

.backstage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  padding: 0 28px;
  background: var(--fluent-surface);
  border-bottom: 1px solid var(--fluent-border);
}

.header-title {
  min-width: 0;
}

.breadcrumb {
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  color: var(--fluent-text-muted);
}

.backstage-header h2 {
  margin: 2px 0 0;
  overflow: hidden;
  font-size: 22px;
  font-weight: 600;
  line-height: 28px;
  color: var(--fluent-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-title span {
  display: block;
  margin-top: 1px;
  overflow: hidden;
  font-size: 13px;
  line-height: 18px;
  color: var(--fluent-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
  align-items: center;
  margin-left: 24px;
}

.command-button {
  height: 34px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--fluent-text);
  background: var(--fluent-surface);
  border-color: var(--fluent-border-strong);
  border-radius: 6px;
}

.command-button:hover {
  color: var(--fluent-text);
  background: var(--fluent-surface-subtle);
  border-color: var(--fluent-border-strong);
}

.profile-button {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 156px;
  height: 40px;
  padding: 4px 10px 4px 5px;
  font: inherit;
  color: var(--fluent-text);
  cursor: pointer;
  background: var(--fluent-surface);
  border: 1px solid var(--fluent-border);
  border-radius: 8px;
}

.profile-button:hover {
  background: var(--fluent-surface-subtle);
}

.avatar {
  display: grid;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  place-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: var(--fluent-brand);
  border-radius: 50%;
}

.profile-copy {
  display: grid;
  min-width: 0;
  text-align: left;
}

.profile-copy strong,
.profile-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-copy strong {
  font-size: 13px;
  font-weight: 600;
  line-height: 17px;
}

.profile-copy small {
  font-size: 11px;
  line-height: 14px;
  color: var(--fluent-text-muted);
}

.chevron {
  width: 7px;
  height: 7px;
  margin-left: auto;
  border-right: 1.5px solid var(--fluent-text-muted);
  border-bottom: 1.5px solid var(--fluent-text-muted);
  transform: translateY(-2px) rotate(45deg);
}

.backstage-main {
  min-height: 0;
  padding: 24px 28px;
  overflow: auto;
  background: var(--fluent-bg);
}

.content-frame {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.content-frame :deep(.el-card) {
  border-color: var(--fluent-border);
  border-radius: 8px;
  box-shadow: var(--fluent-shadow);
}

.content-frame :deep(.el-card__header) {
  padding: 18px 20px;
  background: var(--fluent-surface);
  border-bottom-color: var(--fluent-border);
}

.content-frame :deep(.el-card__body) {
  padding: 20px;
}

@media (max-width: 900px) {
  .backstage-page {
    display: block;
  }

  .backstage-aside {
    width: 100% !important;
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--fluent-border);
  }

  .backstage-menu :deep(.el-menu-item) {
    height: 52px;
  }

  .aside-footer {
    display: none;
  }

  .backstage-header {
    height: auto;
    gap: 16px;
    align-items: flex-start;
    padding: 18px;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
  }

  .profile-button {
    min-width: 0;
  }

  .backstage-main {
    padding: 18px;
  }
}

@media (max-width: 560px) {
  .brand {
    padding-bottom: 12px;
  }

  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .command-button,
  .profile-button {
    width: 100%;
  }
}
</style>
