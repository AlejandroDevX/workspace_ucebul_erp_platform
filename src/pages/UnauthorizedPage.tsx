import { ShieldOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/routes/paths'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="error-page">
      <span className="error-page__icon">
        <ShieldOff size={32} />
      </span>
      <h1 className="error-page__title">Acceso restringido</h1>
      <p className="error-page__description">
        No tienes permiso para realizar esta acción.
      </p>
      <button
        className="btn btn--secondary"
        type="button"
        onClick={() => navigate(APP_ROUTES.dashboard)}
      >
        Volver al inicio
      </button>
    </div>
  )
}
