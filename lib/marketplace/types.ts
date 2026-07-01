export type CategoryRecord = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryNode = CategoryRecord & { children: CategoryNode[] };

export type BrandRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CollectionRecord = {
  id: string;
  sellerId: string | null;
  name: string;
  slug: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Denormalized, read-optimized shape returned by search/listing endpoints — never the write model. */
export type ProductSummary = {
  id: string;
  sellerId: string;
  sellerStoreName: string;
  categoryId: string | null;
  brandId: string | null;
  brandName: string | null;
  name: string;
  slug: string;
  basePriceMinor: number;
  compareAtPriceMinor: number | null;
  currency: string;
  isFeatured: boolean;
  primaryImageUrl: string | null;
  inStock: boolean;
  publishedAt: string | null;
  createdAt: string;
};

export type ProductSearchFilters = {
  q?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  sellerId?: string | undefined;
  collectionId?: string | undefined;
  tags?: string[] | undefined;
  minPriceMinor?: number | undefined;
  maxPriceMinor?: number | undefined;
  color?: string | undefined;
  size?: string | undefined;
  material?: string | undefined;
  inStockOnly?: boolean | undefined;
  sort: "relevance" | "newest" | "price_asc" | "price_desc" | "featured";
  cursor?: string | undefined;
  limit: number;
};

export type SearchPage<T> = {
  items: T[];
  nextCursor: string | null;
};

export type MarketplaceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

// Every module in this domain is called only through these interfaces, never by importing
// another module's tables directly — see docs/Architecture.md §4.
export type CategoryRepository = {
  list(activeOnly?: boolean): Promise<CategoryRecord[]>;
  findBySlug(slug: string): Promise<CategoryRecord | null>;
};

export type BrandRepository = {
  list(): Promise<BrandRecord[]>;
  findBySlug(slug: string): Promise<BrandRecord | null>;
};

export type CollectionRepository = {
  findBySlug(sellerId: string | null, slug: string): Promise<CollectionRecord | null>;
  listFeatured(now: string): Promise<CollectionRecord[]>;
  listProducts(collectionId: string, cursor: string | undefined, limit: number): Promise<SearchPage<ProductSummary>>;
};

export type ProductSearchIndex = {
  search(filters: ProductSearchFilters): Promise<SearchPage<ProductSummary>>;
  findById(productId: string): Promise<ProductSummary | null>;
  listBySeller(sellerId: string, cursor: string | undefined, limit: number): Promise<SearchPage<ProductSummary>>;
  listFeatured(cursor: string | undefined, limit: number): Promise<SearchPage<ProductSummary>>;
  listNewArrivals(cursor: string | undefined, limit: number): Promise<SearchPage<ProductSummary>>;
  listRelated(productId: string, limit: number): Promise<ProductSummary[]>;
};

export type WishlistRepository = {
  findOrCreate(userId: string, name: string): Promise<{ id: string }>;
  addItem(wishlistId: string, productId: string): Promise<void>;
  removeItem(wishlistId: string, productId: string): Promise<void>;
  listItems(wishlistId: string): Promise<ProductSummary[]>;
  count(wishlistId: string): Promise<number>;
};

export type RecentlyViewedStore = {
  record(userId: string, productId: string): Promise<void>;
  list(userId: string, limit: number): Promise<ProductSummary[]>;
};
