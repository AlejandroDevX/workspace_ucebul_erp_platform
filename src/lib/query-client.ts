import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/services/api-error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      retry(failureCount, error) {
        if (error instanceof ApiError && error.status && error.status < 500) {
          return false
        }

        return failureCount < 1
      },
    },
    mutations: {
      retry: false,
    },
  },
})
