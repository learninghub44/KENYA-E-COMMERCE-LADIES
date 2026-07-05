"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  fashion: "from-pink-500 to-rose-500",
  beauty: "from-purple-500 to-violet-500",
  skincare: "from-green-400 to-emerald-500",
  accessories: "from-amber-400 to-orange-500",
  wellness: "from-sky-400 to-blue-500",
  lifestyle: "from-teal-400 to-cyan-500",
  electronics: "from-blue-500 to-indigo-500",
  home: "from-orange-400 to-red-500",
};

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/storefront/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <p className="mt-2 text-muted-foreground">Browse our curated collections</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No collections available yet.</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">Browse all products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="group relative overflow-hidden rounded-xl">
              {cat.image_url ? (
                <Image src={cat.image_url} alt={cat.name} width={600} height={400} className="h-64 w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className={`flex h-64 items-center justify-center bg-gradient-to-br ${CATEGORY_COLORS[cat.slug] ?? "from-gray-400 to-gray-600"}`}>
                  <span className="text-4xl font-bold text-white/80">{cat.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                {cat.description && <p className="mt-1 text-sm text-white/80">{cat.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
