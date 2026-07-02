import { createCache } from "../../../../lib/platform/cache.js";
import { authorizeRoute } from "../../../../middleware/auth-guard.js";

export async function GET(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const cache = createCache();
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const namespace = url.searchParams.get("namespace") ?? undefined;

  if (!key) {
    return Response.json(cache.getMetrics());
  }

  const value = await cache.get(key, namespace);
  return Response.json({ key, value, found: value !== null });
}

export async function POST(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const cache = createCache();
  const body = await request.json() as { key: string; value: unknown; ttlSeconds?: number; namespace?: string };
  await cache.set(body.key, body.value, body.ttlSeconds, body.namespace);
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const cache = createCache();
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const namespace = url.searchParams.get("namespace") ?? undefined;

  if (key) {
    await cache.delete(key, namespace);
  } else {
    await cache.clear(namespace);
  }

  return Response.json({ ok: true });
}
