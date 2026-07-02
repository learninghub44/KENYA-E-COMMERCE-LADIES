import { ConfigService } from "./config.js";
import { FeatureFlagEvaluation } from "./types.js";

export interface FeatureFlagTargeting {
  userIds?: string[];
  roles?: string[];
  countries?: string[];
  percentage?: number;
}

export interface FeatureFlagDefinition {
  key: string;
  defaultValue: boolean;
  description?: string;
  targeting?: FeatureFlagTargeting;
}

export interface FeatureFlagDependencies {
  configService: ConfigService;
  flags?: FeatureFlagDefinition[];
}

export interface FeatureFlagService {
  registerFlag(flag: FeatureFlagDefinition): void;
  isEnabled(flag: string, context?: { userId?: string; role?: string; country?: string }): Promise<boolean>;
  getFlag(flag: string): Promise<FeatureFlagDefinition | null>;
  listFlags(): Promise<FeatureFlagDefinition[]>;
  evaluate(flag: string, context?: { userId?: string; role?: string; country?: string }): Promise<FeatureFlagEvaluation>;
}

export function createFeatureFlagService(deps: FeatureFlagDependencies): FeatureFlagService {
  const flags = new Map<string, FeatureFlagDefinition>();

  if (deps.flags) {
    for (const flag of deps.flags) {
      flags.set(flag.key, flag);
    }
  }

  function registerFlag(flag: FeatureFlagDefinition): void {
    flags.set(flag.key, flag);
  }

  async function isEnabled(flag: string, context?: { userId?: string; role?: string; country?: string }): Promise<boolean> {
    const definition = flags.get(flag);
    if (!definition) return false;

    const dbValue = await deps.configService.getWithDefault<boolean>(`feature.${flag}`, definition.defaultValue);
    const targeting = definition.targeting ?? (await getTargetingFromConfig(flag));

    if (targeting) {
      if (targeting.userIds && context?.userId && targeting.userIds.includes(context.userId)) {
        return true;
      }
      if (targeting.roles && context?.role && targeting.roles.includes(context.role)) {
        return true;
      }
      if (targeting.countries && context?.country && targeting.countries.includes(context.country)) {
        return true;
      }
      if (targeting.percentage !== undefined && context?.userId) {
        const hash = hashCode(context.userId + flag) % 100;
        if (hash < targeting.percentage) {
          return true;
        }
      }
    }

    return dbValue;
  }

  async function getFlag(flag: string): Promise<FeatureFlagDefinition | null> {
    return flags.get(flag) ?? null;
  }

  async function listFlags(): Promise<FeatureFlagDefinition[]> {
    return Array.from(flags.values());
  }

  async function evaluate(flag: string, context?: { userId?: string; role?: string; country?: string }): Promise<FeatureFlagEvaluation> {
    const enabled = await isEnabled(flag, context);
    const definition = flags.get(flag);

    return {
      flag,
      enabled,
      targeting: {
        userId: context?.userId ?? undefined,
        role: context?.role ?? undefined,
        country: context?.country ?? undefined,
        percentage: definition?.targeting?.percentage,
      },
    };
  }

  async function getTargetingFromConfig(flag: string): Promise<FeatureFlagTargeting | null> {
    try {
      const raw = await deps.configService.get<FeatureFlagTargeting>(`feature.${flag}.targeting`);
      return raw;
    } catch {
      return null;
    }
  }

  return { registerFlag, isEnabled, getFlag, listFlags, evaluate };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
