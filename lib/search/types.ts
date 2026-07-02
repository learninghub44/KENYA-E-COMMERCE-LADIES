import type { CursorPage } from "../audit/types";

export type SearchResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

export type SearchSort =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "highest_rated"
  | "most_reviewed"
  | "best_selling"
  | "trending";

export type ProductCondition = "new" | "like_new" | "pre_owned" | "refurbished";

export type SearchProduct = {
  id: string;
  sellerId: string;
  sellerStoreName: string;
  sellerVerified: boolean;
  categoryId: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  tags: string[];
  colors: string[];
  sizes: string[];
  materials: string[];
  condition: ProductCondition;
  basePriceMinor: number;
  compareAtPriceMinor: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  isFeatured: boolean;
  inStock: boolean;
  primaryImageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export type ProductSearchFilters = {
  q?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  sellerId?: string | undefined;
  minPriceMinor?: number | undefined;
  maxPriceMinor?: number | undefined;
  minRating?: number | undefined;
  availability?: "in_stock" | "out_of_stock" | "any" | undefined;
  condition?: ProductCondition | undefined;
  color?: string | undefined;
  size?: string | undefined;
  material?: string | undefined;
  discountedOnly?: boolean | undefined;
  newArrivalsOnly?: boolean | undefined;
  verifiedSellerOnly?: boolean | undefined;
  inStockOnly?: boolean | undefined;
  sort?: SearchSort | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
};

export type SearchResponse = CursorPage<SearchProduct> & {
  totalApprox: number;
  appliedFilters: ProductSearchFilters;
};

export type AutocompleteSuggestion = {
  type: "product" | "category" | "brand" | "seller" | "recent" | "popular";
  label: string;
  value: string;
  score: number;
  metadata?: Record<string, unknown> | undefined;
};

export type SearchHistoryEntry = {
  id: string;
  userId: string;
  query: string;
  filters: ProductSearchFilters;
  resultCount: number;
  createdAt: string;
};

export type SavedSearch = {
  id: string;
  userId: string;
  name: string;
  query: string;
  filters: ProductSearchFilters;
  createdAt: string;
  updatedAt: string;
};

export type ProductSearchRepository = {
  search(filters: Required<Pick<ProductSearchFilters, "sort" | "limit">> & ProductSearchFilters): Promise<SearchResponse>;
  autocomplete(input: { q: string; userId?: string | undefined; limit: number }): Promise<AutocompleteSuggestion[]>;
};

export type SearchHistoryRepository = {
  record(input: Omit<SearchHistoryEntry, "id" | "createdAt">): Promise<SearchHistoryEntry>;
  list(userId: string, cursor: string | undefined, limit: number): Promise<CursorPage<SearchHistoryEntry>>;
  delete(input: { userId: string; entryId: string }): Promise<boolean>;
  clear(userId: string): Promise<number>;
  recentQueries(userId: string, limit: number): Promise<AutocompleteSuggestion[]>;
};

export type SavedSearchRepository = {
  create(input: Omit<SavedSearch, "id" | "createdAt" | "updatedAt">): Promise<SavedSearch>;
  findById(savedSearchId: string): Promise<SavedSearch | null>;
  list(userId: string, cursor: string | undefined, limit: number): Promise<CursorPage<SavedSearch>>;
  rename(input: { userId: string; savedSearchId: string; name: string }): Promise<SavedSearch | null>;
  delete(input: { userId: string; savedSearchId: string }): Promise<boolean>;
};
