import { assertPermission } from "../permissions/index.js";
import type { AdminActor } from "../audit/types.js";
import type { MessageModerationGateway, ModerationAuditWriter, ModerationRepository, ModerationResult } from "./types.js";

export type ModerationServiceDependencies = {
  moderation: ModerationRepository;
  messages: MessageModerationGateway;
  audit: ModerationAuditWriter;
};

function failure(code: string, message: string, status: number): ModerationResult<never> {
  return { ok: false, code, message, status };
}

function requireModeration(actor: AdminActor): ModerationResult<null> | null {
  try {
    assertPermission(actor.roles, "admin.moderate");
    return null;
  } catch {
    return failure("AUTHORIZATION_DENIED", "Actor cannot perform moderation actions.", 403);
  }
}

export function createModerationService(deps: ModerationServiceDependencies) {
  return {
    async queue(actor: AdminActor, filters: Parameters<ModerationRepository["queue"]>[0]) {
      const denied = requireModeration(actor);
      if (denied) return denied;
      return { ok: true as const, data: await deps.moderation.queue({ ...filters, limit: Math.min(filters.limit ?? 50, 100) }) };
    },

    async reportedMessages(actor: AdminActor, filters: Parameters<ModerationRepository["reportedMessages"]>[0]) {
      const denied = requireModeration(actor);
      if (denied) return denied;
      return { ok: true as const, data: await deps.moderation.reportedMessages({ ...filters, limit: Math.min(filters.limit ?? 50, 100) }) };
    },

    async deleteMessage(actor: AdminActor, messageId: string, reason: string) {
      const denied = requireModeration(actor);
      if (denied) return denied;
      const before = await deps.messages.findById(messageId);
      if (!before) return failure("MESSAGE_NOT_FOUND", "Message was not found.", 404);
      const updated = await deps.messages.softDelete({ messageId, deletedBy: actor.userId, reason });
      await deps.audit.writeAdminAudit({
        actor,
        action: "message.deleted_by_moderator",
        entityType: "message",
        entityId: messageId,
        oldValues: { message: before },
        newValues: { message: updated },
        metadata: { reason }
      });
      return { ok: true as const, data: updated };
    },

    async warnUser(actor: AdminActor, userId: string, reason: string) {
      const denied = requireModeration(actor);
      if (denied) return denied;
      await deps.messages.warnUser({ userId, actorId: actor.userId, reason });
      await deps.audit.writeAdminAudit({ actor, action: "message.user_warned", entityType: "moderation", entityId: userId, metadata: { reason } });
      return { ok: true as const, data: { warned: true } };
    },

    async suspendMessaging(actor: AdminActor, userId: string, reason: string) {
      const denied = requireModeration(actor);
      if (denied) return denied;
      await deps.messages.suspendMessaging({ userId, actorId: actor.userId, reason });
      await deps.audit.writeAdminAudit({ actor, action: "message.privileges_suspended", entityType: "moderation", entityId: userId, metadata: { reason } });
      return { ok: true as const, data: { suspended: true } };
    }
  };
}
