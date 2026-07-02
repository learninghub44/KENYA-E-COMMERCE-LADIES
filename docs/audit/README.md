# Audit Architecture

Agent 07 centralizes platform audit reads and admin action writes in `lib/audit`.

## Record Shape

Audit records include actor, action, entity type, entity id, old values, new values, metadata,
severity, and timestamp. Supported entity types include auth, session, seller, product, user,
order, message, report, admin, and moderation.

## Access

- `security.audit.write` is required to write authoritative records.
- `security.audit.read` is required to search or prepare exports.

## Search And Export

`createAuditService.search(actor, filters)` supports actor, action, entity type, entity id, text
query, severity, date range, cursor, limit, and sort filters.

`exportReady(actor, filters)` returns capped filters suitable for CSV, warehouse, or compliance
jobs. The service intentionally does not stream files; transport-specific export belongs in API
handlers or background jobs.

## Retention

Follow `docs/database/14-data-retention-policy.md`. Audit records are append-only and should be
partitioned by time once volume requires it.
