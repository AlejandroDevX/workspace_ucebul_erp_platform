import axios from 'axios'
import { env } from '@/config/env'
import { authStorage } from '@/lib/storage'
import { normalizeApiError } from '@/services/api-error'
import { emitForbidden, emitUnauthorized } from '@/utils/auth-events'

export const erpApi = axios.create({
  baseURL: env.erpApiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

erpApi.interceptors.request.use((config) => {
  const token = authStorage.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

erpApi.interceptors.response.use(
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

    if (apiError.status === 503) {
      return Promise.reject(
        new (apiError.constructor as typeof Error)(
          'No fue posible validar tu sesión con Workspace',
        ),
      )
    }

    return Promise.reject(apiError)
  },
)

export function createCrudService<TItem, TCreate = Partial<TItem>, TUpdate = TCreate>(
  resourcePath: string,
) {
  return {
    async list(params?: Record<string, unknown>) {
      const response = await erpApi.get<{ data: TItem[] | { data: TItem[] } }>(resourcePath, { params })
      const raw = response.data

      if (raw && typeof raw === 'object' && 'data' in raw) {
        const inner = raw.data

        if (Array.isArray(inner)) return inner
        if (inner && typeof inner === 'object' && 'data' in inner && Array.isArray(inner.data)) {
          return inner.data
        }
      }

      return [] as TItem[]
    },
    async getById(id: number | string) {
      const response = await erpApi.get<{ data: TItem }>(`${resourcePath}/${id}`)
      const raw = response.data

      if (raw && typeof raw === 'object' && 'data' in raw) return raw.data as TItem

      return raw as unknown as TItem
    },
    async create(payload: TCreate) {
      const response = await erpApi.post<{ data: TItem }>(resourcePath, payload)
      const raw = response.data

      if (raw && typeof raw === 'object' && 'data' in raw) return raw.data as TItem

      return raw as unknown as TItem
    },
    async update(id: number | string, payload: TUpdate) {
      const response = await erpApi.put<{ data: TItem }>(`${resourcePath}/${id}`, payload)
      const raw = response.data

      if (raw && typeof raw === 'object' && 'data' in raw) return raw.data as TItem

      return raw as unknown as TItem
    },
    async remove(id: number | string) {
      await erpApi.delete(`${resourcePath}/${id}`)
    },
  }
}
