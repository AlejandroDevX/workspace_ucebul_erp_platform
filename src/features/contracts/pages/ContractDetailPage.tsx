import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Link, Copy } from 'lucide-react'
import {
  useContractQuery,
  useMoveContractStepMutation,
  useCloseContractMutation,
  useRequestContractSignatureMutation,
} from '../hooks/useContractsQuery'
import { Can } from '@/components/permissions/Can'
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel'
import { CommentsPanel } from '@/features/comments/components/CommentsPanel'
import { ProcessActionBar } from '@/components/process/ProcessActionBar'
import { useDocumentsQuery } from '@/features/documents/components/DocumentsPanel'
import { WorkflowStepper } from '@/components/process/WorkflowStepper'
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
  const { user, hasPermission } = useAuth()
  const query = useContractQuery(id ?? '')
  const moveMutation = useMoveContractStepMutation(id ?? '')
  const closeMutation = useCloseContractMutation(id ?? '')
  const signatureMutation = useRequestContractSignatureMutation(id ?? '')
  const documentsQuery = useDocumentsQuery('contract', id ?? '')

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

  const steps = contract.process?.workflow?.steps ?? []
  const currentStepSlug = contract.process?.current_step?.erp_workflow_step_slug
  const activeSignatureRequest = contract.process?.signatureRequests?.find(
    (r) => r.erp_external_signature_request_status === 'pending' ||
      r.erp_external_signature_request_status === 'viewed',
  )

  const assignedUserId = contract.process?.erp_process_assigned_to_workspace_user_id
  const responsibleRole = contract.process?.erp_process_current_responsible_role_name
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
          entityStatus={contract.erp_contract_status}
          isPending={moveMutation.isPending || closeMutation.isPending}
          onMoveStep={(payload) => void moveMutation.mutate(payload as Record<string, unknown>)}
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
                Comparte este enlace con <strong>{activeSignatureRequest.erp_external_signature_request_signer_name}</strong> para que firme el contrato.
                Estado: <strong>{activeSignatureRequest.erp_external_signature_request_status}</strong>
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
              referenceType="contract"
              referenceId={id ?? ''}
            />
          </Can>
        </div>
      </div>
    </div>
  )
}
