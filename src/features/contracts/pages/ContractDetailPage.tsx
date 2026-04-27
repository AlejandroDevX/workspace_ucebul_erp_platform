import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, ArrowRight, X } from 'lucide-react'
import { useContractQuery, useMoveContractStepMutation, useCloseContractMutation } from '../hooks/useContractsQuery'
import { Can } from '@/components/permissions/Can'
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel'
import { CommentsPanel } from '@/features/comments/components/CommentsPanel'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate, formatCurrency } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{value ?? '—'}</span>
    </div>
  )
}

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const query = useContractQuery(id ?? '')
  const moveMutation = useMoveContractStepMutation(id ?? '')
  const closeMutation = useCloseContractMutation(id ?? '')

  if (query.isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" aria-label="Cargando..." />
        <p>Cargando contrato...</p>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="error-state">
        <p>{getErrorMessage(query.error)}</p>
        <button className="btn btn--secondary" type="button" onClick={() => navigate(APP_ROUTES.contracts)}>
          Volver
        </button>
      </div>
    )
  }

  const contract = query.data
  if (!contract) return null

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header__nav">
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={() => navigate(APP_ROUTES.contracts)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Contratos
          </button>
          <h1 className="page-title">{contract.erp_contract_title}</h1>
        </div>

        <div className="page-header__actions">
          <Can permission="erp.contracts.update">
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() => navigate(APP_ROUTES.contractEdit(contract.erp_contract_id))}
            >
              <Pencil size={15} aria-hidden="true" />
              Editar
            </button>
          </Can>

          <Can permission="erp.contracts.move_step">
            <button
              className="btn btn--secondary"
              type="button"
              disabled={moveMutation.isPending}
              onClick={() => void moveMutation.mutate()}
            >
              <ArrowRight size={15} aria-hidden="true" />
              {moveMutation.isPending ? 'Moviendo...' : 'Mover paso'}
            </button>
          </Can>

          {hasPermission('erp.contracts.close') && contract.erp_contract_status !== 'closed' && (
            <button
              className="btn btn--danger"
              type="button"
              disabled={closeMutation.isPending}
              onClick={() => void closeMutation.mutate()}
            >
              <X size={15} aria-hidden="true" />
              {closeMutation.isPending ? 'Cerrando...' : 'Cerrar contrato'}
            </button>
          )}
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-layout__main">
          <div className="detail-card">
            <h2 className="detail-card__section-title">Información general</h2>
            <div className="detail-grid">
              <DetailRow label="Contratista" value={contract.contractor?.erp_third_party_name} />
              <DetailRow label="Tipo" value={contract.erp_contract_contract_type} />
              <DetailRow label="Estado" value={contract.erp_contract_status} />
              <DetailRow label="Valor total" value={formatCurrency(contract.erp_contract_total_value)} />
              <DetailRow label="Forma de pago" value={contract.erp_contract_payment_method} />
              <DetailRow label="Fecha inicio" value={formatDate(contract.erp_contract_start_date)} />
              <DetailRow label="Fecha fin" value={formatDate(contract.erp_contract_end_date)} />
            </div>

            {contract.erp_contract_object && (
              <>
                <h2 className="detail-card__section-title">Objeto del contrato</h2>
                <p className="detail-text">{contract.erp_contract_object}</p>
              </>
            )}
          </div>

          <Can permission="erp.documents.view">
            <DocumentsPanel
              referenceType="contract"
              referenceId={id ?? ''}
              canUpload={hasPermission('erp.documents.upload')}
              canDelete={hasPermission('erp.documents.delete')}
            />
          </Can>

          <Can permission="erp.comments.view">
            <CommentsPanel
              referenceType="contract"
              referenceId={id ?? ''}
            />
          </Can>
        </div>
      </div>
    </div>
  )
}
