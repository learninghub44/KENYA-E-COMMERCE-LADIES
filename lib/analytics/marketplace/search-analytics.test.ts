import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateGrowthRate, marketplaceAnalyticsRequestSchema } from "./types.js";

describe("search analytics", () => {
  it("calculates search growth rate", () => {
    assert.equal(calculateGrowthRate(200, 100), 100);
    assert.equal(calculateGrowthRate(100, 200), -50);
    assert.equal(calculateGrowthRate(50, 0), 100);
  });

  it("validates date range schemas", () => {
    const valid = marketplaceAnalyticsRequestSchema.safeParse({ dateRange: "last_30_days" });
    assert.equal(valid.success, true);

    const invalid = marketplaceAnalyticsRequestSchema.safeParse({
      dateRange: "custom",
      startDate: "2026-01-01",
    });
    assert.equal(invalid.success, false);
  });
});
