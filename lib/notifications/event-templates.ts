import type {
  CreateNotificationInput,
  EmailTemplate,
  NotificationCategory,
  PlatformEvent,
  PlatformEventType
} from "./types";

/**
 * Declarative mapping from an event to what it produces. Each entry says which category the
 * in-app notification belongs to, and which email template (if any) should be queued for the
 * same event. Keeping this data-driven (rather than a chain of if/else per event) makes it
 * trivial for a future agent to add a new event without touching service logic.
 */
export type EventTemplate = {
  category: NotificationCategory;
  emailTemplate?: EmailTemplate | undefined;
  /** Builds the in-app notification title/body from the event payload. */
  toNotification(event: PlatformEvent, recipientUserId: string): Omit<CreateNotificationInput, "userId" | "sourceEventId" | "category">;
};

function str(payload: Record<string, unknown>, key: string, fallback = ""): string {
  const value = payload[key];
  return typeof value === "string" ? value : fallback;
}

export const EVENT_TEMPLATES: Record<PlatformEventType, EventTemplate> = {
  "order.created": {
    category: "orders",
    emailTemplate: "order_update",
    toNotification(event) {
      const orderNumber = str(event.payload, "orderNumber", event.entityId ?? "");
      return {
        type: "order.created",
        title: "Order placed",
        body: `Your order ${orderNumber} has been placed.`,
        data: event.payload
      };
    }
  },
  "order.status_changed": {
    category: "orders",
    emailTemplate: "order_update",
    toNotification(event) {
      const orderNumber = str(event.payload, "orderNumber", event.entityId ?? "");
      const status = str(event.payload, "status", "updated");
      return {
        type: "order.status_changed",
        title: "Order status updated",
        body: `Order ${orderNumber} is now ${status}.`,
        data: event.payload
      };
    }
  },
  "message.created": {
    category: "messaging",
    toNotification(event) {
      const senderName = str(event.payload, "senderName", "Someone");
      return {
        type: "message.created",
        title: "New message",
        body: `${senderName} sent you a message.`,
        data: event.payload
      };
    }
  },
  "message.read": {
    category: "messaging",
    toNotification(event) {
      return {
        type: "message.read",
        title: "Message read",
        body: "Your message was read.",
        data: event.payload
      };
    }
  },
  "seller.approved": {
    category: "seller",
    emailTemplate: "seller_approved",
    toNotification() {
      return {
        type: "seller.approved",
        title: "Seller application approved",
        body: "Congratulations! Your seller account has been approved.",
        data: {}
      };
    }
  },
  "seller.rejected": {
    category: "seller",
    emailTemplate: "seller_rejected",
    toNotification(event) {
      const reason = str(event.payload, "reason", "");
      return {
        type: "seller.rejected",
        title: "Seller application rejected",
        body: reason ? `Your seller application was rejected: ${reason}` : "Your seller application was rejected.",
        data: event.payload
      };
    }
  },
  "product.approved": {
    category: "seller",
    toNotification(event) {
      const name = str(event.payload, "productName", "Your product");
      return {
        type: "product.approved",
        title: "Product approved",
        body: `${name} is now live on the marketplace.`,
        data: event.payload
      };
    }
  },
  "product.rejected": {
    category: "seller",
    toNotification(event) {
      const name = str(event.payload, "productName", "Your product");
      const reason = str(event.payload, "reason", "");
      return {
        type: "product.rejected",
        title: "Product rejected",
        body: reason ? `${name} was rejected: ${reason}` : `${name} was rejected.`,
        data: event.payload
      };
    }
  },
  "review.created": {
    category: "reviews",
    toNotification(event) {
      return {
        type: "review.created",
        title: "New review",
        body: "You received a new review.",
        data: event.payload
      };
    }
  },
  "account.status_changed": {
    // No dedicated "account updates" preference exists (the required preference set is email,
    // in-app, marketing, order updates, messaging, and security), so account status changes are
    // treated as security-relevant and always delivered regardless of preferences.
    category: "security",
    emailTemplate: "security_alert",
    toNotification(event) {
      const status = str(event.payload, "status", "updated");
      return {
        type: "account.status_changed",
        title: "Account status changed",
        body: `Your account status is now ${status}.`,
        data: event.payload
      };
    }
  },
  "admin.announcement": {
    category: "announcements",
    toNotification(event) {
      return {
        type: "admin.announcement",
        title: str(event.payload, "title", "Platform announcement"),
        body: str(event.payload, "body", ""),
        data: event.payload
      };
    }
  }
};
