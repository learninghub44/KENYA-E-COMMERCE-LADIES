import { autocompleteSchema, saveSearchSchema, searchFiltersSchema } from "./schemas";
import { compareProducts, matchesFilters, relevanceScore } from "./ranking";
import type {
  AutocompleteSuggestion,
  ProductSearchRepository,
  SavedSearchRepository,
  SearchHistoryRepository,
  SearchProduct,
  SearchResult
} from "./types";

function failure(code: string, message: string, status: number): SearchResult<never> {
  return { ok: false, code, message, status };
}

export function createInMemoryProductSearchRepository(products: readonly SearchProduct[]): ProductSearchRepository {
  return {
    async search(filters) {
      const sort = filters.sort ?? "relevance";
      const limit = filters.limit ?? 24;
      const start = filters.cursor ? Number.parseInt(filters.cursor, 10) : 0;
      const matched = products
        .filter((product) => matchesFilters(product, filters))
        .filter((product) => !filters.q || relevanceScore(product, filters.q) > 0)
        .sort(compareProducts(sort, filters.q));
      const items = matched.slice(start, start + limit);
      const next = start + limit < matched.length ? String(start + limit) : null;
      return { items, nextCursor: next, totalApprox: matched.length, appliedFilters: { ...filters, sort, limit } };
    },
    async autocomplete(input) {
      const q = input.q.toLowerCase();
      const suggestions = new Map<string, AutocompleteSuggestion>();
      for (const product of products) {
        const candidates: AutocompleteSuggestion[] = [
          { type: "product", label: product.name, value: product.id, score: relevanceScore(product, input.q) },
          ...(product.categoryName ? [{ type: "category" as const, label: product.categoryName, value: product.categoryId ?? product.categoryName, score: 4 }] : []),
          ...(product.brandName ? [{ type: "brand" as const, label: product.brandName, value: product.brandId ?? product.brandName, score: 4 }] : []),
          { type: "seller", label: product.sellerStoreName, value: product.sellerId, score: 3 }
        ];
        for (const suggestion of candidates) {
          if (suggestion.label.toLowerCase().includes(q) || suggestion.score > 0) suggestions.set(`${suggestion.type}:${suggestion.value}`, suggestion);
        }
      }
      return [...suggestions.values()].sort((a, b) => b.score - a.score || a.label.localeCompare(b.label)).slice(0, input.limit);
    }
  };
}

export function createSearchService(deps: { products: ProductSearchRepository; history?: SearchHistoryRepository | undefined }) {
  return {
    async search(input: unknown): Promise<SearchResult<Awaited<ReturnType<ProductSearchRepository["search"]>>>> {
      const parsed = searchFiltersSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Search filters are invalid.", 400);
      const data = await deps.products.search(parsed.data);
      return { ok: true, data };
    },
    async autocomplete(input: unknown): Promise<SearchResult<AutocompleteSuggestion[]>> {
      const parsed = autocompleteSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Autocomplete input is invalid.", 400);
      const recent = parsed.data.userId && deps.history ? await deps.history.recentQueries(parsed.data.userId, 3) : [];
      const suggestions = await deps.products.autocomplete(parsed.data);
      return { ok: true, data: [...recent, ...suggestions].slice(0, parsed.data.limit) };
    },
    async recordHistory(userId: string, query: string, filters: unknown, resultCount: number) {
      if (!deps.history) return failure("HISTORY_UNAVAILABLE", "Search history is not configured.", 501);
      const parsed = searchFiltersSchema.safeParse(filters);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Search filters are invalid.", 400);
      return { ok: true as const, data: await deps.history.record({ userId, query, filters: parsed.data, resultCount }) };
    }
  };
}

export function createSearchHistoryService(deps: { history: SearchHistoryRepository }) {
  return {
    list(userId: string, cursor?: string, limit = 20) {
      return deps.history.list(userId, cursor, Math.min(limit, 100));
    },
    delete(userId: string, entryId: string) {
      return deps.history.delete({ userId, entryId });
    },
    clear(userId: string) {
      return deps.history.clear(userId);
    }
  };
}

export function createSavedSearchService(deps: { savedSearches: SavedSearchRepository; products: ProductSearchRepository }) {
  return {
    async save(input: unknown) {
      const parsed = saveSearchSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Saved search input is invalid.", 400);
      return { ok: true as const, data: await deps.savedSearches.create(parsed.data) };
    },
    list(userId: string, cursor?: string, limit = 20) {
      return deps.savedSearches.list(userId, cursor, Math.min(limit, 100));
    },
    async rename(userId: string, savedSearchId: string, name: string) {
      const updated = await deps.savedSearches.rename({ userId, savedSearchId, name });
      return updated ? { ok: true as const, data: updated } : failure("NOT_FOUND", "Saved search was not found.", 404);
    },
    async delete(userId: string, savedSearchId: string) {
      return { ok: true as const, data: { deleted: await deps.savedSearches.delete({ userId, savedSearchId }) } };
    },
    async rerun(userId: string, savedSearchId: string) {
      const saved = await deps.savedSearches.findById(savedSearchId);
      if (!saved || saved.userId !== userId) return failure("NOT_FOUND", "Saved search was not found.", 404);
      return { ok: true as const, data: await deps.products.search({ ...saved.filters, sort: saved.filters.sort ?? "relevance", limit: saved.filters.limit ?? 24 }) };
    }
  };
}
