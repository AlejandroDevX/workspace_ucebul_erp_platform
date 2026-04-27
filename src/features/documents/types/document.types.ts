import type { EntityId } from '@/types/common'

export interface ErpDocument {
  erp_document_id: EntityId
  erp_document_reference_type: string
  erp_document_reference_id: EntityId
  erp_document_type?: string
  erp_document_name: string
  erp_document_file_url?: string
  erp_document_file_path?: string
  erp_document_file_mime_type?: string
  erp_document_file_size?: number
  erp_document_created_at?: string
}
