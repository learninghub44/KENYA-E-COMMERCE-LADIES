# Feature Flags

## Overview

Extends Part 1's config-based flags with gradual rollout targeting.

## Targeting

| Strategy     | Config Key                    |
|--------------|-------------------------------|
| User IDs     | `feature.{flag}.targeting` → `{ userIds: [...] }` |
| Roles        | `feature.{flag}.targeting` → `{ roles: [...] }`   |
| Countries    | `feature.{flag}.targeting` → `{ countries: [...] }` |
| Percentage   | `feature.{flag}.targeting` → `{ percentage: 25 }` |

## Usage

```typescript
const ff = createFeatureFlagService({
  configService,
  flags: [{
    key: "new-checkout",
    defaultValue: false,
    targeting: { roles: ["admin"], percentage: 10 },
  }],
});

// Check with context
const enabled = await ff.isEnabled("new-checkout", {
  userId: "user-123",
  role: "admin",
});
```

## API

- `GET /internal/platform/feature-flags` — list all flags
- `GET /internal/platform/feature-flags?flag=new-checkout` — evaluate single flag
- `POST /internal/platform/feature-flags` — toggle flag

```json
POST /internal/platform/feature-flags
{ "flag": "new-checkout", "enabled": true }
```
