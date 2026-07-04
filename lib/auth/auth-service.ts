import type { AuthResult, AuthSession, RequestContext } from "../../types/auth";
import type { AppRole } from "../../types/roles";
import { normalizeRoles } from "../permissions/index";
import type { AuditRepository } from "./audit";
import { logAuthEvent } from "./audit";
import {
  emailUpdateSchema,
  loginSchema,
  passwordResetSchema,
  passwordUpdateSchema,
  profileUpdateSchema,
  registerSchema
} from "./schemas";
import type { ProfileRepository, RoleRepository, SupabaseAuthPort } from "./types";

export type AuthServiceDependencies = {
  auth: SupabaseAuthPort;
  profiles: ProfileRepository;
  roles: RoleRepository;
  audit: AuditRepository;
};

function authFailure(code: string, message: string, status: number): AuthResult<never> {
  return { ok: false, code, message, status };
}

async function sessionFromSupabase(
  auth: SupabaseAuthPort,
  roles: RoleRepository
): Promise<AuthResult<AuthSession>> {
  const { data, error } = await auth.getSession();

  if (error || !data.session || !data.session.user.email) {
    return authFailure("SESSION_REQUIRED", "A valid session is required.", 401);
  }

  const userRoles = normalizeRoles(await roles.listRoles(data.session.user.id));

  return {
    ok: true,
    data: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        roles: userRoles,
        emailVerified: data.session.user.email_confirmed_at !== null
      }
    }
  };
}

export function createAuthService(deps: AuthServiceDependencies) {
  return {
    async register(input: unknown, context: RequestContext = {}): Promise<AuthResult<AuthSession | null>> {
      const parsed = registerSchema.safeParse(input);
      if (!parsed.success) return authFailure("VALIDATION_ERROR", "Registration input is invalid.", 400);

      const { email, password, fullName } = parsed.data;
      const result = await deps.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (result.error || !result.data.user) {
        await logAuthEvent(deps.audit, {
          actorId: null,
          action: "registration_started",
          entityType: "auth",
          entityId: null,
          context
        });
        return authFailure("REGISTRATION_FAILED", "Unable to create the account.", 400);
      }

      const profileInput = fullName ? { id: result.data.user.id, email, fullName } : { id: result.data.user.id, email };
      await deps.profiles.createProfile(profileInput);
      await deps.roles.grantRole({ userId: result.data.user.id, role: "buyer", grantedBy: result.data.user.id });
      await logAuthEvent(deps.audit, {
        actorId: result.data.user.id,
        action: "registration_completed",
        entityType: "profile",
        entityId: result.data.user.id,
        newValues: { role: "buyer" },
        context
      });

      return result.data.session ? sessionFromSupabase(deps.auth, deps.roles) : { ok: true, data: null };
    },

    async login(input: unknown, context: RequestContext = {}): Promise<AuthResult<AuthSession>> {
      const parsed = loginSchema.safeParse(input);
      if (!parsed.success) return authFailure("VALIDATION_ERROR", "Login input is invalid.", 400);

      const { data, error } = await deps.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password
      });

      if (error || !data.user) {
        await logAuthEvent(
          deps.audit,
          { actorId: null, action: "login_failed", entityType: "auth", entityId: null, context },
          false
        );
        return authFailure("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
      }

      await logAuthEvent(
        deps.audit,
        { actorId: data.user.id, action: "login_succeeded", entityType: "auth", entityId: data.user.id, context },
        false
      );
      return sessionFromSupabase(deps.auth, deps.roles);
    },

    async logout(scope: "global" | "local" | "others" = "local", context: RequestContext = {}): Promise<AuthResult<null>> {
      const current = await deps.auth.getUser();
      const { error } = await deps.auth.signOut({ scope });
      if (error) return authFailure("LOGOUT_FAILED", "Unable to end the session.", 400);

      await logAuthEvent(
        deps.audit,
        {
          actorId: current.data.user?.id ?? null,
          action: "logout",
          entityType: "session",
          entityId: current.data.user?.id ?? null,
          context
        },
        false
      );
      return { ok: true, data: null };
    },

    async requestPasswordReset(input: unknown, context: RequestContext = {}): Promise<AuthResult<null>> {
      const parsed = passwordResetSchema.safeParse(input);
      if (!parsed.success) return authFailure("VALIDATION_ERROR", "Password reset input is invalid.", 400);

      const resetOptions = parsed.data.redirectTo ? { redirectTo: parsed.data.redirectTo } : undefined;
      const { error } = await deps.auth.resetPasswordForEmail(parsed.data.email, resetOptions);
      if (error) return authFailure("PASSWORD_RESET_FAILED", "Unable to request password reset.", 400);

      await logAuthEvent(
        deps.audit,
        { actorId: null, action: "password_reset_requested", entityType: "auth", entityId: null, context },
        false
      );
      return { ok: true, data: null };
    },

    async updatePassword(input: unknown, context: RequestContext = {}): Promise<AuthResult<null>> {
      const parsed = passwordUpdateSchema.safeParse(input);
      if (!parsed.success) return authFailure("VALIDATION_ERROR", "Password does not meet policy.", 400);

      const current = await deps.auth.getUser();
      if (current.error || !current.data.user) return authFailure("SESSION_REQUIRED", "A valid session is required.", 401);

      const { error } = await deps.auth.updateUser({ password: parsed.data.password });
      if (error) return authFailure("PASSWORD_UPDATE_FAILED", "Unable to update password.", 400);

      await logAuthEvent(deps.audit, {
        actorId: current.data.user.id,
        action: "password_updated",
        entityType: "auth",
        entityId: current.data.user.id,
        context
      });
      return { ok: true, data: null };
    },

    async updateEmail(input: unknown, context: RequestContext = {}): Promise<AuthResult<null>> {
      const parsed = emailUpdateSchema.safeParse(input);
      if (!parsed.success) return authFailure("VALIDATION_ERROR", "Email input is invalid.", 400);

      const current = await deps.auth.getUser();
      if (current.error || !current.data.user) return authFailure("SESSION_REQUIRED", "A valid session is required.", 401);

      const { error } = await deps.auth.updateUser({ email: parsed.data.email });
      if (error) return authFailure("EMAIL_UPDATE_FAILED", "Unable to update email.", 400);

      await logAuthEvent(deps.audit, {
        actorId: current.data.user.id,
        action: "email_update_requested",
        entityType: "auth",
        entityId: current.data.user.id,
        newValues: { email: parsed.data.email },
        context
      });
      return { ok: true, data: null };
    },

    async refreshSession(context: RequestContext = {}): Promise<AuthResult<AuthSession>> {
      const { data, error } = await deps.auth.refreshSession();
      if (error || !data.session) return authFailure("SESSION_REFRESH_FAILED", "Unable to refresh session.", 401);

      await logAuthEvent(
        deps.audit,
        {
          actorId: data.session.user.id,
          action: "session_refreshed",
          entityType: "session",
          entityId: data.session.user.id,
          context
        },
        false
      );
      return sessionFromSupabase(deps.auth, deps.roles);
    },

    async deactivateAccount(userId: string, context: RequestContext = {}): Promise<AuthResult<null>> {
      const current = await deps.auth.getUser();
      if (current.error || !current.data.user) return authFailure("SESSION_REQUIRED", "A valid session is required.", 401);
      const roles = normalizeRoles(await deps.roles.listRoles(current.data.user.id));
      if (current.data.user.id !== userId && !roles.includes("admin") && !roles.includes("super_admin")) {
        return authFailure("AUTHORIZATION_DENIED", "You can only deactivate your own account.", 403);
      }
      await deps.profiles.setProfileStatus(userId, "inactive");
      await logAuthEvent(deps.audit, {
        actorId: userId,
        action: "account_deactivated",
        entityType: "profile",
        entityId: userId,
        context
      });
      return { ok: true, data: null };
    },

    async reactivateAccount(userId: string, context: RequestContext = {}): Promise<AuthResult<null>> {
      const current = await deps.auth.getUser();
      if (current.error || !current.data.user) return authFailure("SESSION_REQUIRED", "A valid session is required.", 401);
      const roles = normalizeRoles(await deps.roles.listRoles(current.data.user.id));
      if (current.data.user.id !== userId && !roles.includes("admin") && !roles.includes("super_admin")) {
        return authFailure("AUTHORIZATION_DENIED", "Only admins can reactivate accounts.", 403);
      }
      await deps.profiles.setProfileStatus(userId, "active");
      await logAuthEvent(deps.audit, {
        actorId: userId,
        action: "account_reactivated",
        entityType: "profile",
        entityId: userId,
        context
      });
      return { ok: true, data: null };
    },

    async updateProfile(input: unknown, userId: string): Promise<AuthResult<null>> {
      const parsed = profileUpdateSchema.safeParse(input);
      if (!parsed.success) return authFailure("VALIDATION_ERROR", "Profile input is invalid.", 400);
      await deps.profiles.updateProfile({ userId, ...parsed.data });
      if (parsed.data.email) {
        await deps.auth.updateUser({ email: parsed.data.email });
      }
      return { ok: true, data: null };
    },

    async getProfile(userId: string): Promise<AuthResult<{
      id: string;
      email: string;
      displayName: string | null;
      phone: string | null;
      avatarUrl: string | null;
    } | null>> {
      const profile = await deps.profiles.findByUserId(userId);
      return { ok: true, data: profile };
    },

    async requireSession(): Promise<AuthResult<AuthSession>> {
      return sessionFromSupabase(deps.auth, deps.roles);
    },

    async requireRole(role: AppRole): Promise<AuthResult<AuthSession>> {
      const session = await sessionFromSupabase(deps.auth, deps.roles);
      if (!session.ok) return session;
      if (!session.data.user.roles.includes(role)) {
        return authFailure("AUTHORIZATION_DENIED", "The current user does not have access.", 403);
      }
      return session;
    }
  };
}
