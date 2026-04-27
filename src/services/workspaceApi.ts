import axios from 'axios'
import { env } from '@/config/env'
import { authStorage } from '@/lib/storage'
import { normalizeApiError } from '@/services/api-error'
import { emitForbidden, emitUnauthorized } from '@/utils/auth-events'

export const workspaceApi = axios.create({
  baseURL: env.workspaceApiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

workspaceApi.interceptors.request.use((config) => {
  const token = authStorage.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

workspaceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = normalizeApiError(error)

    if (apiError.status === 401) {
      authStorage.clearToken()
      emitUnauthorized()
    }

    if (apiError.status === 403) {
      emitForbidden(apiError)
    }

    return Promise.reject(apiError)
  },
)
