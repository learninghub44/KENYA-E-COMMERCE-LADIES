import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Zuri Market",
  description:
    "Get in touch with Zuri Market. Find our Nairobi office address, phone, email, and business hours, or send us a message.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-muted-foreground">
          Have a question, feedback, or want to become a seller? We&apos;d love
          to hear from you.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Contact details */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Visit us</h2>
            <p className="text-muted-foreground">
              Zuri Market Ltd
              <br />
              4th Floor, Bishop Road Plaza
              <br />
              Bishop Road, Westlands
              <br />
              Nairobi, Kenya
            </p>
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold">Get in touch</h2>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">General:</span>{" "}
                hello@zurimarket.co.ke
              </li>
              <li>
                <span className="font-medium text-foreground">Support:</span>{" "}
                support@zurimarket.co.ke
              </li>
              <li>
                <span className="font-medium text-foreground">Sellers:</span>{" "}
                sellers@zurimarket.co.ke
              </li>
              <li>
                <span className="font-medium text-foreground">Press:</span>{" "}
                press@zurimarket.co.ke
              </li>
              <li>
                <span className="font-medium text-foreground">Phone:</span>{" "}
                +254 700 123 456
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold">Business hours</h2>
            <p className="text-muted-foreground">
              Monday – Friday: 8:00 AM – 6:00 PM (EAT)
              <br />
              Saturday: 9:00 AM – 2:00 PM (EAT)
              <br />
              Sunday & public holidays: Closed
            </p>
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold">Order support</h2>
            <p className="text-muted-foreground">
              For questions about a specific order, message the seller directly
              from your{" "}
              <a href="/orders" className="underline underline-offset-4">
                orders page
              </a>{" "}
              — they handle fulfilment and can respond fastest.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Send us a message</h2>
          <form
            action="mailto:hello@zurimarket.co.ke"
            method="post"
            encType="text/plain"
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a topic</option>
                <option value="order">Order issue</option>
                <option value="seller">Seller inquiry</option>
                <option value="feedback">Feedback</option>
                <option value="seller-application">Seller application</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Send message
            </button>
            <p className="text-xs text-muted-foreground">
              This form opens your default email client. Response times are
              typically within 24 hours on business days.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
