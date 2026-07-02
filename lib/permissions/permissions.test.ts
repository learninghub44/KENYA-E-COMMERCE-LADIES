import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasEveryPermission, hasPermission, normalizeRoles } from "./index";

describe("permissions", () => {
  it("grants buyer account and seller registration permissions", () => {
    assert.equal(hasPermission(["buyer"], "auth.password.update"), true);
    assert.equal(hasPermission(["buyer"], "seller.auth.register"), true);
    assert.equal(hasPermission(["buyer"], "admin.access"), false);
  });

  it("requires every permission for compound checks", () => {
    assert.equal(hasEveryPermission(["admin"], ["admin.access", "security.lockout.manage"]), true);
    assert.equal(hasEveryPermission(["moderator"], ["admin.access", "security.lockout.manage"]), false);
  });

  it("filters unknown role strings from database claims", () => {
    assert.deepEqual(normalizeRoles(["buyer", "unknown", "support"]), ["buyer", "support"]);
  });
});
