# Conversation Lifecycle

## States

`active -> archived -> active (reopened)`

A conversation always belongs to exactly one buyer (`buyer_id`) and one seller (`seller_id`), and
is optionally scoped to a `product_id`, `variant_id`, and/or `order_id`. There is exactly **one**
conversation per `(buyer_id, seller_id, product_id)` combination — `createConversationService().start()`
finds and reuses (or reopens) the existing conversation instead of creating a duplicate.

## Creating a conversation

`start()` is idempotent per buyer/seller/product:

- If no conversation exists, one is created with `status = 'active'` and a `conversation.created`
  event is published.
- If an active conversation exists, it is returned as-is.
- If an archived conversation exists, it is reopened (`status` set back to `active`) and returned.

## Archive / Reopen

Either participant may archive or reopen a conversation via `archive()` / `reopen()`. Archiving
does not delete any data — archived conversations are excluded from default list queries
(`includeArchived: false`) but remain fully readable.

## Soft delete (per participant)

`deleteForParticipant()` sets `buyer_deleted_at` or `seller_deleted_at` depending on the caller's
role. This hides the conversation from that participant's list only — the other participant still
sees the full conversation and message history. Messages themselves are never deleted by this
action.

## Unread counts and last-message preview

`conversations.buyer_unread_count`, `seller_unread_count`, `last_message_at`, and
`last_message_preview` are maintained by the `on_message_inserted` database trigger, not by
application code, so they stay correct even if a message is inserted outside the service layer
(e.g. a future migration/backfill). `markRead()` resets the caller's unread counter and stamps
`read_at` on the other participant's unread messages.

## Product / order context

`product_snapshot` is a denormalized JSON snapshot (name, slug, image, price at time of
conversation start) so both parties can see what the conversation concerns even if the product
listing changes later. `order_id` links a conversation to a specific seller-scoped order
(`orders.id`, per Agent 05's handoff) — not the buyer-facing parent order group number — so each
seller's conversation about a multi-vendor order stays correctly scoped to that seller's order.
