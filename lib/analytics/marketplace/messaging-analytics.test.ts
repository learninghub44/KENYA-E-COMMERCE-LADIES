import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MessagingAnalytics } from "./types.js";

describe("messaging analytics types", () => {
  it("constructs valid messaging analytics", () => {
    const analytics: MessagingAnalytics = {
      conversationsStarted: 150,
      activeConversations: 75,
      messagesSent: 1200,
      sellerResponseTime: 2.5,
      buyerResponseTime: 5.0,
      conversationGrowth: { current: 150, previous: 100, growthRate: 50 },
      messageGrowth: { current: 1200, previous: 900, growthRate: 33.33 },
    };

    assert.equal(analytics.conversationsStarted, 150);
    assert.equal(analytics.sellerResponseTime, 2.5);
    assert.equal(analytics.messageGrowth.growthRate, 33.33);
  });
});
