export type AdminComparisonCardProps = {
  title: string;
  currentLabel: string;
  currentValue: string | number;
  previousLabel: string;
  previousValue: string | number;
  growthRate: number;
};

export function AdminComparisonCard({
  title,
  currentLabel,
  currentValue,
  previousLabel,
  previousValue,
  growthRate,
}: AdminComparisonCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{currentLabel}</p>
          <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{currentValue}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{previousLabel}</p>
          <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{previousValue}</p>
        </div>
      </div>
      <p className={growthRate >= 0 ? "mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400" : "mt-4 text-sm font-semibold text-rose-700 dark:text-rose-400"}>
        {growthRate > 0 ? "+" : ""}
        {growthRate}% period over period
      </p>
    </section>
  );
}
