export interface ApiSuccessResponse<TData> {
  success: true
  message: string
  data: TData
  meta: unknown
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedData<TData> {
  data: TData[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}
