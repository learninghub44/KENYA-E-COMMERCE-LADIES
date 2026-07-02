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

export type HealthStatus = "healthy" | "warning" | "critical";

export interface HealthCheckResult {
  service: string;
  status: HealthStatus;
  message: string;
  latencyMs: number;
  checkedAt: string;
}

export interface HealthReport {
  overall: HealthStatus;
  checks: HealthCheckResult[];
  generatedAt: string;
}

export interface ReadinessCheck {
  name: string;
  status: HealthStatus;
  required: boolean;
  message: string;
}

export interface ReadinessReport {
  ready: boolean;
  checks: ReadinessCheck[];
  generatedAt: string;
}

export interface DiagnosticsReport {
  environment: Record<string, string>;
  storage: HealthCheckResult[];
  database: HealthCheckResult;
  search: HealthCheckResult | null;
  analytics: HealthCheckResult | null;
  jobs: HealthCheckResult;
  generatedAt: string;
}

export type MaintenanceType = "global" | "read_only" | "scheduled";

export interface MaintenanceWindow {
  id: string;
  maintenanceType: MaintenanceType;
  isActive: boolean;
  message: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  maxRequests: number;
  remaining: number;
  resetAt: string;
}

export interface FeatureFlagEvaluation {
  flag: string;
  enabled: boolean;
  targeting: {
    userId?: string | undefined;
    role?: string | undefined;
    country?: string | undefined;
    percentage?: number | undefined;
  };
}
