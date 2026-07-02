import { z } from "zod";

export const MESSAGE_EDIT_WINDOW_MINUTES = 15;
export const MAX_ATTACHMENTS_PER_MESSAGE = 6;
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export const productSnapshotSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(200),
  productSlug: z.string().min(1).max(220),
  variantId: z.string().uuid().nullable().optional(),
  variantTitle: z.string().max(200).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  priceMinor: z.number().int().min(0).nullable().optional(),
  currency: z.string().length(3).nullable().optional()
});

export const startConversationSchema = z.object({
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  productId: z.string().uuid().nullable().optional(),
  variantId: z.string().uuid().nullable().optional(),
  orderId: z.string().uuid().nullable().optional(),
  productSnapshot: productSnapshotSchema.nullable().optional()
});

export const pendingAttachmentSchema = z.object({
  url: z.string().url(),
  cloudinaryPublicId: z.string().min(1).max(300),
  mimeType: z.enum(ALLOWED_ATTACHMENT_MIME_TYPES),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  bytes: z.number().int().positive().max(MAX_ATTACHMENT_BYTES).nullable().optional()
});

export const sendMessageSchema = z
  .object({
    conversationId: z.string().uuid(),
    senderId: z.string().uuid(),
    body: z.string().trim().min(1).max(4000).optional(),
    replyToMessageId: z.string().uuid().nullable().optional(),
    attachments: z.array(pendingAttachmentSchema).max(MAX_ATTACHMENTS_PER_MESSAGE).optional()
  })
  .refine((value) => Boolean(value.body) || (value.attachments && value.attachments.length > 0), {
    message: "A message requires either body text or at least one attachment."
  });

export const editMessageSchema = z.object({
  messageId: z.string().uuid(),
  editorId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000)
});

export const deleteMessageSchema = z.object({
  messageId: z.string().uuid(),
  actorId: z.string().uuid()
});

export const markReadSchema = z.object({
  conversationId: z.string().uuid(),
  recipientId: z.string().uuid()
});

export const archiveConversationSchema = z.object({
  conversationId: z.string().uuid(),
  actorId: z.string().uuid()
});

export const searchConversationsSchema = z.object({
  participantId: z.string().uuid(),
  role: z.enum(["buyer", "seller"]),
  query: z.string().trim().min(1).max(200),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20)
});

export const reportMessageSchema = z.object({
  messageId: z.string().uuid(),
  actorId: z.string().uuid(),
  reason: z.string().trim().min(2).max(500)
});

export const attachmentUploadSchema = z.object({
  fileBase64: z.string().min(1),
  mimeType: z.enum(ALLOWED_ATTACHMENT_MIME_TYPES),
  filename: z.string().max(200).optional()
});
