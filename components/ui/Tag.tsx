import type { Status } from "@/lib/status";
import { STATUS_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";

const DOT: Record<Status, string> = {
  PASS: "bg-teal-deep",
  FLAGGED: "bg-mustard-deep",
  FAILING: "bg-brick",
  INFO: "bg-pink-deep",
};

const TEXT: Record<Status, string> = {
  PASS: "text-teal-deep border-teal-deep",
  FLAGGED: "text-mustard-deep border-mustard-deep",
  FAILING: "text-brick border-brick",
  INFO: "text-pink-deep border-pink-deep",
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border-1.5 font-mono uppercase tracking-wide",
        size === "md" ? "texture px-4 py-2 text-[11px] bg-paper border-2 shadow-depth-xs" : "px-2 py-1 text-[9.5px]",
        size === "sm" && TEXT[status],
        size === "md" && "border-ink text-ink",
        className,
      )}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full border border-ink", DOT[status])} />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}
