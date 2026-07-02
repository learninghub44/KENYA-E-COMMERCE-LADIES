export type AdminKpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
  growthRate?: number;
};

export function AdminKpiCard({ title, value, description, growthRate }: AdminKpiCardProps) {
  const growthLabel = growthRate === undefined ? null : `${growthRate > 0 ? "+" : ""}${growthRate}%`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</h3>
        {growthLabel ? (
          <span
            className={
              growthRate >= 0
                ? "text-sm font-semibold text-emerald-700 dark:text-emerald-400"
                : "text-sm font-semibold text-rose-700 dark:text-rose-400"
            }
          >
            {growthLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
      {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
    </section>
  );
}
