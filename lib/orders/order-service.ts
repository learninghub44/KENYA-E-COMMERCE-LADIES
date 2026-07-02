import { statusTransitionSchema } from "./schemas";
import { assertOrderStatusTransition, buyerCanCancel, fulfillmentStatusFor } from "./status";
import type { CommerceEventPublisher, CommerceResult, OrderRepository, OrderWithItems } from "./types";

export type OrderServiceDependencies = {
  orders: OrderRepository;
  events?: CommerceEventPublisher;
};

function failure(code: string, message: string, status: number): CommerceResult<never> {
  return { ok: false, code, message, status };
}

export function createOrderService(deps: OrderServiceDependencies) {
  return {
    async getForBuyer(orderId: string, buyerId: string): Promise<CommerceResult<OrderWithItems>> {
      const order = await deps.orders.findById(orderId);
      if (!order) return failure("NOT_FOUND", "Order not found.", 404);
      if (order.buyerId !== buyerId) return failure("FORBIDDEN", "You do not own this order.", 403);
      return { ok: true, data: order };
    },

    async listForBuyer(buyerId: string, cursor: string | undefined, limit = 20) {
      return { ok: true as const, data: await deps.orders.listByBuyer({ buyerId, cursor, limit }) };
    },

    async listForSeller(sellerId: string, actorUserId: string, cursor: string | undefined, limit = 20) {
      if (!actorUserId) return failure("SESSION_REQUIRED", "A valid session is required.", 401);
      return { ok: true as const, data: await deps.orders.listBySeller({ sellerId, cursor, limit }) };
    },

    async cancelByBuyer(orderId: string, buyerId: string): Promise<CommerceResult<OrderWithItems>> {
      const order = await deps.orders.findById(orderId);
      if (!order) return failure("NOT_FOUND", "Order not found.", 404);
      if (order.buyerId !== buyerId) return failure("FORBIDDEN", "You do not own this order.", 403);
      if (!buyerCanCancel(order.status)) return failure("ORDER_NOT_CANCELLABLE", "This order can no longer be cancelled by the buyer.", 409);
      const updated = await deps.orders.updateStatus({ orderId, status: "cancelled", fulfillmentStatus: "unfulfilled" });
      await deps.orders.appendHistory({ orderId, fromStatus: order.status, toStatus: "cancelled", actorId: buyerId });
      await deps.events?.publish({ type: "order.cancelled", orderId, buyerId, sellerId: order.sellerId });
      return { ok: true, data: { ...updated, items: order.items } };
    },

    async transition(input: unknown, actorRoles: readonly string[] = []): Promise<CommerceResult<OrderWithItems>> {
      const parsed = statusTransitionSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Order transition input is invalid.", 400);
      const order = await deps.orders.findById(parsed.data.orderId);
      if (!order) return failure("NOT_FOUND", "Order not found.", 404);
      const isSeller = actorRoles.includes("seller") || actorRoles.includes("admin") || actorRoles.includes("super_admin");
      if (!isSeller) return failure("AUTHORIZATION_DENIED", "Only sellers or staff can transition orders.", 403);
      try {
        assertOrderStatusTransition(order.status, parsed.data.to);
      } catch (error) {
        return failure("INVALID_TRANSITION", (error as Error).message, 409);
      }
      const updated = await deps.orders.updateStatus({
        orderId: order.id,
        status: parsed.data.to,
        fulfillmentStatus: fulfillmentStatusFor(parsed.data.to)
      });
      await deps.orders.appendHistory({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: parsed.data.to,
        actorId: parsed.data.actorId,
        note: parsed.data.note
      });
      await deps.events?.publish({
        type: "order.status_changed",
        orderId: order.id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        metadata: { from: order.status, to: parsed.data.to }
      });
      return { ok: true, data: { ...updated, items: order.items } };
    },

    invoicePlaceholder(orderId: string, buyerId: string): CommerceResult<{ orderId: string; buyerId: string; available: false }> {
      return { ok: true, data: { orderId, buyerId, available: false } };
    },

    reorderPlaceholder(orderId: string, buyerId: string): CommerceResult<{ orderId: string; buyerId: string; available: false }> {
      return { ok: true, data: { orderId, buyerId, available: false } };
    }
  };
}
