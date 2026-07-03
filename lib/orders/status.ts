import type { OrderStatus } from "./types";

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  draft: ["pending_payment", "pending", "cancelled"],
  pending_payment: ["paid", "pending", "cancelled"],
  pending: ["confirmed", "cancelled"],
  paid: ["confirmed", "processing", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready_for_shipment", "cancelled"],
  ready_for_shipment: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["completed", "returned"],
  completed: ["refunded", "returned"],
  cancelled: [],
  refunded: [],
  returned: ["refunded"]
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

export function assertOrderStatusTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrderStatus(from, to)) {
    throw new Error(`Cannot transition order from ${from} to ${to}.`);
  }
}

export function fulfillmentStatusFor(status: OrderStatus) {
  if (status === "shipped" || status === "delivered" || status === "completed") return "fulfilled" as const;
  if (status === "returned") return "returned" as const;
  return "unfulfilled" as const;
}

export function buyerCanCancel(status: OrderStatus): boolean {
  return status === "pending_payment" || status === "pending" || status === "paid" || status === "confirmed";
}
