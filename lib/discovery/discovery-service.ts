import type { DiscoveryRepository, DiscoveryResult, RecentlyViewedRepository } from "./types";

function cap(limit: number | undefined): number {
  return Math.min(Math.max(limit ?? 24, 1), 100);
}

export function createDiscoveryService(deps: { discovery: DiscoveryRepository }) {
  return {
    featured(cursor?: string, limit?: number) {
      return deps.discovery.featured({ cursor, limit: cap(limit) });
    },
    trending(cursor?: string, limit?: number) {
      return deps.discovery.trending({ cursor, limit: cap(limit) });
    },
    newArrivals(cursor?: string, limit?: number) {
      return deps.discovery.newArrivals({ cursor, limit: cap(limit) });
    },
    similarProducts(productId: string, cursor?: string, limit?: number) {
      return deps.discovery.similarProducts({ productId, cursor, limit: cap(limit) });
    },
    relatedProducts(productId: string, cursor?: string, limit?: number) {
      return deps.discovery.relatedProducts({ productId, cursor, limit: cap(limit) });
    },
    popularCategories(limit?: number) {
      return deps.discovery.popularCategories(cap(limit));
    }
  };
}

export function createRecentlyViewedService(deps: { recentlyViewed: RecentlyViewedRepository }) {
  return {
    async record(userId: string, productId: string): Promise<DiscoveryResult<{ recorded: true }>> {
      await deps.recentlyViewed.record({ userId, productId, viewedAt: new Date().toISOString() });
      return { ok: true, data: { recorded: true } };
    },
    list(userId: string, cursor?: string, limit?: number) {
      return deps.recentlyViewed.list({ userId, cursor, limit: cap(limit) });
    },
    clear(userId: string) {
      return deps.recentlyViewed.clear(userId);
    }
  };
}
