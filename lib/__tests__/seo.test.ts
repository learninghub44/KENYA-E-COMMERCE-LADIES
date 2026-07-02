import { describe, it, expect } from "vitest"
import { generateMetadata, productJsonLd, breadcrumbJsonLd, organizationJsonLd, websiteJsonLd } from "../seo"

describe("generateMetadata", () => {
  it("returns metadata with title and description", () => {
    const meta = generateMetadata({
      title: "Test Page",
      description: "A test page",
      path: "/test",
    })
    expect(meta.title).toBe("Test Page")
    expect(meta.description).toBe("A test page")
  })

  it("sets noindex when specified", () => {
    const meta = generateMetadata({
      title: "Admin",
      description: "Admin page",
      path: "/admin",
      noindex: true,
    })
    expect(meta.robots).toEqual({ index: false, follow: false })
  })

  it("sets canonical URL", () => {
    const meta = generateMetadata({
      title: "Page",
      description: "Desc",
      path: "/page",
      canonical: "https://example.com/canonical",
    })
    expect(meta.alternates?.canonical).toBe("https://example.com/canonical")
  })
})

describe("productJsonLd", () => {
  it("generates Product schema", () => {
    const data = productJsonLd({
      name: "Test Product",
      description: "A test",
      image: "/test.jpg",
      sku: "TST-001",
      price: 2500,
      currency: "KES",
      url: "https://example.com/p/1",
    })
    expect(data["@type"]).toBe("Product")
    expect(data.name).toBe("Test Product")
    expect(data.offers.price).toBe(2500)
    expect(data.offers.priceCurrency).toBe("KES")
  })
})

describe("breadcrumbJsonLd", () => {
  it("generates BreadcrumbList schema", () => {
    const items = [
      { name: "Home", url: "/" },
      { name: "Category", url: "/categories/fashion" },
    ]
    const data = breadcrumbJsonLd(items)
    expect(data["@type"]).toBe("BreadcrumbList")
    expect(data.itemListElement).toHaveLength(2)
    expect(data.itemListElement[0].position).toBe(1)
  })
})

describe("organizationJsonLd", () => {
  it("generates Organization schema", () => {
    const data = organizationJsonLd()
    expect(data["@type"]).toBe("Organization")
    expect(data.name).toBeTruthy()
  })
})

describe("websiteJsonLd", () => {
  it("generates WebSite schema with search action", () => {
    const data = websiteJsonLd()
    expect(data["@type"]).toBe("WebSite")
    expect(data.potentialAction["@type"]).toBe("SearchAction")
  })
})
