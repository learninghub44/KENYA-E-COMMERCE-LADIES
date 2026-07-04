import { EventRepository, InternalEvent, EventFilters, CursorPage } from "./types";

export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  filters?: {
    eventTypes?: string[];
    startDate?: string;
    endDate?: string;
  };
}

export interface ExportResult {
  filename: string;
  mimeType: string;
  content: string;
}

export interface ExportService {
  exportEvents(
    repository: EventRepository,
    options: ExportOptions,
  ): Promise<ExportResult>;
}

function toCsv(events: InternalEvent[]): string {
  const headers = [
    "id", "eventType", "eventVersion", "userId", "sellerId",
    "sessionId", "requestId", "entityType", "entityId",
    "source", "platform", "createdAt",
  ];
  const rows = events.map((e) =>
    headers.map((h) => {
      const val = (e as unknown as Record<string, unknown>)[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

const MIME_TYPES = {
  csv: "text/csv",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
} as const;

export function createExportService(): ExportService {
  return {
    async exportEvents(repository: EventRepository, options: ExportOptions): Promise<ExportResult> {
      const filters: Record<string, unknown> = {};
      if (options.filters?.eventTypes) filters.eventTypes = options.filters.eventTypes;
      if (options.filters?.startDate) filters.startDate = options.filters.startDate;
      if (options.filters?.endDate) filters.endDate = options.filters.endDate;
      const page: CursorPage<InternalEvent> = await repository.list(filters as EventFilters);
      const events = page.data;
      const filename = `events-export-${Date.now()}`;

      const format = options.format;
      if (format === "csv") {
        return { filename: `${filename}.csv`, mimeType: MIME_TYPES.csv, content: toCsv(events) };
      }

      if (format === "excel") {
        const mimeType = MIME_TYPES.excel;
        try {
          // @ts-expect-error - exceljs is optional
          const mod = (await import("exceljs")) as { Workbook: new () => { addWorksheet: (n: string) => { columns: unknown; addRow: (r: unknown) => void }; csv: { writeBuffer: () => Promise<ArrayBuffer> } } };
          const workbook = new mod.Workbook();
          const sheet = workbook.addWorksheet("Events");
          sheet.columns = [
            { header: "ID", key: "id" },
            { header: "Type", key: "eventType" },
            { header: "User", key: "userId" },
            { header: "Seller", key: "sellerId" },
            { header: "Entity", key: "entityType" },
            { header: "Entity ID", key: "entityId" },
            { header: "Source", key: "source" },
            { header: "Created", key: "createdAt" },
          ];
          events.forEach((e) => sheet.addRow(e as unknown as Record<string, unknown>));
          const buffer = await workbook.csv.writeBuffer();
          return { filename: `${filename}.xlsx`, mimeType, content: Buffer.from(buffer).toString("base64") };
        } catch {
          throw new Error("Excel export requires 'exceljs' package. Install with: npm install exceljs");
        }
      }

      if (format === "pdf") {
        const mimeType = MIME_TYPES.pdf;
        try {
          // @ts-ignore - jspdf is optional, may not be installed
          const { default: JsPDF } = await import("jspdf") as { default: new () => { text: (s: string, x: number, y: number) => void; output: (t: string) => ArrayBuffer } };
          const doc = new JsPDF();
          doc.text("Events Export", 10, 10);
          events.slice(0, 50).forEach((e, i) => {
            doc.text(`${e.eventType} - ${e.createdAt}`, 10, 20 + i * 10);
          });
          const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
          return { filename: `${filename}.pdf`, mimeType, content: pdfBuffer.toString("base64") };
        } catch {
          throw new Error("PDF export requires 'jspdf' package. Install with: npm install jspdf");
        }
      }

      throw new Error(`Unsupported format: ${format}`);
    },
  };
}
