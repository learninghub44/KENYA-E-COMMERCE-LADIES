import { HealthCheckResult, HealthReport, HealthStatus } from "./types.js";

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
}

export interface HealthDependencies {
  checks?: HealthCheck[];
}

export interface HealthService {
  registerCheck(check: HealthCheck): void;
  runAll(): Promise<HealthReport>;
  runCheck(name: string): Promise<HealthCheckResult | null>;
}

function computeOverall(checks: HealthCheckResult[]): HealthStatus {
  if (checks.some((c) => c.status === "critical")) return "critical";
  if (checks.some((c) => c.status === "warning")) return "warning";
  return "healthy";
}

export function createHealthService(deps?: HealthDependencies): HealthService {
  const checks = new Map<string, HealthCheck>();

  if (deps?.checks) {
    for (const check of deps.checks) {
      checks.set(check.name, check);
    }
  }

  function registerCheck(check: HealthCheck): void {
    checks.set(check.name, check);
  }

  async function runAll(): Promise<HealthReport> {
    const results: HealthCheckResult[] = [];

    for (const [name, check] of checks) {
      try {
        const result = await check.check();
        results.push(result);
      } catch (error) {
        results.push({
          service: name,
          status: "critical",
          message: error instanceof Error ? error.message : "Health check threw",
          latencyMs: 0,
          checkedAt: new Date().toISOString(),
        });
      }
    }

    return {
      overall: computeOverall(results),
      checks: results,
      generatedAt: new Date().toISOString(),
    };
  }

  async function runCheck(name: string): Promise<HealthCheckResult | null> {
    const check = checks.get(name);
    if (!check) return null;
    try {
      return await check.check();
    } catch (error) {
      return {
        service: name,
        status: "critical",
        message: error instanceof Error ? error.message : "Health check failed",
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  return { registerCheck, runAll, runCheck };
}

export function createDatabaseHealthCheck(
  ping: () => Promise<boolean>,
): HealthCheck {
  return {
    name: "database",
    async check() {
      const start = Date.now();
      try {
        const ok = await ping();
        return {
          service: "database",
          status: ok ? "healthy" : "critical",
          message: ok ? "Database responsive" : "Database ping failed",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          service: "database",
          status: "critical",
          message: error instanceof Error ? error.message : "Database unreachable",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      }
    },
  };
}

export function createHttpHealthCheck(
  name: string,
  url: string,
  timeoutMs = 5000,
): HealthCheck {
  return {
    name,
    async check() {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(url, { signal: controller.signal, method: "HEAD" });
        clearTimeout(timer);
        return {
          service: name,
          status: response.ok ? "healthy" : "warning",
          message: `${name} responded with ${response.status}`,
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          service: name,
          status: "critical",
          message: error instanceof Error ? error.message : `${name} unreachable`,
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      }
    },
  };
}

export function createStorageHealthCheck(
  checkStorage: () => Promise<boolean>,
): HealthCheck {
  return {
    name: "storage",
    async check() {
      const start = Date.now();
      try {
        const ok = await checkStorage();
        return {
          service: "storage",
          status: ok ? "healthy" : "critical",
          message: ok ? "Storage responsive" : "Storage check failed",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          service: "storage",
          status: "critical",
          message: error instanceof Error ? error.message : "Storage unreachable",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      }
    },
  };
}

export function createCacheHealthCheck(
  checkCache: () => Promise<boolean>,
): HealthCheck {
  return {
    name: "cache",
    async check() {
      const start = Date.now();
      try {
        const ok = await checkCache();
        return {
          service: "cache",
          status: ok ? "healthy" : "warning",
          message: ok ? "Cache responsive" : "Cache check failed",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          service: "cache",
          status: "warning",
          message: error instanceof Error ? error.message : "Cache unreachable",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      }
    },
  };
}

export function createQueueHealthCheck(
  checkQueue: () => Promise<boolean>,
): HealthCheck {
  return {
    name: "queue",
    async check() {
      const start = Date.now();
      try {
        const ok = await checkQueue();
        return {
          service: "queue",
          status: ok ? "healthy" : "warning",
          message: ok ? "Queue responsive" : "Queue check failed",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          service: "queue",
          status: "critical",
          message: error instanceof Error ? error.message : "Queue unreachable",
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      }
    },
  };
}
