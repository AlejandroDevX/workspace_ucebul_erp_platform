import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, ArrowRight, X } from 'lucide-react'
import {
  useContractAddendumQuery,
  useMoveAddendumStepMutation,
  useCloseAddendumMutation,
} from '../hooks/useContractAddendumsQuery'
import { Can } from '@/components/permissions/Can'
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel'
import { CommentsPanel } from '@/features/comments/components/CommentsPanel'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{value ?? '—'}</span>
    </div>
  )
}

export function ContractAddendumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const query = useContractAddendumQuery(id ?? '')
  const moveMutation = useMoveAddendumStepMutation(id ?? '')
  const closeMutation = useCloseAddendumMutation(id ?? '')

  if (query.isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" aria-label="Cargando..." />
        <p>Cargando otrosí...</p>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="error-state">
        <p>{getErrorMessage(query.error)}</p>
        <button className="btn btn--secondary" type="button" onClick={() => navigate(APP_ROUTES.contractAddendums)}>
          Volver
        </button>
      </div>
    )
  }

  const addendum = query.data
  if (!addendum) return null

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header__nav">
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={() => navigate(APP_ROUTES.contractAddendums)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Otrosíes
          </button>
          <h1 className="page-title">{addendum.erp_contract_addendum_title}</h1>
        </div>

        <div className="page-header__actions">
          <Can permission="erp.contract_addendums.update">
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() => navigate(APP_ROUTES.contractAddendumEdit(addendum.erp_contract_addendum_id))}
            >
              <Pencil size={15} aria-hidden="true" />
              Editar
            </button>
          </Can>

          <Can permission="erp.contract_addendums.move_step">
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

          {hasPermission('erp.contract_addendums.close') && addendum.erp_contract_addendum_status !== 'closed' && (
            <button
              className="btn btn--danger"
              type="button"
              disabled={closeMutation.isPending}
              onClick={() => void closeMutation.mutate()}
            >
              <X size={15} aria-hidden="true" />
              {closeMutation.isPending ? 'Cerrando...' : 'Cerrar otrosí'}
            </button>
          )}
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-layout__main">
          <div className="detail-card">
            <h2 className="detail-card__section-title">Información general</h2>
            <div className="detail-grid">
              <DetailRow label="Contrato base" value={addendum.contract?.erp_contract_title} />
              <DetailRow label="Tipo" value={addendum.erp_contract_addendum_type} />
              <DetailRow label="Estado" value={addendum.erp_contract_addendum_status} />
              <DetailRow label="Vigencia" value={formatDate(addendum.erp_contract_addendum_effective_date)} />
            </div>

            <h2 className="detail-card__section-title">Cambio</h2>
            <div className="addendum-change-compare">
              <div className="addendum-change-compare__col">
                <p className="addendum-change-compare__label">Valor anterior</p>
                <p className="addendum-change-compare__value">{addendum.erp_contract_addendum_previous_value ?? '—'}</p>
              </div>
              <div className="addendum-change-compare__col addendum-change-compare__col--new">
                <p className="addendum-change-compare__label">Valor nuevo</p>
                <p className="addendum-change-compare__value">{addendum.erp_contract_addendum_new_value ?? '—'}</p>
              </div>
            </div>

            {addendum.erp_contract_addendum_description && (
              <>
                <h2 className="detail-card__section-title">Descripción</h2>
                <p className="detail-text">{addendum.erp_contract_addendum_description}</p>
              </>
            )}
          </div>

          <Can permission="erp.documents.view">
            <DocumentsPanel
              referenceType="contract_addendum"
              referenceId={id ?? ''}
              canUpload={hasPermission('erp.documents.upload')}
              canDelete={hasPermission('erp.documents.delete')}
            />
          </Can>

          <Can permission="erp.comments.view">
            <CommentsPanel
              referenceType="contract_addendum"
              referenceId={id ?? ''}
            />
          </Can>
        </div>
      </div>
    </div>
  )
}
