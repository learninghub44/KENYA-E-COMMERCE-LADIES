# Messages Feature

Domain implementation lives in `lib/messaging` (`createMessageService`, `createConversationService`,
`createCloudinaryAttachmentProvider`). UI and route handlers should call these with
Supabase-backed repositories once `app/api` exists, matching the pattern established by
`features/cart` and `features/orders`.

See `docs/messaging/` for the conversation/message lifecycle, API reference, and security model.
