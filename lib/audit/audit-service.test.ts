import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAuditService, type AdminActor, type AuditRepository, type PlatformAuditRecord } from "./index.js";

const admin: AdminActor = { userId: "admin-1", roles: ["admin"] };
const support: AdminActor = { userId: "support-1", roles: ["support"] };

function repo() {
  const records: PlatformAuditRecord[] = [];
  const audit: AuditRepository = {
    async write(input) {
      const record: PlatformAuditRecord = { ...input, id: `audit-${records.length + 1}`, createdAt: "2026-07-02T00:00:00.000Z" };
      records.push(record);
      return record;
    },
    async search(filters) {
      return {
        items: records.filter((record) => !filters.entityType || record.entityType === filters.entityType),
        nextCursor: null
      };
    }
  };
  return { audit, records };
}

describe("audit service", () => {
  it("requires write permission for authoritative audit records", async () => {
    const deps = repo();
    const service = createAuditService({ audit: deps.audit });

    const denied = await service.record(support, { action: "x", entityType: "admin", entityId: "1", severity: "info" });
    assert.equal(denied.ok, false);

    const allowed = await service.record(admin, { action: "x", entityType: "admin", entityId: "1", severity: "info" });
    assert.equal(allowed.ok, true);
    assert.equal(deps.records.length, 1);
  });

  it("searches audit records for support and admin roles", async () => {
    const deps = repo();
    const service = createAuditService({ audit: deps.audit });
    await service.record(admin, { action: "seller.approved", entityType: "seller", entityId: "seller-1", severity: "info" });

    const result = await service.search(support, { entityType: "seller" });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.items.length, 1);
  });
});
