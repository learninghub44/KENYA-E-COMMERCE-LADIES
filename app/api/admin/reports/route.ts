import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../middleware/auth-guard";
import { createSupabaseAdminAuditWriter } from "../../../../lib/audit/supabase-admin-audit-writer";
import { createSupabaseReportRepository } from "../../../../lib/reports/supabase-repository";
import { createReportService } from "../../../../lib/reports/report-service";
import type { AppRole } from "../../../../types/roles";
import type { AdminActor } from "../../../../lib/audit/types";
import type { ReportSearchFilters, ReportStatus, ReportTargetType } from "../../../../lib/reports/types";

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

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const filters: ReportSearchFilters = {
    targetType: (searchParams.get("targetType") as ReportTargetType | null) ?? undefined,
    status: (searchParams.get("status") as ReportStatus | null) ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
  };

  const service = createReportService({
    reports: createSupabaseReportRepository(guard.supabase),
    audit: createSupabaseAdminAuditWriter(guard.supabase)
  });

  const result = await service.search(guard.actor, filters);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return NextResponse.json(result.data);
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const { reportId, action } = body as { reportId?: string; action?: string };
  if (!reportId || !action) {
    return NextResponse.json({ error: "reportId and action required" }, { status: 400 });
  }

  const service = createReportService({
    reports: createSupabaseReportRepository(guard.supabase),
    audit: createSupabaseAdminAuditWriter(guard.supabase)
  });

  switch (action) {
    case "assign": {
      const moderatorId = (body.moderatorId as string | undefined) ?? guard.actor.userId;
      const result = await service.assign(guard.actor, reportId, moderatorId);
      if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
      return NextResponse.json(result.data);
    }
    case "note": {
      const note = body.note as string | undefined;
      if (!note) return NextResponse.json({ error: "note required" }, { status: 400 });
      const result = await service.addNote(guard.actor, reportId, note);
      if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
      return NextResponse.json(result.data);
    }
    case "resolve": {
      const resolution = (body.resolution as string | undefined) ?? "Resolved by moderator";
      const result = await service.resolve(guard.actor, reportId, resolution);
      if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
      return NextResponse.json(result.data);
    }
    case "dismiss": {
      const result = await service.dismiss(guard.actor, reportId, (body.resolution as string | undefined) ?? "Dismissed by moderator");
      if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
      return NextResponse.json(result.data);
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
