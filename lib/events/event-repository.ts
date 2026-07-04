import {
  CreateEventInput,
  EventSource,
  EventType,
  CursorPage,
  EventFilters,
  EventRepository,
  EventStatistics,
  InternalEvent,
} from "./types";

export interface EventsDbClient {
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => { select: () => Promise<{ data: unknown; error: unknown }> };
    select: (columns: string) => QueryChain;
  };
  rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}

interface QueryChain extends Promise<{ data: unknown; error: unknown }> {
  eq: (col: string, val: unknown) => QueryChain;
  neq: (col: string, val: unknown) => QueryChain;
  gt: (col: string, val: unknown) => QueryChain;
  gte: (col: string, val: unknown) => QueryChain;
  lt: (col: string, val: unknown) => QueryChain;
  lte: (col: string, val: unknown) => QueryChain;
  in: (col: string, val: unknown[]) => QueryChain;
  order: (col: string, opts: { ascending: boolean }) => LimitChain;
  limit: (n: number) => Promise<{ data: unknown; error: unknown }>;
  single: () => Promise<{ data: unknown; error: unknown }>;
}

interface LimitChain extends Promise<{ data: unknown; error: unknown }> {
  eq: (col: string, val: unknown) => LimitChain;
  neq: (col: string, val: unknown) => LimitChain;
  gt: (col: string, val: unknown) => LimitChain;
  gte: (col: string, val: unknown) => LimitChain;
  lt: (col: string, val: unknown) => LimitChain;
  lte: (col: string, val: unknown) => LimitChain;
  in: (col: string, val: unknown[]) => LimitChain;
  limit: (n: number) => Promise<{ data: unknown; error: unknown }>;
}

function mapRow(row: Record<string, unknown>): InternalEvent {
  return {
    id: row.id as string,
    eventType: row.event_type as EventType,
    eventVersion: row.event_version as number,
    userId: (row.user_id as string) ?? null,
    sellerId: (row.seller_id as string) ?? null,
    sessionId: (row.session_id as string) ?? null,
    requestId: (row.request_id as string) ?? null,
    entityType: (row.entity_type as string) ?? null,
    entityId: (row.entity_id as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    deviceInfo: (row.device_info as Record<string, unknown>) ?? {},
    ipHash: (row.ip_hash as string) ?? null,
    userAgent: (row.user_agent as string) ?? null,
    source: (row.source as EventSource) ?? "internal",
    platform: (row.platform as string) ?? null,
    createdAt: row.created_at as string,
    archivedAt: (row.archived_at as string) ?? null,
  };
}

export function createEventRepository(client: EventsDbClient): EventRepository {
  async function create(input: CreateEventInput): Promise<InternalEvent> {
    const { data, error } = await client
      .from("internal_events")
      .insert({
        event_type: input.eventType,
        event_version: input.eventVersion ?? 1,
        user_id: input.userId ?? null,
        seller_id: input.sellerId ?? null,
        session_id: input.sessionId ?? null,
        request_id: input.requestId ?? null,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        metadata: input.metadata ?? {},
        device_info: input.deviceInfo ?? {},
        ip_hash: input.ipHash ?? null,
        user_agent: input.userAgent ?? null,
        source: input.source ?? "internal",
        platform: input.platform ?? null,
      })
      .select();

    if (error) throw new Error(`Failed to create event: ${JSON.stringify(error)}`);
    const rows = data as Record<string, unknown>[];
    return mapRow(rows[0] as Record<string, unknown>);
  }

  async function findById(id: string): Promise<InternalEvent | null> {
    const { data, error } = await client
      .from("internal_events")
      .select("id, event_type, event_version, user_id, seller_id, session_id, request_id, entity_type, entity_id, metadata, device_info, ip_hash, user_agent, source, platform, created_at, archived_at")
      .eq("id", id)
      .single();

    if (error) return null;
    return mapRow(data as Record<string, unknown>);
  }

  async function list(filters: EventFilters, cursor?: string, limit = 50): Promise<CursorPage<InternalEvent>> {
    const EVENT_COLUMNS = "id, event_type, event_version, user_id, seller_id, session_id, request_id, entity_type, entity_id, metadata, device_info, ip_hash, user_agent, source, platform, created_at, archived_at";
    const cappedLimit = Math.min(limit, 100);
    let query = client
      .from("internal_events")
      .select(EVENT_COLUMNS)
      .gte("created_at", cursor ?? "1970-01-01");

    if (filters.eventTypes?.length) {
      query = query.eq("event_type", filters.eventTypes[0]);
    }
    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.sellerId) {
      query = query.eq("seller_id", filters.sellerId);
    }
    if (filters.sessionId) {
      query = query.eq("session_id", filters.sessionId);
    }
    if (filters.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }
    if (filters.entityId) {
      query = query.eq("entity_id", filters.entityId);
    }
    if (filters.source) {
      query = query.eq("source", filters.source);
    }
    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(cappedLimit);

    if (error) throw new Error(`Failed to list events: ${JSON.stringify(error)}`);
    const rows = data as Record<string, unknown>[];
    const events = (rows ?? []).map(mapRow);
    const nextCursor = events.length === limit ? `${events[events.length - 1]?.createdAt}_${events[events.length - 1]?.id}` : null;
    return { data: events, nextCursor, total: events.length };
  }

  async function listEventTypes(): Promise<string[]> {
    const { data, error } = await client
      .from("internal_events")
      .select("event_type")
      .order("event_type", { ascending: true });

    if (error) throw new Error(`Failed to list event types: ${JSON.stringify(error)}`);
    const rows = data as Array<{ event_type: string }> ?? [];
    return [...new Set(rows.map((r) => r.event_type))];
  }

  async function getStatistics(startDate: string, endDate: string): Promise<EventStatistics> {
    const { data, error } = await client.rpc("get_event_statistics", {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw new Error(`Failed to get event statistics: ${JSON.stringify(error)}`);
    return data as EventStatistics;
  }

  async function aggregateHourly(bucketHour: string): Promise<void> {
    const { error } = await client.rpc("aggregate_events_hourly", { p_bucket_hour: bucketHour });
    if (error) throw new Error(`Failed to aggregate events hourly: ${JSON.stringify(error)}`);
  }

  async function aggregateDaily(bucketDate: string): Promise<void> {
    const { error } = await client.rpc("aggregate_events_daily", { p_bucket_date: bucketDate });
    if (error) throw new Error(`Failed to aggregate events daily: ${JSON.stringify(error)}`);
  }

  async function archiveEvents(cutoffDate: string): Promise<number> {
    const { data, error } = await client.rpc("archive_events", { p_cutoff_date: cutoffDate });
    if (error) throw new Error(`Failed to archive events: ${JSON.stringify(error)}`);
    return (data as number) ?? 0;
  }

  return { create, findById, list, listEventTypes, getStatistics, aggregateHourly, aggregateDaily, archiveEvents };
}
