import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface CanProps {
  children: ReactNode
  permission?: string
  anyOf?: string[]
  allOf?: string[]
  fallback?: ReactNode
}

export function Can({ children, permission, anyOf, allOf, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()

  let allowed = true

  if (permission) allowed = allowed && hasPermission(permission)
  if (anyOf) allowed = allowed && hasAnyPermission(anyOf)
  if (allOf) allowed = allowed && hasAllPermissions(allOf)

  return allowed ? <>{children}</> : <>{fallback}</>
}
