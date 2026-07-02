# Agent 08 Handoff

## Features Implemented

- **Notification engine**: in-app notifications, list with cursor pagination, unread count,
  mark one/all as read, archive ("delete"), notification categories.
- **Event system**: durable event log (`platform_events`) + in-process event bus
  (`createEventBus`), data-driven event -> notification/email mapping (`EVENT_TEMPLATES`)
  covering new order, order status change, new message, message read, seller approved/rejected,
  product approved/rejected, review created (stub for Agent 9), account status change, and admin
  announcement.
- **Email notifications**: transactional email queue (`email_outbox`) and async worker-facing
  `processQueue`, behind a swappable `EmailProvider` interface (Resend selected as the initial
  provider — see ADR-0002). Templates: email verification, welcome, order update, seller
  approved/rejected, password reset, security alert.
- **User preferences**: email, in-app, marketing, order updates, messaging notifications, and
  security notifications (security cannot be disabled — enforced at both DB constraint and
  service layer).
- **Admin broadcasts**: create (draft), list, publish (resolves audience, fans out one
  notification per recipient, marks published with a recipient count). RBAC-gated and audited.
- **Security**: every notification/preference operation enforces row ownership (or staff
  `user.read.support` for support investigations) on top of RLS; broadcasts require
  `notification.broadcast.manage`; all broadcast mutations write to the shared admin audit log.
- **Performance**: cursor pagination on notification and broadcast lists; a partial index for
  unread-count queries (`idx_notifications_user_unread`); `createMany` batch insert for
  broadcast fan-out; email processed in worker batches, not per-request.

## APIs Exposed

- `lib/notifications/createNotificationService` — list, unreadCount, markAsRead, markAllAsRead,
  archive, create/createMany (internal).
- `lib/notifications/createPreferenceService` — get, update.
- `lib/notifications/createEmailService` — queue, processQueue.
- `lib/notifications/createBroadcastService` — create, list, publish.
- `lib/notifications/createEventBus` — subscribe, publish.
- `lib/notifications/registerNotificationHandlers` — wires the event bus to notification/email
  dispatch.

Full request/response/error contract for each function is in `docs/notifications/api-reference.md`.

## Event Architecture

See `docs/events/event-flow.md` and `docs/events/event-catalog.md`. Summary: every domain event
is durably written to `platform_events` before any handler runs, so a handler failure never
loses the event and never blocks the publisher. Notification/email creation happens
asynchronously relative to the request that triggered the event. Publishing agents must include
`recipientUserId` (and `recipientEmail` for email-eligible events) in the event payload — the
dispatcher does not hardcode per-domain recipient logic.

## Email Architecture

See `docs/notifications/email-architecture.md`. Summary: `queue()` is fast and request-safe
(single insert); `processQueue()` is meant for a scheduled worker and sends through a pluggable
`EmailProvider`. Failed sends retry up to 5 attempts before being left `failed` for manual
follow-up. Preferences gate whether an email is queued at all, except security alerts, which
always send.

## Tests Completed

`pnpm test` passes (78/78 across the repo, 19 new in `lib/notifications`).

Coverage added for:

- Event creation and durable persistence, including handler-failure isolation.
- Notification dispatch from events, including preference gating (email disabled, in-app
  disabled) and the always-on security path.
- Notification list/unread-count/read/bulk-read/archive, including ownership enforcement and
  staff support access.
- Preference get/update, including the security-notifications-cannot-be-disabled guarantee at
  the service layer.
- Email queue validation, batch processing with mixed success/failure outcomes.
- Admin broadcast RBAC denial, create -> publish -> audit flow, fan-out count, and the
  already-published guard.

## Known Limitations

- Concrete Supabase repositories, the Resend `EmailProvider` adapter, and HTTP route handlers
  under `app/api/v1/notifications/...` are not implemented in this branch — this follows the
  existing repo pattern of service-first domain contracts (see `docs/handoffs/agent-07.md`).
- No worker/cron is scheduled yet to call `emailService.processQueue()`; queued email will sit
  `pending` until one is wired up.
- No event-replay/recovery job for events left with `processed_at IS NULL` after a crash
  between write and processing.
- Push notifications and real-time (websocket) in-app delivery are out of scope — see
  `docs/notifications/future-push-integration.md` for the integration points left for that work.
- `review.created` is defined in the event catalog with no current publisher, anticipating
  Agent 9.

## Recommendations For Agent 9

- When a review is created, publish `review.created` with `recipientUserId` set to the seller
  (and buyer, if you want a "your review was posted" confirmation — that would need a second
  publish or a second recipient field convention) and `recipientEmail` if you want email
  delivery. No changes are needed on the Agent 8 side; the event and notification category
  already exist.
- If ratings/reviews need their own preference toggle beyond the existing `reviews` category
  behavior (currently follows general `emailEnabled`/`inAppEnabled`, no dedicated toggle), add
  it to `notification_preferences` in a new migration rather than overloading an existing column.
- Reuse `AdminActor` and the `notification.read.own` / `admin.moderate` permission patterns
  already established, rather than inventing new actor shapes for review moderation.
