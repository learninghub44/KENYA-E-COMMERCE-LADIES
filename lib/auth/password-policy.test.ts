import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePassword } from "./password-policy.js";

describe("password policy", () => {
  it("accepts a strong password", () => {
    assert.deepEqual(validatePassword("StrongerPass1!"), []);
  });

  it("reports missing complexity requirements", () => {
    assert.equal(validatePassword("short").includes("Use at least 12 characters."), true);
    assert.equal(validatePassword("short").includes("Include an uppercase letter."), true);
    assert.equal(validatePassword("short").includes("Include a number."), true);
    assert.equal(validatePassword("short").includes("Include a symbol."), true);
  });
});
