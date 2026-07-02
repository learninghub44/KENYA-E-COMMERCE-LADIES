# Event Hooks

Messaging emits events for a future notification-delivery agent to consume. This feature does
**not** deliver notifications itself (no push/email/SMS) — it only publishes structured events
through the injected `MessagingEventPublisher`.

## `MessagingEventPublisher` events

| Event | Fired when |
| --- | --- |
| `conversation.created` | A brand-new conversation is created (not on reuse/reopen). |
| `message.new` | Any message (text or attachment) is successfully sent. |
| `message.read` | A participant marks a conversation's messages as read. |
| `message.deleted` | A message is soft-deleted. |

## `ModerationEventPublisher` events (via `message_moderation_events`)

| Event type | Fired when |
| --- | --- |
| `reported` | A participant calls `report()` on a message. |
| `deleted` | A message is soft-deleted (recorded for audit, in addition to `message.deleted`). |
| `user_blocked` | Placeholder — no code path emits this yet; reserved for a future blocking feature. |
| `suspicious_content` | Placeholder — reserved for a future AI moderation agent. |

Both publishers are optional dependencies (`deps.events?.publish`, `deps.moderation?.record`) so
the service layer works correctly in tests and in environments where a notification/moderation
agent hasn't been wired up yet.
