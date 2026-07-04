import type { AppRole } from "../../types/roles";

// Where a user lands after signing in, when no explicit redirectTo is given.
// Checked in priority order: staff-type roles go to /admin, sellers go to
// their Seller Hub, everyone else (buyers) goes to the storefront home.
const ADMIN_AREA_ROLES: readonly AppRole[] = [
  "super_admin",
  "admin",
  "moderator",
  "kyc_reviewer",
  "support",
];

/**
 * Only accept a same-origin, relative redirect target. Rejects anything that
 * could send the user off-site (protocol-relative "//evil.com", absolute
 * URLs, backslash tricks, etc.) so a crafted redirectTo query param can't be
 * used for an open-redirect / phishing hop after a real login.
 */
export function sanitizeRedirectTarget(rawTarget: string | null | undefined): string | null {
  if (!rawTarget) return null;
  if (!rawTarget.startsWith("/")) return null;
  if (rawTarget.startsWith("//")) return null;
  if (rawTarget.includes("\\")) return null;
  return rawTarget;
}

export function resolvePostLoginPath(roles: readonly AppRole[], redirectTo?: string | null): string {
  const safeRedirect = sanitizeRedirectTarget(redirectTo);
  if (safeRedirect) return safeRedirect;

  if (roles.some((role) => ADMIN_AREA_ROLES.includes(role))) return "/admin";
  if (roles.includes("seller")) return "/seller";
  return "/";
}
