import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'
import router from '@/router'

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

function attachAuthToken(config: InternalAxiosRequestConfig) {
  // 标记了 skipAuth 的请求不注入本地 token（如请求外部服务）
  if (config.headers?.skipAuth) {
    // 把标记存到 config 上，响应拦截器还能读到
    ;(config as any).skipAuth = true
  } else {
    const userStore = useUserStore()
    const token = userStore.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
}

function handleRequestError(error: unknown) {
  return Promise.reject(error)
}

function handleResponseError(error: any) {
  const { response, config } = error

  // 标记了 skipAuth 的请求不触发 401 登出逻辑
  const skipAuth = (config as any)?.skipAuth

  if (response) {
    switch (response.status) {
      case 401: {
        if (skipAuth) {
          ElMessage.error(response.data?.message || '请求未授权')
        } else {
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          router.replace({
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath },
          })
        }
        break
      }
      case 403:
        ElMessage.error('没有权限访问')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器内部错误')
        break
      default:
        ElMessage.error(response.data?.message || `请求错误 (${response.status})`)
    }
  } else if (error.code === 'ECONNABORTED') {
    ElMessage.error('请求超时，请稍后重试')
  } else {
    ElMessage.error('网络异常，请检查网络连接')
  }

  return Promise.reject(error)
}

apiClient.interceptors.request.use(attachAuthToken, handleRequestError)
apiClient.interceptors.response.use((response) => response, handleResponseError)

export default apiClient
