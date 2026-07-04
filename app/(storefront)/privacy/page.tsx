import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Zuri Market",
  description:
    "How Zuri Market collects, uses, stores, and protects your personal data, in compliance with the Kenya Data Protection Act, 2019 and GDPR principles.",
};

const sections = [
  {
    title: "1. Who we are",
    content:
      "Zuri Market (operated by Zuri Market Ltd, a company registered in Kenya) is the data controller for personal data collected through the platform. Our registered address is P.O. Box 12345-00100, Nairobi, Kenya. You can contact our Data Protection Officer at dpo@zurimarket.co.ke.",
  },
  {
    title: "2. Information we collect",
    content:
      "We collect information you provide directly: name, email address, phone number, shipping address, and a store contact number (e.g. M-Pesa number) sellers choose to display for buyers, when you create an account or place an order. Zuri Market is a listings platform only — we do not process, collect, or hold payments, and we never collect card numbers or banking credentials. Buyers and sellers arrange and complete payment directly between themselves. For sellers, we additionally collect identity verification documents (such as national ID or passport) and business details as required by KYC regulations. We also collect information automatically: device information, IP address, browser type, pages visited, and cookies (see section 6).",
  },
  {
    title: "3. How we use your information",
    content:
      "To operate and maintain your account; process and fulfil orders (including sharing relevant details with the seller); facilitate buyer-seller messaging; send order updates, shipping confirmations, and account notifications; provide customer support; detect and prevent fraud or abuse; comply with legal obligations; and, with your consent, send marketing communications you can opt out of at any time.",
  },
  {
    title: "4. Lawful basis for processing",
    content:
      "We process personal data based on: (a) performance of a contract — to deliver the services you requested; (b) legitimate interests — to operate and improve the platform, prevent fraud, and ensure security; (c) legal obligations — to comply with Kenyan laws including the Data Protection Act, 2019; and (d) consent — for marketing and optional data uses.",
  },
  {
    title: "5. Data sharing & disclosure",
    content:
      "We share your order information with the seller who fulfils it, including the store contact details needed to arrange payment and delivery directly with them. Because Zuri Market does not process or hold payments, we have no payment processing partners and do not share payment data with any such party. We use trusted third-party service providers for hosting, image storage, identity verification, email delivery, and analytics — all bound by data processing agreements. We do not sell your personal data to third parties. We may disclose information if required by law or to protect the rights, property, or safety of Zuri Market, its users, or others.",
  },
  {
    title: "6. Cookies & tracking",
    content:
      "We use essential cookies to operate the platform (authentication, cart, security). We use analytics cookies (e.g. Google Analytics) to understand how you use the site. We use functional cookies to remember your preferences. You can control cookie settings through your browser. Disabling certain cookies may affect platform functionality. See our Cookie Policy for more details.",
  },
  {
    title: "7. Data retention",
    content:
      "We retain your account data for as long as your account is active. Order records are retained for at least 6 years to comply with tax and legal obligations in Kenya. Identity verification documents are retained for the duration of a seller's account plus 5 years. You may request deletion of your data as described in section 9.",
  },
  {
    title: "8. Data security",
    content:
      "We implement appropriate technical and organisational measures to protect your data, including encryption in transit (TLS), encryption at rest, access controls, regular security audits, and staff training. No system is completely secure, and we cannot guarantee absolute security of your data.",
  },
  {
    title: "9. Your rights",
    content:
      "Under the Kenya Data Protection Act, 2019 and applicable GDPR principles, you have the right to: access your personal data; correct inaccurate data; request deletion of your data; restrict or object to processing; data portability; withdraw consent at any time; and lodge a complaint with the Office of the Data Protection Commissioner (ODPC). To exercise any of these rights, contact us at dpo@zurimarket.co.ke or use our contact form.",
  },
  {
    title: "10. International transfers",
    content:
      "Your data is primarily stored on servers within Kenya. Some service providers may process data outside Kenya (e.g. cloud infrastructure providers). Where data is transferred internationally, we ensure appropriate safeguards are in place, including standard contractual clauses or equivalent mechanisms.",
  },
  {
    title: "11. Children's privacy",
    content:
      "Zuri Market is not intended for individuals under 18 years of age. We do not knowingly collect personal data from children. If we become aware that a child has provided us with personal data, we will delete it promptly.",
  },
  {
    title: "12. Changes to this policy",
    content:
      "We may update this privacy policy from time to time. Material changes will be notified via email or a notice on the platform. The 'Last updated' date at the top of this page reflects the most recent revision.",
  },
  {
    title: "13. Contact",
    content:
      "For questions, concerns, or data subject requests, contact our Data Protection Officer at dpo@zurimarket.co.ke, write to Zuri Market Ltd, P.O. Box 12345-00100, Nairobi, Kenya, or visit our contact page.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-muted-foreground">
          Last updated July 2026
        </p>
      </div>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
            <p className="text-muted-foreground">{section.content}</p>
          </section>
        ))}
        <p className="pt-4 text-sm text-muted-foreground">
          For more information about how we handle your data, see our{" "}
          <Link href="/cookies" className="underline underline-offset-4">
            Cookie Policy
          </Link>
          ,{" "}
          <Link href="/terms" className="underline underline-offset-4">
            Terms of Service
          </Link>
          , or{" "}
          <Link href="/contact" className="underline underline-offset-4">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
