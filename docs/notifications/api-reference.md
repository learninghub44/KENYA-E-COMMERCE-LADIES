# API Reference

Consistent with the existing repo pattern (see `docs/handoffs/agent-07.md`), Agent 8 ships
service-first domain contracts. HTTP route handlers under `app/api/v1/notifications/...` are a
thin wiring layer over these functions, left for the route-handler wiring pass. Each function
below is the de facto API and documents request/response/error shape the way a route handler
will.

All list endpoints use cursor pagination (`cursor`, `limit`, response `nextCursor`), per
`APIStandards.md`. All results follow `{ ok: true, data }` / `{ ok: false, code, message,
status }`.

## Notifications (`lib/notifications/notification-service.ts`)

### List notifications
`notificationService.list(actor, filters)`
- Auth: authenticated, `notification.read.own`
- `filters`: `{ category?, unreadOnly?, includeArchived?, cursor?, limit? }` (`limit` capped at 100)
- Returns: `CursorPage<NotificationRecord>`

### Get unread count
`notificationService.unreadCount(actor)`
- Auth: authenticated, `notification.read.own`
- Returns: `number`

### Mark one as read
`notificationService.markAsRead(actor, notificationId)`
- Auth: owner, or staff with `user.read.support`
- Errors: `NOTIFICATION_NOT_FOUND` (404), `AUTHORIZATION_DENIED` (403)
- Returns: updated `NotificationRecord`

### Mark all as read
`notificationService.markAllAsRead(actor)`
- Auth: authenticated, `notification.read.own`
- Returns: `{ updated: number }`

### Delete (archive) notification
`notificationService.archive(actor, notificationId)`
- Auth: owner, or staff with `user.read.support`
- Errors: `NOTIFICATION_NOT_FOUND` (404), `AUTHORIZATION_DENIED` (403)
- Returns: updated `NotificationRecord` (with `archivedAt` set)

## Preferences (`lib/notifications/preference-service.ts`)

### Get preferences
`preferenceService.get(actor)`
- Auth: authenticated, `notification.preferences.manage`
- Returns: `NotificationPreferences`

### Update preferences
`preferenceService.update(actor, values)`
- Auth: authenticated, `notification.preferences.manage`
- `values`: any subset of `emailEnabled`, `inAppEnabled`, `marketingEmails`, `orderUpdates`,
  `messagingNotifications`. Passing `securityNotifications: false` is rejected.
- Errors: `SECURITY_NOTIFICATIONS_REQUIRED` (422), `AUTHORIZATION_DENIED` (403)
- Returns: updated `NotificationPreferences`

## Admin broadcasts (`lib/notifications/broadcast-service.ts`)

### Create broadcast
`broadcastService.create(actor, input)`
- Auth: `notification.broadcast.manage` (admin, super_admin)
- `input`: `{ title, body, severity?, audience?, audienceFilter?, expiresAt? }`
- Audited: `broadcast.created`
- Returns: `BroadcastRecord` (status `draft`)

### List broadcasts
`broadcastService.list(actor, filters)`
- Auth: `notification.broadcast.manage`
- Returns: `CursorPage<BroadcastRecord>`

### Publish broadcast
`broadcastService.publish(actor, broadcastId)`
- Auth: `notification.broadcast.manage`
- Resolves the audience, fans out one notification per recipient, marks the broadcast
  `published` with a `recipientCount`.
- Errors: `BROADCAST_NOT_FOUND` (404), `BROADCAST_ALREADY_PUBLISHED` (409),
  `AUTHORIZATION_DENIED` (403)
- Audited: `broadcast.published`
- Returns: updated `BroadcastRecord`

## Email (`lib/notifications/email-service.ts`)

These are internal/worker-facing, not exposed to end users directly.

### Queue email
`emailService.queue(input)`
- `input`: `{ userId?, toEmail, template, subject, payload?, sourceEventId? }`
- Errors: `INVALID_EMAIL` (422)
- Returns: `OutboundEmail` (status `pending`)

### Process queue
`emailService.processQueue(batchSize?)`
- Intended to run from a scheduled worker, not a request handler.
- Returns: `{ sent: number; failed: number }`
