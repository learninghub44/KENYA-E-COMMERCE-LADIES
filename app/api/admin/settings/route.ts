import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../middleware/auth-guard";
import type { AppRole } from "../../../../types/roles";

const DEFAULT_SETTINGS = {
  site_name: "Zuri Market",
  site_description: "Zuri Market is Kenya's multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products from verified sellers.",
  platform_fee_percent: 5,
  fixed_fee_per_order: 50,
  sender_name: "Zuri Market",
  sender_email: "noreply@zurimarket.dev",
  min_password_length: 8,
  max_login_attempts: 5,
  session_duration_hours: 24,
  maintenance_mode: false,
};

async function checkAdmin(supabase: ReturnType<typeof createSupabaseClient> extends Promise<infer T> ? T : never) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };

  return { user };
}

export async function GET() {
  const supabase = await createSupabaseClient();
  const admin = await checkAdmin(supabase);
  if ("error" in admin) return admin.error;

  const { data, error } = await supabase.from("platform_settings").select("*").limit(1).maybeSingle();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }

  if (!data) {
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }

  return NextResponse.json({
    settings: {
      site_name: data.site_name ?? DEFAULT_SETTINGS.site_name,
      site_description: data.site_description ?? DEFAULT_SETTINGS.site_description,
      platform_fee_percent: data.platform_fee_percent ?? DEFAULT_SETTINGS.platform_fee_percent,
      fixed_fee_per_order: data.fixed_fee_per_order ?? DEFAULT_SETTINGS.fixed_fee_per_order,
      sender_name: data.sender_name ?? DEFAULT_SETTINGS.sender_name,
      sender_email: data.sender_email ?? DEFAULT_SETTINGS.sender_email,
      min_password_length: data.min_password_length ?? DEFAULT_SETTINGS.min_password_length,
      max_login_attempts: data.max_login_attempts ?? DEFAULT_SETTINGS.max_login_attempts,
      session_duration_hours: data.session_duration_hours ?? DEFAULT_SETTINGS.session_duration_hours,
      maintenance_mode: data.maintenance_mode ?? DEFAULT_SETTINGS.maintenance_mode,
    },
  });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseClient();
  const admin = await checkAdmin(supabase);
  if ("error" in admin) return admin.error;

  const body = await request.json();

  const settingsRow = {
    site_name: body.site_name,
    site_description: body.site_description,
    platform_fee_percent: body.platform_fee_percent != null ? Number(body.platform_fee_percent) : undefined,
    fixed_fee_per_order: body.fixed_fee_per_order != null ? Number(body.fixed_fee_per_order) : undefined,
    sender_name: body.sender_name,
    sender_email: body.sender_email,
    min_password_length: body.min_password_length != null ? Number(body.min_password_length) : undefined,
    max_login_attempts: body.max_login_attempts != null ? Number(body.max_login_attempts) : undefined,
    session_duration_hours: body.session_duration_hours != null ? Number(body.session_duration_hours) : undefined,
    maintenance_mode: body.maintenance_mode,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from("platform_settings").select("id").limit(1).maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("platform_settings")
      .update(settingsRow)
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from("platform_settings")
      .insert({ ...settingsRow, id: crypto.randomUUID() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
