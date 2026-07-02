import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMarketplaceAnalyticsRepository } from "../../../../lib/analytics/marketplace/supabase-repository";
import { createMarketplaceAnalyticsPermissionChecker } from "../../../../lib/analytics/marketplace/permission-checker";
import { createMarketplaceAnalyticsService } from "../../../../lib/analytics/marketplace/service";
import { createSupabaseClient } from "../../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const service = createMarketplaceAnalyticsService({
      repository: createSupabaseMarketplaceAnalyticsRepository(supabase as any),
      permissionChecker: createMarketplaceAnalyticsPermissionChecker(supabase as any),
    });

    const result = await service.getMessagingAnalytics(user.id, params);

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
