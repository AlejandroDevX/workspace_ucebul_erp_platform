import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  })
}

export function useLogoutMutation() {
  const logout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: () => logout(),
  })
}
