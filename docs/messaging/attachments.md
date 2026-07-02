# Attachment Handling

Attachments are images only, stored in Cloudinary, under the `marketplace/messages` folder.

## Upload flow

1. Client sends base64 image data to a future `POST /api/messages/attachments` route handler.
2. The route handler calls `createCloudinaryAttachmentProvider(client).upload()`.
3. The provider validates MIME type and size **before** calling Cloudinary (`AttachmentValidationError`
   on failure), then uploads and returns a `PendingAttachment` (`url`, `cloudinaryPublicId`,
   `mimeType`, `width`, `height`, `bytes`).
4. The client includes the returned `PendingAttachment` array in the subsequent `send()` call.
   Attachments are persisted to `message_attachments` only once the message itself is created —
   an upload with no following `send()` simply leaves an orphaned Cloudinary asset, which a
   future cleanup job can garbage-collect by cross-referencing `message_attachments`.

## Validation rules

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  (`ALLOWED_ATTACHMENT_MIME_TYPES` in `lib/messaging/schemas.ts`).
- Max size: 8 MiB per attachment (`MAX_ATTACHMENT_BYTES`). Enforced both in the zod schema and
  again after upload (server-reported `bytes`), destroying the Cloudinary asset if the post-upload
  size check fails.
- Max attachments per message: 6 (`MAX_ATTACHMENTS_PER_MESSAGE`).

## Deletion

`AttachmentProvider.destroy(cloudinaryPublicId)` removes the asset from Cloudinary. This is not
currently wired to message soft-delete (soft-deleted messages retain their attachment rows and
Cloudinary assets for moderation review) — a future moderation agent can decide when to hard-purge
attachments tied to permanently removed content.
