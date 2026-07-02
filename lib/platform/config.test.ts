import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createConfigService } from "./config";

describe("config service", () => {
  it("falls back to environment variables", async () => {
    const config = createConfigService({ env: { DATABASE_URL: "postgres://localhost" } });
    const value = await config.get("database.url");
    assert.equal(value, "postgres://localhost");
  });

  it("returns null for unknown keys without env", async () => {
    const config = createConfigService();
    const value = await config.get("nonexistent.key");
    assert.equal(value, null);
  });

  it("getWithDefault returns default when not set", async () => {
    const config = createConfigService();
    const value = await config.getWithDefault("missing.key", "fallback");
    assert.equal(value, "fallback");
  });

  it("getWithDefault returns value when set via env", async () => {
    const config = createConfigService({ env: { MY_KEY: "env-value" } });
    const value = await config.getWithDefault("my.key", "fallback");
    assert.equal(value, "env-value");
  });

  it("getSecret works via env fallback", async () => {
    const config = createConfigService({ env: { SECRET_API_KEY: "sk-1234" } });
    const secret = await config.getSecret("secret.api.key");
    assert.equal(secret, "sk-1234");
  });

  it("getAll returns empty array without db", async () => {
    const config = createConfigService();
    const all = await config.getAll();
    assert.deepEqual(all, []);
  });

  it("getFeatureFlags returns empty object without db", async () => {
    const config = createConfigService();
    const flags = await config.getFeatureFlags();
    assert.deepEqual(flags, {});
  });

  it("isFeatureEnabled checks env values", async () => {
    const config = createConfigService({ env: { FEATURE_NEW_CHECKOUT: "true" } });
    const enabled = await config.isFeatureEnabled("feature.new.checkout");
    assert.equal(enabled, true);
  });
});
