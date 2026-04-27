import type { GroupedPermissions } from '@/types/permissions'

export function groupedPermissionsToFlatSlugs(groupedPermissions?: GroupedPermissions | null): string[] {
  if (!groupedPermissions) return []

  return Object.values(groupedPermissions).flatMap((group) =>
    group.permissions.map((p) => p.workspace_application_permission_slug ?? '').filter(Boolean),
  )
}

export function hasPermission(
  groupedPermissions: GroupedPermissions | null | undefined,
  permissionSlug: string,
) {
  return groupedPermissionsToFlatSlugs(groupedPermissions).includes(permissionSlug)
}

export function hasAnyPermission(
  groupedPermissions: GroupedPermissions | null | undefined,
  permissionSlugs: string[],
) {
  return permissionSlugs.some((slug) => hasPermission(groupedPermissions, slug))
}

export function hasAllPermissions(
  groupedPermissions: GroupedPermissions | null | undefined,
  permissionSlugs: string[],
) {
  return permissionSlugs.every((slug) => hasPermission(groupedPermissions, slug))
}
