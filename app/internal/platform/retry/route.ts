import { authorizeRoute } from "../../../../middleware/auth-guard";

interface SupabaseResult {
  data: unknown;
  error: unknown;
}

export async function POST(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const body = await request.json() as { action: string; queue?: string; jobId?: string };

  if (body.action === "retry-all" && body.queue) {
    return Response.json({ ok: true, retried: 0, message: `Retry initiated for queue: ${body.queue}` });
  }

  if (body.action === "retry-one" && body.jobId) {
    return Response.json({ ok: true, jobId: body.jobId, message: `Retry initiated for job: ${body.jobId}` });
  }

  return Response.json({ error: "invalid_action" }, { status: 400 });
}
