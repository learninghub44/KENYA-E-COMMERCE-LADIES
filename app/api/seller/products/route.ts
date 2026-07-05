import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../lib/seller/supabase-seller-repository";
import { slugifyProductName } from "../../../../lib/products/schemas";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerRepo = createSupabaseSellerRepository(supabase as any);
    const seller = await sellerRepo.findByOwnerId(user.id);
    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const offset = (page - 1) * limit;

    let query = supabase
      .from("products")
      .select("*, product_images(*), product_variants(*), inventory_items(*)", { count: "exact" })
      .eq("seller_id", seller.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    if (status) {
      const statusMap: Record<string, string> = {
        Active: "active",
        Draft: "draft",
        Archived: "archived",
        "Pending Review": "pending_review",
        Rejected: "rejected",
      };
      const storedStatus = statusMap[status] || status;
      query = query.eq("status", storedStatus);
    }

    const { data: products, count, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json({
      products: products || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerRepo = createSupabaseSellerRepository(supabase as any);
    const seller = await sellerRepo.findByOwnerId(user.id);
    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      brandId,
      basePriceMinor,
      compareAtPriceMinor,
      sku,
      stockQuantity,
      lowStockThreshold,
      variants,
      images,
      seoTitle,
      seoDescription,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (typeof basePriceMinor !== "number" || basePriceMinor < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    let slug = slugifyProductName(name);
    let attempt = 0;
    while (true) {
      const testSlug = attempt === 0 ? slug : `${slug}-${attempt}`;
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("seller_id", seller.id)
        .eq("slug", testSlug)
        .maybeSingle();
      if (!existing) {
        slug = testSlug;
        break;
      }
      attempt += 1;
      if (attempt > 50) {
        return NextResponse.json({ error: "Could not generate unique slug" }, { status: 409 });
      }
    }

    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        seller_id: seller.id,
        category_id: categoryId || null,
        brand_id: brandId || null,
        name: name.trim(),
        slug,
        description: description || null,
        status: "draft",
        base_price_minor: basePriceMinor,
        compare_at_price_minor: compareAtPriceMinor || null,
        currency: "KES",
        is_featured: false,
        metadata: {
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
        },
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await supabase.from("product_variants").insert({
          product_id: product.id,
          sku: v.sku || `${sku || slug}-${v.title || "v"}`,
          title: v.title || null,
          price_minor: v.priceMinor || basePriceMinor,
          compare_at_price_minor: v.compareAtPriceMinor || null,
          currency: "KES",
          options: v.options || null,
          is_active: v.isActive !== false,
        });
      }
    }

    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await supabase.from("product_images").insert({
          product_id: product.id,
          url: img.url,
          alt_text: img.altText || null,
          sort_order: img.sortOrder ?? i,
          is_primary: img.isPrimary ?? i === 0,
          variant_id: img.variantId || null,
        });
      }
    }

    await supabase.from("inventory_items").insert({
      product_id: product.id,
      variant_id: null,
      quantity_available: stockQuantity || 0,
      quantity_reserved: 0,
      low_stock_threshold: lowStockThreshold || 10,
      track_inventory: true,
    });

    const { data: fullProduct } = await supabase
      .from("products")
      .select("*, product_images(*), product_variants(*), inventory_items(*)")
      .eq("id", product.id)
      .single();

    return NextResponse.json(fullProduct || product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
