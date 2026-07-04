import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Our Story — Kenya E-Commerce",
  description:
    "Learn how Kenya E-Commerce was founded to empower Kenyan businesses and create a centralized marketplace for buyers and sellers.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Our Story
        </h1>
      </div>

      <div className="space-y-6 text-gray-600 leading-relaxed">
        <p className="text-lg font-medium text-gray-800">
          Every successful business begins with a problem worth solving.
        </p>

        <p>
          ZURI E-Commerce was founded after recognizing that many Kenyan businesses depended heavily on social media platforms and messaging applications to sell their products. While these channels helped businesses reach customers, they often lacked proper product management, secure ordering systems, inventory tracking, professional storefronts, and centralized customer support.
        </p>

        <p>
          At the same time, shoppers were forced to browse multiple pages, send countless messages, and wait for responses before completing a purchase. The experience was often time-consuming and inconsistent.
        </p>

        <p>
          To solve these challenges, Kenya E-Commerce was created as a centralized marketplace where multiple independent vendors could operate their own online stores while customers enjoy a simple, secure, and organized shopping experience.
        </p>

        <p>
          From the beginning, the vision has been larger than simply building another online store. Our goal has always been to create an ecosystem that empowers entrepreneurs, supports small and medium-sized businesses, encourages digital transformation, and contributes to Kenya&apos;s growing digital economy.
        </p>

        <p>
          Every feature added to the platform—from vendor dashboards and inventory management to order tracking and customer communication—is built with the needs of real businesses in mind.
        </p>

        <p>
          The journey has not been without challenges. Building a reliable marketplace requires continuous learning, constant improvements, and listening carefully to both vendors and customers. These experiences continue to shape the platform into something stronger every day.
        </p>

        <p>
          Looking ahead, Kenya E-Commerce aims to expand its services, introduce more innovative tools, improve logistics partnerships, strengthen payment solutions, and help even more businesses succeed online.
        </p>

        <p>
          Our story is still being written, and every customer, vendor, and partner who joins the platform becomes part of that journey.
        </p>
      </div>

      {/* Founder */}
      <div className="mt-16 rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#1C5C56]">Founder</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">Chris Odhiambo</h2>
      </div>

      {/* CTA */}
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Join the journey</h2>
        <p className="text-gray-500">
          Whether you&apos;re shopping or selling, you&apos;re part of our story.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/search"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#1C5C56] px-6 text-sm font-medium text-white shadow transition-colors hover:bg-[#1C5C56]/90"
          >
            Start Shopping
          </Link>
          <Link
            href="/become-a-seller"
            className="inline-flex h-11 items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Sell on the Platform
          </Link>
        </div>
      </div>
    </div>
  )
}
