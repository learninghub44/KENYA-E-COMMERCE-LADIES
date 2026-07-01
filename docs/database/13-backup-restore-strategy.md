# Backup and Restore Strategy

## Goals

Backups must protect against accidental deletion, failed migrations, data corruption, and operational incidents.

## Environments

| Environment | Backup Expectation |
|---|---|
| Local | Developer-managed reset and seed data. |
| Preview | Ephemeral; no long-term backup requirement. |
| Staging | Regular snapshots before release validation and destructive tests. |
| Production | Automated point-in-time recovery and scheduled backups. |

## Production Requirements

- Enable Supabase point-in-time recovery when production launches.
- Keep scheduled daily backups.
- Take a manual backup before high-risk schema migrations.
- Test restore procedures before launch and at regular intervals.
- Store backup access behind least-privilege operational roles.

## Restore Priorities

1. Restore service availability.
2. Preserve order and financial integrity.
3. Preserve seller catalog data.
4. Preserve messaging and support history.
5. Restore analytics and lower-priority operational history.

## Migration Safety

High-risk migrations should include:

- A rollback plan or forward-fix plan.
- Expected lock behavior.
- Estimated row counts affected.
- Index creation strategy.
- Backfill batching plan if data volume is large.

## Restore Testing

At minimum, restore tests must verify:

- RLS policies remain enabled.
- Critical indexes exist.
- Orders and order items are consistent.
- Seller/product ownership paths remain intact.
- Storage metadata and external media references still resolve.
