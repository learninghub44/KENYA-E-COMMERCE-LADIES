# Rate Limiting

## Overview

Rate limiting service with in-memory and Supabase-backed storage. Supports five limit types with configurable windows and thresholds.

## Limit Types

| Type     | Key                                 |
|----------|--------------------------------------|
| User     | `user:{userId}`                      |
| Seller   | `seller:{sellerId}`                  |
| Admin    | `admin:{adminId}`                    |
| API      | `api:{endpoint}` or `api:{apiKey}`   |
| IP       | `ip:{address}`                       |

## Usage

```typescript
const rl = createRateLimitService({ store: memoryStore });

// Check before processing
const result = await rl.check({
  limitType: "api",
  limitKey: "search",
  windowSeconds: 60,
  maxRequests: 100,
});

if (!result.allowed) {
  return 429 Too Many Requests;
}

// Increment on each request
await rl.increment({ limitType: "api", limitKey: "search" });
```

## Future Adapters

- Cloudflare (via headers)
- Redis (via ioredis)
- KV (via Cloudflare KV)
