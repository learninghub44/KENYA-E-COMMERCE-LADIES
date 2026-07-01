// Stored enum value in `public.product_status` (see supabase/migrations/202607010001_foundation_schema.sql).
export const STORED_PRODUCT_STATUSES = [
  "draft",
  "pending_review",
  "active",
  "rejected",
  "archived"
] as const;

export type StoredProductStatus = (typeof STORED_PRODUCT_STATUSES)[number];

// Application-level lifecycle. `active` (stored) is split into `approved` (moderator signed
// off, not yet visible to buyers) and `published` (visible to buyers) using `publishedAt`.
// `suspended` is a stored `archived` row with `metadata.suspended = true`, since the database
// enum has no dedicated value yet — see docs/products/lifecycle.md and the Agent 5 handoff note.
export const PRODUCT_STATUSES = [
  "draft",
  "pending_review",
  "approved",
  "published",
  "rejected",
  "suspended",
  "archived"
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type ProductVisibility = "visible" | "hidden";

export type Money = {
  amountMinor: number;
  currency: string;
};

export type ProductAttributeInput = {
  name: string;
  value: string;
};

export type ProductVariantInput = {
  sku: string;
  title?: string | undefined;
  priceMinor?: number | undefined;
  compareAtPriceMinor?: number | undefined;
  currency?: string | undefined;
  barcode?: string | undefined;
  weightGrams?: number | undefined;
  options?: Record<string, string> | undefined;
  isActive?: boolean | undefined;
};

export type ProductVariantRecord = ProductVariantInput & {
  id: string;
  productId: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductImageInput = {
  url: string;
  altText?: string | undefined;
  sortOrder?: number | undefined;
  isPrimary?: boolean | undefined;
  variantId?: string | null | undefined;
};

export type ProductImageRecord = ProductImageInput & {
  id: string;
  productId: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
};

export type InventoryInput = {
  variantId?: string | null | undefined;
  quantityAvailable: number;
  lowStockThreshold?: number | undefined;
  trackInventory?: boolean | undefined;
};

export type InventoryRecord = InventoryInput & {
  id: string;
  productId: string;
  quantityReserved: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  updatedAt: string;
};

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "not_tracked";

export type ProductCreateInput = {
  sellerId: string;
  categoryId?: string;
  brandId?: string;
  name: string;
  description?: string;
  basePriceMinor: number;
  compareAtPriceMinor?: number;
  currency?: string;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  attributes?: ProductAttributeInput[];
  variants?: ProductVariantInput[];
  images?: ProductImageInput[];
  inventory?: InventoryInput;
};

export type ProductUpdateInput = {
  productId: string;
  actorSellerId: string;
  categoryId?: string | null;
  brandId?: string | null;
  name?: string;
  description?: string;
  basePriceMinor?: number;
  compareAtPriceMinor?: number | null;
  currency?: string;
  isFeatured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords?: string[];
};

export type ProductRecord = {
  id: string;
  sellerId: string;
  categoryId: string | null;
  brandId: string | null;
  name: string;
  slug: string;
  description: string | null;
  status: StoredProductStatus;
  isSuspended: boolean;
  basePriceMinor: number;
  compareAtPriceMinor: number | null;
  currency: string;
  isFeatured: boolean;
  publishedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ProductWithRelations = ProductRecord & {
  variants: ProductVariantRecord[];
  images: ProductImageRecord[];
  attributes: (ProductAttributeInput & { id: string })[];
  inventory: InventoryRecord[];
};

export type ProductResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

export type ProductRepository = {
  findById(productId: string): Promise<ProductRecord | null>;
  findBySlug(sellerId: string, slug: string): Promise<ProductRecord | null>;
  createProduct(input: {
    sellerId: string;
    categoryId?: string;
    brandId?: string;
    name: string;
    slug: string;
    description?: string;
    status: StoredProductStatus;
    basePriceMinor: number;
    compareAtPriceMinor?: number;
    currency: string;
    isFeatured: boolean;
    metadata: Record<string, unknown>;
  }): Promise<ProductRecord>;
  updateProduct(input: {
    productId: string;
    values: Partial<
      Pick<
        ProductRecord,
        | "categoryId"
        | "brandId"
        | "name"
        | "slug"
        | "description"
        | "status"
        | "isSuspended"
        | "basePriceMinor"
        | "compareAtPriceMinor"
        | "currency"
        | "isFeatured"
        | "publishedAt"
      >
    > & { metadata?: Record<string, unknown> };
  }): Promise<ProductRecord>;
  softDeleteProduct(productId: string): Promise<void>;
  duplicateProduct(productId: string, newSlug: string): Promise<ProductRecord>;
};

export type ProductVariantRepository = {
  listByProduct(productId: string): Promise<ProductVariantRecord[]>;
  createVariant(input: ProductVariantInput & { productId: string }): Promise<ProductVariantRecord>;
  updateVariant(variantId: string, values: Partial<ProductVariantInput>): Promise<ProductVariantRecord>;
  deleteVariant(variantId: string): Promise<void>;
};

export type ProductImageRepository = {
  listByProduct(productId: string): Promise<ProductImageRecord[]>;
  createImage(input: ProductImageInput & { productId: string }): Promise<ProductImageRecord>;
  reorderImages(productId: string, orderedImageIds: string[]): Promise<void>;
  deleteImage(imageId: string): Promise<void>;
  setPrimary(productId: string, imageId: string): Promise<void>;
};

export type InventoryRepository = {
  findForProduct(productId: string, variantId?: string | null): Promise<InventoryRecord | null>;
  upsert(input: InventoryInput & { productId: string }): Promise<InventoryRecord>;
};

export type ProductAttributeRepository = {
  listByProduct(productId: string): Promise<(ProductAttributeInput & { id: string })[]>;
  replaceAll(productId: string, attributes: ProductAttributeInput[]): Promise<void>;
};

export type ProductEventPublisher = {
  publish(event: {
    type:
      | "product.created"
      | "product.updated"
      | "product.submitted"
      | "product.approved"
      | "product.published"
      | "product.unpublished"
      | "product.rejected"
      | "product.suspended"
      | "product.archived"
      | "product.deleted";
    productId: string;
    sellerId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
};

// Injected by the caller so this module never imports Agent 3's internals directly.
export type SellerStatusReader = {
  isApprovedAndVerified(sellerId: string): Promise<boolean>;
};
