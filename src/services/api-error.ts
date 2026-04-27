import { isAxiosError } from 'axios'

export class ApiError extends Error {
  readonly status?: number
  readonly details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as { message?: string } | undefined
    const message =
      data?.message ||
      error.message ||
      'Ocurrió un error inesperado'

    return new ApiError(message, status, data)
  }

  if (error instanceof Error) {
    return new ApiError(error.message)
  }

  return new ApiError('Ocurrió un error inesperado')
}
