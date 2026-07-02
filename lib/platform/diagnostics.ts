import { DiagnosticsReport, HealthCheckResult, HealthStatus } from "./types.js";

export interface DiagnosticsDependencies {
  env?: Record<string, string | undefined>;
  runStorageCheck?: () => Promise<HealthCheckResult[]>;
  runDatabaseCheck?: () => Promise<HealthCheckResult>;
  runSearchCheck?: () => Promise<HealthCheckResult | null>;
  runAnalyticsCheck?: () => Promise<HealthCheckResult | null>;
  runJobCheck?: () => Promise<HealthCheckResult>;
}

export interface DiagnosticsService {
  generate(): Promise<DiagnosticsReport>;
}

export function createDiagnosticsService(deps?: DiagnosticsDependencies): DiagnosticsService {
  async function generate(): Promise<DiagnosticsReport> {
    const env = deps?.env ?? process.env;

    const environment: Record<string, string> = {
      nodeVersion: process.version,
      platform: process.platform,
      env: env.NODE_ENV ?? "development",
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
      cloudinaryName: env.CLOUDINARY_CLOUD_NAME ? "configured" : "missing",
      hasStorageAdapter: deps?.runStorageCheck ? "yes" : "no",
    };

    const storage = deps?.runStorageCheck ? await deps.runStorageCheck() : [];
    const database = deps?.runDatabaseCheck ? await deps.runDatabaseCheck() : {
      service: "database",
      status: "healthy" as HealthStatus,
      message: "No database check configured",
      latencyMs: 0,
      checkedAt: new Date().toISOString(),
    };
    const search = deps?.runSearchCheck ? await deps.runSearchCheck() : null;
    const analytics = deps?.runAnalyticsCheck ? await deps.runAnalyticsCheck() : null;
    const jobs = deps?.runJobCheck ? await deps.runJobCheck() : {
      service: "queue",
      status: "healthy" as HealthStatus,
      message: "No job check configured",
      latencyMs: 0,
      checkedAt: new Date().toISOString(),
    };

    return {
      environment,
      storage,
      database,
      search,
      analytics,
      jobs,
      generatedAt: new Date().toISOString(),
    };
  }

  return { generate };
}
