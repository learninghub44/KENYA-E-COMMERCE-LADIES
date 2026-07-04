import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Kenya E-Commerce",
  description:
    "Terms and conditions governing the use of Kenya E-Commerce, an online multi-vendor marketplace.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Terms of Service
        </h1>
      </div>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Marketplace</h2>
          <p>
            Kenya E-Commerce is an online multi-vendor marketplace that connects buyers with independent sellers. We provide the technology that allows vendors to advertise and manage their products while enabling customers to discover and contact sellers.
          </p>
          <p className="mt-3">
            Kenya E-Commerce is <strong className="text-gray-800">not a party to the sale or purchase agreement</strong> between buyers and sellers. Each transaction is entered into directly between the buyer and the respective vendor.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Payments</h2>
          <p>
            Kenya E-Commerce does not receive, process, hold, or facilitate payments on behalf of vendors. Buyers and sellers are solely responsible for agreeing on payment methods, confirming payment, and completing transactions.
          </p>
          <p className="mt-3">
            Any disputes relating to payments, pricing, refunds, or financial transactions should first be addressed directly between the buyer and the seller.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Vendor Responsibilities</h2>
          <p>Each vendor is solely responsible for:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Product listings and descriptions.</li>
            <li>Product quality and authenticity.</li>
            <li>Pricing and stock availability.</li>
            <li>Communication with customers.</li>
            <li>Payment arrangements.</li>
            <li>Order fulfillment and delivery.</li>
            <li>Returns, refunds, warranties, and after-sales support where applicable.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Buyer Responsibilities</h2>
          <p>
            Buyers are responsible for reviewing product details, communicating with vendors, confirming payment arrangements, and verifying product information before completing a purchase.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Limitation of Liability</h2>
          <p>
            Kenya E-Commerce provides only the marketplace through which buyers and sellers connect. We do not own, manufacture, inspect, store, ship, or guarantee products listed by vendors, nor do we participate in payment transactions.
          </p>
          <p className="mt-3">
            To the fullest extent permitted by law, Kenya E-Commerce shall not be liable for disputes arising from payments, product quality, delivery delays, refunds, warranties, or agreements made directly between buyers and sellers. Users acknowledge that all purchases are conducted at their own discretion and responsibility.
          </p>
        </section>
      </div>
    </div>
  )
}
