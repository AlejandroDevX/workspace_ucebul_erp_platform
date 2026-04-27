export type EntityId = number | string

export interface SelectOption<TValue extends string | number = string> {
  label: string
  value: TValue
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}
