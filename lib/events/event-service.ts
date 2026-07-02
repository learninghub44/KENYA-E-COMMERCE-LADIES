import { createEventSchema, CreateEventInput, CreateEventRequest, CursorPage, EventFilters, EventRepository, EventStatistics, InternalEvent } from "./types.js";
import { EVENT_TYPES } from "./types.js";

export interface EventServiceDependencies {
  repository: EventRepository;
  now?: () => Date;
}

export function createEventService(deps: EventServiceDependencies) {
  const { repository, now } = deps;

  return {
    async createEvent(input: CreateEventInput): Promise<InternalEvent> {
      const parsed = createEventSchema.parse(input);
      return repository.create(parsed as CreateEventInput);
    },

    async createEvents(inputs: CreateEventInput[]): Promise<InternalEvent[]> {
      const results: InternalEvent[] = [];
      for (const input of inputs) {
        const parsed = createEventSchema.parse(input);
        results.push(await repository.create(parsed as CreateEventInput));
      }
      return results;
    },

    async getEvent(id: string): Promise<InternalEvent | null> {
      return repository.findById(id);
    },

    async listEvents(filters: EventFilters, cursor?: string, limit?: number): Promise<CursorPage<InternalEvent>> {
      return repository.list(filters, cursor, limit);
    },

    async listEventTypes(): Promise<string[]> {
      return repository.listEventTypes();
    },

    async getStatistics(startDate: string, endDate: string): Promise<EventStatistics> {
      return repository.getStatistics(startDate, endDate);
    },

    async aggregateHourly(bucketHour: string): Promise<void> {
      return repository.aggregateHourly(bucketHour);
    },

    async aggregateDaily(bucketDate: string): Promise<void> {
      return repository.aggregateDaily(bucketDate);
    },

    async archiveEvents(cutoffDate: string): Promise<number> {
      return repository.archiveEvents(cutoffDate);
    },
  };
}

export type EventService = ReturnType<typeof createEventService>;
