import assert from "node:assert/strict";
import test from "node:test";
import { createRatingService, type RatingSummary } from "./index";

const summary: RatingSummary = {
  entityType: "product",
  entityId: "33333333-3333-4333-8333-333333333333",
  averageRating: 4.5,
  totalReviews: 2,
  verifiedReviews: 2,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
  score: 0.73,
  updatedAt: new Date().toISOString()
};

test("returns and recomputes rating summaries", async () => {
  let recomputed = false;
  const service = createRatingService({
    summaries: {
      async get(input) {
        return input.entityId === summary.entityId ? summary : null;
      },
      async recompute(input) {
        recomputed = true;
        return { ...summary, entityType: input.entityType, entityId: input.entityId };
      }
    }
  });

  const found = await service.summary({ entityType: "product", entityId: summary.entityId });
  assert.equal(found.ok, true);
  assert.equal(found.ok && found.data.averageRating, 4.5);

  const missing = await service.summary({ entityType: "product", entityId: "99999999-9999-4999-8999-999999999999" });
  assert.equal(missing.ok, false);
  assert.equal(!missing.ok && missing.code, "SUMMARY_NOT_FOUND");

  const updated = await service.recompute({ entityType: "seller", entityId: "22222222-2222-4222-8222-222222222222" });
  assert.equal(updated.ok, true);
  assert.equal(recomputed, true);
});
