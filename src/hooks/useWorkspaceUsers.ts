import { useQuery } from '@tanstack/react-query'
import { erpApi } from '@/services/erpApi'

export interface WorkspaceUser {
  workspace_user_id: number
  workspace_user_name: string
  workspace_user_last_name: string
  workspace_user_email: string
  workspace_application_role_slug: string
}

export function useWorkspaceUsersByRole(role: string | undefined) {
  return useQuery({
    queryKey: ['workspace-users', role],
    queryFn: async (): Promise<WorkspaceUser[]> => {
      const response = await erpApi.get('/erp/workspace-users', {
        params: role ? { role } : {},
      })
      return response.data.data ?? response.data
    },
    enabled: Boolean(role),
    staleTime: 60_000,
  })
}
