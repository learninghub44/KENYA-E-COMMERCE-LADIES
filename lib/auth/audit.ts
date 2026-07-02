import type { AuthEvent, RequestContext } from "../../types/auth";

export type AuditRecord = {
  actorId: string | null;
  action: AuthEvent;
  entityType: "auth" | "session" | "role" | "profile";
  entityId: string | null;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  context?: RequestContext;
};

export type AuditRepository = {
  writeAudit(record: AuditRecord): Promise<void>;
  writeActivity(record: AuditRecord): Promise<void>;
};

export async function logAuthEvent(
  audit: AuditRepository,
  record: AuditRecord,
  authoritative = true
): Promise<void> {
  if (authoritative) {
    await audit.writeAudit(record);
    return;
  }

  await audit.writeActivity(record);
}
