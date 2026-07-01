import type { Permission } from "../../types/permissions.js";
import type { AppRole } from "../../types/roles.js";
import { isAppRole, ROLE_PERMISSIONS } from "../roles/index.js";

export function permissionsForRoles(roles: readonly AppRole[]): Set<Permission> {
  const permissions = new Set<Permission>();

  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role]) {
      permissions.add(permission);
    }
  }

  return permissions;
}

export function normalizeRoles(roles: readonly string[]): AppRole[] {
  return roles.filter(isAppRole);
}

export function hasPermission(roles: readonly AppRole[], required: Permission): boolean {
  return permissionsForRoles(roles).has(required);
}

export function hasEveryPermission(
  roles: readonly AppRole[],
  required: readonly Permission[]
): boolean {
  const permissions = permissionsForRoles(roles);
  return required.every((permission) => permissions.has(permission));
}

export function assertPermission(
  roles: readonly AppRole[],
  required: Permission | readonly Permission[]
): void {
  const allowed = typeof required === "string"
    ? hasPermission(roles, required)
    : hasEveryPermission(roles, required);

  if (!allowed) {
    throw new Error("AUTHORIZATION_DENIED");
  }
}
