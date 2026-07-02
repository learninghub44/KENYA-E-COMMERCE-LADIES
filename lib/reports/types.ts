import type { AdminActor, AdminResult, CursorPage } from "../audit/types";

export type ReportTargetType = "product" | "seller" | "buyer" | "message" | "store";
export type ReportStatus = "open" | "assigned" | "in_review" | "resolved" | "dismissed";
export type ReportReason = "counterfeit" | "prohibited_item" | "harassment" | "fraud" | "inaccurate_listing" | "other";

export type ReportRecord = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reporterId: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  assignedTo: string | null;
  resolution: string | null;
  internalNotes: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type CreateReportInput = {
  targetType: ReportTargetType;
  targetId: string;
  reporterId: string;
  reason: ReportReason;
  description?: string | undefined;
};

export type ReportSearchFilters = {
  targetType?: ReportTargetType | undefined;
  targetId?: string | undefined;
  reporterId?: string | undefined;
  assignedTo?: string | undefined;
  status?: ReportStatus | undefined;
  query?: string | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
  sort?: "created_at_desc" | "updated_at_desc" | undefined;
};

export type ReportRepository = {
  create(input: CreateReportInput): Promise<ReportRecord>;
  findById(reportId: string): Promise<ReportRecord | null>;
  search(filters: ReportSearchFilters): Promise<CursorPage<ReportRecord>>;
  update(input: {
    reportId: string;
    values: Partial<Pick<ReportRecord, "status" | "assignedTo" | "resolution" | "resolvedAt">> & {
      internalNote?: string | undefined;
    };
  }): Promise<ReportRecord>;
};

export type ReportAuditWriter = {
  writeAdminAudit(input: {
    actor: AdminActor;
    action: string;
    entityType: "report";
    entityId: string;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
  }): Promise<void>;
};

export type ReportResult<T> = AdminResult<T>;
