import { z } from 'zod'

export const contractSchema = z.object({
  erp_contract_contractor_id: z.string().min(1, 'Selecciona un contratista'),
  erp_contract_title: z.string().min(1, 'El título es requerido'),
  erp_contract_object: z.string().optional(),
  erp_contract_contract_type: z.string().optional(),
  erp_contract_start_date: z.string().optional(),
  erp_contract_end_date: z.string().optional(),
  erp_contract_total_value: z.string().optional(),
  erp_contract_payment_method: z.string().optional(),
  erp_contract_supervisor_workspace_user_id: z.string().optional(),
})

export type ContractFormValues = z.infer<typeof contractSchema>
