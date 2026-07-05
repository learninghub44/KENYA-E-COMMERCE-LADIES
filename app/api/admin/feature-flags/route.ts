import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../middleware/auth-guard";
import type { AppRole } from "../../../../types/roles";

async function requireAdmin() {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, roles: [] as AppRole[], auth: { allowed: false as const, status: 401 as const, code: "SESSION_REQUIRED" as const } };
  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  return { supabase, user, roles, auth };
}

export async function GET() {
  const { supabase, auth } = await requireAdmin();
  if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  try {
    const { data, error } = await supabase
      .from("platform_config")
      .select("config_key, config_value, description")
      .eq("is_feature_flag", true)
      .order("config_key");

    if (error) throw error;

    const flags = (data ?? []).map((row) => ({
      id: row.config_key,
      key: row.config_key,
      description: row.description ?? "",
      enabled: row.config_value === true || row.config_value === "true",
      defaultValue: false,
      rolloutPercentage: 0,
    }));

    return NextResponse.json({ flags });
  } catch {
    return NextResponse.json({ flags: [] });
  }
}

export async function POST(request: Request) {
  const { supabase, auth } = await requireAdmin();
  if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const body = await request.json();
  const { key, description, enabled, defaultValue } = body;

  if (!key) {
    return NextResponse.json({ error: "Flag key is required" }, { status: 400 });
  }

  try {
    const { error } = await supabase.from("platform_config").upsert({
      config_key: key,
      config_value: enabled ?? false,
      config_type: "boolean",
      description: description ?? null,
      is_feature_flag: true,
      is_encrypted: false,
    });

    if (error) throw error;

    return NextResponse.json({
      flag: {
        id: key,
        key,
        description: description ?? "",
        enabled: enabled ?? false,
        defaultValue: defaultValue ?? false,
        rolloutPercentage: 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save flag" },
      { status: 500 },
    );
  }
}
