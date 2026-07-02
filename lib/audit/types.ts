import type { Permission } from "../../types/permissions";
import type { AppRole } from "../../types/roles";

export type AdminActor = {
  userId: string;
  roles: readonly AppRole[];
  sessionId?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

export type AuditEntityType =
  | "auth"
  | "session"
  | "role"
  | "profile"
  | "seller"
  | "product"
  | "user"
  | "order"
  | "message"
  | "report"
  | "admin"
  | "moderation";

export type AuditSeverity = "info" | "warning" | "critical";

export type PlatformAuditRecord = {
  id: string;
  actorId: string | null;
  action: string;
  entityType: AuditEntityType;
  entityId: string | null;
  oldValues?: Record<string, unknown> | undefined;
  newValues?: Record<string, unknown> | undefined;
  metadata?: Record<string, unknown> | undefined;
  severity: AuditSeverity;
  createdAt: string;
};

export type AuditWriteInput = Omit<PlatformAuditRecord, "id" | "createdAt">;

export type AuditSearchFilters = {
  actorId?: string | undefined;
  action?: string | undefined;
  entityType?: AuditEntityType | undefined;
  entityId?: string | undefined;
  query?: string | undefined;
  severity?: AuditSeverity | undefined;
  from?: string | undefined;
  to?: string | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
  sort?: "created_at_desc" | "created_at_asc" | undefined;
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};

export type AuditRepository = {
  write(record: AuditWriteInput): Promise<PlatformAuditRecord>;
  search(filters: AuditSearchFilters): Promise<CursorPage<PlatformAuditRecord>>;
};

export type PermissionedAction = {
  permission: Permission | readonly Permission[];
  auditAction: string;
};

export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };
