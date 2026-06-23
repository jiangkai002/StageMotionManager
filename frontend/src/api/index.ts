import apiClient from '@/utils/request'
import { serviceOptions } from './generated'

serviceOptions.axios = apiClient

export { apiClient }
export * from './generated'
