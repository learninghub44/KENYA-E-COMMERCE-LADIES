import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Blog",
  description: "Style guides, seller stories, and updates from Zuri Market.",
};

export default function BlogPage() {
  return (
    <StaticPage
      title="Zuri Market Blog"
      subtitle="Style guides, seller spotlights, and platform updates."
    >
      <p>
        We&apos;re just getting the blog started. Soon you&apos;ll find
        styling tips, spotlights on Kenyan sellers building their businesses
        on Zuri Market, and updates on new features.
      </p>
      <p>
        Check back soon, or follow us on social for updates in the meantime.
      </p>
    </StaticPage>
  );
}
