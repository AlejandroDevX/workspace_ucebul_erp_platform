import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useContractsQuery, useDeleteContractMutation } from '../hooks/useContractsQuery'
import { Can } from '@/components/permissions/Can'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate, formatCurrency } from '@/utils/format'
import { label } from '@/utils/labels'
import type { Contract } from '../types/contract.types'
import type { EntityId } from '@/types/common'

function ContractStatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    active: 'badge--success',
    signed: 'badge--success',
    draft: 'badge--neutral',
    administrative_review: 'badge--warning',
    legal_review: 'badge--warning',
    direction_review: 'badge--warning',
    pending_signature: 'badge--warning',
    closed: 'badge--muted',
    cancelled: 'badge--muted',
  }

  return <span className={`badge ${tones[status] ?? 'badge--neutral'}`}>{label.contractStatus(status)}</span>
}

export function ContractsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<EntityId | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const query = useContractsQuery(search ? { search } : undefined)
  const deleteMutation = useDeleteContractMutation()

  async function handleDelete(id: EntityId) {
    setDeleteError(null)

    try {
      await deleteMutation.mutateAsync(id)
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contratos</h1>
          <p className="page-description">Lista de contratos del ERP.</p>
        </div>
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

      <div className="table-toolbar">
        <input
          className="input"
          placeholder="Buscar contrato..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {query.isLoading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Cargando..." />
          <p>Cargando contratos...</p>
        </div>
      )}

      {query.isError && (
        <div className="error-state">
          <p>{getErrorMessage(query.error)}</p>
        </div>
      )}

      {query.data && query.data.length === 0 && (
        <div className="empty-state">
          <p>No hay contratos registrados.</p>
          <Can permission="erp.contracts.create">
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() => navigate(APP_ROUTES.contractsNew)}
            >
              Crear primero
            </button>
          </Can>
        </div>
      )}

      {query.data && query.data.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Contratista</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Inicio</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {query.data.map((c: Contract) => (
                <tr key={String(c.erp_contract_id)}>
                  <td>{c.erp_contract_title}</td>
                  <td>{c.contractor?.erp_third_party_name ?? '—'}</td>
                  <td>{label.contractType(c.erp_contract_contract_type)}</td>
                  <td>{formatCurrency(c.erp_contract_total_value)}</td>
                  <td>{formatDate(c.erp_contract_start_date)}</td>
                  <td><ContractStatusBadge status={c.erp_contract_status} /></td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn--ghost btn--sm"
                        type="button"
                        title="Ver detalle"
                        onClick={() => navigate(APP_ROUTES.contractDetail(c.erp_contract_id))}
                      >
                        <Eye size={15} />
                      </button>
                      <Can permission="erp.contracts.update">
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          title="Editar"
                          onClick={() => navigate(APP_ROUTES.contractEdit(c.erp_contract_id))}
                        >
                          <Pencil size={15} />
                        </button>
                      </Can>
                      <Can permission="erp.contracts.delete">
                        <button
                          className="btn btn--ghost btn--sm btn--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(c.erp_contract_id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget !== null && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <h2>¿Eliminar contrato?</h2>
            <p>Esta acción no se puede deshacer.</p>
            {deleteError && <p className="confirm-dialog__error">{deleteError}</p>}
            <div className="confirm-dialog__actions">
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
              >
                Cancelar
              </button>
              <button
                className="btn btn--danger"
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => void handleDelete(deleteTarget)}
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
