import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminActor } from "./types";

export type AdminAuditWriteInput = {
  actor: AdminActor;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown> | undefined;
  newValues?: Record<string, unknown> | undefined;
  metadata?: Record<string, unknown> | undefined;
};

/**
 * Writes moderation/report admin actions to the existing audit_logs table.
 * There is no dedicated `metadata` column on audit_logs, so any metadata is
 * folded into new_values under a `metadata` key rather than dropped.
 */
export function createSupabaseAdminAuditWriter(client: SupabaseClient) {
  return {
    async writeAdminAudit(input: AdminAuditWriteInput): Promise<void> {
      const newValues = input.metadata
        ? { ...(input.newValues ?? {}), metadata: input.metadata }
        : input.newValues;

      await client.from("audit_logs").insert({
        actor_id: input.actor.userId,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        old_values: input.oldValues ?? null,
        new_values: newValues ?? null
      });
    }
  };
}
