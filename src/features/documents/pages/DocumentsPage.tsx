import { useQuery } from '@tanstack/react-query'
import { FileText, ExternalLink } from 'lucide-react'
import { erpApi } from '@/services/erpApi'
import { getErrorMessage } from '@/utils/error-message'
import { formatDate, formatFileSize } from '@/utils/format'
import type { ErpDocument } from '../types/document.types'

export function DocumentsPage() {
  const query = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await erpApi.get('/erp/documents')
      const data = response.data as { data?: ErpDocument[] | { data?: ErpDocument[] } }

      if (data?.data) {
        if (Array.isArray(data.data)) return data.data
        if (Array.isArray((data.data as { data?: ErpDocument[] }).data)) return (data.data as { data?: ErpDocument[] }).data!
      }

      return [] as ErpDocument[]
    },
  })

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documentos</h1>
          <p className="page-description">Todos los documentos adjuntos en el ERP.</p>
        </div>
      </div>

      {query.isLoading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Cargando..." />
          <p>Cargando documentos...</p>
        </div>
      )}

      {query.isError && (
        <div className="error-state"><p>{getErrorMessage(query.error)}</p></div>
      )}

      {query.data && query.data.length === 0 && (
        <div className="empty-state">
          <p>No hay documentos registrados.</p>
        </div>
      )}

      {query.data && query.data.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Referencia</th>
                <th>Tamaño</th>
                <th>Fecha</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {query.data.map((doc: ErpDocument) => (
                <tr key={String(doc.erp_document_id)}>
                  <td>
                    <span className="table-icon-cell">
                      <FileText size={15} aria-hidden="true" />
                      {doc.erp_document_name}
                    </span>
                  </td>
                  <td>{doc.erp_document_type ?? '—'}</td>
                  <td>{doc.erp_document_reference_type} #{String(doc.erp_document_reference_id)}</td>
                  <td>{formatFileSize(doc.erp_document_file_size)}</td>
                  <td>{formatDate(doc.erp_document_created_at)}</td>
                  <td>
                    {doc.erp_document_file_url && (
                      <a
                        className="btn btn--ghost btn--sm"
                        href={doc.erp_document_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
