import type { ApiError } from '@/services/api-error'

const UNAUTHORIZED_EVENT = 'ucebul:erp:unauthorized'
const FORBIDDEN_EVENT = 'ucebul:erp:forbidden'

export function emitUnauthorized() {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
}

export function emitForbidden(error: ApiError) {
  window.dispatchEvent(new CustomEvent<ApiError>(FORBIDDEN_EVENT, { detail: error }))
}

export function subscribeUnauthorized(listener: () => void) {
  window.addEventListener(UNAUTHORIZED_EVENT, listener)

  return () => window.removeEventListener(UNAUTHORIZED_EVENT, listener)
}

export function subscribeForbidden(listener: (event: CustomEvent<ApiError>) => void) {
  const handler = listener as EventListener
  window.addEventListener(FORBIDDEN_EVENT, handler)

  return () => window.removeEventListener(FORBIDDEN_EVENT, handler)
}
