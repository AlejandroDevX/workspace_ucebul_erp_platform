import { z } from 'zod'

export const thirdPartySchema = z.object({
  erp_third_party_type: z.string().min(1, 'El tipo es requerido'),
  erp_third_party_name: z.string().min(1, 'El nombre es requerido'),
  erp_third_party_document_type: z.string().optional(),
  erp_third_party_document_number: z.string().optional(),
  erp_third_party_email: z.string().email('Correo inválido').optional().or(z.literal('')),
  erp_third_party_phone: z.string().optional(),
  erp_third_party_address: z.string().optional(),
  erp_third_party_bank_name: z.string().optional(),
  erp_third_party_bank_account_type: z.string().optional(),
  erp_third_party_bank_account_number: z.string().optional(),
  erp_third_party_is_active: z.boolean(),
})

export type ThirdPartyFormValues = z.infer<typeof thirdPartySchema>
