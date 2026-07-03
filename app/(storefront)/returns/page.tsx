import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "General returns and exchanges policy for Zuri Market.",
};

export default function ReturnsPage() {
  return (
    <StaticPage
      title="Returns & Exchanges"
      subtitle="Since every order is fulfilled by an independent seller, returns are handled seller-by-seller."
    >
      <h2>General policy</h2>
      <p>
        If an item arrives damaged, significantly different from its
        listing, or not as described, message the seller directly from your{" "}
        <a href="/orders" className="underline underline-offset-4">
          order page
        </a>{" "}
        as soon as possible with photos of the issue. Most sellers will
        offer a replacement, exchange, or refund for genuine issues.
      </p>
      <h2>Before you order</h2>
      <p>
        Check the specific seller's store page for any return window or
        conditions they've listed — these can vary by seller and by product
        type (for example, some beauty and wellness items may not be
        returnable once opened, for hygiene reasons).
      </p>
      <h2>If you can't reach a resolution</h2>
      <p>
        If a seller is unresponsive or you can't reach a fair resolution
        directly, reach out through our{" "}
        <a href="/contact" className="underline underline-offset-4">
          contact page
        </a>{" "}
        and we'll help mediate.
      </p>
    </StaticPage>
  );
}
