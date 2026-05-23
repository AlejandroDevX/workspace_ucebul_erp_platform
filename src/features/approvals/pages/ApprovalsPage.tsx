import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle } from 'lucide-react'
import { erpApi } from '@/services/erpApi'
import { Can } from '@/components/permissions/Can'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate } from '@/utils/format'
import { label } from '@/utils/labels'
import type { Approval } from '../types/approval.types'
import type { EntityId } from '@/types/common'

const QUERY_KEY = 'approvals'

function useApprovalsQuery() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const response = await erpApi.get('/erp/approvals')
      const data = response.data as { data?: Approval[] | { data?: Approval[] } }

      if (data?.data) {
        if (Array.isArray(data.data)) return data.data
        if (Array.isArray((data.data as { data?: Approval[] }).data)) return (data.data as { data?: Approval[] }).data!
      }

      return [] as Approval[]
    },
  })
}

function ApprovalStatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    pending: 'badge--warning',
    approved: 'badge--success',
    rejected: 'badge--danger',
  }

  return <span className={`badge ${tones[status] ?? 'badge--neutral'}`}>{label.approvalStatus(status)}</span>
}

export function ApprovalsPage() {
  const [actionTarget, setActionTarget] = useState<{ id: EntityId; action: 'approve' | 'reject' } | null>(null)
  const [comments, setComments] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const query = useApprovalsQuery()
  const queryClient = useQueryClient()

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, comments: c }: { id: EntityId; action: 'approve' | 'reject'; comments: string }) => {
      await erpApi.post(`/erp/approvals/${id}/${action}`, { comments: c })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  async function handleAction() {
    if (!actionTarget) return
    setActionError(null)

    try {
      await actionMutation.mutateAsync({ id: actionTarget.id, action: actionTarget.action, comments })
      setActionTarget(null)
      setComments('')
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Aprobaciones</h1>
          <p className="page-description">Gestiona las aprobaciones pendientes.</p>
        </div>
      </div>

      {query.isLoading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Cargando..." />
          <p>Cargando aprobaciones...</p>
        </div>
      )}

      {query.isError && (
        <div className="error-state"><p>{getErrorMessage(query.error)}</p></div>
      )}

      {query.data && query.data.length === 0 && (
        <div className="empty-state"><p>No hay aprobaciones pendientes.</p></div>
      )}

      {query.data && query.data.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Solicitante</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {query.data.map((a: Approval) => (
                <tr key={String(a.erp_approval_id)}>
                  <td>
                    {a.erp_approval_reference_type
                      ? `${a.erp_approval_reference_type} #${String(a.erp_approval_reference_id ?? '')}`
                      : '—'}
                  </td>
                  <td>{a.erp_approval_approver_name ?? '—'}</td>
                  <td><ApprovalStatusBadge status={a.erp_approval_status} /></td>
                  <td>{formatDate(a.erp_approval_created_at)}</td>
                  <td>
                    {a.erp_approval_status === 'pending' && (
                      <div className="table-actions">
                        <Can permission="erp.approvals.approve">
                          <button
                            className="btn btn--ghost btn--sm"
                            type="button"
                            title="Aprobar"
                            onClick={() => setActionTarget({ id: a.erp_approval_id, action: 'approve' })}
                          >
                            <CheckCircle size={15} className="icon--success" />
                          </button>
                        </Can>
                        <Can permission="erp.approvals.reject">
                          <button
                            className="btn btn--ghost btn--sm btn--danger"
                            type="button"
                            title="Rechazar"
                            onClick={() => setActionTarget({ id: a.erp_approval_id, action: 'reject' })}
                          >
                            <XCircle size={15} />
                          </button>
                        </Can>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionTarget && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <h2>
              {actionTarget.action === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
            </h2>
            <p>
              {actionTarget.action === 'approve'
                ? 'Confirma que deseas aprobar esta solicitud.'
                : 'Confirma que deseas rechazar esta solicitud.'}
            </p>
            <textarea
              className="input"
              placeholder="Comentario (opcional)"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            {actionError && <p className="confirm-dialog__error">{actionError}</p>}
            <div className="confirm-dialog__actions">
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => { setActionTarget(null); setComments(''); setActionError(null) }}
              >
                Cancelar
              </button>
              <button
                className={`btn ${actionTarget.action === 'approve' ? 'btn--primary' : 'btn--danger'}`}
                type="button"
                disabled={actionMutation.isPending}
                onClick={() => void handleAction()}
              >
                {actionMutation.isPending
                  ? 'Procesando...'
                  : actionTarget.action === 'approve'
                  ? 'Aprobar'
                  : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
