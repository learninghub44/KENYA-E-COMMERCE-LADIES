import { createReadinessService, createEnvReadinessCheck, createConnectivityReadinessCheck } from "../../../../lib/platform/readiness.js";
import { authorizeRoute } from "../../../../middleware/auth-guard.js";

export async function GET() {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const readiness = createReadinessService();

  readiness.addCheck(createEnvReadinessCheck());
  readiness.addCheck(createConnectivityReadinessCheck("database", async () => true, true));
  readiness.addCheck(createConnectivityReadinessCheck("cache", async () => true, false));
  readiness.addCheck(createConnectivityReadinessCheck("storage", async () => true, false));

  const report = await readiness.runAll();
  return Response.json(report, { status: report.ready ? 200 : 503 });
}
