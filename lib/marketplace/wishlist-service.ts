import type { MarketplaceResult, ProductSummary, RecentlyViewedStore, WishlistRepository } from "./types";
import { wishlistAddSchema, wishlistRemoveSchema } from "../products/schemas";

export type WishlistServiceDependencies = {
  wishlists: WishlistRepository;
};

function failure(code: string, message: string, status: number): MarketplaceResult<never> {
  return { ok: false, code, message, status };
}

/** Single default wishlist per user for v1. Sharing/social features are explicitly out of scope. */
export function createWishlistService(deps: WishlistServiceDependencies) {
  return {
    async add(input: unknown): Promise<MarketplaceResult<{ added: true }>> {
      const parsed = wishlistAddSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Wishlist input is invalid.", 400);

      const wishlist = await deps.wishlists.findOrCreate(parsed.data.userId, parsed.data.wishlistName);
      await deps.wishlists.addItem(wishlist.id, parsed.data.productId);
      return { ok: true, data: { added: true } };
    },

    async remove(input: unknown): Promise<MarketplaceResult<{ removed: true }>> {
      const parsed = wishlistRemoveSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Wishlist input is invalid.", 400);

      const wishlist = await deps.wishlists.findOrCreate(parsed.data.userId, parsed.data.wishlistName);
      await deps.wishlists.removeItem(wishlist.id, parsed.data.productId);
      return { ok: true, data: { removed: true } };
    },

    async view(userId: string, wishlistName = "Default"): Promise<MarketplaceResult<ProductSummary[]>> {
      const wishlist = await deps.wishlists.findOrCreate(userId, wishlistName);
      return { ok: true, data: await deps.wishlists.listItems(wishlist.id) };
    },

    async count(userId: string, wishlistName = "Default"): Promise<MarketplaceResult<number>> {
      const wishlist = await deps.wishlists.findOrCreate(userId, wishlistName);
      return { ok: true, data: await deps.wishlists.count(wishlist.id) };
    }
  };
}

export type RecentlyViewedServiceDependencies = {
  recentlyViewed: RecentlyViewedStore;
};

export function createRecentlyViewedService(deps: RecentlyViewedServiceDependencies) {
  return {
    async record(userId: string, productId: string): Promise<MarketplaceResult<{ recorded: true }>> {
      await deps.recentlyViewed.record(userId, productId);
      return { ok: true, data: { recorded: true } };
    },
    async list(userId: string, limit = 12): Promise<MarketplaceResult<ProductSummary[]>> {
      return { ok: true, data: await deps.recentlyViewed.list(userId, limit) };
    }
  };
}
