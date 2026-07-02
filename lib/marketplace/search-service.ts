import type { MarketplaceResult, ProductSearchIndex, ProductSummary, SearchPage } from "./types";
import { productSearchSchema } from "../products/schemas";

export type SearchServiceDependencies = {
  index: ProductSearchIndex;
};

function failure(code: string, message: string, status: number): MarketplaceResult<never> {
  return { ok: false, code, message, status };
}

/**
 * Marketplace search + discovery. `search()` is intentionally the only entry point that takes
 * free-form filters, so a future AI-ranked search can replace `deps.index.search` without any
 * caller needing to change — see docs/marketplace/search.md.
 */
export function createSearchService(deps: SearchServiceDependencies) {
  return {
    async search(input: unknown): Promise<MarketplaceResult<SearchPage<ProductSummary>>> {
      const parsed = productSearchSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Search query is invalid.", 400);
      if (
        parsed.data.minPriceMinor !== undefined &&
        parsed.data.maxPriceMinor !== undefined &&
        parsed.data.minPriceMinor > parsed.data.maxPriceMinor
      ) {
        return failure("VALIDATION_ERROR", "minPriceMinor cannot be greater than maxPriceMinor.", 400);
      }
      return { ok: true, data: await deps.index.search(parsed.data) };
    },

    async getById(productId: string): Promise<MarketplaceResult<ProductSummary>> {
      const product = await deps.index.findById(productId);
      if (!product) return failure("NOT_FOUND", "Product not found.", 404);
      return { ok: true, data: product };
    },

    async listBySeller(sellerId: string, cursor: string | undefined, limit = 24): Promise<MarketplaceResult<SearchPage<ProductSummary>>> {
      return { ok: true, data: await deps.index.listBySeller(sellerId, cursor, limit) };
    },

    async listFeatured(cursor: string | undefined, limit = 24): Promise<MarketplaceResult<SearchPage<ProductSummary>>> {
      return { ok: true, data: await deps.index.listFeatured(cursor, limit) };
    },

    async listNewArrivals(cursor: string | undefined, limit = 24): Promise<MarketplaceResult<SearchPage<ProductSummary>>> {
      return { ok: true, data: await deps.index.listNewArrivals(cursor, limit) };
    },

    /** Same-category/brand products, ranked by simple overlap for now. See docs/marketplace/search.md
     *  for the recommendation-engine placeholder that will eventually replace this. */
    async listRelated(productId: string, limit = 12): Promise<MarketplaceResult<ProductSummary[]>> {
      return { ok: true, data: await deps.index.listRelated(productId, limit) };
    },

    // Placeholders per spec: interfaces exist now, algorithms arrive later without breaking callers.
    async listBestSellers(): Promise<MarketplaceResult<ProductSummary[]>> {
      return { ok: true, data: [] };
    },
    async listTrending(): Promise<MarketplaceResult<ProductSummary[]>> {
      return { ok: true, data: [] };
    },
    async listRecommended(_userId: string): Promise<MarketplaceResult<ProductSummary[]>> {
      return { ok: true, data: [] };
    }
  };
}
