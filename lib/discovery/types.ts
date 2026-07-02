import type { CursorPage } from "../audit/types.js";
import type { SearchProduct, SearchResult } from "../search/types.js";

export type DiscoveryRail =
  | "featured"
  | "trending"
  | "new_arrivals"
  | "recently_viewed"
  | "similar_products"
  | "related_products"
  | "popular_categories";

export type CategoryDiscoveryItem = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  score: number;
};

export type DiscoveryRepository = {
  featured(input: { cursor?: string | undefined; limit: number }): Promise<CursorPage<SearchProduct>>;
  trending(input: { cursor?: string | undefined; limit: number }): Promise<CursorPage<SearchProduct>>;
  newArrivals(input: { cursor?: string | undefined; limit: number }): Promise<CursorPage<SearchProduct>>;
  similarProducts(input: { productId: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<SearchProduct>>;
  relatedProducts(input: { productId: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<SearchProduct>>;
  popularCategories(limit: number): Promise<CategoryDiscoveryItem[]>;
};

export type RecentlyViewedRepository = {
  record(input: { userId: string; productId: string; viewedAt: string }): Promise<void>;
  list(input: { userId: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<SearchProduct>>;
  clear(userId: string): Promise<number>;
};

export type DiscoveryResult<T> = SearchResult<T>;
