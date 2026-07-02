import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createExportService, ExportRecord, ExportReportType } from "./export-service";

describe("export service", () => {
  it("generates CSV from records", async () => {
    const service = createExportService({
      fetchData: async () => [
        { id: "1", name: "Product A", price: 1000 },
        { id: "2", name: "Product B", price: 2000 },
      ],
    });

    const result = await service.export("products", "csv", "2026-01-01", "2026-06-30");
    assert.equal(result.mimeType, "text/csv");
    assert.equal(result.extension, "csv");
    assert.ok(typeof result.data === "string");
    assert.ok((result.data as string).includes("id,name,price"));
    assert.ok((result.data as string).includes("1,Product A,1000"));
  });

  it("handles empty records for CSV", async () => {
    const service = createExportService({
      fetchData: async () => [],
    });

    const result = await service.export("revenue", "csv", "2026-01-01", "2026-06-30");
    assert.equal(result.data, "");
  });

  it("escapes CSV values with commas", async () => {
    const service = createExportService({
      fetchData: async () => [
        { id: "1", description: "Has, comma" },
      ],
    });

    const result = await service.export("products", "csv", "2026-01-01", "2026-06-30");
    assert.ok((result.data as string).includes('"Has, comma"'));
  });
});
