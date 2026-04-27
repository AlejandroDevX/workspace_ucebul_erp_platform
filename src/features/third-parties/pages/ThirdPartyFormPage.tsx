import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RHFTextField, RHFSelectField } from 'foundation-ui'
import { ArrowLeft } from 'lucide-react'
import { thirdPartySchema, type ThirdPartyFormValues } from '../schemas/third-party.schema'
import { useThirdPartyQuery, useCreateThirdPartyMutation, useUpdateThirdPartyMutation } from '../hooks/useThirdPartiesQuery'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'

const THIRD_PARTY_TYPES = [
  { label: 'Contratista', value: 'contractor' },
  { label: 'Proveedor', value: 'supplier' },
  { label: 'Cliente', value: 'customer' },
  { label: 'Otro', value: 'other' },
]

const DOCUMENT_TYPES = [
  { label: 'Cédula de ciudadanía', value: 'CC' },
  { label: 'NIT', value: 'NIT' },
  { label: 'Pasaporte', value: 'PASSPORT' },
  { label: 'Cédula extranjería', value: 'CE' },
]

const BANK_ACCOUNT_TYPES = [
  { label: 'Cuenta corriente', value: 'checking' },
  { label: 'Cuenta de ahorros', value: 'savings' },
]

export function ThirdPartyFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const query = useThirdPartyQuery(id ?? '')
  const createMutation = useCreateThirdPartyMutation()
  const updateMutation = useUpdateThirdPartyMutation(id ?? '')

  const form = useForm<ThirdPartyFormValues>({
    resolver: zodResolver(thirdPartySchema),
    defaultValues: {
      erp_third_party_type: '',
      erp_third_party_name: '',
      erp_third_party_document_type: '',
      erp_third_party_document_number: '',
      erp_third_party_email: '',
      erp_third_party_phone: '',
      erp_third_party_address: '',
      erp_third_party_bank_name: '',
      erp_third_party_bank_account_type: '',
      erp_third_party_bank_account_number: '',
      erp_third_party_is_active: true,
    },
  })

  useEffect(() => {
    if (isEdit && query.data) {
      form.reset({
        erp_third_party_type: query.data.erp_third_party_type ?? '',
        erp_third_party_name: query.data.erp_third_party_name ?? '',
        erp_third_party_document_type: query.data.erp_third_party_document_type ?? '',
        erp_third_party_document_number: query.data.erp_third_party_document_number ?? '',
        erp_third_party_email: query.data.erp_third_party_email ?? '',
        erp_third_party_phone: query.data.erp_third_party_phone ?? '',
        erp_third_party_address: query.data.erp_third_party_address ?? '',
        erp_third_party_bank_name: query.data.erp_third_party_bank_name ?? '',
        erp_third_party_bank_account_type: query.data.erp_third_party_bank_account_type ?? '',
        erp_third_party_bank_account_number: query.data.erp_third_party_bank_account_number ?? '',
        erp_third_party_is_active: query.data.erp_third_party_is_active ?? true,
      })
    }
  }, [isEdit, query.data, form])

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error

  async function onSubmit(values: ThirdPartyFormValues) {
    if (isEdit && id) {
      await updateMutation.mutateAsync(values)
      navigate(APP_ROUTES.thirdPartyDetail(id))
    } else {
      const created = await createMutation.mutateAsync(values)
      navigate(APP_ROUTES.thirdPartyDetail(created.erp_third_party_id))
    }
  }

  if (isEdit && query.isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" aria-label="Cargando..." />
        <p>Cargando contratista...</p>
      </div>
    )
  }

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
          <h1 className="page-title">
            {isEdit ? 'Editar contratista' : 'Nuevo contratista'}
          </h1>
        </div>
      </div>

      <form className="form-card" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className="form-section">
          <legend className="form-section__title">Información básica</legend>

          <div className="form-grid">
            <RHFSelectField
              control={form.control}
              label="Tipo de contratista"
              name="erp_third_party_type"
              options={THIRD_PARTY_TYPES}
              required
            />
            <RHFTextField
              control={form.control}
              label="Nombre completo o razón social"
              name="erp_third_party_name"
              required
            />
            <RHFSelectField
              control={form.control}
              label="Tipo de documento"
              name="erp_third_party_document_type"
              options={DOCUMENT_TYPES}
            />
            <RHFTextField
              control={form.control}
              label="Número de documento"
              name="erp_third_party_document_number"
            />
            <RHFTextField
              autoComplete="email"
              control={form.control}
              label="Correo electrónico"
              name="erp_third_party_email"
              type="email"
            />
            <RHFTextField
              control={form.control}
              label="Teléfono"
              name="erp_third_party_phone"
            />
            <RHFTextField
              control={form.control}
              label="Dirección"
              name="erp_third_party_address"
              className="form-grid__full"
            />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend className="form-section__title">Información bancaria</legend>

          <div className="form-grid">
            <RHFTextField
              control={form.control}
              label="Banco"
              name="erp_third_party_bank_name"
            />
            <RHFSelectField
              control={form.control}
              label="Tipo de cuenta"
              name="erp_third_party_bank_account_type"
              options={BANK_ACCOUNT_TYPES}
            />
            <RHFTextField
              control={form.control}
              label="Número de cuenta"
              name="erp_third_party_bank_account_number"
            />
          </div>
        </fieldset>

        {mutationError && (
          <div className="form-error-banner">
            {getErrorMessage(mutationError)}
          </div>
        )}

        <div className="form-actions">
          <button
            className="btn btn--secondary"
            type="button"
            onClick={() => navigate(APP_ROUTES.thirdParties)}
          >
            Cancelar
          </button>
          <button
            className="btn btn--primary"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear contratista'}
          </button>
        </div>
      </form>
    </div>
  )
}
