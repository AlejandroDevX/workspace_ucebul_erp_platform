function trimSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export const env = {
  workspaceApiUrl: trimSlash(import.meta.env.VITE_WORKSPACE_API_URL ?? 'http://localhost:8000/api'),
  erpApiUrl: trimSlash(import.meta.env.VITE_ERP_API_URL ?? 'http://localhost:8001/api'),
  applicationSlug: import.meta.env.VITE_APPLICATION_SLUG ?? 'ucebul-erp',
}
