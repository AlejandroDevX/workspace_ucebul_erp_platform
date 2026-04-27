import { create } from 'zustand'
import { authStorage } from '@/lib/storage'
import { workspaceApi } from '@/services/workspaceApi'
import { isRecord } from '@/utils/is-record'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/utils/permissions'
import type { AuthUser, AuthSession, WorkspaceApplication, WorkspaceUserApplication } from '@/types/workspace'
import type { GroupedPermissions } from '@/types/permissions'
import type { EntityId } from '@/types/common'

const APPLICATION_SLUG = 'ucebul-erp'

type AuthStatus = 'guest' | 'loading' | 'authenticated'

interface AuthState {
  token: string | null
  tokenType: string
  user: AuthUser | null
  workspaceRoles: unknown[]
  userApplications: unknown[]
  currentApplication: WorkspaceApplication | null
  currentApplicationAccess: WorkspaceUserApplication | null
  currentApplicationPermissions: GroupedPermissions
  status: AuthStatus
  isAuthenticated: boolean
  isLoading: boolean
  isBootstrapping: boolean
  hasInitialized: boolean
  error: string | null

  initializeSession: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
  hasPermission: (slug: string) => boolean
  hasAnyPermission: (slugs: string[]) => boolean
  hasAllPermissions: (slugs: string[]) => boolean
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function parseUser(data: unknown): AuthUser | null {
  if (!isRecord(data)) return null

  const id = (data.workspace_user_id as EntityId | undefined)
  const email = readString(data.workspace_user_email)

  if (!id || !email) return null

  return {
    id,
    workspace_user_id: id,
    name: readString(data.workspace_user_name, email),
    workspace_user_name: readString(data.workspace_user_name, email),
    lastName: readString(data.workspace_user_last_name) || undefined,
    workspace_user_last_name: readString(data.workspace_user_last_name) || undefined,
    email,
    workspace_user_email: email,
    roles: Array.isArray(data.user_roles)
      ? data.user_roles
          .map((r) => {
            if (typeof r === 'string') return r
            if (isRecord(r) && isRecord(r.workspace_role)) {
              return readString(r.workspace_role.workspace_role_slug) || readString(r.workspace_role.workspace_role_name)
            }
            return ''
          })
          .filter(Boolean)
      : [],
  }
}

function parseSession(responseData: unknown): AuthSession | null {
  if (!isRecord(responseData)) return null

  const user = parseUser(responseData)
  if (!user) return null

  const currentApp = isRecord(responseData.current_application)
    ? (responseData.current_application as unknown as WorkspaceApplication)
    : null

  const currentAccess = isRecord(responseData.current_application_access)
    ? (responseData.current_application_access as unknown as WorkspaceUserApplication)
    : null

  const perms = isRecord(responseData.current_application_permissions)
    ? (responseData.current_application_permissions as unknown as GroupedPermissions)
    : {}

  return {
    user,
    workspaceRoles: Array.isArray(responseData.user_roles) ? responseData.user_roles : [],
    userApplications: Array.isArray(responseData.user_applications) ? responseData.user_applications : [],
    currentApplication: currentApp,
    currentApplicationAccess: currentAccess,
    currentApplicationPermissions: perms,
  }
}

const clearedState = {
  user: null,
  workspaceRoles: [] as unknown[],
  userApplications: [] as unknown[],
  currentApplication: null,
  currentApplicationAccess: null,
  currentApplicationPermissions: {} as GroupedPermissions,
  status: 'guest' as const,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const initialToken = authStorage.getToken()
let bootstrapPromise: Promise<void> | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  tokenType: 'Bearer',
  ...clearedState,
  status: initialToken ? 'loading' : 'guest',
  isLoading: Boolean(initialToken),
  isBootstrapping: Boolean(initialToken),
  hasInitialized: !initialToken,

  async initializeSession() {
    if (get().hasInitialized) return

    if (bootstrapPromise) return bootstrapPromise

    bootstrapPromise = (async () => {
      const token = get().token ?? authStorage.getToken()

      if (!token) {
        set({ ...clearedState, token: null, hasInitialized: true, isBootstrapping: false })
        bootstrapPromise = null
        return
      }

      set({ token, status: 'loading', isLoading: true, error: null, isBootstrapping: true })

      try {
        const response = await workspaceApi.get(`/auth/me?application_slug=${APPLICATION_SLUG}`)
        const responseData = isRecord(response.data) && isRecord(response.data.data)
          ? response.data.data
          : response.data

        const session = parseSession(responseData)

        if (!session || !session.currentApplicationAccess) {
          throw new Error('No tienes acceso a la aplicación ERP.')
        }

        set({
          ...session,
          token,
          status: 'authenticated',
          isAuthenticated: true,
          isLoading: false,
          isBootstrapping: false,
          hasInitialized: true,
          error: null,
        })
      } catch {
        authStorage.clearToken()
        set({ ...clearedState, token: null, hasInitialized: true, isBootstrapping: false })
      } finally {
        bootstrapPromise = null
      }
    })()

    return bootstrapPromise
  },

  async login(email, password) {
    set({ status: 'loading', isLoading: true, error: null })

    try {
      const loginResponse = await workspaceApi.post('/auth/login', {
        workspace_user_email: email,
        workspace_user_password: password,
        workspace_personal_access_token_name: 'erp-platform',
      })

      const loginData = isRecord(loginResponse.data) && isRecord(loginResponse.data.data)
        ? loginResponse.data.data
        : loginResponse.data

      const token =
        readString(isRecord(loginData) ? loginData.workspace_access_token : '') ||
        readString(isRecord(loginData) ? loginData.access_token : '') ||
        readString(isRecord(loginData) ? loginData.token : '')

      if (!token) throw new Error('El servidor no devolvió un token de acceso.')

      const tokenType =
        readString(isRecord(loginData) ? loginData.workspace_access_token_type : '') ||
        readString(isRecord(loginData) ? loginData.token_type : '') ||
        'Bearer'

      authStorage.setToken(token)

      const meResponse = await workspaceApi.get(`/auth/me?application_slug=${APPLICATION_SLUG}`, {
        headers: { Authorization: `${tokenType} ${token}` },
      })

      const meData = isRecord(meResponse.data) && isRecord(meResponse.data.data)
        ? meResponse.data.data
        : meResponse.data

      const session = parseSession(meData)

      if (!session) throw new Error('No fue posible obtener los datos del usuario.')

      if (!session.currentApplicationAccess) {
        authStorage.clearToken()
        throw new Error('Tu usuario no tiene acceso a la aplicación ERP. Contacta al administrador.')
      }

      set({
        ...session,
        token,
        tokenType,
        status: 'authenticated',
        isAuthenticated: true,
        isLoading: false,
        isBootstrapping: false,
        hasInitialized: true,
        error: null,
      })
    } catch (error) {
      authStorage.clearToken()
      const message = error instanceof Error ? error.message : 'No fue posible iniciar sesión.'
      set({ ...clearedState, token: null, hasInitialized: true, isBootstrapping: false, error: message })
      throw error
    }
  },

  async logout() {
    const token = get().token

    if (token) {
      try {
        await workspaceApi.post('/auth/logout')
      } catch {
        // ignore
      }
    }

    authStorage.clearToken()
    set({ ...clearedState, token: null, hasInitialized: true, isBootstrapping: false })
  },

  clearSession() {
    authStorage.clearToken()
    set({ ...clearedState, token: null, hasInitialized: true, isBootstrapping: false })
  },

  hasPermission(slug) {
    return hasPermission(get().currentApplicationPermissions, slug)
  },

  hasAnyPermission(slugs) {
    return hasAnyPermission(get().currentApplicationPermissions, slugs)
  },

  hasAllPermissions(slugs) {
    return hasAllPermissions(get().currentApplicationPermissions, slugs)
  },
}))
