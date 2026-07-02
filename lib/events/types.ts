import { z } from "zod";

// ============================================================
// EVENT TYPE DEFINITIONS
// ============================================================

export const EVENT_TYPES = {
  // Authentication
  USER_REGISTERED: "user.registered",
  LOGIN: "user.login",
  LOGOUT: "user.logout",
  PASSWORD_RESET: "user.password_reset",
  EMAIL_VERIFIED: "user.email_verified",

  // Marketplace
  PRODUCT_VIEWED: "product.viewed",
  PRODUCT_SHARED: "product.shared",
  PRODUCT_WISHLISTED: "product.wishlisted",
  PRODUCT_COMPARED: "product.compared",

  // Search
  SEARCH_PERFORMED: "search.performed",
  SEARCH_CLICKED: "search.clicked",
  SEARCH_FILTER_APPLIED: "search.filter_applied",
  SEARCH_RESULT_VIEWED: "search.result_viewed",

  // Cart
  CART_CREATED: "cart.created",
  CART_UPDATED: "cart.updated",
  ITEM_ADDED: "cart.item_added",
  ITEM_REMOVED: "cart.item_removed",

  // Checkout
  CHECKOUT_STARTED: "checkout.started",
  CHECKOUT_COMPLETED: "checkout.completed",
  CHECKOUT_CANCELLED: "checkout.cancelled",

  // Orders
  ORDER_CREATED: "order.created",
  ORDER_PAID: "order.paid",
  ORDER_COMPLETED: "order.completed",
  ORDER_CANCELLED: "order.cancelled",

  // Sellers
  SELLER_REGISTERED: "seller.registered",
  SELLER_VERIFIED: "seller.verified",
  SELLER_SUSPENDED: "seller.suspended",
  PRODUCT_APPROVED: "product.approved",
  PRODUCT_REJECTED: "product.rejected",

  // Reviews
  REVIEW_CREATED: "review.created",
  REVIEW_UPDATED: "review.updated",
  HELPFUL_VOTE: "review.helpful_vote",
  REVIEW_REPORTED: "review.reported",

  // Messaging
  CONVERSATION_STARTED: "messaging.conversation_started",
  MESSAGE_SENT: "messaging.message_sent",
  ATTACHMENT_UPLOADED: "messaging.attachment_uploaded",

  // Notifications
  NOTIFICATION_CREATED: "notification.created",
  NOTIFICATION_READ: "notification.read",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export const SOURCES = [
  "web",
  "mobile",
  "api",
  "internal",
  "admin",
  "cron",
  "webhook",
] as const;
export type EventSource = (typeof SOURCES)[number];

export const PLATFORMS = ["web", "ios", "android", "api", "admin"] as const;
export type EventPlatform = (typeof PLATFORMS)[number];

// ============================================================
// CORE EVENT
// ============================================================

export interface InternalEvent {
  id: string;
  eventType: EventType;
  eventVersion: number;
  userId: string | null;
  sellerId: string | null;
  sessionId: string | null;
  requestId: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  deviceInfo: Record<string, unknown>;
  ipHash: string | null;
  userAgent: string | null;
  source: EventSource;
  platform: string | null;
  createdAt: string;
  archivedAt: string | null;
}

export interface CreateEventInput {
  eventType: EventType;
  eventVersion?: number;
  userId?: string | null;
  sellerId?: string | null;
  sessionId?: string | null;
  requestId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  deviceInfo?: Record<string, unknown>;
  ipHash?: string | null;
  userAgent?: string | null;
  source?: EventSource;
  platform?: string | null;
}

// ============================================================
// AGGREGATION
// ============================================================

export interface EventAggregation {
  eventType: EventType;
  bucketHour?: string;
  bucketDate?: string;
  eventCount: number;
  uniqueUsers: number;
  uniqueSellers: number;
  uniqueSessions: number;
}

export type AggregationPeriod = "hourly" | "daily" | "weekly" | "monthly" | "yearly";

export type AggregationDimension = "user" | "seller" | "product" | "category" | "brand" | "marketplace";

// ============================================================
// FILTERS & PAGINATION
// ============================================================

export interface EventFilters {
  eventTypes?: EventType[];
  userId?: string;
  sellerId?: string;
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  source?: EventSource;
  startDate?: string;
  endDate?: string;
}

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

// ============================================================
// EVENT STATISTICS
// ============================================================

export interface EventStatistics {
  totalEvents: number;
  uniqueEventTypes: number;
  uniqueUsers: number;
  uniqueSessions: number;
  eventsByType: Array<{ eventType: string; count: number }>;
  eventsByDay: Array<{ date: string; count: number }>;
}

// ============================================================
// REPOSITORY INTERFACES
// ============================================================

export interface EventRepository {
  create(input: CreateEventInput): Promise<InternalEvent>;
  findById(id: string): Promise<InternalEvent | null>;
  list(filters: EventFilters, cursor?: string, limit?: number): Promise<CursorPage<InternalEvent>>;
  listEventTypes(): Promise<string[]>;
  getStatistics(startDate: string, endDate: string): Promise<EventStatistics>;
  aggregateHourly(bucketHour: string): Promise<void>;
  aggregateDaily(bucketDate: string): Promise<void>;
  archiveEvents(cutoffDate: string): Promise<number>;
}

// ============================================================
// EVENT REPLAY
// ============================================================

export interface EventReplayHandler {
  handleEvent(event: InternalEvent): Promise<void>;
}

export interface EventReplayService {
  replayEvents(filters: EventFilters, handler: EventReplayHandler): Promise<number>;
}

// ============================================================
// SCHEMAS
// ============================================================

export const eventTypeSchema = z.enum(Object.values(EVENT_TYPES) as [string, ...string[]]);
export const eventSourceSchema = z.enum(SOURCES);
export const eventPlatformSchema = z.enum(PLATFORMS);

export const createEventSchema = z.object({
  eventType: eventTypeSchema,
  eventVersion: z.number().int().positive().default(1),
  userId: z.string().uuid().nullable().optional(),
  sellerId: z.string().uuid().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  requestId: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
  entityId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
  deviceInfo: z.record(z.unknown()).default({}),
  ipHash: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  source: eventSourceSchema.default("internal"),
  platform: z.string().nullable().optional(),
});

export const eventFiltersSchema = z.object({
  eventTypes: z.array(eventTypeSchema).optional(),
  userId: z.string().uuid().optional(),
  sellerId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  source: eventSourceSchema.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CreateEventRequest = z.infer<typeof createEventSchema>;
