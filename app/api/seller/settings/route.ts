import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../lib/seller/supabase-seller-repository";

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerRepo = createSupabaseSellerRepository(supabase as any);
    const seller = await sellerRepo.findByOwnerId(user.id);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const metadata = seller.metadata ?? {};

    return NextResponse.json({
      storeName: seller.storeName,
      slug: seller.slug,
      description: seller.description ?? "",
      supportEmail: seller.supportEmail ?? "",
      supportPhone: seller.supportPhone ?? "",
      logoUrl: seller.logoUrl ?? "",
      bannerUrl: seller.bannerUrl ?? "",
      storeHours: (metadata as any).storeHours ?? {
        Monday: "09:00 - 18:00",
        Tuesday: "09:00 - 18:00",
        Wednesday: "09:00 - 18:00",
        Thursday: "09:00 - 18:00",
        Friday: "09:00 - 18:00",
        Saturday: "09:00 - 14:00",
        Sunday: "Closed",
      },
      notifications: (metadata as any).notifications ?? {
        "new-order": true,
        "order-shipped": true,
        "order-delivered": true,
        "new-review": true,
        "new-message": true,
        "low-stock": true,
        "payment-confirmed": false,
        "kyc-update": true,
      },
      mpesaNumber: (metadata as any).mpesaNumber ?? "",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerRepo = createSupabaseSellerRepository(supabase as any);
    const seller = await sellerRepo.findByOwnerId(user.id);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const metadataUpdates: Record<string, unknown> = { ...(seller.metadata as Record<string, unknown>) };

    if (body.storeName !== undefined) updates.storeName = body.storeName;
    if (body.description !== undefined) updates.description = body.description;
    if (body.supportEmail !== undefined) updates.supportEmail = body.supportEmail;
    if (body.supportPhone !== undefined) updates.supportPhone = body.supportPhone;
    if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;
    if (body.bannerUrl !== undefined) updates.bannerUrl = body.bannerUrl;
    if (body.storeHours !== undefined) metadataUpdates.storeHours = body.storeHours;
    if (body.notifications !== undefined) metadataUpdates.notifications = body.notifications;
    if (body.mpesaNumber !== undefined) metadataUpdates.mpesaNumber = body.mpesaNumber;

    updates.metadata = metadataUpdates;

    const updated = await sellerRepo.updateSeller({
      sellerId: seller.id,
      values: updates as any,
    });

    return NextResponse.json({
      storeName: updated.storeName,
      slug: updated.slug,
      description: updated.description ?? "",
      supportEmail: updated.supportEmail ?? "",
      supportPhone: updated.supportPhone ?? "",
      logoUrl: updated.logoUrl ?? "",
      bannerUrl: updated.bannerUrl ?? "",
      storeHours: (updated.metadata as any)?.storeHours ?? {},
      notifications: (updated.metadata as any)?.notifications ?? {},
      mpesaNumber: (updated.metadata as any)?.mpesaNumber ?? "",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
