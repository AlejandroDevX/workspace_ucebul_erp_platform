import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Link, Copy } from 'lucide-react'
import {
  useContractAddendumQuery,
  useMoveAddendumStepMutation,
  useCloseAddendumMutation,
  useRequestAddendumSignatureMutation,
} from '../hooks/useContractAddendumsQuery'
import { Can } from '@/components/permissions/Can'
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel'
import { CommentsPanel } from '@/features/comments/components/CommentsPanel'
import { ProcessActionBar } from '@/components/process/ProcessActionBar'
import { useDocumentsQuery } from '@/features/documents/components/DocumentsPanel'
import { WorkflowStepper } from '@/components/process/WorkflowStepper'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate } from '@/utils/format'
import { label as l } from '@/utils/labels'
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
  const { user, hasPermission } = useAuth()
  const query = useContractAddendumQuery(id ?? '')
  const moveMutation = useMoveAddendumStepMutation(id ?? '')
  const closeMutation = useCloseAddendumMutation(id ?? '')
  const signatureMutation = useRequestAddendumSignatureMutation(id ?? '')
  const documentsQuery = useDocumentsQuery('contract_addendum', id ?? '')

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

  const steps = addendum.process?.workflow?.steps ?? []
  const currentStepSlug = addendum.process?.current_step?.erp_workflow_step_slug
  const activeSignatureRequest = addendum.process?.signature_requests?.find(
    (r) =>
      r.erp_external_signature_request_status === 'pending' ||
      r.erp_external_signature_request_status === 'viewed' ||
      r.erp_external_signature_request_status === 'signed',
  )

  const assignedUserId = addendum.process?.erp_process_assigned_to_workspace_user_id
  const responsibleRole = addendum.process?.erp_process_current_responsible_role_name
  const canAct = assignedUserId
    ? user?.workspace_user_id === assignedUserId
    : Boolean(responsibleRole && user?.applicationRole === responsibleRole)

  const hasDocuments = (documentsQuery.data?.length ?? 0) > 0
  const advanceBlockedReason = currentStepSlug === 'legal_review' && !hasDocuments
    ? 'Debes cargar al menos un documento antes de enviar a Dirección'
    : undefined

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
        </div>
      </div>

      {steps.length > 0 && (
        <div className="detail-card">
          <WorkflowStepper steps={steps} currentStepSlug={currentStepSlug} />
        </div>
      )}

      {canAct && (
        <ProcessActionBar
          steps={steps}
          currentStepSlug={currentStepSlug}
          entityStatus={addendum.erp_contract_addendum_status}
          isPending={moveMutation.isPending || closeMutation.isPending}
          onMoveStep={(payload) => void moveMutation.mutate(payload as Record<string, unknown>)}
          onClose={() => void closeMutation.mutate()}
          onRequestSignature={() => void signatureMutation.mutate(undefined)}
          isRequestingSignature={signatureMutation.isPending}
          hasActiveSignatureRequest={Boolean(activeSignatureRequest)}
          advanceBlockedReason={advanceBlockedReason}
        />
      )}

      <div className="detail-layout">
        <div className="detail-layout__main">
          <div className="detail-card">
            <h2 className="detail-card__section-title">Información general</h2>
            <div className="detail-grid">
              <DetailRow label="Contrato base" value={addendum.contract?.erp_contract_title} />
              <DetailRow label="Tipo" value={l.addendumType(addendum.erp_contract_addendum_type)} />
              <DetailRow label="Estado" value={l.addendumStatus(addendum.erp_contract_addendum_status)} />
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
              canUpload={hasPermission('erp.documents.upload') && user?.applicationRole === 'legal'}
              canDelete={hasPermission('erp.documents.delete') && user?.applicationRole === 'legal'}
            />
          </Can>

          {currentStepSlug === 'contractor_signature' && activeSignatureRequest && (
            <div className="detail-card signature-link-panel">
              <h2 className="detail-card__section-title">
                <Link size={16} />
                Link de firma para el contratista
              </h2>
              <p className="detail-text" style={{ fontSize: '0.85rem', color: 'var(--color-text-soft)' }}>
                Comparte este enlace con <strong>{activeSignatureRequest.erp_external_signature_request_signer_name}</strong> para que firme.
                Estado: <strong>{l.signatureStatus(activeSignatureRequest.erp_external_signature_request_status)}</strong>
              </p>
              <div className="signature-link-row">
                <span className="signature-link-url">
                  {window.location.origin}{APP_ROUTES.sign(activeSignatureRequest.erp_external_signature_request_public_token)}
                </span>
                <button
                  className="btn btn--secondary btn--sm"
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(
                    `${window.location.origin}${APP_ROUTES.sign(activeSignatureRequest.erp_external_signature_request_public_token)}`
                  )}
                >
                  <Copy size={13} />
                  Copiar
                </button>
              </div>
            </div>
          )}

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
