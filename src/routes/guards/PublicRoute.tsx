import { Navigate, Outlet } from 'react-router-dom'
import { APP_ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function PublicRoute() {
  const status = useAuthStore((s) => s.status)
  const token = useAuthStore((s) => s.token)
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping)

  if (isBootstrapping && token) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner" aria-label="Cargando..." />
        <p>Validando sesión activa...</p>
      </div>
    )
  }

  if (status === 'authenticated' && token) {
    return <Navigate to={APP_ROUTES.dashboard} replace />
  }

  return <Outlet />
}
