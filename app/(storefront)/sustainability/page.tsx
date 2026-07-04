import type { Metadata } from "next";
import { Leaf, Recycle, Users, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "How Zuri Market supports responsible sourcing, local sellers, and lower-waste packaging across Kenya.",
};

const commitments = [
  {
    icon: Users,
    title: "Backing local sellers",
    body: "Every seller on Zuri Market is a verified Kenyan business or maker. Buying here keeps more value inside local supply chains instead of flowing to large offshore retailers.",
  },
  {
    icon: Package,
    title: "Lower-waste packaging",
    body: "We encourage sellers to use minimal, recyclable, or reused packaging materials, and to right-size boxes and mailers to cut down on unnecessary waste per order.",
  },
  {
    icon: Recycle,
    title: "Made to last",
    body: "Our seller guidelines favor durable, well-made goods over disposable fast-fashion items, and our review system helps surface products that actually hold up.",
  },
  {
    icon: Leaf,
    title: "Ongoing improvement",
    body: "Sustainability on a growing marketplace is a work in progress. We're building tools to help sellers report material sourcing and will publish clearer standards as they roll out.",
  },
];

export default function SustainabilityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Sustainability at Zuri Market
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          We believe a marketplace built on Kenyan makers and sellers should also
          be built with care for the communities and environment it serves.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {commitments.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-lg border p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mb-2 text-lg font-semibold">{item.title}</h2>
              <p className="text-sm text-muted-foreground">{item.body}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        Questions about sourcing or packaging for a specific seller? Reach out
        through their store page directly.
      </p>
    </div>
  );
}
