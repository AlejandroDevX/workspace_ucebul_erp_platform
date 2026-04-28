import type { EntityId } from '@/types/common'

export interface WorkflowStep {
  erp_workflow_step_id: EntityId
  erp_workflow_step_slug: string
  erp_workflow_step_name: string
  erp_workflow_step_order: number
  erp_workflow_step_is_final?: boolean
  erp_workflow_step_requires_external_signature?: boolean
  erp_workflow_step_responsible_role_name?: string
}

export interface ContractProcess {
  erp_process_id: EntityId
  erp_process_status: string
  erp_process_assigned_to_workspace_user_id?: EntityId | null
  erp_process_current_responsible_role_name?: string | null
  current_step?: { erp_workflow_step_slug: string; erp_workflow_step_name: string }
  workflow?: { steps?: WorkflowStep[] }
  documents?: Array<{ erp_document_id: EntityId }>
  signatureRequests?: Array<{
    erp_external_signature_request_id: EntityId
    erp_external_signature_request_status: string
    erp_external_signature_request_public_token: string
    erp_external_signature_request_signer_name?: string
    erp_external_signature_request_expires_at?: string
  }>
}

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
  process?: ContractProcess
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
