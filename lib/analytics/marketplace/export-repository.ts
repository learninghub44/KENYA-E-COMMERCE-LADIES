import { ExportRecord, ExportReportType } from "./export-service.js";
import { SupabaseRpcClient } from "./supabase-repository.js";

export function createMarketplaceExportRepository(client: SupabaseRpcClient) {
  return {
    async fetchData(reportType: ExportReportType, startDate: string, endDate: string): Promise<ExportRecord[]> {
      const mappedType = reportType === "marketplace-summary" ? "revenue" : reportType;

      const { data, error } = await client.rpc("get_marketplace_export_data", {
        p_report_type: mappedType,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        throw new Error(`Failed to fetch export data: ${JSON.stringify(error)}`);
      }

      return (data as ExportRecord[]) ?? [];
    },
  };
}
