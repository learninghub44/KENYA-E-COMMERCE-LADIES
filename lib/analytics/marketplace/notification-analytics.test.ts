import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NotificationAnalytics } from "./types";

describe("notification analytics types", () => {
  it("constructs valid notification analytics", () => {
    const analytics: NotificationAnalytics = {
      notificationsSent: 5000,
      readRate: 65.5,
      openRate: 45.2,
      deliverySuccess: 98.1,
      notificationTypeDistribution: {
        orders: 2000,
        messaging: 1000,
        seller: 500,
        account: 500,
        reviews: 300,
        announcements: 500,
        security: 200,
      },
      notificationGrowth: { current: 5000, previous: 4000, growthRate: 25 },
      emailDelivery: { total: 3000, sent: 2943, failed: 57 },
    };

    assert.equal(analytics.notificationsSent, 5000);
    assert.equal(analytics.readRate, 65.5);
    assert.equal(analytics.deliverySuccess, 98.1);
    assert.equal(analytics.notificationTypeDistribution.orders, 2000);
  });
});
