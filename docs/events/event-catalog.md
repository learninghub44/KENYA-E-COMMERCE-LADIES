# Event Catalog

All event types are enumerated in `PLATFORM_EVENT_TYPES` (`lib/notifications/types.ts`) and
mapped to notification/email content in `EVENT_TEMPLATES` (`lib/notifications/event-templates.ts`).

| Event type | Entity type | Notification category | Email template | Typical publisher |
| --- | --- | --- | --- | --- |
| `order.created` | `order` | `orders` | `order_update` | Agent 5 (Orders) |
| `order.status_changed` | `order` | `orders` | `order_update` | Agent 5 (Orders) |
| `message.created` | `message` | `messaging` | — | Agent 6 (Messaging) |
| `message.read` | `message` | `messaging` | — | Agent 6 (Messaging) |
| `seller.approved` | `seller` | `seller` | `seller_approved` | Agent 7 (Admin) / Agent 3 gateway |
| `seller.rejected` | `seller` | `seller` | `seller_rejected` | Agent 7 (Admin) / Agent 3 gateway |
| `product.approved` | `product` | `seller` | — | Agent 7 (Admin) / Agent 4 gateway |
| `product.rejected` | `product` | `seller` | — | Agent 7 (Admin) / Agent 4 gateway |
| `review.created` | `review` | `reviews` | — | Agent 9 (Reviews, future) |
| `account.status_changed` | `user` | `security` | `security_alert` | Agent 7 (Admin) / Agent 2 |
| `admin.announcement` | `broadcast` | `announcements` | — | Agent 8 (broadcast publish) |

`review.created` is defined now so Agent 9 can publish to it without a schema/type change; no
publisher exists yet.

## Adding a new event

1. Add the string to `PLATFORM_EVENT_TYPES` in `lib/notifications/types.ts`.
2. Add an entry to `EVENT_TEMPLATES` in `lib/notifications/event-templates.ts` — category, an
   optional email template, and a `toNotification` formatter.
3. If the event should ever be email-eligible, make sure the publishing agent's payload includes
   `recipientEmail` in addition to `recipientUserId` (see `event-flow.md`).
4. No changes are needed in `dispatcher.ts` or the notification/email services — the mapping is
   fully data-driven.
