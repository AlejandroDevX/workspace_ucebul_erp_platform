import { FileText, Shield, Workflow } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const highlights = [
  {
    icon: Shield,
    title: 'Gestión de contratos',
    description: 'Centraliza todos los contratos y otrosíes de la empresa con trazabilidad completa.',
  },
  {
    icon: Workflow,
    title: 'Flujos de aprobación',
    description: 'Controla cada etapa de aprobación con roles y permisos por módulo.',
  },
  {
    icon: FileText,
    title: 'Documentos y evidencias',
    description: 'Adjunta documentos a cada proceso y mantén el historial completo.',
  },
] as const

export function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-shell__hero">
        <div className="auth-shell__brand">
          <span className="auth-shell__brand-mark">UE</span>
          <div>
            <p className="auth-shell__eyebrow">Ucebul Ecosystem</p>
            <h1>ERP Platform</h1>
          </div>
        </div>

        <div className="auth-shell__copy">
          <p className="auth-shell__lead">
            Gestiona contratos, contratistas, aprobaciones y documentos del ecosistema Ucebul desde una sola plataforma.
          </p>
        </div>

        <div className="auth-shell__highlights">
          {highlights.map((item) => {
            const Icon = item.icon

            return (
              <article key={item.title} className="auth-shell__highlight">
                <span className="auth-shell__highlight-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="auth-shell__content">
        <Outlet />
      </section>
    </main>
  )
}
