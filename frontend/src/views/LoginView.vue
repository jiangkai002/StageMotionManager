<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores'
import { apiClient } from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    // TODO: 替换为真实接口调用（如 axios.post('/api/auth/login', ...)）
    // const res = await apiLogin(username.value, password.value)

    const { data } = await apiClient.post('auth/token', {
      identifer: username.value,
      password: password.value,
      persistent: true,
    })

    // 校验返回的 token 是否有效
    if (!data) {
      errorMsg.value = '登录失败：服务器未返回有效凭证'
      return
    }

    userStore.setToken(data)
    // 登录成功后跳转到来源页或首页
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch {
    errorMsg.value = '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">StageManager 登录</h2>

      <div class="login-field">
        <label>用户名</label>
        <input
          v-model="username"
          type="text"
          placeholder="请输入用户名"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="login-field">
        <label>密码</label>
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
      </div>

      <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

      <button class="login-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background, #1a1a2e);
}

.login-card {
  width: 320px;
  padding: 2rem;
  background: var(--color-background-soft, #16213e);
  border-radius: 12px;
  border: 1px solid var(--color-border, #333);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-text, #fff);
}

.login-field {
  margin-bottom: 1rem;
}

.login-field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: var(--color-text-soft, #aaa);
}

.login-field input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #444);
  border-radius: 6px;
  background: var(--color-background-mute, #0f0f23);
  color: var(--color-text, #fff);
  font-size: 0.9rem;
  box-sizing: border-box;
}

.login-field input:focus {
  outline: none;
  border-color: hsla(160, 100%, 37%, 0.6);
}

.login-error {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin: 0.5rem 0;
}

.login-btn {
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: 6px;
  background: hsla(160, 100%, 37%, 1);
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
