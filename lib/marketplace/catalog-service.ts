import type {
  BrandRecord,
  BrandRepository,
  CategoryNode,
  CategoryRecord,
  CategoryRepository,
  CollectionRecord,
  CollectionRepository,
  MarketplaceResult,
  ProductSummary,
  SearchPage
} from "./types";

export type CatalogServiceDependencies = {
  categories: CategoryRepository;
  brands: BrandRepository;
  collections: CollectionRepository;
};

function failure(code: string, message: string, status: number): MarketplaceResult<never> {
  return { ok: false, code, message, status };
}

/** Builds a parent -> children tree from the flat category table. O(n), no N+1 queries. */
export function buildCategoryTree(categories: CategoryRecord[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>(categories.map((c) => [c.id, { ...c, children: [] }]));
  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const bySortOrder = (a: CategoryNode, b: CategoryNode) => a.sortOrder - b.sortOrder;
  const sortRecursive = (nodes: CategoryNode[]) => {
    nodes.sort(bySortOrder);
    nodes.forEach((n) => sortRecursive(n.children));
  };
  sortRecursive(roots);
  return roots;
}

export function createCatalogService(deps: CatalogServiceDependencies) {
  return {
    async getCategoryTree(activeOnly = true): Promise<MarketplaceResult<CategoryNode[]>> {
      const categories = await deps.categories.list(activeOnly);
      return { ok: true, data: buildCategoryTree(categories) };
    },

    async getCategoryBySlug(slug: string): Promise<MarketplaceResult<CategoryRecord>> {
      const category = await deps.categories.findBySlug(slug);
      if (!category) return failure("NOT_FOUND", "Category not found.", 404);
      return { ok: true, data: category };
    },

    async listBrands(): Promise<MarketplaceResult<BrandRecord[]>> {
      return { ok: true, data: await deps.brands.list() };
    },

    async getBrandBySlug(slug: string): Promise<MarketplaceResult<BrandRecord>> {
      const brand = await deps.brands.findBySlug(slug);
      if (!brand) return failure("NOT_FOUND", "Brand not found.", 404);
      return { ok: true, data: brand };
    },

    async getCollectionBySlug(sellerId: string | null, slug: string): Promise<MarketplaceResult<CollectionRecord>> {
      const collection = await deps.collections.findBySlug(sellerId, slug);
      if (!collection) return failure("NOT_FOUND", "Collection not found.", 404);
      return { ok: true, data: collection };
    },

    async listFeaturedCollections(now = new Date().toISOString()): Promise<MarketplaceResult<CollectionRecord[]>> {
      return { ok: true, data: await deps.collections.listFeatured(now) };
    },

    async getCollectionProducts(
      collectionId: string,
      cursor: string | undefined,
      limit = 24
    ): Promise<MarketplaceResult<SearchPage<ProductSummary>>> {
      return { ok: true, data: await deps.collections.listProducts(collectionId, cursor, limit) };
    }
  };
}
