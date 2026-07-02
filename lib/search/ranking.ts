import type { ProductSearchFilters, SearchProduct, SearchSort } from "./types";

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function tokens(value: string): string[] {
  return normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length]!;
}

function fieldScore(query: string, value: string | null, weight: number): number {
  if (!value) return 0;
  const q = normalize(query);
  const v = normalize(value);
  if (v === q) return weight * 5;
  if (v.startsWith(q)) return weight * 4;
  if (v.includes(q)) return weight * 3;
  const queryTokens = tokens(query);
  const valueTokens = tokens(value);
  return queryTokens.reduce((score, token) => {
    const exact = valueTokens.some((candidate) => candidate === token);
    const typo = token.length >= 4 && valueTokens.some((candidate) => levenshtein(token, candidate) <= 1);
    return score + (exact ? weight * 2 : typo ? weight : 0);
  }, 0);
}

export function relevanceScore(product: SearchProduct, query: string | undefined): number {
  if (!query) return product.isFeatured ? 1 : 0;
  return (
    fieldScore(query, product.name, 8) +
    fieldScore(query, product.brandName, 5) +
    fieldScore(query, product.categoryName, 4) +
    fieldScore(query, product.sellerStoreName, 4) +
    fieldScore(query, product.sku, 4) +
    fieldScore(query, product.description, 2) +
    product.tags.reduce((score, tag) => score + fieldScore(query, tag, 3), 0)
  );
}

export function matchesFilters(product: SearchProduct, filters: ProductSearchFilters): boolean {
  if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
  if (filters.brandId && product.brandId !== filters.brandId) return false;
  if (filters.sellerId && product.sellerId !== filters.sellerId) return false;
  if (filters.minPriceMinor !== undefined && product.basePriceMinor < filters.minPriceMinor) return false;
  if (filters.maxPriceMinor !== undefined && product.basePriceMinor > filters.maxPriceMinor) return false;
  if (filters.minRating !== undefined && product.rating < filters.minRating) return false;
  if ((filters.inStockOnly || filters.availability === "in_stock") && !product.inStock) return false;
  if (filters.availability === "out_of_stock" && product.inStock) return false;
  if (filters.condition && product.condition !== filters.condition) return false;
  if (filters.color && !product.colors.map(normalize).includes(normalize(filters.color))) return false;
  if (filters.size && !product.sizes.map(normalize).includes(normalize(filters.size))) return false;
  if (filters.material && !product.materials.map(normalize).includes(normalize(filters.material))) return false;
  if (filters.discountedOnly && product.compareAtPriceMinor === null) return false;
  if (filters.verifiedSellerOnly && !product.sellerVerified) return false;
  if (filters.newArrivalsOnly && product.publishedAt && Date.now() - new Date(product.publishedAt).getTime() > 30 * 24 * 60 * 60 * 1000) return false;
  return true;
}

export function compareProducts(sort: SearchSort, query: string | undefined): (a: SearchProduct, b: SearchProduct) => number {
  return (a, b) => {
    if (sort === "price_asc") return a.basePriceMinor - b.basePriceMinor || b.rating - a.rating;
    if (sort === "price_desc") return b.basePriceMinor - a.basePriceMinor || b.rating - a.rating;
    if (sort === "newest") return new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime();
    if (sort === "highest_rated") return b.rating - a.rating || b.reviewCount - a.reviewCount;
    if (sort === "most_reviewed") return b.reviewCount - a.reviewCount || b.rating - a.rating;
    if (sort === "best_selling") return b.soldCount - a.soldCount || b.rating - a.rating;
    if (sort === "trending") return b.viewCount + b.soldCount * 5 - (a.viewCount + a.soldCount * 5);
    return relevanceScore(b, query) - relevanceScore(a, query) || b.rating - a.rating || b.reviewCount - a.reviewCount;
  };
}
