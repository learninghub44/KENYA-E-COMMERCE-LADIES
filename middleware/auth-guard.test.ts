import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { authorizeRoute } from "./auth-guard";

describe("authorizeRoute", () => {
  it("allows public routes without a session", () => {
    assert.deepEqual(authorizeRoute({ authLevel: "public", roles: [] }), { allowed: true });
  });

  it("rejects authenticated routes without roles", () => {
    assert.deepEqual(authorizeRoute({ authLevel: "authenticated", roles: [] }), {
      allowed: false,
      status: 401,
      code: "SESSION_REQUIRED"
    });
  });

  it("enforces seller and admin route levels", () => {
    assert.equal(authorizeRoute({ authLevel: "seller", roles: ["buyer"] }).allowed, false);
    assert.deepEqual(authorizeRoute({ authLevel: "admin", roles: ["admin"] }), { allowed: true });
  });

  it("enforces required permissions", () => {
    assert.deepEqual(
      authorizeRoute({ authLevel: "authenticated", roles: ["moderator"], permissions: "admin.moderate" }),
      { allowed: true }
    );
    assert.deepEqual(
      authorizeRoute({ authLevel: "authenticated", roles: ["moderator"], permissions: "admin.role.manage" }),
      { allowed: false, status: 403, code: "AUTHORIZATION_DENIED" }
    );
  });
});
