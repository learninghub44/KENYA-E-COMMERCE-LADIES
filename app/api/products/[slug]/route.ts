import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        "id, seller_id, category_id, name, slug, description, status, base_price_minor, compare_at_price_minor, currency, is_featured, published_at, created_at, sellers(id, store_name, slug, logo_url, created_at), categories(id, name, slug)"
      )
      .eq("slug", slug)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const seller = Array.isArray((product as any).sellers) ? (product as any).sellers[0] : (product as any).sellers;
    const category = Array.isArray((product as any).categories) ? (product as any).categories[0] : (product as any).categories;

    const [imagesRes, variantsRes, reviewsRes, sellerProductCountRes] = await Promise.all([
      supabase
        .from("product_images")
        .select("id, url, alt_text, sort_order, is_primary, variant_id")
        .eq("product_id", product.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_variants")
        .select("id, sku, title, price_minor, compare_at_price_minor, currency, options, is_active")
        .eq("product_id", product.id)
        .eq("is_active", true),
      supabase
        .from("product_reviews")
        .select("id, rating, title, body, created_at, buyer_id, profiles(display_name, avatar_url)")
        .eq("product_id", product.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", product.seller_id)
        .eq("status", "active")
        .is("deleted_at", null),
    ]);

    const images = (imagesRes.data ?? []).map((img) => img.url);
    const variants = (variantsRes.data ?? []).map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      priceMinor: v.price_minor,
      compareAtPriceMinor: v.compare_at_price_minor,
      currency: v.currency,
      options: (v.options ?? {}) as Record<string, string>,
    }));

    const colors = Array.from(new Set(variants.map((v) => v.options?.color).filter(Boolean))) as string[];
    const sizes = Array.from(new Set(variants.map((v) => v.options?.size).filter(Boolean))) as string[];

    const reviewRows = reviewsRes.data ?? [];
    const ratingCount = reviewRows.length;
    const ratingAvg =
      ratingCount > 0 ? reviewRows.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratingCount : 0;

    const reviews = reviewRows.map((r) => {
      const buyer = Array.isArray((r as any).profiles) ? (r as any).profiles[0] : (r as any).profiles;
      return {
        id: r.id,
        author: buyer?.display_name ?? "Verified Buyer",
        avatar: buyer?.avatar_url ?? "",
        rating: r.rating ?? 0,
        date: r.created_at,
        text: r.body ?? "",
      };
    });

    let relatedProducts: any[] = [];
    if (product.category_id) {
      const { data: related } = await supabase
        .from("products")
        .select("id, name, slug, base_price_minor, compare_at_price_minor, currency, sellers(store_name), product_images(url, is_primary, sort_order)")
        .eq("category_id", product.category_id)
        .eq("status", "active")
        .is("deleted_at", null)
        .neq("id", product.id)
        .limit(8);

      relatedProducts = (related ?? []).map((p: any) => {
        const rSeller = Array.isArray(p.sellers) ? p.sellers[0] : p.sellers;
        const sortedImages = [...(p.product_images ?? [])].sort((a, b) =>
          a.is_primary === b.is_primary ? a.sort_order - b.sort_order : a.is_primary ? -1 : 1
        );
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.base_price_minor / 100,
          comparePrice: p.compare_at_price_minor != null ? p.compare_at_price_minor / 100 : null,
          images: sortedImages.map((img: any) => img.url),
          rating: 0,
          reviewCount: 0,
          sellerName: rSeller?.store_name ?? "",
        };
      });
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: product.base_price_minor / 100,
      comparePrice: product.compare_at_price_minor != null ? product.compare_at_price_minor / 100 : null,
      currency: product.currency,
      images: images.length > 0 ? images : ["/placeholder.svg"],
      rating: Number(ratingAvg.toFixed(1)),
      reviewCount: ratingCount,
      discount:
        product.compare_at_price_minor && product.compare_at_price_minor > product.base_price_minor
          ? Math.round(
              ((product.compare_at_price_minor - product.base_price_minor) / product.compare_at_price_minor) * 100
            )
          : null,
      isNew: product.published_at
        ? Date.now() - new Date(product.published_at).getTime() < 1000 * 60 * 60 * 24 * 30
        : false,
      seller: {
        id: seller?.id ?? product.seller_id,
        name: seller?.store_name ?? "Seller",
        slug: seller?.slug ?? "",
        avatar: seller?.logo_url ?? "",
        rating: 0,
        productCount: sellerProductCountRes.count ?? 0,
        memberSince: seller?.created_at
          ? new Date(seller.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })
          : "",
      },
      variants: {
        colors,
        sizes,
        list: variants,
      },
      category: {
        name: category?.name ?? "",
        slug: category?.slug ?? "",
      },
      tags: [],
      reviews,
      relatedProducts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
