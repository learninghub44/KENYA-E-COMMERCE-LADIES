import { MarketplaceHealthScore } from "./types";

export interface HealthScoreConfig {
  weights?: {
    sellerActivity?: number;
    productApprovalRate?: number;
    revenueGrowth?: number;
    customerGrowth?: number;
    averageRatings?: number;
    searchPerformance?: number;
    inventoryHealth?: number;
  };
}

export interface HealthScoreData {
  activeSellers: number;
  totalActiveSellers: number;
  activeProducts: number;
  totalReviewedProducts: number;
  revenueMinor: number;
  prevRevenueMinor: number;
  newBuyers: number;
  activeBuyers: number;
  avgRating: number;
  totalSearches: number;
  zeroResultSearches: number;
  stockedItems: number;
  totalInventoryItems: number;
}

const DEFAULT_WEIGHTS = {
  sellerActivity: 20,
  productApprovalRate: 15,
  revenueGrowth: 20,
  customerGrowth: 15,
  averageRatings: 15,
  searchPerformance: 10,
  inventoryHealth: 5,
};

export function calculateMarketplaceHealthScore(data: HealthScoreData, config?: HealthScoreConfig): MarketplaceHealthScore {
  const w = { ...DEFAULT_WEIGHTS, ...config?.weights };

  const normalize = (value: number, max: number, weight: number): number => {
    if (max <= 0) return 0;
    return Math.min(weight, Math.max(0, (value / max) * weight));
  };

  const sellerActivityScore = normalize(data.activeSellers, data.totalActiveSellers, w.sellerActivity);
  const productApprovalRateScore = normalize(data.activeProducts, data.totalReviewedProducts, w.productApprovalRate);
  const revenueGrowthScore = data.prevRevenueMinor > 0
    ? Math.min(w.revenueGrowth, Math.max(0, ((data.revenueMinor - data.prevRevenueMinor) / data.prevRevenueMinor) * w.revenueGrowth + w.revenueGrowth))
    : w.revenueGrowth / 2;
  const customerGrowthScore = normalize(data.newBuyers, Math.max(data.activeBuyers, 1), w.customerGrowth);
  const averageRatingsScore = (data.avgRating / 5) * w.averageRatings;
  const searchPerformanceScore = data.totalSearches > 0
    ? (1 - data.zeroResultSearches / Math.max(data.totalSearches, 1)) * w.searchPerformance
    : w.searchPerformance / 2;
  const inventoryHealthScore = normalize(data.stockedItems, data.totalInventoryItems, w.inventoryHealth);

  const totalScore = Math.round(
    (sellerActivityScore +
      productApprovalRateScore +
      revenueGrowthScore +
      customerGrowthScore +
      averageRatingsScore +
      searchPerformanceScore +
      inventoryHealthScore) * 100
  ) / 100;

  return {
    score: totalScore,
    components: {
      sellerActivity: { score: Math.round(sellerActivityScore * 100) / 100, maxScore: w.sellerActivity, label: "Seller Activity" },
      productApprovalRate: { score: Math.round(productApprovalRateScore * 100) / 100, maxScore: w.productApprovalRate, label: "Product Approval Rate" },
      revenueGrowth: { score: Math.round(revenueGrowthScore * 100) / 100, maxScore: w.revenueGrowth, label: "Revenue Growth" },
      customerGrowth: { score: Math.round(customerGrowthScore * 100) / 100, maxScore: w.customerGrowth, label: "Customer Growth" },
      averageRatings: { score: Math.round(averageRatingsScore * 100) / 100, maxScore: w.averageRatings, label: "Average Ratings" },
      searchPerformance: { score: Math.round(searchPerformanceScore * 100) / 100, maxScore: w.searchPerformance, label: "Search Performance" },
      inventoryHealth: { score: Math.round(inventoryHealthScore * 100) / 100, maxScore: w.inventoryHealth, label: "Inventory Health" },
    },
    maxScore: Object.values(w).reduce((a, b) => a + b, 0),
    status: totalScore >= 80 ? "healthy" : totalScore >= 50 ? "moderate" : "critical",
    periodStart: "",
    periodEnd: "",
  };
}
