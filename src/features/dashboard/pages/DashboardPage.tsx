import {
  FileText,
  FilePlus2,
  CheckSquare,
  Users,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Can } from '@/components/permissions/Can'
import { APP_ROUTES } from '@/routes/paths'
import { useAuth } from '@/hooks/useAuth'
import { useMyContractsQuery, useContractsQuery } from '@/features/contracts/hooks/useContractsQuery'
import { useMyAddendumsQuery, useContractAddendumsQuery } from '@/features/contract-addendums/hooks/useContractAddendumsQuery'
import { useThirdPartiesQuery } from '@/features/third-parties/hooks/useThirdPartiesQuery'
import type { Contract } from '@/features/contracts/types/contract.types'
import type { ContractAddendum } from '@/features/contract-addendums/types/contract-addendum.types'

const STEP_LABEL: Record<string, string> = {
  coordinator_creation: 'Creación coordinador',
  administrative_review: 'Revisión administrativa',
  legal_review: 'Revisión jurídica',
  direction_approval: 'Aprobación dirección',
  contractor_signature: 'Firma contratista',
  coordinator_close: 'Cierre coordinador',
}

function formatActivityDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  if (itemDay.getTime() === today.getTime()) return `Hoy, ${timeStr}`
  if (itemDay.getTime() === yesterday.getTime()) return `Ayer, ${timeStr}`
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${timeStr}`
}

function getDeadlineBadge(dateStr: string): { day: string; month: string } {
  const date = new Date(dateStr)
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '').toUpperCase(),
  }
}

function getDaysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

function StepBadge({ slug }: { slug?: string }) {
  if (!slug) return null
  return <span className="task-step-badge">{STEP_LABEL[slug] ?? slug}</span>
}

function ContractTaskRow({ contract, onClick }: { contract: Contract; onClick: () => void }) {
  const stepSlug = contract.process?.current_step?.erp_workflow_step_slug
  return (
    <button className="task-row" type="button" onClick={onClick}>
      <div className="task-row__info">
        <span className="task-row__title">{contract.erp_contract_title}</span>
        <span className="task-row__sub">{contract.contractor?.erp_third_party_name ?? '—'}</span>
      </div>
      <StepBadge slug={stepSlug} />
      <ArrowRight size={14} className="task-row__arrow" />
    </button>
  )
}

function AddendumTaskRow({ addendum, onClick }: { addendum: ContractAddendum; onClick: () => void }) {
  const stepSlug = addendum.process?.current_step?.erp_workflow_step_slug
  return (
    <button className="task-row" type="button" onClick={onClick}>
      <div className="task-row__info">
        <span className="task-row__title">{addendum.erp_contract_addendum_title}</span>
        <span className="task-row__sub">{addendum.contract?.erp_contract_title ?? '—'}</span>
      </div>
      <StepBadge slug={stepSlug} />
      <ArrowRight size={14} className="task-row__arrow" />
    </button>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, currentApplication } = useAuth()

  const myContractsQuery = useMyContractsQuery()
  const myAddendumsQuery = useMyAddendumsQuery()
  const contractsQuery = useContractsQuery()
  const addendumsQuery = useContractAddendumsQuery()
  const thirdPartiesQuery = useThirdPartiesQuery()

  const displayName = [user?.name, user?.lastName].filter(Boolean).join(' ').trim() || 'Usuario'

  const myContracts = (myContractsQuery.data ?? []) as Contract[]
  const myAddendums = (myAddendumsQuery.data ?? []) as ContractAddendum[]
  const totalTasks = myContracts.length + myAddendums.length
  const isLoadingTasks = myContractsQuery.isLoading || myAddendumsQuery.isLoading

  const allContracts = (contractsQuery.data ?? []) as Contract[]

  const recentActivity = [...allContracts]
    .sort((a, b) => new Date(b.erp_contract_updated_at ?? 0).getTime() - new Date(a.erp_contract_updated_at ?? 0).getTime())
    .slice(0, 3)

  const today = new Date()
  const upcomingDeadlines = [...allContracts]
    .filter((c) => c.erp_contract_end_date && new Date(c.erp_contract_end_date) > today)
    .sort((a, b) => new Date(a.erp_contract_end_date!).getTime() - new Date(b.erp_contract_end_date!).getTime())
    .slice(0, 3)

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Bienvenido, {displayName} · {currentApplication?.workspace_application_name ?? 'ERP'}
          </p>
        </div>
        <div className="page-header__actions">
          <Can permission="erp.contracts.create">
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => navigate(APP_ROUTES.contractsNew)}
            >
              <Plus size={16} aria-hidden="true" />
              Nuevo contrato
            </button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--blue">
            <FileText size={22} />
          </span>
          <div className="stat-card__body">
            <span className="stat-card__label">Contratos activos</span>
            <p className="stat-card__value">
              {contractsQuery.isLoading ? '—' : allContracts.length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--orange">
            <Clock size={22} />
          </span>
          <div className="stat-card__body">
            <span className="stat-card__label">Aprobaciones pendientes</span>
            <p className="stat-card__value">
              {isLoadingTasks ? '—' : totalTasks}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--purple">
            <FilePlus2 size={22} />
          </span>
          <div className="stat-card__body">
            <span className="stat-card__label">Otrosíes</span>
            <p className="stat-card__value">
              {addendumsQuery.isLoading ? '—' : (addendumsQuery.data ?? []).length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--green">
            <Users size={22} />
          </span>
          <div className="stat-card__body">
            <span className="stat-card__label">Contratistas</span>
            <p className="stat-card__value">
              {thirdPartiesQuery.isLoading ? '—' : (thirdPartiesQuery.data ?? []).length}
            </p>
          </div>
        </div>
      </div>

      {/* Middle grid: tasks + quick access */}
      <div className="dashboard-grid">
        {/* Mi trabajo asignado */}
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="section-title">
              <Clock size={18} />
              Mi trabajo asignado
              {!isLoadingTasks && (
                <span className="section-title__count">{totalTasks}</span>
              )}
            </h2>
          </div>

          {isLoadingTasks ? (
            <div className="loading-state loading-state--sm">
              <div className="spinner" aria-label="Cargando..." />
            </div>
          ) : totalTasks === 0 ? (
            <div className="tasks-empty">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
                <rect x="14" y="10" width="44" height="52" rx="6" fill="rgba(31,138,91,0.08)" stroke="rgba(31,138,91,0.2)" strokeWidth="1.5" />
                <rect x="22" y="22" width="20" height="3" rx="1.5" fill="rgba(31,138,91,0.3)" />
                <rect x="22" y="30" width="28" height="3" rx="1.5" fill="rgba(31,138,91,0.2)" />
                <rect x="22" y="38" width="24" height="3" rx="1.5" fill="rgba(31,138,91,0.2)" />
                <circle cx="50" cy="50" r="12" fill="#1f8a5b" />
                <path d="M44.5 50l3.5 3.5 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="tasks-empty__title">¡Todo al día!</p>
              <p className="tasks-empty__subtitle">No tienes tareas asignadas actualmente.</p>
            </div>
          ) : (
            <div className="task-list">
              {myContracts.map((contract) => (
                <ContractTaskRow
                  key={contract.erp_contract_id}
                  contract={contract}
                  onClick={() => navigate(APP_ROUTES.contractDetail(contract.erp_contract_id))}
                />
              ))}
              {myAddendums.map((addendum) => (
                <AddendumTaskRow
                  key={addendum.erp_contract_addendum_id}
                  addendum={addendum}
                  onClick={() => navigate(APP_ROUTES.contractAddendumDetail(addendum.erp_contract_addendum_id))}
                />
              ))}
            </div>
          )}
        </section>

        {/* Accesos rápidos */}
        <section className="dashboard-section">
          <h2 className="section-title">Accesos rápidos</h2>
          <div className="quick-access-grid">
            <Can permission="erp.contracts.create">
              <button
                className="quick-access-card"
                type="button"
                onClick={() => navigate(APP_ROUTES.contractsNew)}
              >
                <span className="quick-access-card__icon stat-card__icon--blue">
                  <FileText size={18} />
                </span>
                <div className="quick-access-card__info">
                  <span className="quick-access-card__title">Nuevo contrato</span>
                  <span className="quick-access-card__desc">Crear un nuevo contrato</span>
                </div>
                <ChevronRight size={14} className="quick-access-card__chevron" />
              </button>
            </Can>

            <Can permission="erp.contract_addendums.create">
              <button
                className="quick-access-card"
                type="button"
                onClick={() => navigate(APP_ROUTES.contractAddendumsNew)}
              >
                <span className="quick-access-card__icon stat-card__icon--purple">
                  <FilePlus2 size={18} />
                </span>
                <div className="quick-access-card__info">
                  <span className="quick-access-card__title">Nuevo otrosí</span>
                  <span className="quick-access-card__desc">Crear un nuevo otrosí</span>
                </div>
                <ChevronRight size={14} className="quick-access-card__chevron" />
              </button>
            </Can>

            <Can permission="erp.third_parties.create">
              <button
                className="quick-access-card"
                type="button"
                onClick={() => navigate(APP_ROUTES.thirdPartiesNew)}
              >
                <span className="quick-access-card__icon stat-card__icon--green">
                  <Users size={18} />
                </span>
                <div className="quick-access-card__info">
                  <span className="quick-access-card__title">Nuevo contratista</span>
                  <span className="quick-access-card__desc">Registrar un nuevo contratista</span>
                </div>
                <ChevronRight size={14} className="quick-access-card__chevron" />
              </button>
            </Can>

            <Can permission="erp.contracts.view">
              <button
                className="quick-access-card"
                type="button"
                onClick={() => navigate(APP_ROUTES.contracts)}
              >
                <span className="quick-access-card__icon stat-card__icon--orange">
                  <CheckSquare size={18} />
                </span>
                <div className="quick-access-card__info">
                  <span className="quick-access-card__title">Ver todos los contratos</span>
                  <span className="quick-access-card__desc">Ir al listado completo</span>
                </div>
                <ChevronRight size={14} className="quick-access-card__chevron" />
              </button>
            </Can>
          </div>
        </section>
      </div>

      {/* Bottom grid: activity + deadlines */}
      <div className="dashboard-grid">
        {/* Actividad reciente */}
        <section className="dashboard-section">
          <h2 className="section-title">Actividad reciente</h2>

          {contractsQuery.isLoading ? (
            <div className="loading-state loading-state--sm">
              <div className="spinner" aria-label="Cargando..." />
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="tasks-empty__subtitle" style={{ padding: 'var(--space-4) 0' }}>
              No hay actividad reciente.
            </p>
          ) : (
            <div className="activity-list">
              {recentActivity.map((contract) => (
                <div key={contract.erp_contract_id} className="activity-item">
                  <span className="activity-item__icon stat-card__icon--blue">
                    <FileText size={14} />
                  </span>
                  <div className="activity-item__content">
                    <span className="activity-item__title">{contract.erp_contract_title}</span>
                    <span className="activity-item__subtitle">
                      Proveedor: {contract.contractor?.erp_third_party_name ?? '—'}
                    </span>
                  </div>
                  <span className="activity-item__date">
                    {formatActivityDate(contract.erp_contract_updated_at)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            className="section-link"
            type="button"
            onClick={() => navigate(APP_ROUTES.contracts)}
          >
            Ver toda la actividad
            <ChevronRight size={14} />
          </button>
        </section>

        {/* Próximos vencimientos */}
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="section-title">Próximos vencimientos</h2>
            <button
              className="section-link"
              type="button"
              onClick={() => navigate(APP_ROUTES.contracts)}
            >
              Ver todos
            </button>
          </div>

          {contractsQuery.isLoading ? (
            <div className="loading-state loading-state--sm">
              <div className="spinner" aria-label="Cargando..." />
            </div>
          ) : upcomingDeadlines.length === 0 ? (
            <p className="tasks-empty__subtitle" style={{ padding: 'var(--space-4) 0' }}>
              No hay vencimientos próximos.
            </p>
          ) : (
            <div className="deadline-list">
              {upcomingDeadlines.map((contract) => {
                const badge = getDeadlineBadge(contract.erp_contract_end_date!)
                const days = getDaysUntil(contract.erp_contract_end_date!)
                return (
                  <button
                    key={contract.erp_contract_id}
                    className="deadline-item"
                    type="button"
                    onClick={() => navigate(APP_ROUTES.contractDetail(contract.erp_contract_id))}
                    style={{ cursor: 'pointer', border: '1px solid var(--color-border)', background: 'none', textAlign: 'left', width: '100%' }}
                  >
                    <div className="deadline-badge">
                      <span className="deadline-badge__day">{badge.day}</span>
                      <span className="deadline-badge__month">{badge.month}</span>
                    </div>
                    <div className="deadline-item__content">
                      <span className="deadline-item__title">{contract.erp_contract_title}</span>
                      <span className="deadline-item__subtitle">
                        {contract.contractor?.erp_third_party_name ?? '—'}
                      </span>
                    </div>
                    <span className="deadline-days">Vence en {days} días</span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
