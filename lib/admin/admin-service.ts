import { assertPermission } from "../permissions/index";
import type { OrderStatus } from "../orders/types";
import type { ProductStatus } from "../products/types";
import type { SellerStatus } from "../seller/types";
import type { AdminActor, CursorPage } from "../audit/types";
import type {
  AdminAuditWriter,
  AdminDashboardMetrics,
  AdminListFilters,
  AdminServiceResult,
  DashboardRepository,
  OrderAdministrationGateway,
  PlatformSearchResult,
  ProductAdministrationGateway,
  SellerAdministrationGateway,
  UserAdministrationGateway
} from "./types";

export type AdminServiceDependencies = {
  dashboard: DashboardRepository;
  users: UserAdministrationGateway;
  sellers: SellerAdministrationGateway;
  products: ProductAdministrationGateway;
  orders: OrderAdministrationGateway;
  reports: { search(filters: AdminListFilters): Promise<CursorPage<unknown>> };
  messages: { search(filters: AdminListFilters): Promise<CursorPage<unknown>> };
  audit: AdminAuditWriter;
};

function failure(code: string, message: string, status: number): AdminServiceResult<never> {
  return { ok: false, code, message, status };
}

function denied(message: string): { ok: false; code: string; message: string; status: number } {
  return { ok: false, code: "AUTHORIZATION_DENIED", message, status: 403 };
}

function requirePermission(
  actor: AdminActor,
  permission: Parameters<typeof assertPermission>[1],
  message: string
): { ok: false; code: string; message: string; status: number } | null {
  try {
    assertPermission(actor.roles, permission);
    return null;
  } catch {
    return denied(message);
  }
}

function pageLimit(filters: AdminListFilters): AdminListFilters {
  return { ...filters, limit: Math.min(filters.limit ?? 50, 100) };
}

export function createAdminService(deps: AdminServiceDependencies) {
  return {
    async dashboard(actor: AdminActor): Promise<AdminServiceResult<AdminDashboardMetrics>> {
      const denied = requirePermission(actor, "admin.access", "Actor cannot access the admin dashboard.");
      if (denied) return denied;
      return { ok: true, data: await deps.dashboard.getMetrics() };
    },

    async search(actor: AdminActor, filters: AdminListFilters): Promise<AdminServiceResult<PlatformSearchResult>> {
      const denied = requirePermission(actor, ["admin.access", "user.read.support"], "Actor cannot use platform search.");
      if (denied) return denied;
      const normalized = pageLimit(filters);
      const [users, sellers, products, orders, reports, messages] = await Promise.all([
        deps.users.search(normalized),
        deps.sellers.search(normalized),
        deps.products.search(normalized),
        deps.orders.search(normalized),
        deps.reports.search(normalized),
        deps.messages.search(normalized)
      ]);
      return { ok: true, data: { users, sellers, products, orders, reports, messages } };
    },

    async suspendUser(actor: AdminActor, userId: string, reason: string): Promise<AdminServiceResult<unknown>> {
      const denied = requirePermission(actor, "user.manage", "Actor cannot suspend users.");
      if (denied) return denied;
      const before = await deps.users.findById(userId);
      if (!before) return failure("USER_NOT_FOUND", "User was not found.", 404);
      const updated = await deps.users.suspend(userId, reason);
      await deps.audit.writeAdminAudit({ actor, action: "user.suspended", entityType: "user", entityId: userId, oldValues: before, newValues: updated, metadata: { reason } });
      return { ok: true, data: updated };
    },

    async reactivateUser(actor: AdminActor, userId: string): Promise<AdminServiceResult<unknown>> {
      const denied = requirePermission(actor, "user.manage", "Actor cannot reactivate users.");
      if (denied) return denied;
      const before = await deps.users.findById(userId);
      if (!before) return failure("USER_NOT_FOUND", "User was not found.", 404);
      const updated = await deps.users.reactivate(userId);
      await deps.audit.writeAdminAudit({ actor, action: "user.reactivated", entityType: "user", entityId: userId, oldValues: before, newValues: updated });
      return { ok: true, data: updated };
    },

    async lockUser(actor: AdminActor, userId: string, reason: string): Promise<AdminServiceResult<unknown>> {
      const denied = requirePermission(actor, "security.lockout.manage", "Actor cannot lock users.");
      if (denied) return denied;
      const before = await deps.users.findById(userId);
      if (!before) return failure("USER_NOT_FOUND", "User was not found.", 404);
      const updated = await deps.users.lock(userId, reason);
      await deps.audit.writeAdminAudit({ actor, action: "user.locked", entityType: "user", entityId: userId, oldValues: before, newValues: updated, metadata: { reason } });
      return { ok: true, data: updated };
    },

    async forceLogout(actor: AdminActor, userId: string): Promise<AdminServiceResult<{ revokedSessions: number }>> {
      const denied = requirePermission(actor, "auth.session.revoke", "Actor cannot force logout users.");
      if (denied) return denied;
      const result = await deps.users.forceLogout(userId);
      await deps.audit.writeAdminAudit({ actor, action: "user.force_logout", entityType: "session", entityId: userId, newValues: result });
      return { ok: true, data: result };
    },

    async transitionSeller(actor: AdminActor, sellerId: string, status: SellerStatus, note?: string): Promise<AdminServiceResult<unknown>> {
      const denied = requirePermission(actor, "admin.moderate", "Actor cannot moderate sellers.");
      if (denied) return denied;
      const before = await deps.sellers.findById(sellerId);
      if (!before) return failure("SELLER_NOT_FOUND", "Seller was not found.", 404);
      const updated = await deps.sellers.transitionStatus(sellerId, status);
      await deps.audit.writeAdminAudit({ actor, action: `seller.${status}`, entityType: "seller", entityId: sellerId, oldValues: { seller: before }, newValues: { seller: updated }, metadata: { note } });
      return { ok: true, data: updated };
    },

    async transitionProduct(actor: AdminActor, productId: string, status: ProductStatus, note?: string): Promise<AdminServiceResult<unknown>> {
      const denied = requirePermission(actor, "admin.moderate", "Actor cannot moderate products.");
      if (denied) return denied;
      const before = await deps.products.findById(productId);
      if (!before) return failure("PRODUCT_NOT_FOUND", "Product was not found.", 404);
      const updated = await deps.products.transition(productId, status);
      await deps.audit.writeAdminAudit({ actor, action: `product.${status}`, entityType: "product", entityId: productId, oldValues: { product: before }, newValues: { product: updated }, metadata: { note } });
      return { ok: true, data: updated };
    },

    async transitionOrder(actor: AdminActor, orderId: string, status: OrderStatus, note?: string): Promise<AdminServiceResult<unknown>> {
      const denied = requirePermission(actor, "order.manage", "Actor cannot update order status.");
      if (denied) return denied;
      const before = await deps.orders.findById(orderId);
      if (!before) return failure("ORDER_NOT_FOUND", "Order was not found.", 404);
      const updated = await deps.orders.transitionStatus({ orderId, status, actorId: actor.userId, note });
      await deps.audit.writeAdminAudit({ actor, action: "order.status_updated", entityType: "order", entityId: orderId, oldValues: { order: before }, newValues: { order: updated }, metadata: { note } });
      return { ok: true, data: updated };
    },

    async addOrderNote(actor: AdminActor, orderId: string, note: string): Promise<AdminServiceResult<unknown>> {
      const denied = requirePermission(actor, "admin.support", "Actor cannot add order notes.");
      if (denied) return denied;
      const updated = await deps.orders.addInternalNote({ orderId, actorId: actor.userId, note });
      await deps.audit.writeAdminAudit({ actor, action: "order.note_added", entityType: "order", entityId: orderId, newValues: { note } });
      return { ok: true, data: updated };
    }
  };
}
