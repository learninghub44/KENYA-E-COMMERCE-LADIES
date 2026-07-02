import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMarketplaceAnalyticsPermissionChecker, SupabaseRoleClient } from "./permission-checker.js";

describe("marketplace analytics permission checker", () => {
  function createClient(mockData: Array<{ role: string }>): SupabaseRoleClient {
    return {
      from: () => ({
        select: () => ({
          eq: async () => ({ data: mockData, error: null }),
        }),
      }),
    };
  }

  it("allows admin users", async () => {
    const checker = createMarketplaceAnalyticsPermissionChecker(
      createClient([{ role: "admin" }]),
    );
    assert.equal(await checker.canViewMarketplaceAnalytics("user-1"), true);
  });

  it("allows super_admin users", async () => {
    const checker = createMarketplaceAnalyticsPermissionChecker(
      createClient([{ role: "super_admin" }]),
    );
    assert.equal(await checker.canViewMarketplaceAnalytics("user-1"), true);
  });

  it("rejects buyer users", async () => {
    const checker = createMarketplaceAnalyticsPermissionChecker(
      createClient([{ role: "buyer" }]),
    );
    assert.equal(await checker.canViewMarketplaceAnalytics("user-1"), false);
  });

  it("rejects users with no roles", async () => {
    const checker = createMarketplaceAnalyticsPermissionChecker(
      createClient([]),
    );
    assert.equal(await checker.canViewMarketplaceAnalytics("user-1"), false);
  });

  it("returns false on database error", async () => {
    const client: SupabaseRoleClient = {
      from: () => ({
        select: () => ({
          eq: async () => ({ data: null, error: new Error("DB error") }),
        }),
      }),
    };
    const checker = createMarketplaceAnalyticsPermissionChecker(client);
    assert.equal(await checker.canViewMarketplaceAnalytics("user-1"), false);
  });
});
