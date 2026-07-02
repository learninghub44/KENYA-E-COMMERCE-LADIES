# File Management Service

## API

```typescript
interface FileService {
  recordUpload(input): Promise<FileRecord>;
  markDeleted(fileId: string): Promise<void>;
  getFile(fileId: string): Promise<FileRecord | null>;
  findByChecksum(checksum: string): Promise<FileRecord | null>;
  findByEntity(entityType: string, entityId: string): Promise<FileRecord[]>;
  findOrphans(): Promise<FileRecord[]>;
  getStorageMetrics(): Promise<StorageMetrics[]>;
  cleanupOrphans(): Promise<number>;
}
```

## Orphan Detection

Files with `entity_type = null` and `is_deleted = false` are considered orphans. These are files uploaded but never associated with any entity.

## Cleanup

`cleanupOrphans()` will:
1. Find all orphaned files
2. Delete from the storage provider (if adapter is configured)
3. Mark as deleted in the database

## Storage Metrics

Aggregated storage usage per provider from `platform_storage_metrics`:
- Total bytes
- Total files
- Orphan file count
