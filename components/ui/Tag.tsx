import type { Status } from "@/lib/status";
import { STATUS_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";

// Same `.atlas`-scoped / fallback pattern as StatusIcon — outside `.atlas`
// this renders the original four-hue status system unchanged.
const STATUS_COLOR: Record<Status, string> = {
  PASS: "var(--atlas-status-pass, #396460)",
  FLAGGED: "var(--atlas-status-flagged, #B8842B)",
  FAILING: "var(--atlas-status-failing, #BD5A3F)",
  INFO: "var(--atlas-status-info, #C97A70)",
};

/**
 * The four-state status system. No custom colors invented per feature —
 * every finding resolves to one of PASS / FLAGGED / FAILING / INFO.
 */
export function Tag({
  status,
  label,
  size = "md",
  className,
}: {
  status: Status;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const color = STATUS_COLOR[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border-1.5 font-mono uppercase tracking-wide",
        size === "md" ? "px-4 py-2 text-[11px] border-2" : "px-2 py-1 text-[9.5px]",
        className,
      )}
      style={{
        color: size === "sm" ? color : "var(--atlas-ink, #171717)",
        borderColor: size === "sm" ? color : "var(--atlas-line-strong, #171717)",
        background: size === "md" ? "var(--atlas-bg, #ffffff)" : undefined,
      }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full border"
        style={{ background: color, borderColor: "var(--atlas-ink, #171717)" }}
      />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}
