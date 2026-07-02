"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { ImageIcon, ArrowLeft, Edit, Eye } from "lucide-react";

const mockProduct = {
  id: "1",
  name: "Premium Dashiki Dress",
  sku: "DR-001",
  price: 4500,
  stock: 25,
  status: "active" as const,
  category: "Fashion",
  description:
    "Beautiful handcrafted dashiki dress made from premium African wax print fabric. Perfect for casual and formal occasions.",
  images: [],
  variants: [
    { id: "v1", name: "Small", color: "Red", stock: 10 },
    { id: "v2", name: "Medium", color: "Blue", stock: 8 },
    { id: "v3", name: "Large", color: "Green", stock: 7 },
  ],
  sales: 42,
  revenue: 189000,
  rating: 4.5,
  createdAt: "2026-01-15",
};

export default function SellerProductDetailPage() {
  const params = useParams();
  const product = mockProduct;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              product.status === "active"
                ? "default"
                : product.status === "draft"
                  ? "secondary"
                  : "destructive"
            }
          >
            {product.status}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/products/${product.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/seller/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square w-full max-w-md rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Description</h2>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Variants</h2>
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{variant.name}</p>
                      <p className="text-xs text-muted-foreground">{variant.color}</p>
                    </div>
                    <p className="text-sm">Stock: {variant.stock}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span>KES {product.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span>{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{product.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Performance</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sales</span>
                  <span>{product.sales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue</span>
                  <span>KES {product.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span>{product.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{product.createdAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
