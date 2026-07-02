import { z } from "zod";

/// Supported storage providers
export const STORAGE_PROVIDERS = ["cloudinary", "supabase", "s3", "local"] as const;
export type StorageProvider = (typeof STORAGE_PROVIDERS)[number];

/// Allowed MIME types per upload category
export const ALLOWED_MIME_TYPES = {
  productImages: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  sellerDocuments: ["application/pdf", "image/jpeg", "image/png"],
  kycDocuments: ["application/pdf", "image/jpeg", "image/png"],
  reviewImages: ["image/jpeg", "image/png", "image/webp"],
  messageAttachments: ["image/jpeg", "image/png", "application/pdf", "application/zip"],
  storeBranding: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  userAvatars: ["image/jpeg", "image/png", "image/webp", "image/avif"],
} as const;

export type UploadCategory = keyof typeof ALLOWED_MIME_TYPES;

/// Size limits per category (in bytes)
export const SIZE_LIMITS: Record<UploadCategory, number> = {
  productImages: 10 * 1024 * 1024,
  sellerDocuments: 20 * 1024 * 1024,
  kycDocuments: 20 * 1024 * 1024,
  reviewImages: 10 * 1024 * 1024,
  messageAttachments: 25 * 1024 * 1024,
  storeBranding: 10 * 1024 * 1024,
  userAvatars: 5 * 1024 * 1024,
};

export interface UploadInput {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  buffer: Buffer;
  category: UploadCategory;
  entityType?: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface UploadResult {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  width?: number | undefined;
  height?: number | undefined;
  format?: string | undefined;
  checksum: string;
  provider: StorageProvider;
}

export interface DeleteInput {
  publicId: string;
  provider: StorageProvider;
}

export interface FileValidationInput {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  category: UploadCategory;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export const uploadInputSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().positive(),
  buffer: z.instanceof(Buffer),
  category: z.enum(Object.keys(ALLOWED_MIME_TYPES) as [string, ...string[]]),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const fileValidationSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().positive(),
  category: z.enum(Object.keys(ALLOWED_MIME_TYPES) as [string, ...string[]]),
});

export interface StorageProviderAdapter {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(input: DeleteInput): Promise<void>;
  getSignedUploadUrl?(fileName: string, mimeType: string): Promise<{ url: string; publicId: string }>;
  getPublicUrl(publicId: string): string;
}

export interface StorageService {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(input: DeleteInput): Promise<void>;
  validate(input: FileValidationInput): FileValidationResult;
  getAdapter(): StorageProviderAdapter;
}
