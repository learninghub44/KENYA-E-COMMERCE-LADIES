import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "../components/shared/providers";
import { JsonLd } from "../components/shared/json-ld";
import { organizationJsonLd, websiteJsonLd } from "../lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Zuri Market | Kenya's Marketplace for Women",
    template: "%s | Zuri Market",
  },
  description:
    "Zuri Market is Kenya's multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products from verified sellers.",
  keywords: [
    "fashion",
    "beauty",
    "skincare",
    "wellness",
    "accessories",
    "Kenya",
    "marketplace",
    "women fashion",
    "Zuri Market",
  ],
<<<<<<< HEAD
  authors: [{ name: "Kenya E-Commerce Ladies" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
=======
  authors: [{ name: "Zuri Market" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://zurimarket.dev"
  ),
>>>>>>> c6c67738eb28cd2ac7754f4cda6db89a8044443b
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "Zuri Market",
    title: "Zuri Market",
    description:
      "Zuri Market is Kenya's multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products from verified sellers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zuri Market",
    description:
      "Zuri Market is Kenya's multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products from verified sellers.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#2D0A42" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
