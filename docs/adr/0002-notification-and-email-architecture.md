# ADR-0002: Notification, Event, and Email Architecture

**Status:** Accepted
**Date:** 2026-07-02
**Author:** Notifications & Platform Communications Engineer (Agent 8)

## Context

Agents 1-7 each produce state changes a user cares about (order placed, message received,
seller approved, product rejected, and so on). The platform needs one consistent way to turn
those changes into in-app notifications and transactional email, without every agent
reimplementing delivery, without notification/email work blocking the request that triggered
it, and without email provider outages affecting core commerce flows.

Following the pattern established by Agents 1-7, this is a service-first domain contract:
concrete Supabase repositories and Next.js route handlers are left for a follow-up wiring pass,
consistent with `docs/handoffs/agent-07.md`'s noted limitation.

## Decision

- **Durable event log + in-process bus.** Every domain event is first written to
  `public.platform_events` (source of truth), then fanned out synchronously in-process to
  subscribed handlers via `createEventBus`. Persisting before dispatch means the event is never
  lost even if a handler throws or the process restarts before handlers finish. A future agent
  can swap the in-process bus for a queue (e.g. Supabase Edge Function triggers, or a hosted
  queue) without changing the `EventRepository`/`EventHandler` contracts.
- **Generic recipient contract.** The dispatcher does not hardcode "orders have a buyerId" or
  "messages have a recipientId" logic. Every event payload that should notify someone carries a
  `recipientUserId` (and `recipientEmail` for email). This keeps `EVENT_TEMPLATES` (in
  `lib/notifications/event-templates.ts`) the single place a new event/notification pairing is
  added, with no changes needed to the dispatcher itself.
- **Preferences enforced at dispatch, not at read time.** The dispatcher checks
  `notification_preferences` before creating a notification or queuing an email, rather than
  creating everything and filtering on read. This keeps `notifications` and `email_outbox`
  free of records a user opted out of, which matters for both storage growth and audit clarity.
- **Security notifications cannot be disabled.** Enforced twice: a Postgres check constraint on
  `notification_preferences.security_notifications` (must be `true`), and an application-layer
  rejection in `preference-service.ts` if a caller tries to set it `false`. Account status
  changes are classified under the `security` category (there is no separate "account updates"
  preference in the required set), so suspensions and similar changes are always delivered.
- **Resend as the initial email provider**, selected for its native TypeScript SDK and
  transactional-email focus, matching the rest of the stack's developer-experience bias. The
  concrete `EmailProvider` implementation is swappable: `email-service.ts` depends only on the
  `EmailProvider` interface (`send(...)`), so switching providers later is a single adapter
  change, not a rewrite.
- **Async, at-least-once email delivery.** `email-service.ts` separates `queue` (fast, always
  succeeds unless the address is invalid) from `processQueue` (invoked by a worker/cron outside
  the request path). A failed send is retried up to `maxAttempts` (default 5) before being left
  in `failed` status for manual/alerting follow-up, rather than retried forever.
- **Delete is archive.** Notifications are never hard-deleted; "delete" in the API is a soft
  archive (`archived_at`), consistent with the soft-delete pattern already used for messages in
  Agent 6. This keeps notification history and audit trails intact.

## Alternatives Considered

- **Synchronous email send inline with the triggering request** (e.g. send the order
  confirmation email directly inside the order service). Rejected: couples core commerce flows
  to email provider latency/availability, which is explicitly called out as a risk in the task
  spec ("notification dispatch asynchronous so admin actions are not blocked").
- **A managed queue (e.g. a hosted message broker) from day one.** Rejected for this phase:
  adds infrastructure the platform doesn't yet need at current scale, and the `EventRepository`
  abstraction already leaves room to introduce one later without a rewrite.
- **Filtering notifications by preference at read time** instead of at dispatch time. Rejected:
  would still write unwanted rows, inflating storage and muddying audit/analytics queries over
  time.

## Consequences

- A worker/cron process must be scheduled to call `emailService.processQueue()` on an interval;
  this is not automatic yet and is called out as a known limitation in the Agent 8 handoff.
- Any future agent adding a new domain event must remember to include `recipientUserId` (and
  `recipientEmail` if email is desired) in the event payload, and register a template in
  `EVENT_TEMPLATES`. This is documented in `docs/events/event-flow.md`.
- Real-time in-app delivery (websockets/push) is out of scope for this ADR; see
  `docs/notifications/future-push-integration.md`.
