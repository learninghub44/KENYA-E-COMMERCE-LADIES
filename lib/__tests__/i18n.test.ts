import { describe, it, expect } from "vitest"
import { formatCurrency, formatDate, formatRelativeTime, formatNumber, getLocaleDir, createTranslator } from "../i18n"

describe("formatCurrency", () => {
  it("formats KES currency", () => {
    const result = formatCurrency(2450)
    expect(result).toContain("2,450")
    expect(result).toContain("KES")
  })

  it("falls back gracefully with invalid locale", () => {
    const result = formatCurrency(100, "invalid-locale")
    expect(result).toContain("KES")
  })
})

describe("formatDate", () => {
  it("formats a date", () => {
    const result = formatDate("2026-07-02")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })
})

describe("formatRelativeTime", () => {
  it("returns just now for recent dates", () => {
    const result = formatRelativeTime(Date.now())
    expect(result).toMatch(/just now|second/)
  })
})

describe("formatNumber", () => {
  it("formats numbers with separators", () => {
    const result = formatNumber(12345)
    expect(result).toContain("12")
  })

  it("falls back for invalid locale", () => {
    const result = formatNumber(123, "invalid")
    expect(result).toBe("123")
  })
})

describe("getLocaleDir", () => {
  it("returns ltr for en-KE", () => {
    expect(getLocaleDir("en-KE")).toBe("ltr")
  })

  it("returns ltr for unknown locale", () => {
    expect(getLocaleDir("unknown")).toBe("ltr")
  })
})

describe("createTranslator", () => {
  it("translates keys", () => {
    const t = createTranslator({ "hello": "Hello" })
    expect(t("hello")).toBe("Hello")
  })

  it("interpolates values", () => {
    const t = createTranslator({ "welcome": "Welcome {name}" })
    expect(t("welcome", { name: "Alice" })).toBe("Welcome Alice")
  })

  it("returns key when translation missing", () => {
    const t = createTranslator({})
    expect(t("missing.key")).toBe("missing.key")
  })
})
