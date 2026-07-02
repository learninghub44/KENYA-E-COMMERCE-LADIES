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
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== "" ? process.env.NEXT_PUBLIC_APP_URL : "https://zurimarket.dev"}/sitemap.xml`,
  }
}
