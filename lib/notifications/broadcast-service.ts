import { assertPermission } from "../permissions/index.js";
import type { AdminActor } from "../audit/types.js";
import type {
  AudienceResolver,
  BroadcastRecord,
  BroadcastRepository,
  CreateBroadcastInput,
  NotificationRepository,
  NotificationAuditWriter,
  NotificationResult
} from "./types.js";

export type BroadcastServiceDependencies = {
  broadcasts: BroadcastRepository;
  audience: AudienceResolver;
  notifications: NotificationRepository;
  audit: NotificationAuditWriter;
};

function failure(code: string, message: string, status: number): NotificationResult<never> {
  return { ok: false, code, message, status };
}

function canBroadcast(actor: AdminActor): boolean {
  try {
    assertPermission(actor.roles, "notification.broadcast.manage");
    return true;
  } catch {
    return false;
  }
}

/**
 * Platform announcements, maintenance notices, emergency alerts, and targeted broadcasts.
 * Creating a broadcast is cheap (draft); publishing resolves the audience and fans out one
 * notification per recipient. Every mutating action is audited, since a broadcast reaches
 * every targeted user at once and is a high-blast-radius admin action.
 */
export function createBroadcastService(deps: BroadcastServiceDependencies) {
  return {
    async create(actor: AdminActor, input: CreateBroadcastInput): Promise<NotificationResult<BroadcastRecord>> {
      if (!canBroadcast(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot create broadcasts.", 403);
      const broadcast = await deps.broadcasts.create(actor.userId, input);
      await deps.audit.writeAdminAudit({
        actor,
        action: "broadcast.created",
        entityType: "admin",
        entityId: broadcast.id,
        newValues: { title: broadcast.title, severity: broadcast.severity, audience: broadcast.audience }
      });
      return { ok: true, data: broadcast };
    },

    async list(actor: AdminActor, filters: Parameters<BroadcastRepository["list"]>[0]): Promise<NotificationResult<Awaited<ReturnType<BroadcastRepository["list"]>>>> {
      if (!canBroadcast(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot list broadcasts.", 403);
      return { ok: true, data: await deps.broadcasts.list(filters) };
    },

    async publish(actor: AdminActor, broadcastId: string): Promise<NotificationResult<BroadcastRecord>> {
      if (!canBroadcast(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot publish broadcasts.", 403);
      const existing = await deps.broadcasts.findById(broadcastId);
      if (!existing) return failure("BROADCAST_NOT_FOUND", "Broadcast was not found.", 404);
      if (existing.status === "published") return failure("BROADCAST_ALREADY_PUBLISHED", "Broadcast was already published.", 409);

      const recipients = await deps.audience.resolveRecipients(existing.audience, existing.audienceFilter);

      if (recipients.length > 0) {
        await deps.notifications.createMany(
          recipients.map((userId) => ({
            userId,
            category: "announcements" as const,
            type: "admin.announcement",
            title: existing.title,
            body: existing.body,
            data: { broadcastId: existing.id, severity: existing.severity }
          }))
        );
      }

      const published = await deps.broadcasts.markPublished(broadcastId, recipients.length);
      await deps.audit.writeAdminAudit({
        actor,
        action: "broadcast.published",
        entityType: "admin",
        entityId: broadcastId,
        oldValues: { status: existing.status },
        newValues: { status: "published", recipientCount: recipients.length },
        metadata: { severity: existing.severity, audience: existing.audience }
      });
      return { ok: true, data: published };
    }
  };
}

export type BroadcastService = ReturnType<typeof createBroadcastService>;
