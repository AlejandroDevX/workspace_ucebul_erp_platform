import { erpApi } from '@/services/erpApi'
import type { ErpNotification } from '../types/notification.types'
import type { EntityId } from '@/types/common'

export const notificationsService = {
  async list(unreadOnly = false): Promise<ErpNotification[]> {
    const response = await erpApi.get('/erp/notifications', {
      params: unreadOnly ? { unread_only: 1 } : {},
    })
    return response.data.data ?? response.data
  },

  async unreadCount(): Promise<number> {
    const response = await erpApi.get('/erp/notifications/unread-count')
    return (response.data.data ?? response.data).count ?? 0
  },

  async markRead(id: EntityId): Promise<void> {
    await erpApi.post(`/erp/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await erpApi.post('/erp/notifications/read-all')
  },
}
