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
    <div
      className={cn("min-w-0 overflow-x-auto border-2", className)}
      style={{ borderColor: "var(--atlas-line-strong, #171717)" }}
    >
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-4 py-3 font-mono text-[9.5px] tracking-wide uppercase"
                style={{
                  borderBottom: "1px solid var(--atlas-line-strong, #171717)",
                  background: "var(--atlas-surface, #f0f0f0)",
                  color: "var(--atlas-ink, #171717)",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={keyFor(row, i)} style={{ background: i % 2 === 0 ? "var(--atlas-surface, #fafafa)" : "var(--atlas-bg, #ffffff)" }}>
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={cn("px-4 py-3 text-[12px] last:border-b-0", col.className)}
                  style={{ borderBottom: "1px solid var(--atlas-line, rgba(23,23,23,0.4))", color: "var(--atlas-ink-soft, #555555)" }}
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
