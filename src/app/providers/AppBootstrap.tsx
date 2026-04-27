import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { subscribeUnauthorized, subscribeForbidden } from '@/utils/auth-events'
import { router } from '@/routes/router'
import { APP_ROUTES } from '@/routes/paths'

export function AppBootstrap() {
  const initializeSession = useAuthStore((s) => s.initializeSession)
  const clearSession = useAuthStore((s) => s.clearSession)

  useEffect(() => {
    void initializeSession()
  }, [initializeSession])

  useEffect(
    () =>
      subscribeUnauthorized(() => {
        clearSession()
        void router.navigate(APP_ROUTES.login, { replace: true })
      }),
    [clearSession],
  )

  useEffect(
    () =>
      subscribeForbidden(() => {
        void router.navigate(APP_ROUTES.unauthorized, { replace: true })
      }),
    [],
  )

  return null
}
