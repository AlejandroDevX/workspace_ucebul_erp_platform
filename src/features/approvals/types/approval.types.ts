import type { EntityId } from '@/types/common'

export interface Approval {
  erp_approval_id: EntityId
  erp_approval_reference_type?: string
  erp_approval_reference_id?: EntityId
  erp_approval_status: 'pending' | 'approved' | 'rejected'
  erp_approval_comments?: string
  erp_approval_approver_name?: string
  erp_approval_created_at?: string
  erp_approval_updated_at?: string
}

export interface ApprovalActionDto {
  comments?: string
}
