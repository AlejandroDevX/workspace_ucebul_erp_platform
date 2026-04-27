import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { erpApi } from '@/services/erpApi'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate, formatFileSize } from '@/utils/format'
import type { ErpDocument } from '../types/document.types'
import type { EntityId } from '@/types/common'
import type { ApiSuccessResponse } from '@/types/api'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

interface DocumentsPanelProps {
  referenceType: string
  referenceId: EntityId
  canUpload: boolean
  canDelete: boolean
}

type UploadEntry = { name: string; status: 'uploading' | 'error'; message?: string }

function useDocumentsQuery(referenceType: string, referenceId: EntityId) {
  return useQuery({
    queryKey: ['documents', referenceType, referenceId],
    queryFn: async () => {
      const res = await erpApi.get<ApiSuccessResponse<ErpDocument[]>>('/erp/documents', {
        params: { erp_document_reference_type: referenceType, erp_document_reference_id: referenceId },
      })
      return res.data.data ?? []
    },
    enabled: Boolean(referenceId),
  })
}

export function DocumentsPanel({ referenceType, referenceId, canUpload, canDelete }: DocumentsPanelProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<Record<string, UploadEntry>>({})
  const [deleteTarget, setDeleteTarget] = useState<EntityId | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const query = useDocumentsQuery(referenceType, referenceId)
  const queryKey = ['documents', referenceType, referenceId]

  function removeUpload(key: string) {
    setUploads((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return

    await Promise.all(
      files.map(async (file) => {
        const key = `${file.name}-${Date.now()}-${Math.random()}`

        if (file.size > MAX_FILE_SIZE_BYTES) {
          setUploads((prev) => ({ ...prev, [key]: { name: file.name, status: 'error', message: 'El archivo no puede superar 10 MB.' } }))
          return
        }

        setUploads((prev) => ({ ...prev, [key]: { name: file.name, status: 'uploading' } }))

        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('erp_document_reference_type', referenceType)
          formData.append('erp_document_reference_id', String(referenceId))

          await erpApi.post('/erp/documents', formData, {
            headers: { 'Content-Type': undefined },
          })

          await queryClient.invalidateQueries({ queryKey })
          removeUpload(key)
        } catch (err) {
          setUploads((prev) => ({ ...prev, [key]: { name: file.name, status: 'error', message: getErrorMessage(err) } }))
        }
      }),
    )
  }

  async function handleDelete(id: EntityId) {
    setIsDeleting(true)
    try {
      await erpApi.delete(`/erp/documents/${id}`)
      await queryClient.invalidateQueries({ queryKey })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const uploadEntries = Object.entries(uploads)

  return (
    <section className="panel">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        style={{ display: 'none' }}
        onChange={handleFilesSelected}
      />

      <div className="panel__header">
        <h2 className="panel__title">Documentos</h2>
        {canUpload && (
          <button
            className="btn btn--secondary btn--sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={14} aria-hidden="true" />
            Agregar PDF
          </button>
        )}
      </div>

      {query.isLoading && (
        <div className="panel__loading">
          <div className="spinner spinner--sm" aria-label="Cargando..." />
        </div>
      )}

      {!query.isLoading && !query.data?.length && !uploadEntries.length && (
        <p className="panel__empty">Sin documentos adjuntos.</p>
      )}

      {(query.data?.length || uploadEntries.length) ? (
        <ul className="document-list">
          {query.data?.map((doc: ErpDocument) => (
            <li key={String(doc.erp_document_id)} className="document-item">
              <span className="document-item__icon">
                <FileText size={16} />
              </span>
              <div className="document-item__info">
                <p className="document-item__name">{doc.erp_document_name}</p>
                <p className="document-item__meta">
                  {doc.erp_document_file_size != null && <span>{formatFileSize(doc.erp_document_file_size)}</span>}
                  {doc.erp_document_created_at && <span>{formatDate(doc.erp_document_created_at)}</span>}
                </p>
              </div>
              <div className="document-item__actions">
                {doc.erp_document_file_url && (
                  <a
                    className="btn btn--ghost btn--sm"
                    href={doc.erp_document_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir documento"
                  >
                    <ExternalLink size={14} />
                    Ver
                  </a>
                )}
                {canDelete && (
                  <button
                    className="btn btn--ghost btn--sm btn--danger"
                    type="button"
                    title="Eliminar"
                    onClick={() => setDeleteTarget(doc.erp_document_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}

          {uploadEntries.map(([key, entry]) => (
            <li key={key} className="document-item">
              <span className="document-item__icon">
                {entry.status === 'uploading'
                  ? <Loader2 size={16} className="spinner--inline" />
                  : <FileText size={16} />}
              </span>
              <div className="document-item__info">
                <p className="document-item__name">{entry.name}</p>
                {entry.status === 'uploading' && (
                  <p className="document-item__meta">Subiendo...</p>
                )}
                {entry.status === 'error' && (
                  <p className="document-item__meta" style={{ color: 'var(--color-danger)' }}>
                    {entry.message}
                  </p>
                )}
              </div>
              {entry.status === 'error' && (
                <div className="document-item__actions">
                  <button className="btn btn--ghost btn--sm" type="button" onClick={() => removeUpload(key)}>
                    Cerrar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {deleteTarget !== null && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <h2>¿Eliminar documento?</h2>
            <p>Esta acción no se puede deshacer.</p>
            <div className="confirm-dialog__actions">
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn--danger"
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDelete(deleteTarget)}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
