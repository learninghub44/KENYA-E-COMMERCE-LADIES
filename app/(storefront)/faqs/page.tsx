import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Common questions about shopping and selling on Zuri Market.",
};

const faqs = [
  {
    q: "How does Zuri Market work?",
    a: "Zuri Market is a marketplace: independent Kenyan sellers list and fulfill their own products. When you order, you're buying directly from that seller, and Zuri Market handles discovery, checkout, and buyer-seller messaging.",
  },
  {
    q: "Who do I contact if there's an issue with my order?",
    a: "Message the seller directly from your order page — they fulfill and ship the order, so they're best placed to help with delays, sizing, or damage issues.",
  },
  {
    q: "How do I become a seller?",
    a: "Sellers go through a short verification (KYC) step before their store goes live. Look for the seller sign-up option, or reach out via our contact page if you don't see it yet.",
  },
  {
    q: "What payment methods are supported?",
    a: "Supported payment methods are shown at checkout and may vary as we roll out new options — check the checkout page for what's currently available.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Return policies are set per seller since each seller fulfills their own orders. See our Returns & Exchanges page for the general policy, and check the specific seller's store page for any seller-specific terms.",
  },
];

export default function FaqsPage() {
  return (
    <StaticPage title="Frequently Asked Questions">
      <div className="space-y-8">
        {faqs.map((item) => (
          <div key={item.q}>
            <h2 className="mb-2 text-lg font-semibold">{item.q}</h2>
            <p className="text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
