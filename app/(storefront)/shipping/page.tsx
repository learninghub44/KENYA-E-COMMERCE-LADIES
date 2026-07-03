import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "How shipping and delivery works on Zuri Market.",
};

export default function ShippingPage() {
  return (
    <StaticPage
      title="Shipping & Delivery"
      subtitle="Zuri Market is a marketplace — each seller manages their own fulfillment and delivery."
    >
      <h2>How delivery works</h2>
      <p>
        Every order on Zuri Market is fulfilled directly by the seller
        you're buying from. That means delivery timelines, courier options,
        and shipping fees can vary from seller to seller and depend on your
        location within Kenya.
      </p>
      <h2>Tracking your order</h2>
      <p>
        Once a seller marks your order as shipped, you'll be able to see its
        status from your{" "}
        <a href="/orders" className="underline underline-offset-4">
          orders page
        </a>
        . If a delivery is taking longer than expected, message the seller
        directly — they have the most up-to-date information on your
        package.
      </p>
      <h2>Delivery areas</h2>
      <p>
        Most sellers currently ship within Kenya. Check an individual
        seller's store page for any specific delivery-area restrictions
        before you order.
      </p>
    </StaticPage>
  );
}
