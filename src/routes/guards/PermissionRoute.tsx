import { Navigate, Outlet } from 'react-router-dom'
import { APP_ROUTES } from '@/routes/paths'
import { useAuth } from '@/hooks/useAuth'

interface PermissionRouteProps {
  permission?: string
  anyOf?: string[]
}

export function PermissionRoute({ permission, anyOf }: PermissionRouteProps) {
  const { hasPermission, hasAnyPermission } = useAuth()

  let allowed = true

  if (permission) allowed = hasPermission(permission)
  if (anyOf) allowed = hasAnyPermission(anyOf)

  if (!allowed) {
    return <Navigate to={APP_ROUTES.unauthorized} replace />
  }

  return <Outlet />
}
