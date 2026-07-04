export const PERMISSIONS = [
  "auth.session.read",
  "auth.session.revoke",
  "auth.password.update",
  "auth.email.update",
  "auth.account.deactivate",
  "auth.account.delete",
  "seller.auth.register",
  "seller.profile.read",
  "seller.profile.manage",
  "product.read",
  "product.create",
  "product.update",
  "product.delete",
  "order.read.own",
  "order.read.seller",
  "order.manage",
  "message.read.own",
  "message.send",
  "user.read.self",
  "user.read.support",
  "user.manage",
  "admin.access",
  "admin.moderate",
  "admin.support",
  "admin.role.manage",
  "kyc.review",
  "security.audit.read",
  "security.audit.write",
  "security.lockout.manage",
  "notification.read.own",
  "notification.preferences.manage",
  "notification.broadcast.manage"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type PermissionCheck = {
  userId: string;
  roles: readonly string[];
  required: Permission | readonly Permission[];
};
