import type { EntityId } from '@/types/common'

export interface ErpComment {
  erp_comment_id: EntityId
  erp_comment_reference_type: string
  erp_comment_reference_id: EntityId
  erp_comment_body: string
  erp_comment_author_name?: string
  erp_comment_created_at?: string
}

export type CreateCommentDto = Omit<ErpComment, 'erp_comment_id' | 'erp_comment_created_at'>
