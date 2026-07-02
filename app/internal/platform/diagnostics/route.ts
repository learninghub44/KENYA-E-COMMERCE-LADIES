import { createDiagnosticsService } from "../../../../lib/platform/diagnostics";
import { authorizeRoute } from "../../../../middleware/auth-guard";

export async function GET() {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const diagnostics = createDiagnosticsService();
  const report = await diagnostics.generate();

  return Response.json(report);
}
