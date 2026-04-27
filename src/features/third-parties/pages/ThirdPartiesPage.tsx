import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { useThirdPartiesQuery, useDeleteThirdPartyMutation } from '../hooks/useThirdPartiesQuery'
import { Can } from '@/components/permissions/Can'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'
import type { ThirdParty } from '../types/third-party.types'
import type { EntityId } from '@/types/common'

function ThirdPartyTypeBadge({ type }: { type: string }) {
  return <span className="badge badge--neutral">{type}</span>
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`badge ${active ? 'badge--success' : 'badge--muted'}`}>
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

export function ThirdPartiesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<EntityId | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const query = useThirdPartiesQuery(search ? { search } : undefined)
  const deleteMutation = useDeleteThirdPartyMutation()

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
          <h1 className="page-title">Contratistas</h1>
          <p className="page-description">Gestiona los terceros y contratistas del ERP.</p>
        </div>
        <Can permission="erp.third_parties.create">
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => navigate(APP_ROUTES.thirdPartiesNew)}
          >
            <Plus size={16} aria-hidden="true" />
            Nuevo contratista
          </button>
        </Can>
      </div>

      <div className="table-toolbar">
        <input
          className="input"
          placeholder="Buscar contratista..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {query.isLoading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Cargando..." />
          <p>Cargando contratistas...</p>
        </div>
      )}

      {query.isError && (
        <div className="error-state">
          <p>No fue posible cargar los contratistas. {getErrorMessage(query.error)}</p>
        </div>
      )}

      {query.data && query.data.length === 0 && (
        <div className="empty-state">
          <p>No hay contratistas registrados.</p>
          <Can permission="erp.third_parties.create">
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() => navigate(APP_ROUTES.thirdPartiesNew)}
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
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Correo</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {query.data.map((tp: ThirdParty) => (
                <tr key={String(tp.erp_third_party_id)}>
                  <td>{tp.erp_third_party_name}</td>
                  <td><ThirdPartyTypeBadge type={tp.erp_third_party_type} /></td>
                  <td>
                    {tp.erp_third_party_document_type
                      ? `${tp.erp_third_party_document_type}: ${tp.erp_third_party_document_number ?? '—'}`
                      : '—'}
                  </td>
                  <td>{tp.erp_third_party_email ?? '—'}</td>
                  <td><StatusBadge active={tp.erp_third_party_is_active} /></td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn--ghost btn--sm"
                        type="button"
                        title="Ver detalle"
                        onClick={() => navigate(APP_ROUTES.thirdPartyDetail(tp.erp_third_party_id))}
                      >
                        <Eye size={15} />
                      </button>
                      <Can permission="erp.third_parties.update">
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          title="Editar"
                          onClick={() => navigate(APP_ROUTES.thirdPartyEdit(tp.erp_third_party_id))}
                        >
                          <Pencil size={15} />
                        </button>
                      </Can>
                      <Can permission="erp.third_parties.delete">
                        <button
                          className="btn btn--ghost btn--sm btn--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(tp.erp_third_party_id)}
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
            <h2>¿Eliminar contratista?</h2>
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
