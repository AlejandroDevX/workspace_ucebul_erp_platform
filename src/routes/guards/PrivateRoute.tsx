import { Navigate, Outlet } from 'react-router-dom'
import { APP_ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function PrivateRoute() {
  const status = useAuthStore((s) => s.status)
  const token = useAuthStore((s) => s.token)
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping)

  if (isBootstrapping) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner" aria-label="Cargando..." />
        <p>Recuperando sesión...</p>
      </div>
    )
  }

  if (!token || status !== 'authenticated') {
    return <Navigate to={APP_ROUTES.login} replace />
  }

  return <Outlet />
}
