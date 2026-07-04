import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Press Center — Zuri Market",
  description:
    "Official news, announcements, media resources, and information for journalists, bloggers, and partners.",
}

export default function PressPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Press Center
        </h1>
        <p className="mt-3 text-lg font-medium text-[#1C5C56]">
          Official source for company news and media resources
        </p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Intro */}
        <section>
          <p>Thank you for your interest in Zuri Market.</p>
          <p className="mt-3">
            This Press Center is the official source for company news, announcements, media resources, and information for journalists, bloggers, content creators, business partners, and members of the public.
          </p>
          <p className="mt-3">
            As we continue to grow, we remain committed to transparency, innovation, and supporting Kenya&apos;s digital commerce ecosystem.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* About Zuri Market */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">About Zuri Market</h2>
          <p>
            Zuri Market is a Kenyan multi-vendor online marketplace that connects buyers with independent sellers through a secure and easy-to-use digital platform.
          </p>
          <p className="mt-3">
            Our mission is to make online commerce more accessible by providing businesses of all sizes with the technology they need to reach more customers while giving shoppers access to a wide range of products from trusted vendors.
          </p>
          <p className="mt-3">
            Unlike a traditional retailer, Zuri Market does not own inventory or process payments. We provide, maintain, regulate, and improve the marketplace infrastructure that enables buyers and sellers to connect directly.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Mission</h2>
          <p>
            Our mission is to empower businesses with modern digital commerce tools while delivering a convenient and reliable shopping experience for customers. We believe technology should create opportunities for entrepreneurs, support business growth, and simplify online commerce.
          </p>
        </section>

        {/* Vision */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Vision</h2>
          <p>
            Our vision is to become one of Kenya&apos;s most trusted and innovative online marketplaces by building technology that supports businesses, strengthens digital commerce, and creates lasting value for buyers and sellers.
          </p>
        </section>

        {/* Company Facts */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Company Facts</h2>
          <div className="mt-2 space-y-2">
            <p><strong className="text-gray-800">Company Name:</strong> Zuri Market</p>
            <p><strong className="text-gray-800">Industry:</strong> E-commerce Technology</p>
            <p><strong className="text-gray-800">Business Model:</strong> Multi-Vendor Marketplace</p>
            <p><strong className="text-gray-800">Headquarters:</strong> Kenya</p>
            <p><strong className="text-gray-800">Founder:</strong> Chris Odhiambo</p>
            <p><strong className="text-gray-800">Support Email:</strong> <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">hello@zurimarket.co.ke</a></p>
          </div>
          <p className="mt-4 font-medium text-gray-800">Marketplace Services:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Multi-vendor storefronts</li>
            <li>Product discovery</li>
            <li>Vendor management</li>
            <li>Customer accounts</li>
            <li>Marketplace administration</li>
            <li>Search and filtering</li>
            <li>User reviews and ratings</li>
            <li>Platform security</li>
            <li>Marketplace support</li>
          </ul>
        </section>

        {/* Media Enquiries */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Media Enquiries</h2>
          <p>
            Members of the press who would like to request interviews, company information, official statements, or media resources are welcome to contact us. We aim to respond to media enquiries as promptly as reasonably possible.
          </p>
          <p className="mt-3">
            <strong className="text-gray-800">Email:</strong>{" "}
            <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
              hello@zurimarket.co.ke
            </a>
          </p>
        </section>

        {/* Brand Assets */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Brand Assets</h2>
          <p>
            Official Zuri Market branding, logos, screenshots, and approved marketing materials may be made available upon request.
          </p>
          <p className="mt-3">
            These assets may only be used for accurate editorial coverage, business partnerships, or with prior permission where required.
          </p>
          <p className="mt-3">
            The Zuri Market name, logo, trademarks, and other brand assets remain the intellectual property of Zuri Market.
          </p>
        </section>

        {/* News & Announcements */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">News &amp; Announcements</h2>
          <p>The Press Center is where we publish important company updates, including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Product launches</li>
            <li>New marketplace features</li>
            <li>Seller initiatives</li>
            <li>Platform improvements</li>
            <li>Business milestones</li>
            <li>Community programmes</li>
            <li>Partnership announcements</li>
            <li>Service updates</li>
            <li>Security notices</li>
            <li>Corporate news</li>
          </ul>
          <p className="mt-3">
            We encourage journalists and partners to refer to this page for the latest official information.
          </p>
        </section>

        {/* Partnerships */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Partnerships</h2>
          <p>
            Zuri Market welcomes opportunities to collaborate with businesses, technology providers, educational institutions, logistics companies, developers, community organizations, and other partners who share our commitment to improving digital commerce.
          </p>
          <p className="mt-3">
            Partnership enquiries can be submitted through our official contact email.
          </p>
        </section>

        {/* Community Commitment */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Community Commitment</h2>
          <p>
            We believe successful marketplaces create opportunities beyond buying and selling. By supporting entrepreneurs, encouraging innovation, and providing businesses with access to digital commerce tools, we hope to contribute to the continued growth of Kenya&apos;s digital economy.
          </p>
          <p className="mt-3">
            We are committed to building a marketplace based on trust, transparency, and long-term value for our users.
          </p>
        </section>

        {/* Media Guidelines */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Media Guidelines</h2>
          <p>To ensure accurate representation of our company, we kindly request that:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Information about Zuri Market is obtained from official sources.</li>
            <li>Company statements are not altered in a misleading manner.</li>
            <li>Our trademarks and branding are used appropriately.</li>
            <li>Media enquiries are directed through our official communication channels.</li>
          </ul>
        </section>

        {/* Looking Ahead */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Looking Ahead</h2>
          <p>
            Zuri Market continues to invest in technology, marketplace innovation, platform reliability, and user experience.
          </p>
          <p className="mt-3">
            As our community grows, we remain focused on creating better tools for buyers and sellers while maintaining a marketplace that is secure, transparent, and easy to use.
          </p>
          <p className="mt-3">
            We appreciate the interest shown by journalists, bloggers, industry analysts, partners, and the wider technology community.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact the Press Team</h2>
          <p>For media enquiries, interview requests, partnership opportunities, or official company information, please contact:</p>
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
            Thank you for your interest in Zuri Market. We look forward to sharing our journey as we continue building a trusted marketplace for buyers and sellers across Kenya.
          </p>
        </section>
      </div>
    </div>
  )
}
