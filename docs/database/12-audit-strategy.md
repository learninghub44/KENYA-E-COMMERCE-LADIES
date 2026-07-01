# Audit Strategy

## Purpose

Audit data supports security review, dispute handling, moderation accountability, operational debugging, and compliance.

## Audit Tables

| Table | Purpose |
|---|---|
| `audit_logs` | Sensitive or staff-visible mutation history. |
| `activity_logs` | Lower-risk user and system activity history. |
| `analytics_events` | Product and behavior events for analytics pipelines. |

## Audit Log Shape

Audit logs should capture:

- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `old_values`
- `new_values`
- `ip_address`
- `user_agent`
- `created_at`

## What Must Be Audited

- Role grants and revocations.
- Seller status changes.
- KYC decision changes.
- Product moderation decisions.
- Order status changes.
- Refund and payment state changes.
- Report resolution.
- Feature flag changes.
- CMS publish/unpublish events.
- Staff reads or exports of sensitive data, where feasible.

## What Must Not Be Logged

Do not log:

- Passwords or auth tokens.
- Payment credentials.
- Full KYC documents.
- Full card or bank details.
- Raw PII unless strictly required for an auditable business event.

## Write Path

Audit writes should happen in trusted server-side code or database triggers for critical tables. Browser clients should not directly insert authoritative audit records except for low-risk activity events handled by a controlled API.

## Retention

Audit logs have longer retention than activity logs. See the data retention policy for exact retention categories.
