# API Reference

No `app/api` route handlers exist in the repository yet (same known limitation Agent 05 left for
commerce). The functions below are the service layer route handlers should call once the
`app/api` scaffold lands, following `docs/APIStandards.md`.

## `createConversationService(deps)`

| Method | Purpose |
| --- | --- |
| `start(input)` | Create or reuse/reopen the conversation for a buyer/seller/product combo. |
| `getForParticipant(conversationId, participantId, role)` | Fetch one conversation, enforcing participant ownership. |
| `listForBuyer(buyerId, cursor?, limit?, includeArchived?)` | Cursor-paginated conversation list for a buyer. |
| `listForSeller(sellerId, cursor?, limit?, includeArchived?)` | Cursor-paginated conversation list for a seller. |
| `search(input)` | Search a participant's conversations. |
| `archive(input, role)` | Archive a conversation. |
| `reopen(input, role)` | Reopen an archived conversation. |
| `deleteForParticipant(conversationId, participantId, role)` | Soft-delete for one participant only. |

## `createMessageService(deps)`

| Method | Purpose |
| --- | --- |
| `send(input, senderIsSeller)` | Send a text and/or image message. |
| `listByConversation(conversationId, participantId, senderIsSeller, cursor?, limit?)` | Cursor-paginated message list. |
| `searchByConversation(conversationId, participantId, senderIsSeller, query, cursor?, limit?)` | Full-text search within a conversation. |
| `edit(input)` | Edit a message body within the edit window. |
| `softDelete(input, actorIsStaff?)` | Soft-delete a message. |
| `markRead(input, role)` | Mark unread messages as read and reset the unread counter. |
| `markDelivered(conversationId, recipientId)` | Mark undelivered messages as delivered. |
| `report(input)` | Record a `reported` moderation event against a message. |

## `createCloudinaryAttachmentProvider(client)`

| Method | Purpose |
| --- | --- |
| `upload(input)` | Validate and upload an image attachment. |
| `destroy(cloudinaryPublicId)` | Remove an attachment from Cloudinary. |

## Result shape

Every service method returns `MessagingResult<T>`:

```ts
type MessagingResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };
```

`code` values in use: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `FORBIDDEN` (403),
`MESSAGE_DELETED` (409), `EDIT_WINDOW_EXPIRED` (409). Route handlers should map `status` directly
onto the HTTP response, per `docs/APIStandards.md`.
