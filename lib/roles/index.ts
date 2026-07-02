import type { Permission } from "../../types/permissions";
import type { AppRole } from "../../types/roles";

export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  buyer: [
    "auth.session.read",
    "auth.session.revoke",
    "auth.password.update",
    "auth.email.update",
    "auth.account.deactivate",
    "auth.account.delete",
    "seller.auth.register",
    "order.read.own",
    "message.read.own",
    "message.send",
    "user.read.self"
  ],
  seller: [
    "auth.session.read",
    "auth.session.revoke",
    "auth.password.update",
    "auth.email.update",
    "auth.account.deactivate",
    "seller.profile.read",
    "seller.profile.manage",
    "product.read",
    "product.create",
    "product.update",
    "product.delete",
    "order.read.seller",
    "message.read.own",
    "message.send",
    "user.read.self"
  ],
  moderator: [
    "auth.session.read",
    "auth.session.revoke",
    "auth.password.update",
    "auth.email.update",
    "admin.access",
    "admin.moderate",
    "product.read",
    "user.read.support",
    "security.audit.read"
  ],
  support: [
    "auth.session.read",
    "auth.session.revoke",
    "auth.password.update",
    "auth.email.update",
    "admin.access",
    "admin.support",
    "user.read.support",
    "security.audit.read"
  ],
  admin: [
    "auth.session.read",
    "auth.session.revoke",
    "auth.password.update",
    "auth.email.update",
    "admin.access",
    "admin.moderate",
    "admin.support",
    "admin.role.manage",
    "user.manage",
    "security.audit.read",
    "security.audit.write",
    "security.lockout.manage"
  ],
  super_admin: [
    "auth.session.read",
    "auth.session.revoke",
    "auth.password.update",
    "auth.email.update",
    "auth.account.deactivate",
    "auth.account.delete",
    "admin.access",
    "admin.moderate",
    "admin.support",
    "admin.role.manage",
    "user.manage",
    "security.audit.read",
    "security.audit.write",
    "security.lockout.manage"
  ]
};

export function isAppRole(value: string): value is AppRole {
  return Object.prototype.hasOwnProperty.call(ROLE_PERMISSIONS, value);
}
