export function formatDate(value?: string | null): string {
  if (!value) return '—'

  try {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function formatCurrency(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') return '—'

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return '—'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(num)
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '—'

  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`

  return `${(kb / 1024).toFixed(1)} MB`
}
