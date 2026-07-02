import type { ProductRepository, ProductResult, ProductVariantInput, ProductVariantRecord, ProductVariantRepository } from "./types.js";
import { productVariantInputSchema } from "./schemas.js";

export type VariantServiceDependencies = {
  products: ProductRepository;
  variants: ProductVariantRepository;
};

function failure(code: string, message: string, status: number): ProductResult<never> {
  return { ok: false, code, message, status };
}

async function assertOwnedProduct(deps: VariantServiceDependencies, productId: string, actorSellerId: string) {
  const product = await deps.products.findById(productId);
  if (!product) return { error: failure("NOT_FOUND", "Product not found.", 404) } as const;
  if (product.sellerId !== actorSellerId) return { error: failure("FORBIDDEN", "You do not own this product.", 403) } as const;
  return { product } as const;
}

/**
 * Manages product variants (size/color/material/custom attribute combinations). The `options`
 * bag is intentionally generic (`Record<string, string>`) so new attribute types never require
 * a schema migration — see docs/products/variants.md.
 */
export function createVariantService(deps: VariantServiceDependencies) {
  return {
    async list(productId: string): Promise<ProductResult<ProductVariantRecord[]>> {
      const product = await deps.products.findById(productId);
      if (!product) return failure("NOT_FOUND", "Product not found.", 404);
      return { ok: true, data: await deps.variants.listByProduct(productId) };
    },

    async add(productId: string, actorSellerId: string, input: unknown): Promise<ProductResult<ProductVariantRecord>> {
      const owned = await assertOwnedProduct(deps, productId, actorSellerId);
      if ("error" in owned) return owned.error;

      const parsed = productVariantInputSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Variant input is invalid.", 400);

      const existing = await deps.variants.listByProduct(productId);
      if (existing.some((v) => v.sku === parsed.data.sku)) {
        return failure("SKU_CONFLICT", "A variant with this SKU already exists for this product.", 409);
      }

      const variant = await deps.variants.createVariant({
        ...parsed.data,
        currency: parsed.data.currency ?? owned.product.currency,
        productId
      });
      return { ok: true, data: variant };
    },

    async update(
      productId: string,
      variantId: string,
      actorSellerId: string,
      input: unknown
    ): Promise<ProductResult<ProductVariantRecord>> {
      const owned = await assertOwnedProduct(deps, productId, actorSellerId);
      if ("error" in owned) return owned.error;

      const parsed = productVariantInputSchema.partial().safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Variant update input is invalid.", 400);

      const variant = await deps.variants.updateVariant(variantId, parsed.data as Partial<ProductVariantInput>);
      return { ok: true, data: variant };
    },

    async remove(productId: string, variantId: string, actorSellerId: string): Promise<ProductResult<{ deleted: true }>> {
      const owned = await assertOwnedProduct(deps, productId, actorSellerId);
      if ("error" in owned) return owned.error;

      await deps.variants.deleteVariant(variantId);
      return { ok: true, data: { deleted: true } };
    }
  };
}
