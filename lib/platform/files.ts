import { FileRecord, StorageMetrics } from "./types";

interface SupabaseResult {
  data: unknown;
  error: unknown;
}

interface EqChain extends Promise<SupabaseResult> {
  single: () => Promise<SupabaseResult>;
  eq: (col: string, val: unknown) => EqChain;
}

interface SelectChain extends Promise<SupabaseResult> {
  eq: (col: string, val: unknown) => EqChain;
  in: (col: string, vals: unknown[]) => Promise<SupabaseResult>;
  order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<SupabaseResult> };
}

interface FileClient {
  from: (table: string) => {
    select: (columns: string) => SelectChain;
    insert: (values: Record<string, unknown>) => { select: () => Promise<SupabaseResult> };
    update: (values: Record<string, unknown>) => { eq: (col: string, val: unknown) => { select: () => Promise<SupabaseResult> } };
  };
}

export interface FileDependencies {
  supabaseClient: FileClient;
  storageAdapter?: {
    getPublicUrl(publicId: string): string;
    delete(input: { publicId: string; provider: string }): Promise<void>;
  };
}

export interface FileService {
  recordUpload(input: {
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    storageProvider: string;
    checksum?: string;
    entityType?: string;
    entityId?: string;
    uploadedBy?: string;
    metadata?: Record<string, unknown>;
  }): Promise<FileRecord>;
  markDeleted(fileId: string): Promise<void>;
  getFile(fileId: string): Promise<FileRecord | null>;
  findByChecksum(checksum: string): Promise<FileRecord | null>;
  findByEntity(entityType: string, entityId: string): Promise<FileRecord[]>;
  findOrphans(): Promise<FileRecord[]>;
  getStorageMetrics(): Promise<StorageMetrics[]>;
  cleanupOrphans(): Promise<number>;
}

function mapFileRow(row: Record<string, unknown>): FileRecord {
  return {
    id: row.id as string,
    filePath: row.file_path as string,
    fileName: row.file_name as string,
    mimeType: row.mime_type as string,
    fileSizeBytes: row.file_size_bytes as number,
    storageProvider: row.storage_provider as string,
    storageBucket: (row.storage_bucket as string) ?? null,
    publicUrl: (row.public_url as string) ?? null,
    checksum: (row.checksum as string) ?? null,
    entityType: (row.entity_type as string) ?? null,
    entityId: (row.entity_id as string) ?? null,
    uploadedBy: (row.uploaded_by as string) ?? null,
    isDeleted: row.is_deleted as boolean,
    deletedAt: (row.deleted_at as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}

export function createFileService(deps: FileDependencies): FileService {
  const { supabaseClient } = deps;

  async function recordUpload(input: {
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    storageProvider: string;
    checksum?: string;
    entityType?: string;
    entityId?: string;
    uploadedBy?: string;
    metadata?: Record<string, unknown>;
  }): Promise<FileRecord> {
    const { data, error } = await supabaseClient
      .from("platform_files")
      .insert({
        file_path: input.filePath,
        file_name: input.fileName,
        mime_type: input.mimeType,
        file_size_bytes: input.fileSizeBytes,
        storage_provider: input.storageProvider,
        checksum: input.checksum ?? null,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        uploaded_by: input.uploadedBy ?? null,
        is_deleted: false,
        metadata: (input.metadata as Record<string, unknown>) ?? {},
      })
      .select();

    if (error) throw new Error(`Failed to record upload: ${JSON.stringify(error)}`);
    const rows = data as Record<string, unknown>[];
    return mapFileRow(rows[0] as Record<string, unknown>);
  }

  async function markDeleted(fileId: string): Promise<void> {
    const { error } = await supabaseClient
      .from("platform_files")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .select();

    if (error) throw new Error(`Failed to mark file deleted: ${JSON.stringify(error)}`);
  }

  async function getFile(fileId: string): Promise<FileRecord | null> {
    const { data, error } = await supabaseClient
      .from("platform_files")
      .select("id, file_path, file_name, mime_type, file_size_bytes, storage_provider, storage_bucket, public_url, checksum, entity_type, entity_id, uploaded_by, is_deleted, deleted_at, metadata, created_at")
      .eq("id", fileId)
      .single();

    if (error) return null;
    return mapFileRow(data as Record<string, unknown>);
  }

  async function findByChecksum(checksum: string): Promise<FileRecord | null> {
    const { data, error } = await supabaseClient
      .from("platform_files")
      .select("id, file_path, file_name, mime_type, file_size_bytes, storage_provider, storage_bucket, public_url, checksum, entity_type, entity_id, uploaded_by, is_deleted, deleted_at, metadata, created_at")
      .eq("checksum", checksum)
      .single();

    if (error) return null;
    return mapFileRow(data as Record<string, unknown>);
  }

  async function findByEntity(entityType: string, entityId: string): Promise<FileRecord[]> {
    const { data, error } = await supabaseClient
      .from("platform_files")
      .select("id, file_path, file_name, mime_type, file_size_bytes, storage_provider, storage_bucket, public_url, checksum, entity_type, entity_id, uploaded_by, is_deleted, deleted_at, metadata, created_at")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);

    if (error) return [];
    return (data as Record<string, unknown>[]).map(mapFileRow);
  }

  async function findOrphans(): Promise<FileRecord[]> {
    const { data, error } = await supabaseClient
      .from("platform_files")
      .select("id, file_path, file_name, mime_type, file_size_bytes, storage_provider, storage_bucket, public_url, checksum, entity_type, entity_id, uploaded_by, is_deleted, deleted_at, metadata, created_at")
      .eq("is_deleted", false)
      .eq("entity_type", null);

    if (error) return [];
    return (data as Record<string, unknown>[]).map(mapFileRow);
  }

  async function getStorageMetrics(): Promise<StorageMetrics[]> {
    const { data, error } = await supabaseClient
      .from("platform_storage_metrics")
      .select("storage_provider, total_bytes, total_files, orphan_files, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) return [];
    return (data as Record<string, unknown>[]).map((row) => ({
      storageProvider: row.storage_provider as string,
      totalBytes: row.total_bytes as number,
      totalFiles: row.total_files as number,
      orphanFiles: row.orphan_files as number,
      recordedAt: row.recorded_at as string,
    }));
  }

  async function cleanupOrphans(): Promise<number> {
    const orphans = await findOrphans();
    let cleaned = 0;

    for (const file of orphans) {
      try {
        if (deps.storageAdapter) {
          await deps.storageAdapter.delete({
            publicId: file.filePath,
            provider: file.storageProvider,
          });
        }
        await markDeleted(file.id);
        cleaned++;
      } catch {
        continue;
      }
    }

    return cleaned;
  }

  return {
    recordUpload,
    markDeleted,
    getFile,
    findByChecksum,
    findByEntity,
    findOrphans,
    getStorageMetrics,
    cleanupOrphans,
  };
}
