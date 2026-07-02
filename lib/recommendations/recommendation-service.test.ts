import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyRecommendationProvider, createRecommendationService } from "./index.js";

test("exposes future recommendation hooks without AI ranking", async () => {
  const service = createRecommendationService({ provider: createEmptyRecommendationProvider() });
  const results = await service.recommend({ strategy: "personalized", userId: "user-1", limit: 20 });
  assert.deepEqual(results, []);
});
