import type { EntityId } from '@/types/common'
import type { ContractProcess } from '@/features/contracts/types/contract.types'

export const ADDENDUM_TYPES = [
  { label: 'Fecha', value: 'date' },
  { label: 'Cargo', value: 'position' },
  { label: 'Funciones', value: 'functions' },
  { label: 'Valor', value: 'value' },
  { label: 'Forma de pago', value: 'payment_method' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Otro', value: 'other' },
] as const

export interface ContractAddendum {
  erp_contract_addendum_id: EntityId
  erp_contract_addendum_contract_id: EntityId
  erp_contract_addendum_type: string
  erp_contract_addendum_title: string
  erp_contract_addendum_description?: string
  erp_contract_addendum_previous_value?: string
  erp_contract_addendum_new_value?: string
  erp_contract_addendum_effective_date?: string
  erp_contract_addendum_status: string
  erp_contract_addendum_created_at?: string
  erp_contract_addendum_updated_at?: string
  contract?: {
    erp_contract_id: EntityId
    erp_contract_title: string
  }
  process?: ContractProcess
}

export type CreateContractAddendumDto = Omit<
  ContractAddendum,
  'erp_contract_addendum_id' | 'erp_contract_addendum_created_at' | 'erp_contract_addendum_updated_at' | 'contract' | 'erp_contract_addendum_status'
> & { erp_contract_addendum_status?: string }

export type UpdateContractAddendumDto = Partial<CreateContractAddendumDto>
