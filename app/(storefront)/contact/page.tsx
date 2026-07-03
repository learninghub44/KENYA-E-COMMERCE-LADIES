import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Zuri Market team.",
};

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact Us"
      subtitle="Have a question about an order, a seller, or the platform?"
    >
      <p>
        For questions about a specific order, the fastest way to get help is
        through the seller directly — open the order from your{" "}
        <a href="/orders" className="underline underline-offset-4">
          orders page
        </a>{" "}
        and use{" "}
        <a href="/messages" className="underline underline-offset-4">
          messages
        </a>{" "}
        to reach them.
      </p>
      <p>
        For everything else — platform issues, seller applications, or
        general feedback — a dedicated support email/contact form is coming
        soon. In the meantime, reach out through our social channels linked
        in the footer.
      </p>
    </StaticPage>
  );
}
