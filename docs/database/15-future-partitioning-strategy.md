# Future Partitioning Strategy

## Principle

Do not partition tables preemptively. Partition when measured table size, query latency, maintenance cost, or retention operations justify the added complexity.

## Candidate Tables

| Table | Expected Growth | Candidate Partition Key |
|---|---|---|
| `orders` | Millions per month at scale. | `created_at` monthly or quarterly. |
| `order_items` | Multiple rows per order. | Co-partition by order time through parent order strategy if needed. |
| `messages` | Millions of buyer-seller messages. | `created_at` monthly or `conversation_id` hash if access pattern requires. |
| `notifications` | High write volume. | `created_at` monthly. |
| `analytics_events` | Very high append-only volume. | `occurred_at` daily or monthly. |
| `activity_logs` | High operational volume. | `created_at` monthly. |
| `audit_logs` | Long-term append-only volume. | `created_at` quarterly or yearly. |

## Partition Triggers

Review partitioning when any of these become true:

- Table reaches tens of millions of rows.
- Index size causes write amplification or maintenance pain.
- Deletes or retention jobs become slow or lock-heavy.
- Query latency remains high after indexing and query tuning.
- Vacuum and analyze cannot keep up with write volume.

## Preferred Strategy

- Time-range partition append-only and lifecycle-heavy tables.
- Use hash partitioning only for tenant-spread access patterns that cannot be solved by indexes.
- Keep partition names predictable: `<table>_yYYYY_mMM`.
- Add partitions ahead of time through scheduled operational jobs.

## Avoid

- Partitioning lookup tables.
- Partitioning small tenant-owned tables.
- Partitioning before query plans and table statistics prove the need.
- Creating application code that depends on physical partition names.
