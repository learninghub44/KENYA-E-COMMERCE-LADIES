import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kenya-ecommerce-ladies.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "/", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/search", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/cart", changeFrequency: "never" as const, priority: 0.3 },
    { path: "/checkout", changeFrequency: "never" as const, priority: 0.3 },
    { path: "/wishlist", changeFrequency: "never" as const, priority: 0.3 },
    { path: "/orders", changeFrequency: "never" as const, priority: 0.3 },
    { path: "/messages", changeFrequency: "never" as const, priority: 0.3 },
    { path: "/notifications", changeFrequency: "never" as const, priority: 0.3 },
    { path: "/auth/login", changeFrequency: "never" as const, priority: 0.2 },
    { path: "/auth/register", changeFrequency: "never" as const, priority: 0.2 },
    { path: "/auth/forgot-password", changeFrequency: "never" as const, priority: 0.1 },
  ]

  const categoryRoutes = [
    "/categories/fashion",
    "/categories/beauty",
    "/categories/accessories",
    "/categories/skincare",
    "/categories/wellness",
  ].map((path) => ({
    path,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes].map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
