import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseKycRepository } from "../../../../lib/kyc/supabase-kyc-repository";
import { normalizeRoles } from "../../../../lib/permissions/index";
import { assertPermission } from "../../../../lib/permissions/index";
import type { KycStatus } from "../../../../lib/seller/types";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createSupabaseClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roles = normalizeRoles(roleRows?.map((r: { role: string }) => r.role) ?? []);
  try {
    assertPermission(roles, "admin.access");
  } catch {
    return { error: "Forbidden", status: 403 as const };
  }

  return { user, roles };
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseClient();
    const auth = await requireAdmin(supabase);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? undefined;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

    let query = supabase
      .from("seller_kyc_verifications")
      .select("*, seller:sellers(*)")
      .order("submitted_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch KYC verifications" }, { status: 500 });
    }

    return NextResponse.json({ data, count, offset, limit });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseClient();
    const auth = await requireAdmin(supabase);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { verificationId, status, rejectionReason } = body as {
      verificationId: string;
      status: Exclude<KycStatus, "not_started">;
      rejectionReason?: string;
    };

    if (!verificationId || !status) {
      return NextResponse.json({ error: "verificationId and status are required" }, { status: 400 });
    }

    if (!["approved", "rejected", "manual_review", "pending", "expired"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const repository = createSupabaseKycRepository(supabase);

    const updated = await repository.updateVerification({
      id: verificationId,
      status,
      rejectionReason: rejectionReason ?? null,
    });

    await repository.updateSellerKycStatus({
      sellerId: updated.sellerId,
      status,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
