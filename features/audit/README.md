# Audit Feature

Centralized audit capabilities live in `lib/audit`. The audit service enforces
`security.audit.read` and `security.audit.write`, supports filtered pagination, and exposes an
export-ready filter contract for future CSV or warehouse jobs.
