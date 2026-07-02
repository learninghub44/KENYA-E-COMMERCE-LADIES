import { ForecastingHook, ForecastingHookHandler, ForecastingHookRepository, ForecastingService, HookInvocation, HookInvocationStatus } from "./types.js";

export interface HooksDependencies {
  repository: ForecastingHookRepository;
  handlers?: Map<string, ForecastingHookHandler<unknown, unknown>>;
}

export function createForecastingService(deps: HooksDependencies): ForecastingService {
  const { repository, handlers = new Map() } = deps;

  return {
    async getAvailableHooks(): Promise<ForecastingHook[]> {
      return repository.listActiveHooks();
    },

    async invokeHook<TInput, TOutput>(hookName: string, input: TInput): Promise<TOutput> {
      const hook = await repository.getHookByName(hookName);
      if (!hook) {
        throw new Error(`Forecasting hook '${hookName}' not found`);
      }
      if (!hook.isActive) {
        throw new Error(`Forecasting hook '${hookName}' is not active`);
      }

      const handler = handlers.get(hookName);
      const startTime = Date.now();
      let status: HookInvocationStatus = "completed";
      let output: TOutput = { message: "No output" } as unknown as TOutput;
      let errorMessage: string | undefined;

      try {
        if (handler) {
          output = await handler.execute(input) as TOutput;
        } else {
          output = { message: `No handler registered for '${hookName}'. Future AI models can plug into this hook.` } as unknown as TOutput;
        }
      } catch (error) {
        status = "failed";
        errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw error;
      } finally {
        const durationMs = Date.now() - startTime;
        const inputRecord = input as Record<string, unknown>;
        const outputRecord = output as Record<string, unknown>;

        await repository.recordInvocation({
          hookId: hook.id,
          inputData: inputRecord,
          outputData: outputRecord,
          durationMs,
          status,
          ...(errorMessage ? { errorMessage } : {}),
        });

        await repository.updateLastInvoked(hook.id);
      }

      return output;
    },

    async getInvocationHistory(hookName: string, limit = 10): Promise<HookInvocation[]> {
      const hook = await repository.getHookByName(hookName);
      if (!hook) throw new Error(`Forecasting hook '${hookName}' not found`);
      return [];
    },
  };
}
