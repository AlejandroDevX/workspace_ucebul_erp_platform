import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RHFTextField, RHFSelectField, RHFTextareaField } from 'foundation-ui'
import { ArrowLeft } from 'lucide-react'
import { contractAddendumSchema, type ContractAddendumFormValues } from '../schemas/contract-addendum.schema'
import {
  useContractAddendumQuery,
  useCreateContractAddendumMutation,
  useUpdateContractAddendumMutation,
} from '../hooks/useContractAddendumsQuery'
import { useContractsQuery } from '@/features/contracts/hooks/useContractsQuery'
import { ADDENDUM_TYPES } from '../types/contract-addendum.types'
import { APP_ROUTES } from '@/routes/paths'
import { getErrorMessage } from '@/utils/error-message'

export function ContractAddendumFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const query = useContractAddendumQuery(id ?? '')
  const createMutation = useCreateContractAddendumMutation()
  const updateMutation = useUpdateContractAddendumMutation(id ?? '')
  const contractsQuery = useContractsQuery()

  const form = useForm<ContractAddendumFormValues>({
    resolver: zodResolver(contractAddendumSchema),
    defaultValues: {
      erp_contract_addendum_contract_id: '',
      erp_contract_addendum_type: '',
      erp_contract_addendum_title: '',
      erp_contract_addendum_description: '',
      erp_contract_addendum_previous_value: '',
      erp_contract_addendum_new_value: '',
      erp_contract_addendum_effective_date: '',
    },
  })

  useEffect(() => {
    if (isEdit && query.data) {
      const a = query.data

      form.reset({
        erp_contract_addendum_contract_id: String(a.erp_contract_addendum_contract_id ?? ''),
        erp_contract_addendum_type: a.erp_contract_addendum_type ?? '',
        erp_contract_addendum_title: a.erp_contract_addendum_title ?? '',
        erp_contract_addendum_description: a.erp_contract_addendum_description ?? '',
        erp_contract_addendum_previous_value: a.erp_contract_addendum_previous_value ?? '',
        erp_contract_addendum_new_value: a.erp_contract_addendum_new_value ?? '',
        erp_contract_addendum_effective_date: a.erp_contract_addendum_effective_date ?? '',
      })
    }
  }, [isEdit, query.data, form])

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error

  const contractOptions = (contractsQuery.data ?? []).map((c) => ({
    label: c.erp_contract_title,
    value: String(c.erp_contract_id),
  }))

  async function onSubmit(values: ContractAddendumFormValues) {
    if (isEdit && id) {
      await updateMutation.mutateAsync(values)
      navigate(APP_ROUTES.contractAddendumDetail(id))
    } else {
      const created = await createMutation.mutateAsync(values)
      navigate(APP_ROUTES.contractAddendumDetail(created.erp_contract_addendum_id))
    }
  }

  if (isEdit && query.isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner" aria-label="Cargando..." />
        <p>Cargando otrosí...</p>
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
            onClick={() => navigate(APP_ROUTES.contractAddendums)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Otrosíes
          </button>
          <h1 className="page-title">{isEdit ? 'Editar otrosí' : 'Nuevo otrosí'}</h1>
        </div>
      </div>

      <form className="form-card" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className="form-section">
          <legend className="form-section__title">Información del otrosí</legend>

          <div className="form-grid">
            <RHFSelectField
              control={form.control}
              label="Contrato base"
              name="erp_contract_addendum_contract_id"
              options={contractOptions}
              required
              className="form-grid__full"
            />

            <RHFSelectField
              control={form.control}
              label="Tipo de otrosí"
              name="erp_contract_addendum_type"
              options={[...ADDENDUM_TYPES]}
              required
            />

            <RHFTextField
              control={form.control}
              label="Fecha de vigencia"
              name="erp_contract_addendum_effective_date"
              type="date"
            />

            <RHFTextField
              control={form.control}
              label="Título"
              name="erp_contract_addendum_title"
              required
              className="form-grid__full"
            />

            <RHFTextareaField
              control={form.control}
              label="Descripción del cambio"
              name="erp_contract_addendum_description"
              rows={3}
              className="form-grid__full"
            />

            <RHFTextField
              control={form.control}
              label="Valor anterior"
              name="erp_contract_addendum_previous_value"
            />

            <RHFTextField
              control={form.control}
              label="Valor nuevo"
              name="erp_contract_addendum_new_value"
            />
          </div>
        </fieldset>

        {mutationError && (
          <div className="form-error-banner">{getErrorMessage(mutationError)}</div>
        )}

        <div className="form-actions">
          <button
            className="btn btn--secondary"
            type="button"
            onClick={() => navigate(APP_ROUTES.contractAddendums)}
          >
            Cancelar
          </button>
          <button
            className="btn btn--primary"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear otrosí'}
          </button>
        </div>
      </form>
    </div>
  )
}
