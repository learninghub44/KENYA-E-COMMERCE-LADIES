import { NextRequest, NextResponse } from "next/server";
import { createMarketplaceAnalyticsPermissionChecker } from "../../../../lib/analytics/marketplace/permission-checker";
import { createMarketplaceExportRepository } from "../../../../lib/analytics/marketplace/export-repository";
import { createExportService, ExportFormat, ExportReportType } from "../../../../lib/analytics/marketplace/export-service";
import { createSupabaseClient } from "../../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissionChecker = createMarketplaceAnalyticsPermissionChecker(supabase);
    const allowed = await permissionChecker.canViewMarketplaceAnalytics(user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reportType = request.nextUrl.searchParams.get("reportType") as ExportReportType | null;
    const format = (request.nextUrl.searchParams.get("format") as ExportFormat) ?? "csv";
    const startDate = request.nextUrl.searchParams.get("startDate") ?? "";
    const endDate = request.nextUrl.searchParams.get("endDate") ?? "";

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "reportType, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    const exportRepo = createMarketplaceExportRepository(supabase);
    const service = createExportService({ fetchData: exportRepo.fetchData });
    const result = await service.export(reportType, format, startDate, endDate, `Marketplace ${reportType} Report`);

    return new NextResponse(result.data as BodyInit, {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="marketplace-${reportType}-${startDate}-${endDate}.${result.extension}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
