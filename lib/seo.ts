import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kenya-ecommerce-ladies.com"
const siteName = "Kenya E-Commerce Ladies"
const siteDescription = "Africa's premier multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products."

interface SeoOptions {
  title: string
  description: string
  path: string
  ogImage?: string
  noindex?: boolean
  canonical?: string
}

function generateMetadata({ title, description, path, ogImage, noindex, canonical }: SeoOptions): Metadata {
  const url = `${siteUrl}${path}`
  const images = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
    : [{ url: `${siteUrl}/og-default.png`, width: 1200, height: 630, alt: siteName }]

  return {
    title,
    description,
    alternates: { canonical: canonical ?? url },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "en_KE",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}

function productJsonLd(product: {
  name: string
  description: string
  image: string
  sku: string
  price: number
  currency?: string
  availability?: string
  url: string
  brand?: string
  ratingValue?: number
  reviewCount?: number
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency ?? "KES",
      availability: product.availability ?? "https://schema.org/InStock",
      url: product.url,
    },
    ...(product.ratingValue && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratingValue,
        reviewCount: product.reviewCount ?? 0,
      },
    }),
  }
}

function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+254-XXX-XXXX",
      contactType: "customer service",
    },
    sameAs: [
      "https://facebook.com/kenyaecoladies",
      "https://instagram.com/kenyaecoladies",
      "https://twitter.com/kenyaecoladies",
    ],
  }
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export { generateMetadata, productJsonLd, breadcrumbJsonLd, organizationJsonLd, websiteJsonLd, siteUrl, siteName, siteDescription }
