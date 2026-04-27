import type { EntityId } from '@/types/common'

export interface Contract {
  erp_contract_id: EntityId
  erp_contract_company_id?: EntityId
  erp_contract_contractor_id: EntityId
  erp_contract_title: string
  erp_contract_object?: string
  erp_contract_contract_type?: string
  erp_contract_start_date?: string
  erp_contract_end_date?: string
  erp_contract_total_value?: number | string
  erp_contract_payment_method?: string
  erp_contract_supervisor_workspace_user_id?: EntityId
  erp_contract_status: string
  erp_contract_created_at?: string
  erp_contract_updated_at?: string
  contractor?: {
    erp_third_party_id: EntityId
    erp_third_party_name: string
  }
}

export type CreateContractDto = Omit<
  Contract,
  'erp_contract_id' | 'erp_contract_created_at' | 'erp_contract_updated_at' | 'contractor' | 'erp_contract_status'
> & { erp_contract_status?: string }

export type UpdateContractDto = Partial<CreateContractDto>

export interface ContractFilters {
  search?: string
  erp_contract_status?: string
  erp_contract_contractor_id?: EntityId
}
