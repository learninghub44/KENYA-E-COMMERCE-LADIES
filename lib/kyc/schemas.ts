import { z } from "zod";
import { kycStatusSchema } from "../seller/schemas";

export const kycDocumentSchema = z.object({
  type: z.enum(["national_id", "passport", "business_registration", "tax_certificate", "proof_of_address"]),
  storagePath: z.string().trim().min(3).max(500)
});

export const kycSubmissionSchema = z.object({
  sellerId: z.string().uuid(),
  userId: z.string().uuid(),
  documents: z.array(kycDocumentSchema).max(12).optional(),
  businessVerificationRequested: z.boolean().default(false),
  idempotencyKey: z.string().trim().min(8).max(160).optional()
});

export const diditWebhookSchema = z.object({
  id: z.string().optional(),
  verification_id: z.string().optional(),
  reference: z.string().optional(),
  status: z.string(),
  reason: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const normalizedKycWebhookSchema = z.object({
  providerReference: z.string().min(1),
  status: kycStatusSchema.exclude(["not_started"]),
  rejectionReason: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});
