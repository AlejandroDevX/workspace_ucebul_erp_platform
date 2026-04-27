export interface PermissionEntry {
  workspace_application_permission_id?: EntityId
  workspace_application_permission_name?: string
  workspace_application_permission_slug?: string
  workspace_application_permission_description?: string | null
}

export interface PermissionGroup {
  module_name: string
  module_slug: string | null
  permissions: PermissionEntry[]
}

export type GroupedPermissions = Record<string, PermissionGroup>

import type { EntityId } from './common'
