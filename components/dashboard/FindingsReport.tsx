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
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: "2px solid var(--atlas-ink)" }}>
            <h3 className="text-[16px]" style={{ fontWeight: 560 }}>
              {component}
            </h3>
            <Tag status={worstStatus(items.map((i) => i.status as Status))} size="sm" />
          </div>
          <div style={{ border: "1px solid var(--atlas-line-strong)" }}>
            {items.map((f, i) => (
              <details
                key={f.id}
                className="group p-4"
                style={{ borderTop: i === 0 ? undefined : "1px solid var(--atlas-line)" }}
              >
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <StatusIcon status={f.status as Status} size={18} />
                  <span className="flex-1 text-[13.5px]">{f.attribute}</span>
                  {f.judgment && (
                    <span
                      className="atlas-annot px-1.5 py-0.5"
                      style={{ border: "1px dashed var(--atlas-status-info, #C97A70)", color: "var(--atlas-status-info, #C97A70)" }}
                    >
                      AI judgment
                    </span>
                  )}
                  {f.value && <span className="atlas-annot">{f.value}</span>}
                  <span className="atlas-annot transition-transform group-open:rotate-90">▸</span>
                </summary>
                <div className="mt-3 pl-[30px] text-[12.5px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                  {f.judgment && (
                    <p className="atlas-annot mb-2 italic">
                      Claude&rsquo;s read of this material — a judgment call, not a measured fact.
                    </p>
                  )}
                  {f.detail && <p>{f.detail}</p>}
                  {f.fix && (
                    <p className="mt-2 pl-3" style={{ borderLeft: "2px solid var(--atlas-status-pass, #396460)", color: "var(--atlas-ink)" }}>
                      <span className="atlas-annot" style={{ color: "var(--atlas-status-pass, #396460)" }}>
                        Fix —{" "}
                      </span>
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
