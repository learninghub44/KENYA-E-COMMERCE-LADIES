import type { InventoryRecord, InventoryRepository, InventoryStatus, ProductRepository, ProductResult } from "./types";
import { inventoryInputSchema } from "./schemas";

export type InventoryServiceDependencies = {
  products: ProductRepository;
  inventory: InventoryRepository;
};

function failure(code: string, message: string, status: number): ProductResult<never> {
  return { ok: false, code, message, status };
}

/** Derives buyer-facing stock status. Warehouse-level tracking is explicitly out of scope. */
export function inventoryStatusFor(record: Pick<InventoryRecord, "trackInventory" | "quantityAvailable" | "quantityReserved" | "lowStockThreshold">): InventoryStatus {
  if (!record.trackInventory) return "not_tracked";
  const sellable = record.quantityAvailable - record.quantityReserved;
  if (sellable <= 0) return "out_of_stock";
  if (sellable <= record.lowStockThreshold) return "low_stock";
  return "in_stock";
}

export function createInventoryService(deps: InventoryServiceDependencies) {
  return {
    async get(productId: string, variantId?: string | null): Promise<ProductResult<{ record: InventoryRecord; status: InventoryStatus } | null>> {
      const product = await deps.products.findById(productId);
      if (!product) return failure("NOT_FOUND", "Product not found.", 404);

      const record = await deps.inventory.findForProduct(productId, variantId ?? null);
      if (!record) return { ok: true, data: null };
      return { ok: true, data: { record, status: inventoryStatusFor(record) } };
    },

    async set(productId: string, actorSellerId: string, input: unknown): Promise<ProductResult<{ record: InventoryRecord; status: InventoryStatus }>> {
      const product = await deps.products.findById(productId);
      if (!product) return failure("NOT_FOUND", "Product not found.", 404);
      if (product.sellerId !== actorSellerId) return failure("FORBIDDEN", "You do not own this product.", 403);

      const parsed = inventoryInputSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Inventory input is invalid.", 400);

      const record = await deps.inventory.upsert({ ...parsed.data, productId });
      return { ok: true, data: { record, status: inventoryStatusFor(record) } };
    }
  };
}
