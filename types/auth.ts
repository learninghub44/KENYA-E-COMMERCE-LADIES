import type { AppRole } from "./roles";

export type AuthEvent =
  | "registration_started"
  | "registration_completed"
  | "email_verification_requested"
  | "email_verified"
  | "login_succeeded"
  | "login_failed"
  | "logout"
  | "password_reset_requested"
  | "password_updated"
  | "email_update_requested"
  | "email_updated"
  | "account_deactivated"
  | "account_reactivated"
  | "account_deleted"
  | "account_locked"
  | "role_changed"
  | "session_refreshed"
  | "session_revoked";

export type AuthUser = {
  id: string;
  email: string;
  roles: AppRole[];
  emailVerified: boolean;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
};

export type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };
