import { MarketplaceAnalyticsPermissionChecker } from "./types.js";

export interface SupabaseRoleClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: unknown) => Promise<{ data: unknown; error: unknown }>;
    };
  };
}

export function createMarketplaceAnalyticsPermissionChecker(client: SupabaseRoleClient): MarketplaceAnalyticsPermissionChecker {
  return {
    async canViewMarketplaceAnalytics(userId: string): Promise<boolean> {
      const { data, error } = await client.from("user_roles").select("role").eq("user_id", userId);
      if (error || !Array.isArray(data)) {
        return false;
      }

      return data.some((row) => {
        const role = (row as Record<string, unknown>).role;
        return role === "admin" || role === "super_admin";
      });
    },
  };
}
