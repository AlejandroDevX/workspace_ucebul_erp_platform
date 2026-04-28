import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '../api/notifications.service'
import type { EntityId } from '@/types/common'

const QUERY_KEY = 'notifications'

export function useNotificationsQuery(unreadOnly = false) {
  return useQuery({
    queryKey: [QUERY_KEY, { unreadOnly }],
    queryFn: () => notificationsService.list(unreadOnly),
    refetchInterval: 30_000,
  })
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: [QUERY_KEY, 'unread-count'],
    queryFn: notificationsService.unreadCount,
    refetchInterval: 30_000,
  })
}

export function useMarkReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: EntityId) => notificationsService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
