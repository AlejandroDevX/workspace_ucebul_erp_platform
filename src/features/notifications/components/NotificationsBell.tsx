import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { useUnreadCountQuery, useNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '../hooks/useNotifications'
import type { ErpNotification } from '../types/notification.types'

function NotificationItem({ notification, onMarkRead }: { notification: ErpNotification; onMarkRead: (id: number) => void }) {
  const isRead = Boolean(notification.erp_notification_read_at)

  return (
    <div className={`notification-item ${isRead ? 'notification-item--read' : 'notification-item--unread'}`}>
      <div className="notification-item__content">
        <p className="notification-item__title">{notification.erp_notification_title}</p>
        {notification.erp_notification_message && (
          <p className="notification-item__message">{notification.erp_notification_message}</p>
        )}
        <p className="notification-item__time">
          {notification.erp_notification_created_at
            ? new Date(notification.erp_notification_created_at).toLocaleString('es-CO', {
                dateStyle: 'short',
                timeStyle: 'short',
              })
            : ''}
        </p>
      </div>
      {!isRead && (
        <button
          className="notification-item__mark-read"
          type="button"
          title="Marcar como leído"
          onClick={() => onMarkRead(notification.erp_notification_id as number)}
        >
          <Check size={14} />
        </button>
      )}
    </div>
  )
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const unreadCountQuery = useUnreadCountQuery()
  const notificationsQuery = useNotificationsQuery()
  const markReadMutation = useMarkReadMutation()
  const markAllReadMutation = useMarkAllReadMutation()

  const unreadCount = unreadCountQuery.data ?? 0
  const notifications = notificationsQuery.data ?? []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleMarkRead(id: number) {
    markReadMutation.mutate(id)
  }

  function handleMarkAllRead() {
    markAllReadMutation.mutate()
  }

  return (
    <div className="notifications-bell">
      <button
        ref={buttonRef}
        className="notifications-bell__trigger"
        type="button"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notifications-bell__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div ref={panelRef} className="notifications-panel">
          <div className="notifications-panel__header">
            <h3 className="notifications-panel__title">Notificaciones</h3>
            <div className="notifications-panel__actions">
              {unreadCount > 0 && (
                <button
                  className="btn btn--ghost btn--xs"
                  type="button"
                  disabled={markAllReadMutation.isPending}
                  onClick={handleMarkAllRead}
                >
                  Marcar todas leídas
                </button>
              )}
              <button
                className="notifications-panel__close"
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notifications-panel__list">
            {notificationsQuery.isLoading ? (
              <div className="notifications-panel__empty">
                <div className="spinner" aria-label="Cargando..." />
              </div>
            ) : notifications.length === 0 ? (
              <div className="notifications-panel__empty">
                <p>No hay notificaciones.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.erp_notification_id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
