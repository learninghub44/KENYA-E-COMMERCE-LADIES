import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import {
  createProductService,
  type InventoryRecord,
  type InventoryRepository,
  type ProductAttributeInput,
  type ProductAttributeRepository,
  type ProductImageRecord,
  type ProductImageRepository,
  type ProductRecord,
  type ProductRepository,
  type ProductVariantRecord,
  type ProductVariantRepository,
  type SellerStatusReader
} from "./index.js";

const sellerId = "22222222-2222-4222-8222-222222222222";
const otherSellerId = "33333333-3333-4333-8333-333333333333";
const now = "2026-07-02T00:00:00.000Z";

function createDeps(opts: { approvedSellers?: string[] } = {}) {
  const products = new Map<string, ProductRecord>();
  const variants = new Map<string, ProductVariantRecord[]>();
  const images = new Map<string, ProductImageRecord[]>();
  const attributes = new Map<string, (ProductAttributeInput & { id: string })[]>();
  const inventory = new Map<string, InventoryRecord>();
  const publishedEvents: string[] = [];

  const productRepo: ProductRepository = {
    async findById(id) {
      return products.get(id) ?? null;
    },
    async findBySlug(sid, slug) {
      return [...products.values()].find((p) => p.sellerId === sid && p.slug === slug) ?? null;
    },
    async createProduct(input) {
      const record: ProductRecord = {
        ...input,
        id: randomUUID(),
        categoryId: input.categoryId ?? null,
        brandId: input.brandId ?? null,
        description: input.description ?? null,
        compareAtPriceMinor: input.compareAtPriceMinor ?? null,
        isSuspended: false,
        publishedAt: null,
        createdAt: now,
        updatedAt: now
      };
      products.set(record.id, record);
      return record;
    },
    async updateProduct({ productId, values }) {
      const existing = products.get(productId);
      assert.ok(existing);
      const updated = { ...existing, ...values, metadata: values.metadata ?? existing.metadata, updatedAt: now };
      products.set(productId, updated);
      return updated;
    },
    async softDeleteProduct(productId) {
      const existing = products.get(productId);
      if (existing) products.set(productId, { ...existing, metadata: { ...existing.metadata, deletedAt: now } });
    },
    async duplicateProduct(productId, newSlug) {
      const existing = products.get(productId);
      assert.ok(existing);
      const copy: ProductRecord = { ...existing, id: randomUUID(), slug: newSlug, status: "draft", publishedAt: null };
      products.set(copy.id, copy);
      variants.set(copy.id, [...(variants.get(productId) ?? [])]);
      images.set(copy.id, [...(images.get(productId) ?? [])]);
      attributes.set(copy.id, [...(attributes.get(productId) ?? [])]);
      return copy;
    }
  };

  const variantRepo: ProductVariantRepository = {
    async listByProduct(productId) {
      return variants.get(productId) ?? [];
    },
    async createVariant(input) {
      const record: ProductVariantRecord = {
        ...input,
        id: randomUUID(),
        currency: input.currency ?? "KES",
        isActive: input.isActive ?? true,
        createdAt: now,
        updatedAt: now
      };
      variants.set(input.productId, [...(variants.get(input.productId) ?? []), record]);
      return record;
    },
    async updateVariant(variantId, values) {
      for (const [productId, list] of variants.entries()) {
        const idx = list.findIndex((v) => v.id === variantId);
        if (idx >= 0) {
          const previous = list[idx]!;
          const updated: ProductVariantRecord = {
            ...previous,
            ...values,
            currency: values.currency ?? previous.currency,
            isActive: values.isActive ?? previous.isActive,
            updatedAt: now
          };
          list[idx] = updated;
          variants.set(productId, list);
          return updated;
        }
      }
      throw new Error("Variant not found");
    },
    async deleteVariant(variantId) {
      for (const [productId, list] of variants.entries()) {
        variants.set(productId, list.filter((v) => v.id !== variantId));
      }
    }
  };

  const imageRepo: ProductImageRepository = {
    async listByProduct(productId) {
      return images.get(productId) ?? [];
    },
    async createImage(input) {
      const record: ProductImageRecord = {
        ...input,
        id: randomUUID(),
        sortOrder: input.sortOrder ?? 0,
        isPrimary: input.isPrimary ?? false,
        createdAt: now
      };
      images.set(input.productId, [...(images.get(input.productId) ?? []), record]);
      return record;
    },
    async reorderImages(productId, orderedImageIds) {
      const list = images.get(productId) ?? [];
      const byId = new Map(list.map((i) => [i.id, i]));
      images.set(productId, orderedImageIds.map((id, idx) => ({ ...byId.get(id)!, sortOrder: idx })));
    },
    async deleteImage(imageId) {
      for (const [productId, list] of images.entries()) {
        images.set(productId, list.filter((i) => i.id !== imageId));
      }
    },
    async setPrimary(productId, imageId) {
      const list = images.get(productId) ?? [];
      images.set(productId, list.map((i) => ({ ...i, isPrimary: i.id === imageId })));
    }
  };

  const inventoryRepo: InventoryRepository = {
    async findForProduct(productId, variantId) {
      return inventory.get(`${productId}:${variantId ?? "base"}`) ?? null;
    },
    async upsert(input) {
      const key = `${input.productId}:${input.variantId ?? "base"}`;
      const record: InventoryRecord = {
        id: inventory.get(key)?.id ?? randomUUID(),
        productId: input.productId,
        variantId: input.variantId ?? null,
        quantityAvailable: input.quantityAvailable,
        quantityReserved: inventory.get(key)?.quantityReserved ?? 0,
        lowStockThreshold: input.lowStockThreshold ?? 0,
        trackInventory: input.trackInventory ?? true,
        updatedAt: now
      };
      inventory.set(key, record);
      return record;
    }
  };

  const attributeRepo: ProductAttributeRepository = {
    async listByProduct(productId) {
      return attributes.get(productId) ?? [];
    },
    async replaceAll(productId, list) {
      attributes.set(productId, list.map((a) => ({ ...a, id: randomUUID() })));
    }
  };

  const sellers: SellerStatusReader = {
    async isApprovedAndVerified(id) {
      return (opts.approvedSellers ?? [sellerId]).includes(id);
    }
  };

  const deps = {
    products: productRepo,
    variants: variantRepo,
    images: imageRepo,
    inventory: inventoryRepo,
    attributes: attributeRepo,
    sellers,
    events: {
      async publish(event: { type: string; productId: string }) {
        publishedEvents.push(event.type);
      }
    }
  };

  return { deps, publishedEvents };
}

describe("product-service", () => {
  it("rejects product creation for sellers that are not approved", async () => {
    const { deps } = createDeps({ approvedSellers: [] });
    const service = createProductService(deps);
    const result = await service.create({ sellerId, name: "Silk Scarf", basePriceMinor: 250000 });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "SELLER_NOT_APPROVED");
  });

  it("creates a draft product with a slug, variants, images, and inventory", async () => {
    const { deps, publishedEvents } = createDeps();
    const service = createProductService(deps);
    const result = await service.create({
      sellerId,
      name: "Ankara Print Dress",
      basePriceMinor: 350000,
      variants: [{ sku: "AKD-RED-M", title: "Red / M", options: { color: "Red", size: "M" } }],
      images: [{ url: "https://res.cloudinary.com/demo/image/upload/ankara.jpg", isPrimary: true }],
      inventory: { quantityAvailable: 20 }
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.slug, "ankara-print-dress");
    assert.equal(result.data.status, "draft");
    assert.equal(result.data.variants.length, 1);
    assert.equal(result.data.images.length, 1);
    assert.equal(result.data.inventory.length, 1);
    assert.deepEqual(publishedEvents, ["product.created"]);
  });

  it("disambiguates duplicate slugs for the same seller", async () => {
    const { deps } = createDeps();
    const service = createProductService(deps);
    const first = await service.create({ sellerId, name: "Beaded Necklace", basePriceMinor: 120000 });
    const second = await service.create({ sellerId, name: "Beaded Necklace", basePriceMinor: 150000 });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (first.ok && second.ok) {
      assert.equal(first.data.slug, "beaded-necklace");
      assert.equal(second.data.slug, "beaded-necklace-1");
    }
  });

  it("prevents editing a product owned by a different seller", async () => {
    const { deps } = createDeps({ approvedSellers: [sellerId, otherSellerId] });
    const service = createProductService(deps);
    const created = await service.create({ sellerId, name: "Leather Handbag", basePriceMinor: 800000 });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const result = await service.update({ productId: created.data.id, actorSellerId: otherSellerId, name: "Stolen Listing" });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "FORBIDDEN");
  });

  it("follows the draft -> pending_review -> approved -> published lifecycle", async () => {
    const { deps, publishedEvents } = createDeps();
    const service = createProductService(deps);
    const created = await service.create({ sellerId, name: "Kitenge Headwrap", basePriceMinor: 90000 });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const submitted = await service.submit(created.data.id, sellerId);
    assert.equal(submitted.ok, true);
    if (submitted.ok) assert.equal(submitted.data.status, "pending_review");

    const approved = await service.transition(created.data.id, null, "approved");
    assert.equal(approved.ok, true);

    const published = await service.publish(created.data.id, sellerId);
    assert.equal(published.ok, true);
    if (published.ok) {
      assert.equal(published.data.status, "active");
      assert.ok(published.data.publishedAt);
    }

    assert.deepEqual(publishedEvents, ["product.created", "product.submitted", "product.approved", "product.published"]);
  });

  it("rejects an invalid lifecycle transition", async () => {
    const { deps } = createDeps();
    const service = createProductService(deps);
    const created = await service.create({ sellerId, name: "Woven Sandals", basePriceMinor: 60000 });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const result = await service.publish(created.data.id, sellerId);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "INVALID_TRANSITION");
  });

  it("duplicates a product as a new draft with a unique slug", async () => {
    const { deps } = createDeps();
    const service = createProductService(deps);
    const created = await service.create({ sellerId, name: "Maasai Bead Bracelet", basePriceMinor: 45000 });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const duplicate = await service.duplicate(created.data.id, sellerId);
    assert.equal(duplicate.ok, true);
    if (duplicate.ok) {
      assert.equal(duplicate.data.slug, "maasai-bead-bracelet-copy");
      assert.equal(duplicate.data.status, "draft");
    }
  });

  it("soft deletes a product without hard-removing the row", async () => {
    const { deps } = createDeps();
    const service = createProductService(deps);
    const created = await service.create({ sellerId, name: "Chunky Knit Sweater", basePriceMinor: 275000 });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const result = await service.softDelete(created.data.id, sellerId);
    assert.equal(result.ok, true);

    const fetched = await service.getById(created.data.id);
    assert.equal(fetched.ok, true);
    if (fetched.ok) assert.ok(fetched.data.metadata.deletedAt);
  });
});
