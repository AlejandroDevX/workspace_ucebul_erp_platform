import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useContractAddendumsQuery, useDeleteContractAddendumMutation } from '../hooks/useContractAddendumsQuery'
import { Can } from '@/components/permissions/Can'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate } from '@/utils/format'
import type { ContractAddendum } from '../types/contract-addendum.types'
import type { EntityId } from '@/types/common'

export function ContractAddendumsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<EntityId | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const query = useContractAddendumsQuery(search ? { search } : undefined)
  const deleteMutation = useDeleteContractAddendumMutation()

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
          <h1 className="page-title">Otrosíes</h1>
          <p className="page-description">Adendas y modificaciones a contratos existentes.</p>
        </div>
        <Can permission="erp.contract_addendums.create">
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => navigate(APP_ROUTES.contractAddendumsNew)}
          >
            <Plus size={16} aria-hidden="true" />
            Nuevo otrosí
          </button>
        </Can>
      </div>

      <div className="table-toolbar">
        <input
          className="input"
          placeholder="Buscar otrosí..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {query.isLoading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Cargando..." />
          <p>Cargando otrosíes...</p>
        </div>
      )}

      {query.isError && (
        <div className="error-state"><p>{getErrorMessage(query.error)}</p></div>
      )}

      {query.data && query.data.length === 0 && (
        <div className="empty-state">
          <p>No hay otrosíes registrados.</p>
          <Can permission="erp.contract_addendums.create">
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() => navigate(APP_ROUTES.contractAddendumsNew)}
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
                <th>Contrato</th>
                <th>Tipo</th>
                <th>Vigencia</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {query.data.map((a: ContractAddendum) => (
                <tr key={String(a.erp_contract_addendum_id)}>
                  <td>{a.erp_contract_addendum_title}</td>
                  <td>{a.contract?.erp_contract_title ?? '—'}</td>
                  <td><span className="badge badge--neutral">{a.erp_contract_addendum_type}</span></td>
                  <td>{formatDate(a.erp_contract_addendum_effective_date)}</td>
                  <td><span className="badge badge--neutral">{a.erp_contract_addendum_status}</span></td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn--ghost btn--sm"
                        type="button"
                        title="Ver detalle"
                        onClick={() => navigate(APP_ROUTES.contractAddendumDetail(a.erp_contract_addendum_id))}
                      >
                        <Eye size={15} />
                      </button>
                      <Can permission="erp.contract_addendums.update">
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          title="Editar"
                          onClick={() => navigate(APP_ROUTES.contractAddendumEdit(a.erp_contract_addendum_id))}
                        >
                          <Pencil size={15} />
                        </button>
                      </Can>
                      <Can permission="erp.contract_addendums.delete">
                        <button
                          className="btn btn--ghost btn--sm btn--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(a.erp_contract_addendum_id)}
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
            <h2>¿Eliminar otrosí?</h2>
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
