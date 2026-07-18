import { StatusIcon } from "@/components/icons/StatusIcon";
import { Tag } from "@/components/ui/Tag";
import type { Status } from "@/lib/status";
import { worstStatus } from "@/lib/status";
import type { Database } from "@/lib/database.types";

type Finding = Database["public"]["Tables"]["findings"]["Row"];

export function FindingsReport({ findings }: { findings: Finding[] }) {
  const groups = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!groups.has(f.component)) groups.set(f.component, []);
    groups.get(f.component)!.push(f);
  }

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([component, items]) => (
        <div key={component}>
          <div className="flex items-center justify-between border-b-2 border-ink pb-2">
            <h3 className="font-display text-[17px] font-semibold text-ink">{component}</h3>
            <Tag status={worstStatus(items.map((i) => i.status as Status))} size="sm" />
          </div>
          <div className="mt-3 divide-y divide-ink/15 border border-ink">
            {items.map((f) => (
              <details key={f.id} className="group p-4 open:bg-cream/60">
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <StatusIcon status={f.status as Status} size={18} />
                  <span className="flex-1 font-body text-[13.5px] text-ink">{f.attribute}</span>
                  {f.judgment && (
                    <span className="border border-dashed border-pink-deep px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-pink-deep uppercase">
                      AI judgment
                    </span>
                  )}
                  {f.value && <span className="font-mono text-[11px] text-ink-soft">{f.value}</span>}
                  <span className="font-mono text-[10px] text-ink-soft transition-transform group-open:rotate-90">
                    ▸
                  </span>
                </summary>
                <div className="mt-3 pl-[30px] text-[12.5px] leading-relaxed text-ink-soft">
                  {f.judgment && (
                    <p className="mb-2 font-mono text-[10px] text-ink-soft italic">
                      Claude&rsquo;s read of this material — a judgment call, not a measured fact.
                    </p>
                  )}
                  {f.detail && <p>{f.detail}</p>}
                  {f.fix && (
                    <p className="mt-2 border-l-2 border-teal-deep pl-3 text-ink">
                      <span className="font-mono text-[10px] text-teal-deep uppercase">Fix — </span>
                      {f.fix}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
