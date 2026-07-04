import { createConfigService } from "../../../../lib/platform/config";
import { createFeatureFlagService } from "../../../../lib/platform/feature-flags";
import { authorizeRoute } from "../../../../middleware/auth-guard";

export async function GET(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const configService = createConfigService();
  const ff = createFeatureFlagService({ configService });

  const url = new URL(request.url);
  const flagKey = url.searchParams.get("flag");

  if (flagKey) {
    const evaluation = await ff.evaluate(flagKey, {
      userId: url.searchParams.get("userId") ?? undefined,
      role: url.searchParams.get("role") ?? undefined,
      country: url.searchParams.get("country") ?? undefined,
    });
    return Response.json(evaluation);
  }

  const flags = await ff.listFlags();
  const dbFlags = await configService.getFeatureFlags();
  const results: Record<string, unknown>[] = flags.map((flag) => ({
    key: flag.key,
    enabled: dbFlags[`feature.${flag.key}`] ?? flag.defaultValue,
    defaultValue: flag.defaultValue,
    description: flag.description,
  }));

  return Response.json({ flags: results });
}

export async function POST(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const body = await request.json() as { flag: string; enabled: boolean };
  const configService = createConfigService();
  await configService.set({
    configKey: `feature.${body.flag}`,
    configValue: body.enabled,
    configType: "boolean",
    isFeatureFlag: true,
    description: `Feature flag: ${body.flag}`,
  });

  return Response.json({ ok: true, flag: body.flag, enabled: body.enabled });
}
