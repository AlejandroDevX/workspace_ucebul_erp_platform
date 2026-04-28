import { useState } from 'react'
import { ArrowRight, ArrowLeft, Send, CheckCircle, UserCheck } from 'lucide-react'
import { useWorkspaceUsersByRole } from '@/hooks/useWorkspaceUsers'
import type { WorkspaceUser } from '@/hooks/useWorkspaceUsers'

interface WorkflowStep {
  erp_workflow_step_id: number | string
  erp_workflow_step_slug: string
  erp_workflow_step_name: string
  erp_workflow_step_order: number
  erp_workflow_step_is_final?: boolean
  erp_workflow_step_requires_external_signature?: boolean
  erp_workflow_step_responsible_role_name?: string
}

interface MoveStepPayload {
  erp_workflow_step_slug?: string
  erp_process_assigned_to_workspace_user_id?: number
}

interface ProcessActionBarProps {
  steps: WorkflowStep[]
  currentStepSlug: string | undefined
  entityStatus: string
  isPending: boolean
  onMoveStep: (payload: MoveStepPayload) => void
  onRequestSignature?: () => void
  isRequestingSignature?: boolean
  hasActiveSignatureRequest?: boolean
  advanceBlockedReason?: string
}

const STEP_CONFIG: Record<string, {
  forwardLabel: string
  backLabel?: string
  backSlug?: string
  targetRole?: string
}> = {
  coordinator_creation: {
    forwardLabel: 'Enviar a Revisión Administrativa',
    targetRole: 'administrative',
  },
  administrative_review: {
    forwardLabel: 'Enviar a Revisión Jurídica',
    backLabel: 'Devolver a Coordinador',
    backSlug: 'coordinator_creation',
    targetRole: 'legal',
  },
  legal_review: {
    forwardLabel: 'Enviar a Dirección',
    backLabel: 'Devolver a Administrativo',
    backSlug: 'administrative_review',
    targetRole: 'administrative_financial_direction',
  },
  direction_approval: {
    forwardLabel: 'Aprobar y enviar a firma',
    backLabel: 'Devolver a Jurídica',
    backSlug: 'legal_review',
    targetRole: 'coordinator',
  },
  contractor_signature: {
    forwardLabel: 'Contrato firmado — Cerrar',
    backLabel: 'Devolver a Dirección',
    backSlug: 'direction_approval',
    targetRole: 'coordinator',
  },
  coordinator_close: {
    forwardLabel: 'Finalizar',
    backLabel: 'Devolver a Coordinador (firma)',
    backSlug: 'contractor_signature',
  },
}

function AssignUserModal({
  role,
  onSelect,
  onClose,
}: {
  role: string
  onSelect: (user: WorkspaceUser | null) => void
  onClose: () => void
}) {
  const { data: users = [], isLoading } = useWorkspaceUsersByRole(role)
  const [selected, setSelected] = useState<WorkspaceUser | null>(null)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Asignar responsable</h2>
          <button className="modal__close" type="button" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <p className="modal__description">
            Selecciona el usuario que recibirá este proceso. Si no seleccionas ninguno, quedará sin asignar.
          </p>
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner" aria-label="Cargando..." />
            </div>
          ) : users.length === 0 ? (
            <p className="detail-text">No hay usuarios con este rol.</p>
          ) : (
            <div className="assign-user-list">
              {users.map((user) => (
                <label key={user.workspace_user_id} className={`assign-user-option ${selected?.workspace_user_id === user.workspace_user_id ? 'assign-user-option--selected' : ''}`}>
                  <input
                    type="radio"
                    name="assignee"
                    value={user.workspace_user_id}
                    checked={selected?.workspace_user_id === user.workspace_user_id}
                    onChange={() => setSelected(user)}
                  />
                  <div className="assign-user-option__info">
                    <span className="assign-user-option__name">
                      {user.workspace_user_name} {user.workspace_user_last_name}
                    </span>
                    <span className="assign-user-option__email">{user.workspace_user_email}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" type="button" onClick={() => onSelect(null)}>
            Sin asignar
          </button>
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => onSelect(selected)}
          >
            <UserCheck size={15} />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProcessActionBar({
  steps,
  currentStepSlug,
  entityStatus,
  isPending,
  onMoveStep,
  onRequestSignature,
  isRequestingSignature,
  hasActiveSignatureRequest,
  advanceBlockedReason,
}: ProcessActionBarProps) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<MoveStepPayload | null>(null)

  if (entityStatus === 'closed' || entityStatus === 'cancelled') {
    return null
  }

  const config = currentStepSlug ? STEP_CONFIG[currentStepSlug] : undefined
  if (!config) return null

  const currentStep = steps.find((s) => s.erp_workflow_step_slug === currentStepSlug)
  const isSignatureStep = currentStep?.erp_workflow_step_requires_external_signature === true ||
    currentStepSlug === 'contractor_signature'

  function handleForwardClick() {
    const targetRole = config?.targetRole
    if (targetRole) {
      setPendingPayload({})
      setShowAssignModal(true)
    } else {
      onMoveStep({})
    }
  }

  function handleBackClick(backSlug: string) {
    onMoveStep({ erp_workflow_step_slug: backSlug })
  }

  function handleAssignSelect(user: WorkspaceUser | null) {
    setShowAssignModal(false)
    if (pendingPayload !== null) {
      onMoveStep({
        ...pendingPayload,
        erp_process_assigned_to_workspace_user_id: user?.workspace_user_id,
      })
      setPendingPayload(null)
    }
  }

  return (
    <>
      <div className="process-action-bar">
        <div className="process-action-bar__context">
          <span className="process-action-bar__step-label">Paso actual</span>
          <span className="process-action-bar__step-name">
            {currentStep?.erp_workflow_step_name ?? currentStepSlug}
          </span>
        </div>

        <div className="process-action-bar__actions">
        {config.backLabel && config.backSlug && (
          <button
            className="btn btn--outline-danger btn--sm"
            type="button"
            disabled={isPending}
            onClick={() => handleBackClick(config.backSlug!)}
          >
            <ArrowLeft size={14} />
            {config.backLabel}
          </button>
        )}

        {isSignatureStep && onRequestSignature ? (
          <>
            <button
              className="btn btn--secondary"
              type="button"
              disabled={isRequestingSignature || isPending}
              onClick={onRequestSignature}
            >
              <Send size={14} />
              {isRequestingSignature ? 'Enviando...' : hasActiveSignatureRequest ? 'Reenviar solicitud de firma' : 'Solicitar firma al contratista'}
            </button>
            {hasActiveSignatureRequest && (
              <button
                className="btn btn--primary"
                type="button"
                disabled={isPending}
                onClick={handleForwardClick}
              >
                <CheckCircle size={14} />
                {isPending ? 'Procesando...' : 'Contrato firmado — Avanzar'}
              </button>
            )}
          </>
        ) : (
          <button
            className="btn btn--primary"
            type="button"
            disabled={isPending || Boolean(advanceBlockedReason)}
            title={advanceBlockedReason}
            onClick={handleForwardClick}
          >
            <ArrowRight size={14} />
            {isPending ? 'Procesando...' : config.forwardLabel}
          </button>
        )}
        </div>
      </div>

      {showAssignModal && config?.targetRole && (
        <AssignUserModal
          role={config.targetRole}
          onSelect={handleAssignSelect}
          onClose={() => {
            setShowAssignModal(false)
            setPendingPayload(null)
          }}
        />
      )}
    </>
  )
}
