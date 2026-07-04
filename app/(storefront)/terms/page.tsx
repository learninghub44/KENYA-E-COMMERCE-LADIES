import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms and Conditions — Zuri Market",
  description:
    "Terms and conditions governing the use of Zuri Market, an online multi-vendor marketplace connecting buyers with independent sellers across Kenya.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Terms and Conditions
        </h1>
        <p className="mt-3 text-sm text-gray-500">Effective Date: July 4, 2026</p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Introduction */}
        <section>
          <p>
            Welcome to <strong className="text-gray-800">Zuri Market</strong> (&ldquo;Zuri Market,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Zuri Market website, mobile applications, and all related services.
          </p>
          <p className="mt-3">
            By creating an account, browsing the marketplace, listing products, or using any part of our platform, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use our services.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* 1. About */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">1. About Zuri Market</h2>
          <p>
            Zuri Market is an online multi-vendor marketplace that connects buyers with independent sellers. Our role is to provide, maintain, regulate, and improve the technology platform that enables vendors to advertise products and allows buyers to discover and communicate with vendors.
          </p>
          <p className="mt-3 font-medium text-gray-800">Zuri Market is not the seller of products listed on the marketplace.</p>
          <p className="mt-2 font-medium text-gray-800">Zuri Market does not receive, process, hold, or facilitate payments between buyers and sellers.</p>
          <p className="mt-3">All purchase agreements are entered into directly between buyers and the respective vendors.</p>
        </section>

        {/* 2. Eligibility */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">2. Eligibility</h2>
          <p>To use Zuri Market, you must:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Be at least 18 years old or have permission from a parent or legal guardian.</li>
            <li>Provide accurate and complete registration information.</li>
            <li>Use the platform in compliance with Kenyan law.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
          </ul>
          <p className="mt-3">You are responsible for all activities carried out through your account.</p>
        </section>

        {/* 3. User Accounts */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">3. User Accounts</h2>
          <p>Users agree to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Keep account information accurate.</li>
            <li>Update details whenever necessary.</li>
            <li>Protect login credentials.</li>
            <li>Notify us immediately if unauthorized access occurs.</li>
          </ul>
          <p className="mt-3">Zuri Market may suspend or terminate accounts that violate these Terms or threaten the security of the marketplace.</p>
        </section>

        {/* 4. Marketplace Services */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">4. Marketplace Services</h2>
          <p>Zuri Market provides:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Product listings</li>
            <li>Vendor storefronts</li>
            <li>Product search</li>
            <li>Customer accounts</li>
            <li>Vendor management tools</li>
            <li>Communication features</li>
            <li>Reviews and ratings</li>
            <li>Marketplace administration</li>
            <li>Platform maintenance</li>
            <li>Security monitoring</li>
          </ul>
          <p className="mt-3">Our responsibility is limited to operating and maintaining the marketplace.</p>
        </section>

        {/* 5. Vendor Responsibilities */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">5. Vendor Responsibilities</h2>
          <p>Every vendor is solely responsible for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Product ownership.</li>
            <li>Product quality.</li>
            <li>Product authenticity.</li>
            <li>Product descriptions.</li>
            <li>Product images.</li>
            <li>Pricing.</li>
            <li>Inventory accuracy.</li>
            <li>Customer communication.</li>
            <li>Delivery arrangements.</li>
            <li>Returns.</li>
            <li>Refunds.</li>
            <li>Warranties.</li>
            <li>Compliance with applicable laws.</li>
          </ul>
          <p className="mt-3">Vendors agree not to list prohibited, illegal, counterfeit, dangerous, or misleading products. Repeated violations may result in account suspension or permanent removal.</p>
        </section>

        {/* 6. Buyer Responsibilities */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">6. Buyer Responsibilities</h2>
          <p>Buyers are responsible for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Reviewing product descriptions carefully.</li>
            <li>Communicating with vendors when clarification is needed.</li>
            <li>Confirming product availability.</li>
            <li>Agreeing on payment methods directly with vendors.</li>
            <li>Inspecting products where possible before completing purchases.</li>
            <li>Following vendor return policies.</li>
          </ul>
          <p className="mt-3">Buyers should exercise reasonable caution before making payments.</p>
        </section>

        {/* 7. Payments */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">7. Payments</h2>
          <p className="font-medium text-gray-800">Zuri Market does not process payments.</p>
          <p className="mt-3">Payments are arranged entirely between buyers and vendors. We do not:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Hold customer funds.</li>
            <li>Process card payments.</li>
            <li>Process mobile money payments.</li>
            <li>Store payment credentials.</li>
            <li>Act as an escrow service.</li>
            <li>Guarantee payment completion.</li>
          </ul>
          <p className="mt-3">Any payment dispute must be resolved directly between the buyer and the seller.</p>
        </section>

        {/* 8. Orders */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">8. Orders</h2>
          <p>Orders placed through the marketplace are requests to purchase products from independent vendors. Acceptance of an order is determined solely by the respective vendor.</p>
          <p className="mt-3">A vendor may decline or cancel an order because of:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Product unavailability</li>
            <li>Pricing errors</li>
            <li>Suspected fraud</li>
            <li>Duplicate orders</li>
            <li>Incorrect information</li>
            <li>Other reasonable business circumstances</li>
          </ul>
        </section>

        {/* 9. Shipping */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">9. Shipping and Delivery</h2>
          <p>Shipping arrangements are determined by individual vendors unless otherwise stated. Delivery times displayed on the platform are estimates only.</p>
          <p className="mt-3">Zuri Market is not responsible for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Courier delays</li>
            <li>Lost packages</li>
            <li>Damaged shipments</li>
            <li>Delivery failures</li>
            <li>Incorrect delivery addresses provided by customers</li>
          </ul>
        </section>

        {/* 10. Returns */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">10. Returns and Refunds</h2>
          <p>Each vendor determines their own return and refund policy, subject to applicable laws. Customers should review the vendor&apos;s policy before purchasing.</p>
          <p className="mt-3">Zuri Market may assist with communication between parties but does not guarantee refunds or compensation.</p>
        </section>

        {/* 11. Reviews */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">11. Reviews and Ratings</h2>
          <p>Customers may submit honest reviews based on genuine purchasing experiences. Reviews must not:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Contain abusive language.</li>
            <li>Be defamatory.</li>
            <li>Include false claims.</li>
            <li>Promote competitors.</li>
            <li>Contain spam.</li>
          </ul>
          <p className="mt-3">Zuri Market reserves the right to remove reviews that violate these standards.</p>
        </section>

        {/* 12. Prohibited Activities */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">12. Prohibited Activities</h2>
          <p>Users must not:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Commit fraud.</li>
            <li>Impersonate another person.</li>
            <li>Upload malicious software.</li>
            <li>Attempt unauthorized access.</li>
            <li>Interfere with platform operations.</li>
            <li>Post illegal products.</li>
            <li>Infringe intellectual property rights.</li>
            <li>Manipulate ratings or reviews.</li>
            <li>Use automated tools without permission.</li>
            <li>Harass other users.</li>
          </ul>
          <p className="mt-3">Violation may result in immediate suspension.</p>
        </section>

        {/* 13. Intellectual Property */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">13. Intellectual Property</h2>
          <p>All software, logos, branding, graphics, website design, and original content belong to Zuri Market unless otherwise indicated. Users may not copy, reproduce, distribute, modify, or commercially exploit any part of the platform without written permission.</p>
          <p className="mt-3">Vendor-owned trademarks and product images remain the property of their respective owners.</p>
        </section>

        {/* 14. Availability */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">14. Marketplace Availability</h2>
          <p>We strive to provide reliable service but cannot guarantee uninterrupted availability. The platform may occasionally experience:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Scheduled maintenance</li>
            <li>Software updates</li>
            <li>Security upgrades</li>
            <li>Technical interruptions</li>
            <li>Third-party service outages</li>
          </ul>
          <p className="mt-3">We reserve the right to modify or discontinue features without prior notice.</p>
        </section>

        {/* 15. Limitation of Liability */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">15. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, Zuri Market acts solely as a technology platform connecting buyers and independent vendors. We do not:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Manufacture products.</li>
            <li>Own listed inventory.</li>
            <li>Inspect every product.</li>
            <li>Guarantee product quality.</li>
            <li>Participate in negotiations.</li>
            <li>Handle payments.</li>
            <li>Arrange every delivery.</li>
          </ul>
          <p className="mt-3">Accordingly, Zuri Market shall not be liable for disputes relating to product quality, product safety, product authenticity, vendor conduct, payment disagreements, delivery issues, warranty claims, return disputes, or financial losses arising from transactions between buyers and sellers.</p>
          <p className="mt-3">Our liability, where applicable, shall be limited to the maximum extent permitted under Kenyan law.</p>
        </section>

        {/* 16. Indemnification */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">16. Indemnification</h2>
          <p>You agree to indemnify and hold harmless Zuri Market, its owner, employees, contractors, and partners from any claims, damages, liabilities, costs, or expenses arising from:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Your use of the platform.</li>
            <li>Your violation of these Terms.</li>
            <li>Your violation of applicable laws.</li>
            <li>Disputes with other users.</li>
          </ul>
        </section>

        {/* 17. Suspension */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">17. Account Suspension and Termination</h2>
          <p>We reserve the right to suspend, restrict, or permanently terminate accounts that:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Violate these Terms.</li>
            <li>Engage in fraudulent activity.</li>
            <li>Abuse other users.</li>
            <li>Threaten platform security.</li>
            <li>Sell prohibited products.</li>
            <li>Damage the reputation of the marketplace.</li>
          </ul>
          <p className="mt-3">Termination may occur without prior notice where necessary to protect the platform or its users.</p>
        </section>

        {/* 18. Changes */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">18. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. Updated versions will be published on this page together with the effective date. Continued use of the marketplace after changes take effect constitutes acceptance of the revised Terms.</p>
        </section>

        {/* 19. Governing Law */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">19. Governing Law</h2>
          <p>These Terms shall be governed by and interpreted in accordance with the laws of the Republic of Kenya. Any disputes arising from these Terms shall be subject to the jurisdiction of the competent courts of Kenya.</p>
        </section>

        {/* 20. Contact */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">20. Contact Us</h2>
          <p>If you have any questions regarding these Terms and Conditions, please contact us.</p>
          <div className="mt-3">
            <p className="font-medium text-gray-800">Zuri Market</p>
            <p className="mt-1">Email: <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">hello@zurimarket.co.ke</a></p>
            <p>Founder: <span className="font-medium text-gray-800">Chris Odhiambo</span></p>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            We appreciate your trust in Zuri Market and are committed to maintaining a secure, reliable, and transparent marketplace for buyers and sellers across Kenya.
          </p>
        </section>
      </div>
    </div>
  )
}
