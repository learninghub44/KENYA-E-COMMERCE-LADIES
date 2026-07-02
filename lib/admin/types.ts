import type { OrderStatus } from "../orders/types";
import type { ProductStatus } from "../products/types";
import type { SellerStatus } from "../seller/types";
import type { AdminActor, AdminResult, AuditEntityType, CursorPage } from "../audit/types";

export type AdminListFilters = {
  query?: string | undefined;
  status?: string | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
  sort?: string | undefined;
};

export type AdminDashboardMetrics = {
  users: { total: number; suspended: number; locked: number };
  sellers: { total: number; pending: number; approved: number; suspended: number };
  products: { total: number; pendingReview: number; published: number; suspended: number };
  orders: { total: number; pending: number; completed: number };
  conversations: { total: number; reportedMessages: number };
  moderationQueue: { sellers: number; products: number; reports: number; messages: number };
  pendingApprovals: number;
  recentActivity: { id: string; action: string; actorId: string | null; createdAt: string }[];
  systemAlerts: { id: string; severity: "info" | "warning" | "critical"; message: string; createdAt: string }[];
};

export type DashboardRepository = {
  getMetrics(): Promise<AdminDashboardMetrics>;
};

export type UserAdminRecord = {
  id: string;
  email: string;
  displayName: string | null;
  status: "active" | "suspended" | "locked" | "deactivated";
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type UserAdministrationGateway = {
  search(filters: AdminListFilters): Promise<CursorPage<UserAdminRecord>>;
  findById(userId: string): Promise<UserAdminRecord | null>;
  suspend(userId: string, reason: string): Promise<UserAdminRecord>;
  reactivate(userId: string): Promise<UserAdminRecord>;
  lock(userId: string, reason: string): Promise<UserAdminRecord>;
  forceLogout(userId: string): Promise<{ revokedSessions: number }>;
};

export type SellerAdministrationGateway<TSeller = unknown> = {
  search(filters: AdminListFilters): Promise<CursorPage<TSeller>>;
  findById(sellerId: string): Promise<TSeller | null>;
  transitionStatus(sellerId: string, status: SellerStatus): Promise<TSeller>;
};

export type ProductAdministrationGateway<TProduct = unknown> = {
  search(filters: AdminListFilters): Promise<CursorPage<TProduct>>;
  findById(productId: string): Promise<TProduct | null>;
  transition(productId: string, status: ProductStatus): Promise<TProduct>;
};

export type OrderAdministrationGateway<TOrder = unknown> = {
  search(filters: AdminListFilters): Promise<CursorPage<TOrder>>;
  findById(orderId: string): Promise<TOrder | null>;
  transitionStatus(input: { orderId: string; status: OrderStatus; actorId: string; note?: string | undefined }): Promise<TOrder>;
  addInternalNote(input: { orderId: string; actorId: string; note: string }): Promise<TOrder>;
};

export type PlatformSearchResult = {
  users: CursorPage<UserAdminRecord>;
  sellers: CursorPage<unknown>;
  products: CursorPage<unknown>;
  orders: CursorPage<unknown>;
  reports: CursorPage<unknown>;
  messages: CursorPage<unknown>;
};

export type AdminAuditWriter = {
  writeAdminAudit(input: {
    actor: AdminActor;
    action: string;
    entityType: AuditEntityType;
    entityId: string;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
    metadata?: Record<string, unknown> | undefined;
  }): Promise<void>;
};

export type AdminServiceResult<T> = AdminResult<T>;
