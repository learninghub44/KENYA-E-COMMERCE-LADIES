import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Us — Kenya E-Commerce",
  description:
    "Kenya E-Commerce is a modern multi-vendor marketplace connecting businesses and shoppers across Kenya. Learn about our mission and vision.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          About Kenya E-Commerce
        </h1>
      </div>

      <div className="space-y-6 text-gray-600 leading-relaxed">
        <p>
          Welcome to Kenya E-Commerce, a modern multi-vendor marketplace designed to connect businesses and shoppers through one reliable digital platform.
        </p>

        <p>
          Our marketplace enables independent sellers, established businesses, wholesalers, retailers, and entrepreneurs to reach customers across Kenya while providing buyers with a convenient place to discover thousands of quality products from multiple vendors.
        </p>

        <p>
          We understand that starting and growing an online business can be challenging. Many businesses struggle with creating websites, managing inventory, processing orders, and reaching new customers. Kenya E-Commerce was created to remove those barriers by providing vendors with powerful tools to manage their stores while allowing customers to shop confidently from trusted sellers.
        </p>

        <p>
          Our platform supports multiple product categories including electronics, fashion, beauty, home appliances, furniture, groceries, office supplies, automotive products, children&apos;s items, health products, agricultural supplies, books, sports equipment, and many more. As our community grows, so does the variety of products available to our customers.
        </p>

        <p>
          We are committed to creating a marketplace built on trust, transparency, security, and convenience. Every feature we introduce is designed to improve the experience for both buyers and sellers. From easy product discovery and secure payments to efficient order management and vendor support, our goal is to simplify online commerce for everyone.
        </p>

        <p>
          Our vision is to become one of Kenya&apos;s leading digital marketplaces by empowering local businesses, supporting entrepreneurship, and making online shopping accessible to more people across the country.
        </p>

        <p>
          As technology continues to evolve, we remain committed to innovation. We continuously improve our platform, introduce new features, strengthen security, and expand services based on customer and vendor feedback.
        </p>

        <p>
          Whether you are shopping for everyday essentials or growing your business through our marketplace, we appreciate your trust and look forward to serving you.
        </p>
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Ready to get started?</h2>
        <p className="text-gray-500">
          Join our growing community of buyers and sellers across Kenya.
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
