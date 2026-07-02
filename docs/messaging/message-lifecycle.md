# Message Lifecycle

## Sending

`createMessageService().send()` requires the caller to already be a verified participant
(buyer id match, or seller management permission resolved by the caller against Agent 02's
permission system / `current_user_can_manage_seller`). A message must have a `body` (1–4000
chars) and/or between 1–6 attachments; both cannot be empty. An optional `replyToMessageId` must
reference an existing message in the same conversation.

Sending a message triggers the `on_message_inserted` database trigger, which updates the parent
conversation's `last_message_at`, `last_message_preview`, and the recipient's unread counter, and
publishes a `message.new` event.

## Delivered / Read status

- `sent`: implicit — the row exists.
- `delivered`: set via `markDelivered()`, intended to be called when the recipient's client
  acknowledges receipt (e.g. on conversation open / socket ack from a future real-time layer).
- `read`: set via `markRead()`, which also resets the reader's unread counter on the conversation
  and publishes `message.read`.

Both are tracked with `delivered_at` / `read_at` timestamps rather than an enum, so partial read
state (some messages read, some not) is representable per-message.

## Editing

Only the sender may edit their own message, and only within `MESSAGE_EDIT_WINDOW_MINUTES`
(15 minutes) of `created_at`, enforced in `message-service.ts` — not just at the UI layer.
Editing sets `edited_at`, which clients should use to render an "edited" indicator. Attachments
cannot be changed on edit; the message must be deleted and resent to change attachments.

## Soft delete

`softDelete()` sets `deleted_at` / `deleted_by` instead of removing the row. Only the sender (or
staff) may delete a message. Deleted messages remain in the database for conversation integrity
and moderation review, but service/repository read paths should render them as a "message
deleted" placeholder rather than returning `body`/`attachments` to non-staff clients. Deleting a
message also records a `deleted` moderation event and publishes `message.deleted`.

## Reply threading

`reply_to_message_id` is a simple, single-level reference (not a full thread tree). It is
validated at send-time to belong to the same conversation.
