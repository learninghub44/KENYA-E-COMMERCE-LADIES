import { assertPermission } from "../permissions/index.js";
import type { AdminActor } from "../audit/types.js";
import type { CreateReportInput, ReportAuditWriter, ReportRepository, ReportResult, ReportSearchFilters, ReportRecord } from "./types.js";

export type ReportServiceDependencies = {
  reports: ReportRepository;
  audit: ReportAuditWriter;
};

function failure(code: string, message: string, status: number): ReportResult<never> {
  return { ok: false, code, message, status };
}

function canModerate(actor: AdminActor): boolean {
  try {
    assertPermission(actor.roles, "admin.moderate");
    return true;
  } catch {
    return false;
  }
}

export function createReportService(deps: ReportServiceDependencies) {
  return {
    async create(input: CreateReportInput): Promise<ReportResult<ReportRecord>> {
      const report = await deps.reports.create(input);
      return { ok: true, data: report };
    },

    async search(actor: AdminActor, filters: ReportSearchFilters): Promise<ReportResult<Awaited<ReturnType<ReportRepository["search"]>>>> {
      if (!canModerate(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot search reports.", 403);
      return { ok: true, data: await deps.reports.search({ ...filters, limit: Math.min(filters.limit ?? 50, 100) }) };
    },

    async assign(actor: AdminActor, reportId: string, moderatorId: string): Promise<ReportResult<ReportRecord>> {
      if (!canModerate(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot assign reports.", 403);
      const existing = await deps.reports.findById(reportId);
      if (!existing) return failure("REPORT_NOT_FOUND", "Report was not found.", 404);
      const updated = await deps.reports.update({ reportId, values: { assignedTo: moderatorId, status: "assigned" } });
      await deps.audit.writeAdminAudit({
        actor,
        action: "report.assigned",
        entityType: "report",
        entityId: reportId,
        oldValues: { assignedTo: existing.assignedTo, status: existing.status },
        newValues: { assignedTo: moderatorId, status: "assigned" }
      });
      return { ok: true, data: updated };
    },

    async addNote(actor: AdminActor, reportId: string, note: string): Promise<ReportResult<ReportRecord>> {
      if (!canModerate(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot add report notes.", 403);
      const existing = await deps.reports.findById(reportId);
      if (!existing) return failure("REPORT_NOT_FOUND", "Report was not found.", 404);
      const updated = await deps.reports.update({ reportId, values: { internalNote: note, status: existing.status === "open" ? "in_review" : existing.status } });
      await deps.audit.writeAdminAudit({ actor, action: "report.note_added", entityType: "report", entityId: reportId, newValues: { note } });
      return { ok: true, data: updated };
    },

    async resolve(actor: AdminActor, reportId: string, resolution: string): Promise<ReportResult<ReportRecord>> {
      if (!canModerate(actor)) return failure("AUTHORIZATION_DENIED", "Actor cannot resolve reports.", 403);
      const existing = await deps.reports.findById(reportId);
      if (!existing) return failure("REPORT_NOT_FOUND", "Report was not found.", 404);
      const updated = await deps.reports.update({
        reportId,
        values: { status: "resolved", resolution, resolvedAt: new Date().toISOString() }
      });
      await deps.audit.writeAdminAudit({
        actor,
        action: "report.resolved",
        entityType: "report",
        entityId: reportId,
        oldValues: { status: existing.status },
        newValues: { status: "resolved", resolution }
      });
      return { ok: true, data: updated };
    }
  };
}
