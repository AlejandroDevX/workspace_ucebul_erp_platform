import { FileQuestion } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/routes/paths'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="error-page">
      <span className="error-page__icon">
        <FileQuestion size={32} />
      </span>
      <h1 className="error-page__title">Página no encontrada</h1>
      <p className="error-page__description">
        La ruta que buscas no existe en el ERP.
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
