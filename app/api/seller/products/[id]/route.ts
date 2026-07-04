import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../../lib/seller/supabase-seller-repository";

async function assertOwnership(supabase: any, productId: string, userId: string) {
  const sellerRepo = createSupabaseSellerRepository(supabase as any);
  const seller = await sellerRepo.findByOwnerId(userId);
  if (!seller) return { error: "Seller profile not found", status: 404 };

  const { data: product } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", productId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!product) return { error: "Product not found", status: 404 };
  if (product.seller_id !== seller.id) return { error: "Forbidden", status: 403 };

  return { seller, product };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownership = await assertOwnership(supabase, id, user.id);
    if ("error" in ownership) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("*, product_images(*), product_variants(*), inventory_items(*)")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownership = await assertOwnership(supabase, id, user.id);
    if ("error" in ownership) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      brandId,
      basePriceMinor,
      compareAtPriceMinor,
      variants,
      images,
      stockQuantity,
      lowStockThreshold,
      seoTitle,
      seoDescription,
    } = body;

    const updateValues: Record<string, unknown> = {};
    if (name !== undefined) {
      updateValues.name = name.trim();
      let slug = name.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
      let attempt = 0;
      while (true) {
        const testSlug = attempt === 0 ? slug : `${slug}-${attempt}`;
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("seller_id", ownership.seller!.id)
          .eq("slug", testSlug)
          .neq("id", id)
          .maybeSingle();
        if (!existing) {
          updateValues.slug = testSlug;
          break;
        }
        attempt += 1;
        if (attempt > 50) break;
      }
    }
    if (description !== undefined) updateValues.description = description;
    if (categoryId !== undefined) updateValues.category_id = categoryId;
    if (brandId !== undefined) updateValues.brand_id = brandId;
    if (basePriceMinor !== undefined) updateValues.base_price_minor = basePriceMinor;
    if (compareAtPriceMinor !== undefined) updateValues.compare_at_price_minor = compareAtPriceMinor;
    if (seoTitle !== undefined || seoDescription !== undefined) {
      const { data: current } = await supabase
        .from("products")
        .select("metadata")
        .eq("id", id)
        .single();
      updateValues.metadata = {
        ...(current?.metadata || {}),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
      };
    }

    if (Object.keys(updateValues).length > 0) {
      updateValues.updated_at = new Date().toISOString();
      const { error } = await supabase.from("products").update(updateValues).eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          await supabase.from("product_variants").update({
            title: v.title,
            price_minor: v.priceMinor,
            compare_at_price_minor: v.compareAtPriceMinor,
            options: v.options,
            is_active: v.isActive !== false,
          }).eq("id", v.id);
        } else {
          await supabase.from("product_variants").insert({
            product_id: id,
            sku: v.sku || `${updateValues.slug || "product"}-v`,
            title: v.title || null,
            price_minor: v.priceMinor || basePriceMinor || 0,
            compare_at_price_minor: v.compareAtPriceMinor || null,
            currency: "KES",
            options: v.options || null,
            is_active: v.isActive !== false,
          });
        }
      }
    }

    if (images && Array.isArray(images)) {
      await supabase.from("product_images").delete().eq("product_id", id);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await supabase.from("product_images").insert({
          product_id: id,
          url: img.url,
          alt_text: img.altText || null,
          sort_order: img.sortOrder ?? i,
          is_primary: img.isPrimary ?? i === 0,
          variant_id: img.variantId || null,
        });
      }
    }

    if (stockQuantity !== undefined || lowStockThreshold !== undefined) {
      const inventoryUpdate: Record<string, unknown> = {};
      if (stockQuantity !== undefined) inventoryUpdate.quantity_available = stockQuantity;
      if (lowStockThreshold !== undefined) inventoryUpdate.low_stock_threshold = lowStockThreshold;
      await supabase
        .from("inventory_items")
        .update(inventoryUpdate)
        .eq("product_id", id)
        .is("variant_id", null);
    }

    const { data: product } = await supabase
      .from("products")
      .select("*, product_images(*), product_variants(*), inventory_items(*)")
      .eq("id", id)
      .single();

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownership = await assertOwnership(supabase, id, user.id);
    if ("error" in ownership) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    const { error } = await supabase
      .from("products")
      .update({
        deleted_at: new Date().toISOString(),
        status: "archived",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
