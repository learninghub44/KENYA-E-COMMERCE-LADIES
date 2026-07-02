# Notifications & Platform Communications

**Owning agent:** Agent 8
**Code:** `lib/notifications/`
**Migration:** `supabase/migrations/202607020005_notifications_and_communications.sql`

## What this covers

- In-app notifications: create, list, unread count, mark read (single/bulk), archive ("delete").
- Per-user notification preferences, with security notifications pinned always-on.
- A durable event log (`platform_events`) and in-process event bus that Agents 1-7 publish to.
- Transactional email queue (`email_outbox`) processed asynchronously through a pluggable
  `EmailProvider` (Resend by default — see ADR-0002).
- Admin broadcasts: platform announcements, maintenance notices, and emergency alerts, fanned
  out to notifications for a resolved audience.

## Module map

| File | Responsibility |
| --- | --- |
| `types.ts` | Domain types and repository/provider interfaces. |
| `event-bus.ts` | Publish/subscribe over the durable event log. |
| `event-templates.ts` | Data-driven mapping: event type -> notification content + email template. |
| `dispatcher.ts` | Wires the event bus to notification creation and email queuing, honoring preferences. |
| `notification-service.ts` | User-facing CRUD/read surface: list, unread count, mark read, archive. |
| `preference-service.ts` | Get/update a user's notification preferences. |
| `email-service.ts` | Queue email; process the queue against an `EmailProvider`. |
| `broadcast-service.ts` | Admin broadcast create/list/publish, RBAC + audit gated. |

See `docs/notifications/api-reference.md`, `docs/notifications/lifecycle.md`, and
`docs/notifications/email-architecture.md` for details on each area, and
`docs/events/` for the event system specifically.
