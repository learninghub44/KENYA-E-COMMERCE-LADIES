import { z } from "zod";

const nameSchema = z.string().trim().min(2).max(200);
const skuSchema = z.string().trim().min(1).max(64);
const currencySchema = z.string().trim().length(3).toUpperCase().default("KES");
const priceSchema = z.number().int().min(0);

export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export const productAttributeSchema = z.object({
  name: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(400)
});

export const productVariantInputSchema = z.object({
  sku: skuSchema,
  title: z.string().trim().max(120).optional(),
  priceMinor: priceSchema.optional(),
  compareAtPriceMinor: priceSchema.optional(),
  currency: currencySchema.optional(),
  barcode: z.string().trim().max(64).optional(),
  weightGrams: z.number().int().min(0).optional(),
  options: z.record(z.string().trim().max(80)).optional(),
  isActive: z.boolean().optional()
});

export const productImageInputSchema = z.object({
  url: z.string().trim().url().max(1000),
  altText: z.string().trim().max(300).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
  variantId: z.string().uuid().nullable().optional()
});

export const inventoryInputSchema = z.object({
  variantId: z.string().uuid().nullable().optional(),
  quantityAvailable: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  trackInventory: z.boolean().optional()
});

export const productCreateSchema = z
  .object({
    sellerId: z.string().uuid(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().optional(),
    name: nameSchema,
    description: z.string().trim().max(20000).optional(),
    basePriceMinor: priceSchema,
    compareAtPriceMinor: priceSchema.optional(),
    currency: currencySchema.optional(),
    isFeatured: z.boolean().optional(),
    seoTitle: z.string().trim().max(160).optional(),
    seoDescription: z.string().trim().max(320).optional(),
    metaKeywords: z.array(z.string().trim().max(60)).max(20).optional(),
    attributes: z.array(productAttributeSchema).max(100).optional(),
    variants: z.array(productVariantInputSchema).max(500).optional(),
    images: z.array(productImageInputSchema).max(50).optional(),
    inventory: inventoryInputSchema.optional()
  })
  .refine((v) => v.compareAtPriceMinor === undefined || v.compareAtPriceMinor >= v.basePriceMinor, {
    message: "compareAtPriceMinor must be greater than or equal to basePriceMinor.",
    path: ["compareAtPriceMinor"]
  });

export const productUpdateSchema = z
  .object({
    productId: z.string().uuid(),
    actorSellerId: z.string().uuid(),
    categoryId: z.string().uuid().nullable().optional(),
    brandId: z.string().uuid().nullable().optional(),
    name: nameSchema.optional(),
    description: z.string().trim().max(20000).optional(),
    basePriceMinor: priceSchema.optional(),
    compareAtPriceMinor: priceSchema.nullable().optional(),
    currency: currencySchema.optional(),
    isFeatured: z.boolean().optional(),
    seoTitle: z.string().trim().max(160).nullable().optional(),
    seoDescription: z.string().trim().max(320).nullable().optional(),
    metaKeywords: z.array(z.string().trim().max(60)).max(20).optional()
  })
  .refine((v) => Object.keys(v).length > 2, { message: "At least one field must be provided." });

export const productSearchSchema = z.object({
  q: z.string().trim().max(200).optional(),
  categoryId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).max(20).optional(),
  brandId: z.string().uuid().optional(),
  brandIds: z.array(z.string().uuid()).max(20).optional(),
  sellerId: z.string().uuid().optional(),
  collectionId: z.string().uuid().optional(),
  tags: z.array(z.string().trim().max(60)).max(10).optional(),
  minPriceMinor: priceSchema.optional(),
  maxPriceMinor: priceSchema.optional(),
  color: z.string().trim().max(60).optional(),
  colors: z.array(z.string().trim().max(60)).max(20).optional(),
  size: z.string().trim().max(60).optional(),
  material: z.string().trim().max(60).optional(),
  minRating: z.number().min(0).max(5).optional(),
  inStockOnly: z.boolean().optional(),
  sort: z.enum(["relevance", "newest", "price_asc", "price_desc", "featured", "rating"]).default("relevance"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(24)
});

export const wishlistAddSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  wishlistName: z.string().trim().min(1).max(80).default("Default")
});

export const wishlistRemoveSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  wishlistName: z.string().trim().min(1).max(80).default("Default")
});
