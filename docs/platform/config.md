# Configuration Service

## Overview

Hierarchical configuration with three layers (highest priority first):
1. **Environment variables** — `KEY_NAME` → `key.name`
2. **Database** (`platform_config` table) — persisted, typed
3. **Defaults** — provided by caller

## API

```typescript
interface ConfigService {
  get<T>(key: string): Promise<T | null>;
  getWithDefault<T>(key: string, defaultValue: T): Promise<T>;
  set(input: SetConfigInput): Promise<void>;
  isFeatureEnabled(flag: string): Promise<boolean>;
  getFeatureFlags(): Promise<Record<string, boolean>>;
  getAll(): Promise<ConfigEntry[]>;
  getSecret(key: string): Promise<string | null>;
}
```

## Config Types

| Type      | Coercion                         |
|-----------|----------------------------------|
| `string`  | `String(value)`                  |
| `number`  | `Number(value)`                  |
| `boolean` | `"true"/"1"` → `true`           |
| `json`    | `JSON.parse`                     |
| `secret`  | Stored as encrypted in DB, read as string |

## Environment Variable Mapping

Keys like `database.url` map to `DATABASE_URL` (uppercase, dots → underscores).

## Feature Flags

```typescript
const config = createConfigService();

await config.set({
  configKey: "feature.new.checkout",
  configValue: true,
  configType: "boolean",
  isFeatureFlag: true,
});

const enabled = await config.isFeatureEnabled("feature.new.checkout");
```
