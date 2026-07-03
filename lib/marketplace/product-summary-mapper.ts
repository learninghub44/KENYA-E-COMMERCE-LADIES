import type { Product } from "../../components/shared/product-card";
import type { ProductSummary } from "./types";

const NEW_WINDOW_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/** Maps the domain ProductSummary (minor-unit pricing) to the UI ProductCard shape (major units). */
export function toCardProduct(summary: ProductSummary): Product {
  const price = summary.basePriceMinor / 100;
  const comparePrice = summary.compareAtPriceMinor != null ? summary.compareAtPriceMinor / 100 : null;
  const discount =
    comparePrice != null && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;
  const isNew = summary.publishedAt ? Date.now() - new Date(summary.publishedAt).getTime() < NEW_WINDOW_MS : false;

  return {
    id: summary.id,
    name: summary.name,
    price,
    comparePrice,
    images: summary.primaryImageUrl ? [summary.primaryImageUrl] : [],
    rating: summary.rating,
    reviewCount: summary.reviewCount,
    isNew,
    discount,
    sellerName: summary.sellerStoreName,
    slug: summary.slug
  };
}
