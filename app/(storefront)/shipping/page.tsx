import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy — Zuri Market",
  description:
    "How shipping and delivery works on Zuri Market — responsibilities of buyers, sellers, and the platform.",
}

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shipping & Delivery Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500">Last Updated: July 4, 2026</p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Introduction */}
        <section>
          <p>Welcome to Zuri Market.</p>
          <p className="mt-3">
            This Shipping & Delivery Policy explains how shipping and delivery work on our marketplace and outlines the responsibilities of buyers, sellers, and Zuri Market.
          </p>
          <p className="mt-3">
            Zuri Market is an online multi-vendor marketplace that connects buyers with independent sellers. We provide and maintain the platform that enables vendors to list products and customers to discover and purchase them.
          </p>
          <p className="mt-3 font-medium text-gray-800">
            Zuri Market does not own inventory, package products, ship orders, or provide delivery services unless expressly stated for a specific seller or product. Shipping and delivery are the responsibility of the individual vendor.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* How Shipping Works */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">How Shipping Works</h2>
          <p>Each seller on Zuri Market manages the delivery of their own products. Shipping methods, delivery timelines, courier services, and delivery charges may vary from one vendor to another depending on factors such as:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Product type</li>
            <li>Vendor location</li>
            <li>Customer location</li>
            <li>Courier availability</li>
            <li>Delivery preferences</li>
            <li>Size and weight of the order</li>
          </ul>
          <p className="mt-3">Buyers are encouraged to review the shipping information provided on each product page or contact the seller directly before placing an order if additional clarification is needed.</p>
        </section>

        {/* Delivery Areas */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Delivery Areas</h2>
          <p>
            Many vendors deliver across Kenya, while others may serve only specific counties, towns, or regions. Delivery availability is determined solely by the vendor.
          </p>
          <p className="mt-3">
            If your location is outside a seller&apos;s delivery area, the seller may decline the order or suggest an alternative delivery arrangement.
          </p>
        </section>

        {/* Delivery Charges */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Delivery Charges</h2>
          <p>Delivery charges are determined independently by each vendor. Shipping costs may depend on:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Delivery destination</li>
            <li>Package size</li>
            <li>Package weight</li>
            <li>Number of items ordered</li>
            <li>Courier fees</li>
            <li>Special handling requirements</li>
          </ul>
          <p className="mt-3">Any applicable delivery charges should be communicated by the seller before the order is finalized.</p>
        </section>

        {/* Estimated Delivery Times */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Estimated Delivery Times</h2>
          <p>Estimated delivery times vary depending on the seller and delivery destination. Factors that may affect delivery include:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Product availability</li>
            <li>Order processing time</li>
            <li>Courier schedules</li>
            <li>Weather conditions</li>
            <li>Public holidays</li>
            <li>Traffic conditions</li>
            <li>Remote delivery locations</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">Delivery estimates are provided for guidance only and should not be considered guaranteed delivery dates.</p>
        </section>

        {/* Order Processing */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Order Processing</h2>
          <p>After an order is received, the seller is responsible for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Confirming product availability</li>
            <li>Preparing the order</li>
            <li>Packaging the product</li>
            <li>Arranging shipment</li>
            <li>Providing delivery updates where applicable</li>
          </ul>
          <p className="mt-3">Processing times differ between vendors.</p>
        </section>

        {/* Delivery Delays */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Delivery Delays</h2>
          <p>Occasionally, deliveries may be delayed due to circumstances beyond a seller&apos;s control, including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Extreme weather</li>
            <li>Transport disruptions</li>
            <li>Public holidays</li>
            <li>High order volumes</li>
            <li>Courier delays</li>
            <li>Security concerns</li>
            <li>Incorrect delivery information</li>
          </ul>
          <p className="mt-3">Where possible, sellers should communicate any significant delays to affected customers.</p>
        </section>

        {/* Customer Responsibilities */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Customer Responsibilities</h2>
          <p>Buyers are responsible for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Providing accurate delivery information.</li>
            <li>Including a valid phone number.</li>
            <li>Being available to receive deliveries.</li>
            <li>Inspecting products upon delivery where possible.</li>
            <li>Communicating promptly with the seller regarding delivery concerns.</li>
          </ul>
          <p className="mt-3">Incorrect or incomplete delivery details may result in delays or failed deliveries.</p>
        </section>

        {/* Seller Responsibilities */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Seller Responsibilities</h2>
          <p>Each vendor is expected to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Process orders within a reasonable time.</li>
            <li>Package products securely.</li>
            <li>Use reliable delivery methods.</li>
            <li>Communicate shipping updates where appropriate.</li>
            <li>Inform customers of any delays.</li>
            <li>Deliver products that match the listing description.</li>
          </ul>
          <p className="mt-3">Failure to meet these expectations may affect a vendor&apos;s standing on the marketplace.</p>
        </section>

        {/* Tracking Orders */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Tracking Orders</h2>
          <p>
            Some sellers may provide shipment tracking numbers or courier updates, while others may communicate delivery progress directly through phone, email, or messaging. Tracking availability depends on the shipping method selected by the seller.
          </p>
        </section>

        {/* Failed Deliveries */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Failed Deliveries</h2>
          <p>Delivery attempts may fail because of:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Incorrect addresses</li>
            <li>Unreachable customers</li>
            <li>Refused deliveries</li>
            <li>Unsafe delivery locations</li>
            <li>Other unforeseen circumstances</li>
          </ul>
          <p className="mt-3">Where appropriate, buyers and sellers should communicate to arrange a new delivery or alternative collection method.</p>
        </section>

        {/* Damaged or Missing Items */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Damaged or Missing Items</h2>
          <p>
            If a product arrives damaged, incomplete, or differs significantly from its description, buyers should contact the seller as soon as reasonably possible to discuss a suitable resolution.
          </p>
          <p className="mt-3">
            Where necessary, Zuri Market may assist by facilitating communication between the buyer and seller. However, the responsibility for resolving product and delivery issues remains with the respective vendor.
          </p>
        </section>

        {/* International Shipping */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">International Shipping</h2>
          <p>
            International shipping availability varies by seller. Customers interested in international delivery should contact the seller before placing an order to confirm availability, estimated delivery time, shipping costs, customs requirements, and any applicable import duties or taxes.
          </p>
        </section>

        {/* Role of Zuri Market */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Role of Zuri Market</h2>
          <p>Zuri Market provides and maintains the online marketplace that enables buyers and sellers to connect. Unless expressly stated otherwise, Zuri Market does not:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Store products.</li>
            <li>Package orders.</li>
            <li>Arrange shipping.</li>
            <li>Operate courier services.</li>
            <li>Collect delivery fees.</li>
            <li>Guarantee delivery times.</li>
            <li>Take possession of goods.</li>
          </ul>
          <p className="mt-3">While we encourage vendors to provide reliable delivery services, shipping arrangements remain the responsibility of the individual seller.</p>
        </section>

        {/* Delivery Disputes */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Delivery Disputes</h2>
          <p>
            If a delivery issue arises, buyers should first contact the seller directly. If the matter cannot be resolved, Zuri Market may review the situation and assist with communication where appropriate. However, we do not act as the shipping provider and cannot guarantee a particular outcome.
          </p>
        </section>

        {/* Changes to This Policy */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Changes to This Policy</h2>
          <p>
            Zuri Market may update this Shipping & Delivery Policy from time to time to reflect changes in marketplace operations, applicable laws, or business practices. Any updates will be published on this page together with the revised effective date.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>If you have questions regarding this Shipping & Delivery Policy, please contact us.</p>
          <div className="mt-3">
            <p className="font-medium text-gray-800">Zuri Market</p>
            <p className="mt-1">Email: <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">hello@zurimarket.co.ke</a></p>
            <p>Founder: <span className="font-medium text-gray-800">Chris Odhiambo</span></p>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Thank you for choosing Zuri Market. We are committed to maintaining a trusted marketplace where buyers and sellers can connect with confidence.
          </p>
        </section>
      </div>
    </div>
  )
}
