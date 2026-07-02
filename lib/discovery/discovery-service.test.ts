import assert from "node:assert/strict";
import test from "node:test";
import { createRecentlyViewedService, type RecentlyViewedRepository } from "./index.js";
import type { SearchProduct } from "../search/index.js";

test("records and lists recently viewed products for a user", async () => {
  const viewed: { userId: string; productId: string; viewedAt: string }[] = [];
  const repo: RecentlyViewedRepository = {
    async record(input) {
      viewed.push(input);
    },
    async list(input) {
      const item = {
        id: viewed.find((entry) => entry.userId === input.userId)?.productId ?? "none",
        sellerId: "seller",
        sellerStoreName: "Store",
        sellerVerified: true,
        categoryId: null,
        categoryName: null,
        brandId: null,
        brandName: null,
        name: "Viewed Product",
        slug: "viewed-product",
        description: null,
        sku: null,
        tags: [],
        colors: [],
        sizes: [],
        materials: [],
        condition: "new",
        basePriceMinor: 100,
        compareAtPriceMinor: null,
        currency: "KES",
        rating: 0,
        reviewCount: 0,
        soldCount: 0,
        viewCount: 0,
        isFeatured: false,
        inStock: true,
        primaryImageUrl: null,
        publishedAt: null,
        createdAt: new Date().toISOString()
      } satisfies SearchProduct;
      return { items: [item], nextCursor: null };
    },
    async clear(userId) {
      const before = viewed.length;
      for (let index = viewed.length - 1; index >= 0; index -= 1) if (viewed[index]?.userId === userId) viewed.splice(index, 1);
      return before - viewed.length;
    }
  };
  const service = createRecentlyViewedService({ recentlyViewed: repo });
  const record = await service.record("user-1", "product-1");
  assert.equal(record.ok, true);
  assert.equal((await service.list("user-1")).items[0]?.id, "product-1");
  assert.equal(await service.clear("user-1"), 1);
});
