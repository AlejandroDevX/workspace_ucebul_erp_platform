import { useQuery } from '@tanstack/react-query'
import { FileText, FilePlus2, CheckSquare, Users, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { erpApi } from '@/services/erpApi'
import { Can } from '@/components/permissions/Can'
import { APP_ROUTES } from '@/routes/paths'
import { useAuth } from '@/hooks/useAuth'

interface DashboardStats {
  activeContracts: number
  contractsInReview: number
  pendingAddendums: number
  pendingApprovals: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [contracts, addendums, approvals] = await Promise.allSettled([
    erpApi.get('/erp/contracts', { params: { per_page: 1 } }),
    erpApi.get('/erp/contract-addendums', { params: { per_page: 1 } }),
    erpApi.get('/erp/approvals', { params: { per_page: 1 } }),
  ])

  const contractsData = contracts.status === 'fulfilled'
    ? (contracts.value.data as { data?: { total?: number } })
    : null
  const addendumsData = addendums.status === 'fulfilled'
    ? (addendums.value.data as { data?: { total?: number } })
    : null
  const approvalsData = approvals.status === 'fulfilled'
    ? (approvals.value.data as { data?: { total?: number } })
    : null

  return {
    activeContracts: contractsData?.data?.total ?? 0,
    contractsInReview: 0,
    pendingAddendums: addendumsData?.data?.total ?? 0,
    pendingApprovals: approvalsData?.data?.total ?? 0,
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, currentApplication } = useAuth()

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    retry: false,
  })

  const displayName = [user?.name, user?.lastName].filter(Boolean).join(' ').trim() || 'Usuario'
  const stats = statsQuery.data

  return (
    <div className="page-content">
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

      <div className="stats-grid">
        <Can permission="erp.contracts.view">
          <article className="stat-card">
            <span className="stat-card__icon stat-card__icon--blue">
              <FileText size={22} />
            </span>
            <div className="stat-card__body">
              <p className="stat-card__label">Contratos activos</p>
              <p className="stat-card__value">
                {statsQuery.isLoading ? '—' : (stats?.activeContracts ?? 0)}
              </p>
            </div>
          </article>
        </Can>

        <Can permission="erp.contracts.view">
          <article className="stat-card">
            <span className="stat-card__icon stat-card__icon--orange">
              <FileText size={22} />
            </span>
            <div className="stat-card__body">
              <p className="stat-card__label">Contratos en revisión</p>
              <p className="stat-card__value">
                {statsQuery.isLoading ? '—' : (stats?.contractsInReview ?? 0)}
              </p>
            </div>
          </article>
        </Can>

        <Can permission="erp.contract_addendums.view">
          <article className="stat-card">
            <span className="stat-card__icon stat-card__icon--green">
              <FilePlus2 size={22} />
            </span>
            <div className="stat-card__body">
              <p className="stat-card__label">Otrosíes pendientes</p>
              <p className="stat-card__value">
                {statsQuery.isLoading ? '—' : (stats?.pendingAddendums ?? 0)}
              </p>
            </div>
          </article>
        </Can>

        <Can permission="erp.approvals.view">
          <article className="stat-card">
            <span className="stat-card__icon stat-card__icon--purple">
              <CheckSquare size={22} />
            </span>
            <div className="stat-card__body">
              <p className="stat-card__label">Aprobaciones pendientes</p>
              <p className="stat-card__value">
                {statsQuery.isLoading ? '—' : (stats?.pendingApprovals ?? 0)}
              </p>
            </div>
          </article>
        </Can>
      </div>

      <div className="quick-access-section">
        <h2 className="section-title">Accesos rápidos</h2>
        <div className="quick-access-grid">
          <Can permission="erp.contracts.create">
            <button
              className="quick-access-card"
              type="button"
              onClick={() => navigate(APP_ROUTES.contractsNew)}
            >
              <FileText size={20} aria-hidden="true" />
              <span>Nuevo contrato</span>
            </button>
          </Can>

          <Can permission="erp.contract_addendums.create">
            <button
              className="quick-access-card"
              type="button"
              onClick={() => navigate(APP_ROUTES.contractAddendumsNew)}
            >
              <FilePlus2 size={20} aria-hidden="true" />
              <span>Nuevo otrosí</span>
            </button>
          </Can>

          <Can permission="erp.third_parties.create">
            <button
              className="quick-access-card"
              type="button"
              onClick={() => navigate(APP_ROUTES.thirdPartiesNew)}
            >
              <Users size={20} aria-hidden="true" />
              <span>Nuevo contratista</span>
            </button>
          </Can>
        </div>
      </div>
    </div>
  )
}
