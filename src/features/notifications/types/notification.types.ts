import type { EntityId } from '@/types/common'

export interface ErpNotification {
  erp_notification_id: EntityId
  erp_notification_workspace_user_id?: EntityId
  erp_notification_target_role_name?: string
  erp_notification_process_id?: EntityId
  erp_notification_reference_type?: string
  erp_notification_reference_id?: EntityId
  erp_notification_type: string
  erp_notification_title: string
  erp_notification_message?: string
  erp_notification_action_url?: string
  erp_notification_metadata?: Record<string, unknown>
  erp_notification_read_at?: string | null
  erp_notification_created_at?: string
}
