import type { ProductImageRecord, ProductImageRepository, ProductRepository, ProductResult } from "./types.js";
import { productImageInputSchema } from "./schemas.js";

export type MediaServiceDependencies = {
  products: ProductRepository;
  images: ProductImageRepository;
};

function failure(code: string, message: string, status: number): ProductResult<never> {
  return { ok: false, code, message, status };
}

async function assertOwnedProduct(deps: MediaServiceDependencies, productId: string, actorSellerId: string) {
  const product = await deps.products.findById(productId);
  if (!product) return { error: failure("NOT_FOUND", "Product not found.", 404) } as const;
  if (product.sellerId !== actorSellerId) return { error: failure("FORBIDDEN", "You do not own this product.", 403) } as const;
  return { product } as const;
}

/**
 * Manages product image records. This service only stores/orders Cloudinary URLs — the actual
 * upload, transformation, and optimization pipeline is owned by the API Integration Engineer
 * (Agent 9) and is called by feature UI code before these methods run. See
 * docs/products/cloudinary-integration.md.
 */
export function createMediaService(deps: MediaServiceDependencies) {
  return {
    async list(productId: string): Promise<ProductResult<ProductImageRecord[]>> {
      const product = await deps.products.findById(productId);
      if (!product) return failure("NOT_FOUND", "Product not found.", 404);
      return { ok: true, data: await deps.images.listByProduct(productId) };
    },

    async add(productId: string, actorSellerId: string, input: unknown): Promise<ProductResult<ProductImageRecord>> {
      const owned = await assertOwnedProduct(deps, productId, actorSellerId);
      if ("error" in owned) return owned.error;

      const parsed = productImageInputSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Image input is invalid. A valid Cloudinary URL is required.", 400);

      const image = await deps.images.createImage({ ...parsed.data, productId });
      return { ok: true, data: image };
    },

    /** Drag-and-drop reorder. `orderedImageIds` must contain every image id for the product. */
    async reorder(productId: string, actorSellerId: string, orderedImageIds: string[]): Promise<ProductResult<{ reordered: true }>> {
      const owned = await assertOwnedProduct(deps, productId, actorSellerId);
      if ("error" in owned) return owned.error;

      const current = await deps.images.listByProduct(productId);
      const currentIds = new Set(current.map((image) => image.id));
      if (orderedImageIds.length !== current.length || orderedImageIds.some((id) => !currentIds.has(id))) {
        return failure("VALIDATION_ERROR", "orderedImageIds must contain exactly the current image ids for this product.", 400);
      }

      await deps.images.reorderImages(productId, orderedImageIds);
      return { ok: true, data: { reordered: true } };
    },

    async setPrimary(productId: string, actorSellerId: string, imageId: string): Promise<ProductResult<{ updated: true }>> {
      const owned = await assertOwnedProduct(deps, productId, actorSellerId);
      if ("error" in owned) return owned.error;

      await deps.images.setPrimary(productId, imageId);
      return { ok: true, data: { updated: true } };
    },

    async remove(productId: string, actorSellerId: string, imageId: string): Promise<ProductResult<{ deleted: true }>> {
      const owned = await assertOwnedProduct(deps, productId, actorSellerId);
      if ("error" in owned) return owned.error;

      await deps.images.deleteImage(imageId);
      return { ok: true, data: { deleted: true } };
    }
  };
}
