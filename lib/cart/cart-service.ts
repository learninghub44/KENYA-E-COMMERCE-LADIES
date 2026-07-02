import { calculateCartSummary } from "../orders/calculations.js";
import { addCartItemSchema, cartItemActionSchema, cartOwnerSchema, mergeCartSchema, updateCartItemSchema } from "../orders/schemas.js";
import type { CartItemRecord, CartItemRepository, CartRepository, CartSummary, CommerceResult, ProductReader } from "../orders/types.js";

export type CartServiceDependencies = {
  carts: CartRepository;
  items: CartItemRepository;
  products: ProductReader;
};

function failure(code: string, message: string, status: number): CommerceResult<never> {
  return { ok: false, code, message, status };
}

type CartOwner = { userId?: string | undefined; guestToken?: string | undefined };

async function getOrCreateCart(deps: CartServiceDependencies, owner: CartOwner): Promise<CartSummary> {
  const cart =
    owner.userId !== undefined
      ? await deps.carts.findActiveByUser(owner.userId)
      : owner.guestToken !== undefined
        ? await deps.carts.findActiveByGuestToken(owner.guestToken)
        : null;
  const createInput: { userId?: string | null; guestToken?: string | null; currency: string } = { currency: "KES" };
  if (owner.userId !== undefined) createInput.userId = owner.userId;
  if (owner.guestToken !== undefined) createInput.guestToken = owner.guestToken;
  const activeCart = cart ?? (await deps.carts.create(createInput));
  return summarize(deps, activeCart.id);
}

async function summarize(deps: CartServiceDependencies, cartId: string): Promise<CartSummary> {
  const cart = await deps.carts.findById(cartId);
  if (!cart) throw new Error("Cart disappeared while summarizing.");
  const items = await deps.items.listByCart(cartId);
  const activeItems = items.filter((item) => item.status === "active");
  const savedItems = items.filter((item) => item.status === "saved_for_later");
  const totals = calculateCartSummary(activeItems);
  return { cart, activeItems, savedItems, ...totals };
}

async function authorizeItem(deps: CartServiceDependencies, owner: CartOwner, itemId: string): Promise<CommerceResult<CartItemRecord>> {
  const cartResult = await getOrCreateCart(deps, owner);
  const item = [...cartResult.activeItems, ...cartResult.savedItems].find((candidate) => candidate.id === itemId);
  if (!item) return failure("NOT_FOUND", "Cart item not found.", 404);
  return { ok: true, data: item };
}

export function createCartService(deps: CartServiceDependencies) {
  return {
    async view(input: unknown): Promise<CommerceResult<CartSummary>> {
      const parsed = cartOwnerSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Cart owner is invalid.", 400);
      return { ok: true, data: await getOrCreateCart(deps, parsed.data) };
    },

    async add(input: unknown): Promise<CommerceResult<CartSummary>> {
      const parsed = addCartItemSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Cart item input is invalid.", 400);
      const product = await deps.products.getPurchasable(parsed.data.productId, parsed.data.variantId ?? null);
      if (!product || !product.isPublished) return failure("PRODUCT_NOT_PURCHASABLE", "Product is not available for purchase.", 409);
      if (!product.inStock) return failure("OUT_OF_STOCK", "Product is out of stock.", 409);

      const summary = await getOrCreateCart(deps, parsed.data);
      const existing = await deps.items.findLine({ cartId: summary.cart.id, productId: product.productId, variantId: product.variantId ?? null });
      await deps.items.upsert({
        cartId: summary.cart.id,
        productId: product.productId,
        variantId: product.variantId ?? null,
        sellerId: product.sellerId,
        quantity: existing ? existing.quantity + parsed.data.quantity : parsed.data.quantity,
        unitPriceMinor: product.unitPriceMinor,
        currency: product.currency,
        status: "active",
        productSnapshot: product
      });
      return { ok: true, data: await summarize(deps, summary.cart.id) };
    },

    async updateQuantity(input: unknown): Promise<CommerceResult<CartSummary>> {
      const parsed = updateCartItemSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Cart quantity input is invalid.", 400);
      const itemResult = await authorizeItem(deps, parsed.data, parsed.data.itemId);
      if (!itemResult.ok) return itemResult;
      await deps.items.updateItem({ itemId: parsed.data.itemId, values: { quantity: parsed.data.quantity, status: "active" } });
      return { ok: true, data: await summarize(deps, itemResult.data.cartId) };
    },

    async remove(input: unknown): Promise<CommerceResult<CartSummary>> {
      const parsed = cartItemActionSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Cart item input is invalid.", 400);
      const itemResult = await authorizeItem(deps, parsed.data, parsed.data.itemId);
      if (!itemResult.ok) return itemResult;
      await deps.items.deleteItem(parsed.data.itemId);
      return { ok: true, data: await summarize(deps, itemResult.data.cartId) };
    },

    async saveForLater(input: unknown): Promise<CommerceResult<CartSummary>> {
      const parsed = cartItemActionSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Cart item input is invalid.", 400);
      const itemResult = await authorizeItem(deps, parsed.data, parsed.data.itemId);
      if (!itemResult.ok) return itemResult;
      await deps.items.updateItem({ itemId: parsed.data.itemId, values: { status: "saved_for_later" } });
      return { ok: true, data: await summarize(deps, itemResult.data.cartId) };
    },

    async moveToCart(input: unknown): Promise<CommerceResult<CartSummary>> {
      const parsed = cartItemActionSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Cart item input is invalid.", 400);
      const itemResult = await authorizeItem(deps, parsed.data, parsed.data.itemId);
      if (!itemResult.ok) return itemResult;
      await deps.items.updateItem({ itemId: parsed.data.itemId, values: { status: "active" } });
      return { ok: true, data: await summarize(deps, itemResult.data.cartId) };
    },

    async mergeGuestCart(input: unknown): Promise<CommerceResult<CartSummary>> {
      const parsed = mergeCartSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Cart merge input is invalid.", 400);
      const guestCart = await deps.carts.findActiveByGuestToken(parsed.data.guestToken);
      const userCart = await deps.carts.findActiveByUser(parsed.data.userId);
      if (!guestCart) return { ok: true, data: await getOrCreateCart(deps, { userId: parsed.data.userId }) };
      if (!userCart) {
        const claimed = await deps.carts.updateCart({ cartId: guestCart.id, values: { userId: parsed.data.userId, guestToken: null } });
        return { ok: true, data: await summarize(deps, claimed.id) };
      }
      await deps.items.moveItems({ fromCartId: guestCart.id, toCartId: userCart.id });
      await deps.carts.updateCart({ cartId: guestCart.id, values: { status: "converted" } });
      return { ok: true, data: await summarize(deps, userCart.id) };
    }
  };
}
