import type { EntityId } from '@/types/common'

export interface ThirdParty {
  erp_third_party_id: EntityId
  erp_third_party_type: string
  erp_third_party_name: string
  erp_third_party_document_type?: string
  erp_third_party_document_number?: string
  erp_third_party_email?: string
  erp_third_party_phone?: string
  erp_third_party_address?: string
  erp_third_party_bank_name?: string
  erp_third_party_bank_account_type?: string
  erp_third_party_bank_account_number?: string
  erp_third_party_is_active: boolean
  erp_third_party_created_at?: string
  erp_third_party_updated_at?: string
}

export type CreateThirdPartyDto = Omit<ThirdParty, 'erp_third_party_id' | 'erp_third_party_created_at' | 'erp_third_party_updated_at'>
export type UpdateThirdPartyDto = Partial<CreateThirdPartyDto>

export interface ThirdPartyFilters {
  search?: string
  erp_third_party_type?: string
  erp_third_party_is_active?: boolean
}

export interface ContractorRequiredDocument {
  type: string
  label: string
  is_uploaded: boolean
  document: {
    erp_document_id: EntityId
    erp_document_name: string
    erp_document_file_url: string
    erp_document_type: string
    erp_document_file_mime_type?: string
    erp_document_file_size?: number
  } | null
}

export interface ContractorRequiredDocumentsStatus {
  third_party_id: EntityId
  is_complete: boolean
  loaded_count: number
  required_count: number
  required_documents: ContractorRequiredDocument[]
}
