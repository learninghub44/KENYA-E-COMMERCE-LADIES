# Event Flow

## End-to-end path

```
Agent N service (order, message, seller, product, admin, ...)
        |
        v
eventBus.publish({ eventType, entityType, entityId, actorId, payload })
        |
        v
EventRepository.write(...)  -->  public.platform_events (durable log, source of truth)
        |
        v
subscribed handlers run (from registerNotificationHandlers, see dispatcher.ts)
        |
        +--> preferences.get(recipientUserId)
        |
        +--> if in-app allowed: notifications.create(...)  --> public.notifications
        |
        +--> if email allowed and template exists: email.queue(...)  --> public.email_outbox
        |
        v
EventRepository.markProcessed(event.id)
```

## The recipient contract

The dispatcher is intentionally domain-agnostic: it does not know that orders have a buyer or
that messages have a recipient. Every event payload that should reach a specific person must
include:

```ts
{
  recipientUserId: string;   // required for any in-app or email delivery
  recipientEmail?: string;   // required only if the event's template includes an email
  // ...event-specific fields (orderNumber, status, senderName, etc.) used by
  // EVENT_TEMPLATES[eventType].toNotification
}
```

If `recipientUserId` is absent, the dispatcher silently skips delivery for that event (this is
correct for events that don't target a single user, though today every catalog entry does
target one). `admin.announcement` is the one exception in practice — it's normally not published
per-recipient through the generic bus at all; broadcast fan-out instead calls
`notifications.createMany` directly from `broadcast-service.ts#publish`, bypassing the event bus
entirely, since a broadcast already knows its exact recipient list from the audience resolver.

## Delivery guarantees

- **At-least-once, not exactly-once.** The event is durably written before handlers run. If the
  process crashes between `write` and `markProcessed`, the event row still exists with
  `processed_at IS NULL` and can be reprocessed by a recovery job (not yet implemented — see
  Known Limitations in `docs/handoffs/agent-08.md`).
- **Handler isolation.** `createEventBus.publish` awaits all subscribed handlers via
  `Promise.all`, but wraps each handler call in its own try/catch. One handler throwing (e.g. a
  bad template) never prevents another handler from running, and never propagates back to the
  agent that published the event — order creation, seller approval, etc. never fails because
  notification delivery had a bug.
- **Async by construction, not by accident.** Because `publish` is itself `async` and callers
  are expected to `await` it only for the durability guarantee (the row exists), the actual
  email send inside a handler is further deferred to `email-service.ts#processQueue`, run by a
  separate worker. Two layers of decoupling: event dispatch decoupled from the triggering
  request's response, and email send decoupled from event dispatch.

## Publishing from another agent

Example (illustrative — actual call site lives in the order service once wired):

```ts
await eventBus.publish({
  eventType: "order.status_changed",
  entityType: "order",
  entityId: order.id,
  actorId: actorUserId,
  payload: {
    recipientUserId: order.buyerId,
    recipientEmail: order.buyerEmail,
    orderNumber: order.orderNumber,
    status: order.status
  }
});
```
