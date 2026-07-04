import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Zuri Market",
  description:
    "How Zuri Market collects, uses, stores, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500">Last Updated: July 4, 2026</p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Welcome */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Welcome to Zuri Market</h2>
          <p>
            Welcome to Zuri Market (&ldquo;Zuri Market,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). Your privacy is important to us, and we are committed to protecting the personal information you share while using our marketplace.
          </p>
          <p className="mt-3">
            Zuri Market operates as an online multi-vendor marketplace that connects buyers with independent sellers across Kenya. We provide and maintain the technology that enables vendors to showcase their products and customers to discover, compare, and purchase them.
          </p>
          <p className="mt-3 font-medium text-gray-800">
            Zuri Market does not process, receive, or hold payments on behalf of buyers or sellers. Payment arrangements are made directly between buyers and the respective vendors.
          </p>
          <p className="mt-3">
            This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* Information We Collect */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Information We Collect</h2>
          <p>To provide our services effectively, we may collect several types of information.</p>

          <h3 className="mt-6 mb-2 text-lg font-medium text-gray-800">Personal Information</h3>
          <p>When you create an account, contact us, subscribe to updates, or interact with our platform, we may collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Delivery address</li>
            <li>County and location</li>
            <li>Profile photo (optional)</li>
            <li>Username</li>
            <li>Communication preferences</li>
          </ul>
          <p className="mt-3">For vendors, we may also collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Business name</li>
            <li>Business address</li>
            <li>Contact information</li>
            <li>Business registration details (where applicable)</li>
            <li>Identification documents for verification</li>
            <li>Store information</li>
            <li>Product catalog information</li>
          </ul>
        </section>

        {/* Account Information */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Account Information</h2>
          <p>When you register an account, we securely store information necessary to maintain your account, including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Login credentials</li>
            <li>Account settings</li>
            <li>Wishlist</li>
            <li>Saved addresses</li>
            <li>Purchase history</li>
            <li>Messages relating to marketplace activities</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">Passwords are encrypted and cannot be viewed by our staff.</p>
        </section>

        {/* Device Information */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Device Information</h2>
          <p>We automatically collect certain technical information when you use our platform. This may include:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Device type</li>
            <li>Browser information</li>
            <li>Operating system</li>
            <li>IP address</li>
            <li>Language preferences</li>
            <li>Date and time of access</li>
            <li>Pages visited</li>
            <li>Search history within the marketplace</li>
            <li>Device identifiers</li>
          </ul>
          <p className="mt-3">This information helps us improve performance, diagnose technical issues, and enhance security.</p>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Cookies and Similar Technologies</h2>
          <p>Zuri Market uses cookies and similar technologies to improve your browsing experience. Cookies help us:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Keep you logged in</li>
            <li>Remember your preferences</li>
            <li>Improve website performance</li>
            <li>Understand how visitors use our platform</li>
            <li>Detect suspicious activities</li>
            <li>Enhance security</li>
          </ul>
          <p className="mt-3">You may disable cookies through your browser settings, although some features may not function correctly.</p>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">How We Use Your Information</h2>
          <p>Your information helps us operate and improve our marketplace. We may use your information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Create and manage your account.</li>
            <li>Verify your identity.</li>
            <li>Provide customer support.</li>
            <li>Enable communication between buyers and sellers.</li>
            <li>Improve platform functionality.</li>
            <li>Detect fraud and abuse.</li>
            <li>Prevent unauthorized access.</li>
            <li>Send important service announcements.</li>
            <li>Respond to inquiries.</li>
            <li>Analyze website performance.</li>
            <li>Comply with legal obligations.</li>
            <li>Improve marketplace security.</li>
            <li>Recommend relevant products and vendors.</li>
          </ul>
        </section>

        {/* Vendor Information */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Vendor Information</h2>
          <p>Vendor information is used to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Verify seller accounts.</li>
            <li>Display public store information.</li>
            <li>Enable buyers to contact vendors.</li>
            <li>Manage marketplace operations.</li>
            <li>Enforce marketplace policies.</li>
            <li>Improve seller services.</li>
          </ul>
          <p className="mt-3">Some vendor information, such as store name, product listings, ratings, and public contact information, may be visible to customers.</p>
        </section>

        {/* Payment Information */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Payment Information</h2>
          <p className="font-medium text-gray-800">Zuri Market does not process, receive, store, or facilitate payments.</p>
          <p className="mt-3">All payment arrangements are made directly between buyers and independent sellers using payment methods agreed upon by both parties.</p>
          <p className="mt-3">Because payments occur outside our platform, we do not collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Debit card details</li>
            <li>Credit card details</li>
            <li>Mobile money PINs</li>
            <li>Bank account credentials</li>
            <li>Payment passwords</li>
          </ul>
          <p className="mt-3">Users should only make payments using trusted methods and should verify vendor details before completing any transaction.</p>
        </section>

        {/* Communications */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Communications</h2>
          <p>We may contact you regarding:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Account notifications</li>
            <li>Security alerts</li>
            <li>Marketplace updates</li>
            <li>Policy changes</li>
            <li>Customer support responses</li>
            <li>Promotional communications (if you choose to receive them)</li>
          </ul>
          <p className="mt-3">You may unsubscribe from promotional emails at any time.</p>
        </section>

        {/* Sharing Your Information */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Sharing Your Information</h2>
          <p className="font-medium text-gray-800">We respect your privacy. We do not sell, rent, or trade your personal information.</p>
          <p className="mt-3">Information may only be shared when necessary with:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Vendors involved in your orders</li>
            <li>Technology service providers supporting our platform</li>
            <li>Hosting providers</li>
            <li>Security providers</li>
            <li>Legal authorities where required by law</li>
            <li>Professional advisers assisting our business</li>
          </ul>
          <p className="mt-3">Every effort is made to ensure that such parties protect your information appropriately.</p>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Data Security</h2>
          <p className="font-medium text-gray-800">Protecting your information is one of our highest priorities.</p>
          <p className="mt-3">We implement reasonable administrative, technical, and organizational safeguards including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Encrypted passwords</li>
            <li>Secure servers</li>
            <li>Access controls</li>
            <li>Regular security monitoring</li>
            <li>Software updates</li>
            <li>Data backups</li>
            <li>Fraud prevention measures</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">While we strive to maintain a secure environment, no internet service can guarantee absolute security.</p>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Data Retention</h2>
          <p>We retain personal information only for as long as necessary to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Maintain your account</li>
            <li>Provide marketplace services</li>
            <li>Resolve disputes</li>
            <li>Enforce our Terms and Conditions</li>
            <li>Meet legal obligations</li>
          </ul>
          <p className="mt-3">When information is no longer required, it is securely deleted or anonymized where appropriate.</p>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Your Rights</h2>
          <p>Depending on applicable law, you may have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access your information.</li>
            <li>Update inaccurate information.</li>
            <li>Request deletion of your account.</li>
            <li>Request correction of your data.</li>
            <li>Withdraw consent where applicable.</li>
            <li>Object to certain processing activities.</li>
            <li>Request a copy of your personal data.</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">Some requests may be limited where legal obligations require us to retain certain information.</p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Children&apos;s Privacy</h2>
          <p>
            Zuri Market is not intended for children without appropriate parental or guardian supervision where required by law. We do not knowingly collect personal information from children in violation of applicable laws.
          </p>
        </section>

        {/* Third-Party Links */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Third-Party Links</h2>
          <p>
            Our platform may contain links to third-party websites, vendor websites, or external services. We are not responsible for the privacy practices or content of those third-party websites. Users should review the privacy policies of any external websites they visit.
          </p>
        </section>

        {/* Changes */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our services, legal obligations, or business operations. Updated versions will be published on this page together with the revised effective date.
          </p>
          <p className="mt-3">
            Continued use of the platform after changes become effective constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>
            If you have questions, concerns, or requests relating to this Privacy Policy, please contact us.
          </p>
          <div className="mt-3">
            <p className="font-medium text-gray-800">Zuri Market</p>
            <p className="mt-1">Email: <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">hello@zurimarket.co.ke</a></p>
            <p>Founder: <span className="font-medium text-gray-800">Chris Odhiambo</span></p>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            We are committed to responding to privacy-related inquiries as promptly as reasonably possible.
          </p>
        </section>

        <hr className="border-gray-200" />

        <p className="text-center text-sm text-gray-500">
          Thank you for trusting Zuri Market. We appreciate the opportunity to provide a secure and reliable marketplace for buyers and sellers across Kenya.
        </p>
      </div>
    </div>
  )
}
