import type { AdminActor, CursorPage } from "../audit/types.js";

export type NotificationResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

export const NOTIFICATION_CATEGORIES = [
  "orders",
  "messaging",
  "seller",
  "account",
  "reviews",
  "announcements",
  "security"
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationRecord = {
  id: string;
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  sourceEventId: string | null;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
};

export type CreateNotificationInput = {
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  body?: string | undefined;
  data?: Record<string, unknown> | undefined;
  sourceEventId?: string | undefined;
};

export type NotificationListFilters = {
  category?: NotificationCategory | undefined;
  unreadOnly?: boolean | undefined;
  includeArchived?: boolean | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
};

export type NotificationRepository = {
  create(input: CreateNotificationInput): Promise<NotificationRecord>;
  createMany(inputs: readonly CreateNotificationInput[]): Promise<NotificationRecord[]>;
  findById(notificationId: string): Promise<NotificationRecord | null>;
  list(userId: string, filters: NotificationListFilters): Promise<CursorPage<NotificationRecord>>;
  unreadCount(userId: string): Promise<number>;
  markRead(notificationId: string): Promise<NotificationRecord>;
  markAllRead(userId: string): Promise<number>;
  archive(notificationId: string): Promise<NotificationRecord>;
};

// --- Preferences -----------------------------------------------------------

export type NotificationPreferences = {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  messagingNotifications: boolean;
  securityNotifications: true;
  updatedAt: string;
};

export type UpdateNotificationPreferencesInput = Partial<
  Omit<NotificationPreferences, "userId" | "securityNotifications" | "updatedAt">
>;

export type NotificationPreferenceRepository = {
  get(userId: string): Promise<NotificationPreferences>;
  update(userId: string, values: UpdateNotificationPreferencesInput): Promise<NotificationPreferences>;
};

// --- Events ------------------------------------------------------------------

export const PLATFORM_EVENT_TYPES = [
  "order.created",
  "order.status_changed",
  "message.created",
  "message.read",
  "seller.approved",
  "seller.rejected",
  "product.approved",
  "product.rejected",
  "review.created",
  "account.status_changed",
  "admin.announcement"
] as const;

export type PlatformEventType = (typeof PLATFORM_EVENT_TYPES)[number];

export type PlatformEventEntityType =
  | "order"
  | "message"
  | "seller"
  | "product"
  | "review"
  | "user"
  | "broadcast";

export type PlatformEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  eventType: PlatformEventType;
  entityType: PlatformEventEntityType;
  entityId: string | null;
  actorId: string | null;
  payload: TPayload;
  processedAt: string | null;
  createdAt: string;
};

export type PublishEventInput<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventType: PlatformEventType;
  entityType: PlatformEventEntityType;
  entityId?: string | undefined;
  actorId?: string | undefined;
  payload: TPayload;
};

export type EventRepository = {
  write<TPayload extends Record<string, unknown>>(input: PublishEventInput<TPayload>): Promise<PlatformEvent<TPayload>>;
  markProcessed(eventId: string): Promise<void>;
};

export type EventHandler<TPayload extends Record<string, unknown> = Record<string, unknown>> = (
  event: PlatformEvent<TPayload>
) => Promise<void>;

// --- Email -------------------------------------------------------------------

export const EMAIL_TEMPLATES = [
  "email_verification",
  "welcome",
  "order_update",
  "seller_approved",
  "seller_rejected",
  "password_reset",
  "security_alert"
] as const;

export type EmailTemplate = (typeof EMAIL_TEMPLATES)[number];

export type EmailStatus = "pending" | "sending" | "sent" | "failed" | "skipped";

export type QueueEmailInput = {
  userId?: string | undefined;
  toEmail: string;
  template: EmailTemplate;
  subject: string;
  payload?: Record<string, unknown> | undefined;
  sourceEventId?: string | undefined;
};

export type OutboundEmail = {
  id: string;
  userId: string | null;
  toEmail: string;
  template: EmailTemplate;
  subject: string;
  payload: Record<string, unknown>;
  status: EmailStatus;
  attempts: number;
  lastError: string | null;
  providerMessageId: string | null;
  sourceEventId: string | null;
  createdAt: string;
  sentAt: string | null;
};

export type EmailRepository = {
  enqueue(input: QueueEmailInput): Promise<OutboundEmail>;
  claimPending(limit: number): Promise<OutboundEmail[]>;
  markSent(emailId: string, providerMessageId: string): Promise<OutboundEmail>;
  markFailed(emailId: string, error: string): Promise<OutboundEmail>;
};

export type EmailProvider = {
  send(input: { toEmail: string; subject: string; template: EmailTemplate; payload: Record<string, unknown> }): Promise<{
    providerMessageId: string;
  }>;
};

// --- Admin broadcasts ----------------------------------------------------------

export type BroadcastSeverity = "info" | "maintenance" | "emergency";
export type BroadcastAudience = "all" | "buyers" | "sellers" | "admins" | "segment";
export type BroadcastStatus = "draft" | "published" | "expired";

export type BroadcastRecord = {
  id: string;
  createdBy: string;
  title: string;
  body: string;
  severity: BroadcastSeverity;
  audience: BroadcastAudience;
  audienceFilter: Record<string, unknown>;
  status: BroadcastStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  recipientCount: number;
  createdAt: string;
};

export type CreateBroadcastInput = {
  title: string;
  body: string;
  severity?: BroadcastSeverity | undefined;
  audience?: BroadcastAudience | undefined;
  audienceFilter?: Record<string, unknown> | undefined;
  expiresAt?: string | undefined;
};

export type BroadcastRepository = {
  create(actorId: string, input: CreateBroadcastInput): Promise<BroadcastRecord>;
  findById(broadcastId: string): Promise<BroadcastRecord | null>;
  list(filters: { status?: BroadcastStatus | undefined; cursor?: string | undefined; limit?: number | undefined }): Promise<
    CursorPage<BroadcastRecord>
  >;
  markPublished(broadcastId: string, recipientCount: number): Promise<BroadcastRecord>;
};

/** Resolves which user ids belong to a broadcast's target audience. Implemented against the profiles/roles tables. */
export type AudienceResolver = {
  resolveRecipients(audience: BroadcastAudience, filter: Record<string, unknown>): Promise<string[]>;
};

export type NotificationAuditWriter = {
  writeAdminAudit(input: {
    actor: AdminActor;
    action: string;
    entityType: "admin";
    entityId: string;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
    metadata?: Record<string, unknown> | undefined;
  }): Promise<void>;
};

export type { AdminActor, CursorPage };
