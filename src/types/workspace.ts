import type { EntityId } from './common'
import type { GroupedPermissions } from './permissions'

export type WorkspaceRole = string

export interface WorkspaceUser {
  workspace_user_id: EntityId
  workspace_user_email: string
  workspace_user_name: string
  workspace_user_last_name?: string
}

export interface WorkspaceApplication {
  workspace_application_id: EntityId
  workspace_application_name: string
  workspace_application_slug: string
  workspace_application_description?: string | null
  workspace_application_logo_url?: string | null
  workspace_application_url?: string | null
  workspace_application_is_active?: boolean
}

export interface WorkspaceUserApplication {
  workspace_user_application_id: EntityId
  workspace_user_application_workspace_user_id: EntityId
  workspace_user_application_workspace_application_id: EntityId
  workspace_user_application_is_active: boolean
  workspace_application?: WorkspaceApplication
  permissions_by_module?: GroupedPermissions
}

export interface AuthUser {
  id: EntityId
  workspace_user_id: EntityId
  name: string
  workspace_user_name: string
  lastName?: string
  workspace_user_last_name?: string
  email: string
  workspace_user_email: string
  roles: string[]
  applicationRole?: string
}

export interface AuthSession {
  user: AuthUser
  workspaceRoles: unknown[]
  userApplications: unknown[]
  currentApplication: WorkspaceApplication | null
  currentApplicationAccess: WorkspaceUserApplication | null
  currentApplicationPermissions: GroupedPermissions
}
