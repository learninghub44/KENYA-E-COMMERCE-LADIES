import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/seller/", "/auth/", "/api/internal/", "/offline"],
      },
    ],
    sitemap: "https://kenya-ecommerce-ladies.com/sitemap.xml",
  }
}
