import { authorizeRoute } from "../../../../middleware/auth-guard";

interface SupabaseResult {
  data: unknown;
  error: unknown;
}

interface EqChain extends Promise<SupabaseResult> {
  single: () => Promise<SupabaseResult>;
  eq: (col: string, val: unknown) => EqChain;
}

interface SelectChain extends Promise<SupabaseResult> {
  eq: (col: string, val: unknown) => EqChain;
  order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<SupabaseResult> };
}

function createClient() {
  return {
    from: (_table: string) => ({
      select: (_columns: string) => ({
        eq: (_col: string, _val: unknown) => ({
          single: async () => ({ data: null, error: null }),
          order: (_col2: string, _opts: { ascending: boolean }) => ({
            limit: async (_n: number) => ({ data: [], error: null }),
          }),
        }),
        order: (_col: string, _opts: { ascending: boolean }) => ({
          limit: async (_n: number) => ({ data: [], error: null }),
        }),
      }) as SelectChain,
      insert: (values: Record<string, unknown>) => ({
        select: async () => ({ data: [values], error: null }),
      }),
      update: (values: Record<string, unknown>) => ({
        eq: (_col: string, _val: unknown) => ({
          select: async () => ({ data: [values], error: null }),
        }),
      }),
    }),
    rpc: async (_name: string, _params?: Record<string, unknown>) => ({ data: null, error: null }),
  };
}

export async function GET() {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const active = await createClient().rpc("platform_get_active_maintenance");
  return Response.json({ active: active.data ?? null });
}

export async function POST(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const body = await request.json() as { action: string; type?: string; message?: string };

  if (body.action === "enable") {
    const { data } = await createClient().from("platform_maintenance_windows").insert({
      maintenance_type: body.type ?? "global",
      is_active: true,
      message: body.message ?? null,
      started_at: new Date().toISOString(),
    }).select();
    return Response.json({ ok: true, window: (data as Record<string, unknown>[])?.[0] ?? null });
  }

  if (body.action === "disable") {
    const { data: active } = await createClient().from("platform_maintenance_windows").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1);
    const rows = active as Record<string, unknown>[] ?? [];
    if (rows.length > 0) {
      await createClient().from("platform_maintenance_windows").update({
        is_active: false, ended_at: new Date().toISOString(),
      }).eq("id", rows[0]?.id);
    }
    return Response.json({ ok: true });
  }

  return Response.json({ error: "invalid_action" }, { status: 400 });
}
