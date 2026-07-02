import type { EventBus } from "./event-bus.js";
import type { EmailService } from "./email-service.js";
import { EVENT_TEMPLATES } from "./event-templates.js";
import type {
  NotificationPreferenceRepository,
  NotificationPreferences,
  NotificationRepository,
  PlatformEvent,
  PlatformEventType
} from "./types.js";

export type DispatcherDependencies = {
  bus: EventBus;
  notifications: NotificationRepository;
  preferences: NotificationPreferenceRepository;
  email: EmailService;
};

/**
 * Every event payload that should reach a specific person must include `recipientUserId` and,
 * for email, `recipientEmail`. Keeping this contract generic (rather than the dispatcher knowing
 * "orders have a buyerId") means a new agent can plug a new event type into `EVENT_TEMPLATES`
 * without touching this file.
 */
type RecipientPayload = Record<string, unknown> & {
  recipientUserId?: string | undefined;
  recipientEmail?: string | undefined;
};

function preferenceGateFor(eventType: PlatformEventType, prefs: NotificationPreferences): { inApp: boolean; email: boolean } {
  const category = EVENT_TEMPLATES[eventType].category;

  if (category === "security") {
    // Security notifications are never suppressed, in-app or by email.
    return { inApp: true, email: true };
  }

  const categoryEmailAllowed =
    category === "orders" ? prefs.orderUpdates : category === "messaging" ? prefs.messagingNotifications : true;

  return {
    inApp: prefs.inAppEnabled,
    email: prefs.emailEnabled && categoryEmailAllowed
  };
}

/**
 * Registers one handler per event type declared in `EVENT_TEMPLATES`. Each handler creates the
 * in-app notification (if the recipient has in-app notifications enabled) and queues the
 * matching transactional email (if one is defined and the recipient allows it). Handler errors
 * are swallowed by the event bus itself, so a broken template never blocks the publisher.
 */
export function registerNotificationHandlers(deps: DispatcherDependencies): void {
  for (const eventType of Object.keys(EVENT_TEMPLATES) as PlatformEventType[]) {
    deps.bus.subscribe(eventType, async (event: PlatformEvent) => {
      const payload = event.payload as RecipientPayload;
      const recipientUserId = payload.recipientUserId;
      if (!recipientUserId) return;

      const template = EVENT_TEMPLATES[eventType];
      const prefs = await deps.preferences.get(recipientUserId);
      const gate = preferenceGateFor(eventType, prefs);

      if (gate.inApp) {
        const content = template.toNotification(event, recipientUserId);
        await deps.notifications.create({
          userId: recipientUserId,
          category: template.category,
          sourceEventId: event.id,
          ...content
        });
      }

      if (gate.email && template.emailTemplate && payload.recipientEmail) {
        const content = template.toNotification(event, recipientUserId);
        await deps.email.queue({
          userId: recipientUserId,
          toEmail: payload.recipientEmail,
          template: template.emailTemplate,
          subject: content.title,
          payload: event.payload,
          sourceEventId: event.id
        });
      }
    });
  }
}
