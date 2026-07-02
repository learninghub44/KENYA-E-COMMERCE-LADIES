# Backup Strategy

## Database Backups

### Supabase Automated Backups
- Daily automated backups enabled via Supabase Pro plan
- Point-in-time recovery (PITR) with 7-day retention
- Automatic backup window: 02:00–04:00 EAT
- Backups include all schemas, tables, indexes, and functions

### Manual Backups (pg_dump)
- Full database dump executed weekly via cron job
- Schema-only dump stored in version control for migration integrity
- Backup command:

```bash
pg_dump \
  --host=aws-0-eu-west-1.pooler.supabase.com \
  --port=6543 \
  --dbname=postgres \
  --username=postgres \
  --format=custom \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump \
  --verbose \
  --no-owner \
  --compress=9
```

- Encrypted with GPG before upload to cold storage
- Stored in S3-compatible bucket (Backblaze B2) with cross-region replication

## Storage Backups

### Cloudinary Media
- All product images, banners, and seller media stored in Cloudinary
- Cloudinary auto-replication to secondary cloud (AWS us-east-1)
- Monthly full export via Cloudinary's backup API to S3
- Original high-resolution assets stored separately in S3 Glacier

### Seller Documents
- Business permits, tax compliance docs, and contracts
- Encrypted at rest in Supabase Storage
- Daily sync to secondary S3 bucket with versioning enabled
- Retention: 7 years per regulatory requirements

### KYC Documents
- National ID, KRA PIN, and business registration certificates
- Stored in dedicated encrypted bucket with access logging
- Weekly backup to air-gapped cold storage
- Retention: 10 years post-account closure

## Configuration Backups

### Environment Variables
- All `.env` files encrypted and stored in 1Password Vaults
- Supabase project secrets exported weekly via API
- CI/CD secrets mirrored across GitHub Environments (production/staging)

### Feature Flags
- Feature flag configurations exported daily to version control
- Snapshot stored in `config/feature-flags/` with timestamp
- Audit log of all flag changes retained for 90 days

### Platform Configuration
- Supabase project settings exported monthly
- Row-Level Security policies versioned in migrations
- Edge function configurations stored in repository

## Backup Retention Policy

| Type | Retention Period | Storage Class |
|------|-----------------|---------------|
| Daily backups | 7 days | Hot (S3 Standard) |
| Weekly backups | 4 weeks | Cool (S3 Infrequent Access) |
| Monthly backups | 12 months | Cold (S3 Glacier) |
| Annual snapshots | 7 years | Deep Archive |

## Backup Verification

### Automated Restore Testing
- Daily backups restored to staging environment every Sunday 03:00 EAT
- Automated test suite runs against restored database:
  - Schema integrity checks
  - Row count validation (expected vs actual)
  - Foreign key constraint verification
  - Custom query benchmarks
- Results logged to `#backup-verification` Slack channel

### Checksum Verification
- SHA-256 checksum computed at backup time
- Checksum verified at rest (daily cron) and before any restore
- Corruption alerts sent to on-call engineer via PagerDuty

## Recovery Objectives

| Metric | Target |
|--------|--------|
| Recovery Time Objective (RTO) - Database | 4 hours |
| Recovery Time Objective (RTO) - Full Recovery | 24 hours |
| Recovery Point Objective (RPO) - Critical Data | 1 hour |
| Recovery Point Objective (RPO) - Non-critical Data | 24 hours |

### Critical Data Definition
- User accounts and profiles
- Active order transactions
- Payment records
- Seller wallet balances
- KYC verification status

### Non-critical Data Definition
- Analytics events (raw)
- Audit logs older than 30 days
- Archived conversations
- Historical price snapshots
