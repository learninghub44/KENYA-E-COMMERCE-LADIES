import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createReportService, type ReportRecord, type ReportRepository } from "./index.js";
import type { AdminActor } from "../audit/index.js";

const moderator: AdminActor = { userId: "mod-1", roles: ["moderator"] };
const buyer: AdminActor = { userId: "buyer-1", roles: ["buyer"] };

function createRepo() {
  let current: ReportRecord | null = null;
  const audits: string[] = [];
  const reports: ReportRepository = {
    async create(input) {
      current = {
        ...input,
        id: "report-1",
        description: input.description ?? null,
        status: "open",
        assignedTo: null,
        resolution: null,
        internalNotes: [],
        createdAt: "2026-07-02T00:00:00.000Z",
        updatedAt: "2026-07-02T00:00:00.000Z",
        resolvedAt: null
      };
      return current;
    },
    async findById(id) {
      return current?.id === id ? current : null;
    },
    async search() {
      return { items: current ? [current] : [], nextCursor: null };
    },
    async update({ values }) {
      assert.ok(current);
      current = {
        ...current,
        ...values,
        internalNotes: values.internalNote ? [...current.internalNotes, values.internalNote] : current.internalNotes,
        updatedAt: "2026-07-02T00:01:00.000Z"
      };
      return current;
    }
  };
  return {
    reports,
    audits,
    service: createReportService({
      reports,
      audit: {
        async writeAdminAudit(input) {
          audits.push(input.action);
        }
      }
    })
  };
}

describe("report service", () => {
  it("tracks assignment, notes, and resolution with audit records", async () => {
    const deps = createRepo();
    await deps.service.create({ targetType: "product", targetId: "product-1", reporterId: "buyer-1", reason: "counterfeit" });

    const assigned = await deps.service.assign(moderator, "report-1", "mod-2");
    assert.equal(assigned.ok, true);
    const noted = await deps.service.addNote(moderator, "report-1", "Reviewed product images.");
    assert.equal(noted.ok, true);
    const resolved = await deps.service.resolve(moderator, "report-1", "Listing removed.");
    assert.equal(resolved.ok, true);
    if (resolved.ok) assert.equal(resolved.data.status, "resolved");
    assert.deepEqual(deps.audits, ["report.assigned", "report.note_added", "report.resolved"]);
  });

  it("prevents buyers from searching moderation reports", async () => {
    const deps = createRepo();
    const result = await deps.service.search(buyer, {});
    assert.equal(result.ok, false);
  });
});
