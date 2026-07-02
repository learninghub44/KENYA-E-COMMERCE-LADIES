import { describe, it, expect } from "vitest"
import { sanitizeInput, sanitizeUrl, buildCspHeader, sanitizeFileName, isValidFileType, stripHtml } from "../security"

describe("sanitizeInput", () => {
  it("escapes HTML entities", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe("&#x2F;script&gt;alert(&#x27;xss&#x27;)&#x2F;script&gt;")
  })

  it("passes safe strings through", () => {
    expect(sanitizeInput("hello world")).toBe("hello world")
  })
})

describe("sanitizeUrl", () => {
  it("allows https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com/")
  })

  it("allows relative paths", () => {
    expect(sanitizeUrl("/products/123")).toBe("/products/123")
  })

  it("rejects javascript URLs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("")
  })
})

describe("buildCspHeader", () => {
  it("returns a CSP header string", () => {
    const header = buildCspHeader()
    expect(header).toContain("default-src")
    expect(header).toContain("script-src")
    expect(header).toContain("style-src")
  })
})

describe("sanitizeFileName", () => {
  it("removes dangerous characters", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("__etc_passwd")
  })

  it("truncates long filenames", () => {
    const long = "a".repeat(300)
    expect(sanitizeFileName(long).length).toBeLessThanOrEqual(255)
  })
})

describe("isValidFileType", () => {
  it("accepts allowed types", () => {
    expect(isValidFileType("image/jpeg", ["image/jpeg", "image/png"])).toBe(true)
  })

  it("rejects disallowed types", () => {
    expect(isValidFileType("text/html", ["image/jpeg"])).toBe(false)
  })
})

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world")
  })
})
