import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { authorizeRoute } from "../../../../middleware/auth-guard";
import type { AppRole } from "../../../../types/roles";

async function requireSuperAdmin() {
  const supabase = await createSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized", status: 401 as const };

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("super_admin")) return { error: "Only super admins can create admin users", status: 403 as const };

  return { user };
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { email, password, displayName, role } = body as {
      email: string;
      password: string;
      displayName?: string;
      role?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const validRoles = ["admin", "moderator", "kyc_reviewer", "support"];
    const assignedRole = validRoles.includes(role ?? "") ? role! : "admin";

    const admin = createSupabaseAdminClient();

    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: displayName ?? email.split("@")[0] },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: newUser.user.id,
      email,
      display_name: displayName ?? email.split("@")[0],
      status: "active",
    });

    if (profileError) {
      return NextResponse.json({ error: `Profile creation failed: ${profileError.message}` }, { status: 500 });
    }

    const { error: roleError } = await admin.from("user_roles").insert({
      user_id: newUser.user.id,
      role: assignedRole,
      granted_by: auth.user.id,
    });

    if (roleError) {
      return NextResponse.json({ error: `Role assignment failed: ${roleError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.user.id, email, role: assignedRole },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "userId and action required" }, { status: 400 });
  }

  switch (action) {
    case "suspend": {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "ban": {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "deleted" })
        .eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "unsuspend": {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "promote-seller": {
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "seller", granted_by: user.id }, { onConflict: "user_id, role" });
      if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "make-admin": {
      if (!roles.includes("super_admin")) {
        return NextResponse.json({ error: "Only super admins can promote users to admin" }, { status: 403 });
      }
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin", granted_by: user.id }, { onConflict: "user_id, role" });
      if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
