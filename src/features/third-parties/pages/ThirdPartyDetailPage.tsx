import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useThirdPartyQuery } from '../hooks/useThirdPartiesQuery'
import { ContractorRequiredDocumentsPanel } from '../components/ContractorRequiredDocumentsPanel'
import { Can } from '@/components/permissions/Can'
import { useAuth } from '@/hooks/useAuth'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{value ?? '—'}</span>
    </div>
  )
}

export function ThirdPartyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const query = useThirdPartyQuery(id ?? '')

  if (query.isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" aria-label="Cargando..." />
        <p>Cargando contratista...</p>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="error-state">
        <p>No fue posible cargar el contratista. {getErrorMessage(query.error)}</p>
        <button className="btn btn--secondary" type="button" onClick={() => navigate(APP_ROUTES.thirdParties)}>
          Volver
        </button>
      </div>
    )
  }

  const tp = query.data

  if (!tp) return null

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header__nav">
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={() => navigate(APP_ROUTES.thirdParties)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Contratistas
          </button>
          <h1 className="page-title">{tp.erp_third_party_name}</h1>
        </div>
        <Can permission="erp.third_parties.update">
          <button
            className="btn btn--secondary"
            type="button"
            onClick={() => navigate(APP_ROUTES.thirdPartyEdit(tp.erp_third_party_id))}
          >
            <Pencil size={15} aria-hidden="true" />
            Editar
          </button>
        </Can>
      </div>

      <div className="detail-card">
        <h2 className="detail-card__section-title">Información general</h2>
        <div className="detail-grid">
          <DetailRow label="Tipo" value={tp.erp_third_party_type} />
          <DetailRow label="Nombre" value={tp.erp_third_party_name} />
          <DetailRow label="Tipo documento" value={tp.erp_third_party_document_type} />
          <DetailRow label="Número documento" value={tp.erp_third_party_document_number} />
          <DetailRow label="Correo" value={tp.erp_third_party_email} />
          <DetailRow label="Teléfono" value={tp.erp_third_party_phone} />
          <DetailRow label="Dirección" value={tp.erp_third_party_address} />
          <DetailRow label="Estado" value={tp.erp_third_party_is_active ? 'Activo' : 'Inactivo'} />
        </div>

        {(tp.erp_third_party_bank_name || tp.erp_third_party_bank_account_number) && (
          <>
            <h2 className="detail-card__section-title">Información bancaria</h2>
            <div className="detail-grid">
              <DetailRow label="Banco" value={tp.erp_third_party_bank_name} />
              <DetailRow label="Tipo cuenta" value={tp.erp_third_party_bank_account_type} />
              <DetailRow label="Número cuenta" value={tp.erp_third_party_bank_account_number} />
            </div>
          </>
        )}
      </div>

      <ContractorRequiredDocumentsPanel
        thirdPartyId={tp.erp_third_party_id}
        canUpload={hasPermission('erp.documents.upload')}
        canDelete={hasPermission('erp.documents.delete')}
      />
    </div>
  )
}
