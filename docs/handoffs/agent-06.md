# Agent 06 Buyer-Seller Messaging Handoff

## Features Implemented

- Conversation service: create-or-reuse per buyer/seller/product, archive, reopen, per-participant
  soft delete, list (buyer/seller), search.
- Message service: send (text and/or up to 6 image attachments), reply-to threading, edit within a
  configurable window, soft delete, delivered/read receipts, full-text search within a
  conversation, moderation reporting.
- Cloudinary attachment provider wrapper with MIME/size validation before and after upload.
- Database trigger (`on_message_inserted`) that keeps `last_message_at`, `last_message_preview`,
  and per-participant unread counters correct independent of application code.
- Moderation event hooks (`reported`, `deleted`, `user_blocked` placeholder,
  `suspicious_content` placeholder) with no AI moderation logic attached.
- Messaging event publisher hooks (`conversation.created`, `message.new`, `message.read`,
  `message.deleted`) with no notification delivery attached.

## APIs Exposed In Code

`lib/messaging`:
- `createConversationService`
- `createMessageService`
- `createCloudinaryAttachmentProvider`
- zod schemas and shared messaging types

See `docs/messaging/api-reference.md` for the full method table and result shape.

## Conversation Model

One conversation per `(buyer_id, seller_id, product_id)` — enforced by a unique index
(`product_id` coalesced to a nil UUID so general, non-product conversations are also
deduplicated). A conversation may additionally reference `variant_id` and `order_id`, and carries
a `product_snapshot` for display. See `docs/messaging/conversation-lifecycle.md`.

## Message Lifecycle

`sent -> delivered -> read`, tracked via `delivered_at`/`read_at` timestamps rather than an enum.
Edits are restricted to the sender, within `MESSAGE_EDIT_WINDOW_MINUTES` (15) of send. Deletes are
soft (`deleted_at`/`deleted_by`), never a hard row removal. See
`docs/messaging/message-lifecycle.md`.

## Attachment Integration

Cloudinary only, images only (`image/jpeg`, `image/png`, `image/webp`, `image/gif`), max 8 MiB,
max 6 per message, folder `marketplace/messages`. See `docs/messaging/attachments.md`.

## Event Hooks

See `docs/messaging/event-hooks.md` for the full table. Both `MessagingEventPublisher` and
`ModerationEventPublisher` are optional service dependencies — no delivery or AI logic lives in
this feature.

## Database Changes

`supabase/migrations/202607020004_messaging_engine.sql`:
- Adds `conversations`, `messages`, `message_attachments`, `message_moderation_events`.
- Adds `on_message_inserted` trigger for unread counters and last-message preview.
- Adds RLS policies reusing Agent 01's `current_user_can_manage_seller` /
  `current_user_is_staff` helpers — no duplicated authorization logic.

## Tests Completed

`pnpm test` passes: 48 tests across 14 suites (15 new tests in `lib/messaging/messaging-service.test.ts`).

Coverage includes: conversation create/reuse/reopen, non-participant rejection, message send with
validation (body-or-attachment requirement), non-participant send rejection, edit window
enforcement and sender-only editing, soft delete preserving the row, and read-receipt unread
counter reset.

## Known Limitations

- No `app/api` route handlers exist in the repo yet (same limitation Agent 05 left) — services are
  ready to wire once the route scaffold lands.
- No Supabase repository adapters were added, matching the Agent 03/04/05 repository-injection
  pattern; `ConversationRepository`/`MessageRepository` are interfaces only.
- `markDelivered` exists but nothing currently calls it automatically — a future real-time layer
  or route handler should call it when a client opens/syncs a conversation.
- `user_blocked` and `suspicious_content` moderation event types are placeholders with no
  triggering code path yet.

## Recommendations For Agent 7

- Admin moderation tooling can read `message_moderation_events` directly (staff-only RLS already
  in place) without touching `lib/messaging` or `features/messages`.
- When building notification delivery, subscribe to the `MessagingEventPublisher` events rather
  than polling `messages`/`conversations` directly.
- If adding user blocking, extend the participant checks in `message-service.ts`'s `send()` rather
  than adding blocking logic at the route-handler layer, to keep the rule enforced everywhere the
  service is called.
