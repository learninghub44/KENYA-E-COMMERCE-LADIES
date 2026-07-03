import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Zuri Market uses cookies.",
};

export default function CookiesPage() {
  return (
    <StaticPage
      title="Cookie Policy"
      subtitle={`Last updated ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      <h2>What we use cookies for</h2>
      <p>
        Zuri Market uses cookies to keep you signed in, remember your
        preferences (like light/dark theme), and keep the platform secure.
        We don't currently use third-party advertising or tracking cookies.
      </p>
      <h2>Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies through their
        settings. Blocking essential cookies may prevent you from staying
        signed in or completing checkout.
      </p>
    </StaticPage>
  );
}
