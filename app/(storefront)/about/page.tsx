import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Zuri Market — Our Story",
  description:
    "Learn how Zuri Market is connecting buyers and empowering sellers across Kenya through a trusted multi-vendor marketplace.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          About Zuri Market
        </h1>
        <p className="mt-3 text-lg font-medium text-[#1C5C56]">
          Connecting Buyers. Empowering Sellers.
        </p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            Zuri Market is a modern online marketplace built to make buying and selling simpler, safer, and more accessible across Kenya.
          </p>
          <p className="mt-3">
            Our platform brings together independent businesses, entrepreneurs, retailers, wholesalers, and growing brands in one trusted marketplace where they can showcase their products and connect with customers from anywhere in the country.
          </p>
          <p className="mt-3">
            Whether you&apos;re looking for everyday essentials, electronics, fashion, beauty products, home goods, office supplies, or unique locally made products, Zuri Market provides a convenient place to discover products from a wide range of trusted sellers.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* Who We Are */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Who We Are</h2>
          <p>
            Zuri Market is a technology company focused on building digital commerce solutions that help businesses grow.
          </p>
          <p className="mt-3">
            Rather than operating as a traditional retailer, we provide the infrastructure that allows independent vendors to create their own online storefronts, manage products, communicate with customers, and grow their businesses.
          </p>
          <p className="mt-3">
            Our role is to build, maintain, secure, and continuously improve the marketplace so buyers and sellers can connect with confidence.
          </p>
          <p className="mt-3">
            We believe technology should create opportunities, reduce barriers, and make commerce accessible to everyone.
          </p>
        </section>

        {/* What We Do */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">What We Do</h2>
          <p>Our marketplace provides a platform where vendors can:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Create professional online stores.</li>
            <li>List and manage products.</li>
            <li>Reach customers across Kenya.</li>
            <li>Receive inquiries from buyers.</li>
            <li>Build their brand.</li>
            <li>Manage inventory.</li>
            <li>Grow their business online.</li>
          </ul>
          <p className="mt-4">For buyers, Zuri Market offers:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Thousands of products in one place.</li>
            <li>Easy product discovery.</li>
            <li>Powerful search and filtering.</li>
            <li>Multiple independent sellers.</li>
            <li>Secure user accounts.</li>
            <li>Favourite products and wishlists.</li>
            <li>Vendor ratings and reviews.</li>
            <li>Responsive browsing on desktop and mobile devices.</li>
          </ul>
        </section>

        {/* Our Role */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Role</h2>
          <p>Zuri Market operates as a marketplace platform. We provide the technology, tools, and infrastructure that enable buyers and sellers to connect.</p>
          <p className="mt-3">We are responsible for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Maintaining the marketplace.</li>
            <li>Improving platform performance.</li>
            <li>Protecting user accounts.</li>
            <li>Enforcing marketplace policies.</li>
            <li>Supporting users.</li>
            <li>Monitoring marketplace activity.</li>
            <li>Promoting a safe trading environment.</li>
          </ul>
          <p className="mt-4">Individual sellers remain responsible for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Product listings.</li>
            <li>Pricing.</li>
            <li>Product quality.</li>
            <li>Product availability.</li>
            <li>Shipping and delivery.</li>
            <li>Customer support.</li>
            <li>Returns and refunds.</li>
            <li>Payment arrangements.</li>
          </ul>
          <p className="mt-3">
            This structure allows businesses of all sizes to reach customers while maintaining control over their own operations.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Mission</h2>
          <p>
            Our mission is to empower businesses by providing a reliable digital marketplace that helps them reach more customers while giving shoppers access to quality products from trusted independent sellers. We aim to simplify online commerce through technology, transparency, and continuous innovation.
          </p>
        </section>

        {/* Vision */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Vision</h2>
          <p>
            Our vision is to become one of Kenya&apos;s most trusted and innovative online marketplaces. We aspire to build a thriving digital ecosystem where entrepreneurs, small businesses, established retailers, and consumers can grow together through technology.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Values</h2>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Trust</h3>
              <p>We believe successful marketplaces are built on trust. We encourage honesty, transparency, and accountability from every member of our community.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Innovation</h3>
              <p>Technology evolves quickly, and so do we. We continuously improve our platform to better serve buyers and sellers.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Customer Focus</h3>
              <p>Every decision we make is guided by the needs of our users. We strive to provide an enjoyable, reliable, and user-friendly experience.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Integrity</h3>
              <p>We are committed to operating our marketplace fairly and professionally while enforcing standards that protect our community.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-800">Growth</h3>
              <p>We believe every entrepreneur deserves an opportunity to succeed. Our platform is designed to help businesses of all sizes expand their reach and grow sustainably.</p>
            </div>
          </div>
        </section>

        {/* Supporting Kenyan Businesses */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Supporting Kenyan Businesses</h2>
          <p>
            Kenya is home to thousands of talented entrepreneurs and growing businesses. Many sellers have excellent products but limited access to affordable digital commerce tools.
          </p>
          <p className="mt-3">
            Zuri Market exists to bridge that gap by giving businesses access to a professional marketplace without the complexity of building and maintaining their own e-commerce platforms.
          </p>
          <p className="mt-3">
            As our marketplace grows, so does the opportunity for local businesses to reach more customers, build stronger brands, and compete in the digital economy.
          </p>
        </section>

        {/* Building a Better Marketplace */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Building a Better Marketplace</h2>
          <p>Our work does not end once the platform is launched. We continue investing in:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Better marketplace features.</li>
            <li>Improved search and discovery.</li>
            <li>Enhanced account security.</li>
            <li>Faster platform performance.</li>
            <li>Improved vendor tools.</li>
            <li>Better customer experiences.</li>
            <li>Marketplace transparency.</li>
            <li>Long-term platform reliability.</li>
          </ul>
          <p className="mt-3">
            Listening to feedback from buyers and sellers remains central to how we improve our services.
          </p>
        </section>

        {/* Our Commitment */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Commitment</h2>
          <p>
            We are committed to maintaining a marketplace that is secure, transparent, and accessible. By providing reliable technology and encouraging responsible marketplace practices, we aim to create an environment where businesses can thrive and customers can shop with confidence.
          </p>
          <p className="mt-3">
            Every new seller, customer, and partner contributes to the continued growth of Zuri Market, and we are grateful to be part of that journey.
          </p>
        </section>

        {/* Founder */}
        <section className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#1C5C56]">Founder</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Chris Odhiambo</h2>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>We welcome your questions, suggestions, and feedback.</p>
          <div className="mt-3">
            <p className="font-medium text-gray-800">Zuri Market</p>
            <p className="mt-1">
              Email:{" "}
              <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
                hello@zurimarket.co.ke
              </a>
            </p>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Thank you for choosing Zuri Market. We look forward to helping buyers and sellers connect, grow, and succeed together.
          </p>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Join the Journey</h2>
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
        </section>
      </div>
    </div>
  )
}
