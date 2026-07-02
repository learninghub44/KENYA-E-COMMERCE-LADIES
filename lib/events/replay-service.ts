import { EventFilters, EventReplayHandler, EventRepository, InternalEvent } from "./types";

export interface ReplayServiceDependencies {
  repository: EventRepository;
}

export function createReplayService(deps: ReplayServiceDependencies) {
  const { repository } = deps;

  return {
    async replayEvents(
      filters: EventFilters,
      handler: EventReplayHandler,
      options?: { batchSize?: number; onProgress?: (processed: number) => void },
    ): Promise<number> {
      const batchSize = options?.batchSize ?? 100;
      let cursor: string | undefined;
      let totalProcessed = 0;

      do {
        const page = await repository.list(filters, cursor, batchSize);
        for (const event of page.data) {
          await handler.handleEvent(event);
          totalProcessed++;
        }
        options?.onProgress?.(totalProcessed);
        cursor = page.nextCursor ?? undefined;
      } while (cursor);

      return totalProcessed;
    },
  };
}

export type ReplayService = ReturnType<typeof createReplayService>;
