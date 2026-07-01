import { z } from "zod";
import { KYC_STATUSES, SELLER_STATUSES } from "./types.js";

const slugSourceSchema = z.string().trim().min(2).max(120);

export const storeAddressSchema = z.object({
  line1: z.string().trim().min(2).max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2).max(80),
  region: z.string().trim().max(80).optional(),
  postalCode: z.string().trim().max(32).optional(),
  countryCode: z.string().trim().length(2).toUpperCase()
});

export const taxInformationSchema = z.object({
  taxId: z.string().trim().max(80).optional(),
  vatNumber: z.string().trim().max(80).optional(),
  registrationNumber: z.string().trim().max(80).optional()
});

export const storePoliciesSchema = z.object({
  returns: z.string().trim().max(4000).optional(),
  shipping: z.string().trim().max(4000).optional(),
  privacy: z.string().trim().max(4000).optional(),
  terms: z.string().trim().max(4000).optional()
});

export const businessHoursSchema = z.record(
  z.object({
    opens: z.string().regex(/^\d{2}:\d{2}$/),
    closes: z.string().regex(/^\d{2}:\d{2}$/),
    closed: z.boolean().optional()
  })
);

export const sellerApplicationSchema = z.object({
  userId: z.string().uuid(),
  storeName: slugSourceSchema,
  storeDescription: z.string().trim().max(2000).optional(),
  storeUrl: z.string().trim().url().max(300).optional(),
  businessCategory: z.string().trim().min(2).max(100),
  countryCode: z.string().trim().length(2).toUpperCase().optional(),
  defaultCurrency: z.string().trim().length(3).toUpperCase().default("KES"),
  supportEmail: z.string().trim().email().max(320).optional(),
  supportPhone: z.string().trim().min(7).max(32).optional(),
  businessAddress: storeAddressSchema.optional(),
  taxInformation: taxInformationSchema.optional()
});

export const storeProfileSchema = z.object({
  sellerId: z.string().uuid(),
  storeName: slugSourceSchema.optional(),
  storeDescription: z.string().trim().max(2000).optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  bannerUrl: z.string().url().max(500).nullable().optional(),
  storeUrl: z.string().trim().url().max(300).optional(),
  businessCategory: z.string().trim().min(2).max(100).optional(),
  supportEmail: z.string().trim().email().max(320).nullable().optional(),
  supportPhone: z.string().trim().min(7).max(32).nullable().optional(),
  businessAddress: storeAddressSchema.optional(),
  storePolicies: storePoliciesSchema.optional(),
  businessHours: businessHoursSchema.optional(),
  visibility: z.enum(["public", "private", "paused"]).optional()
});

export const sellerStatusSchema = z.enum(SELLER_STATUSES);
export const kycStatusSchema = z.enum(KYC_STATUSES);

export function slugifyStoreName(storeName: string): string {
  const slug = storeName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug.length > 0 ? slug : "store";
}
