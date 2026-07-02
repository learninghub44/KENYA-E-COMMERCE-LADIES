import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "../components/shared/providers";

export const metadata: Metadata = {
  title: {
    default: "Kenya E-Commerce Ladies | Premium Fashion & Beauty Marketplace",
    template: "%s | Kenya E-Commerce Ladies",
  },
  description:
    "Africa's premier multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products.",
  keywords: [
    "fashion",
    "beauty",
    "skincare",
    "wellness",
    "accessories",
    "Kenya",
    "marketplace",
    "women fashion",
  ],
  authors: [{ name: "Kenya E-Commerce Ladies" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://kenya-ecommerce-ladies.com"),
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "Kenya E-Commerce Ladies",
    title: "Kenya E-Commerce Ladies",
    description:
      "Africa's premier multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenya E-Commerce Ladies",
    description:
      "Africa's premier multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products.",
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
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
