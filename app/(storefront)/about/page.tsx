import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Our Story — Zuri Market",
  description:
    "Learn how Zuri Market was founded to make buying and selling online easier, more accessible, and more rewarding for everyone across Kenya.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Our Story
        </h1>
        <p className="mt-3 text-lg font-medium text-[#1C5C56]">
          Every Great Marketplace Begins with a Simple Idea
        </p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            Zuri Market was founded with a simple belief: buying and selling online should be easier, more accessible, and more rewarding for everyone.
          </p>
          <p className="mt-3">
            Across Kenya, thousands of businesses offer quality products every day. Many of these businesses are small and medium-sized enterprises, family-owned shops, local retailers, and entrepreneurs with incredible products but limited access to modern e-commerce tools. While social media and messaging apps have opened new opportunities, they often lack the structure needed to efficiently manage products, orders, customer communication, and business growth.
          </p>
          <p className="mt-3">
            We saw an opportunity to create something better.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* The Beginning */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">The Beginning</h2>
          <p>
            The idea for Zuri Market was born from observing the challenges faced by both buyers and sellers in Kenya&apos;s growing digital economy.
          </p>
          <p className="mt-3">
            Many businesses wanted to sell online but struggled with the cost of building their own websites, maintaining online stores, or reaching new customers. At the same time, buyers often had to search across multiple platforms, communicate with different sellers individually, and compare products without a centralized marketplace.
          </p>
          <p className="mt-3">
            Rather than creating another online shop, the vision was to build a platform where many independent businesses could thrive together.
          </p>
          <p className="mt-3">
            That vision became Zuri Market.
          </p>
        </section>

        {/* Why We Built Zuri Market */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Why We Built Zuri Market</h2>
          <p>We believe technology should remove barriers, not create them.</p>
          <p className="mt-3">
            Every entrepreneur deserves access to professional digital tools regardless of the size of their business.
          </p>
          <p className="mt-3">
            Every customer deserves a convenient shopping experience with access to a wide range of products from trusted sellers.
          </p>
          <p className="mt-3">
            Zuri Market was created to bridge that gap by providing a reliable marketplace where businesses can establish their online presence while customers enjoy the convenience of shopping from multiple vendors in one place.
          </p>
        </section>

        {/* Our Purpose */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Purpose</h2>
          <p>Our purpose extends beyond selling products.</p>
          <p className="mt-3">We want to create opportunities.</p>
          <p className="mt-3">
            By giving businesses access to a professional marketplace, we hope to support entrepreneurship, encourage innovation, and contribute to the continued growth of Kenya&apos;s digital economy.
          </p>
          <p className="mt-3">
            Whether someone is launching their first online business or expanding an established brand, we want Zuri Market to be a place where growth is possible.
          </p>
        </section>

        {/* Technology at the Core */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Technology at the Core</h2>
          <p>At Zuri Market, we see ourselves as a technology company first.</p>
          <p className="mt-3">
            Our responsibility is to build and maintain a secure, reliable, and scalable marketplace that enables buyers and sellers to connect efficiently.
          </p>
          <p className="mt-3">
            We continuously improve our platform by introducing new features, strengthening security, improving performance, and simplifying the user experience.
          </p>
          <p className="mt-3">
            As technology evolves, so will Zuri Market.
          </p>
        </section>

        {/* Supporting Independent Sellers */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Supporting Independent Sellers</h2>
          <p>Independent businesses are the foundation of our marketplace.</p>
          <p className="mt-3">
            Every seller brings unique products, knowledge, and expertise that contribute to the diversity of our platform.
          </p>
          <p className="mt-3">
            Rather than competing with these businesses, we provide the tools they need to succeed online.
          </p>
          <p className="mt-3">
            Our marketplace enables vendors to showcase their products, reach more customers, manage their stores, and build lasting relationships with buyers.
          </p>
        </section>

        {/* Putting Customers First */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Putting Customers First</h2>
          <p>Everything we build is designed with our users in mind.</p>
          <p className="mt-3">
            We want shopping on Zuri Market to be simple, transparent, and enjoyable.
          </p>
          <p className="mt-3">
            From product discovery and account management to communication with sellers, we continuously look for ways to improve every part of the customer experience.
          </p>
          <p className="mt-3">
            Listening to feedback from our community helps us shape the future of our platform.
          </p>
        </section>

        {/* Looking Ahead */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Looking Ahead</h2>
          <p>The journey of Zuri Market is only beginning.</p>
          <p className="mt-3">
            As our marketplace grows, we plan to introduce more tools, improve vendor services, enhance customer experiences, strengthen marketplace security, and continue investing in technology that supports businesses across Kenya.
          </p>
          <p className="mt-3">
            We are committed to building a platform that remains reliable, innovative, and responsive to the changing needs of our community.
          </p>
          <p className="mt-3">
            Growth is not measured only by the number of products or vendors on our marketplace but by the success of the businesses and customers who choose to be part of it.
          </p>
        </section>

        {/* Founder Message */}
        <section className="rounded-lg bg-gray-50 p-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">A Message from the Founder</h2>
          <blockquote className="italic text-gray-600 leading-relaxed">
            &ldquo;When I started working on Zuri Market, my goal was never simply to create another online marketplace. I wanted to build a platform that gives businesses the opportunity to grow while making online shopping easier and more accessible for everyone.
          </blockquote>
          <blockquote className="mt-3 italic text-gray-600 leading-relaxed">
            Every improvement we make is guided by the belief that technology should empower people. Whether you&apos;re a customer discovering new products or a seller building your business, thank you for being part of this journey.
          </blockquote>
          <blockquote className="mt-3 italic text-gray-600 leading-relaxed">
            The future of Zuri Market will always be shaped by the people who use it, and I&apos;m excited about what we can build together.&rdquo;
          </blockquote>
          <p className="mt-4 font-medium text-gray-800">&mdash; Chris Odhiambo</p>
          <p className="text-sm text-gray-500">Founder, Zuri Market</p>
        </section>

        {/* Join Our Journey */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Join Our Journey</h2>
          <p>
            Every order placed, every product listed, and every new business that joins our marketplace contributes to the next chapter of our story.
          </p>
          <p className="mt-3">
            We invite buyers, sellers, partners, and innovators to grow with us as we continue building a marketplace that creates opportunities, supports entrepreneurship, and helps shape the future of digital commerce in Kenya.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Thank you for being part of the Zuri Market story.
          </p>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center gap-4 text-center">
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
        </section>
      </div>
    </div>
  )
}
