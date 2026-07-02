import { AggregationDimension, AggregationPeriod, EventAggregation, EventFilters, EventRepository, InternalEvent } from "./types.js";

export interface AggregationServiceDependencies {
  repository: EventRepository;
}

export function createAggregationService(deps: AggregationServiceDependencies) {
  const { repository } = deps;

  function getBucketStart(date: Date, period: AggregationPeriod): Date {
    const d = new Date(date);
    switch (period) {
      case "hourly": d.setUTCMinutes(0, 0, 0); break;
      case "daily": d.setUTCHours(0, 0, 0, 0); break;
      case "weekly": { d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); break; }
      case "monthly": { d.setUTCHours(0, 0, 0, 0); d.setUTCDate(1); break; }
      case "yearly": { d.setUTCHours(0, 0, 0, 0); d.setUTCMonth(0, 1); break; }
    }
    return d;
  }

  function formatBucket(date: Date, period: AggregationPeriod): string {
    const d = getBucketStart(date, period);
    return d.toISOString();
  }

  return {
    getBucketStart,
    formatBucket,

    async aggregateEvents(period: AggregationPeriod, date: Date): Promise<void> {
      const bucket = formatBucket(date, period);
      switch (period) {
        case "hourly":
          await repository.aggregateHourly(bucket);
          break;
        case "daily":
          await repository.aggregateDaily(bucket.split("T")[0] ?? bucket);
          break;
        case "weekly":
        case "monthly":
        case "yearly":
          await repository.aggregateDaily(bucket.split("T")[0] ?? bucket);
          break;
      }
    },

    async aggregateByDimension(
      _dimension: AggregationDimension,
      _period: AggregationPeriod,
      _entityId: string,
      _startDate: string,
      _endDate: string,
    ): Promise<EventAggregation[]> {
      return [];
    },
  };
}

export type AggregationService = ReturnType<typeof createAggregationService>;
