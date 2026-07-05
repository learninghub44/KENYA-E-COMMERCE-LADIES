import type {
  DiditCreateSessionRequest,
  DiditCreateSessionResponse,
  DiditDecisionResponse,
  DiditKybSearchRequest,
  DiditKybSearchResponse,
  DiditKybSelectRequest,
  DiditKybSelectResponse,
} from "./types";

const BASE_URL = "https://verification.didit.me";

type DiditClientConfig = {
  apiKey: string;
  workflowId?: string;
};

async function diditFetch<T>(
  path: string,
  apiKey: string,
  options: {
    method?: string;
    body?: unknown;
    params?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const headers: Record<string, string> = {
    "x-api-key": apiKey,
    Accept: "application/json",
  };

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), init);

  if (!response.ok) {
    const errorBody = await response.text();
    let detail: string | undefined;
    try {
      const parsed = JSON.parse(errorBody);
      detail = parsed.detail ?? parsed.error ?? parsed.field_name;
    } catch {
      detail = errorBody;
    }

    throw new Error(
      `Didit API error ${response.status}: ${detail ?? response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export type DiditClient = {
  createSession(input: {
    reference: string;
    sellerId: string;
    ownerId: string;
    documents?: Array<{ type: string; storagePath: string }>;
    businessVerificationRequested: boolean;
  }): Promise<{ id: string; status?: string; metadata?: Record<string, unknown>; url?: string }>;
  getDecision(sessionId: string): Promise<DiditDecisionResponse>;
  kybSearch(input: DiditKybSearchRequest): Promise<DiditKybSearchResponse>;
  kybSelect(input: DiditKybSelectRequest): Promise<DiditKybSelectResponse>;
};

export function createDiditClient(config: DiditClientConfig): DiditClient {
  const { apiKey, workflowId } = config;

  return {
    async createSession(input) {
      const request: DiditCreateSessionRequest = {
        workflow_id: workflowId ?? "",
        vendor_data: input.sellerId,
        callback: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kenya-e-commerce-ladies.onrender.com"}/api/webhooks/didit/callback`,
        metadata: {
          sellerId: input.sellerId,
          ownerId: input.ownerId,
          reference: input.reference,
        },
      };

      const response = await diditFetch<DiditCreateSessionResponse>(
        "/v3/session/",
        apiKey,
        { method: "POST", body: request }
      );

      return {
        id: response.session_id,
        status: response.status,
        metadata: response.metadata ?? undefined,
        url: response.url,
      };
    },

    async getDecision(sessionId: string) {
      return diditFetch<DiditDecisionResponse>(
        `/v3/session/${sessionId}/decision/`,
        apiKey
      );
    },

    async kybSearch(input) {
      return diditFetch<DiditKybSearchResponse>(
        "/v3/kyb/search/",
        apiKey,
        { method: "POST", body: input }
      );
    },

    async kybSelect(input) {
      return diditFetch<DiditKybSelectResponse>(
        "/v3/kyb/select/",
        apiKey,
        { method: "POST", body: { ...input, save_api_request: true } }
      );
    },
  };
}
