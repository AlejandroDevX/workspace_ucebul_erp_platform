import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { Avatar, Dropdown } from 'foundation-ui'
import { useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { APP_ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell'

export function ErpTopbar() {
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation()
  const user = useAuthStore((s) => s.user)
  const currentApplication = useAuthStore((s) => s.currentApplication)

  const displayName =
    [user?.name, user?.lastName].filter(Boolean).join(' ').trim() || 'Usuario'
  const appName = currentApplication?.workspace_application_name ?? 'ERP'

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled() {
        navigate(APP_ROUTES.login, { replace: true })
      },
    })
  }

  return (
    <header className="topbar">
      <div className="topbar__main">
        <div className="topbar__heading">
          <span className="topbar__app-name">{appName}</span>
        </div>

        <div className="topbar__actions">
          <NotificationsBell />
          <Dropdown
            items={[
              {
                type: 'label',
                id: 'account-label',
                label: displayName,
              },
              {
                id: 'email',
                label: user?.email ?? '',
                icon: <UserRound size={16} />,
                disabled: true,
                onSelect: () => {},
              },
              {
                type: 'separator',
                id: 'account-separator',
              },
              {
                id: 'logout',
                label: 'Cerrar sesión',
                description: 'Finaliza la sesión actual.',
                icon: <LogOut size={16} />,
                danger: true,
                disabled: logoutMutation.isPending,
                onSelect: handleLogout,
              },
            ]}
            trigger={
              <button
                className="topbar__account-trigger"
                disabled={logoutMutation.isPending}
                type="button"
              >
                <div className="topbar__identity">
                  <Avatar className="topbar__avatar" name={displayName} />
                  <div className="topbar__identity-copy">
                    <strong>{displayName}</strong>
                  </div>
                </div>
                <ChevronDown aria-hidden="true" className="topbar__account-caret" size={18} />
              </button>
            }
          />
        </div>
      </div>
    </header>
  )
}
