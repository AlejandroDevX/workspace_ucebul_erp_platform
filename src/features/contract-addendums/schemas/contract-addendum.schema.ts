import { z } from 'zod'

export const contractAddendumSchema = z.object({
  erp_contract_addendum_contract_id: z.string().min(1, 'Selecciona un contrato base'),
  erp_contract_addendum_type: z.string().min(1, 'El tipo es requerido'),
  erp_contract_addendum_title: z.string().min(1, 'El título es requerido'),
  erp_contract_addendum_description: z.string().optional(),
  erp_contract_addendum_previous_value: z.string().optional(),
  erp_contract_addendum_new_value: z.string().optional(),
  erp_contract_addendum_effective_date: z.string().optional(),
})

export type ContractAddendumFormValues = z.infer<typeof contractAddendumSchema>
