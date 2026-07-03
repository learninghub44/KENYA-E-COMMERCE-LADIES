import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Why Zuri Market exists and who it's built for.",
};

export default function AboutPage() {
  return (
    <StaticPage
      title="Our Story"
      subtitle="Kenya's marketplace for women's fashion, beauty, wellness, and lifestyle."
    >
      <p>
        Zuri Market was built around a simple idea: Kenyan women running
        fashion, beauty, and wellness businesses deserve a marketplace made
        for them — not a generic storefront bolted onto a foreign platform.
      </p>
      <p>
        We bring together verified sellers from across Kenya so shoppers can
        discover clothing, accessories, beauty products, and lifestyle goods
        in one place, while sellers get the tools to list products, manage
        orders, and reach customers without building an online store from
        scratch.
      </p>
      <h2>What we stand for</h2>
      <ul>
        <li>Verified sellers, so shoppers can buy with confidence.</li>
        <li>Fair, transparent tools for sellers to grow their business.</li>
        <li>A platform built with Kenyan shoppers and sellers in mind first.</li>
      </ul>
      <p>
        We're early, and still building. If you're a seller interested in
        joining, or a shopper with feedback, we'd genuinely like to hear it.
      </p>
    </StaticPage>
  );
}
