import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQs — Zuri Market",
  description:
    "Frequently asked questions about shopping, selling, shipping, returns, payments, and managing your account on Zuri Market.",
};

const categories = [
  {
    name: "Orders",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse products, add items to your cart, then proceed to checkout. Enter your shipping details and choose a payment method to confirm your order. You'll receive a confirmation email once the order is placed.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "You can cancel an order within 1 hour of placing it, provided the seller hasn't yet marked it as processing. Go to your orders page and use the cancel option if available. To change an order, cancel it and place a new one.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order ships, the seller updates the status and you'll see tracking information on your order page. You'll also receive email updates as the order progresses.",
      },
      {
        q: "What if my order arrives damaged or incorrect?",
        a: "Message the seller immediately via your order page with photos of the issue. Sellers are responsible for resolving damaged or incorrect items. If you can't reach a resolution, contact Zuri Market support for assistance.",
      },
    ],
  },
  {
    name: "Shipping",
    items: [
      {
        q: "How much does shipping cost?",
        a: "Shipping costs are set by each seller and are displayed at checkout. Costs vary based on the seller's location, your delivery address, and the size of the package.",
      },
      {
        q: "Do you ship to all counties in Kenya?",
        a: "Yes, we operate across all 47 counties. Delivery times vary by location — urban areas typically receive deliveries within 2-5 business days, while rural areas may take 5-10 business days.",
      },
      {
        q: "Do you offer international shipping?",
        a: "Currently, Zuri Market focuses on domestic shipping within Kenya. Some sellers may offer international shipping — check the product page or message the seller directly to inquire.",
      },
      {
        q: "Can I collect my order in person?",
        a: "Some sellers offer local pickup. Check the seller's store page or message them to arrange a pickup if available.",
      },
    ],
  },
  {
    name: "Returns & Exchanges",
    items: [
      {
        q: "What is the return policy?",
        a: "Each seller sets their own return policy, which is displayed on their store page and at checkout. Most sellers accept returns within 7-14 days of delivery for items in original condition. Check the specific seller's policy before purchasing.",
      },
      {
        q: "How do I return an item?",
        a: "Start by messaging the seller from your order page to initiate the return. The seller will provide instructions and the return address. You're typically responsible for return shipping costs unless the item was incorrect or damaged.",
      },
      {
        q: "How long do refunds take?",
        a: "Once the seller receives and inspects the returned item, refunds are processed within 3-5 business days. The refund will be issued to your original payment method and may take additional time to appear depending on your payment provider.",
      },
      {
        q: "Can I exchange an item for a different size or colour?",
        a: "Exchanges are handled per the seller's policy. Contact the seller through your order page to check availability. In many cases, it's faster to return the item and place a new order.",
      },
    ],
  },
  {
    name: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept M-Pesa (the most popular option), credit/debit cards (Visa, Mastercard), and bank transfers. Available options are shown at checkout.",
      },
      {
        q: "Is it safe to pay on Zuri Market?",
        a: "Yes. All payments are processed through secure, PCI-compliant payment partners. Your payment details are never stored on our servers. We also use encryption (TLS) to protect your data during transmission.",
      },
      {
        q: "When will my payment be released to the seller?",
        a: "Payments are held securely and released to the seller once the order is marked as delivered and the return period has passed. This protects both buyers and sellers.",
      },
      {
        q: "Do you offer layaway or buy-now-pay-later?",
        a: "Not yet, but we're exploring options to make this available. Check back soon or follow us on social media for updates.",
      },
    ],
  },
  {
    name: "Account",
    items: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button at the top of the page. You can register using your email address and a password, or via Google or Facebook for faster sign-up.",
      },
      {
        q: "I forgot my password — what do I do?",
        a: "Click 'Forgot Password' on the login page. Enter your registered email, and we'll send you a link to reset your password. The link expires after 1 hour for security.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to your account settings and select 'Delete Account'. You'll be asked to confirm. Your data will be permanently deleted or anonymised within 30 days, except for records we are legally required to retain.",
      },
      {
        q: "How do I become a seller?",
        a: "Click 'Sell on Zuri Market' in the footer or navigation. Complete the application form and identity verification (KYC). Once approved, you can set up your store and start listing products.",
      },
    ],
  },
  {
    name: "Selling",
    items: [
      {
        q: "What does it cost to sell on Zuri Market?",
        a: "Creating a seller account and listing products is free. We charge a commission on each completed sale, which is clearly shown in your seller dashboard before you confirm an order. There are no hidden fees.",
      },
      {
        q: "How do I receive payouts?",
        a: "Payouts are sent to your registered M-Pesa or bank account once an order is confirmed as delivered and the return period has elapsed. You can track your earnings and payout history in your seller dashboard.",
      },
      {
        q: "Can I sell handmade or custom items?",
        a: "Absolutely. Many of our sellers offer handmade, custom, or made-to-order items. Just make sure to accurately describe the product and set realistic delivery expectations in your listing.",
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-muted-foreground">
          Everything you need to know about shopping and selling on Zuri Market.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category.name}>
            <h2 className="mb-4 text-xl font-semibold">{category.name}</h2>
            <Accordion type="single" collapsible className="w-full">
              {category.items.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </div>
  );
}
