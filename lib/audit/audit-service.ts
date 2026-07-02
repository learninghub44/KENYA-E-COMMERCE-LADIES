import { assertPermission } from "../permissions/index";
import type { AdminActor, AdminResult, AuditRepository, AuditSearchFilters, AuditWriteInput, PlatformAuditRecord } from "./types";

function failure(code: string, message: string, status: number): AdminResult<never> {
  return { ok: false, code, message, status };
}

export type AuditServiceDependencies = {
  audit: AuditRepository;
};

export function createAuditService(deps: AuditServiceDependencies) {
  return {
    async record(actor: AdminActor, input: Omit<AuditWriteInput, "actorId"> & { actorId?: string | null }): Promise<AdminResult<PlatformAuditRecord>> {
      try {
        assertPermission(actor.roles, "security.audit.write");
      } catch {
        return failure("AUTHORIZATION_DENIED", "Actor cannot write audit records.", 403);
      }

      const record = await deps.audit.write({
        ...input,
        actorId: input.actorId ?? actor.userId,
        metadata: {
          ...(input.metadata ?? {}),
          sessionId: actor.sessionId,
          ipAddress: actor.ipAddress,
          userAgent: actor.userAgent
        }
      });

      return { ok: true, data: record };
    },

    async search(actor: AdminActor, filters: AuditSearchFilters): Promise<AdminResult<Awaited<ReturnType<AuditRepository["search"]>>>> {
      try {
        assertPermission(actor.roles, "security.audit.read");
      } catch {
        return failure("AUTHORIZATION_DENIED", "Actor cannot read audit records.", 403);
      }

      return { ok: true, data: await deps.audit.search({ ...filters, limit: Math.min(filters.limit ?? 50, 200) }) };
    },

    exportReady(actor: AdminActor, filters: AuditSearchFilters): AdminResult<AuditSearchFilters & { exportReady: true }> {
      try {
        assertPermission(actor.roles, "security.audit.read");
      } catch {
        return failure("AUTHORIZATION_DENIED", "Actor cannot export audit records.", 403);
      }

      return { ok: true, data: { ...filters, limit: Math.min(filters.limit ?? 1000, 5000), exportReady: true } };
    }
  };
}
