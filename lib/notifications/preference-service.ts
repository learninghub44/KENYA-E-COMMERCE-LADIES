import { assertPermission } from "../permissions/index";
import type { AdminActor } from "../audit/types";
import type {
  NotificationPreferenceRepository,
  NotificationPreferences,
  NotificationResult,
  UpdateNotificationPreferencesInput
} from "./types";

export type PreferenceServiceDependencies = {
  preferences: NotificationPreferenceRepository;
};

function failure(code: string, message: string, status: number): NotificationResult<never> {
  return { ok: false, code, message, status };
}

function canManageOwn(actor: AdminActor): boolean {
  try {
    assertPermission(actor.roles, "notification.preferences.manage");
    return true;
  } catch {
    return false;
  }
}

/**
 * Security notifications (password resets, new sign-ins, account status changes) can never be
 * disabled through this API. `security_notifications` is also pinned true at the database
 * constraint level; this is the application-layer half of the same guarantee, so a caller gets
 * a clear rejection rather than a silently ignored write.
 */
export function createPreferenceService(deps: PreferenceServiceDependencies) {
  return {
    async get(actor: AdminActor): Promise<NotificationResult<NotificationPreferences>> {
      if (!canManageOwn(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot read preferences.", 403);
      return { ok: true, data: await deps.preferences.get(actor.userId) };
    },

    async update(
      actor: AdminActor,
      values: UpdateNotificationPreferencesInput & { securityNotifications?: boolean | undefined }
    ): Promise<NotificationResult<NotificationPreferences>> {
      if (!canManageOwn(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot update preferences.", 403);
      if (values.securityNotifications === false) {
        return failure("SECURITY_NOTIFICATIONS_REQUIRED", "Security notifications cannot be disabled.", 422);
      }
      const { securityNotifications: _ignored, ...safeValues } = values;
      const updated = await deps.preferences.update(actor.userId, safeValues);
      return { ok: true, data: updated };
    }
  };
}

export type PreferenceService = ReturnType<typeof createPreferenceService>;
