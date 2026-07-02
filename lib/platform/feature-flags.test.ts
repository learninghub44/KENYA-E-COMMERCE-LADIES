import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createFeatureFlagService } from "./feature-flags";
import { createConfigService } from "./config";

describe("feature flag service", () => {
  it("returns false for unknown flag", async () => {
    const configService = createConfigService();
    const ff = createFeatureFlagService({ configService });
    const enabled = await ff.isEnabled("nonexistent");
    assert.equal(enabled, false);
  });

  it("uses default value when no db config", async () => {
    const configService = createConfigService();
    const ff = createFeatureFlagService({
      configService,
      flags: [{ key: "new-checkout", defaultValue: true }],
    });
    const enabled = await ff.isEnabled("new-checkout");
    assert.equal(enabled, true);
  });

  it("evaluates with targeting context", async () => {
    const configService = createConfigService();
    const ff = createFeatureFlagService({
      configService,
      flags: [{
        key: "beta-feature",
        defaultValue: false,
        targeting: { userIds: ["user-42"] },
      }],
    });

    const enabled1 = await ff.isEnabled("beta-feature", { userId: "user-42" });
    assert.equal(enabled1, true);

    const enabled2 = await ff.isEnabled("beta-feature", { userId: "user-99" });
    assert.equal(enabled2, false);
  });

  it("registers flags dynamically", async () => {
    const configService = createConfigService();
    const ff = createFeatureFlagService({ configService });
    ff.registerFlag({ key: "dynamic-flag", defaultValue: true });
    const flag = await ff.getFlag("dynamic-flag");
    assert.ok(flag);
    assert.equal(flag.key, "dynamic-flag");
  });

  it("lists all registered flags", async () => {
    const configService = createConfigService();
    const ff = createFeatureFlagService({
      configService,
      flags: [
        { key: "flag-a", defaultValue: false },
        { key: "flag-b", defaultValue: true },
      ],
    });
    const flags = await ff.listFlags();
    assert.equal(flags.length, 2);
  });

  it("evaluate returns full evaluation", async () => {
    const configService = createConfigService();
    const ff = createFeatureFlagService({
      configService,
      flags: [{ key: "test-flag", defaultValue: true }],
    });
    const evaluation = await ff.evaluate("test-flag", { userId: "user-1", role: "admin" });
    assert.equal(evaluation.flag, "test-flag");
    assert.equal(evaluation.enabled, true);
    assert.equal(evaluation.targeting.userId, "user-1");
    assert.equal(evaluation.targeting.role, "admin");
  });

  it("honors role targeting", async () => {
    const configService = createConfigService();
    const ff = createFeatureFlagService({
      configService,
      flags: [{
        key: "admin-tool",
        defaultValue: false,
        targeting: { roles: ["admin", "super_admin"] },
      }],
    });

    const enabled1 = await ff.isEnabled("admin-tool", { role: "admin" });
    assert.equal(enabled1, true);

    const enabled2 = await ff.isEnabled("admin-tool", { role: "buyer" });
    assert.equal(enabled2, false);
  });
});
