"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "../../../components/shared/product-card";
import { Loader2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  rating_avg: number | null;
  review_count: number | null;
  is_new: boolean | null;
  images: { url: string; alt_text: string | null }[];
  seller: { store_name: string; slug: string }[];
  category: { name: string; slug: string }[];
};

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/storefront/products/best-sellers")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Best Sellers</h1>
        <p className="mt-2 text-muted-foreground">Our most popular products</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No best sellers yet.</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">Browse all products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={{
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              comparePrice: p.compare_price,
              images: p.images?.map((i) => i.url) ?? [],
              rating: p.rating_avg ?? 0,
              reviewCount: p.review_count ?? 0,
              isNew: p.is_new ?? false,
              sellerName: p.seller?.[0]?.store_name ?? "",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
