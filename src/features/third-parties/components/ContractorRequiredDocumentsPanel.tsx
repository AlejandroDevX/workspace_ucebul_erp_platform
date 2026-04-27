import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Upload, Trash2, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { thirdPartiesService } from '../api/third-parties.service'
import type { EntityId } from '@/types/common'
import type { ContractorRequiredDocument, ContractorRequiredDocumentsStatus } from '../types/third-party.types'
import { getErrorMessage } from '@/utils/error-message'
import { formatFileSize } from '@/utils/format'

const QUERY_KEY = 'third-parties'
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

interface ContractorRequiredDocumentsPanelProps {
  thirdPartyId: EntityId
  canUpload?: boolean
  canDelete?: boolean
  readonly?: boolean
}

type DocState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'deleting' }
  | { status: 'error'; message: string }

export function ContractorRequiredDocumentsPanel({
  thirdPartyId,
  canUpload = false,
  canDelete = false,
  readonly = false,
}: ContractorRequiredDocumentsPanelProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [docStates, setDocStates] = useState<Record<string, DocState>>({})

  const queryKey = [QUERY_KEY, thirdPartyId, 'required-documents-status']

  const statusQuery = useQuery({
    queryKey,
    queryFn: () => thirdPartiesService.getRequiredDocumentsStatus(thirdPartyId),
    enabled: Boolean(thirdPartyId),
  })

  function setDocState(type: string, state: DocState) {
    setDocStates((prev) => ({ ...prev, [type]: state }))
  }

  function getDocState(type: string): DocState {
    return docStates[type] ?? { status: 'idle' }
  }

  function triggerUpload(documentType: string) {
    setActiveType(documentType)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // reset so the same file can be re-selected

    if (!file || !activeType) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setDocState(activeType, { status: 'error', message: 'Solo se aceptan archivos PDF.' })
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setDocState(activeType, { status: 'error', message: 'El archivo no puede superar 10 MB.' })
      return
    }

    const type = activeType
    setDocState(type, { status: 'uploading' })

    try {
      const result = await thirdPartiesService.uploadRequiredDocument(thirdPartyId, type, file)
      queryClient.setQueryData<ContractorRequiredDocumentsStatus>(queryKey, result.required_documents_status)
      setDocState(type, { status: 'idle' })
    } catch (err) {
      setDocState(type, { status: 'error', message: getErrorMessage(err) })
    }
  }

  async function handleDelete(documentType: string) {
    setDocState(documentType, { status: 'deleting' })

    try {
      const status = await thirdPartiesService.deleteRequiredDocument(thirdPartyId, documentType)
      queryClient.setQueryData<ContractorRequiredDocumentsStatus>(queryKey, status)
      setDocState(documentType, { status: 'idle' })
    } catch (err) {
      setDocState(documentType, { status: 'error', message: getErrorMessage(err) })
    }
  }

  if (statusQuery.isLoading) {
    return (
      <div className="panel">
        <div className="panel__loading">
          <div className="spinner" aria-label="Cargando documentos..." />
        </div>
      </div>
    )
  }

  const status = statusQuery.data
  if (!status) return null

  return (
    <div className="panel">
      {/* Hidden shared file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      <div className="panel__header">
        <h3 className="panel__title">Documentos obligatorios</h3>
        <span className={`required-docs-progress ${status.is_complete ? 'required-docs-progress--complete' : ''}`}>
          {status.loaded_count} / {status.required_count} cargados
        </span>
      </div>

      {!status.is_complete && (
        <div className="contractor-docs-alert">
          <XCircle size={16} aria-hidden="true" />
          <span>Este contratista aún no está listo para contratación. Faltan documentos obligatorios.</span>
        </div>
      )}

      <ul className="required-docs-list">
        {status.required_documents.map((doc) => (
          <RequiredDocumentRow
            key={doc.type}
            doc={doc}
            state={getDocState(doc.type)}
            canUpload={canUpload && !readonly}
            canDelete={canDelete && !readonly}
            onUpload={() => triggerUpload(doc.type)}
            onDelete={() => void handleDelete(doc.type)}
            onDismissError={() => setDocState(doc.type, { status: 'idle' })}
          />
        ))}
      </ul>
    </div>
  )
}

interface RequiredDocumentRowProps {
  doc: ContractorRequiredDocument
  state: DocState
  canUpload: boolean
  canDelete: boolean
  onUpload: () => void
  onDelete: () => void
  onDismissError: () => void
}

function RequiredDocumentRow({
  doc,
  state,
  canUpload,
  canDelete,
  onUpload,
  onDelete,
  onDismissError,
}: RequiredDocumentRowProps) {
  const isBusy = state.status === 'uploading' || state.status === 'deleting'

  return (
    <li className={`required-doc-row ${doc.is_uploaded ? 'required-doc-row--uploaded' : 'required-doc-row--missing'}`}>
      <div className="required-doc-row__main">
        <span className="required-doc-row__icon" aria-hidden="true">
          {isBusy
            ? <Loader2 size={18} className="spinner--inline" />
            : doc.is_uploaded
              ? <CheckCircle size={18} />
              : <XCircle size={18} />}
        </span>

        <div className="required-doc-row__info">
          <span className="required-doc-row__label">{doc.label}</span>

          {doc.is_uploaded && doc.document && (
            <span className="required-doc-row__meta">
              {doc.document.erp_document_name}
              {doc.document.erp_document_file_size != null && (
                <> · {formatFileSize(doc.document.erp_document_file_size)}</>
              )}
            </span>
          )}

          {state.status === 'uploading' && (
            <span className="required-doc-row__meta">Subiendo...</span>
          )}

          {state.status === 'deleting' && (
            <span className="required-doc-row__meta">Eliminando...</span>
          )}
        </div>

        <div className="required-doc-row__actions">
          {doc.is_uploaded && doc.document && (
            <a
              className="btn btn--ghost btn--sm"
              href={doc.document.erp_document_file_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver documento"
            >
              <ExternalLink size={14} aria-hidden="true" />
              Ver
            </a>
          )}

          {doc.is_uploaded && canUpload && !isBusy && (
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              title="Reemplazar"
              onClick={onUpload}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Reemplazar
            </button>
          )}

          {!doc.is_uploaded && canUpload && !isBusy && (
            <button
              className="btn btn--secondary btn--sm"
              type="button"
              onClick={onUpload}
            >
              <Upload size={14} aria-hidden="true" />
              Cargar PDF
            </button>
          )}

          {doc.is_uploaded && canDelete && !isBusy && (
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              title="Eliminar"
              onClick={onDelete}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {state.status === 'error' && (
        <div className="required-doc-row__error">
          {state.message}
          <button className="btn btn--ghost btn--sm" type="button" onClick={onDismissError}>
            Cerrar
          </button>
        </div>
      )}
    </li>
  )
}
