import {
  AnalyticsDateWindow,
  AnalyticsResult,
  failure,
  formatAnalyticsDate,
  getMarketplaceDateWindow,
  marketplaceAnalyticsRequestSchema,
  MarketplaceAnalyticsAuditWriter,
  MarketplaceAnalyticsPermissionChecker,
  MarketplaceAnalyticsRequest,
  success,
} from "../analytics/marketplace/types.js";
import { BusinessIntelligence, BusinessIntelligenceRepository } from "./types.js";

export interface BiDependencies {
  repository: BusinessIntelligenceRepository;
  permissionChecker: MarketplaceAnalyticsPermissionChecker;
  auditWriter?: MarketplaceAnalyticsAuditWriter;
  now?: () => Date;
}

export function createBusinessIntelligenceService(deps: BiDependencies) {
  const { repository, permissionChecker, auditWriter, now } = deps;

  async function authorize(userId: string): Promise<AnalyticsResult<void>> {
    const allowed = await permissionChecker.canViewMarketplaceAnalytics(userId);
    if (!allowed) {
      return failure("FORBIDDEN", "Business intelligence is available only to super admin and admin users.", 403);
    }
    return success(undefined);
  }

  async function parseAndAuthorize(userId: string, params: unknown) {
    const parsed = marketplaceAnalyticsRequestSchema.safeParse(params);
    if (!parsed.success) {
      return { ok: false as const, result: failure("INVALID_INPUT", "Invalid business intelligence request.", 400) };
    }
    const auth = await authorize(userId);
    if (!auth.ok) return { ok: false as const, result: auth };
    try {
      return { ok: true as const, window: getMarketplaceDateWindow(parsed.data, now?.() ?? new Date()) };
    } catch (error) {
      return {
        ok: false as const,
        result: failure("INVALID_DATE_RANGE", error instanceof Error ? error.message : "Invalid date range.", 400),
      };
    }
  }

  return {
    async getBusinessIntelligence(userId: string, params: unknown): Promise<AnalyticsResult<BusinessIntelligence>> {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const data = await repository.getBusinessIntelligence(request.window);
      await auditWriter?.writeAnalyticsAccess({ userId, section: "dashboard", dateWindow: request.window });
      return success(data);
    },
  };
}

export type BusinessIntelligenceService = ReturnType<typeof createBusinessIntelligenceService>;
