# Performance Helpers

## Request Batcher

Aggregates concurrent calls into a single batch.

```typescript
const batcher = createRequestBatcher<number, User>(
  async (ids) => batchFetchUsers(ids),
  { maxBatchSize: 100, batchWindowMs: 10 }
);

// Multiple concurrent calls are batched
const [a, b] = await Promise.all([
  batcher.add(1), batcher.add(2),
]);
```

## Lazy Loader

Defers instance creation until first access; caches thereafter.

```typescript
const loader = createLazyLoader(() => new ExpensiveClient());
loader.get(); // creates
loader.get(); // returns cached
loader.reset();
loader.get(); // re-creates
```

## Paginate

Cursor-based pagination for in-memory arrays.

```typescript
const result = paginate(items, { cursor: "abc", limit: 20 }, (item) => item.id);
// { data: [...], nextCursor: "xyz", total: 150 }
```

## Utilities

- `batchArray(items, size)` — splits array into chunks
- `compressInput(input, fields)` — picks only specified fields
