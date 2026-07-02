import { z } from "zod";

export const CONFIG_TYPES = ["string", "number", "boolean", "json", "secret"] as const;
export type ConfigType = (typeof CONFIG_TYPES)[number];

export interface ConfigEntry {
  configKey: string;
  configValue: unknown;
  configType: ConfigType;
  description: string | null;
  isFeatureFlag: boolean;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetConfigInput {
  configKey: string;
  configValue: unknown;
  configType?: ConfigType;
  description?: string;
  isFeatureFlag?: boolean;
  isEncrypted?: boolean;
}

export const configEntrySchema = z.object({
  configKey: z.string().min(1).max(255),
  configValue: z.unknown(),
  configType: z.enum(CONFIG_TYPES).default("string"),
  description: z.string().optional(),
  isFeatureFlag: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
});

export interface CacheEntry {
  key: string;
  value: unknown;
  namespace: string;
  ttlSeconds: number | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  size: number;
}

export interface FileRecord {
  id: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storageProvider: string;
  storageBucket: string | null;
  publicUrl: string | null;
  checksum: string | null;
  entityType: string | null;
  entityId: string | null;
  uploadedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface StorageMetrics {
  storageProvider: string;
  totalBytes: number;
  totalFiles: number;
  orphanFiles: number;
  recordedAt: string;
}

export interface PaginationInput {
  cursor?: string;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}
