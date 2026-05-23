import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, FileText, Check, ChevronRight, Link, Copy } from 'lucide-react'
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
import { label } from '@/utils/labels'
import { useAuth } from '@/hooks/useAuth'

const CONTRACT_STATUS_TONE: Record<string, string> = {
  draft: 'badge--neutral',
  active: 'badge--success',
  administrative_review: 'badge--warning',
  legal_review: 'badge--warning',
  direction_review: 'badge--warning',
  pending_signature: 'badge--warning',
  signed: 'badge--success',
  closed: 'badge--success',
  cancelled: 'badge--danger',
}

const EVENT_SUBTITLE: Record<string, string> = {
  created: 'Proceso iniciado',
  updated: 'Información actualizada',
  status_changed: 'Etapa completada',
  document_uploaded: 'Documento adjunto',
  approval_resolved: 'Aprobación registrada',
}

function DetailRow({ label: lbl, value }: { label: string; value?: string | null }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{lbl}</span>
      <span className="detail-row__value">{value ?? '—'}</span>
    </div>
  )
}

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, hasPermission } = useAuth()
  const [showAllHistory, setShowAllHistory] = useState(false)

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
  const activeSignatureRequest = contract.process?.signature_requests?.find(
    (r) =>
      r.erp_external_signature_request_status === 'pending' ||
      r.erp_external_signature_request_status === 'viewed' ||
      r.erp_external_signature_request_status === 'signed',
  )

  const assignedUserId = contract.process?.erp_process_assigned_to_workspace_user_id
  const responsibleRole = contract.process?.erp_process_current_responsible_role_name
  const canAct = assignedUserId
    ? user?.workspace_user_id === assignedUserId
    : Boolean(responsibleRole && user?.applicationRole === responsibleRole)

  const hasDocuments = (documentsQuery.data?.length ?? 0) > 0
  const advanceBlockedReason =
    currentStepSlug === 'legal_review' && !hasDocuments
      ? 'Debes cargar al menos un documento antes de enviar a Dirección'
      : undefined

  const allEvents = [...(contract.process?.events ?? [])].reverse()
  const visibleEvents = showAllHistory ? allEvents : allEvents.slice(0, 3)

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
          <p className="page-description">Detalle del contrato y seguimiento del flujo de aprobación.</p>
        </div>

        <div className="page-header__actions">
          {hasDocuments && (
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() =>
                document.getElementById('documents-panel')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <FileText size={15} aria-hidden="true" />
              Ver documento
            </button>
          )}
          <Can permission="erp.contracts.update">
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => navigate(APP_ROUTES.contractEdit(contract.erp_contract_id))}
            >
              <Pencil size={15} aria-hidden="true" />
              Editar contrato
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
          onClose={() => void closeMutation.mutate()}
          onRequestSignature={() => void signatureMutation.mutate(undefined)}
          isRequestingSignature={signatureMutation.isPending}
          hasActiveSignatureRequest={Boolean(activeSignatureRequest)}
          advanceBlockedReason={advanceBlockedReason}
        />
      )}

      {currentStepSlug === 'contractor_signature' && activeSignatureRequest && (
        <div className="detail-card signature-link-panel">
          <h2 className="detail-card__section-title">
            <Link size={16} />
            Link de firma para el contratista
          </h2>
          <p className="detail-text" style={{ fontSize: '0.85rem', color: 'var(--color-text-soft)' }}>
            Comparte este enlace con{' '}
            <strong>{activeSignatureRequest.erp_external_signature_request_signer_name}</strong> para que firme el
            contrato. Estado:{' '}
            <strong>{label.signatureStatus(activeSignatureRequest.erp_external_signature_request_status)}</strong>
          </p>
          <div className="signature-link-row">
            <span className="signature-link-url">
              {window.location.origin}
              {APP_ROUTES.sign(activeSignatureRequest.erp_external_signature_request_public_token)}
            </span>
            <button
              className="btn btn--secondary btn--sm"
              type="button"
              onClick={() =>
                void navigator.clipboard.writeText(
                  `${window.location.origin}${APP_ROUTES.sign(activeSignatureRequest.erp_external_signature_request_public_token)}`,
                )
              }
            >
              <Copy size={13} />
              Copiar
            </button>
          </div>
        </div>
      )}

      <div className="detail-layout detail-layout--with-sidebar">
        <div className="detail-layout__main">
          <div className="detail-card">
            <h2 className="detail-card__section-title">Resumen del contrato</h2>
            <div className="detail-grid">
              <DetailRow label="Contratista" value={contract.contractor?.erp_third_party_name} />
              <DetailRow label="Tipo" value={label.contractType(contract.erp_contract_contract_type)} />
              <DetailRow label="Fecha inicio" value={formatDate(contract.erp_contract_start_date)} />
              <DetailRow label="Fecha fin" value={formatDate(contract.erp_contract_end_date)} />
            </div>
            <div className="detail-grid">
              <div className="detail-row">
                <span className="detail-row__label">Estado</span>
                <span className={`badge ${CONTRACT_STATUS_TONE[contract.erp_contract_status] ?? 'badge--neutral'}`}>
                  {label.contractStatus(contract.erp_contract_status)}
                </span>
              </div>
              <DetailRow label="Valor total" value={formatCurrency(contract.erp_contract_total_value)} />
              <DetailRow label="Forma de pago" value={label.paymentMethod(contract.erp_contract_payment_method)} />
            </div>
          </div>

          {contract.erp_contract_object && (
            <div className="detail-card">
              <h2 className="detail-card__section-title">Objeto del contrato</h2>
              <p className="detail-text">{contract.erp_contract_object}</p>
            </div>
          )}

          <Can permission="erp.documents.view">
            <div id="documents-panel">
              <DocumentsPanel
                referenceType="contract"
                referenceId={id ?? ''}
                canUpload={hasPermission('erp.documents.upload') && user?.applicationRole === 'legal'}
                canDelete={hasPermission('erp.documents.delete') && user?.applicationRole === 'legal'}
              />
            </div>
          </Can>

          <Can permission="erp.comments.view">
            <CommentsPanel referenceType="contract" referenceId={id ?? ''} />
          </Can>
        </div>

        <div className="detail-layout__sidebar">
          {allEvents.length > 0 && (
            <div className="detail-card">
              <h2 className="detail-card__section-title">Actividad reciente</h2>
              <div>
                {visibleEvents.map((event) => {
                  const d = event.erp_process_event_created_at
                    ? new Date(event.erp_process_event_created_at)
                    : null
                  return (
                    <div key={String(event.erp_process_event_id)} className="activity-item">
                      <div className="activity-item__icon">
                        <Check size={13} />
                      </div>
                      <div className="activity-item__body">
                        <p className="activity-item__title">{label.eventTitle(event.erp_process_event_title)}</p>
                        <p className="activity-item__sub">
                          {EVENT_SUBTITLE[event.erp_process_event_type] ?? ''}
                        </p>
                      </div>
                      {d && (
                        <div className="activity-item__time">
                          <span className="activity-item__date">
                            {d.toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="activity-item__date">
                            {d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {allEvents.length > 3 && (
                <button
                  className="activity-footer"
                  type="button"
                  onClick={() => setShowAllHistory((prev) => !prev)}
                >
                  {showAllHistory ? 'Mostrar menos' : 'Ver todo el historial'}
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
