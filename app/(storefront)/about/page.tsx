import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";

export const metadata: Metadata = {
  title: "About Zuri Market — Our Story",
  description:
    "Zuri Market is Kenya's marketplace for African fashion, beauty, and lifestyle. Learn about our mission, values, and the team behind the platform.",
};

const stats = [
  { label: "Active Customers", value: "10,000+" },
  { label: "Verified Sellers", value: "500+" },
  { label: "Counties Served", value: "50+" },
  { label: "Products Listed", value: "25,000+" },
  { label: "Orders Delivered", value: "100,000+" },
  { label: "Seller Payouts (KSh)", value: "₦50M+" },
];

const values = [
  {
    title: "African First",
    description:
      "Every feature, every decision starts with the Kenyan woman. We build for local needs — M-Pesa, doorstep delivery, kikoi and kitenge alongside contemporary styles.",
  },
  {
    title: "Trust & Safety",
    description:
      "Every seller is verified through KYC. We moderate listings and handle disputes so you can shop with peace of mind.",
  },
  {
    title: "Seller Empowerment",
    description:
      "We give small businesses the tools — listings, orders, payments, messaging — to compete with big brands without building their own platform.",
  },
  {
    title: "Sustainability",
    description:
      "We encourage quality over fast fashion and help sellers reach local buyers, reducing the carbon footprint of cross-border shipping.",
  },
];

const team = [
  { name: "Wanjiku Njoroge", role: "CEO & Co-Founder", initials: "WN" },
  { name: "Amina Hassan", role: "CTO & Co-Founder", initials: "AH" },
  { name: "Kevin Ochieng", role: "Head of Operations", initials: "KO" },
  { name: "Fatima Abdi", role: "Head of Seller Success", initials: "FA" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-14 text-center">
        <Badge className="mb-4" variant="secondary">
          Since 2024
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Our Story
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Zuri Market was built for one reason: to give Kenyan women — shoppers
          and sellers alike — a fashion marketplace that actually works for them.
        </p>
      </div>

      {/* Brand Story */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold">Why Zuri Market exists</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            In 2023, our co-founders Wanjiku and Amina noticed something
            frustrating: talented Kenyan designers and boutiques had no dedicated
            online platform to reach local customers. They were scattered across
            Instagram DMs, WhatsApp groups, and expensive custom websites. Shoppers
            had no way to discover them in one place.
          </p>
          <p>
            So they built one. Zuri Market launched in early 2024 as a curated
            marketplace connecting Kenyan women with verified sellers of fashion,
            beauty, wellness, and lifestyle products — all from within Kenya.
          </p>
          <p>
            Today we serve thousands of customers across more than 50 counties,
            processing orders for everything from handmade Maasai jewellery to
            contemporary maxi dresses. Every order supports a local business.
          </p>
        </div>
      </section>

      <Separator className="mb-16" />

      {/* Stats */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Zuri Market by the numbers
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mb-16" />

      {/* Mission */}
      <section className="mb-16 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Our mission</h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          To make Zuri Market the most trusted place in Kenya to discover,
          buy, and sell African fashion and lifestyle products — empowering
          local entrepreneurs every step of the way.
        </p>
      </section>

      <Separator className="mb-16" />

      {/* Values */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          What we stand for
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {values.map((value) => (
            <Card key={value.title}>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mb-16" />

      {/* Team */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Meet the team
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <Card key={member.name}>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {member.initials}
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mb-16" />

      {/* CTA */}
      <section className="text-center">
        <h2 className="mb-4 text-2xl font-semibold">Want to be part of the story?</h2>
        <p className="mb-6 text-muted-foreground">
          Whether you&apos;re a shopper, a seller, or just curious — we&apos;d
          love to hear from you.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get in touch
          </Link>
          <Link
            href="/sellers"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sell on Zuri Market
          </Link>
        </div>
      </section>
    </div>
  );
}
