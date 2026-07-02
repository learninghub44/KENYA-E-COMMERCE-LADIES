import { HealthStatus, ReadinessCheck, ReadinessReport } from "./types.js";

export interface ReadinessDependencies {
  checks: ReadinessCheckProvider[];
}

export interface ReadinessCheckProvider {
  name: string;
  required: boolean;
  check: () => Promise<HealthStatus>;
}

export interface ReadinessService {
  addCheck(provider: ReadinessCheckProvider): void;
  runAll(): Promise<ReadinessReport>;
}

export function createReadinessService(deps?: ReadinessDependencies): ReadinessService {
  const providers = new Map<string, ReadinessCheckProvider>();

  if (deps?.checks) {
    for (const provider of deps.checks) {
      providers.set(provider.name, provider);
    }
  }

  function addCheck(provider: ReadinessCheckProvider): void {
    providers.set(provider.name, provider);
  }

  async function runAll(): Promise<ReadinessReport> {
    const results: ReadinessCheck[] = [];

    for (const [name, provider] of providers) {
      try {
        const status = await provider.check();
        results.push({
          name,
          status,
          required: provider.required,
          message: status === "healthy" ? `${name} ready` : `${name} not ready`,
        });
      } catch (error) {
        results.push({
          name,
          status: "critical",
          required: provider.required,
          message: error instanceof Error ? error.message : `${name} check threw`,
        });
      }
    }

    const ready = results
      .filter((r) => r.required)
      .every((r) => r.status === "healthy");

    return { ready, checks: results, generatedAt: new Date().toISOString() };
  }

  return { addCheck, runAll };
}

export function createEnvReadinessCheck(): ReadinessCheckProvider {
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  return {
    name: "environment",
    required: true,
    async check() {
      const missing = requiredVars.filter((v) => !process.env[v]);
      if (missing.length > 0) {
        return "critical";
      }
      return "healthy";
    },
  };
}

export function createConnectivityReadinessCheck(
  name: string,
  ping: () => Promise<boolean>,
  required: boolean,
): ReadinessCheckProvider {
  return {
    name,
    required,
    async check() {
      try {
        const ok = await ping();
        return ok ? "healthy" : "critical";
      } catch {
        return "critical";
      }
    },
  };
}
