import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** 用户信息接口 */
export interface UserInfo {
  userId: string
  username: string
  roles: string[]
  permissions?: string[]
}

/** localStorage 存储键名 */
const TOKEN_KEY = 'sm_token'
const USER_KEY = 'sm_user'

/** 读取 localStorage（带 try-catch，防止解析失败） */
function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** 写入 localStorage */
function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 忽略写入失败（如隐私模式） */
  }
}

/** 移除 localStorage */
function removeStorage(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* 忽略 */
  }
}

/**
 * 用户 Store
 * 管理登录态、token、用户信息，并自动持久化到 localStorage
 */
export const useUserStore = defineStore('user', () => {
  // ─── state ────────────────────────────────
  // 初始化时从 localStorage 读取，实现刷新后保持登录
  const token = ref<string>(readStorage<string>(TOKEN_KEY) ?? '')
  const userInfo = ref<UserInfo | null>(readStorage<UserInfo>(USER_KEY))

  // ─── getters ──────────────────────────────
  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value)

  /** 用户 ID */
  const userId = computed(() => userInfo.value?.userId ?? '')

  /** 用户名 */
  const username = computed(() => userInfo.value?.username ?? '')

  /** 角色列表 */
  const roles = computed(() => userInfo.value?.roles ?? [])

  /** 是否拥有某个角色 */
  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  /** 是否是管理员 */
  const isAdmin = computed(() => hasRole('admin') || hasRole('administrator'))

  // ─── actions ──────────────────────────────
  /** 设置 token 并持久化 */
  function setToken(newToken: string) {
    token.value = newToken
    if (newToken) {
      writeStorage(TOKEN_KEY, newToken)
    } else {
      removeStorage(TOKEN_KEY)
    }
  }

  /** 设置用户信息并持久化 */
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    writeStorage(USER_KEY, info)
  }

  /**
   * 登录：一次性设置 token + 用户信息
   * @param newToken 登录返回的 token
   * @param info 用户信息
   */
  function login(newToken: string, info: UserInfo) {
    setToken(newToken)
    setUserInfo(info)
  }

  /** 更新部分用户信息（合并更新） */
  function updateUserInfo(patch: Partial<UserInfo>) {
    if (!userInfo.value) return
    userInfo.value = { ...userInfo.value, ...patch }
    writeStorage(USER_KEY, userInfo.value)
  }

  /** 登出：清空所有状态和持久化数据 */
  function logout() {
    token.value = ''
    userInfo.value = null
    removeStorage(TOKEN_KEY)
    removeStorage(USER_KEY)
  }

  return {
    // state
    token,
    userInfo,
    // getters
    isLoggedIn,
    userId,
    username,
    roles,
    isAdmin,
    // actions
    hasRole,
    setToken,
    setUserInfo,
    login,
    updateUserInfo,
    logout,
  }
})
