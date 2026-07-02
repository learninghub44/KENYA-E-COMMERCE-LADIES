import { PermissionChecker } from './analytics-service';

// ============================================================================
// SUPABASE PERMISSION CHECKER
// ============================================================================

export interface SupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: unknown) => {
        eq: (column: string, value: unknown) => {
          maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
        };
        maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
      };
      maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
    };
  };
}

export function createSupabasePermissionChecker(client: SupabaseClient): PermissionChecker {
  return {
    async canViewSellerAnalytics(userId: string, sellerId: string): Promise<boolean> {
      // Check if user is a seller member
      const { data: memberData, error: memberError } = await client
        .from('seller_members')
        .select('seller_id')
        .eq('user_id', userId)
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (memberError) {
        console.error('Error checking seller membership:', memberError);
        return false;
      }

      if (memberData) {
        return true;
      }

      // Check if user has admin or moderator role
      const { data: roleData, error: roleError } = await client
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.error('Error checking user roles:', roleError);
        return false;
      }

      if (roleData) {
        const role = (roleData as Record<string, unknown>).role as string;
        return role === 'admin' || role === 'moderator';
      }

      return false;
    },
  };
}
