import { z } from "zod";

export const addressSnapshotSchema = z.object({
  id: z.string().uuid().optional(),
  recipientName: z.string().min(2).max(120),
  phone: z.string().min(6).max(32),
  line1: z.string().min(2).max(180),
  line2: z.string().max(180).nullable().optional(),
  city: z.string().min(2).max(120),
  region: z.string().max(120).nullable().optional(),
  postalCode: z.string().max(32).nullable().optional(),
  countryCode: z.string().length(2)
});

const cartOwnerShape = {
  userId: z.string().uuid().optional(),
  guestToken: z.string().min(16).max(128).optional()
};

function requireCartOwner<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).refine((value) => value.userId || value.guestToken, "Either userId or guestToken is required.");
}

export const cartOwnerSchema = requireCartOwner(cartOwnerShape);

export const addCartItemSchema = requireCartOwner({
  ...cartOwnerShape,
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1).max(99)
});

export const updateCartItemSchema = requireCartOwner({
  ...cartOwnerShape,
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99)
});

export const cartItemActionSchema = requireCartOwner({
  ...cartOwnerShape,
  itemId: z.string().uuid()
});

export const mergeCartSchema = z.object({
  userId: z.string().uuid(),
  guestToken: z.string().min(16).max(128)
});

export const checkoutSchema = z.object({
  buyerId: z.string().uuid(),
  cartId: z.string().uuid(),
  shippingAddress: addressSnapshotSchema,
  billingAddress: addressSnapshotSchema.nullable().optional(),
  couponCode: z.string().trim().min(2).max(40).optional(),
  notes: z.string().max(500).optional()
});

export const statusTransitionSchema = z.object({
  orderId: z.string().uuid(),
  actorId: z.string().uuid(),
  to: z.enum([
    "draft",
    "pending",
    "confirmed",
    "processing",
    "ready_for_shipment",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
    "refunded",
    "returned"
  ]),
  note: z.string().max(500).optional()
});

export const couponCodeSchema = z.string().trim().min(2).max(40).transform((value) => value.toUpperCase());
