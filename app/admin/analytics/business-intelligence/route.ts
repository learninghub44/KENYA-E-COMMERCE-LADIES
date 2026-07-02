import { NextRequest, NextResponse } from "next/server";
import { createSupabaseBiRepository } from "../../../../lib/analytics/marketplace/bi-repository";
import { createMarketplaceAnalyticsPermissionChecker } from "../../../../lib/analytics/marketplace/permission-checker";
import { createBusinessIntelligenceService } from "../../../../lib/business-intelligence/service";
import { createSupabaseClient } from "../../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const service = createBusinessIntelligenceService({
      repository: createSupabaseBiRepository(supabase as any),
      permissionChecker: createMarketplaceAnalyticsPermissionChecker(supabase as any),
    });

    const result = await service.getBusinessIntelligence(user.id, params);

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
