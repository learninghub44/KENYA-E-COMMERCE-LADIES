# Notification Lifecycle

## States

A notification (`public.notifications`) moves through:

```
created --read_at set--> read
created --archived_at set--> archived   (read or unread)
read     --archived_at set--> archived
```

There is no hard delete from the API. "Delete" in the spec maps to **archive**
(`notification-service.ts#archive`), which sets `archived_at`. Archived notifications:

- Are excluded from `list()` by default (`includeArchived: true` to include them).
- Still count toward historical/audit queries.
- Are excluded from `unreadCount()` regardless of `read_at`.

## Creation

Notifications are created in exactly two ways, both internal (never directly exposed to an
end-user-facing route with a caller-supplied `userId`):

1. **Event-driven** — `dispatcher.ts` creates one notification per event via
   `notificationService.create`, after checking the recipient's preferences.
2. **Broadcast fan-out** — `broadcast-service.ts#publish` creates one notification per resolved
   recipient via `notificationService.createMany`, bypassing per-user preference checks (a
   broadcast is inherently a platform-wide/staff-targeted action, not a per-event opt-in).

## Read/unread

- `unreadCount(actor)` — count of the caller's own notifications where `read_at is null` and
  `archived_at is null`. Backed by a partial index
  (`idx_notifications_user_unread`) so this stays cheap as notification volume grows.
- `markAsRead(actor, notificationId)` — sets `read_at` on one notification. Requires ownership
  (`notification.userId === actor.userId`) or staff (`user.read.support`) for support
  investigations.
- `markAllAsRead(actor)` — bulk sets `read_at` on every unread notification for the caller;
  returns the count updated.

## Ownership and RBAC

Every notification-service method requires the `notification.read.own` permission (granted to
all roles) and enforces row ownership in the service layer as a fast-fail check, mirroring
`APIStandards.md`'s two-layer auth model — the real boundary is RLS on `public.notifications`
(`user_id = auth.uid()`), and the service check is the UX-facing fast fail.

## Categories

Categories are seeded in `public.notification_categories` and mirrored in
`NOTIFICATION_CATEGORIES`: `orders`, `messaging`, `seller`, `account`, `reviews`,
`announcements`, `security`. See `docs/events/event-flow.md` for which event produces which
category.
