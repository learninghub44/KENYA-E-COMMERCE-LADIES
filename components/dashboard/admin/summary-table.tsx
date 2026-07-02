export type AdminSummaryColumn<T> = {
  key: keyof T;
  label: string;
  align?: "left" | "right";
  format?: (value: T[keyof T], row: T) => string;
};

export type AdminSummaryTableProps<T> = {
  title: string;
  columns: AdminSummaryColumn<T>[];
  rows: T[];
};

export function AdminSummaryTable<T extends Record<string, unknown>>({ title, columns, rows }: AdminSummaryTableProps<T>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {columns.map((column) => (
                <th key={String(column.key)} className={column.align === "right" ? "py-2 text-right" : "py-2 text-left"}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)} className="border-b border-slate-100 last:border-0 dark:border-slate-900">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={column.align === "right" ? "py-3 text-right text-slate-700 dark:text-slate-200" : "py-3 text-slate-700 dark:text-slate-200"}
                  >
                    {column.format ? column.format(row[column.key], row) : String(row[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
