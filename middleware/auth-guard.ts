import type { Permission } from "../types/permissions";
import type { AppRole } from "../types/roles";
import { hasEveryPermission, hasPermission } from "../lib/permissions/index";

export type RouteAuthLevel = "public" | "authenticated" | "seller" | "admin";

export type GuardInput = {
  authLevel: RouteAuthLevel;
  roles: readonly AppRole[];
  permissions?: Permission | readonly Permission[];
};

export type GuardResult =
  | { allowed: true }
  | { allowed: false; status: 401 | 403; code: "SESSION_REQUIRED" | "AUTHORIZATION_DENIED" };

export function authorizeRoute(input: GuardInput): GuardResult {
  if (input.authLevel === "public") return { allowed: true };

  if (input.roles.length === 0) {
    return { allowed: false, status: 401, code: "SESSION_REQUIRED" };
  }

  if (input.authLevel === "seller" && !input.roles.includes("seller")) {
    return { allowed: false, status: 403, code: "AUTHORIZATION_DENIED" };
  }

  if (input.authLevel === "admin" && !hasPermission(input.roles, "admin.access")) {
    return { allowed: false, status: 403, code: "AUTHORIZATION_DENIED" };
  }

  if (!input.permissions) return { allowed: true };

  const allowed = typeof input.permissions === "string"
    ? hasPermission(input.roles, input.permissions)
    : hasEveryPermission(input.roles, input.permissions);

  return allowed ? { allowed: true } : { allowed: false, status: 403, code: "AUTHORIZATION_DENIED" };
}
