import type { SupabaseClient } from "@supabase/supabase-js";
import type { CursorPage } from "../audit/types";
import type { CreateReportInput, ReportRecord, ReportRepository, ReportSearchFilters } from "./types";

function encodeCursor(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64");
}

function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString("utf-8");
}

function toReportRecord(row: Record<string, unknown>): ReportRecord {
  return {
    id: row.id as string,
    targetType: row.target_type as ReportRecord["targetType"],
    targetId: row.target_id as string,
    reporterId: row.reporter_id as string,
    reason: row.reason as ReportRecord["reason"],
    description: (row.details as string | null) ?? null,
    status: row.status as ReportRecord["status"],
    assignedTo: (row.assigned_to as string | null) ?? null,
    resolution: (row.resolution as string | null) ?? null,
    internalNotes: ((row.internal_notes as string[] | null) ?? []),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    resolvedAt: (row.resolved_at as string | null) ?? null
  };
}

export function createSupabaseReportRepository(client: SupabaseClient): ReportRepository {
  return {
    async create(input: CreateReportInput): Promise<ReportRecord> {
      const { data, error } = await client
        .from("reports")
        .insert({
          target_type: input.targetType,
          target_id: input.targetId,
          reporter_id: input.reporterId,
          reason: input.reason,
          details: input.description ?? null
        })
        .select()
        .single();

      if (error || !data) throw new Error(`Failed to create report: ${error?.message ?? "unknown error"}`);
      return toReportRecord(data as Record<string, unknown>);
    },

    async findById(reportId: string): Promise<ReportRecord | null> {
      const { data } = await client.from("reports").select("*").eq("id", reportId).maybeSingle();
      if (!data) return null;
      return toReportRecord(data as Record<string, unknown>);
    },

    async search(filters: ReportSearchFilters): Promise<CursorPage<ReportRecord>> {
      const limit = filters.limit ?? 50;
      let query = client.from("reports").select("*");

      if (filters.targetType) query = query.eq("target_type", filters.targetType);
      if (filters.targetId) query = query.eq("target_id", filters.targetId);
      if (filters.reporterId) query = query.eq("reporter_id", filters.reporterId);
      if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.query) query = query.or(`reason.ilike.%${filters.query}%,details.ilike.%${filters.query}%`);

      const sortColumn = filters.sort === "updated_at_desc" ? "updated_at" : "created_at";
      query = query.order(sortColumn, { ascending: false }).limit(limit + 1);

      if (filters.cursor) {
        query = query.lt(sortColumn, decodeCursor(filters.cursor));
      }

      const { data } = await query;
      const rows = (data ?? []) as Record<string, unknown>[];
      const hasMore = rows.length > limit;
      const items = rows.slice(0, limit).map(toReportRecord);
      const nextCursor = hasMore && items.length > 0
        ? encodeCursor((sortColumn === "updated_at" ? items[items.length - 1]!.updatedAt : items[items.length - 1]!.createdAt))
        : null;

      return { items, nextCursor };
    },

    async update(input): Promise<ReportRecord> {
      const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.values.status !== undefined) values.status = input.values.status;
      if (input.values.assignedTo !== undefined) values.assigned_to = input.values.assignedTo;
      if (input.values.resolution !== undefined) values.resolution = input.values.resolution;
      if (input.values.resolvedAt !== undefined) values.resolved_at = input.values.resolvedAt;

      if (input.values.internalNote !== undefined) {
        const { data: existing } = await client.from("reports").select("internal_notes").eq("id", input.reportId).maybeSingle();
        const currentNotes = ((existing as Record<string, unknown> | null)?.internal_notes as string[] | null) ?? [];
        values.internal_notes = [...currentNotes, input.values.internalNote];
      }

      const { data, error } = await client
        .from("reports")
        .update(values)
        .eq("id", input.reportId)
        .select()
        .single();

      if (error || !data) throw new Error(`Failed to update report: ${error?.message ?? "unknown error"}`);
      return toReportRecord(data as Record<string, unknown>);
    }
  };
}
