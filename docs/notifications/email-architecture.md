# Email Architecture

## Provider

Resend is the selected provider (ADR-0002: `docs/adr/0002-notification-and-email-architecture.md`).
The service layer never depends on Resend directly — only on the `EmailProvider` interface:

```ts
type EmailProvider = {
  send(input: {
    toEmail: string;
    subject: string;
    template: EmailTemplate;
    payload: Record<string, unknown>;
  }): Promise<{ providerMessageId: string }>;
};
```

A concrete `ResendEmailProvider` implementing this interface (calling the Resend API/SDK with
the platform's API key from an environment variable, never hardcoded) is the integration work
left for the wiring pass — see Known Limitations in `docs/handoffs/agent-08.md`.

## Templates

| Template | Trigger |
| --- | --- |
| `email_verification` | New account sign-up (Agent 2) |
| `welcome` | Email verified (Agent 2) |
| `order_update` | `order.created`, `order.status_changed` |
| `seller_approved` | `seller.approved` |
| `seller_rejected` | `seller.rejected` |
| `password_reset` | Password reset requested (Agent 2) |
| `security_alert` | `account.status_changed`, new/suspicious sign-in (Agent 2) |

Templates are an enum (`EMAIL_TEMPLATES`), not free text, so a typo'd template name is a
compile-time error rather than a silent no-op in production.

## Queue lifecycle

```
enqueue -> pending -> (worker claims) -> sending -> sent
                                              \-> failed (retried up to maxAttempts, default 5)
```

- `emailService.queue(input)` — validates the recipient address, writes a `pending` row to
  `email_outbox`, returns immediately. This is the only part of the flow allowed to run inside
  a user-facing request; it's a single insert with no external network call.
- `emailService.processQueue(batchSize)` — meant to run on a schedule (cron / worker), outside
  any request path. Claims up to `batchSize` pending emails, calls the provider once per email,
  and marks each `sent` or `failed` independently, so one provider error never blocks the batch.
- Emails that exhaust `maxAttempts` stay `failed` for manual/alerting follow-up rather than
  retrying indefinitely — an indefinite retry loop against a provider that is rejecting a given
  address (e.g. malformed/bounced) would waste quota without ever succeeding.

## Preferences gating

Before an email is queued, the dispatcher (`dispatcher.ts`) checks the recipient's
`notification_preferences`:

- `email_enabled = false` blocks all non-security email.
- `order_updates = false` blocks `order_update` emails specifically.
- `messaging_notifications = false` blocks messaging-related email (no dedicated email template
  today, but the gate exists for when one is added).
- `security_notifications` cannot be `false` (enforced at both the DB and service layer), so
  security-classified email always sends.

## Idempotency and duplicate sends

`email_outbox` rows are keyed by `source_event_id` where applicable, so a future retry of event
processing can check for an existing outbox row for the same event before queuing a duplicate.
The current dispatcher always queues on every event delivery (events are expected to be
published once), but the column is there so a future at-least-once event replay doesn't
double-send.
