import { MaintenanceType, MaintenanceWindow } from "./types";

interface SupabaseResult {
  data: unknown;
  error: unknown;
}

interface EqChain extends Promise<SupabaseResult> {
  single: () => Promise<SupabaseResult>;
  eq: (col: string, val: unknown) => EqChain;
  order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<SupabaseResult> };
}

interface SelectChain extends Promise<SupabaseResult> {
  eq: (col: string, val: unknown) => EqChain;
  order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<SupabaseResult> };
}

export interface MaintenanceDependencies {
  supabaseClient: {
    from: (table: string) => {
      select: (columns: string) => SelectChain;
      insert: (values: Record<string, unknown>) => { select: () => Promise<SupabaseResult> };
      update: (values: Record<string, unknown>) => {
        eq: (col: string, val: unknown) => { select: () => Promise<SupabaseResult> };
      };
    };
    rpc: (name: string, params?: Record<string, unknown>) => Promise<SupabaseResult>;
  };
}

export interface MaintenanceService {
  enable(type: MaintenanceType, message?: string, createdBy?: string): Promise<MaintenanceWindow>;
  disable(createdBy?: string): Promise<void>;
  isActive(): Promise<MaintenanceWindow | null>;
  isReadOnly(): Promise<boolean>;
  schedule(type: MaintenanceType, message: string, start: string, end: string, createdBy?: string): Promise<MaintenanceWindow>;
  list(): Promise<MaintenanceWindow[]>;
}

function mapWindow(row: Record<string, unknown>): MaintenanceWindow {
  return {
    id: row.id as string,
    maintenanceType: row.maintenance_type as MaintenanceType,
    isActive: row.is_active as boolean,
    message: (row.message as string) ?? null,
    scheduledStart: (row.scheduled_start as string) ?? null,
    scheduledEnd: (row.scheduled_end as string) ?? null,
    startedAt: (row.started_at as string) ?? null,
    endedAt: (row.ended_at as string) ?? null,
    createdBy: (row.created_by as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function createMaintenanceService(deps: MaintenanceDependencies): MaintenanceService {
  const { supabaseClient } = deps;

  async function enable(type: MaintenanceType, message?: string, createdBy?: string): Promise<MaintenanceWindow> {
    const { data, error } = await supabaseClient
      .from("platform_maintenance_windows")
      .insert({
        maintenance_type: type,
        is_active: true,
        message: message ?? null,
        started_at: new Date().toISOString(),
        created_by: createdBy ?? null,
      })
      .select();

    if (error) throw new Error(`Failed to enable maintenance: ${JSON.stringify(error)}`);
    const rows = data as Record<string, unknown>[];
    return mapWindow(rows[0] as Record<string, unknown>);
  }

  async function disable(createdBy?: string): Promise<void> {
    const active = await isActive();
    if (!active) return;

    const { error } = await supabaseClient
      .from("platform_maintenance_windows")
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
      })
      .eq("id", active.id)
      .select();

    if (error) throw new Error(`Failed to disable maintenance: ${JSON.stringify(error)}`);
  }

  async function isActive(): Promise<MaintenanceWindow | null> {
    const { data, error } = await supabaseClient
      .from("platform_maintenance_windows")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data) return null;
    const rows = data as Record<string, unknown>[];
    return rows.length > 0 ? mapWindow(rows[0] as Record<string, unknown>) : null;
  }

  async function isReadOnly(): Promise<boolean> {
    const active = await isActive();
    return active?.maintenanceType === "read_only";
  }

  async function schedule(type: MaintenanceType, message: string, start: string, end: string, createdBy?: string): Promise<MaintenanceWindow> {
    const { data, error } = await supabaseClient
      .from("platform_maintenance_windows")
      .insert({
        maintenance_type: type,
        is_active: false,
        message,
        scheduled_start: start,
        scheduled_end: end,
        created_by: createdBy ?? null,
      })
      .select();

    if (error) throw new Error(`Failed to schedule maintenance: ${JSON.stringify(error)}`);
    const rows = data as Record<string, unknown>[];
    return mapWindow(rows[0] as Record<string, unknown>);
  }

  async function list(): Promise<MaintenanceWindow[]> {
    const { data, error } = await supabaseClient
      .from("platform_maintenance_windows")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(mapWindow);
  }

  return { enable, disable, isActive, isReadOnly, schedule, list };
}
