import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  keyFor,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  keyFor: (row: T, i: number) => string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto border-2 border-ink", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="border-b border-ink bg-cream-2 px-4 py-3 font-mono text-[9.5px] tracking-wide text-ink uppercase"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={keyFor(row, i)} className={i % 2 === 0 ? "bg-cream" : "bg-paper"}>
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={cn("border-b border-ink/40 px-4 py-3 text-[12px] text-ink-soft last:border-b-0", col.className)}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
