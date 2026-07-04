import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy — Zuri Market",
  description:
    "How Zuri Market uses cookies and similar technologies to improve your browsing experience.",
}

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500">Last Updated: July 4, 2026</p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Introduction */}
        <section>
          <p>
            This Cookie Policy explains how <strong className="text-gray-800">Zuri Market</strong> (&ldquo;Zuri Market,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) uses cookies and similar technologies when you visit our website and use our marketplace services.
          </p>
          <p className="mt-3">
            Our goal is to provide a secure, reliable, and personalized experience for every visitor while respecting your privacy.
          </p>
          <p className="mt-3">
            By continuing to use our website, you agree to the use of cookies as described in this Policy, unless you disable them through your browser settings.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* What Are Cookies */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your computer, smartphone, or other device when you visit a website. They allow websites to remember information about your visit, such as your login status, language preferences, recently viewed products, and other settings. Cookies help websites work more efficiently and improve the overall user experience.
          </p>
          <p className="mt-3">
            Cookies do <strong className="text-gray-800">not</strong> normally contain information that personally identifies you, although they may be associated with information stored in your account.
          </p>
        </section>

        {/* Why We Use Cookies */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Why We Use Cookies</h2>
          <p>Zuri Market uses cookies to ensure that our marketplace functions properly and to improve the experience for buyers, sellers, and visitors. Cookies help us:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Keep users signed in.</li>
            <li>Remember user preferences.</li>
            <li>Improve website performance.</li>
            <li>Protect user accounts.</li>
            <li>Detect suspicious activity.</li>
            <li>Maintain marketplace security.</li>
            <li>Analyze website traffic.</li>
            <li>Improve search functionality.</li>
            <li>Remember shopping preferences.</li>
            <li>Provide a more personalized experience.</li>
          </ul>
        </section>

        {/* Types of Cookies */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Types of Cookies We Use</h2>

          <h3 className="mt-6 mb-2 text-lg font-medium text-gray-800">Essential Cookies</h3>
          <p>These cookies are necessary for the operation of our website. Without them, important features such as account login, security, and navigation may not function correctly. Examples include:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>User authentication</li>
            <li>Session management</li>
            <li>Security verification</li>
            <li>Fraud prevention</li>
            <li>Website navigation</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">These cookies cannot be disabled through our website because they are essential to providing our services.</p>

          <h3 className="mt-6 mb-2 text-lg font-medium text-gray-800">Performance Cookies</h3>
          <p>Performance cookies help us understand how visitors use our website. They collect anonymous information about:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Most visited pages</li>
            <li>Navigation patterns</li>
            <li>Loading speed</li>
            <li>Error messages</li>
            <li>Device performance</li>
          </ul>
          <p className="mt-3">This information allows us to improve the reliability and speed of the marketplace.</p>

          <h3 className="mt-6 mb-2 text-lg font-medium text-gray-800">Functional Cookies</h3>
          <p>Functional cookies remember choices you make while using Zuri Market. These may include:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Preferred language</li>
            <li>Region</li>
            <li>Display settings</li>
            <li>Saved preferences</li>
            <li>Login status</li>
          </ul>
          <p className="mt-3">These cookies provide a more personalized experience.</p>

          <h3 className="mt-6 mb-2 text-lg font-medium text-gray-800">Analytics Cookies</h3>
          <p>Analytics cookies help us understand how our marketplace is used. They allow us to identify:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Popular products</li>
            <li>Frequently visited categories</li>
            <li>Search trends</li>
            <li>User engagement</li>
            <li>Website performance</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">The information collected is generally aggregated and does not directly identify individual users.</p>

          <h3 className="mt-6 mb-2 text-lg font-medium text-gray-800">Security Cookies</h3>
          <p>Security cookies help protect both buyers and vendors by detecting suspicious activity. They assist us in:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Preventing unauthorized access</li>
            <li>Detecting fraudulent behaviour</li>
            <li>Protecting user accounts</li>
            <li>Maintaining platform integrity</li>
            <li>Identifying unusual login attempts</li>
          </ul>
        </section>

        {/* Third-Party Cookies */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Third-Party Cookies</h2>
          <p>Some services integrated into our marketplace may place their own cookies on your device. These may include services related to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Website analytics</li>
            <li>Embedded content</li>
            <li>Maps</li>
            <li>Customer support tools</li>
            <li>Social media sharing</li>
          </ul>
          <p className="mt-3">These third parties operate under their own privacy and cookie policies. We encourage users to review those policies before using third-party services.</p>
        </section>

        {/* Managing Cookies */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Managing Cookies</h2>
          <p>Most web browsers allow you to control or disable cookies through browser settings. You can usually:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>View stored cookies</li>
            <li>Delete cookies</li>
            <li>Block all cookies</li>
            <li>Block cookies from specific websites</li>
            <li>Receive notifications before cookies are stored</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">Please note that disabling certain cookies may affect the functionality of Zuri Market, and some features may no longer work as intended.</p>
        </section>

        {/* Cookies and Personal Info */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Cookies and Personal Information</h2>
          <p>Cookies themselves generally do not contain sensitive personal information. However, cookies may be linked with information stored in your account to improve your experience while using the marketplace.</p>
          <p className="mt-3">
            For more information about how we handle personal information, please read our{" "}
            <a href="/privacy" className="text-[#1C5C56] underline underline-offset-2">Privacy Policy</a>.
          </p>
        </section>

        {/* Do Not Track */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Do Not Track</h2>
          <p>
            Some web browsers include a &ldquo;Do Not Track&rdquo; feature. Because there is currently no universally accepted standard for responding to these signals, Zuri Market may not respond differently when such signals are received.
          </p>
        </section>

        {/* Updates */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Updates to This Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our services. When changes are made, the updated version will be published on this page together with the revised effective date.
          </p>
          <p className="mt-3">We encourage users to review this Policy periodically to stay informed about how cookies are used.</p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>If you have any questions regarding this Cookie Policy or our use of cookies, please contact us.</p>
          <div className="mt-3">
            <p className="font-medium text-gray-800">Zuri Market</p>
            <p className="mt-1">Email: <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">hello@zurimarket.co.ke</a></p>
            <p>Founder: <span className="font-medium text-gray-800">Chris Odhiambo</span></p>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Thank you for choosing Zuri Market. We are committed to providing a secure, transparent, and user-friendly marketplace for buyers and sellers across Kenya.
          </p>
        </section>
      </div>
    </div>
  )
}
