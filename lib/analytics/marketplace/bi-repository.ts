import { AnalyticsDateWindow } from "./types";
import { BusinessIntelligence, BusinessIntelligenceRepository } from "../../business-intelligence/types";
import { SupabaseRpcClient } from "./supabase-repository";

async function rpc<T>(client: SupabaseRpcClient, name: string, window: AnalyticsDateWindow): Promise<T> {
  const { data, error } = await client.rpc(name, {
    p_start_date: window.startDate,
    p_end_date: window.endDate,
    p_previous_start_date: window.previousStartDate,
    p_previous_end_date: window.previousEndDate,
  });

  if (error) {
    throw new Error(`Failed to execute ${name}: ${JSON.stringify(error)}`);
  }

  return data as T;
}

export function createSupabaseBiRepository(client: SupabaseRpcClient): BusinessIntelligenceRepository {
  return {
    getBusinessIntelligence: (window) => rpc<BusinessIntelligence>(client, "get_marketplace_business_intelligence", window),
  };
}
