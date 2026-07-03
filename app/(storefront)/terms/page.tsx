import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Zuri Market.",
};

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      subtitle={`Last updated ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      <p className="rounded-md border bg-muted/50 p-4 text-sm">
        This page is a working draft and has not yet been reviewed by legal
        counsel. Treat it as a starting point rather than a binding final
        version.
      </p>

      <h2>The marketplace model</h2>
      <p>
        Zuri Market is a marketplace connecting independent sellers with
        shoppers. Sellers are responsible for their own product listings,
        pricing, fulfillment, and customer service. Zuri Market is not the
        seller of record for marketplace orders.
      </p>

      <h2>Accounts</h2>
      <p>
        You're responsible for keeping your account credentials secure and
        for activity that happens under your account. Sellers must complete
        identity verification before listing products.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don't use Zuri Market to list counterfeit, stolen, or illegal goods,
        to mislead buyers or sellers, or to attempt to circumvent platform
        fees or safety measures.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the platform evolves. Continued use of
        Zuri Market after changes take effect means you accept the updated
        terms.
      </p>
    </StaticPage>
  );
}
