import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RHFTextField, RHFSelectField, RHFTextareaField } from 'foundation-ui'
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react'
import { contractSchema, type ContractFormValues } from '../schemas/contract.schema'
import { useContractQuery, useCreateContractMutation, useUpdateContractMutation } from '../hooks/useContractsQuery'
import { useThirdPartiesQuery, useThirdPartyRequiredDocumentsStatusQuery } from '@/features/third-parties/hooks/useThirdPartiesQuery'
import { Can } from '@/components/permissions/Can'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'

const CONTRACT_TYPES = [
  { label: 'Prestación de servicios', value: 'services' },
  { label: 'Suministro', value: 'supply' },
  { label: 'Arrendamiento', value: 'lease' },
  { label: 'Obra', value: 'work' },
  { label: 'Otro', value: 'other' },
]

const PAYMENT_METHODS = [
  { label: 'Mensual', value: 'monthly' },
  { label: 'Quincenal', value: 'biweekly' },
  { label: 'Por entregable', value: 'milestone' },
  { label: 'Único pago', value: 'single' },
]

export function ContractFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [contractorSearch, setContractorSearch] = useState('')

  const query = useContractQuery(id ?? '')
  const createMutation = useCreateContractMutation()
  const updateMutation = useUpdateContractMutation(id ?? '')
  const thirdPartiesQuery = useThirdPartiesQuery(contractorSearch ? { search: contractorSearch } : undefined)

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      erp_contract_contractor_id: '',
      erp_contract_title: '',
      erp_contract_object: '',
      erp_contract_contract_type: '',
      erp_contract_start_date: '',
      erp_contract_end_date: '',
      erp_contract_total_value: '',
      erp_contract_payment_method: '',
      erp_contract_supervisor_workspace_user_id: '',
    },
  })

  useEffect(() => {
    if (isEdit && query.data) {
      form.reset({
        erp_contract_contractor_id: String(query.data.erp_contract_contractor_id ?? ''),
        erp_contract_title: query.data.erp_contract_title ?? '',
        erp_contract_object: query.data.erp_contract_object ?? '',
        erp_contract_contract_type: query.data.erp_contract_contract_type ?? '',
        erp_contract_start_date: query.data.erp_contract_start_date ?? '',
        erp_contract_end_date: query.data.erp_contract_end_date ?? '',
        erp_contract_total_value: String(query.data.erp_contract_total_value ?? ''),
        erp_contract_payment_method: query.data.erp_contract_payment_method ?? '',
        erp_contract_supervisor_workspace_user_id: String(query.data.erp_contract_supervisor_workspace_user_id ?? ''),
      })
    }
  }, [isEdit, query.data, form])

  const selectedContractorId = useWatch({ control: form.control, name: 'erp_contract_contractor_id' })

  const contractorDocsQuery = useThirdPartyRequiredDocumentsStatusQuery(
    selectedContractorId && !isEdit ? selectedContractorId : '',
  )

  const contractorDocsIncomplete =
    !isEdit &&
    Boolean(selectedContractorId) &&
    contractorDocsQuery.data !== undefined &&
    !contractorDocsQuery.data.is_complete

  const missingDocumentLabels =
    contractorDocsQuery.data?.required_documents
      .filter((d) => !d.is_uploaded)
      .map((d) => d.label) ?? []

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error

  const contractorOptions = (thirdPartiesQuery.data ?? []).map((tp) => ({
    label: tp.erp_third_party_name,
    value: String(tp.erp_third_party_id),
  }))

  async function onSubmit(values: ContractFormValues) {
    if (isEdit && id) {
      await updateMutation.mutateAsync(values)
      navigate(APP_ROUTES.contractDetail(id))
    } else {
      const created = await createMutation.mutateAsync(values)
      navigate(APP_ROUTES.contractDetail(created.erp_contract_id))
    }
  }

  if (isEdit && query.isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" aria-label="Cargando..." />
        <p>Cargando contrato...</p>
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
            onClick={() => navigate(APP_ROUTES.contracts)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Contratos
          </button>
          <h1 className="page-title">
            {isEdit ? 'Editar contrato' : 'Nuevo contrato'}
          </h1>
        </div>
      </div>

      <form className="form-card" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className="form-section">
          <legend className="form-section__title">Información del contrato</legend>

          <div className="form-grid">
            <div className="form-field form-grid__full">
              <RHFSelectField
                control={form.control}
                label="Contratista"
                name="erp_contract_contractor_id"
                options={contractorOptions}
                required
              />
              <Can permission="erp.third_parties.create">
                <button
                  className="btn btn--ghost btn--sm"
                  type="button"
                  onClick={() => navigate(APP_ROUTES.thirdPartiesNew)}
                >
                  <Plus size={14} aria-hidden="true" />
                  Crear contratista
                </button>
              </Can>
              <input
                className="input"
                placeholder="Buscar contratista..."
                type="search"
                value={contractorSearch}
                onChange={(e) => setContractorSearch(e.target.value)}
              />
            </div>

            <RHFTextField
              control={form.control}
              label="Título del contrato"
              name="erp_contract_title"
              required
              className="form-grid__full"
            />

            <RHFTextareaField
              control={form.control}
              label="Objeto del contrato"
              name="erp_contract_object"
              rows={4}
              className="form-grid__full"
            />

            <RHFSelectField
              control={form.control}
              label="Tipo de contrato"
              name="erp_contract_contract_type"
              options={CONTRACT_TYPES}
            />

            <RHFSelectField
              control={form.control}
              label="Forma de pago"
              name="erp_contract_payment_method"
              options={PAYMENT_METHODS}
            />

            <RHFTextField
              control={form.control}
              label="Valor total"
              name="erp_contract_total_value"
              type="number"
              min="0"
            />

            <RHFTextField
              control={form.control}
              label="Fecha inicio"
              name="erp_contract_start_date"
              type="date"
            />

            <RHFTextField
              control={form.control}
              label="Fecha fin"
              name="erp_contract_end_date"
              type="date"
            />
          </div>
        </fieldset>

        {contractorDocsIncomplete && (
          <div className="contractor-docs-alert">
            <AlertTriangle size={16} aria-hidden="true" />
            <div>
              <strong>No puedes crear el contrato porque el contratista no tiene todos los documentos obligatorios.</strong>
              {missingDocumentLabels.length > 0 && (
                <ul className="contractor-docs-alert__list">
                  {missingDocumentLabels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {mutationError && (
          <div className="form-error-banner">
            {getErrorMessage(mutationError)}
          </div>
        )}

        <div className="form-actions">
          <button
            className="btn btn--secondary"
            type="button"
            onClick={() => navigate(APP_ROUTES.contracts)}
          >
            Cancelar
          </button>
          <button
            className="btn btn--primary"
            type="submit"
            disabled={isPending || contractorDocsIncomplete}
          >
            {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear contrato'}
          </button>
        </div>
      </form>
    </div>
  )
}
