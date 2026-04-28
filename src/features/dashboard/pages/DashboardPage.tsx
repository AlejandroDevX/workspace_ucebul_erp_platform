import { FileText, FilePlus2, CheckSquare, Users, Plus, ArrowRight, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Can } from '@/components/permissions/Can'
import { APP_ROUTES } from '@/routes/paths'
import { useAuth } from '@/hooks/useAuth'
import { useMyContractsQuery } from '@/features/contracts/hooks/useContractsQuery'
import { useMyAddendumsQuery } from '@/features/contract-addendums/hooks/useContractAddendumsQuery'
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

function StepBadge({ slug }: { slug?: string }) {
  if (!slug) return null
  return (
    <span className="task-step-badge">
      {STEP_LABEL[slug] ?? slug}
    </span>
  )
}

function ContractTaskRow({ contract, onClick }: { contract: Contract; onClick: () => void }) {
  const stepSlug = contract.process?.currentStep?.erp_workflow_step_slug
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
  const stepSlug = addendum.process?.currentStep?.erp_workflow_step_slug
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

  const displayName = [user?.name, user?.lastName].filter(Boolean).join(' ').trim() || 'Usuario'

  const myContracts = (myContractsQuery.data ?? []) as Contract[]
  const myAddendums = (myAddendumsQuery.data ?? []) as ContractAddendum[]
  const totalTasks = myContracts.length + myAddendums.length
  const isLoadingTasks = myContractsQuery.isLoading || myAddendumsQuery.isLoading

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

      <section className="my-tasks-section">
        <div className="my-tasks-section__header">
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
          <p className="empty-tasks-text">No tienes tareas asignadas actualmente.</p>
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

          <Can permission="erp.contracts.view">
            <button
              className="quick-access-card"
              type="button"
              onClick={() => navigate(APP_ROUTES.contracts)}
            >
              <CheckSquare size={20} aria-hidden="true" />
              <span>Ver todos los contratos</span>
            </button>
          </Can>
        </div>
      </div>
    </div>
  )
}
