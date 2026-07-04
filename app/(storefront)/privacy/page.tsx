import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Kenya E-Commerce",
  description:
    "How Kenya E-Commerce collects, uses, stores, and protects your personal information.",
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

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <p>
          ZURI E-Commerce values your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, and protect your information whenever you use our marketplace.
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Information We Collect</h2>
          <p>
            We may collect personal information including your name, email address, phone number, delivery address, billing information, account credentials, profile information, order history, communication records, device information, browser type, IP address, and usage statistics.
          </p>
          <p className="mt-3">
            For vendors, additional business information may be collected, including business names, business addresses, banking or payment details, tax information where required, and documents necessary for account verification.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">How We Use Your Information</h2>
          <p>Your information helps us:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Create and manage user accounts.</li>
            <li>Process purchases and payments.</li>
            <li>Coordinate deliveries.</li>
            <li>Communicate order updates.</li>
            <li>Verify vendor accounts.</li>
            <li>Improve customer support.</li>
            <li>Detect fraud and suspicious activity.</li>
            <li>Improve platform performance.</li>
            <li>Personalize your shopping experience.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Sharing Information</h2>
          <p>We do not sell your personal information.</p>
          <p className="mt-3">
            Information may be shared only when necessary with payment service providers, logistics partners, technology service providers, vendors involved in your purchases, government authorities where legally required, and professional advisors assisting in business operations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Cookies</h2>
          <p>
            Our platform uses cookies and similar technologies to improve functionality, remember user preferences, analyze website performance, and enhance security.
          </p>
          <p className="mt-3">
            Users may disable cookies through their browser settings, although some features may not function properly.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Data Security</h2>
          <p>
            We use reasonable administrative, technical, and organizational safeguards to protect personal information from unauthorized access, misuse, alteration, disclosure, or destruction.
          </p>
          <p className="mt-3">
            Although we work hard to protect your information, no internet-based system can guarantee complete security.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Data Retention</h2>
          <p>
            We retain personal information only for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Your Rights</h2>
          <p>Depending on applicable laws, you may have the right to:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Access your personal information.</li>
            <li>Correct inaccurate information.</li>
            <li>Request deletion of your information.</li>
            <li>Withdraw consent where applicable.</li>
            <li>Request a copy of your data.</li>
            <li>Object to certain forms of processing.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Children&apos;s Privacy</h2>
          <p>
            Our services are not intended for children under the age required by applicable law without parental or guardian consent.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Updated versions will be published on this page together with the revised effective date.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>
            For privacy-related questions, requests, or concerns, please contact us.
          </p>
          <div className="mt-3 space-y-1">
            <p>Email: <a href="mailto:chrisdeveloper8@gmail.com" className="text-[#1C5C56] underline underline-offset-2">chrisdeveloper8@gmail.com</a></p>
            <p>Phone: +254701059192</p>
          </div>
        </section>
      </div>
    </div>
  )
}
