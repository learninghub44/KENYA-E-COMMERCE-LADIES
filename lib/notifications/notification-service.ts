import { assertPermission } from "../permissions/index.js";
import type { AdminActor } from "../audit/types.js";
import type {
  CreateNotificationInput,
  NotificationListFilters,
  NotificationRecord,
  NotificationRepository,
  NotificationResult
} from "./types.js";

export type NotificationServiceDependencies = {
  notifications: NotificationRepository;
};

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

function failure(code: string, message: string, status: number): NotificationResult<never> {
  return { ok: false, code, message, status };
}

function canReadOwn(actor: AdminActor): boolean {
  try {
    assertPermission(actor.roles, "notification.read.own");
    return true;
  } catch {
    return false;
  }
}

function isOwnerOrStaff(actor: AdminActor, notification: NotificationRecord): boolean {
  if (notification.userId === actor.userId) return true;
  try {
    assertPermission(actor.roles, "user.read.support");
    return true;
  } catch {
    return false;
  }
}

/**
 * Notification CRUD/read surface. Every method enforces that a user can only ever see or
 * mutate their own notifications, except staff read access for support investigations.
 * Notification creation is internal-only (invoked by event handlers, never exposed to a route
 * that takes a caller-supplied userId), so it takes no actor.
 */
export function createNotificationService(deps: NotificationServiceDependencies) {
  return {
    /** Internal: creates a notification. Called by event handlers, not exposed to end users. */
    async create(input: CreateNotificationInput): Promise<NotificationRecord> {
      return deps.notifications.create(input);
    },

    /** Internal: bulk-creates notifications, used for admin broadcast fan-out. */
    async createMany(inputs: readonly CreateNotificationInput[]): Promise<NotificationRecord[]> {
      if (inputs.length === 0) return [];
      return deps.notifications.createMany(inputs);
    },

    async list(actor: AdminActor, filters: NotificationListFilters): Promise<NotificationResult<Awaited<ReturnType<NotificationRepository["list"]>>>> {
      if (!canReadOwn(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot read notifications.", 403);
      const page = await deps.notifications.list(actor.userId, {
        ...filters,
        limit: Math.min(filters.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
      });
      return { ok: true, data: page };
    },

    async unreadCount(actor: AdminActor): Promise<NotificationResult<number>> {
      if (!canReadOwn(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot read notifications.", 403);
      const count = await deps.notifications.unreadCount(actor.userId);
      return { ok: true, data: count };
    },

    async markAsRead(actor: AdminActor, notificationId: string): Promise<NotificationResult<NotificationRecord>> {
      const existing = await deps.notifications.findById(notificationId);
      if (!existing) return failure("NOTIFICATION_NOT_FOUND", "Notification was not found.", 404);
      if (!isOwnerOrStaff(actor, existing)) {
        return failure("AUTHORIZATION_DENIED", "Actor cannot modify this notification.", 403);
      }
      const updated = await deps.notifications.markRead(notificationId);
      return { ok: true, data: updated };
    },

    async markAllAsRead(actor: AdminActor): Promise<NotificationResult<{ updated: number }>> {
      if (!canReadOwn(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot modify notifications.", 403);
      const updated = await deps.notifications.markAllRead(actor.userId);
      return { ok: true, data: { updated } };
    },

    /** "Delete" is a soft-delete (archive): notifications are never hard-removed, per audit retention needs. */
    async archive(actor: AdminActor, notificationId: string): Promise<NotificationResult<NotificationRecord>> {
      const existing = await deps.notifications.findById(notificationId);
      if (!existing) return failure("NOTIFICATION_NOT_FOUND", "Notification was not found.", 404);
      if (!isOwnerOrStaff(actor, existing)) {
        return failure("AUTHORIZATION_DENIED", "Actor cannot modify this notification.", 403);
      }
      const updated = await deps.notifications.archive(notificationId);
      return { ok: true, data: updated };
    }
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
