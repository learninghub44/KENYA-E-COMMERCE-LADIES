import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Zuri Market",
  description:
    "Terms and conditions governing the use of Zuri Market, Kenya's marketplace for African fashion and lifestyle.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Zuri Market, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. We may update these terms from time to time; continued use after changes constitutes acceptance.",
  },
  {
    title: "2. The Marketplace Model",
    content:
      "Zuri Market is a marketplace that connects independent sellers with shoppers. Sellers list, price, fulfil, and are responsible for their own products. Zuri Market is not the seller of record, does not take title to listed goods, and is not liable for any transaction between buyer and seller except as expressly stated.",
  },
  {
    title: "3. Account Registration",
    content:
      "You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Sellers must complete identity verification (KYC) before listing products. You must provide accurate, current information and update it when it changes.",
  },
  {
    title: "4. Purchases & Payments",
    content:
      "When you place an order, you enter into a contract directly with the seller. Prices are in Kenyan Shillings (KES) unless stated otherwise. Payment is due at the time of purchase via the methods shown at checkout. Zuri Market processes payments on behalf of sellers through our payment partners. Delivery times are estimates provided by the seller and are not guaranteed by Zuri Market.",
  },
  {
    title: "5. Shipping & Returns",
    content:
      "Each seller sets their own shipping and return policies, which are displayed on their store page and at checkout. Zuri Market does not handle fulfilment. If you have an issue with a shipment or item, contact the seller directly via your order page. If you cannot resolve the issue, Zuri Market may mediate at its discretion.",
  },
  {
    title: "6. Intellectual Property",
    content:
      "The Zuri Market name, logo, design, and platform content are owned by Zuri Market Ltd. Sellers retain ownership of their product images, descriptions, and branding. You may not reproduce, distribute, or create derivative works from our platform without prior written consent.",
  },
  {
    title: "7. User Conduct",
    content:
      "You agree not to: list counterfeit, stolen, or prohibited goods; misrepresent a product or its availability; attempt to circumvent platform fees or safety measures; harass other users; use the platform for any unlawful purpose; or interfere with the proper functioning of the marketplace.",
  },
  {
    title: "8. Seller Obligations",
    content:
      "Sellers must accurately describe products, maintain accurate inventory, fulfil orders promptly, respond to buyer messages in a timely manner, and comply with all applicable Kenyan laws and regulations. Failure to do so may result in account suspension or removal from the platform.",
  },
  {
    title: "9. Disclaimers & Limitation of Liability",
    content:
      "Zuri Market is provided 'as is' without warranties of any kind, express or implied. To the fullest extent permitted by Kenyan law, Zuri Market shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid in platform fees in the 12 months preceding the claim.",
  },
  {
    title: "10. Governing Law & Dispute Resolution",
    content:
      "These terms are governed by the laws of the Republic of Kenya. Any disputes arising from these terms or your use of Zuri Market shall first be resolved through informal negotiation. If unresolved, disputes shall be referred to mediation in Nairobi, Kenya, and if still unresolved, to the courts of Kenya.",
  },
  {
    title: "11. Termination",
    content:
      "We may suspend or terminate your account at any time for violation of these terms or for conduct we reasonably deem harmful to the platform. You may delete your account at any time through your account settings. Upon termination, you remain liable for any outstanding obligations.",
  },
  {
    title: "12. Contact",
    content:
      "For questions about these terms, please contact us at legal@zurimarket.co.ke or write to Zuri Market Ltd, P.O. Box 12345-00100, Nairobi, Kenya.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms of Service
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
      </div>
    </div>
  );
}
