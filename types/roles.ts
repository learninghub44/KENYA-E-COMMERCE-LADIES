export const APP_ROLES = [
  "buyer",
  "seller",
  "moderator",
  "kyc_reviewer",
  "support",
  "admin",
  "super_admin"
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const DATABASE_APP_ROLES = ["buyer", "seller", "moderator", "kyc_reviewer", "admin"] as const;

export type DatabaseAppRole = (typeof DATABASE_APP_ROLES)[number];

export type RoleAssignment = {
  userId: string;
  role: AppRole;
  grantedBy: string;
  grantedAt: string;
};
