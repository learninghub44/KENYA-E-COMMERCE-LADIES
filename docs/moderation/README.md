# Moderation Workflow

Moderation is split between queue review and domain lifecycle actions.

## Queue Review

`createModerationService` exposes:

- `queue(actor, filters)` for seller, product, message, and report review queues.
- `reportedMessages(actor, filters)` for message report queues.
- `deleteMessage(actor, messageId, reason)` for soft deletion.
- `warnUser(actor, userId, reason)` for policy warnings.
- `suspendMessaging(actor, userId, reason)` for messaging privilege suspension.

All moderation actions require `admin.moderate`.

## Seller And Product Actions

Seller and product decisions are triggered through `createAdminService` and delegated to existing
Agent 3 and Agent 4 gateways. Agent 07 does not reimplement KYC verification or product ownership
rules.

## Notes

Moderation notes are stored through report records or action metadata in audit records. Future UI
surfaces should show both report notes and audit history on entity detail pages.

## Future AI Moderation

AI moderation should publish candidate queue items and suggested reasons only. Final enforcement
must remain a human or policy-engine action that uses the same `admin.moderate` path and audit
writer.
