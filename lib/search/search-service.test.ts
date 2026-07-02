import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import {
  createInMemoryProductSearchRepository,
  createSavedSearchService,
  createSearchHistoryService,
  createSearchService,
  type ProductSearchFilters,
  type SavedSearch,
  type SearchHistoryEntry,
  type SearchProduct
} from "./index";

const userId = "11111111-1111-4111-8111-111111111111";
const otherUserId = "22222222-2222-4222-8222-222222222222";
const categoryDresses = "33333333-3333-4333-8333-333333333333";
const brandA = "44444444-4444-4444-8444-444444444444";
const sellerA = "55555555-5555-4555-8555-555555555555";

function product(overrides: Partial<SearchProduct>): SearchProduct {
  return {
    id: randomUUID(),
    sellerId: sellerA,
    sellerStoreName: "Nairobi Style",
    sellerVerified: true,
    categoryId: categoryDresses,
    categoryName: "Dresses",
    brandId: brandA,
    brandName: "GlowWear",
    name: "Product",
    slug: "product",
    description: "Elegant daily wear",
    sku: "SKU-1",
    tags: [],
    colors: [],
    sizes: [],
    materials: [],
    condition: "new",
    basePriceMinor: 1000,
    compareAtPriceMinor: null,
    currency: "KES",
    rating: 4,
    reviewCount: 0,
    soldCount: 0,
    viewCount: 0,
    isFeatured: false,
    inStock: true,
    primaryImageUrl: null,
    publishedAt: "2026-07-01T00:00:00.000Z",
    createdAt: "2026-07-01T00:00:00.000Z",
    ...overrides
  };
}

const products = [
  product({
    name: "Silk Wrap Dress",
    description: "Soft green silk occasion dress",
    sku: "DRS-SILK",
    tags: ["wedding", "occasion"],
    colors: ["green"],
    sizes: ["M"],
    materials: ["silk"],
    basePriceMinor: 5500,
    compareAtPriceMinor: 7000,
    rating: 4.9,
    reviewCount: 80,
    soldCount: 50,
    viewCount: 500,
    isFeatured: true
  }),
  product({
    name: "Cotton Day Dress",
    brandName: "Everyday",
    brandId: randomUUID(),
    colors: ["blue"],
    sizes: ["L"],
    materials: ["cotton"],
    basePriceMinor: 2500,
    rating: 4.1,
    reviewCount: 12,
    publishedAt: "2026-06-01T00:00:00.000Z"
  }),
  product({
    name: "Leather Tote Bag",
    categoryId: randomUUID(),
    categoryName: "Bags",
    materials: ["leather"],
    basePriceMinor: 8000,
    rating: 4.7,
    reviewCount: 55,
    inStock: false
  })
];

test("search ranks accurate and typo-tolerant results", async () => {
  const service = createSearchService({ products: createInMemoryProductSearchRepository(products) });
  const result = await service.search({ q: "silk drss", sort: "relevance" });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.data.items[0]?.name, "Silk Wrap Dress");
});

test("combines filters and supports cursor pagination", async () => {
  const service = createSearchService({ products: createInMemoryProductSearchRepository(products) });
  const result = await service.search({
    categoryId: categoryDresses,
    brandId: brandA,
    sellerId: sellerA,
    minPriceMinor: 5000,
    maxPriceMinor: 6000,
    minRating: 4.5,
    color: "green",
    size: "M",
    material: "silk",
    discountedOnly: true,
    verifiedSellerOnly: true,
    inStockOnly: true,
    limit: 1
  });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.data.items.length, 1);
  assert.equal(result.ok && result.data.nextCursor, null);
});

test("sorts by price and rating", async () => {
  const service = createSearchService({ products: createInMemoryProductSearchRepository(products) });
  const price = await service.search({ sort: "price_asc" });
  assert.equal(price.ok && price.data.items[0]?.name, "Cotton Day Dress");
  const rated = await service.search({ sort: "highest_rated" });
  assert.equal(rated.ok && rated.data.items[0]?.name, "Silk Wrap Dress");
});

test("autocomplete combines recent and catalog suggestions", async () => {
  const service = createSearchService({
    products: createInMemoryProductSearchRepository(products),
    history: {
      async record(input) {
        return { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
      },
      async list() {
        return { items: [], nextCursor: null };
      },
      async delete() {
        return true;
      },
      async clear() {
        return 0;
      },
      async recentQueries() {
        return [{ type: "recent", label: "silk", value: "silk", score: 10 }];
      }
    }
  });
  const result = await service.autocomplete({ q: "sil", userId, limit: 3 });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.data[0]?.type, "recent");
  assert.ok(result.ok && result.data.some((item) => item.label === "Silk Wrap Dress"));
});

test("manages search history for the owning user", async () => {
  const entries: SearchHistoryEntry[] = [];
  const history = createSearchHistoryService({
    history: {
      async record(input) {
        const entry = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
        entries.push(entry);
        return entry;
      },
      async list(uid, cursor, limit) {
        const start = cursor ? Number(cursor) : 0;
        return { items: entries.filter((entry) => entry.userId === uid).slice(start, start + limit), nextCursor: null };
      },
      async delete(input) {
        const index = entries.findIndex((entry) => entry.userId === input.userId && entry.id === input.entryId);
        if (index === -1) return false;
        entries.splice(index, 1);
        return true;
      },
      async clear(uid) {
        const before = entries.length;
        for (let index = entries.length - 1; index >= 0; index -= 1) if (entries[index]?.userId === uid) entries.splice(index, 1);
        return before - entries.length;
      },
      async recentQueries() {
        return [];
      }
    }
  });
  entries.push({ id: "own", userId, query: "dress", filters: { sort: "relevance", limit: 24 }, resultCount: 2, createdAt: new Date().toISOString() });
  entries.push({ id: "other", userId: otherUserId, query: "bag", filters: { sort: "relevance", limit: 24 }, resultCount: 1, createdAt: new Date().toISOString() });
  assert.equal((await history.list(userId)).items.length, 1);
  assert.equal(await history.delete(userId, "other"), false);
  assert.equal(await history.clear(userId), 1);
});

test("saves, renames, deletes, and reruns saved searches with ownership checks", async () => {
  const saved: SavedSearch[] = [];
  const productsRepo = createInMemoryProductSearchRepository(products);
  const service = createSavedSearchService({
    products: productsRepo,
    savedSearches: {
      async create(input) {
        const item = { ...input, id: randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        saved.push(item);
        return item;
      },
      async findById(id) {
        return saved.find((item) => item.id === id) ?? null;
      },
      async list(uid) {
        return { items: saved.filter((item) => item.userId === uid), nextCursor: null };
      },
      async rename(input) {
        const item = saved.find((candidate) => candidate.id === input.savedSearchId && candidate.userId === input.userId);
        if (!item) return null;
        item.name = input.name;
        return item;
      },
      async delete(input) {
        const index = saved.findIndex((item) => item.id === input.savedSearchId && item.userId === input.userId);
        if (index === -1) return false;
        saved.splice(index, 1);
        return true;
      }
    }
  });
  const created = await service.save({ userId, name: "Green dresses", query: "dress", filters: { color: "green", sort: "relevance", limit: 24 } satisfies ProductSearchFilters });
  assert.equal(created.ok, true);
  const id = created.ok ? created.data.id : "";
  assert.equal((await service.rename(otherUserId, id, "Nope")).ok, false);
  const rerun = await service.rerun(userId, id);
  assert.equal(rerun.ok, true);
  assert.equal(rerun.ok && rerun.data.items[0]?.name, "Silk Wrap Dress");
});
