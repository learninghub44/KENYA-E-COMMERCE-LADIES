import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Press",
  description: "Media resources and press contact for Zuri Market.",
};

export default function PressPage() {
  return (
    <StaticPage title="Press" subtitle="Media inquiries and brand resources.">
      <p>
        Zuri Market is Kenya&apos;s marketplace for women&apos;s fashion,
        beauty, wellness, and lifestyle products, connecting shoppers with
        verified local sellers.
      </p>
      <p>
        For interviews, brand assets, or media inquiries, reach out through
        our{" "}
        <a href="/contact" className="underline underline-offset-4">
          contact page
        </a>{" "}
        and a member of the team will get back to you.
      </p>
    </StaticPage>
  );
}
