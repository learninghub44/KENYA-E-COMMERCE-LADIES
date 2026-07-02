import type { AdminActor, AdminResult, CursorPage } from "../audit/types.js";
import type { ReportRecord } from "../reports/types.js";

export type ModerationQueueItem = {
  id: string;
  type: "seller" | "product" | "message" | "report";
  status: string;
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  summary: string;
  assignedTo: string | null;
};

export type MessageModerationRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  deletedAt: string | null;
  reportCount: number;
  createdAt: string;
};

export type ModerationRepository = {
  queue(filters: { type?: ModerationQueueItem["type"] | undefined; assignedTo?: string | undefined; cursor?: string | undefined; limit?: number | undefined }): Promise<CursorPage<ModerationQueueItem>>;
  reportedMessages(filters: { cursor?: string | undefined; limit?: number | undefined }): Promise<CursorPage<MessageModerationRecord>>;
};

export type MessageModerationGateway = {
  findById(messageId: string): Promise<MessageModerationRecord | null>;
  softDelete(input: { messageId: string; deletedBy: string; reason: string }): Promise<MessageModerationRecord>;
  warnUser(input: { userId: string; actorId: string; reason: string }): Promise<void>;
  suspendMessaging(input: { userId: string; actorId: string; reason: string }): Promise<void>;
};

export type ModerationAuditWriter = {
  writeAdminAudit(input: {
    actor: AdminActor;
    action: string;
    entityType: "message" | "moderation" | "report";
    entityId: string;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
    metadata?: Record<string, unknown> | undefined;
  }): Promise<void>;
};

export type ModerationResult<T> = AdminResult<T>;
export type { ReportRecord };
