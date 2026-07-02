export type ExportFormat = "csv" | "xlsx" | "pdf";

export type ExportReportType =
  | "marketplace-summary"
  | "revenue"
  | "orders"
  | "sellers"
  | "products"
  | "categories"
  | "brands"
  | "reviews"
  | "search"
  | "notifications";

export interface ExportRecord {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ExportServiceDependencies {
  fetchData: (reportType: ExportReportType, startDate: string, endDate: string) => Promise<ExportRecord[]>;
}

function toCsv(records: ExportRecord[]): string {
  if (records.length === 0) return "";
  const headers = Object.keys(records[0] ?? {});
  const lines = records.map((record) =>
    headers.map((h) => {
      const val = record[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}

function toXlsx(_records: ExportRecord[]): Uint8Array {
  throw new Error("Excel export requires the 'exceljs' package. Install with: npm install exceljs");
}

function toPdf(_records: ExportRecord[], _title: string): Uint8Array {
  throw new Error("PDF export requires the 'jspdf' package. Install with: npm install jspdf");
}

export function createExportService(deps: ExportServiceDependencies) {
  const { fetchData } = deps;

  return {
    async export(
      reportType: ExportReportType,
      format: ExportFormat,
      startDate: string,
      endDate: string,
      title = "Marketplace Report",
    ): Promise<{ data: Uint8Array | string; mimeType: string; extension: string }> {
      const records = await fetchData(reportType, startDate, endDate);

      switch (format) {
        case "csv": {
          const csv = toCsv(records);
          return { data: csv, mimeType: "text/csv", extension: "csv" };
        }
        case "xlsx": {
          const buf = toXlsx(records);
          return {
            data: buf,
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            extension: "xlsx",
          };
        }
        case "pdf": {
          const buf = toPdf(records, title);
          return { data: buf, mimeType: "application/pdf", extension: "pdf" };
        }
      }
    },
  };
}

export type ExportService = ReturnType<typeof createExportService>;
