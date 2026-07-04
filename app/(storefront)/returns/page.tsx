import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Returns & Refund Policy — Zuri Market",
  description:
    "How returns, exchanges, and refunds are handled on the Zuri Market multi-vendor marketplace.",
}

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Returns & Refund Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500">Last Updated: July 4, 2026</p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Introduction */}
        <section>
          <p>
            Thank you for shopping on <strong className="text-gray-800">Zuri Market</strong>.
          </p>
          <p className="mt-3">
            This Returns & Refund Policy explains how returns, exchanges, and refunds are handled on our marketplace.
          </p>
          <p className="mt-3">
            Zuri Market is a multi-vendor marketplace that connects buyers with independent sellers. We provide, maintain, and regulate the marketplace platform, but we do not own, manufacture, inspect, warehouse, or sell the products listed by vendors.
          </p>
          <p className="mt-3">
            Because products are sold by independent sellers, return and refund requests are handled by the respective vendor in accordance with their policies and applicable laws.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* Our Role */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Our Role</h2>
          <p>Zuri Market&apos;s role is to provide the technology that enables buyers and sellers to connect. We do not:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Own listed products.</li>
            <li>Process payments.</li>
            <li>Hold customer funds.</li>
            <li>Authorize refunds.</li>
            <li>Collect returned products.</li>
            <li>Replace products on behalf of sellers.</li>
          </ul>
          <p className="mt-3">Where appropriate, we may assist by facilitating communication between buyers and sellers or reviewing reports of repeated policy violations by vendors.</p>
        </section>

        {/* Vendor Return Policies */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Vendor Return Policies</h2>
          <p>
            Each vendor on Zuri Market may establish their own return and refund policy, provided it complies with applicable laws and marketplace standards. Before placing an order, buyers are encouraged to review the seller&apos;s return policy and ask questions if anything is unclear.
          </p>
        </section>

        {/* Eligible Reasons for a Return */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Eligible Reasons for a Return</h2>
          <p>Depending on the vendor&apos;s policy, a return may be accepted if:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>The wrong product was delivered.</li>
            <li>The product arrived damaged.</li>
            <li>The product is defective upon arrival.</li>
            <li>The product differs significantly from its description.</li>
            <li>Required parts or accessories are missing.</li>
            <li>The seller agrees to accept the return for another valid reason.</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">Acceptance of a return remains at the discretion of the seller unless otherwise required by law.</p>
        </section>

        {/* Non-Returnable Items */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Non-Returnable Items</h2>
          <p>Certain products may not be eligible for return, including but not limited to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Perishable goods.</li>
            <li>Personalized or custom-made products.</li>
            <li>Digital products or downloadable content.</li>
            <li>Opened health or personal care items where hygiene may be compromised.</li>
            <li>Products clearly marked as non-returnable.</li>
          </ul>
          <p className="mt-3">Individual sellers may specify additional exclusions in their return policies.</p>
        </section>

        {/* Return Requests */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Return Requests</h2>
          <p>
            If you wish to return an item, you should contact the seller as soon as reasonably possible after receiving your order. When submitting a return request, you should provide:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Your order reference.</li>
            <li>Product name.</li>
            <li>Reason for the return.</li>
            <li>Photos of the item where applicable.</li>
            <li>Any supporting information that may help the seller assess the request.</li>
          </ul>
          <p className="mt-3">Providing complete information helps speed up the review process.</p>
        </section>

        {/* Refunds */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Refunds</h2>
          <p>
            Refunds, where approved, are issued directly by the seller using the payment method agreed upon between the buyer and seller. Since Zuri Market does not process or receive payments, we cannot issue refunds on behalf of vendors.
          </p>
          <p className="mt-3">The timing of any refund depends on the agreement between the buyer and the seller.</p>
        </section>

        {/* Exchanges */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Exchanges</h2>
          <p>Some sellers may offer product exchanges instead of refunds. Exchange availability depends on:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Product availability.</li>
            <li>Seller policy.</li>
            <li>Condition of the returned item.</li>
            <li>Nature of the issue reported.</li>
          </ul>
          <p className="mt-3">Customers should discuss exchange options directly with the seller.</p>
        </section>

        {/* Return Shipping */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Return Shipping</h2>
          <p>Responsibility for return shipping costs may vary depending on:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>The seller&apos;s policy.</li>
            <li>The reason for the return.</li>
            <li>Any agreement reached between the buyer and seller.</li>
          </ul>
          <p className="mt-3">Where a seller accepts responsibility for an error, they may choose to cover the return shipping costs.</p>
        </section>

        {/* Disputes */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Disputes</h2>
          <p>
            If a buyer and seller cannot reach an agreement regarding a return or refund, either party may contact Zuri Market for assistance. While we may review the matter, request additional information, or facilitate communication, Zuri Market does not act as a judge, arbitrator, or payment intermediary.
          </p>
          <p className="mt-3">We reserve the right to investigate repeated complaints against vendors and may take appropriate action where marketplace policies have been violated.</p>
        </section>

        {/* Buyer Responsibilities */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Buyer Responsibilities</h2>
          <p>Buyers are encouraged to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Read product descriptions carefully.</li>
            <li>Review vendor return policies before purchasing.</li>
            <li>Inspect products promptly upon delivery.</li>
            <li>Report issues as soon as possible.</li>
            <li>Communicate respectfully with sellers.</li>
          </ul>
        </section>

        {/* Seller Responsibilities */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Seller Responsibilities</h2>
          <p>Vendors are expected to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Clearly communicate their return policy.</li>
            <li>Respond to customer inquiries promptly.</li>
            <li>Handle return requests fairly and professionally.</li>
            <li>Comply with applicable consumer protection laws.</li>
            <li>Honour approved refunds or exchanges within a reasonable time.</li>
          </ul>
          <p className="mt-3">Failure to meet these expectations may result in warnings, account restrictions, suspension, or removal from the marketplace.</p>
        </section>

        {/* Marketplace Standards */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Marketplace Standards</h2>
          <p>To maintain trust within our marketplace, Zuri Market expects all sellers to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>List products accurately.</li>
            <li>Use genuine product images where possible.</li>
            <li>Clearly describe product conditions.</li>
            <li>Respond honestly to customer concerns.</li>
            <li>Resolve legitimate complaints in good faith.</li>
          </ul>
          <p className="mt-3">Repeated failure to meet these standards may affect a seller&apos;s ability to continue using the platform.</p>
        </section>

        {/* Policy Updates */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Policy Updates</h2>
          <p>
            We may revise this Returns & Refund Policy from time to time to reflect changes in our marketplace operations, legal requirements, or business practices. The latest version will always be available on this page with the updated effective date.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>If you have questions regarding this Returns & Refund Policy or require assistance contacting a seller, please contact us.</p>
          <div className="mt-3">
            <p className="font-medium text-gray-800">Zuri Market</p>
            <p className="mt-1">Email: <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">hello@zurimarket.co.ke</a></p>
            <p>Founder: <span className="font-medium text-gray-800">Chris Odhiambo</span></p>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            We appreciate your trust in Zuri Market and remain committed to maintaining a fair, transparent, and reliable marketplace for buyers and sellers across Kenya.
          </p>
        </section>
      </div>
    </div>
  )
}
