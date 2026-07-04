import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../../middleware/auth-guard";
import { createSupabaseAdminAuditWriter } from "../../../../../lib/audit/supabase-admin-audit-writer";
import { createSupabaseModerationRepository, createSupabaseMessageModerationGateway } from "../../../../../lib/moderation/supabase-repository";
import { createModerationService } from "../../../../../lib/moderation/moderation-service";
import type { AppRole } from "../../../../../types/roles";
import type { AdminActor } from "../../../../../lib/audit/types";

async function requireAdmin(): Promise<
  | { ok: true; actor: AdminActor; supabase: Awaited<ReturnType<typeof createSupabaseClient>> }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles, permissions: "admin.moderate" });
  if (!auth.allowed) return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };

  return { ok: true, actor: { userId: user.id, roles }, supabase };
}

function buildService(supabase: Awaited<ReturnType<typeof createSupabaseClient>>) {
  return createModerationService({
    moderation: createSupabaseModerationRepository(supabase),
    messages: createSupabaseMessageModerationGateway(supabase),
    audit: createSupabaseAdminAuditWriter(supabase)
  });
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const service = buildService(guard.supabase);
  const result = await service.reportedMessages(guard.actor, {
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
  });

  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return NextResponse.json(result.data);
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const { action, reason } = body as { action?: string; reason?: string };
  if (!action) return NextResponse.json({ error: "action required" }, { status: 400 });

  const service = buildService(guard.supabase);

  switch (action) {
    case "delete_message": {
      const messageId = body.messageId as string | undefined;
      if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });
      const result = await service.deleteMessage(guard.actor, messageId, reason ?? "Removed by moderator");
      if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
      return NextResponse.json(result.data);
    }
    case "warn_user": {
      const userId = body.userId as string | undefined;
      if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      const result = await service.warnUser(guard.actor, userId, reason ?? "Warned by moderator");
      if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
      return NextResponse.json(result.data);
    }
    case "suspend_messaging": {
      const userId = body.userId as string | undefined;
      if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      const result = await service.suspendMessaging(guard.actor, userId, reason ?? "Suspended by moderator");
      if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
      return NextResponse.json(result.data);
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
