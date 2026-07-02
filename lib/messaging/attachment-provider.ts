import { ALLOWED_ATTACHMENT_MIME_TYPES, MAX_ATTACHMENT_BYTES, attachmentUploadSchema } from "./schemas";
import type { AttachmentProvider, AttachmentUploadInput, PendingAttachment } from "./types";

export type CloudinaryClient = {
  uploadImage(input: { fileBase64: string; folder: string; filename?: string | undefined }): Promise<{
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
  }>;
  destroy(publicId: string): Promise<void>;
};

const CLOUDINARY_MESSAGING_FOLDER = "marketplace/messages";

export class AttachmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttachmentValidationError";
  }
}

/**
 * Wraps a Cloudinary client behind the messaging domain's AttachmentProvider interface.
 * Validation (MIME type, size, presence) happens here before any network call.
 */
export function createCloudinaryAttachmentProvider(client: CloudinaryClient): AttachmentProvider {
  return {
    async upload(input: AttachmentUploadInput): Promise<PendingAttachment> {
      const parsed = attachmentUploadSchema.safeParse(input);
      if (!parsed.success) {
        throw new AttachmentValidationError(parsed.error.issues[0]?.message ?? "Invalid attachment upload input.");
      }
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(parsed.data.mimeType)) {
        throw new AttachmentValidationError(`Unsupported attachment type: ${parsed.data.mimeType}`);
      }

      const result = await client.uploadImage({
        fileBase64: parsed.data.fileBase64,
        folder: CLOUDINARY_MESSAGING_FOLDER,
        filename: parsed.data.filename
      });

      if (result.bytes > MAX_ATTACHMENT_BYTES) {
        await client.destroy(result.publicId).catch(() => undefined);
        throw new AttachmentValidationError(`Attachment exceeds the ${MAX_ATTACHMENT_BYTES} byte limit.`);
      }

      return {
        url: result.secureUrl,
        cloudinaryPublicId: result.publicId,
        mimeType: parsed.data.mimeType,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };
    },

    async destroy(cloudinaryPublicId: string): Promise<void> {
      await client.destroy(cloudinaryPublicId);
    }
  };
}
