import { z } from "zod";

const price = z.number().int().min(0);

export const searchFiltersSchema = z
  .object({
    q: z.string().trim().max(200).optional(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().optional(),
    sellerId: z.string().uuid().optional(),
    minPriceMinor: price.optional(),
    maxPriceMinor: price.optional(),
    minRating: z.number().min(1).max(5).optional(),
    availability: z.enum(["in_stock", "out_of_stock", "any"]).optional(),
    condition: z.enum(["new", "like_new", "pre_owned", "refurbished"]).optional(),
    color: z.string().trim().max(60).optional(),
    size: z.string().trim().max(60).optional(),
    material: z.string().trim().max(80).optional(),
    discountedOnly: z.boolean().optional(),
    newArrivalsOnly: z.boolean().optional(),
    verifiedSellerOnly: z.boolean().optional(),
    inStockOnly: z.boolean().optional(),
    sort: z.enum(["relevance", "newest", "price_asc", "price_desc", "highest_rated", "most_reviewed", "best_selling", "trending"]).default("relevance"),
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(24)
  })
  .refine((value) => value.minPriceMinor === undefined || value.maxPriceMinor === undefined || value.minPriceMinor <= value.maxPriceMinor, {
    message: "minPriceMinor cannot be greater than maxPriceMinor.",
    path: ["minPriceMinor"]
  });

export const autocompleteSchema = z.object({
  q: z.string().trim().min(1).max(100),
  userId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(20).default(10)
});

export const saveSearchSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  query: z.string().trim().max(200).default(""),
  filters: searchFiltersSchema.default({ sort: "relevance", limit: 24 })
});
