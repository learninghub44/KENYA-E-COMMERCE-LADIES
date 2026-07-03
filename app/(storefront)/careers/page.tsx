import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles and how to reach the Zuri Market team.",
};

export default function CareersPage() {
  return (
    <StaticPage
      title="Careers at Zuri Market"
      subtitle="We're a small team building Kenya's marketplace for women's fashion, beauty, and lifestyle."
    >
      <p>
        We don&apos;t have open roles listed right now, but we&apos;re
        growing and always interested in hearing from people who care about
        e-commerce, marketplaces, or building for Kenyan sellers and
        shoppers.
      </p>
      <p>
        If that&apos;s you, get in touch through our{" "}
        <a href="/contact" className="underline underline-offset-4">
          contact page
        </a>{" "}
        and tell us what you&apos;d want to work on.
      </p>
    </StaticPage>
  );
}
