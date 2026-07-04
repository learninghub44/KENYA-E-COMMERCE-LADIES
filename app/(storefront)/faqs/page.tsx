import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Zuri Market",
  description:
    "Answers to common questions from buyers and sellers on the Zuri Market multi-vendor marketplace.",
}

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-sm text-gray-500">Last Updated: July 4, 2026</p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Welcome to the Zuri Market Help Center. Below are answers to some of the questions we receive most often from buyers and sellers. If you cannot find the information you need, please contact us at{" "}
          <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
            hello@zurimarket.co.ke
          </a>
          .
        </p>
      </div>

      <div className="space-y-12 text-gray-600 leading-relaxed">
        {/* General Questions */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">General Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">What is Zuri Market?</h3>
              <p>
                Zuri Market is a multi-vendor online marketplace where independent businesses and individual sellers can showcase and sell their products to customers across Kenya. Our platform makes it easy for buyers to discover products from multiple sellers in one place.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Is Zuri Market a seller?</h3>
              <p>No. Zuri Market is <strong className="text-gray-800">not</strong> the seller of products listed on the marketplace. Products are offered by independent vendors who manage their own stores. Our role is to provide, maintain, improve, and regulate the marketplace platform.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Does Zuri Market process payments?</h3>
              <p>No. Zuri Market does not process, receive, or hold payments. Payments are arranged directly between buyers and sellers using payment methods agreed upon by both parties.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Does Zuri Market deliver products?</h3>
              <p>No. Delivery arrangements are handled by individual vendors. Delivery options, timelines, and charges may vary from one seller to another.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Can I trust sellers on Zuri Market?</h3>
              <p>
                We encourage all sellers to provide accurate product information and professional customer service. While we monitor marketplace activity and enforce our policies, buyers should review seller ratings, product descriptions, and communicate with sellers before making a purchase.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Buyer Questions */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Buyer Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Do I need an account to shop?</h3>
              <p>Some features may be available without an account, but creating an account allows you to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Save your favourite products.</li>
                <li>Track your orders where available.</li>
                <li>Contact sellers more easily.</li>
                <li>Receive important updates.</li>
                <li>Manage your profile and preferences.</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">How do I place an order?</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-6">
                <li>Browse products.</li>
                <li>Select the product you want.</li>
                <li>Choose available options such as size or colour.</li>
                <li>Add the item to your cart.</li>
                <li>Submit your order.</li>
                <li>The seller will contact you where necessary to confirm order details, payment arrangements, and delivery.</li>
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">How do I pay for my order?</h3>
              <p>Payment arrangements are made directly with the seller. Each seller may accept different payment methods. Please confirm payment instructions with the seller before making payment.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Can I cancel my order?</h3>
              <p>Cancellation depends on whether the seller has already processed or dispatched the order. Contact the seller as soon as possible if you wish to cancel.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Can I return a product?</h3>
              <p>Yes, if the seller accepts returns under their return policy or where required by applicable law. Please review the seller&apos;s return policy before purchasing.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Who handles refunds?</h3>
              <p>Refunds are handled directly by the seller. Since Zuri Market does not process payments, we cannot issue refunds on behalf of vendors.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">What if I receive the wrong product?</h3>
              <p>Contact the seller immediately. Provide photos and explain the issue. If communication becomes difficult, you may contact Zuri Market for assistance in facilitating communication.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">What if my order never arrives?</h3>
              <p>You should first contact the seller for an update. If the issue cannot be resolved, you may contact Zuri Market for further assistance.</p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Seller Questions */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Seller Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Who can become a seller?</h3>
              <p>Businesses, entrepreneurs, retailers, wholesalers, manufacturers, and individual sellers who comply with our marketplace requirements may apply to sell on Zuri Market.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">How do I register as a seller?</h3>
              <p>Create an account, complete your seller profile, provide any required business information, and follow the seller registration process available on the platform. Additional verification may be required before your store becomes active.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Is there a registration fee?</h3>
              <p>Registration requirements and any applicable seller fees are displayed during the seller onboarding process and may change from time to time.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Who sets product prices?</h3>
              <p>Each seller independently determines the prices of their products.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Who manages inventory?</h3>
              <p>Each seller is responsible for updating product availability and maintaining accurate stock information.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Who communicates with customers?</h3>
              <p>Sellers are responsible for responding to customer inquiries, confirming orders, arranging payment, and providing delivery updates.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Who handles shipping?</h3>
              <p>Shipping and delivery are the responsibility of each individual seller.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Who handles returns?</h3>
              <p>Each seller manages returns and refunds according to their return policy and applicable laws.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Can my seller account be suspended?</h3>
              <p>Yes. Seller accounts may be suspended or removed if they:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Sell prohibited products.</li>
                <li>Provide misleading information.</li>
                <li>Engage in fraudulent activity.</li>
                <li>Repeatedly fail to fulfil orders.</li>
                <li>Violate marketplace policies.</li>
                <li>Abuse customers or other users.</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Account Questions */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Account Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">I forgot my password.</h3>
              <p>
                Use the &ldquo;Forgot Password&rdquo; option on the login page to reset your password. If you continue to experience difficulties, contact our support team.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">How do I update my account information?</h3>
              <p>
                After logging in, go to your account settings where you can update your profile information, password, addresses, and contact details.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">How do I delete my account?</h3>
              <p>
                You may request account deletion by contacting us at{" "}
                <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
                  hello@zurimarket.co.ke
                </a>
                . Some information may be retained where required by law or for legitimate business purposes.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Privacy & Security */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Privacy &amp; Security</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Is my information secure?</h3>
              <p>
                We implement reasonable administrative and technical measures to protect user information and improve the security of our marketplace. However, users should also protect their passwords and account credentials.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Does Zuri Market sell my personal information?</h3>
              <p>No. We do not sell or rent personal information to third parties. Please review our <a href="/privacy" className="text-[#1C5C56] underline underline-offset-2">Privacy Policy</a> for more details.</p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Marketplace Policies */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Marketplace Policies</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Can prohibited products be sold?</h3>
              <p>No. Products that violate Kenyan law or our marketplace policies are not permitted. We reserve the right to remove prohibited listings and suspend accounts that violate our policies.</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">How do I report a product or seller?</h3>
              <p>If you believe a product, listing, or seller violates our policies, please contact us with relevant details. We will review the report and take appropriate action where necessary.</p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>If your question has not been answered above, our support team is ready to help.</p>
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
            We aim to respond to enquiries as promptly as reasonably possible and appreciate your trust in Zuri Market.
          </p>
        </section>
      </div>
    </div>
  )
}
