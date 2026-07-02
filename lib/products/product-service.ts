import type {
  InventoryRepository,
  ProductAttributeRepository,
  ProductCreateInput,
  ProductEventPublisher,
  ProductImageRepository,
  ProductRecord,
  ProductRepository,
  ProductResult,
  ProductStatus,
  ProductUpdateInput,
  ProductVariantRepository,
  ProductWithRelations,
  SellerStatusReader
} from "./types";
import { productCreateSchema, productUpdateSchema, slugifyProductName } from "./schemas";
import { assertProductStatusTransition, normalizeProductStatus, toStoredProductStatus } from "./status";

export type ProductServiceDependencies = {
  products: ProductRepository;
  variants: ProductVariantRepository;
  images: ProductImageRepository;
  inventory: InventoryRepository;
  attributes: ProductAttributeRepository;
  sellers: SellerStatusReader;
  events?: ProductEventPublisher;
};

function failure(code: string, message: string, status: number): ProductResult<never> {
  return { ok: false, code, message, status };
}

type WithoutUndefined<T> = { [K in keyof T]-?: Exclude<T[K], undefined> };

function withoutUndefined<T extends Record<string, unknown>>(input: T): Partial<WithoutUndefined<T>> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<WithoutUndefined<T>>;
}

async function loadWithRelations(deps: ProductServiceDependencies, product: ProductRecord): Promise<ProductWithRelations> {
  const [variants, images, attributes, inventoryList] = await Promise.all([
    deps.variants.listByProduct(product.id),
    deps.images.listByProduct(product.id),
    deps.attributes.listByProduct(product.id),
    (async () => {
      const base = await deps.inventory.findForProduct(product.id, null);
      return base ? [base] : [];
    })()
  ]);
  return { ...product, variants, images, attributes, inventory: inventoryList };
}

async function assertOwnership(
  deps: ProductServiceDependencies,
  product: ProductRecord,
  actorSellerId: string
): Promise<ProductResult<never> | null> {
  if (product.sellerId !== actorSellerId) {
    return failure("FORBIDDEN", "You do not own this product.", 403);
  }
  return null;
}

export function createProductService(deps: ProductServiceDependencies) {
  const api = {
    /** Product creation. Only sellers who are approved and KYC-verified (Agent 3) may create products. */
    async create(input: unknown): Promise<ProductResult<ProductWithRelations>> {
      const parsed = productCreateSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Product input is invalid.", 400);

      const allowed = await deps.sellers.isApprovedAndVerified(parsed.data.sellerId);
      if (!allowed) return failure("SELLER_NOT_APPROVED", "Only approved, KYC-verified sellers may create products.", 403);

      let slug = slugifyProductName(parsed.data.name);
      if (!slug) return failure("VALIDATION_ERROR", "Product name must contain at least one alphanumeric character.", 400);
      let attempt = 0;
      while (await deps.products.findBySlug(parsed.data.sellerId, attempt === 0 ? slug : `${slug}-${attempt}`)) {
        attempt += 1;
        if (attempt > 50) return failure("SLUG_CONFLICT", "Could not generate a unique product slug.", 409);
      }
      if (attempt > 0) slug = `${slug}-${attempt}`;

      const product = await deps.products.createProduct(
        withoutUndefined({
          sellerId: parsed.data.sellerId,
          categoryId: parsed.data.categoryId,
          brandId: parsed.data.brandId,
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          status: "draft",
          basePriceMinor: parsed.data.basePriceMinor,
          compareAtPriceMinor: parsed.data.compareAtPriceMinor,
          currency: parsed.data.currency ?? "KES",
          isFeatured: parsed.data.isFeatured ?? false,
          metadata: {
            seoTitle: parsed.data.seoTitle,
            seoDescription: parsed.data.seoDescription,
            metaKeywords: parsed.data.metaKeywords ?? []
          }
        }) as Parameters<typeof deps.products.createProduct>[0]
      );

      if (parsed.data.attributes?.length) {
        await deps.attributes.replaceAll(product.id, parsed.data.attributes);
      }
      for (const variant of parsed.data.variants ?? []) {
        await deps.variants.createVariant({ ...variant, productId: product.id, currency: variant.currency ?? product.currency });
      }
      for (const image of parsed.data.images ?? []) {
        await deps.images.createImage({ ...image, productId: product.id });
      }
      if (parsed.data.inventory) {
        await deps.inventory.upsert({ ...parsed.data.inventory, productId: product.id });
      }

      await deps.events?.publish({ type: "product.created", productId: product.id, sellerId: product.sellerId });

      return { ok: true, data: await loadWithRelations(deps, product) };
    },

    /** Edit fields on a draft, rejected, or already-published product. Ownership enforced. */
    async update(input: unknown): Promise<ProductResult<ProductWithRelations>> {
      const parsed = productUpdateSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Product update input is invalid.", 400);

      const existing = await deps.products.findById(parsed.data.productId);
      if (!existing) return failure("NOT_FOUND", "Product not found.", 404);
      const ownershipError = await assertOwnership(deps, existing, parsed.data.actorSellerId);
      if (ownershipError) return ownershipError;

      const { productId, actorSellerId, seoTitle, seoDescription, metaKeywords, ...rest } = parsed.data;
      const metadataPatch = withoutUndefined({ seoTitle, seoDescription, metaKeywords });

      const updated = await deps.products.updateProduct({
        productId,
        values: {
          ...withoutUndefined(rest),
          ...(Object.keys(metadataPatch).length ? { metadata: { ...existing.metadata, ...metadataPatch } } : {})
        }
      });

      await deps.events?.publish({ type: "product.updated", productId: updated.id, sellerId: updated.sellerId });
      return { ok: true, data: await loadWithRelations(deps, updated) };
    },

    /** Get a single product with variants, images, attributes, and inventory. */
    async getById(productId: string): Promise<ProductResult<ProductWithRelations>> {
      const product = await deps.products.findById(productId);
      if (!product) return failure("NOT_FOUND", "Product not found.", 404);
      return { ok: true, data: await loadWithRelations(deps, product) };
    },

    /** Duplicate a product (and its variants/images/attributes) as a new draft owned by the same seller. */
    async duplicate(productId: string, actorSellerId: string): Promise<ProductResult<ProductWithRelations>> {
      const existing = await deps.products.findById(productId);
      if (!existing) return failure("NOT_FOUND", "Product not found.", 404);
      const ownershipError = await assertOwnership(deps, existing, actorSellerId);
      if (ownershipError) return ownershipError;

      let slug = `${existing.slug}-copy`;
      let attempt = 0;
      while (await deps.products.findBySlug(existing.sellerId, attempt === 0 ? slug : `${slug}-${attempt}`)) {
        attempt += 1;
        if (attempt > 50) return failure("SLUG_CONFLICT", "Could not generate a unique product slug.", 409);
      }
      if (attempt > 0) slug = `${slug}-${attempt}`;

      const copy = await deps.products.duplicateProduct(productId, slug);
      await deps.events?.publish({ type: "product.created", productId: copy.id, sellerId: copy.sellerId, metadata: { duplicatedFrom: productId } });
      return { ok: true, data: await loadWithRelations(deps, copy) };
    },

    /** Soft delete. Product row is retained (status stays, but hidden from catalog) per docs/database/11-soft-delete-strategy.md. */
    async softDelete(productId: string, actorSellerId: string): Promise<ProductResult<{ deleted: true }>> {
      const existing = await deps.products.findById(productId);
      if (!existing) return failure("NOT_FOUND", "Product not found.", 404);
      const ownershipError = await assertOwnership(deps, existing, actorSellerId);
      if (ownershipError) return ownershipError;

      await deps.products.softDeleteProduct(productId);
      await deps.events?.publish({ type: "product.deleted", productId, sellerId: existing.sellerId });
      return { ok: true, data: { deleted: true } };
    },

    /**
     * Drive the product lifecycle state machine. See lib/products/status.ts and
     * docs/products/lifecycle.md. Moderator-only transitions (approve/reject/suspend) must be
     * called from Agent 7's admin service, not directly from seller-facing routes.
     */
    async transition(
      productId: string,
      actorSellerId: string | null,
      to: ProductStatus
    ): Promise<ProductResult<ProductWithRelations>> {
      const existing = await deps.products.findById(productId);
      if (!existing) return failure("NOT_FOUND", "Product not found.", 404);
      if (actorSellerId && existing.sellerId !== actorSellerId) {
        return failure("FORBIDDEN", "You do not own this product.", 403);
      }

      const from = normalizeProductStatus(existing);
      try {
        assertProductStatusTransition(from, to);
      } catch (error) {
        return failure("INVALID_TRANSITION", (error as Error).message, 409);
      }

      const stored = toStoredProductStatus(to);
      const updated = await deps.products.updateProduct({
        productId,
        values: {
          status: stored.status,
          isSuspended: stored.isSuspended,
          ...(stored.publishedAt === "now" ? { publishedAt: new Date().toISOString() } : {}),
          ...(stored.publishedAt === "clear" ? { publishedAt: null } : {})
        }
      });

      const eventType =
        to === "pending_review"
          ? "product.submitted"
          : to === "approved"
            ? "product.approved"
            : to === "published"
              ? "product.published"
              : to === "rejected"
                ? "product.rejected"
                : to === "suspended"
                  ? "product.suspended"
                  : to === "archived"
                    ? "product.archived"
                    : "product.updated";

      await deps.events?.publish({ type: eventType, productId: updated.id, sellerId: updated.sellerId });
      return { ok: true, data: await loadWithRelations(deps, updated) };
    },

    // Convenience wrappers over transition() for the common seller/moderator actions.
    submit(productId: string, actorSellerId: string) {
      return api.transition(productId, actorSellerId, "pending_review");
    },
    publish(productId: string, actorSellerId: string) {
      return api.transition(productId, actorSellerId, "published");
    },
    unpublish(productId: string, actorSellerId: string) {
      return api.transition(productId, actorSellerId, "approved");
    },
    archive(productId: string, actorSellerId: string) {
      return api.transition(productId, actorSellerId, "archived");
    }
  };

  return api;
}
