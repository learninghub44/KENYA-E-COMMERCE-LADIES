import { diditWebhookSchema } from "./schemas";
import type { KycProvider, KycProviderResult, KycSubmissionInput, KycWebhookEvent } from "./types";
import type { SellerRecord } from "../seller/types";

export type DiditClient = {
  createSession(input: {
    reference: string;
    sellerId: string;
    ownerId: string;
    documents?: KycSubmissionInput["documents"];
    businessVerificationRequested: boolean;
  }): Promise<{ id: string; status?: string; metadata?: Record<string, unknown> }>;
};

function mapDiditStatus(status: string): KycWebhookEvent["status"] {
  const normalized = status.toLowerCase();
  if (["approved", "verified", "completed"].includes(normalized)) return "approved";
  if (["rejected", "declined", "failed"].includes(normalized)) return "rejected";
  if (["manual_review", "review", "needs_review"].includes(normalized)) return "manual_review";
  if (["expired"].includes(normalized)) return "expired";
  return "pending";
}

export function createDiditProvider(client: DiditClient | null): KycProvider {
  return {
    async createVerification(input: KycSubmissionInput & { seller: SellerRecord }): Promise<KycProviderResult> {
      if (!client) {
        return {
          available: false,
          provider: "manual",
          status: "manual_review",
          metadata: { fallbackReason: "didit_client_unavailable" }
        };
      }

      try {
        const reference = input.idempotencyKey ?? `${input.sellerId}:${Date.now()}`;
        const session = await client.createSession({
          reference,
          sellerId: input.sellerId,
          ownerId: input.seller.ownerId,
          documents: input.documents,
          businessVerificationRequested: input.businessVerificationRequested ?? false
        });

        const result: KycProviderResult = {
          available: true,
          provider: "didit",
          providerReference: session.id,
          status: mapDiditStatus(session.status ?? "pending")
        };
        if (session.metadata) result.metadata = session.metadata;
        return result;
      } catch (error) {
        return {
          available: false,
          provider: "manual",
          status: "manual_review",
          metadata: { fallbackReason: "didit_create_session_failed", error: error instanceof Error ? error.message : "unknown" }
        };
      }
    },

    async parseWebhook(input: unknown): Promise<KycWebhookEvent> {
      const parsed = diditWebhookSchema.parse(input);
      const providerReference = parsed.verification_id ?? parsed.id ?? parsed.reference;
      if (!providerReference) throw new Error("Didit webhook is missing a provider reference.");

      const event: KycWebhookEvent = {
        providerReference,
        status: mapDiditStatus(parsed.status)
      };
      if (parsed.reason) event.rejectionReason = parsed.reason;
      if (parsed.metadata) event.metadata = parsed.metadata;
      return event;
    }
  };
}
