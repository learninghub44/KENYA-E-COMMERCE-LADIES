import { createHealthService, createDatabaseHealthCheck, createStorageHealthCheck, createCacheHealthCheck, createQueueHealthCheck } from "../../../../lib/platform/health.js";
import { authorizeRoute } from "../../../../middleware/auth-guard.js";

export async function GET() {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const health = createHealthService();

  health.registerCheck(createDatabaseHealthCheck(async () => true));
  health.registerCheck(createStorageHealthCheck(async () => true));
  health.registerCheck(createCacheHealthCheck(async () => true));
  health.registerCheck(createQueueHealthCheck(async () => true));

  const report = await health.runAll();
  const status = report.overall === "healthy" ? 200 : report.overall === "warning" ? 200 : 503;

  return Response.json(report, { status });
}
