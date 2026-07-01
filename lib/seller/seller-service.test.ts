import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSellerService, type SellerRecord, type SellerRepository, type SellerRoleRepository } from "./index.js";

const userId = "11111111-1111-4111-8111-111111111111";
const sellerId = "22222222-2222-4222-8222-222222222222";

function createRecord(overrides: Partial<SellerRecord> = {}): SellerRecord {
  return {
    id: sellerId,
    ownerId: userId,
    storeName: "Nairobi Style",
    slug: "nairobi-style",
    description: null,
    logoUrl: null,
    bannerUrl: null,
    status: "draft",
    kycStatus: "not_started",
    countryCode: "KE",
    defaultCurrency: "KES",
    supportEmail: null,
    supportPhone: null,
    metadata: {},
    createdAt: "2026-07-02T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
    ...overrides
  };
}

function createDeps(existing: SellerRecord | null = null) {
  let current = existing;
  const roles: string[] = [];
  const events: string[] = [];

  const sellers: SellerRepository = {
    async findByOwnerId(ownerId) {
      return current?.ownerId === ownerId ? current : null;
    },
    async findById(id) {
      return current?.id === id ? current : null;
    },
    async createSeller(input) {
      current = createRecord({
        ownerId: input.ownerId,
        storeName: input.storeName,
        slug: input.slug,
        description: input.description ?? null,
        status: input.status,
        kycStatus: input.kycStatus,
        countryCode: input.countryCode ?? null,
        defaultCurrency: input.defaultCurrency,
        supportEmail: input.supportEmail ?? null,
        supportPhone: input.supportPhone ?? null,
        metadata: input.metadata
      });
      return current;
    },
    async updateSeller(input) {
      assert.ok(current);
      current = { ...current, ...input.values, metadata: input.values.metadata ?? current.metadata };
      return current;
    },
    async addOwnerMember() {}
  };

  const roleRepository: SellerRoleRepository = {
    async grantSellerRole(input) {
      roles.push(input.userId);
    }
  };

  return {
    service: createSellerService({
      sellers,
      roles: roleRepository,
      events: {
        async publish(event) {
          events.push(event.type);
        }
      }
    }),
    roles,
    events,
    get current() {
      return current;
    }
  };
}

describe("seller service", () => {
  it("creates seller application, owner membership, seller role, and event", async () => {
    const deps = createDeps();

    const result = await deps.service.apply({
      userId,
      storeName: "Nairobi Style",
      businessCategory: "fashion",
      countryCode: "KE",
      defaultCurrency: "KES"
    });

    assert.equal(result.ok, true);
    assert.equal(deps.current?.slug, "nairobi-style");
    assert.deepEqual(deps.roles, [userId]);
    assert.deepEqual(deps.events, ["seller.application.received"]);
  });

  it("prevents duplicate seller applications per owner", async () => {
    const deps = createDeps(createRecord());
    const result = await deps.service.apply({ userId, storeName: "Again", businessCategory: "beauty" });

    assert.deepEqual(result, {
      ok: false,
      code: "SELLER_ALREADY_EXISTS",
      message: "This user already owns a seller account.",
      status: 409
    });
  });

  it("blocks non-owner store updates", async () => {
    const deps = createDeps(createRecord());
    const result = await deps.service.updateStore({ sellerId, storeName: "Updated" }, "33333333-3333-4333-8333-333333333333");

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "AUTHORIZATION_DENIED");
  });

  it("submits draft applications into pending status", async () => {
    const deps = createDeps(createRecord());
    const result = await deps.service.submitApplication(sellerId, userId);

    assert.equal(result.ok, true);
    assert.equal(deps.current?.status, "pending");
  });
});
