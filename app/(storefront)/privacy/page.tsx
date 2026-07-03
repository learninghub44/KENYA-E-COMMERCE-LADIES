import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Zuri Market collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      subtitle={`Last updated ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      <p className="rounded-md border bg-muted/50 p-4 text-sm">
        This page is a working draft outlining our general approach to
        privacy. It has not yet been reviewed by legal counsel and should be
        treated as a starting point, not a final compliance document —
        particularly given identity verification data is collected during
        seller onboarding.
      </p>

      <h2>What we collect</h2>
      <p>
        Account details (name, email, phone), order and shipping
        information, and — for sellers — identity verification information
        collected during onboarding to help keep the marketplace safe.
      </p>

      <h2>How we use it</h2>
      <p>
        To operate your account, process orders, connect buyers and sellers
        through in-app messaging, and communicate important updates about
        your orders or account.
      </p>

      <h2>Sharing</h2>
      <p>
        We share order details with the relevant seller so they can fulfill
        your order, and use trusted service providers (such as hosting,
        image storage, and identity verification providers) to operate the
        platform. We do not sell personal data to third parties.
      </p>

      <h2>Your rights</h2>
      <p>
        Under Kenya's Data Protection Act, 2019, you have rights to access,
        correct, and request deletion of your personal data. Contact us
        through our{" "}
        <a href="/contact" className="underline underline-offset-4">
          contact page
        </a>{" "}
        to make a request.
      </p>
    </StaticPage>
  );
}
