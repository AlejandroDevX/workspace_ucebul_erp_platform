import { useAuthStore } from '@/features/auth/store/auth.store'

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping)
  const currentApplication = useAuthStore((s) => s.currentApplication)
  const currentApplicationAccess = useAuthStore((s) => s.currentApplicationAccess)
  const currentApplicationPermissions = useAuthStore((s) => s.currentApplicationPermissions)
  const storeHasPermission = useAuthStore((s) => s.hasPermission)
  const storeHasAnyPermission = useAuthStore((s) => s.hasAnyPermission)
  const storeHasAllPermissions = useAuthStore((s) => s.hasAllPermissions)

  return {
    user,
    token,
    status,
    isBootstrapping,
    currentApplication,
    currentApplicationAccess,
    currentApplicationPermissions,
    isAuthenticated: status === 'authenticated' && Boolean(token),
    hasPermission: storeHasPermission,
    hasAnyPermission: storeHasAnyPermission,
    hasAllPermissions: storeHasAllPermissions,
  }
}
