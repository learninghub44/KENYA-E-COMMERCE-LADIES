import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAdminService, type AdminListFilters, type UserAdminRecord } from "./index.js";
import type { AdminActor, CursorPage } from "../audit/index.js";

const admin: AdminActor = { userId: "admin-1", roles: ["admin"] };
const moderator: AdminActor = { userId: "mod-1", roles: ["moderator"] };
const buyer: AdminActor = { userId: "buyer-1", roles: ["buyer"] };

const emptyPage: CursorPage<unknown> = { items: [], nextCursor: null };

function userRecord(overrides: Partial<UserAdminRecord> = {}): UserAdminRecord {
  return {
    id: "user-1",
    email: "user@example.com",
    displayName: "User",
    status: "active",
    roles: ["buyer"],
    createdAt: "2026-07-02T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
    ...overrides
  };
}

function createDeps() {
  let user = userRecord();
  let seller = { id: "seller-1", status: "pending" };
  let product = { id: "product-1", status: "pending_review" };
  let order = { id: "order-1", status: "pending" };
  const audits: string[] = [];

  const search = async (_filters: AdminListFilters): Promise<CursorPage<unknown>> => emptyPage;
  const service = createAdminService({
    dashboard: {
      async getMetrics() {
        return {
          users: { total: 1, suspended: 0, locked: 0 },
          sellers: { total: 1, pending: 1, approved: 0, suspended: 0 },
          products: { total: 1, pendingReview: 1, published: 0, suspended: 0 },
          orders: { total: 1, pending: 1, completed: 0 },
          conversations: { total: 1, reportedMessages: 0 },
          moderationQueue: { sellers: 1, products: 1, reports: 0, messages: 0 },
          pendingApprovals: 2,
          recentActivity: [],
          systemAlerts: []
        };
      }
    },
    users: {
      async search() {
        return { items: [user], nextCursor: null };
      },
      async findById(id) {
        return id === user.id ? user : null;
      },
      async suspend() {
        user = { ...user, status: "suspended" };
        return user;
      },
      async reactivate() {
        user = { ...user, status: "active" };
        return user;
      },
      async lock() {
        user = { ...user, status: "locked" };
        return user;
      },
      async forceLogout() {
        return { revokedSessions: 3 };
      }
    },
    sellers: {
      search,
      async findById(id) {
        return id === seller.id ? seller : null;
      },
      async transitionStatus(_id, status) {
        seller = { ...seller, status };
        return seller;
      }
    },
    products: {
      search,
      async findById(id) {
        return id === product.id ? product : null;
      },
      async transition(_id, status) {
        product = { ...product, status };
        return product;
      }
    },
    orders: {
      search,
      async findById(id) {
        return id === order.id ? order : null;
      },
      async transitionStatus(input) {
        order = { ...order, status: input.status };
        return order;
      },
      async addInternalNote(input) {
        return { ...order, internalNote: input.note };
      }
    },
    reports: { search },
    messages: { search },
    audit: {
      async writeAdminAudit(input) {
        audits.push(input.action);
      }
    }
  });

  return { service, audits, get user() { return user; }, get seller() { return seller; }, get product() { return product; }, get order() { return order; } };
}

describe("admin service", () => {
  it("shows real dashboard metrics only to admin users", async () => {
    const deps = createDeps();
    const denied = await deps.service.dashboard(buyer);
    assert.equal(denied.ok, false);

    const allowed = await deps.service.dashboard(admin);
    assert.equal(allowed.ok, true);
    if (allowed.ok) assert.equal(allowed.data.pendingApprovals, 2);
  });

  it("suspends users through the auth gateway and audits the action", async () => {
    const deps = createDeps();
    const result = await deps.service.suspendUser(admin, "user-1", "Fraud risk");
    assert.equal(result.ok, true);
    assert.equal(deps.user.status, "suspended");
    assert.deepEqual(deps.audits, ["user.suspended"]);
  });

  it("lets moderators approve sellers and products but not suspend user accounts", async () => {
    const deps = createDeps();

    const seller = await deps.service.transitionSeller(moderator, "seller-1", "approved", "KYC approved by Agent 3");
    assert.equal(seller.ok, true);
    assert.equal(deps.seller.status, "approved");

    const product = await deps.service.transitionProduct(moderator, "product-1", "approved", "Listing accepted");
    assert.equal(product.ok, true);
    assert.equal(deps.product.status, "approved");

    const user = await deps.service.suspendUser(moderator, "user-1", "Nope");
    assert.equal(user.ok, false);
    assert.deepEqual(deps.audits, ["seller.approved", "product.approved"]);
  });

  it("updates orders with order.manage permission and audits the status change", async () => {
    const deps = createDeps();
    const result = await deps.service.transitionOrder(admin, "order-1", "confirmed", "Support verified stock");
    assert.equal(result.ok, true);
    assert.equal(deps.order.status, "confirmed");
    assert.deepEqual(deps.audits, ["order.status_updated"]);
  });

  it("searches all operational domains with pagination caps", async () => {
    const deps = createDeps();
    const result = await deps.service.search(admin, { query: "dress", limit: 500 });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.users.items.length, 1);
  });
});
