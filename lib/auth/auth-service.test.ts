import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAuthService, type AuthServiceDependencies } from "./auth-service";

function createDeps(): AuthServiceDependencies & { events: string[]; roleStore: string[] } {
  const events: string[] = [];
  const roleStore = ["buyer"];
  const user = {
    id: "user-1",
    email: "buyer@example.com",
    email_confirmed_at: "2026-07-01T00:00:00Z"
  };
  const session = {
    access_token: "access",
    refresh_token: "refresh",
    expires_at: 9999999999,
    user
  };

  return {
    events,
    roleStore,
    auth: {
      async signUp() {
        return { data: { user, session }, error: null };
      },
      async signInWithPassword() {
        return { data: { user, session }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
      async updateUser() {
        return { data: { user }, error: null };
      },
      async getUser() {
        return { data: { user }, error: null };
      },
      async getSession() {
        return { data: { session }, error: null };
      },
      async refreshSession() {
        return { data: { session }, error: null };
      }
    },
    profiles: {
      async createProfile() {},
      async setProfileStatus() {}
    },
    roles: {
      async listRoles() {
        return roleStore;
      },
      async grantRole(input) {
        roleStore.push(input.role);
      }
    },
    audit: {
      async writeAudit(record) {
        events.push(record.action);
      },
      async writeActivity(record) {
        events.push(record.action);
      }
    }
  };
}

describe("auth service", () => {
  it("registers through Supabase, creates profile, grants buyer role, and audits", async () => {
    const deps = createDeps();
    const service = createAuthService(deps);

    const result = await service.register({ email: "buyer@example.com", password: "StrongerPass1!" });

    assert.equal(result.ok, true);
    assert.equal(deps.roleStore.includes("buyer"), true);
    assert.equal(deps.events.includes("registration_completed"), true);
  });

  it("logs in and returns normalized session roles", async () => {
    const service = createAuthService(createDeps());
    const result = await service.login({ email: "buyer@example.com", password: "pw", rememberMe: true });

    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.data.user.roles, ["buyer"]);
  });

  it("rejects weak password updates before reaching Supabase", async () => {
    const service = createAuthService(createDeps());
    const result = await service.updatePassword({ password: "weak" });

    assert.deepEqual(result, {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Password does not meet policy.",
      status: 400
    });
  });
});
