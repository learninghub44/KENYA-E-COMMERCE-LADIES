import { authorizeRoute } from "../../../../middleware/auth-guard.js";

interface StorageDbClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (col: string, val: unknown) => {
        single: () => Promise<{ data: unknown; error: unknown }>;
      };
      order: (col: string, opts: { ascending: boolean }) => {
        limit: (n: number) => Promise<{ data: unknown; error: unknown }>;
      };
    };
  };
}

async function getFile(client: StorageDbClient, fileId: string) {
  const { data, error } = await client
    .from("platform_files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (error) return null;
  return data;
}

async function getMetrics(client: StorageDbClient) {
  const { data, error } = await client
    .from("platform_storage_metrics")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(10);

  if (error) return [];
  return data;
}

export async function GET(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const url = new URL(request.url);
  const fileId = url.searchParams.get("fileId");

  const client: StorageDbClient = {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (col: string, val: unknown) => ({
          single: async () => ({ data: null, error: null }),
          order: (_col: string, _opts: { ascending: boolean }) => ({
            limit: async (_n: number) => ({ data: [], error: null }),
          }),
        }),
        order: (_col: string, _opts: { ascending: boolean }) => ({
          limit: async (_n: number) => ({ data: [], error: null }),
        }),
      }),
    }),
  };

  if (fileId) {
    const file = await getFile(client, fileId);
    return Response.json(file ?? { error: "not_found" }, { status: file ? 200 : 404 });
  }

  const metrics = await getMetrics(client);
  return Response.json({ metrics });
}
