import { CircuitBreakerOptions, CircuitState } from "./types";

export interface CircuitBreaker {
  call<T>(fn: () => Promise<T>): Promise<T>;
  getState(): CircuitState;
  reset(): void;
  getMetrics(): { failureCount: number; successCount: number; state: CircuitState };
}

export function createCircuitBreaker(options: Partial<CircuitBreakerOptions> = {}): CircuitBreaker {
  const opts: CircuitBreakerOptions = {
    failureThreshold: options.failureThreshold ?? 5,
    successThreshold: options.successThreshold ?? 3,
    openTimeoutMs: options.openTimeoutMs ?? 30000,
    halfOpenMaxRequests: options.halfOpenMaxRequests ?? 1,
  };

  let state: CircuitState = "closed";
  let failureCount = 0;
  let successCount = 0;
  let lastFailureTime = 0;
  let halfOpenRequests = 0;

  function getState(): CircuitState {
    if (state === "open" && Date.now() - lastFailureTime >= opts.openTimeoutMs) {
      state = "half_open";
      halfOpenRequests = 0;
    }
    return state;
  }

  async function call<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = getState();

    if (currentState === "open") {
      throw new Error("Circuit breaker is open");
    }

    if (currentState === "half_open") {
      if (halfOpenRequests >= (opts.halfOpenMaxRequests ?? 1)) {
        throw new Error("Circuit breaker half-open, request rejected");
      }
      halfOpenRequests++;
    }

    try {
      const result = await fn();
      onSuccess();
      return result;
    } catch (error) {
      onFailure();
      throw error;
    }
  }

  function onSuccess(): void {
    failureCount = 0;
    successCount++;

    if (state === "half_open" && successCount >= opts.successThreshold) {
      state = "closed";
      successCount = 0;
      halfOpenRequests = 0;
    }
  }

  function onFailure(): void {
    failureCount++;
    lastFailureTime = Date.now();

    if (state === "half_open" || failureCount >= opts.failureThreshold) {
      state = "open";
      successCount = 0;
    }
  }

  function reset(): void {
    state = "closed";
    failureCount = 0;
    successCount = 0;
    halfOpenRequests = 0;
  }

  return {
    call,
    getState,
    reset,
    getMetrics: () => ({ failureCount, successCount, state }),
  };
}
