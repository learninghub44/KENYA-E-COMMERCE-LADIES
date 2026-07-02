import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import {
  buildCategoryTree,
  createCatalogService,
  createSearchService,
  createWishlistService,
  type BrandRepository,
  type CategoryRecord,
  type CategoryRepository,
  type CollectionRepository,
  type ProductSearchIndex,
  type ProductSummary,
  type WishlistRepository
} from "./index";

const now = "2026-07-02T00:00:00.000Z";

function category(overrides: Partial<CategoryRecord>): CategoryRecord {
  return {
    id: randomUUID(),
    parentId: null,
    name: "Category",
    slug: "category",
    description: null,
    sortOrder: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

function summary(overrides: Partial<ProductSummary>): ProductSummary {
  return {
    id: randomUUID(),
    sellerId: randomUUID(),
    sellerStoreName: "Nairobi Style",
    categoryId: null,
    brandId: null,
    brandName: null,
    name: "Product",
    slug: "product",
    basePriceMinor: 100000,
    compareAtPriceMinor: null,
    currency: "KES",
    isFeatured: false,
    primaryImageUrl: null,
    inStock: true,
    publishedAt: now,
    createdAt: now,
    ...overrides
  };
}

describe("buildCategoryTree", () => {
  it("nests children under their parent, sorted by sortOrder", () => {
    const dresses = category({ id: "dresses", name: "Dresses", sortOrder: 1 });
    const fashion = category({ id: "fashion", name: "Fashion", sortOrder: 0 });
    const bags = category({ id: "bags", name: "Bags", parentId: "fashion", sortOrder: 0 });
    const shoes = category({ id: "shoes", name: "Shoes", parentId: "fashion", sortOrder: 1 });

    const tree = buildCategoryTree([dresses, fashion, bags, shoes]);

    assert.equal(tree.length, 2);
    assert.equal(tree[0]!.id, "fashion");
    assert.equal(tree[0]!.children.length, 2);
    assert.equal(tree[0]!.children[0]!.id, "bags");
    assert.equal(tree[1]!.id, "dresses");
  });
});

describe("catalog-service", () => {
  it("returns NOT_FOUND for an unknown category slug", async () => {
    const categories: CategoryRepository = {
      async list() {
        return [];
      },
      async findBySlug() {
        return null;
      }
    };
    const brands: BrandRepository = { async list() { return []; }, async findBySlug() { return null; } };
    const collections: CollectionRepository = {
      async findBySlug() { return null; },
      async listFeatured() { return []; },
      async listProducts() { return { items: [], nextCursor: null }; }
    };
    const service = createCatalogService({ categories, brands, collections });
    const result = await service.getCategoryBySlug("unknown");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "NOT_FOUND");
  });
});

describe("search-service", () => {
  it("rejects a search where minPriceMinor exceeds maxPriceMinor", async () => {
    const index: ProductSearchIndex = {
      async search() { return { items: [], nextCursor: null }; },
      async findById() { return null; },
      async listBySeller() { return { items: [], nextCursor: null }; },
      async listFeatured() { return { items: [], nextCursor: null }; },
      async listNewArrivals() { return { items: [], nextCursor: null }; },
      async listRelated() { return []; }
    };
    const service = createSearchService({ index });
    const result = await service.search({ minPriceMinor: 5000, maxPriceMinor: 1000 });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "VALIDATION_ERROR");
  });

  it("returns search results for a valid query", async () => {
    const product = summary({ name: "Chiffon Blouse" });
    const index: ProductSearchIndex = {
      async search(filters) {
        assert.equal(filters.q, "blouse");
        return { items: [product], nextCursor: null };
      },
      async findById() { return null; },
      async listBySeller() { return { items: [], nextCursor: null }; },
      async listFeatured() { return { items: [], nextCursor: null }; },
      async listNewArrivals() { return { items: [], nextCursor: null }; },
      async listRelated() { return []; }
    };
    const service = createSearchService({ index });
    const result = await service.search({ q: "blouse" });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.items.length, 1);
  });
});

describe("wishlist-service", () => {
  it("adds and removes items, and reports an accurate count", async () => {
    const userId = randomUUID();
    const productId = randomUUID();
    const store = new Map<string, Set<string>>();

    const wishlists: WishlistRepository = {
      async findOrCreate(uid, name) {
        const id = `${uid}:${name}`;
        if (!store.has(id)) store.set(id, new Set());
        return { id };
      },
      async addItem(wishlistId, pid) {
        store.get(wishlistId)!.add(pid);
      },
      async removeItem(wishlistId, pid) {
        store.get(wishlistId)!.delete(pid);
      },
      async listItems(wishlistId) {
        return [...store.get(wishlistId)!].map((pid) => summary({ id: pid }));
      },
      async count(wishlistId) {
        return store.get(wishlistId)!.size;
      }
    };

    const service = createWishlistService({ wishlists });
    await service.add({ userId, productId });
    const afterAdd = await service.count(userId);
    assert.equal(afterAdd.ok, true);
    if (afterAdd.ok) assert.equal(afterAdd.data, 1);

    await service.remove({ userId, productId });
    const afterRemove = await service.count(userId);
    assert.equal(afterRemove.ok, true);
    if (afterRemove.ok) assert.equal(afterRemove.data, 0);
  });
});
