import type { EventHandler, EventRepository, PlatformEvent, PlatformEventType, PublishEventInput } from "./types.js";

export type EventBusDependencies = {
  events: EventRepository;
  /**
   * Called when a handler throws. Never rethrown to the publisher: one failing handler must not
   * block others or the caller that published the event (e.g. the order service).
   */
  onHandlerError?: ((eventType: PlatformEventType, error: unknown) => void) | undefined;
};

/**
 * Lightweight pub/sub over the durable `platform_events` log. Agents 1-7 publish events through
 * `publish`; Agent 8's notification and email handlers subscribe through `subscribe`. Publishing
 * always persists the event first, so the event log is a reliable source of truth even if an
 * in-process handler fails or the process restarts before handlers run.
 */
export function createEventBus(deps: EventBusDependencies) {
  const handlers = new Map<PlatformEventType, EventHandler[]>();

  function subscribe<TPayload extends Record<string, unknown>>(
    eventType: PlatformEventType,
    handler: EventHandler<TPayload>
  ): void {
    const existing = handlers.get(eventType) ?? [];
    existing.push(handler as EventHandler);
    handlers.set(eventType, existing);
  }

  async function publish<TPayload extends Record<string, unknown>>(
    input: PublishEventInput<TPayload>
  ): Promise<PlatformEvent<TPayload>> {
    const event = await deps.events.write(input);
    const subscribed = handlers.get(input.eventType) ?? [];

    // Async processing: handlers run after the event is durably persisted, and a slow or
    // failing handler never blocks the publisher or other handlers.
    await Promise.all(
      subscribed.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          deps.onHandlerError?.(input.eventType, error);
        }
      })
    );

    await deps.events.markProcessed(event.id);
    return event;
  }

  return { subscribe, publish };
}

export type EventBus = ReturnType<typeof createEventBus>;
