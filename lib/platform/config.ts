import { ConfigEntry, ConfigType, SetConfigInput, configEntrySchema } from "./types";

interface SupabaseResult {
  data: unknown;
  error: unknown;
}

interface EqChain extends Promise<SupabaseResult> {
  single: () => Promise<SupabaseResult>;
  eq: (col: string, val: unknown) => EqChain;
}

interface SelectChain extends Promise<SupabaseResult> {
  eq: (col: string, val: unknown) => EqChain;
}

interface ConfigClient {
  from: (table: string) => {
    select: (columns: string) => SelectChain;
    insert: (values: Record<string, unknown>) => { select: () => Promise<SupabaseResult> };
    upsert: (values: Record<string, unknown>, opts: { onConflict: string }) => { select: () => Promise<SupabaseResult> };
  };
  rpc: (name: string, params: Record<string, unknown>) => Promise<SupabaseResult>;
}

export interface ConfigDependencies {
  supabaseClient?: ConfigClient;
  env?: Record<string, string | undefined>;
}

export interface ConfigService {
  get<T = unknown>(key: string): Promise<T | null>;
  getWithDefault<T>(key: string, defaultValue: T): Promise<T>;
  set(input: SetConfigInput): Promise<void>;
  isFeatureEnabled(flag: string): Promise<boolean>;
  getFeatureFlags(): Promise<Record<string, boolean>>;
  getAll(): Promise<ConfigEntry[]>;
  getSecret(key: string): Promise<string | null>;
}

function coerceValue(value: unknown, type: ConfigType): unknown {
  if (type === "number") return Number(value);
  if (type === "boolean") {
    if (typeof value === "string") return value === "true" || value === "1";
    return Boolean(value);
  }
  if (type === "json") {
    if (typeof value === "string") return JSON.parse(value);
    return value;
  }
  return String(value);
}

export function createConfigService(deps?: ConfigDependencies): ConfigService {
  const env = deps?.env ?? process.env;

  async function get<T = unknown>(key: string): Promise<T | null> {
    const envKey = key.replace(/\./g, "_").toUpperCase();
    const envValue = env[envKey];
    if (envValue !== undefined) {
      return envValue as T;
    }

    if (!deps?.supabaseClient) return null;

    const { data, error } = await deps.supabaseClient
      .from("platform_config")
      .select("*")
      .eq("config_key", key)
      .single();

    if (error || !data) return null;

    const row = data as Record<string, unknown>;
    const configType = (row.config_type as ConfigType) ?? "string";
    return coerceValue(row.config_value, configType) as T;
  }

  async function getWithDefault<T>(key: string, defaultValue: T): Promise<T> {
    const value = await get<T>(key);
    return value ?? defaultValue;
  }

  async function set(input: SetConfigInput): Promise<void> {
    const parsed = configEntrySchema.parse(input);

    if (!deps?.supabaseClient) {
      throw new Error("Supabase client required for config set");
    }

    const { error } = await deps.supabaseClient
      .from("platform_config")
      .upsert(
        {
          config_key: parsed.configKey,
          config_value: parsed.configValue as Record<string, unknown>,
          config_type: parsed.configType,
          description: parsed.description ?? null,
          is_feature_flag: parsed.isFeatureFlag,
          is_encrypted: parsed.isEncrypted,
        },
        { onConflict: "config_key" },
      )
      .select();

    if (error) throw new Error(`Failed to set config: ${JSON.stringify(error)}`);
  }

  async function isFeatureEnabled(flag: string): Promise<boolean> {
    const value = await get<boolean>(flag);
    if (typeof value === "string") return value === "true" || value === "1";
    return value === true;
  }

  async function getFeatureFlags(): Promise<Record<string, boolean>> {
    if (!deps?.supabaseClient) return {};

    const { data, error } = await deps.supabaseClient
      .from("platform_config")
      .select("*")
      .eq("is_feature_flag", true);

    if (error || !data) return {};

    const rows = data as Record<string, unknown>[];
    const flags: Record<string, boolean> = {};
    for (const row of rows) {
      flags[row.config_key as string] = Boolean(row.config_value);
    }
    return flags;
  }

  async function getAll(): Promise<ConfigEntry[]> {
    if (!deps?.supabaseClient) return [];

    const { data, error } = await deps.supabaseClient
      .from("platform_config")
      .select("*");

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map(mapConfigRow);
  }

  async function getSecret(key: string): Promise<string | null> {
    const value = await get<string>(key);
    return value;
  }

  return {
    get,
    getWithDefault,
    set,
    isFeatureEnabled,
    getFeatureFlags,
    getAll,
    getSecret,
  };
}

function mapConfigRow(row: Record<string, unknown>): ConfigEntry {
  return {
    configKey: row.config_key as string,
    configValue: row.config_value,
    configType: row.config_type as ConfigType,
    description: (row.description as string) ?? null,
    isFeatureFlag: row.is_feature_flag as boolean,
    isEncrypted: row.is_encrypted as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
